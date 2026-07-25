# Roadmap do Produto Ã¢â‚¬â€� Vytal (VisÃƒÂ£o de PM)

Este documento traduz os aprendizados das trilhas de Product Management (0Ã¢â€ â€™1 e 1Ã¢â€ â€™100) em um backlog acionÃƒÂ¡vel para o Vytal. NÃƒÂ³s jÃƒÂ¡ concluÃƒÂ­mos as Fases de Discovery e o protÃƒÂ³tipo inicial. Agora, focaremos nas prÃƒÂ³ximas fases dos frameworks de PM.

> **Nota (14/07/2026):** uma auditoria de produto encontrou vÃƒÂ¡rios itens abaixo marcados `[x]` que nÃƒÂ£o correspondiam ao estado real do cÃƒÂ³digo (existiam sÃƒÂ³ como mock/decorativo). Foram desmarcados e detalhados em `spec.md`. Tratar esta lista como o estado real, nÃƒÂ£o aspiracional.

---

## Ã°Å¸Å¡â‚¬ FASE 5: MVP Spec & Build (FinalizaÃƒÂ§ÃƒÂ£o)
*Objetivo: Substituir as gambiarras do protÃƒÂ³tipo (mocks/dados na memÃƒÂ³ria) por uma infraestrutura viÃƒÂ¡vel para o mundo real, garantindo que o "walking skeleton" suporte usuÃƒÂ¡rios de verdade.*

- [x] **Core UI & Roteamento:** Telas separadas para Paciente e Nutricionista com navegaÃƒÂ§ÃƒÂ£o fluida.
- [x] **IA Nativa (Frontend):** GeraÃƒÂ§ÃƒÂ£o de cardÃƒÂ¡pios, ChatBot (Vytal Bot) e leitor de PDF (pdf.js) integrados no navegador.
- [x] **Banco de Dados Real (Supabase/Firebase):** 
  - Migrar o estado global (`AppContext.jsx`) para tabelas SQL (UsuÃƒÂ¡rios, Pacientes, Receitas, Consultas).
- [x] **AutenticaÃƒÂ§ÃƒÂ£o:** 
  - Login seguro (Email/Senha) para que cada paciente veja apenas seus prÃƒÂ³prios dados.
- [ ] **SeguranÃƒÂ§a de API:**
  - Remover a chave da OpenAI do cÃƒÂ³digo Frontend (`VITE_OPENAI_API_KEY`). *(Feito sÃƒÂ³ do lado do nutricionista, via `api/openai-bridge.js`. O lado do paciente Ã¢â‚¬â€� chat e foto de refeiÃƒÂ§ÃƒÂ£o Ã¢â‚¬â€� ainda chama a OpenAI direto do navegador com a chave exposta.)*
  - Criar uma **Edge Function / Serverless Function** para fazer a ponte com a IA com seguranÃƒÂ§a. *(Existe para o nutricionista; falta estender ao paciente.)*

---

## Ã°Å¸â€œË† FASE 6: Launch & Early Traction (Go-to-Market)
*Objetivo: LanÃƒÂ§ar para early adopters, instrumentar mÃƒÂ©tricas desde o Dia 1 e otimizar para a North Star Metric (ex: % de pacientes engajados na gamificaÃƒÂ§ÃƒÂ£o).*

- [ ] **InstrumentaÃƒÂ§ÃƒÂ£o de AARRR:**
  - Instalar PostHog ou Google Analytics para medir Activation (Pacientes que usam >3 dias seguidos) e Retention. *(SÃƒÂ³ o Firebase Analytics estÃƒÂ¡ inicializado, sem nenhum evento customizado disparado ainda.)*
- [x] **PWA (Progressive Web App):** 
  - Configurar `manifest.json` e Service Worker para permitir que o Paciente instale o Vytal no celular direto pelo navegador.
- [x] **Loop de Feedback:** 
  - Inserir botÃƒÂ£o de reporte rÃƒÂ¡pido de bugs/sugestÃƒÂµes dentro do app.
- [x] **Deploy de LanÃƒÂ§amento:** 
  - Publicar Frontend no Vercel/Netlify.
- [x] **Checklist de Launch (Aula 3.15):** Validar integraÃƒÂ§ÃƒÂ£o, suporte, e comunicaÃƒÂ§ÃƒÂ£o de boas-vindas aos primeiros pacientes e nutricionistas.

---

## Ã°Å¸ï¿½ï¿½ FASE 7: Product-Market Fit
*Objetivo: Confirmar que a retenÃƒÂ§ÃƒÂ£o achatou na curva e que o LTV > CAC, aplicando a pesquisa Sean Ellis.*

- [ ] **Pesquisa Sean Ellis:** 
  - Disparar survey: *"Como vocÃƒÂª se sentiria se o Vytal deixasse de existir?"* (Meta: >40% Muito Desapontado).
- [ ] **Growth Features (PLG):** 
  - Sistema de convite orgÃƒÂ¢nico (Indique o Nutri e ganhe uma avaliaÃƒÂ§ÃƒÂ£o grÃƒÂ¡tis).
  - **Self-Service Sign Up:** Permitir que o paciente faÃƒÂ§a cadastro avulso pelo app e ganhe 1 Consulta GrÃƒÂ¡tis com a IA (Vytal Bot) para testar a experiÃƒÂªncia.
- [x] **Monitoramento de RetenÃƒÂ§ÃƒÂ£o:**
  - Dashboards em tempo real do nÃƒÂ­vel de XP e Ofensiva dos pacientes.

---

## Ã°Å¸ï¿½Â¢ JORNADA 1Ã¢â€ â€™100: Scale & MonetizaÃƒÂ§ÃƒÂ£o
*Objetivo: Quando o PMF for alcanÃƒÂ§ado, construir os alicerces financeiros e B2B.*

- [ ] **Sistema de Assinaturas (Billing):**
  - IntegraÃƒÂ§ÃƒÂ£o com Stripe para cobrar mensalidades dos Nutricionistas (SaaS). *(Tela de "Assinar Premium" existe, mas sem checkout real conectado.)*
- [~] **Multitenancy (White-Label):**
  - Permitir que ClÃƒÂ­nicas grandes personalizem as cores do app para seus pacientes. *(Nome/cor da clÃƒÂ­nica funcionam; falta isolar dados entre clÃƒÂ­nicas de verdade no backend.)*
- [ ] **InteligÃƒÂªncia de Cohorts (Aula de PM):**
  - Algoritmo que prevÃƒÂª quais pacientes estÃƒÂ£o prestes a abandonar a dieta e alerta o nutricionista no CRM. *(A tela existe e ÃƒÂ© o ponto forte visual do produto, mas o "risco de abandono" hoje ÃƒÂ© um campo estÃƒÂ¡tico do mock, nÃƒÂ£o uma previsÃƒÂ£o real; o alerta nÃƒÂ£o ÃƒÂ© enviado de verdade ainda.)*

---

## Ã°Å¸â€œâ€¹ Backlog de Features Pendentes (14/07/2026)

Consolidado a partir da auditoria de produto e do `spec.md`. Ordenado por prioridade dentro de cada bloco Ã¢â‚¬â€� nÃƒÂ£o ÃƒÂ© uma lista de bugs (esses jÃƒÂ¡ foram corrigidos), ÃƒÂ© o que falta **construir**.

### SeguranÃƒÂ§a e confiabilidade (bloqueia produÃƒÂ§ÃƒÂ£o real)
- [ ] Mover as chamadas de IA do lado paciente (chat + foto de refeiÃƒÂ§ÃƒÂ£o) para o proxy server-side (`api/openai-bridge.js`), removendo `VITE_OPENAI_API_KEY` do bundle do cliente.
- [ ] Guard de rota real: redirecionar `/nutri` e `/paciente` para `/login` quando nÃƒÂ£o hÃƒÂ¡ sessÃƒÂ£o ativa (hoje dÃƒÂ¡ pra acessar direto pela URL).
- [ ] Regras de seguranÃƒÂ§a no Firestore que isolem dados por paciente/clÃƒÂ­nica no servidor Ã¢â‚¬â€� hoje o filtro ÃƒÂ© sÃƒÂ³ visual no cliente.
- [ ] Investigar e resolver a instabilidade do canal de escrita do Firestore (erro 503 recorrente) antes de depender dele em produÃƒÂ§ÃƒÂ£o.
- [ ] **Edge Case Estrutural:** Tratar o cenÃƒÂ¡rio onde um mesmo paciente (mesmo CPF/E-mail) ÃƒÂ© atendido por mais de um nutricionista na plataforma (atualmente o modelo assume relacionamento 1:N restrito via `nutricionista_id`).

### MonetizaÃƒÂ§ÃƒÂ£o
- [ ] IntegraÃƒÂ§ÃƒÂ£o real com Stripe (checkout, webhooks de assinatura, bloqueio de features por plano).
- [ ] LÃƒÂ³gica de limite de pacientes por plano (hoje "Limite de 5 pacientes" ÃƒÂ© sÃƒÂ³ texto, nÃƒÂ£o ÃƒÂ© aplicado).

