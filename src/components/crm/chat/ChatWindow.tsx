import { useState, useEffect, useRef, useCallback } from 'react';
import type { Conversation, Message } from '../../../types';
import {
  fetchMessages,
  subscribeToMessages,
  sendMessage,
  getInitials,
} from '../../../services/chatService';

interface Props {
  conversation: Conversation | null;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return 'Hoje';
  if (d.toDateString() === yesterday.toDateString()) return 'Ontem';
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

export default function ChatWindow({ conversation }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    bottomRef.current?.scrollIntoView({ behavior });
  }, []);

  // Carrega mensagens quando muda de conversa
  useEffect(() => {
    if (!conversation) {
      setMessages([]);
      return;
    }

    setLoading(true);
    fetchMessages(conversation.id).then((msgs) => {
      setMessages(msgs);
      setLoading(false);
      setTimeout(() => scrollToBottom('instant'), 50);
    });

    // Realtime
    const unsubscribe = subscribeToMessages(conversation.id, (newMsg) => {
      setMessages((prev) => {
        // Evita duplicatas
        if (prev.some((m) => m.id === newMsg.id)) return prev;
        return [...prev, newMsg];
      });
      setTimeout(() => scrollToBottom('smooth'), 50);
    });

    return unsubscribe;
  }, [conversation?.id, scrollToBottom]);

  // Auto-scroll quando mensagens mudam
  useEffect(() => {
    if (messages.length > 0) scrollToBottom('smooth');
  }, [messages.length, scrollToBottom]);

  const handleSend = async () => {
    if (!conversation || !text.trim() || sending) return;
    const content = text.trim();
    setText('');
    setSending(true);

    // Optimistic insert
    const optimistic: Message = {
      id: `opt-${Date.now()}`,
      conversation_id: conversation.id,
      sender: 'agent',
      text: content,
      timestamp: new Date().toISOString(),
      status: 'sent',
      evolution_id: null,
    };
    setMessages((prev) => [...prev, optimistic]);
    scrollToBottom('smooth');

    await sendMessage(conversation.id, conversation.phone, content);
    setSending(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Agrupa mensagens por data
  const groupedMessages: Array<{ date: string; msgs: Message[] }> = [];
  messages.forEach((msg) => {
    const dateLabel = formatDate(msg.timestamp);
    const last = groupedMessages[groupedMessages.length - 1];
    if (last && last.date === dateLabel) {
      last.msgs.push(msg);
    } else {
      groupedMessages.push({ date: dateLabel, msgs: [msg] });
    }
  });

  // ── Estado vazio ─────────────────────────────────────────────
  if (!conversation) {
    return (
      <div className="chat-window chat-window--empty">
        <svg viewBox="0 0 48 48" fill="none" className="chat-window__empty-icon">
          <path d="M8 40l4.8-12.8A16 16 0 118 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M24 16v8M24 28v.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
        <h3>Selecione uma conversa</h3>
        <p>Escolha uma conversa na lista ao lado para começar o atendimento</p>
      </div>
    );
  }

  const initials = getInitials(conversation.name, conversation.phone);

  return (
    <div className="chat-window">
      {/* Header da conversa */}
      <div className="chat-window__header">
        <div className="chat-window__avatar">{initials}</div>
        <div className="chat-window__header-info">
          <span className="chat-window__contact-name">
            {conversation.name || conversation.phone}
          </span>
          <span className="chat-window__contact-phone">{conversation.phone}</span>
        </div>
        <span
          className={`chat-window__status-badge chat-window__status-badge--${conversation.status.toLowerCase()}`}
        >
          {conversation.status}
        </span>
      </div>

      {/* Área de mensagens */}
      <div className="chat-window__messages" id="chat-messages-scroll">
        {loading && (
          <div className="chat-window__loading">
            <div className="conv-list__spinner" />
          </div>
        )}

        {!loading && messages.length === 0 && (
          <div className="chat-window__no-msgs">
            <p>Nenhuma mensagem ainda. Envie a primeira!</p>
          </div>
        )}

        {groupedMessages.map(({ date, msgs }) => (
          <div key={date}>
            <div className="chat-window__date-divider">
              <span>{date}</span>
            </div>
            {msgs.map((msg) => {
              const isAgent = msg.sender === 'agent';
              return (
                <div
                  key={msg.id}
                  className={`chat-bubble ${isAgent ? 'chat-bubble--agent' : 'chat-bubble--user'}`}
                >
                  <div className="chat-bubble__content">
                    <p className="chat-bubble__text">{msg.text}</p>
                    <div className="chat-bubble__meta">
                      <span className="chat-bubble__time">{formatTime(msg.timestamp)}</span>
                      {isAgent && (
                        <span className="chat-bubble__status" title={msg.status}>
                          {msg.status === 'read' ? (
                            // Dois ticks azuis
                            <svg viewBox="0 0 16 10" fill="none" width="14">
                              <path d="M1 5l3 3 5-7" stroke="#60a5fa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              <path d="M6 5l3 3 5-7" stroke="#60a5fa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          ) : msg.status === 'delivered' ? (
                            // Dois ticks cinza
                            <svg viewBox="0 0 16 10" fill="none" width="14">
                              <path d="M1 5l3 3 5-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              <path d="M6 5l3 3 5-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          ) : (
                            // Um tick
                            <svg viewBox="0 0 10 10" fill="none" width="12">
                              <path d="M1 5l3 3 5-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input de envio */}
      <div className="chat-window__footer">
        <textarea
          ref={inputRef}
          id="chat-message-input"
          className="chat-window__input"
          placeholder="Digite uma mensagem... (Enter para enviar)"
          rows={1}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={sending}
        />
        <button
          id="chat-send-btn"
          className="chat-window__send-btn"
          onClick={handleSend}
          disabled={!text.trim() || sending}
          aria-label="Enviar mensagem"
        >
          {sending ? (
            <div className="chat-window__send-spinner" />
          ) : (
            <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
              <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M22 2L15 22l-4-9-9-4 20-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
