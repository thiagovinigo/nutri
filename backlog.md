# Backlog — Nutrivvo

> **Documento único de status do produto.** Auditado item-a-item contra o código em **28/08/2026**
> (atualizado em **31/08/2026** — checagem de CPF único, painel `/admin` V1, reorganização de
> `api/utils` → `lib/`).
> Este arquivo substitui `features.md`, `roadmap-trimestral.md`, `userstorys.md`, `todo.md`, `todo2.md` e
> `backlog-user-stories.md` (todos marcados como aposentados no topo, mantidos no repo só como histórico).
> Docs de **estratégia** seguem válidos e separados: `prd.md`, `spec.md`, `context.md`,
> `v2_product_strategy.md`, `design.md`, `pmf-assessment.md`, `stakeholder.md`.
>
> Convenção: **✅ feito** (com `arquivo:linha` de evidência) · **🟡 parcial** · **⬜ não começou** ·
> **🐛 bug/inconsistência achado na auditoria** · **🤔 decisão de produto** (não é bug).

---

## 📸 Estado em produção (atualizado 31/08/2026)

Stack: React 19 + Vite 8, Firebase (Firestore + Auth), Vercel (Hobby, 12 Serverless Functions —
código compartilhado do backend vive em `lib/`, **fora** de `api/`, porque o Vercel conta todo
`.js` dentro de `api/` recursivamente pro limite; `api/` está em 7/12 hoje), sem TypeScript
(`.jsx`), sem testes automatizados (exceto scripts `assert` avulsos na raiz, ex. `test-cpf-guard.mjs`).
PWA via `vite-plugin-pwa`.

- **App do paciente** (`/paciente`): QuestBoard (check-in diário água/refeição/foto), DietPlan (cardápio
  dia-a-dia da Tabela TACO + "Substituir" alimento), WorkoutPlan, BonusRecipes (receitas da nutri +
  "Por Foto" = análise de geladeira por IA), ChatBot clínico (IA), Profile (peso + gráfico, exames em
  linguagem leiga, conectar Telegram). Onboarding self-service com "Degustação IA" pra quem entra sem convite.
- **CRM do nutricionista** (`/nutri`): Visão Geral (próximas/realizadas consultas, atenção necessária,
  mais engajados, sequência média), Meus Pacientes + prontuário (anamnese estruturada, exames com OCR+IA,
  BiomarkersChart, ChatIA = histórico Telegram + pausar bot + mensagem manual), ConsultationFlow
  (anamnese → exames → dieta/suplementos/treino gerados por IA), FinancialCRM (catálogo de planos,
  honorários por paciente, alerta de renovação, dashboard de faturamento), Agenda semanal, Configurações
  (identidade visual, campos de anamnese, horários).
- **Secretária Virtual (Telegram)** — canal ativo com pacientes reais desde 12/08/2026. Webhook
  (`api/telegram-webhook.js`) + motor de IA compartilhado (`lib/secretariaVirtual.js`, 15 tools) +
  2 crons via GitHub Actions (`cron-reminders` hourly, `cron-weekly-summary` segundas).
- **Página pública de agendamento**: `/agendar/:nutriId` (`PublicBooking.jsx`).
- **Painel Admin** (`/admin`, dono único do sistema) — métricas agregadas, lista de nutricionistas
  entre tenants, resolução de conflitos de CPF duplicado. Autorização por uid fixo (`ADMIN_UID`).
  Ver "👑 Super-Admin" abaixo.

---

## ✅ Reconciliação — docs estavam desatualizados

Itens que `features.md` / `roadmap-trimestral.md` / versões antigas deste backlog davam como
"a desenvolver" ou "pendente de validação", mas **já estão no código**:

| Item | Onde estava errado | Evidência |
|---|---|---|
| Migração Telegram concluída e em uso | roadmap "Pendente: confirmar setWebhook / testar ponta-a-ponta" | 2 pacientes ativos; `api/telegram-webhook.js`, crons em `.github/workflows/` |
| Gráfico de evolução de peso (paciente) | features.md "A Desenvolver" | `Profile.jsx:159-176` (LineChart Peso/Gordura) |
| Gráfico de evolução de biomarcadores (CRM) | features.md "A Desenvolver" | `BiomarkersChart.jsx` usado em `PatientList.jsx:1044` (exames + peso na mesma timeline) |
| Auth nos endpoints de IA/cron | backlog "avaliar aplicar requireAuthUid" | `openai-bridge.js:59` (`requireAuthUid`), `send-telegram.js:26`, `cron-reminders.js:16` (`Bearer $CRON_SECRET` obrigatório) |
| Receitas bônus (biblioteca avulsa) | features.md "A Desenvolver" | `BonusRecipes.jsx` + `addBonusRecipe` (`AppContext.jsx:577`) |
| Análise de geladeira por IA | backlog "Ideia do Usuário, nunca construída" | `PhotoRecipeGenerator.jsx` + `usePhotoRecipe.js`, aba "Por Foto" em `BonusRecipes.jsx:194` |
| Anamnese estruturada (nutri configura campos) | — (já marcado feito, confirmado) | `AnamnesisTemplateSettings.jsx`, `ConsultationFlow.jsx:216-260` |
| Substituição de alimento cruzando restrições/medicamentos/exame | — (confirmado) | `secretariaVirtual.js:173-203`, `DietPlan.jsx` `handleOpenSub`, `MealBuilder.jsx` |
| Endpoint temporário `admin-telegram-setup.js` | backlog "remover depois" | já removido (não existe em `api/`) |
| OTP de verificação de telefone | backlog vários itens | removido junto com WhatsApp (o `/start` do Telegram prova posse) — ver dívida em firestore.rules abaixo |

---

## 📬 Feedback do nutricionista (28/08/2026) — reconciliado com o código

> Chegou um "Plano de Implementação — Ajustes e Refinamentos" (escrito sem ler o código atual).
> 4 das 5 mudanças propostas **já estão implementadas**. Registrado aqui pra não reprogramar.

**Já feito (o plano propunha construir do zero):**
- ✅ E-mail de ativação de conta — `SignUp.jsx:4,173` (`sendEmailVerification` após signup) + aviso em `:251`.
- ✅ Validação de CRN obrigatória por regex — `SignUp.jsx:132` (`/^CRN-\d\s\d{4,6}$/i`) + `:428` `required`.
- ✅ Gamificação de refeição/água/chat — `calculateGamification` (`AppContext.jsx`) em `markMealDone`/
  `addExtraMealLog`/`updateWater`; `telegram-webhook.js:51-73`; `secretariaVirtual.js` `log_water`/`log_sleep`.
  (O plano dizia "hoje só ganha XP no peso" — incorreto.)
- ✅ Resgate por inatividade de 3 dias + motivacional matinal por baixa adesão — `cron-reminders.js:61-97`,
  mensagem quase idêntica à proposta. `lastActivityDate` já persistido.
- ✅ "Telefone (WhatsApp)" → "Telefone (Telegram)" no cadastro — `SignUp.jsx:404`.

**Genuinamente novo / a fazer:**
- ⬜ **Bônus de gamificação diário** — XP extra quando o paciente fecha o dia com refeições + água + chat.
  Não existe hoje (cada ação dá XP isolado). *(Onda 5.)*
- ✅ **[CORRIGIDO — Onda 1, 28/08/2026] `cron-reminders.js` usava `diffDays === 3` exato.** Agora
  `>= 3` com trava `lastInactivityNudgeAt` no doc do paciente (só 1 resgate por "buraco" de
  inatividade). A mensagem também passou a dizer o número real de dias.
- ✅ **[CORRIGIDO — Onda 1, 28/08/2026] `SignUp.jsx` — regex do CRN só aceitava 1 dígito de região.**
  Agora `/^CRN-\d{1,2}\s?\d{4,6}$/i` (aceita CRN-1 a CRN-11, espaço opcional) e a validação é
  obrigatória de verdade pra role `nutricionista` (antes era `&& crn`, pulável).

**Decisões de produto (do feedback):**
- ✅ **[FEITO — Onda 3, 28/08/2026] Chat IA removido do CRM (opção A).** Deletados `ChatIA.jsx` +
  import/aba/painel em `PatientList.jsx`. **Handoff humano some junto:** o `bot_paused` só era ligado
  ali. `secretariaVirtual.js` ainda *lê* `bot_paused` (branch morta inofensiva — só ativável setando o
  campo à mão no Firestore). Havia trabalho pré-sessão pra opção B (`ChatIA.jsx` filtrando msgs da IA)
  — descartado com o arquivo, conforme a decisão.
- 🤔 **Botões de cobrança/resgate ainda usam WhatsApp** (`FinancialCRM.jsx:149`, `PatientList.jsx:1128,1134`
  — link `wa.me/55...`, sem API, sem risco de ban). Manter WhatsApp pra cobrança ou migrar pra Telegram?

### 🐛 Cadastro duplicado — CONFIRMADO possível (auditoria 28/08/2026)

Evidência de que já acontece: `find_ghost.js` na raiz é um script pra achar **todos** os `patients`
com um CPF específico. Chaves de identidade hoje: e-mail = conta (Firebase Auth garante unicidade só
no nível *Auth*, não da ficha provisória), CPF = validação (sem constraint no banco, checagem só
client-side e em memória), telefone = Telegram (sem constraint).

