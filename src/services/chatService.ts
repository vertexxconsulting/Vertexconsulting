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
    throw error;
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
        try {
          callback(await fetchConversations());
        } catch (error) {
          console.error('Erro ao atualizar conversas em tempo real:', error);
        }
      },
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

export async function markAsRead(conversationId: string): Promise<void> {
  const { error } = await supabase
    .from('conversations')
    .update({ unread_count: 0 })
    .eq('id', conversationId);
  if (error) console.error('Erro ao marcar conversa como lida:', error);
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
    throw error;
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
  const timestamp = new Date().toISOString();

  const { data: inserted, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      sender: 'agent',
      text,
      timestamp,
      status: 'sent',
    })
    .select()
    .single();

  if (error) {
    console.error('Erro ao inserir mensagem:', error);
    return null;
  }

  await supabase
    .from('conversations')
    .update({
      last_message: text.substring(0, 120),
      last_message_at: timestamp,
    })
    .eq('id', conversationId);

  let delivered = false;
  if (config.apiUrl && config.apiKey && config.instanceName) {
    try {
      await sendTextMessage(config.instanceName, phone, text);
      delivered = true;
    } catch (sendError) {
      console.error('Erro ao enviar via Evolution:', sendError);
    }
  } else {
    console.error('Evolution API não configurada para envio de mensagem.');
  }

  if (!delivered) {
    await supabase
      .from('messages')
      .update({ status: 'failed' })
      .eq('id', inserted.id);
  }

  return {
    ...(inserted as Message),
    status: delivered ? 'sent' : 'failed',
  };
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
