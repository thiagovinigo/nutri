import { db } from '../lib/firebase-admin.js';
import { sendTelegramText, escapeTelegramHtml } from '../lib/telegram.js';
import { sendWhatsAppText } from '../lib/whatsapp.js';
import { computeRiskScore } from '../lib/riskScore.js';

// Não renotifica todo dia pro mesmo risco "alto" parado - só na transição
// pra alto, ou a cada N dias se continuar alto. Mesmo espírito de
// lastInactivityNudgeAt em cron-reminders.js.
const RENOTIFY_AFTER_DAYS = 3;

export default async function handler(req, res) {
  // Mesmo esqueleto de auth de cron-reminders.js / cron-weekly-summary.js
  // (fail-closed: falha fechado se CRON_SECRET não estiver configurada).
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    console.error('[CRON] CRON_SECRET não configurada no ambiente.');
    return res.status(500).json({ error: 'Configuração de segurança ausente no servidor.' });
  }
  if (req.headers['authorization'] !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const now = new Date();
    const patientsSnap = await db.collection('patients').get();

    let scanned = 0;
    let flagged = 0;
    // nutricionista_id -> [{ patientId, patientName }]
    const alertsByNutri = new Map();

    for (const docSnap of patientsSnap.docs) {
      const patient = docSnap.data();
      if (patient.status === 'inativo' || !patient.nutricionista_id) continue;

      const { score, level, factors } = computeRiskScore(patient, now);
      scanned++;

      const updatePayload = { riskScore: score, riskLevel: level, riskFactors: factors };

      // O nutri pode ter corrigido manualmente o nível (riskOverride) - se
      // ele já rebaixou pra 'baixo'/'medio', respeita e não renotifica de
      // novo pro mesmo caso que ele já revisou.
      const effectiveLevel = patient.riskOverride?.level || level;

      const lastNotifiedLevel = patient.lastRiskNotifiedLevel;
      const lastNotifiedAt = patient.lastRiskNotifiedAt ? new Date(patient.lastRiskNotifiedAt) : null;
      const daysSinceNotified = lastNotifiedAt
        ? Math.floor((now.getTime() - lastNotifiedAt.getTime()) / (1000 * 60 * 60 * 24))
        : Infinity;

      const becameHigh = effectiveLevel === 'alto' && lastNotifiedLevel !== 'alto';
      const dueForRenudge = effectiveLevel === 'alto' && lastNotifiedLevel === 'alto' && daysSinceNotified >= RENOTIFY_AFTER_DAYS;

      if (becameHigh || dueForRenudge) {
        updatePayload.lastRiskNotifiedLevel = 'alto';
        updatePayload.lastRiskNotifiedAt = now.toISOString();

        const list = alertsByNutri.get(patient.nutricionista_id) || [];
        list.push({ patientId: docSnap.id, patientName: patient.name || 'Paciente' });
        alertsByNutri.set(patient.nutricionista_id, list);
        flagged++;
      }

      await docSnap.ref.update(updatePayload);
    }

    // 1 notificação in-app por paciente (pra navegar direto ao perfil) +
    // 1 mensagem consolidada por Telegram/WhatsApp por nutri (evita floodar
    // o chat com uma mensagem por paciente quando vários caem juntos).
    for (const [nutriId, alerts] of alertsByNutri.entries()) {
      const nutriRef = db.collection('users').doc(nutriId);
      const nutriSnap = await nutriRef.get();
      if (!nutriSnap.exists) continue;
      const nutriData = nutriSnap.data();

      const newNotifications = alerts.map((a) => ({
        id: `risk-${a.patientId}-${now.getTime()}`,
        message: `⚠️ ${a.patientName} está em alto risco de abandono. Toque para ver os detalhes.`,
        patientId: a.patientId,
        date: now.toLocaleString('pt-BR'),
        read: false,
      }));
      await nutriRef.update({ notifications: [...(nutriData.notifications || []), ...newNotifications] });

      if (nutriData.telegram_chat_id) {
        const names = alerts.map((a) => `• ${escapeTelegramHtml(a.patientName)}`).join('\n');
        await sendTelegramText(
          nutriData.telegram_chat_id,
          `<b>Radar de Abandono</b>\n\n${alerts.length} paciente(s) em alto risco hoje:\n${names}\n\nAbra o CRM pra ver os detalhes de cada um.`
        );
      }
      if (nutriData.whatsapp_chat_id) {
        const names = alerts.map((a) => `- ${a.patientName}`).join('\n');
        await sendWhatsAppText(
          nutriData.whatsapp_chat_id,
          `Radar de Abandono\n\n${alerts.length} paciente(s) em alto risco hoje:\n${names}\n\nAbra o CRM pra ver os detalhes de cada um.`
        );
      }
    }

    res.status(200).json({ success: true, scanned, flagged, nutrisNotified: alertsByNutri.size });
  } catch (error) {
    console.error('[CRON] Erro na varredura de risco:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
