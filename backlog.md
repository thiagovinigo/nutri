# Backlog — Nutrivvo

> **Documento único de status do produto.** Auditado item-a-item contra o código em **28/08/2026**
> (atualizado em **31/08/2026** — checagem de CPF único, painel `/admin` V1, reorganização de
> `api/utils` → `lib/`; atualizado em **12/09/2026** — WhatsApp de volta como canal via Evolution
> API, edição completa de plano fora da consulta, raciocínio clínico da IA, medida caseira,
> disclaimer de treino, fix de histórico de planos alimentares, Radar de Abandono unificado +
> varredura diária de risco → nutricionista).
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
- **Secretária Virtual (Telegram + WhatsApp)** — canal ativo com pacientes reais desde 12/08/2026.
  Webhook (`api/telegram-webhook.js`) + motor de IA compartilhado (`lib/secretariaVirtual.js`,
  15 tools) + 2 crons via GitHub Actions (`cron-reminders` hourly, `cron-weekly-summary` segundas).
  **WhatsApp voltou como 2º canal em 04/09/2026** (`api/whatsapp-webhook.js` + `lib/whatsapp.js`,
  Evolution API self-hosted — ver reconciliação abaixo, não é o mesmo caminho que levou ao
  bloqueio de 12/08).
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
- 🤔 **Cobrança em `FinancialCRM.jsx` ainda é link manual `wa.me/55...`** (sem API, sem risco de ban),
  separado do canal automatizado da Secretária Virtual. *(Os botões duplicados de Resgate/Cobrança/
  Recibo em `PatientList.jsx` — órfãos desde a remoção do ChatIA — foram removidos em 04/09/2026,
  `3c0bde2`.)* Com o WhatsApp de volta como canal automatizado (ver reintrodução acima), avaliar se
  a cobrança deveria migrar pra dentro do fluxo da Secretária Virtual (Telegram ou WhatsApp) em vez
  de continuar como link manual à parte.

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
- ✅ **[CORRIGIDO 12/09/2026] 3 sinais de "risco" concorrentes que não se falavam.** Eram:
  1. `computedPatients` (`AppContext.jsx`) — derivava `em_risco` de `streak === 0 && xp > 50`.
  2. `secretariaVirtual.js` (`alertar_nutricionista`) — gravava `status: 'Em Risco'` + `riskReason`.
  3. `PatientApp.jsx` (ChatBot) — gravava `behavioral_risk: true` por heurística de palavra-chave + sono.
  O `computedStatus` do item 1 sobrescrevia o `status: 'Em Risco'` do item 2 no próximo render. Ver
  "H1 — Radar de Abandono unificado" abaixo pra correção completa (score único em `lib/riskScore.js`).
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

### 🤖 Agente WhatsApp: paridade com o Telegram + melhorias do curso (aberto 20/11/2026)

> **Meta:** o agente do WhatsApp deve se comportar **igual ao do Telegram de hoje**
> (`lib/secretariaVirtual.js`, 15 tools, dados do paciente no Firestore, Radar de Abandono). A base
> está em `whatsapp-agent/` (Python + PydanticAI + WAHA, só personalidade e canal, **sem tools ainda**).
> O curso "Seu Agente no AR Hoje" (exemplo Barbearia Navalha) foi lido só para extrair o que
> melhora o nosso; **conteúdo da barbearia, Groq/OpenRouter e histórico em JSON não entram**
> (a gente já tem OpenAI, Firestore e o prompt do Nutrivvo Bot). Nenhum item abaixo foi pro código
> do Telegram/Node ainda.
>
> **🤔 Decisão pendente:** a paridade sai de (A) portar as 15 tools pro Python ou (B) trocar só
> Evolution → WAHA no Node (`lib/whatsapp.js` + `api/whatsapp-webhook.js`), que já tem as tools.
> Escolher antes de implementar qualquer item abaixo.

- ⬜ **Paridade de tools e dados do paciente** (`log_meal`, `log_water`, `log_sleep`, `log_weight`,
  `alertar_nutricionista`, agenda, receita, substituição, suplemento, treino) + vínculo
  `/start <patientId>` e `/start nutri:<código>` + gamificação (XP/streak). Hoje o `whatsapp-agent/`
  responde, mas não registra nada nem enxerga plano/exame.
