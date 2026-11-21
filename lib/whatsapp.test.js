import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import crypto from 'node:crypto';
import {
  toWahaChatId,
  chatIdVariants,
  verifyWahaSignature,
  resolvePhoneChatId,
  lookupPhoneChatIdByLid,
  sendWhatsAppText,
  sendWhatsAppOptionsList,
  fetchWhatsAppMediaAsDataUrl,
  fetchWhatsAppAudioAsBuffer,
} from './whatsapp.js';

const sign = (body, key) => crypto.createHmac('sha512', key).update(body).digest('hex');

describe('toWahaChatId', () => {
  test('converte JID da Evolution para o formato @c.us do WAHA', () => {
    expect(toWahaChatId('554199999999@s.whatsapp.net')).toBe('554199999999@c.us');
  });
  test('aceita @c.us e numero cru com mascara', () => {
    expect(toWahaChatId('554199999999@c.us')).toBe('554199999999@c.us');
    expect(toWahaChatId('+55 (41) 99999-9999')).toBe('5541999999999@c.us');
  });
});

describe('chatIdVariants', () => {
  test('devolve as duas formas gravadas no Firestore', () => {
    expect(chatIdVariants('554199999999@c.us')).toEqual([
      '554199999999@c.us',
      '554199999999@s.whatsapp.net',
    ]);
    expect(chatIdVariants('554199999999@s.whatsapp.net')).toEqual(chatIdVariants('554199999999@c.us'));
  });
});

describe('verifyWahaSignature', () => {
  const corpo = Buffer.from('{"event":"message"}');

  test('aceita assinatura HMAC-SHA512 correta', () => {
    expect(verifyWahaSignature(corpo, sign(corpo, 'segredo'), 'segredo')).toBe(true);
  });
  test('rejeita assinatura errada, ausente ou de tamanho diferente', () => {
    expect(verifyWahaSignature(corpo, sign(corpo, 'outro'), 'segredo')).toBe(false);
    expect(verifyWahaSignature(corpo, undefined, 'segredo')).toBe(false);
    expect(verifyWahaSignature(corpo, 'abc', 'segredo')).toBe(false);
  });
  test('falha fechada sem chave ou sem corpo bruto', () => {
    expect(verifyWahaSignature(corpo, sign(corpo, ''), '')).toBe(false);
    expect(verifyWahaSignature(undefined, sign(corpo, 'segredo'), 'segredo')).toBe(false);
  });
});

describe('envio e midia via WAHA', () => {
  beforeEach(() => {
    process.env.WAHA_URL = 'http://waha:3000';
    process.env.WAHA_API_KEY = 'chave';
    process.env.WAHA_SESSION = 'default';
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.WAHA_URL;
    delete process.env.WAHA_API_KEY;
    delete process.env.WAHA_SESSION;
  });

  test('sendWhatsAppText chama /api/sendText com X-Api-Key e chatId @c.us', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal('fetch', fetchMock);

    const ok = await sendWhatsAppText('554199999999@s.whatsapp.net', 'oi');

    expect(ok).toBe(true);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('http://waha:3000/api/sendText');
    expect(init.headers['X-Api-Key']).toBe('chave');
    expect(JSON.parse(init.body)).toEqual({ session: 'default', chatId: '554199999999@c.us', text: 'oi' });
  });

  test('sendWhatsAppText devolve false quando o WAHA recusa ou nao esta configurado', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 500, text: async () => 'erro' }));
    expect(await sendWhatsAppText('554199999999@c.us', 'oi')).toBe(false);

    delete process.env.WAHA_URL;
    expect(await sendWhatsAppText('554199999999@c.us', 'oi')).toBe(false);
  });

  test('sendWhatsAppOptionsList numera as opcoes em texto puro', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal('fetch', fetchMock);

    await sendWhatsAppOptionsList('554199999999@c.us', 'Qual refeicao?', ['Almoco', 'Jantar']);

    expect(JSON.parse(fetchMock.mock.calls[0][1].body).text).toBe('Qual refeicao?\n\n1) Almoco\n2) Jantar');
  });

  test('midia: baixa pela URL do payload usando o host do WAHA_URL', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      arrayBuffer: async () => Uint8Array.from([1, 2, 3]).buffer,
    });
    vi.stubGlobal('fetch', fetchMock);
    const payload = { media: { url: 'http://localhost:3000/api/files/a.jpg', mimetype: 'image/jpeg' } };

    const dataUrl = await fetchWhatsAppMediaAsDataUrl(payload);

    expect(fetchMock.mock.calls[0][0]).toBe('http://waha:3000/api/files/a.jpg');
    expect(fetchMock.mock.calls[0][1].headers['X-Api-Key']).toBe('chave');
    expect(dataUrl).toBe('data:image/jpeg;base64,AQID');
  });

  test('audio: devolve buffer e nome .ogg', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      arrayBuffer: async () => Uint8Array.from([9, 9]).buffer,
    }));
    const payload = { media: { url: 'http://localhost:3000/api/files/a.ogg', mimetype: 'audio/ogg; codecs=opus' } };

    const audio = await fetchWhatsAppAudioAsBuffer(payload);

    expect(audio.filename).toBe('audio.ogg');
    expect([...audio.buffer]).toEqual([9, 9]);
  });

  test('midia sem media.url devolve null sem chamar a rede', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    expect(await fetchWhatsAppMediaAsDataUrl({ media: { url: null, mimetype: 'image/jpeg' } })).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test.each([
    ['rota da API fora de /api/files/', 'http://localhost:3000/api/sessions'],
    ['path traversal', 'http://localhost:3000/api/files/../sessions'],
    ['path traversal codificado', 'http://localhost:3000/api/files/%2e%2e/sessions'],
  ])('midia com media.url em %s nao e baixada (X-Api-Key nao sai)', async (_nome, url) => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    expect(await fetchWhatsAppMediaAsDataUrl({ media: { url, mimetype: 'image/jpeg' } })).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test('midia com URL de outro host tem o host trocado pelo WAHA_URL (a chave so vai pro WAHA)', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, arrayBuffer: async () => new ArrayBuffer(1) });
    vi.stubGlobal('fetch', fetchMock);

    await fetchWhatsAppMediaAsDataUrl({ media: { url: 'https://evil.example/api/files/a.jpg', mimetype: 'image/jpeg' } });

    expect(fetchMock.mock.calls[0][0]).toBe('http://waha:3000/api/files/a.jpg');
  });

  test('mimetype malformado e trocado por application/octet-stream', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, arrayBuffer: async () => new ArrayBuffer(1) }));

    const dataUrl = await fetchWhatsAppMediaAsDataUrl({
      media: { url: 'http://localhost:3000/api/files/a.jpg', mimetype: 'image/jpeg,<script>' },
    });

    expect(dataUrl.startsWith('data:application/octet-stream;base64,')).toBe(true);
  });

  test('midia acima do limite (content-length) ou com erro HTTP devolve null', async () => {
    const payload = { media: { url: 'http://localhost:3000/api/files/a.jpg', mimetype: 'image/jpeg' } };

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      headers: { get: () => String(20 * 1024 * 1024) },
      arrayBuffer: async () => new ArrayBuffer(1),
    }));
    expect(await fetchWhatsAppMediaAsDataUrl(payload)).toBeNull();

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 404 }));
    expect(await fetchWhatsAppMediaAsDataUrl(payload)).toBeNull();
  });
});

