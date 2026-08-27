import { supabase } from './supabaseClient';
import { syncLeadToBolten, updateBoltenOpportunity, type BoltenLeadData } from './boltenService';
import type { ContactData, ContactStatus, Priority, DashboardMetrics } from '../types';

export type PublicContactData = BoltenLeadData;

type ContactChanges = {
  status?: ContactStatus;
  priority?: Priority;
  notes?: string;
};

function contactToBoltenLead(contact: ContactData): BoltenLeadData {
  return {
    name: contact.name,
    email: contact.email,
    phone: contact.phone,
    company: contact.company,
    service: contact.service,
    has_site: contact.has_site,
    instagram: contact.instagram,
    message: contact.message,
  };
}

async function markBoltenSyncError(id: string, message: string) {
  await supabase
    .from('contacts')
    .update({
      bolten_sync_status: 'error',
      bolten_sync_error: message.slice(0, 500),
    })
    .eq('id', id);
}

export async function createContact(data: PublicContactData): Promise<{
  contact: ContactData;
  boltenSynced: boolean;
}> {
  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();
  const localContact: ContactData = {
    id,
    ...data,
    status: 'Novo',
    priority: 'Média',
    notes: '',
    whatsapp_sent: false,
    created_at: createdAt,
    bolten_sync_status: 'pending',
    bolten_sync_error: null,
    bolten_last_synced_at: null,
  };

  const { error } = await supabase
    .from('contacts')
    .insert([{
      ...data,
      id,
      status: localContact.status,
      priority: localContact.priority,
      notes: localContact.notes,
      whatsapp_sent: localContact.whatsapp_sent,
      created_at: createdAt,
    }]);

  if (error) {
    console.error('Erro ao salvar contato:', error);
    throw error;
  }

  // A sincronização ocorre no endpoint server-side para nunca expor a chave Bolten.
  const bolten = await syncLeadToBolten(data, id);
  if (bolten) {
    localContact.bolten_contact_id = bolten.contactId;
    localContact.bolten_opportunity_id = bolten.opportunityId;
    localContact.bolten_sync_status = 'synced';
    localContact.bolten_last_synced_at = new Date().toISOString();
  }

  return { contact: localContact, boltenSynced: Boolean(bolten?.localRecorded) };
}

export async function retryContactBoltenSync(contact: ContactData): Promise<boolean> {
  const result = await syncLeadToBolten(contactToBoltenLead(contact), contact.id);
  if (!result) {
    await markBoltenSyncError(contact.id, 'Não foi possível sincronizar com o Bolten.');
    return false;
  }
  return Boolean(result?.localRecorded);
}

export async function fetchContacts(): Promise<ContactData[]> {
  const { data, error } = await supabase
    .from('contacts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Erro ao buscar contatos:', error);
    throw error;
  }
  return data || [];
}

export async function updateContact(
  id: string,
  changes: ContactChanges,
): Promise<{ boltenSynced: boolean }> {
  const { data: current, error: readError } = await supabase
    .from('contacts')
    .select('bolten_opportunity_id')
    .eq('id', id)
    .maybeSingle();

  if (readError) throw readError;

  const { error } = await supabase
    .from('contacts')
    .update(changes)
    .eq('id', id);

  if (error) throw error;

  if (!current?.bolten_opportunity_id) return { boltenSynced: false };

  const boltenSynced = await updateBoltenOpportunity(current.bolten_opportunity_id, changes);
  if (boltenSynced) {
    await supabase
      .from('contacts')
      .update({
        bolten_sync_status: 'synced',
        bolten_sync_error: null,
        bolten_last_synced_at: new Date().toISOString(),
      })
      .eq('id', id);
  } else {
    await markBoltenSyncError(id, 'A alteração local foi salva, mas não chegou ao Bolten.');
  }

  return { boltenSynced };
}

export async function updateContactStatus(id: string, status: ContactStatus) {
  return updateContact(id, { status });
}

export async function updateContactPriority(id: string, priority: Priority) {
  return updateContact(id, { priority });
}

export async function updateContactNotes(id: string, notes: string) {
  return updateContact(id, { notes });
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
  const newToday = contacts.filter((c) => c.created_at?.split('T')[0] === today).length;
  const boltenSynced = contacts.filter((c) => c.bolten_sync_status === 'synced').length;
  const closed = contacts.filter((c) => c.status === 'Fechado Ganho').length;
  const conversionRate = totalLeads > 0 ? (closed / totalLeads) * 100 : 0;

  return { totalLeads, newToday, boltenSynced, conversionRate };
}
