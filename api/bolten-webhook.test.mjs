import { afterEach, describe, expect, it, vi } from 'vitest';
import handler from './bolten-webhook.js';

function response(body, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
    text: async () => JSON.stringify(body),
  };
}

function mockResponse() {
  return {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
  };
}

function webhookRequest(payload, apiKey = 'secret') {
  return {
    method: 'POST',
    headers: { 'x-api-key': apiKey },
    body: payload,
  };
}

const basePayload = {
  id: 'event-1',
  type: 'opportunity.transitioned',
  data: {
    opportunity: {
      id: 'opp-1',
      Status: 'Doing',
      'E-mail': 'ana@empresa.com',
      Nome: 'Ana Souza',
      Telefone: '5542999991234',
    },
  },
};

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe('api/bolten-webhook', () => {
  it('rejects an invalid webhook secret before touching Supabase', async () => {
    vi.stubEnv('BOLTEN_WEBHOOK_SECRET', 'secret');
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'service-key');
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const res = mockResponse();

    await handler(webhookRequest(basePayload, 'wrong'), res);

    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual({ error: 'Chave inválida' });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('returns 409 while an identical event is actively leased so Bolten can retry', async () => {
    vi.stubEnv('BOLTEN_WEBHOOK_SECRET', 'secret');
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'service-key');
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(response([{
        event_id: 'event-1',
        processed_at: null,
        processing_started_at: new Date().toISOString(),
      }]))
      .mockResolvedValueOnce(response([]));
    vi.stubGlobal('fetch', fetchMock);
    const res = mockResponse();

    await handler(webhookRequest(basePayload), res);

    expect(res.statusCode).toBe(409);
    expect(res.body).toEqual({ error: 'Evento já está sendo processado' });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('acknowledges an already processed event without duplicating the local write', async () => {
    vi.stubEnv('BOLTEN_WEBHOOK_SECRET', 'secret');
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'service-key');
    const fetchMock = vi.fn().mockResolvedValue(
      response([{ event_id: 'event-1', processed_at: new Date().toISOString() }]),
    );
    vi.stubGlobal('fetch', fetchMock);
    const res = mockResponse();

    await handler(webhookRequest(basePayload), res);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ ok: true, duplicate: true });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
