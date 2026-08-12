import { sendWhatsAppText } from './utils/whatsapp.js';
import { runSecretariaVirtual } from './utils/secretariaVirtual.js';

/**
 * Processa a mensagem usando a Secretária Virtual (IA) e responde pelo
 * WhatsApp. Lógica de IA/histórico vive em utils/secretariaVirtual.js,
 * compartilhada com o canal do Telegram (telegram-ai.js) - canal dormente
 * desde 12/08/2026 (número restrito permanentemente pelo WhatsApp), mantido
 * funcional pra caso volte a ser usado no futuro.
 */
export async function processWhatsAppMessage(phoneNumber, patientId, patientData, textContent, remoteJid) {
  const replyText = await runSecretariaVirtual(patientId, patientData, textContent);
  if (!replyText) return;

  const ok = await sendWhatsAppText(remoteJid, replyText);
  if (ok) {
    // Nao loga o remoteJid completo (numero de telefone) - so confirma o envio.
    console.log('Mensagem enviada com sucesso.');
  }
}
