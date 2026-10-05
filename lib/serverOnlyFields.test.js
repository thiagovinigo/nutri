import { describe, test, expect } from 'vitest';
import { SERVER_ONLY_FIELDS, omitServerOnlyFields } from './serverOnlyFields.js';

describe('omitServerOnlyFields', () => {
  test('remove os campos de canal gravados so pelo servidor', () => {
    const doc = {
      name: 'Ana',
      telegram_chat_id: 123,
      telegram_linked_at: 'x',
      whatsapp_chat_id: '5511@s.whatsapp.net',
      whatsapp_linked_at: 'y',
    };
    expect(omitServerOnlyFields(doc)).toEqual({ name: 'Ana' });
  });

  test('nao muta o objeto original', () => {
    const doc = { name: 'Ana', telegram_chat_id: 123 };
    omitServerOnlyFields(doc);
    expect(doc).toEqual({ name: 'Ana', telegram_chat_id: 123 });
  });

  test('mantem todos os outros campos', () => {
    const doc = { name: 'Ana', streak: 3, recipes: [] };
    expect(omitServerOnlyFields(doc)).toEqual(doc);
  });

  test('a lista cobre os quatro campos que os webhooks gravam', () => {
    expect([...SERVER_ONLY_FIELDS].sort()).toEqual([
      'telegram_chat_id',
      'telegram_linked_at',
      'whatsapp_chat_id',
      'whatsapp_linked_at',
    ]);
  });
});
