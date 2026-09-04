/**
 * Utilitarios de envio/recebimento via Evolution API (WhatsApp self-hosted) -
 * mesma funcao que lib/telegram.js cumpre pro Telegram, so que pro canal
 * WhatsApp. Ver backlog.md "Migração WhatsApp → Telegram (12/08/2026)" pro
 * historico do numero anterior banido - este e um numero novo, infra propria
 * (VPS + Evolution API), sem envio em massa/proativo (so responde mensagem
 * iniciada pelo paciente, igual ao Telegram).
 */

/**
 * Remove o sufixo de JID do WhatsApp (@s.whatsapp.net, @g.us etc) e qualquer
 * caractere nao-numerico, deixando so os digitos do numero - formato que a
 * Evolution API espera no campo "number" ao enviar.
 * @param {string} chatId - JID completo (ex: "554199999999@s.whatsapp.net") ou numero cru
 * @returns {string}
 */
function normalizeWhatsAppNumber(chatId) {
  return String(chatId || '').split('@')[0].replace(/\D/g, '');
}

/**
 * Envia uma mensagem de texto via Evolution API.
 * @param {string} chatId - whatsapp_chat_id do paciente (JID ou numero)
 * @param {string} text
 * @returns {Promise<boolean>} true se a Evolution API aceitou o envio
 */
export async function sendWhatsAppText(chatId, text) {
  const apiUrl = process.env.EVOLUTION_API_URL;
  const apiKey = process.env.EVOLUTION_API_KEY;
  const instance = process.env.EVOLUTION_INSTANCE_NAME;
  if (!apiUrl || !apiKey || !instance) {
    console.error('EVOLUTION_API_URL/EVOLUTION_API_KEY/EVOLUTION_INSTANCE_NAME não configurados no ambiente.');
    return false;
  }

  try {
    const response = await fetch(`${apiUrl}/message/sendText/${instance}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: apiKey },
      body: JSON.stringify({
        number: normalizeWhatsAppNumber(chatId),
        text
      })
    });

    if (!response.ok) {
      console.error(`Erro Evolution API (sendText): ${response.status} - ${await response.text()}`);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Erro ao fazer requisição para Evolution API:', error);
    return false;
  }
}

/**
 * Envia uma pergunta de multipla escolha como lista numerada em texto puro -
 * DELIBERADAMENTE sem usar list/button messages nativas do WhatsApp (esse
 * recurso via Baileys e um padrao que a Meta associa a automacao/cliente
 * nao-oficial, o mesmo tipo de sinal que provavelmente contribuiu pro
 * banimento do numero anterior). O webhook aceita tanto o numero quanto o
 * texto da opcao como resposta (ver whatsapp-webhook.js).
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
 * Baixa uma midia (foto) recebida no webhook e retorna como data URL base64 -
 * mesmo formato que fetchTelegramPhotoAsDataUrl usa, pra reaproveitar o
 * caminho multimodal ja existente em secretariaVirtual.js.
 * @param {{id: string}} messageKey - data.key do payload do webhook (precisa do "id")
 * @returns {Promise<string|null>}
 */
export async function fetchWhatsAppMediaAsDataUrl(messageKey) {
  const media = await fetchWhatsAppMediaBase64(messageKey);
  if (!media) return null;
  return `data:${media.mimetype};base64,${media.base64}`;
}

/**
 * Baixa uma midia (audio/nota de voz) recebida no webhook como Buffer bruto -
 * usado pra transcricao via Whisper (ver transcribeAudioWithWhisper em
 * secretariaVirtual.js).
 * @param {{id: string}} messageKey - data.key do payload do webhook
 * @returns {Promise<{buffer: Buffer, filename: string}|null>}
 */
export async function fetchWhatsAppAudioAsBuffer(messageKey) {
  const media = await fetchWhatsAppMediaBase64(messageKey);
  if (!media) return null;
  const ext = (media.mimetype || '').includes('ogg') ? 'ogg' : 'mp3';
  return { buffer: Buffer.from(media.base64, 'base64'), filename: `audio.${ext}` };
}

/**
 * Chamada compartilhada pelas duas funcoes de midia acima - baixa o base64
 * bruto + mimetype de uma mensagem via Evolution API.
 * @param {{id: string}} messageKey
 * @returns {Promise<{base64: string, mimetype: string}|null>}
 */
async function fetchWhatsAppMediaBase64(messageKey) {
  const apiUrl = process.env.EVOLUTION_API_URL;
  const apiKey = process.env.EVOLUTION_API_KEY;
  const instance = process.env.EVOLUTION_INSTANCE_NAME;
  if (!apiUrl || !apiKey || !instance) {
    console.error('EVOLUTION_API_URL/EVOLUTION_API_KEY/EVOLUTION_INSTANCE_NAME não configurados no ambiente.');
    return null;
  }

  try {
    const response = await fetch(`${apiUrl}/chat/getBase64FromMediaMessage/${instance}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: apiKey },
      body: JSON.stringify({
        message: { key: messageKey },
        convertToMp4: false
      })
    });

    if (!response.ok) {
      console.error(`Erro Evolution API (getBase64FromMediaMessage): ${response.status} - ${await response.text()}`);
      return null;
    }

    const data = await response.json();
    if (!data?.base64) {
      console.error('Evolution API não retornou base64 pra mídia.');
      return null;
    }
    return { base64: data.base64, mimetype: data.mimetype || 'application/octet-stream' };
  } catch (error) {
    console.error('Erro ao baixar mídia da Evolution API:', error);
    return null;
  }
}
