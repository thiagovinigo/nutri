import { normalizePhoneWithDDI, sendWhatsAppText } from './utils/whatsapp.js';

export const config = {
  api: {
    bodyParser: true,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { phone, message } = req.body;

    if (!phone || !message) {
      return res.status(400).json({ error: 'Phone and message are required' });
    }

    const remoteJid = `${normalizePhoneWithDDI(phone)}@s.whatsapp.net`;
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
