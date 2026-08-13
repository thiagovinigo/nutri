import { db } from './utils/firebase-admin.js';
import { sendTelegramText } from './utils/telegram.js';

/** Converte "DD/MM/YYYY" (formato pt-BR usado em todo o app) pra Date. */
function parsePtBrDate(dateStr) {
  const [d, m, y] = (dateStr || '').split('/').map(Number);
  if (!d || !m || !y) return new Date(0);
  return new Date(y, m - 1, d);
}

/**
 * Resumo semanal proativo via Telegram - reforça o "Radar de Abandono" que
 * já é a promessa da landing (ver LandingPage.jsx), mas de forma proativa em
 * vez de só reativa (a IA já alerta o nutricionista quando o paciente
 * demonstra risco - isso aqui é o lado positivo, engajando o paciente
 * direto). Disparado 1x/semana via GitHub Actions (ver
 * .github/workflows/cron-weekly-summary.yml) - mesmo motivo do
 * cron-reminders.js rodar via GH Actions: Vercel Hobby só permite Cron Jobs
 * nativos 1x/dia por projeto.
 */
export default async function handler(req, res) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    console.error('[CRON] CRON_SECRET não configurada no ambiente.');
    return res.status(500).json({ error: 'Configuração de segurança ausente no servidor.' });
  }
  if (req.headers['authorization'] !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const patientsSnap = await db.collection('patients').get();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    let enviados = 0;

    for (const doc of patientsSnap.docs) {
      const patient = doc.data();
      if (!patient.telegram_chat_id) continue;

      const foodLogsWeek = (patient.foodLogs || []).filter((log) => parsePtBrDate(log.date) >= sevenDaysAgo);

      // Sem nenhuma atividade na semana e sem ofensiva ativa: não manda
      // resumo vazio, seria só spam sem valor.
      if (foodLogsWeek.length === 0 && !(patient.streak > 0)) continue;

      const waterEntries = Object.entries(patient.waterLogs || {}).filter(([dateStr]) => parsePtBrDate(dateStr) >= sevenDaysAgo);
      const avgWaterMl = waterEntries.length > 0
        ? Math.round(waterEntries.reduce((sum, [, ml]) => sum + ml, 0) / waterEntries.length)
        : null;

      const sleepEntries = (patient.sleepLogs || []).filter((l) => parsePtBrDate(l.date) >= sevenDaysAgo);
      const avgSleepHours = sleepEntries.length > 0
        ? (sleepEntries.reduce((sum, l) => sum + (l.hours || 0), 0) / sleepEntries.length).toFixed(1)
        : null;

      const weightsWeek = (patient.weights || []).filter((w) => parsePtBrDate(w.date) >= sevenDaysAgo);
      let weightLine = '';
      if (weightsWeek.length >= 2) {
        const diff = weightsWeek[weightsWeek.length - 1].value - weightsWeek[0].value;
        const sinal = diff > 0 ? '+' : '';
        weightLine = `⚖️ Peso: ${sinal}${diff.toFixed(1)}kg na semana\n`;
      }

      const text = `📅 *Seu resumo da semana, ${patient.name?.split(' ')[0] || ''}!*\n\n` +
        `🍽️ ${foodLogsWeek.length} refeições registradas\n` +
        (avgWaterMl !== null ? `💧 Média de ${avgWaterMl}ml de água por dia\n` : '') +
        (avgSleepHours !== null ? `😴 Média de ${avgSleepHours}h de sono por noite\n` : '') +
        weightLine +
        `🔥 ${patient.streak || 0} dias de ofensiva\n\n` +
        `Continue assim! Qualquer dúvida, é só me chamar por aqui. 💪`;

      await sendTelegramText(patient.telegram_chat_id, text);
      enviados++;
    }

    res.status(200).json({ success: true, enviados });
  } catch (error) {
    console.error('[CRON] Erro ao enviar resumo semanal:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
