import { db } from './utils/firebase-admin.js';
import {
  sendTelegramText,
  sendTelegramKeyboard,
  answerTelegramCallback,
  fetchTelegramPhotoAsDataUrl,
  fetchTelegramFileAsBuffer
} from './utils/telegram.js';
import { runSecretariaVirtual, transcribeAudioWithWhisper } from './utils/secretariaVirtual.js';

/**
 * Processa a mensagem com a Secretária Virtual (IA) e responde pelo
 * Telegram - com botões de resposta rápida quando a IA pediu opções via
 * 'perguntar_multipla_escolha'. Inline aqui (em vez de um arquivo
 * telegram-ai.js separado) pra economizar slot de Serverless Function - o
 * plano Hobby da Vercel limita 12 por deployment, e cada arquivo em api/
 * (incl. api/utils/) conta como uma função.
 */
async function processTelegramMessage(patientId, patientData, textContent, chatId, imageDataUrl) {
  const reply = await runSecretariaVirtual(patientId, patientData, textContent, imageDataUrl);
  if (!reply || !reply.text) return;

  const ok = (reply.options && reply.options.length > 0)
    ? await sendTelegramKeyboard(chatId, reply.text, reply.options)
    : await sendTelegramText(chatId, reply.text);

  if (ok) console.log('Mensagem Telegram enviada com sucesso.');
}

/**
 * Busca o paciente pelo chat_id já vinculado e processa uma entrada de
 * texto (digitada, transcrita de áudio, ou vinda de um clique em botão
 * inline - as três chegam aqui do mesmo jeito, a IA nunca precisa saber a
 * origem).
 */
async function handlePatientText(chatId, fromText, imageDataUrl, res) {
  const patientsRef = db.collection('patients');
  const snapshot = await patientsRef.where('telegram_chat_id', '==', chatId).limit(1).get();

  if (snapshot.empty) {
    await sendTelegramText(chatId, 'Seu Telegram ainda não está vinculado a nenhuma conta Nutrivvo. Abra "Conectar Telegram" no seu Perfil dentro do app pra vincular.');
    return res.status(200).json({ status: 'ok' });
  }

  const doc = snapshot.docs[0];
  await processTelegramMessage(doc.id, doc.data(), fromText, chatId, imageDataUrl);
  return res.status(200).json({ status: 'ok' });
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
  const callbackQuery = update.callback_query;

  if (!message && !callbackQuery) {
    return res.status(200).send('Event ignored');
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
    // Clique num botão inline (resposta a 'perguntar_multipla_escolha') -
    // trata o texto do botão exatamente como se o paciente tivesse digitado.
    if (callbackQuery) {
      await answerTelegramCallback(callbackQuery.id);
      const chatId = callbackQuery.message?.chat?.id;
      const fromText = callbackQuery.data || '';
      if (!chatId || !fromText) {
        return res.status(200).json({ status: 'ok' });
      }
      return await handlePatientText(chatId, fromText, null, res);
    }

    const chatId = message.chat?.id;
    let fromText = message.text || message.caption || '';
    // O Telegram manda o mesmo arquivo em vários tamanhos - o último elemento
    // do array é sempre a maior resolução disponível.
    const photos = Array.isArray(message.photo) ? message.photo : [];
    const hasPhoto = photos.length > 0;
    // "voice" = nota de voz gravada no próprio Telegram; "audio" = arquivo de
    // áudio enviado como anexo. Tratamos os dois igual.
    const voiceFileId = message.voice?.file_id || message.audio?.file_id || null;

    if (!chatId) {
      return res.status(200).send('No chat id');
    }

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

    // Nota de voz/áudio: baixa e transcreve com Whisper ANTES de seguir pro
    // fluxo normal de texto - se a transcrição falhar, avisa o paciente em
    // vez de processar uma mensagem vazia.
    if (voiceFileId && !fromText) {
      const audioFile = await fetchTelegramFileAsBuffer(voiceFileId);
      const transcript = audioFile ? await transcribeAudioWithWhisper(audioFile.buffer, audioFile.filename) : null;
      if (!transcript) {
        await sendTelegramText(chatId, 'Não consegui entender o áudio 😕 Pode tentar de novo ou escrever a mensagem?');
        return res.status(200).json({ status: 'ok' });
      }
      fromText = transcript;
    }

    if (!fromText && !hasPhoto) {
      return res.status(200).json({ status: 'ok' });
    }

    // Baixa a foto ANTES de chamar a IA - se falhar, ainda seguimos com o
    // texto/legenda (se houver) em vez de travar a resposta inteira.
    const imageDataUrl = hasPhoto
      ? await fetchTelegramPhotoAsDataUrl(photos[photos.length - 1].file_id)
      : null;

    return await handlePatientText(chatId, fromText, imageDataUrl, res);
  } catch (err) {
    console.error('Erro no processamento do webhook do Telegram:', err);
    // Ainda responde 200 pro Telegram nao ficar retentando um update que
    // provavelmente vai falhar de novo do mesmo jeito.
    return res.status(200).json({ status: 'error_logged' });
  }
}