describe('resolvePhoneChatId (remetente @lid)', () => {
  test('remetente com telefone normal passa direto', () => {
    expect(resolvePhoneChatId({ from: '554199999999@c.us' })).toBe('554199999999@c.us');
  });
  test('@lid usa o telefone alternativo que o WhatsApp manda no payload', () => {
    const payload = { from: '11223344556677@lid', _data: { key: { remoteJidAlt: '5541999990000@s.whatsapp.net' } } };
    expect(resolvePhoneChatId(payload)).toBe('5541999990000@c.us');
  });
  test('@lid sem telefone alternativo devolve null', () => {
    expect(resolvePhoneChatId({ from: '11223344556677@lid', _data: { key: {} } })).toBeNull();
    expect(resolvePhoneChatId({ from: '11223344556677@lid' })).toBeNull();
  });
  test('ignora telefone alternativo malformado', () => {
    const payload = { from: '1@lid', _data: { key: { remoteJidAlt: '123@g.us' } } };
    expect(resolvePhoneChatId(payload)).toBeNull();
  });
});

describe('lookupPhoneChatIdByLid (API do WAHA)', () => {
  beforeEach(() => {
    process.env.WAHA_URL = 'http://waha:3000';
    process.env.WAHA_API_KEY = 'chave';
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.WAHA_URL;
    delete process.env.WAHA_API_KEY;
  });

  test('consulta /lids/{lid} e devolve o telefone em @c.us', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ lid: '11223344556677@lid', pn: '5541999990000@c.us' }) });
    vi.stubGlobal('fetch', fetchMock);

    expect(await lookupPhoneChatIdByLid('11223344556677@lid')).toBe('5541999990000@c.us');
    expect(fetchMock.mock.calls[0][0]).toBe('http://waha:3000/api/default/lids/11223344556677%40lid');
    expect(fetchMock.mock.calls[0][1].headers['X-Api-Key']).toBe('chave');
  });

  test('devolve null quando o WAHA nao conhece o LID, recusa ou esta sem store', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ lid: 'x@lid', pn: null }) }));
    expect(await lookupPhoneChatIdByLid('x@lid')).toBeNull();

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 400, text: async () => 'Enable NOWEB store' }));
    expect(await lookupPhoneChatIdByLid('x@lid')).toBeNull();
  });
});

describe('verifyWahaSignature com hex em maiusculas', () => {
  test('aceita, pois e a mesma assinatura', () => {
    const corpo = Buffer.from('{"a":1}');
    expect(verifyWahaSignature(corpo, sign(corpo, 'k').toUpperCase(), 'k')).toBe(true);
  });
});
