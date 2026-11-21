/**
 * Bom dia automático do Telegram: frase motivadora, pergunta sobre o sono e a
 * meta de água do dia.
 *
 * Lógica PURA (sem firebase-admin), no mesmo espírito de lib/water.js. Usada por
 * api/cron-reminders.js (envio) e lib/secretariaVirtual.js (contexto e ferramenta
 * definir_bom_dia). SÓ Telegram: o canal WhatsApp não oficial evita mensagens
 * proativas de propósito (ver backlog.md). O texto vem de modelos fixos, não da
 * IA: mensagem proativa não pode alucinar nem custar token.
 *
 * Campos de patients/{id} usados:
 *  - morningGreeting: boolean       (opcional; false = o paciente pediu pra parar)
 *  - lastMorningGreetingKey: "DD/MM/YYYY"   (trava: no máximo 1 por dia)
 *  - streak, status, telegram_chat_id (já existem)
 */
import { escapeTelegramHtml } from './telegram.js';

export const MORNING_HOUR = 8;
const WATER_GLASS_ML = 200;

// Tom acolhedor, sem cobrança e sem julgamento (mesmo princípio do prompt da Secretária).
// `who` é ", Nome" (já escapado) ou vazio quando o paciente não tem nome cadastrado.
const GREETINGS = [
  (who) => `Bom dia${who}! ☀️ Hoje é mais um dia pra cuidar de você, um passo de cada vez.`,
  (who) => `Bom dia${who}! 🌿 Constância vale mais que perfeição, e você está no caminho certo.`,
  (who) => `Oi${who}, bom dia! 💪 As pequenas escolhas de hoje constroem o resultado de amanhã.`,
  (who) => `Bom dia${who}! 🌞 Respira fundo: hoje você não precisa ser perfeito, só presente.`,
  (who) => `Bom dia${who}! 🍎 Seu corpo agradece cada cuidado que você tem com ele.`,
  (who) => `Bom dia${who}! ✨ Começar o dia com intenção já é metade do caminho.`,
  (who) => `Oi${who}, bom dia! ☀️ Mais um dia, mais uma chance de se sentir bem na sua própria pele.`
];

/**
 * Número crescente por dia a partir de "DD/MM/YYYY": dias seguidos dão números
 * seguidos, então a saudação roda por todas as variantes sem repetir em sequência.
 * @param {string} dateKey
 * @returns {number}
 */
function dayNumber(dateKey) {
  const [day, month, year] = String(dateKey).split('/').map(Number);
  return (day || 0) + (month || 0) * 31 + (year || 0) * 372;
}

/**
 * Decide se este paciente recebe o bom dia agora (o cron roda de hora em hora).
 * @param {object} patient
 * @param {{hour: number, dateKey: string}} now - hora (0-23) e dia no fuso de São Paulo
 * @returns {boolean}
 */
export function shouldSendMorningGreeting(patient, { hour, dateKey }) {
  if (hour !== MORNING_HOUR) return false;
  if (!patient?.telegram_chat_id) return false;
  if (patient.morningGreeting === false) return false;
  if (patient.status === 'inativo') return false;
  return patient.lastMorningGreetingKey !== dateKey;
}

/**
 * Texto do bom dia pro Telegram (HTML, sem tags próprias; nome escapado).
 * @param {object} patient
 * @param {{goalMl: number, dateKey: string}} data
 * @returns {string}
 */
export function buildMorningMessage(patient, { goalMl, dateKey }) {
  const firstName = escapeTelegramHtml(String(patient?.name || '').trim().split(' ')[0]);
  const greeting = GREETINGS[dayNumber(dateKey) % GREETINGS.length](firstName ? `, ${firstName}` : '');
  const glasses = Math.round(goalMl / WATER_GLASS_ML);

  const lines = [
    greeting,
    '😴 Como foi o seu sono essa noite? Me conta quantas horas você dormiu e como se sentiu que eu registro por aqui.',
    `💧 Sua meta de água hoje: ${goalMl} ml (${glasses} copos de ${WATER_GLASS_ML} ml). Vamos juntos?`
  ];

  const streak = Number(patient?.streak);
  if (Number.isInteger(streak) && streak > 0) {
    lines.push(`🔥 Você está com ${streak} ${streak === 1 ? 'dia' : 'dias'} de ofensiva seguidos, bora manter!`);
  }

  lines.push('Se não quiser mais receber o bom dia, é só me avisar. 😉');
  return lines.join('\n\n');
}

/**
 * Interpreta os argumentos (não confiáveis, vindos da IA) da ferramenta
 * definir_bom_dia. O pedido de parar nunca pode ser ignorado: aceita false e
 * também "false" em texto.
 * @param {{ativo?: unknown}} args
 * @returns {boolean} true = ligado
 */
export function parseMorningOptIn(args = {}) {
  return !(args.ativo === false || String(args.ativo).toLowerCase() === 'false');
}

/**
 * Bloco de contexto (texto pra IA, recalculado a cada mensagem) - só Telegram.
 * @param {object} patient
 * @returns {string}
 */
export function buildMorningContext(patient) {
  const state = patient?.morningGreeting === false ? 'desligado' : 'ligado';
  return (
    `BOM DIA AUTOMÁTICO: o Nutrivvo manda, pelo Telegram, um bom dia às ${MORNING_HOUR}h com pergunta sobre o sono e a meta de água (hoje: ${state}). ` +
    "Se o paciente pedir pra parar ou voltar a receber, use a ferramenta 'definir_bom_dia'. " +
    "Se ele responder contando como dormiu (ex.: \"dormi 7 horas, bem\"), registre com 'log_sleep' e responda com carinho, sem julgar."
  );
}