**4 caminhos:**
- **A)** A ficha provisória do CRM **nunca é deletada** no cadastro por convite. `firestore.rules`
  exige `request.auth.uid == docId` pra deletar, mas o ID da ficha é aleatório (`addDoc`) → o
  `deleteDoc` do `SignUp.jsx` sempre falha (permission-denied), é engolido no `catch`. Sobra a ficha
  `inativo` + o novo `patients/{uid}` mesclado. **Órfã garantida em todo convite.**
- **B)** Nutri cria ficha (`nutricionista_id: X`); paciente se cadastra pelo `/cadastro` direto (sem o
  link) com o mesmo e-mail. Auth deixa (ficha não é conta). Checagem de telefone do `SignUp.jsx:146`
  filtra `nutricionista_id == null` → não acha a ficha. CPF não é checado no SignUp. → 2 docs.
- **C)** Convite com e-mail divergente do da ficha → merge lê a ficha mas o delete falha (caminho A) →
  ficha órfã + doc novo.
- **D)** `DashboardNutri.jsx:168` — o dedup de CPF/e-mail do CRM **pula `status: 'inativo'`** → nutri
  cria a mesma ficha provisória 2x sem bloqueio.

**Causas-raiz:** (1) zero constraint de unicidade no `patients`; (2) regra de delete impede o paciente
de limpar a própria ficha provisória; (3) dedup do CRM ignora `inativo` e só vê pacientes do próprio
nutri.

**Correção — Onda "dup" (em andamento, 28/08/2026):**
- ✅ `DashboardNutri.jsx` — dedup deixa de pular `inativo` na **criação** (mantém pulando só ao editar
  um paciente existente, pra não brigar com um órfão do próprio).
- ✅ `SignUp.jsx` — antes de criar `patients/{uid}` no fluxo self-service, procura ficha provisória
  `inativo` por **e-mail** e reivindica (roda o mesmo merge do `?vincular`). Cobre B e C parcialmente.
- ✅ `firestore.rules` — `allow delete` da ficha provisória relaxado pra `request.auth != null &&
  status == 'inativo'` (qualquer usuário logado pode limpar ficha não reivindicada) → o merge agora
  de fato remove a órfã. **[CONFIRMADO 31/08/2026] Publicado no Firebase Console** (colado no
  editor de regras e o botão "Publicar" não apareceu — Firestore já reconheceu como idêntico ao
  que estava rodando).
- ✅ **[CORRIGIDO 31/08/2026] Residual server-side: checagem de unicidade de CPF entre docs *ativos*.**
  Novo endpoint `api/patient-cpf-guard.js` (Admin SDK, transação) contra um índice
  `patientCpfIndex/{cpfDigits}` (ID do doc = trava de unicidade nativa do Firestore). Chamado por
  `SignUp.jsx` antes do `setDoc` final (self-service, inclui o merge de ficha reivindicada) e por
  `DashboardNutri.jsx` ao editar um paciente já `ativo`. Em conflito (409), `SignUp.jsx` apaga a
  conta Auth recém-criada (`user.delete()`) pra não deixar órfã sem ficha. Fichas `inativo`
  (provisórias) ficam fora da checagem de propósito — só o momento em que o paciente vira `ativo`
  importa. `cpfDigits` (só dígitos) agora é gravado em todo write novo (`AppContext.addPatient`,
  `SignUp.jsx`, `DashboardNutri.jsx`). Lógica pura testável em `lib/patients.js` +
  `test-cpf-guard.mjs` (8 asserts, `node test-cpf-guard.mjs`) — mesmo padrão do script da Onda 1,
  sem framework de teste. `npm run build` OK. Ponta-a-ponta real (dois cadastros com o mesmo CPF)
  só verificável pós-deploy contra o Firestore de produção.
- ✅ **[FEITO 31/08/2026] Limpeza dos órfãos que já existem:** substituído por uma ferramenta de
  verdade — aba "Conflitos" do painel `/admin` (ver "Super-Admin" abaixo), em vez do script
  `scratchpad/dedupe-report.mjs` manual.

---

## 🐛 Bugs e inconsistências achados nesta auditoria

