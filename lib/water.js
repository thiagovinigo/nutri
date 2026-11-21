/**
 * Hidratação: meta diária personalizada, "quanto falta" e lembrete de água.
 *
 * Lógica PURA (sem firebase-admin), no mesmo espírito de lib/meals.js e
 * lib/riskScore.js, pra ser testável sem credenciais. Usada por
 * lib/secretariaVirtual.js (Telegram e WhatsApp: meta e "faltam X ml") e por
 * api/cron-reminders.js (lembrete, SÓ no Telegram - o canal WhatsApp não
 * oficial evita mensagens proativas de propósito, ver backlog.md).
 *
 * Campos do documento patients/{id} usados:
 *  - waterLogs: { "DD/MM/YYYY": totalMl }   (já existe; app e bot gravam)
 *  - weights: [{ date, value }]             (já existe; value em kg)
 *  - waterGoalMl: number                    (opcional; meta definida pelo nutricionista)
 *  - waterReminder: { enabled, everyHours, startHour, endHour }   (novo; criado pelo paciente)
 *  - lastWaterReminderKey: "DD/MM/YYYY-HH"  (novo; trava contra lembrete duplicado na mesma hora)
 */
import { escapeTelegramHtml } from './telegram.js';

export const WATER_ML_PER_KG = 35;
const DEFAULT_GOAL_ML = 2000;
const MIN_GOAL_ML = 1500;
const MAX_GOAL_ML = 4500;
const NUTRI_GOAL_RANGE_ML = [500, 8000];
const ROUND_TO_ML = 50;
const REMINDER_DEFAULTS = { everyHours: 2, startHour: 8, endHour: 20 };
const REMINDER_INTERVAL_RANGE = [1, 6];

/**
 * Chave "DD/MM/YYYY" do dia no fuso de São Paulo - a mesma forma que o app
 * usa em waterLogs. Explícito pra não depender do fuso do servidor (a VPS
 * pode estar em UTC e jogar água das 21h pro dia seguinte).
 * @param {Date} [date]
 * @returns {string}
 */
export function brDateKey(date = new Date()) {
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date);
}

/**
 * Último peso válido (kg) do paciente.
 * @param {{weights?: Array<{value: unknown}>}} patient
 * @returns {number|null}
 */
function latestWeightKg(patient) {
  const weights = Array.isArray(patient?.weights) ? patient.weights : [];
  for (let i = weights.length - 1; i >= 0; i -= 1) {
    const kg = Number(weights[i]?.value);
    if (Number.isFinite(kg) && kg > 0) return kg;
  }
  return null;
}

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

/**
 * Meta diária de água, por ordem de prioridade: definida pelo nutricionista,
 * peso × 35 ml (arredondado a 50 ml, entre 1500 e 4500), ou padrão de 2000 ml.
 * @param {object} patient
 * @returns {{goalMl: number, source: 'nutri'|'peso'|'padrao'}}
 */
export function computeWaterGoal(patient) {
  const nutriGoal = Number(patient?.waterGoalMl);
  if (Number.isFinite(nutriGoal) && nutriGoal >= NUTRI_GOAL_RANGE_ML[0] && nutriGoal <= NUTRI_GOAL_RANGE_ML[1]) {
    return { goalMl: Math.round(nutriGoal), source: 'nutri' };
  }

  const kg = latestWeightKg(patient);
  if (kg) {
    const rounded = Math.round((kg * WATER_ML_PER_KG) / ROUND_TO_ML) * ROUND_TO_ML;
    return { goalMl: clamp(rounded, MIN_GOAL_ML, MAX_GOAL_ML), source: 'peso' };
  }

  return { goalMl: DEFAULT_GOAL_ML, source: 'padrao' };
}

/**
 * Total de água (ml) já registrado no dia.
 * @param {object} patient
 * @param {string} dateKey - "DD/MM/YYYY"
 * @returns {number}
 */
export function todayWaterMl(patient, dateKey) {
  const ml = Number(patient?.waterLogs?.[dateKey]);
  return Number.isFinite(ml) && ml >= 0 ? ml : 0;
}

const GOAL_SOURCE_LABEL = {
  nutri: 'definida pelo nutricionista',
  peso: 'calculada pelo peso do paciente (35 ml por kg)',
  padrao: 'a padrão, porque ainda não há peso registrado'
};

function describeReminder(reminder) {
  if (!reminder?.enabled) return 'nenhum lembrete ativo';
  return `lembrete ativo: a cada ${reminder.everyHours} h, das ${reminder.startHour}h às ${reminder.endHour}h`;
}

/**
 * Bloco de contexto (texto pra IA, recalculado a cada mensagem) com a água do
 * dia, a meta e o que a IA pode ou não fazer sobre lembretes NESTE canal.
 * @param {object} patient
 * @param {{channel: 'telegram'|'whatsapp', dateKey: string}} options
 * @returns {string}
 */
