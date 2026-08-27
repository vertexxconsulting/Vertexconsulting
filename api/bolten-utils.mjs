const REQUIRED_LEAD_FIELDS = ['name', 'email', 'phone', 'company', 'service', 'has_site', 'instagram', 'message'];

function asTrimmedString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

export function validateLeadPayload(input) {
  const source = input && typeof input === 'object' ? input : {};
  const data = Object.fromEntries(
    REQUIRED_LEAD_FIELDS.map((field) => [field, asTrimmedString(source[field])]),
  );
  const errors = [];

  for (const field of REQUIRED_LEAD_FIELDS) {
    if (!data[field]) errors.push(`${field} é obrigatório`);
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

export function mapStatusToBolten(status) {
  switch (asTrimmedString(status)) {
    case 'Novo': return 'Pendente';
    case 'Em contato':
    case 'Apresentação':
    case 'Negociação': return 'Em andamento';
    case 'Fechado Ganho':
    case 'Fechado Perdido': return 'Finalizado';
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
  if (['done', 'finalizado', 'fechado ganho', 'ganho', 'won', 'closed won'].includes(status)) {
    return 'Fechado Ganho';
  }
  if (['lost', 'fechado perdido', 'perdido', 'won lost', 'closed lost'].includes(status)) {
    return 'Fechado Perdido';
  }
  return asTrimmedString(rawStatus) || 'Novo';
}

export function extractWebhookLead(payload) {
  const opportunity = payload?.data?.opportunity ?? {};
  const contact = opportunity.Contato && typeof opportunity.Contato === 'object'
    ? opportunity.Contato
    : {};
  const eventType = asTrimmedString(payload?.type);
  const rawStatus = asTrimmedString(opportunity.Status || payload?.data?.to_state);

  return {
    eventId: asTrimmedString(payload?.id),
    eventType,
    opportunityId: asTrimmedString(opportunity.id),
    contactId: asTrimmedString(contact.id || opportunity.contact_id),
    email: asTrimmedString(opportunity['E-mail'] || contact['E-mail']),
    name: asTrimmedString(opportunity.Nome || opportunity.Name || contact.Nome) || 'Lead',
    phone: asTrimmedString(opportunity.Telefone || contact.Telefone),
    company: asTrimmedString(opportunity.Empresa || contact.Empresa),
    service: asTrimmedString(opportunity.Serviço || opportunity.Servico || contact.Serviço || contact.Servico),
    priority: asTrimmedString(opportunity.Prioridade) || 'Média',
    notes: asTrimmedString(opportunity.Observação || opportunity.Observacao),
    status: mapStatusFromBolten(rawStatus, eventType),
    rawStatus,
    createdAt: asTrimmedString(opportunity.created_at || payload?.created_at),
  };
}
