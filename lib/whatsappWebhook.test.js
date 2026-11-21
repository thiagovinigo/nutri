import { describe, test, expect, vi, beforeEach } from 'vitest';
import crypto from 'node:crypto';

const mocks = vi.hoisted(() => ({
  runSecretariaVirtual: vi.fn(),
  transcribeAudioWithWhisper: vi.fn(),
  redeemNutriLinkCode: vi.fn(),
  sendWhatsAppText: vi.fn().mockResolvedValue(true),
  sendWhatsAppOptionsList: vi.fn().mockResolvedValue(true),
  fetchWhatsAppMediaAsDataUrl: vi.fn(),
  fetchWhatsAppAudioAsBuffer: vi.fn(),
  where: vi.fn(),
  patientUpdate: vi.fn(),
  patientDocs: [],
}));

vi.mock('./firebase-admin.js', () => ({
  db: {
    collection: () => ({
      // Simula "where('whatsapp_chat_id', '==', valor)": devolve só os pacientes
      // gravados com aquele chat id.
      where: (campo, operador, valor) => {
        mocks.where(campo, operador, valor);
        const docs = mocks.patientDocs.filter((doc) => doc.data().whatsapp_chat_id === valor);
        return { limit: () => ({ get: async () => ({ empty: docs.length === 0, docs }) }) };
      },
      doc: () => ({ get: async () => ({ exists: false }), set: vi.fn() }),
    }),
  },
}));
vi.mock('./secretariaVirtual.js', () => ({
  runSecretariaVirtual: mocks.runSecretariaVirtual,
  transcribeAudioWithWhisper: mocks.transcribeAudioWithWhisper,
}));
vi.mock('./nutriLinkServer.js', () => ({ redeemNutriLinkCode: mocks.redeemNutriLinkCode }));
vi.mock('./whatsapp.js', async (importOriginal) => ({
  ...(await importOriginal()),
  sendWhatsAppText: mocks.sendWhatsAppText,
  sendWhatsAppOptionsList: mocks.sendWhatsAppOptionsList,
  fetchWhatsAppMediaAsDataUrl: mocks.fetchWhatsAppMediaAsDataUrl,
  fetchWhatsAppAudioAsBuffer: mocks.fetchWhatsAppAudioAsBuffer,
}));

import handler, { whatsappMessageBuffer } from '../api/whatsapp-webhook.js';

const KEY = 'segredo-de-teste';
const PACIENTE = '554199999999@c.us';
const LEGADO = '554199999999@s.whatsapp.net';

// O webhook responde 200 na hora e a IA roda quando o buffer fecha: espera o lote.
async function chamar(req, res) {
  await handler(req, res);
  await whatsappMessageBuffer.drain();
}

function requisicao(evento, { assinar = true, chave = KEY } = {}) {
  const rawBody = Buffer.from(JSON.stringify(evento));
  const headers = assinar ? { 'x-webhook-hmac': crypto.createHmac('sha512', chave).update(rawBody).digest('hex') } : {};
  return { method: 'POST', body: evento, rawBody, headers };
}

function resposta() {
  return {
    code: null,
    body: null,
    status(code) { this.code = code; return this; },
    json(body) { this.body = body; return this; },
    send(body) { this.body = body; return this; },
  };
}

const mensagem = (extra = {}) => ({
  event: 'message',
  payload: { id: 'm1', from: PACIENTE, fromMe: false, body: 'oi', hasMedia: false, ...extra },
});

beforeEach(() => {
  vi.clearAllMocks();
  mocks.patientDocs.length = 0;
  process.env.WAHA_WEBHOOK_HMAC_KEY = KEY;
  process.env.WHATSAPP_BUFFER_MS = '0';
  mocks.runSecretariaVirtual.mockResolvedValue({ text: 'Olá!' });
});

describe('autenticacao do webhook', () => {
  test('rejeita metodo diferente de POST', async () => {
    const res = resposta();
    await chamar({ method: 'GET', headers: {} }, res);
    expect(res.code).toBe(405);
  });

  test('401 com assinatura invalida ou ausente', async () => {
    const errada = resposta();
    await chamar(requisicao(mensagem(), { chave: 'outra' }), errada);
    const ausente = resposta();
    await chamar(requisicao(mensagem(), { assinar: false }), ausente);

    expect(errada.code).toBe(401);
    expect(ausente.code).toBe(401);
    expect(mocks.runSecretariaVirtual).not.toHaveBeenCalled();
  });

  test('500 quando a chave HMAC nao esta configurada', async () => {
    delete process.env.WAHA_WEBHOOK_HMAC_KEY;
    const res = resposta();
    await chamar(requisicao(mensagem()), res);
    expect(res.code).toBe(500);
  });
});

