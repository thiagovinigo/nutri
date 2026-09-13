# Plan: Radar de Abandono Unificado + Varredura Diária → Nutricionista

**Source PRD**: `.claude/prds/radar-abandono-unificado.prd.md`
**Selected Milestone**: #1 (único milestone — score unificado + varredura + alerta + override)
**Complexity**: Large

## Summary
Os 3 sinais de risco concorrentes (`computedPatients` streak/xp, `alertar_nutricionista`
`status: 'Em Risco'`, ChatBot web `behavioral_risk`) viram inputs de um único
`computeRiskScore(patient, refDate)` puro (`lib/riskScore.js`), calculado 1x/dia por um novo cron
(`api/cron-risk-scan.js`) que grava `riskScore`/`riskLevel`/`riskFactors` em `patients/{id}` e
notifica o nutricionista (in-app + Telegram/WhatsApp) quando alguém entra em alto risco. O nutri
pode corrigir manualmente via `riskOverride`, que tem prioridade sobre o cálculo automático.

## Patterns to Mirror
| Category | Source | Pattern |
|---|---|---|
| Função pura reutilizável cron/chat | `lib/meals.js` (`resolveTodaysMeals`) | Sem I/O, sem `firebase-admin`, importável tanto de `api/` quanto de teste isolado |
| Teste puro sem framework | `test-cpf-guard.mjs` | `node:assert/strict` + função `test(name, fn)` local, `node arquivo.mjs` |
| Auth de cron (fail-closed) | `api/cron-reminders.js` | `CRON_SECRET` obrigatório, 401/500 sem hardcode |
| Anti-duplicidade de notificação recorrente | `api/cron-reminders.js` (`lastInactivityNudgeAt`) | Campo `lastXAt`/`lastXLevel` no doc, comparado a cada run |
| Notificação in-app | `AppContext.jsx` (`addNotification`/`markNotificationsRead`) + `TopBar.jsx` | Array `{id, message, date, read}` no doc do usuário, bell+dropdown, marca lido ao abrir |
| Vínculo de canal externo | `Profile.jsx` + `api/telegram-webhook.js`/`whatsapp-webhook.js` (`/start <id>`) | Deep-link grava `telegram_chat_id`/`whatsapp_chat_id` + `_linked_at` via Admin SDK |
| Envio de mensagem | `lib/telegram.js` (`sendTelegramText`), `lib/whatsapp.js` (`sendWhatsAppText`) | Únicos pontos de acesso às APIs externas, já prontos |

## Files to Change
| File | Action | Why |
|---|---|---|
| `lib/riskScore.js` | CREATE | Função pura do score unificado |
| `test-risk-score.mjs` | CREATE | Testes puros (18 asserts) |
| `api/cron-risk-scan.js` | CREATE | 8ª Serverless Function — varredura diária + notificação |
| `.github/workflows/cron-risk-scan.yml` | CREATE | Dispara o cron 1x/dia (08h BRT) |
| `lib/secretariaVirtual.js` | UPDATE | `alertar_nutricionista` grava `aiRiskSignal` em vez de `status`/`riskReason` |
| `src/features/paciente/pages/PatientApp.jsx` | UPDATE | ChatBot web grava `behavioralRiskSignal` em vez de `behavioral_risk` permanente |
| `src/context/AppContext.jsx` | UPDATE | `computedPatients` perde a branch `em_risco`; `markNotificationsRead` passa a persistir (bugfix); nova `markNutriNotificationsRead` |
| `api/telegram-webhook.js`, `api/whatsapp-webhook.js` | UPDATE | `/start nutri:<uid>` vincula canal do nutricionista |
| `src/features/nutricionista/components/PatientList.jsx` | UPDATE | Badge unificada, override manual, sino de notificações, seção de vínculo Telegram/WhatsApp do nutri |
| `src/features/nutricionista/pages/DashboardNutri.jsx` | UPDATE | `statusCohort` na síntese clínica passa a usar `riskLevel` |

## Tasks

### Task 1: Score unificado (`lib/riskScore.js`)
- **Action**: `computeRiskScore(patient, refDate)` combina adesão (`resolveTodaysMeals` + `foodLogs`,
  peso 35), recência (`streak`/`lastActivityDate`, peso 30), hidratação (`waterLogs`, peso 15), sono
  (`sleepLogs`, peso 10) e um boost de 30 se houver `aiRiskSignal`/`behavioralRiskSignal` nas
  últimas 48h. Cortes: `<40` baixo, `40-69` médio, `>=70` alto (sinal reativo nunca deixa cair pra baixo).
