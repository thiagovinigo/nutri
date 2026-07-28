# Plan: Anexar Receita à Refeição Específica (MealBuilder)

**Source PRD**: `.claude/prds/prescricao-receitas-suplementos.prd.md`
**Selected Milestone**: #1 — Anexar receita salva à refeição específica no MealBuilder
**Complexity**: Small

## Summary
Adiciona, dentro de cada card de refeição (`MealBuilder.jsx`), um seletor de receitas salvas (`recipeLibrary`). Ao escolher uma receita, ela substitui o campo "Sugestão de consumo ou modo de preparo" (`meal.desc`) daquela refeição específica, e preenche `meal.name` só se ainda estiver vazio. Resolve o problema de "refeição solta sem padrão" criado pelo botão "Adicionar ao Cardápio" da aba Ferramentas — que continua existindo, mas passa a ser um atalho a menos necessário já que agora dá pra anexar direto de dentro da refeição.

## Patterns to Mirror
| Category | Source | Pattern |
|---|---|---|
| Conteúdo de receita → texto de refeição | `ConsultationFlow.jsx` (`handleDropToMeal`) | `` `${draggedRecipe.title}\nIngredientes: ${draggedRecipe.ingredients}\nPreparo: ${draggedRecipe.instructions}` `` — mesmo formato já usado no drag-and-drop e no botão "Adicionar ao Cardápio" |
| Busca com dropdown de resultados | `MealBuilder.jsx` (busca de alimento TACO, linhas 111-137) | `<input>` + lista de resultados posicionada `absolute` abaixo, clique preenche seleção |
| Atualização imutável do meal | `MealBuilder.jsx` (`onChange({ ...meal, foods: [...] })`) | Sempre spread do objeto `meal` existente, nunca mutação direta |

## Files to Change
| File | Action | Why |
|---|---|---|
| `src/features/nutricionista/components/MealBuilder.jsx` | UPDATE | Novo seletor de receita salva dentro do card da refeição, chamando `onChange` com `meal.desc` substituído e `meal.name` preenchido só se vazio |
| `src/features/nutricionista/components/ConsultationFlow.jsx` | UPDATE | Passar `recipeLibrary` como prop pra cada `<MealBuilder />` (hoje só recebe `meal`, `aversions`, `onChange`, `onDelete`, `onDrop` — `recipeLibrary` já existe no escopo do componente, só falta repassar) |

## Tasks

### Task 1: Adicionar seletor de receita no `MealBuilder.jsx`
- **Action**: Novo prop `recipeLibrary` (array). Abaixo do campo de busca TACO (ou como uma segunda linha), um `<select>` ou input+dropdown simples listando `recipeLibrary` por título. Ao selecionar uma receita:
  ```js
  onChange({
    ...meal,
    name: meal.name || recipe.title,
    desc: `${recipe.title}\nIngredientes: ${recipe.ingredients}\nPreparo: ${recipe.instructions}`
  });
  ```
  Reseta a seleção do `<select>` depois de aplicar (mesmo padrão do seletor "+ Adicionar Refeição Manualmente" em `ConsultationFlow.jsx`, que usa `value=""` fixo e reseta com `e.target.value = ''`).
- **Mirror**: `ConsultationFlow.jsx` linhas ~832-849 (seletor "+ Adicionar Refeição Manualmente" — mesmo padrão de `<select>` com reset automático).
- **Validate**: Criar/abrir uma refeição no cardápio, escolher uma receita salva no novo seletor, confirmar que o nome (se vazio) e a descrição são preenchidos com o conteúdo da receita, sem tocar na tabela de alimentos TACO já preenchida (se houver).

### Task 2: Repassar `recipeLibrary` pro `MealBuilder`
- **Action**: Em `ConsultationFlow.jsx`, no `.map()` que renderiza `<MealBuilder meal={meal} aversions={...} onChange={...} onDelete={...} onDrop={...} />`, adicionar `recipeLibrary={recipeLibrary}` (a prop já chega em `ConsultationFlow` via `DashboardNutri.jsx`, só não é repassada pro filho).
- **Mirror**: Mesmo padrão de prop-drilling já usado pras outras props do `MealBuilder`.
- **Validate**: Confirmar no React DevTools (ou só pelo funcionamento do Task 1) que `recipeLibrary` chega não-vazio no `MealBuilder` quando existem receitas salvas.

## Validation
```bash
npm run dev      # smoke test manual — sem suite de testes automatizados no projeto
npm run lint
npm run build
```
Validação manual: criar uma refeição vazia no cardápio, anexar uma receita salva a ela pelo novo seletor, confirmar que nome e descrição são preenchidos corretamente e que o botão "Adicionar ao Cardápio" da aba Ferramentas continua funcionando em paralelo (não foi removido).

## Risks
| Risk | Likelihood | Mitigation |
|---|---|---|
| Confundir este seletor com a busca de alimentos TACO (dois selects parecidos no mesmo card) | Média | Rótulo claro ("Anexar receita salva") e posição visualmente separada da busca de alimentos |
| `recipeLibrary` vazio (nutricionista sem receitas salvas) deixando o seletor sem opções | Baixa | Mesmo tratamento já usado na aba Ferramentas: mensagem "Nenhuma receita salva" em vez de select vazio confuso |

## Acceptance
- [ ] Cada card de refeição no cardápio tem um seletor de receitas salvas
- [ ] Selecionar uma receita substitui `meal.desc` (não soma/anexa) e preenche `meal.name` só se vazio
- [ ] Botão "Adicionar ao Cardápio" da aba Ferramentas continua funcionando sem regressão
- [ ] `npm run build` e `npm run lint` sem erros/warnings novos
