import { auth } from '../services/firebase';

/**
 * Chama /api/admin - o servidor decide quem é admin (env var ADMIN_UID,
 * nunca exposta ao client) e faz toda a leitura entre tenants via Admin SDK,
 * porque firestore.rules não deixa o client ver dado de outro nutricionista.
 * Espelha checkCpfUnique.js / sendTelegram.js.
 * @param {string} action
 * @param {object} [payload]
 */
async function callAdmin(action, payload = {}) {
  if (!auth.currentUser) {
    throw new Error('Você precisa estar logado.');
  }
  const idToken = await auth.currentUser.getIdToken();

  const response = await fetch('/api/admin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${idToken}` },
    body: JSON.stringify({ action, ...payload }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const err = new Error(data.error || `Falha na ação de admin (status ${response.status}).`);
    err.statusCode = response.status;
    throw err;
  }
  return data;
}

export const adminWhoami = () => callAdmin('whoami');
export const adminGetMetrics = () => callAdmin('metrics');
export const adminListNutris = () => callAdmin('list_nutris');
export const adminListConflicts = () => callAdmin('list_conflicts');
export const adminResolveConflict = (keepPatientId, archivePatientId) =>
  callAdmin('resolve_conflict', { keepPatientId, archivePatientId });
