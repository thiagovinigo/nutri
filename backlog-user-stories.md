> ⚠️ **APOSENTADO em 28/07/2026** — este arquivo não é mais a referência ativa. Use `backlog.md` (backlog unificado, seção "Comunicação nutricionista ↔ paciente" — tabela de prioridade + status condensado). Critérios de aceite em Gherkin completos ficam preservados aqui como histórico detalhado, mas não atualize mais este arquivo.

# User Stories: Nutrivvo — Comunicação via WhatsApp e Fundação de Segurança

> Gerado a partir de `backlog.md`, com o formato da skill `user-stories` (Mike Cohn + INVEST + critérios Gherkin).
> Personas: **Nutri** (nutricionista, usuário B2B do CRM) e **Paciente** (usuário do app mobile PWA gamificado).

## Priorização

| # | Story | Prioridade | Razão |
|---|-------|-----------|-------|
| 1 | Telefone obrigatório no cadastro | P0 | ✅ Concluída — pré-requisito de tudo que envolve WhatsApp |
| 2 | Publicar `firestore.rules` em produção | P0 | Regras de segurança escritas mas não aplicadas — dado real está exposto hoje |
| 3 | Validar cobrança/recibo no WhatsApp de ponta a ponta | P0 | Feature já existe na UI, só não funcionava por falta do telefone — ganho imediato, esforço mínimo |
| 4 | Canal de mensagens diretas Nutri ↔ Paciente | P1 | Hoje só existe bot de IA; nutricionista não tem como falar direto no app |
| 5 | Notificações de dieta prescrita / consulta confirmada | P1 | Paciente só sabe de novidade se abrir o app por conta própria |
| 6 | Lembretes proativos de refeição via WhatsApp | P2 | Depende de decisão de provider (Meta API vs Evolution/Baileys) — maior escopo |
| 7 | Check-in por foto direto no WhatsApp | P2 | Depende da Story 6 (mesma infra de bot) |

---

## Story 1: Cadastrar paciente/usuário com telefone para acionamento via WhatsApp

**Como um** Nutricionista
**Eu quero** informar o telefone do paciente (e o meu, como usuário) no cadastro
**Para que** eu consiga mandar cobrança, lembrete e recibo pelo WhatsApp de verdade

### Contexto
Os botões "Enviar Lembrete/Cobrança" e "Emitir Recibo" no WhatsApp já existiam na tela financeira do CRM, mas o link `wa.me/55{phone}` sempre saía sem número — não havia campo de telefone em nenhum cadastro. Bug descoberto e corrigido nesta sessão.

### Critérios de Aceite

#### Happy path — novo paciente
```gherkin
Given que estou no CRM criando um novo paciente
When preencho nome, CPF, e-mail, telefone e demais campos obrigatórios
And clico em "Salvar"
Then o paciente é criado com o campo phone preenchido
And o telefone aparece formatado como "(11) 99999-9999" no formulário
```

#### Happy path — cadastro self-service (paciente ou nutricionista)
```gherkin
Given que estou na tela de cadastro (/cadastro)
When preencho nome, CPF/CNPJ, telefone, e-mail e senha
And confirmo o cadastro
Then meu documento em "users" (e em "patients", se for paciente) é salvo com o telefone informado
```

#### Edge case — paciente cadastrado antes desta feature existir
```gherkin
Given que sou um paciente cadastrado antes do campo de telefone existir
When o nutricionista abre minha ficha para editar
Then o campo telefone aparece pré-preenchido com um número padrão de placeholder ("11999999999")
And o nutricionista pode substituir pelo número real a qualquer momento
And nenhum dado antigo quebra ou impede a edição
```

#### Edge case — vínculo via link de convite
```gherkin
Given que um paciente foi pré-cadastrado pelo nutricionista (documento temporário) sem telefone
When o paciente completa o cadastro pelo link de convite e informa seu telefone
Then o telefone digitado pelo paciente prevalece sobre o valor (ausente) do documento temporário
```

