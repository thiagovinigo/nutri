/**
 * Endpoint administrativo temporario pra configurar o webhook do bot do
 * Telegram (setWebhook) a partir do servidor - a rede local usada nesta
 * sessao nao alcanca api.telegram.org diretamente. Mesmo padrao de
 * admin-whatsapp-qrcode.js: protegido por secret dedicado via header
 * x-admin-secret, comparacao timing-safe.
 *
 * Remover este arquivo e a env var TELEGRAM_ADMIN_SECRET depois de
 * confirmar que o webhook foi registrado.
 */
import { timingSafeEqual } from 'crypto';

function secretsMatch(a, b) {
  const bufA = Buffer.from(String(a));
  const bufB = Buffer.from(String(b));
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const adminSecret = process.env.TELEGRAM_ADMIN_SECRET;
  const providedSecret = req.headers['x-admin-secret'];

  if (!adminSecret || !providedSecret || !secretsMatch(providedSecret, adminSecret)) {
    return res.status(401).json({ error: 'Não autorizado.' });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const webhookSecret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (!token || !webhookSecret) {
    return res.status(500).json({ error: 'TELEGRAM_BOT_TOKEN ou TELEGRAM_WEBHOOK_SECRET ausentes no servidor.' });
  }

  const action = req.query.action || 'info';

  try {
    if (req.method === 'POST' && action === 'setWebhook') {
      const webhookUrl = `https://${req.headers.host}/api/telegram-webhook`;
      const setResp = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: webhookUrl, secret_token: webhookSecret })
      });
      const setData = await setResp.json();
      return res.status(setResp.ok ? 200 : 502).json(setData);
    }

    if (action === 'getMe') {
      const meResp = await fetch(`https://api.telegram.org/bot${token}/getMe`);
      const meData = await meResp.json();
      return res.status(meResp.ok ? 200 : 502).json(meData);
    }

    // action=info (padrão): consulta a config atual do webhook
    const infoResp = await fetch(`https://api.telegram.org/bot${token}/getWebhookInfo`);
    const infoData = await infoResp.json();
    return res.status(infoResp.ok ? 200 : 502).json(infoData);
  } catch (error) {
    console.error('Erro no setup admin do Telegram:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
