# Vytal Nutri - Project Context (Source of Truth)

Este documento é a "fonte da verdade" do estado atual de engenharia e produto do Vytal Nutri. Ele serve como contexto base para execução de skills de PM e tomada de decisões arquiteturais.

## 1. Visão Geral do Produto
O Vytal Nutri é uma plataforma dual-sided focada em resolver o problema de adesão em tratamentos de saúde (Nutrição e Personal Training). 
A plataforma possui duas interfaces distintas que se comunicam em tempo real:
1. **CRM do Profissional (Nutricionista/Personal):** Uma interface Desktop/Web para gerenciar pacientes, criar dietas com ajuda de IA, prescrever treinos e agendar consultas híbridas.
2. **App do Paciente (PWA Mobile):** Um aplicativo gamificado (estilo Duolingo) onde o paciente faz check-ins diários (água, refeições, treinos) para ganhar XP e manter sua ofensiva ("streak").

## 2. Stack Tecnológica Atual
- **Frontend:** React + Vite.
- **Estilização:** CSS Vanilla (`index.css`) focado em um design "Dark Mode Premium" (Glassmorphism, Neon accents, Neo-brutalismo suave).
- **Backend/Database:** Firebase (Firestore para dados em tempo real, Authentication para login).
- **Deploy/Hospedagem:** Configurado para Vercel (`vercel.json`).
- **PWA:** Configurado via `vite-plugin-pwa` para instalação no celular.

## 3. Funcionalidades Core (O que já está em Produção)
### Para o Profissional:
- **Dashboard de Engajamento:** Lista de pacientes com XP e Ofensiva em tempo real.
- **Gestão de Pacientes:** Criação de perfil, histórico e contador de ativos.
- **Editor de Treinos:** Permite criar planilhas de exercícios completas anexadas ao prontuário.
- **Consultas Híbridas:** Suporte para consultas online (com link) e locais.
- **Gerador de Dietas (IA):** Formulário de IA integrado (`api/openai-bridge.js`) para gerar bases de cardápios.
- **Dark Mode Global:** Preferência de tema do usuário (Claro/Escuro) salva via localStorage.

### Para o Paciente:
- **QuestBoard Diário:** Missões para ganhar XP e manter o fogo (Streak).
- **Aba "Meu Plano":** Visualização das dietas e planilhas de treinos prescritas.
- **Acompanhamento (Logging):** Registro de peso com cálculo de bioimpedância.
- **Chatbot (Vytal Bot):** IA do lado do paciente para responder dúvidas sobre o plano prescrito (ainda rodando no client-side).

## 4. Limitações Conhecidas e Débitos Técnicos (Backlog Imediato)
- **Segurança da IA no Paciente:** A chave da OpenAI ainda está exposta no lado do paciente (chamadas diretas do client). Precisa ser migrada para a Edge Function, igual foi feito no lado do Nutricionista.
- **Billing/Monetização:** O modelo é SaaS B2B, mas o Stripe ainda não está conectado com webhooks reais limitando features.
- **Inteligência de Cohorts (Churn):** O sistema visual de risco de abandono (cores na tabela) e botão "Enviar Alerta" já estão mapeados na UI, mas a lógica de Push/WhatsApp real ainda não foi conectada.
- **Telemetria/AARRR:** Firebase Analytics está presente, mas não temos eventos customizados (Ex: 'Patient Activation', 'Diet Generated') mapeados no PostHog ou Amplitude.

## 5. Próximos Passos Estratégicos
O app já transcendeu ser apenas de nutrição e agora engloba "Saúde Integrada" (Dieta + Treino). O próximo passo estratégico é encontrar o Product-Market Fit (PMF) com early adopters (Profissionais premium que querem reter seus clientes) provando que o app de fato aumenta o Life Time Value (LTV) do paciente.