### Notas técnicas
- Campo `phone` adicionado em `patients` e `users` no Firestore; máscara `(99) 99999-9999` aplicada no `onChange`, armazenado com dígitos ao consumir (`replace(/\D/g,'')`)
- Fallback `'11999999999'` usado em `addPatient`, `SignUp.jsx` e na leitura em `openEditPatientModal` — evita quebrar registros existentes com campo obrigatório novo
- Arquivos alterados: `AppContext.jsx` (`addPatient`), `DashboardNutri.jsx`, `PatientList.jsx`, `SignUp.jsx`

### Tamanho estimado
Concluída — ~1 dia (já implementado e validado com `vite build`)

### Dependências
Nenhuma — é a base para as Stories 3, 6 e 7

### Status
✅ **Feito** (sessão de 27/07/2026)

---

## Story 2: Publicar as regras de segurança do Firestore em produção

**Como um** Nutricionista (e, indiretamente, todo paciente da plataforma)
**Eu quero** que as regras de isolamento de dados por clínica estejam realmente ativas no Firestore
**Para que** meus dados clínicos e os dos meus pacientes não fiquem acessíveis a outros nutricionistas/pacientes da plataforma

### Contexto
`firestore.rules` existe no repositório, corrigido nesta sessão (brecha de delete cross-tenant fechada), mas **nunca foi publicado** via `firebase deploy --only firestore:rules` — hoje o isolamento de dados é só uma convenção no código cliente, não uma garantia no servidor.

### Critérios de Aceite

#### Happy path
```gherkin
Given que rodo `firebase deploy --only firestore:rules` no projeto `nutribase-fea35`
When o deploy termina com sucesso
Then as regras do arquivo local passam a valer no Firestore de produção
```

#### Edge case — tentativa de acesso cross-tenant
```gherkin
Given que sou o Nutricionista A, autenticado
When tento ler/editar um paciente vinculado ao Nutricionista B (via console/API direta)
Then a operação é rejeitada pelo Firestore com erro de permissão
```

#### Edge case — paciente tentando ler dados de outro paciente
```gherkin
Given que sou um Paciente autenticado
When tento acessar o documento de outro paciente
Then a operação é rejeitada
```

### Notas técnicas
- Requer acesso ao Firebase CLI autenticado no projeto correto (`nutribase-fea35`) — ação manual, não automatizável por este agente
- Rodar `firebase deploy --only firestore:rules --dry-run` (se disponível) antes do deploy real, para validar sintaxe
- Depois de publicado, testar os 2 edge cases acima manualmente ou com um script de smoke test

### Tamanho estimado
~1 hora (deploy + validação manual)

### Dependências
Nenhuma — mas é bloqueante para qualquer discussão séria de "produção real"

---

## Story 3: Validar cobrança e recibo por WhatsApp de ponta a ponta

**Como um** Nutricionista
**Eu quero** clicar em "Enviar Lembrete/Cobrança" ou "Emitir Recibo" na ficha financeira do paciente
**Para que** o WhatsApp abra já com o número certo e a mensagem pronta

### Contexto
A funcionalidade já existe na UI (`PatientList.jsx`, aba financeira) e monta a URL `https://wa.me/55{phone}?text=...`, mas nunca funcionou de fato porque `patient.phone` sempre foi `undefined`. Agora que o telefone é coletado (Story 1), falta validar o fluxo completo.

### Critérios de Aceite

#### Happy path — cobrança
```gherkin
Given que abro a ficha financeira de um paciente com telefone cadastrado
When clico em "Enviar Lembrete / Cobrança no WhatsApp"
Then uma nova aba abre em wa.me com o número do paciente e uma mensagem pré-preenchida de cobrança
```

#### Happy path — recibo
```gherkin
Given que abro a ficha financeira de um paciente com telefone cadastrado
When clico em "Emitir Comprovante / Recibo no WhatsApp"
Then uma nova aba abre em wa.me com o número do paciente e uma mensagem de recibo/comprovante
```

#### Edge case — paciente com telefone placeholder (nunca corrigido)
```gherkin
Given que um paciente antigo ainda está com o telefone padrão de placeholder
When o nutricionista clica em "Enviar Cobrança"
Then o WhatsApp abre para um número inválido/inexistente
And idealmente o sistema avisa visualmente que esse telefone é um placeholder, não o real
```

### Notas técnicas
- Considerar um indicador visual (badge "telefone não confirmado") quando `phone === '11999999999'`, para o nutricionista saber que precisa atualizar antes de confiar no envio
- Não requer nenhuma integração nova — é validação do fluxo já implementado

