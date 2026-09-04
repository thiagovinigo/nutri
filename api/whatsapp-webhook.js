import { db } from '../lib/firebase-admin.js';
import { sendWhatsAppText, sendWhatsAppOptionsList, fetchWhatsAppMediaAsDataUrl, fetchWhatsAppAudioAsBuffer } from '../lib/whatsapp.js';
import { runSecretariaVirtual, transcribeAudioWithWhisper } from '../lib/secretariaVirtual.js';

/**
 * Processa a mensagem com a Secretária Virtual (IA) e responde pelo
 * WhatsApp - mirror de processTelegramMessage em telegram-webhook.js, só
 * trocando o canal e a forma de renderizar as opções (lista numerada em
 * texto puro, sem botão nativo - ver sendWhatsAppOptionsList).
 */
async function processWhatsAppMessage(patientId, patientData, textContent, chatId, imageDataUrl) {
  const reply = await runSecretariaVirtual(patientId, patientData, textContent, imageDataUrl, 'whatsapp');
  if (!reply || !reply.text) return;

  const ok = (reply.options && reply.options.length > 0)
    ? await sendWhatsAppOptionsList(chatId, reply.text, reply.options)
    : await sendWhatsAppText(chatId, reply.text);

  if (ok) console.log('Mensagem WhatsApp enviada com sucesso.');
}

/**
 * Busca o paciente pelo whatsapp_chat_id já vinculado e processa uma
 * entrada de texto (digitada, ou transcrita de áudio) - mirror de
 * handlePatientText em telegram-webhook.js.
 */
async function handlePatientText(chatId, fromText, imageDataUrl, res) {
  const patientsRef = db.collection('patients');
  const snapshot = await patientsRef.where('whatsapp_chat_id', '==', chatId).limit(1).get();

  if (snapshot.empty) {
    await sendWhatsAppText(chatId, 'Seu WhatsApp ainda não está vinculado a nenhuma conta Nutrivvo. Abra "Conectar WhatsApp" no seu Perfil dentro do app pra vincular.');
    return res.status(200).json({ status: 'ok' });
  }

  const doc = snapshot.docs[0];
  const patientData = doc.data();
  await processWhatsAppMessage(doc.id, patientData, fromText, chatId, imageDataUrl);

  // Gamificação: Atualiza XP, Streak e lastActivityDate pelo WhatsApp -
  // mesma regra de telegram-webhook.js (campos são compartilhados entre
  // canais, não duplicados por canal).
  const today = new Date().toISOString();
  let newXp = (patientData.xp || 0) + 10;
  let newStreak = patientData.streak || 0;
  const lastActivity = patientData.lastActivityDate ? new Date(patientData.lastActivityDate) : null;
  const now = new Date();

  if (!lastActivity || lastActivity.toDateString() !== now.toDateString()) {
    if (lastActivity) {
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      if (lastActivity.toDateString() === yesterday.toDateString()) {
        newStreak += 1;
      } else {
        newStreak = 1;
      }
    } else {
      newStreak = 1;
    }
  }

  await doc.ref.update({
    xp: newXp,
    streak: newStreak,
    lastActivityDate: today
  });

  return res.status(200).json({ status: 'ok' });
}

