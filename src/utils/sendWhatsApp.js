import { auth } from '../services/firebase';

/**
 * Envia uma mensagem de WhatsApp pro paciente via /api/send-whatsapp.
 * O servidor busca o telefone real do paciente no Firestore e valida que
 * quem chama é o nutricionista dono dele - nunca aceita um telefone livre
 * vindo do client (ver achado CRITICAL da auditoria de segurança de
 * 11/08/2026, api/send-whatsapp.js).
 * @param {string} patientId
 * @param {string} message
 * @returns {Promise<boolean>} true se a Evolution API aceitou o envio
 */
export async function sendWhatsAppToPatient(patientId, message) {
  if (!auth.currentUser) {
    throw new Error('Você precisa estar logado para enviar mensagens.');
  }
  const idToken = await auth.currentUser.getIdToken();

  const response = await fetch('/api/send-whatsapp', {
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
