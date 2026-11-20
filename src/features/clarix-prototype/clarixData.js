export const WEEK_DAYS = [
  { short: 'Seg', day: '17', adherence: 92, sessions: 3 },
  { short: 'Ter', day: '18', adherence: 88, sessions: 2 },
  { short: 'Qua', day: '19', adherence: 95, sessions: 4 },
  { short: 'Qui', day: '20', adherence: 79, sessions: 2 },
  { short: 'Sex', day: '21', adherence: 91, sessions: 3 },
  { short: 'Sáb', day: '22', adherence: 84, sessions: 1 },
  { short: 'Dom', day: '23', adherence: 90, sessions: 1 }
];

export const MEAL_PLAN_PRESETS = [
  {
    id: 'hipertrofia-2100',
    label: 'Hipertrofia Limpa · 2.100 kcal',
    kcalTarget: 2100,
    macros: { carbs: 230, carbsGoal: 240, protein: 162, proteinGoal: 165, fats: 58, fatsGoal: 62 },
    meals: [
      { id: 'h-cafe', slot: '07:30 · Café da Manhã', name: 'Ovos mexidos + Pão integral + Mamão', kcal: 460, protein: 30, carbs: 48, fats: 15, prep: '3 ovos caipiras + 2 fatias pão integral + 150g mamão papaia.', checked: true },
      { id: 'h-almoco', slot: '12:30 · Almoço', name: 'Frango grelhado + Arroz integral + Brócolis', kcal: 680, protein: 56, carbs: 74, fats: 16, prep: '180g peito de frango + 140g arroz integral + mix verde no azeite.', checked: true },
      { id: 'h-lanche', slot: '16:30 · Pré-Treino', name: 'Whey isolado + Banana + Aveia', kcal: 390, protein: 32, carbs: 52, fats: 6, prep: '1 scoop whey + 1 banana prata + 30g aveia em flocos.', checked: false },
      { id: 'h-jantar', slot: '20:00 · Jantar', name: 'Tilápia assada + Purê de mandioquinha', kcal: 570, protein: 44, carbs: 56, fats: 18, prep: '170g filé de tilápia com ervas + 160g purê rústico + rúcula.', checked: false }
    ]
  },
  {
    id: 'lowcarb-1650',
    label: 'Controle Glicêmico · 1.650 kcal',
    kcalTarget: 1650,
    macros: { carbs: 112, carbsGoal: 120, protein: 148, proteinGoal: 150, fats: 68, fatsGoal: 70 },
    meals: [
      { id: 'lc-cafe', slot: '08:00 · Café da Manhã', name: 'Omelete de espinafre + Abacate', kcal: 410, protein: 28, carbs: 14, fats: 26, prep: '3 ovos + espinafre refogado + 60g abacate com limão.', checked: true },
      { id: 'lc-almoco', slot: '13:00 · Almoço', name: 'Salmão grelhado + Aspargos + Quinoa', kcal: 580, protein: 46, carbs: 38, fats: 24, prep: '160g salmão na frigideira + 60g quinoa cozida + aspargos.', checked: false },
      { id: 'lc-lanche', slot: '16:30 · Tarde', name: 'Iogurte grego zero + Mix de castanhas', kcal: 240, protein: 20, carbs: 12, fats: 12, prep: '170g iogurte natural proteico + 15g castanhas.', checked: false },
      { id: 'lc-jantar', slot: '19:30 · Jantar', name: 'Patinho moído + Abobrinha grelhada', kcal: 420, protein: 48, carbs: 26, fats: 11, prep: '160g patinho acebolado + abobrinha ao alho.', checked: false }
    ]
  },
  {
    id: 'definicao-1850',
    label: 'Recomposição Corporal · 1.850 kcal',
    kcalTarget: 1850,
    macros: { carbs: 175, carbsGoal: 185, protein: 155, proteinGoal: 160, fats: 52, fatsGoal: 55 },
    meals: [
      { id: 'df-cafe', slot: '07:15 · Café da Manhã', name: 'Panqueca proteica de banana e cacau', kcal: 420, protein: 32, carbs: 50, fats: 10, prep: '1 banana + 2 ovos + 1 scoop whey + 20g aveia.', checked: true },
      { id: 'df-almoco', slot: '12:30 · Almoço', name: 'Bowl de frango desfiado + Feijão + Salada', kcal: 610, protein: 52, carbs: 64, fats: 14, prep: '160g frango + 100g arroz + 80g feijão carioca + folhas.', checked: true },
      { id: 'df-lanche', slot: '16:15 · Lanche', name: 'Crepioca com queijo cottage', kcal: 330, protein: 24, carbs: 34, fats: 10, prep: '2 colheres tapioca + 1 ovo + 70g queijo cottage.', checked: false },
      { id: 'df-jantar', slot: '19:45 · Jantar', name: 'Peixe branco + Legumes no vapor', kcal: 490, protein: 46, carbs: 36, fats: 14, prep: '180g saint peter + batata doce 100g + vagem.', checked: false }
    ]
  }
];