/**
 * Webhook da Evolution API (WhatsApp) - mirror de telegram-webhook.js,
 * adaptado pro formato de evento MESSAGES_UPSERT da Evolution. Autenticação
 * via campo "apikey" no corpo do payload (a Evolution embute a Global API
 * Key em todo webhook disparado - headers customizados não são
 * confiáveis/suportados nesta versão, ver verificação no plano). Mesma
 * disciplina de responder só DEPOIS de processar (await) que o
 * telegram-webhook.js - nunca "fire and forget", ver comentário lá pro bug
 * de producao que isso causou em 12/08/2026.
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Autenticação via header customizado (configurado no /webhook/set da
  // instância) - NÃO via req.body.apikey. O campo "apiKey" que a Evolution
  // embute no corpo (camelCase, não "apikey") só existe quando
  // AUTHENTICATION_EXPOSE_IN_FETCH_INSTANCES está ativo e carrega o token
  // DA INSTÂNCIA, não a Global API Key - descoberto lendo o código-fonte da
  // imagem (evoapicloud/evolution-api v2.3.7, método sendDataWebhook) depois
  // de um 401 silencioso em produção. Header é mais simples e reaproveita a
  // mesma EVOLUTION_API_KEY já usada nas chamadas REST de saída.
  const expectedApiKey = process.env.EVOLUTION_API_KEY;
  if (!expectedApiKey) {
    console.error('EVOLUTION_API_KEY não configurada no ambiente.');
    return res.status(500).json({ error: 'Configuração de segurança ausente no servidor.' });
  }
  if (req.headers['apikey'] !== expectedApiKey) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const event = String(req.body?.event || '').toLowerCase();
  const data = req.body?.data;
  const isMessageEvent = event === 'messages.upsert' || event === 'messages_upsert';

  if (!isMessageEvent || !data) {
    return res.status(200).json({ status: 'ignored' });
  }

  // Ignora eco das próprias mensagens enviadas pelo bot (fromMe: true) -
  // sem essa checagem o webhook entraria num loop respondendo a si mesmo.
  if (data.key?.fromMe) {
    return res.status(200).json({ status: 'ignored' });
  }

  const chatId = data.key?.remoteJid;
  if (!chatId) {
    return res.status(200).send('No remoteJid');
  }

  try {
    let fromText = data.message?.conversation || data.message?.extendedTextMessage?.text || '';
    const imageMessage = data.message?.imageMessage;
    const audioMessage = data.message?.audioMessage;

    // /start <patientId> - vínculo inicial via link wa.me pré-preenchido
    // (gerado no Perfil do paciente, Profile.jsx) - mesmo princípio de
    // confiança do fluxo do Telegram.
    if (fromText.startsWith('/start')) {
      const patientId = fromText.replace('/start', '').trim();
      if (!patientId) {
        await sendWhatsAppText(chatId, 'Olá! Para vincular sua conta, abra o link "Conectar WhatsApp" dentro do seu Perfil no app Nutrivvo.');
        return res.status(200).json({ status: 'ok' });
      }

      const patientRef = db.collection('patients').doc(patientId);
      const patientSnap = await patientRef.get();
      if (!patientSnap.exists) {
        await sendWhatsAppText(chatId, 'Não encontrei seu cadastro. Verifique se abriu o link certo dentro do app Nutrivvo.');
        return res.status(200).json({ status: 'ok' });
      }

      await patientRef.set({ whatsapp_chat_id: chatId, whatsapp_linked_at: new Date() }, { merge: true });
      const patientData = patientSnap.data();
      await sendWhatsAppText(chatId, `Prontinho, ${patientData.name?.split(' ')[0] || ''}! 🎉 Seu WhatsApp está conectado ao Nutrivvo. Pode me mandar mensagem por aqui sempre que precisar - dúvidas sobre a dieta, o que comeu no dia, ou marcar consulta.`);
      return res.status(200).json({ status: 'ok' });
    }

    // Nota de voz/áudio: baixa e transcreve com Whisper ANTES de seguir pro
    // fluxo normal de texto.
    if (audioMessage && !fromText) {
      const audioFile = await fetchWhatsAppAudioAsBuffer(data.key);
      const transcript = audioFile ? await transcribeAudioWithWhisper(audioFile.buffer, audioFile.filename) : null;
      if (!transcript) {
        await sendWhatsAppText(chatId, 'Não consegui entender o áudio 😕 Pode tentar de novo ou escrever a mensagem?');
        return res.status(200).json({ status: 'ok' });
      }
      fromText = transcript;
    }

    // Legenda de uma foto conta como texto se não veio nenhum outro.
    if (imageMessage?.caption && !fromText) {
      fromText = imageMessage.caption;
    }

    if (!fromText && !imageMessage) {
      return res.status(200).json({ status: 'ok' });
    }

    const imageDataUrl = imageMessage
      ? await fetchWhatsAppMediaAsDataUrl(data.key)
      : null;

    return await handlePatientText(chatId, fromText, imageDataUrl, res);
  } catch (err) {
    console.error('Erro no processamento do webhook do WhatsApp:', err);
    // Ainda responde 200 pra Evolution API nao ficar retentando um evento
    // que provavelmente vai falhar de novo do mesmo jeito.
    return res.status(200).json({ status: 'error_logged' });
  }
}
