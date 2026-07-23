# Features do Produto — Vytal

Este documento detalha o mapa de funcionalidades do Vytal, dividindo o que já foi construído e validado em produção, e as funcionalidades planejadas para o futuro (Backlog).

---

## ✅ Desenvolvidas (Já prontas)

### Core UI & Navegação
- **Arquitetura Dupla:** Telas separadas para Paciente e Nutricionista com navegação fluida.
- **PWA (Progressive Web App):** Permite instalação do aplicativo no celular como um app nativo, direto pelo navegador.
- **Loop de Feedback:** Botão sempre visível para reporte rápido de bugs e envio de sugestões.

### Experiência do Paciente (App Premium)
- **Design High-Performance:** UI em "Dark Mode Premium" com efeitos de Glassmorphism e detalhes em neon, focada no engajamento.
- **QuestBoard Interativo:** Dashboard diário que apresenta um Gráfico Circular de Progresso atualizado conforme o paciente bate suas metas de água e refeições.
- **Shareable Milestone (Gamificação Viral):** Quando o paciente atinge 100% da dieta do dia, um cartão holográfico de conquista é gerado na tela, projetado para o paciente tirar Print e compartilhar no Instagram marcando a clínica.
- **Notificações:** Sino de notificação no topo com contador de alertas enviados pelo nutricionista.
- **Tracking de Peso:** Modal customizado para registro de peso diretamente pela interface do aplicativo.

### CRM do Nutricionista e Personal
- **Gestão de Pacientes:** Lista, prontuário detalhado, e histórico de evolução do paciente.
- **Sistema de Convites Inteligente:** Geração de link de convite único que amarra o paciente ao nutricionista no primeiro acesso.
- **Envio Automático (Mailto):** Envio automático de e-mail de boas-vindas com o link de convite assim que o nutricionista salva o cadastro.
- **Proteção Anti-Duplicidade:** O sistema impede que o profissional crie duas fichas para o mesmo paciente (validação por CPF e E-mail).
- **Painel de Retenção e Engajamento:** O nutricionista visualiza em tempo real o nível de XP e a "ofensiva" (streak de dias seguidos) de cada paciente na lista.
- **Consultas Híbridas:** Agendamento de consultas com modalidade (Local/Online) e geração de link do Google Meet/Zoom integrado.
- **Editor de Treinos:** Prescrição manual de planilhas de exercícios físicos diretamente no prontuário do paciente, integrados à visualização do App Mobile.

### IA Nativa e IA Clínica
- **Geração de Dietas Automática:** O Vytal Bot cria o cardápio baseando-se nos inputs e preferências coletados.
- **ChatBot Clínico (Vytal Bot):** Assistente virtual do lado do paciente que tem o contexto completo da dieta atual prescrita e tira dúvidas em tempo real.
- **Análise de Exames Médicos:** Leitura e extração automática de arquivos PDF (exames de sangue, etc.) utilizando IA para alimentar a anamnese.

### Infraestrutura, Backend & Segurança
- **Banco de Dados Real:** Integração ponta-a-ponta com o Firebase (Firestore para DB, Authentication para login).
- **Isolamento de Dados:** Filtros que garantem que cada paciente só enxergue seus próprios dados, e cada nutricionista seus próprios pacientes (reforçado via Regras do Firestore).
- **Segurança da IA:** Chamadas seguras de inteligência artificial mascaradas por um servidor intermediário (Edge Function - `/api/openai-bridge.js`), protegendo as chaves de API em produção.
- **Guard de Rotas:** Redirecionamento automático de usuários deslogados tentando acessar links restritos (com bypass inteligente para novos cadastros).

---

## 🛠️ A Desenvolver (Backlog e Próximos Passos)

### Inteligência de Cohorts e Previsão de Risco
- **Algoritmo de Risco de Abandono:** IA que calcula o risco de o paciente abandonar a dieta baseado na quebra da ofensiva e na falta de check-ins, alertando o nutricionista.
- **Alertas Automatizados:** Envio de mensagem push, e-mail ou WhatsApp (via API) para o paciente quando o nutricionista decidir acionar um alerta do CRM.
- **Patient 360 Dashboard:** Um painel único no CRM reunindo todas as métricas do paciente: food log visual, peso em gráfico de linha, plano e anotações.

### Interação e Flexibilidade Nutricional
- **Chat Direto Nutricionista ↔ Paciente:** Abertura de um canal de mensagens humanas além do Vytal Bot.
- **Biblioteca de Templates Reutilizáveis:** Permitir que o nutricionista salve protocolos completos de dieta (30 dias, marmitas, suplementos) e aplique em pacientes diferentes sem redigitar tudo.
- **Receitas Bônus (Biblioteca de Fáceis):** Uma aba apenas com receitas anexadas avulsas para o paciente, sem estarem necessariamente alocadas no planejamento do dia.
- **Diário Alimentar Livre:** O paciente poder fotografar refeições que estão fora da prescrição (úteis para a fase de anamnese antes do primeiro cardápio oficial).

### Saúde, Biometria e Contexto
- **Integração com Wearables:** Conectar o Vytal Bot ao Apple Health / Google Fit para ajustar recomendações baseadas no gasto calórico em tempo real (dados de sono, treino).
- **Gráfico de Evolução (CRM):** Substituir a lista textual de medições de peso por um gráfico visual claro no prontuário clínico.

### Negócios (Monetização B2B)
- **Assinaturas via Stripe:** Cobrança recorrente dos Nutricionistas SaaS.
- **White-Label e Multitenancy Server-side:** Permitir customização das cores e logos para grandes clínicas (hoje ocorre apenas superficialmente), isolando fisicamente os bancos de dados entre organizações diferentes.
- **Telemedicina Nativa:** Integrar links de vídeo chamadas diretamente dentro da tela da "Consulta" no CRM.

---

## 🔬 Em Investigação (Edge Cases a Tratar)
- **Múltiplos Nutricionistas por Paciente:** Como resolver o conflito de um paciente com um CPF/E-mail que deseja ser atendido por dois profissionais distintos que utilizam o Vytal? Atualmente o modelo o amarra de forma 1:N ao nutricionista que gerou o primeiro link.
