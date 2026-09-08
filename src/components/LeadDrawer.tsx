import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { useLeadDrawer } from '../context/LeadDrawerContext';
import { X } from 'lucide-react';

export function LeadDrawer() {
  const { isDrawerOpen, currentLeadId, closeDrawer } = useLeadDrawer();
  const [lead, setLead] = useState<any>(null);
  const [stages, setStages] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  
  const [editName, setEditName] = useState('');
  const [editWhats, setEditWhats] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [stageId, setStageId] = useState('');
  const [dealValue, setDealValue] = useState<number | string>('');
  
  const [noteText, setNoteText] = useState('');
  
  useEffect(() => {
    async function loadInitialData() {
      const [stagesRes, productsRes] = await Promise.all([
        supabase.from('pipeline_stages').select('*').order('position'),
        supabase.from('products').select('*').eq('active', true).order('name')
      ]);
      if (stagesRes.data) setStages(stagesRes.data);
      if (productsRes.data) setProducts(productsRes.data);
    }
    loadInitialData();
  }, []);

  useEffect(() => {
    if (isDrawerOpen && currentLeadId) {
      loadLead();
      loadTimeline();
    }
  }, [isDrawerOpen, currentLeadId]);

  async function loadLead() {
    const { data } = await supabase.from('leads').select('*').eq('id', currentLeadId).single();
    if (data) {
      setLead(data);
      setEditName(data.name || '');
      setEditWhats(data.whatsapp || '');
      setEditEmail(data.email || '');
      setStageId(data.stage_id || '');
      setDealValue(data.deal_value || '');
    }
  }

  async function loadTimeline() {
    const { data } = await supabase.from('activities').select('*').eq('lead_id', currentLeadId).order('created_at', { ascending: false });
    if (data) {
      setActivities(data);
    }
  }

  const handleSaveContact = async () => {
    if (!currentLeadId || !editName || !editWhats) return;
    await supabase.from('leads').update({ 
      name: editName, 
      whatsapp: editWhats, 
      email: editEmail || null 
    }).eq('id', currentLeadId);
    loadLead();
  };

  const handleChangeStage = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStage = e.target.value;
    setStageId(newStage);
    if (!currentLeadId) return;
    await supabase.from('leads').update({ stage_id: newStage }).eq('id', currentLeadId);
    loadLead();
  };

  const handleProductSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const p = products.find(x => x.id === e.target.value);
    if (p) {
      setDealValue(p.price);
      handleSaveDeal(p.price);
    }
  };

  const handleSaveDeal = async (value: string | number) => {
    if (!currentLeadId) return;
    await supabase.from('leads').update({ deal_value: value || null }).eq('id', currentLeadId);
    loadLead();
  };

  const handleDeleteLead = async () => {
    if (!currentLeadId) return;
    if (!window.confirm('Excluir este lead? Essa ação não pode ser desfeita.')) return;
    await supabase.from('leads').delete().eq('id', currentLeadId);
    closeDrawer();
    // Todo: trigger board refresh (maybe through a global event or context, but for now just close)
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim() || !currentLeadId) return;
    await supabase.from('activities').insert({ lead_id: currentLeadId, type: 'nota', description: noteText.trim() });
    await supabase.from('leads').update({ last_activity_at: new Date().toISOString() }).eq('id', currentLeadId);
    setNoteText('');
    loadTimeline();
  };

  const formatDays = (dateStr: string) => {
    if (!dateStr) return '—';
    const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
    return days === 0 ? 'hoje' : `${days}d atrás`;
  };

  return (
    <>
      <div 
        className={`drawer-overlay ${isDrawerOpen ? 'active' : ''}`} 
        onClick={closeDrawer}
      />
      <div className={`lead-drawer ${isDrawerOpen ? 'open' : ''}`}>
        {lead ? (
          <>
            <div className="drawer-head">
              <div>
                <h2>{lead.name}</h2>
                <div className="lead-contact">
                  <a href={`https://wa.me/${(lead.whatsapp || '').replace(/\D/g, '')}`} target="_blank" rel="noreferrer">WhatsApp</a>
                  {lead.email ? ` · ${lead.email}` : ''}
                  <br />origem: {lead.source || '—'}
                </div>
              </div>
              <button className="close-x" onClick={closeDrawer}><X size={24} /></button>
            </div>

            <div className="drawer-body">
              <div className="pillar-grid">
                <div className="pillar-mini">
                  <div className="pm-label">Posicionamento</div>
                  <div className="pm-val">{lead.score_posicionamento ?? '—'}</div>
                </div>
                <div className="pillar-mini">
                  <div className="pm-label">Marketing</div>
                  <div className="pm-val">{lead.score_marketing ?? '—'}</div>
                </div>
                <div className="pillar-mini">
                  <div className="pm-label">IA</div>
                  <div className="pm-val">{lead.score_ia ?? '—'}</div>
                </div>
                <div className="pillar-mini">
                  <div className="pm-label">Gestão</div>
                  <div className="pm-val">{lead.score_gestao ?? '—'}</div>
                </div>
                <div className="pillar-mini">
                  <div className="pm-label">Vendas</div>
                  <div className="pm-val">{lead.score_vendas ?? '—'}</div>
                </div>
                {lead.business_stage && (
                  <div className="pillar-mini">
                    <div className="pm-label">Fase</div>
                    <div className="pm-val" style={{ fontSize: 14 }}>{lead.business_stage}</div>
                  </div>
                )}
              </div>

              <div className="section-label">Dados de contato</div>
              <div className="lead-edit-grid">
                <input type="text" placeholder="Nome" value={editName} onChange={e => setEditName(e.target.value)} />
                <input type="text" placeholder="WhatsApp" value={editWhats} onChange={e => setEditWhats(e.target.value)} />
                <input type="email" placeholder="E-mail" value={editEmail} onChange={e => setEditEmail(e.target.value)} />
                <button className="btn btn-primary" onClick={handleSaveContact}>Salvar dados de contato</button>
              </div>

              <div className="section-label">Estágio no Funil</div>
              <select value={stageId} onChange={handleChangeStage}>
                <option value="">Selecione...</option>
                {stages.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>

              <div className="section-label">Produto/serviço do catálogo</div>
              <select onChange={handleProductSelect} defaultValue="">
                <option value="" disabled>Selecionar produto…</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name} — R$ {Number(p.price).toLocaleString('pt-BR')}</option>
                ))}
              </select>

              <div className="section-label">Valor estimado do contrato (R$)</div>
              <input 
                type="number" 
                min="0" step="100" 
                placeholder="0" 
                value={dealValue} 
                onChange={e => setDealValue(e.target.value)}
                onBlur={() => handleSaveDeal(dealValue)}
              />

              <div className="section-label">Linha do tempo</div>
              <div className="timeline">
                {activities.length > 0 ? (
                  activities.map(a => (
                    <div className="tl-item" key={a.id}>
                      <span className="tl-date">{new Date(a.created_at).toLocaleString('pt-BR')} · {a.type}</span>
                      {a.description}
                    </div>
                  ))
                ) : (
                  <div className="tl-item">Sem atividades ainda.</div>
                )}
              </div>

              <form id="note-form" onSubmit={handleAddNote}>
                <input 
                  type="text" 
                  placeholder="Adicionar nota ou registrar contato…" 
                  value={noteText}
                  onChange={e => setNoteText(e.target.value)}
                />
                <button className="btn btn-primary" type="submit">Salvar</button>
              </form>

              <div className="danger-zone">
                <button className="btn btn-danger" onClick={handleDeleteLead}>Excluir lead</button>
              </div>
            </div>
          </>
        ) : (
          <div style={{ padding: 24 }}>Carregando...</div>
        )}
      </div>
    </>
  );
}