describe('filtros de evento', () => {
  test.each([
    ['evento que nao e message', { event: 'session.status', payload: {} }],
    ['mensagem enviada pelo proprio numero', mensagem({ fromMe: true })],
    ['mensagem de grupo', mensagem({ from: '123456@g.us' })],
    ['status do WhatsApp', mensagem({ from: 'status@broadcast' })],
    ['ID oculto @lid sem telefone resolvivel', mensagem({ from: '99887766554433@lid' })],
    ['canal @newsletter com digitos iguais', mensagem({ from: '554199999999@newsletter' })],
    ['mensagem sem texto e sem midia', mensagem({ body: '' })],
  ])('ignora %s sem chamar a IA', async (_nome, evento) => {
    const res = resposta();
    await chamar(requisicao(evento), res);

    expect(res.code).toBe(200);
    expect(mocks.runSecretariaVirtual).not.toHaveBeenCalled();
  });
});

describe('mensagem de paciente vinculado', () => {
  const paciente = (data = {}, id = 'p1') => ({
    id,
    data: () => ({ name: 'Ana', xp: 0, whatsapp_chat_id: PACIENTE, ...data }),
    ref: { update: mocks.patientUpdate },
  });

  test('mensagens picadas do mesmo contato viram uma entrada so, na ordem', async () => {
    mocks.patientDocs.push(paciente());

    await handler(requisicao(mensagem({ id: 'm1', body: 'bebi 2 copos de agua de 00 mls' })), resposta());
    await handler(requisicao(mensagem({ id: 'm2', body: '100' })), resposta());
    await whatsappMessageBuffer.drain();

    expect(mocks.runSecretariaVirtual).toHaveBeenCalledTimes(1);
    expect(mocks.runSecretariaVirtual).toHaveBeenCalledWith('p1', expect.anything(), 'bebi 2 copos de agua de 00 mls\n100', null, 'whatsapp');
  });

  test('o webhook responde 200 na hora, antes da IA terminar', async () => {
    mocks.patientDocs.push(paciente());
    process.env.WHATSAPP_BUFFER_MS = '50';
    const res = resposta();

    await handler(requisicao(mensagem({ body: 'oi' })), res);

    expect(res.code).toBe(200);
    expect(res.body).toEqual({ status: 'queued' });
    expect(mocks.runSecretariaVirtual).not.toHaveBeenCalled();
    await whatsappMessageBuffer.drain();
    expect(mocks.runSecretariaVirtual).toHaveBeenCalledTimes(1);
  });

  test('numero ligado a dois pacientes (legado e novo): o vinculo WAHA (@c.us) vence sempre', async () => {
    mocks.patientDocs.push(paciente({ name: 'Legado', whatsapp_chat_id: LEGADO }, 'antigo'));
    mocks.patientDocs.push(paciente({ name: 'Novo', whatsapp_chat_id: PACIENTE }, 'novo'));

    await chamar(requisicao(mensagem({ body: 'oi' })), resposta());

    expect(mocks.runSecretariaVirtual).toHaveBeenCalledWith('novo', expect.objectContaining({ name: 'Novo' }), 'oi', null, 'whatsapp');
  });

  test('encontra vinculo antigo (@s.whatsapp.net) e responde pelo motor compartilhado', async () => {
    mocks.patientDocs.push(paciente({ whatsapp_chat_id: LEGADO }));
    const res = resposta();

    await chamar(requisicao(mensagem({ body: 'tomei 2 copos de agua' })), res);

    expect(mocks.where).toHaveBeenNthCalledWith(1, 'whatsapp_chat_id', '==', PACIENTE);
    expect(mocks.where).toHaveBeenNthCalledWith(2, 'whatsapp_chat_id', '==', LEGADO);
    expect(mocks.runSecretariaVirtual).toHaveBeenCalledWith('p1', expect.objectContaining({ name: 'Ana' }), 'tomei 2 copos de agua', null, 'whatsapp');
    expect(mocks.sendWhatsAppText).toHaveBeenCalledWith(PACIENTE, 'Olá!');
    expect(res.code).toBe(200);
  });

  test('numero nao vinculado recebe orientacao para conectar no app', async () => {
    const res = resposta();
    await chamar(requisicao(mensagem()), res);

    expect(mocks.sendWhatsAppText).toHaveBeenCalledWith(PACIENTE, expect.stringContaining('Conectar WhatsApp'));
    expect(mocks.runSecretariaVirtual).not.toHaveBeenCalled();
  });

  test('foto vira data URL e a legenda vira o texto', async () => {
    mocks.patientDocs.push(paciente());
    mocks.fetchWhatsAppMediaAsDataUrl.mockResolvedValue('data:image/jpeg;base64,AAA');
    const payload = { hasMedia: true, body: 'meu almoço', media: { url: 'http://x/a.jpg', mimetype: 'image/jpeg' } };

    await chamar(requisicao(mensagem(payload)), resposta());

    expect(mocks.fetchWhatsAppMediaAsDataUrl).toHaveBeenCalledWith(expect.objectContaining({ media: expect.any(Object) }));
    expect(mocks.runSecretariaVirtual).toHaveBeenCalledWith('p1', expect.anything(), 'meu almoço', 'data:image/jpeg;base64,AAA', 'whatsapp');
  });

  test('audio e transcrito antes de ir pra IA; falha na transcricao avisa o paciente', async () => {
    mocks.patientDocs.push(paciente());
    const payload = { hasMedia: true, body: '', media: { url: 'http://x/a.ogg', mimetype: 'audio/ogg; codecs=opus' } };
    mocks.fetchWhatsAppAudioAsBuffer.mockResolvedValue({ buffer: Buffer.from([1]), filename: 'audio.ogg' });
    mocks.transcribeAudioWithWhisper.mockResolvedValueOnce('quero marcar consulta');

    await chamar(requisicao(mensagem(payload)), resposta());
    expect(mocks.runSecretariaVirtual).toHaveBeenCalledWith('p1', expect.anything(), 'quero marcar consulta', null, 'whatsapp');

    mocks.runSecretariaVirtual.mockClear();
    mocks.transcribeAudioWithWhisper.mockResolvedValueOnce(null);
    await chamar(requisicao(mensagem(payload)), resposta());
    expect(mocks.runSecretariaVirtual).not.toHaveBeenCalled();
    expect(mocks.sendWhatsAppText).toHaveBeenCalledWith(PACIENTE, expect.stringContaining('Não consegui entender o áudio'));
  });
});

