# Roadmap do Produto â€” Vytal (VisÃ£o de PM)

Este documento traduz os aprendizados das trilhas de Product Management (0â†’1 e 1â†’100) em um backlog acionÃ¡vel para o Vytal. NÃ³s jÃ¡ concluÃ­mos as Fases de Discovery e o protÃ³tipo inicial. Agora, focaremos nas prÃ³ximas fases dos frameworks de PM.

> **Nota (14/07/2026):** uma auditoria de produto encontrou vÃ¡rios itens abaixo marcados `[x]` que nÃ£o correspondiam ao estado real do cÃ³digo (existiam sÃ³ como mock/decorativo). Foram desmarcados e detalhados em `spec.md`. Tratar esta lista como o estado real, nÃ£o aspiracional.

---

## ðŸš€ FASE 5: MVP Spec & Build (FinalizaÃ§Ã£o)
*Objetivo: Substituir as gambiarras do protÃ³tipo (mocks/dados na memÃ³ria) por uma infraestrutura viÃ¡vel para o mundo real, garantindo que o "walking skeleton" suporte usuÃ¡rios de verdade.*

- [x] **Core UI & Roteamento:** Telas separadas para Paciente e Nutricionista com navegaÃ§Ã£o fluida.
- [x] **IA Nativa (Frontend):** GeraÃ§Ã£o de cardÃ¡pios, ChatBot (Vytal Bot) e leitor de PDF (pdf.js) integrados no navegador.
- [x] **Banco de Dados Real (Supabase/Firebase):** 
  - Migrar o estado global (`AppContext.jsx`) para tabelas SQL (UsuÃ¡rios, Pacientes, Receitas, Consultas).
- [x] **AutenticaÃ§Ã£o:** 
  - Login seguro (Email/Senha) para que cada paciente veja apenas seus prÃ³prios dados.
- [ ] **SeguranÃ§a de API:**
  - Remover a chave da OpenAI do cÃ³digo Frontend (`VITE_OPENAI_API_KEY`). *(Feito sÃ³ do lado do nutricionista, via `api/openai-bridge.js`. O lado do paciente â€” chat e foto de refeiÃ§Ã£o â€” ainda chama a OpenAI direto do navegador com a chave exposta.)*
  - Criar uma **Edge Function / Serverless Function** para fazer a ponte com a IA com seguranÃ§a. *(Existe para o nutricionista; falta estender ao paciente.)*

---

## ðŸ“ˆ FASE 6: Launch & Early Traction (Go-to-Market)
*Objetivo: LanÃ§ar para early adopters, instrumentar mÃ©tricas desde o Dia 1 e otimizar para a North Star Metric (ex: % de pacientes engajados na gamificaÃ§Ã£o).*

- [ ] **InstrumentaÃ§Ã£o de AARRR:**
  - Instalar PostHog ou Google Analytics para medir Activation (Pacientes que usam >3 dias seguidos) e Retention. *(SÃ³ o Firebase Analytics estÃ¡ inicializado, sem nenhum evento customizado disparado ainda.)*
- [x] **PWA (Progressive Web App):** 
  - Configurar `manifest.json` e Service Worker para permitir que o Paciente instale o Vytal no celular direto pelo navegador.
- [x] **Loop de Feedback:** 
  - Inserir botÃ£o de reporte rÃ¡pido de bugs/sugestÃµes dentro do app.
- [x] **Deploy de LanÃ§amento:** 
  - Publicar Frontend no Vercel/Netlify.
- [x] **Checklist de Launch (Aula 3.15):** Validar integraÃ§Ã£o, suporte, e comunicaÃ§Ã£o de boas-vindas aos primeiros pacientes e nutricionistas.

---

## ðŸ�� FASE 7: Product-Market Fit
*Objetivo: Confirmar que a retenÃ§Ã£o achatou na curva e que o LTV > CAC, aplicando a pesquisa Sean Ellis.*

- [ ] **Pesquisa Sean Ellis:** 
  - Disparar survey: *"Como vocÃª se sentiria se o Vytal deixasse de existir?"* (Meta: >40% Muito Desapontado).
- [ ] **Growth Features (PLG):** 
  - Sistema de convite orgÃ¢nico (Indique o Nutri e ganhe uma avaliaÃ§Ã£o grÃ¡tis).
  - **Self-Service Sign Up:** Permitir que o paciente faÃ§a cadastro avulso pelo app e ganhe 1 Consulta GrÃ¡tis com a IA (Vytal Bot) para testar a experiÃªncia.
- [x] **Monitoramento de RetenÃ§Ã£o:**
  - Dashboards em tempo real do nÃ­vel de XP e Ofensiva dos pacientes.

---

## ðŸ�¢ JORNADA 1â†’100: Scale & MonetizaÃ§Ã£o
*Objetivo: Quando o PMF for alcanÃ§ado, construir os alicerces financeiros e B2B.*

- [ ] **Sistema de Assinaturas (Billing):**
  - IntegraÃ§Ã£o com Stripe para cobrar mensalidades dos Nutricionistas (SaaS). *(Tela de "Assinar Premium" existe, mas sem checkout real conectado.)*
- [~] **Multitenancy (White-Label):**
  - Permitir que ClÃ­nicas grandes personalizem as cores do app para seus pacientes. *(Nome/cor da clÃ­nica funcionam; falta isolar dados entre clÃ­nicas de verdade no backend.)*
- [ ] **InteligÃªncia de Cohorts (Aula de PM):**
  - Algoritmo que prevÃª quais pacientes estÃ£o prestes a abandonar a dieta e alerta o nutricionista no CRM. *(A tela existe e Ã© o ponto forte visual do produto, mas o "risco de abandono" hoje Ã© um campo estÃ¡tico do mock, nÃ£o uma previsÃ£o real; o alerta nÃ£o Ã© enviado de verdade ainda.)*

---

## ðŸ“‹ Backlog de Features Pendentes (14/07/2026)

Consolidado a partir da auditoria de produto e do `spec.md`. Ordenado por prioridade dentro de cada bloco â€” nÃ£o Ã© uma lista de bugs (esses jÃ¡ foram corrigidos), Ã© o que falta **construir**.

### SeguranÃ§a e confiabilidade (bloqueia produÃ§Ã£o real)
- [ ] Mover as chamadas de IA do lado paciente (chat + foto de refeiÃ§Ã£o) para o proxy server-side (`api/openai-bridge.js`), removendo `VITE_OPENAI_API_KEY` do bundle do cliente.
- [ ] Guard de rota real: redirecionar `/nutri` e `/paciente` para `/login` quando nÃ£o hÃ¡ sessÃ£o ativa (hoje dÃ¡ pra acessar direto pela URL).
- [ ] Regras de seguranÃ§a no Firestore que isolem dados por paciente/clÃ­nica no servidor â€” hoje o filtro Ã© sÃ³ visual no cliente.
- [ ] Investigar e resolver a instabilidade do canal de escrita do Firestore (erro 503 recorrente) antes de depender dele em produÃ§Ã£o.
- [ ] **Edge Case Estrutural:** Tratar o cenÃ¡rio onde um mesmo paciente (mesmo CPF/E-mail) Ã© atendido por mais de um nutricionista na plataforma (atualmente o modelo assume relacionamento 1:N restrito via `nutricionista_id`).

