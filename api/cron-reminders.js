import { db } from '../lib/firebase-admin.js';
import { sendTelegramText, escapeTelegramHtml } from '../lib/telegram.js';
import { resolveTodaysMeals } from '../lib/meals.js';

export default async function handler(req, res) {
  // Segurança básica: o CRON da Vercel envia automaticamente
  // "Authorization: Bearer $CRON_SECRET" quando essa env var está
  // configurada. A checagem agora é sempre obrigatória - se CRON_SECRET
  // não estiver configurada, o endpoint falha fechado (500) em vez de
  // ficar aberto pra qualquer um disparar lembretes em massa pros
  // pacientes (achado HIGH da auditoria de seguranca de 11/08/2026).
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    console.error('[CRON] CRON_SECRET não configurada no ambiente.');
    return res.status(500).json({ error: 'Configuração de segurança ausente no servidor.' });
  }
  if (req.headers['authorization'] !== `Bearer ${cronSecret}`) {
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

      // Se não conectou o Telegram ou não tem receitas (dieta), ignora
      if (!patient.telegram_chat_id || !patient.recipes || patient.recipes.length === 0) continue;

      // Resolve as refeições de HOJE (respeitando o ciclo de dias da dieta) e
      // procura uma marcada pra esta hora. Antes iterava patient.recipes
      // direto - que sao objetos {title, meals:[]} sem campo .time -, entao
      // meal.time era sempre undefined e o lembrete por horario NUNCA
      // disparava (bug encontrado na auditoria de 28/08/2026).
      const todaysMeals = resolveTodaysMeals(patient);
      for (const meal of todaysMeals) {
        if (!meal.time) continue;

        // Exemplo: meal.time = "16:00" -> extraímos "16"
        const mealHour = parseInt(meal.time.split(':')[0], 10);

        if (mealHour === currentHour) {
          console.log(`Enviando lembrete para ${patient.name} sobre a refeição: ${meal.name}`);

          const text = `Oi ${escapeTelegramHtml(patient.name.split(' ')[0])}! 🍎\n\nPassando aqui para lembrar que está na hora do seu <b>${escapeTelegramHtml(meal.name)}</b>!\nNão esquece de registrar como foi para eu acompanhar seu progresso, tá bom?`;

          await sendTelegramText(patient.telegram_chat_id, text);
          lembretesEnviados++;

          // Se encontrou uma refeição para essa hora, quebra o loop desse paciente
          break;
        }
      }

      // -------------------------------------------------------------
      // Lógica de Retenção e Motivação Diária (Rodamos apenas às 9h)
      // -------------------------------------------------------------
      if (currentHour === 9) {
        // 1. Checar inatividade de 3+ dias. Antes era `=== 3` exato: se o
        //    cron falhasse justo no 3o dia, o paciente nunca recebia o
        //    resgate. Agora >= 3, com trava lastInactivityNudgeAt pra mandar
        //    só uma vez por "buraco" de inatividade (nao todo dia).
        let isActiveRecently = true;
        if (patient.lastActivityDate) {
          const lastActivity = new Date(patient.lastActivityDate);
          const diffMs = nowBR - lastActivity;
          const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

          if (diffDays >= 3) {
            isActiveRecently = false;

            const lastNudge = patient.lastInactivityNudgeAt ? new Date(patient.lastInactivityNudgeAt) : null;
            const alreadyNudgedThisGap = lastNudge && lastNudge > lastActivity;

            if (!alreadyNudgedThisGap) {
              console.log(`Enviando mensagem de inatividade para ${patient.name}`);
              const textMiss = `Senti sua falta, ${escapeTelegramHtml(patient.name.split(' ')[0])}! 🥺 Faz ${diffDays} dias que você não registra nada por aqui. Aconteceu alguma coisa? Como posso te ajudar a voltar pro foco?`;
              await sendTelegramText(patient.telegram_chat_id, textMiss);
              await doc.ref.update({ lastInactivityNudgeAt: nowBR.toISOString() });
              lembretesEnviados++;
            }
          }
        }

        // 2. Checar baixa adesão no dia anterior (< 30%) - só enviar se esteve ativo recentemente para não floodar
        if (isActiveRecently && patient.recipes && patient.recipes.length > 0) {
          const yesterday = new Date(nowBR);
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toLocaleDateString('pt-BR');

          const logsYesterday = (patient.foodLogs || []).filter(l => l.date === yesterdayStr && l.type === 'plano');
          // Conta só as refeições do dia-do-ciclo de ONTEM, nao todas as
          // refeicoes de todos os dias da dieta - o denominador inflado fazia
          // completionRate ficar quase sempre < 0.3 e a mensagem ir pra todo
          // mundo todo dia.
          const yesterdaysMeals = resolveTodaysMeals(patient, yesterday);
          const totalMeals = yesterdaysMeals.length;

          if (totalMeals > 0) {
            const completionRate = logsYesterday.length / totalMeals;
            if (completionRate < 0.3) {
              console.log(`Enviando mensagem motivacional de baixa adesão para ${patient.name}`);
              const textMotiv = `Bom dia, ${escapeTelegramHtml(patient.name.split(' ')[0])}! ☀️ Vi que ontem foi um pouco mais difícil seguir o plano. Não tem problema, hoje é um novo dia e uma nova oportunidade! Conta comigo pra ajustar o que precisar. Vamos nessa? 💪`;
              await sendTelegramText(patient.telegram_chat_id, textMotiv);
              lembretesEnviados++;
            }
          }
        }
      }
    }

    res.status(200).json({ success: true, enviados: lembretesEnviados });

  } catch (error) {
    console.error('[CRON] Erro ao enviar lembretes:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