### InteligÃƒÂªncia de Cohorts (o maior diferencial do produto Ã¢â‚¬â€� vale investir aqui primeiro entre as features "grandes")
- [x] Modelo real de previsÃƒÂ£o de abandono (hoje ÃƒÂ© um campo estÃƒÂ¡tico `em_risco` no mock), usando streak, adesÃƒÂ£o e frequÃƒÂªncia de login.
- [x] Envio de fato do alerta de risco (WhatsApp Business API, e-mail transacional, ou push notification) Ã¢â‚¬â€� hoje sÃƒÂ³ registra em `alert()`.
- [x] VisÃƒÂ£o "Patient 360": um painel ÃƒÂºnico por paciente reunindo plano, food log, check-ins, peso, mensagens e anotaÃƒÂ§ÃƒÂµes (hoje estÃƒÂ¡ espalhado em abas separadas).

### ComunicaÃƒÂ§ÃƒÂ£o nutricionista Ã¢â€ â€� paciente
- `[x]` Canal de mensagens diretas entre nutricionista e paciente (hoje sÃ³ existe o Vytal Bot de IA; nÃ£o hÃ¡ como o profissional mandar uma mensagem real).
- [ ] NotificaÃƒÂ§ÃƒÂµes push/e-mail para o paciente quando uma nova dieta ÃƒÂ© prescrita ou uma consulta ÃƒÂ© confirmada.

### Analytics e instrumentaÃƒÂ§ÃƒÂ£o
- [ ] Eventos customizados de produto (ativaÃƒÂ§ÃƒÂ£o, retenÃƒÂ§ÃƒÂ£o, funil de onboarding) Ã¢â‚¬â€� hoje sÃƒÂ³ o Firebase Analytics estÃƒÂ¡ inicializado, sem nenhum evento disparado.
- [ ] Pesquisa de PMF (Sean Ellis) Ã¢â‚¬â€� depende de ter uma base real de usuÃƒÂ¡rios antes de fazer sentido.

### Growth / aquisiÃƒÂ§ÃƒÂ£o
- [ ] Sistema de convite orgÃƒÂ¢nico (indicaÃƒÂ§ÃƒÂ£o premiada).
- [x] Landing page com proposta de valor real (hoje ÃƒÂ© sÃƒÂ³ um seletor de botÃƒÂµes Ã¢â‚¬â€� ver auditoria de UX).

### DecisÃƒÂµes de produto pendentes (nÃƒÂ£o sÃƒÂ£o bugs, sÃƒÂ£o escolhas)
- [ ] Decidir o destino de `LearnPath.jsx`/`Quiz.jsx` Ã¢â‚¬â€� trilha de aprendizado gamificada estilo Duolingo, jÃƒÂ¡ prototipada mas nunca conectada ÃƒÂ s rotas. Reativar (precisa de conteÃƒÂºdo real) ou remover.
- [ ] Decidir se o app do paciente precisa de wearables/CGM (Apple Watch, Google Fit, glicose contÃƒÂ­nua) Ã¢â‚¬â€� ÃƒÂ© tendÃƒÂªncia forte do mercado 2026, mas ÃƒÂ© investimento grande; nÃƒÂ£o comeÃƒÂ§ar sem validar demanda.

### Qualidade
- [ ] Nenhum teste automatizado existe no projeto hoje (unitÃƒÂ¡rio, integraÃƒÂ§ÃƒÂ£o ou E2E). Priorizar cobertura pelo menos nos fluxos crÃƒÂ­ticos: login, criar/editar paciente, agendar consulta, prescrever dieta.

---

## Ã°Å¸Â§Â­ ComitÃƒÂª de Produto Inovador Ã¢â‚¬â€� ValidaÃƒÂ§ÃƒÂ£o de Features (14/07/2026)

AvaliaÃƒÂ§ÃƒÂ£o do que jÃƒÂ¡ existe vs. o que um produto de referÃƒÂªncia em nutriÃƒÂ§ÃƒÂ£o digital (Nutrium, Practice Better, MealCircle do lado profissional; Noom, MyFitnessPal, HealthifyMe do lado paciente) precisa ter em 2026, cruzado com o combo que sÃƒÂ³ o Vytal tenta fazer hoje: CRM + gamificaÃƒÂ§ÃƒÂ£o + IA num produto sÃƒÂ³.

### Validado Ã¢â‚¬â€� manter e priorizar
- **Combo CRM + app gamificado + IA clÃƒÂ­nica.** Ãƒâ€° o ponto de diferenciaÃƒÂ§ÃƒÂ£o real. Nenhum concorrente pesquisado junta os trÃƒÂªs; a maioria ÃƒÂ© ou ferramenta de gestÃƒÂ£o (Nutrium, Practice Better) ou app de paciente (Noom, MyFitnessPal). Vale proteger esse posicionamento em vez de diluir com features genÃƒÂ©ricas.
- **Vytal Bot com contexto do plano ativo.** JÃƒÂ¡ responde considerando a dieta prescrita Ã¢â‚¬â€� alinhado com a tendÃƒÂªncia de "IA + SaÃƒÂºde ClÃƒÂ­nica" apontada pela pesquisa de mercado, mas ainda sem dados biomÃƒÂ©tricos.
- **Cohorts / risco de abandono no CRM.** Validado como o recurso de maior potencial competitivo Ã¢â‚¬â€� nenhum concorrente pequeno oferece isso hoje pronto; precisa sÃƒÂ³ deixar de ser mock (jÃƒÂ¡ listado no backlog acima).
- **AnÃƒÂ¡lise de exame em PDF via IA.** Diferencial real frente a concorrentes puramente "app de dieta" Ã¢â‚¬â€� poucos cruzam exame laboratorial com prescriÃƒÂ§ÃƒÂ£o automaticamente.

### Gaps identificados Ã¢â‚¬â€� features que faltam
- [x] **Contexto biomÃƒÂ©trico no Vytal Bot e na geraÃƒÂ§ÃƒÂ£o de dieta:** conectar dados de sono/atividade (Apple Health, Google Fit) para a IA ajustar recomendaÃƒÂ§ÃƒÂµes Ã¢â‚¬â€� ÃƒÂ© citado como "linha de base esperada" pelos apps premium de 2026, hoje o Vytal sÃƒÂ³ usa dados manuais (peso via `prompt()`).
- [x] **Food log fora do plano prescrito:** hoje sÃƒÂ³ existe o "Comeu algo diferente?" com foto avulsa; falta um diÃƒÂ¡rio alimentar livre (sem depender de ter uma dieta ativa) para pacientes em fase de diagnÃƒÂ³stico/anamnese, antes da primeira prescriÃƒÂ§ÃƒÂ£o.
- [ ] **Telemedicina/consulta em vÃƒÂ­deo integrada:** hoje a "consulta" no CRM ÃƒÂ© sÃƒÂ³ um formulÃƒÂ¡rio preenchido pelo nutricionista; nÃƒÂ£o hÃƒÂ¡ chamada de vÃƒÂ­deo nem histÃƒÂ³rico de sessÃƒÂ£o gravado. Concorrentes de practice management (Practice Better) jÃƒÂ¡ oferecem isso nativo.
- [ ] **Biblioteca de receitas/planos reutilizÃƒÂ¡veis:** hoje cada dieta ÃƒÂ© gerada do zero por IA a cada consulta; um nutricionista com 50 pacientes precisa reaproveitar templates de cardÃƒÂ¡pio, nÃƒÂ£o recriar tudo toda vez.
- [ ] **DocumentaÃƒÂ§ÃƒÂ£o para reembolso/nota fiscal:** contexto Brasil Ã¢â‚¬â€� nutricionistas frequentemente precisam emitir recibo para plano de saÃƒÂºde; nÃƒÂ£o existe nada hoje nessa linha (oportunidade de nicho local que concorrentes globais nÃƒÂ£o cobrem bem).
- [ ] **Comunidade/prova social entre pacientes:** o leaderboard hoje ÃƒÂ© sÃƒÂ³ dentro da clÃƒÂ­nica; testar (com cautela, ver comitÃƒÂª de design abaixo) algum elemento de comunidade pode reforÃƒÂ§ar a camada de gamificaÃƒÂ§ÃƒÂ£o, que ÃƒÂ© validada como tendÃƒÂªncia de alto impacto em retenÃƒÂ§ÃƒÂ£o (+30-40% engajamento).
- [ ] **Multi-profissional:** hoje o produto assume 1 nutricionista = 1 clÃƒÂ­nica. ClÃƒÂ­nicas maiores tÃƒÂªm educador fÃƒÂ­sico, psicÃƒÂ³logo, endocrinologista no mesmo caso Ã¢â‚¬â€� vale avaliar (nÃƒÂ£o implementar ainda) um modelo de time ao redor do paciente.

### Descartado pelo comitÃƒÂª (nÃƒÂ£o vale investir agora)
- Marketplace de delivery/supermercado integrado ao plano alimentar Ã¢â‚¬â€� dependÃƒÂªncia de parceria comercial complexa, nÃƒÂ£o ÃƒÂ© o gargalo atual do produto.
- InternacionalizaÃƒÂ§ÃƒÂ£o/mÃƒÂºltiplos idiomas Ã¢â‚¬â€� sem sinal de demanda fora do Brasil ainda.

