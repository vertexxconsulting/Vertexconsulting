const REQUIRED_LEAD_FIELDS = ['name', 'email', 'phone', 'company', 'service', 'has_site', 'instagram', 'message'];

function asTrimmedString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function firstString(...values) {
  for (const value of values) {
    const result = asTrimmedString(value);
    if (result) return result;
  }
  return '';
}

export function validateLeadPayload(input) {
  const source = input && typeof input === 'object' ? input : {};
  const data = Object.fromEntries(
    REQUIRED_LEAD_FIELDS.map((field) => [field, asTrimmedString(source[field])]),
  );
  const errors = [];

  const maxLengths = {
    name: 160,
    email: 320,
    phone: 32,
    company: 160,
    service: 80,
    has_site: 20,
    instagram: 120,
    message: 4000,
  };

  for (const field of REQUIRED_LEAD_FIELDS) {
    if (!data[field]) errors.push(`${field} é obrigatório`);
    if (data[field].length > maxLengths[field]) errors.push(`${field} excede o limite permitido`);
  }
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('email inválido');
  }

  return { ok: errors.length === 0, data, errors };
}

export function buildObservation(data) {
  return [
    data.company && `Empresa: ${asTrimmedString(data.company)}`,
    data.service && `Serviço: ${asTrimmedString(data.service)}`,
    data.has_site && `Já possui site: ${asTrimmedString(data.has_site)}`,
    data.instagram && `Instagram: ${asTrimmedString(data.instagram)}`,
    data.message && `Mensagem: ${asTrimmedString(data.message)}`,
  ]
    .filter(Boolean)
    .join('\n');
}

export function mapStatusToBolten(status, stages = {}) {
  switch (asTrimmedString(status)) {
    case 'Novo': return stages.new || 'To do';
    case 'Em contato':
    case 'Apresentação':
    case 'Negociação': return stages.inProgress || 'Doing';
    case 'Fechado Ganho':
    case 'Fechado Perdido': return stages.done || 'Done';
    default: return asTrimmedString(status);
  }
}

function normalizedStatus(value) {
  return asTrimmedString(value).toLocaleLowerCase('pt-BR');
}

export function mapStatusFromBolten(rawStatus, eventType = '') {
  if (eventType === 'opportunity.won') return 'Fechado Ganho';
  if (eventType === 'opportunity.lost') return 'Fechado Perdido';

  const status = normalizedStatus(rawStatus);
  if (['pendente', 'novo', 'new', 'todo', 'to do', 'backlog'].includes(status)) {
    return 'Novo';
  }
  if (['doing', 'em andamento', 'em contato', 'apresentação', 'apresentacao', 'negociação', 'negociacao', 'in progress'].includes(status)) {
    return 'Em contato';
  }
  if (['lost', 'fechado perdido', 'perdido', 'closed lost'].includes(status)) {
    return 'Fechado Perdido';
  }
  if (['done', 'finalizado', 'fechado ganho', 'ganho', 'won', 'closed won'].includes(status)) {
    // A transição genérica para Done não informa se foi ganho ou perdido.
    // Somente eventos explícitos opportunity.won/lost fecham o lead.
    return eventType === 'opportunity.transitioned' || eventType === 'opportunity.created'
      ? null
      : 'Fechado Ganho';
  }
  return asTrimmedString(rawStatus) || 'Novo';
}

export function extractWebhookLead(payload) {
  const opportunity = payload?.data?.opportunity ?? {};
  const opportunityAttributes = opportunity.attributes && typeof opportunity.attributes === 'object'
    ? opportunity.attributes
    : opportunity;
  const rawContact = opportunity.Contato || opportunity.Contact || opportunity.contact || {};
  const contact = rawContact && typeof rawContact === 'object' ? rawContact : {};
  const contactAttributes = contact.attributes && typeof contact.attributes === 'object'
    ? contact.attributes
    : contact;
  const eventType = firstString(payload?.type, payload?.event);
  const rawStatus = firstString(
    opportunityAttributes.Status,
    opportunityAttributes.status,
    payload?.data?.to_state,
    payload?.data?.toState,
  );

  return {
    eventId: firstString(payload?.id, payload?.event_id, payload?.eventId, payload?.data?.id),
    eventType,
    opportunityId: firstString(opportunity.id, opportunityAttributes.id),
    contactId: firstString(contact.id, opportunity.contact_id, opportunity.contactId),
    email: firstString(opportunityAttributes['E-mail'], opportunityAttributes.Email, opportunityAttributes.email, contactAttributes['E-mail'], contactAttributes.Email, contactAttributes.email),
    name: firstString(opportunityAttributes.Nome, opportunityAttributes.Name, opportunityAttributes.name, contactAttributes.Nome, contactAttributes.Name, contactAttributes.name) || 'Lead',
    phone: firstString(opportunityAttributes.Telefone, opportunityAttributes.Phone, opportunityAttributes.phone, contactAttributes.Telefone, contactAttributes.Phone, contactAttributes.phone),
    company: firstString(opportunityAttributes.Empresa, opportunityAttributes.Company, opportunityAttributes.company, contactAttributes.Empresa, contactAttributes.Company, contactAttributes.company),
    service: firstString(opportunityAttributes.Serviço, opportunityAttributes.Servico, opportunityAttributes.Service, contactAttributes.Serviço, contactAttributes.Servico, contactAttributes.Service),
    priority: firstString(opportunityAttributes.Prioridade, opportunityAttributes.Priority, opportunityAttributes.priority) || 'Média',
    notes: firstString(opportunityAttributes.Observação, opportunityAttributes.Observacao, opportunityAttributes.Observation, opportunityAttributes.notes),
    status: mapStatusFromBolten(rawStatus, eventType),
    rawStatus,
    createdAt: firstString(opportunity.created_at, opportunity.createdAt, payload?.created_at, payload?.createdAt),
  };
}
