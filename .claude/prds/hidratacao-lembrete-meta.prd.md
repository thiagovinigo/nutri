# Hidratação — meta diária personalizada (Telegram + WhatsApp) e lembrete (só Telegram)

## Problem
No primeiro teste real do WhatsApp (21/11/2026, `docs/feedback/2026-11-21-whatsapp-lembrete-agua.png`) o paciente perguntou "quantos ml tenho que tomar por dia?" e recebeu o genérico "2 a 3 litros", embora o sistema tenha o peso dele e o total do dia. Depois pediu "consegue me avisar a cada 2 horas?" e ouviu "infelizmente não consigo", com dicas soltas. Há demanda real por lembrete proativo, mas lembrete é mensagem proativa, e o canal WhatsApp não oficial evita isso de propósito (3 números queimados).

## Evidence
- Captura do feedback (acima) e pedido do dono do produto em 21/11/2026: "faça o que o usuário pediu e o que você sugeriu para o telegram [...] para o whats faça somente as suas sugestões".
- Código: `log_water` (`lib/secretariaVirtual.js:623`) só devolve "Água registrada com sucesso", então o bot não sabe quanto falta; o contexto do dia (`dailyContext`, linha ~306) não tem água nem meta; `api/cron-reminders.js` roda de hora em hora e só lembra de refeição.

## Users
- **Primary**: paciente que quer saber sua meta de água e ser lembrado de beber (lembrete só pelo Telegram).
- **Secondary**: nutricionista, que ganha adesão de hidratação sem trabalho manual.
- **Not for**: lembretes proativos no WhatsApp; WhatsApp Cloud API oficial (fica no backlog).

## Hypothesis
We believe **dar à Secretária a meta diária do paciente e o quanto falta (nos dois canais), e um lembrete de água por hora configurável pelo próprio paciente (só no Telegram)** will **aumentar o registro de água e a adesão, sem expor o número do WhatsApp a mensagens proativas** for **pacientes do Nutrivvo**.
We'll know we're right when **a Secretária responde a meta pelo peso do paciente ("faltam X ml"), e o paciente que pede "me avisa a cada 2 horas" no Telegram recebe lembretes dentro da janela combinada e para de recebê-los ao bater a meta**.

## Success Metrics
| Metric | Target | How measured |
|---|---|---|
| Meta respondida com base no paciente (peso × 35 ml, ou meta do nutri) e não genérica | 100% dos casos testados | Teste automatizado + QA manual |
| `log_water` informa total do dia e quanto falta | 100% | Teste automatizado |
| Lembrete de água dispara só na janela/intervalo escolhidos e só se a meta não foi batida | 100% | Teste automatizado da regra + cron real em QA |
| WhatsApp nunca cria nem envia lembrete | 100% | Teste automatizado (tool ausente no canal WhatsApp) |

## Scope
**MVP**
1. `lib/water.js` (lógica pura): meta (campo `waterGoalMl` do nutri → peso × 35 ml arredondado a 50 ml, limites 1500–4500 → padrão 2000), total de hoje (`waterLogs[DD/MM/YYYY]`), contexto para a IA, regra do lembrete e texto.
2. **Ambos os canais:** contexto do dia passa a incluir "ÁGUA DE HOJE: X de Y ml, faltam Z"; `log_water` devolve o total e o que falta; chave de data no fuso de São Paulo.
3. **Telegram:** tool `definir_lembrete_agua` (ativar/desativar, a cada 1–6 h, janela de horário padrão 8h–20h) grava `waterReminder` no doc do paciente; `api/cron-reminders.js` envia o lembrete (sem nova Serverless Function).
4. **WhatsApp:** a tool de lembrete **não existe** no canal; o contexto manda explicar que lembrete automático é pelo Telegram e como conectar, em vez de só dizer "não consigo".

**Out of scope**
- Lembrete proativo no WhatsApp (decisão do dono; Cloud API oficial no backlog).
- Tela no CRM para o nutri definir `waterGoalMl` (o campo é lido, mas a edição vem depois).
- Fuso por paciente (usa São Paulo).

## Delivery Milestones
<!-- Status: pending | in-progress | complete -->

| # | Milestone | Outcome | Status | Plan |
|---|---|---|---|---|
| 1 | Meta personalizada + lembrete (Telegram) | Paciente recebe meta e "faltam X ml" nos dois canais; pede lembrete no Telegram e passa a recebê-lo | in-progress | `.claude/plans/hidratacao-lembrete-meta.plan.md` |

## Open Questions
- [ ] Peso × 35 ml é um ponto de partida geral; o nutri pode querer outra regra (gestante, atleta, restrição renal). Por isso `waterGoalMl` tem prioridade e a IA não altera a meta.
- [ ] Servidor da VPS em UTC? A chave de data de `log_water` passa a usar São Paulo explicitamente para casar com o app.

## Risks
| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Lembrete vira spam | Média | Médio | Só por pedido explícito do paciente, janela 8h–20h, máx. 1 por hora, para ao bater a meta, e a IA pode desativar |
| Dois cron na mesma hora duplicam o lembrete | Baixa | Baixo | Trava `lastWaterReminderKey` (data + hora) |
| IA promete lembrete no WhatsApp | Média | Médio | Tool inexistente no canal + instrução explícita no contexto |
| Meta por peso inadequada a algum paciente | Média | Médio | Campo `waterGoalMl` do nutri vence; texto diz de onde veio a meta |

---
*Status: IN PROGRESS. Plano em `.claude/plans/hidratacao-lembrete-meta.plan.md`.*