### MonetizaÃ§Ã£o
- [ ] IntegraÃ§Ã£o real com Stripe (checkout, webhooks de assinatura, bloqueio de features por plano).
- [ ] LÃ³gica de limite de pacientes por plano (hoje "Limite de 5 pacientes" Ã© sÃ³ texto, nÃ£o Ã© aplicado).

### InteligÃªncia de Cohorts (o maior diferencial do produto â€” vale investir aqui primeiro entre as features "grandes")
- [x] Modelo real de previsÃ£o de abandono (hoje Ã© um campo estÃ¡tico `em_risco` no mock), usando streak, adesÃ£o e frequÃªncia de login.
- [x] Envio de fato do alerta de risco (WhatsApp Business API, e-mail transacional, ou push notification) â€” hoje sÃ³ registra em `alert()`.
- [x] VisÃ£o "Patient 360": um painel Ãºnico por paciente reunindo plano, food log, check-ins, peso, mensagens e anotaÃ§Ãµes (hoje estÃ¡ espalhado em abas separadas).

### ComunicaÃ§Ã£o nutricionista â†” paciente
- [ ] Canal de mensagens diretas entre nutricionista e paciente (hoje sÃ³ existe o Vytal Bot de IA; nÃ£o hÃ¡ como o profissional mandar uma mensagem real).
- [ ] NotificaÃ§Ãµes push/e-mail para o paciente quando uma nova dieta Ã© prescrita ou uma consulta Ã© confirmada.

### Analytics e instrumentaÃ§Ã£o
- [ ] Eventos customizados de produto (ativaÃ§Ã£o, retenÃ§Ã£o, funil de onboarding) â€” hoje sÃ³ o Firebase Analytics estÃ¡ inicializado, sem nenhum evento disparado.
- [ ] Pesquisa de PMF (Sean Ellis) â€” depende de ter uma base real de usuÃ¡rios antes de fazer sentido.

### Growth / aquisiÃ§Ã£o
- [ ] Sistema de convite orgÃ¢nico (indicaÃ§Ã£o premiada).
- [x] Landing page com proposta de valor real (hoje Ã© sÃ³ um seletor de botÃµes â€” ver auditoria de UX).

### DecisÃµes de produto pendentes (nÃ£o sÃ£o bugs, sÃ£o escolhas)
- [ ] Decidir o destino de `LearnPath.jsx`/`Quiz.jsx` â€” trilha de aprendizado gamificada estilo Duolingo, jÃ¡ prototipada mas nunca conectada Ã s rotas. Reativar (precisa de conteÃºdo real) ou remover.
- [ ] Decidir se o app do paciente precisa de wearables/CGM (Apple Watch, Google Fit, glicose contÃ­nua) â€” Ã© tendÃªncia forte do mercado 2026, mas Ã© investimento grande; nÃ£o comeÃ§ar sem validar demanda.

### Qualidade
- [ ] Nenhum teste automatizado existe no projeto hoje (unitÃ¡rio, integraÃ§Ã£o ou E2E). Priorizar cobertura pelo menos nos fluxos crÃ­ticos: login, criar/editar paciente, agendar consulta, prescrever dieta.

---

## ðŸ§­ ComitÃª de Produto Inovador â€” ValidaÃ§Ã£o de Features (14/07/2026)

AvaliaÃ§Ã£o do que jÃ¡ existe vs. o que um produto de referÃªncia em nutriÃ§Ã£o digital (Nutrium, Practice Better, MealCircle do lado profissional; Noom, MyFitnessPal, HealthifyMe do lado paciente) precisa ter em 2026, cruzado com o combo que sÃ³ o Vytal tenta fazer hoje: CRM + gamificaÃ§Ã£o + IA num produto sÃ³.

### Validado â€” manter e priorizar
- **Combo CRM + app gamificado + IA clÃ­nica.** Ã‰ o ponto de diferenciaÃ§Ã£o real. Nenhum concorrente pesquisado junta os trÃªs; a maioria Ã© ou ferramenta de gestÃ£o (Nutrium, Practice Better) ou app de paciente (Noom, MyFitnessPal). Vale proteger esse posicionamento em vez de diluir com features genÃ©ricas.
- **Vytal Bot com contexto do plano ativo.** JÃ¡ responde considerando a dieta prescrita â€” alinhado com a tendÃªncia de "IA + SaÃºde ClÃ­nica" apontada pela pesquisa de mercado, mas ainda sem dados biomÃ©tricos.
- **Cohorts / risco de abandono no CRM.** Validado como o recurso de maior potencial competitivo â€” nenhum concorrente pequeno oferece isso hoje pronto; precisa sÃ³ deixar de ser mock (jÃ¡ listado no backlog acima).
- **AnÃ¡lise de exame em PDF via IA.** Diferencial real frente a concorrentes puramente "app de dieta" â€” poucos cruzam exame laboratorial com prescriÃ§Ã£o automaticamente.

### Gaps identificados â€” features que faltam
- [x] **Contexto biomÃ©trico no Vytal Bot e na geraÃ§Ã£o de dieta:** conectar dados de sono/atividade (Apple Health, Google Fit) para a IA ajustar recomendaÃ§Ãµes â€” Ã© citado como "linha de base esperada" pelos apps premium de 2026, hoje o Vytal sÃ³ usa dados manuais (peso via `prompt()`).
- [x] **Food log fora do plano prescrito:** hoje sÃ³ existe o "Comeu algo diferente?" com foto avulsa; falta um diÃ¡rio alimentar livre (sem depender de ter uma dieta ativa) para pacientes em fase de diagnÃ³stico/anamnese, antes da primeira prescriÃ§Ã£o.
- [ ] **Telemedicina/consulta em vÃ­deo integrada:** hoje a "consulta" no CRM Ã© sÃ³ um formulÃ¡rio preenchido pelo nutricionista; nÃ£o hÃ¡ chamada de vÃ­deo nem histÃ³rico de sessÃ£o gravado. Concorrentes de practice management (Practice Better) jÃ¡ oferecem isso nativo.
- [ ] **Biblioteca de receitas/planos reutilizÃ¡veis:** hoje cada dieta Ã© gerada do zero por IA a cada consulta; um nutricionista com 50 pacientes precisa reaproveitar templates de cardÃ¡pio, nÃ£o recriar tudo toda vez.
- [ ] **DocumentaÃ§Ã£o para reembolso/nota fiscal:** contexto Brasil â€” nutricionistas frequentemente precisam emitir recibo para plano de saÃºde; nÃ£o existe nada hoje nessa linha (oportunidade de nicho local que concorrentes globais nÃ£o cobrem bem).
- [ ] **Comunidade/prova social entre pacientes:** o leaderboard hoje Ã© sÃ³ dentro da clÃ­nica; testar (com cautela, ver comitÃª de design abaixo) algum elemento de comunidade pode reforÃ§ar a camada de gamificaÃ§Ã£o, que Ã© validada como tendÃªncia de alto impacto em retenÃ§Ã£o (+30-40% engajamento).
- [ ] **Multi-profissional:** hoje o produto assume 1 nutricionista = 1 clÃ­nica. ClÃ­nicas maiores tÃªm educador fÃ­sico, psicÃ³logo, endocrinologista no mesmo caso â€” vale avaliar (nÃ£o implementar ainda) um modelo de time ao redor do paciente.

