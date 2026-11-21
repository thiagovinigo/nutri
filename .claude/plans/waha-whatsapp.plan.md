# Plano — WhatsApp via WAHA, milestone 1 (adaptador com paridade)

PRD: `.claude/prds/waha-whatsapp.prd.md` · Status: **aguardando aprovação** (nada implementado)

## Padrões do código a espelhar (lidos em 20/11/2026)
- `lib/whatsapp.js` não importa nada; exporta 4 funções que o webhook e `api/cron-risk-scan.js:115-118` usam. **Manter os nomes e as assinaturas públicas** (exceto o parâmetro de mídia, ver tarefa 2).
- `api/whatsapp-webhook.js`: handler Express/Vercel (`req.body`, `res.status().json()`), responde 200 só depois de processar, trata `/start <patientId>` e `/start nutri:<código>` (`redeemNutriLinkCode`), grava `whatsapp_chat_id` no vínculo e busca por `where('whatsapp_chat_id','==',chatId)`.
- `server/index.js:36`: `express.json({ limit })` em `/api` sem guardar o corpo bruto; é preciso `verify` para o HMAC.
- Testes do projeto: `vitest run` + scripts `.mjs` (`package.json:12`); padrão em `lib/*.test.js` (`describe/test/expect`).
- Campo `whatsapp_chat_id` está em `lib/serverOnlyFields.js:13` (só o servidor grava).

## Arquivos a mudar
| Arquivo | Mudança |
|---|---|
| `lib/whatsapp.js` | Falar com o WAHA; helpers puros `toWahaChatId`, `chatIdVariants`, `verifyWahaSignature` |
| `lib/whatsapp.test.js` (novo) | Testes dos helpers e do envio (fetch mockado) |
| `api/whatsapp-webhook.js` | Parse do evento WAHA, HMAC, lookup por variantes, filtros |
| `server/index.js` | `express.json({ verify })` guardando `req.rawBody` |
| `whatsapp-agent/docker-compose.yml` | `WHATSAPP_HOOK_URL` vira `${WAHA_HOOK_URL:-...}` para apontar ao Node |
| `README.md` / `.env.example` | Trocar `EVOLUTION_*` por `WAHA_*` |
| `backlog.md` | Marcar milestone 1 ao concluir |

Não tocar: `lib/secretariaVirtual.js`, `api/telegram-webhook.js`, scripts `setup_evolution.cjs`, `reset_whatsapp.cjs`, `reconnect_whatsapp.cjs` (ficam como histórico), o `docker-compose.yml` da raiz (Traefik de produção).

## Tarefas (TDD: teste primeiro)
1. **Helpers puros + testes (RED → GREEN).**
   - `toWahaChatId('554199999999@s.whatsapp.net') === '554199999999@c.us'`; número cru também.
   - `chatIdVariants(x)` devolve `[dígitos@c.us, dígitos@s.whatsapp.net]`.
   - `verifyWahaSignature(rawBody, header, key)`: HMAC-SHA512 hex, `timingSafeEqual`; sem chave configurada → **falha fechada** em produção (retorna false); header ausente ou tamanho diferente → false.
2. **Envio e mídia no WAHA.** `sendWhatsAppText` → `POST {WAHA_URL}/api/sendText` com `{session, chatId, text}` e `X-Api-Key`; mesma regra de erro (retorna `false` e loga). Mídia: `fetchWhatsAppMediaBase64(payload)` baixa `payload.media.url` (host trocado para `WAHA_URL`, header `X-Api-Key`) e devolve `{base64, mimetype}`; `media.url` vazio → loga e retorna `null`. Atualizar os dois `fetch*` públicos para receber o `payload` inteiro.
3. **`server/index.js`**: `express.json({ limit, verify: (req, _res, buf) => { req.rawBody = buf; } })`.
4. **Webhook** (`api/whatsapp-webhook.js`):
   - Autenticar com `verifyWahaSignature(req.rawBody, req.headers['x-webhook-hmac'], WAHA_WEBHOOK_HMAC_KEY)`; 401 se inválido, 500 se a chave não estiver configurada (mesmo padrão do código atual).
   - Evento: `req.body.event === 'message'`, `payload = req.body.payload`; ignorar `payload.fromMe`, `@g.us`, `status@broadcast`.
   - Texto: `payload.body`; mídia: `payload.hasMedia` + `payload.media.mimetype` (`image/*`, `audio/*`); legenda de foto = `payload.body`.
   - Lookup do paciente: `where('whatsapp_chat_id', 'in', chatIdVariants(chatId))`.
   - Vínculos novos gravam o `chatId` como o WAHA entrega (`@c.us`).
5. **Config e docs.** Variáveis `WAHA_URL`, `WAHA_API_KEY`, `WAHA_SESSION` (padrão `default`), `WAHA_WEBHOOK_HMAC_KEY` no `.env`/README; compose do WAHA com `WAHA_HOOK_URL=http://host.docker.internal:3001/api/whatsapp-webhook` para teste local (servidor Node com `PORT=3001`, porque a 3000 é do WAHA).
6. **Validação local ponta a ponta** (ver abaixo).

## Validação
- `npm test` passa, com os testes novos de `lib/whatsapp.test.js` cobrindo ≥80% de `lib/whatsapp.js`.
- Teste automatizado: assinatura válida → 200; inválida ou ausente → 401; evento `fromMe`, grupo e status → ignorados sem chamar a IA.
- Manual, com `node server/index.js` (PORT=3001) e WAHA local: (a) `curl` assinado simulando um `message` de paciente já vinculado; (b) número novo por QR, mandar texto, foto e áudio e conferir resposta com tool (ex.: "tomei 2 copos de água" → `log_water` gravado); (c) vínculo antigo `@s.whatsapp.net` ainda responde; (d) `/start nutri:<código>` vincula o nutri; (e) alerta do `cron-risk-scan` chega ao WhatsApp do nutri.
- Revisão obrigatória: `security-reviewer` (webhook, HMAC, input de usuário) e `code-reviewer` antes do commit. Commit direto na `main`, sem push até você pedir.

## Riscos específicos
- **`@lid`**: se `payload.from` vier como `...@lid`, o lookup falha. Tratar só se aparecer no teste real (endpoint de mapeamento no PRD).
- **9º dígito BR**: a doc do WAHA recomenda o `chatId` retornado por `GET /api/contacts/check-exists` para alguns números antigos; o envio usa o `from` recebido, então só afeta envio proativo (cron do nutri). Se falhar, adicionar a consulta nesse caminho.
- **Vercel**: sem `rawBody` o HMAC falha fechado. Aceitável porque a produção é a VPS (Express); a Vercel está para ser pausada.
- **Download de mídia**: confirmar no WAHA local que `media.url` vem preenchido; se não, ligar `WAHA_EVENTS_DOWNLOAD_MEDIA`.