---

## Ã°Å¸Å½Â¨ ComitÃƒÂª de Design Ã¢â‚¬â€� ValidaÃƒÂ§ÃƒÂ£o de Interfaces (14/07/2026)

Passagem tela a tela pelas duas metades do produto (CRM do nutricionista, app do paciente), depois do redesign e das correÃƒÂ§ÃƒÂµes jÃƒÂ¡ aplicadas.

### CRM do Nutricionista
- Ã¢Å“â€¦ Sidebar escura, badges com ponto, hierarquia visual Ã¢â‚¬â€� validado, jÃƒÂ¡ estÃƒÂ¡ no padrÃƒÂ£o "business" que faltava antes.
- [x] **HistÃƒÂ³rico de peso do paciente ÃƒÂ© uma lista, nÃƒÂ£o um grÃƒÂ¡fico.** Para um CRM clÃƒÂ­nico, evoluÃƒÂ§ÃƒÂ£o de peso/medidas *precisa* ser visual (linha do tempo), nÃƒÂ£o uma lista de linhas de texto Ã¢â‚¬â€� hoje em `PatientList.jsx` (aba prontuÃƒÂ¡rio) ÃƒÂ© sÃƒÂ³ `<li>{data}: {peso}kg</li>`.
- [ ] **Nenhum estado de carregamento visÃƒÂ­vel.** AÃƒÂ§ÃƒÂµes como "Gerar SÃƒÂ­ntese ClÃƒÂ­nica (IA)" e geraÃƒÂ§ÃƒÂ£o de dieta tÃƒÂªm texto de loading ("Analisando..."), mas o resto do CRM (troca de aba, abrir prontuÃƒÂ¡rio) nÃƒÂ£o tem nenhuma transiÃƒÂ§ÃƒÂ£o/skeleton Ã¢â‚¬â€� troca ÃƒÂ© instantÃƒÂ¢nea e seca.
- [ ] **Sidebar fixa em 260px nÃƒÂ£o foi testada em tablet/janela estreita.** O CRM ÃƒÂ© claramente desenhado para desktop; nÃƒÂ£o hÃƒÂ¡ breakpoint definido Ã¢â‚¬â€� se um nutricionista usar em tablet (cenÃƒÂ¡rio comum em consultÃƒÂ³rio), a sidebar provavelmente quebra o layout.
- [ ] **Modais de "Novo Agendamento"/"Novo Paciente" nÃƒÂ£o tÃƒÂªm validaÃƒÂ§ÃƒÂ£o inline nem foco automÃƒÂ¡tico no primeiro campo** Ã¢â‚¬â€� dependem sÃƒÂ³ da validaÃƒÂ§ÃƒÂ£o nativa do browser (`required`), que ÃƒÂ© inconsistente entre navegadores.

### App do Paciente
- Ã¢Å“â€¦ Bottom nav com rÃƒÂ³tulos e sem sobreposiÃƒÂ§ÃƒÂ£o, banner de erro inline Ã¢â‚¬â€� validado, corrigido nesta sessÃƒÂ£o.
- [ ] **Peso ainda ÃƒÂ© lanÃƒÂ§ado via `window.prompt()` nativo do navegador** (`Profile.jsx` Ã¢â€ â€™ `handleUpdateWeight`) Ã¢â‚¬â€� quebra completamente a identidade visual "gamificada" do resto do app; deveria ser um modal com o mesmo `btn-3d`/card style do resto do produto.
- [ ] **Ãƒï¿½cone de coraÃƒÂ§ÃƒÂ£o no TopBar (Ã¢ï¿½Â¤Ã¯Â¸ï¿½ 5) sugere um sistema de "vidas" estilo Duolingo que nÃƒÂ£o existe de verdade** Ã¢â‚¬â€� nÃƒÂ£o hÃƒÂ¡ penalidade nem lÃƒÂ³gica associada a esse nÃƒÂºmero, ÃƒÂ© decorativo. Ou constrÃƒÂ³i a mecÃƒÂ¢nica de verdade (perder coraÃƒÂ§ÃƒÂ£o ao pular dia) ou remove o ÃƒÂ­cone Ã¢â‚¬â€� hoje ÃƒÂ© uma promessa visual que engana o paciente.
- [ ] **`DietPlan.jsx` ÃƒÂ© uma lista estÃƒÂ¡tica de refeiÃƒÂ§ÃƒÂµes passadas** Ã¢â‚¬â€� nÃƒÂ£o indica visualmente qual dieta estÃƒÂ¡ ativa vs. histÃƒÂ³rico, nem tem estado por refeiÃƒÂ§ÃƒÂ£o (feito/pendente) como o `QuestBoard` tem. As duas telas mostram a mesma dieta de formas inconsistentes.
- [x] **Nenhum dark mode** Ã¢â‚¬â€� nÃƒÂ£o ÃƒÂ© obrigatÃƒÂ³rio, mas vale decisÃƒÂ£o consciente (ver skill de design usada na auditoria: "nÃƒÂ£o default pra dark mode, mas tambÃƒÂ©m nÃƒÂ£o ignorar a pergunta"). Foi implementado o **Dark Mode Premium** com glassmorphism.
- [ ] **Contraste de cor nÃƒÂ£o verificado formalmente** Ã¢â‚¬â€� vÃƒÂ¡rias combinaÃƒÂ§ÃƒÂµes (texto cinza claro `#94a3b8` sobre branco, badges) estÃƒÂ£o na faixa duvidosa de WCAG AA; precisa de auditoria de contraste real, nÃƒÂ£o sÃƒÂ³ visual.

### ConsistÃƒÂªncia entre os dois mundos
- [ ] **Validado como escolha correta, nÃƒÂ£o como falha:** o CRM (profissional, sÃƒÂ³brio) e o app do paciente (gamificado, colorido) usarem linguagens visuais propositalmente diferentes Ã¢â‚¬â€� ÃƒÂ© o mesmo padrÃƒÂ£o usado por Noom (paciente) vs. Practice Better (profissional), pÃƒÂºblicos diferentes justificam identidades diferentes. NÃƒÂ£o unificar.
- [ ] **Ponto de atrito real:** a transiÃƒÂ§ÃƒÂ£o entre os dois (botÃƒÂ£o "Sair (Trocar Papel)" no CRM, botÃƒÂµes "Modo Nutricionista/Paciente" no login) ÃƒÂ© um artefato de demonstraÃƒÂ§ÃƒÂ£o, nÃƒÂ£o um fluxo de produto real Ã¢â‚¬â€� nenhum usuÃƒÂ¡rio real alterna entre os dois papÃƒÂ©is livremente. Antes de lanÃƒÂ§ar, decidir se esse seletor deve sumir da experiÃƒÂªncia de produÃƒÂ§ÃƒÂ£o (ficando sÃƒÂ³ como atalho de dev/QA).

---

## Ã°Å¸ï¿½â€ºÃ¯Â¸ï¿½ ComitÃƒÂª de Produto Ã¢â‚¬â€� DecisÃƒÂµes Finais e PriorizaÃƒÂ§ÃƒÂ£o (14/07/2026)

SÃƒÂ­ntese dos dois comitÃƒÂªs acima em uma ordem de execuÃƒÂ§ÃƒÂ£o ÃƒÂºnica. CritÃƒÂ©rio: o que reduz risco (seguranÃƒÂ§a/confiabilidade) vem antes do que aumenta valor (features novas), e dentro de "valor" o diferencial competitivo (Cohorts) vem antes de conveniÃƒÂªncia.

**Onda 1 Ã¢â‚¬â€� Antes de qualquer usuÃƒÂ¡rio real usar o produto**
1. SeguranÃƒÂ§a e confiabilidade (bloco jÃƒÂ¡ detalhado acima) Ã¢â‚¬â€� sem isso, nenhuma feature nova importa.
2. Peso via modal em vez de `prompt()` nativo, remoÃƒÂ§ÃƒÂ£o/decisÃƒÂ£o sobre o ÃƒÂ­cone de coraÃƒÂ§ÃƒÂ£o decorativo Ã¢â‚¬â€� baratos, resolvem a sensaÃƒÂ§ÃƒÂ£o de "inacabado" apontada pelo comitÃƒÂª de design.
3. Decidir e remover (ou manter sÃƒÂ³ em dev) o seletor "Trocar Papel" Ã¢â‚¬â€� hoje ÃƒÂ© o maior sinal visual de que o produto ainda ÃƒÂ© um protÃƒÂ³tipo.

