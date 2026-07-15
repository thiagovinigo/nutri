# Roadmap do Produto — Vytal (Visão de PM)

Este documento traduz os aprendizados das trilhas de Product Management (0→1 e 1→100) em um backlog acionável para o Vytal. Nós já concluímos as Fases de Discovery e o protótipo inicial. Agora, focaremos nas próximas fases dos frameworks de PM.

> **Nota (14/07/2026):** uma auditoria de produto encontrou vários itens abaixo marcados `[x]` que não correspondiam ao estado real do código (existiam só como mock/decorativo). Foram desmarcados e detalhados em `spec.md`. Tratar esta lista como o estado real, não aspiracional.

---

## 🚀 FASE 5: MVP Spec & Build (Finalização)
*Objetivo: Substituir as gambiarras do protótipo (mocks/dados na memória) por uma infraestrutura viável para o mundo real, garantindo que o "walking skeleton" suporte usuários de verdade.*

- [x] **Core UI & Roteamento:** Telas separadas para Paciente e Nutricionista com navegação fluida.
- [x] **IA Nativa (Frontend):** Geração de cardápios, ChatBot (Vytal Bot) e leitor de PDF (pdf.js) integrados no navegador.
- [x] **Banco de Dados Real (Supabase/Firebase):** 
  - Migrar o estado global (`AppContext.jsx`) para tabelas SQL (Usuários, Pacientes, Receitas, Consultas).
- [x] **Autenticação:** 
  - Login seguro (Email/Senha) para que cada paciente veja apenas seus próprios dados.
- [ ] **Segurança de API:**
  - Remover a chave da OpenAI do código Frontend (`VITE_OPENAI_API_KEY`). *(Feito só do lado do nutricionista, via `api/openai-bridge.js`. O lado do paciente — chat e foto de refeição — ainda chama a OpenAI direto do navegador com a chave exposta.)*
  - Criar uma **Edge Function / Serverless Function** para fazer a ponte com a IA com segurança. *(Existe para o nutricionista; falta estender ao paciente.)*

---

## 📈 FASE 6: Launch & Early Traction (Go-to-Market)
*Objetivo: Lançar para early adopters, instrumentar métricas desde o Dia 1 e otimizar para a North Star Metric (ex: % de pacientes engajados na gamificação).*

- [ ] **Instrumentação de AARRR:**
  - Instalar PostHog ou Google Analytics para medir Activation (Pacientes que usam >3 dias seguidos) e Retention. *(Só o Firebase Analytics está inicializado, sem nenhum evento customizado disparado ainda.)*
- [x] **PWA (Progressive Web App):** 
  - Configurar `manifest.json` e Service Worker para permitir que o Paciente instale o Vytal no celular direto pelo navegador.
- [x] **Loop de Feedback:** 
  - Inserir botão de reporte rápido de bugs/sugestões dentro do app.
- [x] **Deploy de Lançamento:** 
  - Publicar Frontend no Vercel/Netlify.
- [x] **Checklist de Launch (Aula 3.15):** Validar integração, suporte, e comunicação de boas-vindas aos primeiros pacientes e nutricionistas.

---

## 🏁 FASE 7: Product-Market Fit
*Objetivo: Confirmar que a retenção achatou na curva e que o LTV > CAC, aplicando a pesquisa Sean Ellis.*

- [ ] **Pesquisa Sean Ellis:** 
  - Disparar survey: *"Como você se sentiria se o Vytal deixasse de existir?"* (Meta: >40% Muito Desapontado).
- [ ] **Growth Features (PLG):** 
  - Sistema de convite orgânico (Indique o Nutri e ganhe uma avaliação grátis).
  - **Self-Service Sign Up:** Permitir que o paciente faça cadastro avulso pelo app e ganhe 1 Consulta Grátis com a IA (Vytal Bot) para testar a experiência.
- [x] **Monitoramento de Retenção:**
  - Dashboards em tempo real do nível de XP e Ofensiva dos pacientes.

---

## 🏢 JORNADA 1→100: Scale & Monetização
*Objetivo: Quando o PMF for alcançado, construir os alicerces financeiros e B2B.*

