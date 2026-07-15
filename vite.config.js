import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// `api/openai-bridge.js` é uma Vercel Serverless Function — só roda quando
// publicada na Vercel (ou via `vercel dev`). Rodando com `npm run dev`
// (Vite puro), essa rota não existe de verdade, e o fetch do frontend caía
// no fallback de SPA (recebia o próprio index.html como resposta), quebrando
// de um jeito confuso. Este plugin replica o mesmo handler como middleware
// do servidor de dev do Vite, pra `/api/openai-bridge` funcionar igual em
// dev e em produção.
function openaiBridgeDevMiddleware(env) {
  return {
    name: 'openai-bridge-dev-middleware',
    configureServer(server) {
      server.middlewares.use('/api/openai-bridge', async (req, res) => {
        if (req.method === 'OPTIONS') { res.statusCode = 200; res.end(); return; }
        if (req.method !== 'POST') { res.statusCode = 405; res.end(JSON.stringify({ error: 'Method Not Allowed' })); return; }

        let body = '';
        for await (const chunk of req) body += chunk;

        try {
          const { messages, system_prompt, format_json } = JSON.parse(body || '{}');
          const OPENAI_API_KEY = env.OPENAI_API_KEY;
          if (!OPENAI_API_KEY) {
            throw new Error('OPENAI_API_KEY não configurada no .env (variável de servidor, sem prefixo VITE_).');
          }

          const requestBody = {
            model: 'gpt-4o-mini',
            messages: [{ role: 'system', content: system_prompt || 'Você é um assistente.' }, ...(messages || [])]
          };
          if (format_json) requestBody.response_format = { type: 'json_object' };

          const apiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
          });
          const data = await apiResponse.json();
          res.setHeader('Content-Type', 'application/json');
          res.statusCode = 200;
          res.end(JSON.stringify(data));
        } catch (error) {
          res.setHeader('Content-Type', 'application/json');
          res.statusCode = 500;
          res.end(JSON.stringify({ error: error.message }));
        }
      });
    }
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
  plugins: [
    react(),
    openaiBridgeDevMiddleware(env),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'Vytal',
        short_name: 'Vytal',
        description: 'Plataforma de Nutrição Inteligente',
        theme_color: '#3949AB',
        background_color: '#f8fafc',
        display: 'standalone',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
  };
});
