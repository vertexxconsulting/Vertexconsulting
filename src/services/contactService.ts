import { supabase } from './supabaseClient';
import { sendLeadNotification } from './evolutionApi';
import type { ContactData, ContactStatus, Priority, DashboardMetrics } from '../types';

export async function createContact(data: {
  name: string;
  email: string;
  phone: string;
  company: string;
  service: string;
  message: string;
}): Promise<{ contact: ContactData | null; whatsappSent: boolean }> {
  const { data: contact, error } = await supabase
    .from('contacts')
    .insert([{
      ...data,
      status: 'Novo',
      priority: 'Média',
      notes: '',
      whatsapp_sent: false,
      created_at: new Date().toISOString(),
    }])
    .select()
    .single();

  if (error) {
    console.error('Erro ao salvar contato:', error);
    throw error;
  }

  let whatsappSent = false;
  if (data.phone) {
    whatsappSent = await sendLeadNotification(data.name, data.phone);
    if (whatsappSent && contact) {
      await supabase
        .from('contacts')
        .update({ whatsapp_sent: true })
        .eq('id', contact.id);
    }
  }

  return { contact, whatsappSent };
}

export async function fetchContacts(): Promise<ContactData[]> {
  const { data, error } = await supabase
    .from('contacts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Erro ao buscar contatos:', error);
    return [];
  }
  return data || [];
}

export async function updateContactStatus(
  id: string,
  status: ContactStatus,
): Promise<void> {
  const { error } = await supabase
    .from('contacts')
    .update({ status })
    .eq('id', id);

  if (error) throw error;
}

export async function updateContactPriority(
  id: string,
  priority: Priority,
): Promise<void> {
  const { error } = await supabase
    .from('contacts')
    .update({ priority })
    .eq('id', id);

  if (error) throw error;
}

export async function updateContactNotes(
  id: string,
  notes: string,
): Promise<void> {
  const { error } = await supabase
    .from('contacts')
    .update({ notes })
    .eq('id', id);

  if (error) throw error;
}

export async function deleteContact(id: string): Promise<void> {
  const { error } = await supabase
    .from('contacts')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const contacts = await fetchContacts();
  const today = new Date().toISOString().split('T')[0];

  const totalLeads = contacts.length;
  const newToday = contacts.filter(
    (c) => c.created_at?.split('T')[0] === today,
  ).length;
  const whatsappSent = contacts.filter((c) => c.whatsapp_sent).length;
  const closed = contacts.filter((c) => c.status === 'Fechado Ganho').length;
  const conversionRate = totalLeads > 0 ? (closed / totalLeads) * 100 : 0;

  return { totalLeads, newToday, whatsappSent, conversionRate };
}
