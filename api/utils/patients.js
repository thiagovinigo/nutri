/**
 * Lógica pura (sem firebase-admin) do índice de unicidade de CPF entre
 * pacientes ATIVOS. Extraída pra ser testável sem credenciais do Firebase -
 * mesmo espírito de api/utils/meals.js. Usada por api/patient-cpf-guard.js.
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