- ⬜ **Buffer de mensagens picadas** — esperar `BUFFER_SEGUNDOS` (2 s nos testes, ~8 s em produção)
  e juntar o que o paciente mandou em sequência numa resposta só; um contato nunca recebe duas
  respostas ao mesmo tempo. (feito em `whatsapp-agent/app/ritmo.py`; falta no Node)
- ⬜ **Ritmo humano: visto + "digitando" + espera proporcional** (1 s + 0,04 s/caractere, máx. 8 s,
  descontando o tempo da IA). Além da UX, **ajuda a reduzir risco de bloqueio** (3 números já
  queimados). WAHA: `/api/sendSeen`, `/api/startTyping`, `/api/stopTyping`.
- ⬜ **Respostas em mensagens curtas** (até 3, separadas por linha em branco). **Atenção:** o prompt
  atual do Telegram/Node manda usar `*negrito*` nativo do WhatsApp; o curso manda tirar asterisco.
  Decidir um padrão antes de copiar.
- ⬜ **Data e hora de hoje no prompt** (America/Sao_Paulo, em português) pra IA entender "amanhã",
  "sábado que vem" e se o consultório está aberto. Feito em `whatsapp-agent/app/agent.py`.
- ⬜ **Documento PDF** — baixar, mandar em base64 pro modelo e resumir (≤500 caracteres: tipo, valores,
  datas, nomes). Hoje o Node trata foto e áudio, não PDF. Feito em `whatsapp-agent/app/midia.py`.
- ⬜ **Webhook assinado (HMAC-SHA512)** do WAHA no corpo bruto (`X-Webhook-Hmac`), no lugar de `apikey`
  no header. Feito em `whatsapp-agent/app/main.py`; no Node exige `verify` no `express.json()`.
- ⬜ **Responder ao webhook na hora e processar mídia em segundo plano** (hoje o Node só responde
  200 depois de tudo, por causa do bug de 12/08/2026 em serverless; na VPS/Docker isso não se aplica).
- ⬜ **Pilar "saber passar a vez"** (paciente pede "falar com uma pessoa" → handoff pro nutri com
  pausa do bot). O curso deixa pro "Curso 2"; já existe "pausar bot" no ChatIA do CRM, falta o gatilho.
- ⬜ **Régua de teste do agente** (tabela da Aula 10): ritmo, formato, tom, memória, conhecimento,
  áudio/foto/PDF — rodar com histórico limpo e número de teste antes de ligar pacientes reais.
- 💬 **Prompts úteis do curso a considerar no `systemPrompt` do Nutrivvo Bot** (texto para adaptar,
  não copiar): *"Se o cliente perguntar algo que não tá lá, não inventa: diz que vai confirmar com a
  equipe e retorna."* · *"Nunca confirma um horário por conta própria."* · *"Se perguntarem se é
  robô, diz a verdade."* · *"Tu não confirma pagamento. Se mandar comprovante, agradece e avisa que a
  equipe confere."* · *"Às vezes a mensagem chega marcada como áudio, imagem ou documento. Responde
  naturalmente, como quem ouviu, viu ou leu. Nunca fala em transcrição, descrição ou marcação."* ·
  *"Usa no máximo um emoji por conversa."* · *"Uma pergunta por vez."*
- ✅ **[FEITO 21/11/2026, código] Adaptador WAHA no Node (milestone 1).** `lib/whatsapp.js` e
  `api/whatsapp-webhook.js` falam com o WAHA, com webhook assinado por HMAC-SHA512 no corpo bruto
  (`server/index.js` guarda `req.rawBody`), lookup do paciente pelos dois formatos de JID, mídia
  restrita a `/api/files/` com timeout e limite de 15 MB, e só remetentes `@c.us`/`@s.whatsapp.net`.
  116 → 128 testes, `security-reviewer` e `code-reviewer` sem CRITICAL/HIGH. **Falta validar com o WAHA
  de verdade** (Docker + QR do número novo) — ver item de infra abaixo.
