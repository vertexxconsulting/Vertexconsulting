import { buildObservation, validateLeadPayload, mapStatusToBolten } from './bolten-utils.mjs';

const BOLTEN_BASE = 'https://app.bolten.io';
const DEFAULT_SUPABASE_URL = 'https://ognaofyqubojbokohljr.supabase.co';
const REQUEST_TIMEOUT_MS = 12000;
const BOLTEN_MIN_INTERVAL_MS = 1100;
let boltenRateGate = Promise.resolve();

function getSupabaseRestUrl() {
  return `${(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL).replace(/\/$/, '')}/rest/v1`;
}

function getSupabaseBaseUrl() {
  return getSupabaseRestUrl().replace(/\/rest\/v1$/, '');
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

async function fetchWithTimeout(url, init = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function fetchBolten(url, init = {}) {
  const run = boltenRateGate.then(async () => {
    const response = await fetchWithTimeout(url, init);
    if (response.status === 429) {
      const retryAfter = Number(response.headers.get('retry-after'));
      const waitMs = Number.isFinite(retryAfter) && retryAfter > 0
        ? Math.min(retryAfter * 1000, 10000)
        : BOLTEN_MIN_INTERVAL_MS;
      await new Promise((resolve) => setTimeout(resolve, waitMs));
      return fetchWithTimeout(url, init);
    }
    return response;
  });
  boltenRateGate = run.then(
    () => new Promise((resolve) => setTimeout(resolve, BOLTEN_MIN_INTERVAL_MS)),
    () => undefined,
  );
  return run;
}

function jsonResponse(res, status, body) {
  return res.status(status).json(body);
}

function boltenHeaders(apiKey) {
  return {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  };
}

function isUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function supabaseServiceHeaders(serviceKey, prefer) {
  return {
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
    'Content-Type': 'application/json',
    ...(prefer ? { Prefer: prefer } : {}),
  };
}

async function findLocalContact(localContactId) {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) return null;

  const response = await fetchWithTimeout(
    `${getSupabaseRestUrl()}/contacts?id=eq.${encodeURIComponent(localContactId)}&select=id,name,email,phone&limit=1`,
    { headers: supabaseServiceHeaders(serviceKey) },
  );
  if (!response.ok) throw new Error(`Consulta do contato local (${response.status})`);
  const contacts = await response.json();
  return Array.isArray(contacts) ? contacts[0] || null : null;
}

async function updateLocalSyncState(localContactId, patch) {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!localContactId || !serviceKey) return false;

  const response = await fetchWithTimeout(
    `${getSupabaseRestUrl()}/contacts?id=eq.${encodeURIComponent(localContactId)}`,
    {
      method: 'PATCH',
        headers: supabaseServiceHeaders(serviceKey, 'return=representation'),
        body: JSON.stringify(patch),
      },
  );

  if (!response.ok) {
    console.error('Bolten: não foi possível atualizar o estado local', response.status, await response.text());
    return false;
  }
  const updated = await response.json();
  return Array.isArray(updated) && updated.length === 1;
}

async function isAuthenticatedRequest(req) {
  const authorization = req.headers?.authorization;
  const token = typeof authorization === 'string' && authorization.startsWith('Bearer ')
    ? authorization.slice(7)
    : '';
  const apiKey = process.env.SUPABASE_ANON_KEY
    || process.env.VITE_SUPABASE_ANON_KEY
    || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!token || !apiKey) return false;

  const response = await fetchWithTimeout(`${getSupabaseBaseUrl()}/auth/v1/user`, {
    headers: {
      apikey: apiKey,
      Authorization: `Bearer ${token}`,
    },
  });
  return response.ok;
}

async function createBoltenContact(data, headers, componentId) {
  const response = await fetchBolten(
    `${BOLTEN_BASE}/contact/api/v1/${componentId}/contacts`,
    {
      method: 'POST',
      headers,
      body: JSON.stringify({
        attributes: {
          Nome: data.name,
          'E-mail': data.email,
          Telefone: data.phone || '',
        },
      }),
    },
  );
  if (!response.ok) {
    throw new Error(`Contato Bolten (${response.status}): ${await response.text()}`);
  }
  const contact = await response.json();
  if (!contact?.id) throw new Error('Bolten não retornou o ID do contato');
  return contact.id;
}

async function createBoltenOpportunity(data, headers, componentId) {
  const response = await fetchBolten(
    `${BOLTEN_BASE}/kanban/api/v1/${componentId}/opportunities`,
    {
      method: 'POST',
      headers,
      body: JSON.stringify({
        attributes: {
          Nome: data.name,
          'E-mail': data.email,
          Telefone: data.phone || '',
          Empresa: data.company,
          Serviço: data.service,
          Prioridade: 'Média',
          Observação: buildObservation(data),
        },
      }),
    },
  );
  if (!response.ok) {
    throw new Error(`Oportunidade Bolten (${response.status}): ${await response.text()}`);
  }
  const opportunity = await response.json();
  if (!opportunity?.id) throw new Error('Bolten não retornou o ID da oportunidade');
  return opportunity.id;
}

