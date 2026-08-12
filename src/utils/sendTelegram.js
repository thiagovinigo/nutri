import { auth } from '../services/firebase';

/**
 * Envia uma mensagem de Telegram pro paciente via /api/send-telegram.
 * Espelha sendWhatsApp.js (dormente desde 12/08/2026) - servidor busca o
 * chat_id real do paciente no Firestore e valida dono, nunca aceita ID
 * livre vindo do client.
 * @param {string} patientId
 * @param {string} message
 * @returns {Promise<boolean>} true se o Telegram aceitou o envio
 */
export async function sendTelegramToPatient(patientId, message) {
  if (!auth.currentUser) {
    throw new Error('Você precisa estar logado para enviar mensagens.');
  }
  const idToken = await auth.currentUser.getIdToken();

  const response = await fetch('/api/send-telegram', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${idToken}` },
    body: JSON.stringify({ patientId, message }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || `Falha ao enviar mensagem (status ${response.status}).`);
  }
  return Boolean(data.success);
}
