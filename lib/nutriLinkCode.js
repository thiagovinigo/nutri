// Código de vínculo de uso único entre o NUTRICIONISTA e o bot (Telegram/
// WhatsApp). Substitui o antigo `/start nutri:<uid>`: o uid do nutricionista
// não é segredo (aparece em patients/{id}.nutricionista_id, legível pelo
// paciente), então qualquer um podia redirecionar os alertas dele. O código
// é gerado no CRM com o nutri autenticado (só o dono escreve em users/{uid},
// ver firestore.rules), expira em minutos e é apagado ao ser usado.
//
// Módulo puro (sem firebase) - roda no CRM (navegador) e nos webhooks (Node).

export const NUTRI_LINK_CODE_TTL_MS = 10 * 60 * 1000;

const CODE_BYTES = 16;
const CODE_PATTERN = /^[a-f0-9]{32}$/;
const NUTRI_START_PATTERN = /^\/start(?:@\w+)?\s+nutri:(\S*)\s*$/;

/** 128 bits aleatórios em hexadecimal (32 caracteres). */
export function generateNutriLinkCode() {
  const bytes = new Uint8Array(CODE_BYTES);
  globalThis.crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

/** Barra qualquer valor fora do formato antes de usá-lo numa consulta. */
export function isWellFormedLinkCode(code) {
  return typeof code === 'string' && CODE_PATTERN.test(code);
}

export function isLinkCodeActive(expiresAt, now = Date.now()) {
  return Number.isFinite(expiresAt) && expiresAt > now;
}

/**
 * "/start nutri:<codigo>" (ou "/start@Bot nutri:<codigo>") -> codigo.
 * Retorna '' se o código estiver ausente e null se não for um vínculo de nutri.
 */
export function parseNutriStartCode(text) {
  const match = NUTRI_START_PATTERN.exec((text || '').trim());
  return match ? match[1] : null;
}
