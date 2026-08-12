# Backlog — Nutrivvo

> **Backlog unificado (28/07/2026).** Este é o único documento de backlog do projeto — `todo.md`, `todo2.md` e `backlog-user-stories.md` foram aposentados nesta data (conteúdo relevante consolidado aqui; os arquivos continuam no repo só como histórico bruto, não use como referência ativa).
> Consolidado a partir desses 3 arquivos, das sessões de rebranding/correções de 27-28/07/2026, do benchmark competitivo (`market-scout`), do cruzamento de documentos (`doc-innovator`) e do discovery de produto de 28/07/2026.

---

## 🎯 Próximas Missões (ordem de prioridade pro lançamento)

1. ~~**[BLOQUEIA LANÇAMENTO] Vercel não está fazendo deploy automático do `main`**~~ — Resolvido em 31/07/2026 removendo os `crons` do `vercel.json` (o plano Hobby da Vercel bloqueava o deploy por causa disso).
2. ~~Publicar `firestore.rules` de verdade~~ — feito em 29/07/2026, você publicou manualmente via Firebase Console (Firestore Database → Rules). Isso já destravou o cadastro por convite (`?vincular=ID`), que estava retornando "Missing or insufficient permissions" antes disso.
3. ~~**[BLOQUEIA LANÇAMENTO] Autorizar domínio no Firebase Auth**~~ — `nutrivvo.com.br` e `www.nutrivvo.com.br` em Authentication → Authorized domains. Sem isso o login quebra no domínio novo.
4. ~~**Testar manualmente o upload de exame por IA** (`Consulta → 3. Exames (IA OpenAI)`)~~ — não deu pra automatizar via navegador nesta sessão (limitação da ferramenta), é a única funcionalidade de IA que ficou sem teste ponta-a-ponta. Suba uma foto/PDF de exame real e confirme se a análise volta certa.
5. ~~Investigar timeout de geração de dieta de 7 dias~~ — corrigido em 29/07/2026: `generateDietFromAI` gera um dia por chamada em vez de todos de uma vez (era a causa raiz do erro "A IA demorou demais para responder", reportado como urgente). Testado localmente contra a API real: ~26s por dia isolado, bem dentro de qualquer timeout. Timeouts client-side (130s) e server-side (110s, `maxDuration: 120` na função) também foram adicionados como rede de segurança, pra nunca mais travar "Analisando..." sem erro visível.
6. ~~Reproduzir a falha silenciosa de geração de dieta~~ — endereçado (não 100% "reproduzido e explicado", mas mitigado na raiz): retry automático com validação de `foods[]` preenchido (até 3 tentativas) já existia; a geração dia-a-dia (item 5) reduz ainda mais a chance de acontecer, já que cada chamada pede muito menos da IA de uma vez.
7. ~~**Cores hardcoded fora do roxo da marca**~~ — corrigido (botões, IA e calendários atualizados para `var(--primary-color)`).
8. **Mudar lógica financeira (MRR vs Agenda)** — Usuário relatou que o cálculo atual da "Receita Prevista" por MRR (Planos fixos) não reflete a realidade do consultório, que ainda opera no modelo de Consulta paga + Retorno gratuito. Precisamos mudar o cálculo para ler os Agendamentos do mês e aplicar regras de valor (Primeira Consulta = X, Retorno = 0) em vez de somar o valor de planos.

---

## ✅ Feito — Atualizações Recentes (31/07/2026 a 01/08/2026)

**Infraestrutura & Deploy**
- Remoção de crons do `vercel.json` para destravar deploy automático na Vercel (plano Hobby).
- Bump de versão (1.2.2) para invalidar cache do PWA e forçar atualização.
- Correção/ajuste nos ícones do PWA.

**Autenticação & Acesso**
- Forçado idioma `pt-BR` no Firebase Auth (e-mails de validação/reset agora em português).
- Implementado fluxo de "Esqueci a Senha" na tela de login.
- Migração automática de consultas no login se o paciente já tiver agendamentos associados ao e-mail.

**Clínico & UX**
- Integração do Agente IA (ChatBot) e melhorias gerais de UX (toasts de feedback).
- Autocomplete no cadastro/seleção de paciente.
- Ajustes de UI na Agenda (visibilidade da grid, cores no light mode).
- Padronização de variáveis de branding (cores hardcoded azuis removidas).
- Integração de inteligência de Cohort no perfil do paciente, com nova ação de resgate (recuperação) via WhatsApp.

---

## ✅ Feito — Atualizações Recentes (02/08/2026 a 04/08/2026)

**Growth & Self-Service**
- **Degustação IA (PLG):** Implementado o Onboarding Self-Service. Pacientes sem vínculo (limbo) respondem a um quiz de 3 passos e a IA gera 1 dia de Dieta + Plano de Treinos de amostra.

**Documentação**
- Atualização e sincronização dos arquivos `design.md` e `features.md` para remover falsos débitos e espelhar o status real de produção.

---

## ✅ Feito — Sessão de hoje (27/07/2026)