### Descartado pelo comitÃª (nÃ£o vale investir agora)
- Marketplace de delivery/supermercado integrado ao plano alimentar â€” dependÃªncia de parceria comercial complexa, nÃ£o Ã© o gargalo atual do produto.
- InternacionalizaÃ§Ã£o/mÃºltiplos idiomas â€” sem sinal de demanda fora do Brasil ainda.

---

## ðŸŽ¨ ComitÃª de Design â€” ValidaÃ§Ã£o de Interfaces (14/07/2026)

Passagem tela a tela pelas duas metades do produto (CRM do nutricionista, app do paciente), depois do redesign e das correÃ§Ãµes jÃ¡ aplicadas.

### CRM do Nutricionista
- âœ… Sidebar escura, badges com ponto, hierarquia visual â€” validado, jÃ¡ estÃ¡ no padrÃ£o "business" que faltava antes.
- [x] **HistÃ³rico de peso do paciente Ã© uma lista, nÃ£o um grÃ¡fico.** Para um CRM clÃ­nico, evoluÃ§Ã£o de peso/medidas *precisa* ser visual (linha do tempo), nÃ£o uma lista de linhas de texto â€” hoje em `PatientList.jsx` (aba prontuÃ¡rio) Ã© sÃ³ `<li>{data}: {peso}kg</li>`.
- [ ] **Nenhum estado de carregamento visÃ­vel.** AÃ§Ãµes como "Gerar SÃ­ntese ClÃ­nica (IA)" e geraÃ§Ã£o de dieta tÃªm texto de loading ("Analisando..."), mas o resto do CRM (troca de aba, abrir prontuÃ¡rio) nÃ£o tem nenhuma transiÃ§Ã£o/skeleton â€” troca Ã© instantÃ¢nea e seca.
- [ ] **Sidebar fixa em 260px nÃ£o foi testada em tablet/janela estreita.** O CRM Ã© claramente desenhado para desktop; nÃ£o hÃ¡ breakpoint definido â€” se um nutricionista usar em tablet (cenÃ¡rio comum em consultÃ³rio), a sidebar provavelmente quebra o layout.
- [ ] **Modais de "Novo Agendamento"/"Novo Paciente" nÃ£o tÃªm validaÃ§Ã£o inline nem foco automÃ¡tico no primeiro campo** â€” dependem sÃ³ da validaÃ§Ã£o nativa do browser (`required`), que Ã© inconsistente entre navegadores.

### App do Paciente
- âœ… Bottom nav com rÃ³tulos e sem sobreposiÃ§Ã£o, banner de erro inline â€” validado, corrigido nesta sessÃ£o.
- [ ] **Peso ainda Ã© lanÃ§ado via `window.prompt()` nativo do navegador** (`Profile.jsx` â†’ `handleUpdateWeight`) â€” quebra completamente a identidade visual "gamificada" do resto do app; deveria ser um modal com o mesmo `btn-3d`/card style do resto do produto.
- [ ] **Ã�cone de coraÃ§Ã£o no TopBar (â�¤ï¸� 5) sugere um sistema de "vidas" estilo Duolingo que nÃ£o existe de verdade** â€” nÃ£o hÃ¡ penalidade nem lÃ³gica associada a esse nÃºmero, Ã© decorativo. Ou constrÃ³i a mecÃ¢nica de verdade (perder coraÃ§Ã£o ao pular dia) ou remove o Ã­cone â€” hoje Ã© uma promessa visual que engana o paciente.
- [ ] **`DietPlan.jsx` Ã© uma lista estÃ¡tica de refeiÃ§Ãµes passadas** â€” nÃ£o indica visualmente qual dieta estÃ¡ ativa vs. histÃ³rico, nem tem estado por refeiÃ§Ã£o (feito/pendente) como o `QuestBoard` tem. As duas telas mostram a mesma dieta de formas inconsistentes.
- [x] **Nenhum dark mode** â€” nÃ£o Ã© obrigatÃ³rio, mas vale decisÃ£o consciente (ver skill de design usada na auditoria: "nÃ£o default pra dark mode, mas tambÃ©m nÃ£o ignorar a pergunta"). Foi implementado o **Dark Mode Premium** com glassmorphism.
- [ ] **Contraste de cor nÃ£o verificado formalmente** â€” vÃ¡rias combinaÃ§Ãµes (texto cinza claro `#94a3b8` sobre branco, badges) estÃ£o na faixa duvidosa de WCAG AA; precisa de auditoria de contraste real, nÃ£o sÃ³ visual.

### ConsistÃªncia entre os dois mundos
- [ ] **Validado como escolha correta, nÃ£o como falha:** o CRM (profissional, sÃ³brio) e o app do paciente (gamificado, colorido) usarem linguagens visuais propositalmente diferentes â€” Ã© o mesmo padrÃ£o usado por Noom (paciente) vs. Practice Better (profissional), pÃºblicos diferentes justificam identidades diferentes. NÃ£o unificar.
- [ ] **Ponto de atrito real:** a transiÃ§Ã£o entre os dois (botÃ£o "Sair (Trocar Papel)" no CRM, botÃµes "Modo Nutricionista/Paciente" no login) Ã© um artefato de demonstraÃ§Ã£o, nÃ£o um fluxo de produto real â€” nenhum usuÃ¡rio real alterna entre os dois papÃ©is livremente. Antes de lanÃ§ar, decidir se esse seletor deve sumir da experiÃªncia de produÃ§Ã£o (ficando sÃ³ como atalho de dev/QA).

---

## ðŸ�›ï¸� ComitÃª de Produto â€” DecisÃµes Finais e PriorizaÃ§Ã£o (14/07/2026)

SÃ­ntese dos dois comitÃªs acima em uma ordem de execuÃ§Ã£o Ãºnica. CritÃ©rio: o que reduz risco (seguranÃ§a/confiabilidade) vem antes do que aumenta valor (features novas), e dentro de "valor" o diferencial competitivo (Cohorts) vem antes de conveniÃªncia.

