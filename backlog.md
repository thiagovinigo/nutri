# Backlog — Nutrivvo

> **Backlog unificado (28/07/2026).** Este é o único documento de backlog do projeto — `todo.md`, `todo2.md` e `backlog-user-stories.md` foram aposentados nesta data (conteúdo relevante consolidado aqui; os arquivos continuam no repo só como histórico bruto, não use como referência ativa).
> Consolidado a partir desses 3 arquivos, das sessões de rebranding/correções de 27-28/07/2026, do benchmark competitivo (`market-scout`), do cruzamento de documentos (`doc-innovator`) e do discovery de produto de 28/07/2026.

---

## 🎯 Próximas Missões (ordem de prioridade pro lançamento)

1. **[BLOQUEIA LANÇAMENTO] Publicar `firestore.rules` de verdade** — `firebase deploy --only firestore:rules` no projeto `nutribase-fea35`. As regras de segurança escritas no repo não valem nada até isso rodar. Só você tem acesso ao Firebase CLI pra fazer isso.
2. **[BLOQUEIA LANÇAMENTO] Autorizar domínio no Firebase Auth** — `nutrivvo.com.br` e `www.nutrivvo.com.br` em Authentication → Authorized domains. Sem isso o login quebra no domínio novo.
3. **Testar manualmente o upload de exame por IA** (`Consulta → 3. Exames (IA OpenAI)`) — não deu pra automatizar via navegador nesta sessão (limitação da ferramenta), é a única funcionalidade de IA que ficou sem teste ponta-a-ponta. Suba uma foto/PDF de exame real e confirme se a análise volta certa.
4. **Investigar timeout de geração de dieta de 7 dias** — medido em ~50-60s numa geração real. Funções serverless da Vercel têm limite de execução; se passar, o paciente vê erro sem entender por quê. Precisa reduzir `max_tokens`/trocar modelo ou mover pra job assíncrono.
5. **Reproduzir a falha silenciosa de geração de dieta** — na 1ª tentativa de um teste não apareceu nenhum erro nem gerou refeições; na 2ª tentativa idêntica funcionou. Não foi possível capturar log/rede na hora. Se acontecer de novo, a descrição exata do que foi clicado + prints ajudam a rastrear.
6. **Cores hardcoded fora do roxo da marca** — botão "Nova Receita" (Biblioteca de Receitas) e abas "Da Nutri"/"Minhas Receitas" (app paciente) ainda usam azul, não a variável de marca. Cosmético, baixa prioridade.

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

---

## 🔧 Precisa de ação sua (pendente de infraestrutura, não de código)

> Itens 1 e 2 também estão em destaque em "Próximas Missões" acima por bloquearem o lançamento.

- [ ] `firestore.rules` está no repo mas **nunca foi publicado de verdade** (`firebase deploy --only firestore:rules` no projeto `nutribase-fea35`)
- [ ] Autorizar `nutrivvo.com.br`/`www.nutrivvo.com.br` no Firebase Console (Authentication → Authorized domains)
- [ ] **Causa raiz encontrada do "domínio não acompanha deploy":** no dashboard da Vercel (Settings → Domains do projeto `nutri`), `nutrivvo.com.br` e `www.nutrivvo.com.br` estão marcados como ambiente **Preview**, não **Production** — só domínio de Production segue automaticamente o `vercel --prod`. Não tem comando de CLI pra isso, precisa mudar pelo dashboard (clicar no domínio → trocar ambiente pra Production). Depois disso o `vercel alias set` manual deixa de ser necessário.
- [ ] Escolher domínio principal — recomendação: `nutrivvo.com.br` (apex, sem www) como canônico, com `www.nutrivvo.com.br` redirecionando pra ele (opção de redirect na própria tela de Domains da Vercel). `nutri-umber-kappa.vercel.app` fica só como fallback técnico, não divulgar.

## 🎨 Visual — pendente de polimento