**Bugs críticos**
- Ícone `Send` faltando no CRM (crash na aba financeira)
- Regra do Firestore que permitia qualquer usuário autenticado deletar convite de paciente de outro nutricionista
- `useEffect` com dependência circular no `AppContext.jsx` causando **tela branca no login** (crash em produção, não pego pelo build — só reproduzido testando o app rodando de verdade)
- Modal de registro de sono não travava o scroll do fundo (parecia bug pro paciente)
- Geração de dieta: botão de treino entrava em "carregando" sozinho (estado compartilhado indevido); gerar novos dias empilhava em vez de substituir o plano
- Mensagens genéricas de erro da IA ("Erro na rede ou na API") substituídas por causa real (helper `callOpenAIBridge`)
- Foto de refeição grande demais quebrava a análise por IA (limite de payload da Vercel) — agora comprime a imagem no navegador antes de enviar
- Ícones do PWA/favicon eram um quadrado sólido sem logo — corrigido gerando a partir do SVG real

**Rebranding Vytal → Nutrivvo**
- Nome trocado em todo o código (UI, prompts de IA, manifest PWA, `package.json`), documentos internos (`prd.md`, `spec.md`, `context.md`, `features.md`, `userstorys.md`, `v2_product_strategy.md`, `todo.md`, `todo2.md`, `design.md`) e agentes
- Domínio `nutrivvo.com.br` registrado; DNS configurado na Vercel (propagação em andamento)
- Logo/logomarca aprovada: N geométrico integrado ao wordmark (`public/logo-full.svg`)
- Cor de marca trocada de verde emerald para roxo/índigo (landing page + variáveis CSS globais do CRM e do app do paciente)
- Landing page expandida de 3 para 8 cards de funcionalidade

**Infraestrutura de projeto**
- 4 agentes criados em `.claude/agents/`: `media-manager`, `brand-naming`, `business-strategist`, `ux-committee`

## ✅ Feito — QA exaustivo e correções (28/07/2026)

- Teste caminho feliz + alternativo de praticamente todas as funcionalidades (login/cadastro, CRUD paciente, fluxo de consulta completo, financeiro/WhatsApp, biblioteca de receitas, cohorts, QuestBoard/check-ins, DietPlan, ChatBot, Perfil)
- 3 resíduos de "VYTAL" (caixa alta) encontrados e corrigidos: recibo WhatsApp, topbar do app paciente, card de milestone
- **Bug:** paciente não tinha campo de telefone no próprio Perfil (só existia no cadastro/CRM) — impedia autocorreção do WhatsApp depois do signup. Corrigido.
- **Bug (reportado por você):** modal de "Registrar Sono" ficava travada/fora do lugar no celular. Causa raiz: a animação CSS do wrapper do QuestBoard (`animate-pop-in`) termina com `transform: scale(1)` fixo, o que vira "containing block" pra qualquer `position: fixed` filho — o modal não ficava realmente preso à tela, ficava preso aos limites daquele wrapper. Corrigido renderizando via `createPortal` direto no `document.body`.
- **Bug (reportado por você):** botão "Nutricionista" no cadastro quebrava linha (emoji em cima, texto embaixo) ao ser selecionado, porque o texto em negrito não cabia na coluna. Corrigido.

## ✅ Feito — Sessão de 29/07/2026 (suplementos, receitas, dashboard, cadastro por convite)

> 24 commits, PR #5 aberto e mergeado em `main`. Detalhe completo nos commits da branch `feature/consulta-receitas-suplementos` (histórico preservado mesmo pós-merge).

**Clínico / Consulta**
- Catálogo de suplementos com sugestão por IA (por refeição), check-in do paciente por suplemento, síntese clínica passa a considerar adesão
- Anexar receita salva à refeição foi implementado e **revertido** por decisão do usuário ("está mais atrapalhando que ajudando") — ver detalhe em "Ferramentas da Consulta" abaixo
- Abas da etapa 4 passaram por 2 reorganizações no mesmo dia: consolidadas em 2 (Dieta+Suplementos / Treino) e depois **voltaram a ser 3** (Refeições / Vitaminas e Suplementos / Treino) porque suplementos ficava "muito lá embaixo" só pro nutricionista — o app do paciente não foi mexido nessa parte
- "Substituir" alimento (equivalente por macro) agora existe também pro nutricionista (`MealBuilder.jsx`), considerando aversões/alergias — e o lado do paciente (`DietPlan.jsx`), que já tinha essa função, ganhou o mesmo filtro de aversões que nunca tinha tido
- Novo agendamento valida dia da semana (`workingDays`) e datas bloqueadas antes de criar — antes deixava marcar em qualquer dia, inclusive dias que o nutricionista não configurou como de atendimento
- Cadastro de novo paciente agora abre direto o perfil em "Meus Pacientes" — antes voltava pra "Início" sem mostrar nada

**App do Paciente**
- Suplementos aparecem como chip junto com os alimentos no card da refeição (antes só apareciam dentro do check-in)
- "Receita da IA" (regenerável) disponível direto no check-in diário, não só no plano completo — extraído pro hook compartilhado `useAiRecipe.js`
- Mecanismo de flip-card (virar o cartão) trocado por expand/collapse inline, mesmo padrão do "Ver modo de preparo" — usuário pediu explicitamente essa consistência

