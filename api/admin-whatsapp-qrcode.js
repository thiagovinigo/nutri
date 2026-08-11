/**
 * Endpoint administrativo temporario pra buscar o QR code de pareamento
 * da instancia WhatsApp (Evolution API) quando ela cai/precisa reconectar.
 * Usa as credenciais server-side (EVOLUTION_API_URL/EVOLUTION_API_KEY),
 * nunca expostas no client. Protegido por um secret dedicado
 * (QR_ADMIN_SECRET) passado no header x-admin-secret - nao usa o login
 * Firebase porque essa chamada precisa ser feita a partir de uma
 * ferramenta externa, sem sessao de navegador.
 *
 * Remover este arquivo e a env var QR_ADMIN_SECRET depois de reconectar
 * o bot; ele existe so pra contornar a impossibilidade de acessar as
 * env vars de producao a partir de fora da Vercel.
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const adminSecret = process.env.QR_ADMIN_SECRET;
  const providedSecret = req.headers['x-admin-secret'];

  if (!adminSecret || providedSecret !== adminSecret) {
    return res.status(401).json({ error: 'Não autorizado.' });
  }

  const evolutionUrl = process.env.EVOLUTION_API_URL;
  const instanceName = process.env.EVOLUTION_INSTANCE_NAME;
  const apikey = process.env.EVOLUTION_API_KEY;

  if (!evolutionUrl || !instanceName || !apikey) {
    console.error('Configurações da Evolution API faltando no ambiente.');
    return res.status(500).json({ error: 'Configuração da Evolution API ausente no servidor.' });
  }

  // ?action=state consulta o status atual da conexao; ?action=webhook
  // consulta a config atual do webhook (usado uma vez pra planejar o fix
  // do achado HIGH #4 da auditoria de 11/08 - exigir WEBHOOK_SECRET).
  const evolutionPathByAction = {
    state: `instance/connectionState/${instanceName}`,
    webhook: `webhook/find/${instanceName}`,
  };
  const evolutionPath = evolutionPathByAction[req.query.action] || `instance/connect/${instanceName}`;

  try {
    const response = await fetch(`${evolutionUrl}/${evolutionPath}`, {
      method: 'GET',
      headers: { apikey }
    });

    const data = await response.json();

    if (!response.ok) {
      console.error(`Erro Evolution API (${evolutionPath}): ${response.status}`, data);
      return res.status(502).json({ error: 'Falha ao consultar a Evolution API.', detail: data });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error('Erro ao consultar a Evolution API:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
