export const BOLTEN_CHAT_TRIGGER_MESSAGE = 'Olá! Vim pelo site da Vertex e gostaria de entender como a consultoria pode ajudar o meu negócio.';

const BOLTEN_WHATSAPP_NUMBER = import.meta.env.VITE_BOLTEN_WHATSAPP_NUMBER || '';
const BOLTEN_WHATSAPP_LINK = import.meta.env.VITE_BOLTEN_WHATSAPP_LINK || '';

export function buildBoltenWhatsAppLink(number = '', officialLink = ''): string | null {
  if (officialLink.startsWith('https://wa.me/') || officialLink.startsWith('https://api.whatsapp.com/send')) {
    const separator = officialLink.includes('?') ? '&' : '?';
    return `${officialLink}${separator}text=${encodeURIComponent(BOLTEN_CHAT_TRIGGER_MESSAGE)}`;
  }

  const digits = number.replace(/\D/g, '');
  if (digits.length < 10) return null;

  const fullNumber = digits.startsWith('55') ? digits : `55${digits}`;
  return `https://wa.me/${fullNumber}?text=${encodeURIComponent(BOLTEN_CHAT_TRIGGER_MESSAGE)}`;
}

export function getBoltenWhatsAppLink(): string | null {
  return buildBoltenWhatsAppLink(BOLTEN_WHATSAPP_NUMBER, BOLTEN_WHATSAPP_LINK);
}