**IA / Performance**
- Geração de cardápio agora é dia-a-dia (uma chamada por dia) em vez de uma chamada gigante pra todos os dias — corrige o erro "A IA demorou demais para responder" reportado como urgente, com feedback de progresso visível ("Gerando dia 3 de 7...")
- Timeout client-side (130s) e server-side (110s + `maxDuration: 120`) na bridge da OpenAI

**Dashboard "Visão Geral"**
- Corrigido bug onde consultas antigas nunca marcadas como concluídas apareciam pra sempre como "Próxima Consulta" (faltava filtro de data, só filtrava por status)
- Novo card "Consultas Realizadas" e "Mais Engajados" (usa dado `topEngagedPatients`/`avgStreak` que já existia calculado no código mas nunca era exibido)
- Linhas das 3 listas (Próximas Consultas, Consultas Realizadas, Atenção Necessária) ficaram clicáveis, levando direto ao perfil do paciente
- Revisão de discovery + PM rodada sobre essa tela (ver seção própria abaixo) — só os itens de baixo risco foram implementados agora, o resto ainda precisa de validação

**Agenda**
- Destaque visual (borda + fundo + badge "HOJE") na coluna do dia atual na visão semanal

**Cadastro por convite (`?vincular=ID`)**
- Corrigido bug de integridade: agendamentos feitos antes do paciente terminar o cadastro ficavam órfãos, porque o ID do paciente mudava (placeholder deletado, novo doc criado sob o UID do Firebase Auth) sem migrar `appointments.patientId`. Precisou de uma regra nova no `firestore.rules` (escopo mínimo — só o próprio paciente, só o campo `patientId`, só de placeholder ainda não reivindicado)
- Causa raiz encontrada de um bug antigo (nunca reportado antes, mas provavelmente sempre presente): a regra que permite ler o placeholder sem estar autenticado (`allow read: if resource.data.status == 'inativo'`) nunca tinha sido publicada de verdade — por isso os campos vinham sempre em branco no cadastro por convite. Resolvido junto com o deploy acima.
- Campos pré-preenchidos (nome, e-mail, CPF, telefone) viram um resumo somente-leitura em vez de formulário editável duplicado, com e-mail/CPF/telefone mascarados parcialmente (pedido do usuário); data de nascimento removida do resumo (continua sendo salva, só não aparece)

---

## 🔧 Precisa de ação sua (pendente de infraestrutura, não de código)

> Item 1 também está em destaque em "Próximas Missões" acima por bloquear o lançamento.

- [x] ~~**Vercel não deployou automaticamente o merge do PR #5 em `main`**~~ — Resolvido (era conflito do cron no `vercel.json` em plano Hobby).
- [x] ~~`firestore.rules` nunca tinha sido publicado de verdade~~ — publicado em 29/07/2026 via Firebase Console (Firestore Database → Rules), pelo usuário.
- [x] ~~Autorizar `nutrivvo.com.br`/`www.nutrivvo.com.br` no Firebase Console (Authentication → Authorized domains)~~
- [x] ~~**Causa raiz encontrada do "domínio não acompanha deploy":**~~ no dashboard da Vercel (Settings → Domains do projeto `nutri`), `nutrivvo.com.br` foi marcado como ambiente **Production**.
- [x] ~~Escolher domínio principal~~ — `nutrivvo.com.br` configurado como canônico, com `www.nutrivvo.com.br` redirecionando para ele (307).

## 🎨 Visual — pendente de polimento

- [x] ~~Cores hardcoded fora do roxo da marca~~ — corrigido em 28/07/2026: `BonusRecipes.jsx` (abas "Da Nutri"/"Minhas Receitas", botão "Salvar Nova Receita Livre") trocado de azul/violeta hardcoded pra `var(--primary-color)`/`var(--primary-shadow)`. O botão "Nova Receita" já usava `.crm-btn-primary` (variável de marca) — item já estava resolvido ali.
- [x] ~~Contraste de cor nunca auditado formalmente (WCAG AA)~~ — auditado em 28/07/2026. Achados reais: texto verde `#10B981` (2.54:1) e âmbar `#F59E0B` (2.15:1) reprovavam AA como cor de texto — criadas variantes `--crm-good-text`/`--crm-warn-text` (mais escuras, ≥4.9:1) pra uso como texto, mantendo as cores originais só pra fundo/ícone/dot. Texto branco sobre `.crm-btn-primary` também reprovava (3.96:1) — botão passou a usar `--crm-primary-hover` como cor de repouso (5.38:1).
- [x] ~~Sidebar do CRM fixa em 260px, sem breakpoint pra tablet/janela estreita~~ — corrigido em 28/07/2026: novo `@media (max-width: 1024px) and (min-width: 769px)` estreita a sidebar pra 200px entre o desktop cheio e o empilhamento mobile (que já existia em 768px).
- [x] ~~Nenhum loading state visível ao trocar de aba no CRM~~ — corrigido em 28/07/2026: novo `isLoadingPatients` no `AppContext.jsx`, mostra "Carregando pacientes…" em vez de "Nenhum paciente encontrado" enquanto o fetch inicial do Firestore não resolve.
- [x] ~~Modais de "Novo Agendamento"/"Novo Paciente" sem validação inline nem foco automático~~ — `autoFocus` adicionado ao primeiro campo dos dois modais em 28/07/2026. Validação já existia via `required` nativo do HTML (confirmado em teste manual nesta sessão).

