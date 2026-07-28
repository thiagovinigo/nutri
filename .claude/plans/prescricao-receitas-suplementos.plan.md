# Plan: Catálogo de Suplementos + Sugestão por IA + Check-in do Paciente

**Source PRD**: `.claude/prds/prescricao-receitas-suplementos.prd.md`
**Selected Milestone**: #2 e #3 combinados — catálogo/IA de suplementos + check-in do paciente + síntese clínica
**Complexity**: Large

## Summary
A aba "Vitaminas e Suplementos" da consulta ganha uma lista estruturada de suplementos prescritos (`dietSupplementsList`, cada item com `{id, name, dosage}`), preenchida por um seletor de catálogo (`src/data/supplements.json`, mesmo padrão do `taco.json`) e/ou por um botão "Sugerir com IA" (mesmo padrão de `generateDietFromAI` — lê o texto livre já escrito e, se vazio, sugere do zero). O campo de texto livre atual (`dietSupplements`) é mantido como "Observações" — não é substituído. O paciente passa a ver essa lista no `QuestBoard.jsx` e confirma (check-in) cada suplemento tomado no dia, no mesmo padrão de `markMealDone`. Os check-ins entram como novo dado na Síntese Clínica por IA (`generatePatientSynthesis`), que hoje não considera suplementos.

## Patterns to Mirror
| Category | Source | Pattern |
|---|---|---|
| Catálogo estático | `src/data/taco.json` | Array de objetos `{id, name, category, ...}` importado direto como JSON |
| Seletor de catálogo → item estruturado | `MealBuilder.jsx` (`handleAttachRecipe`, Milestone 1 desta sessão) | `<select>` com reset automático (`value=""`, `e.target.value=''` após aplicar) |
| Geração por IA lendo contexto existente | `DashboardNutri.jsx` (`generateDietFromAI`) | Monta `promptContext` com anamnese/exames, chama `callOpenAIBridge` com `format_json: true`, aplica resultado no estado |
| Registro de check-in do paciente | `AppContext.jsx` (`markMealDone`) | Recebe `patientId` + identificador do item, monta um log `{id, date, time, ...}`, chama `updatePatient(patientId, { xLogs: [...] })` |
| UI de check-in diário | `QuestBoard.jsx` (checklist de refeições, `getMealLog`) | Lista os itens prescritos, mostra check se já existe log pra data selecionada, XP via `completeQuest` |
| Dado agregado na Síntese Clínica | `DashboardNutri.jsx` (`generatePatientSynthesis`, `recentFoodLogs`) | `(patient.xLogs || []).slice(-N).map(...).join(' \| ')` concatenado no `patientDataString` |

## Files to Change
| File | Action | Why |
|---|---|---|
| `src/data/supplements.json` | CREATE | Catálogo fixo curado: nome, categoria, dosagem padrão |
| `src/features/nutricionista/pages/DashboardNutri.jsx` | UPDATE | Novo estado `dietSupplementsList`; nova função `generateSupplementsFromAI` (mirror de `generateDietFromAI`); `finishConsultation` salva a lista estruturada; `generatePatientSynthesis` passa a incluir `recentSupplementLogs` |
| `src/features/nutricionista/components/ConsultationFlow.jsx` | UPDATE | Aba "Vitaminas e Suplementos": textarea atual vira "Observações"; novo seletor de catálogo + botão "Sugerir com IA"; lista dos itens já anexados com opção de remover |
| `src/context/AppContext.jsx` | UPDATE | Nova função `markSupplementDone(patientId, supplementId, name, date)`, mirror de `markMealDone`, gravando em `supplementLogs` |
| `src/features/paciente/components/QuestBoard.jsx` | UPDATE | Nova seção de checklist diário de suplementos prescritos (lidos do plano ativo do paciente), com check individual e XP |

## Tasks

### Task 1: Catálogo de suplementos
- **Action**: Criar `src/data/supplements.json` com ~20-25 itens comuns em consultório de nutrição clínica/esportiva no Brasil (Ômega 3, Vitamina D, Vitamina C, Whey Protein, Creatina, Multivitamínico, Magnésio, Zinco, Cálcio, Ferro, Colágeno, Probióticos, Complexo B, Ácido Fólico, Glutamina, BCAA, Melatonina, Vitamina B12, Coenzima Q10, Ashwagandha), cada um com `{id, name, category, defaultDosage}`.
- **Mirror**: Estrutura de `taco.json`, trocando os campos nutricionais por `defaultDosage`.
- **Validate**: `import` do JSON funciona sem erro de parse; `npm run build` passa.