- ✅ **[FEITO 21/11/2026] Buffer por contato + fila (parte do milestone 2) e busca determinística.**
  Achado no 1º teste real: mensagens picadas ("2 copos de 00 ml" + "100") eram respondidas
  separadas e fora de ordem, e o modelo registrou 400 ml em vez de 200. `lib/whatsappBuffer.js` junta
  o que o contato escreve (`WHATSAPP_BUFFER_MS`, padrão 5000) e processa um lote por vez; o webhook
  responde 200 na hora. Também: o mesmo número ligado a 2 pacientes (legado `@s.whatsapp.net` +
  novo `@c.us`) fazia o `in`+`limit(1)` escolher um ao acaso — agora o `@c.us` vence sempre. Suporte
  a remetente `@lid` (telefone alternativo do payload, ou API de LIDs do WAHA).
  Falta do milestone 2: visto + "digitando" + espera proporcional + mensagens curtas.
- 💡 **[Feedback real do usuário, 21/11/2026 — para pensarmos] Lembrete de hidratação e meta
  diária personalizada.** Captura: `docs/feedback/2026-11-21-whatsapp-lembrete-agua.png`. No teste
  com o WAHA o paciente perguntou "quantos ml tenho que tomar por dia?" e o bot respondeu o genérico
  "2 a 3 litros" (o sistema tem peso/objetivo do paciente e não usou); depois "consegue me avisar a
  cada 2 horas?" e o bot respondeu "Infelizmente, não consigo" + dicas genéricas (garrafinha, alarme).
  O que isso mostra: (1) **há demanda real por lembrete proativo**; (2) a Secretária afirma o que
  não consegue fazer sem saber o que o sistema faz (já existe `cron-reminders` pra consultas);
  (3) a meta diária deveria vir do paciente (ex.: peso × 35 ml, ou meta definida pelo nutri) e o bot já
  sabe o total do dia ("700 ml até agora"), então daria pra dizer "faltam X ml".
  **Tensão a decidir:** lembrete é mensagem **proativa**, exatamente o que o canal WhatsApp não
  oficial evita de propósito (3 números queimados). Caminhos: (a) lembretes só por Telegram/push do
  PWA e WhatsApp só reativo; (b) **WhatsApp Cloud API oficial** (templates aprovados, pode iniciar
  conversa, custo por conversa) só para lembretes, mantendo o WAHA para a conversa; (c) WAHA proativo
  com limites duros (opt-in explícito, poucos por dia, janela de horário, só quem pediu) — risco
  aceito conscientemente; (d) lembrete "puxado" pelo paciente (ao registrar água, o bot sugere o
  próximo horário, sem enviar nada sozinho). Também: tool `definir_lembrete` com preferência no doc do
  paciente, e a resposta de "não consigo" deve apontar a alternativa real em vez de dicas soltas.
- ✅ **[FEITO 21/11/2026, código] Hidratação: meta personalizada (Telegram + WhatsApp) e lembrete
  (só Telegram).** PRD/plano: `.claude/prds|plans/hidratacao-lembrete-meta.*`. `lib/water.js`:
  meta = `waterGoalMl` (nutri) › peso × 35 ml (arred. 50, 1500–4500) › 2000 ml; o contexto do dia
  informa "X de Y ml, faltam Z" e proíbe o "2 a 3 litros" genérico; `log_water` devolve total e o que
  falta; chave de data em fuso de São Paulo. Tool `definir_lembrete_agua` **só no Telegram** (no
  WhatsApp nem é oferecida; o contexto explica o Telegram) + envio no `cron-reminders` (de hora em hora,
  antes do filtro de dieta, para quando a meta é batida, trava `lastWaterReminderKey`). 187 testes;
  `code-reviewer` APPROVE e `security-reviewer` sem CRITICAL/HIGH. **Falta QA real no Telegram.**
  Limitações aceitas / próximos passos: (a) o lembrete depende de o cron rodar em cada hora cheia —
  uma execução pulada perde aquela hora, sem reenvio; (b) o laço do cron é sequencial e lê todos os
  pacientes (`patients.get()`): com muitos pacientes filtrar por `waterReminder.enabled` e enviar em
  lotes tratando 429 do Telegram; (c) não há teste automatizado de `api/cron-reminders.js` (ordem antes
  do `continue`, falha por paciente, trava só após envio ok); (d) tela no CRM para o nutri editar
  `waterGoalMl` (hoje o campo é só lido); (e) `waterGoalMl`/peso × 35 não considera gestante, atleta ou
  restrição renal — definir regra com o nutri.