**Onda 1 â€” Antes de qualquer usuÃ¡rio real usar o produto**
1. SeguranÃ§a e confiabilidade (bloco jÃ¡ detalhado acima) â€” sem isso, nenhuma feature nova importa.
2. Peso via modal em vez de `prompt()` nativo, remoÃ§Ã£o/decisÃ£o sobre o Ã­cone de coraÃ§Ã£o decorativo â€” baratos, resolvem a sensaÃ§Ã£o de "inacabado" apontada pelo comitÃª de design.
3. Decidir e remover (ou manter sÃ³ em dev) o seletor "Trocar Papel" â€” hoje Ã© o maior sinal visual de que o produto ainda Ã© um protÃ³tipo.

**Onda 2 â€” O diferencial competitivo (maior retorno por esforÃ§o)**
4. Cohorts real: modelo de previsÃ£o + envio de fato do alerta. Este Ã© o item que o comitÃª de produto inovador e a pesquisa de mercado apontam como o maior diferencial â€” prioridade mÃ¡xima entre as features novas.
5. [x] GrÃ¡fico de evoluÃ§Ã£o de peso no CRM (troca lista â†’ linha do tempo) â€” prÃ©-requisito visual para o Cohorts parecer "inteligente" de verdade.
6. Contexto biomÃ©trico no Vytal Bot (mesmo que sÃ³ manual no inÃ­cio, sem integrar wearable ainda) â€” data mÃ­nima para comeÃ§ar a construir a diferenciaÃ§Ã£o de IA clÃ­nica.

**Onda 3 â€” MonetizaÃ§Ã£o e crescimento**
7. Stripe real + limite de plano aplicado.
8. [x] Landing page com proposta de valor.
9. Canal de mensagens diretas nutricionistaâ†”paciente.

**Onda 4 â€” Investimentos maiores, validar demanda antes**
10. Wearables/CGM, telemedicina em vÃ­deo, biblioteca de receitas reutilizÃ¡veis, comunidade entre pacientes, multi-profissional.

**NÃ£o fazer agora (decisÃ£o explÃ­cita do comitÃª):** marketplace de delivery, internacionalizaÃ§Ã£o, dark mode como prioridade (fica como nice-to-have de design, nÃ£o bloqueia nada).

---

## ðŸ’¡ Ideias novas do usuÃ¡rio (14/07/2026)

- [x] **Sino de notificaÃ§Ã£o no app do paciente** â€” implementado. Quando o nutricionista clica "Enviar Alerta" (Cohorts), uma notificaÃ§Ã£o real Ã© criada (`addNotification` no `AppContext.jsx`) e aparece no sino do `TopBar` do paciente, com contador de nÃ£o lidas.
- [x] **Biblioteca de templates de dieta reutilizÃ¡veis:** o nutricionista deveria poder salvar um plano completo (30 dias, 6 refeiÃ§Ãµes, suplementos/vitaminas) como template, em vez de digitar tudo do zero em cada consulta.
- [ ] **Anexar template a um paciente:** a partir da biblioteca acima, aplicar um template existente diretamente ao prontuÃ¡rio de um paciente (com opÃ§Ã£o de ajustar antes de confirmar).
- [x] **Receitas para o paciente (bÃ´nus):** o paciente deveria poder receber receitas â€” geradas por IA ou buscadas na internet â€” anexadas numa aba prÃ³pria de "Receitas", separada do plano alimentar estruturado. Onde encaixar: provavelmente uma nova aba na bottom nav do paciente (`DietPlan`/`QuestBoard` jÃ¡ estÃ£o cheios) ou uma seÃ§Ã£o dentro de `DietPlan.jsx`.

---

## âœ… Onda 1 â€” Executada (14/07/2026)

- [x] Chave da OpenAI removida do lado paciente (chat + foto de refeiÃ§Ã£o) â€” agora usa `/api/openai-bridge`, igual ao lado nutricionista. `src/services/openaiService.js` (Ã³rfÃ£o) apagado.
- [x] Guard de rota real em `/nutri` e `/paciente` (`App.jsx` â†’ `RequireAuth`) â€” bloqueia acesso sem sessÃ£o em produÃ§Ã£o; em dev (`import.meta.env.DEV`) deixa passar, e os botÃµes de atalho no `Login.jsx` sÃ³ aparecem em dev.
- [x] `firestore.rules` criado na raiz do projeto, isolando `patients`/`appointments` por `nutricionista_id`. **Ainda precisa ser publicado manualmente** (Firebase Console ou `firebase deploy --only firestore:rules` no projeto `nutribase-fea35`) â€” nenhuma automaÃ§Ã£o faz esse deploy sozinha.
- [x] Peso do paciente: trocado `window.prompt()` por modal prÃ³prio em `Profile.jsx`.
- [x] Ã�cone de coraÃ§Ã£o decorativo removido do `TopBar` (nÃ£o tinha mecÃ¢nica real associada).
- [ ] **VerificaÃ§Ã£o ao vivo pendente:** rodei lint (sem erros novos) e confirmei via cÃ³digo que o guard nÃ£o bloqueia o modo dev, mas a automaÃ§Ã£o de navegador desta sessÃ£o ficou instÃ¡vel no meio do teste do modal de peso e do chat â€” vale um clique manual rÃ¡pido em `/paciente` â†’ Vytal Bot e Perfil â†’ Informar Meu Peso antes de considerar 100% validado.
- [ ] Instabilidade do canal de escrita do Firestore (erro 503 observado nos testes) nÃ£o foi resolvida â€” Ã© de infraestrutura/rede do ambiente, nÃ£o do cÃ³digo. O padrÃ£o "local-first" jÃ¡ em uso evita que isso trave a UI, mas vale investigar se persiste fora deste ambiente de dev.
- [ ] "Trocar Papel" no CRM (`Sair (Trocar Papel)`) foi mantido como estÃ¡ â€” na prÃ¡tica sÃ³ navega pra landing page, nÃ£o Ã© um bypass de seguranÃ§a como os botÃµes do Login.

---

## âœ… Executado em 15/07/2026 (ExperiÃªncia Premium e CorreÃ§Ãµes de Cadastro)

- [x] **UX Redesign (App do Paciente):** MigraÃ§Ã£o do visual "infantil" para um "Dark Mode Premium" focado em alta performance.
  - Implementado **Glassmorphism** e cores neon para acentos.
  - O `QuestBoard` abandonou a lista simples de tarefas e ganhou um **GrÃ¡fico Circular de Progresso** centralizado.
  - Introduzido o **ShareableMilestone**: um cartÃ£o hologrÃ¡fico que aparece quando o paciente atinge 100% da dieta diÃ¡ria, pensado para gerar compartilhamento viral no Instagram.
- [x] **CorreÃ§Ãµes de Cadastro e Convite:**
  - Impedida a criaÃ§Ã£o de pacientes duplicados (mesmo CPF ou E-mail) para o mesmo nutricionista.
  - Melhorada a UI do link de convite gerado, com botÃ£o de copiar fÃ¡cil.
  - Implementado envio automÃ¡tico de convite por e-mail via `mailto:` no momento do cadastro do paciente pelo nutricionista.