export const PHOTO_DISH_SAMPLES = [
  {
    id: 'dish-frango-bowl',
    label: 'Bowl Frango & Quinoa',
    subtitle: 'Análise Visual TACO · Porções equilibradas',
    kcal: 540,
    protein: 44,
    carbs: 52,
    fats: 14,
    adherencePct: 96,
    items: ['Frango grelhado · ~155g', 'Quinoa cozida · ~110g', 'Brócolis + cenoura · ~130g']
  },
  {
    id: 'dish-salmao-fit',
    label: 'Salmão + Purê Doce',
    subtitle: 'Ômega-3 detectado · Dentro da janela calórica',
    kcal: 590,
    protein: 40,
    carbs: 46,
    fats: 22,
    adherencePct: 92,
    items: ['Salmão selado · ~140g', 'Purê de batata doce · ~140g', 'Mix de folhas verdes · ~80g']
  },
  {
    id: 'dish-almoco-fora',
    label: 'Prato Executivo Fora',
    subtitle: 'Alerta leve: carboidrato +18% acima da meta do almoço',
    kcal: 710,
    protein: 38,
    carbs: 84,
    fats: 21,
    adherencePct: 81,
    items: ['Bife grelhado · ~140g', 'Arroz branco · ~170g', 'Feijão + farofa leve · ~110g']
  }
];

export const BOT_QUICK_SCENARIOS = [
  {
    id: 'radar-resgate',
    label: 'Detectar Risco Radar',
    mood: 'alert',
    prompt: 'Analise quem precisa de resgate imediato no Radar 360° hoje.'
  },
  {
    id: 'scanner-prato',
    label: 'Simular Foto IA',
    mood: 'scanning',
    prompt: 'Escaneie a última foto de almoço e calcule os macros do prato.'
  },
  {
    id: 'sugerir-troca',
    label: 'Troca TACO Inteligente',
    mood: 'calm',
    prompt: 'Posso trocar o arroz integral do almoço por batata doce?'
  },
  {
    id: 'parabenizar-streak',
    label: 'Celebrar Meta + Streak',
    mood: 'celebrating',
    prompt: 'Monte uma mensagem motivacional de streak e hidratação para enviar no app.'
  }
];

