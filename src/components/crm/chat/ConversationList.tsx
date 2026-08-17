import { useState } from 'react';
import type { Conversation } from '../../../types';
import { formatRelativeTime, getInitials } from '../../../services/chatService';

interface Props {
  conversations: Conversation[];
  selectedId: string | null;
  onSelect: (conv: Conversation) => void;
  loading: boolean;
}

const STATUS_COLORS: Record<string, string> = {
  Ativo: '#22c55e',
  Aguardando: '#eab308',
  Encerrada: '#6b7280',
};

export default function ConversationList({
  conversations,
  selectedId,
  onSelect,
  loading,
}: Props) {
  const [search, setSearch] = useState('');

  const filtered = conversations.filter((c) => {
    const q = search.toLowerCase();
    return (
      (c.name?.toLowerCase().includes(q) ?? false) ||
      c.phone.includes(q) ||
      (c.last_message?.toLowerCase().includes(q) ?? false)
    );
  });

  return (
    <div className="conv-list">
      {/* Cabeçalho */}
      <div className="conv-list__header">
        <h2 className="conv-list__title">Conversas</h2>
        {conversations.length > 0 && (
          <span className="conv-list__count">{conversations.length}</span>
        )}
      </div>

      {/* Busca */}
      <div className="conv-list__search-wrap">
        <svg className="conv-list__search-icon" viewBox="0 0 20 20" fill="none">
          <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.5" />
          <path d="M14 14l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <input
          id="conv-search"
          className="conv-list__search"
          type="text"
          placeholder="Buscar conversa..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Lista */}
      <div className="conv-list__items">
        {loading && conversations.length === 0 && (
          <div className="conv-list__empty">
            <div className="conv-list__spinner" />
            <p>Carregando conversas…</p>
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="conv-list__empty">
            <svg viewBox="0 0 24 24" fill="none" className="conv-list__empty-icon">
              <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p>{search ? 'Nenhuma conversa encontrada' : 'Nenhuma conversa ainda'}</p>
            {!search && <span>As mensagens do WhatsApp aparecerão aqui automaticamente</span>}
          </div>
        )}

        {filtered.map((conv) => {
          const isSelected = conv.id === selectedId;
          const initials = getInitials(conv.name, conv.phone);
          const statusColor = STATUS_COLORS[conv.status] ?? '#6b7280';

          return (
            <button
              key={conv.id}
              id={`conv-item-${conv.id}`}
              className={`conv-item ${isSelected ? 'conv-item--active' : ''}`}
              onClick={() => onSelect(conv)}
            >
              {/* Avatar */}
              <div className="conv-item__avatar">
                <span className="conv-item__initials">{initials}</span>
                <span
                  className="conv-item__status-dot"
                  style={{ background: statusColor }}
                  title={conv.status}
                />
              </div>

              {/* Corpo */}
              <div className="conv-item__body">
                <div className="conv-item__top">
                  <span className="conv-item__name">
                    {conv.name || conv.phone}
                  </span>
                  <span className="conv-item__time">
                    {formatRelativeTime(conv.last_message_at)}
                  </span>
                </div>
                <div className="conv-item__bottom">
                  <span className="conv-item__preview">
                    {conv.last_message || 'Sem mensagens'}
                  </span>
                  {conv.unread_count > 0 && (
                    <span className="conv-item__badge">
                      {conv.unread_count > 99 ? '99+' : conv.unread_count}
                    </span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