- [x] **Bugfix CrÃ­tico (ProduÃ§Ã£o):**
  - Corrigido problema onde o link de convite (`/paciente?vincular=...`) redirecionava incorretamente o paciente para a tela de `/login` devido a um bloqueio do `RequireAuth`. A prÃ³pria tela do paciente agora gerencia o onboarding sem bloquear links externos.
- [x] **Deploy & Firebase Auth (Bugfixes):**
---

## ðŸ“ˆ FASE 6: Launch & Early Traction (Go-to-Market)
*Objetivo: LanÃ§ar para early adopters, instrumentar mÃ©tricas desde o Dia 1 e otimizar para a North Star Metric (ex: % de pacientes engajados na gamificaÃ§Ã£o).*

- [ ] **InstrumentaÃ§Ã£o de AARRR:**
  - Instalar PostHog ou Google Analytics para medir Activation (Pacientes que usam >3 dias seguidos) e Retention. *(SÃ³ o Firebase Analytics estÃ¡ inicializado, sem nenhum evento customizado disparado ainda.)*
- [x] **PWA (Progressive Web App):** 
  - Configurar `manifest.json` e Service Worker para permitir que o Paciente instale o Vytal no celular direto pelo navegador.
- [x] **Loop de Feedback:** 
  - Inserir botÃ£o de reporte rÃ¡pido de bugs/sugestÃµes dentro do app.
- [x] **Deploy de LanÃ§amento:** 
  - Publicar Frontend no Vercel/Netlify.
- [x] **Checklist de Launch (Aula 3.15):** Validar integraÃ§Ã£o, suporte, e comunicaÃ§Ã£o de boas-vindas aos primeiros pacientes e nutricionistas.

---

## ðŸ FASE 7: Product-Market Fit
*Objetivo: Confirmar que a retenÃ§Ã£o achatou na curva e que o LTV > CAC, aplicando a pesquisa Sean Ellis.*

- [ ] **Pesquisa Sean Ellis:** 
  - Disparar survey: *"Como vocÃª se sentiria se o Vytal deixasse de existir?"* (Meta: >40% Muito Desapontado).
- [ ] **Growth Features (PLG):** 
  - Sistema de convite orgÃ¢nico (Indique o Nutri e ganhe uma avaliaÃ§Ã£o grÃ¡tis).
  - **Self-Service Sign Up:** Permitir que o paciente faÃ§a cadastro avulso pelo app e ganhe 1 Consulta GrÃ¡tis com a IA (Vytal Bot) para testar a experiÃªncia.
- [x] **Monitoramento de RetenÃ§Ã£o:**
  - Dashboards em tempo real do nÃ­vel de XP e Ofensiva dos pacientes.

---

## ðŸ¢ JORNADA 1â†’100: Scale & MonetizaÃ§Ã£o
*Objetivo: Quando o PMF for alcanÃ§ado, construir os alicerces financeiros e B2B.*

- [ ] **Sistema de Assinaturas (Billing):**
  - IntegraÃ§Ã£o com Stripe para cobrar mensalidades dos Nutricionistas (SaaS). *(Tela de "Assinar Premium" existe, mas sem checkout real conectado.)*
- [~] **Multitenancy (White-Label):**
  - Permitir que ClÃ­nicas grandes personalizem as cores do app para seus pacientes. *(Nome/cor da clÃ­nica funcionam; falta isolar dados entre clÃ­nicas de verdade no backend.)*
- [ ] **InteligÃªncia de Cohorts (Aula de PM):**
  - Algoritmo que prevÃª quais pacientes estÃ£o prestes a abandonar a dieta e alerta o nutricionista no CRM. *(A tela existe e Ã© o ponto forte visual do produto, mas o "risco de abandono" hoje Ã© um campo estÃ¡tico do mock, nÃ£o uma previsÃ£o real; o alerta nÃ£o Ã© enviado de verdade ainda.)*

---

## ðŸ“‹ Backlog de Features Pendentes (14/07/2026)

Consolidado a partir da auditoria de produto e do `spec.md`. Ordenado por prioridade dentro de cada bloco â€” nÃ£o Ã© uma lista de bugs (esses jÃ¡ foram corrigidos), Ã© o que falta **construir**.

### SeguranÃ§a e confiabilidade (bloqueia produÃ§Ã£o real)
- [ ] Mover as chamadas de IA do lado paciente (chat + foto de refeiÃ§Ã£o) para o proxy server-side (`api/openai-bridge.js`), removendo `VITE_OPENAI_API_KEY` do bundle do cliente.
- [ ] Guard de rota real: redirecionar `/nutri` e `/paciente` para `/login` quando nÃ£o hÃ¡ sessÃ£o ativa (hoje dÃ¡ pra acessar direto pela URL).
- [ ] Regras de seguranÃ§a no Firestore que isolem dados por paciente/clÃ­nica no servidor â€” hoje o filtro Ã© sÃ³ visual no cliente.
- [ ] Investigar e resolver a instabilidade do canal de escrita do Firestore (erro 503 recorrente) antes de depender dele em produÃ§Ã£o.
- [ ] **Edge Case Estrutural:** Tratar o cenÃ¡rio onde um mesmo paciente (mesmo CPF/E-mail) Ã© atendido por mais de um nutricionista na plataforma (atualmente o modelo assume relacionamento 1:N restrito via `nutricionista_id`).

### MonetizaÃ§Ã£o
- [ ] IntegraÃ§Ã£o real com Stripe (checkout, webhooks de assinatura, bloqueio de features por plano).
- [ ] LÃ³gica de limite de pacientes por plano (hoje "Limite de 5 pacientes" Ã© sÃ³ texto, nÃ£o Ã© aplicado).

### InteligÃªncia de Cohorts (o maior diferencial do produto â€” vale investir aqui primeiro entre as features "grandes")
- [x] Modelo real de previsÃ£o de abandono (hoje Ã© um campo estÃ¡tico `em_risco` no mock), usando streak, adesÃ£o e frequÃªncia de login.
- [x] Envio de fato do alerta de risco (WhatsApp Business API, e-mail transacional, ou push notification) â€” hoje sÃ³ registra em `alert()`.
- [x] VisÃ£o "Patient 360": um painel Ãºnico por paciente reunindo plano, food log, check-ins, peso, mensagens e anotaÃ§Ãµes (hoje estÃ¡ espalhado em abas separadas).

### ComunicaÃ§Ã£o nutricionista â†” paciente
- [ ] Canal de mensagens diretas entre nutricionista e paciente (hoje sÃ³ existe o Vytal Bot de IA; nÃ£o hÃ¡ como o profissional mandar uma mensagem real).
- [ ] NotificaÃ§Ãµes push/e-mail para o paciente quando uma nova dieta Ã© prescrita ou uma consulta Ã© confirmada.

