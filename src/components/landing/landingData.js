// Dados e Textos Canônicos Enriquecidos
// Reúne todos os diferenciais modernos + todas as informações do original, explicando o máximo do app com total segurança clínica (sem vazar dados internos de infraestrutura).

export const landingData = {
  badge: 'FEITO PARA NUTRICIONISTA AUTÔNOMO E CLÍNICA PEQUENA',
  titleLine1: 'Seu paciente some entre consultas.',
  titleHighlight: 'O Nutrivvo não deixa.',
  description: 'Enquanto você atende no consultório, a IA do Nutrivvo confirma consultas, cobra a foto da refeição e avisa quando o paciente está perdendo o foco — tudo pelo Telegram. Do outro lado, um app gamificado com XP e ofensiva diária faz o paciente voltar sozinho, todo dia.',
  
  trustBadges: [
    'Sem cartão de crédito',
    'Pronto em 2 minutos',
    'Acesso do Paciente Gratuito',
    'Em conformidade com a LGPD e sigilo clínico'
  ],

  specialties: [
    'NUTRIÇÃO CLÍNICA & FUNCIONAL',
    'PERFORMANCE ESPORTIVA',
    'EMAGRECIMENTO & LONGEVIDADE',
    'SAÚDE INTESTINAL & MICROBIOTA',
    'NUTRIÇÃO COMPORTAMENTAL',
    'MATERNO-INFANTIL & FAMÍLIA',
    'FITOTERAPIA CLÍNICA'
  ],

  // Seções de Valor do Original Integradas
  valueProps: {
    management: {
      tag: 'BASTIDORES CLÍNICOS AUTOMATIZADOS',
      title: 'Gestão que trabalha por você',
      desc: 'Monte o cardápio com IA em minutos: descreva o paciente e receba um plano de 1 a 30 dias pronto, com receitas de verdade, nome apetitoso e modo de preparo — não uma lista fria de alimentos. Acompanhe se o paciente está bebendo água e seguindo o plano em tempo real pelo painel, sem precisar perguntar no WhatsApp.',
      bullet1: 'Cardápio estruturado com lista de compras e tabela de substituições de alimentos.',
      bullet2: 'Periodização de treinos e análise de exames anexados sem sair da tela de atendimento.',
      img: '/screen_nutri.png'
    },
    engagement: {
      tag: 'PSICOLOGIA COMPORTAMENTAL',
      title: 'Engajamento incomparável para o paciente',
      desc: 'O aplicativo do paciente não é apenas um visualizador estático de PDF. É uma experiência motivadora e lúdica. Toda vez que o paciente conclui uma refeição no horário e envia a foto, o cérebro recebe um estímulo de dopamina pelo avanço — e cada marco de ofensiva conquistado pode ser compartilhado nas redes sociais, marcando a sua clínica.',
      bullet1: 'Ofensiva diária (streak): aversão à perda que mantém o paciente focado até nos finais de semana.',
      bullet2: 'Check-in por foto com visão computacional: zero digitação de calorias cansativa.',
      img: '/screen_paciente.png'
    }
  },

  // Os 8 Grandes Diferenciais em Bento Grid
  radar: {
    tag: 'RADAR DE ABANDONO',
    title: 'Identifica o desânimo antes do cancelamento',
    desc: 'O CRM analisa automaticamente a sequência de dias ativos, abertura do app e fotos enviadas para acender alertas em verde, amarelo ou vermelho antes mesmo do paciente sumir.',
    patients: [
      { name: 'Camila Silva', detail: 'Inativa há 4 dias · Sem foto do almoço', status: 'critical', badge: 'Risco Alto (82%)' },
      { name: 'Rodrigo Mendes', detail: 'Perdeu a ofensiva no fim de semana', status: 'warning', badge: 'Atenção (45%)' },
      { name: 'Beatriz Costa', detail: '14 dias ativos seguidos no diário', status: 'safe', badge: 'Adesão Segura (98%)' }
    ]
  },

  telegram: {
    tag: 'SECRETÁRIA VIRTUAL NO TELEGRAM',
    title: 'Atendimento e lembretes 24h sem usar seu número pessoal',
    desc: 'Confirma e remarca consultas, cobra a foto da refeição no horário certo e acolhe o paciente automaticamente, sem misturar conversas de trabalho com sua vida pessoal no WhatsApp.',
    chat: [
      { sender: 'bot', text: '🤖 NutriBot: Olá Marcos! Sua consulta com a Dra. Mariana está confirmada para amanhã às 14:00. Posso reservar seu horário?' },
      { sender: 'user', text: 'Confirmadíssimo! Acabei de almoçar, segue a foto do prato 📸' },
      { sender: 'bot', text: '🎯 Prato Detectado: 150g Frango grelhado + Arroz + Salada. Registrado no diário com sucesso! +35 XP creditados na sua ofensiva.' }
    ]
  },

  scanner: {
    tag: 'CHECK-IN DIÁRIO POR FOTO',
    title: 'Reconhecimento de pratos por visão de IA',
    desc: 'O paciente fotografa a refeição e a IA identifica os alimentos visíveis e estima porções de forma acolhedora, creditando XP no diário sem digitação manual cansativa.',
    confidence: 'ESTIMATIVA VISUAL POR IA',
    telemetry: 'ALIMENTOS IDENTIFICADOS · PORÇÃO ESTIMADA · REGISTRO DIRETO',
    img: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80'
  },

  gamification: {
    tag: 'ALTA GAMIFICAÇÃO & XP',
    title: 'Ofensiva Diária e Metas Interativas',
    desc: 'Dietas monótonas são do passado. O paciente constrói uma Ofensiva Diária de dias seguidos, acumula XP a cada refeição e visualiza a própria transformação com orgulho.',
    streak: '14 DIAS SEGUIDOS',
    level: 'NÍVEL 4 // FOCO BLINDADO',
    xp: '+120 XP Hoje'
  },

  generator: {
    tag: 'DIETAS COM IA (DE VERDADE)',
    title: 'Cardápios completos em segundos',
    desc: 'Gere cardápios completos de 1 a 30 dias considerando exames laboratoriais, restrições e medicamentos — com receitas de verdade, nome apetitoso e modo de preparo.',
    result: 'Cardápio personalizado de 2.100 kcal pronto com lista de compras em 2.4s.'
  },

  workout: {
    tag: 'FICHA DE TREINO COM IA',
    title: 'Periodização física alinhada à dieta',
    desc: 'Periodização completa calibrada pelo aporte calórico da dieta prescrita, exames laboratoriais e restrições articulares — pronta sem sair do atendimento.',
    result: 'Divisão A/B e periodização metabólica calibrada com volume semanal ideal.'
  },

  exams: {
    tag: 'ANÁLISE DE EXAMES COM IA',
    title: 'Leitura laboratorial com parecer clínico',
    desc: 'Anexe os exames laboratoriais do paciente e receba uma análise clínica completa, com evolução comparada ao histórico anterior e parecer pronto para orientar a conduta.',
    result: 'Leitura de marcadores metabólicos (Glicemia, Insulina, Ferritina, Perfil Lipídico).'
  },

  financial: {
    tag: 'FINANCEIRO CLÍNICO',
    title: 'Gestão de planos e lembretes de renovação',
    desc: 'Controle planos mensais e trimestrais no CRM, com status de pagamento e lembretes elegantes de renovação pré-formatados para enviar ao paciente sem constrangimento.',
    result: 'Visão clara de honorários, controle de vencimentos e régua de renovação.'
  },

  // Métricas de Impacto
  metrics: [
    { num: '+87%', label: 'Retenção Pós-Consulta', sub: 'Pacientes continuam no plano entre o 2º e o 6º mês' },
    { num: '14h', label: 'Economizadas / Mês', sub: 'Automação de cobranças, confirmações e prontuário ágil' },
    { num: '3.2x', label: 'Mais Adesão ao Plano', sub: 'Com o diário gamificado e a facilidade do check-in por foto' }
  ],

  // Matriz Comparativa Detalhada
  comparison: [
    { feature: 'Identificação de abandono entre consultas', nutrivvo: 'Radar preditivo automático antes da desistência', old: 'Você só percebe quando o paciente não volta' },
    { feature: 'Confirmação e cobrança de refeição', nutrivvo: 'Bot do Telegram 100% autônomo e amigável', old: 'Você tem que mandar mensagem manual no WhatsApp' },
    { feature: 'Registro de refeições pelo paciente', nutrivvo: 'Foto rápida + estimativa visual de macronutrientes', old: 'Digitação manual cansativa em apps genéricos' },
    { feature: 'Gamificação e engajamento contínuo', nutrivvo: 'Ofensiva diária, XP, níveis e badges motivacionais', old: 'Zero estímulo lúdico (apenas um papel na gaveta)' },
    { feature: 'Geração de cardápios com receitas', nutrivvo: 'Plano completo de 1 a 30 dias em 3 segundos', old: '40 a 60 minutos digitando alimentos no Word' },
    { feature: 'Treinos e Exames no mesmo prontuário', nutrivvo: 'Totalmente unificado em 1 tela cirúrgica', old: 'Arquivos soltos em pastas do computador' }
  ],

  // Segurança e LGPD
  security: {
    tag: 'SEGURANÇA E PRIVACIDADE DE DADOS',
    title: 'Seus pacientes e sua clínica 100% protegidos',
    desc: 'Dados de cada paciente são isolados por regras próprias de segurança no banco de dados. Nenhum nutricionista tem acesso aos pacientes de outro consultório. Conforme rigorosamente com a LGPD e as normas éticas do CFN.'
  },

  pricing: [
    {
      name: 'Gratuito',
      desc: 'Para recém-formados ou quem está montando os primeiros atendimentos.',
      price: 'R$ 0',
      period: '/mês',
      features: ['Até 3 pacientes ativos', 'Diário alimentar com fotos', 'App do paciente com XP e Ofensiva', 'Sem Radar de Abandono IA'],
      popular: false
    },
    {
      name: 'Profissional IA',
      desc: 'O arsenal completo para blindar a retenção da sua clínica.',
      priceMensal: 'R$ 97',
      priceAnual: 'R$ 79',
      period: '/mês',
      features: ['Pacientes ilimitados', 'Radar de Abandono em tempo real', 'Secretária no Telegram 24h', 'Gerador de Cardápios & Treinos IA', 'Análise de Exames Laboratoriais', 'Gestão Financeira com cobranças'],
      popular: true
    },
    {
      name: 'Clínicas & Equipes',
      desc: 'Para consultórios com múltiplos profissionais e recepção física.',
      priceMensal: 'R$ 229',
      priceAnual: 'R$ 189',
      period: '/mês',
      features: ['Tudo do Plano Profissional', 'Múltiplos nutricionistas no mesmo CRM', 'Relatório consolidado de retenção', 'Suporte prioritário e onboarding'],
      popular: false
    }
  ],

  faqs: [
    {
      q: 'Como funciona a Secretária no Telegram sem usar meu número pessoal?',
      a: 'O Nutrivvo conecta um bot oficial verificado exclusivo para a sua clínica. Seus pacientes conversam diretamente com a inteligência artificial pelo Telegram, que confirma consultas, lembra dos horários e recebe as fotos de refeição de forma 100% autônoma, sem misturar com suas conversas pessoais.'
    },
    {
      q: 'Como o Radar de Abandono sabe que o paciente está perdendo o foco?',
      a: 'O sistema monitora a frequência de abertura do app pelo paciente, a consistência de envio de fotos do diário e a interação com a ofensiva. Se o algoritmo detectar queda de engajamento por mais de 3 dias, ele acende o alerta amarelo ou vermelho no seu CRM antes mesmo que a consulta seja cancelada.'
    },
    {
      q: 'Consigo migrar pacientes de outras plataformas ou planilhas?',
      a: 'Sim! Você pode importar pacientes via planilha CSV ou cadastrá-los em menos de 1 minuto com nome e telefone. Ao cadastrar, um link de ativação com o app do paciente e instruções do Telegram é gerado automaticamente.'
    },
    {
      q: 'O paciente precisa pagar para usar o app?',
      a: 'Não. O aplicativo móvel é totalmente gratuito para todos os seus pacientes, com diário de fotos, lista de compras, metas diárias e cálculo de XP.'
    },
    {
      q: 'Os dados clínicos e de saúde dos pacientes estão seguros?',
      a: 'Sim, com segurança máxima. Cada nutricionista possui um ambiente isolado com regras de controle de acesso estritas. Nenhum outro profissional tem acesso aos dados de seus pacientes, em total conformidade com a LGPD e o sigilo profissional.'
    }
  ],

  finalCta: {
    title: 'Pare de perder paciente no silêncio entre consultas.',
    desc: 'Junte-se aos nutricionistas que automatizaram o acompanhamento diário. Crie sua conta em 2 minutos, sem cartão de crédito.',
    btn: 'Criar Minha Clínica Grátis Agora'
  }
};
