# Clínico — Anexar Receita à Refeição + Catálogo de Suplementos com Sugestão por IA

## Problem
Na etapa final da consulta ("4. Prescrição Estruturada"), duas coisas incomodam o nutricionista no dia a dia: (1) anexar uma receita salva cria uma refeição nova solta, sem os dados nutricionais estruturados (kcal/carb/proteína/gordura) que toda outra refeição tem — parece "fora do padrão"; e (2) suplementos/vitaminas são só um campo de texto livre, sem nenhum apoio estruturado ou de IA, diferente do resto da prescrição que já tem base de alimentos (TACO) e sugestão por IA.

## Evidence
- Reportado pelo usuário nesta sessão, com screenshot: o card de receita salva ficava ilegível (bug de dark mode, já corrigido) e a refeição criada a partir dele fica "sem padrão" — confirmado em código: `ConsultationFlow.jsx` cria `{ name, desc, foods: [] }` com `foods` sempre vazio, então a tabela de nutrientes do `MealBuilder.jsx` (que toda outra refeição tem, seja via busca TACO ou geração por IA) aparece vazia para receitas anexadas.
- `MealBuilder.jsx` já tem busca estruturada de alimentos (`tacoData`) por refeição, mas nenhuma forma de puxar uma receita salva pra dentro da refeição sendo editada — só existe drag-and-drop (`handleDropToMeal`) ou o botão desconectado da aba Ferramentas.
- Suplementos (`dietSupplements`) é hoje só uma `<textarea>` (`ConsultationFlow.jsx`, aba "Vitaminas e Suplementos"), sem nenhuma lista/catálogo, ao contrário do cardápio que tem base TACO e da dieta/treino que já têm sugestão por IA (`generateDietFromAI`, `generateWorkoutFromAI`).

## Users
- **Primary**: Nutricionista, durante a montagem da prescrição (etapa 4 da consulta).
- **Not for**: Paciente (só recebe o resultado já prescrito, sem interação nesta feature).

## Hypothesis
We believe **permitir anexar uma receita salva diretamente dentro da refeição sendo editada (em vez de criar uma refeição solta e vazia), e adicionar um catálogo estruturado de suplementos/vitaminas com sugestão por IA baseada em anamnese e exames** will **tornar a prescrição mais rápida e mais consistente clinicamente** for **nutricionistas usando o Nutrivvo**.
We'll know we're right when **o nutricionista consegue anexar uma receita a uma refeição específica sem sair do fluxo de edição, e consegue montar a lista de suplementos a partir de um catálogo (com ou sem ajuda da IA) em vez de digitar tudo livre**.

## Success Metrics
| Metric | Target | How measured |
|---|---|---|
| Refeições criadas a partir de receita anexada com nutrientes estruturados | 100% (`foods` preenchido quando a receita tem match na base) | Revisão de código / QA manual |
| Uso do catálogo de suplementos vs. texto livre | TBD — needs validation via uso real pós-lançamento | Sem analytics hoje (débito já registrado no backlog) |

## Scope
**MVP (Milestone 1)** — Dentro do `MealBuilder.jsx` (cada card de refeição), adicionar uma forma de escolher uma receita salva (`recipeLibrary`) e anexá-la àquela refeição específica: preenche `meal.name` (se vazio) e `meal.desc` com o conteúdo da receita, igual ao que já acontece no drag-and-drop, mas via um seletor explícito (não exige arrastar).

**Milestone 2** — A aba "Vitaminas e Suplementos" continua existindo como está (textarea livre onde o nutricionista escreve o que quiser), **complementada** por duas novas formas de preencher, sem substituir a atual:
  - **Anexar da lista nova**: catálogo fixo (`src/data/supplements.json`, mesmo padrão do `taco.json`) com nome, categoria e **quantidade estruturada** (ex: "1000mg", "2 cápsulas" — mesmo papel que a gramatura tem pra alimentos do TACO). Um seletor permite escolher um item do catálogo e "anexar" (dar um add), no mesmo padrão do seletor de receitas do Milestone 1.
  - **Sugerir com IA**: botão que funciona como um agente, no mesmo padrão de `generateDietFromAI` — lê o que o nutricionista já escreveu no campo; se estiver vazio, sugere a lista completa (100%) com base em anamnese estruturada + resultado de exames; se já tiver conteúdo, complementa em vez de substituir.

**Milestone 3** — Cada suplemento prescrito (com sua quantidade) vira algo que o **paciente confirma no app** que tomou — check-in, no mesmo padrão já usado pra refeições (`markMealDone`, que registra em `foodLogs` com `mealIdx`/`log`/`date`/`time`) e treino (`markWorkoutDone`). Esses check-ins de suplemento **entram como dado na Síntese Clínica por IA** (`generatePatientSynthesis`) e na avaliação da consulta, junto com adesão à dieta e ao treino — hoje a síntese não considera suplementos porque eles nunca foram um dado estruturado, só texto solto.

**Out of scope**
- Envio/notificação do paciente sobre suplementos — já coberto por feature separada (notificação de dieta prescrita, backlog).
- Interação/compra de suplementos pelo paciente dentro do app.
- Nova UI pro drag-and-drop de receitas existente (`handleDropToMeal`) — continua existindo em paralelo ao novo seletor, não será removido.

## Delivery Milestones
<!-- Business outcomes, not engineering tasks. /plan turns each into a plan. -->
<!-- Status: pending | in-progress | complete -->

| # | Milestone | Outcome | Status | Plan |
|---|---|---|---|---|
| 1 | Anexar receita salva à refeição específica no MealBuilder | Nutricionista escolhe uma receita salva dentro do card de uma refeição e ela preenche nome/descrição daquela refeição, sem criar uma refeição solta vazia | reverted — ver backlog.md | `.claude/plans/prescricao-receitas-suplementos.plan.md` |
| 2 | Catálogo estruturado de suplementos/vitaminas + sugestão por IA | Seletor de catálogo e botão de IA complementam (não substituem) o texto livre atual | complete | `.claude/plans/prescricao-receitas-suplementos.plan.md` |
| 3 | Check-in do paciente + Síntese Clínica considera suplementos | Paciente confirma cada suplemento tomado; adesão entra na Síntese Clínica por IA | complete | `.claude/plans/prescricao-receitas-suplementos.plan.md` |

## Open Questions
- [x] Catálogo de suplementos: lista fixa curada agora (mesmo padrão do `taco.json`), sem base externa.
- [x] Anexar receita à refeição: substitui especificamente o campo "Sugestão de consumo ou modo de preparo" (`meal.desc`) — não é um merge/append, é substituição direta desse campo.
- [ ] Quando a IA sugerir suplementos (Milestone 3), o resultado vira texto livre complementando o catálogo, ou só pode sugerir itens que já existem no catálogo estruturado?

## Risks
| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Receita anexada não tem match de alimentos na base TACO (ingredientes em texto livre, não têm `foodId`) — `foods[]` continua vazio mesmo depois do fix | Alta | Médio | MVP resolve o problema de UX (refeição não fica mais solta/desconectada) mas não resolve 100% o "sem padrão" nutricional — registrar como limitação conhecida, não tentar parsing automático de ingredientes nesta rodada |
| Catálogo de suplementos desatualizado ou incompleto (lista fixa, curada manualmente) | Média | Baixo | Comparável ao TACO atual, que também é uma lista fixa — mesmo padrão já aceito no projeto |

---
*Status: DRAFT — requirements only. Implementation planning pending via /plan.*
