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
