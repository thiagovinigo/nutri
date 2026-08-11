import { z } from 'zod';
import { db } from './utils/firebase-admin.js';
import { requireAuthUid } from './utils/auth.js';
import { normalizePhoneWithDDI, sendWhatsAppText } from './utils/whatsapp.js';

// 4096 = limite de caracteres de uma mensagem de texto do WhatsApp.
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

  // Sem auth + validacao de dono, qualquer pessoa na internet podia mandar
  // mensagem arbitraria pra qualquer numero usando o WhatsApp da clinica
  // como remetente (achado CRITICAL da auditoria de seguranca de
  // 11/08/2026). Exige login e so envia pro telefone que ja esta salvo no
  // paciente do proprio nutricionista - nunca aceita um `phone` livre vindo
  // do client.
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
    if (!patient.phone) {
      return res.status(400).json({ error: 'Paciente não tem telefone cadastrado.' });
    }

    const remoteJid = `${normalizePhoneWithDDI(patient.phone)}@s.whatsapp.net`;
    const ok = await sendWhatsAppText(remoteJid, message);

    if (!ok) {
      return res.status(500).json({ error: 'Falha ao enviar mensagem' });
    }

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error("Erro na API de envio do WhatsApp:", error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
