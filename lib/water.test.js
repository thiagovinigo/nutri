import { describe, test, expect } from 'vitest';
import {
  brDateKey,
  computeWaterGoal,
  todayWaterMl,
  buildWaterContext,
  normalizeWaterReminder,
  shouldSendWaterReminder,
  buildWaterReminderText,
} from './water.js';

const KEY = '21/11/2026';
const lembrete = { enabled: true, everyHours: 2, startHour: 8, endHour: 20 };
const paciente = (extra = {}) => ({
  name: 'Ana Souza',
  telegram_chat_id: '123',
  weights: [{ date: '01/11/2026', value: 70 }],
  waterLogs: { [KEY]: 800 },
  waterReminder: lembrete,
  ...extra,
});

describe('brDateKey', () => {
  test('usa o fuso de Sao Paulo, nao o do servidor', () => {
    expect(brDateKey(new Date('2026-11-22T01:30:00Z'))).toBe('21/11/2026');
    expect(brDateKey(new Date('2026-11-21T12:00:00Z'))).toBe('21/11/2026');
  });
});

describe('computeWaterGoal', () => {
  test('meta definida pelo nutricionista vence', () => {
    expect(computeWaterGoal({ waterGoalMl: 3000, weights: [{ value: 70 }] })).toEqual({ goalMl: 3000, source: 'nutri' });
  });
  test('sem meta do nutri usa peso x 35 ml arredondado a 50 ml', () => {
    expect(computeWaterGoal({ weights: [{ value: 70 }] })).toEqual({ goalMl: 2450, source: 'peso' });
    expect(computeWaterGoal({ weights: [{ value: 72.3 }] })).toEqual({ goalMl: 2550, source: 'peso' });
  });
  test('usa o peso mais recente valido e ignora valores invalidos', () => {
    const weights = [{ value: 60 }, { value: 80 }, { value: 'abc' }, { value: 0 }];
    expect(computeWaterGoal({ weights })).toEqual({ goalMl: 2800, source: 'peso' });
  });
  test('limita a meta entre 1500 e 4500 ml', () => {
    expect(computeWaterGoal({ weights: [{ value: 40 }] }).goalMl).toBe(1500);
    expect(computeWaterGoal({ weights: [{ value: 150 }] }).goalMl).toBe(4500);
  });
  test('sem peso e sem meta cai no padrao de 2000 ml', () => {
    expect(computeWaterGoal({})).toEqual({ goalMl: 2000, source: 'padrao' });
    expect(computeWaterGoal({ waterGoalMl: 50, weights: [] })).toEqual({ goalMl: 2000, source: 'padrao' });
    expect(computeWaterGoal({ waterGoalMl: 'abc' })).toEqual({ goalMl: 2000, source: 'padrao' });
  });
});

describe('todayWaterMl', () => {
  test('le o total do dia do mapa waterLogs', () => {
    expect(todayWaterMl({ waterLogs: { [KEY]: 800 } }, KEY)).toBe(800);
  });
  test('dia sem registro ou valor invalido vira 0', () => {
    expect(todayWaterMl({ waterLogs: { '20/11/2026': 500 } }, KEY)).toBe(0);
    expect(todayWaterMl({ waterLogs: { [KEY]: 'x' } }, KEY)).toBe(0);
    expect(todayWaterMl({}, KEY)).toBe(0);
  });
});

