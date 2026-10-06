import { describe, test, expect } from 'vitest';
import {
  SERVER_ONLY_FIELDS,
  NUTRI_ONLY_FIELDS,
  omitServerOnlyFields,
  omitPatientUnwritableFields,
} from './serverOnlyFields.js';

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

  test('a lista cobre os campos dos webhooks e do cron de risco', () => {
    expect([...SERVER_ONLY_FIELDS].sort()).toEqual([
      'lastRiskNotifiedAt',
      'lastRiskNotifiedLevel',
      'riskFactors',
      'riskLevel',
      'riskScore',
      'telegram_chat_id',
      'telegram_linked_at',
      'whatsapp_chat_id',
      'whatsapp_linked_at',
    ]);
  });

  test('remove tambem os campos de risco calculados pelo cron', () => {
    const doc = { name: 'Ana', riskScore: 80, riskLevel: 'alto', riskFactors: ['x'], lastRiskNotifiedAt: 'y' };
    expect(omitServerOnlyFields(doc)).toEqual({ name: 'Ana' });
  });
});

describe('omitPatientUnwritableFields', () => {
  test('a correcao manual de risco e so do nutricionista', () => {
    expect(NUTRI_ONLY_FIELDS).toEqual(['riskOverride']);
  });

  test('remove campos de servidor e o riskOverride', () => {
    const doc = { name: 'Ana', riskOverride: { level: 'baixo' }, riskLevel: 'alto', telegram_chat_id: 1, streak: 3 };
    expect(omitPatientUnwritableFields(doc)).toEqual({ name: 'Ana', streak: 3 });
  });

  test('nao muta o objeto original', () => {
    const doc = { name: 'Ana', riskOverride: { level: 'baixo' } };
    omitPatientUnwritableFields(doc);
    expect(doc.riskOverride).toEqual({ level: 'baixo' });
  });
});
