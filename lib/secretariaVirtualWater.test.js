import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';

const mocks = vi.hoisted(() => ({
  update: vi.fn().mockResolvedValue(),
  set: vi.fn().mockResolvedValue(),
}));

vi.mock('./firebase-admin.js', () => ({
  db: {
    collection: () => ({
      doc: () => ({
        get: async () => ({ exists: false, data: () => ({}) }),
        set: mocks.set,
        update: mocks.update,
      }),
    }),
  },
}));

import { runSecretariaVirtual } from './secretariaVirtual.js';
import { brDateKey } from './water.js';

const HOJE = brDateKey();
const paciente = (extra = {}) => ({
  name: 'Ana Souza',
  weights: [{ date: '01/11/2026', value: 70 }],
  waterLogs: { [HOJE]: 800 },
  ...extra,
});

const resposta = (message) => ({ json: async () => ({ choices: [{ message }] }) });
const corpo = (fetchMock, chamada = 0) => JSON.parse(fetchMock.mock.calls[chamada][1].body);
const nomesDasTools = (fetchMock) => corpo(fetchMock).tools.map((tool) => tool.function.name);
const contextoEfemero = (fetchMock) =>
  corpo(fetchMock).messages.find((m) => m.role === 'system' && m.content.includes('ÁGUA DE HOJE'))?.content;

beforeEach(() => {
  vi.clearAllMocks();
  process.env.OPENAI_API_KEY = 'chave-de-teste';
});
afterEach(() => {
  vi.unstubAllGlobals();
  delete process.env.OPENAI_API_KEY;
});

