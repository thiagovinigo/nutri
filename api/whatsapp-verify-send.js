import crypto from 'crypto';
import { db } from './utils/firebase-admin.js';
import { requireAuthUid } from './utils/auth.js';
import { normalizePhoneWithDDI, sendWhatsAppText } from './utils/whatsapp.js';

const OTP_COOLDOWN_MS = 60 * 1000; // 60s entre envios
const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutos de validade

function hashCode(code, patientId) {
  return crypto.createHash('sha256').update(`${code}:${patientId}`).digest('hex');
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  let uid;
  try {
    uid = await requireAuthUid(req);
  } catch (err) {
    return res.status(err.statusCode || 401).json({ error: err.message });
  }

  const { patientId } = req.body || {};
  if (!patientId) {
    return res.status(400).json({ error: 'patientId é obrigatório' });
  }

  // O paciente só pode disparar verificação pro próprio número.
  if (uid !== patientId) {
    return res.status(403).json({ error: 'Você só pode verificar o seu próprio número.' });
  }

  try {
    const patientRef = db.collection('patients').doc(patientId);
    const patientSnap = await patientRef.get();

    if (!patientSnap.exists) {
      return res.status(404).json({ error: 'Paciente não encontrado' });
    }

    const patient = patientSnap.data();
    if (!patient.phone) {
      return res.status(400).json({ error: 'Cadastre um telefone antes de verificar.' });
    }

    const lastSentAt = patient.phone_otp_sent_at?.toDate ? patient.phone_otp_sent_at.toDate().getTime() : 0;
    if (lastSentAt && Date.now() - lastSentAt < OTP_COOLDOWN_MS) {
      const waitSeconds = Math.ceil((OTP_COOLDOWN_MS - (Date.now() - lastSentAt)) / 1000);
      return res.status(429).json({ error: `Aguarde ${waitSeconds}s antes de pedir um novo código.` });
    }

    const code = crypto.randomInt(100000, 1000000).toString();

    await patientRef.set({
      phone_otp_hash: hashCode(code, patientId),
      phone_otp_expires: new Date(Date.now() + OTP_TTL_MS),
      phone_otp_attempts: 0,
      phone_otp_sent_at: new Date(),
      phone_verified: false
    }, { merge: true });

    const remoteJid = `${normalizePhoneWithDDI(patient.phone)}@s.whatsapp.net`;
    const text = `🔐 Seu código de verificação Nutrivvo é: *${code}*\n\nEle expira em 10 minutos. Não compartilhe com ninguém.`;
    const sent = await sendWhatsAppText(remoteJid, text);

    if (!sent) {
      return res.status(500).json({ error: 'Falha ao enviar o código pelo WhatsApp. Tente novamente.' });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Erro ao gerar/enviar código de verificação:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