---

## 🔐 Segurança e confiabilidade (bloqueia produção real)

- [ ] Investigar instabilidade do canal de escrita do Firestore (erro 503 recorrente) — parece ser infra/rede do ambiente, não código
- [ ] Edge case: paciente atendido por mais de um nutricionista na plataforma (modelo hoje assume 1:N restrito)
- [x] ~~Verificação de telefone WhatsApp por código (OTP), com `phone_verified` protegido por firestore.rules contra escrita direta do client~~ — feito em 10/08/2026 (`.claude/prds/verificacao-telefone-whatsapp.prd.md`). **Débito técnico registrado por esse trabalho:** `api/send-whatsapp.js` e `api/cron-reminders.js` continuam sem nenhuma verificação de auth no chamador (diferente dos 2 endpoints novos de verificação, que exigem Firebase ID token) — hoje são só "seguros" porque o frontend não expõe a URL publicamente, não porque o endpoint valida algo. Avaliar aplicar `requireAuthUid` (`api/utils/auth.js`, já existe) neles também.
- [x] ~~Bug: `api/whatsapp-webhook.js`/`whatsapp-ai.js`/`cron-reminders.js` buscavam/liam campos `telefone`/`nome` que não existem em nenhum documento de paciente (o app usa `phone`/`name`) — Secretária Virtual e lembretes nunca funcionavam de fato~~ — corrigido em 10/08/2026, junto com normalização de DDI (telefone salvo sem 55, Evolution API precisa com 55)

## 💰 Monetização

- [ ] Integração real com Stripe (checkout, webhooks de assinatura, bloqueio de features por plano)
- [ ] Limite de pacientes por plano aplicado de verdade (hoje é só texto)
- [ ] **Paciente ver o próprio status de pagamento** (achado `market-scout`, 11/08/2026) — `financialStatus` (pago/pendente/atrasado) já existe no doc do paciente e já é lido/editado em `FinancialCRM.jsx`/`PatientList.jsx`, mas nunca é exposto no app do paciente; `firestore.rules` já permite leitura do próprio doc, não precisa mudar regra. Diferente do item de Stripe acima (que é sobre *processar* pagamento) — isso é só *mostrar* um campo que já existe. Esforço P pra versão simples (status atual); M se quiser virar histórico (`financialHistory: []`, ao estilo Practice Better).

## 💬 Comunicação nutricionista ↔ paciente

> Detalhe de stories consolidado de `backlog-user-stories.md` (aposentado 28/07/2026). Story 1 (telefone no cadastro) já está feita — pré-requisito de tudo abaixo.

| # | Story | Prioridade | Status |
|---|-------|-----------|--------|
| 2 | Publicar `firestore.rules` em produção | P0 | Pendente — só você tem acesso ao Firebase CLI (~1h) |
| 3 | Validar cobrança/recibo por WhatsApp ponta-a-ponta | P0 | Pendente (~2h) — considerar badge "telefone não confirmado" quando `phone === '11999999999'` |
| 4 | Canal de mensagens diretas Nutri ↔ Paciente | P1 | Concluído — `DirectChat.jsx` implementado |
| 5 | Notificações de dieta prescrita / consulta confirmada | P1 | Pendente (~1 dia) — reusar `addNotification`, disparar em `finishConsultation` e na confirmação de agendamento |
| 6 | Lembretes proativos de refeição via WhatsApp | P2 | Concluído — implementado via `cron-reminders.js` |
| 7 | Check-in de refeição por foto no WhatsApp | P2 | Concluído — implementado nativamente no `whatsapp-ai.js` |

**Status (11/08/2026):** `nutrivvo_bot` segue desconectado. O bloqueio de ontem (10/08, restrição de 5h por volume de mensagens de teste) evoluiu — hoje o WhatsApp recusa até o **pareamento de novo aparelho**: QR é escaneado normalmente, mas o app mostra "Não foi possível conectar ao dispositivo, tente novamente mais tarde". Infra confirmada OK (endpoint gera QR e consulta `connectionState` sem problema, instância responde `"connecting"`); o bloqueio é 100% do lado do WhatsApp. Não insistir em tentativas seguidas — cada pareamento recusado pode reforçar o bloqueio. Retomar depois de várias horas (ou no dia seguinte), se possível em rede diferente da usada nos testes de ontem. Se persistir, reforça o gatilho já registrado de migrar pra Meta Cloud API oficial em vez do Evolution API/Baileys (não-oficial, mais vulnerável a esse tipo de bloqueio antiabuso).

**Decisão (11/08/2026):** avaliado migrar agora pra Meta Cloud API oficial (ou BSP como Twilio/Z-API/360dialog) dado que WhatsApp é a funcionalidade principal e já quebrou 2x em 24h — decisão consciente de **continuar no Evolution API** por ora e só esperar o bloqueio passar, em vez de migrar. Reavaliar se acontecer um 3º bloqueio, ou antes de expor essa funcionalidade a pacientes reais em produção.

