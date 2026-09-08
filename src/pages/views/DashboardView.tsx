import { useEffect, useState } from 'react';
import { supabase } from '../../services/supabaseClient';

export function DashboardView() {
  const [leads, setLeads] = useState<any[]>([]);
  const [stages, setStages] = useState<any[]>([]);
  const [snapshots, setSnapshots] = useState<any[]>([]);
  const [goals, setGoals] = useState<any[]>([]);
  const [stageAvg, setStageAvg] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const [leadsRes, stagesRes, snapsRes, goalsRes, histRes] = await Promise.all([
      supabase.from('leads').select('*'),
      supabase.from('pipeline_stages').select('*').order('position'),
      supabase.from('report_snapshots_daily').select('*').order('date', { ascending: true }),
      supabase.from('goals').select('*'),
      supabase.from('stage_history').select('*').not('exited_at', 'is', null)
    ]);
    if (leadsRes.data) setLeads(leadsRes.data);
    if (stagesRes.data) setStages(stagesRes.data);
    if (snapsRes.data) setSnapshots(snapsRes.data);
    if (goalsRes.data) setGoals(goalsRes.data);
    
    if (histRes.data && stagesRes.data) {
      // Calcular média por estágio
      const avgs = stagesRes.data.map(st => {
        const hists = histRes.data.filter(h => h.stage_id === st.id);
        if (hists.length === 0) return { name: st.name, avgHours: 0 };
        
        const totalMs = hists.reduce((acc, h) => {
          return acc + (new Date(h.exited_at).getTime() - new Date(h.entered_at).getTime());
        }, 0);
        return { name: st.name, avgHours: totalMs / hists.length / 3600000 };
      });
      setStageAvg(avgs);
    }
  }

  // KPIs originais
  const total = leads.length;
  const ganhoStage = stages.find(s => s.key === 'fechado_ganho');
  const perdidoStage = stages.find(s => s.key === 'fechado_perdido');
  const ganhos = leads.filter(l => l.stage_id === ganhoStage?.id);
  const abertos = leads.filter(l => l.stage_id !== ganhoStage?.id && l.stage_id !== perdidoStage?.id);

  const taxaConversao = total ? Math.round((ganhos.length / total) * 100) : 0;
  const valorEmNegociacao = abertos.reduce((sum, l) => sum + (Number(l.deal_value) || 0), 0);
  const ticketMedio = ganhos.length ? ganhos.reduce((sum, l) => sum + (Number(l.deal_value) || 0), 0) / ganhos.length : 0;
  const maxCount = Math.max(1, ...stages.map(s => leads.filter(l => l.stage_id === s.id).length));

  return (
    <>
      <div className="view-header">
        <h1>Dashboard</h1>
      </div>
      <div className="view-body" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        
        {/* KPIs Principais */}
        <div className="kpi-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
          <div className="kpi-card" style={{ background: 'var(--card)', border: '1px solid var(--card-border)', borderRadius: 'var(--radius)', padding: '16px 18px' }}>
            <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '6px' }}>Total de leads</div>
            <div style={{ fontFamily: 'Fraunces', fontSize: '26px', color: 'var(--gold-bright)' }}>{total}</div>
          </div>
          <div className="kpi-card" style={{ background: 'var(--card)', border: '1px solid var(--card-border)', borderRadius: 'var(--radius)', padding: '16px 18px' }}>
            <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '6px' }}>Taxa de conversão</div>
            <div style={{ fontFamily: 'Fraunces', fontSize: '26px', color: 'var(--gold-bright)' }}>{taxaConversao}%</div>
          </div>
          <div className="kpi-card" style={{ background: 'var(--card)', border: '1px solid var(--card-border)', borderRadius: 'var(--radius)', padding: '16px 18px' }}>
            <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '6px' }}>Em negociação</div>
            <div style={{ fontFamily: 'Fraunces', fontSize: '26px', color: 'var(--gold-bright)' }}>R$ {valorEmNegociacao.toLocaleString('pt-BR')}</div>
          </div>
          <div className="kpi-card" style={{ background: 'var(--card)', border: '1px solid var(--card-border)', borderRadius: 'var(--radius)', padding: '16px 18px' }}>
            <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '6px' }}>Ticket médio (ganho)</div>
            <div style={{ fontFamily: 'Fraunces', fontSize: '26px', color: 'var(--gold-bright)' }}>R$ {Math.round(ticketMedio).toLocaleString('pt-BR')}</div>
          </div>
        </div>

        {/* Funil e Metas em 2 colunas */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div className="funnel-wrap" style={{ background: 'var(--card)', border: '1px solid var(--card-border)', borderRadius: 'var(--radius)', padding: '22px 20px' }}>
            <h3 style={{ fontSize: '16px', marginBottom: '16px' }}>Funil de conversão</h3>
            <div>
              {stages.map(s => {
                const count = leads.filter(l => l.stage_id === s.id).length;
                const pct = Math.round((count / maxCount) * 100);
                return (
                  <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '12px' }}>
                    <div style={{ width: '150px', flexShrink: 0, fontSize: '13px' }}>{s.name}</div>
                    <div style={{ flex: 1, height: '22px', background: 'var(--track)', borderRadius: '5px', position: 'relative' }}>
                      <div style={{ height: '100%', background: 'linear-gradient(90deg, var(--gold-dim), var(--gold))', borderRadius: '5px', width: `${pct}%`, transition: 'width .6s ease' }} />
                    </div>
                    <div style={{ width: '90px', textAlign: 'right', fontSize: '13px', color: 'var(--muted)', flexShrink: 0 }}>
                      {count} · {total ? Math.round((count / total) * 100) : 0}%
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Metas */}
            <div style={{ background: 'var(--card)', border: '1px solid var(--card-border)', borderRadius: 'var(--radius)', padding: '22px 20px' }}>
              <h3 style={{ fontSize: '16px', marginBottom: '16px' }}>Progresso de Metas</h3>
              {goals.length === 0 ? (
                <div style={{ fontSize: '13px', color: 'var(--muted)' }}>Nenhuma meta definida.</div>
              ) : (
                goals.map(g => {
                  const pct = Math.min(100, Math.round(((g.current_value || 0) / g.target_value) * 100));
                  return (
                    <div key={g.id} style={{ marginBottom: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                        <span>{g.team_member_id ? 'Meta Individual' : 'Meta Geral'} - {g.metric}</span>
                        <span>{g.current_value} / {g.target_value} ({pct}%)</span>
                      </div>
                      <div style={{ height: '8px', background: 'var(--track)', borderRadius: '4px' }}>
                        <div style={{ height: '100%', background: 'var(--gold)', borderRadius: '4px', width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Tempo médio */}
            <div style={{ background: 'var(--card)', border: '1px solid var(--card-border)', borderRadius: 'var(--radius)', padding: '22px 20px' }}>
              <h3 style={{ fontSize: '16px', marginBottom: '16px' }}>Tempo médio por estágio</h3>
              {stageAvg.length === 0 ? (
                <div style={{ fontSize: '13px', color: 'var(--muted)' }}>Sem histórico suficiente.</div>
              ) : (
                stageAvg.map((st, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '8px', borderBottom: '1px solid var(--card-border)', paddingBottom: '8px' }}>
                    <span>{st.name}</span>
                    <span style={{ color: 'var(--gold-bright)' }}>{Math.round(st.avgHours)} horas</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Série Histórica Simples */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--card-border)', borderRadius: 'var(--radius)', padding: '22px 20px' }}>
          <h3 style={{ fontSize: '16px', marginBottom: '16px' }}>Série Histórica (Novos Leads por dia)</h3>
          {snapshots.length === 0 ? (
            <div style={{ fontSize: '13px', color: 'var(--muted)' }}>Sem snapshots.</div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '120px', paddingTop: '20px' }}>
              {snapshots.slice(-30).map((snap, i) => {
                const height = Math.max(5, (snap.new_leads_count / 10) * 100); // Mock scale
                return (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                    <div style={{ width: '100%', background: 'var(--gold)', height: `${height}px`, borderRadius: '2px 2px 0 0', opacity: 0.8 }} title={`${snap.new_leads_count} leads em ${snap.date}`} />
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </>
  );
}
