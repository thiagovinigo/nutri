import { describe, test, expect } from 'vitest';
import {
  MORNING_HOUR,
  shouldSendMorningGreeting,
  buildMorningMessage,
  parseMorningOptIn,
  buildMorningContext,
} from './morning.js';

const KEY = '21/11/2026';
const paciente = (extra = {}) => ({ name: 'Ana Souza', telegram_chat_id: '123', status: 'ativo', streak: 0, ...extra });

describe('shouldSendMorningGreeting', () => {
  test('envia as 8h para quem tem Telegram conectado', () => {
    expect(MORNING_HOUR).toBe(8);
    expect(shouldSendMorningGreeting(paciente(), { hour: 8, dateKey: KEY })).toBe(true);
  });
  test.each([0, 7, 9, 12, 23])('nao envia as %ih', (hour) => {
    expect(shouldSendMorningGreeting(paciente(), { hour, dateKey: KEY })).toBe(false);
  });
  test('nao envia sem Telegram, desligado pelo paciente ou paciente inativo', () => {
    expect(shouldSendMorningGreeting(paciente({ telegram_chat_id: undefined }), { hour: 8, dateKey: KEY })).toBe(false);
    expect(shouldSendMorningGreeting(paciente({ morningGreeting: false }), { hour: 8, dateKey: KEY })).toBe(false);
    expect(shouldSendMorningGreeting(paciente({ status: 'inativo' }), { hour: 8, dateKey: KEY })).toBe(false);
  });
  test('status ainda nao definido ou pendente recebe (so "inativo" e bloqueado, decisao do PRD)', () => {
    expect(shouldSendMorningGreeting(paciente({ status: undefined }), { hour: 8, dateKey: KEY })).toBe(true);
    expect(shouldSendMorningGreeting(paciente({ status: 'pendente' }), { hour: 8, dateKey: KEY })).toBe(true);
  });
  test('religado (true) ou nunca definido recebe', () => {
    expect(shouldSendMorningGreeting(paciente({ morningGreeting: true }), { hour: 8, dateKey: KEY })).toBe(true);
  });
  test('no maximo 1 vez por dia (dois cron na mesma hora ou reexecucao)', () => {
    const jaEnviado = paciente({ lastMorningGreetingKey: KEY });
    expect(shouldSendMorningGreeting(jaEnviado, { hour: 8, dateKey: KEY })).toBe(false);
    expect(shouldSendMorningGreeting(jaEnviado, { hour: 8, dateKey: '22/11/2026' })).toBe(true);
  });
});

describe('buildMorningMessage', () => {
  const dados = { goalMl: 2450, dateKey: KEY };

  test('tem saudacao com o nome escapado, pergunta do sono, meta de agua e como parar', () => {
    const texto = buildMorningMessage(paciente({ name: '<b>Ana</b> Souza' }), dados);
    expect(texto).toContain('&lt;b&gt;Ana&lt;/b&gt;');
    expect(texto).not.toContain('<b>Ana</b>');
    expect(texto).toMatch(/sono/i);
    expect(texto).toMatch(/horas/i);
    expect(texto).toContain('2450 ml');
    expect(texto).toContain('12 copos');
    expect(texto).toMatch(/parar|não quiser/i);
  });
  test('cita a ofensiva so quando ha dias seguidos', () => {
    expect(buildMorningMessage(paciente({ streak: 5 }), dados)).toContain('5 dias');
    expect(buildMorningMessage(paciente({ streak: 1 }), dados)).toContain('1 dia ');
    expect(buildMorningMessage(paciente({ streak: 0 }), dados)).not.toMatch(/ofensiva/i);
  });
  test('a frase motivadora muda de um dia para o outro e e estavel no mesmo dia', () => {
    const dia = (dateKey) => buildMorningMessage(paciente(), { goalMl: 2450, dateKey });
    expect(dia('21/11/2026')).toBe(dia('21/11/2026'));
    const variantes = new Set(Array.from({ length: 10 }, (_, i) => dia(`${String(10 + i).padStart(2, '0')}/11/2026`).split('\n')[0]));
    expect(variantes.size).toBeGreaterThan(3);
  });
  test('sem nome a saudacao continua natural, sem "tudo bem" no lugar do nome', () => {
    for (let dia = 10; dia < 17; dia += 1) {
      const texto = buildMorningMessage(paciente({ name: '' }), { goalMl: 2000, dateKey: `${dia}/11/2026` });
      const saudacao = texto.split('\n')[0];
      expect(saudacao).toMatch(/bom dia/i);
      expect(saudacao).not.toMatch(/tudo bem|undefined|null|,\s*!/i);
    }
  });
  test('nao usa tags HTML proprias (so o nome escapado) e fica curta', () => {
    const texto = buildMorningMessage(paciente({ streak: 3 }), dados);
    expect(texto).not.toMatch(/<[a-z]/i);
    expect(texto.length).toBeLessThan(700);
  });
});

describe('parseMorningOptIn', () => {
  test('liga por padrao e desliga com false, "false" ou "FALSE"', () => {
    expect(parseMorningOptIn({})).toBe(true);
    expect(parseMorningOptIn({ ativo: true })).toBe(true);
    expect(parseMorningOptIn({ ativo: false })).toBe(false);
    expect(parseMorningOptIn({ ativo: 'false' })).toBe(false);
    expect(parseMorningOptIn({ ativo: 'FALSE' })).toBe(false);
  });
});

describe('buildMorningContext', () => {
  test('explica a ferramenta, o estado atual e que a resposta sobre o sono vira log_sleep', () => {
    const ligado = buildMorningContext(paciente());
    expect(ligado).toContain('definir_bom_dia');
    expect(ligado).toContain('log_sleep');
    expect(ligado).toMatch(/ligado/i);
    expect(buildMorningContext(paciente({ morningGreeting: false }))).toMatch(/desligado/i);
  });
});
