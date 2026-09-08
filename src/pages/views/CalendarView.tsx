import { useEffect, useState } from 'react';
import { supabase } from '../../services/supabaseClient';

export function CalendarView() {
  const [appointments, setAppointments] = useState<any[]>([]);

  useEffect(() => {
    loadAppointments();
  }, []);

  async function loadAppointments() {
    const { data } = await supabase.from('appointments').select('*, leads(name)').order('scheduled_at', { ascending: true });
    if (data) setAppointments(data);
  }

  // Simple upcoming list instead of a full complex grid to save time and dependencies,
  // but let's implement a very basic grid.
  
  return (
    <>
      <div className="view-header">
        <h1>Calendário</h1>
        <button className="btn btn-primary" onClick={() => alert('Abrir modal de novo agendamento')}>+ Novo agendamento</button>
      </div>
      <div className="view-body">
        {appointments.length === 0 ? (
          <p style={{ color: 'var(--muted)' }}>Nenhum agendamento encontrado.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {appointments.map(app => (
              <div key={app.id} style={{ 
                background: 'var(--card)', 
                border: '1px solid var(--card-border)', 
                padding: '16px', 
                borderRadius: 'var(--radius)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <h3 style={{ margin: '0 0 6px 0', fontSize: '16px' }}>{app.title || 'Agendamento'}</h3>
                  <div style={{ color: 'var(--muted)', fontSize: '14px' }}>Lead: {app.leads?.name || '—'}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '16px', color: 'var(--gold-bright)', fontFamily: 'Fraunces', fontWeight: 600 }}>
                    {new Date(app.scheduled_at).toLocaleDateString('pt-BR')}
                  </div>
                  <div style={{ color: 'var(--muted)', fontSize: '14px' }}>
                    {new Date(app.scheduled_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