- ✅ **[FEITO 21/11/2026, código] Bom dia do Telegram (8h).** PRD/plano: `.claude/prds|plans/bom-dia-telegram.*`.
  `lib/morning.js`: frase motivadora (7 variações fixas, sem IA), pergunta do sono (a resposta vira
  `log_sleep`), meta de água do dia e ofensiva; 1x/dia (`lastMorningGreetingKey`), só Telegram, ligado
  por padrão com opt-out pelo bot (`definir_bom_dia`, grava `morningGreeting`); o lembrete de água da
  mesma hora é pulado. 206 testes; `code-reviewer` sem CRITICAL/HIGH. **Falta QA real no Telegram.**
  Em aberto: (a) teste automatizado do handler do cron (envio falho não grava a trava, `greetedNow`,
  paciente sem dieta); (b) horário por paciente (8h fixo; turnos noturnos); (c) status `undefined`/
  `pendente` também recebem (só `inativo` é bloqueado) — confirmar se é o desejado; (d) rotação de
  frases dá um salto na virada de mês (cosmético); (e) revisar o tom dos textos com o nutricionista.
- 💡 **Landing: e-mail de contato público.** O rodapé de `/` mostra `thiago.vinigo@gmail.com` (pedido do
  dono, 21/11/2026). Risco: spam por robôs que varrem páginas. Trocar por um endereço do domínio
  (ex.: contato@nutrivvo.com.br) ou por um formulário de contato quando houver volume.
