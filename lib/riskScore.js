/**
 * Score de risco de abandono do paciente - unifica os 3 sinais que antes
 * eram concorrentes e se sobrescreviam sem se falar (ver backlog.md "H1 -
 * Radar de Abandono unificado" e .claude/prds/radar-abandono-unificado.prd.md):
 *
 * (1) `computedPatients` (AppContext.jsx) derivava `status: 'em_risco'` de
 *     streak/xp em tempo de render, nunca persistido, sobrescrevia tudo;
 * (2) `alertar_nutricionista` (secretariaVirtual.js) gravava
 *     `status: 'Em Risco'` + `riskReason`, descartado no próximo render
 *     por (1) e nunca exibido em lugar nenhum da UI;
 * (3) o ChatBot web (PatientApp.jsx) gravava `behavioral_risk: true`,
 *     nunca resetado, badge separada sem relação com as outras duas.
 *
 * Agora (1) e (2)/(3) viram INPUTS de um único score: (1) através de
 * streak/lastActivityDate/adesão calculados aqui; (2) e (3) através dos
 * campos transientes `aiRiskSignal`/`behavioralRiskSignal` (mesma
 * informação, sem mais escrever um `status` paralelo que ninguém lê).
 *
 * Função pura (sem I/O, sem firebase-admin) - mesmo padrão de lib/meals.js -
 * roda tanto no cron (api/cron-risk-scan.js) quanto em teste isolado
 * (test-risk-score.mjs, ver backlog.md "Zero testes automatizados").
 *
 * Pesos são uma heurística v1, a calibrar com uso real (mesmo espírito do
 * src/data/householdMeasures.json).
 */

import { resolveTodaysMeals } from './meals.js';

const WEIGHT_ADHERENCE = 35;
const WEIGHT_RECENCY = 30;
const WEIGHT_HYDRATION = 15;
const WEIGHT_SLEEP = 10;
const REACTIVE_SIGNAL_BOOST = 30;
const REACTIVE_SIGNAL_WINDOW_HOURS = 48;
const LEVEL_THRESHOLD_MEDIO = 40;
const LEVEL_THRESHOLD_ALTO = 70;
const ADHERENCE_LOOKBACK_DAYS = 3;
const HYDRATION_LOOKBACK_DAYS = 2;
const SLEEP_LOOKBACK_DAYS = 3;
const RECENCY_ATTENTION_DAYS = 2;
const RECENCY_CRITICAL_DAYS = 4;
const MS_PER_DAY = 1000 * 60 * 60 * 24;

/** "DD/MM/YYYY" -> Date (mesmo parse usado em cron-weekly-summary.js). */
function parsePtBrDate(dateStr) {
  const [d, m, y] = (dateStr || '').split('/').map(Number);
  if (!d || !m || !y) return null;
  return new Date(y, m - 1, d);
}

function isWithinHours(dateLike, refDate, hours) {
  if (!dateLike) return false;
  const date = new Date(dateLike);
  if (Number.isNaN(date.getTime())) return false;
  const diffMs = refDate.getTime() - date.getTime();
  return diffMs >= 0 && diffMs <= hours * 60 * 60 * 1000;
}

/** Adesão ao plano nos últimos N dias, via resolveTodaysMeals (mesma fonte que o cron de lembretes usa). */
function scoreAdherence(patient, refDate) {
  let totalMeals = 0;
  let totalLogged = 0;
  for (let i = 0; i < ADHERENCE_LOOKBACK_DAYS; i++) {
    const day = new Date(refDate);
    day.setDate(day.getDate() - i);
    const meals = resolveTodaysMeals(patient, day);
    if (meals.length === 0) continue;
    const dayStr = day.toLocaleDateString('pt-BR');
    const logged = (patient.foodLogs || []).filter((l) => l.date === dayStr && l.type === 'plano').length;
    totalMeals += meals.length;
    totalLogged += Math.min(logged, meals.length);
  }
  if (totalMeals === 0) return { points: 0, factor: null };
  const rate = totalLogged / totalMeals;
  if (rate >= 0.7) return { points: 0, factor: null };
  return { points: WEIGHT_ADHERENCE * (1 - rate), factor: `Adesão de ${Math.round(rate * 100)}% nos últimos ${ADHERENCE_LOOKBACK_DAYS} dias` };
}

