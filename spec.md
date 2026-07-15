# spec.md — Correções e Redesign Vytal

Deriva da auditoria de UX/UI/mercado feita em 14/07/2026. Este documento lista o que será corrigido nesta rodada, o porquê, e o que fica para depois.

## 0. Achado raiz (novo, mais importante que tudo na auditoria anterior)

Diagnóstico inicial estava errado e foi corrigido durante a implementação: o Firebase **está** configurado neste ambiente (`.env` tem um projeto real, `nutribase-fea35` — minha primeira checagem usou um `grep` que cortava os valores das chaves e pareceu tudo vazio).

O bug real: `src/context/AppContext.jsx` fazia `await addDoc(...)` (ou `updateDoc`/`deleteDoc`) **antes** de atualizar o estado local (`setPatients`/`setAppointments`). O canal de escrita em tempo real do Firestore (WebChannel) está retornando erro 503 neste ambiente/sandbox — então esse `await` demora ou nunca resolve de forma perceptível, e a tela nunca reflete a ação. Isso, combinado com os `catch(e) {}` vazios (que escondiam qualquer erro), fazia criar paciente, editar paciente, agendar consulta e prescrever dieta parecerem não fazer nada.

**Correção:** todas as mutações (`addPatient`, `updatePatient`, `deletePatient`, `addRecipe`, `addWeight`, `addAppointment`, `cancelAppointment`, `markAppointmentDone`) agora atualizam o estado local **primeiro, de forma síncrona e otimista**, e só depois tentam sincronizar com o Firestore em segundo plano — sem bloquear a UI. Se a sincronização falhar, o estado local já está correto e a falha vira um aviso no console, nunca um no-op silencioso.

## 1. Bug de agendamento

`DashboardNutri.jsx` chama `addAppointment(parseInt(apptPatientId), ...)`. IDs de paciente são strings (`'mock-1'`, IDs do Firestore) — `parseInt` retorna `NaN`. Além disso `AppContext.jsx` grava `patient_id` (snake_case) mas `PatientList.jsx` procura `patientId` (camelCase).

**Correção:** remover o `parseInt`, padronizar em `patientId` (camelCase) nos dois lados.

## 2. Redesign do CRM do nutricionista (visual "business")

Hoje o CRM usa sidebar branca, paleta genérica azul/slate de tutorial. Direção nova:
- Sidebar escura (`#0B1220`→`#131c2b`), texto claro, item ativo com barra de destaque lateral em vez de fundo azul claro genérico.
- Paleta: tinta quase-preta para texto, um accent único mais autoral (índigo profundo `#3949AB`→ ajustado), superfícies brancas com sombra mais sutil e consistente (menos "card flutuante", mais "linha editorial").
- Badges de status como pill com ponto colorido (● Alto engajamento) em vez de só fundo colorido.
- Tabelas com números tabulares e hover discreto.
- Isso é só CSS/tokens (`src/index.css`) + pequenos ajustes estruturais em `PatientList.jsx` (sidebar) — não muda nenhuma lógica.

## 3. Badges/copys enganosos

- "Secured by Stripe" no card de assinatura — não existe integração Stripe. Remover o selo; o botão "Assinar Premium" passa a deixar claro que é uma prévia ("Em breve — checkout ainda não conectado").
- Botão "Enviar Alerta" (Cohorts) afirma "Mensagem enviada via WhatsApp" — não envia nada de verdade. Copy corrigida para não afirmar um canal que não existe ("Alerta registrado para follow-up manual").

## 4. App do paciente — bugs de navegação/acessibilidade

- `BottomNav.jsx`: os 4 ícones (Início, Plano, Vytal Bot, Perfil) não têm `aria-label` nem texto — adicionar as duas coisas.
- `App.jsx` (`FeedbackButton`): fixo no canto inferior direito, cobre o ícone "Perfil" da bottom nav em `/paciente`. Corrigido subindo o botão acima da nav só nessa rota.

## 5. Erros de IA sem feedback visível

- `QuestBoard.jsx` (análise de foto de refeição): erro da IA vira só `alert()`. Trocado por um estado de erro inline no card, com opção de tentar de novo.
- `ChatBot`/`PatientApp.jsx`: já tem fallback de mensagem de erro no histórico — mantido, só confirmado no teste manual.
- Fora de escopo desta rodada: `DashboardNutri.jsx` (análise de exame, geração de dieta, síntese clínica) ainda usa `alert()` para erro — funciona, mas fica pra próxima rodada de polish.

## 6. Limpeza de código morto

Apagar (confirmado sem uso em nenhum import): `src/context/AppContext_USER.jsx`, `src/features/nutricionista/pages/DashboardNutri_USER.jsx`, `src/features/paciente/pages/PatientApp_USER.jsx`, `src/components/layout/BottomNav_USER.jsx`, `src/features/paciente/components/PhotoLogger.jsx`.

`LearnPath.jsx`/`Quiz.jsx` ficam — não é dead code por acidente, é uma feature engavetada; decisão de reativar ou não fica pro usuário, fora desta rodada.

## 7. `todo.md`

Desmarcar itens que não correspondem à realidade: Stripe/Billing, Inteligência de Cohorts preditiva real, Instrumentação AARRR (PostHog/GA), remoção da chave OpenAI do frontend, Multitenancy completo (isolamento de dados). Adicionar nota de contexto.

## Fora de escopo nesta rodada (decisão consciente, não esquecimento)

- Mover a chave da OpenAI do lado paciente para o proxy server-side (`api/openai-bridge.js`) — mudança de arquitetura maior, precisa de decisão sobre custo/latência antes de mexer.
- Guard de rota real (`/nutri`, `/paciente` sem sessão) e isolamento de dados por paciente no Firestore — depende de regras de segurança no backend, não só código do client.
- Reset visual do app do paciente (paleta gamificada Duolingo-style) — mantido como está; o problema ali era bug, não estilo.

## Plano de teste

Rodar `npm run dev`, e no navegador:
1. CRM: criar paciente novo → aparece na lista. Criar agendamento → aparece na Agenda de Hoje. Iniciar consulta a partir do agendamento.
2. CRM: conferir visual novo (sidebar escura, badges, tabela).
3. Paciente: login mock, navegar pelas 4 abas confirmando que a aba Perfil não fica mais coberta pelo botão de feedback e que os ícones têm rótulo acessível.
4. Paciente: tirar uma "foto" de refeição sem chave de IA configurada e confirmar que aparece erro inline, não silêncio.
