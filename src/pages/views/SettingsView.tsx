import React, { useEffect, useState } from 'react';
import { supabase } from '../../services/supabaseClient';

export function SettingsView() {
  const [threshold, setThreshold] = useState('');
  const [staleDays, setStaleDays] = useState('');
  const [webhookNotify, setWebhookNotify] = useState('');
  const [webhookReport, setWebhookReport] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    const { data } = await supabase.from('automation_settings').select('*').eq('id', 1).single();
    if (data) {
      setThreshold(data.hot_score_threshold || '');
      setStaleDays(data.stale_days || '');
      setWebhookNotify(data.notify_webhook_url || '');
      setWebhookReport(data.weekly_report_webhook_url || '');
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await supabase.from('automation_settings').update({
      hot_score_threshold: Number(threshold),
      stale_days: Number(staleDays),
      notify_webhook_url: webhookNotify || null,
      weekly_report_webhook_url: webhookReport || null
    }).eq('id', 1);
    
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <>
      <div className="view-header">
        <h1>Configurações</h1>
      </div>
      <div className="view-body">
        <div style={{ maxWidth: '600px', background: 'var(--card)', border: '1px solid var(--card-border)', borderRadius: 'var(--radius)', padding: '32px' }}>
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            <div className="field">
              <label>A partir de qual score um lead é "quente"? (0–100)</label>
              <input type="number" min="0" max="100" value={threshold} onChange={e => setThreshold(e.target.value)} required />
            </div>
            
            <div className="field">
              <label>Dias sem contato até virar "lead frio"</label>
              <input type="number" min="1" value={staleDays} onChange={e => setStaleDays(e.target.value)} required />
            </div>
            
            <div className="field">
              <label>Webhook para notificar lead quente (Zapier/Make/WhatsApp API) — opcional</label>
              <input type="url" placeholder="https://hooks.zapier.com/..." value={webhookNotify} onChange={e => setWebhookNotify(e.target.value)} />
            </div>
            
            <div className="field">
              <label>Webhook do relatório semanal — opcional</label>
              <input type="url" placeholder="https://hooks.zapier.com/..." value={webhookReport} onChange={e => setWebhookReport(e.target.value)} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '12px' }}>
              <button className="btn btn-primary" type="submit">Salvar configurações</button>
              {saved && <span style={{ color: 'var(--gold-bright)', fontSize: '14px' }}>Salvo com sucesso!</span>}
            </div>

          </form>
        </div>
      </div>
    </>
  );
}