/** Recência de atividade (streak/lastActivityDate), já atualizados pelos webhooks do bot a cada mensagem. */
function scoreRecency(patient, refDate) {
  const streak = patient.streak || 0;
  const lastActivity = patient.lastActivityDate ? new Date(patient.lastActivityDate) : null;
  if (!lastActivity) return { points: WEIGHT_RECENCY, factor: 'Nunca registrou atividade' };

  const diffDays = Math.floor((refDate.getTime() - lastActivity.getTime()) / MS_PER_DAY);
  if (diffDays >= RECENCY_CRITICAL_DAYS) return { points: WEIGHT_RECENCY, factor: `Sem atividade há ${diffDays} dias` };
  if (diffDays >= RECENCY_ATTENTION_DAYS) return { points: WEIGHT_RECENCY * 0.6, factor: `Sem atividade há ${diffDays} dias` };
  if (diffDays <= 1 && streak > 0) return { points: 0, factor: null };
  return { points: 0, factor: null };
}

/** Registro de água (presença, não volume - não há campo de meta hoje) nos últimos dias. */
function scoreHydration(patient, refDate) {
  const waterLogs = patient.waterLogs || {};
  for (let i = 0; i < HYDRATION_LOOKBACK_DAYS; i++) {
    const day = new Date(refDate);
    day.setDate(day.getDate() - i);
    const dayStr = day.toLocaleDateString('pt-BR');
    if (waterLogs[dayStr] > 0) return { points: 0, factor: null };
  }
  return { points: WEIGHT_HYDRATION, factor: `Sem registro de água nos últimos ${HYDRATION_LOOKBACK_DAYS} dias` };
}

/** Última noite de sono registrada dentro da janela - mesma leitura de quality/hours do ChatBot. */
function scoreSleep(patient, refDate) {
  const sleepLogs = patient.sleepLogs || [];
  const recent = sleepLogs
    .map((l) => ({ ...l, parsedDate: parsePtBrDate(l.date) }))
    .filter((l) => l.parsedDate && (refDate.getTime() - l.parsedDate.getTime()) / MS_PER_DAY <= SLEEP_LOOKBACK_DAYS)
    .sort((a, b) => b.parsedDate - a.parsedDate);
  if (recent.length === 0) return { points: 0, factor: null };

  const latest = recent[0];
  const isPoor = latest.quality === 'Ruim' || parseFloat(latest.hours) < 6;
  if (!isPoor) return { points: 0, factor: null };
  return { points: WEIGHT_SLEEP, factor: `Sono ruim registrado nos últimos ${SLEEP_LOOKBACK_DAYS} dias` };
}

/**
 * Sinais reativos: `aiRiskSignal` (alertar_nutricionista, chat da Secretária
 * Virtual) e `behavioralRiskSignal` (heurística do ChatBot web) - relato
 * direto de sofrimento pesa mais que sinais indiretos de comportamento,
 * por isso um boost fixo em vez de um peso proporcional.
 */
function scoreReactiveSignals(patient, refDate) {
  const factors = [];
  let boosted = false;

  const aiSignal = patient.aiRiskSignal;
  if (aiSignal && isWithinHours(aiSignal.detectedAt, refDate, REACTIVE_SIGNAL_WINDOW_HOURS)) {
    factors.push(`Sinalizado pela IA no chat: ${aiSignal.reason}`);
    boosted = true;
  }

  const behavioralSignal = patient.behavioralRiskSignal;
  if (behavioralSignal && isWithinHours(behavioralSignal.detectedAt, refDate, REACTIVE_SIGNAL_WINDOW_HOURS)) {
    factors.push('Padrão de ansiedade alimentar detectado no chat');
    boosted = true;
  }

  return { points: boosted ? REACTIVE_SIGNAL_BOOST : 0, factors };
}

/**
 * @param {object} patient - doc do paciente (recipes, foodLogs, waterLogs,
 *   sleepLogs, streak, lastActivityDate, aiRiskSignal?, behavioralRiskSignal?)
 * @param {Date} [refDate] - dia de referência (default: agora)
 * @returns {{score: number, level: 'baixo'|'medio'|'alto', factors: string[]}}
 */
export function computeRiskScore(patient, refDate = new Date()) {
  const adherence = scoreAdherence(patient, refDate);
  const recency = scoreRecency(patient, refDate);
  const hydration = scoreHydration(patient, refDate);
  const sleep = scoreSleep(patient, refDate);
  const reactive = scoreReactiveSignals(patient, refDate);

  const rawScore = adherence.points + recency.points + hydration.points + sleep.points + reactive.points;
  const score = Math.min(100, Math.round(rawScore));

  const factors = [adherence.factor, recency.factor, hydration.factor, sleep.factor, ...reactive.factors].filter(Boolean);

  let level = 'baixo';
  if (score >= LEVEL_THRESHOLD_ALTO) level = 'alto';
  else if (score >= LEVEL_THRESHOLD_MEDIO) level = 'medio';

  // Sinal reativo (relato direto de sofrimento) nunca deixa o nível cair pra
  // 'baixo' mesmo que o resto do score esteja bom.
  if (reactive.points > 0 && level === 'baixo') level = 'medio';

  return { score, level, factors };
}
