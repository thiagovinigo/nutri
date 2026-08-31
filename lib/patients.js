/**
 * Lógica pura (sem firebase-admin) do índice de unicidade de CPF entre
 * pacientes ATIVOS. Extraída pra ser testável sem credenciais do Firebase -
 * mesmo espírito de lib/meals.js. Usada por api/patient-cpf-guard.js e
 * api/admin.js. Vive em lib/ (fora de api/) pra não contar no limite de 12
 * Serverless Functions do plano Hobby da Vercel.
 */

/**
 * @param {string} cpf
 * @returns {string} só os dígitos do CPF (pode ter menos de 11 se inválido)
 */
export function normalizeCpfDigits(cpf) {
  return String(cpf || '').replace(/\D/g, '');
}

/**
 * Decide a ação da transação do guard de unicidade de CPF a partir do
 * estado atual do índice patientCpfIndex/{cpfDigits}.
 *
 * @param {{ indexPatientId: string|null, targetPatientId: string, conflictingDocExists: boolean }} params
 *   indexPatientId: dono atual do CPF no índice (null se CPF nunca foi reservado)
 *   targetPatientId: paciente que está tentando reservar/manter o CPF agora
 *   conflictingDocExists: só é relevante quando indexPatientId !== targetPatientId -
 *     true se o doc patients/{indexPatientId} ainda existe e está status 'ativo'
 * @returns {'reserve'|'idempotent'|'reclaim'|'conflict'}
 */
export function resolveCpfClaim({ indexPatientId, targetPatientId, conflictingDocExists }) {
  if (!indexPatientId) return 'reserve';
  if (indexPatientId === targetPatientId) return 'idempotent';
  return conflictingDocExists ? 'conflict' : 'reclaim';
}

/**
 * Agrupa pacientes ativos por CPF pra achar duplicatas criadas ANTES do
 * patientCpfIndex existir (que só passou a reservar CPF a partir desta
 * mudança - não cobre dado legado). Usado pelo painel de conflitos do
 * admin (api/admin.js, action 'list_conflicts').
 *
 * @param {Array<{ id: string, cpf?: string, cpfDigits?: string }>} patients
 * @returns {Array<{ cpfDigits: string, patients: Array }>} só grupos com 2+ pacientes
 */
export function findCpfConflictGroups(patients) {
  const groups = new Map();
  for (const patient of patients) {
    const cpfDigits = patient.cpfDigits || normalizeCpfDigits(patient.cpf);
    if (cpfDigits.length !== 11) continue;
    if (!groups.has(cpfDigits)) groups.set(cpfDigits, []);
    groups.get(cpfDigits).push(patient);
  }
  return Array.from(groups.entries())
    .filter(([, group]) => group.length > 1)
    .map(([cpfDigits, group]) => ({ cpfDigits, patients: group }));
}
