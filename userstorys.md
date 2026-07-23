# Vytal Nutri - Product Requirements & User Stories
*Documento vivo consolidando o Passado, Presente e Futuro das features do Vytal usando frameworks de PM.*

---

# 📖 PARTE 1: O PASSADO E O PRESENTE (Features Já Validadas e Lançadas)

Esses épicos já foram desenvolvidos e compõem o nosso "Walking Skeleton" e o atual "Go-to-Market".

### Épico 01: CRM Clínico Inteligente (Lado Nutricionista)
- **PRD:** Uma plataforma desktop-first para gestão de pacientes "High-Ticket".
- **User Stories Principais:**
  - *Como nutricionista*, quero usar IA para ler um exame de sangue em PDF, para não precisar digitar marcadores manualmente.
  - *Como nutricionista*, quero visualizar o risco de abandono (Streak quebrado) em um painel unificado, para enviar um alerta preventivo no WhatsApp.
  - *Como nutricionista*, quero gerar dietas estruturadas (grama a grama) e treinos de hipertrofia usando a IA como meu "Segundo Cérebro".

### Épico 02: PWA Gamificado (Lado Paciente)
- **PRD:** Um app Mobile-first instalável, em Dark Mode Premium, focado na retenção diária.
- **User Stories Principais:**
  - *Como paciente*, quero acessar meu QuestBoard diário e marcar "check" em refeições, treinos, água e sono, para ganhar XP e manter minha chama (Streak) acesa.
  - *Como paciente*, quero visualizar meu progresso em um gráfico circular recompensador, para sentir que o esforço compensa.
  - *Como paciente*, se eu furar a dieta, quero registrar o que comi enviando texto ou foto, para que meu nutricionista avalie a exceção.

---

# 🚀 PARTE 2: O FUTURO (Backlog Estratégico)

Abaixo estão os próximos Épicos, estruturados com **PRD, Hipóteses, Histórias de Usuário (com Critérios de Aceite) e Pre-mortems**.

---

## 🏗️ Épico 03: Arquitetura Segura e Escalonável (Prioridade Crítica)
*Referência: `todo.md` - Mover chamadas de IA e regras do Firestore.*

- **PRD Summary:** A estrutura de MVP deixava a chave da OpenAI exposta no frontend do paciente e os dados visíveis por falta de regras restritas no backend. Precisamos proteger o IP da empresa e a conformidade com a LGPD.
- **Hipótese:** Acreditamos que blindando o Firebase e usando Edge Functions, teremos 0% de vazamento de chaves ou acesso indevido entre clínicas, o que é pré-requisito para o B2B cobrar mensalidades.
- **Pre-mortem:** *O que pode dar errado?* Regras do Firestore mal feitas podem bloquear o acesso dos próprios pacientes aos seus dados (Tela em branco). *Mitigação:* Testar extensivamente as regras `firestore.rules` em ambiente local antes do deploy.

### User Stories & Acceptance Criteria
**US 3.1: IA Segura para o Paciente**
- *User Story:* Como engenheiro do sistema, quero que as requisições de IA do app do paciente passem por uma API intermediária (`/api/openai-bridge`), para não expor chaves no cliente.
- *Acceptance Criteria (Given/When/Then):*
  - **Given** que o paciente envia uma foto do almoço livre
  - **When** o app chama o backend
  - **Then** a chamada é feita via nossa Vercel Function e não diretamente à OpenAI.

**US 3.2: Isolamento de Dados (LGPD)**
- *User Story:* Como paciente, quero ter certeza de que apenas meu nutricionista acessa meus exames e anamnese, para manter minha privacidade.
- *Acceptance Criteria:*
  - **Given** um usuário logado tentando forçar um GET em pacientes de outro Nutri
  - **When** a requisição atinge o Firebase
  - **Then** o Firebase deve retornar "403 Forbidden" baseado na regra `resource.data.nutricionista_id == request.auth.uid`.

---

