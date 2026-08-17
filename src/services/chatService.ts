import { supabase } from './supabaseClient';
import { sendTextMessage, getEvolutionConfig } from './evolutionApi';
import type { Conversation, Message } from '../types';

// ── Conversas ────────────────────────────────────────────────

export async function fetchConversations(): Promise<Conversation[]> {
  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .order('last_message_at', { ascending: false, nullsFirst: false });

  if (error) {
    console.error('Erro ao buscar conversas:', error);
    return [];
  }
  return (data as Conversation[]) || [];
}

export function subscribeToConversations(
  callback: (conversations: Conversation[]) => void,
) {
  const channel = supabase
    .channel('conversations-realtime')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'conversations' },
      async () => {
        // Re-fetch completo para manter a ordem
        const updated = await fetchConversations();
        callback(updated);
      },
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

export async function markAsRead(conversationId: string): Promise<void> {
  await supabase
    .from('conversations')
    .update({ unread_count: 0 })
    .eq('id', conversationId);
}

// ── Mensagens ─────────────────────────────────────────────────

export async function fetchMessages(conversationId: string): Promise<Message[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('timestamp', { ascending: true });

  if (error) {
    console.error('Erro ao buscar mensagens:', error);
    return [];
  }
  return (data as Message[]) || [];
}

export function subscribeToMessages(
  conversationId: string,
  callback: (message: Message) => void,
) {
  const channel = supabase
    .channel(`messages-${conversationId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload) => {
        callback(payload.new as Message);
      },
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

// ── Envio de mensagem ─────────────────────────────────────────

export async function sendMessage(
  conversationId: string,
  phone: string,
  text: string,
): Promise<Message | null> {
  const config = getEvolutionConfig();

  // Insere localmente primeiro (optimistic UI)
  const optimisticId = crypto.randomUUID();
  const optimistic: Message = {
    id: optimisticId,
    conversation_id: conversationId,
    sender: 'agent',
    text,
    timestamp: new Date().toISOString(),
    status: 'sent',
    evolution_id: null,
  };

  // Persiste no Supabase
  const { data: inserted, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      sender: 'agent',
      text,
      timestamp: optimistic.timestamp,
      status: 'sent',
    })
    .select()
    .single();

  if (error) {
    console.error('Erro ao inserir mensagem:', error);
    return null;
  }

  // Atualiza last_message na conversa
  await supabase
    .from('conversations')
    .update({
      last_message: text.substring(0, 120),
      last_message_at: optimistic.timestamp,
    })
    .eq('id', conversationId);

  // Envia via Evolution (não bloqueia o retorno visual)
  if (config.apiUrl && config.apiKey && config.instanceName) {
    sendTextMessage(config.instanceName, phone, text).catch((err) =>
      console.error('Erro ao enviar via Evolution:', err),
    );
  }

  return (inserted as Message) || optimistic;
}

// ── Utilitário: formata timestamp relativo ─────────────────────

export function formatRelativeTime(isoString: string | null): string {
  if (!isoString) return '';
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffH = Math.floor(diffMs / 3600000);
  const diffD = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return 'agora';
  if (diffMin < 60) return `${diffMin}m`;
  if (diffH < 24) return `${diffH}h`;
  if (diffD < 7) return `${diffD}d`;
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

// ── Utilitário: iniciais do nome ───────────────────────────────

export function getInitials(name: string | null, phone: string): string {
  if (!name) return phone.slice(-2);
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
