const BOLTEN_BASE = 'https://app.bolten.io';

function mapStatusToBolten(status) {
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

export default async function handler(req, res) {
  const apiKey = process.env.BOLTEN_API_KEY;
  const contactComponentId = process.env.BOLTEN_CONTACT_COMPONENT_ID;
  const kanbanComponentId = process.env.BOLTEN_KANBAN_COMPONENT_ID;

  if (!apiKey || !contactComponentId || !kanbanComponentId) {
    console.error('Bolten: configuração ausente no servidor');
    return res.status(500).json({ error: 'Bolten não configurado no servidor' });
  }

  const headers = {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  };

  if (req.method === 'PATCH') {
    const { opportunityId, status, priority, notes } = req.body ?? {};

    if (!opportunityId) {
      return res.status(400).json({ error: 'opportunityId é obrigatório' });
    }

    const attributes = {};
    if (status) attributes.Status = mapStatusToBolten(status);
    if (priority) attributes.Prioridade = priority;
    if (typeof notes === 'string') attributes.Observação = notes;

    if (Object.keys(attributes).length === 0) {
      return res.status(400).json({ error: 'Nada para atualizar' });
    }

    try {
      const boltenRes = await fetch(
        `${BOLTEN_BASE}/kanban/api/v1/${kanbanComponentId}/opportunities/${opportunityId}`,
        {
          method: 'PATCH',
          headers,
          body: JSON.stringify({ attributes }),
        },
      );

      if (!boltenRes.ok) {
        const detail = await boltenRes.text();
        console.error('Bolten: falha ao atualizar oportunidade', boltenRes.status, detail);
        return res.status(502).json({ error: 'Falha ao atualizar oportunidade no Bolten' });
      }

      const opportunity = await boltenRes.json();
      return res.status(200).json({ ok: true, opportunityId: opportunity.id });
    } catch (err) {
      console.error('Bolten: erro inesperado', err);
      return res.status(500).json({ error: 'Erro interno ao sincronizar com o Bolten' });
    }
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { name, email, phone, company, service, has_site, instagram, message } = req.body ?? {};

  if (!name || !email) {
    return res.status(400).json({ error: 'name e email são obrigatórios' });
  }

  const observacao = [
    company && `Empresa: ${company}`,
    service && `Serviço: ${service}`,
    has_site && `Já possui site: ${has_site}`,
    instagram && `Instagram: ${instagram}`,
    message && `Mensagem: ${message}`,
  ]
    .filter(Boolean)
    .join('\n');

  try {
    const contactRes = await fetch(`${BOLTEN_BASE}/contact/api/v1/${contactComponentId}/contacts`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        attributes: {
          Nome: name,
          'E-mail': email,
          Telefone: phone || '',
        },
      }),
    });

    if (!contactRes.ok) {
      const detail = await contactRes.text();
      console.error('Bolten: falha ao criar contato', contactRes.status, detail);
      return res.status(502).json({ error: 'Falha ao criar contato no Bolten' });
    }
    const contact = await contactRes.json();

    const oppRes = await fetch(`${BOLTEN_BASE}/kanban/api/v1/${kanbanComponentId}/opportunities`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        attributes: {
          Prioridade: 'Média',
          Observação: observacao,
        },
      }),
    });

    if (!oppRes.ok) {
      const detail = await oppRes.text();
      console.error('Bolten: falha ao criar oportunidade', oppRes.status, detail);
      return res.status(502).json({ error: 'Falha ao criar oportunidade no Bolten' });
    }
    const opportunity = await oppRes.json();

    const linkRes = await fetch(
      `${BOLTEN_BASE}/kanban/api/v1/${kanbanComponentId}/opportunities/${opportunity.id}/contact`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify({ id: contact.id }),
      },
    );

    if (!linkRes.ok) {
      const detail = await linkRes.text();
      console.error('Bolten: falha ao vincular contato à oportunidade', linkRes.status, detail);
    }

    return res.status(201).json({
      ok: true,
      contactId: contact.id,
      opportunityId: opportunity.id,
      contactLinked: linkRes.ok,
    });
  } catch (err) {
    console.error('Bolten: erro inesperado', err);
    return res.status(500).json({ error: 'Erro interno ao sincronizar com o Bolten' });
  }
}