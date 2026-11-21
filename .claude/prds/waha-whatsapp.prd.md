# WhatsApp via WAHA — paridade com o Telegram

## Problem
O canal WhatsApp da Secretária Virtual roda na Evolution API (Baileys), e o número foi queimado 3 vezes (o primeiro em 12/08/2026; os outros dois desde então). Cada banimento derruba o canal com pacientes reais até um número novo ser reconectado. A Evolution também tem gerenciamento instável (instância cai, webhook com autenticação confusa, ver comentário em `api/whatsapp-webhook.js:88-95`). O nutricionista quer trocar o motor para o WAHA, e o WhatsApp tem que se comportar **igual ao Telegram de hoje**.

## Evidence
- Pedido direto do dono do produto (20/11/2026): "não está gerenciando bem e queimando número, já foram 3" e "o agente do whats deve rodar igual do que temos hoje no telegram".
- Código: o motor da IA já é compartilhado entre canais (`lib/secretariaVirtual.js`, 15 tools, `runSecretariaVirtual(..., 'whatsapp')`). A Evolution só aparece em `lib/whatsapp.js` (envio, lista numerada, download de mídia) e em `api/whatsapp-webhook.js` (parse do evento e autenticação). Trocar o motor de canal não exige tocar nas tools.
- Docs do WAHA (lidas em 20/11/2026): `POST /api/sendText`, webhook `event: "message"`, HMAC-SHA512 em `X-Webhook-Hmac`, mídia por URL. WAHA Core é gratuito (a Plus foi incorporada à Core na 2026.6.1).
- Protótipo `whatsapp-agent/` (Python) já valida WAHA + ritmo humano, mas **não** tem as tools; decisão do dono: seguir no Node atual (caminho B) e usar o protótipo só como referência.

## Users
- **Primary**: Paciente que conversa com a Secretária Virtual pelo WhatsApp (mesmas capacidades do Telegram).
- **Secondary**: Nutricionista, que recebe os alertas do Radar de Abandono pelo WhatsApp (`api/cron-risk-scan.js`) e quer um canal que não caia.
- **Not for**: Migrar o motor para Python; trocar de canal oficial (Cloud API da Meta); envio proativo/em massa.

## Hypothesis
We believe **trocar a camada de canal do WhatsApp da Evolution para o WAHA (adaptador em `lib/whatsapp.js` e `api/whatsapp-webhook.js`), mantendo o motor de IA como está, e depois adicionar ritmo humano (buffer, visto, "digitando", mensagens curtas)** will **dar ao WhatsApp o mesmo comportamento do Telegram num número novo, com menos chance de bloqueio** for **pacientes e nutricionistas do Nutrivvo**.
We'll know we're right when **um paciente já vinculado manda texto, foto e áudio num número novo e recebe a mesma resposta (com tools) que receberia no Telegram, e o número segue ativo depois de 14 dias de uso real**.

## Success Metrics
| Metric | Target | How measured |
|---|---|---|
| Texto, foto e áudio recebidos pelo WAHA geram resposta da IA com tools | 100% dos casos testados | QA manual com número de teste |
| Webhook rejeita requisição sem assinatura HMAC válida | 100% | Teste automatizado (vitest) com assinatura certa e errada |
| Vínculos já gravados (`@s.whatsapp.net`) continuam funcionando | 100% | Teste automatizado do lookup por número |
| Número novo permanece ativo (sem banimento) | 14 dias | Acompanhamento manual |

## Scope
**MVP (milestone 1 — adaptador WAHA, paridade)**
1. `lib/whatsapp.js`: mesmas funções exportadas (`sendWhatsAppText`, `sendWhatsAppOptionsList`, `fetchWhatsAppMediaAsDataUrl`, `fetchWhatsAppAudioAsBuffer`) passam a falar com o WAHA (`/api/sendText`, `X-Api-Key`, `chatId` no formato `@c.us`, mídia baixada pela URL do payload).
2. `api/whatsapp-webhook.js`: lê `payload.from/body/fromMe/hasMedia/media`, ignora `fromMe`, grupos (`@g.us`) e `status@broadcast`, e valida HMAC-SHA512 sobre o **corpo bruto** (`server/index.js` passa a guardar `req.rawBody` via `verify` do `express.json`).
3. Vínculo e lookup tolerantes a formato: `whatsapp_chat_id` gravado como `@s.whatsapp.net` (Evolution) ou `@c.us` (WAHA) é encontrado pelos dígitos, sem migração em massa.
4. Variáveis novas: `WAHA_URL`, `WAHA_API_KEY`, `WAHA_SESSION`, `WAHA_WEBHOOK_HMAC_KEY` (substituem as `EVOLUTION_*`).
5. WAHA local para teste (Docker) apontando o webhook para o servidor Node; número novo conectado por QR.

**Milestone 2 — ritmo humano** (ver backlog "Agente WhatsApp: paridade com o Telegram + melhorias do curso"): buffer de mensagens picadas, visto + "digitando" + espera proporcional, mensagens curtas, PDF.

**Out of scope**
- Reescrever o motor ou as tools em Python.
- Deploy do WAHA na VPS compartilhada (Traefik/Locaweb): fica para depois da validação local.
- Cloud API oficial da Meta; envio proativo/em massa.
- Migração em massa dos `whatsapp_chat_id` antigos.

## Delivery Milestones
<!-- Status: pending | in-progress | complete -->

| # | Milestone | Outcome | Status | Plan |
|---|---|---|---|---|
| 1 | Adaptador WAHA com paridade | Paciente e nutri usam o WhatsApp no número novo com o mesmo motor do Telegram; webhook assinado | in-progress (código pronto e testado em 21/11/2026; falta validar com WAHA real) | `.claude/plans/waha-whatsapp.plan.md` |
| 2 | Ritmo humano | Respostas com buffer, visto, "digitando" e mensagens curtas; PDF tratado | pending | a criar depois do milestone 1 |

## Open Questions
- [ ] Padrão de formatação: o prompt do Node manda `*negrito*` nativo do WhatsApp; o curso manda tirar asterisco ao dividir em mensagens curtas. Decidir no milestone 2.
- [ ] `@lid`: o WAHA pode entregar `from` como `...@lid` em alguns engines. Se aparecer no teste, mapear para o telefone (`GET /api/{session}/lids/{lid}`) antes de buscar o paciente.
- [ ] Engine do WAHA (WEBJS, NOWEB ou GOWS): WEBJS usa Chromium e pesa na VPS compartilhada. Escolher depois do teste local.
- [ ] O número novo substitui o anterior para todos os pacientes já vinculados? (Os vínculos guardam só o JID do **paciente**, então não dependem do número do bot.)

## Risks
| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| WAHA também é canal não oficial e o número pode ser banido de novo | Média | Alto | Número novo, só responder (sem proativo), ritmo humano no milestone 2, e Cloud API da Meta como plano B |
| Vínculos antigos (`@s.whatsapp.net`) deixam de casar | Média | Alto | Lookup por dígitos nas duas formas + teste automatizado |
| HMAC falha por o `express.json` já ter consumido o corpo | Alta | Médio | `verify` guarda o corpo bruto; teste de assinatura válida e inválida |
| Mídia do WAHA vem sem `media.url` (download desligado) | Média | Médio | Ligar download de mídia no WAHA e tratar `media.url` vazio com mensagem clara |

---
*Status: DRAFT — requirements only. Implementation planning in `.claude/plans/waha-whatsapp.plan.md`.*
