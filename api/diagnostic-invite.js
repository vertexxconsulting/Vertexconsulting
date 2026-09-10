const DELAYED_MESSAGE = `Recebemos seu contexto e preparamos uma leitura mais precisa do seu negócio.\n\nAgora responda o diagnóstico com base na realidade de hoje — não no que você gostaria que estivesse acontecendo. No final, você verá a prioridade que mais pode destravar o próximo nível da sua empresa.\n\nAcesse aqui: {link}`;

function required(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Variável ausente: ${name}`);
  return value;
}

async function supabaseRequest(path, options = {}) {
  const url = required('SUPABASE_URL');
  const key = required('SUPABASE_SERVICE_ROLE_KEY');
  const response = await fetch(`${url}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  if (!response.ok) throw new Error(`Supabase ${response.status}: ${await response.text()}`);
  return response.status === 204 ? null : response.json();
}

async function sendEvolution(phone, text) {
  const apiUrl = required('VITE_EVOLUTION_API_URL').replace(/\/$/, '');
  const apiKey = required('VITE_EVOLUTION_API_KEY');
  const instance = required('VITE_EVOLUTION_INSTANCE');
  const formatted = phone.replace(/\D/g, '').startsWith('55') ? phone.replace(/\D/g, '') : `55${phone.replace(/\D/g, '')}`;
  const response = await fetch(`${apiUrl}/message/sendText/${instance}`, {
    method: 'POST',
    headers: { apikey: apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({ number: formatted, text }),
  });
  if (!response.ok) throw new Error(`Evolution ${response.status}: ${await response.text()}`);
}

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });
  if (process.env.CRON_SECRET && req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) return res.status(401).json({ error: 'Não autorizado' });

  try {
    const now = new Date().toISOString();
    const contacts = await supabaseRequest(`contacts?diagnostic_invite_sent=eq.false&diagnostic_invite_at=lte.${encodeURIComponent(now)}&phone=not.is.null&select=id,name,phone,diagnostic_token&order=diagnostic_invite_at.asc&limit=20`);
    const baseUrl = process.env.PUBLIC_SITE_URL || `https://${process.env.VERCEL_URL}`;
    let sent = 0;
    let failed = 0;

    for (const contact of contacts || []) {
      if (!contact.diagnostic_token || !contact.phone) continue;
      const link = `${baseUrl}/diagnostico?token=${contact.diagnostic_token}`;
      const message = DELAYED_MESSAGE.replace('{link}', link);
      try {
        await sendEvolution(contact.phone, message);
        await supabaseRequest(`contacts?id=eq.${contact.id}`, {
          method: 'PATCH',
          headers: { Prefer: 'return=minimal' },
          body: JSON.stringify({ diagnostic_invite_sent: true, diagnostic_invite_sent_at: new Date().toISOString() }),
        });
        sent += 1;
      } catch (error) {
        failed += 1;
        console.error('Falha ao enviar convite do diagnóstico', contact.id, error);
      }
    }

    return res.status(200).json({ ok: true, scanned: contacts?.length || 0, sent, failed });
  } catch (error) {
    console.error('Worker de convite do diagnóstico falhou', error);
    return res.status(500).json({ error: 'Falha ao processar convites' });
  }
}
