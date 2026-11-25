/**
 * Utilitarios de envio/recebimento via WAHA (WhatsApp HTTP API, self-hosted) -
 * mesma funcao que lib/telegram.js cumpre pro Telegram, so que pro canal
 * WhatsApp. Substitui a Evolution API (numero queimado 3 vezes, ver
 * backlog.md "Migração WhatsApp → Telegram (12/08/2026)" e
 * ".claude/prds/waha-whatsapp.prd.md"). Sem envio em massa/proativo: so
 * responde mensagem iniciada pelo paciente, igual ao Telegram.
 */
import crypto from 'node:crypto';

const MEDIA_TIMEOUT_MS = 15000;
const MEDIA_MAX_BYTES = 15 * 1024 * 1024; // acima disso nem foto nem áudio de WhatsApp é razoável
const MEDIA_PATH_PREFIX = '/api/files/';
const SAFE_MIMETYPE = /^[a-z]+\/[\w.+-]+(;\s*[\w=.+-]+)*$/i;

/**
 * Deixa so os digitos do numero de um chatId do WhatsApp, descartando o
 * sufixo de JID (@c.us, @s.whatsapp.net, @g.us, @lid) e qualquer mascara.
 * @param {string} chatId
 * @returns {string}
 */
function digitsOf(chatId) {
  return String(chatId || '').split('@')[0].replace(/\D/g, '');
}

/**
 * chatId no formato que o WAHA espera (<numero>@c.us).
 * @param {string} chatId - JID (@c.us ou @s.whatsapp.net) ou numero cru
 * @returns {string}
 */
export function toWahaChatId(chatId) {
  return `${digitsOf(chatId)}@c.us`;
}

/**
 * Todas as formas em que o mesmo numero pode estar gravado em
 * patients/nutris.whatsapp_chat_id: @c.us (WAHA) e @s.whatsapp.net (Evolution,
 * vinculos antigos) - permite achar o paciente sem migrar o Firestore.
 * @param {string} chatId
 * @returns {string[]}
 */
export function chatIdVariants(chatId) {
  const digits = digitsOf(chatId);
  return [`${digits}@c.us`, `${digits}@s.whatsapp.net`];
}

const PHONE_JID = /^\d{8,15}@(c\.us|s\.whatsapp\.net)$/;

/**
 * Descobre o chatId de TELEFONE do remetente. O WhatsApp passou a identificar
 * contas por um ID oculto (@lid) em vez do número; nesses casos o payload
 * costuma trazer o telefone num campo alternativo (remoteJidAlt). Remetente que
 * já vem como telefone passa direto.
 * @param {{from?: string, _data?: {key?: object}}} payload
 * @returns {string|null} chatId @c.us/@s.whatsapp.net, ou null se for @lid sem telefone no payload
 */
export function resolvePhoneChatId(payload) {
  const from = String(payload?.from || '');
  if (!from.endsWith('@lid')) return from;
  const key = payload?._data?.key || {};
  const alt = [key.remoteJidAlt, key.participantAlt, payload?._data?.senderPn, payload?.senderPn]
    .find((candidate) => typeof candidate === 'string' && PHONE_JID.test(candidate));
  return alt ? toWahaChatId(alt) : null;
}

/**
 * Plano B quando o payload não traz o telefone: pergunta ao WAHA qual número
 * pertence ao @lid (GET /api/{session}/lids/{lid}). No motor NOWEB isso exige
 * o "store" ligado na sessão; sem ele o WAHA responde 400 e devolvemos null.
 * @param {string} lid - ex.: "11223344556677@lid"
 * @returns {Promise<string|null>}
 */
export async function lookupPhoneChatIdByLid(lid) {
  const config = getWahaConfig();
  if (!config) return null;

  try {
    const response = await fetch(`${config.apiUrl}/api/${config.session}/lids/${encodeURIComponent(lid)}`, {
      headers: { 'X-Api-Key': config.apiKey },
      signal: AbortSignal.timeout(MEDIA_TIMEOUT_MS)
    });
    if (!response.ok) {
      console.error(`Erro WAHA (lids): ${response.status} - ${(await response.text()).slice(0, 200)}`);
      return null;
    }
    const data = await response.json();
    return typeof data?.pn === 'string' && PHONE_JID.test(data.pn) ? toWahaChatId(data.pn) : null;
  } catch (error) {
    console.error('Erro ao consultar LID no WAHA:', error);
    return null;
  }
}