- ✅ **[CORRIGIDO 28/08/2026] PWA servindo versão/logo antigos.** Paciente relatou tela e logo antigas
  de login. Causa: `registerType: 'prompt'` (`vite.config.js:81`) + `main.jsx` sem checagem periódica
  → um PWA instalado mantido em segundo plano nunca re-baixava o script do SW, nunca via o toast
  "Atualizar", ficava preso num bundle antigo indefinidamente. Correção em `main.jsx`: (1) `registration.update()`
  de hora em hora com o app aberto; (2) nas rotas `/` e `/login` (sem formulário preenchido no 1º paint),
  a nova versão aplica sozinha após 5s — com guarda de `hasUnsavedInput()` e checagem de rota, caindo no
  toast manual se o paciente começar a digitar. Ícone da home de PWAs já instalados só troca com
  reinstalação (limitação do SO). Build verificado OK.
- ✅ **[FEITO — Onda 3, 28/08/2026] `DirectChat.jsx` (shell morto) removido.** Era `setDirectMessages`
  local, nunca persistia, nunca renderizado. Deletados `DirectChat.jsx` + `sendDirectMessage` +
  `directMessages` do `AppContext.jsx` + destructure não usado em `PatientList.jsx`. Canal nutri↔paciente
  que resta: o resgate manual via `sendTelegramToPatient` (`PatientList.jsx`, botão de cobrança/resgate).
- 🐛 **3 sinais de "risco" concorrentes que não se falam:**
  1. `computedPatients` (`AppContext.jsx:605-611`) — deriva `em_risco` de `streak === 0 && xp > 50`.
  2. `secretariaVirtual.js:631` (`alertar_nutricionista`) — grava `status: 'Em Risco'` + `riskReason`.
  3. `PatientApp.jsx:128` (ChatBot) — grava `behavioral_risk: true` por heurística de palavra-chave + sono.
  Pior: o `computedStatus` do item 1 **sobrescreve** o `status: 'Em Risco'` do item 2 no próximo render
  (só respeita `p.status` quando é `'inativo'`). O CRM mostra badge de `behavioral_risk` (`PatientList.jsx:672,782`)
  e de `em_risco` separadamente. Precisa unificar num único campo/modelo antes de qualquer trabalho no
  "Radar de Abandono" (ver H1 abaixo).
- ✅ **[CORRIGIDO — Onda 1, 28/08/2026] Crons mandavam markdown `*negrito*` com Telegram em `parse_mode: 'HTML'`.**
  `cron-reminders.js` e `cron-weekly-summary.js` agora usam `<b>...</b>` + novo helper
  `escapeTelegramHtml()` (`lib/telegram.js`) em todo valor dinâmico (nome, refeição) pra um "&"
  não derrubar a mensagem inteira com 400.
- ✅ **[CORRIGIDO — Onda 1, 28/08/2026] `cron-reminders.js` iterava `patient.recipes` como refeições.**
  `recipes` é `[{title, meals:[...]}]`, sem `.time` — o lembrete de refeição por horário **nunca
  disparava** (era a North Star). Agora usa `resolveTodaysMeals(patient)`, **extraído pra
  `lib/meals.js`** (função pura, testável sem `firebase-admin`; `secretariaVirtual.js` e
  `cron-reminders.js` importam de lá). Bônus: o denominador da checagem de baixa adesão também estava
  inflado (contava refeições de todos os dias) — agora usa `resolveTodaysMeals(patient, yesterday)`.
  **Testado:** 53 asserts em `scratchpad/test-onda1.mjs` (ciclo de dias, wrap, sem-prefixo, escape HTML,
  regex CRN, lógica de resgate, casing de status) + `npm run build` OK. Ponta-a-ponta real (cron →
  Telegram) só verificável pós-deploy.
- ✅ **[FEITO — Onda 3, 28/08/2026] `firestore.rules` — guardas de OTP/`phone_verified` removidas.**
  Confirmado 0 referências a `phone_otp_*`/`phone_verified` em código. As 2 cláusulas `allow update` de
  `/patients` viraram um `allow read, create, update: if uid == patientId` simples + nutri sem os
  guards. **[CONFIRMADO 31/08/2026] Publicado no Firebase Console** (junto com o `allow delete` da mini-wave dup).
- ✅ **[CORRIGIDO — Onda 1, 28/08/2026] Status de agendamento com caixa inconsistente.**
  CRM grava `'agendado'` minúsculo (`AppContext.jsx:484`), a IA grava `'Agendado'`. `verificar_disponibilidade`
  e `agendar_consulta` (`secretariaVirtual.js`) agora checam
  `['Agendado','Confirmado','agendado','confirmado']` — não oferecem mais horário já ocupado por
  consulta do CRM. *(Padronizar o valor na fonte fica pra depois — Onda 3.)*

---

## 📋 Backlog aberto

### 💰 Monetização — nenhum vestígio de Stripe/Mercado Pago no código

