// Servidor de produção (VPS): substitui a Vercel.
// - Serve o build do Vite (dist/) com fallback SPA
// - Expõe cada api/<nome>.js em /api/<nome> (mesmo contrato req/res da Vercel)
import express from 'express';
import { readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const API_DIR = path.join(ROOT, 'api');
const DIST_DIR = path.join(ROOT, 'dist');
const PORT = Number(process.env.PORT) || 3000;
const BODY_LIMIT = '2mb';

async function loadApiRoutes(app) {
  const files = (await readdir(API_DIR)).filter((f) => f.endsWith('.js'));
  for (const file of files) {
    const name = path.basename(file, '.js');
    const mod = await import(pathToFileURL(path.join(API_DIR, file)).href);
    if (typeof mod.default !== 'function') {
      throw new Error(`api/${file} não exporta um handler default`);
    }
    // Express 5 já captura rejeições de handlers async e responde 500.
    app.all(`/api/${name}`, mod.default);
    console.log(`[server] rota registrada: /api/${name}`);
  }
}

async function main() {
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', 1); // atrás do Caddy

  app.get('/health', (_req, res) => res.status(200).json({ status: 'ok' }));

  // `verify` guarda o corpo bruto: webhooks assinados (WAHA, HMAC-SHA512)
  // precisam validar a assinatura sobre os bytes originais, não sobre o JSON
  // reserializado.
  app.use('/api', express.json({
    limit: BODY_LIMIT,
    verify: (req, _res, buf) => { req.rawBody = buf; }
  }));
  await loadApiRoutes(app);
  app.use('/api', (_req, res) => res.status(404).json({ error: 'Not found' }));

  app.use(express.static(DIST_DIR, { index: false, maxAge: '1h' }));
  app.get(/.*/, (_req, res) => res.sendFile(path.join(DIST_DIR, 'index.html')));

  app.listen(PORT, () => console.log(`[server] ouvindo na porta ${PORT}`));
}

main().catch((err) => {
  console.error('[server] falha ao iniciar:', err);
  process.exit(1);
});
