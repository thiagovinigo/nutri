# Plan: Clínico — Formulário de Anamnese Estruturado

**Source PRD**: `.claude/prds/anamnese-pre-consulta.prd.md`
**Selected Milestone**: #2 — Nutricionista preenche anamnese estruturada durante a consulta (substitui o textarea)
**Complexity**: Medium

## Summary
Substitui o `<textarea>` livre de "Anamnese e Queixas Principais" (`ConsultationFlow.jsx:249-250`) por um campo por item de `clinicConfig.anamnesisTemplate` (o mesmo template configurado no milestone 1, em `AnamnesisTemplateSettings.jsx`). O estado single-string `anamnesis` em `DashboardNutri.jsx` vira um objeto `anamnesisAnswers` (`{ [fieldId]: valor }`). Uma função pura formata esse objeto de volta para texto (`formatAnamnesisAnswers`), e essa string formatada substitui `anamnesis` nos 3 pontos onde ela hoje é interpolada em prompts de IA (`analyzeExamWithAI`, `generateDietFromAI`, `generateWorkoutFromAI`) e no salvamento do histórico de consulta (`finishConsultation`). Isso mantém `consultations[].anamnesis` como string — o mesmo formato já lido em `PatientList.jsx:1044,1317` — sem precisar migrar dados antigos.

**Decisão de escopo já confirmada com o usuário**: não há preenchimento pelo paciente (isso saiu do roadmap); o textarea é **substituído por completo**, sem campo de "observações livres" residual.

## Patterns to Mirror
| Category | Source | Pattern |
|---|---|---|
| Renderização dinâmica de campos por tipo | Não existe pattern local idêntico — mais próximo é `ConsultationFlow.jsx:352-386` (renderização condicional de inputs de plicometria conforme `protocoloDobras`) | Renderizar inputs diferentes com base num campo de tipo (`switch`/mapa por `field.type`), igual ao padrão condicional já usado ali |
| Fonte única do template padrão | `AnamnesisTemplateSettings.jsx:10-16` (`DEFAULT_TEMPLATE`) | Exportar a constante (`export const DEFAULT_TEMPLATE`) em vez de duplicá-la em `ConsultationFlow.jsx` — mesma fonte usada em Configurações e na consulta |
| Derivar valor formatado a partir de estado estruturado | Nenhum precedente direto — seguir a regra do projeto (`react/hooks.md`): "Derived state — compute it during render", não usar `useEffect` pra isso | `const anamnesisText = formatAnamnesisAnswers(anamnesisAnswers, template)` calculado no corpo do componente a cada render, sem `useState`/`useEffect` extra |
| Passagem de `clinicConfig` para componente filho | `DashboardNutri.jsx:12` (`clinicConfig` já vem de `useAppContext()`) | Só adicionar `clinicConfig={clinicConfig}` na chamada de `<ConsultationFlow />` (`DashboardNutri.jsx:578-604`) — já disponível, sem nova busca de dados |

## Files to Change
| File | Action | Why |
|---|---|---|
| `src/features/nutricionista/components/AnamnesisTemplateSettings.jsx` | UPDATE | Exportar `DEFAULT_TEMPLATE` (`export const`) para ser reaproveitado por `ConsultationFlow.jsx` |
| `src/utils/anamnesis.js` | CREATE | Função pura `formatAnamnesisAnswers(answers, template)` — para cada campo do template, se houver resposta, gera linha `"{label}: {valor}"`; junta com `\n`. Compartilhada entre `ConsultationFlow.jsx` (preview, se necessário) e `DashboardNutri.jsx` (prompts de IA) |
| `src/features/nutricionista/components/ConsultationFlow.jsx` | UPDATE | Trocar props `anamnesis, setAnamnesis` por `anamnesisAnswers, setAnamnesisAnswers` + novo prop `clinicConfig`; substituir o bloco do `<textarea>` (linhas 249-250) por um `.map()` sobre `clinicConfig?.anamnesisTemplate \|\| DEFAULT_TEMPLATE`, renderizando `<input>` (texto_curto), `<textarea>` (texto_longo) ou `<select>` (escolha_unica) por campo |
| `src/features/nutricionista/pages/DashboardNutri.jsx` | UPDATE | Renomear estado `anamnesis`/`setAnamnesis` (linha 51) para `anamnesisAnswers`/`setAnamnesisAnswers` (valor inicial `{}`); computar `const anamnesisText = formatAnamnesisAnswers(anamnesisAnswers, clinicConfig?.anamnesisTemplate)`; substituir as 3 ocorrências de `${anamnesis}` (linhas 240, 329, 415) por `${anamnesisText}`; em `finishConsultation` (linhas 529, 542), usar `anamnesisText` em vez de `anamnesis`; passar `anamnesisAnswers`, `setAnamnesisAnswers`, `clinicConfig` para `<ConsultationFlow />` (linhas 583, 604) |

## Tasks

### Task 1: Exportar `DEFAULT_TEMPLATE` e criar `formatAnamnesisAnswers`
- **Action**: Em `AnamnesisTemplateSettings.jsx`, mudar `const DEFAULT_TEMPLATE` para `export const DEFAULT_TEMPLATE`. Criar `src/utils/anamnesis.js` com `formatAnamnesisAnswers(answers = {}, template = [])`, retornando string com uma linha `"{label}: {valor}"` por campo respondido (pular campos vazios), na ordem do template.
- **Mirror**: Nenhuma função utilitária pura equivalente existe em `src/utils/` hoje (`src/utils/openaiBridge.js` é o único arquivo lá) — esta é a primeira, seguindo convenção de nome de arquivo em `camelCase`/`kebab-case` do diretório.
- **Validate**: Testar manualmente no console do navegador ou por uso direto: `formatAnamnesisAnswers({campo_objetivos: 'Emagrecer'}, DEFAULT_TEMPLATE)` retorna `"Objetivos: Emagrecer"`.

