import { useState, useEffect, useCallback } from 'react';
import type { Conversation } from '../../../types';
import {
  fetchConversations,
  subscribeToConversations,
  markAsRead,
} from '../../../services/chatService';
import ConversationList from './ConversationList';
import ChatWindow from './ChatWindow';
import ContactPanel from './ContactPanel';

export default function ChatView() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selected, setSelected] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showContactPanel, setShowContactPanel] = useState(true);

  // Carrega e assina conversas
  useEffect(() => {
    fetchConversations()
      .then((data) => setConversations(data))
      .catch(() => setError('Não foi possível carregar as conversas. Tente novamente.'))
      .finally(() => setLoading(false));

    const unsubscribe = subscribeToConversations((updated) => {
      setConversations(updated);
      // Atualiza a conversa selecionada se ela mudou
      setSelected((prev) => {
        if (!prev) return prev;
        const refreshed = updated.find((c) => c.id === prev.id);
        return refreshed ?? prev;
      });
    });

    return unsubscribe;
  }, []);

  const handleSelect = useCallback(async (conv: Conversation) => {
    setSelected(conv);
    if (conv.unread_count > 0) {
      await markAsRead(conv.id);
      setConversations((prev) =>
        prev.map((c) => (c.id === conv.id ? { ...c, unread_count: 0 } : c)),
      );
    }
  }, []);

  return (
    <div className="chat-view">
      {/* Coluna 1: lista de conversas */}
      <ConversationList
        conversations={conversations}
        selectedId={selected?.id ?? null}
        onSelect={handleSelect}
        loading={loading}
      />

      {error && <p className="chat-view__error" role="alert">{error}</p>}

      {/* Coluna 2: janela de mensagens */}
      <ChatWindow conversation={selected} />

      {/* Coluna 3: painel de contato (toggle em telas menores) */}
      <div className={`chat-view__panel-wrap ${showContactPanel ? '' : 'chat-view__panel-wrap--hidden'}`}>
        <button
          id="chat-toggle-panel-btn"
          className="chat-view__panel-toggle"
          onClick={() => setShowContactPanel((v) => !v)}
          title={showContactPanel ? 'Ocultar painel' : 'Mostrar painel de contato'}
        >
          {showContactPanel ? (
            <svg viewBox="0 0 20 20" fill="none" width="16">
              <path d="M13 5l-5 5 5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : (
            <svg viewBox="0 0 20 20" fill="none" width="16">
              <path d="M7 5l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>
        {showContactPanel && <ContactPanel conversation={selected} />}
      </div>
    </div>
  );
}
