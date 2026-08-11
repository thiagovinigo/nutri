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
import { timingSafeEqual } from 'crypto';

function secretsMatch(a, b) {
  const bufA = Buffer.from(String(a));
  const bufB = Buffer.from(String(b));
  // timingSafeEqual exige buffers do mesmo tamanho - sem isso, o length
  // mismatch já vazaria timing information antes mesmo de comparar.
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const adminSecret = process.env.QR_ADMIN_SECRET;
  const providedSecret = req.headers['x-admin-secret'];

  // Comparacao timing-safe (achado HIGH #6 da auditoria de 11/08/2026) -
  // este endpoint concede controle total de pareamento do WhatsApp.
  if (!adminSecret || !providedSecret || !secretsMatch(providedSecret, adminSecret)) {
    return res.status(401).json({ error: 'Não autorizado.' });
  }

  const evolutionUrl = process.env.EVOLUTION_API_URL;
  const instanceName = process.env.EVOLUTION_INSTANCE_NAME;
  const apikey = process.env.EVOLUTION_API_KEY;

  if (!evolutionUrl || !instanceName || !apikey) {
    console.error('Configurações da Evolution API faltando no ambiente.');
    return res.status(500).json({ error: 'Configuração da Evolution API ausente no servidor.' });
  }

  // POST ?action=setWebhookSecret: configura a Evolution API pra mandar
  // "Authorization: Bearer $WEBHOOK_SECRET" em toda chamada ao nosso
  // webhook, preservando url/events atuais. Passo necessario do fix do
  // achado HIGH #4 da auditoria de 11/08 - sem isso, tornar WEBHOOK_SECRET
  // obrigatorio em whatsapp-webhook.js quebraria o recebimento real de
  // mensagens (a Evolution API nao manda nenhum header hoje).
  if (req.method === 'POST' && req.query.action === 'setWebhookSecret') {
    const webhookSecret = process.env.WEBHOOK_SECRET;
    if (!webhookSecret) {
      return res.status(500).json({ error: 'WEBHOOK_SECRET não configurada no servidor.' });
    }

    try {
      const currentResp = await fetch(`${evolutionUrl}/webhook/find/${instanceName}`, {
        method: 'GET',
        headers: { apikey }
      });
      const current = await currentResp.json();
      if (!currentResp.ok) {
        return res.status(502).json({ error: 'Falha ao ler config atual do webhook.', detail: current });
      }

      const setResp = await fetch(`${evolutionUrl}/webhook/set/${instanceName}`, {
        method: 'POST',
        headers: { apikey, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          webhook: {
            url: current.url,
            enabled: current.enabled,
            events: current.events,
            webhookByEvents: current.webhookByEvents,
            webhookBase64: current.webhookBase64,
            headers: { Authorization: `Bearer ${webhookSecret}` }
          }
        })
      });
      const setData = await setResp.json();
      if (!setResp.ok) {
        return res.status(502).json({ error: 'Falha ao configurar header do webhook.', detail: setData });
      }

      return res.status(200).json({ before: current, after: setData });
    } catch (error) {
      console.error('Erro ao configurar webhook secret:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  // ?action=state consulta o status atual da conexao; ?action=webhook
  // consulta a config atual do webhook.
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
