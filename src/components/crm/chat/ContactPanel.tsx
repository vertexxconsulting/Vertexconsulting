import { useState, useEffect } from 'react';
import { supabase } from '../../../services/supabaseClient';
import type { Conversation, ContactData } from '../../../types';

interface Props {
  conversation: Conversation | null;
}

const STATUS_OPTIONS = [
  'Ativo',
  'Aguardando',
  'Encerrada',
] as const;

export default function ContactPanel({ conversation }: Props) {
  const [contact, setContact] = useState<ContactData | null>(null);
  const [loadingContact, setLoadingContact] = useState(false);
  const [status, setStatus] = useState<string>('Ativo');
  const [savingStatus, setSavingStatus] = useState(false);
  const [statusError, setStatusError] = useState('');
  const conversationId = conversation?.id;
  const conversationContactId = conversation?.contact_id;
  const conversationPhone = conversation?.phone;
  const conversationStatus = conversation?.status;

  // Busca contato vinculado quando muda a conversa
  useEffect(() => {
    let cancelled = false;
    if (!conversationId || !conversationPhone || !conversationStatus) {
      setContact(null);
      setLoadingContact(false);
      return;
    }

    setStatus(conversationStatus);
    setStatusError('');
    setLoadingContact(true);

    const phoneSuffix = conversationPhone.replace(/\D/g, '').slice(-8);
    if (!conversationContactId && !phoneSuffix) {
      setContact(null);
      setLoadingContact(false);
      return () => {
        cancelled = true;
      };
    }
    const contactQuery = conversationContactId ?
      supabase
        .from('contacts')
        .select('*')
        .eq('id', conversationContactId)
        .maybeSingle()
      : supabase
        .from('contacts')
        .select('*')
        .ilike('phone', `%${phoneSuffix}`)
        .maybeSingle();

    Promise.resolve(contactQuery)
      .then(({ data }) => {
        if (cancelled) return;
        setContact(data as ContactData | null);
        setLoadingContact(false);
      })
      .catch(() => {
        if (cancelled) return;
        setContact(null);
        setLoadingContact(false);
      });

    return () => {
      cancelled = true;
    };
  }, [conversationContactId, conversationId, conversationPhone, conversationStatus]);

  const handleStatusChange = async (newStatus: string) => {
    if (!conversation) return;
    setStatus(newStatus);
    setSavingStatus(true);
    setStatusError('');
    const { error } = await supabase
      .from('conversations')
      .update({ status: newStatus })
      .eq('id', conversation.id);
    if (error) {
      setStatus(conversation.status);
      setStatusError('Não foi possível atualizar o status.');
    }
    setSavingStatus(false);
  };

  if (!conversation) {
    return (
      <div className="contact-panel contact-panel--empty">
        <p>Selecione uma conversa</p>
      </div>
    );
  }

  const waDigits = conversation.phone.replace(/\D/g, '');
  const waLink = `https://wa.me/${waDigits}`;

  return (
    <div className="contact-panel">
      {/* Cabeçalho */}
      <div className="contact-panel__header">
        <div className="contact-panel__avatar">
          {(conversation.name ?? conversation.phone).slice(0, 2).toUpperCase()}
        </div>
        <div className="contact-panel__name">
          {conversation.name || conversation.phone}
        </div>
        <div className="contact-panel__phone">{conversation.phone}</div>
        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          className="contact-panel__wa-link"
          id="contact-panel-wa-link"
        >
          <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          Abrir no WhatsApp
        </a>
      </div>

      {/* Status da conversa */}
      <div className="contact-panel__section">
        <label className="contact-panel__label">Status da Conversa</label>
        <select
          id="conv-status-select"
          className="contact-panel__select"
          value={status}
          onChange={(e) => handleStatusChange(e.target.value)}
          disabled={savingStatus}
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        {savingStatus && (
          <span className="contact-panel__saving">Salvando…</span>
        )}
        {statusError && <span className="contact-panel__error" role="alert">{statusError}</span>}
      </div>

      {/* Dados do contato (se vinculado) */}
      <div className="contact-panel__section">
        <label className="contact-panel__label">Contato Vinculado</label>
        {loadingContact ? (
          <p className="contact-panel__muted">Buscando…</p>
        ) : contact ? (
          <div className="contact-panel__contact-info">
            <div className="contact-panel__info-row">
              <span className="contact-panel__info-key">Nome</span>
              <span className="contact-panel__info-val">{contact.name}</span>
            </div>
            {contact.email && (
              <div className="contact-panel__info-row">
                <span className="contact-panel__info-key">E-mail</span>
                <a href={`mailto:${contact.email}`} className="contact-panel__info-link">
                  {contact.email}
                </a>
              </div>
            )}
            {contact.company && (
              <div className="contact-panel__info-row">
                <span className="contact-panel__info-key">Empresa</span>
                <span className="contact-panel__info-val">{contact.company}</span>
              </div>
            )}
            {contact.service && (
              <div className="contact-panel__info-row">
                <span className="contact-panel__info-key">Serviço</span>
                <span className="contact-panel__info-val">{contact.service}</span>
              </div>
            )}
            <div className="contact-panel__info-row">
              <span className="contact-panel__info-key">Status CRM</span>
              <span className={`contact-panel__crm-badge status--${contact.status.toLowerCase().replace(' ', '-')}`}>
                {contact.status}
              </span>
            </div>
            <a
              href="#"
              id="contact-panel-open-contacts"
              className="contact-panel__open-btn"
              onClick={(e) => {
                e.preventDefault();
                // Dispara evento customizado para navegar para Contatos
                window.dispatchEvent(
                  new CustomEvent('crm:navigate', { detail: { view: 'Contatos', contactId: contact.id } }),
                );
              }}
            >
              Ver em Contatos →
            </a>
          </div>
        ) : (
          <p className="contact-panel__muted">
            Nenhum contato vinculado a este número.
          </p>
        )}
      </div>

      {/* Histórico breve */}
      <div className="contact-panel__section">
        <label className="contact-panel__label">Info da Conversa</label>
        <div className="contact-panel__info-row">
          <span className="contact-panel__info-key">Iniciada</span>
          <span className="contact-panel__info-val">
            {new Date(conversation.created_at).toLocaleDateString('pt-BR')}
          </span>
        </div>
      </div>
    </div>
  );
}
