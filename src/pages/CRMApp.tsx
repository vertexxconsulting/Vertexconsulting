import { useEffect, useRef } from 'react';
import { supabase } from '../services/supabaseClient';
import './CRMApp.css';

export default function CRMApp() {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    let stages: any[] = [];
    let leads: any[] = [];
    let products: any[] = [];
    let currentLeadId: any = null;
    let editingProductId: any = null;

    // View Tabs
    document.getElementById('tab-kanban')?.addEventListener('click', () => switchView('kanban'));
    document.getElementById('tab-dashboard')?.addEventListener('click', () => switchView('dashboard'));
    function switchView(view: string) {
      document.getElementById('board')?.classList.toggle('hidden', view !== 'kanban');
      document.getElementById('view-dashboard')?.classList.toggle('hidden', view !== 'dashboard');
      document.getElementById('tab-kanban')?.classList.toggle('active', view === 'kanban');
      document.getElementById('tab-dashboard')?.classList.toggle('active', view === 'dashboard');
      if (view === 'dashboard') renderDashboard();
    }

    // Auth
    supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        document.getElementById('login-screen')?.classList.add('hidden');
        document.getElementById('app-screen')?.classList.add('active');
        boot();
      } else {
        document.getElementById('app-screen')?.classList.remove('active');
        document.getElementById('login-screen')?.classList.remove('hidden');
      }
    });

    document.getElementById('login-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = (document.getElementById('login-email') as HTMLInputElement).value.trim();
      const password = (document.getElementById('login-pass') as HTMLInputElement).value;
      const errEl = document.getElementById('login-error');
      if (errEl) errEl.textContent = '';
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error && errEl) errEl.textContent = 'E-mail ou senha inválidos.';
    });

    document.getElementById('btn-logout')?.addEventListener('click', () => supabase.auth.signOut());

    // Modals
    document.querySelectorAll('[data-close]').forEach(btn => {
      btn.addEventListener('click', () => closeModal((btn as HTMLElement).dataset.close as string));
    });
    function openModal(id: string) { document.getElementById(id)?.classList.add('active'); }
    function closeModal(id: string) { document.getElementById(id)?.classList.remove('active'); }

    // Boot
    async function boot() {
      await loadStages();
      await Promise.all([loadLeads(), loadTaskCount(), loadProducts()]);
      renderBoard();
    }

    async function loadProducts() {
      const { data } = await supabase.from('products').select('*').eq('active', true).order('name');
      products = data || [];
      const sel = document.getElementById('ld-product-select');
      if (sel) {
        sel.innerHTML = '<option value="">Selecionar produto…</option>' +
          products.map(p => `<option value="${p.id}">${escapeHtml(p.name)} — R$ ${Number(p.price).toLocaleString('pt-BR')}</option>`).join('');
      }
    }

    async function loadStages() {
      const { data } = await supabase.from('pipeline_stages').select('*').order('position');
      stages = data || [];
      const sel = document.getElementById('stage-select');
      if (sel) {
        sel.innerHTML = stages.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
      }
    }

    async function loadLeads() {
      const { data } = await supabase.from('leads').select('*').order('created_at', { ascending: false });
      leads = data || [];
    }

    async function loadTaskCount() {
      const { count } = await supabase.from('tasks').select('id', { count: 'exact', head: true }).eq('status', 'pendente');
      const el = document.getElementById('task-count');
      if (el) el.textContent = String(count ?? 0);
    }

    function renderBoard() {
      const board = document.getElementById('board');
      if (!board) return;
      board.innerHTML = '';
      stages.forEach(stage => {
        const col = document.createElement('div');
        col.className = 'column';
        const colLeads = leads.filter(l => l.stage_id === stage.id);
        col.innerHTML = `
          <div class="column-head"><span>${stage.name}</span><span class="count">${colLeads.length}</span></div>
          <div class="column-body" id="col-${stage.id}"></div>
        `;
        board.appendChild(col);
        const body = col.querySelector('.column-body');
        if (!body) return;
        colLeads.forEach(l => {
          const card = document.createElement('div');
          card.className = 'lead-card';
          const days = Math.floor((Date.now() - new Date(l.last_activity_at).getTime()) / 86400000);
          const hot = l.score_overall !== null && l.score_overall >= 70;
          card.innerHTML = `
            <div class="lc-name">${escapeHtml(l.name)}</div>
            <div class="lc-meta">
              <span class="score-pill ${hot ? 'hot' : ''}">${l.score_overall ?? '—'}/100</span>
              <span>${days === 0 ? 'hoje' : days + 'd atrás'}</span>
            </div>
          `;
          card.addEventListener('click', () => openLead(l.id));
          body.appendChild(card);
        });
      });
    }

    function escapeHtml(s: string) {
      return (s || '').replace(/[&<>"']/g, (c: string) => (({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' } as Record<string, string>)[c] || c));
    }

    async function openLead(id: string) {
      currentLeadId = id;
      const lead = leads.find(l => l.id === id);
      if (!lead) return;

      document.getElementById('ld-name')!.textContent = lead.name;
      document.getElementById('ld-contact')!.innerHTML =
        `<a href="https://wa.me/${(lead.whatsapp || '').replace(/\D/g, '')}" target="_blank">WhatsApp</a>` +
        (lead.email ? ` · ${escapeHtml(lead.email)}` : '') +
        ` · origem: ${escapeHtml(lead.source)}`;

      const pillars = [
        ['Posicionamento', lead.score_posicionamento],
        ['Marketing', lead.score_marketing],
        ['IA', lead.score_ia],
        ['Gestão', lead.score_gestao],
        ['Vendas', lead.score_vendas],
      ];
      document.getElementById('ld-pillars')!.innerHTML = pillars.map(([label, val]) => `
        <div class="pillar-mini"><div class="pm-label">${label}</div><div class="pm-val">${val ?? '—'}</div></div>
      `).join('') + (lead.business_stage ? `<div class="pillar-mini"><div class="pm-label">Fase</div><div class="pm-val" style="font-size:14px;">${escapeHtml(lead.business_stage)}</div></div>` : '');

      (document.getElementById('ld-edit-name') as HTMLInputElement).value = lead.name || '';
      (document.getElementById('ld-edit-whats') as HTMLInputElement).value = lead.whatsapp || '';
      (document.getElementById('ld-edit-email') as HTMLInputElement).value = lead.email || '';

      (document.getElementById('stage-select') as HTMLSelectElement).value = lead.stage_id;
      (document.getElementById('ld-product-select') as HTMLSelectElement).value = '';
      (document.getElementById('ld-deal-value') as HTMLInputElement).value = lead.deal_value || '';

      await loadTimeline(id);
      openModal('modal-lead');
    }

    async function loadTimeline(leadId: string) {
      const { data } = await supabase.from('activities').select('*').eq('lead_id', leadId).order('created_at', { ascending: false });
      const wrap = document.getElementById('ld-timeline');
      if (wrap) {
        wrap.innerHTML = (data || []).map(a => `
          <div class="tl-item">
            <span class="tl-date">${new Date(a.created_at).toLocaleString('pt-BR')} · ${a.type}</span>
            ${escapeHtml(a.description)}
          </div>
        `).join('') || '<div class="tl-item">Sem atividades ainda.</div>';
      }
    }

    document.getElementById('stage-select')?.addEventListener('change', async (e) => {
      if (!currentLeadId) return;
      await supabase.from('leads').update({ stage_id: (e.target as HTMLSelectElement).value }).eq('id', currentLeadId);
      await Promise.all([loadLeads(), loadTimeline(currentLeadId)]);
      renderBoard();
    });

    document.getElementById('ld-deal-value')?.addEventListener('change', async (e) => {
      if (!currentLeadId) return;
      await supabase.from('leads').update({ deal_value: (e.target as HTMLInputElement).value || null }).eq('id', currentLeadId);
      await loadLeads();
    });

    document.getElementById('btn-save-contact')?.addEventListener('click', async () => {
      if (!currentLeadId) return;
      const name = (document.getElementById('ld-edit-name') as HTMLInputElement).value.trim();
      const whats = (document.getElementById('ld-edit-whats') as HTMLInputElement).value.trim();
      const email = (document.getElementById('ld-edit-email') as HTMLInputElement).value.trim();
      if (!name || !whats) return;
      await supabase.from('leads').update({ name, whatsapp: whats, email: email || null }).eq('id', currentLeadId);
      await loadLeads();
      renderBoard();
      const lead = leads.find(l => l.id === currentLeadId);
      if (lead) {
        document.getElementById('ld-name')!.textContent = lead.name;
        document.getElementById('ld-contact')!.innerHTML =
          `<a href="https://wa.me/${(lead.whatsapp || '').replace(/\D/g, '')}" target="_blank">WhatsApp</a>` +
          (lead.email ? ` · ${escapeHtml(lead.email)}` : '') +
          ` · origem: ${escapeHtml(lead.source)}`;
      }
    });

    document.getElementById('ld-product-select')?.addEventListener('change', (e) => {
      const product = products.find(p => p.id === (e.target as HTMLSelectElement).value);
      if (product) (document.getElementById('ld-deal-value') as HTMLInputElement).value = product.price;
    });

    document.getElementById('btn-delete-lead')?.addEventListener('click', async () => {
      if (!currentLeadId) return;
      if (!confirm('Excluir este lead? Essa ação não pode ser desfeita.')) return;
      await supabase.from('leads').delete().eq('id', currentLeadId);
      closeModal('modal-lead');
      await loadLeads();
      renderBoard();
    });

    document.getElementById('note-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const input = document.getElementById('note-input') as HTMLInputElement;
      const text = input.value.trim();
      if (!text || !currentLeadId) return;
      await supabase.from('activities').insert({ lead_id: currentLeadId, type: 'nota', description: text });
      await supabase.from('leads').update({ last_activity_at: new Date().toISOString() }).eq('id', currentLeadId);
      input.value = '';
      await Promise.all([loadLeads(), loadTimeline(currentLeadId)]);
    });

    // New Lead
    document.getElementById('btn-new-lead')?.addEventListener('click', () => openModal('modal-new-lead'));
    document.getElementById('new-lead-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const novoLeadStage = stages.find(s => s.key === 'novo_lead');
      await supabase.from('leads').insert({
        name: (document.getElementById('nl-name') as HTMLInputElement).value.trim(),
        whatsapp: (document.getElementById('nl-whats') as HTMLInputElement).value.trim(),
        email: (document.getElementById('nl-email') as HTMLInputElement).value.trim() || null,
        source: (document.getElementById('nl-source') as HTMLSelectElement).value,
        stage_id: novoLeadStage ? novoLeadStage.id : undefined
      });
      (e.target as HTMLFormElement).reset();
      closeModal('modal-new-lead');
      await loadLeads();
      renderBoard();
    });

    // Tasks
    document.getElementById('btn-tasks')?.addEventListener('click', async () => {
      const { data } = await supabase.from('tasks').select('*, leads(name)').eq('status', 'pendente').order('due_date');
      const list = document.getElementById('tasks-list');
      if (list) {
        list.innerHTML = (data || []).map(t => `
          <div class="task-row" data-id="${t.id}">
            <input type="checkbox">
            <span class="t-title">${escapeHtml(t.leads?.name || '')} — ${escapeHtml(t.title)} ${t.auto_generated ? '<span class="tag-auto">auto</span>' : ''}</span>
            <span class="t-due">${new Date(t.due_date).toLocaleDateString('pt-BR')}</span>
          </div>
        `).join('') || '<div class="task-row">Nenhuma tarefa pendente.</div>';

        list.querySelectorAll('input[type="checkbox"]').forEach(cb => {
          cb.addEventListener('change', async (e) => {
            const row = (e.target as HTMLElement).closest('.task-row') as HTMLElement;
            await supabase.from('tasks').update({ status: 'concluida' }).eq('id', row.dataset.id);
            row.remove();
            loadTaskCount();
          });
        });
      }
      openModal('modal-tasks');
    });

    // Products
    document.getElementById('btn-products')?.addEventListener('click', () => {
      renderProductsList();
      openModal('modal-products');
    });

    function renderProductsList() {
      const list = document.getElementById('products-list');
      if (!list) return;
      list.innerHTML = products.map(p => `
        <div class="product-row" data-id="${p.id}">
          <span class="p-name">${escapeHtml(p.name)}</span>
          <span class="p-price">R$ ${Number(p.price).toLocaleString('pt-BR')}</span>
          <span class="p-actions">
            <button type="button" class="edit-product">editar</button>
            <button type="button" class="remove-product">remover</button>
          </span>
        </div>
      `).join('') || '<div class="product-row">Nenhum produto cadastrado ainda.</div>';

      list.querySelectorAll('.edit-product').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const id = ((e.target as HTMLElement).closest('.product-row') as HTMLElement).dataset.id;
          const p = products.find(x => x.id === id);
          if (!p) return;
          editingProductId = id;
          const form = document.getElementById('product-form') as HTMLFormElement;
          (form.elements.namedItem('p-name') as HTMLInputElement).value = p.name;
          (form.elements.namedItem('p-price') as HTMLInputElement).value = p.price;
          document.getElementById('product-form-submit')!.textContent = 'Salvar edição';
        });
      });
      list.querySelectorAll('.remove-product').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          const id = ((e.target as HTMLElement).closest('.product-row') as HTMLElement).dataset.id;
          if (!confirm('Remover este produto do catálogo?')) return;
          await supabase.from('products').update({ active: false }).eq('id', id);
          await loadProducts();
          renderProductsList();
        });
      });
    }

    document.getElementById('product-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const form = e.target as HTMLFormElement;
      const name = (form.elements.namedItem('p-name') as HTMLInputElement).value.trim();
      const price = Number((form.elements.namedItem('p-price') as HTMLInputElement).value);
      if (!name) return;

      if (editingProductId) {
        await supabase.from('products').update({ name, price }).eq('id', editingProductId);
        editingProductId = null;
        document.getElementById('product-form-submit')!.textContent = 'Adicionar';
      } else {
        await supabase.from('products').insert({ name, price });
      }
      form.reset();
      await loadProducts();
      renderProductsList();
    });

    // Dashboard
    function renderDashboard() {
      const total = leads.length;
      const ganhoStage = stages.find(s => s.key === 'fechado_ganho');
      const perdidoStage = stages.find(s => s.key === 'fechado_perdido');
      const ganhos = leads.filter(l => l.stage_id === ganhoStage?.id);
      const abertos = leads.filter(l => l.stage_id !== ganhoStage?.id && l.stage_id !== perdidoStage?.id);

      const taxaConversao = total ? Math.round((ganhos.length / total) * 100) : 0;
      const valorEmNegociacao = abertos.reduce((sum, l) => sum + (Number(l.deal_value) || 0), 0);
      const ticketMedio = ganhos.length ? ganhos.reduce((sum, l) => sum + (Number(l.deal_value) || 0), 0) / ganhos.length : 0;

      const kpiRow = document.getElementById('kpi-row');
      if (kpiRow) {
        kpiRow.innerHTML = `
          <div class="kpi-card"><div class="kpi-label">Total de leads</div><div class="kpi-val">${total}</div></div>
          <div class="kpi-card"><div class="kpi-label">Taxa de conversão</div><div class="kpi-val">${taxaConversao}%</div></div>
          <div class="kpi-card"><div class="kpi-label">Em negociação</div><div class="kpi-val">R$ ${valorEmNegociacao.toLocaleString('pt-BR')}</div></div>
          <div class="kpi-card"><div class="kpi-label">Ticket médio (ganho)</div><div class="kpi-val">R$ ${Math.round(ticketMedio).toLocaleString('pt-BR')}</div></div>
        `;
      }

      const maxCount = Math.max(1, ...stages.map(s => leads.filter(l => l.stage_id === s.id).length));
      const funnelBody = document.getElementById('funnel-body');
      if (funnelBody) {
        funnelBody.innerHTML = stages.map(s => {
          const count = leads.filter(l => l.stage_id === s.id).length;
          const pct = Math.round((count / maxCount) * 100);
          return `
            <div class="funnel-row">
              <div class="funnel-label">${s.name}</div>
              <div class="funnel-track"><div class="funnel-fill" style="width:${pct}%"></div></div>
              <div class="funnel-count">${count} · ${total ? Math.round((count / total) * 100) : 0}%</div>
            </div>
          `;
        }).join('');
      }
    }

    // Settings
    document.getElementById('btn-settings')?.addEventListener('click', async () => {
      const { data } = await supabase.from('automation_settings').select('*').eq('id', 1).single();
      if (data) {
        (document.getElementById('set-threshold') as HTMLInputElement).value = data.hot_score_threshold;
        (document.getElementById('set-stale') as HTMLInputElement).value = data.stale_days;
        (document.getElementById('set-webhook-notify') as HTMLInputElement).value = data.notify_webhook_url || '';
        (document.getElementById('set-webhook-report') as HTMLInputElement).value = data.weekly_report_webhook_url || '';
      }
      openModal('modal-settings');
    });

    document.getElementById('settings-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      await supabase.from('automation_settings').update({
        hot_score_threshold: Number((document.getElementById('set-threshold') as HTMLInputElement).value),
        stale_days: Number((document.getElementById('set-stale') as HTMLInputElement).value),
        notify_webhook_url: (document.getElementById('set-webhook-notify') as HTMLInputElement).value || null,
        weekly_report_webhook_url: (document.getElementById('set-webhook-report') as HTMLInputElement).value || null
      }).eq('id', 1);
      const saved = document.getElementById('settings-saved');
      if (saved) {
        saved.style.display = 'block';
        setTimeout(() => saved.style.display = 'none', 2000);
      }
    });

  }, []);

  return (
    <div className="crm-page">
      <div id="login-screen" className="login-page">
        <div className="login-card">
          <div className="login-logo">
            <img src="/logo.jpeg" alt="Vertex Consulting" />
            <span>VERTEX</span>
          </div>
          <p className="login-subtitle">Acesso restrito — CRM interno</p>

          <form id="login-form" className="login-form">
            <div className="login-field">
              <label htmlFor="login-email">E-mail</label>
              <input 
                id="login-email" 
                type="email" 
                required 
                autoComplete="username" 
                placeholder="seu@email.com" 
              />
            </div>
            <div className="login-field">
              <label htmlFor="login-pass">Senha</label>
              <input 
                id="login-pass" 
                type="password" 
                required 
                autoComplete="current-password" 
                placeholder="••••••••" 
              />
            </div>
            
            <p id="login-error" className="login-error" style={{ display: 'empty' }}></p>
            
            <button className="login-btn" type="submit">Entrar</button>
          </form>
          
          <a href="/" className="login-back">← Voltar ao site</a>
        </div>
      </div>

      <div id="app-screen">
        <div className="topbar">
          <div className="brand-name">VERTEX <span>CRM</span></div>
          <div className="view-tabs">
            <button className="view-tab active" id="tab-kanban">Kanban</button>
            <button className="view-tab" id="tab-dashboard">Dashboard</button>
          </div>
          <div className="topbar-spacer"></div>
          <button className="icon-btn" id="btn-new-lead">+ Novo lead</button>
          <button className="icon-btn" id="btn-products">Produtos</button>
          <button className="icon-btn" id="btn-tasks">Tarefas <span className="badge-count" id="task-count">0</span></button>
          <button className="icon-btn" id="btn-settings">Configurações</button>
          <button className="icon-btn" id="btn-logout">Sair</button>
        </div>

        <div id="board"></div>

        <div id="view-dashboard" className="hidden">
          <div className="kpi-row" id="kpi-row"></div>
          <div className="funnel-wrap">
            <h3>Funil de conversão</h3>
            <div id="funnel-body"></div>
          </div>
        </div>
      </div>

      <div className="modal-overlay" id="modal-lead">
        <div className="modal">
          <div className="modal-head">
            <div>
              <h2 id="ld-name">—</h2>
              <div className="lead-contact" id="ld-contact"></div>
            </div>
            <button className="close-x" data-close="modal-lead">×</button>
          </div>

          <div className="pillar-grid" id="ld-pillars"></div>

          <div className="section-label">Dados de contato</div>
          <div className="lead-edit-grid">
            <input id="ld-edit-name" type="text" placeholder="Nome" />
            <input id="ld-edit-whats" type="text" placeholder="WhatsApp" />
            <input id="ld-edit-email" type="email" placeholder="E-mail" />
            <button className="btn btn-primary" id="btn-save-contact">Salvar dados de contato</button>
          </div>

          <div className="section-label">Estágio</div>
          <select id="stage-select"></select>

          <div className="section-label">Produto/serviço do catálogo</div>
          <select id="ld-product-select">
            <option value="">Selecionar produto…</option>
          </select>

          <div className="section-label">Valor estimado do contrato (R$)</div>
          <input id="ld-deal-value" type="number" min="0" step="100" placeholder="0" />

          <div className="section-label">Linha do tempo</div>
          <div className="timeline" id="ld-timeline"></div>

          <form id="note-form">
            <input id="note-input" type="text" placeholder="Adicionar nota ou registrar contato…" />
            <button className="btn btn-primary" type="submit">Salvar</button>
          </form>

          <div className="danger-zone">
            <button className="btn btn-danger" id="btn-delete-lead">Excluir lead</button>
          </div>
        </div>
      </div>

      <div className="modal-overlay" id="modal-products">
        <div className="modal">
          <div className="modal-head">
            <h2>Catálogo de produtos/serviços</h2>
            <button className="close-x" data-close="modal-products">×</button>
          </div>
          <div id="products-list"></div>
          <form id="product-form">
            <input type="text" name="p-name" placeholder="Nome do produto/serviço" required />
            <input type="number" name="p-price" placeholder="Preço" min="0" step="10" required />
            <button className="btn btn-primary" type="submit" id="product-form-submit">Adicionar</button>
          </form>
        </div>
      </div>

      <div className="modal-overlay" id="modal-tasks">
        <div className="modal">
          <div className="modal-head">
            <h2>Tarefas pendentes</h2>
            <button className="close-x" data-close="modal-tasks">×</button>
          </div>
          <div id="tasks-list"></div>
        </div>
      </div>

      <div className="modal-overlay" id="modal-settings">
        <div className="modal">
          <div className="modal-head">
            <h2>Configurações de automação</h2>
            <button className="close-x" data-close="modal-settings">×</button>
          </div>
          <form id="settings-form">
            <div className="field">
              <label htmlFor="set-threshold">A partir de qual score um lead é "quente"? (0–100)</label>
              <input id="set-threshold" type="number" min="0" max="100" />
            </div>
            <div className="field">
              <label htmlFor="set-stale">Dias sem contato até virar "lead frio"</label>
              <input id="set-stale" type="number" min="1" />
            </div>
            <div className="field">
              <label htmlFor="set-webhook-notify">Webhook para notificar lead quente (Zapier/Make/WhatsApp API) — opcional</label>
              <input id="set-webhook-notify" type="url" placeholder="https://hooks.zapier.com/..." />
            </div>
            <div className="field">
              <label htmlFor="set-webhook-report">Webhook do relatório semanal — opcional</label>
              <input id="set-webhook-report" type="url" placeholder="https://hooks.zapier.com/..." />
            </div>
            <button className="btn btn-primary btn-block" type="submit">Salvar configurações</button>
            <div id="settings-saved">Salvo.</div>
          </form>
        </div>
      </div>

      <div className="modal-overlay" id="modal-new-lead">
        <div className="modal">
          <div className="modal-head">
            <h2>Novo lead manual</h2>
            <button className="close-x" data-close="modal-new-lead">×</button>
          </div>
          <form id="new-lead-form">
            <div className="field"><label>Nome</label><input id="nl-name" required /></div>
            <div className="field"><label>WhatsApp</label><input id="nl-whats" required /></div>
            <div className="field"><label>E-mail</label><input id="nl-email" type="email" /></div>
            <div className="field">
              <label>Origem</label>
              <select id="nl-source">
                <option value="indicacao">Indicação</option>
                <option value="anuncio">Anúncio</option>
                <option value="organico">Orgânico / redes sociais</option>
                <option value="outro">Outro</option>
              </select>
            </div>
            <button className="btn btn-primary btn-block" type="submit">Adicionar lead</button>
          </form>
        </div>
      </div>
    </div>
  );
}