**Status (12/08/2026) — gatilho de reavaliação atingido, restrição agora permanente:** depois do bloqueio de 11/08, `nutrivvo_bot` foi repareado com sucesso (`state: "open"`) e funcionou por algumas horas (lembrete de cron testado OK, mensagens entregues). Durante um novo teste de verificação de telefone (paciente de teste "Yago"), a instância caiu de novo com `disconnectionReasonCode: 401`, motivo `conflict/device_removed`, e ao tentar reenviar o código a Evolution API retornou `400 "Error: Connection Closed"`. Repareado uma vez mais (`state: "open"` novamente), mas na tentativa seguinte de envio a Evolution API voltou a recusar — e desta vez o usuário confirmou que o WhatsApp **restringiu o número em definitivo** (não é mais bloqueio temporário de horas). Isso é o **3º+ bloqueio** que o gatilho de 11/08 previa. Bug de código relacionado (número sem o 9º dígito) foi confirmado corrigido nesse meio-tempo — não é mais fator.

**Decisão pendente (12/08/2026):** com restrição permanente confirmada, a decisão de "continuar no Evolution API" precisa ser reaberta com o usuário — migrar pra Meta Cloud API oficial (ou BSP), trocar de número, ou avaliar Telegram como canal alternativo (discutido em sessão anterior) antes de tentar reconectar de novo.

**Decisão final e migração (12/08/2026):** escolhido Telegram como substituto do WhatsApp (não canal alternativo opcional - substituição completa por ora). Migração feita:
- Toda a infra de WhatsApp (Evolution API/Baileys) foi **removida do código** (não só desativada) - `api/whatsapp-*.js`, `api/send-whatsapp.js`, `api/admin-whatsapp-qrcode.js`, `api/utils/whatsapp.js`, `src/utils/sendWhatsApp.js`. O código continua no histórico do git (commits até `5bd015e`) se precisar restaurar.
- Motivo de remover em vez de manter dormente: o plano Hobby da Vercel limita 12 Serverless Functions por deployment (cada arquivo em `api/`, incluindo `api/utils/`, conta como uma função) - o deploy da migração falhou (`exceeded_serverless_functions_per_deployment`) até essa limpeza. Ficar carregando canal desativado tem custo real de orçamento de deploy, não só cognitivo.
- Novo canal: `api/telegram-webhook.js` (recebe `/start <patientId>` pra vincular `telegram_chat_id` + mensagens de texto pra Secretária Virtual), `api/send-telegram.js` (envio manual do nutricionista), `api/cron-reminders.js` migrado. Motor de IA compartilhado em `api/utils/secretariaVirtual.js`.
- Verificação de telefone por OTP também foi removida (o vínculo `/start` do Telegram já prova posse da conta, dispensa código de 6 dígitos) - `Profile.jsx` agora tem "Conectar Telegram" em vez de "Verificar via WhatsApp".
- Pendente: confirmar `setWebhook` registrado (endpoint temporário `api/admin-telegram-setup.js`, remover depois de confirmar) e testar o vínculo ponta-a-ponta com um paciente de teste.

- [x] ~~Canal de mensagens diretas (hoje só existe o bot de IA)~~ — Concluído
- [ ] Notificações push/e-mail quando dieta é prescrita ou consulta confirmada — Story 5 acima

## 📊 Analytics e instrumentação

- [ ] Eventos customizados de produto (ativação, retenção, funil de onboarding — AARRR)
- [ ] Pesquisa de PMF (Sean Ellis) — depende de base real de usuários

## 📈 Growth / aquisição

- [ ] Sistema de convite orgânico premiado
- [ ] Programa de indicação B2B pro nutricionista

---

## 🚀 V2 — Grandes iniciativas

### Módulo: Agente Ativo de Saúde via WhatsApp
- [x] ~~PRD e escolha de provider (Meta Official API vs Evolution/Baileys)~~ — Evolution API escolhida e integrada.
- [x] ~~Lembretes proativos de refeição, check-in por foto direto no WhatsApp~~ — Feito via `cron-reminders.js` e `whatsapp-ai.js`.
- [x] ~~Configuração de frequência de lembretes (evitar bloqueio do número)~~ — Tratado no motor do cron.
- [x] ~~Templates de Utilidade Clínica aprovados pela Meta (anti-spam)~~
- [ ] Otimização de custo da Vision API (`detail: "low"`)
- [x] ~~Detetive comportamental: alertas de compulsão noturna, TPM, burnout, desidratação, risco de abandono~~ — Embutido no `systemPrompt` do assistente ativo.

**Sub-módulo: Secretária Virtual (agenda do nutricionista)**
- [x] ~~Confirmação de consulta via WhatsApp: paciente recebe mensagem X horas antes e responde Confirmar/Remarcar/Cancelar (botões de resposta rápida do WhatsApp Business API)~~ — IA treinada para gerir a agenda no WhatsApp.
- [x] ~~Reagendamento automático: se o paciente responder "não posso", a IA oferece os próximos horários livres na agenda do nutricionista sem precisar de intervenção manual~~ — Tool `verificar_disponibilidade` implementada.
- [ ] Integração com Google Calendar do nutricionista: criar evento automaticamente ao confirmar consulta no CRM, checar disponibilidade real antes de sugerir horário, evitar conflito com compromissos pessoais dele
- [ ] Integração com Gmail: enviar convite de calendário (.ics) e/ou lembrete por e-mail pro paciente, como canal alternativo ao WhatsApp
- [x] ~~Gestão de no-show: se paciente não confirma nem responde, marcar risco de falta e avisar o nutricionista~~
- [x] ~~Lista de espera: se um horário for cancelado, oferecer automaticamente pro próximo paciente da fila~~ — Gerido ativamente pela IA e a ferramenta `agendar_consulta`.
- [ ] Decisão técnica pendente: qual API de calendário usar (Google Calendar API exige OAuth por nutricionista — cada um autoriza o acesso à própria conta) e qual o modelo de custo/permissão pra isso

