# Plano — Bom dia do Telegram (milestone 1)

PRD: `.claude/prds/bom-dia-telegram.prd.md` · Status: em implementação (TDD)

## Padrões do código a espelhar (lidos em 21/11/2026)
- `lib/water.js` (feito hoje): lógica pura em `lib/`, funções `shouldSend...`, `build...Text`, `build...Context`, e `normalize...` para argumentos da IA; trava `last...Key` por data+hora.
- `api/cron-reminders.js`: hora BR (`nowBR`), `dateKey = brDateKey()`, bloco do lembrete de água ANTES do `continue` de "sem dieta", envio via `sendTelegramText` (retorna boolean) e `escapeTelegramHtml`.
- `lib/secretariaVirtual.js`: tools por canal (`if (channel === 'telegram') tools.push(...)`), ramo `else if (toolCall.function.name === ...)`, contexto efêmero `dailyContext`.
- `log_sleep` já existe (horas + qualidade Ruim/Razoável/Bom/Excelente).

## Arquivos
| Arquivo | Mudança |
|---|---|
| `lib/morning.js` (novo) | `shouldSendMorningGreeting`, `buildMorningMessage`, `parseMorningOptIn`, `buildMorningContext` |
| `lib/morning.test.js` (novo) | Testes da lógica |
| `lib/secretariaVirtual.js` | Tool `definir_bom_dia` só no Telegram + contexto do bom dia |
| `lib/secretariaVirtualWater.test.js` | Testes: tool só no Telegram, grava `morningGreeting`, não grava no WhatsApp |
| `api/cron-reminders.js` | Envia o bom dia às 8h e pula o lembrete de água dessa hora |
| `backlog.md` | Registrar o feito e o que sobrou |

## Tarefas (TDD)
1. **`lib/morning.js` + testes (RED→GREEN):** envio só às 8h, 1x/dia, com Telegram, `morningGreeting !== false`, paciente não `inativo`; texto com nome escapado, saudação que varia por dia de forma determinística, pergunta do sono, meta em ml e copos, ofensiva só se > 0, aviso de como parar; `parseMorningOptIn` ("false" em texto desliga); contexto da IA.
2. **Motor:** tool e contexto só no Telegram; grava `morningGreeting`.
3. **Cron:** bom dia antes do lembrete de água; `greeted` pula o lembrete da mesma hora; grava `lastMorningGreetingKey` só após envio ok.
4. **Validação:** `npm test`; `code-reviewer` e `security-reviewer`; QA manual no Telegram (simular o cron às 8h).

## Riscos específicos
- O cron depende de rodar na hora cheia das 8h; se pular, o paciente não recebe aquele dia (sem reenvio) — mesma limitação já aceita do lembrete de água.
- A resposta do paciente ao bom dia chega sem o contexto da pergunta no histórico; a instrução no contexto do dia diz à IA para registrar o sono com `log_sleep`.
