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
} | null;

const BOLTEN_BASE = 'https://app.bolten.io';

const TIMEOUT_MS = 10000;

async function fetchWithTimeout(url: string, init: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

export function mapStatusToBolten(status: string): string {
  switch (status) {
    case 'Novo': return 'Pendente';
    case 'Em contato':
    case 'Apresentação':
    case 'Negociação': return 'Em andamento';
    case 'Fechado Ganho':
    case 'Fechado Perdido': return 'Finalizado';
    default: return status;
  }
}

function buildObservacao(data: BoltenLeadData): string {
  return [
    data.company && `Empresa: ${data.company}`,
    data.service && `Serviço: ${data.service}`,
    data.has_site && `Já possui site: ${data.has_site}`,
    data.instagram && `Instagram: ${data.instagram}`,
    data.message && `Mensagem: ${data.message}`,
  ]
    .filter(Boolean)
    .join('\n');
}

async function createBoltenContact(
  data: BoltenLeadData,
  headers: Record<string, string>,
  componentId: string,
): Promise<string> {
  const res = await fetchWithTimeout(`${BOLTEN_BASE}/contact/api/v1/${componentId}/contacts`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      attributes: {
        Nome: data.name,
        'E-mail': data.email,
        Telefone: data.phone || '',
      },
    }),
  });

  if (!res.ok) throw new Error(`Contato: ${res.status}`);
  const contact = await res.json();
  return contact.id as string;
}

async function createBoltenOpportunity(
  data: BoltenLeadData,
  headers: Record<string, string>,
  componentId: string,
): Promise<string> {
  const res = await fetchWithTimeout(`${BOLTEN_BASE}/kanban/api/v1/${componentId}/opportunities`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      attributes: {
        Prioridade: 'Média',
        Observação: buildObservacao(data),
      },
    }),
  });

  if (!res.ok) throw new Error(`Oportunidade: ${res.status}`);
  const opportunity = await res.json();
  return opportunity.id as string;
}

async function linkBoltenContact(
  opportunityId: string,
  contactId: string,
  headers: Record<string, string>,
  componentId: string,
): Promise<void> {
  const res = await fetchWithTimeout(
    `${BOLTEN_BASE}/kanban/api/v1/${componentId}/opportunities/${opportunityId}/contact`,
    {
      method: 'POST',
      headers,
      body: JSON.stringify({ id: contactId }),
    },
  );

  if (!res.ok) throw new Error(`Vínculo: ${res.status}`);
}

export async function syncLeadToBolten(data: BoltenLeadData): Promise<BoltenSyncResult> {
  try {
    if (import.meta.env.DEV) {
      const apiKey = import.meta.env.VITE_BOLTEN_API_KEY as string | undefined;
      const contactComponentId = import.meta.env.VITE_BOLTEN_CONTACT_COMPONENT_ID as string | undefined;
      const kanbanComponentId = import.meta.env.VITE_BOLTEN_KANBAN_COMPONENT_ID as string | undefined;

      if (!apiKey || !contactComponentId || !kanbanComponentId) {
        console.error('Bolten: variáveis VITE_BOLTEN_* ausentes no .env (dev)');
        return null;
      }

      const headers = {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      };

      const contactId = await createBoltenContact(data, headers, contactComponentId);
      const opportunityId = await createBoltenOpportunity(data, headers, kanbanComponentId);
      await linkBoltenContact(opportunityId, contactId, headers, kanbanComponentId);
      return { contactId, opportunityId, contactLinked: true };
    }

    const res = await fetchWithTimeout('/api/bolten', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      console.error('Bolten: resposta inesperada', res.status);
      return null;
    }
    const result = await res.json();
    return {
      contactId: result.contactId as string,
      opportunityId: result.opportunityId as string,
      contactLinked: result.contactLinked as boolean,
    };
  } catch (err) {
    console.error('Bolten: falha ao sincronizar lead', err);
    return null;
  }
}

export async function updateBoltenOpportunity(
  opportunityId: string,
  changes: { status?: string; priority?: string; notes?: string },
): Promise<boolean> {
  try {
    const body = JSON.stringify({ opportunityId, ...changes });

    if (import.meta.env.DEV) {
      const apiKey = import.meta.env.VITE_BOLTEN_API_KEY as string | undefined;
      const kanbanComponentId = import.meta.env.VITE_BOLTEN_KANBAN_COMPONENT_ID as string | undefined;

      if (!apiKey || !kanbanComponentId) {
        console.error('Bolten: variáveis VITE_BOLTEN_* ausentes no .env (dev)');
        return false;
      }

      const attributes: Record<string, string> = {};
      if (changes.status) attributes.Status = mapStatusToBolten(changes.status);
      if (changes.priority) attributes.Prioridade = changes.priority;
      if (typeof changes.notes === 'string') attributes.Observação = changes.notes;

      const res = await fetchWithTimeout(
        `${BOLTEN_BASE}/kanban/api/v1/${kanbanComponentId}/opportunities/${opportunityId}`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ attributes }),
        },
      );

      if (!res.ok) {
        console.error('Bolten: resposta inesperada', res.status);
        return false;
      }
      return true;
    }

    const res = await fetchWithTimeout('/api/bolten', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body,
    });

    if (!res.ok) {
      console.error('Bolten: resposta inesperada', res.status);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Bolten: falha ao atualizar lead', err);
    return false;
  }
}
export const BOLTEN_WHATSAPP = '5542900000000';
export const getBoltenWhatsAppLink = (message: string = 'Olá, gostaria de saber mais sobre as soluções.') => {
  return `https://wa.me/${BOLTEN_WHATSAPP}?text=${encodeURIComponent(message)}`;
};
