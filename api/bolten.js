import { buildObservation, validateLeadPayload, mapStatusToBolten } from './bolten-utils.mjs';

const BOLTEN_BASE = 'https://app.bolten.io';
const DEFAULT_SUPABASE_URL = 'https://ognaofyqubojbokohljr.supabase.co';
const REQUEST_TIMEOUT_MS = 12000;

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

function jsonResponse(res, status, body) {
  return res.status(status).json(body);
}

function boltenHeaders(apiKey) {
  return {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  };
}

async function updateLocalSyncState(localContactId, patch) {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!localContactId || !serviceKey) return false;

  const response = await fetchWithTimeout(
    `${getSupabaseRestUrl()}/contacts?id=eq.${encodeURIComponent(localContactId)}`,
    {
      method: 'PATCH',
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(patch),
    },
  );

  if (!response.ok) {
    console.error('Bolten: não foi possível atualizar o estado local', response.status, await response.text());
    return false;
  }
  return true;
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
  const response = await fetchWithTimeout(
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
  const response = await fetchWithTimeout(
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
  const response = await fetchWithTimeout(
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
      attributes.Status = mapStatusToBolten(body.status.trim());
    }
    if (typeof body.priority === 'string' && body.priority.trim()) {
      attributes.Prioridade = body.priority.trim();
    }
    if (typeof body.notes === 'string') attributes.Observação = body.notes.trim();
    if (Object.keys(attributes).length === 0) {
      return jsonResponse(res, 400, { error: 'Nada para atualizar' });
    }

    try {
      const response = await fetchWithTimeout(
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
  const headers = boltenHeaders(apiKey);

  try {
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
