# Vytal - Todo & Workflow da Versão 2.0 (V2)
**Status:** Em Planejamento / Execução da V2  
**Base Estável Preservada:** Branch `backup-stable-v1` (tag v1.0.0 estável em produção no Vercel)

---

## 🧭 O Workflow de Produto da V2 (Baseado no ecossistema `.agents/skills`)
A Versão 2.0 do Vytal evolui o CRM e Gamificação iniciais para o patamar de **"Agente Ativo de Saúde"**. Para garantir o máximo de rigor técnico e de produto, todas as novas features passarão pelo seguinte ciclo sequencial de habilidades (*skills*):

### Fase 1: Visão e Estratégia (`strategy` → `north-star` → `okr` → `persona` → `ideal-customer-profile`)
- Alinhar a estratégia global da V2 focado no engajamento diário e redução do churn de consultório.
- **North Star Metric (NSM):** `% de pacientes engajados com >3 logs semanais e streak > 14 dias`.
- OKRs trimestrais conectando valor clínico para o Nutricionista e retenção gamificada para o Paciente.

### Fase 2: Descoberta e Priorização (`discovery` → `customer-journey` → `opportunity-tree` → `prioritize` → `pricing`)
- Mapeamento contínuo dos pontos de fricção (por que pacientes esquecem de abrir o app?).
- Construção da *Opportunity Solution Tree (OST)* para conectar o WhatsApp à jornada do paciente.
- Priorização do backlog de engenharia usando **RICE Scoring** (Reach, Impact, Confidence, Effort).
- Estruturação de Tiers de Monetização e Willingness-to-Pay para planos Pro do Nutricionista.

### Fase 3: Especificação e Design (`prd` → `hypothesis` → `experiment-design` → `user-stories` → `acceptance-criteria` → `pre-mortem`)
- Escrita de PRDs enxutos para módulos de IA e WhatsApp antes de escrever código.
- Especificação de critérios de aceite estruturados em Gherkin (**Given/When/Then**) cobrindo happy paths e edge cases.
- Análise de riscos técnicos (*Pre-mortem*): custos de API da OpenAI, limites de rate do WhatsApp, e segurança de dados clínicos.

### Fase 4: Execução, Lançamento e Medição (`roadmap` → `launch-checklist` → `release-notes` → `gtm` → `ab-test-analysis` → `measure-pmf`)
- Sprints iterativas sob o **Quality Gate inegociável** (`npm run build` + teste local obrigatório antes de qualquer `git push`).
- Release notes focadas no benefício clínico e comportamental.

---

## 📋 Backlog Priorizado - Vytal V2.0

### 🛡️ Módulo 0: Infraestrutura, Segurança e Qualidade (Fundação V2)
- [ ] **Segurança de API Keys (OpenAI Bridge):** Finalizar migração e blindagem completa de todas as chamadas de IA (chat do paciente, análise de foto e síntese clínica) exclusivamente para o backend/proxy serverless, eliminando qualquer exposição no client-side.
- [ ] **Regras de Segurança Firestore & Storage:** Revisar e endurecer as regras de acesso por tenant/paciente em produção, garantindo isolamento total de dados médicos e laudos.
- [ ] **Auditoria de Build e Performance:** Otimizar bundle de minificação no Vite (code-splitting e dynamic imports para bibliotecas pesadas como `pdfjs-dist` e `recharts`).

### 💬 Módulo 1: Agente Ativo de Saúde via WhatsApp (Zero-Friction AI)
- [ ] **PRD & Arquitetura de Integração:** Avaliar e estruturar o provider de WhatsApp (Meta Official API vs Evolution API / Baileys na Vercel / Cloud).
- [ ] **Lembretes Proativos de Refeição:** Cron jobs em background que verificam os horários prescritos na dieta e enviam lembretes ("Estão servindo o café da manhã! Já bateu sua meta de água hoje?").
- [ ] **Check-in Zero-Friction via Foto no WhatsApp:** Permitir que o paciente envie a foto do prato diretamente na conversa do WhatsApp; a IA Vision avalia, dá a nota de adesão e credita o XP no app em tempo real, sem necessidade de abrir o aplicativo.
- [ ] **Confirmação e Lembretes de Agenda:** Bot interativo para confirmar presença na véspera de consultas e agendamentos no CRM.
- [ ] **Detetive Comportamental (Background Worker):** Algoritmo que analisa logs alimentares, sono ruim e água insuficiente para alertar o nutricionista no CRM sobre: *Compulsão Noturna, Flutuações Hormonais (TPM), Burnout, Desidratação e Risco de Abandono (Churn)*.

### 🔬 Módulo 2: Biomarcadores e Laudos Médicos (Inteligência Clínica)
- [ ] **Upload e Leitura de Exames Médicos (PDF/Imagens):** Funcionalidade para o paciente ou nutri fazer upload de exames de sangue e bioimpedância.
- [ ] **Extração OCR e Análise por IA:** IA lê o PDF, extrai indicadores-chave (Glicemia, Colesterol, Hemoglobina Glicada, Triglicerídeos, Vitaminas) e salva em banco de dados estruturado.
- [ ] **Gráficos de Evolução de Biomarcadores:** Painel interativo no CRM mostrando a curva histórica dos exames cruzada com a evolução de peso e dieta do paciente.

### 🚀 Módulo 3: Crescimento, Monetização e Self-Service (PLG & GTM)
- [ ] **Onboarding Self-Service de Pacientes:** Fluxo onde um paciente cria conta sem convite, acessa um diretório/marketplace de especialistas Vytal, agenda consulta e solicita vínculo à clínica.
- [ ] **Integração de Pagamentos (Stripe / Assinaturas):** 
  - Estruturação de Tiers para Nutricionistas (Plano Starter vs Plano Pro com IA ilimitada e WhatsApp Ativo).
  - Bloqueio automático de features premium no CRM mediante status da assinatura.
- [ ] **Calibração de Longo Prazo da Gamificação:** Ajustar curva de XP e patentes para pacientes com mais de 6 meses de acompanhamento, mantendo o engajamento contínuo.

---

> ⚠️ **LEMBRETE INEGOCIÁVEL PARA OS AGENTES (AGENTS.md):**  
> Antes de qualquer commit ou deploy no Vercel durante a V2, rode `npm run build` e **SEMPRE convide o usuário para testar e validar localmente no navegador (`npm run dev`)**. Proibido `git push` direto para a `main`.
