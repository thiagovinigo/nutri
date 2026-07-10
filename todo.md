# Todo List - Projeto EloNutri

Este arquivo documenta o que já foi finalizado no MVP e os próximos passos para o desenvolvimento do produto.

## ✅ FASE 1: Fundação e Mockup Gamificado (Concluído)
- [x] Inicialização do projeto Vite + React (`nutrilingo`).
- [x] Configuração de CSS Global (Design Duolingo: Botões 3D, cores vibrantes, micro-animações).
- [x] **UI Paciente:** 
  - [x] TopBar com Ofensiva (Streak) e XP (Gemas).
  - [x] Tela de Missões (Cards de Quest com barra de progresso).
  - [x] Mockup do Quiz interativo (Bottom sheets dinâmicos).
- [x] **UI Nutricionista:** 
  - [x] Layout Dashboard com Sidebar.
  - [x] Tabelas e visualizações estáticas.

## ✅ FASE 2: Estado Global e Funcionalidade (Concluído)
- [x] Criar Banco de Dados em memória usando `Context API` (`AppContext.jsx`).
- [x] Sistema de roteamento simples (Toggle entre Nutri e Paciente).
- [x] **Nutricionista (Funcional):**
  - [x] Tabela lendo dados reais do Contexto.
  - [x] Formulário para Cadastrar novos pacientes no estado global.
  - [x] Botão de gerar dieta que salva receitas na ficha do paciente.
- [x] **Paciente (Funcional):**
  - [x] Aba "Meu Plano" lendo as dietas geradas pelo Nutri.
  - [x] Modal e lógica para registrar Peso atual.
  - [x] Missão de "Diário por Foto" atualizando o XP e Ofensiva global.

## ⏳ FASE 3: Integração de Projetos e IA Avançada (Pendente)
- [ ] **Leitor de Exames:** 
  - [ ] Importar (via `git clone` ou `submodule`) o código do projeto `medicina`.
  - [ ] Integrar a leitura real de PDFs na tela do Nutricionista (`DashboardNutri.jsx`).
  - [ ] Enviar o resumo da leitura para o prontuário do Paciente.
- [ ] **Nutri-Bot (Chatbot):**
  - [ ] Criar a interface de Chat na terceira aba do app do paciente.
  - [ ] Integrar chamadas de LLM (com contexto focado na dieta do paciente ativo).

## 🚀 FASE 4: Back-end e Lançamento (Futuro)
- [ ] Substituir o `AppContext` por um banco de dados real (ex: Firebase, Supabase ou PostgreSQL + Node.js).
- [ ] Sistema de Autenticação (Login para Nutri e Login para Paciente).
- [ ] Deploy do Frontend (Vercel/Netlify).
