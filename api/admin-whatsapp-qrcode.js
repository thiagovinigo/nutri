import { requireAuthUid } from './utils/auth.js';

/**
 * Endpoint administrativo temporario pra buscar o QR code de pareamento
 * da instancia WhatsApp (Evolution API) quando ela cai/precisa reconectar.
 * Usa as credenciais server-side (EVOLUTION_API_URL/EVOLUTION_API_KEY),
 * nunca expostas no client. Protegido por login Firebase - qualquer conta
 * autenticada pode chamar, ja que o app e solo-dev (ver auth.js).
 *
 * Remover este arquivo depois de reconectar o bot; ele existe so pra
 * contornar a impossibilidade de acessar as env vars de producao a
 * partir de fora da Vercel.
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    await requireAuthUid(req);
  } catch (err) {
    return res.status(err.statusCode || 401).json({ error: err.message });
  }

  const evolutionUrl = process.env.EVOLUTION_API_URL;
  const instanceName = process.env.EVOLUTION_INSTANCE_NAME;
  const apikey = process.env.EVOLUTION_API_KEY;

  if (!evolutionUrl || !instanceName || !apikey) {
    console.error('Configurações da Evolution API faltando no ambiente.');
    return res.status(500).json({ error: 'Configuração da Evolution API ausente no servidor.' });
  }

  try {
    const response = await fetch(`${evolutionUrl}/instance/connect/${instanceName}`, {
      method: 'GET',
      headers: { apikey }
    });

    const data = await response.json();

    if (!response.ok) {
      console.error(`Erro Evolution API (connect): ${response.status}`, data);
      return res.status(502).json({ error: 'Falha ao buscar QR code na Evolution API.', detail: data });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error('Erro ao buscar QR code da Evolution API:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