### Task 2: Renderizar campos estruturados em `ConsultationFlow.jsx`
- **Action**: Substituir `<textarea className="crm-input" ... value={anamnesis} onChange={...} />` (linhas 249-250) por um `.map()` sobre `(clinicConfig?.anamnesisTemplate?.length > 0 ? clinicConfig.anamnesisTemplate : DEFAULT_TEMPLATE)`, renderizando por `field.type`:
  - `texto_curto` → `<input type="text" className="crm-input" />`
  - `texto_longo` → `<textarea className="crm-input" style={{ minHeight: '120px' }} />`
  - `escolha_unica` → `<select className="crm-input">` com `field.options`
  Cada campo lê/escreve `anamnesisAnswers[field.id]` via `setAnamnesisAnswers({ ...anamnesisAnswers, [field.id]: valor })`. Usar `field.label` como `<label className="crm-label">`, e exibir indicador visual se `field.required` (mesmo badge já usado em `AnamnesisTemplateSettings.jsx`).
- **Mirror**: `ConsultationFlow.jsx:352-386` (renderização condicional por tipo de protocolo) para a estrutura de `.map()` + `switch`/condicional por `field.type`; `AnamnesisTemplateSettings.jsx` para o badge "Obrigatório".
- **Validate**: Abrir consulta de um paciente, ver os campos configurados em Configurações → Formulário de Anamnese aparecerem na etapa 1, preencher, avançar pra etapa 2 e voltar — valores devem persistir no estado local da consulta.

### Task 3: Trocar `anamnesis` por `anamnesisAnswers` + `anamnesisText` em `DashboardNutri.jsx`
- **Action**: Renomear `const [anamnesis, setAnamnesis] = useState('')` → `const [anamnesisAnswers, setAnamnesisAnswers] = useState({})`. Adicionar `const anamnesisText = formatAnamnesisAnswers(anamnesisAnswers, clinicConfig?.anamnesisTemplate);` no corpo do componente (recalculado a cada render — barato, é só um `.map().join()`). Substituir as 3 ocorrências de `${anamnesis}` (linha 240 em `analyzeExamWithAI`, linha 329 em `generateDietFromAI`, linha 415 em `generateWorkoutFromAI`) por `${anamnesisText}`. Em `finishConsultation`, trocar `anamnesis: anamnesis` (linha 529) e o `${anamnesis}` da linha 542 por `anamnesisText`. Atualizar a chamada de `<ConsultationFlow />` (linhas 578-604): trocar `anamnesis={anamnesis} setAnamnesis={setAnamnesis}` por `anamnesisAnswers={anamnesisAnswers} setAnamnesisAnswers={setAnamnesisAnswers}` e adicionar `clinicConfig={clinicConfig}`.
- **Mirror**: Nenhuma renomeação de padrão especial — é o mesmo `useState` já existente, só trocando o shape de string pra objeto, seguindo a regra de imutabilidade do projeto (`setAnamnesisAnswers({ ...anamnesisAnswers, [id]: valor })`, nunca mutação direta).
- **Validate**: Rodar uma consulta completa ponta-a-ponta (preencher anamnese estruturada → gerar dieta com IA → gerar treino com IA → analisar exame com IA, se houver exame de teste → finalizar consulta) e conferir, via `console.log` temporário ou Firestore, que `consultations[].anamnesis` salvou uma string legível com os campos preenchidos.

## Validation
```bash
npm run dev      # smoke test manual — não há suite de testes automatizados no projeto
npm run lint
npm run build
```
Sem testes automatizados neste projeto — validação manual cobre: (1) UI da consulta mostrando os campos certos; (2) os 3 fluxos de IA (exame, dieta, treino) recebendo o texto formatado (inspecionar `promptContext`/`contentArray` via `console.log` temporário durante o teste, removido antes de finalizar); (3) consulta antiga no histórico do paciente (`PatientList.jsx` → prontuário) continuando a exibir `cons.anamnesis` normalmente, sem quebrar.

## Risks
| Risk | Likelihood | Mitigation |
|---|---|---|
| Esquecer um dos 3 pontos de interpolação de `anamnesis` em `DashboardNutri.jsx`, deixando um prompt de IA sem o contexto novo | Média | Task 3 lista as 3 linhas exatas (240, 329, 415) — conferir todas antes de validar |
| Paciente sem nenhum valor preenchido em campo obrigatório (`required: true`) — hoje o textarea não tinha validação nenhuma | Baixa | Fora de escopo bloquear o avanço da consulta por campo obrigatório neste milestone; manter o comportamento permissivo atual (like o textarea, que também não bloqueava) |
| Campo `escolha_unica` sem `options` configuradas (edge case se o nutricionista mudar o tipo sem preencher opções) | Baixa | `<select>` renderiza vazio nesse caso — aceitável para este milestone, sem validação de configuração |

## Acceptance
- [ ] Etapa 1 da consulta (`ConsultationFlow.jsx`) renderiza os campos de `clinicConfig.anamnesisTemplate` (ou `DEFAULT_TEMPLATE`) em vez do textarea único
- [ ] Os 3 prompts de IA (`analyzeExamWithAI`, `generateDietFromAI`, `generateWorkoutFromAI`) usam `anamnesisText` formatado a partir dos campos estruturados
- [ ] `finishConsultation` salva `anamnesisText` em `consultations[].anamnesis` (string) e no `records` do paciente
- [ ] Histórico de consultas antigas em `PatientList.jsx` (prontuário) continua exibindo `cons.anamnesis` sem quebrar
- [ ] `npm run build` e `npm run lint` passam sem erros novos