**Onda 2 Ã¢â‚¬â€� O diferencial competitivo (maior retorno por esforÃƒÂ§o)**
4. Cohorts real: modelo de previsÃƒÂ£o + envio de fato do alerta. Este ÃƒÂ© o item que o comitÃƒÂª de produto inovador e a pesquisa de mercado apontam como o maior diferencial Ã¢â‚¬â€� prioridade mÃƒÂ¡xima entre as features novas.
5. [x] GrÃƒÂ¡fico de evoluÃƒÂ§ÃƒÂ£o de peso no CRM (troca lista Ã¢â€ â€™ linha do tempo) Ã¢â‚¬â€� prÃƒÂ©-requisito visual para o Cohorts parecer "inteligente" de verdade.
6. Contexto biomÃƒÂ©trico no Vytal Bot (mesmo que sÃƒÂ³ manual no inÃƒÂ­cio, sem integrar wearable ainda) Ã¢â‚¬â€� data mÃƒÂ­nima para comeÃƒÂ§ar a construir a diferenciaÃƒÂ§ÃƒÂ£o de IA clÃƒÂ­nica.

**Onda 3 Ã¢â‚¬â€� MonetizaÃƒÂ§ÃƒÂ£o e crescimento**
7. Stripe real + limite de plano aplicado.
8. [x] Landing page com proposta de valor.
9. Canal de mensagens diretas nutricionistaÃ¢â€ â€�paciente.

**Onda 4 Ã¢â‚¬â€� Investimentos maiores, validar demanda antes**
10. Wearables/CGM, telemedicina em vÃƒÂ­deo, biblioteca de receitas reutilizÃƒÂ¡veis, comunidade entre pacientes, multi-profissional.

**NÃƒÂ£o fazer agora (decisÃƒÂ£o explÃƒÂ­cita do comitÃƒÂª):** marketplace de delivery, internacionalizaÃƒÂ§ÃƒÂ£o, dark mode como prioridade (fica como nice-to-have de design, nÃƒÂ£o bloqueia nada).

---

## Ã°Å¸â€™Â¡ Ideias novas do usuÃƒÂ¡rio (14/07/2026)

- [x] **Sino de notificaÃƒÂ§ÃƒÂ£o no app do paciente** Ã¢â‚¬â€� implementado. Quando o nutricionista clica "Enviar Alerta" (Cohorts), uma notificaÃƒÂ§ÃƒÂ£o real ÃƒÂ© criada (`addNotification` no `AppContext.jsx`) e aparece no sino do `TopBar` do paciente, com contador de nÃƒÂ£o lidas.
- [x] **Biblioteca de templates de dieta reutilizÃƒÂ¡veis:** o nutricionista deveria poder salvar um plano completo (30 dias, 6 refeiÃƒÂ§ÃƒÂµes, suplementos/vitaminas) como template, em vez de digitar tudo do zero em cada consulta.
- [ ] **Anexar template a um paciente:** a partir da biblioteca acima, aplicar um template existente diretamente ao prontuÃƒÂ¡rio de um paciente (com opÃƒÂ§ÃƒÂ£o de ajustar antes de confirmar).
- [x] **Receitas para o paciente (bÃƒÂ´nus):** o paciente deveria poder receber receitas Ã¢â‚¬â€� geradas por IA ou buscadas na internet Ã¢â‚¬â€� anexadas numa aba prÃƒÂ³pria de "Receitas", separada do plano alimentar estruturado. Onde encaixar: provavelmente uma nova aba na bottom nav do paciente (`DietPlan`/`QuestBoard` jÃƒÂ¡ estÃƒÂ£o cheios) ou uma seÃƒÂ§ÃƒÂ£o dentro de `DietPlan.jsx`.

---

## Ã¢Å“â€¦ Onda 1 Ã¢â‚¬â€� Executada (14/07/2026)

- [x] Chave da OpenAI removida do lado paciente (chat + foto de refeiÃƒÂ§ÃƒÂ£o) Ã¢â‚¬â€� agora usa `/api/openai-bridge`, igual ao lado nutricionista. `src/services/openaiService.js` (ÃƒÂ³rfÃƒÂ£o) apagado.
- [x] Guard de rota real em `/nutri` e `/paciente` (`App.jsx` Ã¢â€ â€™ `RequireAuth`) Ã¢â‚¬â€� bloqueia acesso sem sessÃƒÂ£o em produÃƒÂ§ÃƒÂ£o; em dev (`import.meta.env.DEV`) deixa passar, e os botÃƒÂµes de atalho no `Login.jsx` sÃƒÂ³ aparecem em dev.
- [x] `firestore.rules` criado na raiz do projeto, isolando `patients`/`appointments` por `nutricionista_id`. **Ainda precisa ser publicado manualmente** (Firebase Console ou `firebase deploy --only firestore:rules` no projeto `nutribase-fea35`) Ã¢â‚¬â€� nenhuma automaÃƒÂ§ÃƒÂ£o faz esse deploy sozinha.
- [x] Peso do paciente: trocado `window.prompt()` por modal prÃƒÂ³prio em `Profile.jsx`.
- [x] Ãƒï¿½cone de coraÃƒÂ§ÃƒÂ£o decorativo removido do `TopBar` (nÃƒÂ£o tinha mecÃƒÂ¢nica real associada).
- [ ] **VerificaÃƒÂ§ÃƒÂ£o ao vivo pendente:** rodei lint (sem erros novos) e confirmei via cÃƒÂ³digo que o guard nÃƒÂ£o bloqueia o modo dev, mas a automaÃƒÂ§ÃƒÂ£o de navegador desta sessÃƒÂ£o ficou instÃƒÂ¡vel no meio do teste do modal de peso e do chat Ã¢â‚¬â€� vale um clique manual rÃƒÂ¡pido em `/paciente` Ã¢â€ â€™ Vytal Bot e Perfil Ã¢â€ â€™ Informar Meu Peso antes de considerar 100% validado.
- [ ] Instabilidade do canal de escrita do Firestore (erro 503 observado nos testes) nÃƒÂ£o foi resolvida Ã¢â‚¬â€� ÃƒÂ© de infraestrutura/rede do ambiente, nÃƒÂ£o do cÃƒÂ³digo. O padrÃƒÂ£o "local-first" jÃƒÂ¡ em uso evita que isso trave a UI, mas vale investigar se persiste fora deste ambiente de dev.
- [ ] "Trocar Papel" no CRM (`Sair (Trocar Papel)`) foi mantido como estÃƒÂ¡ Ã¢â‚¬â€� na prÃƒÂ¡tica sÃƒÂ³ navega pra landing page, nÃƒÂ£o ÃƒÂ© um bypass de seguranÃƒÂ§a como os botÃƒÂµes do Login.

---

## Ã¢Å“â€¦ Executado em 15/07/2026 (ExperiÃƒÂªncia Premium e CorreÃƒÂ§ÃƒÂµes de Cadastro)

- [x] **UX Redesign (App do Paciente):** MigraÃƒÂ§ÃƒÂ£o do visual "infantil" para um "Dark Mode Premium" focado em alta performance.
  - Implementado **Glassmorphism** e cores neon para acentos.
  - O `QuestBoard` abandonou a lista simples de tarefas e ganhou um **GrÃƒÂ¡fico Circular de Progresso** centralizado.
  - Introduzido o **ShareableMilestone**: um cartÃƒÂ£o hologrÃƒÂ¡fico que aparece quando o paciente atinge 100% da dieta diÃƒÂ¡ria, pensado para gerar compartilhamento viral no Instagram.
- [x] **CorreÃƒÂ§ÃƒÂµes de Cadastro e Convite:**
  - Impedida a criaÃƒÂ§ÃƒÂ£o de pacientes duplicados (mesmo CPF ou E-mail) para o mesmo nutricionista.
  - Melhorada a UI do link de convite gerado, com botÃƒÂ£o de copiar fÃƒÂ¡cil.
  - Implementado envio automÃƒÂ¡tico de convite por e-mail via `mailto:` no momento do cadastro do paciente pelo nutricionista.
- [x] **Bugfix CrÃƒÂ­tico (ProduÃƒÂ§ÃƒÂ£o):**
  - Corrigido problema onde o link de convite (`/paciente?vincular=...`) redirecionava incorretamente o paciente para a tela de `/login` devido a um bloqueio do `RequireAuth`. A prÃƒÂ³pria tela do paciente agora gerencia o onboarding sem bloquear links externos.
- [x] **Deploy & Firebase Auth (Bugfixes):**
---

## Ã°Å¸â€œË† FASE 6: Launch & Early Traction (Go-to-Market)
*Objetivo: LanÃƒÂ§ar para early adopters, instrumentar mÃƒÂ©tricas desde o Dia 1 e otimizar para a North Star Metric (ex: % de pacientes engajados na gamificaÃƒÂ§ÃƒÂ£o).*

- [ ] **InstrumentaÃƒÂ§ÃƒÂ£o de AARRR:**
  - Instalar PostHog ou Google Analytics para medir Activation (Pacientes que usam >3 dias seguidos) e Retention. *(SÃƒÂ³ o Firebase Analytics estÃƒÂ¡ inicializado, sem nenhum evento customizado disparado ainda.)*
- [x] **PWA (Progressive Web App):** 
  - Configurar `manifest.json` e Service Worker para permitir que o Paciente instale o Vytal no celular direto pelo navegador.
- [x] **Loop de Feedback:** 
  - Inserir botÃƒÂ£o de reporte rÃƒÂ¡pido de bugs/sugestÃƒÂµes dentro do app.
