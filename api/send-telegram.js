import { z } from 'zod';
import { db } from './utils/firebase-admin.js';
import { requireAuthUid } from './utils/auth.js';
import { sendTelegramText } from './utils/telegram.js';

// Espelha api/send-whatsapp.js (dormente desde 12/08/2026) pro canal do
// Telegram - mesma validacao de dono do paciente, so troca o transporte.
const sendBodySchema = z.object({
  patientId: z.string().min(1),
  message: z.string().min(1).max(4096),
});

export const config = {
  api: {
    bodyParser: true,
  },
};

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

  const parsed = sendBodySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Payload inválido: ' + parsed.error.issues.map(i => i.message).join('; ') });
  }

  try {
    const { patientId, message } = parsed.data;

    const patientSnap = await db.collection('patients').doc(patientId).get();
    if (!patientSnap.exists) {
      return res.status(404).json({ error: 'Paciente não encontrado' });
    }

    const patient = patientSnap.data();
    if (patient.nutricionista_id !== uid) {
      return res.status(403).json({ error: 'Você não tem acesso a este paciente.' });
    }
    if (!patient.telegram_chat_id) {
      return res.status(400).json({ error: 'Paciente ainda não conectou o Telegram.' });
    }

    const ok = await sendTelegramText(patient.telegram_chat_id, message);

    if (!ok) {
      return res.status(500).json({ error: 'Falha ao enviar mensagem' });
    }

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error("Erro na API de envio do Telegram:", error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