### Task 2: Seletor de catálogo + lista estruturada na consulta
- **Action**: Em `DashboardNutri.jsx`, novo `const [dietSupplementsList, setDietSupplementsList] = useState([])`. Em `ConsultationFlow.jsx`, na aba "suplementos": renomear label do textarea existente pra "Observações Adicionais"; adicionar um `<select>` (mesmo padrão do Task 1 do Milestone 1) que, ao escolher um item do catálogo, adiciona `{ id: Date.now().toString(), name: item.name, dosage: item.defaultDosage }` em `dietSupplementsList`; listar os itens já adicionados (nome + dosagem editável + botão remover).
- **Mirror**: `MealBuilder.jsx` (`handleAttachRecipe`) e a lista de alimentos do próprio `MealBuilder` (`meal.foods.map(...)` com botão de remover).
- **Validate**: Anexar 2-3 suplementos do catálogo numa consulta de teste, editar a dosagem de um deles, remover outro, confirmar que a lista reflete corretamente.

### Task 3: "Sugerir com IA" pra suplementos
- **Action**: Nova função `generateSupplementsFromAI` em `DashboardNutri.jsx`, mesmo padrão de `generateDietFromAI`: monta prompt com anamnese estruturada (`anamnesisText`) + resultado de exames (`examResult`) + o que já está em `dietSupplements`/`dietSupplementsList`. Se `dietSupplementsList` estiver vazia e `dietSupplements` vazio, instrui a IA a sugerir uma lista completa (100%) do catálogo disponível; se já houver conteúdo, instrui a complementar sem duplicar. Resposta em JSON (`format_json: true`) mapeada de volta pra `{name, dosage}` e adicionada em `dietSupplementsList`.
- **Mirror**: `generateDietFromAI` (estrutura de prompt, `callOpenAIBridge`, tratamento de erro com `dietError`).
- **Validate**: Numa consulta com anamnese preenchida e sem nada em suplementos, clicar "Sugerir com IA" e confirmar que a lista vem preenchida; repetir com algo já preenchido e confirmar que complementa em vez de duplicar tudo.

### Task 4: Salvar lista estruturada e persistir pro paciente
- **Action**: Em `finishConsultation`, incluir `dietSupplementsList` no `newConsultation` e no objeto salvo em `updatePayload.recipes[0]` (ao lado do `supplements` string já existente), como `supplementsList`. Isso é o que o `QuestBoard.jsx`/`DietPlan.jsx` vão ler como "suplementos prescritos ativos".
- **Mirror**: Mesmo padrão de `dietMeals`/`workoutPlan` já salvos em `updatePayload` hoje.
- **Validate**: Finalizar uma consulta com suplementos anexados, conferir no Firestore (ou via `viewedPatient.recipes[0].supplementsList` no prontuário) que a lista estruturada foi salva.

### Task 5: Check-in do paciente (`markSupplementDone`)
- **Action**: Em `AppContext.jsx`, nova função `markSupplementDone(patientId, supplementId, name, date)`, mirror de `markMealDone` — monta `{ id, date, name, time }` e grava em `patient.supplementLogs` via `updatePatient`. Exportar no valor do contexto.
- **Mirror**: `markMealDone` (linhas 280-289) e `markWorkoutDone`.
- **Validate**: Chamar a função manualmente (via QuestBoard, Task 6) e confirmar no Firestore que `supplementLogs` recebe o novo item.

### Task 6: Checklist diário de suplementos no `QuestBoard.jsx`
- **Action**: Nova seção (mesmo estilo visual dos cards de missão diária existentes) listando `activePatient.recipes[último].supplementsList`, cada item com nome+dosagem e um botão de check. Ao marcar, chama `markSupplementDone` e `completeQuest(activePatient.id, 5)` (XP menor que refeição, ajustável). Usa a mesma lógica de "já feito hoje" que `getMealLog` usa pra refeições, adaptada pra `supplementLogs`.
- **Mirror**: Checklist de refeições existente em `QuestBoard.jsx` (linhas ~113-119, 186-196).
- **Validate**: Como paciente de teste, ver a lista de suplementos do dia, marcar um como tomado, confirmar que o check persiste ao recarregar a página (mesma data) e que XP é creditado.

