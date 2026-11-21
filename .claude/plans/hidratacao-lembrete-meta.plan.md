# Plano — Hidratação: meta personalizada (2 canais) + lembrete (Telegram)

PRD: `.claude/prds/hidratacao-lembrete-meta.prd.md` · Status: em implementação (TDD)

## Padrões do código a espelhar (lidos em 21/11/2026)
- `lib/meals.js` / `lib/riskScore.js`: lógica **pura** em `lib/`, testável sem Firebase; o motor (`lib/secretariaVirtual.js`) e os crons só orquestram.
- Contexto do dia: `buildTodayContext/buildExamContext/buildProgressContext` retornam texto, juntados em `dailyContext` (`secretariaVirtual.js:306`) e injetados como mensagem `system` **efêmera**, recalculada a cada mensagem. É o lugar certo para regras novas: o system prompt só é gravado na 1ª mensagem do paciente.
- Tools: array `tools` (`secretariaVirtual.js:350`) e `else if (toolCall.function.name === ...)` (`:623` `log_water`). Água grava `waterLogs.{DD/MM/YYYY}` com `FieldPath` (a chave tem `/`).
- Cron: `api/cron-reminders.js` (hora BR via `toLocaleString`, `sendTelegramText`, `escapeTelegramHtml`), chamado de hora em hora pelo GitHub Actions. O `continue` do topo do loop pula quem não tem dieta; o lembrete de água precisa vir **antes**.
- Limite de 12 Serverless Functions (`api/` está em 8): nenhum arquivo novo em `api/`.
- Testes: `lib/*.test.js` com vitest.

## Arquivos
| Arquivo | Mudança |
|---|---|
| `lib/water.js` (novo) | `brDateKey`, `latestWeightKg`, `computeWaterGoal`, `todayWaterMl`, `buildWaterContext(patient, channel)`, `normalizeWaterReminder`, `shouldSendWaterReminder`, `buildWaterReminderText` |
| `lib/water.test.js` (novo) | Testes de toda a lógica acima |
| `lib/secretariaVirtual.js` | Água no `dailyContext`; `log_water` devolve total/faltam e usa `brDateKey()`; tool `definir_lembrete_agua` **só quando `channel === 'telegram'`** |
| `api/cron-reminders.js` | Bloco de lembrete de água antes do `continue` de "sem dieta" |
| `backlog.md` | Marcar itens feitos e o que sobrou |

## Tarefas (TDD)
1. **`lib/water.js` + testes (RED→GREEN):** meta por prioridade (nutri > peso × 35 arredondado a 50, clamp 1500–4500 > padrão 2000); total de hoje; texto do contexto por canal (Telegram cita a tool e o lembrete atual; WhatsApp explica que lembrete automático é pelo Telegram e como conectar, sem prometer); normalização dos argumentos da tool (intervalo 1–6, janela 0–23, início < fim); `shouldSendWaterReminder` (habilitado, hora na janela, `(hora − início) % intervalo === 0`, meta não batida, trava da hora); texto do lembrete com nome escapado.
2. **Motor:** água no `dailyContext`; `log_water` devolve "Total hoje X de Y ml, faltam Z"; tool de lembrete só no Telegram (grava `waterReminder` com `merge`).
3. **Cron:** lembrete de água independente de dieta; grava `lastWaterReminderKey` após enviar.
4. **Validação:** `npm test`; revisão `code-reviewer` + `security-reviewer`; QA manual: no WhatsApp perguntar a meta e pedir lembrete (deve explicar o Telegram); no Telegram pedir "me avisa a cada 2 horas" e simular o cron.

## Riscos específicos
- A chave `DD/MM/YYYY` do `log_water` usava o fuso do servidor; passa a usar São Paulo (`brDateKey`). Se a VPS estiver em UTC isso corrige registros noturnos, e não muda nada se já estiver em BRT.
- O contexto é texto para a IA: a regra "WhatsApp não cria lembrete" é reforçada pela **ausência da tool** nesse canal, não só pela instrução.
