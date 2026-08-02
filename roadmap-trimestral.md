# Roadmap: Nutrivvo V2 — Trimestral (Agosto - Outubro 2026)

## Visão geral

**Meta desse período:** Garantir go-live impecável da fundação V1, validar a hipótese de retenção com o novo Módulo WhatsApp (Nascent → Developing PMF) e automatizar o faturamento e onboarding self-service (Stripe).
**Team:** Product & Eng (Antigravity) + Stakeholder/UX
**Timeline:** Agosto - Outubro 2026 (12 Semanas)

---

## Timeline Visual

```text
       Ago      Set      Out
       ──────────────────────────────
P1 🔨 ━━━━━━                           (Fundação V1 & Go-Live)
P2 🔨       ━━━━━━━━━━                 (Agente Ativo WhatsApp)
P3 🔨             ━━━━━━━━             (Monetização Stripe)
P4 🔨                   ━━━━━ (Opt)    (Super-Admin & Biomarcadores)
       ──────────────────────────────
```

---

## Phase 1: Foundation & Go-Live V1 — Agosto (Semanas 1-3)

### O que entra
- Resolução dos Bloqueios de Infra (`firestore.rules` e Firebase Auth/Vercel).
- Correção técnica do Timeout da IA Vercel (geração de dieta de 7 dias) via background job/otimização de `max_tokens`.
- Instrumentação Analítica AARRR e Eventos Customizados.
- Teste E2E (upload IA de Exames e Fluxo Ponta a Ponta).

### Por quê essa phase?
A base atual (V1) está visualmente madura (Rebranding feito) e sem bugs críticos, mas ainda impossibilitada de ter tráfego seguro até a correção da infraestrutura. A estabilização aqui é essencial para permitir rodar o framework de PMF com usuários reais e dados confiáveis.

### Timeline
- **Semana 1-2**: Configurações Firestore, deploy CLI, resolução de Timeouts.
- **Semana 3**: Rollout seguro de usuários iniciais e verificação Analytics/Eventos.

### Go-live: Fim de Agosto

### Success criteria
- ✅ Zero incidentes de 503 (Firestore) ou 504 (Vercel) em produção.
- ✅ Base capturando métricas de Cohort de primeira semana sem ruídos.

### Dependencies
- Depende exclusivamente do input manual para Firebase CLI.

---

## Phase 2: Agente Ativo (WhatsApp & IA) — Setembro (Semanas 4-7)

### O que entra
- Integração Provedor WhatsApp API (Meta Official vs Evolution/Baileys).
- Lembretes proativos e leitura OCR de check-in (Foto de Refeição) direto via WhatsApp.
- Botão/ux Secretária Virtual Básica (Confirmar/Reagendar consulta via Zap).
- Configuração de Frequência de Lembretes no PWA para evitar SPAM.

### Por quê essa phase?
Esse é o coração da estratégia V2 e da North Star Metric (Check-ins validados por semana). Transformamos o sistema de um banco de dados inerte num Agente Ativo que puxa a retenção e a adesão.

### Timeline
- **Semanas 4-5**: Specs de Webhooks do WhatsApp + Pretotyping com grupo de 10 pacientes de teste (validação de viabilidade).
- **Semanas 6-7**: Integração de templates anti-spam, setup `gpt-4o-mini` vision (`detail: "low"`) e lançamento.

### Go-live: Fim de Setembro

### Success criteria
- ✅ Hipótese validada: check-ins médios diários aumentam para >3x.
- ✅ Retenção Cohort de 4ª semana cresce de <35% para >50%.

### Risks
- Políticas de bloqueio da Meta (mitigação via templates e opt-in).
- Custo absurdo da IA (mitigado forçando qualidade visual "low" via payload).

---

## Phase 3: Monetização B2B & Growth Self-Service — Out-Nov (Semanas 8-10)

### O que entra
- Painel de Assinatura B2B (3 Tiers: Starter, Pro, Clinic) + Integração Stripe.
- Onboarding Self-Service para Pacientes com Paywall no app.
- Bloqueio de features por Tier (Ex: IA WhatsApp no Pro+).
- CRM Financeiro do Nutricionista (Catálogo Honorários, Prontuário Financeiro).

### Por quê essa phase?
Após confirmar retenção com IA proativa (Phase 2), o custo operacional da API sobe, exigindo monetizar os nutricionistas para suportar a infra (modelo Viability) e escalar (Self-Service).

### Timeline
- **Semana 8**: Stripe Checkouts, Webhooks, e Roles no Firestore.
- **Semanas 9-10**: Desenvolvimento do painel financeiro interno, Paywall de funcionalidades.

### Go-live: Final de Outubro

### Success criteria
- ✅ Checkout finalizado com sucesso no Stripe, limitadores de tenant 100% ativos e seguros.
- ✅ NRR (Net Revenue Retention) ativado, cobrindo com margem os gastos em IA OpenAI.

---

## Phase 4: Observabilidade & Biomarcadores (Opcional) — Nov (Semanas 11-12)

### O que entra
- Dashboard God Mode (Super-Admin).
- Tracking evolutivo de Exames (cruzar resultados com peso).
- Controle remoto global de modelos de IA e Tokens (Tokenomics).

### Por quê essa phase?
Estabilidade em escala. Essa fase assegura que não navegaremos às cegas quando dezenas de clínicas estiverem online, e fecha a cereja do bolo dos "Biomarcadores" prometidos no roadmap de grandes iniciativas.

### Dependencies
- Opcional. Começa após Phase 3, desde que Phase 2 e 3 não atrasem (caso contrário, priorizar Phase 2 e 3).

---

## Success Criteria (Fim do Trimestre)
- [ ] Bloqueios técnicos removidos e usuários reais no sistema.
- [ ] V2 (Agente WhatsApp) ativada e puxando retenção a níveis bem acima da média de mercado (50%+ na 4ª semana).
- [ ] Receita B2B ativa pagando a operação da IA via Stripe.
- [ ] PMF Status passando de "Nascent" para "Developing", suportado por números do Sean Ellis Test.