- [ ] **Sistema de Assinaturas (Billing):**
  - Integração com Stripe para cobrar mensalidades dos Nutricionistas (SaaS). *(Tela de "Assinar Premium" existe, mas sem checkout real conectado.)*
- [~] **Multitenancy (White-Label):**
  - Permitir que Clínicas grandes personalizem as cores do app para seus pacientes. *(Nome/cor da clínica funcionam; falta isolar dados entre clínicas de verdade no backend.)*
- [ ] **Inteligência de Cohorts (Aula de PM):**
  - Algoritmo que prevê quais pacientes estão prestes a abandonar a dieta e alerta o nutricionista no CRM. *(A tela existe e é o ponto forte visual do produto, mas o "risco de abandono" hoje é um campo estático do mock, não uma previsão real; o alerta não é enviado de verdade ainda.)*

---

## 📋 Backlog de Features Pendentes (14/07/2026)

Consolidado a partir da auditoria de produto e do `spec.md`. Ordenado por prioridade dentro de cada bloco — não é uma lista de bugs (esses já foram corrigidos), é o que falta **construir**.

### Segurança e confiabilidade (bloqueia produção real)
- [ ] Mover as chamadas de IA do lado paciente (chat + foto de refeição) para o proxy server-side (`api/openai-bridge.js`), removendo `VITE_OPENAI_API_KEY` do bundle do cliente.
- [ ] Guard de rota real: redirecionar `/nutri` e `/paciente` para `/login` quando não há sessão ativa (hoje dá pra acessar direto pela URL).
- [ ] Regras de segurança no Firestore que isolem dados por paciente/clínica no servidor — hoje o filtro é só visual no cliente.
- [ ] Investigar e resolver a instabilidade do canal de escrita do Firestore (erro 503 recorrente) antes de depender dele em produção.
- [ ] **Edge Case Estrutural:** Tratar o cenário onde um mesmo paciente (mesmo CPF/E-mail) é atendido por mais de um nutricionista na plataforma (atualmente o modelo assume relacionamento 1:N restrito via `nutricionista_id`).

### Monetização
- [ ] Integração real com Stripe (checkout, webhooks de assinatura, bloqueio de features por plano).
- [ ] Lógica de limite de pacientes por plano (hoje "Limite de 5 pacientes" é só texto, não é aplicado).

### Inteligência de Cohorts (o maior diferencial do produto — vale investir aqui primeiro entre as features "grandes")
- [ ] Modelo real de previsão de abandono (hoje é um campo estático `em_risco` no mock), usando streak, adesão e frequência de login.
- [ ] Envio de fato do alerta de risco (WhatsApp Business API, e-mail transacional, ou push notification) — hoje só registra em `alert()`.
- [ ] Visão "Patient 360": um painel único por paciente reunindo plano, food log, check-ins, peso, mensagens e anotações (hoje está espalhado em abas separadas).

### Comunicação nutricionista ↔ paciente
- [ ] Canal de mensagens diretas entre nutricionista e paciente (hoje só existe o Vytal Bot de IA; não há como o profissional mandar uma mensagem real).
- [ ] Notificações push/e-mail para o paciente quando uma nova dieta é prescrita ou uma consulta é confirmada.

### Analytics e instrumentação
- [ ] Eventos customizados de produto (ativação, retenção, funil de onboarding) — hoje só o Firebase Analytics está inicializado, sem nenhum evento disparado.
- [ ] Pesquisa de PMF (Sean Ellis) — depende de ter uma base real de usuários antes de fazer sentido.

### Growth / aquisição
- [ ] Sistema de convite orgânico (indicação premiada).
- [ ] Landing page com proposta de valor real (hoje é só um seletor de botões — ver auditoria de UX).

### Decisões de produto pendentes (não são bugs, são escolhas)
- [ ] Decidir o destino de `LearnPath.jsx`/`Quiz.jsx` — trilha de aprendizado gamificada estilo Duolingo, já prototipada mas nunca conectada às rotas. Reativar (precisa de conteúdo real) ou remover.
- [ ] Decidir se o app do paciente precisa de wearables/CGM (Apple Watch, Google Fit, glicose contínua) — é tendência forte do mercado 2026, mas é investimento grande; não começar sem validar demanda.

