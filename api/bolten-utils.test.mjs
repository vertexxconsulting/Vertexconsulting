import { describe, expect, it } from 'vitest';
import {
  buildObservation,
  extractWebhookLead,
  mapStatusToBolten,
  mapStatusFromBolten,
  validateLeadPayload,
} from './bolten-utils.mjs';

const validLead = {
  name: '  Ana Souza  ',
  email: '  ana@empresa.com ',
  phone: '(42) 99999-1234',
  company: '  Empresa Local ',
  service: 'estrategia',
  has_site: 'Não',
  instagram: '@empresa',
  message: 'Precisamos organizar a geração de oportunidades.',
};

describe('validateLeadPayload', () => {
  it('normalizes valid public form data without losing the phone mask', () => {
    const result = validateLeadPayload(validLead);

    expect(result).toEqual({
      ok: true,
      data: {
        name: 'Ana Souza',
        email: 'ana@empresa.com',
        phone: '(42) 99999-1234',
        company: 'Empresa Local',
        service: 'estrategia',
        has_site: 'Não',
        instagram: '@empresa',
        message: 'Precisamos organizar a geração de oportunidades.',
      },
      errors: [],
    });
  });

  it('rejects blank required fields and malformed email', () => {
    const result = validateLeadPayload({ ...validLead, name: ' ', email: 'not-an-email' });

    expect(result.ok).toBe(false);
    expect(result.errors).toEqual(expect.arrayContaining([
      'name é obrigatório',
      'email inválido',
    ]));
  });
});

describe('Bolten field mapping', () => {
  it('maps external stages and terminal webhook events to local CRM statuses', () => {
    expect(mapStatusFromBolten('Pendente', 'opportunity.transitioned')).toBe('Novo');
    expect(mapStatusFromBolten('Doing', 'opportunity.transitioned')).toBe('Em contato');
    expect(mapStatusFromBolten('Done', 'opportunity.won')).toBe('Fechado Ganho');
    expect(mapStatusFromBolten('Done', 'opportunity.lost')).toBe('Fechado Perdido');
    expect(mapStatusFromBolten('Done', 'opportunity.transitioned')).toBeNull();
    expect(mapStatusToBolten('Novo')).toBe('To do');
    expect(mapStatusToBolten('Em contato')).toBe('Doing');
    expect(mapStatusToBolten('Fechado Ganho')).toBe('Done');
  });

  it('builds a readable observation while ignoring empty values', () => {
    expect(buildObservation({ ...validLead, instagram: '', message: '' })).toBe(
      'Empresa: Empresa Local\nServiço: estrategia\nJá possui site: Não',
    );
  });
});

describe('extractWebhookLead', () => {
  it('accepts the documented Bolten payload shape', () => {
    const result = extractWebhookLead({
      id: 'event-1',
      type: 'opportunity.transitioned',
      data: {
        opportunity: {
          id: 'opp-1',
          'E-mail': 'ana@empresa.com',
          Status: 'Doing',
          Contato: {
            Nome: 'Ana Souza',
            Telefone: '5542999991234',
          },
        },
      },
    });

    expect(result).toMatchObject({
      eventId: 'event-1',
      opportunityId: 'opp-1',
      email: 'ana@empresa.com',
      name: 'Ana Souza',
      phone: '5542999991234',
      status: 'Em contato',
    });
  });

  it('accepts the English Contact payload shape', () => {
    const result = extractWebhookLead({
      event_id: 'event-2',
      event: 'opportunity.transitioned',
      data: {
        opportunity: {
          id: 'opp-2',
          attributes: {
            Name: 'John Smith',
            Email: 'john@example.com',
            Status: 'Doing',
          },
          Contact: {
            attributes: {
              Name: 'John Smith',
              Phone: '+15551234567',
            },
          },
        },
      },
    });

    expect(result).toMatchObject({
      eventId: 'event-2',
      opportunityId: 'opp-2',
      email: 'john@example.com',
      name: 'John Smith',
      phone: '+15551234567',
      status: 'Em contato',
    });
  });
});