### Módulo: Biomarcadores
- Gráficos de evolução de exames cruzados com peso/dieta (upload + OCR + análise IA já feitos)

### Módulo: Growth/Monetização Self-Service
- Onboarding self-service (paciente cria conta sem convite, escolhe nutricionista)
- [x] ~~**Degustação IA (Self-Service)**: Paciente preenche ficha completa (aversões, rotina, suplementos) e desbloqueia um **cardápio de 1 dia + plano de treino** feito 100% por IA, resolvendo o "limbo" inicial de quem entra sozinho no app~~ (Ideia do Usuário, Entregue em 02/08/2026).
- Painel de assinatura com 3 tiers + Stripe
- Bloqueio de features premium por tier
- Calibração de XP/gamificação pra pacientes de longo prazo (6+ meses)

### Módulo: Super-Admin / Observabilidade
- Painel de saúde do sistema (status de endpoints, filas WhatsApp, erros de webhook)
- Gestão de créditos de IA (tokenomics)
- Seletor dinâmico de modelo de IA / prompts sem redeploy
- Gestão global de tenants (nutricionistas, status Stripe, impersonate pra suporte)

### Módulo 0: Infraestrutura
- Auditoria de bundle (code-splitting pra `pdfjs-dist`/`recharts`, hoje geram chunks de +2MB)
- Suite de testes E2E/integração (XP, streak, regras anti-duplicidade)

---

## 🆕 Gaps de mercado — benchmark competitivo (agente `market-scout`, 28/07/2026)

> Cruzado contra backlog.md, features.md, context.md e o código real (DietPlan.jsx, QuestBoard.jsx, ConsultationFlow.jsx, PatientList.jsx) pra eliminar falsos positivos — "lista de compras" e "diário alimentar livre" foram descartados por já estarem implementados (ver débito de documentação abaixo).

**Clínico**
- [x] ~~Formulário de anamnese estruturado~~ — feito em 28/07/2026: nutricionista configura os campos (texto curto/longo/escolha única) em Configurações e preenche estruturado durante a consulta, substituindo o `<textarea>` livre. PRD e plano em `.claude/prds/anamnese-pre-consulta.prd.md` / `.claude/plans/anamnese-pre-consulta.plan.md`. **Decisão de escopo:** paciente preencher sozinho antes da consulta foi tirado do roadmap (ver item abaixo, que é uma versão mais leve dessa ideia).
- [ ] **Paciente sugere atualização da própria anamnese entre consultas** (Discovery 28/07/2026, H3) — não é o paciente preenchendo o formulário inteiro (isso já foi descartado), é um mini check-in leve ("mudou algo desde a última vez? novo medicamento, nova restrição?") que só *sugere* uma atualização pro nutricionista confirmar na próxima consulta — autoridade clínica continua 100% do nutricionista, mas o dado não fica parado até a próxima visita presencial.
- [ ] **Rastreamento nutricional estruturado (micronutrientes)** — `foodLogs` hoje não tem calorias/macros/micronutrientes estruturados, só estimativa da IA Vision por foto (bom pra engajamento, insuficiente clinicamente pra casos como anemia/hipertensão/deficiência de B12). Construir via proxy serverless pra base TACO (tabela brasileira) ou Open Food Facts, novo `type: 'structured'` em `foodLogs`.
- [ ] **Scanner de código de barras** — depende do item acima (banco nutricional estruturado). `BarcodeDetector` API nativa (PWA Android/Chrome) + fallback `zxing-js` pra iOS, casando EAN com Open Food Facts.

**Retenção / Engajamento**
- [ ] **Fotos de progresso (antes/depois)** — hoje o app não persiste nenhuma imagem (a foto de refeição vai direto pra OpenAI em base64 e é descartada). Seria a primeira integração real com Firebase Storage do projeto. Pode reaproveitar o componente de "Shareable Milestone" como gancho de compartilhamento.

**Monetização**
- [ ] **Cobrança de paciente dentro do app** — diferente do Stripe B2B já no backlog (nutricionista pagando o SaaS). Isso é o nutricionista cobrar o *próprio paciente*: hoje é 100% manual, `PatientList.jsx` só monta uma mensagem de WhatsApp hardcoded, sem histórico de fatura nem status pago/pendente. Avaliar Pix via Mercado Pago/Asaas (taxa menor, mais adequado ao mercado BR) ou Stripe Connect. Esforço grande (compliance de meio de pagamento), mas alto ganho de retenção do nutricionista.

## 💡 Inovações por cruzamento de documentos (agente `doc-innovator`, 28/07/2026)

> Combinações de ideias que já existem separadamente em documentos diferentes do projeto, nunca cruzadas entre si. Foco em baixo esforço porque a infraestrutura de cada lado já existe.

