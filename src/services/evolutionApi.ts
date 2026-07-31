import type { QRCodeResponse, ConnectionState } from '../types';

const DEFAULT_MESSAGE_TEMPLATE = 'Olá {nome}! Recebemos sua solicitação na Vertex Consulting. Nossa equipe entrará em contato em breve. Obrigado!';

// Variáveis injetadas via Vercel (Environment Variables)
// Defina no Vercel: Dashboard > Project > Settings > Environment Variables
const ENV_API_URL = import.meta.env.VITE_EVOLUTION_API_URL || 'https://vertexcrm.onrender.com';
const ENV_API_KEY = import.meta.env.VITE_EVOLUTION_API_KEY || '';
const ENV_INSTANCE_NAME = import.meta.env.VITE_EVOLUTION_INSTANCE || 'vertex-crm';
const ENV_MESSAGE_TEMPLATE = import.meta.env.VITE_EVOLUTION_MSG_TEMPLATE || DEFAULT_MESSAGE_TEMPLATE;

if (!ENV_API_URL || !ENV_API_KEY) {
  console.warn(
    'Evolution API não configurada. Defina VITE_EVOLUTION_API_URL e VITE_EVOLUTION_API_KEY no Vercel.'
  );
}

export function getEvolutionConfig() {
  return {
    apiUrl: ENV_API_URL,
    apiKey: ENV_API_KEY,
    instanceName: ENV_INSTANCE_NAME,
    messageTemplate: ENV_MESSAGE_TEMPLATE,
  };
}

async function apiCall<T>(
  endpoint: string,
  method: string = 'GET',
  body?: Record<string, unknown>,
): Promise<T> {
  const config = getEvolutionConfig();
  if (!config.apiUrl || !config.apiKey) {
    throw new Error('Evolution API não configurada. Defina as variáveis no Vercel.');
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

export async function disconnectInstance(instanceName: string): Promise<unknown> {
  return apiCall(`/instance/disconnect/${instanceName}`, 'DELETE');
}

export async function deleteInstance(instanceName: string): Promise<unknown> {
  return apiCall(`/instance/delete/${instanceName}`, 'DELETE');
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

  // Template editável salvo no CRM (localStorage), fallback pra env var
  const template = typeof window !== 'undefined'
    ? (localStorage.getItem('vertex_msg_template') || ENV_MESSAGE_TEMPLATE)
    : ENV_MESSAGE_TEMPLATE;

  try {
    const message = buildMessage(template, name);
    await sendTextMessage(config.instanceName, phone, message);
    return true;
  } catch (error) {
    console.error('Erro ao enviar WhatsApp:', error);
    return false;
  }
}
