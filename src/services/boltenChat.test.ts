import { describe, expect, it } from 'vitest';
import { BOLTEN_CHAT_TRIGGER_MESSAGE, buildBoltenWhatsAppLink, getBoltenWhatsAppLink } from './boltenChat';

describe('gatilho de chatbot do Bolten', () => {
  it('mantém a mensagem exata solicitada', () => {
    expect(BOLTEN_CHAT_TRIGGER_MESSAGE).toBe(
      'Olá! Vim pelo site da Vertex e gostaria de entender como a consultoria pode ajudar o meu negócio.',
    );
  });

  it('monta um link de WhatsApp com a mensagem codificada', () => {
    const link = buildBoltenWhatsAppLink('(11) 99999-9999');
    expect(link).toContain('https://wa.me/5511999999999?text=');
    expect(link).toContain(encodeURIComponent(BOLTEN_CHAT_TRIGGER_MESSAGE));
  });

  it('aceita o link oficial do Bolten e não cria link inválido sem destino', () => {
    expect(buildBoltenWhatsAppLink('', 'https://wa.me/5511999999999')).toContain(
      encodeURIComponent(BOLTEN_CHAT_TRIGGER_MESSAGE),
    );
    expect(getBoltenWhatsAppLink()).toBeNull();
  });
});
