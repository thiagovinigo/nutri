# Product Requirements Document (PRD) - Vytal

## 1. Visão Geral do Produto
**Nome:** Vytal  
**Missão:** Ser o sinal vital do acompanhamento integrado de saúde — a ponte entre nutricionistas/personals e pacientes que resolve o problema de adesão ao tratamento através de gamificação e Inteligência Artificial.
**Problema:** Pacientes abandonam planos alimentares e de treinos por falta de acompanhamento diário, e profissionais gastam muito tempo montando protocolos em vez de focar na relação clínica.

## 2. Público-Alvo
- **Nutricionistas Clínicos:** Que desejam escalar seus atendimentos, otimizar a criação de cardápios e monitorar a adesão dos pacientes em tempo real.
- **Pacientes:** Que têm dificuldade em manter o engajamento na dieta, esquecem de beber água, e precisam de uma interface amigável e gamificada para seguir no foco.

## 3. Arquitetura e Escopo do MVP
A plataforma consiste em uma interface dupla (Toggle no frontend para MVP) construída em **React + Vite**:

### 3.1. Visão do Profissional (Desktop Dashboard CRM)
- **Tabela de Engajamento:** Visualização de todos os pacientes ativos, ordenados por "Ofensiva (Streak)". Identificação de pacientes em risco de abandono (cores dinâmicas baseadas em atividade).
- **Leitor de Exames e Dieta (IA):** Formulário que cruza o objetivo do paciente, restrições e laudos para gerar opções de cardápios.
- **Gestão de Treinos:** Editor manual de treinos para prescrição de exercícios integrados à rotina do paciente.
- **Consultas Híbridas:** Agendamento e gestão de consultas Locais ou Online (com geração e envio de links de videoconferência).
- **Gestão de Pacientes:** Criação de perfis, acompanhamento de histórico em prontuário.

### 3.2. Visão do Paciente (Mobile Gamificado estilo Duolingo)
- **Painel de Missões Diárias (Quests):** Tarefas gamificadas como beber água ou fotografar refeições que geram "XP" e mantêm o "Streak".
- **Diário Alimentar por Foto:** Integração de IA (Visão Computacional) para estimar macronutrientes a partir da foto do prato, facilitando o registro sem fricção.
- **Aba "Meu Plano":** 
  - Centralização de Dietas e Treinos prescritos.
  - Histórico de exames com resumos mastigados pela IA.
  - Botão de inserção de peso rápido (Log de medição).
  - Notas do prontuário (Recados do Nutri).
- **Chatbot (Vytal Bot):** *(Escopo Futuro)* Um co-piloto treinado no plano do paciente para tirar dúvidas de substituição de alimentos 24/7.

## 4. Requisitos Não Funcionais
- **Estética "Dark Mode Premium":** O sistema conta com suporte oficial a Dark Mode em todo o CRM e no App do paciente, utilizando um design neo-brutalista premium com detalhes em neon, sombras sólidas e vidro fosco (glassmorphism), reduzindo o estresse cognitivo.
- **Responsividade:** A visão do paciente deve ser estritamente Mobile-First, enquanto a do Nutricionista é focada em Desktop.
- **Estado Global (State Management):** Para o MVP, todo o fluxo de dados (pacientes, dietas, xp) é gerido em memória via `React Context API`.

## 5. Próximos Passos (Integração)
A próxima grande fase técnica envolve a importação do motor de Leitura de Exames do projeto legado (`medicina`) e a construção do Chatbot.