## 💰 Épico 04: Monetização SaaS B2B (Stripe)
*Referência: `todo.md` - Integração com Stripe e Limite de Pacientes.*

- **PRD Summary:** Profissionais usarão o Vytal como sistema de gestão e pagarão assinaturas. O sistema deve travar o cadastro de novos pacientes caso o limite do plano free/básico seja excedido.
- **Hipótese:** Acreditamos que oferecendo 5 pacientes grátis e cobrando R$ 149/mês pelo ilimitado, teremos uma conversão de 15% de usuários ativos para pagantes.
- **Pre-mortem:** *O que pode dar errado?* O webhook do Stripe falhar e usuários pagantes ficarem com a conta bloqueada, gerando suporte furioso. *Mitigação:* Implementar "Grace Period" de 3 dias caso o webhook não processe o pagamento imediatamente.

### User Stories & Acceptance Criteria
**US 4.1: Paywall e Limite de Pacientes**
- *User Story:* Como plataforma, quero bloquear a adição do 6º paciente se o plano for gratuito, para forçar o upsell.
- *Acceptance Criteria:*
  - **Given** um nutricionista Free com 5 pacientes cadastrados
  - **When** ele clica em "Novo Paciente"
  - **Then** um paywall bloqueia a ação, oferecendo o botão "Fazer Upgrade para Ilimitado via Stripe".

---

## 🧠 Épico 05: Aceleração Operacional (Templates de Dieta)
*Referência: Ideias novas do PM.md - Biblioteca de Templates.*

- **PRD Summary:** Nutricionistas perdem tempo gerando do zero dietas parecidas. Eles precisam de uma biblioteca privada para salvar prescrições de sucesso e aplicar em novos pacientes em 1 clique.
- **Hipótese:** Acreditamos que a biblioteca de templates reduzirá o tempo médio de montagem da dieta de 5 minutos (usando a IA atual) para 30 segundos, dobrando a satisfação do profissional com o CRM.
- **Pre-mortem:** *O que pode dar errado?* O template salvo carregar com dados errados de calorias para pacientes com pesos diferentes. *Mitigação:* O template salva os macros proporcionais, e a IA recalcula a "quantidade" grama a grama quando anexado a um paciente novo.

### User Stories & Acceptance Criteria
**US 5.1: Salvar Dieta como Template**
- *User Story:* Como nutricionista, quero salvar a dieta de "Hipertrofia - 3000kcal" em minha biblioteca, para poder reaproveitar com outros pacientes.
- *Acceptance Criteria:*
  - **Given** que finalizei uma prescrição perfeita
  - **When** clico no botão "Salvar como Template"
  - **Then** o plano é guardado na aba "Meus Templates" associado à minha conta.

**US 5.2: Anexar Template ao Paciente**
- *User Story:* Como nutricionista, quero carregar um template da biblioteca durante a consulta, para não precisar esperar a geração do zero.
- *Acceptance Criteria:*
  - **Given** um paciente novo em consulta
  - **When** acesso a aba de Dieta e seleciono "Importar Template"
  - **Then** o plano completo é carregado no editor para ajustes rápidos antes de finalizar.

---

## ⚕️ Épico 06: Vytal Co-pilot Avançado (Exames e Psicologia)
*Referência: `todo.md` - Upload de Exames e Detecção de Ansiedade Alimentar.*

- **PRD Summary:** Permitir que o paciente faça upload do PDF do seu exame diretamente pelo app gamificado antes da consulta, e criar uma inteligência que percebe ansiedade alimentar pelo chat.
- **Hipótese:** Acreditamos que se a IA detectar "jacadas" frequentes combinadas com registros de sono ruim, avisar o Nutricionista como um "Risco Comportamental" fará a retenção aumentar mais do que apenas rastrear falhas na dieta.
- **Pre-mortem:** *O que pode dar errado?* O paciente mandar fotos confidenciais na área de exames que fiquem vulneráveis, ou a IA "diagnosticar" depressão erroneamente no chat. *Mitigação:* O chat tem prompt bloqueado para não dar diagnósticos médicos, apenas registrar o humor; exames vão para storage seguro do Firebase.

