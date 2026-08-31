import { auth } from '../services/firebase';

/**
 * Reserva/confirma o CPF de um paciente via /api/patient-cpf-guard - o
 * servidor (Admin SDK) é quem consegue checar unicidade entre pacientes
 * ATIVOS de nutris diferentes, porque o client só enxerga o próprio doc
 * (firestore.rules). Lança erro com `statusCode` quando o servidor recusa
 * (409 = CPF já em uso por outro paciente ativo).
 * Espelha sendTelegramToPatient (src/utils/sendTelegram.js).
 * @param {string} patientId
 * @param {string} cpf
 * @returns {Promise<{ ok: boolean, cpfDigits: string }>}
 */
export async function reserveCpfForPatient(patientId, cpf) {
  if (!auth.currentUser) {
    throw new Error('Você precisa estar logado para continuar.');
  }
  const idToken = await auth.currentUser.getIdToken();

  const response = await fetch('/api/patient-cpf-guard', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${idToken}` },
    body: JSON.stringify({ patientId, cpf }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const err = new Error(data.error || `Falha ao validar CPF (status ${response.status}).`);
    err.statusCode = response.status;
    throw err;
  }
  return data;
}
