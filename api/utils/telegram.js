/**
 * Utilitarios de envio via Telegram Bot API - substitui a Evolution API/
 * WhatsApp como canal principal a partir de 12/08/2026 (numero do WhatsApp
 * levou restricao permanente - ver backlog.md "Segurança e confiabilidade").
 */

/**
 * Envia uma mensagem de texto via Telegram Bot API.
 * @param {string|number} chatId - chat_id do paciente (obtido no /start do bot)
 * @param {string} text
 * @returns {Promise<boolean>} true se o Telegram aceitou o envio
 */
export async function sendTelegramText(chatId, text) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    console.error('TELEGRAM_BOT_TOKEN não configurado no ambiente.');
    return false;
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML'
      })
    });

    if (!response.ok) {
      console.error(`Erro Telegram API: ${response.status} - ${await response.text()}`);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Erro ao fazer requisição para Telegram:', error);
    return false;
  }
}

/**
 * Baixa o maior tamanho de uma foto enviada pelo paciente no Telegram e
 * retorna como data URL base64 (mesmo formato que o restante do projeto
 * usa pra mandar imagem pra OpenAI - ver PhotoRecipeGenerator.jsx).
 * @param {string} fileId - Telegram file_id (vem no update de mensagem com foto)
 * @returns {Promise<string|null>} data URL "data:image/jpeg;base64,..." ou null se falhar
 */
export async function fetchTelegramPhotoAsDataUrl(fileId) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    console.error('TELEGRAM_BOT_TOKEN não configurado no ambiente.');
    return null;
  }

  try {
    const fileInfoRes = await fetch(`https://api.telegram.org/bot${token}/getFile?file_id=${fileId}`);
    const fileInfo = await fileInfoRes.json();
    const filePath = fileInfo?.result?.file_path;
    if (!filePath) {
      console.error('Telegram getFile não retornou file_path.');
      return null;
    }

    const fileRes = await fetch(`https://api.telegram.org/file/bot${token}/${filePath}`);
    const arrayBuffer = await fileRes.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    const mimeType = filePath.endsWith('.png') ? 'image/png' : 'image/jpeg';
    return `data:${mimeType};base64,${base64}`;
  } catch (error) {
    console.error('Erro ao baixar foto do Telegram:', error);
    return null;
  }
}

/**
 * Baixa um arquivo de voz/áudio enviado pelo paciente no Telegram como
 * Buffer bruto - usado pra transcrição (quem transcreve é o webhook via
 * Whisper, ver telegram-webhook.js).
 * @param {string} fileId - Telegram file_id de um update com "voice"
 * @returns {Promise<{buffer: Buffer, filename: string}|null>}
 */
export async function fetchTelegramFileAsBuffer(fileId) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    console.error('TELEGRAM_BOT_TOKEN não configurado no ambiente.');
    return null;
  }

  try {
    const fileInfoRes = await fetch(`https://api.telegram.org/bot${token}/getFile?file_id=${fileId}`);
    const fileInfo = await fileInfoRes.json();
    const filePath = fileInfo?.result?.file_path;
    if (!filePath) {
      console.error('Telegram getFile não retornou file_path.');
      return null;
    }

    const fileRes = await fetch(`https://api.telegram.org/file/bot${token}/${filePath}`);
    const arrayBuffer = await fileRes.arrayBuffer();
    const ext = filePath.split('.').pop() || 'oga';
    return { buffer: Buffer.from(arrayBuffer), filename: `audio.${ext}` };
  } catch (error) {
    console.error('Erro ao baixar áudio do Telegram:', error);
    return null;
  }
}

/**
 * Envia uma mensagem com botões de resposta rápida (inline keyboard). Cada
 * botão devolve seu próprio texto como callback_data - o webhook trata o
 * callback_query resultante como se fosse uma mensagem de texto normal do
 * paciente (ver telegram-webhook.js), então a IA nunca precisa saber que
 * veio de um botão em vez de digitado.
 * @param {string|number} chatId
 * @param {string} text
 * @param {string[]} options - 2 a 6 opções curtas
 * @returns {Promise<boolean>}
 */
export async function sendTelegramKeyboard(chatId, text, options) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    console.error('TELEGRAM_BOT_TOKEN não configurado no ambiente.');
    return false;
  }

  // callback_data tem limite de 64 bytes na API do Telegram.
  const buttons = options.map((opt) => ({ text: opt, callback_data: opt.slice(0, 60) }));
  const inline_keyboard = [];
  for (let i = 0; i < buttons.length; i += 2) {
    inline_keyboard.push(buttons.slice(i, i + 2));
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
        reply_markup: { inline_keyboard }
      })
    });

    if (!response.ok) {
      console.error(`Erro Telegram API (keyboard): ${response.status} - ${await response.text()}`);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Erro ao enviar teclado do Telegram:', error);
    return false;
  }
}

/**
 * Confirma o recebimento de um clique em botão inline pro Telegram parar de
 * mostrar o spinner de carregamento no botão clicado.
 * @param {string} callbackQueryId
 * @returns {Promise<boolean>}
 */
export async function answerTelegramCallback(callbackQueryId) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return false;
  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/answerCallbackQuery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ callback_query_id: callbackQueryId })
    });
    return response.ok;
  } catch (error) {
    console.error('Erro ao responder callback do Telegram:', error);
    return false;
  }
}
