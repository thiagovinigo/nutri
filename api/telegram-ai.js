import { sendTelegramText } from './utils/telegram.js';
import { runSecretariaVirtual } from './utils/secretariaVirtual.js';

/**
 * Processa a mensagem usando a Secretária Virtual (IA) e responde pelo
 * Telegram. Equivalente ao processWhatsAppMessage de whatsapp-ai.js, mas
 * pro canal ativo desde 12/08/2026.
 */
export async function processTelegramMessage(patientId, patientData, textContent, chatId) {
  const replyText = await runSecretariaVirtual(patientId, patientData, textContent);
  if (!replyText) return;

  const ok = await sendTelegramText(chatId, replyText);
  if (ok) {
    console.log('Mensagem Telegram enviada com sucesso.');
  }
}
