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

  it('aceita o link oficial do Bolten e não duplica a mensagem existente', () => {
    const link = buildBoltenWhatsAppLink(
      '',
      `https://wa.me/554291534011?text=${encodeURIComponent(BOLTEN_CHAT_TRIGGER_MESSAGE)}`,
    );
    expect(link).toBe(
      `https://wa.me/554291534011?text=${encodeURIComponent(BOLTEN_CHAT_TRIGGER_MESSAGE)}`,
    );
    expect(link?.match(/(?:\?|&)text=/g)).toHaveLength(1);
  });

  it('preenche a mensagem quando o link oficial ainda não tem texto e não cria destino inválido', () => {
    const link = buildBoltenWhatsAppLink('', 'https://wa.me/5511999999999');
    expect(link).not.toBeNull();
    expect(new URL(link!).searchParams.get('text')).toBe(BOLTEN_CHAT_TRIGGER_MESSAGE);
    expect(getBoltenWhatsAppLink()).toBeNull();
  });
});