describe('buildWaterContext', () => {
  test('informa o que bebeu, a meta, a origem e quanto falta, e proibe a resposta generica', () => {
    const texto = buildWaterContext(paciente(), { channel: 'telegram', dateKey: KEY });
    expect(texto).toContain('ÁGUA DE HOJE');
    expect(texto).toContain('800 ml de 2450 ml');
    expect(texto).toContain('faltam 1650 ml');
    expect(texto).toContain('peso');
    expect(texto).toMatch(/nunca.*2 a 3 litros/i);
  });
  test('meta batida', () => {
    const texto = buildWaterContext(paciente({ waterLogs: { [KEY]: 2600 } }), { channel: 'telegram', dateKey: KEY });
    expect(texto).toContain('meta batida');
    expect(texto).not.toContain('faltam');
  });
  test('telegram: cita a ferramenta e o lembrete atual', () => {
    const texto = buildWaterContext(paciente(), { channel: 'telegram', dateKey: KEY });
    expect(texto).toContain('definir_lembrete_agua');
    expect(texto).toContain('a cada 2 h');
    expect(texto).toContain('8h às 20h');
  });
  test('telegram sem lembrete: diz que nao ha lembrete ativo', () => {
    const texto = buildWaterContext(paciente({ waterReminder: undefined }), { channel: 'telegram', dateKey: KEY });
    expect(texto).toMatch(/nenhum lembrete/i);
  });
  test('whatsapp: nao cita a ferramenta, explica que lembrete e pelo Telegram e nao promete', () => {
    const texto = buildWaterContext(paciente({ telegram_chat_id: undefined }), { channel: 'whatsapp', dateKey: KEY });
    expect(texto).not.toContain('definir_lembrete_agua');
    expect(texto).toContain('Telegram');
    expect(texto).toMatch(/Conectar Telegram/);
    expect(texto).toMatch(/não envia mensagens sozinh/i);
  });
  test('whatsapp com Telegram ja conectado: diz para pedir la', () => {
    const texto = buildWaterContext(paciente(), { channel: 'whatsapp', dateKey: KEY });
    expect(texto).toMatch(/já tem o Telegram conectado/i);
  });
});

describe('normalizeWaterReminder', () => {
  test('sem argumentos usa os padroes: a cada 2 h, das 8h as 20h', () => {
    expect(normalizeWaterReminder({})).toEqual({ enabled: true, everyHours: 2, startHour: 8, endHour: 20 });
  });
  test('ativo=false desliga', () => {
    expect(normalizeWaterReminder({ ativo: false }).enabled).toBe(false);
  });
  test('"false" em texto tambem desliga (o pedido de parar nunca pode ser ignorado)', () => {
    expect(normalizeWaterReminder({ ativo: 'false' }).enabled).toBe(false);
    expect(normalizeWaterReminder({ ativo: 'FALSE' }).enabled).toBe(false);
    expect(normalizeWaterReminder({ ativo: true }).enabled).toBe(true);
  });
  test('null, texto vazio e texto nao viram 0h: hora so vale se for numero', () => {
    expect(normalizeWaterReminder({ hora_inicio: null, hora_fim: '' })).toMatchObject({ startHour: 8, endHour: 20 });
    expect(normalizeWaterReminder({ hora_inicio: '9', hora_fim: '18' })).toMatchObject({ startHour: 8, endHour: 20 });
  });
  test('o objeto gravado tem so as 4 chaves esperadas, mesmo com argumentos extras', () => {
    const resultado = normalizeWaterReminder({ __proto__: { x: 1 }, outro: 'campo', ativo: true });
    expect(Object.keys(resultado).sort()).toEqual(['enabled', 'endHour', 'everyHours', 'startHour']);
  });
  test('limita o intervalo entre 1 e 6 horas e arredonda', () => {
    expect(normalizeWaterReminder({ intervalo_horas: 0 }).everyHours).toBe(1);
    expect(normalizeWaterReminder({ intervalo_horas: 12 }).everyHours).toBe(6);
    expect(normalizeWaterReminder({ intervalo_horas: 2.6 }).everyHours).toBe(3);
    expect(normalizeWaterReminder({ intervalo_horas: 'abc' }).everyHours).toBe(2);
  });
  test('janela fora de ordem ou fora de 0-23 volta ao padrao', () => {
    expect(normalizeWaterReminder({ hora_inicio: 22, hora_fim: 8 })).toMatchObject({ startHour: 8, endHour: 20 });
    expect(normalizeWaterReminder({ hora_inicio: 25, hora_fim: 30 })).toMatchObject({ startHour: 8, endHour: 20 });
    expect(normalizeWaterReminder({ hora_inicio: 9, hora_fim: 18 })).toMatchObject({ startHour: 9, endHour: 18 });
  });
});

