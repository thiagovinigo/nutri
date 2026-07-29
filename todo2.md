> ⚠️ **APOSENTADO em 28/07/2026** — este arquivo não é mais a referência ativa. Use `backlog.md` (backlog unificado, seção "V2 — Grandes iniciativas"). Conteúdo relevante já foi consolidado lá; mantido aqui só como histórico bruto.

# Nutrivvo - Todo & Workflow da Versão 2.0 (V2)
**Status:** Em Planejamento / Execução da V2  
**Base Estável Preservada:** Branch `backup-stable-v1` (tag v1.0.0 estável em produção no Vercel)  
**Estratégia Mestre Referenciada:** `v2_product_strategy.md` (Execução de todas as 27 skills do ecossistema)

---

## 🧭 O Workflow de Produto da V2 (Baseado no ecossistema `.agents/skills`)
A Versão 2.0 do Nutrivvo evolui o CRM e Gamificação iniciais para o patamar de **"Agente Ativo de Saúde"**. Para garantir o máximo de rigor técnico e de produto, todas as novas features passarão pelo seguinte ciclo sequencial de habilidades (*skills*):

### Fase 1: Visão e Estratégia (`strategy` → `north-star` → `okr` → `persona` → `ideal-customer-profile`)
- Alinhar a estratégia global da V2 focado no engajamento diário e redução do churn de consultório.
- **North Star Metric (NSM):** `Total de Refeições Check-in (por Foto ou WhatsApp) validadas por semana`.
- OKRs trimestrais conectando valor clínico para o Nutricionista e retenção gamificada para o Paciente (Elevar retenção em 60 dias de 35% para 70%).

### Fase 2: Descoberta e Priorização (`discovery` → `customer-journey` → `opportunity-tree` → `prioritize` → `pricing`)
- Mapeamento contínuo dos pontos de fricção na Jornada de 7 Estágios (com o superpoder de alerta de Cohorts).
- Construção da *Opportunity Solution Tree (OST)* conectando as dores de consultório a soluções automatizadas.
- Priorização do backlog de engenharia usando **RICE Scoring** (Reach, Impact, Confidence, Effort).
- Estruturação de Tiers de Monetização e Willingness-to-Pay (3 Tiers: Starter R$ 97, Pro R$ 197, Clinic R$ 397).

### Fase 3: Especificação e Design (`prd` → `hypothesis` → `experiment-design` → `user-stories` → `acceptance-criteria` → `pre-mortem`)
- Escrita de PRDs enxutos para módulos de IA e WhatsApp antes de escrever código.
- Especificação de critérios de aceite estruturados em Gherkin (**Given/When/Then**) cobrindo happy paths e edge cases.
- Análise de riscos técnicos e de negócio (*Pre-mortem* em 4 categorias: Value, Usability, Feasibility, Viability).

### Fase 4: Execução, Lançamento e Medição (`roadmap` → `launch-checklist` → `release-notes` → `gtm` → `ab-test-analysis` → `measure-pmf`)
- Sprints iterativas sob o **Quality Gate inegociável** (`npm run build` + teste local obrigatório antes de qualquer `git push`).
- Estratégias de Go-to-Market B2B virais e análise contínua de adesão.

---

## 📋 Backlog Priorizado - Nutrivvo V2.0 (Incrementado com `v2_product_strategy.md`)

### 🛡️ Módulo 0: Infraestrutura, Segurança e Qualidade (Fundação V2)
- [ ] **Segurança de API Keys (OpenAI Bridge):** Finalizar migração e blindagem completa de todas as chamadas de IA (chat do paciente, análise de foto e síntese clínica) exclusivamente para o backend/proxy serverless, eliminando qualquer exposição no client-side.
- [ ] **Regras de Segurança Firestore & Storage:** Revisar e endurecer as regras de acesso por tenant/paciente em produção, garantindo isolamento total de dados médicos e laudos.
- [ ] **Auditoria de Build e Performance:** Otimizar bundle de minificação no Vite (code-splitting e dynamic imports para bibliotecas pesadas como `pdfjs-dist` e `recharts`).
- [ ] **Suite de Testes E2E e Integração (Gherkin):** Estruturar testes automatizados para validar cenários críticos de pontuação de XP, atualização de streak e regras anti-duplicidade no Firestore.

### 💬 Módulo 1: Agente Ativo de Saúde via WhatsApp (Zero-Friction AI)
- [ ] **PRD & Arquitetura de Integração:** Avaliar e estruturar o provider de WhatsApp (Meta Official API vs Evolution API / Baileys na Vercel / Cloud).
- [ ] **Lembretes Proativos de Refeição:** Cron jobs em background que verificam os horários prescritos na dieta e enviam lembretes ("Estão servindo o café da manhã! Já bateu sua meta de água hoje?").
- [ ] **Check-in Zero-Friction via Foto no WhatsApp:** Permitir que o paciente envie a foto do prato diretamente na conversa do WhatsApp; a IA Vision avalia, dá a nota de adesão e credita o XP no app em tempo real, sem necessidade de abrir o aplicativo.
- [ ] **Configuração de Frequência de Lembretes (Mitigação Pre-Mortem - Value):** Criar painel no PWA onde o paciente escolhe a cadência dos alertas no WhatsApp (3x ao dia, 1x, apenas resumo semanal ou pausar temporariamente), prevenindo bloqueio do número.
- [ ] **Resposta Assíncrona Imediata (Mitigação Pre-Mortem - Usability):** Implementar no webhook de recebimento de imagem um feedback instantâneo no chat ("Recebemos sua foto! 📸 Analisando prato...") enquanto a OpenAI Vision processa em background.
- [ ] **Templates de Utilidade Clínica (Mitigação Pre-Mortem - Feasibility):** Estruturar mensagens proativas utilizando estritamente *Utility Templates* aprovados pela Meta/Evolution para blindagem anti-spam.
- [ ] **Otimização de Custo Vision API (Mitigação Pre-Mortem - Viability):** Configurar no backend a chamada do modelo `gpt-4o-mini` com parâmetro `detail: "low"`, garantindo custo inferior a US$ 0.001 por foto avaliada.
- [ ] **Confirmação e Lembretes de Agenda:** Bot interativo para confirmar presença na véspera de consultas e agendamentos no CRM.
- [ ] **Detetive Comportamental (Background Worker):** Algoritmo que analisa logs alimentares, sono ruim e água insuficiente para alertar o nutricionista no CRM sobre: *Compulsão Noturna, Flutuações Hormonais (TPM), Burnout, Desidratação e Risco de Abandono (Churn)*.

