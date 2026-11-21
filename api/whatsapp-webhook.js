import { db } from '../lib/firebase-admin.js';
import { sendWhatsAppText, sendWhatsAppOptionsList, fetchWhatsAppMediaAsDataUrl, fetchWhatsAppAudioAsBuffer, chatIdVariants, verifyWahaSignature, resolvePhoneChatId, lookupPhoneChatIdByLid } from '../lib/whatsapp.js';
import { runSecretariaVirtual, transcribeAudioWithWhisper } from '../lib/secretariaVirtual.js';
import { redeemNutriLinkCode, redeemPatientLinkCode } from '../lib/nutriLinkServer.js';
import { isWellFormedLinkCode } from '../lib/nutriLinkCode.js';
import { createMessageBuffer } from '../lib/whatsappBuffer.js';

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
async function handlePatientText(chatId, fromText, imageDataUrl) {
  const patientsRef = db.collection('patients');
  // Vínculos antigos foram gravados pela Evolution (@s.whatsapp.net) e os novos
  // pelo WAHA (@c.us): tenta as duas formas, SEMPRE nesta ordem (WAHA primeiro),
  // pra não precisar migrar o Firestore. Consultas separadas, e não "in" +
  // limit(1), porque se o mesmo número estiver ligado a dois pacientes (um
  // legado e um novo) o "in" devolveria um deles de forma arbitrária.
  let snapshot = null;
  for (const variant of chatIdVariants(chatId)) {
    snapshot = await patientsRef.where('whatsapp_chat_id', '==', variant).limit(1).get();
    if (!snapshot.empty) break;
  }

  if (snapshot.empty) {
    await sendWhatsAppText(chatId, 'Seu WhatsApp ainda não está vinculado a nenhuma conta Nutrivvo. Abra "Conectar WhatsApp" no seu Perfil dentro do app pra vincular.');
    return;
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
}

/**
 * Processa um lote de mensagens do mesmo contato (o buffer entrega tudo que o
 * contato escreveu antes de parar de digitar) como UMA entrada pra IA: textos
 * em linhas separadas, e a última foto do lote (a IA recebe uma imagem só).
 */
async function processBatch(chatId, items) {
  const text = items.map((item) => item.text).filter(Boolean).join('\n');
  const imageDataUrl = [...items].reverse().find((item) => item.imageDataUrl)?.imageDataUrl || null;
  await handlePatientText(chatId, text, imageDataUrl);
}

// Segundos de silêncio do contato antes de a IA responder. Quem escreve em
// mensagens picadas ("2 copos de 00 ml" + "100") é respondido uma vez só, com
// o contexto inteiro, e o mesmo contato nunca é processado em paralelo.
export const whatsappMessageBuffer = createMessageBuffer({
  delayMs: () => Number(process.env.WHATSAPP_BUFFER_MS ?? 5000),
  processBatch
});

/**
 * Webhook do WAHA (WhatsApp) - mirror de telegram-webhook.js, adaptado pro
 * evento "message" do WAHA ({ event, session, payload: { from, body, fromMe,
 * hasMedia, media } }). Autenticação por assinatura HMAC-SHA512 do corpo
 * bruto no header X-Webhook-Hmac (server/index.js guarda req.rawBody).
 *
 * Diferente do telegram-webhook.js (que responde só DEPOIS de processar, por
 * causa do bug de produção de 12/08/2026 em serverless), este webhook enfileira
 * a mensagem no buffer por contato e responde 200 na hora: roda só no servidor
 * Express da VPS, que é um processo persistente (não é encerrado após a
 * resposta). Em função serverless a fila em memória não funcionaria.
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Autenticação: o WAHA assina o CORPO BRUTO com HMAC-SHA512 (header
  // X-Webhook-Hmac; server/index.js guarda o corpo em req.rawBody). Falha
  // fechada: sem chave configurada, o webhook não aceita nada.
  const hmacKey = process.env.WAHA_WEBHOOK_HMAC_KEY;
  if (!hmacKey) {
    console.error('WAHA_WEBHOOK_HMAC_KEY não configurada no ambiente.');
    return res.status(500).json({ error: 'Configuração de segurança ausente no servidor.' });
  }
  if (!verifyWahaSignature(req.rawBody, req.headers['x-webhook-hmac'], hmacKey)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const payload = req.body?.payload;
  if (req.body?.event !== 'message' || !payload) {
    return res.status(200).json({ status: 'ignored' });
  }

  // Ignora eco das próprias mensagens enviadas pelo bot (fromMe: true) -
  // sem essa checagem o webhook entraria num loop respondendo a si mesmo.
  if (payload.fromMe) {
    return res.status(200).json({ status: 'ignored' });
  }

  let chatId = payload.from;
  if (!chatId) {
    return res.status(200).send('No from');
  }

  // Contas novas chegam como ID oculto (@lid): converte pro telefone, que é o
  // que identifica o paciente (vínculo e envio usam o número).
  if (chatId.endsWith('@lid')) {
    chatId = resolvePhoneChatId(payload) || await lookupPhoneChatIdByLid(chatId);
    if (!chatId) {
      console.warn(`WhatsApp: remetente @lid sem telefone resolvível ignorado (campos de _data.key: ${Object.keys(payload._data?.key || {}).join(',') || 'nenhum'}).`);
      return res.status(200).json({ status: 'ignored' });
    }
  }

  // Só conversa privada com número de telefone real (@c.us do WAHA ou
  // @s.whatsapp.net de vínculos antigos). Grupos (@g.us), status, canais e
  // IDs ocultos já resolvidos acima são descartados: o lookup do paciente casa
  // só pelos dígitos, e um sufixo diferente poderia apontar pra outra pessoa.
  if (!/^\d{8,15}@(c\.us|s\.whatsapp\.net)$/.test(chatId)) {
    return res.status(200).json({ status: 'ignored' });
  }

  try {
    // No WAHA, "body" carrega tanto o texto digitado quanto a legenda de foto.
    let fromText = payload.body || '';
    const mediaType = payload.hasMedia ? String(payload.media?.mimetype || '') : '';
    const hasImage = mediaType.startsWith('image/');
    const hasAudio = mediaType.startsWith('audio/');

    // /start <codigo> - vínculo inicial via link wa.me pré-preenchido, gerado
    // no Perfil do paciente (Profile.jsx) com um código de uso único.
    if (fromText.startsWith('/start')) {
      const startArg = fromText.replace('/start', '').trim();

      // Vínculo do NUTRICIONISTA pros alertas do Radar de Abandono
      // (api/cron-risk-scan.js). O argumento é um CÓDIGO de uso único gerado
      // no CRM (lib/nutriLinkCode.js), nunca o uid: o uid do nutri não é
      // segredo e deixava qualquer pessoa redirecionar os alertas dele.
      // Mesma extensão feita em api/telegram-webhook.js.
      // (Grupos já foram descartados acima, então aqui o chat é sempre privado.)
      if (startArg.startsWith('nutri:')) {
        const nutriData = await redeemNutriLinkCode(db, startArg.slice('nutri:'.length), {
          whatsapp_chat_id: chatId,
          whatsapp_linked_at: new Date(),
        });
        if (!nutriData) {
          await sendWhatsAppText(chatId, 'Código inválido ou expirado. Abra "Conectar WhatsApp" no seu Perfil Profissional dentro do CRM Nutrivvo para gerar um novo.');
          return res.status(200).json({ status: 'ok' });
        }
        await sendWhatsAppText(chatId, `Prontinho, ${nutriData.name?.split(' ')[0] || ''}! 🎉 Seu WhatsApp está conectado. Você vai receber os alertas do Radar de Abandono por aqui.`);
        return res.status(200).json({ status: 'ok' });
      }

      if (!startArg) {
        await sendWhatsAppText(chatId, 'Olá! Para vincular sua conta, abra o link "Conectar WhatsApp" dentro do seu Perfil no app Nutrivvo.');
        return res.status(200).json({ status: 'ok' });
      }

      // Vínculo do PACIENTE: o argumento é um CÓDIGO de uso único gerado no
      // Perfil do app (lib/patientLinkCode.js), nunca o patientId. O id não é
      // segredo suficiente: quem o soubesse vinculava o próprio WhatsApp à
      // conta do paciente e passava a ler os dados de saúde pela Secretária.
      // O formato antigo ("/start <patientId>") deixou de vincular.
      if (!isWellFormedLinkCode(startArg)) {
        await sendWhatsAppText(chatId, 'Esse link de conexão é antigo ou inválido. Abra "Conectar WhatsApp" no seu Perfil dentro do app Nutrivvo pra gerar um novo.');
        return res.status(200).json({ status: 'ok' });
      }

      const patientData = await redeemPatientLinkCode(db, startArg, {
        whatsapp_chat_id: chatId,
        whatsapp_linked_at: new Date(),
      });
      if (!patientData) {
        await sendWhatsAppText(chatId, 'Código inválido ou expirado. Abra "Conectar WhatsApp" no seu Perfil dentro do app Nutrivvo pra gerar um novo.');
        return res.status(200).json({ status: 'ok' });
      }

      await sendWhatsAppText(chatId, `Prontinho, ${patientData.name?.split(' ')[0] || ''}! 🎉 Seu WhatsApp está conectado ao Nutrivvo. Pode me mandar mensagem por aqui sempre que precisar - dúvidas sobre a dieta, o que comeu no dia, ou marcar consulta.`);
      return res.status(200).json({ status: 'ok' });
    }

    // Nota de voz/áudio: baixa e transcreve com Whisper ANTES de seguir pro
    // fluxo normal de texto.
    if (hasAudio && !fromText) {
      const audioFile = await fetchWhatsAppAudioAsBuffer(payload);
      const transcript = audioFile ? await transcribeAudioWithWhisper(audioFile.buffer, audioFile.filename) : null;
      if (!transcript) {
        await sendWhatsAppText(chatId, 'Não consegui entender o áudio 😕 Pode tentar de novo ou escrever a mensagem?');
        return res.status(200).json({ status: 'ok' });
      }
      fromText = transcript;
    }

    if (!fromText && !hasImage) {
      return res.status(200).json({ status: 'ok' });
    }

    const imageDataUrl = hasImage
      ? await fetchWhatsAppMediaAsDataUrl(payload)
      : null;

    // Responde ao WAHA já; a resposta da IA sai quando o contato para de
    // escrever (ver whatsappMessageBuffer). Erros do lote são logados lá.
    whatsappMessageBuffer.enqueue(chatId, { text: fromText, imageDataUrl });
    return res.status(200).json({ status: 'queued' });
  } catch (err) {
    console.error('Erro no processamento do webhook do WhatsApp:', err);
    // Ainda responde 200 pra o WAHA nao ficar retentando um evento
    // que provavelmente vai falhar de novo do mesmo jeito.
    return res.status(200).json({ status: 'error_logged' });
  }
}