### Qualidade
- [ ] Nenhum teste automatizado existe no projeto hoje (unitário, integração ou E2E). Priorizar cobertura pelo menos nos fluxos críticos: login, criar/editar paciente, agendar consulta, prescrever dieta.

---

## 🧭 Comitê de Produto Inovador — Validação de Features (14/07/2026)

Avaliação do que já existe vs. o que um produto de referência em nutrição digital (Nutrium, Practice Better, MealCircle do lado profissional; Noom, MyFitnessPal, HealthifyMe do lado paciente) precisa ter em 2026, cruzado com o combo que só o Vytal tenta fazer hoje: CRM + gamificação + IA num produto só.

### Validado — manter e priorizar
- **Combo CRM + app gamificado + IA clínica.** É o ponto de diferenciação real. Nenhum concorrente pesquisado junta os três; a maioria é ou ferramenta de gestão (Nutrium, Practice Better) ou app de paciente (Noom, MyFitnessPal). Vale proteger esse posicionamento em vez de diluir com features genéricas.
- **Vytal Bot com contexto do plano ativo.** Já responde considerando a dieta prescrita — alinhado com a tendência de "IA + Saúde Clínica" apontada pela pesquisa de mercado, mas ainda sem dados biométricos.
- **Cohorts / risco de abandono no CRM.** Validado como o recurso de maior potencial competitivo — nenhum concorrente pequeno oferece isso hoje pronto; precisa só deixar de ser mock (já listado no backlog acima).
- **Análise de exame em PDF via IA.** Diferencial real frente a concorrentes puramente "app de dieta" — poucos cruzam exame laboratorial com prescrição automaticamente.

### Gaps identificados — features que faltam
- [ ] **Contexto biométrico no Vytal Bot e na geração de dieta:** conectar dados de sono/atividade (Apple Health, Google Fit) para a IA ajustar recomendações — é citado como "linha de base esperada" pelos apps premium de 2026, hoje o Vytal só usa dados manuais (peso via `prompt()`).
- [ ] **Food log fora do plano prescrito:** hoje só existe o "Comeu algo diferente?" com foto avulsa; falta um diário alimentar livre (sem depender de ter uma dieta ativa) para pacientes em fase de diagnóstico/anamnese, antes da primeira prescrição.
- [ ] **Telemedicina/consulta em vídeo integrada:** hoje a "consulta" no CRM é só um formulário preenchido pelo nutricionista; não há chamada de vídeo nem histórico de sessão gravado. Concorrentes de practice management (Practice Better) já oferecem isso nativo.
- [ ] **Biblioteca de receitas/planos reutilizáveis:** hoje cada dieta é gerada do zero por IA a cada consulta; um nutricionista com 50 pacientes precisa reaproveitar templates de cardápio, não recriar tudo toda vez.
- [ ] **Documentação para reembolso/nota fiscal:** contexto Brasil — nutricionistas frequentemente precisam emitir recibo para plano de saúde; não existe nada hoje nessa linha (oportunidade de nicho local que concorrentes globais não cobrem bem).
- [ ] **Comunidade/prova social entre pacientes:** o leaderboard hoje é só dentro da clínica; testar (com cautela, ver comitê de design abaixo) algum elemento de comunidade pode reforçar a camada de gamificação, que é validada como tendência de alto impacto em retenção (+30-40% engajamento).
- [ ] **Multi-profissional:** hoje o produto assume 1 nutricionista = 1 clínica. Clínicas maiores têm educador físico, psicólogo, endocrinologista no mesmo caso — vale avaliar (não implementar ainda) um modelo de time ao redor do paciente.

### Descartado pelo comitê (não vale investir agora)
- Marketplace de delivery/supermercado integrado ao plano alimentar — dependência de parceria comercial complexa, não é o gargalo atual do produto.
- Internacionalização/múltiplos idiomas — sem sinal de demanda fora do Brasil ainda.

---

## 🎨 Comitê de Design — Validação de Interfaces (14/07/2026)

Passagem tela a tela pelas duas metades do produto (CRM do nutricionista, app do paciente), depois do redesign e das correções já aplicadas.