export function buildWaterContext(patient, { channel, dateKey }) {
  const { goalMl, source } = computeWaterGoal(patient);
  const ml = todayWaterMl(patient, dateKey);
  const remaining = Math.max(0, goalMl - ml);
  const status = remaining > 0 ? `faltam ${remaining} ml` : 'meta batida';

  const lines = [
    `ÁGUA DE HOJE (${dateKey}): ${ml} ml de ${goalMl} ml (${status}). A meta é ${GOAL_SOURCE_LABEL[source]}.`,
    'Quando o paciente perguntar quanto deve beber por dia, responda com ESSA meta e diga quanto falta. NUNCA responda o genérico de 2 a 3 litros.'
  ];

  if (channel === 'telegram') {
    lines.push(
      `LEMBRETE DE ÁGUA: ${describeReminder(patient?.waterReminder)}. Se o paciente pedir pra ser lembrado de beber água ` +
      '(ex.: "me avisa a cada 2 horas"), use a ferramenta \'definir_lembrete_agua\' e confirme o que ficou combinado; ' +
      'pra parar, chame-a com ativo=false.'
    );
  } else {
    const telegramHint = patient?.telegram_chat_id
      ? 'O paciente já tem o Telegram conectado: diga que basta pedir o lembrete por lá.'
      : 'Se ele pedir, diga que isso funciona pelo Telegram e que ele conecta em Perfil → Conectar Telegram, no app.';
    lines.push(
      'LEMBRETES DE ÁGUA: no WhatsApp você só responde quando o paciente escreve e não envia mensagens sozinha, ' +
      `então NÃO prometa nem crie lembretes aqui. Lembretes automáticos de água existem pelo Telegram. ${telegramHint} ` +
      'Nunca responda só "não consigo".'
    );
  }

  return lines.join('\n');
}

const isHour = (value) => Number.isInteger(value) && value >= 0 && value <= 23;

/**
 * Valida e normaliza os argumentos da ferramenta definir_lembrete_agua (que
 * vêm da IA, então nunca são confiáveis): intervalo 1-6 h, janela 0-23 h.
 * @param {{ativo?: boolean, intervalo_horas?: unknown, hora_inicio?: unknown, hora_fim?: unknown}} args
 * @returns {{enabled: boolean, everyHours: number, startHour: number, endHour: number}}
 */
export function normalizeWaterReminder(args = {}) {
  // Só número de verdade vale: Number(null) e Number('') dão 0, e virariam "0h".
  const interval = args.intervalo_horas;
  const everyHours = typeof interval === 'number' && Number.isFinite(interval)
    ? clamp(Math.round(interval), REMINDER_INTERVAL_RANGE[0], REMINDER_INTERVAL_RANGE[1])
    : REMINDER_DEFAULTS.everyHours;

  const startHour = isHour(args.hora_inicio) ? args.hora_inicio : REMINDER_DEFAULTS.startHour;
  const endHour = isHour(args.hora_fim) ? args.hora_fim : REMINDER_DEFAULTS.endHour;
  const orderedWindow = startHour <= endHour;

  // O pedido de parar nunca pode ser ignorado: aceita false e também "false" em texto.
  const disabled = args.ativo === false || String(args.ativo).toLowerCase() === 'false';

  return {
    enabled: !disabled,
    everyHours,
    startHour: orderedWindow ? startHour : REMINDER_DEFAULTS.startHour,
    endHour: orderedWindow ? endHour : REMINDER_DEFAULTS.endHour
  };
}

/**
 * Decide se este paciente recebe lembrete de água nesta hora (o cron roda de
 * hora em hora). Sem estado além da trava lastWaterReminderKey: o horário é
 * derivado de (hora − início) % intervalo, então não há fila nem "próximo envio".
 * @param {object} patient
 * @param {{hour: number, dateKey: string}} now - hora (0-23) e dia no fuso de São Paulo
 * @returns {boolean}
 */
export function shouldSendWaterReminder(patient, { hour, dateKey }) {
  const reminder = patient?.waterReminder;
  // O documento pode ter sido editado à mão: só age se TODOS os campos tiverem o tipo e a faixa certos.
  if (reminder?.enabled !== true || !patient.telegram_chat_id) return false;
  if (!Number.isInteger(reminder.everyHours) || reminder.everyHours < REMINDER_INTERVAL_RANGE[0] || reminder.everyHours > REMINDER_INTERVAL_RANGE[1]) return false;
  if (!isHour(reminder.startHour) || !isHour(reminder.endHour)) return false;
  if (hour < reminder.startHour || hour > reminder.endHour) return false;
  if ((hour - reminder.startHour) % reminder.everyHours !== 0) return false;
  if (patient.lastWaterReminderKey === `${dateKey}-${hour}`) return false;

  const { goalMl } = computeWaterGoal(patient);
  return todayWaterMl(patient, dateKey) < goalMl;
}

/**
 * Texto do lembrete pro Telegram (HTML): sem tags próprias, e com o nome do
 * paciente escapado.
 * @param {object} patient
 * @param {{ml: number, goalMl: number}} progress
 * @returns {string}
 */
export function buildWaterReminderText(patient, { ml, goalMl }) {
  const firstName = escapeTelegramHtml(String(patient?.name || '').split(' ')[0]);
  return `💧 Oi ${firstName}! Hora de beber água. Hoje você já bebeu ${ml} ml de ${goalMl} ml (faltam ${Math.max(0, goalMl - ml)} ml). Me conta aqui quando beber que eu registro!`;
}
