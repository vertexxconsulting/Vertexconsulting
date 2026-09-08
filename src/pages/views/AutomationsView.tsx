import React, { useEffect, useState } from 'react';
import { supabase } from '../../services/supabaseClient';

export function AutomationsView() {
  const [rules, setRules] = useState<any[]>([]);
  const [stages, setStages] = useState<any[]>([]);
  
  const [newName, setNewName] = useState('');
  const [newTrigger, setNewTrigger] = useState('score_above');
  const [newTriggerVal, setNewTriggerVal] = useState('');
  const [newAction, setNewAction] = useState('create_task');
  const [newActionVal, setNewActionVal] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const [rulesRes, stagesRes] = await Promise.all([
      supabase.from('automation_rules').select('*').order('created_at', { ascending: false }),
      supabase.from('pipeline_stages').select('*').order('position')
    ]);
    if (rulesRes.data) setRules(rulesRes.data);
    if (stagesRes.data) setStages(stagesRes.data);
  }

  const toggleActive = async (id: string, current: boolean) => {
    await supabase.from('automation_rules').update({ active: !current }).eq('id', id);
    loadData();
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Excluir regra de automação?')) return;
    await supabase.from('automation_rules').delete().eq('id', id);
    loadData();
  };

  const handleAddRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;
    await supabase.from('automation_rules').insert({
      name: newName,
      trigger_type: newTrigger,
      trigger_value: newTriggerVal,
      action_type: newAction,
      action_value: newActionVal,
      active: true
    });
    setNewName('');
    setNewTriggerVal('');
    setNewActionVal('');
    loadData();
  };

  const renderTriggerValueInput = () => {
    if (newTrigger === 'stage_changed_to') {
      return (
        <select value={newTriggerVal} onChange={e => setNewTriggerVal(e.target.value)} required>
          <option value="">Selecione o estágio...</option>
          {stages.map(s => <option key={s.id} value={s.key}>{s.name}</option>)}
        </select>
      );
    }
    return <input type={newTrigger === 'no_activity_days' || newTrigger === 'score_above' ? 'number' : 'text'} value={newTriggerVal} onChange={e => setNewTriggerVal(e.target.value)} required placeholder="Ex: 70" />;
  };

  const renderActionValueInput = () => {
    if (newAction === 'change_stage') {
      return (
        <select value={newActionVal} onChange={e => setNewActionVal(e.target.value)} required>
          <option value="">Selecione o estágio...</option>
          {stages.map(s => <option key={s.id} value={s.key}>{s.name}</option>)}
        </select>
      );
    }
    if (newAction === 'send_webhook') {
      return <input type="url" value={newActionVal} onChange={e => setNewActionVal(e.target.value)} required placeholder="https://..." />;
    }
    return <input type="text" value={newActionVal} onChange={e => setNewActionVal(e.target.value)} required placeholder="Valor da ação..." />;
  };

  return (
    <>
      <div className="view-header">
        <h1>Automações</h1>
      </div>
      <div className="view-body" style={{ display: 'flex', gap: '32px', alignItems: 'flex-start' }}>
        
        <div style={{ flex: 2, background: 'var(--card)', border: '1px solid var(--card-border)', borderRadius: 'var(--radius)', padding: '24px' }}>
          <h2 style={{ fontSize: '18px', marginBottom: '20px' }}>Regras Ativas</h2>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {rules.map(r => (
              <div key={r.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', borderBottom: '1px solid var(--card-border)' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '14px', color: r.active ? 'var(--cream)' : 'var(--muted)', marginBottom: '4px' }}>{r.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--muted)', display: 'flex', gap: '12px' }}>
                    <span><strong>Se:</strong> {r.trigger_type} ({r.trigger_value})</span>
                    <span><strong>Então:</strong> {r.action_type} ({r.action_value})</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    className={r.active ? "btn btn-ghost" : "btn btn-primary"} 
                    style={{ fontSize: '12px', padding: '6px 12px' }}
                    onClick={() => toggleActive(r.id, r.active)}
                  >
                    {r.active ? 'Desativar' : 'Ativar'}
                  </button>
                  <button className="btn btn-ghost" style={{ color: 'var(--danger)', padding: '6px 12px', fontSize: '12px' }} onClick={() => handleDelete(r.id)}>Excluir</button>
                </div>
              </div>
            ))}
            {rules.length === 0 && <p style={{ color: 'var(--muted)', fontSize: '14px' }}>Nenhuma regra configurada.</p>}
          </div>
        </div>

        <div style={{ flex: 1, background: 'var(--card)', border: '1px solid var(--card-border)', borderRadius: 'var(--radius)', padding: '24px' }}>
          <h2 style={{ fontSize: '18px', marginBottom: '20px' }}>Nova regra</h2>
          <form onSubmit={handleAddRule} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="field">
              <label>Nome da regra</label>
              <input value={newName} onChange={e => setNewName(e.target.value)} required placeholder="Ex: Lead Quente" />
            </div>
            
            <div style={{ padding: '12px', background: 'var(--ink)', borderRadius: 'var(--radius)', border: '1px solid var(--card-border)' }}>
              <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '8px', fontWeight: 600 }}>GATILHO (SE)</div>
              <div className="field">
                <select value={newTrigger} onChange={e => { setNewTrigger(e.target.value); setNewTriggerVal(''); }}>
                  <option value="score_above">Score maior que</option>
                  <option value="stage_changed_to">Estágio alterado para</option>
                  <option value="no_activity_days">Dias sem atividade</option>
                </select>
              </div>
              <div className="field" style={{ marginTop: '8px' }}>
                <label>Valor do gatilho</label>
                {renderTriggerValueInput()}
              </div>
            </div>

            <div style={{ padding: '12px', background: 'var(--ink)', borderRadius: 'var(--radius)', border: '1px solid var(--card-border)' }}>
              <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '8px', fontWeight: 600 }}>AÇÃO (ENTÃO)</div>
              <div className="field">
                <select value={newAction} onChange={e => { setNewAction(e.target.value); setNewActionVal(''); }}>
                  <option value="create_task">Criar tarefa</option>
                  <option value="add_tag">Adicionar tag</option>
                  <option value="change_stage">Mudar de estágio</option>
                  <option value="send_webhook">Enviar Webhook</option>
                </select>
              </div>
              <div className="field" style={{ marginTop: '8px' }}>
                <label>Valor da ação</label>
                {renderActionValueInput()}
              </div>
            </div>

            <button className="btn btn-primary" type="submit" style={{ marginTop: '8px' }}>Criar Regra</button>
          </form>
        </div>

      </div>
    </>
  );
}