- [x] **Deploy de LanÃƒÂ§amento:** 
  - Publicar Frontend no Vercel/Netlify.
- [x] **Checklist de Launch (Aula 3.15):** Validar integraÃƒÂ§ÃƒÂ£o, suporte, e comunicaÃƒÂ§ÃƒÂ£o de boas-vindas aos primeiros pacientes e nutricionistas.

---

## Ã°Å¸ FASE 7: Product-Market Fit
*Objetivo: Confirmar que a retenÃƒÂ§ÃƒÂ£o achatou na curva e que o LTV > CAC, aplicando a pesquisa Sean Ellis.*

- [ ] **Pesquisa Sean Ellis:** 
  - Disparar survey: *"Como vocÃƒÂª se sentiria se o Vytal deixasse de existir?"* (Meta: >40% Muito Desapontado).
- [ ] **Growth Features (PLG):** 
  - Sistema de convite orgÃƒÂ¢nico (Indique o Nutri e ganhe uma avaliaÃƒÂ§ÃƒÂ£o grÃƒÂ¡tis).
  - **Self-Service Sign Up:** Permitir que o paciente faÃƒÂ§a cadastro avulso pelo app e ganhe 1 Consulta GrÃƒÂ¡tis com a IA (Vytal Bot) para testar a experiÃƒÂªncia.
- [x] **Monitoramento de RetenÃƒÂ§ÃƒÂ£o:**
  - Dashboards em tempo real do nÃƒÂ­vel de XP e Ofensiva dos pacientes.

---

## Ã°Å¸Â¢ JORNADA 1Ã¢â€ â€™100: Scale & MonetizaÃƒÂ§ÃƒÂ£o
*Objetivo: Quando o PMF for alcanÃƒÂ§ado, construir os alicerces financeiros e B2B.*

- [ ] **Sistema de Assinaturas (Billing):**
  - IntegraÃƒÂ§ÃƒÂ£o com Stripe para cobrar mensalidades dos Nutricionistas (SaaS). *(Tela de "Assinar Premium" existe, mas sem checkout real conectado.)*
- [~] **Multitenancy (White-Label):**
  - Permitir que ClÃƒÂ­nicas grandes personalizem as cores do app para seus pacientes. *(Nome/cor da clÃƒÂ­nica funcionam; falta isolar dados entre clÃƒÂ­nicas de verdade no backend.)*
- [ ] **InteligÃƒÂªncia de Cohorts (Aula de PM):**
  - Algoritmo que prevÃƒÂª quais pacientes estÃƒÂ£o prestes a abandonar a dieta e alerta o nutricionista no CRM. *(A tela existe e ÃƒÂ© o ponto forte visual do produto, mas o "risco de abandono" hoje ÃƒÂ© um campo estÃƒÂ¡tico do mock, nÃƒÂ£o uma previsÃƒÂ£o real; o alerta nÃƒÂ£o ÃƒÂ© enviado de verdade ainda.)*

---

## Ã°Å¸â€œâ€¹ Backlog de Features Pendentes (14/07/2026)

Consolidado a partir da auditoria de produto e do `spec.md`. Ordenado por prioridade dentro de cada bloco Ã¢â‚¬â€� nÃƒÂ£o ÃƒÂ© uma lista de bugs (esses jÃƒÂ¡ foram corrigidos), ÃƒÂ© o que falta **construir**.

### SeguranÃƒÂ§a e confiabilidade (bloqueia produÃƒÂ§ÃƒÂ£o real)
- [ ] Mover as chamadas de IA do lado paciente (chat + foto de refeiÃƒÂ§ÃƒÂ£o) para o proxy server-side (`api/openai-bridge.js`), removendo `VITE_OPENAI_API_KEY` do bundle do cliente.
- [ ] Guard de rota real: redirecionar `/nutri` e `/paciente` para `/login` quando nÃƒÂ£o hÃƒÂ¡ sessÃƒÂ£o ativa (hoje dÃƒÂ¡ pra acessar direto pela URL).
- [ ] Regras de seguranÃƒÂ§a no Firestore que isolem dados por paciente/clÃƒÂ­nica no servidor Ã¢â‚¬â€� hoje o filtro ÃƒÂ© sÃƒÂ³ visual no cliente.
- [ ] Investigar e resolver a instabilidade do canal de escrita do Firestore (erro 503 recorrente) antes de depender dele em produÃƒÂ§ÃƒÂ£o.
- [ ] **Edge Case Estrutural:** Tratar o cenÃƒÂ¡rio onde um mesmo paciente (mesmo CPF/E-mail) ÃƒÂ© atendido por mais de um nutricionista na plataforma (atualmente o modelo assume relacionamento 1:N restrito via `nutricionista_id`).

### MonetizaÃƒÂ§ÃƒÂ£o
- [ ] IntegraÃƒÂ§ÃƒÂ£o real com Stripe (checkout, webhooks de assinatura, bloqueio de features por plano).
- [ ] LÃƒÂ³gica de limite de pacientes por plano (hoje "Limite de 5 pacientes" ÃƒÂ© sÃƒÂ³ texto, nÃƒÂ£o ÃƒÂ© aplicado).

### InteligÃƒÂªncia de Cohorts (o maior diferencial do produto Ã¢â‚¬â€� vale investir aqui primeiro entre as features "grandes")
- [x] Modelo real de previsÃƒÂ£o de abandono (hoje ÃƒÂ© um campo estÃƒÂ¡tico `em_risco` no mock), usando streak, adesÃƒÂ£o e frequÃƒÂªncia de login.
- [x] Envio de fato do alerta de risco (WhatsApp Business API, e-mail transacional, ou push notification) Ã¢â‚¬â€� hoje sÃƒÂ³ registra em `alert()`.
- [x] VisÃƒÂ£o "Patient 360": um painel ÃƒÂºnico por paciente reunindo plano, food log, check-ins, peso, mensagens e anotaÃƒÂ§ÃƒÂµes (hoje estÃƒÂ¡ espalhado em abas separadas).

### ComunicaÃƒÂ§ÃƒÂ£o nutricionista Ã¢â€ â€� paciente
- [ ] Canal de mensagens diretas entre nutricionista e paciente (hoje sÃƒÂ³ existe o Vytal Bot de IA; nÃƒÂ£o hÃƒÂ¡ como o profissional mandar uma mensagem real).
- [ ] NotificaÃƒÂ§ÃƒÂµes push/e-mail para o paciente quando uma nova dieta ÃƒÂ© prescrita ou uma consulta ÃƒÂ© confirmada.

### Analytics e instrumentaÃƒÂ§ÃƒÂ£o
- [ ] Eventos customizados de produto (ativaÃƒÂ§ÃƒÂ£o, retenÃƒÂ§ÃƒÂ£o, funil de onboarding) Ã¢â‚¬â€� hoje sÃƒÂ³ o Firebase Analytics estÃƒÂ¡ inicializado, sem nenhum evento disparado.
- [ ] Pesquisa de PMF (Sean Ellis) Ã¢â‚¬â€� depende de ter uma base real de usuÃƒÂ¡rios antes de fazer sentido.

### Growth / aquisiÃƒÂ§ÃƒÂ£o
- [ ] Sistema de convite orgÃƒÂ¢nico (indicaÃƒÂ§ÃƒÂ£o premiada).
- [x] Landing page com proposta de valor real (hoje ÃƒÂ© sÃƒÂ³ um seletor de botÃƒÂµes Ã¢â‚¬â€� ver auditoria de UX).

### DecisÃƒÂµes de produto pendentes (nÃƒÂ£o sÃƒÂ£o bugs, sÃƒÂ£o escolhas)
- [ ] Decidir o destino de `LearnPath.jsx`/`Quiz.jsx` Ã¢â‚¬â€� trilha de aprendizado gamificada estilo Duolingo, jÃƒÂ¡ prototipada mas nunca conectada ÃƒÂ s rotas. Reativar (precisa de conteÃƒÂºdo real) ou remover.
- [ ] Decidir se o app do paciente precisa de wearables/CGM (Apple Watch, Google Fit, glicose contÃƒÂ­nua) Ã¢â‚¬â€� ÃƒÂ© tendÃƒÂªncia forte do mercado 2026, mas ÃƒÂ© investimento grande; nÃƒÂ£o comeÃƒÂ§ar sem validar demanda.

### Qualidade
- [ ] Nenhum teste automatizado existe no projeto hoje (unitÃƒÂ¡rio, integraÃƒÂ§ÃƒÂ£o ou E2E). Priorizar cobertura pelo menos nos fluxos crÃƒÂ­ticos: login, criar/editar paciente, agendar consulta, prescrever dieta.

---

## Ã°Å¸Â§Â­ ComitÃƒÂª de Produto Inovador Ã¢â‚¬â€� ValidaÃƒÂ§ÃƒÂ£o de Features (14/07/2026)