- ⬜ **Integração real com Stripe** (checkout B2B, webhooks de assinatura, roles no Firestore).
- ⬜ **Painel de assinatura 3 tiers** (Starter R$97 / Pro R$197 / Clinic R$397).
- ⬜ **Limite de pacientes por plano aplicado de verdade** — hoje `FinancialCRM.jsx` só exibe texto.
- ⬜ **Bloqueio de features premium por tier** (ex: Secretária Virtual só no Pro+).
- 🐛/⬜ **Mudar lógica financeira MRR → Agenda.** `FinancialCRM.jsx:43-72` soma `plan.price` por paciente
  ativo (modelo de assinatura fixa). O consultório real opera por Consulta paga + Retorno gratuito —
  precisa ler `appointments` do mês e aplicar valor por tipo (1ª consulta = X, retorno = 0). Item mais
  antigo do backlog, ainda válido.
- ⬜ **Paciente ver o próprio status de pagamento no app.** `financialStatus` (pago/pendente/atrasado)
  já existe no doc do paciente e é editado em `FinancialCRM.jsx` / `PatientList.jsx`; `firestore.rules`
  já permite leitura do próprio doc. Só falta exibir. Esforço P (status atual) / M (histórico de faturas).
- ⬜ **Cobrança de paciente dentro do app** (nutri cobra o próprio paciente). Hoje 100% manual:
  `FinancialCRM.jsx:149` e `PatientList.jsx:1128,1134` só montam um link `wa.me/55...` com texto pronto.
  Avaliar Pix via Mercado Pago/Asaas (taxa BR menor) ou Stripe Connect. Esforço grande (compliance).
- ⬜ **Programa de indicação B2B** (nutri ganha benefício ao indicar colega). Pode reaproveitar o
  Shareable Milestone como gancho (embutir `?ref=` na URL/QR) em vez de tela nova.

### 🗓️ Secretária Virtual — agenda (itens abertos)

- ⬜ **Integração com Google Calendar do nutricionista.** As tools `verificar_disponibilidade` /
  `agendar_consulta` (`secretariaVirtual.js:785-837`) leem/escrevem só a coleção `appointments` do
  Firestore — não enxergam a agenda pessoal do nutri, então um compromisso no Google Calendar dele pode
  colidir com um horário que a IA ofereceu. Exige OAuth por nutricionista. **Decisão técnica pendente:**
  Google Calendar API vs. alternativa, e modelo de custo/permissão.
- ⬜ **Integração com Gmail** — enviar convite `.ics` / lembrete por e-mail como canal alternativo ao Telegram.

### 📊 Inteligência de Cohorts e Risco

- ⬜/🐛 **H1 — Radar de Abandono unificado.** Antes de qualquer coisa, resolver os 3 sinais concorrentes
  (ver bug acima). Depois: um único score derivado de comportamento real (streak zerado, dias sem
  check-in) que substitua ou complemente o campo manual. **Validar com o usuário:** ele quer perder o
  controle manual ou prefere manual + sugestão automática?
- ⬜ **Alertas automatizados** (push / e-mail / Telegram) quando o nutri aciona um alerta do CRM —
  hoje o alerta só muda o status, não notifica ninguém.
- ⬜ **Patient 360 Dashboard** — painel único no prontuário: food log visual + peso + plano + anotações.
  Peças existem espalhadas (`BiomarkersChart`, `foodLogs`, `recipes`), falta a consolidação.
- ⬜ **Resumo diário pro paciente (fim do dia).** Hoje só existe o semanal (`cron-weekly-summary.js`,
  segundas). Falta um recap de fim de dia via Telegram: "hoje bateu 4/5 refeições, 1,8L de água, faltou
  registrar o jantar 🌙". Reaproveita a lógica do `cron-weekly-summary.js` com janela "hoje"; novo
  horário no cron (ex: 20h/21h) ou cron próprio.
- ⬜ **Varredura diária proativa → nutricionista (Detetive Comportamental agendado).** Hoje a detecção
  diária das 9h em `cron-reminders.js` só cobre inatividade 3+ dias e adesão <30%, e **só avisa o
  paciente**. Falta: no mesmo cron, por paciente, cruzar streak zerado + dias sem check-in + sono ruim +
  água baixa + <30% adesão → gravar `riskFlag` no doc e **notificar o nutricionista** (via o
  `notifications[]` em `users/{nutriId}` do item de Alertas Automatizados). É a versão *agendada* do
  Detetive — a que existe hoje (`alertar_nutricionista` em `secretariaVirtual.js`) é só reativa (dispara
  quando o paciente fala algo no chat).

### 🩺 Clínico