### Analytics e instrumentaÃ§Ã£o
- [ ] Eventos customizados de produto (ativaÃ§Ã£o, retenÃ§Ã£o, funil de onboarding) â€” hoje sÃ³ o Firebase Analytics estÃ¡ inicializado, sem nenhum evento disparado.
- [ ] Pesquisa de PMF (Sean Ellis) â€” depende de ter uma base real de usuÃ¡rios antes de fazer sentido.

### Growth / aquisiÃ§Ã£o
- [ ] Sistema de convite orgÃ¢nico (indicaÃ§Ã£o premiada).
- [x] Landing page com proposta de valor real (hoje Ã© sÃ³ um seletor de botÃµes â€” ver auditoria de UX).

### DecisÃµes de produto pendentes (nÃ£o sÃ£o bugs, sÃ£o escolhas)
- [ ] Decidir o destino de `LearnPath.jsx`/`Quiz.jsx` â€” trilha de aprendizado gamificada estilo Duolingo, jÃ¡ prototipada mas nunca conectada Ã s rotas. Reativar (precisa de conteÃºdo real) ou remover.
- [ ] Decidir se o app do paciente precisa de wearables/CGM (Apple Watch, Google Fit, glicose contÃ­nua) â€” Ã© tendÃªncia forte do mercado 2026, mas Ã© investimento grande; nÃ£o comeÃ§ar sem validar demanda.

### Qualidade
- [ ] Nenhum teste automatizado existe no projeto hoje (unitÃ¡rio, integraÃ§Ã£o ou E2E). Priorizar cobertura pelo menos nos fluxos crÃ­ticos: login, criar/editar paciente, agendar consulta, prescrever dieta.

---

## ðŸ§­ ComitÃª de Produto Inovador â€” ValidaÃ§Ã£o de Features (14/07/2026)

AvaliaÃ§Ã£o do que jÃ¡ existe vs. o que um produto de referÃªncia em nutriÃ§Ã£o digital (Nutrium, Practice Better, MealCircle do lado profissional; Noom, MyFitnessPal, HealthifyMe do lado paciente) precisa ter em 2026, cruzado com o combo que sÃ³ o Vytal tenta fazer hoje: CRM + gamificaÃ§Ã£o + IA num produto sÃ³.

### Validado â€” manter e priorizar
- **Combo CRM + app gamificado + IA clÃ­nica.** Ã‰ o ponto de diferenciaÃ§Ã£o real. Nenhum concorrente pesquisado junta os trÃªs; a maioria Ã© ou ferramenta de gestÃ£o (Nutrium, Practice Better) ou app de paciente (Noom, MyFitnessPal). Vale proteger esse posicionamento em vez de diluir com features genÃ©ricas.
- **Vytal Bot com contexto do plano ativo.** JÃ¡ responde considerando a dieta prescrita â€” alinhado com a tendÃªncia de "IA + SaÃºde ClÃ­nica" apontada pela pesquisa de mercado, mas ainda sem dados biomÃ©tricos.
- **Cohorts / risco de abandono no CRM.** Validado como o recurso de maior potencial competitivo â€” nenhum concorrente pequeno oferece isso hoje pronto; precisa sÃ³ deixar de ser mock (jÃ¡ listado no backlog acima).
- **AnÃ¡lise de exame em PDF via IA.** Diferencial real frente a concorrentes puramente "app de dieta" â€” poucos cruzam exame laboratorial com prescriÃ§Ã£o automaticamente.

### Gaps identificados â€” features que faltam
- [x] **Contexto biomÃ©trico no Vytal Bot e na geraÃ§Ã£o de dieta:** conectar dados de sono/atividade (Apple Health, Google Fit) para a IA ajustar recomendaÃ§Ãµes â€” Ã© citado como "linha de base esperada" pelos apps premium de 2026, hoje o Vytal sÃ³ usa dados manuais (peso via `prompt()`).
- [x] **Food log fora do plano prescrito:** hoje sÃ³ existe o "Comeu algo diferente?" com foto avulsa; falta um diÃ¡rio alimentar livre (sem depender de ter uma dieta ativa) para pacientes em fase de diagnÃ³stico/anamnese, antes da primeira prescriÃ§Ã£o.
- [ ] **Telemedicina/consulta em vÃ­deo integrada:** hoje a "consulta" no CRM Ã© sÃ³ um formulÃ¡rio preenchido pelo nutricionista; nÃ£o hÃ¡ chamada de vÃ­deo nem histÃ³rico de sessÃ£o gravado. Concorrentes de practice management (Practice Better) jÃ¡ oferecem isso nativo.
- [ ] **Biblioteca de receitas/planos reutilizÃ¡veis:** hoje cada dieta Ã© gerada do zero por IA a cada consulta; um nutricionista com 50 pacientes precisa reaproveitar templates de cardÃ¡pio, nÃ£o recriar tudo toda vez.
- [ ] **DocumentaÃ§Ã£o para reembolso/nota fiscal:** contexto Brasil â€” nutricionistas frequentemente precisam emitir recibo para plano de saÃºde; nÃ£o existe nada hoje nessa linha (oportunidade de nicho local que concorrentes globais nÃ£o cobrem bem).
- [ ] **Comunidade/prova social entre pacientes:** o leaderboard hoje Ã© sÃ³ dentro da clÃ­nica; testar (com cautela, ver comitÃª de design abaixo) algum elemento de comunidade pode reforÃ§ar a camada de gamificaÃ§Ã£o, que Ã© validada como tendÃªncia de alto impacto em retenÃ§Ã£o (+30-40% engajamento).
- [ ] **Multi-profissional:** hoje o produto assume 1 nutricionista = 1 clÃ­nica. ClÃ­nicas maiores tÃªm educador fÃ­sico, psicÃ³logo, endocrinologista no mesmo caso â€” vale avaliar (nÃ£o implementar ainda) um modelo de time ao redor do paciente.

### Descartado pelo comitÃª (nÃ£o vale investir agora)
- Marketplace de delivery/supermercado integrado ao plano alimentar â€” dependÃªncia de parceria comercial complexa, nÃ£o Ã© o gargalo atual do produto.
- InternacionalizaÃ§Ã£o/mÃºltiplos idiomas â€” sem sinal de demanda fora do Brasil ainda.

---

## ðŸŽ¨ ComitÃª de Design â€” ValidaÃ§Ã£o de Interfaces (14/07/2026)

Passagem tela a tela pelas duas metades do produto (CRM do nutricionista, app do paciente), depois do redesign e das correÃ§Ãµes jÃ¡ aplicadas.