async function linkBoltenContact(opportunityId, contactId, headers, componentId) {
  const response = await fetchBolten(
    `${BOLTEN_BASE}/kanban/api/v1/${componentId}/opportunities/${opportunityId}/contact`,
    {
      method: 'POST',
      headers,
      body: JSON.stringify({ id: contactId }),
    },
  );
  if (!response.ok) {
    throw new Error(`Vínculo Bolten (${response.status}): ${await response.text()}`);
  }
}

export default async function handler(req, res) {
  const apiKey = process.env.BOLTEN_API_KEY;
  const contactComponentId = process.env.BOLTEN_CONTACT_COMPONENT_ID;
  const kanbanComponentId = process.env.BOLTEN_KANBAN_COMPONENT_ID;

  if (!apiKey || !contactComponentId || !kanbanComponentId) {
    console.error('Bolten: configuração ausente no servidor');
    return jsonResponse(res, 500, { error: 'Bolten não configurado no servidor' });
  }

  const body = parseBody(req.body);

  if (req.method === 'PATCH') {
    if (!(await isAuthenticatedRequest(req).catch(() => false))) {
      return jsonResponse(res, 401, { error: 'Sessão do CRM inválida' });
    }
    const opportunityId = typeof body.opportunityId === 'string' ? body.opportunityId.trim() : '';
    if (!opportunityId) return jsonResponse(res, 400, { error: 'opportunityId é obrigatório' });

    const attributes = {};
    if (typeof body.status === 'string' && body.status.trim()) {
      attributes.Status = mapStatusToBolten(body.status.trim(), {
        new: process.env.BOLTEN_STATUS_NEW,
        inProgress: process.env.BOLTEN_STATUS_IN_PROGRESS,
        done: process.env.BOLTEN_STATUS_DONE,
      });
    }
    if (typeof body.priority === 'string' && body.priority.trim()) {
      attributes.Prioridade = body.priority.trim();
    }
    if (typeof body.notes === 'string') attributes.Observação = body.notes.trim();
    if (Object.keys(attributes).length === 0) {
      return jsonResponse(res, 400, { error: 'Nada para atualizar' });
    }

    try {
      const response = await fetchBolten(
        `${BOLTEN_BASE}/kanban/api/v1/${kanbanComponentId}/opportunities/${encodeURIComponent(opportunityId)}`,
        {
          method: 'PATCH',
          headers: boltenHeaders(apiKey),
          body: JSON.stringify({ attributes }),
        },
      );
      if (!response.ok) {
        console.error('Bolten: falha ao atualizar oportunidade', response.status, await response.text());
        return jsonResponse(res, 502, { error: 'Falha ao atualizar oportunidade no Bolten' });
      }
      const opportunity = await response.json();
      return jsonResponse(res, 200, { ok: true, opportunityId: opportunity.id || opportunityId });
    } catch (error) {
      console.error('Bolten: erro inesperado na atualização', error);
      return jsonResponse(res, 502, { error: 'Não foi possível atualizar o Bolten agora' });
    }
  }

  if (req.method !== 'POST') return jsonResponse(res, 405, { error: 'Método não permitido' });

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Bolten: SUPABASE_SERVICE_ROLE_KEY ausente para registrar o espelho local');
    return jsonResponse(res, 500, { error: 'Espelho Supabase não configurado no servidor' });
  }

  const validation = validateLeadPayload(body);
  if (!validation.ok) {
    return jsonResponse(res, 400, { error: 'Dados do lead inválidos', fields: validation.errors });
  }

  const data = validation.data;
  const localContactId = typeof body.localContactId === 'string' ? body.localContactId.trim() : '';
  if (!isUuid(localContactId)) {
    return jsonResponse(res, 400, { error: 'localContactId válido é obrigatório' });
  }
  const headers = boltenHeaders(apiKey);

  try {
    const localContact = await findLocalContact(localContactId);
    if (!localContact) {
      return jsonResponse(res, 404, { error: 'Lead local não encontrado' });
    }
    if (localContact.email !== data.email || (localContact.phone || '') !== data.phone) {
      return jsonResponse(res, 409, { error: 'O lead local não corresponde aos dados enviados' });
    }

    const contactId = await createBoltenContact(data, headers, contactComponentId);
    const opportunityId = await createBoltenOpportunity(data, headers, kanbanComponentId);
    await linkBoltenContact(opportunityId, contactId, headers, kanbanComponentId);

    const localRecorded = await updateLocalSyncState(localContactId, {
      bolten_contact_id: contactId,
      bolten_opportunity_id: opportunityId,
      bolten_status: 'Pendente',
      bolten_sync_status: 'synced',
      bolten_sync_error: null,
      bolten_last_synced_at: new Date().toISOString(),
    });

    return jsonResponse(res, 201, {
      ok: true,
      contactId,
      opportunityId,
      contactLinked: true,
      localRecorded,
    });
  } catch (error) {
    console.error('Bolten: erro ao sincronizar lead', error);
    await updateLocalSyncState(localContactId, {
      bolten_sync_status: 'error',
      bolten_sync_error: error instanceof Error ? error.message.slice(0, 500) : 'Falha desconhecida',
    }).catch((syncError) => console.error('Bolten: falha ao registrar erro local', syncError));
    return jsonResponse(res, 502, { error: 'Não foi possível sincronizar o lead com o Bolten' });
  }
}
