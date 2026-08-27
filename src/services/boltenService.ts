import { supabase } from './supabaseClient';

export type BoltenLeadData = {
  name: string;
  email: string;
  phone: string;
  company: string;
  service: string;
  has_site: string;
  instagram: string;
  message: string;
};

export type BoltenSyncResult = {
  contactId: string;
  opportunityId: string;
  contactLinked: boolean;
  localRecorded?: boolean;
} | null;

const TIMEOUT_MS = 12000;

async function fetchWithTimeout(url: string, init: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function readError(response: Response): Promise<string> {
  try {
    const body = await response.json() as { error?: string };
    return body.error || `Resposta ${response.status}`;
  } catch {
    return `Resposta ${response.status}`;
  }
}

async function getAuthenticatedHeaders(): Promise<Record<string, string> | null> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) return null;
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

export async function syncLeadToBolten(
  data: BoltenLeadData,
  localContactId?: string,
): Promise<BoltenSyncResult> {
  try {
    const response = await fetchWithTimeout('/api/bolten', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, localContactId }),
    });

    if (!response.ok) {
      console.error('Bolten: falha ao sincronizar lead', await readError(response));
      return null;
    }

    const result = await response.json() as {
      contactId?: string;
      opportunityId?: string;
      contactLinked?: boolean;
      localRecorded?: boolean;
    };
    if (!result.contactId || !result.opportunityId || result.contactLinked !== true) {
      console.error('Bolten: resposta de sincronização incompleta');
      return null;
    }

    return {
      contactId: result.contactId,
      opportunityId: result.opportunityId,
      contactLinked: true,
      localRecorded: result.localRecorded,
    };
  } catch (error) {
    console.error('Bolten: falha de rede ao sincronizar lead', error);
    return null;
  }
}

export async function updateBoltenOpportunity(
  opportunityId: string,
  changes: { status?: string; priority?: string; notes?: string },
): Promise<boolean> {
  if (!opportunityId.trim()) return false;

  try {
    const headers = await getAuthenticatedHeaders();
    if (!headers) {
      console.error('Bolten: sessão do CRM ausente para atualizar oportunidade');
      return false;
    }
    const response = await fetchWithTimeout('/api/bolten', {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ opportunityId, ...changes }),
    });

    if (!response.ok) {
      console.error('Bolten: falha ao atualizar oportunidade', await readError(response));
      return false;
    }
    return true;
  } catch (error) {
    console.error('Bolten: falha de rede ao atualizar lead', error);
    return false;
  }
}