### User Stories & Acceptance Criteria
**US 6.1: Paciente Envia Exame Prévio**
- *User Story:* Como paciente, quero tirar foto ou subir o PDF do meu exame de sangue pelo app, para que o nutricionista já tenha tudo lido na hora da consulta.
- *Acceptance Criteria:*
  - **Given** que o paciente abre a aba "Evolução"
  - **When** ele faz upload de um arquivo PDF
  - **Then** o arquivo aparece no CRM do Nutricionista e a IA pré-processa os biomarcadores.

**US 6.2: Detecção de Padrão de Ansiedade (Comportamental)**
- *User Story:* Como IA (Vytal Bot), quero notar se o paciente relatou comer doces fora de hora em dias com 0 XP no sono, para alertar o nutricionista de um padrão de ansiedade.
- *Acceptance Criteria:*
  - **Given** que o paciente marcou "Sono Ruim" 3 vezes e inseriu log de "Chocolate" no chat
  - **When** o nutricionista abre o Dashboard
  - **Then** surge um alerta roxo: "Possível gatilho comportamental por privação de sono."

---

## ⌚ Épico 07: O Ecossistema Integrado (Wearables e Apple Health)
*Referência: `pm.md` - Contexto Biométrico e HealthKit.*

- **PRD Summary:** Abandonar o registro manual de passos e sono dependendo do paciente, importando diretamente dos smartwatches para o Vytal.
- **Hipótese:** Acreditamos que integrar o HealthKit vai aumentar o "Daily Active Users" (DAU), pois o paciente abrirá o app apenas para ver seu XP sincronizar magicamente, sem fricção manual.
- **Pre-mortem:** *O que pode dar errado?* As APIs de saúde mobile mudam com frequência e quebram no PWA. *Mitigação:* Usar bibliotecas consolidadas e lidar com o fallback manual (se não sincronizar, exibe o input padrão).

### User Stories & Acceptance Criteria
**US 7.1: Sincronização de Sono e Passos**
- *User Story:* Como paciente premium, quero conectar meu Apple Watch/Google Fit, para que minhas calorias gastas e tempo de sono completem os checks diários automaticamente.
- *Acceptance Criteria:*
  - **Given** que autorizei o Vytal no Apple Health
  - **When** eu abro o QuestBoard
  - **Then** a barra de Passos e a barra de Sono são preenchidas sozinhas e o XP é computado.

---

## 🚀 Épico 08: Growth e PLG (Indicações e Comunidade)
*Referência: `todo.md` - Convite Orgânico e Telemedicina Nativa.*

- **PRD Summary:** Usar os próprios pacientes como canal de aquisição de novos Nutricionistas (Bottom-up B2B) ou de novos pacientes para a mesma clínica.
- **Hipótese:** Acreditamos que a opção "Convide um amigo para o time do seu Nutri e ganhe 500 XP" reduzirá o custo de aquisição da clínica a zero para os leads virais.
- **Pre-mortem:** *O que pode dar errado?* Leaderboard entre pacientes gerar comportamento tóxico ou vergonha na clínica. *Mitigação:* Leaderboard anônimo (apenas avatares e pontos de XP, sem exibir quem furou a dieta).

### User Stories & Acceptance Criteria
**US 8.1: Link de Indicação Gamificado**
- *User Story:* Como paciente engajado, quero um botão "Chamar Parceiro de Treino", para convidar um amigo a agendar uma consulta com meu Nutricionista através de um link.
- *Acceptance Criteria:*
  - **Given** que sou um paciente nível Prata
  - **When** compartilho meu link e o amigo paga a primeira consulta
  - **Then** eu ganho a insígnia "Embaixador" e o nutricionista recebe um novo cliente na sua base.
