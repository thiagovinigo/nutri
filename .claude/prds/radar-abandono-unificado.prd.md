# Radar de Abandono Unificado + Varredura Diária → Nutricionista

## Problem
O CRM tinha 3 sinais de risco de abandono independentes e concorrentes, nenhum ciente do outro:
`computedPatients` (streak/xp, render-time, nunca persistido) sobrescrevia tudo exceto `'inativo'`;
`alertar_nutricionista` (chat da Secretária Virtual) gravava `status: 'Em Risco'` + `riskReason`,
descartado no próximo render e nunca exibido em lugar nenhum; e o ChatBot web gravava
`behavioral_risk: true` permanente, nunca resetado. Além disso, nenhum cron avisava o
nutricionista proativamente — o único cron diário (`cron-reminders.js`) só notifica o paciente.

## Evidence
- Backlog (`backlog.md`, seção "🐛 Bugs e inconsistências"): "3 sinais de risco concorrentes que
  não se falam... o `computedStatus` sobrescreve o `status: 'Em Risco'` no próximo render."
- `riskReason` (escrito por `secretariaVirtual.js:607-609`) tinha 0 ocorrências de leitura em
  `src/` — campo morto desde que foi introduzido.
- `behavioral_risk` (`PatientApp.jsx:128`) nunca era resetado a `false` em nenhum código path —
  uma vez acionado, o badge "Risco Comportamental" ficava permanente mesmo após o paciente melhorar.
- Backlog, item aberto "Varredura diária proativa → nutricionista": "a detecção diária das 9h em
  `cron-reminders.js`... só avisa o paciente."

## Users
- **Primary**: Nutricionista — recebe o alerta consolidado (in-app + Telegram/WhatsApp) e pode
  ajustar manualmente o nível de risco quando discordar da IA.
- **Secondary**: Paciente — nenhuma mudança de UI para ele; os sinais que ele já gerava (chat web,
  mensagens no bot) continuam alimentando o sistema, só que agora de forma unificada.

## Hypothesis
We believe **unificar os 3 sinais de risco num único score calculado diariamente, e notificar o
nutricionista proativamente (CRM + Telegram/WhatsApp) quando um paciente entra em alto risco** will
**reduzir o tempo entre um paciente começar a se afastar do tratamento e o nutricionista agir** for
**nutricionistas usando o Nutrivvo com a Secretária Virtual ativa**.
We'll know we're right when **o nutricionista recebe o alerta antes de o paciente cancelar/sumir,
em vez de descobrir só na próxima consulta agendada (ou nunca)**.

## Success Metrics
| Metric | Target | How measured |
|---|---|---|
| Pacientes com `riskLevel` calculado diariamente | 100% dos pacientes ativos | Campo `riskScore`/`riskLevel` presente após rodar `api/cron-risk-scan.js` |
| Alertas duplicados pro mesmo risco parado em "alto" | 0 em menos de 3 dias | `lastRiskNotifiedAt`/`lastRiskNotifiedLevel` no doc do paciente |
| Uso real do canal Telegram/WhatsApp do nutri | TBD — precisa de nutris vinculando de fato pós-deploy | Sem analytics hoje (débito já registrado no backlog) |

## Scope
**MVP (único milestone, entregue nesta sessão)**:
- `lib/riskScore.js`: função pura `computeRiskScore(patient, refDate)` — pesos de adesão (35),
  recência de atividade (30), hidratação (15), sono (10), boost de sinal reativo (IA do chat ou
  ChatBot web, 48h de janela). Cortes: `<40` baixo, `40-69` médio, `>=70` alto.
- `patients/{id}` ganha `riskScore`/`riskLevel`/`riskFactors` (calculados 1x/dia) e
  `riskOverride: {level, reason, setBy, setAt} | null` (ajuste manual do nutri, sempre prioritário
  na exibição).