export const INITIAL_PATIENTS = [
  {
    id: 'p-marina',
    name: 'Marina Albuquerque Teixeira de Souza',
    shortName: 'Marina Souza',
    goal: 'Recomposição Corporal (-4% gordura)',
    adherence: 94,
    riskLevel: 'low',
    riskScore: 12,
    riskLabel: 'Adesão Segura',
    streak: 14,
    xp: 1240,
    waterMl: 2000,
    waterGoal: 2500,
    steps: 9420,
    stepsGoal: 10000,
    sleepHours: '7h 45m',
    sleepQuality: '91% ótimo',
    kcalTarget: 1850,
    kcalConsumed: 1420,
    targetWeight: 61.5,
    macros: { carbs: 138, carbsGoal: 185, protein: 126, proteinGoal: 160, fats: 42, fatsGoal: 55 },
    invoiceValue: 480,
    invoiceStatus: 'pago',
    lastSeen: 'Hoje · 11:40',
    weightHistory: [
      { month: 'Jun', weight: 67.4, leanMass: 45.2, fatPct: 26.8 },
      { month: 'Jul', weight: 66.2, leanMass: 45.8, fatPct: 25.4 },
      { month: 'Ago', weight: 65.1, leanMass: 46.1, fatPct: 24.3 },
      { month: 'Set', weight: 64.4, leanMass: 46.6, fatPct: 23.1 },
      { month: 'Out', weight: 63.3, leanMass: 47.0, fatPct: 21.9 },
      { month: 'Nov', weight: 62.6, leanMass: 47.4, fatPct: 21.0 }
    ],
    meals: [
      { id: 'm-1', slot: '07:30 · Café da Manhã', name: 'Panqueca proteica de banana + whey', kcal: 420, protein: 32, carbs: 50, fats: 10, prep: '2 ovos + 1 banana + 1 scoop whey.', checked: true },
      { id: 'm-2', slot: '12:30 · Almoço', name: 'Bowl frango grelhado + quinoa + legumes', kcal: 610, protein: 50, carbs: 62, fats: 15, prep: '160g frango + 120g quinoa + mix verde.', checked: true },
      { id: 'm-3', slot: '16:30 · Lanche Tarde', name: 'Iogurte grego zero + morangos', kcal: 240, protein: 22, carbs: 18, fats: 6, prep: '170g iogurte natural + 100g morango.', checked: false },
      { id: 'm-4', slot: '20:00 · Jantar', name: 'Tilápia assada + purê de mandioquinha', kcal: 540, protein: 44, carbs: 52, fats: 14, prep: '170g peixe branco + 150g purê rústico.', checked: false }
    ],
    workouts: [
      { id: 'w-1', title: 'Treino A · Superiores & Core', detail: '45 min · Zonas Z2/Z3', done: true },
      { id: 'w-2', title: 'Cardio Pós-Treino', detail: '20 min escada moderada', done: false }
    ],
    labExams: [
      { name: 'Ferritina Sérica', value: '68 ng/mL', status: 'Ideal', note: 'Recuperou +24 ng/mL desde julho' },
      { name: 'Vitamina D (25-OH)', value: '44 ng/mL', status: 'Ideal', note: 'Manter 2.000 UI/dia' },
      { name: 'HbA1c (Hemoglobina Glicada)', value: '5,0%', status: 'Ótimo', note: 'Sensibilidade insulínica preservada' }
    ],
    chatHistory: [
      { id: 'c-1', sender: 'bot', time: '09:10', text: 'Bom dia, Marina! Você manteve 14 dias seguidos no plano. Falta apenas 500 ml de água para fechar sua meta de hoje.' },
      { id: 'c-2', sender: 'user', time: '09:14', text: 'Hoje vou almoçar fora no trabalho, posso trocar a quinoa por arroz?' },
      { id: 'c-3', sender: 'bot', time: '09:14', text: 'Pode sim! Troque 120g de quinoa por 130g de arroz branco + 1 concha rasa de feijão. Tire foto do prato aqui para eu calibrar seus macros.' }
    ]
  },
  {
    id: 'p-camila',
    name: 'Camila Silva Nogueira',
    shortName: 'Camila Silva',
    goal: 'Controle Metabólico & -6 kg',
    adherence: 48,
    riskLevel: 'high',
    riskScore: 84,
    riskLabel: 'Risco Alto',
    streak: 1,
    xp: 410,
    waterMl: 750,
    waterGoal: 2400,
    steps: 4120,
    stepsGoal: 8000,
    sleepHours: '5h 50m',
    sleepQuality: '62% alerta',
    kcalTarget: 1650,
    kcalConsumed: 820,
    targetWeight: 69.0,
    macros: { carbs: 86, carbsGoal: 130, protein: 58, proteinGoal: 140, fats: 29, fatsGoal: 55 },
    invoiceValue: 420,
    invoiceStatus: 'pendente',
    lastSeen: 'Há 3 dias · Sem foto',
    weightHistory: [
      { month: 'Jun', weight: 76.2, leanMass: 42.1, fatPct: 33.4 },
      { month: 'Jul', weight: 75.0, leanMass: 42.3, fatPct: 32.1 },
      { month: 'Ago', weight: 74.1, leanMass: 42.4, fatPct: 31.4 },
      { month: 'Set', weight: 74.8, leanMass: 42.0, fatPct: 32.0 },
      { month: 'Out', weight: 73.6, leanMass: 42.5, fatPct: 30.8 },
      { month: 'Nov', weight: 73.9, leanMass: 42.3, fatPct: 31.1 }
    ],
    meals: [
      { id: 'cm-1', slot: '08:00 · Café', name: 'Omelete + Abacate', kcal: 390, protein: 26, carbs: 12, fats: 24, prep: '3 ovos + 60g abacate.', checked: true },
      { id: 'cm-2', slot: '13:00 · Almoço', name: 'Salmão + legumes assados', kcal: 540, protein: 42, carbs: 32, fats: 22, prep: '150g salmão + brócolis + cenoura.', checked: false },
      { id: 'cm-3', slot: '19:30 · Jantar', name: 'Patinho moído + abobrinha', kcal: 420, protein: 46, carbs: 24, fats: 12, prep: '160g carne magra + refogado.', checked: false }
    ],
    workouts: [
      { id: 'cw-1', title: 'Caminhada Metabólica', detail: '30 min ritmo leve', done: false }
    ],
    labExams: [
      { name: 'Insulina Basal', value: '14,2 uUI/mL', status: 'Atenção', note: 'Reduzir picos glicêmicos à noite' },
      { name: 'Vitamina B12', value: '390 pg/mL', status: 'Limítrofe', note: 'Ajustar consumo de carnes/ovos' }
    ],
    chatHistory: [
      { id: 'cc-1', sender: 'bot', time: 'Ontem', text: 'Oi Camila! Notei que fazem 3 dias sem registro de almoço e hidratação abaixo da meta. Quer adaptar o cardápio para opções de 5 min?' }
    ]
  },
  {
    id: 'p-rodrigo',
    name: 'Rodrigo Mendes Carvalho',
    shortName: 'Rodrigo Mendes',
    goal: 'Hipertrofia & Corrida 10K',
    adherence: 76,
    riskLevel: 'medium',
    riskScore: 46,
    riskLabel: 'Atenção',
    streak: 5,
    xp: 890,
    waterMl: 1750,
    waterGoal: 3000,
    steps: 11200,
    stepsGoal: 12000,
    sleepHours: '6h 40m',
    sleepQuality: '74% médio',
    kcalTarget: 2450,
    kcalConsumed: 1620,
    targetWeight: 78.0,
    macros: { carbs: 192, carbsGoal: 290, protein: 132, proteinGoal: 185, fats: 48, fatsGoal: 68 },
    invoiceValue: 550,
    invoiceStatus: 'pendente',
    lastSeen: 'Ontem · 20:15',
    weightHistory: [
      { month: 'Jun', weight: 74.8, leanMass: 56.1, fatPct: 16.4 },
      { month: 'Jul', weight: 75.4, leanMass: 56.8, fatPct: 16.0 },
      { month: 'Ago', weight: 76.1, leanMass: 57.5, fatPct: 15.7 },
      { month: 'Set', weight: 76.0, leanMass: 57.6, fatPct: 15.4 },
      { month: 'Out', weight: 76.9, leanMass: 58.3, fatPct: 15.1 },
      { month: 'Nov', weight: 77.2, leanMass: 58.8, fatPct: 14.8 }
    ],
    meals: [
      { id: 'rm-1', slot: '07:00 · Café', name: 'Pão na chapa + 4 claras + banana', kcal: 540, protein: 34, carbs: 74, fats: 10, prep: '2 fatias pão + ovos + fruta.', checked: true },
      { id: 'rm-2', slot: '12:30 · Almoço', name: 'Frango grelhado + arroz + feijão', kcal: 780, protein: 58, carbs: 94, fats: 18, prep: '200g frango + 200g arroz + feijão.', checked: true },
      { id: 'rm-3', slot: '19:30 · Jantar', name: 'Filé de peixe + batata inglesa assada', kcal: 640, protein: 46, carbs: 76, fats: 14, prep: '180g peixe + 220g batata.', checked: false }
    ],
    workouts: [
      { id: 'rw-1', title: 'Treino B · Inferiores Força', detail: '55 min · Carga progressiva', done: true },
      { id: 'rw-2', title: 'Tiro Intervalado 6 km', detail: 'Ritmo 4:45/km', done: false }
    ],
    labExams: [
      { name: 'CPK Pós-Treino', value: '295 U/L', status: 'Normal Atleta', note: 'Compatível com volume de corrida' }
    ],
    chatHistory: [
      { id: 'rc-1', sender: 'bot', time: '08:05', text: 'Rodrigo, como hoje tem tiro de 6 km, garanta 120g a mais de carboidrato no pré-treino!' }
    ]
  },
  {
    id: 'p-beatriz',
    name: 'Beatriz Costa Pinheiro',
    shortName: 'Beatriz Costa',
    goal: 'Performance & Saúde Intestinal',
    adherence: 96,
    riskLevel: 'low',
    riskScore: 9,
    riskLabel: 'Adesão Segura',
    streak: 21,
    xp: 1680,
    waterMl: 2250,
    waterGoal: 2500,
    steps: 8900,
    stepsGoal: 9000,
    sleepHours: '8h 05m',
    sleepQuality: '94% excelente',
    kcalTarget: 1800,
    kcalConsumed: 1510,
    targetWeight: 58.0,
    macros: { carbs: 152, carbsGoal: 175, protein: 128, proteinGoal: 145, fats: 48, fatsGoal: 54 },
    invoiceValue: 480,
    invoiceStatus: 'pago',
    lastSeen: 'Hoje · 12:02',
    weightHistory: [
      { month: 'Jun', weight: 60.5, leanMass: 42.9, fatPct: 23.1 },
      { month: 'Jul', weight: 60.0, leanMass: 43.2, fatPct: 22.4 },
      { month: 'Ago', weight: 59.4, leanMass: 43.4, fatPct: 21.8 },
      { month: 'Set', weight: 59.1, leanMass: 43.7, fatPct: 21.2 },
      { month: 'Out', weight: 58.6, leanMass: 43.9, fatPct: 20.6 },
      { month: 'Nov', weight: 58.3, leanMass: 44.1, fatPct: 20.1 }
    ],
    meals: [
      { id: 'bm-1', slot: '07:45 · Café', name: 'Overnight oats com chia e whey', kcal: 410, protein: 28, carbs: 46, fats: 11, prep: 'Aveia + leite vegetal + chia + whey.', checked: true },
      { id: 'bm-2', slot: '13:00 · Almoço', name: 'Frango em cubos + abóbora cabotiá', kcal: 590, protein: 48, carbs: 58, fats: 15, prep: '160g frango + 180g cabotiá assada.', checked: true },
      { id: 'bm-3', slot: '20:00 · Jantar', name: 'Omelete + salada de folhas amargas', kcal: 380, protein: 30, carbs: 18, fats: 20, prep: '3 ovos + rúcula + agrião + azeite.', checked: false }
    ],
    workouts: [
      { id: 'bw-1', title: 'Pilates Clínico + Mobilidade', detail: '50 min', done: true }
    ],
    labExams: [
      { name: 'PCR Ultrassensível', value: '0,4 mg/L', status: 'Excelente', note: 'Inflamação sistêmica mínima' }
    ],
    chatHistory: [
      { id: 'bc-1', sender: 'bot', time: '10:30', text: '21 dias consecutivos de streak! Se quiser variar as fibras no jantar, envie a foto do prato.' }
    ]
  },
  {
    id: 'p-lucas',
    name: 'Lucas Ferreira Andrade',
    shortName: 'Lucas Andrade',
    goal: 'Redução Visceral & Energia',
    adherence: 52,
    riskLevel: 'high',
    riskScore: 78,
    riskLabel: 'Risco Alto',
    streak: 2,
    xp: 530,
    waterMl: 1000,
    waterGoal: 2800,
    steps: 3800,
    stepsGoal: 8500,
    sleepHours: '5h 30m',
    sleepQuality: '58% crítico',
    kcalTarget: 2000,
    kcalConsumed: 1100,
    targetWeight: 82.0,
    macros: { carbs: 120, carbsGoal: 190, protein: 76, proteinGoal: 165, fats: 38, fatsGoal: 62 },
    invoiceValue: 450,
    invoiceStatus: 'pendente',
    lastSeen: 'Há 2 dias · Telegram mudo',
    weightHistory: [
      { month: 'Jun', weight: 91.2, leanMass: 59.0, fatPct: 28.4 },
      { month: 'Jul', weight: 89.8, leanMass: 59.1, fatPct: 27.6 },
      { month: 'Ago', weight: 88.5, leanMass: 59.2, fatPct: 26.9 },
      { month: 'Set', weight: 88.9, leanMass: 58.9, fatPct: 27.2 },
      { month: 'Out', weight: 87.6, leanMass: 59.2, fatPct: 26.2 },
      { month: 'Nov', weight: 87.8, leanMass: 59.0, fatPct: 26.4 }
    ],
    meals: [
      { id: 'lm-1', slot: '08:00 · Café', name: 'Pão francês sem miolo + ovos', kcal: 420, protein: 26, carbs: 42, fats: 15, prep: '1 pão + 3 ovos mexidos.', checked: true },
      { id: 'lm-2', slot: '13:00 · Almoço', name: 'Carne magra grelhada + arroz', kcal: 680, protein: 50, carbs: 68, fats: 18, prep: '180g patinho + 140g arroz + salada.', checked: false }
    ],
    workouts: [
      { id: 'lw-1', title: 'Treino Full Body Rápido', detail: '35 min · Em casa ou academia', done: false }
    ],
    labExams: [
      { name: 'Triglicerídeos', value: '182 mg/dL', status: 'Atenção', note: 'Priorizar ômega-3 e caminhadas diárias' }
    ],
    chatHistory: [
      { id: 'lc-1', sender: 'bot', time: 'Ontem', text: 'Lucas, percebi reuniões até tarde esta semana. Quer ativar o modo marmita prática no seu plano?' }
    ]
  },
  {
    id: 'p-helena',
    name: 'Helena Duarte Vasconcelos',
    shortName: 'Helena Duarte',
    goal: 'Emagrecimento Sustentável',
    adherence: 84,
    riskLevel: 'low',
    riskScore: 22,
    riskLabel: 'Em Evolução',
    streak: 9,
    xp: 1090,
    waterMl: 1850,
    waterGoal: 2300,
    steps: 7850,
    stepsGoal: 8000,
    sleepHours: '7h 20m',
    sleepQuality: '85% bom',
    kcalTarget: 1680,
    kcalConsumed: 1210,
    targetWeight: 62.0,
    macros: { carbs: 118, carbsGoal: 155, protein: 108, proteinGoal: 138, fats: 38, fatsGoal: 50 },
    invoiceValue: 480,
    invoiceStatus: 'pago',
    lastSeen: 'Hoje · 09:50',
    weightHistory: [
      { month: 'Jun', weight: 68.4, leanMass: 43.0, fatPct: 30.2 },
      { month: 'Jul', weight: 67.3, leanMass: 43.2, fatPct: 29.1 },
      { month: 'Ago', weight: 66.2, leanMass: 43.3, fatPct: 28.0 },
      { month: 'Set', weight: 65.4, leanMass: 43.5, fatPct: 27.1 },
      { month: 'Out', weight: 64.5, leanMass: 43.6, fatPct: 26.2 },
      { month: 'Nov', weight: 63.9, leanMass: 43.8, fatPct: 25.5 }
    ],
    meals: [
      { id: 'hm-1', slot: '07:30 · Café', name: 'Cuscuz nordestino + ovo pochê + café', kcal: 390, protein: 22, carbs: 46, fats: 11, prep: '100g cuscuz + 2 ovos.', checked: true },
      { id: 'hm-2', slot: '12:30 · Almoço', name: 'Frango grelhado + feijão + legumes', kcal: 560, protein: 46, carbs: 54, fats: 14, prep: '150g frango + 100g arroz + feijão.', checked: true },
      { id: 'hm-3', slot: '19:30 · Jantar', name: 'Sopa proteica de legumes com frango', kcal: 360, protein: 34, carbs: 28, fats: 9, prep: 'Abóbora + chuchu + 130g frango desfiado.', checked: false }
    ],
    workouts: [
      { id: 'hw-1', title: 'Musculação Funcional', detail: '45 min', done: true }
    ],
    labExams: [
      { name: 'Perfil Lipídico LDL', value: '96 mg/dL', status: 'Ótimo', note: 'Evolução consistente' }
    ],
    chatHistory: [
      { id: 'hc-1', sender: 'bot', time: '09:51', text: 'Excelente começo de dia, Helena! Hidratação já em 80% da meta.' }
    ]
  }
];

