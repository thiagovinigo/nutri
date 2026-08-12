import { db } from './utils/firebase-admin.js';
import { sendTelegramText } from './utils/telegram.js';
import { runSecretariaVirtual } from './utils/secretariaVirtual.js';

/**
 * Processa a mensagem com a Secretária Virtual (IA) e responde pelo
 * Telegram. Inline aqui (em vez de um arquivo telegram-ai.js separado)
 * pra economizar slot de Serverless Function - o plano Hobby da Vercel
 * limita 12 por deployment, e cada arquivo em api/ (incl. api/utils/)
 * conta como uma função.
 */
async function processTelegramMessage(patientId, patientData, textContent, chatId) {
  const replyText = await runSecretariaVirtual(patientId, patientData, textContent);
  if (!replyText) return;
  const ok = await sendTelegramText(chatId, replyText);
  if (ok) console.log('Mensagem Telegram enviada com sucesso.');
}

/**
 * Webhook do Telegram - substitui whatsapp-webhook.js como canal principal
 * a partir de 12/08/2026. Espelha a mesma estrutura (secret obrigatório,
 * resposta 200 imediata, processamento em background) mas usa o
 * mecanismo nativo do Telegram: header X-Telegram-Bot-Api-Secret-Token
 * (configurado via setWebhook, ver scripts/setup_telegram.cjs) em vez do
 * "Authorization: Bearer" usado pela Evolution API.
 */
export default async function handler(req, res) {
  // GET protegido por secret: consulta getWebhookInfo pra diagnostico de
  // ops (sem precisar de um endpoint admin separado - orcamento de
  // Serverless Functions apertado no Hobby, ver backlog.md 12/08/2026).
  if (req.method === 'GET') {
    const webhookSecret = process.env.TELEGRAM_WEBHOOK_SECRET;
    if (req.headers['x-diag-secret'] !== webhookSecret) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const infoResp = await fetch(`https://api.telegram.org/bot${token}/getWebhookInfo`);
    const infoData = await infoResp.json();
    return res.status(200).json(infoData);
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const webhookSecret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('TELEGRAM_WEBHOOK_SECRET não configurada no ambiente.');
    return res.status(500).json({ error: 'Configuração de segurança ausente no servidor.' });
  }
  if (req.headers['x-telegram-bot-api-secret-token'] !== webhookSecret) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const update = req.body || {};
  const message = update.message;

  if (!message) {
    return res.status(200).send('Event ignored');
  }

  const chatId = message.chat?.id;
  const fromText = message.text || message.caption || '';

  if (!chatId) {
    return res.status(200).send('No chat id');
  }

  // IMPORTANTE: processa e espera (await) ANTES de responder. A versao
  // anterior respondia 200 e rodava o resto solto num IIFE sem await
  // ("fire and forget") - a Vercel congela/mata a funcao assim que a
  // resposta e enviada, entao esse trabalho solto nunca chegava a rodar de
  // verdade (bug encontrado em producao em 12/08/2026: webhook recebia e
  // respondia 200, mas Firestore/Telegram nunca eram chamados de fato).
  // Telegram tolera ate 60s de resposta antes de dar timeout/retry, entao
  // esperar aqui e seguro.
  try {
    // /start <patientId> - vínculo inicial. O link é gerado no Perfil do
    // paciente (Profile.jsx), só visível pra ele logado, então o
    // patientId funciona como token de posse nesse fluxo (mesmo nível de
    // confiança que outros vínculos do app).
    if (fromText.startsWith('/start')) {
      const patientId = fromText.replace('/start', '').trim();
      if (!patientId) {
        await sendTelegramText(chatId, 'Olá! Para vincular sua conta, abra o link "Conectar Telegram" dentro do seu Perfil no app Nutrivvo.');
        return res.status(200).json({ status: 'ok' });
      }

      const patientRef = db.collection('patients').doc(patientId);
      const patientSnap = await patientRef.get();
      if (!patientSnap.exists) {
        await sendTelegramText(chatId, 'Não encontrei seu cadastro. Verifique se abriu o link certo dentro do app Nutrivvo.');
        return res.status(200).json({ status: 'ok' });
      }

      await patientRef.set({ telegram_chat_id: chatId, telegram_linked_at: new Date() }, { merge: true });
      const patientData = patientSnap.data();
      await sendTelegramText(chatId, `Prontinho, ${patientData.name?.split(' ')[0] || ''}! 🎉 Seu Telegram está conectado ao Nutrivvo. Pode me mandar mensagem por aqui sempre que precisar - dúvidas sobre a dieta, o que comeu no dia, ou marcar consulta.`);
      return res.status(200).json({ status: 'ok' });
    }

    if (!fromText) {
      return res.status(200).json({ status: 'ok' });
    }

    // Busca o paciente pelo chat_id já vinculado.
    const patientsRef = db.collection('patients');
    const snapshot = await patientsRef.where('telegram_chat_id', '==', chatId).limit(1).get();

    if (snapshot.empty) {
      await sendTelegramText(chatId, 'Seu Telegram ainda não está vinculado a nenhuma conta Nutrivvo. Abra "Conectar Telegram" no seu Perfil dentro do app pra vincular.');
      return res.status(200).json({ status: 'ok' });
    }

    const doc = snapshot.docs[0];
    const patientId = doc.id;
    const patientData = doc.data();

    await processTelegramMessage(patientId, patientData, fromText, chatId);
    return res.status(200).json({ status: 'ok' });
  } catch (err) {
    console.error('Erro no processamento do webhook do Telegram:', err);
    // Ainda responde 200 pro Telegram nao ficar retentando um update que
    // provavelmente vai falhar de novo do mesmo jeito.
    return res.status(200).json({ status: 'error_logged' });
  }
}