### Tamanho estimado
~2 horas (validação manual + o indicador visual de placeholder, se aprovado)

### Dependências
Story 1 (concluída)

---

## Story 4: Canal de mensagens diretas entre Nutricionista e Paciente

**Como um** Nutricionista
**Eu quero** mandar uma mensagem direta para um paciente específico, dentro do próprio app
**Para que** eu não precise depender do WhatsApp pessoal nem do bot de IA para assuntos que exigem meu toque humano

### Contexto
Hoje o único canal dentro do produto é o `Nutrivvo Bot`, que é IA — não existe forma do profissional mandar uma mensagem real, pessoal, para o paciente.

### Critérios de Aceite

#### Happy path — nutricionista envia mensagem
```gherkin
Given que estou na ficha de um paciente no CRM
When escrevo uma mensagem e clico em "Enviar"
Then a mensagem aparece no histórico de conversa do paciente, marcada como "do Nutricionista" (não IA)
And o paciente recebe uma notificação no sino do TopBar
```

#### Happy path — paciente responde
```gherkin
Given que recebi uma mensagem do meu nutricionista
When abro o chat e respondo
Then o nutricionista vê a resposta na aba de mensagens do CRM
```

#### Edge case — distinguir mensagens de IA vs humanas
```gherkin
Given que tenho conversas tanto com o Nutrivvo Bot quanto com meu nutricionista
When abro a tela de mensagens
Then consigo diferenciar visualmente quem escreveu cada mensagem (bot vs nutricionista)
```

### Notas técnicas
- Reaproveitar o sistema de notificação já existente (`addNotification` em `AppContext.jsx`)
- Nova coleção Firestore sugerida: `directMessages` (já referenciada como estado vazio em `AppContext.jsx`, mas sem CRUD implementado)
- Precisa de regra de segurança dedicada (só participantes da conversa leem/escrevem)

### Tamanho estimado
~3-4 dias

### Dependências
Story 2 (regras de segurança publicadas — nova coleção precisa de regra própria)

---

## Story 5: Notificar paciente quando uma dieta é prescrita ou consulta é confirmada

**Como um** Paciente
**Eu quero** ser avisado assim que meu nutricionista prescrever uma dieta nova ou confirmar uma consulta
**Para que** eu não precise ficar checando o app manualmente pra saber se algo mudou

### Contexto
Hoje o sino de notificação in-app já existe (usado pelo alerta de risco/Cohorts), mas não é disparado nesses dois eventos específicos.

### Critérios de Aceite

#### Happy path — dieta prescrita
```gherkin
Given que o nutricionista finaliza a prescrição de uma dieta pra mim
When a consulta é salva
Then recebo uma notificação no sino do app: "Sua nova dieta está pronta!"
```

#### Happy path — consulta confirmada
```gherkin
Given que o nutricionista confirma um agendamento comigo
When o status do agendamento muda para confirmado
Then recebo uma notificação no sino: "Sua consulta foi confirmada para [data/hora]"
```

#### Edge case — paciente sem notificações habilitadas (push futuro)
```gherkin
Given que só existe notificação in-app hoje (sem push real)
When o evento ocorre e o paciente não está com o app aberto
Then a notificação fica pendente no sino até o próximo login, sem se perder
```

### Notas técnicas
- Usar `addNotification` já existente, disparado em `finishConsultation` (dieta) e no fluxo de confirmação de agendamento
- Push/e-mail de verdade (fora do navegador) é escopo futuro — este story cobre só a garantia in-app

### Tamanho estimado
~1 dia

### Dependências
Nenhuma

---

## Story 6: Lembretes proativos de refeição via WhatsApp

**Como um** Paciente
**Eu quero** receber um lembrete no WhatsApp nos horários das minhas refeições prescritas
**Para que** eu siga a dieta sem precisar lembrar sozinho ou abrir o app toda hora

### Contexto
Item do roadmap V2 (`todo2.md`, Módulo 1). Depende de decisão de arquitetura (Meta Official API vs Evolution API/Baileys) antes de qualquer implementação.

### Critérios de Aceite

