import crypto from 'node:crypto';
import { db } from '../lib/firebase-admin.js';
import { sendTelegramText, escapeTelegramHtml } from '../lib/telegram.js';
import { sendWhatsAppText } from '../lib/whatsapp.js';
import { computeRiskScore } from '../lib/riskScore.js';

// Não renotifica todo dia pro mesmo risco "alto" parado - só na transição
// pra alto, ou a cada N dias se continuar alto. Mesmo espírito de
// lastInactivityNudgeAt em cron-reminders.js.
const RENOTIFY_AFTER_DAYS = 3;
const MAX_NOTIFICATIONS_PER_USER = 100;
const BATCH_LIMIT = 400; // Firestore aceita até 500 escritas por batch.

function isAuthorized(authHeader, cronSecret) {
  const expected = Buffer.from(`Bearer ${cronSecret}`);
  const received = Buffer.from(authHeader || '');
  return received.length === expected.length && crypto.timingSafeEqual(received, expected);
}

async function commitInBatches(updates) {
  for (let i = 0; i < updates.length; i += BATCH_LIMIT) {
    const batch = db.batch();
    updates.slice(i, i + BATCH_LIMIT).forEach(({ ref, payload }) => batch.update(ref, payload));
    await batch.commit();
  }
}

function hasRiskChanged(patient, { score, level, factors }) {
  return patient.riskScore !== score
    || patient.riskLevel !== level
    || JSON.stringify(patient.riskFactors || []) !== JSON.stringify(factors);
}

/** Decide, por paciente, o que gravar e se ele entra no alerta do nutricionista. */
function evaluatePatient(patient, now) {
  const risk = computeRiskScore(patient, now);
  const payload = {};
  if (hasRiskChanged(patient, risk)) {
    payload.riskScore = risk.score;
    payload.riskLevel = risk.level;
    payload.riskFactors = risk.factors;
  }

  // O nutri pode ter corrigido manualmente o nível (riskOverride) - se
  // ele já rebaixou pra 'baixo'/'medio', respeita e não renotifica de
  // novo pro mesmo caso que ele já revisou.
  const effectiveLevel = patient.riskOverride?.level || risk.level;
  const lastNotifiedLevel = patient.lastRiskNotifiedLevel;
  const lastNotifiedAt = patient.lastRiskNotifiedAt ? new Date(patient.lastRiskNotifiedAt) : null;
  const daysSinceNotified = lastNotifiedAt
    ? Math.floor((now.getTime() - lastNotifiedAt.getTime()) / (1000 * 60 * 60 * 24))
    : Infinity;

  const becameHigh = effectiveLevel === 'alto' && lastNotifiedLevel !== 'alto';
  const dueForRenudge = effectiveLevel === 'alto' && lastNotifiedLevel === 'alto' && daysSinceNotified >= RENOTIFY_AFTER_DAYS;

  // Saiu de 'alto': zera o marcador, senão uma recaída em menos de N dias
  // ficaria muda (a transição pra alto precisa notificar de novo).
  if (effectiveLevel !== 'alto' && lastNotifiedLevel === 'alto') {
    payload.lastRiskNotifiedLevel = effectiveLevel;
  }

  return { payload, shouldNotify: becameHigh || dueForRenudge };
}

/** Anexa as notificações in-app de forma atômica e devolve os dados do nutricionista (ou null se não existe). */
async function appendInAppNotifications(nutriRef, newNotifications) {
  return db.runTransaction(async (tx) => {
    const snap = await tx.get(nutriRef);
    if (!snap.exists) return null;
    const data = snap.data();
    const merged = [...(data.notifications || []), ...newNotifications].slice(-MAX_NOTIFICATIONS_PER_USER);
    tx.update(nutriRef, { notifications: merged });
    return data;
  });
}

