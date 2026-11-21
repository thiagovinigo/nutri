# Bom dia do Telegram — mensagem motivadora, sono e meta de água

## Problem
A Secretária Virtual só fala quando o paciente escreve (e lembra de refeições). Falta um toque diário que puxe o paciente para o app de forma afetuosa e capte o dado que mais falta no acompanhamento: como foi o sono. O dono do produto pediu (21/11/2026): "[no Telegram] uma mensagem motivadora de bom dia e pergunta como foi o sono e incentivando a meta diária".

## Evidence
- Pedido direto do dono do produto (acima).
- Código: `api/cron-reminders.js` já roda de hora em hora e já manda mensagens proativas no Telegram; `log_sleep` já existe no motor (horas + qualidade); a meta diária de água já existe em `lib/water.js` (feita no mesmo dia).
- Feedback real do paciente no teste do WAHA mostrou apetite por lembretes proativos (ver `.claude/prds/hidratacao-lembrete-meta.prd.md`).

## Users
- **Primary**: paciente com Telegram conectado.
- **Secondary**: nutricionista, que ganha dado de sono e engajamento diário.
- **Not for**: WhatsApp (canal não oficial, sem mensagem proativa) e pacientes sem Telegram.

## Hypothesis
We believe **um bom dia diário às 8h no Telegram, com frase motivadora, pergunta sobre o sono e a meta de água do dia** will **aumentar o registro de sono e a abertura diária do bot** for **pacientes do Nutrivvo**.
We'll know we're right when **o paciente responde ao bom dia contando o sono e isso vira um `log_sleep`, e quem não quer a mensagem consegue desligá-la pelo próprio bot**.

## Success Metrics
| Metric | Target | How measured |
|---|---|---|
| Bom dia enviado no máximo 1 vez por dia por paciente | 100% | Teste automatizado da regra + trava `lastMorningGreetingKey` |
| Resposta com o sono vira `log_sleep` | ≥ 80% dos casos de QA | QA manual no Telegram |
| Paciente consegue desligar e religar pelo bot | 100% | Teste automatizado da ferramenta |
| WhatsApp nunca recebe o bom dia nem a ferramenta | 100% | Teste automatizado |

## Scope
**MVP**
1. `lib/morning.js` (lógica pura): quando enviar (às 8h de São Paulo, 1x/dia, Telegram conectado, não desligado, paciente não `inativo`), texto (saudação que varia por dia, pergunta do sono, meta de água em ml e copos, ofensiva quando houver), e contexto para a IA.
2. `api/cron-reminders.js`: envia o bom dia às 8h. Se o bom dia foi enviado nessa hora, **pula o lembrete de água da mesma hora** (o bom dia já cita a meta), para não mandar duas mensagens seguidas.
3. Ferramenta `definir_bom_dia` (só Telegram) para desligar/religar; grava `morningGreeting` (boolean). Padrão: ligado para quem tem Telegram conectado, com aviso de como parar no próprio texto.
4. A resposta do paciente sobre o sono usa o `log_sleep` que já existe (o contexto instrui a IA).

**Out of scope**
- WhatsApp (decisão do dono: canal não oficial evita mensagem proativa).
- Horário personalizado por paciente (fixo em 8h).
- Mensagens geradas por IA (o texto é de modelos fixos revisáveis, sem custo e sem risco de alucinação em mensagem proativa).

## Delivery Milestones
<!-- Status: pending | in-progress | complete -->

| # | Milestone | Outcome | Status | Plan |
|---|---|---|---|---|
| 1 | Bom dia diário no Telegram | Paciente com Telegram recebe o bom dia às 8h, responde o sono e pode desligar | in-progress | `.claude/plans/bom-dia-telegram.plan.md` |

## Open Questions
- [ ] Padrão ligado para todos (com opção de parar) ou só para quem pedir? Decidido por mim em ligado-com-opt-out, para o bot ter efeito desde o começo; revisar se algum paciente reclamar.
- [ ] Texto das saudações: revisar o tom com o nutricionista.
- [ ] 8h pode ser cedo para turnos noturnos: horário por paciente fica no backlog.

## Risks
| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Mensagem proativa vira incômodo | Média | Médio | 1x/dia, texto curto, opt-out explícito na própria mensagem e pela ferramenta |
| Bom dia + lembrete de água na mesma hora | Alta | Baixo | Cron pula o lembrete de água na hora do bom dia |
| Resposta sobre sono não é registrada | Média | Médio | Instrução no contexto do dia; `log_sleep` já pede horas e qualidade |

---
*Status: IN PROGRESS. Plano em `.claude/plans/bom-dia-telegram.plan.md`.*