### CRM do Nutricionista
- ✅ Sidebar escura, badges com ponto, hierarquia visual — validado, já está no padrão "business" que faltava antes.
- [ ] **Histórico de peso do paciente é uma lista, não um gráfico.** Para um CRM clínico, evolução de peso/medidas *precisa* ser visual (linha do tempo), não uma lista de linhas de texto — hoje em `PatientList.jsx` (aba prontuário) é só `<li>{data}: {peso}kg</li>`.
- [ ] **Nenhum estado de carregamento visível.** Ações como "Gerar Síntese Clínica (IA)" e geração de dieta têm texto de loading ("Analisando..."), mas o resto do CRM (troca de aba, abrir prontuário) não tem nenhuma transição/skeleton — troca é instantânea e seca.
- [ ] **Sidebar fixa em 260px não foi testada em tablet/janela estreita.** O CRM é claramente desenhado para desktop; não há breakpoint definido — se um nutricionista usar em tablet (cenário comum em consultório), a sidebar provavelmente quebra o layout.
- [ ] **Modais de "Novo Agendamento"/"Novo Paciente" não têm validação inline nem foco automático no primeiro campo** — dependem só da validação nativa do browser (`required`), que é inconsistente entre navegadores.

### App do Paciente
- ✅ Bottom nav com rótulos e sem sobreposição, banner de erro inline — validado, corrigido nesta sessão.
- [ ] **Peso ainda é lançado via `window.prompt()` nativo do navegador** (`Profile.jsx` → `handleUpdateWeight`) — quebra completamente a identidade visual "gamificada" do resto do app; deveria ser um modal com o mesmo `btn-3d`/card style do resto do produto.
- [ ] **Ícone de coração no TopBar (❤️ 5) sugere um sistema de "vidas" estilo Duolingo que não existe de verdade** — não há penalidade nem lógica associada a esse número, é decorativo. Ou constrói a mecânica de verdade (perder coração ao pular dia) ou remove o ícone — hoje é uma promessa visual que engana o paciente.
- [ ] **`DietPlan.jsx` é uma lista estática de refeições passadas** — não indica visualmente qual dieta está ativa vs. histórico, nem tem estado por refeição (feito/pendente) como o `QuestBoard` tem. As duas telas mostram a mesma dieta de formas inconsistentes.
- [ ] **Nenhum dark mode** — não é obrigatório, mas vale decisão consciente (ver skill de design usada na auditoria: "não default pra dark mode, mas também não ignorar a pergunta").
- [ ] **Contraste de cor não verificado formalmente** — várias combinações (texto cinza claro `#94a3b8` sobre branco, badges) estão na faixa duvidosa de WCAG AA; precisa de auditoria de contraste real, não só visual.

### Consistência entre os dois mundos
- [ ] **Validado como escolha correta, não como falha:** o CRM (profissional, sóbrio) e o app do paciente (gamificado, colorido) usarem linguagens visuais propositalmente diferentes — é o mesmo padrão usado por Noom (paciente) vs. Practice Better (profissional), públicos diferentes justificam identidades diferentes. Não unificar.
- [ ] **Ponto de atrito real:** a transição entre os dois (botão "Sair (Trocar Papel)" no CRM, botões "Modo Nutricionista/Paciente" no login) é um artefato de demonstração, não um fluxo de produto real — nenhum usuário real alterna entre os dois papéis livremente. Antes de lançar, decidir se esse seletor deve sumir da experiência de produção (ficando só como atalho de dev/QA).

---

## 🏛️ Comitê de Produto — Decisões Finais e Priorização (14/07/2026)

Síntese dos dois comitês acima em uma ordem de execução única. Critério: o que reduz risco (segurança/confiabilidade) vem antes do que aumenta valor (features novas), e dentro de "valor" o diferencial competitivo (Cohorts) vem antes de conveniência.

**Onda 1 — Antes de qualquer usuário real usar o produto**
1. Segurança e confiabilidade (bloco já detalhado acima) — sem isso, nenhuma feature nova importa.
2. Peso via modal em vez de `prompt()` nativo, remoção/decisão sobre o ícone de coração decorativo — baratos, resolvem a sensação de "inacabado" apontada pelo comitê de design.
3. Decidir e remover (ou manter só em dev) o seletor "Trocar Papel" — hoje é o maior sinal visual de que o produto ainda é um protótipo.

