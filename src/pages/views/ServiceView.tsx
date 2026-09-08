import React, { useEffect, useState } from 'react';
import { supabase } from '../../services/supabaseClient';
import { Send, Clock, Inbox } from 'lucide-react';

export function ServiceView() {
  const [queues, setQueues] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [quickReplies, setQuickReplies] = useState<any[]>([]);
  
  const [activeTicket, setActiveTicket] = useState<any>(null);
  const [newMessage, setNewMessage] = useState('');
  const [filterQueue, setFilterQueue] = useState('');
  const [filterStatus, setFilterStatus] = useState('aberto');

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    loadTickets();
  }, [filterQueue, filterStatus]);

  useEffect(() => {
    if (activeTicket) {
      loadMessages(activeTicket.id);
    }
  }, [activeTicket]);

  async function loadInitialData() {
    const [qRes, qrRes] = await Promise.all([
      supabase.from('queues').select('*'),
      supabase.from('quick_replies').select('*')
    ]);
    if (qRes.data) setQueues(qRes.data);
    if (qrRes.data) setQuickReplies(qrRes.data);
  }

  async function loadTickets() {
    let query = supabase.from('tickets').select('*, leads(name)').order('updated_at', { ascending: false });
    if (filterQueue) query = query.eq('queue_id', filterQueue);
    if (filterStatus) query = query.eq('status', filterStatus);
    
    const { data } = await query;
    if (data) setTickets(data);
  }

  async function loadMessages(ticketId: string) {
    const { data } = await supabase.from('ticket_messages').select('*').eq('ticket_id', ticketId).order('created_at', { ascending: true });
    if (data) setMessages(data);
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTicket || !newMessage.trim()) return;
    
    await supabase.from('ticket_messages').insert({
      ticket_id: activeTicket.id,
      body: newMessage.trim(),
      sender_type: 'agent' // Assuming agent for now
    });
    
    setNewMessage('');
    loadMessages(activeTicket.id);
  };

  const handleTransfer = async () => {
    if (!activeTicket) return;
    const newQueue = prompt('Digite o ID da fila para transferir (Mock):');
    if (newQueue) {
      await supabase.from('tickets').update({ queue_id: newQueue }).eq('id', activeTicket.id);
      loadTickets();
      setActiveTicket(null);
    }
  };

  return (
    <div style={{ display: 'flex', height: '100%', width: '100%', overflow: 'hidden' }}>
      {/* Sidebar de Tickets */}
      <div style={{ width: '320px', borderRight: '1px solid var(--card-border)', display: 'flex', flexDirection: 'column', background: 'var(--ink-2)' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid var(--card-border)' }}>
          <h2 style={{ fontSize: '18px', marginBottom: '12px' }}>Inbox</h2>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
            <select style={{ flex: 1, padding: '8px', fontSize: '13px' }} value={filterQueue} onChange={e => setFilterQueue(e.target.value)}>
              <option value="">Todas as filas</option>
              {queues.map(q => <option key={q.id} value={q.id}>{q.name}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <select style={{ flex: 1, padding: '8px', fontSize: '13px' }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              <option value="">Todos os status</option>
              <option value="aberto">Abertos</option>
              <option value="fechado">Fechados</option>
            </select>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {tickets.length === 0 ? (
            <p style={{ padding: '20px', color: 'var(--muted)', fontSize: '13px', textAlign: 'center' }}>Nenhum ticket encontrado.</p>
          ) : (
            tickets.map(t => (
              <div 
                key={t.id} 
                onClick={() => setActiveTicket(t)}
                style={{ 
                  padding: '16px', 
                  borderBottom: '1px solid var(--card-border)',
                  cursor: 'pointer',
                  background: activeTicket?.id === t.id ? 'rgba(198, 153, 47, 0.1)' : 'transparent',
                  borderLeft: activeTicket?.id === t.id ? '3px solid var(--gold)' : '3px solid transparent'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontWeight: 600, fontSize: '14px', color: 'var(--cream)' }}>{t.leads?.name || 'Cliente'}</span>
                  <span style={{ fontSize: '12px', color: 'var(--gold-bright)' }}>VTX-{t.id.substring(0,4).toUpperCase()}</span>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--muted)' }}>
                  {t.subject || 'Sem assunto'}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Área de Conversa */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--ink)' }}>
        {activeTicket ? (
          <>
            <div style={{ padding: '20px 32px', borderBottom: '1px solid var(--card-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '18px', margin: '0 0 4px 0' }}>VTX-{activeTicket.id.substring(0,4).toUpperCase()} - {activeTicket.subject || 'Ticket'}</h3>
                <div style={{ fontSize: '13px', color: 'var(--muted)', display: 'flex', gap: '16px' }}>
                  <span>Status: <strong>{activeTicket.status}</strong></span>
                  {activeTicket.first_response_at && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={12} /> 1ª resposta em {new Date(activeTicket.first_response_at).toLocaleString('pt-BR')}
                    </span>
                  )}
                  {activeTicket.status === 'fechado' && activeTicket.closed_at && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={12} /> Fechado em {new Date(activeTicket.closed_at).toLocaleString('pt-BR')}
                    </span>
                  )}
                </div>
              </div>
              <button className="btn btn-ghost" style={{ border: '1px solid var(--card-border)' }} onClick={handleTransfer}>
                Transferir
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {messages.length === 0 ? (
                <div style={{ margin: 'auto', color: 'var(--muted)', fontSize: '14px' }}>Nenhuma mensagem nesta conversa.</div>
              ) : (
                messages.map(m => {
                  const isAgent = m.sender_type === 'agent';
                  return (
                    <div key={m.id} style={{ 
                      alignSelf: isAgent ? 'flex-end' : 'flex-start',
                      maxWidth: '70%',
                      background: isAgent ? 'var(--gold)' : 'var(--card)',
                      color: isAgent ? '#1a1508' : 'var(--cream)',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      borderBottomRightRadius: isAgent ? '4px' : '12px',
                      borderBottomLeftRadius: !isAgent ? '4px' : '12px',
                    }}>
                      <div style={{ fontSize: '14px', lineHeight: '1.4' }}>{m.body}</div>
                      <div style={{ fontSize: '11px', opacity: 0.7, textAlign: 'right', marginTop: '6px' }}>
                        {new Date(m.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div style={{ padding: '20px 32px', borderTop: '1px solid var(--card-border)', background: 'var(--ink-2)' }}>
              <div style={{ marginBottom: '12px' }}>
                <select 
                  style={{ padding: '8px 12px', fontSize: '13px', borderRadius: 'var(--radius)', border: '1px solid var(--card-border)', background: 'var(--ink)', color: 'var(--cream)' }}
                  onChange={(e) => {
                    const reply = quickReplies.find(qr => qr.id === e.target.value);
                    if (reply) setNewMessage(reply.body);
                    e.target.value = '';
                  }}
                >
                  <option value="">Respostas rápidas...</option>
                  {quickReplies.map(qr => (
                    <option key={qr.id} value={qr.id}>{qr.title}</option>
                  ))}
                </select>
              </div>
              <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '12px' }}>
                <input 
                  type="text" 
                  placeholder="Digite sua mensagem..." 
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  style={{ flex: 1, padding: '14px 16px', fontSize: '14px' }}
                />
                <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Send size={16} /> Enviar
                </button>
              </form>
            </div>
          </>
        ) : (
          <div style={{ margin: 'auto', color: 'var(--muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <Inbox size={48} opacity={0.2} />
            <p>Selecione um ticket para ver a conversa</p>
          </div>
        )}
      </div>
    </div>
  );
}