### Task 7: Suplementos na Síntese Clínica por IA
- **Action**: Em `generatePatientSynthesis` (`DashboardNutri.jsx`), adicionar `recentSupplementLogs` (mesmo formato de `recentFoodLogs`: `(patient.supplementLogs || []).slice(-15).map(s => \`[${s.date} ${s.time}] ${s.name}\`).join(' | ')`) e incluir no `patientDataString` enviado à IA.
- **Mirror**: `recentFoodLogs`/`recentWaterLogs`/`recentSleepLogs` já existentes na mesma função.
- **Validate**: Gerar uma Síntese Clínica de um paciente com check-ins de suplemento registrados e confirmar que a IA menciona adesão a suplementos no resultado.

### Task 8: Mover "modo de preparo" pro verso do flip-card (app do paciente)
- **Action**: Em `DietPlan.jsx`, remover o parágrafo `💬 {m.desc}` da frente do card (linhas ~364-368) e adicionar uma seção "Modo de Preparo" no verso do flip-card já existente (linhas ~385+, hoje usado só pra "Receita da IA"). O botão de flip (hoje só habilitado quando `savedRecipe` existe: `savedRecipe ? toggleFlip(mIdx) : handleGenerateRecipe(...)`) passa a também virar o card quando `m.desc` existir, mesmo sem receita de IA gerada — ou seja, dois motivos pra ter verso: `m.desc` (modo de preparo prescrito) e/ou `savedRecipe` (receita gerada por IA), exibidos como duas seções no mesmo verso quando ambos existirem.
- **Mirror**: Estrutura de `flip-card`/`flip-card-front`/`flip-card-back` já existente no mesmo componente (linhas 325-393).
- **Validate**: Abrir o app do paciente com uma refeição que tem `desc` preenchido (via anexo de receita, Milestone 1) — a frente do card mostra só nome, macros e status; virar o card mostra o modo de preparo. Testar também com uma refeição que tem receita de IA gerada, confirmando que as duas informações convivem no verso sem conflito.

## Validation
```bash
npm run dev      # smoke test manual — sem suite de testes automatizados no projeto
npm run lint
npm run build
```
Fluxo ponta-a-ponta pra validar manualmente: nutricionista anexa suplementos do catálogo numa consulta → finaliza → paciente vê a lista no QuestBoard → marca um como tomado → nutricionista gera Síntese Clínica e confirma que o dado aparece.

## Risks
| Risk | Likelihood | Mitigation |
|---|---|---|
| IA sugerir suplemento fora do catálogo (nome que não bate com nenhum item de `supplements.json`) | Média | Aceitar como item avulso mesmo assim (`name` livre, sem `supplementId` obrigatório) — não travar a sugestão por não achar match exato |
| `supplementsList`/`supplementLogs` não existirem em pacientes/consultas antigas (dado novo) | Alta (é esperado) | Sempre tratar com fallback `|| []`, igual já é feito com `foodLogs`/`weights`/etc. em todo o código existente |
| Custo de mais uma chamada de IA por consulta (Vision já é o mais caro; esta usa texto só) | Baixa | Reusar `gpt-4o-mini` (mesmo modelo já usado em `generateDietFromAI`), sem parâmetro de imagem — custo desprezível |

## Acceptance
- [ ] Catálogo de suplementos existe e é selecionável na aba "Vitaminas e Suplementos"
- [ ] Botão "Sugerir com IA" preenche a lista quando vazia e complementa quando já há conteúdo
- [ ] Lista estruturada é salva na consulta e no plano ativo do paciente
- [ ] Paciente vê e confirma (check-in) cada suplemento no `QuestBoard.jsx`
- [ ] Síntese Clínica por IA passa a considerar adesão a suplementos
- [ ] `npm run build` e `npm run lint` sem erros/warnings novos
