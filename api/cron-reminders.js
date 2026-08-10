import { db } from './utils/firebase-admin.js';
import { normalizePhoneWithDDI, sendWhatsAppText } from './utils/whatsapp.js';

export default async function handler(req, res) {
  // Segurança básica: o CRON da Vercel envia um Header específico que podemos validar
  // Se rodarmos localmente, podemos pular a checagem se não tiver o secret configurado
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && req.headers['authorization'] !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // Pegar o horário atual no fuso horário do Brasil (onde o Nutrivvo opera)
    const nowBR = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
    const currentHour = nowBR.getHours();

    console.log(`[CRON] Rodando verificador de lembretes. Hora atual (BR): ${currentHour}h`);

    // Busca todos os pacientes
    const patientsSnap = await db.collection('patients').get();

    let lembretesEnviados = 0;

    for (const doc of patientsSnap.docs) {
      const patient = doc.data();

      // Se não tem telefone ou receitas (dieta), ignora
      if (!patient.phone || !patient.recipes || patient.recipes.length === 0) continue;

      const remoteJid = `${normalizePhoneWithDDI(patient.phone)}@s.whatsapp.net`;

      // Procura alguma refeição marcada exatamente para esta hora
      for (const meal of patient.recipes) {
        if (!meal.time) continue;

        // Exemplo: meal.time = "16:00" -> extraímos "16"
        const mealHour = parseInt(meal.time.split(':')[0], 10);

        if (mealHour === currentHour) {
          console.log(`Enviando lembrete para ${patient.name} sobre a refeição: ${meal.name}`);

          const text = `Oi ${patient.name.split(' ')[0]}! 🍎\n\nPassando aqui para lembrar que está na hora do seu *${meal.name}*!\nNão esquece de registrar como foi para eu acompanhar seu progresso, tá bom?`;

          await sendWhatsAppText(remoteJid, text);
          lembretesEnviados++;

          // Se encontrou uma refeição para essa hora, quebra o loop desse paciente
          break;
        }
      }
    }

    res.status(200).json({ success: true, enviados: lembretesEnviados });

  } catch (error) {
    console.error('[CRON] Erro ao enviar lembretes:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
