const SUPABASE_REST = (process.env.SUPABASE_URL || 'https://nzxxrnmaschelfggtzfv.supabase.co').replace(/\/$/, '') + '/rest/v1';

function mapStatusFromBolten(rawStatus, eventType) {
  if (eventType === 'opportunity.won') return 'Fechado Ganho';
  if (eventType === 'opportunity.lost') return 'Fechado Perdido';
  switch (rawStatus) {
    case 'Pendente': return 'Novo';
    case 'Em andamento': return 'Em contato';
    case 'Finalizado': return 'Fechado Ganho';
    default: return rawStatus || 'Novo';
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const secret = process.env.BOLTEN_WEBHOOK_SECRET;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!secret || !serviceKey) {
    console.error('Bolten webhook: configuração ausente no servidor');
    return res.status(500).json({ error: 'Webhook não configurado no servidor' });
  }

  if (req.headers['x-api-key'] !== secret) {
    return res.status(401).json({ error: 'Chave inválida' });
  }

  const payload = req.body ?? {};
  const type = payload.type || '';
  if (!type.startsWith('opportunity.')) {
    return res.status(200).json({ ok: true, ignored: true });
  }

  const opportunity = payload.data?.opportunity ?? {};
  const contactAttrs = opportunity.Contato ?? {};

  const email = String(contactAttrs['E-mail'] || opportunity['E-mail'] || '').trim();
  const name = String(contactAttrs.Nome || opportunity.Name || 'Lead').trim();
  const phone = String(contactAttrs.Telefone || '').trim();
  const priority = String(opportunity.Prioridade || 'Média').trim();
  const notes = String(opportunity.Observação || '').trim();
  const status = mapStatusFromBolten(String(opportunity.Status || ''), type);
  const opportunityId = String(opportunity.id || '');
  const contactId = String(opportunity.Contato?.id || '');

  const headers = {
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
    'Content-Type': 'application/json',
  };

  const row = {
    bolten_contact_id: contactId || null,
    bolten_opportunity_id: opportunityId || null,
    bolten_status: String(opportunity.Status || ''),
    name,
    email,
    phone,
    status,
    priority,
    notes,
  };

  try {
    if (opportunityId) {
      const updated = await fetch(
        `${SUPABASE_REST}/contacts?bolten_opportunity_id=eq.${opportunityId}`,
        {
          method: 'PATCH',
          headers: { ...headers, Prefer: 'return=representation' },
          body: JSON.stringify(row),
        },
      );

      if (updated.ok && (await updated.json()).length > 0) {
        return res.status(200).json({ ok: true, action: 'updated' });
      }
    }

    if (email) {
      const found = await fetch(
        `${SUPABASE_REST}/contacts?email=ilike.${encodeURIComponent(email)}&select=id`,
        { method: 'GET', headers },
      );
      const matches = found.ok ? await found.json() : [];
      if (matches.length > 0) {
        const local = matches[0];
        const synced = await fetch(`${SUPABASE_REST}/contacts?id=eq.${local.id}`, {
          method: 'PATCH',
          headers: { ...headers, Prefer: 'return=representation' },
          body: JSON.stringify(row),
        });
        if (synced.ok && (await synced.json()).length > 0) {
          return res.status(200).json({ ok: true, action: 'matched_by_email' });
        }
      }
    }

    const created = await fetch(`${SUPABASE_REST}/contacts`, {
      method: 'POST',
      headers: { ...headers, Prefer: 'return=representation' },
      body: JSON.stringify({
        ...row,
        company: '',
        service: opportunity.Service || '',
        has_site: '',
        instagram: '',
        message: '',
        whatsapp_sent: false,
        created_at: opportunity.created_at || new Date().toISOString(),
      }),
    });

    if (created.ok) {
      return res.status(200).json({ ok: true, action: 'created' });
    }

    const detail = await created.text();
    console.error('Bolten webhook: falha ao criar contato no Supabase', created.status, detail);
    return res.status(502).json({ error: 'Falha ao salvar no Supabase' });
  } catch (err) {
    console.error('Bolten webhook: erro inesperado', err);
    return res.status(200).json({ ok: false });
  }
}