- 🟡 **[21/11/2026] Plano de deploy do WhatsApp (WAHA) na VPS:** `.claude/plans/deploy-waha-vps.plan.md`.
  Achado: em produção o app **não tem botão "Conectar WhatsApp"** (`Profile.jsx:175-284` só diz "ainda não
  está disponível") e o `.env` da VPS não tem `EVOLUTION_*`/`WAHA_*` (WhatsApp já está desligado lá).
  Etapas: decisões (chip dedicado) › WAHA no compose da VPS sem porta pública + pareamento por túnel SSH ›
  código de uso único no lugar do `/start <patientId>` + botão no app (`VITE_WHATSAPP_BOT_NUMBER`) › ritmo
  humano (visto/digitando) e rampa de aquecimento › desligar a Evolution após 7 dias estáveis.
- ✅ **[FEITO 21/11/2026] Correção de dados do teste:** a água de 21/11 do paciente real (400 ml, gravada
  por engano pelo teste do buffer) voltou a 200 ml e o XP foi de 436 para 416. Streak/última atividade
  não foram tocados (valor anterior desconhecido).
- ✅ **[21/11/2026] Higiene do repositório público:** os testes de `@lid` usavam o telefone e o LID reais
  do teste ao vivo; foram trocados por valores fictícios **antes do push** (histórico local reescrito).
  Regra daqui pra frente: nada de telefone, LID, IDs de paciente ou e-mail reais em testes/docs.
- ⬜ **Água ambígua no `log_water`**: o prompt manda "1 copo ≈ 200 ml" e o modelo registra sem
  perguntar quando o valor vem truncado ("de 00 mls"). Pedir confirmação quando o ml informado
  for incompleto/ambíguo. Mexe no prompt compartilhado com o Telegram — validar nos dois canais.
- ⬜ **Dedupe de webhook por `payload.id`** (achado do security-reviewer, MEDIUM): um webhook assinado
  reenviado (ou retry do WAHA) repete resposta da IA, +10 de XP e custo de Whisper. Gravar um doc
  `processedWhatsappMessages/{id}` com `create()` (falha se já existe) e TTL.
- ⬜ **Suporte a `@lid`**: hoje remetente `...@lid` é ignorado com `console.warn`. Se aparecer no teste
  real, mapear pro telefone (`GET /api/{session}/lids/{lid}`) antes do lookup.
- ✅ **[FEITO 21/11/2026, código] WhatsApp: vínculo do paciente por código de uso único** (etapa C do
  `.claude/plans/deploy-waha-vps.plan.md`). O `/start <patientId>` **deixou de vincular**; só vale
  `/start <código>` (128 bits, 10 min, apagado ao resgatar, resgate em transação — núcleo único com o do
  nutri em `lib/nutriLinkServer.js`). Botão "Conectar no WhatsApp" no Perfil (`Profile.jsx`) **atrás do
  interruptor `VITE_WHATSAPP_BOT_NUMBER`, vazio por padrão** (= "Em breve"; também é o rollback).
  223 testes; `security-reviewer` sem CRITICAL. Restos (MEDIUM/LOW): código não resgatado fica no doc,
  expirado, legível pelo paciente/nutri e no export LGPD (limpar ao abrir o Perfil); o código passa pelo
  histórico do chat/WAHA nos 10 min de vida (não logar o `/start`); o resgate não impede trocar um número
  já vinculado (aceitável: o código nasce no app autenticado); rate limit por `chatId` seria só defesa extra.
- ✅ **[FEITO 21/11/2026] Receita cortada no meio da frase** (captura do usuário no WhatsApp: "…Cozinhar a
  Batata-Doce: Descasque e corte"). Causa: `max_tokens` de **600** na geração da receita e **500** na resposta
  final (`lib/secretariaVirtual.js`); o texto cortado ainda era **salvo no app** como a receita do paciente.
  Agora `lib/aiReply.js`: orçamento de 1500 tokens nas chamadas; se mesmo assim bater o limite
  (`finish_reason: 'length'`) a resposta é fechada na última linha/frase completa com o aviso "me peça
  'continua'"; receita cortada não é mais gravada em `aiRecipes`/`aiRecipeHistory`. 232 testes. Afeta
  Telegram e WhatsApp. **Falta:** receitas já salvas truncadas no Firestore (auditar `aiRecipeHistory`).
- 💡 **Formato das respostas longas no WhatsApp:** a mesma captura mostra `---`, `*2. Título*` e listas
  numeradas com `*negrito*` dentro, e a receita vem num bloco só. Resolver junto do milestone 2 (mensagens
  curtas, no máximo 3, sem markdown solto) e decidir o padrão de formatação (`*negrito*` nativo × sem asterisco).
- ✅ **[FEITO 21/11/2026, código] Telegram: vínculo do paciente por código de uso único** (era o HIGH
  pré-existente do `/start <patientId>`). `api/telegram-webhook.js` só vincula com `/start <código>` e só em
  conversa privada (num grupo o chat do grupo receberia os dados); o formato antigo responde "antigo ou
  inválido" sem tocar no banco; o Perfil (`Profile.jsx`) trocou o link fixo com o id por um botão que gera o
  código. Pacientes **já vinculados** não são afetados (lookup por `telegram_chat_id` inalterado). 8 testes
  novos do webhook do Telegram (que não tinha nenhum). `security-reviewer`: sem CRITICAL/HIGH.
  **⚠ Deploy:** webhook e app precisam subir juntos (mesma imagem); links antigos já abertos passam a pedir um novo.
- ✅ **[FEITO 21/11/2026] "Um chat = um paciente"** (MEDIUM da revisão; já tinha ocorrido no 1º teste do
  WhatsApp, número ligado a 2 pacientes): o resgate do código desvincula, na mesma transação, qualquer outro
  paciente com o mesmo `whatsapp_chat_id` (nas duas formas de JID) ou `telegram_chat_id`. 246 testes.
  **Atenção ao testar:** vincular o seu número a um paciente de teste **tira o vínculo do paciente real**.
- 🟡 **Infra do número novo:** subir o WAHA (Docker), ler o QR com o número novo, conversar de forma
  normal por alguns dias antes de colocar paciente real, sem envio proativo/em massa. Na VPS, WAHA
  não deve ficar exposto (só loopback/rede interna) e a memória da VPS compartilhada precisa de
  checagem (engine WEBJS usa Chromium; NOWEB/GOWS são mais leves).

### 📊 Inteligência de Cohorts e Risco

- ✅ **[FEITO 12/09/2026] H1 — Radar de Abandono unificado + Varredura diária → nutricionista.**
  Ver `.claude/prds/radar-abandono-unificado.prd.md` / `.claude/plans/radar-abandono-unificado.plan.md`.
  Os 3 sinais concorrentes (`computedPatients` streak/xp, `alertar_nutricionista` `status: 'Em
  Risco'`, ChatBot web `behavioral_risk`) viraram inputs de um único score puro
  (`lib/riskScore.js`, `computeRiskScore` — adesão/recência/hidratação/sono + boost de sinal
  reativo, cortes baixo/médio/alto). Novo cron diário (`api/cron-risk-scan.js`, 08h BRT via
  `.github/workflows/cron-risk-scan.yml`, 8ª Serverless Function) grava `riskScore/riskLevel/
  riskFactors` em `patients/{id}` e notifica o nutricionista — in-app (sino novo na sidebar do CRM,
  `users/{nutriId}.notifications`) **e** Telegram/WhatsApp (novo vínculo `/start nutri:<uid>` nos
  dois webhooks, aba Perfil do CRM) — na transição pra "alto" ou a cada 3 dias se continuar "alto".
  **Decisão do usuário:** score automático + `riskOverride` manual (nutri sempre pode corrigir,
  tem prioridade sobre o cálculo). `computedPatients` (`AppContext.jsx`) perdeu a derivação de
  `'em_risco'` — vira ciclo de vida puro (ativo/engajado/inativo), risco agora é ortogonal. Bugfix
  de passagem: `markNotificationsRead` (paciente) nunca persistia a leitura no Firestore.
  Verificado: `node test-risk-score.mjs` (18 asserts), `npm run build`, `api/` em 8/12. Ponta-a-
  ponta real (cron produção → Telegram/WhatsApp) só verificável pós-deploy, como todo cron do
  projeto. *(Fecha também "Alertas automatizados" e "Detetive Comportamental agendado" abaixo.)*
- ⬜ **Patient 360 Dashboard** — painel único no prontuário: food log visual + peso + plano + anotações.
  Peças existem espalhadas (`BiomarkersChart`, `foodLogs`, `recipes`), falta a consolidação.
- ⬜ **Resumo diário pro paciente (fim do dia).** Hoje só existe o semanal (`cron-weekly-summary.js`,
  segundas). Falta um recap de fim de dia via Telegram: "hoje bateu 4/5 refeições, 1,8L de água, faltou
  registrar o jantar 🌙". Reaproveita a lógica do `cron-weekly-summary.js` com janela "hoje"; novo
  horário no cron (ex: 20h/21h) ou cron próprio.

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
- ✅ **[FEITO — 18/11/2026] Migração Vercel → VPS (Locaweb).** A Vercel passou a responder
  `402 DEPLOYMENT_DISABLED` (site fora do ar) e o app foi movido pra VPS `191.252.191.189`
  (Ubuntu 24.04, 2 vCPU / 3,8 GB, **compartilhada** com Buscarmas, Mercagym, Quepromo, Sopromoboa e
  a stack Evolution). Como: `server/index.js` (Express monta `api/*.js` em `/api/<nome>` e serve
  `dist/`), `Dockerfile`, `docker-compose.yml` com container `nutrivvo-app` (limite 320 MB) na rede
  `evolution-stack_web` e labels `traefik.*` — **o Traefik do stack Evolution já ocupa 80/443 e emite
  o HTTPS (Let's Encrypt)**, por isso não há Caddy. Código em `/root/nutri` (clone do `main`, `.env`
  fora do git). Deploy/atualização: `cd /root/nutri && git pull && docker compose up -d --build`.
  Cutover: DNS no **Registro.br** (zona própria, `d/f.sec.dns.br`) — `@` e `www` → `191.252.191.189`;
  `CRON_SECRET` novo no GitHub Actions (cron manual validado, HTTP 2xx); webhook do Telegram segue
  em `https://nutrivvo.com.br/api/telegram-webhook`, **fixado no IP da VPS** via `ip_address` do
  `setWebhook` (sem o pino o Telegram insistia no IP antigo da Vercel). **Lições:**
  (1) variáveis `Sensitive` da Vercel não são legíveis por API — `FIREBASE_SERVICE_ACCOUNT` exigiu
  chave nova no Firebase Console; (2) `lib/secretariaVirtual.js` lê `../src/data/taco.json` em
  runtime, então a imagem precisa copiar esse arquivo; (3) o painel do Registro.br expira a sessão
  em poucos minutos e só aceita preenchimento por campos reais (remover + "Nova entrada") — marcar
  remoções e salvar numa sessão curta, e conferir a zona antes de salvar; (4) `ADMIN_UID` não existia
  na Vercel, então o painel admin segue **desativado em produção**. O limite de 12 Serverless
  Functions (incidente de 31/08) deixou de existir. **Pendente:** pausar o projeto na Vercel,
  acompanhar memória da VPS compartilhada, e se o IP da VPS mudar refazer o `setWebhook` do Telegram.
- 🟡 **[20/11/2026] WAHA (WhatsApp HTTP API) como substituta da Evolution — decidido testar com
  número novo** (a Evolution já queimou 3 números; em 17/11/2026 a avaliação tinha sido "não adotar
  por ora"). Ver "🤖 Agente WhatsApp: paridade com o Telegram + melhorias do curso" abaixo. A
  ressalva de risco continua valendo. Docs: `waha.devlike.pro`. Core é gratuita/open source (Plus foi incorporada à Core a
  partir da 2026.6.1), engines WEBJS/WPP/GOWS/NOWEB/VENOM. Mas é **canal não oficial**, e a própria
  doc avisa que não garante contra bloqueio — mesma classe de risco que já queimou o número em
  12/08/2026 (Evolution/Baileys). Se WhatsApp voltar a ser prioridade, comparar com a **Cloud API
  oficial da Meta** antes. Esforço de integração se mesmo assim for WAHA: `POST /api/sendText`
  (`X-Api-Key`, `chatId` `...@c.us`; p/ alguns números BR usar o chatId retornado pela API "check
  number exists"); webhook `event: "message"` com `payload.from/body/fromMe`, autenticado por HMAC
  SHA-512 sobre o **corpo bruto** (`X-Webhook-Hmac`) — exige `verify` no `express.json()` e
  adaptador novo em `api/whatsapp-webhook.js` / `lib/whatsapp.js` (hoje formato Evolution/`apikey`).

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
Telegram virou canal principal (Bot API oficial, gratuita, sem templates pré-aprovados, sem risco de
ban arbitrário) — mas, diferente do que este documento registrava antes, **não ficou como único
canal**: ver reintrodução do WhatsApp abaixo (04/09/2026).

**WhatsApp reintroduzido como 2º canal (04/09/2026):** `api/whatsapp-webhook.js` + `lib/whatsapp.js`
espelham o fluxo do Telegram (`/start <patientId>` pra vincular, texto/foto/áudio, lista numerada em
texto no lugar de botão nativo). `secretariaVirtual.js` ganhou parâmetro `channel` opcional pra ajustar
formatação (WhatsApp não renderiza HTML como o Telegram). Diferença chave em relação ao episódio de
12/08: usa a mesma instância self-hosted da Evolution API já operada pelo nutricionista, não o fluxo
que levou ao bloqueio — mas é o **mesmo tipo de canal não-oficial**, então o risco de restrição por
antiabuso da Meta continua existindo em tese; não há mitigação nova além do maior cuidado no volume de
envio. Zero mudança líquida no budget de Serverless Functions (removeu `send-telegram.js`/
`sendTelegram.js`, órfãos desde a remoção do ChatIA, ao adicionar o webhook — `api/` seguiu em 7/12).
Bug de produção corrigido em seguida (`784f913`, 04/09): o webhook autenticava contra `req.body.apikey`
(minúsculo) — a Evolution só expõe esse campo com uma flag específica ligada, e mesmo assim seria o
token da instância, não a Global API Key. Fix: autenticação por header `apikey` customizado, comparado
contra a mesma `EVOLUTION_API_KEY` já usada nas chamadas REST de saída.

**Secretária Virtual no Telegram (ago/2026):** webhook robusto (texto, foto, áudio via Whisper, botões
inline, `/start` de vínculo, gamificação), 15 tools em `secretariaVirtual.js` (log de refeição/água/sono/
peso/suplemento/treino, alertar nutricionista, gerar receita, verificar disponibilidade / agendar /
cancelar consulta, múltipla escolha, sugerir substituição com gramas da TACO), pausar bot pra
atendimento humano (`ChatIA.jsx`), 2 crons via GitHub Actions (lembrete + resumo semanal), resumo do
dia/exame/progresso injetado como contexto efêmero.

**Edição de plano fora da consulta + raciocínio clínico da IA (11/09/2026, `8926d5a`):** aba
Cardápios (`PatientList.jsx`) ganhou o CRUD que já existia em Treino — editar plano a qualquer
momento, não só durante a consulta: adicionar/editar/excluir suplementos e vitaminas por
prescrição, adicionar refeição nova com nome editável. `generateDietFromAI` e
`generateSupplementsFromAI` (`DashboardNutri.jsx`) agora pedem um campo de raciocínio clínico
separado da receita voltada ao paciente (`whyChosen` por refeição, `reason` por suplemento),
exibido read-only ao nutricionista em `MealBuilder.jsx`/`ConsultationFlow.jsx`/`PatientList.jsx`
mesmo depois da consulta encerrada.

**Medida caseira ao lado da grama (11/09/2026, `b38a913`):** `src/data/householdMeasures.json`
(mapa de conversão por alimento da TACO) + `src/utils/householdMeasure.js` (formata "≈ 1½ xícara
de chá", com fallback gracioso pra alimentos sem mapeamento). Aplicado em `MealBuilder.jsx`
(builder do nutricionista), `DietPlan.jsx` (tela + impressão/PDF do paciente) e lista de compras.
*Mapa baseado em referências padrão de medida caseira — vale revisão de uma nutricionista antes de
considerar 100% preciso.*

**Disclaimer e consentimento no treino sugerido por IA (11/09/2026, `ece00ae`):** prescrição de
exercício é escopo de Educador Físico (CREF), não de Nutricionista (CRN). App do paciente exige
checkbox de ciência antes da 1ª exibição da ficha de treino (`workoutDisclaimerAcceptedAt` no
perfil, pedido só uma vez); faixa de aviso permanente fica visível no topo depois do aceite.

**Fix: histórico de planos alimentares não era mais apagado a cada consulta (12/09/2026,
`89afb59`):** `finishConsultation` gravava `updatePayload.recipes = [novoPlano]`, sobrescrevendo o
array inteiro e apagando prescrições de consultas anteriores — mesmo o app do paciente já tratando
`recipes[]` como histórico ordenado (`recipes.slice(-1)[0]` como dieta vigente). Corrigido para
`push` preservando o histórico. Como consequência, a aba Cardápios agora mostra/edita só a última
prescrição (a vigente), com nota indicando quantos planos anteriores ficam disponíveis em somente
leitura no Histórico de Consultas; a substituição de ingrediente (🔄) ali também voltou a funcionar
para consultas antigas (antes só funcionava pra última, já que o overwrite apagava as demais).

**Segurança (auditoria 11/08/2026):** `api/openai-bridge.js` exige Firebase ID token (era proxy grátis
de GPT-4o), `cron-reminders.js` / `cron-weekly-summary.js` exigem `Bearer $CRON_SECRET` (falha fechado
se a env var faltar), validação Zod no payload da bridge, `firestore.rules` blinda escrita direta de
`phone_verified` pelo client.

---

## 📌 Decisão validada — não mexer

- CRM (sóbrio/profissional) e app do paciente (gamificado/colorido) usarem linguagens visuais
  propositalmente diferentes — mesmo padrão de Noom (paciente) vs. Practice Better (profissional).
  Públicos diferentes justificam identidades diferentes.