- 🟡 **Rastreamento nutricional estruturado (macros/micronutrientes).** `src/data/taco.json` já existe e
  alimenta as *substituições* com macros. Mas `foodLogs` gravam só `log: <texto da IA>`
  (`AppContext.jsx:323,348`; `secretariaVirtual.js:610`) — sem kcal/macros/micros por registro.
  Falta: `type: 'structured'` em `foodLogs`, base nutricional maior (TACO completa ou Open Food Facts).
- ⬜ **Scanner de código de barras** (`BarcodeDetector` + fallback zxing-js). Depende do item acima.
- ⬜ **Paciente sugere atualização da própria anamnese entre consultas** — mini check-in leve
  ("mudou algo? novo medicamento, nova restrição?") que só *sugere* pro nutri confirmar. Autoridade
  clínica continua 100% do nutri.
- ⬜ **Sobrepor dieta/adesão no BiomarkersChart** — hoje cruza exames × peso; falta a terceira série.

### 🔁 Retenção / Engajamento

- 🟡 **Biblioteca de templates de dieta.** DietBuilder + CRUD de `dietTemplates` existem
  (`AppContext.jsx:521-550`, `PatientList.jsx:171-233`, coleção `dietTemplates` no firestore.rules).
  Falta um fluxo direto de "aplicar template a um novo paciente" (hoje `addRecipe` monta a dieta do zero).
- ⬜ **Fotos de progresso antes/depois** — seria a **primeira** integração real com Firebase Storage
  (hoje `src/services/firebase.js` só inicializa, nada faz upload; fotos de refeição vão em base64 pra
  OpenAI e são descartadas). Pode reaproveitar o Shareable Milestone como gancho de compartilhamento.
- ⬜ **Calibração de XP/gamificação pra pacientes de 6+ meses.**
- ⬜ **XP por manter exames em dia** — motor de XP e upload/OCR já existem; falta disparar `addXP` no
  fluxo de upload (com cooldown por paciente).

### 👑 Super-Admin / Observabilidade

- ✅ **[FEITO 31/08/2026] V1 — resolver conflitos, ver usuários, métricas.** Rota `/admin`
  (`src/features/admin/`), autorização por uid fixo (`ADMIN_UID`, env var só-servidor, nunca
  `VITE_`-prefixada) checado em `api/admin.js` (endpoint único, roteado por `action`, pra não
  gastar mais slots de Serverless Function). 3 abas: Métricas (nutris/pacientes ativos,
  pacientes inativos, streak/xp médio), Usuários (tabela de nutricionistas entre todos os
  tenants, com contagem de pacientes), Conflitos (agrupa pacientes `ativo` por `cpfDigits` via
  `findCpfConflictGroups` — cobre duplicatas *legadas*, criadas antes do `patientCpfIndex`
  existir; botão "Manter este, arquivar o outro" chama `resolve_conflict`, que revalida o CPF
  server-side antes de arquivar). Fecha "Limpeza dos órfãos que já existem" com uma UI real em
  vez do `find_ghost.js` manual. **Requer configurar `ADMIN_UID` nas env vars de produção da
  Vercel** (uid do Firebase Auth do dono, pego no Firebase Console) — sem isso todo o painel
  retorna 403.
- ⬜ Painel de saúde do sistema (status de endpoints serverless, filas, erros de webhook).
- ⬜ Gestão de créditos de IA / tokenomics (tracking de tokens por nutri, cotas, recarga).
- ⬜ Seletor dinâmico de modelo de IA / edição de system prompts sem redeploy.
- ⬜ Gestão global de tenants (lista de nutris, status Stripe, "impersonate" pra suporte).

### 🌐 White-label / Multi-profissional

- ⬜ White-label server-side real (cores/logos por clínica além do superficial, isolamento de dados).
- ⬜ Multi-profissional (hoje 1 nutri = 1 clínica; `firestore.rules` assume `nutricionista_id` 1:N).
- 🤔 Edge case: paciente atendido por mais de um nutricionista (modelo hoje 1:N restrito ao 1º vínculo).

### 🚀 Growth / Aquisição

- ⬜ Onboarding self-service com **diretório/marketplace de especialistas** (paciente cria conta, escolhe
  nutri, solicita vínculo). Hoje existe só a "Degustação IA" (`OnboardingProfileForm.jsx`) e a página
  pública de agendamento por link (`/agendar/:nutriId`). Marketplace não existe (0 ocorrências no código).
- ⬜ Sistema de convite orgânico premiado.
- ⬜ Link de indicação embutido no Shareable Milestone.

### 🧠 IA — custo e qualidade

