import { describe, test, expect, vi, beforeEach } from 'vitest';

const mocks = vi.hoisted(() => ({
  sendTelegramText: vi.fn().mockResolvedValue(true),
  runSecretariaVirtual: vi.fn(),
  redeemNutriLinkCode: vi.fn(),
  redeemPatientLinkCode: vi.fn(),
  docGet: vi.fn(),
  docSet: vi.fn(),
}));

vi.mock('./firebase-admin.js', () => ({
  db: {
    collection: () => ({
      doc: () => ({ get: mocks.docGet, set: mocks.docSet }),
      where: () => ({ limit: () => ({ get: async () => ({ empty: true, docs: [] }) }) }),
    }),
  },
}));
vi.mock('./telegram.js', () => ({
  sendTelegramText: mocks.sendTelegramText,
  sendTelegramKeyboard: vi.fn(),
  answerTelegramCallback: vi.fn(),
  fetchTelegramPhotoAsDataUrl: vi.fn(),
  fetchTelegramFileAsBuffer: vi.fn(),
}));
vi.mock('./secretariaVirtual.js', () => ({
  runSecretariaVirtual: mocks.runSecretariaVirtual,
  transcribeAudioWithWhisper: vi.fn(),
}));
vi.mock('./nutriLinkServer.js', () => ({
  redeemNutriLinkCode: mocks.redeemNutriLinkCode,
  redeemPatientLinkCode: mocks.redeemPatientLinkCode,
}));

import handler from '../api/telegram-webhook.js';

const SEGREDO = 'segredo-de-teste';
const CHAT = 111222333;
const CODIGO = 'd'.repeat(32);

const requisicao = (texto, { tipo = 'private', segredo = SEGREDO } = {}) => ({
  method: 'POST',
  headers: { 'x-telegram-bot-api-secret-token': segredo },
  body: { message: { chat: { id: CHAT, type: tipo }, text: texto } },
});

function resposta() {
  return {
    code: null,
    body: null,
    status(code) { this.code = code; return this; },
    json(body) { this.body = body; return this; },
    send(body) { this.body = body; return this; },
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  process.env.TELEGRAM_WEBHOOK_SECRET = SEGREDO;
});

describe('autenticacao', () => {
  test('401 com o segredo errado e nada e processado', async () => {
    const res = resposta();
    await handler(requisicao(`/start ${CODIGO}`, { segredo: 'errado' }), res);

    expect(res.code).toBe(401);
    expect(mocks.redeemPatientLinkCode).not.toHaveBeenCalled();
  });
});

describe('vinculo do paciente por /start', () => {
  test('codigo valido vincula o chat do Telegram ao paciente dono do codigo', async () => {
    mocks.redeemPatientLinkCode.mockResolvedValue({ name: 'Ana Souza' });

    await handler(requisicao(`/start ${CODIGO}`), resposta());

    expect(mocks.redeemPatientLinkCode).toHaveBeenCalledWith(expect.anything(), CODIGO, expect.objectContaining({ telegram_chat_id: CHAT }));
    expect(mocks.sendTelegramText).toHaveBeenCalledWith(CHAT, expect.stringContaining('Prontinho, Ana!'));
  });

  test('aceita a forma /start@NomeDoBot <codigo>', async () => {
    mocks.redeemPatientLinkCode.mockResolvedValue({ name: 'Ana' });

    await handler(requisicao(`/start@NutrivvoBot ${CODIGO}`), resposta());

    expect(mocks.redeemPatientLinkCode).toHaveBeenCalledWith(expect.anything(), CODIGO, expect.anything());
  });

  test('codigo invalido ou expirado orienta a gerar outro no app', async () => {
    mocks.redeemPatientLinkCode.mockResolvedValue(null);

    await handler(requisicao(`/start ${CODIGO}`), resposta());

    expect(mocks.sendTelegramText).toHaveBeenCalledWith(CHAT, expect.stringContaining('Código inválido ou expirado'));
  });

  test('formato antigo /start <patientId> NAO vincula: pede um link novo, sem resgatar nem ler o banco', async () => {
    await handler(requisicao('/start paciente-id-antigo'), resposta());

    expect(mocks.redeemPatientLinkCode).not.toHaveBeenCalled();
    expect(mocks.docGet).not.toHaveBeenCalled();
    expect(mocks.docSet).not.toHaveBeenCalled();
    expect(mocks.sendTelegramText).toHaveBeenCalledWith(CHAT, expect.stringContaining('antigo'));
    expect(mocks.sendTelegramText).toHaveBeenCalledWith(CHAT, expect.stringContaining('Conectar Telegram'));
  });

  test('em grupo nao vincula (o chat do grupo receberia os dados de saude do paciente)', async () => {
    await handler(requisicao(`/start ${CODIGO}`, { tipo: 'group' }), resposta());

    expect(mocks.redeemPatientLinkCode).not.toHaveBeenCalled();
    expect(mocks.sendTelegramText).toHaveBeenCalledWith(CHAT, expect.stringContaining('conversa privada'));
  });

  test('/start sem argumento explica como vincular', async () => {
    await handler(requisicao('/start'), resposta());

    expect(mocks.redeemPatientLinkCode).not.toHaveBeenCalled();
    expect(mocks.sendTelegramText).toHaveBeenCalledWith(CHAT, expect.stringContaining('Conectar Telegram'));
  });
});

describe('vinculo do nutricionista (inalterado)', () => {
  test('/start nutri:<codigo> continua usando o resgate do nutri', async () => {
    mocks.redeemNutriLinkCode.mockResolvedValue({ name: 'Carla Souza' });

    await handler(requisicao('/start nutri:ABC123'), resposta());

    expect(mocks.redeemNutriLinkCode).toHaveBeenCalledWith(expect.anything(), 'ABC123', expect.objectContaining({ telegram_chat_id: CHAT }));
    expect(mocks.redeemPatientLinkCode).not.toHaveBeenCalled();
  });
});