/**
 * Valida a assinatura HMAC-SHA512 que o WAHA manda em X-Webhook-Hmac,
 * calculada sobre o CORPO BRUTO da requisicao (nao sobre o JSON reserializado).
 * Falha fechada: sem chave, sem corpo bruto ou sem assinatura, rejeita.
 * @param {Buffer|string|undefined} rawBody
 * @param {string|undefined} signature - valor do header X-Webhook-Hmac (hex)
 * @param {string|undefined} key - WAHA_WEBHOOK_HMAC_KEY
 * @returns {boolean}
 */
export function verifyWahaSignature(rawBody, signature, key) {
  if (!key || !rawBody || !signature) return false;
  const expected = Buffer.from(crypto.createHmac('sha512', key).update(rawBody).digest('hex'));
  const received = Buffer.from(String(signature).toLowerCase());
  return expected.length === received.length && crypto.timingSafeEqual(expected, received);
}

/**
 * Le a configuracao do WAHA do ambiente.
 * @returns {{apiUrl: string, apiKey: string, session: string}|null}
 */
function getWahaConfig() {
  const apiUrl = process.env.WAHA_URL;
  const apiKey = process.env.WAHA_API_KEY;
  if (!apiUrl || !apiKey) {
    console.error('WAHA_URL/WAHA_API_KEY não configurados no ambiente.');
    return null;
  }
  return {
    apiUrl: apiUrl.replace(/\/+$/, ''),
    apiKey,
    session: process.env.WAHA_SESSION || 'default'
  };
}

/**
 * Calcula o tempo de "digitando..." proporcional ao tamanho da mensagem
 * (1s base + 40ms por caractere, limitado a 8s — mesma regra de ritmo.py).
 * @param {string} text
 * @returns {number} milissegundos
 */
export function computeTypingDelayMs(text) {
  return Math.min(1000 + 40 * String(text || '').length, 8000);
}

/**
 * Envia evento opcional de presença (/api/sendSeen, /api/startTyping,
 * /api/stopTyping). Se falhar, apenas ignora para não bloquear a resposta.
 */