- 🟡 **Otimização de custo da Vision.** `secretariaVirtual.js:574` já usa `gpt-4o-mini`. Mas
  `api/openai-bridge.js:80` (usado por ChatBot do paciente, geração de dieta, análise de exame **e**
  check-in por foto do QuestBoard/PhotoRecipeGenerator) usa `gpt-4o` sem `detail: "low"`. Avaliar
  `gpt-4o-mini` + `detail: "low"` só nas chamadas com `image_url`.
- ⬜ **`DietPlan.jsx` × `QuestBoard.jsx` mostram a mesma dieta de formas inconsistentes** (um é lista
  estática, outro tem estado feito/pendente).

### 🧹 Infra / Qualidade

- ✅ **[INCIDENTE 31/08/2026] Deploy falhou silenciosamente por estourar o limite de 12 Serverless
  Functions.** O commit do painel Admin (`bf53385`) passou de `api/` com 11/12 arquivos pra 13/12 —
  Vercel conta **todo `.js` dentro de `api/`, recursivamente (inclusive subpastas como
  `api/utils/`)**, como uma function separada. O app em produção não caiu (Vercel mantém a última
  versão OK no ar), mas o deploy novo simplesmente não ia — só percebido porque o usuário notou
  "última versão é de 8h atrás" no dashboard da Vercel. **Fix:** `api/utils/` → `lib/` (fora de
  `api/`, não conta no limite); `api/` voltou a 7/12. **Lição:** qualquer arquivo `.js` novo sob
  `api/` (em qualquer profundidade) consome 1 slot — código compartilhado do backend deve nascer
  em `lib/`, nunca em `api/utils/`. Isso já estava documentado num comentário em
  `telegram-webhook.js` antes desta sessão; deveria ter sido conferido antes de adicionar arquivos.
- ⬜ **Zero testes automatizados** (confirmado: sem vitest/jest/playwright no `package.json`). Priorizar:
  login, CRUD paciente, agendar consulta, prescrever dieta, cálculo de XP/streak, regra anti-duplicidade.
- ⬜ **Instrumentação AARRR / eventos customizados** — nada disparado (só Firebase Analytics inicializado).
- ⬜ **Code-splitting `pdfjs-dist` / `recharts`.** Sem `manualChunks` em `vite.config.js`; o
  `maximumFileSizeToCacheInBytes: 5000000` (5MB) no workbox é justamente pra caber esses chunks grandes.
- ⬜ **Investigar instabilidade de escrita do Firestore (503 recorrente)** — parece infra/rede.
- ⬜ **Pesquisa de PMF (Sean Ellis)** — depende de base real de usuários.

---

## 🤔 Decisões de produto pendentes (escolha, não bug)

- ✅ **[FEITO — Onda 3, 28/08/2026] `LearnPath.jsx` / `Quiz.jsx` deletados** (prototipados, sem rota,
  sem import). Se a trilha de aprendizado voltar ao roadmap, recria com conteúdo real.
- ✅ **[FEITO — Onda 3, 28/08/2026] `DirectChat.jsx` / `sendDirectMessage` removidos** (dead code).
- 🤔 Wearables / CGM (Apple Health, Google Fit, glicose contínua) — tendência forte, investimento grande.
- 🤔 Telemedicina / vídeo integrado (concorrentes como Practice Better já têm nativo).
- 🤔 Documentação pra reembolso / nota fiscal (CRN, CNPJ — nicho Brasil).
- 🤔 Comunidade / prova social entre pacientes (leaderboard hoje é só dentro da clínica).

---

## 💡 Ideias por cruzamento de documentos (baixo esforço — infra dos dois lados já existe)

> Combinações de features que já existem separadamente. Reavaliadas na auditoria de 28/08/2026;
> "Análise de Geladeira" saiu daqui porque **já foi construída** (ver reconciliação).

- ⬜ **Biomarcadores como 5º sinal do Radar de Abandono** — sono, água, chat e exame já são captados;
  falta o algoritmo considerar exame laboratorial (ex: glicose alta + sono ruim = alerta mais forte).
- ⬜ **Fila de espera da Secretária Virtual ordenada por score de Cohort** (em vez de FIFO) quando um
  horário vaga. A fila em si ainda nem existe — nasce já certa.
- ⬜ **Cobrança preditiva automática via Secretária Virtual** — o alerta de renovação do Financeiro é
  manual; cruzar com a Secretária pra disparo automático quando plano vence em N dias E Cohort = alta adesão.
- ⬜ **Template de recibo estendido pra reembolso** de plano de saúde (CRN, CNPJ se PJ).
- ⬜ **Roteamento de alerta comportamental por categoria** (nutricional vs. psicológico) — já modelar o
  campo "categoria" ao unificar o Radar de Abandono, pra não remodelar o schema quando Multi-profissional existir.