### 🔬 Módulo 2: Biomarcadores e Laudos Médicos (Inteligência Clínica)
- [x] **Upload e Leitura de Exames Médicos (PDF/Imagens):** Funcionalidade para o paciente ou nutri fazer upload de exames de sangue e bioimpedância na aba "Exames & Biomarcadores (IA)".
- [x] **Extração OCR e Análise por IA:** IA lê o PDF, extrai indicadores-chave e gera Laudo Inteligente comparando com histórico anterior no CRM.
- [ ] **Gráficos de Evolução de Biomarcadores:** Painel interativo no CRM mostrando a curva histórica dos exames cruzada com a evolução de peso e dieta do paciente.

### 🚀 Módulo 3: Crescimento, Monetização e Self-Service (PLG & GTM)
- [ ] **Onboarding Self-Service de Pacientes:** Fluxo onde um paciente cria conta sem convite, acessa um diretório/marketplace de especialistas Nutrivvo, agenda consulta e solicita vínculo à clínica.
- [ ] **Painel de Upgrade & Assinaturas SaaS (3 Tiers):** Implementar interface de gestão de plano integrada ao Stripe/Webhooks:
  - *Starter (R$ 97/mês):* Até 15 pacientes (CRM + PWA básico).
  - *Pro (R$ 197/mês):* Até 50 pacientes (WhatsApp Proativo + IA Vision + Alertas de Cohort ilimitados).
  - *Clinic (R$ 397/mês):* Pacientes ilimitados + OCR de Exames + Multi-profissionais.
- [ ] **Bloqueio de Features Premium no CRM:** Restringir o acesso a funcionalidades avançadas de IA proativa conforme a tier ativa da assinatura.
- [ ] **Programa de Indicação B2B (GTM Viral):** Tela no CRM onde o Nutricionista ganha benefícios reais ao indicar colegas ("Convide 2 colegas e ganhe 3 meses de IA Vision Gratuita").
- [ ] **Calibração de Longo Prazo da Gamificação:** Ajustar curva de XP e patentes para pacientes com mais de 6 meses de acompanhamento, mantendo o engajamento contínuo.

### 👑 Módulo 4: Super-Admin Dashboard & Observabilidade de IA (Backoffice)
- [ ] **Painel de Saúde do Sistema (Health & Observability):** Interface exclusiva para administradores globais (`role === 'superadmin'`) visualizarem em tempo real o status dos endpoints serverless (`/api/openai-bridge`), filas do WhatsApp e erros de webhooks.
- [ ] **Gestão e Recargas de IA (Tokenomics):**
  - Tracking detalhado do consumo de tokens (Prompt, Completion e Vision) por Nutricionista e por modelo (`gpt-4o-mini`, `gpt-4o`).
  - Sistema de controle de cotas, bloqueio por saldo e "Recarga de Créditos de IA" avulsa para clínicas que excedem o limite do plano.
- [ ] **Seletor Dinâmico de Modelos de IA:** Botão no painel Admin para chavear globalmente o modelo de IA ou editar system prompts de forma dinâmica sem necessidade de novo deploy.
- [ ] **Gestão Global de Tenants (CRM Backoffice):** Lista completa de Nutricionistas cadastrados, status de assinatura no Stripe, volume de pacientes vinculados e botão de "Acesso Suporte / Impersonate" para depurar chamados dos clientes.

### 💰 Módulo 5: Gestão Financeira & Planos do Consultório (CRM Financeiro do Nutri)
- [x] **Catálogo de Serviços e Planos:** Tela de configuração onde o Nutricionista cadastra os preços de suas consultas avulsas, retornos e pacotes de acompanhamento na aba "Financeiro & Planos".
- [x] **Controle de Honorários por Paciente:** Associação de plano contratado, data de vencimento e status do pagamento (Pago 🟢, Pendente 🟡, Atrasado 🔴) com botão de cobrança no WhatsApp.
- [x] **Alerta Preditivo de Renovação de Contrato:** Card de inteligência preditiva cruzando término do plano com o engajamento no Cohort ("Alta Adesão / Apto para Upgrade").
- [x] **Dashboard de Faturamento Mensal:** Cards visuais de Faturamento Esperado, Recebimento Confirmado, A Receber e Ticket Médio por Paciente.

---

> ⚠️ **LEMBRETE INEGOCIÁVEL PARA OS AGENTES (AGENTS.md):**  
> 1. Antes de qualquer commit ou deploy no Vercel durante a V2, rode `npm run build` e **SEMPRE convide o usuário para testar e validar localmente no navegador (`npm run dev`)**. Proibido `git push` direto para a `main`.
> 2. **Relatório Completo de Impacto:** Antes de ir para produção (`git push`), **SEMPRE liste detalhadamente o que mudou no app, quais componentes receberam funcionalidades novas e quais áreas foram impactadas**. Transparência total e zero surpresas em produção!
