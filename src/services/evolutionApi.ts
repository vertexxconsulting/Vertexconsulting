import type { EvolutionConfig, QRCodeResponse, ConnectionState } from '../types';

const DEFAULT_MESSAGE_TEMPLATE = 'Olá {nome}! Recebemos sua solicitação na Vertex Consulting. Nossa equipe entrará em contato em breve. Obrigado!';

export function getEvolutionConfig(): EvolutionConfig {
  const saved = localStorage.getItem('vertex_evolution_config');
  if (saved) {
    return JSON.parse(saved);
  }
  return {
    apiUrl: '',
    apiKey: '',
    instanceName: 'vertex-consulting',
    messageTemplate: DEFAULT_MESSAGE_TEMPLATE,
  };
}

export function saveEvolutionConfig(config: EvolutionConfig): void {
  localStorage.setItem('vertex_evolution_config', JSON.stringify(config));
}

async function apiCall<T>(
  endpoint: string,
  method: string = 'GET',
  body?: Record<string, unknown>,
): Promise<T> {
  const config = getEvolutionConfig();
  if (!config.apiUrl || !config.apiKey) {
    throw new Error('Evolution API não configurada. Acesse Configurações no CRM.');
  }

  const url = `${config.apiUrl.replace(/\/$/, '')}${endpoint}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'apikey': config.apiKey,
  };

  const response = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Evolution API error: ${response.status} - ${error}`);
  }

  return response.json();
}

export async function createInstance(instanceName: string): Promise<unknown> {
  return apiCall('/instance/create', 'POST', {
    instanceName,
    integration: 'WHATSAPP-BAILEYS',
    qrcode: true,
  });
}

export async function connectInstance(instanceName: string): Promise<QRCodeResponse> {
  return apiCall<QRCodeResponse>(`/instance/connect/${instanceName}`, 'GET');
}

export async function getConnectionState(instanceName: string): Promise<ConnectionState> {
  return apiCall<ConnectionState>(`/instance/connectionState/${instanceName}`, 'GET');
}

export async function sendTextMessage(
  instanceName: string,
  phoneNumber: string,
  text: string,
): Promise<unknown> {
  const cleanNumber = phoneNumber.replace(/\D/g, '');
  const formattedNumber = cleanNumber.startsWith('55') ? cleanNumber : `55${cleanNumber}`;

  return apiCall(`/message/sendText/${instanceName}`, 'POST', {
    number: formattedNumber,
    text,
  });
}

export function buildMessage(template: string, name: string): string {
  return template.replace(/\{nome\}/gi, name);
}

export async function sendLeadNotification(
  name: string,
  phone: string,
): Promise<boolean> {
  const config = getEvolutionConfig();
  if (!config.apiUrl || !config.apiKey || !config.instanceName) {
    console.warn('Evolution API não configurada, WhatsApp não enviado.');
    return false;
  }

  try {
    const message = buildMessage(config.messageTemplate, name);
    await sendTextMessage(config.instanceName, phone, message);
    return true;
  } catch (error) {
    console.error('Erro ao enviar WhatsApp:', error);
    return false;
  }
}
