import { describe, test, expect } from 'vitest';
import { isModelRefusal, hasImageInput } from './aiRefusal';

describe('isModelRefusal', () => {
  test.each([
    'Desculpe, não posso ajudar com isso.',
    'Desculpe, mas não posso ajudar com isso.',
    'Sinto muito, não posso ajudar com isso.',
    'Lamento, mas não posso atender a esse pedido.',
    "I'm sorry, I can't assist with that.",
    'Sorry, but I cannot help with that request.',
    '  desculpe, não posso ajudar com isso  ',
  ])('reconhece a recusa "%s"', (text) => {
    expect(isModelRefusal(text)).toBe(true);
  });

  test.each([
    'Não consigo ver o que há na imagem. Descreva os alimentos e posso ajudar.',
    'Desculpe, não consigo reconhecer ingredientes nesta imagem. Se você me disser quais tem, sugiro uma receita!',
    '## Omelete\n\n### Ingredientes\n- 2 ovos\n\nDesculpe, não posso ajudar com isso é uma frase que aparece num texto longo o bastante para ser uma resposta real, com receita, passos e tudo mais que um usuário espera ver.',
    'Prato dentro do planejado!',
  ])('nao trata como recusa: "%s"', (text) => {
    expect(isModelRefusal(text)).toBe(false);
  });

  test.each([[undefined], [null], [''], [42]])('retorna false para %s', (value) => {
    expect(isModelRefusal(value)).toBe(false);
  });
});

describe('hasImageInput', () => {
  const textMessage = { role: 'user', content: 'oi' };
  const imageMessage = {
    role: 'user',
    content: [{ type: 'text', text: 'x' }, { type: 'image_url', image_url: { url: 'data:image/jpeg;base64,AAA' } }],
  };

  test('detecta imagem em content multimodal', () => {
    expect(hasImageInput({ messages: [textMessage, imageMessage] })).toBe(true);
  });

  test('false para conteudo so de texto', () => {
    expect(hasImageInput({ messages: [textMessage] })).toBe(false);
    expect(hasImageInput({ messages: [{ role: 'user', content: [{ type: 'text', text: 'x' }] }] })).toBe(false);
  });

  test('false para payload sem messages', () => {
    expect(hasImageInput({})).toBe(false);
    expect(hasImageInput(null)).toBe(false);
  });
});