AvaliaÃƒÂ§ÃƒÂ£o do que jÃƒÂ¡ existe vs. o que um produto de referÃƒÂªncia em nutriÃƒÂ§ÃƒÂ£o digital (Nutrium, Practice Better, MealCircle do lado profissional; Noom, MyFitnessPal, HealthifyMe do lado paciente) precisa ter em 2026, cruzado com o combo que sÃƒÂ³ o Vytal tenta fazer hoje: CRM + gamificaÃƒÂ§ÃƒÂ£o + IA num produto sÃƒÂ³.

### Validado Ã¢â‚¬â€� manter e priorizar
- **Combo CRM + app gamificado + IA clÃƒÂ­nica.** Ãƒâ€° o ponto de diferenciaÃƒÂ§ÃƒÂ£o real. Nenhum concorrente pesquisado junta os trÃƒÂªs; a maioria ÃƒÂ© ou ferramenta de gestÃƒÂ£o (Nutrium, Practice Better) ou app de paciente (Noom, MyFitnessPal). Vale proteger esse posicionamento em vez de diluir com features genÃƒÂ©ricas.
- **Vytal Bot com contexto do plano ativo.** JÃƒÂ¡ responde considerando a dieta prescrita Ã¢â‚¬â€� alinhado com a tendÃƒÂªncia de "IA + SaÃƒÂºde ClÃƒÂ­nica" apontada pela pesquisa de mercado, mas ainda sem dados biomÃƒÂ©tricos.
- **Cohorts / risco de abandono no CRM.** Validado como o recurso de maior potencial competitivo Ã¢â‚¬â€� nenhum concorrente pequeno oferece isso hoje pronto; precisa sÃƒÂ³ deixar de ser mock (jÃƒÂ¡ listado no backlog acima).
- **AnÃƒÂ¡lise de exame em PDF via IA.** Diferencial real frente a concorrentes puramente "app de dieta" Ã¢â‚¬â€� poucos cruzam exame laboratorial com prescriÃƒÂ§ÃƒÂ£o automaticamente.

### Gaps identificados Ã¢â‚¬â€� features que faltam
- [x] **Contexto biomÃƒÂ©trico no Vytal Bot e na geraÃƒÂ§ÃƒÂ£o de dieta:** conectar dados de sono/atividade (Apple Health, Google Fit) para a IA ajustar recomendaÃƒÂ§ÃƒÂµes Ã¢â‚¬â€� ÃƒÂ© citado como "linha de base esperada" pelos apps premium de 2026, hoje o Vytal sÃƒÂ³ usa dados manuais (peso via `prompt()`).
- [x] **Food log fora do plano prescrito:** hoje sÃƒÂ³ existe o "Comeu algo diferente?" com foto avulsa; falta um diÃƒÂ¡rio alimentar livre (sem depender de ter uma dieta ativa) para pacientes em fase de diagnÃƒÂ³stico/anamnese, antes da primeira prescriÃƒÂ§ÃƒÂ£o.
- [ ] **Telemedicina/consulta em vÃƒÂ­deo integrada:** hoje a "consulta" no CRM ÃƒÂ© sÃƒÂ³ um formulÃƒÂ¡rio preenchido pelo nutricionista; nÃƒÂ£o hÃƒÂ¡ chamada de vÃƒÂ­deo nem histÃƒÂ³rico de sessÃƒÂ£o gravado. Concorrentes de practice management (Practice Better) jÃƒÂ¡ oferecem isso nativo.
- [ ] **Biblioteca de receitas/planos reutilizÃƒÂ¡veis:** hoje cada dieta ÃƒÂ© gerada do zero por IA a cada consulta; um nutricionista com 50 pacientes precisa reaproveitar templates de cardÃƒÂ¡pio, nÃƒÂ£o recriar tudo toda vez.
- [ ] **DocumentaÃƒÂ§ÃƒÂ£o para reembolso/nota fiscal:** contexto Brasil Ã¢â‚¬â€� nutricionistas frequentemente precisam emitir recibo para plano de saÃƒÂºde; nÃƒÂ£o existe nada hoje nessa linha (oportunidade de nicho local que concorrentes globais nÃƒÂ£o cobrem bem).
- [ ] **Comunidade/prova social entre pacientes:** o leaderboard hoje ÃƒÂ© sÃƒÂ³ dentro da clÃƒÂ­nica; testar (com cautela, ver comitÃƒÂª de design abaixo) algum elemento de comunidade pode reforÃƒÂ§ar a camada de gamificaÃƒÂ§ÃƒÂ£o, que ÃƒÂ© validada como tendÃƒÂªncia de alto impacto em retenÃƒÂ§ÃƒÂ£o (+30-40% engajamento).
- [ ] **Multi-profissional:** hoje o produto assume 1 nutricionista = 1 clÃƒÂ­nica. ClÃƒÂ­nicas maiores tÃƒÂªm educador fÃƒÂ­sico, psicÃƒÂ³logo, endocrinologista no mesmo caso Ã¢â‚¬â€� vale avaliar (nÃƒÂ£o implementar ainda) um modelo de time ao redor do paciente.

### Descartado pelo comitÃƒÂª (nÃƒÂ£o vale investir agora)
- Marketplace de delivery/supermercado integrado ao plano alimentar Ã¢â‚¬â€� dependÃƒÂªncia de parceria comercial complexa, nÃƒÂ£o ÃƒÂ© o gargalo atual do produto.
- InternacionalizaÃƒÂ§ÃƒÂ£o/mÃƒÂºltiplos idiomas Ã¢â‚¬â€� sem sinal de demanda fora do Brasil ainda.

---

## Ã°Å¸Å½Â¨ ComitÃƒÂª de Design Ã¢â‚¬â€� ValidaÃƒÂ§ÃƒÂ£o de Interfaces (14/07/2026)

Passagem tela a tela pelas duas metades do produto (CRM do nutricionista, app do paciente), depois do redesign e das correÃƒÂ§ÃƒÂµes jÃƒÂ¡ aplicadas.

### CRM do Nutricionista
- Ã¢Å“â€¦ Sidebar escura, badges com ponto, hierarquia visual Ã¢â‚¬â€� validado, jÃƒÂ¡ estÃƒÂ¡ no padrÃƒÂ£o "business" que faltava antes.
- [x] **HistÃƒÂ³rico de peso do paciente ÃƒÂ© uma lista, nÃƒÂ£o um grÃƒÂ¡fico.** Para um CRM clÃƒÂ­nico, evoluÃƒÂ§ÃƒÂ£o de peso/medidas *precisa* ser visual (linha do tempo), nÃƒÂ£o uma lista de linhas de texto Ã¢â‚¬â€� hoje em `PatientList.jsx` (aba prontuÃƒÂ¡rio) ÃƒÂ© sÃƒÂ³ `<li>{data}: {peso}kg</li>`.
- [ ] **Nenhum estado de carregamento visÃƒÂ­vel.** AÃƒÂ§ÃƒÂµes como "Gerar SÃƒÂ­ntese ClÃƒÂ­nica (IA)" e geraÃƒÂ§ÃƒÂ£o de dieta tÃƒÂªm texto de loading ("Analisando..."), mas o resto do CRM (troca de aba, abrir prontuÃƒÂ¡rio) nÃƒÂ£o tem nenhuma transiÃƒÂ§ÃƒÂ£o/skeleton Ã¢â‚¬â€� troca ÃƒÂ© instantÃƒÂ¢nea e seca.
- [ ] **Sidebar fixa em 260px nÃƒÂ£o foi testada em tablet/janela estreita.** O CRM ÃƒÂ© claramente desenhado para desktop; nÃƒÂ£o hÃƒÂ¡ breakpoint definido Ã¢â‚¬â€� se um nutricionista usar em tablet (cenÃƒÂ¡rio comum em consultÃƒÂ³rio), a sidebar provavelmente quebra o layout.
- `[x]` **Modais de "Novo Agendamento"/"Novo Paciente" nÃ£o tÃªm validaÃ§Ã£o inline nem foco automÃ¡tico no primeiro campo** â€” O modal de Paciente foi refeito para ser adaptativo, com feedback de sucesso em tela, resolvendo a usabilidade bÃ¡sica.