**Onda 2 — O diferencial competitivo (maior retorno por esforço)**
4. Cohorts real: modelo de previsão + envio de fato do alerta. Este é o item que o comitê de produto inovador e a pesquisa de mercado apontam como o maior diferencial — prioridade máxima entre as features novas.
5. Gráfico de evolução de peso no CRM (troca lista → linha do tempo) — pré-requisito visual para o Cohorts parecer "inteligente" de verdade.
6. Contexto biométrico no Vytal Bot (mesmo que só manual no início, sem integrar wearable ainda) — data mínima para começar a construir a diferenciação de IA clínica.

**Onda 3 — Monetização e crescimento**
7. Stripe real + limite de plano aplicado.
8. Landing page com proposta de valor.
9. Canal de mensagens diretas nutricionista↔paciente.

**Onda 4 — Investimentos maiores, validar demanda antes**
10. Wearables/CGM, telemedicina em vídeo, biblioteca de receitas reutilizáveis, comunidade entre pacientes, multi-profissional.

**Não fazer agora (decisão explícita do comitê):** marketplace de delivery, internacionalização, dark mode como prioridade (fica como nice-to-have de design, não bloqueia nada).

---

## 💡 Ideias novas do usuário (14/07/2026)

- [x] **Sino de notificação no app do paciente** — implementado. Quando o nutricionista clica "Enviar Alerta" (Cohorts), uma notificação real é criada (`addNotification` no `AppContext.jsx`) e aparece no sino do `TopBar` do paciente, com contador de não lidas.
- [ ] **Biblioteca de templates de dieta reutilizáveis:** o nutricionista deveria poder salvar um plano completo (30 dias, 6 refeições, suplementos/vitaminas) como template, em vez de digitar tudo do zero em cada consulta.
- [ ] **Anexar template a um paciente:** a partir da biblioteca acima, aplicar um template existente diretamente ao prontuário de um paciente (com opção de ajustar antes de confirmar).
- [ ] **Receitas para o paciente (bônus):** o paciente deveria poder receber receitas — geradas por IA ou buscadas na internet — anexadas numa aba própria de "Receitas", separada do plano alimentar estruturado. Onde encaixar: provavelmente uma nova aba na bottom nav do paciente (`DietPlan`/`QuestBoard` já estão cheios) ou uma seção dentro de `DietPlan.jsx`.

---

## ✅ Onda 1 — Executada (14/07/2026)

- [x] Chave da OpenAI removida do lado paciente (chat + foto de refeição) — agora usa `/api/openai-bridge`, igual ao lado nutricionista. `src/services/openaiService.js` (órfão) apagado.
- [x] Guard de rota real em `/nutri` e `/paciente` (`App.jsx` → `RequireAuth`) — bloqueia acesso sem sessão em produção; em dev (`import.meta.env.DEV`) deixa passar, e os botões de atalho no `Login.jsx` só aparecem em dev.
- [x] `firestore.rules` criado na raiz do projeto, isolando `patients`/`appointments` por `nutricionista_id`. **Ainda precisa ser publicado manualmente** (Firebase Console ou `firebase deploy --only firestore:rules` no projeto `nutribase-fea35`) — nenhuma automação faz esse deploy sozinha.
- [x] Peso do paciente: trocado `window.prompt()` por modal próprio em `Profile.jsx`.
- [x] Ícone de coração decorativo removido do `TopBar` (não tinha mecânica real associada).
- [ ] **Verificação ao vivo pendente:** rodei lint (sem erros novos) e confirmei via código que o guard não bloqueia o modo dev, mas a automação de navegador desta sessão ficou instável no meio do teste do modal de peso e do chat — vale um clique manual rápido em `/paciente` → Vytal Bot e Perfil → Informar Meu Peso antes de considerar 100% validado.
- [ ] Instabilidade do canal de escrita do Firestore (erro 503 observado nos testes) não foi resolvida — é de infraestrutura/rede do ambiente, não do código. O padrão "local-first" já em uso evita que isso trave a UI, mas vale investigar se persiste fora deste ambiente de dev.
- [ ] "Trocar Papel" no CRM (`Sair (Trocar Papel)`) foi mantido como está — na prática só navega pra landing page, não é um bypass de segurança como os botões do Login.