- `alertar_nutricionista` (`secretariaVirtual.js`) e o ChatBot web (`PatientApp.jsx`) passam a
  gravar sinais transientes (`aiRiskSignal`/`behavioralRiskSignal`) em vez de campos paralelos
  descartados/permanentes.
- `computedPatients` (`AppContext.jsx`) perde a derivação de `'em_risco'` — vira ciclo de vida puro
  (`ativo`/`engajado`/`inativo`). Risco é agora ortogonal ao ciclo de vida.
- `api/cron-risk-scan.js` (novo, 8ª Serverless Function) + `.github/workflows/cron-risk-scan.yml`
  (diário, 08h BRT): varre todos os pacientes ativos, grava o score, e notifica o nutricionista
  (in-app `users/{nutriId}.notifications` + Telegram/WhatsApp se vinculado) na transição pra "alto"
  ou a cada 3 dias se continuar "alto". Respeita `riskOverride` pra não renotificar o que o nutri
  já revisou.
- Vínculo de Telegram/WhatsApp do nutricionista (novo — antes só o paciente tinha): deep-link
  `/start nutri:<uid>` nos dois webhooks, seção "Alertas do Radar de Abandono" na aba Perfil do CRM.
- Sino de notificações no CRM (sidebar, já que não há top bar), mesmo padrão do `TopBar.jsx` do
  paciente mas com estilo sóbrio. Corrigido de passagem: `markNotificationsRead` (paciente) nunca
  persistia no Firestore — bug pré-existente, uma linha.
- Badge única "🔺 Alto Risco" no CRM (substitui as duas badges antigas — "Perdendo Foco" e "Risco
  Comportamental") com tooltip listando `riskFactors`; seletor de override manual + botão "Voltar
  ao automático" no prontuário.

**Out of scope (v1, YAGNI)**
- Recalcular o score sob demanda ao abrir a ficha (só roda 1x/dia via cron).
- Migração de dados históricos dos campos antigos (`behavioral_risk`, `riskReason`) — ficam mortos
  no Firestore, mesmo tratamento que outros campos legados do projeto.
- Categorização do alerta por tipo (nutricional vs. psicológico) — item separado no backlog.

## Delivery Milestones
| # | Milestone | Outcome | Status | Plan |
|---|---|---|---|---|
| 1 | Score unificado + varredura diária + alerta ao nutri (CRM + Telegram/WhatsApp) + override manual | 3 sinais concorrentes viram 1 score; nutri é notificado proativamente em 2 canais e pode corrigir a IA | complete | `.claude/plans/radar-abandono-unificado.plan.md` |

## Open Questions
- [x] Score automático ou manual? → Automático com override manual (decisão do usuário via `AskUserQuestion`).
- [x] Canal de alerta? → In-app CRM **e** Telegram/WhatsApp (decisão do usuário).
- [ ] Pesos do score (35/30/15/10 + boost 30) são uma heurística v1 — calibrar com uso real
      (mesmo espírito de `householdMeasures.json`).
- [ ] `ADMIN_UID`/env vars à parte: nenhuma env var nova é necessária (reaproveita
      `TELEGRAM_BOT_TOKEN`/`EVOLUTION_API_*`/`CRON_SECRET` já existentes).

## Risks
| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Pesos do score gerarem falsos positivos/negativos em volume real | Média | Médio | `riskOverride` dá ao nutri controle manual imediato; fatores (`riskFactors`) ficam visíveis pra auditoria |
| Nutri não vincular Telegram/WhatsApp e perder o alerta proativo | Média | Baixo | Notificação in-app (sino no CRM) sempre funciona, independente de vínculo de canal externo |
| `nutri:` prefix colidir com um `patientId` real que comece com esse texto | Baixa | Baixo | `nutri:` como prefixo explícito no `/start` deep-link (não é um ID de paciente válido no formato usado hoje) |

---
*Status: COMPLETE — implementado e verificado (build + testes puros) em 12/09/2026. Verificação
ponta-a-ponta real (cron em produção → Telegram/WhatsApp do nutri) pendente de deploy, como todo
outro cron deste projeto.*
