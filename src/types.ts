// ==================== TYPES ====================

export type ContactStatus =
  | 'Novo'
  | 'Em contato'
  | 'Apresentação'
  | 'Negociação'
  | 'Fechado Ganho'
  | 'Fechado Perdido';

export const ContactStatuses = {
  New: 'Novo',
  InProgress: 'Em contato',
  Presentation: 'Apresentação',
  Negotiation: 'Negociação',
  ClosedWon: 'Fechado Ganho',
  ClosedLost: 'Fechado Perdido',
} as const;

export type Priority = 'Baixa' | 'Média' | 'Alta';

export type View = 'Dashboard' | 'Contatos' | 'WhatsApp' | 'Conversas';

export const Views = {
  Dashboard: 'Dashboard',
  Contacts: 'Contatos',
  WhatsApp: 'WhatsApp',
  Conversations: 'Conversas',
} as const;

export type ConversationStatus = 'Ativo' | 'Aguardando' | 'Encerrada';

export type MessageSender = 'user' | 'agent';

// ==================== INTERFACES ====================

export interface ContactData {
  id: string;
  name: string;
  phone: string;
  email: string;
  company: string;
  service: string;
  message: string;
  has_site: string;
  instagram: string;
  status: ContactStatus;
  priority: Priority;
  notes: string;
  whatsapp_sent: boolean;
  created_at: string;
  bolten_contact_id?: string | null;
  bolten_opportunity_id?: string | null;
  bolten_status?: string | null;
}

export interface KanbanCardData {
  id: string;
  contactName: string;
  phone: string;
  email: string;
  service: string;
  priority: Priority;
  notes: string;
  columnId: string;
}

export interface KanbanColumnData {
  id: string;
  title: string;
  status: ContactStatus;
  cards: KanbanCardData[];
}

export interface ConnectionState {
  instance: {
    instanceName: string;
    state: 'open' | 'close' | 'connecting';
  };
}

export interface QRCodeResponse {
  pairingCode: string | null;
  code: string;
  base64: string;
  count: number;
}

export interface MessageData {
  id: string;
  text: string;
  timestamp: string;
  sender: MessageSender;
  status: 'sent' | 'delivered' | 'read';
}

export interface DashboardMetrics {
  totalLeads: number;
  newToday: number;
  whatsappSent: number;
  conversionRate: number;
}

// ==================== CHAT / CONVERSATIONS ====================

export interface Conversation {
  id: string;
  contact_id: string | null;
  phone: string;
  name: string | null;
  status: ConversationStatus;
  last_message: string | null;
  last_message_at: string | null;
  unread_count: number;
  created_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender: MessageSender;
  text: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
  evolution_id: string | null;
}
