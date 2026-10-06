import { describe, test, expect } from 'vitest';
import { pickChatModel, TEXT_MODEL, VISION_MODEL } from './openaiModel.js';

const textMessage = { role: 'user', content: 'oi' };
const imageMessage = {
  role: 'user',
  content: [{ type: 'text', text: 'x' }, { type: 'image_url', image_url: { url: 'data:image/jpeg;base64,AAA' } }],
};

describe('pickChatModel', () => {
  test('usa o modelo de visao quando alguma mensagem tem imagem', () => {
    expect(pickChatModel([textMessage, imageMessage])).toBe(VISION_MODEL);
  });

  test('usa o modelo de texto quando so ha texto', () => {
    expect(pickChatModel([textMessage])).toBe(TEXT_MODEL);
    expect(pickChatModel([{ role: 'user', content: [{ type: 'text', text: 'x' }] }])).toBe(TEXT_MODEL);
  });

  test('lista vazia ou invalida cai no modelo de texto', () => {
    expect(pickChatModel([])).toBe(TEXT_MODEL);
    expect(pickChatModel(undefined)).toBe(TEXT_MODEL);
  });

  test('o modelo de visao nao e o gpt-4o (que recusava ~30% das fotos de comida)', () => {
    expect(VISION_MODEL).not.toBe('gpt-4o');
  });
});