#### Happy path
```gherkin
Given que tenho uma dieta prescrita com horários definidos
When chega o horário de uma refeição
Then recebo uma mensagem no WhatsApp perguntando se já comi / lembrando o cardápio
```

#### Edge case — controle de frequência
```gherkin
Given que estou recebendo lembretes 3x ao dia
When acho excessivo
Then consigo, num painel do PWA, reduzir a cadência (1x/dia, resumo semanal, ou pausar)
```

#### Edge case — anti-spam / templates aprovados
```gherkin
Given que o WhatsApp Business exige templates de utilidade aprovados pela Meta
When o sistema envia um lembrete proativo
Then a mensagem usa exclusivamente um Utility Template pré-aprovado (não mensagem livre)
```

### Notas técnicas
- **Bloqueante**: decidir provider (Meta Official API vs Evolution/Baileys) antes de estimar de verdade
- Cron job em background verificando horários da dieta ativa
- Risco de bloqueio do número do WhatsApp se a cadência não for configurável — Story cobre a mitigação

### Tamanho estimado
Não estimável ainda — depende da decisão de provider (bloqueada)

### Dependências
Story 1 (telefone), decisão de arquitetura de provider WhatsApp (ver `todo2.md`)

---

## Story 7: Check-in de refeição por foto direto no WhatsApp

**Como um** Paciente
**Eu quero** mandar a foto do meu prato direto na conversa do WhatsApp com o Nutrivvo
**Para que** eu registre minha refeição sem precisar abrir o app

### Contexto
Reduz fricção do check-in diário — hoje precisa abrir o app e usar a câmera por lá. Mesma infraestrutura de bot da Story 6.

### Critérios de Aceite

#### Happy path
```gherkin
Given que estou numa conversa de WhatsApp com o número do Nutrivvo
When envio uma foto do meu prato
Then recebo uma resposta rápida ("Recebemos sua foto! 📸 Analisando prato...")
And em seguida a IA avalia a foto e credita o XP no app, como se eu tivesse feito o check-in por lá
```

#### Edge case — resposta assíncrona
```gherkin
Given que a IA Vision leva alguns segundos para processar
When envio a foto
Then recebo a confirmação imediata de recebimento antes da análise completa (evita sensação de app travado)
```

#### Edge case — controle de custo
```gherkin
Given que cada foto analisada tem custo de API
When o backend processa a imagem
Then usa o parâmetro `detail: "low"` no `gpt-4o-mini`, mantendo custo abaixo de US$ 0.001 por foto
```

### Notas técnicas
- Reaproveita a lógica de análise de foto já existente no app (`QuestBoard.jsx`, compressão de imagem + prompt de IA), adaptada para webhook de WhatsApp
- Depende do mesmo provider decidido na Story 6

### Tamanho estimado
Não estimável ainda — depende da Story 6

### Dependências
Story 6

---

## Roadmap de Stories (sugestão de sequência)

### Sprint 1 (concluído nesta sessão)
1. Story 1: Telefone no cadastro ✅

### Sprint 2 (próxima, curto prazo)
1. Story 2: Publicar `firestore.rules` (ação manual, ~1h)
2. Story 3: Validar cobrança/recibo no WhatsApp (~2h)
3. Story 5: Notificações de dieta/consulta (~1 dia)

### Sprint 3
1. Story 4: Mensagens diretas Nutri ↔ Paciente (~3-4 dias)

### Bloqueada — aguardando decisão de arquitetura
- Story 6: Lembretes via WhatsApp (decidir provider primeiro)
- Story 7: Check-in por foto no WhatsApp (depende da Story 6)

---

## Definição de Done

Para cada story:
- ✅ Critérios de aceite validados manualmente (happy path + edge cases)
- ✅ `vite build` sem erros novos
- ✅ Testado em produção real (não só localhost), quando aplicável
- ✅ Regra de segurança do Firestore revisada, se a story tocar em nova coleção/campo

## Notas para eng

1. Stories 6 e 7 **não devem ser estimadas** até a decisão de provider WhatsApp sair do "a decidir" — estimar sem isso é chute.
2. Story 2 é a mais barata e mais bloqueante — priorizar antes de qualquer feature nova que grave dado sensível.
3. Story 3 é praticamente grátis (infra já existe) — bom "quick win" pra validar que a Story 1 realmente resolveu o problema relatado.
