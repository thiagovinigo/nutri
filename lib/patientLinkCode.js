// Código de vínculo de uso único entre o PACIENTE e o bot do WhatsApp. Substitui
// o antigo "/start <patientId>": o id do paciente não é segredo suficiente (quem
// o soubesse vinculava o próprio WhatsApp à conta dele e passava a ler os dados
// de saúde pela Secretária). O código é gerado no app com o paciente autenticado
// (só o dono escreve em patients/{uid}, ver firestore.rules), tem 128 bits,
// expira em 10 minutos e é apagado ao ser usado (ver lib/nutriLinkServer.js).
//
// Reaproveita o gerador e as validações do código do nutricionista
// (lib/nutriLinkCode.js), que já seguem esse desenho.
//
// Módulo puro (sem firebase) - roda no app (navegador) e nos webhooks (Node).
import {
  NUTRI_LINK_CODE_TTL_MS,
  generateNutriLinkCode,
  isWellFormedLinkCode
} from './nutriLinkCode.js';

export const PATIENT_LINK_CODE_TTL_MS = NUTRI_LINK_CODE_TTL_MS;

/** 128 bits aleatórios em hexadecimal (32 caracteres). */
export const generatePatientLinkCode = generateNutriLinkCode;

const TELEGRAM_USERNAME_PATTERN = /^[A-Za-z0-9_]{5,32}$/;

/**
 * Link "Conectar no Telegram" do Perfil do paciente: abre o bot já com o
 * "/start <codigo>" (deep link). O código nunca é o id do paciente. Devolve null
 * se o usuário do bot ou o código tiverem formato inválido.
 * @param {string|undefined} botUsername - ex.: "nutrivvo_bot" (VITE_TELEGRAM_BOT_USERNAME)
 * @param {string} code
 * @returns {string|null}
 */
export function buildTelegramConnectUrl(botUsername, code) {
  if (!TELEGRAM_USERNAME_PATTERN.test(String(botUsername || ''))) return null;
  if (!isWellFormedLinkCode(code)) return null;
  return `https://t.me/${botUsername}?start=${code}`;
}

/**
 * Link "Conectar WhatsApp" do Perfil do paciente: abre o WhatsApp no bot já com
 * "/start <codigo>" preenchido. Devolve null quando o número do bot não está
 * configurado (interruptor desligado: o app mantém "Em breve") ou quando o
 * número/código têm formato inválido - nunca monta link com valor arbitrário.
 * @param {string|undefined} botNumber - ex.: "+55 41 99999-0000" (VITE_WHATSAPP_BOT_NUMBER)
 * @param {string} code
 * @returns {string|null}
 */
export function buildWhatsappConnectUrl(botNumber, code) {
  const digits = String(botNumber || '').replace(/\D/g, '');
  if (digits.length < 10 || digits.length > 15) return null;
  if (!isWellFormedLinkCode(code)) return null;
  return `https://wa.me/${digits}?text=${encodeURIComponent(`/start ${code}`)}`;
}
