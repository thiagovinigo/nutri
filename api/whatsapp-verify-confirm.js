import crypto from 'crypto';
import { db } from './utils/firebase-admin.js';
import { FieldValue } from 'firebase-admin/firestore';
import { requireAuthUid } from './utils/auth.js';

const MAX_ATTEMPTS = 5;

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

  const { patientId, code } = req.body || {};
  if (!patientId || !code) {
    return res.status(400).json({ error: 'patientId e code são obrigatórios' });
  }

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

    if (!patient.phone_otp_hash || !patient.phone_otp_expires) {
      return res.status(400).json({ error: 'Nenhum código pendente. Peça um código novo.' });
    }

    const attempts = patient.phone_otp_attempts || 0;
    if (attempts >= MAX_ATTEMPTS) {
      return res.status(429).json({ error: 'Muitas tentativas erradas. Peça um código novo.' });
    }

    const expiresAt = patient.phone_otp_expires?.toDate ? patient.phone_otp_expires.toDate().getTime() : 0;
    if (Date.now() > expiresAt) {
      return res.status(400).json({ error: 'Código expirado. Peça um código novo.' });
    }

    const matches = hashCode(code, patientId) === patient.phone_otp_hash;

    if (!matches) {
      await patientRef.set({ phone_otp_attempts: attempts + 1 }, { merge: true });
      return res.status(400).json({ error: 'Código incorreto.' });
    }

    // Sucesso: marca como verificado e limpa os campos de OTP (não ficam pra trás).
    await patientRef.set({
      phone_verified: true,
      phone_verify_reminder_sent: false,
      phone_otp_hash: FieldValue.delete(),
      phone_otp_expires: FieldValue.delete(),
      phone_otp_attempts: FieldValue.delete(),
      phone_otp_sent_at: FieldValue.delete()
    }, { merge: true });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Erro ao confirmar código de verificação:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
