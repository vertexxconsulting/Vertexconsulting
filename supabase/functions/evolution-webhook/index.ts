// supabase/functions/evolution-webhook/index.ts
// Recebe eventos da Evolution API e persiste no Supabase
// Deploy: supabase functions deploy evolution-webhook

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// Normaliza número para 55XXXXXXXXXXX
function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  return digits.startsWith('55') ? digits : `55${digits}`;
}

Deno.serve(async (req: Request) => {
  // Só aceita POST
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return new Response('Invalid JSON', { status: 400 });
  }

  // A Evolution envia diferentes eventos — nos interessa messages.upsert
  const event = body.event as string | undefined;
  if (event !== 'messages.upsert') {
    // Ignorar outros eventos mas retornar 200 para não ter retry
    return new Response('OK', { status: 200 });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  try {
    const data = body.data as Record<string, unknown>;
    const messages = Array.isArray(data) ? data : [data];

    for (const msg of messages) {
      const key = (msg.key as Record<string, unknown>) || {};
      const msgContent = (msg.message as Record<string, unknown>) || {};

      // Extrai o texto da mensagem (texto simples ou legenda de mídia)
      const text: string =
        (msgContent.conversation as string) ||
        (msgContent.extendedTextMessage as Record<string, unknown>)?.text as string ||
        (msgContent.imageMessage as Record<string, unknown>)?.caption as string ||
        '[Mídia]';

      const evolutionId = key.id as string;
      const rawPhone = (key.remoteJid as string)?.replace('@s.whatsapp.net', '') || '';
      const phone = normalizePhone(rawPhone);
      const fromMe = key.fromMe as boolean;
      const sender = fromMe ? 'agent' : 'user';

      // Nome do pushName (se disponível)
      const pushName = msg.pushName as string | undefined;

      // Dedup por evolution_id
      if (evolutionId) {
        const { data: existing } = await supabase
          .from('messages')
          .select('id')
          .eq('evolution_id', evolutionId)
          .maybeSingle();
        if (existing) continue;
      }

      // Upsert conversa (cria se não existe)
      const { data: conv, error: convError } = await supabase
        .from('conversations')
        .upsert(
          {
            phone,
            name: pushName || phone,
            last_message: text.substring(0, 120),
            last_message_at: new Date().toISOString(),
            // Só incrementa unread se a mensagem veio do cliente
            unread_count: fromMe ? undefined : supabase.rpc('increment_unread', { p_phone: phone }),
          },
          { onConflict: 'phone', ignoreDuplicates: false }
        )
        .select('id')
        .single();

      // Fallback: busca a conversa pelo phone se o upsert falhou
      let conversationId = conv?.id;
      if (convError || !conversationId) {
        const { data: existing } = await supabase
          .from('conversations')
          .select('id, unread_count')
          .eq('phone', phone)
          .maybeSingle();

        if (existing) {
          conversationId = existing.id;
          // Atualiza last_message e unread_count manualmente
          await supabase
            .from('conversations')
            .update({
              last_message: text.substring(0, 120),
              last_message_at: new Date().toISOString(),
              name: pushName || existing.name || phone,
              unread_count: fromMe ? existing.unread_count : (existing.unread_count || 0) + 1,
            })
            .eq('id', conversationId);
        } else {
          // Cria nova conversa
          const { data: newConv } = await supabase
            .from('conversations')
            .insert({
              phone,
              name: pushName || phone,
              last_message: text.substring(0, 120),
              last_message_at: new Date().toISOString(),
              unread_count: fromMe ? 0 : 1,
            })
            .select('id')
            .single();
          conversationId = newConv?.id;
        }
      }

      if (!conversationId) continue;

      // Insere a mensagem
      await supabase.from('messages').insert({
        conversation_id: conversationId,
        sender,
        text,
        timestamp: new Date().toISOString(),
        status: fromMe ? 'sent' : 'delivered',
        evolution_id: evolutionId || null,
      });
    }

    return new Response('OK', { status: 200 });
  } catch (err) {
    console.error('Webhook error:', err);
    // Retorna 200 mesmo em erro para não causar retry storm da Evolution
    return new Response('OK', { status: 200 });
  }
});