- [ ] Cores hardcoded fora do roxo da marca em pontos pontuais — ver item 6 de "Próximas Missões"
- [ ] Contraste de cor nunca auditado formalmente (WCAG AA) — várias combinações estão na faixa duvidosa
- [ ] Sidebar do CRM fixa em 260px, sem breakpoint pra tablet/janela estreita
- [ ] Nenhum loading state visível ao trocar de aba no CRM (só em "Gerar Síntese"/dieta)
- [ ] Modais de "Novo Agendamento"/"Novo Paciente" sem validação inline nem foco automático

---

## 🔐 Segurança e confiabilidade (bloqueia produção real)

- [ ] Investigar instabilidade do canal de escrita do Firestore (erro 503 recorrente) — parece ser infra/rede do ambiente, não código
- [ ] Edge case: paciente atendido por mais de um nutricionista na plataforma (modelo hoje assume 1:N restrito)

## 💰 Monetização

- [ ] Integração real com Stripe (checkout, webhooks de assinatura, bloqueio de features por plano)
- [ ] Limite de pacientes por plano aplicado de verdade (hoje é só texto)

## 💬 Comunicação nutricionista ↔ paciente

> Detalhe de stories consolidado de `backlog-user-stories.md` (aposentado 28/07/2026). Story 1 (telefone no cadastro) já está feita — pré-requisito de tudo abaixo.

| # | Story | Prioridade | Status |
|---|-------|-----------|--------|
| 2 | Publicar `firestore.rules` em produção | P0 | Pendente — só você tem acesso ao Firebase CLI (~1h) |
| 3 | Validar cobrança/recibo por WhatsApp ponta-a-ponta | P0 | Pendente (~2h) — considerar badge "telefone não confirmado" quando `phone === '11999999999'` |
| 4 | Canal de mensagens diretas Nutri ↔ Paciente | P1 | Pendente (~3-4 dias) — nova coleção `directMessages` (já referenciada vazia em `AppContext.jsx`), depende da Story 2 (regra de segurança dedicada) |
| 5 | Notificações de dieta prescrita / consulta confirmada | P1 | Pendente (~1 dia) — reusar `addNotification`, disparar em `finishConsultation` e na confirmação de agendamento |
| 6 | Lembretes proativos de refeição via WhatsApp | P2 | Bloqueada — decidir provider (Meta Official API vs Evolution/Baileys) antes de estimar |
| 7 | Check-in de refeição por foto no WhatsApp | P2 | Bloqueada — depende da Story 6 (mesma infra de bot) |

- [ ] Canal de mensagens diretas (hoje só existe o bot de IA) — Story 4 acima
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
- PRD e escolha de provider (Meta Official API vs Evolution/Baileys)
- Lembretes proativos de refeição, check-in por foto direto no WhatsApp
- Configuração de frequência de lembretes (evitar bloqueio do número)
- Templates de Utilidade Clínica aprovados pela Meta (anti-spam)
- Otimização de custo da Vision API (`detail: "low"`)
- Detetive comportamental: alertas de compulsão noturna, TPM, burnout, desidratação, risco de abandono

**Sub-módulo: Secretária Virtual (agenda do nutricionista)** — hoje o app não tem nada disso, é gap identificado em 28/07/2026
- Confirmação de consulta via WhatsApp: paciente recebe mensagem X horas antes e responde Confirmar/Remarcar/Cancelar (botões de resposta rápida do WhatsApp Business API)
- Reagendamento automático: se o paciente responder "não posso", a IA oferece os próximos horários livres na agenda do nutricionista sem precisar de intervenção manual
- Integração com Google Calendar do nutricionista: criar evento automaticamente ao confirmar consulta no CRM, checar disponibilidade real antes de sugerir horário, evitar conflito com compromissos pessoais dele
- Integração com Gmail: enviar convite de calendário (.ics) e/ou lembrete por e-mail pro paciente, como canal alternativo ao WhatsApp
- Gestão de no-show: se paciente não confirma nem responde, marcar risco de falta e avisar o nutricionista
- Lista de espera: se um horário for cancelado, oferecer automaticamente pro próximo paciente da fila
- Decisão técnica pendente: qual API de calendário usar (Google Calendar API exige OAuth por nutricionista — cada um autoriza o acesso à própria conta) e qual o modelo de custo/permissão pra isso