async function postWahaOptional(config, path, wahaChatId) {
  try {
    await fetch(`${config.apiUrl}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Api-Key': config.apiKey },
      body: JSON.stringify({ session: config.session, chatId: wahaChatId })
    });
  } catch {
    // presença é best-effort
  }
}

/**
 * Envia uma mensagem de texto pelo WAHA com ritmo humano (visto, digitando,
 * pausa proporcional ao texto, parar digitando e envio).
 * @param {string} chatId - whatsapp_chat_id do paciente (JID ou numero)
 * @param {string} text
 * @param {{ delayMs?: number }} [options]
 * @returns {Promise<boolean>} true se o WAHA aceitou o envio
 */
export async function sendWhatsAppText(chatId, text, options = {}) {
  const config = getWahaConfig();
  if (!config) return false;

  const wahaChatId = toWahaChatId(chatId);
  const delayMs = options.delayMs !== undefined
    ? options.delayMs
    : (process.env.VITEST ? 0 : computeTypingDelayMs(text));

  try {
    await postWahaOptional(config, '/api/sendSeen', wahaChatId);
    await postWahaOptional(config, '/api/startTyping', wahaChatId);
    if (delayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
    await postWahaOptional(config, '/api/stopTyping', wahaChatId);

    const response = await fetch(`${config.apiUrl}/api/sendText`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Api-Key': config.apiKey },
      body: JSON.stringify({
        session: config.session,
        chatId: wahaChatId,
        text
      })
    });

    if (!response.ok) {
      console.error(`Erro WAHA (sendText): ${response.status} - ${(await response.text()).slice(0, 200)}`);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Erro ao fazer requisição para o WAHA:', error);
    return false;
  }
}

/**
 * Envia uma pergunta de multipla escolha como lista numerada em texto puro -
 * DELIBERADAMENTE sem usar list/button messages nativas do WhatsApp (esse
 * recurso e um padrao que a Meta associa a automacao/cliente nao-oficial, o
 * mesmo tipo de sinal que provavelmente contribuiu pro banimento dos numeros
 * anteriores). O webhook aceita tanto o numero quanto o texto da opcao como
 * resposta (ver whatsapp-webhook.js).
 * @param {string} chatId
 * @param {string} text
 * @param {string[]} options
 * @returns {Promise<boolean>}
 */
export async function sendWhatsAppOptionsList(chatId, text, options) {
  const numberedOptions = options.map((opt, i) => `${i + 1}) ${opt}`).join('\n');
  return sendWhatsAppText(chatId, `${text}\n\n${numberedOptions}`);
}

/**
 * Baixa a midia (foto) de uma mensagem recebida e retorna como data URL
 * base64 - mesmo formato que fetchTelegramPhotoAsDataUrl usa, pra reaproveitar
 * o caminho multimodal ja existente em secretariaVirtual.js.
 * @param {{media?: {url?: string|null, mimetype?: string}}} payload - payload da mensagem no webhook do WAHA
 * @returns {Promise<string|null>}
 */
export async function fetchWhatsAppMediaAsDataUrl(payload) {
  const media = await downloadWhatsAppMedia(payload);
  if (!media) return null;
  return `data:${media.mimetype};base64,${media.buffer.toString('base64')}`;
}

/**
 * Baixa a midia (audio/nota de voz) de uma mensagem recebida como Buffer
 * bruto - usado pra transcricao via Whisper (ver transcribeAudioWithWhisper
 * em secretariaVirtual.js).
 * @param {{media?: {url?: string|null, mimetype?: string}}} payload
 * @returns {Promise<{buffer: Buffer, filename: string}|null>}
 */
export async function fetchWhatsAppAudioAsBuffer(payload) {
  const media = await downloadWhatsAppMedia(payload);
  if (!media) return null;
  const ext = media.mimetype.includes('ogg') ? 'ogg' : 'mp3';
  return { buffer: media.buffer, filename: `audio.${ext}` };
}

/**
 * Chamada compartilhada pelas duas funcoes de midia acima. O WAHA ja baixa a
 * midia e entrega uma URL no payload (media.url); o host dessa URL e o que o
 * proprio WAHA enxerga (ex.: localhost), entao troca pelo WAHA_URL, que e o
 * endereco que este servidor realmente alcanca.
 * @param {{media?: {url?: string|null, mimetype?: string}}} payload
 * @returns {Promise<{buffer: Buffer, mimetype: string}|null>}
 */
async function downloadWhatsAppMedia(payload) {
  const config = getWahaConfig();
  if (!config) return null;

  const mediaUrl = payload?.media?.url;
  if (!mediaUrl) {
    console.error('WAHA não entregou media.url (download de mídia desligado ou falhou).');
    return null;
  }

  try {
    const target = new URL(config.apiUrl);
    const url = new URL(mediaUrl);
    url.protocol = target.protocol;
    url.host = target.host;

    // Defesa em profundidade: a X-Api-Key só deve acompanhar um GET de arquivo
    // de mídia do WAHA, nunca de outra rota da API (sessões, screenshot etc.).
    if (!url.pathname.startsWith(MEDIA_PATH_PREFIX) || /\.\.|%2e/i.test(url.pathname)) {
      console.error('WAHA media.url fora do caminho esperado; download ignorado.');
      return null;
    }

    const response = await fetch(url.toString(), {
      headers: { 'X-Api-Key': config.apiKey },
      signal: AbortSignal.timeout(MEDIA_TIMEOUT_MS)
    });
    if (!response.ok) {
      console.error(`Erro WAHA (download de mídia): ${response.status}`);
      return null;
    }

    const declaredSize = Number(response.headers?.get?.('content-length') || 0);
    if (declaredSize > MEDIA_MAX_BYTES) {
      console.error(`Mídia do WAHA acima do limite (${declaredSize} bytes).`);
      return null;
    }
    const buffer = Buffer.from(await response.arrayBuffer());
    if (buffer.length > MEDIA_MAX_BYTES) {
      console.error(`Mídia do WAHA acima do limite (${buffer.length} bytes).`);
      return null;
    }

    // O mimetype entra cru num data URL: só aceita o formato type/subtype simples.
    const rawMimetype = String(payload.media.mimetype || '');
    return {
      buffer,
      mimetype: SAFE_MIMETYPE.test(rawMimetype) ? rawMimetype : 'application/octet-stream'
    };
  } catch (error) {
    console.error('Erro ao baixar mídia do WAHA:', error);
    return null;
  }
}