describe('remetente @lid', () => {
  test('usa o telefone alternativo do payload para achar o paciente e responder', async () => {
    mocks.patientDocs.push({ id: 'p1', data: () => ({ name: 'Ana', xp: 0, whatsapp_chat_id: PACIENTE }), ref: { update: mocks.patientUpdate } });
    const evento = mensagem({
      from: '11223344556677@lid',
      body: 'oi',
      _data: { key: { remoteJidAlt: '554199999999@s.whatsapp.net' } },
    });

    await chamar(requisicao(evento), resposta());

    expect(mocks.where).toHaveBeenCalledWith('whatsapp_chat_id', '==', PACIENTE);
    expect(mocks.sendWhatsAppText).toHaveBeenCalledWith('554199999999@c.us', 'Olá!');
  });

  test('/start pelo @lid grava o vinculo com o telefone, nao com o LID', async () => {
    mocks.redeemNutriLinkCode.mockResolvedValue({ name: 'Carla' });
    const evento = mensagem({
      from: '11223344556677@lid',
      body: '/start nutri:ABC',
      _data: { key: { remoteJidAlt: '554199999999@s.whatsapp.net' } },
    });

    await chamar(requisicao(evento), resposta());

    expect(mocks.redeemNutriLinkCode).toHaveBeenCalledWith(expect.anything(), 'ABC', expect.objectContaining({ whatsapp_chat_id: '554199999999@c.us' }));
  });
});

describe('vinculo por /start', () => {
  test('/start nutri:<codigo> vincula o nutricionista usando o chatId do WAHA', async () => {
    mocks.redeemNutriLinkCode.mockResolvedValue({ name: 'Carla Souza' });

    await chamar(requisicao(mensagem({ body: '/start nutri:ABC123' })), resposta());

    expect(mocks.redeemNutriLinkCode).toHaveBeenCalledWith(expect.anything(), 'ABC123', expect.objectContaining({ whatsapp_chat_id: PACIENTE }));
    expect(mocks.sendWhatsAppText).toHaveBeenCalledWith(PACIENTE, expect.stringContaining('Carla'));
  });

  test('/start nutri: em grupo e ignorado em silencio (sem vincular e sem responder no grupo)', async () => {
    const res = resposta();
    await chamar(requisicao(mensagem({ from: '123456@g.us', body: '/start nutri:ABC123' })), res);

    expect(res.body).toEqual({ status: 'ignored' });
    expect(mocks.redeemNutriLinkCode).not.toHaveBeenCalled();
    expect(mocks.sendWhatsAppText).not.toHaveBeenCalled();
  });

  test('/start nutri: com codigo invalido orienta a gerar um novo', async () => {
    mocks.redeemNutriLinkCode.mockResolvedValue(null);

    await chamar(requisicao(mensagem({ body: '/start nutri:ERRADO' })), resposta());

    expect(mocks.sendWhatsAppText).toHaveBeenCalledWith(PACIENTE, expect.stringContaining('Código inválido ou expirado'));
  });

  test('/start sem argumento explica como vincular', async () => {
    await chamar(requisicao(mensagem({ body: '/start' })), resposta());

    expect(mocks.sendWhatsAppText).toHaveBeenCalledWith(PACIENTE, expect.stringContaining('Conectar WhatsApp'));
    expect(mocks.runSecretariaVirtual).not.toHaveBeenCalled();
  });

  test('/start <patientId> de cadastro inexistente avisa que nao encontrou', async () => {
    await chamar(requisicao(mensagem({ body: '/start paciente-que-nao-existe' })), resposta());

    expect(mocks.sendWhatsAppText).toHaveBeenCalledWith(PACIENTE, expect.stringContaining('Não encontrei seu cadastro'));
  });
});
