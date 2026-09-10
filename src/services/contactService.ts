import { supabase } from './supabaseClient';
import { syncLeadToBolten, updateBoltenOpportunity } from './boltenService';
import type { ContactData, ContactStatus, Priority, DashboardMetrics } from '../types';

export async function createContact(data: {
  name: string;
  email: string;
  phone: string;
  company: string;
  service: string;
  message: string;
  has_site: string;
  instagram: string;
}): Promise<{ contact: ContactData | null; whatsappSent: boolean }> {
  // Gera o ID no cliente: evita o SELECT pós-insert (que o RLS bloqueia p/ anon)
  const id = crypto.randomUUID();
  const diagnosticToken = crypto.randomUUID();
  const diagnosticInviteAt = new Date(Date.now() + 20 * 60 * 1000).toISOString();

  const { error } = await supabase
    .from('contacts')
    .insert([{
      id,
      ...data,
      status: 'Novo',
      priority: 'Média',
      notes: '',
      whatsapp_sent: false,
      diagnostic_token: diagnosticToken,
      diagnostic_invite_at: diagnosticInviteAt,
      diagnostic_invite_sent: false,
      diagnostic_completed_at: null,
      created_at: new Date().toISOString(),
    }]);

  if (error) {
    console.error('Erro ao salvar contato:', error);
    throw error;
  }

  // Cria contato + oportunidade no Bolten e grava os IDs no registro
  const bolten = await syncLeadToBolten(data);
  if (bolten) {
    await supabase
      .from('contacts')
      .update({
        bolten_contact_id: bolten.contactId,
        bolten_opportunity_id: bolten.opportunityId,
      })
      .eq('id', id);
  }

  const contact: ContactData | null = {
    id,
    ...data,
    status: 'Novo',
    priority: 'Média',
    notes: '',
    whatsapp_sent: false,
    diagnostic_token: diagnosticToken,
    diagnostic_invite_at: diagnosticInviteAt,
    diagnostic_invite_sent: false,
    diagnostic_completed_at: null,
    created_at: new Date().toISOString(),
  };

  return { contact, whatsappSent: false };
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

  // Espelha a alteração no funil do Bolten
  const { data } = await supabase
    .from('contacts')
    .select('bolten_opportunity_id')
    .eq('id', id)
    .maybeSingle();

  if (data?.bolten_opportunity_id) {
    void updateBoltenOpportunity(data.bolten_opportunity_id, { status });
  }
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

  // Espelha a alteração no funil do Bolten
  const { data } = await supabase
    .from('contacts')
    .select('bolten_opportunity_id')
    .eq('id', id)
    .maybeSingle();

  if (data?.bolten_opportunity_id) {
    void updateBoltenOpportunity(data.bolten_opportunity_id, { priority });
  }
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

  // Espelha a alteração na Observação do Bolten
  const { data } = await supabase
    .from('contacts')
    .select('bolten_opportunity_id')
    .eq('id', id)
    .maybeSingle();

  if (data?.bolten_opportunity_id) {
    void updateBoltenOpportunity(data.bolten_opportunity_id, { notes });
  }
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
