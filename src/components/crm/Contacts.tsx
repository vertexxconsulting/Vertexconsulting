import { useState, useEffect } from 'react';
import { fetchContacts, updateContact, retryContactBoltenSync, deleteContact } from '../../services/contactService';
import { sendLeadNotification } from '../../services/evolutionApi';
import { supabase } from '../../services/supabaseClient';
import { ContactStatuses, type ContactStatus, type ContactData } from '../../types';

function InstagramIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
    </svg>
  );
}

function normalizeInstagram(handle: string): string {
  return handle.trim().replace(/^@/, '');
}

function whatsappLink(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  const full = digits.startsWith('55') ? digits : `55${digits}`;
  return `https://wa.me/${full}`;
}

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
  const [saving, setSaving] = useState(false);
  const [retryingSync, setRetryingSync] = useState(false);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [notice, setNotice] = useState('');

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
    setError('');
    try {
      setContacts(await fetchContacts());
    } catch {
      setError('Não foi possível carregar os contatos. Verifique sua sessão e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const openDetail = (contact: ContactData) => {
    setSelected(contact);
    setEditNotes(contact.notes || '');
    setEditStatus(contact.status || 'Novo');
    setActionError('');
    setNotice('');
  };

  const saveChanges = async () => {
    if (!selected) return;
    setSaving(true);
    setActionError('');
    setNotice('');
    try {
      const result = await updateContact(selected.id, {
        status: editStatus as ContactStatus,
        notes: editNotes,
      });
      if (!selected.bolten_opportunity_id) {
        setNotice('Alterações salvas localmente; o lead ainda não foi vinculado ao Bolten.');
      } else if (!result.boltenSynced) {
        setActionError('Alteração local salva, mas não foi enviada ao Bolten. Use a nova tentativa abaixo.');
      } else {
        setNotice('Alterações salvas e sincronizadas.');
      }
      await loadContacts();
    } catch (e) {
      console.error('Erro ao salvar contato:', e);
      setActionError('Não foi possível salvar as alterações. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const handleRetrySync = async () => {
    if (!selected) return;
    setRetryingSync(true);
    setActionError('');
    try {
      const synced = await retryContactBoltenSync(selected);
      if (!synced) {
        setActionError('Não foi possível sincronizar este lead agora.');
        return;
      }
      setNotice('Lead sincronizado com o Bolten.');
      await loadContacts();
      setSelected((current) => current ? { ...current, bolten_sync_status: 'synced', bolten_sync_error: null } : current);
    } catch {
      setActionError('Não foi possível sincronizar este lead agora.');
    } finally {
      setRetryingSync(false);
    }
  };

  const handleResendWhatsApp = async (contact: ContactData) => {
    if (!contact.phone) return;
    try {
      const sent = await sendLeadNotification(contact.name, contact.phone);
      if (!sent) throw new Error('WhatsApp não enviado');
      const { error: updateError } = await supabase.from('contacts').update({ whatsapp_sent: true }).eq('id', contact.id);
      if (updateError) throw updateError;
      await loadContacts();
    } catch (resendError) {
      console.error('Erro ao reenviar WhatsApp:', resendError);
      setError('Não foi possível enviar o WhatsApp. Verifique a conexão e tente novamente.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este contato?')) return;
    try {
      await deleteContact(id);
      setSelected(null);
      await loadContacts();
    } catch {
      setActionError('Não foi possível excluir este contato. Tente novamente.');
    }
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

      {error && (
        <div className="crm-inline-error" role="alert">
          <span>{error}</span>
          <button className="btn btn--secondary" onClick={loadContacts}>Tentar novamente</button>
        </div>
      )}

      {loading ? (
        <div className="empty-state" aria-live="polite"><p>Carregando contatos…</p></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state"><p>Nenhum contato encontrado.</p></div>
      ) : (
        <div className="dash-recent table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>E-mail</th>
                <th>Telefone</th>
                <th>Instagram</th>
                <th>Site?</th>
                <th>Empresa</th>
                <th>Serviço</th>
                <th>Status</th>
                <th>WhatsApp</th>
                <th>Bolten</th>
                <th>Data</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr
                  key={c.id}
                  onClick={() => openDetail(c)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      openDetail(c);
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  aria-label={`Abrir detalhes de ${c.name}`}
                  style={{ cursor: 'pointer' }}
                >
                  <td style={{ color: 'var(--text-bright)', fontWeight: 600 }}>{c.name}</td>
                  <td>{c.email || '-'}</td>
                  <td>
                    {c.phone ? (
                      <a
                        href={whatsappLink(c.phone)}
                        target="_blank"
                        rel="noreferrer"
                        className="contact-link contact-link--whatsapp"
                        onClick={(e) => e.stopPropagation()}
                        title="Abrir conversa no WhatsApp"
                      >
                        <WhatsAppIcon />
                        {c.phone}
                      </a>
                    ) : '-'}
                  </td>
                  <td>
                    {c.instagram ? (
                      <a
                        href={`https://instagram.com/${normalizeInstagram(c.instagram)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="contact-link contact-link--instagram"
                        onClick={(e) => e.stopPropagation()}
                        title="Abrir perfil no Instagram"
                      >
                        <InstagramIcon />
                        @{normalizeInstagram(c.instagram)}
                      </a>
                    ) : '-'}
                  </td>
                  <td>{c.has_site || '-'}</td>
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
                  <td>
                    <span className={`sync-badge sync-badge--${c.bolten_sync_status || 'pending'}`}>
                      {c.bolten_sync_status === 'synced' ? 'Sincronizado' : c.bolten_sync_status === 'error' ? 'Pendente' : 'Aguardando'}
                    </span>
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
          <div className="modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="contact-detail-title">
            <div className="modal__header">
              <h3 id="contact-detail-title">{selected.name}</h3>
              <button className="modal__close" onClick={() => setSelected(null)} aria-label="Fechar detalhes">×</button>
            </div>
            <div className="modal__body">
              <div className="modal__field">
                <label>E-mail</label>
                <div className="modal__field-value">{selected.email || '-'}</div>
              </div>
              <div className="modal__field">
                <label>Telefone / WhatsApp</label>
                <div className="modal__field-value">
                  {selected.phone ? (
                    <a
                      href={whatsappLink(selected.phone)}
                      target="_blank"
                      rel="noreferrer"
                      className="contact-link contact-link--whatsapp"
                    >
                      <WhatsAppIcon />
                      {selected.phone}
                    </a>
                  ) : '-'}
                </div>
              </div>
              <div className="modal__field">
                <label>Instagram</label>
                <div className="modal__field-value">
                  {selected.instagram ? (
                    <a
                      href={`https://instagram.com/${normalizeInstagram(selected.instagram)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="contact-link contact-link--instagram"
                    >
                      <InstagramIcon />
                      @{normalizeInstagram(selected.instagram)}
                    </a>
                  ) : '-'}
                </div>
              </div>
              <div className="modal__field">
                <label>Já possui site?</label>
                <div className="modal__field-value">{selected.has_site || '-'}</div>
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
              {(selected.bolten_sync_status === 'error' || !selected.bolten_opportunity_id) && (
                <div className="sync-panel">
                  <div>
                    <strong>{selected.bolten_opportunity_id ? 'Sincronização pendente' : 'Lead ainda não vinculado ao Bolten'}</strong>
                    <p>{selected.bolten_sync_error || 'A nova tentativa recria o vínculo com o CRM externo.'}</p>
                  </div>
                  <button className="btn btn--secondary" onClick={handleRetrySync} disabled={retryingSync}>
                    {retryingSync ? 'Sincronizando…' : 'Tentar novamente'}
                  </button>
                </div>
              )}
              {actionError && <p className="crm-inline-error" role="alert">{actionError}</p>}
              {notice && <p className="crm-inline-success" role="status">{notice}</p>}
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
                disabled={saving}
              >
                {saving ? 'Salvando…' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
