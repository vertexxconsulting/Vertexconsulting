import { describe, expect, it } from 'vitest';
import { DEFAULT_MESSAGE_TEMPLATE, buildMessage } from './evolutionApi';

describe('mensagem de gatilho do chatbot', () => {
  it('mantém o texto exato aprovado para o site', () => {
    expect(DEFAULT_MESSAGE_TEMPLATE).toBe(
      'Olá! Vim pelo site da Vertex e gostaria de entender como a consultoria pode ajudar o meu negócio.',
    );
  });

  it('não adiciona variáveis antigas ao texto do gatilho', () => {
    expect(buildMessage(DEFAULT_MESSAGE_TEMPLATE, 'Ana')).toBe(
      'Olá! Vim pelo site da Vertex e gostaria de entender como a consultoria pode ajudar o meu negócio.',
    );
  });
});