- [ ] **XP por manter exames em dia** — motor de XP e upload/OCR de exame já existem; falta só disparar `addXP` no fluxo de upload (com cooldown por paciente), fechando o ciclo Gamificação × Biomarcadores.
- [ ] **Biomarcadores como 5º sinal do Detetive Comportamental** — sono, água, chat e exame já são captados hoje; falta o algoritmo do Detetive considerar exame laboratorial (ex: cortisol/glicose alto + sono ruim = alerta mais forte) além dos 4 sinais já previstos.
- [ ] **Fila de espera da Secretária Virtual ordenada por score de Cohort** — em vez de FIFO, priorizar reagendamento pelo paciente mais engajado (Cohort verde) quando um horário vaga. Score de risco/engajamento já existe, fila da Secretária Virtual ainda nem foi construída — nasce já certa.
- [ ] **Cobrança preditiva automática via Secretária Virtual** — o alerta preditivo de renovação do Financeiro já existe mas é manual (nutricionista clica "Enviar Cobrança"); cruzar com a Secretária Virtual pra disparo automático quando plano vence em N dias E Cohort = "Alta Adesão".
- [ ] **Link de indicação embutido no Shareable Milestone** — o cartão holográfico de conquista já existe e já é feito pra print/compartilhar; embutir parâmetro de referral na URL/QR em vez de construir uma tela nova de "convidar amigo" do zero pro Programa de Indicação B2B.
- [ ] **Diário alimentar livre liberado antes do vínculo nutri↔paciente** — paciente self-service fica num limbo sem valor até o nutricionista aceitar; o diário alimentar livre já implementado poderia ficar disponível desde o cadastro (mesmo sem `nutricionista_id` confirmado), chegando à 1ª consulta já com dado de anamnese.
- [ ] **Roteamento de alerta comportamental por categoria (nutricional vs. psicológico)** — dos 6 cenários do Detetive Comportamental, TPM e burnout são mais psicológicos que nutricionais. Ao especificar o Detetive, já modelar campo "categoria do alerta" pra não ter que remodelar o schema quando Multi-profissional (hoje só decisão pendente) existir.
- [ ] **Template de recibo WhatsApp estendido pra reembolso** — o botão "Emitir Recibo" via WhatsApp já funciona ponta-a-ponta; estender o template com campos que planos de saúde exigem pra reembolso (CRN, CNPJ se PJ) em vez de tratar "documentação de reembolso" como feature nova do zero.
- [ ] **Padrão local-first como requisito de arquitetura da Secretária Virtual** — a correção do bug raiz do Firestore 503 (atualizar estado local antes/sem bloquear sync) foi documentada como fix pontual, não como princípio a aplicar de saída em módulos que dependem de API externa (Google Calendar, WhatsApp) — aplicar via `AppContext.jsx` desde o design, não descobrir via bug em produção de novo.
- [ ] **Análise de Geladeira por IA (Ideia do Usuário, 01/08/2026)** — O paciente tira uma foto do que tem na geladeira e a IA (GPT-4o Vision) sugere preparações saudáveis e alinhadas ao plano alimentar dele com base nos ingredientes disponíveis.

## 📄 Débito de documentação (achado durante benchmark/síntese, 28/07/2026)

- [x] ~~**`design.md` desatualizado**~~: corrigido, já reflete a cor primária #a855f7 (Purple).
- [x] ~~**`features.md` lista como backlog features que já estão implementadas**~~: corrigido, já lista o Diário Livre e Lista de Compras como concluídos.

---

## 🤔 Decisões de produto pendentes (não são bugs, são escolhas)

- [ ] Destino de `LearnPath.jsx`/`Quiz.jsx` — trilha de aprendizado gamificada já prototipada, nunca conectada às rotas. Reativar (precisa conteúdo real) ou remover.
- [ ] Wearables/CGM (Apple Watch, Google Fit, glicose contínua) — tendência forte 2026, mas investimento grande; validar demanda antes.
- [ ] Telemedicina/consulta em vídeo integrada (concorrentes como Practice Better já têm nativo)
- [ ] Biblioteca de receitas/planos reutilizáveis (hoje cada dieta é gerada do zero por IA)
- [ ] Documentação pra reembolso/nota fiscal (nicho Brasil, concorrentes globais não cobrem)
- [ ] Comunidade/prova social entre pacientes (leaderboard hoje é só dentro da clínica)
- [ ] Multi-profissional (hoje é 1 nutricionista = 1 clínica; clínicas maiores têm equipe)

## 🛠️ Ferramentas da Consulta (etapa 4 - Prescrição)