export const INITIAL_APPOINTMENTS = [
  { id: 'ap-1', day: 'Seg 17', time: '09:30', patientId: 'p-marina', patientName: 'Marina Souza', type: 'Bioimpedância + Revisão', status: 'confirmado' },
  { id: 'ap-2', day: 'Ter 18', time: '14:00', patientId: 'p-camila', patientName: 'Camila Silva', type: 'Resgate Radar (Teleconsulta)', status: 'proximo' },
  { id: 'ap-3', day: 'Qua 19', time: '16:30', patientId: 'p-rodrigo', patientName: 'Rodrigo Mendes', type: 'Periodização Pré-Prova 10K', status: 'confirmado' },
  { id: 'ap-4', day: 'Qui 20', time: '18:00', patientId: 'p-lucas', patientName: 'Lucas Andrade', type: 'Revisão Exames Lipídicos', status: 'pendente' },
  { id: 'ap-5', day: 'Sex 21', time: '10:15', patientId: 'p-beatriz', patientName: 'Beatriz Costa', type: 'Check-up Mensal + Plano TACO', status: 'confirmado' }
];

export function formatBRL(val) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(val) || 0);
}

export function generateClarixBotReply(text, patient, role = 'patient') {
  const q = String(text || '').toLowerCase();
  const short = patient?.shortName || 'paciente';
  const remainingWater = Math.max(0, (patient?.waterGoal || 2500) - (patient?.waterMl || 0));
  const remainingKcal = Math.max(0, (patient?.kcalTarget || 1800) - (patient?.kcalConsumed || 0));

  if (q.includes('risco') || q.includes('radar') || q.includes('resgate') || q.includes('desist')) {
    return {
      mood: 'alert',
      summaryTag: 'Radar 360° Ativo',
      reply: `Alerta Radar 360°: ${short} está com ${patient?.adherence ?? 75}% de aderência (score de risco ${patient?.riskScore ?? 30}/100). Recomendo disparar micro-check-in leve com 1 refeição âncora e meta de +500 ml de água hoje.`
    };
  }

  if (q.includes('foto') || q.includes('prato') || q.includes('escane') || q.includes('scanner')) {
    return {
      mood: 'scanning',
      summaryTag: 'Visão Computacional TACO',
      reply: `Scanner de Prato calibrado para ${short}: avalio proteína grelhada, densidade calórica (~${remainingKcal} kcal restantes hoje) e gero troca TACO automática sem perder a meta de proteína (${patient?.macros?.proteinGoal || 150}g).`
    };
  }

  if (q.includes('troca') || q.includes('arroz') || q.includes('batata') || q.includes('frango') || q.includes('substit')) {
    return {
      mood: 'calm',
      summaryTag: 'Equivalência TACO',
      reply: `Equivalência aprovada para ${short}: 130g de arroz cozido equivalem a ~145g de batata doce assada ou 120g de mandioca, mantendo ~36g de carboidrato complexo e a mesma saciedade pós-prandial.`
    };
  }

  if (q.includes('água') || q.includes('agua') || q.includes('hidrata') || q.includes('streak') || q.includes('meta') || q.includes('parab')) {
    return {
      mood: 'celebrating',
      summaryTag: 'Streak & Gamificação',
      reply: `Ritmo ótimo, ${short}! Streak ativo em ${patient?.streak || 1} dia(s) com ${patient?.xp || 100} XP acumulados. Faltam apenas ${remainingWater} ml de água hoje para completar 100% da hidratação.`
    };
  }

  if (role === 'nutri') {
    return {
      mood: 'calm',
      summaryTag: 'NutrIA Clínica',
      reply: `Briefing de ${short}: meta ${patient?.kcalTarget || 1800} kcal/dia, ingestão atual em ${patient?.kcalConsumed || 1200} kcal (${patient?.adherence || 80}% de aderência) e sono ${patient?.sleepHours || '7h'}. Posso sugerir ajuste calórico ou acionar a NutrIA para o paciente agora.`
    };
  }

  return {
    mood: 'calm',
    summaryTag: 'NutrIA',
    reply: `Recebido, ${short}! Sua meta de hoje está em ${patient?.kcalConsumed || 0} / ${patient?.kcalTarget || 1850} kcal (${remainingKcal} kcal disponíveis) e faltam ${remainingWater} ml de água. Posso sugerir uma troca TACO ou analisar uma foto do seu próximo prato!`
  };
}
