# Clínico — Formulário de Anamnese Estruturado

> Nome do arquivo mantido (`anamnese-pre-consulta`) por ser o slug original; escopo pivotado em 2026-07-28 — não há mais preenchimento pelo paciente antes da consulta (ver Users/Evidence/Scope abaixo). O foco agora é o nutricionista preencher campos estruturados durante a consulta, e a IA usar esses campos.

## Problem
O nutricionista coleta histórico de saúde, hábitos alimentares, objetivos, restrições/alergias e medicamentos digitando tudo num `<textarea>` livre *durante* a própria consulta (`ConsultationFlow.jsx`). Isso produz dados inconsistentes entre pacientes (texto livre, não estruturado) e, mais importante, é o texto que alimenta diretamente os prompts de IA que geram dieta, treino e leem a análise de exames — texto livre e desorganizado vira contexto pior pra IA. Estruturar esses campos deve melhorar tanto a consistência dos dados quanto a qualidade do contexto passado à IA.

## Evidence
- Observação direta de código: a anamnese hoje é campo de texto livre preenchido pelo nutricionista dentro de `ConsultationFlow.jsx` (linha 250), e essa mesma string (`anamnesis`) é interpolada diretamente nos prompts de IA em `DashboardNutri.jsx` (linhas 240, 329, 415 — análise de exames, geração de dieta, geração de treino).
- Decisão de produto do usuário (dono do Nutrivvo), 2026-07-28: o preenchimento pelo paciente antes da consulta (direção original desta PRD) foi descartado — o valor está em o nutricionista preencher estruturado, não em quem preenche.
- Assumption — needs validation via feedback direto de nutricionistas usuários: que dados de anamnese mais estruturados de fato melhoram a qualidade percebida das gerações de IA.

## Users
- **Primary**: Nutricionista (tenant do Nutrivvo) que atende pacientes recorrentes e quer registrar a anamnese de forma estruturada durante a própria consulta.
- **Not for**: Paciente preenchendo o formulário sozinho antes da consulta — decisão explícita do usuário (dono do produto) de tirar isso do roadmap; o preenchimento continua sendo feito pelo nutricionista, só que agora nos campos estruturados em vez de um texto livre. Clínicas multi-profissional também ficam de fora (Nutrivvo hoje é 1 nutricionista = 1 clínica).

## Hypothesis
We believe **substituir o `<textarea>` livre de anamnese em `ConsultationFlow.jsx` pelos campos estruturados configurados em `clinicConfig.anamnesisTemplate`, preenchidos pelo próprio nutricionista durante a consulta, e usar esses campos (em vez do texto único) nos prompts de IA (geração de dieta, geração de treino, análise de exames)** will **produzir dados de anamnese mais estruturados e consistentes entre pacientes, e contexto mais rico para a IA** for **nutricionistas do Nutrivvo**.
We'll know we're right when **o nutricionista preenche os campos estruturados normalmente durante a consulta (sem reclamar de fricção comparado ao textarea antigo) e as gerações de dieta/treino por IA passam a referenciar os campos estruturados no prompt**.

## Success Metrics
| Metric | Target | How measured |
|---|---|---|
| Consultas finalizadas usando os campos estruturados (não mais o textarea livre) | 100% — o textarea é removido, não há caminho alternativo | Revisão de código / QA manual pós-implementação |
| Prompts de IA (dieta, treino, exames) incluindo os campos estruturados | 100% dos 3 pontos de geração atualizados | Revisão de código dos 3 prompt builders em `DashboardNutri.jsx` |
| Tempo percebido de anamnese na consulta | TBD — needs validation via feedback qualitativo do nutricionista pós-lançamento | Feedback direto do nutricionista |

## Scope
**MVP** — No `ConsultationFlow.jsx` (etapa 1 "Anamnese"), substituir o `<textarea>` único por um campo por item de `clinicConfig.anamnesisTemplate` (texto curto, texto longo, ou seleção única, conforme configurado no milestone 1), preenchido pelo nutricionista durante a consulta. As respostas estruturadas são formatadas em texto e usadas nos 3 pontos que hoje leem a `anamnesis` livre em `DashboardNutri.jsx`: análise de exames por IA, geração de dieta por IA, geração de treino por IA — além de continuarem salvas no histórico de consultas do paciente (`consultations`).

**Out of scope**
- Paciente preencher o formulário sozinho antes da consulta — decisão de produto, não só técnica: tirado do roadmap de vez (ver Users).
- Lembretes automáticos de preenchimento (WhatsApp/e-mail) — irrelevante agora que não há preenchimento pelo paciente.
- Histórico/versionamento de múltiplas respostas de anamnese ao longo do tempo — cada consulta já salva sua própria anamnese em `consultations[]`; versionamento adicional fica pra depois se a necessidade aparecer.
- Sugestões automáticas por IA a partir das respostas (além do uso já existente nos prompts de dieta/treino/exames) — fica pra depois.

## Delivery Milestones
<!-- Business outcomes, not engineering tasks. /plan turns each into a plan. -->
<!-- Status: pending | in-progress | complete -->

| # | Milestone | Outcome | Status | Plan |
|---|---|---|---|---|
| 1 | Nutricionista configura formulário de anamnese | Nutricionista define/edita os campos do formulário em Configurações | complete | `.claude/plans/anamnese-pre-consulta.plan.md` |
| 2 | Nutricionista preenche anamnese estruturada durante a consulta (substitui o textarea) | `ConsultationFlow.jsx` renderiza os campos configurados em vez do texto livre; os 3 prompts de IA (exames, dieta, treino) passam a usar os campos estruturados | complete | `.claude/plans/anamnese-pre-consulta.plan.md` |

## Open Questions
- [ ] A dor real (dado de anamnese pouco estruturado prejudicando a qualidade das gerações de IA) precisa de validação direta com nutricionistas usuários pós-lançamento — hipótese ainda não confirmada com uso real.
- [ ] Consultas antigas já salvas com `anamnesis` como texto livre continuam sendo lidas normalmente no histórico (`PatientList.jsx:1044,1317`) — não há migração de dados necessária, só confirmar que a leitura de consultas passadas não quebra.

## Risks
| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Algum dos 3 pontos de geração por IA (exames, dieta, treino) ser esquecido na atualização, deixando um prompt ainda lendo a string antiga | Média | Alto — IA perde contexto clínico nesse fluxo especificamente | Plano de implementação lista os 3 pontos exatos por linha; validação manual testa os 3 fluxos de IA, não só a UI da consulta |
| Consultas já salvas no histórico do paciente (formato antigo, string livre) pararem de renderizar corretamente | Baixa | Médio | Manter `newConsultation.anamnesis` como string formatada (derivada dos campos estruturados), preservando o formato já lido por `PatientList.jsx` |

---
*Status: DRAFT — requirements only. Implementation planning pending via /plan.*