async function notifyNutritionist(nutriId, alerts, now) {
  const nutriRef = db.collection('users').doc(nutriId);
  const newNotifications = alerts.map((a) => ({
    id: `risk-${a.patientId}-${now.getTime()}`,
    message: `⚠️ ${a.patientName} está em alto risco de abandono. Toque para ver os detalhes.`,
    patientId: a.patientId,
    date: now.toLocaleString('pt-BR'),
    read: false,
  }));

  const nutriData = await appendInAppNotifications(nutriRef, newNotifications);
  if (!nutriData) return false;

  // Telegram/WhatsApp são canais extras: falha de envio (chat revogado,
  // instância offline) é logada, mas o alerta in-app já foi entregue.
  if (nutriData.telegram_chat_id) {
    const names = alerts.map((a) => `• ${escapeTelegramHtml(a.patientName)}`).join('\n');
    const ok = await sendTelegramText(
      nutriData.telegram_chat_id,
      `<b>Radar de Abandono</b>\n\n${alerts.length} paciente(s) em alto risco hoje:\n${names}\n\nAbra o CRM pra ver os detalhes de cada um.`
    );
    if (!ok) console.error(`[CRON] Falha ao enviar Telegram ao nutricionista ${nutriId}`);
  }
  if (nutriData.whatsapp_chat_id) {
    const names = alerts.map((a) => `- ${a.patientName}`).join('\n');
    const ok = await sendWhatsAppText(
      nutriData.whatsapp_chat_id,
      `Radar de Abandono\n\n${alerts.length} paciente(s) em alto risco hoje:\n${names}\n\nAbra o CRM pra ver os detalhes de cada um.`
    );
    if (!ok) console.error(`[CRON] Falha ao enviar WhatsApp ao nutricionista ${nutriId}`);
  }
  return true;
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Mesmo esqueleto de auth de cron-reminders.js / cron-weekly-summary.js
  // (fail-closed: falha fechado se CRON_SECRET não estiver configurada).
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    console.error('[CRON] CRON_SECRET não configurada no ambiente.');
    return res.status(500).json({ error: 'Configuração de segurança ausente no servidor.' });
  }
  if (!isAuthorized(req.headers['authorization'], cronSecret)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const now = new Date();
    const patientsSnap = await db.collection('patients').get();

    let scanned = 0;
    const riskUpdates = [];
    // nutricionista_id -> [{ patientId, patientName, ref }]
    const alertsByNutri = new Map();

    for (const docSnap of patientsSnap.docs) {
      const patient = docSnap.data();
      if (patient.status === 'inativo' || !patient.nutricionista_id) continue;
      scanned++;

      const { payload, shouldNotify } = evaluatePatient(patient, now);
      if (Object.keys(payload).length > 0) riskUpdates.push({ ref: docSnap.ref, payload });

      if (shouldNotify) {
        const list = alertsByNutri.get(patient.nutricionista_id) || [];
        list.push({ patientId: docSnap.id, patientName: patient.name || 'Paciente', ref: docSnap.ref });
        alertsByNutri.set(patient.nutricionista_id, list);
      }
    }

    await commitInBatches(riskUpdates);

    // 1 notificação in-app por paciente (pra navegar direto ao perfil) +
    // 1 mensagem consolidada por Telegram/WhatsApp por nutri (evita floodar
    // o chat com uma mensagem por paciente quando vários caem juntos).
    // Só marca lastRiskNotified* depois do alerta ser entregue: se falhar,
    // o paciente volta a ser candidato na varredura seguinte (não em 3 dias).
    const notifiedMarks = [];
    let nutrisNotified = 0;
    let nutrisFailed = 0;
    for (const [nutriId, alerts] of alertsByNutri.entries()) {
      try {
        const delivered = await notifyNutritionist(nutriId, alerts, now);
        if (!delivered) continue;
        nutrisNotified++;
        alerts.forEach((a) => notifiedMarks.push({
          ref: a.ref,
          payload: { lastRiskNotifiedLevel: 'alto', lastRiskNotifiedAt: now.toISOString() },
        }));
      } catch (nutriError) {
        nutrisFailed++;
        console.error(`[CRON] Erro ao notificar nutricionista ${nutriId}:`, nutriError);
      }
    }
    await commitInBatches(notifiedMarks);

    res.status(200).json({
      success: true,
      scanned,
      flagged: notifiedMarks.length,
      nutrisNotified,
      nutrisFailed,
    });
  } catch (error) {
    console.error('[CRON] Erro na varredura de risco:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