### CRM do Nutricionista
- âœ… Sidebar escura, badges com ponto, hierarquia visual â€” validado, jÃ¡ estÃ¡ no padrÃ£o "business" que faltava antes.
- [x] **HistÃ³rico de peso do paciente Ã© uma lista, nÃ£o um grÃ¡fico.** Para um CRM clÃ­nico, evoluÃ§Ã£o de peso/medidas *precisa* ser visual (linha do tempo), nÃ£o uma lista de linhas de texto â€” hoje em `PatientList.jsx` (aba prontuÃ¡rio) Ã© sÃ³ `<li>{data}: {peso}kg</li>`.
- [ ] **Nenhum estado de carregamento visÃ­vel.** AÃ§Ãµes como "Gerar SÃ­ntese ClÃ­nica (IA)" e geraÃ§Ã£o de dieta tÃªm texto de loading ("Analisando..."), mas o resto do CRM (troca de aba, abrir prontuÃ¡rio) nÃ£o tem nenhuma transiÃ§Ã£o/skeleton â€” troca Ã© instantÃ¢nea e seca.
- [ ] **Sidebar fixa em 260px nÃ£o foi testada em tablet/janela estreita.** O CRM Ã© claramente desenhado para desktop; nÃ£o hÃ¡ breakpoint definido â€” se um nutricionista usar em tablet (cenÃ¡rio comum em consultÃ³rio), a sidebar provavelmente quebra o layout.
- [ ] **Modais de "Novo Agendamento"/"Novo Paciente" nÃ£o tÃªm validaÃ§Ã£o inline nem foco automÃ¡tico no primeiro campo** â€” dependem sÃ³ da validaÃ§Ã£o nativa do browser (`required`), que Ã© inconsistente entre navegadores.

### App do Paciente
- âœ… Bottom nav com rÃ³tulos e sem sobreposiÃ§Ã£o, banner de erro inline â€” validado, corrigido nesta sessÃ£o.
- [ ] **Peso ainda Ã© lanÃ§ado via `window.prompt()` nativo do navegador** (`Profile.jsx` â†’ `handleUpdateWeight`) â€” quebra completamente a identidade visual "gamificada" do resto do app; deveria ser um modal com o mesmo `btn-3d`/card style do resto do produto.
- [ ] **Ãcone de coraÃ§Ã£o no TopBar (â¤ï¸ 5) sugere um sistema de "vidas" estilo Duolingo que nÃ£o existe de verdade** â€” nÃ£o hÃ¡ penalidade nem lÃ³gica associada a esse nÃºmero, Ã© decorativo. Ou constrÃ³i a mecÃ¢nica de verdade (perder coraÃ§Ã£o ao pular dia) ou remove o Ã­cone â€” hoje Ã© uma promessa visual que engana o paciente.
- [ ] **`DietPlan.jsx` Ã© uma lista estÃ¡tica de refeiÃ§Ãµes passadas** â€” nÃ£o indica visualmente qual dieta estÃ¡ ativa vs. histÃ³rico, nem tem estado por refeiÃ§Ã£o (feito/pendente) como o `QuestBoard` tem. As duas telas mostram a mesma dieta de formas inconsistentes.
- [x] **Nenhum dark mode** â€” nÃ£o Ã© obrigatÃ³rio, mas vale decisÃ£o consciente (ver skill de design usada na auditoria: "nÃ£o default pra dark mode, mas tambÃ©m nÃ£o ignorar a pergunta"). Foi implementado o **Dark Mode Premium** com glassmorphism.
- [ ] **Contraste de cor nÃ£o verificado formalmente** â€” vÃ¡rias combinaÃ§Ãµes (texto cinza claro `#94a3b8` sobre branco, badges) estÃ£o na faixa duvidosa de WCAG AA; precisa de auditoria de contraste real, nÃ£o sÃ³ visual.

### ConsistÃªncia entre os dois mundos
- [ ] **Validado como escolha correta, nÃ£o como falha:** o CRM (profissional, sÃ³brio) e o app do paciente (gamificado, colorido) usarem linguagens visuais propositalmente diferentes â€” Ã© o mesmo padrÃ£o usado por Noom (paciente) vs. Practice Better (profissional), pÃºblicos diferentes justificam identidades diferentes. NÃ£o unificar.
- [ ] **Ponto de atrito real:** a transiÃ§Ã£o entre os dois (botÃ£o "Sair (Trocar Papel)" no CRM, botÃµes "Modo Nutricionista/Paciente" no login) Ã© um artefato de demonstraÃ§Ã£o, nÃ£o um fluxo de produto real â€” nenhum usuÃ¡rio real alterna entre os dois papÃ©is livremente. Antes de lanÃ§ar, decidir se esse seletor deve sumir da experiÃªncia de produÃ§Ã£o (ficando sÃ³ como atalho de dev/QA).

---

## ðŸ›ï¸ ComitÃª de Produto â€” DecisÃµes Finais e PriorizaÃ§Ã£o (14/07/2026)

SÃ­ntese dos dois comitÃªs acima em uma ordem de execuÃ§Ã£o Ãºnica. CritÃ©rio: o que reduz risco (seguranÃ§a/confiabilidade) vem antes do que aumenta valor (features novas), e dentro de "valor" o diferencial competitivo (Cohorts) vem antes de conveniÃªncia.

**Onda 1 â€” Antes de qualquer usuÃ¡rio real usar o produto**
1. SeguranÃ§a e confiabilidade (bloco jÃ¡ detalhado acima) â€” sem isso, nenhuma feature nova importa.
2. Peso via modal em vez de `prompt()` nativo, remoÃ§Ã£o/decisÃ£o sobre o Ã­cone de coraÃ§Ã£o decorativo â€” baratos, resolvem a sensaÃ§Ã£o de "inacabado" apontada pelo comitÃª de design.
3. Decidir e remover (ou manter sÃ³ em dev) o seletor "Trocar Papel" â€” hoje Ã© o maior sinal visual de que o produto ainda Ã© um protÃ³tipo.

**Onda 2 â€” O diferencial competitivo (maior retorno por esforÃ§o)**
4. Cohorts real: modelo de previsÃ£o + envio de fato do alerta. Este Ã© o item que o comitÃª de produto inovador e a pesquisa de mercado apontam como o maior diferencial â€” prioridade mÃ¡xima entre as features novas.
5. [x] GrÃ¡fico de evoluÃ§Ã£o de peso no CRM (troca lista â†’ linha do tempo) â€” prÃ©-requisito visual para o Cohorts parecer "inteligente" de verdade.
6. Contexto biomÃ©trico no Vytal Bot (mesmo que sÃ³ manual no inÃ­cio, sem integrar wearable ainda) â€” data mÃ­nima para comeÃ§ar a construir a diferenciaÃ§Ã£o de IA clÃ­nica.

**Onda 3 â€” MonetizaÃ§Ã£o e crescimento**
7. Stripe real + limite de plano aplicado.
8. [x] Landing page com proposta de valor.
9. Canal de mensagens diretas nutricionistaâ†”paciente.

**Onda 4 â€” Investimentos maiores, validar demanda antes**
10. Wearables/CGM, telemedicina em vÃ­deo, biblioteca de receitas reutilizÃ¡veis, comunidade entre pacientes, multi-profissional.

**NÃ£o fazer agora (decisÃ£o explÃ­cita do comitÃª):** marketplace de delivery, internacionalizaÃ§Ã£o, dark mode como prioridade (fica como nice-to-have de design, nÃ£o bloqueia nada).