describe('shouldSendWaterReminder', () => {
  test.each([8, 10, 12, 20])('envia as %ih (dentro da janela e no intervalo)', (hour) => {
    expect(shouldSendWaterReminder(paciente(), { hour, dateKey: KEY })).toBe(true);
  });
  test.each([7, 9, 21, 22, 3])('nao envia as %ih (fora do intervalo ou da janela)', (hour) => {
    expect(shouldSendWaterReminder(paciente(), { hour, dateKey: KEY })).toBe(false);
  });
  test('sem lembrete ativo ou sem Telegram nao envia', () => {
    expect(shouldSendWaterReminder(paciente({ waterReminder: undefined }), { hour: 10, dateKey: KEY })).toBe(false);
    expect(shouldSendWaterReminder(paciente({ waterReminder: { ...lembrete, enabled: false } }), { hour: 10, dateKey: KEY })).toBe(false);
    expect(shouldSendWaterReminder(paciente({ telegram_chat_id: undefined }), { hour: 10, dateKey: KEY })).toBe(false);
  });
  test('lembrete malformado no Firestore (editado a mao) nunca envia nem lanca erro', () => {
    const malformados = [
      { enabled: 'true', everyHours: 2, startHour: 8, endHour: 20 },
      { enabled: true, everyHours: 2, startHour: '8', endHour: 20 },
      { enabled: true, everyHours: 2, startHour: 8, endHour: undefined },
      { enabled: true, everyHours: 0, startHour: 8, endHour: 20 },
      { enabled: true, everyHours: 99, startHour: 8, endHour: 20 },
    ];
    for (const waterReminder of malformados) {
      expect(shouldSendWaterReminder(paciente({ waterReminder }), { hour: 10, dateKey: KEY })).toBe(false);
    }
  });
  test('janela que comeca a meia-noite funciona (hora 0)', () => {
    const p = paciente({ waterReminder: { enabled: true, everyHours: 6, startHour: 0, endHour: 18 } });
    expect(shouldSendWaterReminder(p, { hour: 0, dateKey: KEY })).toBe(true);
    expect(shouldSendWaterReminder(p, { hour: 6, dateKey: KEY })).toBe(true);
    expect(shouldSendWaterReminder(p, { hour: 5, dateKey: KEY })).toBe(false);
  });
  test('para de lembrar quando a meta do dia foi batida', () => {
    expect(shouldSendWaterReminder(paciente({ waterLogs: { [KEY]: 2450 } }), { hour: 10, dateKey: KEY })).toBe(false);
  });
  test('nao repete na mesma hora (dois cron seguidos)', () => {
    const p = paciente({ lastWaterReminderKey: `${KEY}-10` });
    expect(shouldSendWaterReminder(p, { hour: 10, dateKey: KEY })).toBe(false);
    expect(shouldSendWaterReminder(p, { hour: 12, dateKey: KEY })).toBe(true);
  });
});

describe('buildWaterReminderText', () => {
  test('mostra quanto bebeu e quanto falta, com o nome escapado para HTML', () => {
    const texto = buildWaterReminderText(paciente({ name: '<b>Ana</b> Souza' }), { ml: 1200, goalMl: 2450 });
    expect(texto).toContain('💧');
    expect(texto).toContain('1200 ml de 2450 ml');
    expect(texto).toContain('faltam 1250 ml');
    expect(texto).toContain('&lt;b&gt;Ana&lt;/b&gt;');
    expect(texto).not.toContain('<b>Ana</b>');
  });
});
