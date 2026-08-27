import crypto from 'node:crypto';
import { extractWebhookLead } from './bolten-utils.mjs';

const DEFAULT_SUPABASE_URL = 'https://ognaofyqubojbokohljr.supabase.co';
const REQUEST_TIMEOUT_MS = 10000;

function getSupabaseRestUrl() {
  return `${(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL).replace(/\/$/, '')}/rest/v1`;
}

function parseBody(body) {
  if (!body) return {};
  if (typeof body === 'object') return body;
  try {
    return JSON.parse(body);
  } catch {
    return {};
  }
}

function secureEqual(left, right) {
  const a = Buffer.from(String(left || ''));
  const b = Buffer.from(String(right || ''));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

async function fetchWithTimeout(url, init = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

function supabaseHeaders(serviceKey, prefer) {
  return {
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
    'Content-Type': 'application/json',
    ...(prefer ? { Prefer: prefer } : {}),
  };
}

async function findExistingContact(lead, serviceKey) {
  const base = getSupabaseRestUrl();
  const headers = supabaseHeaders(serviceKey);

  if (lead.opportunityId) {
    const byOpportunity = await fetchWithTimeout(
      `${base}/contacts?bolten_opportunity_id=eq.${encodeURIComponent(lead.opportunityId)}&select=id&limit=1`,
      { headers },
    );
    if (!byOpportunity.ok) throw new Error(`Busca local por oportunidade: ${byOpportunity.status}`);
    const matches = await byOpportunity.json();
    if (matches[0]?.id) return matches[0].id;
  }

  if (lead.email) {
    const byEmail = await fetchWithTimeout(
      `${base}/contacts?email=ilike.${encodeURIComponent(lead.email)}&select=id&limit=1`,
      { headers },
    );
    if (!byEmail.ok) throw new Error(`Busca local por e-mail: ${byEmail.status}`);
    const matches = await byEmail.json();
    if (matches[0]?.id) return matches[0].id;
  }

  return null;
}

function buildLocalRow(lead, { includeCreateFields = false } = {}) {
  const row = {
    bolten_opportunity_id: lead.opportunityId || null,
    bolten_status: lead.rawStatus || null,
    status: lead.status,
    priority: lead.priority,
    bolten_sync_status: 'synced',
    bolten_sync_error: null,
    bolten_last_synced_at: new Date().toISOString(),
  };

  if (lead.contactId) row.bolten_contact_id = lead.contactId;
  if (lead.name) row.name = lead.name;
  if (lead.email) row.email = lead.email;
  if (lead.phone) row.phone = lead.phone;
  if (lead.company) row.company = lead.company;
  if (lead.service) row.service = lead.service;
  if (lead.notes) row.notes = lead.notes;

  if (includeCreateFields) {
    row.email = lead.email;
    row.name = lead.name || 'Lead';
    row.phone = lead.phone;
    row.company = lead.company;
    row.service = lead.service || 'Não informado';
    row.message = lead.notes;
    row.has_site = '';
    row.instagram = '';
    row.whatsapp_sent = false;
    row.created_at = lead.createdAt || new Date().toISOString();
  }

  return row;
}

async function claimWebhookEvent(lead, serviceKey) {
  if (!lead.eventId) throw new Error('Evento Bolten sem id');

  const base = getSupabaseRestUrl();
  const headers = supabaseHeaders(serviceKey);
  const existing = await fetchWithTimeout(
    `${base}/bolten_webhook_events?event_id=eq.${encodeURIComponent(lead.eventId)}&select=event_id,processed_at&limit=1`,
    { headers },
  );
  if (!existing.ok) throw new Error(`Consulta de idempotência: ${existing.status}`);
  const records = await existing.json();

  if (records[0]?.processed_at) return { duplicate: true };
  if (records.length > 0) return { duplicate: false };

  const created = await fetchWithTimeout(`${base}/bolten_webhook_events`, {
    method: 'POST',
    headers: supabaseHeaders(serviceKey, 'return=minimal'),
    body: JSON.stringify({ event_id: lead.eventId, event_type: lead.eventType }),
  });
  if (created.ok) return { duplicate: false };
  if (created.status === 409) return { duplicate: true };
  throw new Error(`Registro de idempotência: ${created.status}`);
}

async function completeWebhookEvent(lead, serviceKey, error = null) {
  if (!lead.eventId) return;
  await fetchWithTimeout(
    `${getSupabaseRestUrl()}/bolten_webhook_events?event_id=eq.${encodeURIComponent(lead.eventId)}`,
    {
      method: 'PATCH',
      headers: supabaseHeaders(serviceKey),
      body: JSON.stringify({
        processed_at: error ? null : new Date().toISOString(),
        error: error ? String(error).slice(0, 500) : null,
      }),
    },
  );
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });

  const secret = process.env.BOLTEN_WEBHOOK_SECRET;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secret || !serviceKey) {
    console.error('Bolten webhook: configuração ausente no servidor');
    return res.status(500).json({ error: 'Webhook não configurado no servidor' });
  }

  if (!secureEqual(req.headers['x-api-key'], secret)) {
    return res.status(401).json({ error: 'Chave inválida' });
  }

  const payload = parseBody(req.body);
  const lead = extractWebhookLead(payload);
  if (!lead.eventType.startsWith('opportunity.')) {
    return res.status(200).json({ ok: true, ignored: true });
  }

  if (!lead.eventId) return res.status(400).json({ error: 'Evento sem id' });

  try {
    const claim = await claimWebhookEvent(lead, serviceKey);
    if (claim.duplicate) return res.status(200).json({ ok: true, duplicate: true });

    const localId = await findExistingContact(lead, serviceKey);
    const row = buildLocalRow(lead, { includeCreateFields: !localId });
    const base = getSupabaseRestUrl();

    let saved;
    if (localId) {
      saved = await fetchWithTimeout(`${base}/contacts?id=eq.${encodeURIComponent(localId)}`, {
        method: 'PATCH',
        headers: supabaseHeaders(serviceKey, 'return=representation'),
        body: JSON.stringify(row),
      });
    } else {
      saved = await fetchWithTimeout(`${base}/contacts`, {
        method: 'POST',
        headers: supabaseHeaders(serviceKey, 'return=representation'),
        body: JSON.stringify(row),
      });
    }

    if (!saved.ok) throw new Error(`Gravação no Supabase (${saved.status}): ${await saved.text()}`);

    await completeWebhookEvent(lead, serviceKey);
    return res.status(200).json({ ok: true, action: localId ? 'updated' : 'created' });
  } catch (error) {
    console.error('Bolten webhook: falha ao processar evento', error);
    await completeWebhookEvent(lead, serviceKey, error).catch((completionError) => {
      console.error('Bolten webhook: falha ao registrar erro do evento', completionError);
    });
    return res.status(502).json({ error: 'Falha ao sincronizar evento com o CRM interno' });
  }
}