---

## ðŸ’¡ Ideias novas do usuÃ¡rio (14/07/2026)

- [x] **Sino de notificaÃ§Ã£o no app do paciente** â€” implementado. Quando o nutricionista clica "Enviar Alerta" (Cohorts), uma notificaÃ§Ã£o real Ã© criada (`addNotification` no `AppContext.jsx`) e aparece no sino do `TopBar` do paciente, com contador de nÃ£o lidas.
- [x] **Biblioteca de templates de dieta reutilizÃ¡veis:** o nutricionista deveria poder salvar um plano completo (30 dias, 6 refeiÃ§Ã£o, suplementos/vitaminas) como template, em vez de digitar tudo do zero em cada consulta.
- [ ] **Anexar template a um paciente:** a partir da biblioteca acima, aplicar um template existente diretamente ao prontuÃ¡rio de um paciente (com opÃ§Ã£o de ajustar antes de confirmar).
- [x] **Receitas para o paciente (bÃ´nus):** o paciente deveria poder receber receitas â€” geradas por IA ou buscadas na internet â€” anexadas numa aba prÃ³pria de "Receitas", separada do plano alimentar estruturado. Onde encaixar: provavelmente uma nova aba na bottom nav do paciente (`DietPlan`/`QuestBoard` jÃ¡ estÃ£o cheios) ou uma seÃ§Ã£o dentro de `DietPlan.jsx`.

---

## âœ… Onda 1 â€” Executada (14/07/2026)

- [x] Chave da OpenAI removida do lado paciente (chat + foto de refeiÃ§Ã£o) â€” agora usa `/api/openai-bridge`, igual ao lado nutricionista. `src/services/openaiService.js` (Ã³rfÃ£o) apagado.
- [x] Guard de rota real em `/nutri` e `/paciente` (`App.jsx` â†’ `RequireAuth`) â€” bloqueia acesso sem sessÃ£o em produÃ§Ã£o; em dev (`import.meta.env.DEV`) deixa passar, e os botÃµes de atalho no `Login.jsx` sÃ³ aparecem em dev.
- [x] `firestore.rules` criado na raiz do projeto, isolando `patients`/`appointments` por `nutricionista_id`. **Ainda precisa ser publicado manualmente** (Firebase Console ou `firebase deploy --only firestore:rules` no projeto `nutribase-fea35`) â€” nenhuma automaÃ§Ã£o faz esse deploy sozinha.
- [x] Peso do paciente: trocado `window.prompt()` por modal prÃ³prio em `Profile.jsx`.
- [x] Ãcone de coraÃ§Ã£o decorativo removido do `TopBar` (nÃ£o tinha mecÃ¢nica real associada).
- [ ] **VerificaÃ§Ã£o ao vivo pendente:** rodei lint (sem erros novos) e confirmei via cÃ³digo que o guard nÃ£o bloqueia o modo dev, mas a automaÃ§Ã£o de navegador desta sessÃ£o ficou instÃ¡vel no meio do teste do modal de peso e do chat â€” vale um clique manual rÃ¡pido em `/paciente` â†’ Vytal Bot e Perfil â†’ Informar Meu Peso antes de considerar 100% validado.
- [ ] Instabilidade do canal de escrita do Firestore (erro 503 observado nos testes) nÃ£o foi resolvida â€” Ã© de infraestrutura/rede do ambiente, nÃ£o do cÃ³digo. O padrÃ£o "local-first" jÃ¡ em uso evita que isso trave a UI, mas vale investigar se persiste fora deste ambiente de dev.
- [ ] "Trocar Papel" no CRM (`Sair (Trocar Papel)`) foi mantido como estÃ¡ â€” na prÃ¡tica sÃ³ navega pra landing page, nÃ£o Ã© um bypass de seguranÃ§a como os botÃµes do Login.

---

## âœ… Executado em 15/07/2026 (ExperiÃªncia Premium e CorreÃ§Ãµes de Cadastro)

- [x] **UX Redesign (App do Paciente):** MigraÃ§Ã£o do visual "infantil" para um "Dark Mode Premium" focado em alta performance.
  - Implementado **Glassmorphism** e cores neon para acentos.
  - O `QuestBoard` abandonou a lista simples de tarefas e ganhou um **GrÃ¡fico Circular de Progresso** centralizado.
  - Introduzido o **ShareableMilestone**: um cartÃ£o hologrÃ¡fico que aparece quando o paciente atinge 100% da dieta diÃ¡ria, pensado para gerar compartilhamento viral no Instagram.
- [x] **CorreÃ§Ãµes de Cadastro e Convite:**
  - Impedida a criaÃ§Ã£o de pacientes duplicados (mesmo CPF ou E-mail) para o mesmo nutricionista.
  - Melhorada a UI do link de convite gerado, com botÃ£o de copiar fÃ¡cil.
  - Implementado envio automÃ¡tico de convite por e-mail via `mailto:` no momento do cadastro do paciente pelo nutricionista.
- [x] **Bugfix CrÃ­tico (ProduÃ§Ã£o):**
  - Corrigido problema onde o link de convite (`/paciente?vincular=...`) redirecionava incorretamente o paciente para a tela de `/login` devido a um bloqueio do `RequireAuth`. A prÃ³pria tela do paciente agora gerencia o onboarding sem bloquear links externos.
- [x] **Deploy & Firebase Auth (Bugfixes):**
  - Adicionado `vercel.json` para corrigir erros `404: NOT_FOUND` da Vercel ao recarregar a pÃ¡gina ou acessar a URL diretamente pelo celular.
  - Criado utilitÃ¡rio `firebaseErrors.js` para interceptar erros do Firebase Auth e traduzi-los para mensagens amigÃ¡veis ao usuÃ¡rio (ex: `auth/invalid-credential` virou `E-mail ou senha invÃ¡lidos`).
- [ ] **Problema a investigar (Edge Case):** Como tratar pacientes que usam a plataforma com **mÃºltiplos nutricionistas diferentes**. O sistema hoje cruza a base de CPF isolada por nutricionista, mas pode haver conflito se o mesmo paciente for convidado por dois profissionais distintos.
- [x] **Acompanhamento de RefeiÃ§Ãµes no App do Paciente:** No protocolo vigente (app do paciente), implementar a possibilidade de a pessoa marcar um check se comeu no horÃ¡rio e seguiu a dieta. Caso nÃ£o, abrir campo para ela informar o que comeu, preenchendo a lacuna da avaliaÃ§Ã£o pela IA (que ainda nÃ£o estÃ¡ totalmente funcional no modo paciente).

## Solicitações Futuras (Backlog)
- [x] Sugestão e montagem de exercícios/repetições usando um comitê de profissionais (IA personal).
- [x] Registro de sono no app.
- [ ] Detecção de ansiedade alimentar pela IA.
- [ ] Upload de exames pelo paciente (Evolução Clínica VIP).