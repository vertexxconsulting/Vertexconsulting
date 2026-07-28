import { useState, useEffect } from 'react';
import { fetchContacts, updateContactStatus, updateContactNotes, deleteContact } from '../../services/contactService';
import { sendLeadNotification } from '../../services/evolutionApi';
import { supabase } from '../../services/supabaseClient';
import { ContactStatuses, type ContactStatus, type ContactData } from '../../types';

function getStatusClass(status: string): string {
  switch (status) {
    case 'Novo': return 'status--novo';
    case 'Em contato': return 'status--em-contato';
    case 'Apresentação':
    case 'Negociação': return 'status--proposta';
    case 'Fechado Ganho': return 'status--fechado-ganho';
    case 'Fechado Perdido': return 'status--fechado-perdido';
    default: return 'status--novo';
  }
}

export default function Contacts() {
  const [contacts, setContacts] = useState<ContactData[]>([]);
  const [filtered, setFiltered] = useState<ContactData[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selected, setSelected] = useState<ContactData | null>(null);
  const [editNotes, setEditNotes] = useState('');
  const [editStatus, setEditStatus] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContacts();
  }, []);

  useEffect(() => {
    let result = contacts;
    if (search) {
      const s = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.name?.toLowerCase().includes(s) ||
          c.email?.toLowerCase().includes(s) ||
          c.phone?.includes(s) ||
          c.company?.toLowerCase().includes(s),
      );
    }
    if (statusFilter) {
      result = result.filter((c) => c.status === statusFilter);
    }
    setFiltered(result);
  }, [contacts, search, statusFilter]);

  const loadContacts = async () => {
    setLoading(true);
    const data = await fetchContacts();
    setContacts(data);
    setLoading(false);
  };

  const openDetail = (contact: ContactData) => {
    setSelected(contact);
    setEditNotes(contact.notes || '');
    setEditStatus(contact.status || 'Novo');
  };

  const saveChanges = async () => {
    if (!selected) return;
    try {
      await updateContactStatus(selected.id, editStatus as ContactStatus);
      await updateContactNotes(selected.id, editNotes);
      setSelected(null);
      await loadContacts();
    } catch (e) {
      console.error('Erro ao salvar:', e);
    }
  };

  const handleResendWhatsApp = async (contact: ContactData) => {
    if (!contact.phone) return;
    const sent = await sendLeadNotification(contact.name, contact.phone);
    if (sent) {
      await supabase.from('contacts').update({ whatsapp_sent: true }).eq('id', contact.id);
      await loadContacts();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este contato?')) return;
    await deleteContact(id);
    setSelected(null);
    await loadContacts();
  };

  const formatDate = (iso: string) => {
    if (!iso) return '-';
    return new Date(iso).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div>
      <div className="contacts__toolbar">
        <input
          className="contacts__search"
          type="text"
          placeholder="Buscar por nome, email, telefone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="contacts__filter"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">Todos os status</option>
          {Object.values(ContactStatuses).map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <button className="btn btn--secondary" style={{ padding: '10px 18px', fontSize: '0.82rem' }} onClick={loadContacts}>
          Atualizar
        </button>
      </div>

      {loading ? (
        <div className="empty-state"><p>Carregando...</p></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state"><p>Nenhum contato encontrado.</p></div>
      ) : (
        <div className="dash-recent">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>E-mail</th>
                <th>Telefone</th>
                <th>Empresa</th>
                <th>Serviço</th>
                <th>Status</th>
                <th>WhatsApp</th>
                <th>Data</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} onClick={() => openDetail(c)} style={{ cursor: 'pointer' }}>
                  <td style={{ color: 'var(--text-bright)', fontWeight: 600 }}>{c.name}</td>
                  <td>{c.email || '-'}</td>
                  <td>{c.phone || '-'}</td>
                  <td>{c.company || '-'}</td>
                  <td>{c.service || '-'}</td>
                  <td>
                    <span className={`status-badge ${getStatusClass(c.status)}`}>
                      {c.status}
                    </span>
                  </td>
                  <td>
                    {c.whatsapp_sent ? (
                      <span style={{ color: '#81c784', fontSize: '0.8rem' }}>Enviado</span>
                    ) : (
                      <button
                        className="btn btn--primary"
                        style={{ padding: '4px 10px', fontSize: '0.72rem' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleResendWhatsApp(c);
                        }}
                      >
                        Enviar
                      </button>
                    )}
                  </td>
                  <td style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                    {formatDate(c.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail Modal */}
      {selected && (
        <div className="modal-backdrop" onClick={() => setSelected(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h3>{selected.name}</h3>
              <button className="modal__close" onClick={() => setSelected(null)}>✕</button>
            </div>
            <div className="modal__body">
              <div className="modal__field">
                <label>E-mail</label>
                <div className="modal__field-value">{selected.email || '-'}</div>
              </div>
              <div className="modal__field">
                <label>Telefone</label>
                <div className="modal__field-value">{selected.phone || '-'}</div>
              </div>
              <div className="modal__field">
                <label>Empresa</label>
                <div className="modal__field-value">{selected.company || '-'}</div>
              </div>
              <div className="modal__field">
                <label>Serviço</label>
                <div className="modal__field-value">{selected.service || '-'}</div>
              </div>
              <div className="modal__field">
                <label>Mensagem</label>
                <div className="modal__field-value">{selected.message || '-'}</div>
              </div>
              <div className="modal__field">
                <label>Status</label>
                <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)}>
                  {Object.values(ContactStatuses).map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div className="modal__field">
                <label>Notas Internas</label>
                <textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Adicionar notas sobre este lead..."
                />
              </div>
            </div>
            <div className="modal__actions">
              <button
                className="btn btn--secondary"
                style={{ padding: '8px 16px', fontSize: '0.82rem', color: 'var(--error)' }}
                onClick={() => handleDelete(selected.id)}
              >
                Excluir
              </button>
              <button
                className="btn btn--secondary"
                style={{ padding: '8px 16px', fontSize: '0.82rem' }}
                onClick={() => setSelected(null)}
              >
                Cancelar
              </button>
              <button
                className="btn btn--primary"
                style={{ padding: '8px 20px', fontSize: '0.82rem' }}
                onClick={saveChanges}
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
