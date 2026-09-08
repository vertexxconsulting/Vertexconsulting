import React, { useEffect, useState } from 'react';
import { supabase } from '../../services/supabaseClient';
import { useLeadDrawer } from '../../context/LeadDrawerContext';

export function PipelineView() {
  const [stages, setStages] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const { openDrawer } = useLeadDrawer();

  useEffect(() => {
    loadStages();
    loadLeads();
  }, []);

  async function loadStages() {
    const { data } = await supabase.from('pipeline_stages').select('*').order('position');
    if (data) setStages(data);
  }

  async function loadLeads() {
    const { data } = await supabase.from('leads').select('*').order('created_at', { ascending: false });
    if (data) setLeads(data);
  }

  const handleNewLead = () => {
    // We could open a quick creation modal here
    // For now, let's keep it simple or implement a small quick-add logic later
    alert('Nova funcionalidade de Novo Lead deve ser implementada no modal correspondente');
  };

  return (
    <>
      <div className="view-header">
        <h1>Pipeline</h1>
        <button className="btn btn-primary" onClick={handleNewLead}>+ Novo lead</button>
      </div>
      <div className="view-body" style={{ padding: 0, overflow: 'hidden', display: 'flex' }}>
        <div id="board" style={{ height: '100%' }}>
          {stages.map(stage => {
            const colLeads = leads.filter(l => l.stage_id === stage.id);
            return (
              <div className="column" key={stage.id}>
                <div className="column-head">
                  <span>{stage.name}</span>
                  <span className="count">{colLeads.length}</span>
                </div>
                <div className="column-body">
                  {colLeads.map(l => {
                    const days = Math.floor((Date.now() - new Date(l.last_activity_at).getTime()) / 86400000);
                    const hot = l.score_overall !== null && l.score_overall >= 70;
                    return (
                      <div className="lead-card" key={l.id} onClick={() => openDrawer(l.id)}>
                        <div className="lc-name">{l.name}</div>
                        <div className="lc-meta">
                          <span className={`score-pill ${hot ? 'hot' : ''}`}>{l.score_overall ?? '—'}/100</span>
                          <span>{days === 0 ? 'hoje' : days + 'd atrás'}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
