# Backlog — Nutrivvo

> Consolidado a partir de `todo.md`, `todo2.md` e da sessão de rebranding/correções de 27/07/2026.
> Fonte de verdade única — os arquivos antigos continuam existindo como histórico detalhado, mas use este pra visão geral.

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

---

## 🔧 Precisa de ação sua (pendente de infraestrutura, não de código)

- [ ] DNS do `nutrivvo.com.br` ainda propagando — confirmar quando resolver
- [ ] Autorizar `nutrivvo.com.br`/`www.nutrivvo.com.br` no Firebase Console (Authentication → Authorized domains) — sem isso, login quebra no domínio novo
- [ ] `firestore.rules` está no repo mas **nunca foi publicado de verdade** (`firebase deploy --only firestore:rules` no projeto `nutribase-fea35`) — as regras de segurança escritas não estão valendo em produção até isso ser feito
- [ ] Escolher domínio principal (`nutrivvo.com.br` vs `www.nutrivvo.com.br`) depois que o DNS validar

## 🎨 Visual — pendente de polimento

- [ ] Alguns botões do CRM/paciente ainda usam azul hardcoded em vez da variável de cor da marca (ex: "Novo Paciente", "Entrar")
- [ ] Ícones do PWA/favicon ainda usam o desenho antigo (chama simples) — aplicar o N aprovado
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

- [ ] Canal de mensagens diretas (hoje só existe o bot de IA)
- [ ] Notificações push/e-mail quando dieta é prescrita ou consulta confirmada

## 📊 Analytics e instrumentação

- [ ] Eventos customizados de produto (ativação, retenção, funil de onboarding — AARRR)
- [ ] Pesquisa de PMF (Sean Ellis) — depende de base real de usuários

## 📈 Growth / aquisição

- [ ] Sistema de convite orgânico premiado
- [ ] Programa de indicação B2B pro nutricionista

---

## 🚀 V2 — Grandes iniciativas (ver `todo2.md` para detalhe completo)

### Módulo: Agente Ativo de Saúde via WhatsApp
- PRD e escolha de provider (Meta Official API vs Evolution/Baileys)
- Lembretes proativos de refeição, check-in por foto direto no WhatsApp
- Configuração de frequência de lembretes (evitar bloqueio do número)
- Templates de Utilidade Clínica aprovados pela Meta (anti-spam)
- Otimização de custo da Vision API (`detail: "low"`)
- Detetive comportamental: alertas de compulsão noturna, TPM, burnout, desidratação, risco de abandono

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

## 🤔 Decisões de produto pendentes (não são bugs, são escolhas)

- [ ] Destino de `LearnPath.jsx`/`Quiz.jsx` — trilha de aprendizado gamificada já prototipada, nunca conectada às rotas. Reativar (precisa conteúdo real) ou remover.
- [ ] Wearables/CGM (Apple Watch, Google Fit, glicose contínua) — tendência forte 2026, mas investimento grande; validar demanda antes.
- [ ] Telemedicina/consulta em vídeo integrada (concorrentes como Practice Better já têm nativo)
- [ ] Biblioteca de receitas/planos reutilizáveis (hoje cada dieta é gerada do zero por IA)
- [ ] Documentação pra reembolso/nota fiscal (nicho Brasil, concorrentes globais não cobrem)
- [ ] Comunidade/prova social entre pacientes (leaderboard hoje é só dentro da clínica)
- [ ] Multi-profissional (hoje é 1 nutricionista = 1 clínica; clínicas maiores têm equipe)

## 🧹 Qualidade

- [ ] **Zero testes automatizados no projeto** — priorizar: login, criar/editar paciente, agendar consulta, prescrever dieta
- [ ] `DietPlan.jsx` e `QuestBoard.jsx` mostram a mesma dieta de formas inconsistentes (um é lista estática, outro tem estado feito/pendente)

---

## 📌 Decisão já validada (não mexer)

- CRM (sóbrio/profissional) e app do paciente (gamificado/colorido) usarem linguagens visuais propositalmente diferentes — mesmo padrão de Noom (paciente) vs. Practice Better (profissional). Públicos diferentes justificam identidades diferentes.