- **Mirror**: `lib/meals.js` (função pura, JSDoc, sem I/O).
- **Validate**: `node test-risk-score.mjs` — 18 asserts cobrindo cada peso e os cortes. ✅ passou.

### Task 2: Sinais reativos viram transientes
- **Action**: `secretariaVirtual.js` (`alertar_nutricionista`) grava `aiRiskSignal: {reason,
  detectedAt}`; `PatientApp.jsx` (ChatBot web) grava `behavioralRiskSignal: {detectedAt, keyword}`.
  Descrições da tool reescritas pra não falar mais em "marca como Em Risco no CRM".
- **Mirror**: Mesmo formato de campo `{...., detectedAt}` consumido por `scoreReactiveSignals` em `lib/riskScore.js`.
- **Validate**: `node --check` nos arquivos tocados; grep de `behavioral_risk`/`'Em Risco'`/`riskReason` confirma zero referência órfã em código vivo (só comentários históricos).

### Task 3: `computedPatients` vira ciclo de vida puro
- **Action**: Remove a branch `streak===0 && xp>50 -> 'em_risco'`; mantém só
  `ativo`/`engajado`/`inativo`.
- **Mirror**: N/A (simplificação de lógica existente).
- **Validate**: `npm run build` OK.

### Task 4: Cron de varredura + notificação (`api/cron-risk-scan.js`)
- **Action**: Mesmo esqueleto de auth de `cron-reminders.js`; por paciente ativo, chama
  `computeRiskScore`, grava `riskScore/riskLevel/riskFactors`; decide notificar via
  `effectiveLevel = riskOverride?.level || level` comparado a `lastRiskNotifiedLevel`/`At`
  (transição pra alto, ou renudge a cada 3 dias); grava notificação em
  `users/{nutriId}.notifications` e manda Telegram/WhatsApp se vinculado.
- **Mirror**: `cron-reminders.js` (auth, loop, `lastInactivityNudgeAt`).
- **Validate**: `node --check api/cron-risk-scan.js`; ponta-a-ponta real só pós-deploy
  (`workflow_dispatch` manual + paciente de teste com streak zerado/sono ruim).

### Task 5: Notificação e vínculo de canal do nutricionista
- **Action**: `AppContext.jsx` ganha `markNutriNotificationsRead` (lê/persiste
  `profile.notifications`); bugfix de `markNotificationsRead` (paciente) que nunca persistia.
  `telegram-webhook.js`/`whatsapp-webhook.js` ganham parsing de `/start nutri:<uid>` →
  `users/{uid}`, isolado do path de paciente existente.
- **Mirror**: `addNotification`/`TopBar.jsx` (notificação), `Profile.jsx` (vínculo de canal).
- **Validate**: `node --check` nos dois webhooks; `npm run build` OK.

### Task 6: UI no CRM (`PatientList.jsx`, `DashboardNutri.jsx`)
- **Action**: Badge única "🔺 Alto Risco" (substitui `behavioral_risk` e `status==='em_risco'`);
  seletor de override manual + "Voltar ao automático" no prontuário; sino de notificações na
  sidebar (dropdown sóbrio, sem o glassmorphism do paciente); seção "Alertas do Radar de Abandono"
  (Telegram/WhatsApp do nutri) na aba Perfil; `atRiskPatients`/filtro de status/`statusCohort`
  trocam `status === 'em_risco'` por `riskOverride?.level || riskLevel === 'alto'`.
- **Mirror**: `Profile.jsx` (accordion de conectar canal), `TopBar.jsx` (bell/badge/dropdown), campo
  `financialStatus` já editável (padrão de select + `updatePatient`).
- **Validate**: `npm run build` OK. Verificação visual manual pendente (sem Playwright configurado
  neste projeto — ver backlog.md "Zero testes automatizados").

## Verification (executada nesta sessão)
1. `node test-risk-score.mjs` → 18/18 OK.
2. `npm run build` → sucesso (avisos de chunk size pré-existentes, não relacionados).
3. `node --check` em todos os arquivos `api/*.js` tocados/criados → sem erro de sintaxe.
4. `find api -maxdepth 1 -name "*.js" | wc -l` → 8 (dentro do limite de 12 do Vercel Hobby).
5. Grep de `behavioral_risk`/`'Em Risco'`/`riskReason`/`status === 'em_risco'` → só comentários
   históricos, zero referência em código vivo.
6. Pendente pós-deploy: rodar `workflow_dispatch` do novo workflow contra produção, criar um
   paciente de teste com streak zerado + sono ruim, confirmar notificação no sino do CRM e mensagem
   no Telegram/WhatsApp do nutri de teste vinculado via `/start nutri:<uid>`.