### App do Paciente
- Ã¢Å“â€¦ Bottom nav com rÃƒÂ³tulos e sem sobreposiÃƒÂ§ÃƒÂ£o, banner de erro inline Ã¢â‚¬â€� validado, corrigido nesta sessÃƒÂ£o.
- `[x]` **Peso ainda Ã© lanÃ§ado via `window.prompt()` nativo do navegador** (`Profile.jsx` â†’ `handleUpdateWeight`) â€” quebra completamente a identidade visual "gamificada" do resto do app; deveria ser um modal com o mesmo `btn-3d`/card style do resto do produto.
- `[x]` **Ã�cone de coraÃ§Ã£o no TopBar (â�¤ï¸�5) sugere um sistema de "vidas" estilo Duolingo que nÃ£o existe de verdade** â€” nÃ£o hÃ¡ penalidade nem lÃ³gica associada a esse nÃºmero, Ã© decorativo. Ou constrÃ³i a mecÃ¢nica de verdade (perder coraÃ§Ã£o ao pular dia) ou remove o Ã­cone â€” hoje Ã© uma promessa visual que engana o paciente.
- [ ] **`DietPlan.jsx` ÃƒÂ© uma lista estÃƒÂ¡tica de refeiÃƒÂ§ÃƒÂµes passadas** Ã¢â‚¬â€� nÃƒÂ£o indica visualmente qual dieta estÃƒÂ¡ ativa vs. histÃƒÂ³rico, nem tem estado por refeiÃƒÂ§ÃƒÂ£o (feito/pendente) como o `QuestBoard` tem. As duas telas mostram a mesma dieta de formas inconsistentes.
- [x] **Nenhum dark mode** Ã¢â‚¬â€� nÃƒÂ£o ÃƒÂ© obrigatÃƒÂ³rio, mas vale decisÃƒÂ£o consciente (ver skill de design usada na auditoria: "nÃƒÂ£o default pra dark mode, mas tambÃƒÂ©m nÃƒÂ£o ignorar a pergunta"). Foi implementado o **Dark Mode Premium** com glassmorphism.
- [ ] **Contraste de cor nÃƒÂ£o verificado formalmente** Ã¢â‚¬â€� vÃƒÂ¡rias combinaÃƒÂ§ÃƒÂµes (texto cinza claro `#94a3b8` sobre branco, badges) estÃƒÂ£o na faixa duvidosa de WCAG AA; precisa de auditoria de contraste real, nÃƒÂ£o sÃƒÂ³ visual.

### ConsistÃƒÂªncia entre os dois mundos
- [ ] **Validado como escolha correta, nÃƒÂ£o como falha:** o CRM (profissional, sÃƒÂ³brio) e o app do paciente (gamificado, colorido) usarem linguagens visuais propositalmente diferentes Ã¢â‚¬â€� ÃƒÂ© o mesmo padrÃƒÂ£o usado por Noom (paciente) vs. Practice Better (profissional), pÃƒÂºblicos diferentes justificam identidades diferentes. NÃƒÂ£o unificar.
- [ ] **Ponto de atrito real:** a transiÃƒÂ§ÃƒÂ£o entre os dois (botÃƒÂ£o "Sair (Trocar Papel)" no CRM, botÃƒÂµes "Modo Nutricionista/Paciente" no login) ÃƒÂ© um artefato de demonstraÃƒÂ§ÃƒÂ£o, nÃƒÂ£o um fluxo de produto real Ã¢â‚¬â€� nenhum usuÃƒÂ¡rio real alterna entre os dois papÃƒÂ©is livremente. Antes de lanÃƒÂ§ar, decidir se esse seletor deve sumir da experiÃƒÂªncia de produÃƒÂ§ÃƒÂ£o (ficando sÃƒÂ³ como atalho de dev/QA).

---

## Ã°Å¸â€ºÃ¯Â¸ ComitÃƒÂª de Produto Ã¢â‚¬â€� DecisÃƒÂµes Finais e PriorizaÃƒÂ§ÃƒÂ£o (14/07/2026)

SÃƒÂ­ntese dos dois comitÃƒÂªs acima em uma ordem de execuÃƒÂ§ÃƒÂ£o ÃƒÂºnica. CritÃƒÂ©rio: o que reduz risco (seguranÃƒÂ§a/confiabilidade) vem antes do que aumenta valor (features novas), e dentro de "valor" o diferencial competitivo (Cohorts) vem antes de conveniÃƒÂªncia.

**Onda 1 Ã¢â‚¬â€� Antes de qualquer usuÃƒÂ¡rio real usar o produto**
1. SeguranÃƒÂ§a e confiabilidade (bloco jÃƒÂ¡ detalhado acima) Ã¢â‚¬â€� sem isso, nenhuma feature nova importa.
2. Peso via modal em vez de `prompt()` nativo, remoÃƒÂ§ÃƒÂ£o/decisÃƒÂ£o sobre o ÃƒÂ­cone de coraÃƒÂ§ÃƒÂ£o decorativo Ã¢â‚¬â€� baratos, resolvem a sensaÃƒÂ§ÃƒÂ£o de "inacabado" apontada pelo comitÃƒÂª de design.
3. Decidir e remover (ou manter sÃƒÂ³ em dev) o seletor "Trocar Papel" Ã¢â‚¬â€� hoje ÃƒÂ© o maior sinal visual de que o produto ainda ÃƒÂ© um protÃƒÂ³tipo.

**Onda 2 Ã¢â‚¬â€� O diferencial competitivo (maior retorno por esforÃƒÂ§o)**
4. Cohorts real: modelo de previsÃƒÂ£o + envio de fato do alerta. Este ÃƒÂ© o item que o comitÃƒÂª de produto inovador e a pesquisa de mercado apontam como o maior diferencial Ã¢â‚¬â€� prioridade mÃƒÂ¡xima entre as features novas.
5. [x] GrÃƒÂ¡fico de evoluÃƒÂ§ÃƒÂ£o de peso no CRM (troca lista Ã¢â€ â€™ linha do tempo) Ã¢â‚¬â€� prÃƒÂ©-requisito visual para o Cohorts parecer "inteligente" de verdade.
6. Contexto biomÃƒÂ©trico no Vytal Bot (mesmo que sÃƒÂ³ manual no inÃƒÂ­cio, sem integrar wearable ainda) Ã¢â‚¬â€� data mÃƒÂ­nima para comeÃƒÂ§ar a construir a diferenciaÃƒÂ§ÃƒÂ£o de IA clÃƒÂ­nica.

**Onda 3 Ã¢â‚¬â€� MonetizaÃƒÂ§ÃƒÂ£o e crescimento**
7. Stripe real + limite de plano aplicado.
8. [x] Landing page com proposta de valor.
9. Canal de mensagens diretas nutricionistaÃ¢â€ â€�paciente.

**Onda 4 Ã¢â‚¬â€� Investimentos maiores, validar demanda antes**
10. Wearables/CGM, telemedicina em vÃƒÂ­deo, biblioteca de receitas reutilizÃƒÂ¡veis, comunidade entre pacientes, multi-profissional.

**NÃƒÂ£o fazer agora (decisÃƒÂ£o explÃƒÂ­cita do comitÃƒÂª):** marketplace de delivery, internacionalizaÃƒÂ§ÃƒÂ£o, dark mode como prioridade (fica como nice-to-have de design, nÃƒÂ£o bloqueia nada).

---

## Ã°Å¸â€™Â¡ Ideias novas do usuÃƒÂ¡rio (14/07/2026)

- [x] **Sino de notificaÃƒÂ§ÃƒÂ£o no app do paciente** Ã¢â‚¬â€� implementado. Quando o nutricionista clica "Enviar Alerta" (Cohorts), uma notificaÃƒÂ§ÃƒÂ£o real ÃƒÂ© criada (`addNotification` no `AppContext.jsx`) e aparece no sino do `TopBar` do paciente, com contador de nÃƒÂ£o lidas.
- [x] **Biblioteca de templates de dieta reutilizÃƒÂ¡veis:** o nutricionista deveria poder salvar um plano completo (30 dias, 6 refeiÃƒÂ§ÃƒÂ£o, suplementos/vitaminas) como template, em vez de digitar tudo do zero em cada consulta.
- [ ] **Anexar template a um paciente:** a partir da biblioteca acima, aplicar um template existente diretamente ao prontuÃƒÂ¡rio de um paciente (com opÃƒÂ§ÃƒÂ£o de ajustar antes de confirmar).
- [x] **Receitas para o paciente (bÃƒÂ´nus):** o paciente deveria poder receber receitas Ã¢â‚¬â€� geradas por IA ou buscadas na internet Ã¢â‚¬â€� anexadas numa aba prÃƒÂ³pria de "Receitas", separada do plano alimentar estruturado. Onde encaixar: provavelmente uma nova aba na bottom nav do paciente (`DietPlan`/`QuestBoard` jÃƒÂ¡ estÃƒÂ£o cheios) ou uma seÃƒÂ§ÃƒÂ£o dentro de `DietPlan.jsx`.

---

## Ã¢Å“â€¦ Onda 1 Ã¢â‚¬â€� Executada (14/07/2026)