describe('agua no motor da Secretaria Virtual', () => {
  test('WhatsApp: a ferramenta de lembrete nao e oferecida e o contexto manda explicar o Telegram', async () => {
    const fetchMock = vi.fn().mockResolvedValue(resposta({ content: 'ok' }));
    vi.stubGlobal('fetch', fetchMock);

    await runSecretariaVirtual('p1', paciente(), 'consegue me avisar a cada 2 horas?', null, 'whatsapp');

    expect(nomesDasTools(fetchMock)).not.toContain('definir_lembrete_agua');
    expect(nomesDasTools(fetchMock)).toContain('log_water');
    const contexto = contextoEfemero(fetchMock);
    expect(contexto).toContain('800 ml de 2450 ml');
    expect(contexto).toContain('Conectar Telegram');
    expect(contexto).not.toContain('definir_lembrete_agua');
  });

  test('Telegram: a ferramenta de lembrete e oferecida', async () => {
    const fetchMock = vi.fn().mockResolvedValue(resposta({ content: 'ok' }));
    vi.stubGlobal('fetch', fetchMock);

    await runSecretariaVirtual('p1', paciente(), 'me avisa a cada 2 horas', null, 'telegram');

    expect(nomesDasTools(fetchMock)).toContain('definir_lembrete_agua');
    expect(contextoEfemero(fetchMock)).toContain('definir_lembrete_agua');
  });

  test('definir_lembrete_agua grava o lembrete normalizado no Telegram', async () => {
    const chamadaDaTool = { id: 'c1', function: { name: 'definir_lembrete_agua', arguments: JSON.stringify({ intervalo_horas: 2, hora_inicio: 9, hora_fim: 18 }) } };
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(resposta({ content: null, tool_calls: [chamadaDaTool] }))
      .mockResolvedValueOnce(resposta({ content: 'Combinado! Te aviso a cada 2 horas.' }));
    vi.stubGlobal('fetch', fetchMock);

    const resultado = await runSecretariaVirtual('p1', paciente(), 'me avisa a cada 2 horas das 9 as 18', null, 'telegram');

    expect(mocks.set).toHaveBeenCalledWith(
      expect.objectContaining({ waterReminder: { enabled: true, everyHours: 2, startHour: 9, endHour: 18 } }),
      { merge: true }
    );
    expect(resultado.text).toContain('Combinado');
  });

  test('definir_lembrete_agua chamada no WhatsApp nao grava nada', async () => {
    const chamadaDaTool = { id: 'c1', function: { name: 'definir_lembrete_agua', arguments: '{}' } };
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(resposta({ content: null, tool_calls: [chamadaDaTool] }))
      .mockResolvedValueOnce(resposta({ content: 'So pelo Telegram.' }));
    vi.stubGlobal('fetch', fetchMock);

    await runSecretariaVirtual('p1', paciente(), 'me avisa', null, 'whatsapp');

    expect(mocks.set).not.toHaveBeenCalledWith(expect.objectContaining({ waterReminder: expect.anything() }), expect.anything());
    const mensagemDaTool = corpo(fetchMock, 1).messages.find((m) => m.role === 'tool');
    expect(mensagemDaTool.content).toContain('só funcionam pelo Telegram');
  });

  test('bom dia: ferramenta e contexto existem so no Telegram', async () => {
    const telegram = vi.fn().mockResolvedValue(resposta({ content: 'ok' }));
    vi.stubGlobal('fetch', telegram);
    await runSecretariaVirtual('p1', paciente(), 'oi', null, 'telegram');
    expect(nomesDasTools(telegram)).toContain('definir_bom_dia');
    expect(corpo(telegram).messages.some((m) => m.role === 'system' && m.content.includes('BOM DIA AUTOMÁTICO'))).toBe(true);

    const whatsapp = vi.fn().mockResolvedValue(resposta({ content: 'ok' }));
    vi.stubGlobal('fetch', whatsapp);
    await runSecretariaVirtual('p1', paciente(), 'oi', null, 'whatsapp');
    expect(nomesDasTools(whatsapp)).not.toContain('definir_bom_dia');
    expect(corpo(whatsapp).messages.some((m) => m.role === 'system' && m.content.includes('BOM DIA AUTOMÁTICO'))).toBe(false);
  });

  test('definir_bom_dia desliga e religa no Telegram, e nao grava nada no WhatsApp', async () => {
    const chamada = (ativo) => ({ id: 'c1', function: { name: 'definir_bom_dia', arguments: JSON.stringify({ ativo }) } });
    const rodar = async (canal, ativo) => {
      vi.stubGlobal('fetch', vi.fn()
        .mockResolvedValueOnce(resposta({ content: null, tool_calls: [chamada(ativo)] }))
        .mockResolvedValueOnce(resposta({ content: 'Pronto!' })));
      await runSecretariaVirtual('p1', paciente(), 'nao quero mais o bom dia', null, canal);
    };

    await rodar('telegram', false);
    expect(mocks.set).toHaveBeenCalledWith({ morningGreeting: false }, { merge: true });

    await rodar('telegram', true);
    expect(mocks.set).toHaveBeenCalledWith({ morningGreeting: true }, { merge: true });

    mocks.set.mockClear();
    await rodar('whatsapp', false);
    expect(mocks.set).not.toHaveBeenCalledWith(expect.objectContaining({ morningGreeting: expect.anything() }), expect.anything());
  });

  test('as chamadas a OpenAI usam o orcamento de tokens novo (eram 500/600 e cortavam a receita)', async () => {
    const chamadaDaTool = { id: 'c1', function: { name: 'gerar_receita', arguments: JSON.stringify({ nome_refeicao: 'Almoco', alimentos: 'frango, quinoa' }) } };
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(resposta({ content: null, tool_calls: [chamadaDaTool] }))
      .mockResolvedValueOnce({ json: async () => ({ choices: [{ message: { content: '## Bowl\n### Ingredientes\n- frango' }, finish_reason: 'stop' }] }) })
      .mockResolvedValueOnce(resposta({ content: 'Aqui esta a receita!' }));
    vi.stubGlobal('fetch', fetchMock);

    await runSecretariaVirtual('p1', paciente(), 'me da uma receita', null, 'whatsapp');

    expect(corpo(fetchMock, 0).max_tokens).toBeGreaterThanOrEqual(1200);
    expect(corpo(fetchMock, 1).max_tokens).toBeGreaterThanOrEqual(1200); // geracao da receita
    expect(corpo(fetchMock, 2).max_tokens).toBeGreaterThanOrEqual(1200); // resposta final
  });

  test('resposta final cortada pelo limite e fechada sem frase pela metade e avisa o paciente', async () => {
    const chamadaDaTool = { id: 'c1', function: { name: 'log_water', arguments: JSON.stringify({ ml: 200 }) } };
    const cortada = '1. Cozinhar a quinoa.\n2. Refogar os legumes.\n3. Cozinhar a Batata-Doce: Descasque e corte';
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce(resposta({ content: null, tool_calls: [chamadaDaTool] }))
      .mockResolvedValueOnce({ json: async () => ({ choices: [{ message: { content: cortada }, finish_reason: 'length' }] }) }));

    const resultado = await runSecretariaVirtual('p1', paciente(), 'bebi agua', null, 'whatsapp');

    expect(resultado.text).not.toContain('Descasque e corte');
    expect(resultado.text).toContain('2. Refogar os legumes.');
    expect(resultado.text).toContain('continua');
  });

  test('receita que bateu no limite nao e salva no app como se estivesse completa', async () => {
    const chamadaDaTool = { id: 'c1', function: { name: 'gerar_receita', arguments: JSON.stringify({ nome_refeicao: 'Almoco', alimentos: 'frango' }) } };
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce(resposta({ content: null, tool_calls: [chamadaDaTool] }))
      .mockResolvedValueOnce({ json: async () => ({ choices: [{ message: { content: '## Bowl\n1. Descasque e corte' }, finish_reason: 'length' }] }) })
      .mockResolvedValueOnce(resposta({ content: 'ok' })));

    await runSecretariaVirtual('p1', paciente(), 'me da uma receita', null, 'whatsapp');

    expect(mocks.update).not.toHaveBeenCalledWith(expect.objectContaining({ aiRecipes: expect.anything() }));
  });

  test('log_water devolve a IA o total do dia e quanto falta', async () => {
    const chamadaDaTool = { id: 'c1', function: { name: 'log_water', arguments: JSON.stringify({ ml: 200 }) } };
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(resposta({ content: null, tool_calls: [chamadaDaTool] }))
      .mockResolvedValueOnce(resposta({ content: 'Anotado!' }));
    vi.stubGlobal('fetch', fetchMock);

    await runSecretariaVirtual('p1', paciente(), 'bebi 200 ml', null, 'whatsapp');

    const mensagemDaTool = corpo(fetchMock, 1).messages.find((m) => m.role === 'tool');
    expect(mensagemDaTool.content).toContain('Total de hoje: 1000 ml de 2450 ml');
    expect(mensagemDaTool.content).toContain('faltam 1450 ml');
  });

  test('vários log_water na mesma rodada acumulam o total', async () => {
    const chamadas = [
      { id: 'c1', function: { name: 'log_water', arguments: JSON.stringify({ ml: 200 }) } },
      { id: 'c2', function: { name: 'log_water', arguments: JSON.stringify({ ml: 300 }) } },
    ];
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(resposta({ content: null, tool_calls: chamadas }))
      .mockResolvedValueOnce(resposta({ content: 'Anotado!' }));
    vi.stubGlobal('fetch', fetchMock);

    await runSecretariaVirtual('p1', paciente(), 'bebi 200 e depois 300', null, 'telegram');

    const resultados = corpo(fetchMock, 1).messages.filter((m) => m.role === 'tool').map((m) => m.content);
    expect(resultados[0]).toContain('Total de hoje: 1000 ml');
    expect(resultados[1]).toContain('Total de hoje: 1300 ml');
  });
});