### Módulo: Biomarcadores
- Gráficos de evolução de exames cruzados com peso/dieta (upload + OCR + análise IA já feitos)

### Módulo: Growth/Monetização Self-Service
- Onboarding self-service (paciente cria conta sem convite, escolhe nutricionista)
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

## 📄 Débito de documentação (achado durante benchmark/síntese, 28/07/2026)

- [ ] **`design.md` desatualizado**: ainda documenta `--crm-primary: #10B981` (Emerald) como cor oficial do CRM, mas o rebranding de 27/07 já trocou pra roxo/índigo em produção. Qualquer componente novo construído seguindo a "Regra de Ouro" do design.md vai puxar a cor errada por design, não por acidente — mesma causa-raiz do item "Cores hardcoded fora do roxo da marca" já listado acima.
- [ ] **`features.md` lista como backlog features que já estão implementadas**: "lista de compras automática" (`DietPlan.jsx:163`) e "diário alimentar livre por foto" (`QuestBoard.jsx:287`) já existem no código mas ainda aparecem como pendência no doc — rodar `doc-updater` pra sincronizar.

---

## 🤔 Decisões de produto pendentes (não são bugs, são escolhas)

- [ ] Destino de `LearnPath.jsx`/`Quiz.jsx` — trilha de aprendizado gamificada já prototipada, nunca conectada às rotas. Reativar (precisa conteúdo real) ou remover.
- [ ] Wearables/CGM (Apple Watch, Google Fit, glicose contínua) — tendência forte 2026, mas investimento grande; validar demanda antes.
- [ ] Telemedicina/consulta em vídeo integrada (concorrentes como Practice Better já têm nativo)
- [ ] Biblioteca de receitas/planos reutilizáveis (hoje cada dieta é gerada do zero por IA)
- [ ] Documentação pra reembolso/nota fiscal (nicho Brasil, concorrentes globais não cobrem)
- [ ] Comunidade/prova social entre pacientes (leaderboard hoje é só dentro da clínica)
- [ ] Multi-profissional (hoje é 1 nutricionista = 1 clínica; clínicas maiores têm equipe)

## 🛠️ Ferramentas da Consulta (aba "Ferramentas" do card 4 - Prescrição)

- [ ] **Repensar "Meus Templates de Dieta"** — removido da aba Ferramentas em 28/07/2026 (junto com "Salvar como Template") por decisão do usuário: a IA e a biblioteca de receitas são muito mais usadas, e o template ficava esquecido/confuso ali. Reavaliar mais pra frente com uma UX melhor (talvez integrado à Biblioteca de Receitas em vez de isolado na consulta) antes de trazer de volta. `addDietTemplate`/`dietTemplates` continuam existindo no `AppContext.jsx`, só não são mais consumidos por `ConsultationFlow.jsx`.
- [x] ~~Botão "Anexar ao Paciente" (Receitas Salvas) ficava desconectado do que estava sendo montado~~ — corrigido em 28/07/2026: agora adiciona a receita direto como refeição no cardápio (`dietMeals`) sendo montado na consulta, em vez de anexar a uma lista separada (`bonusRecipes`) sem retorno visual na tela.

## 🧹 Qualidade

- [ ] **Zero testes automatizados no projeto** — priorizar: login, criar/editar paciente, agendar consulta, prescrever dieta
- [ ] `DietPlan.jsx` e `QuestBoard.jsx` mostram a mesma dieta de formas inconsistentes (um é lista estática, outro tem estado feito/pendente)

---

## 📌 Decisão já validada (não mexer)

- CRM (sóbrio/profissional) e app do paciente (gamificado/colorido) usarem linguagens visuais propositalmente diferentes — mesmo padrão de Noom (paciente) vs. Practice Better (profissional). Públicos diferentes justificam identidades diferentes.
