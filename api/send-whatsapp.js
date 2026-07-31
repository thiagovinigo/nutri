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

    const evolutionUrl = process.env.EVOLUTION_API_URL;
    const instanceName = process.env.EVOLUTION_INSTANCE_NAME;
    const apikey = process.env.EVOLUTION_API_KEY;

    if (!evolutionUrl || !instanceName || !apikey) {
      console.error("Configurações da Evolution API faltando.");
      return res.status(500).json({ error: 'Evolution API config missing' });
    }

    const endpoint = `${evolutionUrl}/message/sendText/${instanceName}`;
    const remoteJid = `${phone}@s.whatsapp.net`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': apikey
      },
      body: JSON.stringify({
        number: remoteJid,
        options: {
          delay: 1500,
          presence: 'composing'
        },
        textMessage: {
          text: message
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Erro Evolution API: ${response.status} - ${errorText}`);
      return res.status(500).json({ error: 'Falha ao enviar mensagem' });
    }

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error("Erro na API de envio do WhatsApp:", error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