- ⬜ **Diário alimentar livre liberado antes do vínculo nutri↔paciente** — paciente self-service chega
  à 1ª consulta já com dado de anamnese.
- ⬜ **Padrão local-first como requisito de arquitetura** pra módulos que dependem de API externa
  (Google Calendar, Telegram) — aplicar via `AppContext.jsx` desde o design, não descobrir via bug 503.

---

## ✅ Feito — histórico condensado

> Detalhe completo no histórico do git. Mantido aqui pra contexto de "por que está assim".

**Fundação V1 (jul/2026):** rebranding Vytal → Nutrivvo (código, prompts, PWA, domínio
`nutrivvo.com.br`), cor de marca roxo/índigo, `firestore.rules` publicado, domínio autorizado no
Firebase Auth, deploy automático da Vercel destravado (remoção de `crons` do `vercel.json`).

**Geração de dieta (jul/2026):** geração dia-a-dia (uma chamada OpenAI por dia) com feedback de
progresso, timeouts client (130s) / server (`maxDuration: 120`) como rede de segurança, retry com
validação de `foods[]`. Corrigiu o "A IA demorou demais para responder".

**Consulta / clínico (jul-ago/2026):** anamnese estruturada configurável
(`.claude/prds/anamnese-pre-consulta.prd.md`), catálogo de suplementos com sugestão por IA e check-in,
"Substituir" alimento pros dois lados (nutri e paciente) com filtro de aversões, exames com OCR + laudo
IA + parecer aberto do nutricionista, síntese clínica considerando adesão. Etapa 4 da consulta: 3 abas
(Refeições / Vitaminas e Suplementos / Treino).

**Dashboard "Visão Geral" (jul/2026):** listas clicáveis (levam ao perfil), card "Mais Engajados" +
"Sequência média" (`PatientList.jsx:277-284,532`), filtro de data em "Próxima Consulta".

**Growth (ago/2026):** Degustação IA / Onboarding self-service (`OnboardingProfileForm.jsx`) — quiz de
3 passos gera 1 dia de dieta + treino de amostra.

**Financeiro do consultório (ago/2026):** catálogo de planos, honorários por paciente
(`financialStatus` / `financialDueDate`), alerta preditivo de renovação (XP × vencimento), dashboard de
faturamento (esperado / recebido / a receber / ticket médio). *Cálculo ainda é MRR — ver backlog aberto.*

**Migração WhatsApp → Telegram (12/08/2026):** número do WhatsApp levou **restrição permanente** pelo
antiabuso do WhatsApp após 3+ bloqueios em 48h (Evolution API/Baileys, canal não-oficial). Toda a infra
de WhatsApp foi **removida do código** (não desativada) — `api/whatsapp-*.js`, `api/send-whatsapp.js`,
`api/utils/whatsapp.js`, `src/utils/sendWhatsApp.js` — porque cada arquivo em `api/` consome 1 dos 12
slots de Serverless Function do plano Hobby e o deploy estava estourando. Histórico no git até `5bd015e`.
Telegram é **substituição completa**, não canal opcional. O gatilho antigo de "migrar pra Meta Cloud API
antes de 50-100 pacientes" **não se aplica ao Telegram** (Bot API é oficial, gratuita, sem templates
pré-aprovados, sem risco de ban arbitrário).

**Secretária Virtual no Telegram (ago/2026):** webhook robusto (texto, foto, áudio via Whisper, botões
inline, `/start` de vínculo, gamificação), 15 tools em `secretariaVirtual.js` (log de refeição/água/sono/
peso/suplemento/treino, alertar nutricionista, gerar receita, verificar disponibilidade / agendar /
cancelar consulta, múltipla escolha, sugerir substituição com gramas da TACO), pausar bot pra
atendimento humano (`ChatIA.jsx`), 2 crons via GitHub Actions (lembrete + resumo semanal), resumo do
dia/exame/progresso injetado como contexto efêmero.

**Segurança (auditoria 11/08/2026):** `api/openai-bridge.js` exige Firebase ID token (era proxy grátis
de GPT-4o), `cron-reminders.js` / `cron-weekly-summary.js` exigem `Bearer $CRON_SECRET` (falha fechado
se a env var faltar), validação Zod no payload da bridge, `firestore.rules` blinda escrita direta de
`phone_verified` pelo client.

---

## 📌 Decisão validada — não mexer

- CRM (sóbrio/profissional) e app do paciente (gamificado/colorido) usarem linguagens visuais
  propositalmente diferentes — mesmo padrão de Noom (paciente) vs. Practice Better (profissional).
  Públicos diferentes justificam identidades diferentes.