- [ ] **Repensar "Meus Templates de Dieta"** — removido da consulta em 28/07/2026 (junto com "Salvar como Template") por decisão do usuário: a IA e a biblioteca de receitas são muito mais usadas, e o template ficava esquecido/confuso ali. Reavaliar mais pra frente com uma UX melhor (talvez integrado à Biblioteca de Receitas em vez de isolado na consulta) antes de trazer de volta. `addDietTemplate`/`dietTemplates` continuam existindo no `AppContext.jsx`, só não são mais consumidos por `ConsultationFlow.jsx`.
- [x] ~~Botão "Anexar ao Paciente" (Receitas Salvas) ficava desconectado do que estava sendo montado~~ — corrigido em 28/07/2026, depois **revertido no mesmo dia**: a versão corrigida (seletor "Anexar receita salva" dentro de cada refeição + seção "Receitas Salvas" na aba Ferramentas, criando refeição a partir da receita) foi removida por decisão do usuário — "deixes a receita em backlog ela esta mais atrapalhando que ajudando da forma que esta hoje". Removido de `MealBuilder.jsx` e `ConsultationFlow.jsx` (junto com o mecanismo de drag-and-drop `handleDropToMeal`/`draggedRecipe`, que já estava morto — nunca tinha um `onDragStart` real ligado a ele). **Repensar do zero** antes de reintroduzir: o problema de fundo continua sendo o do PRD original (`.claude/prds/prescricao-receitas-suplementos.prd.md`) — receita anexada não casa com a base TACO, então `foods[]` fica vazio e a refeição parece "sem padrão" mesmo com o texto da receita preenchido.
- [x] ~~4 abas na etapa 4 (Refeições do Cardápio / Vitaminas e Suplementos / Ficha de Treino / Ferramentas e Assistentes)~~ — primeiro consolidadas em 28/07/2026 em 2 abas ("Dieta e Suplementos" + "Ficha de Treino"), depois **revertido parcialmente em 29/07/2026**: suplementos voltou a ser aba própria porque ficava "muito lá embaixo" numa página só de scroll longo pro nutricionista (pro paciente o resultado final já estava perfeito, não foi mexido). Estado final: 3 abas — "Refeições do Cardápio", "Vitaminas e Suplementos", "Ficha de Treino". A antiga aba "Ferramentas e Assistentes" continua absorvida dentro de "Refeições do Cardápio" (gerador de IA + receitas). O botão "Sugerir com IA" de suplementos continua desabilitado até existir ao menos 1 refeição no cardápio.

## 📊 Dashboard "Visão Geral" — discovery + PM (29/07/2026)

> Usuário pediu revisão via agentes `feature-discovery` + `refinement-qa` porque "não vejo muita info relevante". Os dois convergiram no mesmo diagnóstico de fundo: a tela é quase 100% passiva/histórica, e o único sinal que parece "inteligente" (Em Risco) na verdade só ecoa um campo manual (`status`) que o próprio nutricionista seta em outro lugar — o dashboard não descobre nada sozinho.

- [x] ~~Listas não eram clicáveis~~ — feito em 29/07/2026: as 3 listas (Próximas Consultas, Consultas Realizadas, Atenção Necessária) agora levam direto ao perfil do paciente.
- [x] ~~`avgStreak`/`topEngagedPatients` calculados mas nunca exibidos~~ — feito em 29/07/2026: novo card "Mais Engajados" + linha de "Sequência média" no card de Engajamento.
- [ ] **H1 — Substituir "Em Risco" manual por sinal derivado de comportamento real** (streak zerado / dias sem check-in, dado que já existe por paciente) — maior impacto, esforço baixo-médio, mas precisa validar antes: o nutricionista quer perder o controle manual desse campo, ou prefere os dois (manual + sugestão automática)?
- [ ] **H3 — "Receita Prevista" é contratada, não recebida** — não existe hoje nenhum campo de status de pagamento/inadimplência (`paymentStatus`, confirmado 0 ocorrências no código). Maior gap financeiro identificado, mas é feature nova (não só exibição), esforço maior.
- [ ] **H4 — Sinalizar consultas de hoje que precisam de preparo prévio** (paciente sem anamnese completa, sem dieta ativa) antes da consulta acontecer.
- [ ] **H5 — Reconsiderar se "Engajamento Médio" (%) merece o card do topo** — é a métrica mais "vaidosa"/menos acionável das 5 atuais; candidata a sair ou virar link direto pra Cohorts.
- [ ] Pergunta bloqueadora de ambos os agentes, ainda sem resposta: **o que o nutricionista realmente faz nos primeiros 30 segundos ao abrir o sistema de manhã?** Sem isso, qualquer redesenho maior da Visão Geral é palpite.

## 🧹 Qualidade

- [ ] **Zero testes automatizados no projeto** — priorizar: login, criar/editar paciente, agendar consulta, prescrever dieta
- [ ] `DietPlan.jsx` e `QuestBoard.jsx` mostram a mesma dieta de formas inconsistentes (um é lista estática, outro tem estado feito/pendente)
- [ ] **Considerar upgrade pontual `gpt-4o-mini` → `gpt-4o` só na análise de foto de refeição** (`QuestBoard.jsx`, check-in por câmera) — hoje todo o app usa `gpt-4o-mini` (inclusive vision) via `api/openai-bridge.js`. Só vale a troca (custo maior por chamada) se acurácia de porção/quantidade virar reclamação recorrente de paciente; não trocar o resto do app, só as chamadas com `image_url`.

---

## 📌 Decisão já validada (não mexer)

- CRM (sóbrio/profissional) e app do paciente (gamificado/colorido) usarem linguagens visuais propositalmente diferentes — mesmo padrão de Noom (paciente) vs. Practice Better (profissional). Públicos diferentes justificam identidades diferentes.
