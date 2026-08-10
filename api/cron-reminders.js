import { db } from './utils/firebase-admin.js';

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
      // Telefone e salvo sem DDI (ex: 41988743347) - ver SignUp.jsx/Profile.jsx.
      const telefoneDigits = patient.phone ? String(patient.phone).replace(/\D/g, '') : '';

      // Se não tem telefone ou receitas (dieta), ignora
      if (!telefoneDigits || !patient.recipes || patient.recipes.length === 0) continue;

      const telefoneComDDI = telefoneDigits.startsWith('55') ? telefoneDigits : `55${telefoneDigits}`;

      // Procura alguma refeição marcada exatamente para esta hora
      for (const meal of patient.recipes) {
        if (!meal.time) continue;

        // Exemplo: meal.time = "16:00" -> extraímos "16"
        const mealHour = parseInt(meal.time.split(':')[0], 10);

        if (mealHour === currentHour) {
          console.log(`Enviando lembrete para ${patient.name} sobre a refeição: ${meal.name}`);

          const text = `Oi ${patient.name.split(' ')[0]}! 🍎\n\nPassando aqui para lembrar que está na hora do seu *${meal.name}*!\nNão esquece de registrar como foi para eu acompanhar seu progresso, tá bom?`;

          await sendMessageToWhatsApp(`${telefoneComDDI}@s.whatsapp.net`, text);
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

/**
 * Função utilitária para enviar WhatsApp (mesma usada no whatsapp-ai.js)
 */
async function sendMessageToWhatsApp(remoteJid, text) {
  const evolutionUrl = process.env.EVOLUTION_API_URL;
  const instanceName = process.env.EVOLUTION_INSTANCE_NAME;
  const apikey = process.env.EVOLUTION_API_KEY;

  if (!evolutionUrl || !instanceName || !apikey) return;

  const endpoint = `${evolutionUrl}/message/sendText/${instanceName}`;
  
  try {
    await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': apikey
      },
      body: JSON.stringify({
        number: remoteJid,
        options: { delay: 1500, presence: 'composing' },
        textMessage: { text: text }
      })
    });
  } catch (error) {
    console.error("Erro no sendMessageToWhatsApp do Cron:", error);
  }
}