- [x] Chave da OpenAI removida do lado paciente (chat + foto de refeiÃƒÂ§ÃƒÂ£o) Ã¢â‚¬â€� agora usa `/api/openai-bridge`, igual ao lado nutricionista. `src/services/openaiService.js` (ÃƒÂ³rfÃƒÂ£o) apagado.
- [x] Guard de rota real em `/nutri` e `/paciente` (`App.jsx` Ã¢â€ â€™ `RequireAuth`) Ã¢â‚¬â€� bloqueia acesso sem sessÃƒÂ£o em produÃƒÂ§ÃƒÂ£o; em dev (`import.meta.env.DEV`) deixa passar, e os botÃƒÂµes de atalho no `Login.jsx` sÃƒÂ³ aparecem em dev.
- [x] `firestore.rules` criado na raiz do projeto, isolando `patients`/`appointments` por `nutricionista_id`. **Ainda precisa ser publicado manualmente** (Firebase Console ou `firebase deploy --only firestore:rules` no projeto `nutribase-fea35`) Ã¢â‚¬â€� nenhuma automaÃƒÂ§ÃƒÂ£o faz esse deploy sozinha.
- [x] Peso do paciente: trocado `window.prompt()` por modal prÃƒÂ³prio em `Profile.jsx`.
- [x] Ãƒcone de coraÃƒÂ§ÃƒÂ£o decorativo removido do `TopBar` (nÃƒÂ£o tinha mecÃƒÂ¢nica real associada).
- [ ] **VerificaÃƒÂ§ÃƒÂ£o ao vivo pendente:** rodei lint (sem erros novos) e confirmei via cÃƒÂ³digo que o guard nÃƒÂ£o bloqueia o modo dev, mas a automaÃƒÂ§ÃƒÂ£o de navegador desta sessÃƒÂ£o ficou instÃƒÂ¡vel no meio do teste do modal de peso e do chat Ã¢â‚¬â€� vale um clique manual rÃƒÂ¡pido em `/paciente` Ã¢â€ â€™ Vytal Bot e Perfil Ã¢â€ â€™ Informar Meu Peso antes de considerar 100% validado.
- [ ] Instabilidade do canal de escrita do Firestore (erro 503 observado nos testes) nÃƒÂ£o foi resolvida Ã¢â‚¬â€� ÃƒÂ© de infraestrutura/rede do ambiente, nÃƒÂ£o do cÃƒÂ³digo. O padrÃƒÂ£o "local-first" jÃƒÂ¡ em uso evita que isso trave a UI, mas vale investigar se persiste fora deste ambiente de dev.
- [ ] "Trocar Papel" no CRM (`Sair (Trocar Papel)`) foi mantido como estÃƒÂ¡ Ã¢â‚¬â€� na prÃƒÂ¡tica sÃƒÂ³ navega pra landing page, nÃƒÂ£o ÃƒÂ© um bypass de seguranÃƒÂ§a como os botÃƒÂµes do Login.

---

## Ã¢Å“â€¦ Executado em 15/07/2026 (ExperiÃƒÂªncia Premium e CorreÃƒÂ§ÃƒÂµes de Cadastro)

- [x] **UX Redesign (App do Paciente):** MigraÃƒÂ§ÃƒÂ£o do visual "infantil" para um "Dark Mode Premium" focado em alta performance.
  - Implementado **Glassmorphism** e cores neon para acentos.
  - O `QuestBoard` abandonou a lista simples de tarefas e ganhou um **GrÃƒÂ¡fico Circular de Progresso** centralizado.
  - Introduzido o **ShareableMilestone**: um cartÃƒÂ£o hologrÃƒÂ¡fico que aparece quando o paciente atinge 100% da dieta diÃƒÂ¡ria, pensado para gerar compartilhamento viral no Instagram.
- [x] **CorreÃƒÂ§ÃƒÂµes de Cadastro e Convite:**
  - Impedida a criaÃƒÂ§ÃƒÂ£o de pacientes duplicados (mesmo CPF ou E-mail) para o mesmo nutricionista.
  - Melhorada a UI do link de convite gerado, com botÃƒÂ£o de copiar fÃƒÂ¡cil.
  - Implementado envio automÃƒÂ¡tico de convite por e-mail via `mailto:` no momento do cadastro do paciente pelo nutricionista.
- [x] **Bugfix CrÃƒÂ­tico (ProduÃƒÂ§ÃƒÂ£o):**
  - Corrigido problema onde o link de convite (`/paciente?vincular=...`) redirecionava incorretamente o paciente para a tela de `/login` devido a um bloqueio do `RequireAuth`. A prÃƒÂ³pria tela do paciente agora gerencia o onboarding sem bloquear links externos.
- [x] **Deploy & Firebase Auth (Bugfixes):**
  - Adicionado `vercel.json` para corrigir erros `404: NOT_FOUND` da Vercel ao recarregar a pÃƒÂ¡gina ou acessar a URL diretamente pelo celular.
  - Criado utilitÃƒÂ¡rio `firebaseErrors.js` para interceptar erros do Firebase Auth e traduzi-los para mensagens amigÃƒÂ¡veis ao usuÃƒÂ¡rio (ex: `auth/invalid-credential` virou `E-mail ou senha invÃƒÂ¡lidos`).
- [ ] **Problema a investigar (Edge Case):** Como tratar pacientes que usam a plataforma com **mÃƒÂºltiplos nutricionistas diferentes**. O sistema hoje cruza a base de CPF isolada por nutricionista, mas pode haver conflito se o mesmo paciente for convidado por dois profissionais distintos.
- [x] **Acompanhamento de RefeiÃƒÂ§ÃƒÂµes no App do Paciente:** No protocolo vigente (app do paciente), implementar a possibilidade de a pessoa marcar um check se comeu no horÃƒÂ¡rio e seguiu a dieta. Caso nÃƒÂ£o, abrir campo para ela informar o que comeu, preenchendo a lacuna da avaliaÃƒÂ§ÃƒÂ£o pela IA (que ainda nÃƒÂ£o estÃƒÂ¡ totalmente funcional no modo paciente).

## SolicitaÃ§Ãµes Futuras (Backlog)
- [x] SugestÃ£o e montagem de exercÃ­cios/repetiÃ§Ãµes usando um comitÃª de profissionais (IA personal).
- [x] Registro de sono no app.
- [ ] DetecÃ§Ã£o de ansiedade alimentar pela IA.
- [ ] Upload de exames pelo paciente (EvoluÃ§Ã£o ClÃ­nica VIP).

### IntegraÃ§Ã£o WhatsApp Proativa (Conversational AI & Lembretes)
- [ ] **Lembretes de RefeiÃ§Ã£o:** Bot envia "EstÃ¡ na hora do seu cafÃ© da manhÃ£, jÃ¡ preparou?" baseado no horÃ¡rio da dieta.
- [ ] **Monitoramento de Engajamento:** IA analisa os "food logs" e alerta o paciente caso registre muita "besteira" ou refeiÃ§Ãµes livres no mesmo dia ("VocÃª saiu muito da dieta, cuidado pra nÃ£o perder o foco!").
- [ ] **ConfirmaÃ§Ã£o de Agenda:** Bot pergunta na vÃ©spera da consulta ("VocÃª tem uma agenda amanhÃ£, podemos confirmar?").
- [ ] **Stack NecessÃ¡ria:** Para isso funcionar, precisaremos de:
  1. API de WhatsApp (Oficial da Meta ou provedores como Evolution API / Baileys).
  2. Workers de Background / Cron Jobs (ex: Vercel Cron ou agenda.js) para checar horÃ¡rios de refeiÃ§Ã£o e disparar mensagens proativamente.
  3. Webhooks para escutar as respostas do paciente no WhatsApp.
  4. Agente de IA para classificar o histÃ³rico diÃ¡rio de logs do paciente (foodLogs) e definir o "tom" da cobranÃ§a.

- [ ] **Check-in via WhatsApp (Zero-Friction):** Permitir que o paciente responda os lembretes com texto ("Sim, jÃ¡ comi") ou envie foto do prato. A IA (Vision) avalia a foto e registra o check-in no banco de dados automaticamente, dando o XP sem o paciente abrir o app.

### ðŸš€ BATCH PARA A PRÃ“XIMA VERSÃƒO: Agente Ativo de SaÃºde
- [ ] **IntegraÃ§Ã£o WhatsApp Proativa:** 
  - Lembretes de RefeiÃ§Ã£o automÃ¡ticos.
  - Alerta de saÃ­da da dieta no fim do dia (IntervenÃ§Ã£o Comportamental).
  - ConfirmaÃ§Ã£o automÃ¡tica de agendamentos.
- [ ] **Check-in Zero-Friction:** Permitir que o paciente envie a foto do prato no WhatsApp e a IA Vision registre o XP automaticamente no app.
- [ ] **Detetive Comportamental da IA:** MÃ³dulo de anÃ¡lise em background que cruza mensagens de chat, logs de sono e comida para alertar o nutricionista sobre: CompulsÃ£o Noturna, FlutuaÃ§Ã£o Hormonal (TPM), Burnout, DesidrataÃ§Ã£o, Autossabotagem e Risco de LesÃ£o (Over-training).
- [ ] Implementar funcionalidade de upload e análise de Exames (PDF) na tela de Perfil.
- [ ] Cadastro self-service sem convite: Paciente cria conta, vê lista de nutris na plataforma, marca consulta e solicita vínculo.

- [ ] **Melhorar a regra de XP/Engajamento**: Revisar como o ganho de XP impacta o status de pacientes que jÃ¡ tiveram alta adesÃ£o e pararam, vs novos pacientes, para garantir que o tracking de 'Perdendo foco' faÃ§a sentido em longo prazo.
- [x] **Síntese Diária/Semanal com IA (Nutri):** O sistema deve compilar um resumo automático baseado no histórico do paciente (água, sono, food logs) e entregar mastigado para o nutricionista ler rápido antes da consulta. **Integração com Cohorts:** A síntese deve alertar ativamente se o paciente estiver entrando no grupo de risco (Perdendo Foco), cruzando a queda de engajamento (dieta/sono) com o risco de abandono.
