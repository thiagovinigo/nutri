// Base de dados inicial do protótipo funcional NØEMA × Nutrivvo (dados fictícios, sem CPF real)

export const INITIAL_PATIENTS = [
  {
    id: 'p1',
    name: 'Marina Albuquerque Teixeira de Souza',
    shortName: 'Marina Souza',
    goal: 'Recomposição corporal & Ferritina baixa',
    streak: 14,
    xp: 1180,
    adherence: 96,
    riskScore: 8,
    riskLabel: 'Adesão Segura (96%)',
    status: 'ativo',
    lastSeen: 'Hoje · 12:18',
    waterMl: 1750,
    waterGoal: 2500,
    sleepHours: '7h 45m',
    sleepQuality: 'Ótimo',
    invoicePlanName: 'Semestral Acompanhado',
    planValueNum: 2950,
    planDue: '22/11',
    invoiceStatus: 'pago',
    planTitle: 'Plano Metabólico Anti-inflamatório · 2.100 kcal',
    planKcal: 2100,
    planMacros: '158g Proteína · 215g Carboidrato · 68g Gordura',
    examSummary:
      'Ferritina subiu de 18 para 46 ng/mL (+155%) com boa tolerância gástrica. Vitamina D em curva ascendente. Manter aporte proteico em 2,1g/kg e ferro heme no almoço.',
    biomarkers: {
      visits: ['Mai', 'Jul', 'Set', 'Nov'],
      leanMass: [44.2, 45.1, 46.4, 47.6],
      bodyFat: [29.8, 27.4, 24.9, 22.8]
    },
    labs: [
      { marker: 'Ferritina sérica', prev: '18 ng/mL', curr: '46 ng/mL', delta: '+155%', tone: 'ok' },
      { marker: 'Vitamina D (25-OH)', prev: '21 ng/mL', curr: '39 ng/mL', delta: '+86%', tone: 'ok' },
      { marker: 'Glicemia em jejum', prev: '97 mg/dL', curr: '86 mg/dL', delta: '-11%', tone: 'ok' },
      { marker: 'Insulina basal', prev: '13,4 µU/mL', curr: '7,8 µU/mL', delta: '-42%', tone: 'ok' }
    ],
    meals: [
      {
        id: 'm1',
        slot: '07:30 · Café da Manhã',
        name: 'Panqueca Proteica de Banana com Aveia e Canela',
        kcal: 420,
        checked: true,
        items: ['Ovo de galinha inteiro · 100g (2 unid.)', 'Aveia em flocos finos · 35g', 'Banana prata madura · 90g', 'Canela em pó + café coado sem açúcar'],
        prep: 'Amasse a banana, bata com os ovos e a aveia por 30s. Grelhe em frigideira antiaderente por 2 minutos de cada lado.'
      },
      {
        id: 'm2',
        slot: '12:30 · Almoço',
        name: 'Bowl de Frango Grelhado com Arroz Integral e Legumes',
        kcal: 690,
        checked: false,
        items: ['Peito de frango grelhado · 150g', 'Arroz integral cozido · 120g', 'Feijão carioca · 80g', 'Mix de folhas verdes + tomate + 1 col. sopa azeite'],
        prep: 'Tempere o frango com limão, alho e páprica. Sirva sobre o arroz quente e finalize com azeite cru.'
      },
      {
        id: 'm3',
        slot: '19:30 · Jantar',
        name: 'Tilápia Assada com Purê Rústico de Mandioquinha',
        kcal: 540,
        checked: false,
        items: ['Filé de tilápia ao forno · 160g', 'Mandioquinha cozida amassada · 140g', 'Brócolis salteados no alho · 100g'],
        prep: 'Asse a tilápia a 200 °C por 14 minutos com ervas finas. Sirva com o purê rústico e brócolis al dente.'
      }
    ],
    workouts: [
      { id: 'w1', name: 'Remada curvada com barra', sets: '4x10 · RIR 2', done: true },
      { id: 'w2', name: 'Desenvolvimento com halteres', sets: '3x12 · Cadência 202', done: true },
      { id: 'w3', name: 'Puxada frontal pegada neutra', sets: '3x12 · Controle excêntrico', done: false },
      { id: 'w4', name: 'Prancha isométrica + Core', sets: '3x45s · Intervalo 45s', done: false }
    ],
    chat: [
      { id: 'c1', from: 'bot', ts: '09:10', text: 'Bom dia, Marina! Faltam só 750 ml de água para fechar sua meta de 2.500 ml hoje.' },
      { id: 'c2', from: 'user', ts: '11:42', text: 'Estou no restaurante do trabalho e hoje não tem tilápia. Posso trocar no jantar?' },
      { id: 'c3', from: 'bot', ts: '11:43', text: 'Pode sim! Para manter as ~32g de proteína, peça 130g de patinho moído refogado + 120g de arroz integral e salada à vontade.' }
    ]
  },
  {
    id: 'p2',
    name: 'Camila Silva Nogueira',
    shortName: 'Camila Silva',
    goal: 'Emagrecimento sustentável (SOP)',
    streak: 0,
    xp: 210,
    adherence: 28,
    riskScore: 82,
    riskLabel: 'Risco Alto (82%)',
    status: 'risco',
    lastSeen: 'Há 4 dias · Sem foto do almoço',
    waterMl: 500,
    waterGoal: 2200,
    sleepHours: '5h 30m',
    sleepQuality: 'Irregular',
    invoicePlanName: 'Mensal Recorrente',
    planValueNum: 1850,
    planDue: 'Hoje',
    invoiceStatus: 'vencendo',
    planTitle: 'Plano Controle Glicêmico SOP · 1.650 kcal',
    planKcal: 1650,
    planMacros: '125g Proteína · 145g Carboidrato · 62g Gordura',
    examSummary: 'Insulina basal elevada (16,2 µU/mL). Priorizar fibras solúveis antes do almoço e caminhada pós-refeição.',
    biomarkers: {
      visits: ['Mai', 'Jul', 'Set', 'Nov'],
      leanMass: [39.1, 39.2, 39.0, 38.8],
      bodyFat: [34.5, 33.8, 34.0, 34.4]
    },
    labs: [
      { marker: 'Insulina basal', prev: '15,8 µU/mL', curr: '16,2 µU/mL', delta: '+2%', tone: 'warn' },
      { marker: 'Glicemia em jejum', prev: '99 mg/dL', curr: '101 mg/dL', delta: '+2%', tone: 'warn' },
      { marker: 'Ferritina sérica', prev: '38 ng/mL', curr: '40 ng/mL', delta: '+5%', tone: 'ok' },
      { marker: 'Vitamina D (25-OH)', prev: '24 ng/mL', curr: '27 ng/mL', delta: '+12%', tone: 'warn' }
    ],
    meals: [
      {
        id: 'm1',
        slot: '08:00 · Café da Manhã',
        name: 'Ovos Mexidos com Semente de Chia e Mamão',
        kcal: 360,
        checked: false,
        items: ['2 ovos mexidos', '150g mamão formosa', '1 col. sopa chia'],
        prep: 'Prepare os ovos em fogo baixo e sirva a chia sobre o mamão.'
      },
      {
        id: 'm2',
        slot: '13:00 · Almoço',
        name: 'Salada Morna de Carne Magra com Grão-de-Bico',
        kcal: 540,
        checked: false,
        items: ['Patinho grelhado · 130g', 'Grão-de-bico · 90g', 'Abobrinha e folhas'],
        prep: 'Comece pelas folhas com limão antes da porção principal.'
      }
    ],
    workouts: [
      { id: 'w1', name: 'Caminhada metabólica pós-almoço', sets: '25 min ritmo moderado', done: false },
      { id: 'w2', name: 'Agachamento livre assistido', sets: '3x12 · Pausa 60s', done: false }
    ],
    chat: [
      { id: 'c1', from: 'bot', ts: 'Ontem', text: 'Oi Camila! Sentimos sua falta nos últimos dias. Quer ajustar algum horário do cardápio para ficar mais fácil?' }
    ]
  },
  {
    id: 'p3',
    name: 'Rodrigo Mendes Carvalho',
    shortName: 'Rodrigo Mendes',
    goal: 'Hipertrofia e controle glicêmico',
    streak: 2,
    xp: 490,
    adherence: 64,
    riskScore: 45,
    riskLabel: 'Atenção (45%)',
    status: 'atencao',
    lastSeen: 'Ontem · 20:40',
    waterMl: 1500,
    waterGoal: 3000,
    sleepHours: '6h 40m',
    sleepQuality: 'Bom',
    invoicePlanName: 'Trimestral Esportivo',
    planValueNum: 2400,
    planDue: '16/11',
    invoiceStatus: 'atrasado',
    planTitle: 'Superávit Limpo Performance · 2.850 kcal',
    planKcal: 2850,
    planMacros: '195g Proteína · 340g Carboidrato · 78g Gordura',
    examSummary: 'CPK compatível com carga de treino intensa. Bom perfil lipídico; aumentar hidratação para 3L.',
    biomarkers: {
      visits: ['Mai', 'Jul', 'Set', 'Nov'],
      leanMass: [51.0, 51.8, 52.5, 53.1],
      bodyFat: [17.4, 16.9, 16.5, 16.2]
    },
    labs: [
      { marker: 'Hemoglobina glicada', prev: '5,5%', curr: '5,2%', delta: '-5%', tone: 'ok' },
      { marker: 'HDL Colesterol', prev: '46 mg/dL', curr: '54 mg/dL', delta: '+17%', tone: 'ok' },
      { marker: 'Ferritina sérica', prev: '82 ng/mL', curr: '88 ng/mL', delta: '+7%', tone: 'ok' },
      { marker: 'Vitamina B12', prev: '410 pg/mL', curr: '520 pg/mL', delta: '+27%', tone: 'ok' }
    ],
    meals: [
      {
        id: 'm1',
        slot: '07:00 · Pré-treino',
        name: 'Mingau de Aveia com Whey e Pasta de Amendoim',
        kcal: 580,
        checked: true,
        items: ['Aveia · 60g', 'Whey isolado · 30g', 'Banana + 15g pasta de amendoim'],
        prep: 'Cozinhe a aveia em água por 3 minutos e misture o whey fora do fogo.'
      },
      {
        id: 'm2',
        slot: '12:30 · Almoço',
        name: 'Sobrecoxa Assada com Arroz Branco e Feijão',
        kcal: 890,
        checked: false,
        items: ['Sobrecoxa sem pele · 180g', 'Arroz cozido · 220g', 'Feijão preto · 100g'],
        prep: 'Asse temperada com alecrim e limão.'
      }
    ],
    workouts: [
      { id: 'w1', name: 'Supino reto com barra', sets: '4x8 · Carga progressiva', done: true },
      { id: 'w2', name: 'Leg Press 45°', sets: '4x12 · Amplitude máxima', done: false }
    ],
    chat: [
      { id: 'c1', from: 'bot', ts: 'Hoje', text: 'Rodrigo, faltam 1.500 ml de água hoje. Lembrete do pré-treino ativo!' }
    ]
  },
  {
    id: 'p4',
    name: 'Beatriz Costa Pinheiro',
    shortName: 'Beatriz Costa',
    goal: 'Meia Maratona 21km & Hidratação',
    streak: 21,
    xp: 1840,
    adherence: 98,
    riskScore: 4,
    riskLabel: 'Adesão Segura (98%)',
    status: 'ativo',
    lastSeen: 'Hoje · 08:55',
    waterMl: 2250,
    waterGoal: 2500,
    sleepHours: '8h 10m',
    sleepQuality: 'Excelente',
    invoicePlanName: 'Semestral Performance',
    planValueNum: 3200,
    planDue: '05/12',
    invoiceStatus: 'pago',
    planTitle: 'Periodização Endurance 21km · 2.400 kcal',
    planKcal: 2400,
    planMacros: '145g Proteína · 310g Carboidrato · 64g Gordura',
    examSummary: 'Excelente adaptação aeróbia. Manter reposição de carboidratos pré-longão de sábado.',
    biomarkers: {
      visits: ['Mai', 'Jul', 'Set', 'Nov'],
      leanMass: [45.0, 45.6, 46.2, 46.9],
      bodyFat: [21.5, 20.6, 19.9, 19.1]
    },
    labs: [
      { marker: 'Ferritina sérica', prev: '29 ng/mL', curr: '54 ng/mL', delta: '+86%', tone: 'ok' },
      { marker: 'Vitamina D (25-OH)', prev: '33 ng/mL', curr: '48 ng/mL', delta: '+45%', tone: 'ok' },
      { marker: 'Magnésio sérico', prev: '1,9 mg/dL', curr: '2,2 mg/dL', delta: '+16%', tone: 'ok' },
      { marker: 'PCR Ultra', prev: '1,4 mg/L', curr: '0,6 mg/L', delta: '-57%', tone: 'ok' }
    ],
    meals: [
      {
        id: 'm1',
        slot: '06:00 · Pré-rodagem',
        name: 'Torrada de Fermentação Natural com Mel e Banana',
        kcal: 380,
        checked: true,
        items: ['2 fatias pão fermentação natural', '1 col. sopa mel', '1 banana prata'],
        prep: 'Consumir 35 minutos antes do treino longo.'
      }
    ],
    workouts: [
      { id: 'w1', name: 'Rodagem progressiva 12km', sets: 'Pace Z2 -> Z3 final', done: true }
    ],
    chat: [
      { id: 'c1', from: 'bot', ts: 'Hoje', text: '21 dias seguidos, Beatriz! Você desbloqueou o marco Resistência Blindada.' }
    ]
  },
  {
    id: 'p5',
    name: 'Rafael Vasconcelos Dias',
    shortName: 'Rafael Dias',
    goal: 'Redução de triglicerídeos',
    streak: 1,
    xp: 320,
    adherence: 51,
    riskScore: 41,
    riskLabel: 'Atenção (41%)',
    status: 'atencao',
    lastSeen: 'Há 2 dias',
    waterMl: 1000,
    waterGoal: 2500,
    sleepHours: '6h 15m',
    sleepQuality: 'Regular',
    invoicePlanName: 'Protocolo Metabólico',
    planValueNum: 2150,
    planDue: '28/11',
    invoiceStatus: 'pago',
    planTitle: 'Mediterrânea Hipolipídica · 1.950 kcal',
    planKcal: 1950,
    planMacros: '140g Proteína · 190g Carboidrato · 66g Gordura',
    examSummary: 'Triglicerídeos caíram de 248 para 168 mg/dL. Reduzir álcool aos fins de semana.',
    biomarkers: {
      visits: ['Mai', 'Jul', 'Set', 'Nov'],
      leanMass: [46.1, 46.5, 47.0, 47.3],
      bodyFat: [26.8, 25.9, 24.8, 24.1]
    },
    labs: [
      { marker: 'Triglicerídeos', prev: '248 mg/dL', curr: '168 mg/dL', delta: '-32%', tone: 'ok' },
      { marker: 'LDL Colesterol', prev: '142 mg/dL', curr: '116 mg/dL', delta: '-18%', tone: 'ok' },
      { marker: 'TGP / ALT', prev: '48 U/L', curr: '31 U/L', delta: '-35%', tone: 'ok' },
      { marker: 'Glicemia em jejum', prev: '102 mg/dL', curr: '93 mg/dL', delta: '-9%', tone: 'ok' }
    ],
    meals: [
      {
        id: 'm1',
        slot: '12:30 · Almoço',
        name: 'Salmão Grelhado com Quinoa e Legumes Salteados',
        kcal: 610,
        checked: false,
        items: ['Salmão · 140g', 'Quinoa cozida · 110g', 'Vagem + cenoura'],
        prep: 'Grelhe em chapa quente com limão siciliano.'
      }
    ],
    workouts: [
      { id: 'w1', name: 'Ergômetro / Bike intervalada', sets: '30 min · 8 tiros de 1 min', done: false }
    ],
    chat: [
      { id: 'c1', from: 'bot', ts: 'Hoje', text: 'Rafael, já registrou o almoço hoje? Uma foto rápida garante +35 XP.' }
    ]
  },
  {
    id: 'p6',
    name: 'Juliana Ferreira Lima',
    shortName: 'Juliana Ferreira',
    goal: 'Saúde intestinal (Low FODMAP)',
    streak: 9,
    xp: 790,
    adherence: 89,
    riskScore: 14,
    riskLabel: 'Adesão Segura (89%)',
    status: 'ativo',
    lastSeen: 'Hoje · 11:05',
    waterMl: 2000,
    waterGoal: 2400,
    sleepHours: '7h 30m',
    sleepQuality: 'Bom',
    invoicePlanName: 'Trimestral FODMAP',
    planValueNum: 2300,
    planDue: '30/11',
    invoiceStatus: 'pago',
    planTitle: 'Reintrodução FODMAP Fase 2 · 1.850 kcal',
    planKcal: 1850,
    planMacros: '130g Proteína · 185g Carboidrato · 62g Gordura',
    examSummary: 'Redução acentuada de distensão abdominal. Testar tolerância gradual a grão-de-bico 40g.',
    biomarkers: {
      visits: ['Mai', 'Jul', 'Set', 'Nov'],
      leanMass: [41.5, 41.9, 42.3, 42.6],
      bodyFat: [25.4, 24.8, 24.2, 23.7]
    },
    labs: [
      { marker: 'Calprotectina fecal', prev: '74 µg/g', curr: '28 µg/g', delta: '-62%', tone: 'ok' },
      { marker: 'Vitamina B12', prev: '340 pg/mL', curr: '495 pg/mL', delta: '+46%', tone: 'ok' },
      { marker: 'Ferritina sérica', prev: '31 ng/mL', curr: '45 ng/mL', delta: '+45%', tone: 'ok' },
      { marker: 'TSH', prev: '2,8 mUI/L', curr: '2,1 mUI/L', delta: '-25%', tone: 'ok' }
    ],
    meals: [
      {
        id: 'm1',
        slot: '12:00 · Almoço',
        name: 'Peito de Frango com Arroz Basmati e Cenoura Assada',
        kcal: 560,
        checked: true,
        items: ['Frango desfiado · 130g', 'Arroz basmati · 110g', 'Cenoura assada + cúrcuma'],
        prep: 'Tempere apenas com sal, azeite, gengibre e cebolinha verde.'
      }
    ],
    workouts: [
      { id: 'w1', name: 'Pilates solo + mobilidade diafragmática', sets: '40 min', done: true }
    ],
    chat: [
      { id: 'c1', from: 'bot', ts: 'Hoje', text: 'Juliana, lembre-se de anotar como se sentiu 2h após a porção teste de hoje.' }
    ]
  }
];

export const MEAL_PLAN_PRESETS = [
  {
    id: 'preset-recomp',
    label: 'Recomposição Anti-inflamatória · 2.100 kcal',
    planTitle: 'Plano Metabólico Anti-inflamatório · 2.100 kcal',
    planKcal: 2100,
    planMacros: '158g Proteína · 215g Carboidrato · 68g Gordura',
    meals: [
      {
        id: 'mp1',
        slot: '07:30 · Café da Manhã',
        name: 'Panqueca Proteica de Banana com Aveia e Canela',
        kcal: 420,
        checked: false,
        items: ['Ovo inteiro · 100g', 'Aveia em flocos · 35g', 'Banana prata · 90g'],
        prep: 'Bater tudo e grelhar 2 min por lado em fogo baixo.'
      },
      {
        id: 'mp2',
        slot: '12:30 · Almoço',
        name: 'Bowl de Frango Grelhado com Arroz Integral e Legumes',
        kcal: 690,
        checked: false,
        items: ['Frango grelhado · 150g', 'Arroz integral · 120g', 'Feijão carioca · 80g', 'Folhas + azeite'],
        prep: 'Servir com vegetais frescos e 1 col. sopa de azeite extravirgem.'
      },
      {
        id: 'mp3',
        slot: '19:30 · Jantar',
        name: 'Tilápia Assada com Purê Rústico de Mandioquinha',
        kcal: 540,
        checked: false,
        items: ['Tilápia assada · 160g', 'Mandioquinha · 140g', 'Brócolis · 100g'],
        prep: 'Assar a 200 °C por 14 min com ervas finas.'
      }
    ]
  },
  {
    id: 'preset-cut',
    label: 'Emagrecimento Controle Glicêmico · 1.650 kcal',
    planTitle: 'Protocolo Déficit Inteligente TACO · 1.650 kcal',
    planKcal: 1650,
    planMacros: '140g Proteína · 145g Carboidrato · 56g Gordura',
    meals: [
      {
        id: 'cp1',
        slot: '08:00 · Café da Manhã',
        name: 'Omelete de Claras com Queijo Branco e Mamão com Chia',
        kcal: 350,
        checked: false,
        items: ['2 ovos + 2 claras', 'Queijo minas · 30g', 'Mamão · 140g + 10g chia'],
        prep: 'Bater os ovos com orégano e preparar em frigideira antiaderente.'
      },
      {
        id: 'cp2',
        slot: '12:30 · Almoço',
        name: 'Patinho Grelhado com Quinoa e Mix de Folhas Verdes',
        kcal: 560,
        checked: false,
        items: ['Patinho · 140g', 'Quinoa · 90g', 'Rúcula + tomate + pepino à vontade'],
        prep: 'Iniciar pelo prato de salada para maior saciedade glicêmica.'
      },
      {
        id: 'cp3',
        slot: '19:00 · Jantar',
        name: 'Sopa Cremosa de Abóbora Cabotiá com Frango Desfiado',
        kcal: 410,
        checked: false,
        items: ['Abóbora cabotiá · 200g', 'Frango desfiado · 140g', 'Gengibre e salsinha'],
        prep: 'Cozinhar a abóbora no caldo natural, bater e finalizar com frango.'
      }
    ]
  },
  {
    id: 'preset-hyper',
    label: 'Hipertrofia Performance · 2.850 kcal',
    planTitle: 'Protocolo Anabólico Progressivo · 2.850 kcal',
    planKcal: 2850,
    planMacros: '198g Proteína · 340g Carboidrato · 76g Gordura',
    meals: [
      {
        id: 'hp1',
        slot: '07:00 · Pré-treino',
        name: 'Mingau Proteico de Aveia, Banana e Pasta de Amendoim',
        kcal: 620,
        checked: false,
        items: ['Aveia · 60g', 'Whey isolado · 30g', 'Banana · 120g', 'Pasta amendoim · 20g'],
        prep: 'Cozinhar a aveia por 3 min e incorporar o whey depois de morno.'
      },
      {
        id: 'hp2',
        slot: '12:30 · Almoço',
        name: 'Sobrecoxa Assada sem Pele com Arroz, Feijão e Batata-Doce',
        kcal: 920,
        checked: false,
        items: ['Sobrecoxa · 180g', 'Arroz branco · 200g', 'Feijão · 100g', 'Batata-doce · 120g'],
        prep: 'Assar no forno com limão, páprica doce e alho.'
      },
      {
        id: 'hp3',
        slot: '20:00 · Pós-treino',
        name: 'Filé de Salmão com Purê de Batata Inglesa e Aspargos',
        kcal: 740,
        checked: false,
        items: ['Salmão · 170g', 'Batata inglesa · 240g', 'Aspargos grelhados · 100g'],
        prep: 'Grelhar salmão por 4 min cada lado mantendo o centro suculento.'
      }
    ]
  }
];

export const PHOTO_DISH_SAMPLES = [
  {
    id: 'dish-bowl',
    label: 'Bowl Frango & Quinoa',
    subtitle: 'Almoço equilibrado · 580 kcal',
    items: ['Frango grelhado · ~150g (45g Prot)', 'Quinoa & arroz integral · ~120g (34g Carb)', 'Mix de folhas, tomate & azeite · ~110g'],
    adherencePct: 96
  },
  {
    id: 'dish-salmon',
    label: 'Salmão & Legumes',
    subtitle: 'Jantar anti-inflamatório · 540 kcal',
    items: ['Filé de salmão · ~140g (31g Prot)', 'Purê de mandioquinha · ~130g (28g Carb)', 'Brócolis no vapor · ~100g'],
    adherencePct: 94
  },
  {
    id: 'dish-cafe',
    label: 'Panqueca Proteica',
    subtitle: 'Café da manhã · 420 kcal',
    items: ['Massa aveia + ovo · 2 unidades (24g Prot)', 'Banana fatiada · ~90g (22g Carb)', 'Canela & café sem açúcar'],
    adherencePct: 98
  }
];

export const INITIAL_APPOINTMENTS = [
  { id: 'a1', day: 'Seg 18', time: '09:00', patientName: 'Beatriz Costa Pinheiro', type: 'Retorno Online', confirmed: true },
  { id: 'a2', day: 'Seg 18', time: '14:00', patientName: 'Camila Silva Nogueira', type: 'Reavaliação', confirmed: false },
  { id: 'a3', day: 'Ter 19', time: '10:30', patientName: 'Marina Albuquerque Teixeira de Souza', type: 'Bioimpedância', confirmed: true },
  { id: 'a4', day: 'Ter 19', time: '16:00', patientName: 'Rodrigo Mendes Carvalho', type: 'Check-in Quinzenal', confirmed: true },
  { id: 'a5', day: 'Qua 20', time: '08:30', patientName: 'Rafael Vasconcelos Dias', type: '1ª Consulta', confirmed: true },
  { id: 'a6', day: 'Qua 20', time: '15:00', patientName: 'Juliana Ferreira Lima', type: 'Ajuste FODMAP', confirmed: true },
  { id: 'a7', day: 'Sex 22', time: '14:30', patientName: 'Marina Albuquerque Teixeira de Souza', type: 'Entrega Cardápio 30d', confirmed: true }
];

export function formatBRL(val) {
  return Number(val || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function generateNutriBotReply(userText, patient) {
  const q = String(userText || '').toLowerCase();
  const first = (patient?.name || 'Paciente').split(' ')[0];

  if (q.includes('trocar') || q.includes('substit') || q.includes('frango') || q.includes('peixe') || q.includes('tilápia') || q.includes('carne')) {
    return `${first}, ótima pergunta! No seu plano (${patient?.planKcal || 2100} kcal), você pode trocar 150g de frango ou tilápia por 130g de patinho moído, 140g de lombo suíno magro ou 3 ovos inteiros + 60g de queijo branco mantendo a mesma faixa proteica.`;
  }
  if (q.includes('água') || q.includes('agua') || q.includes('hidrata') || q.includes('sede')) {
    const falta = Math.max(0, (patient?.waterGoal || 2500) - (patient?.waterMl || 0));
    return falta === 0
      ? `Parabéns, ${first}! Você já bateu sua meta de ${patient?.waterGoal} ml hoje. Mantenha mais um copo leve até a hora de dormir.`
      : `${first}, você está com ${patient?.waterMl} ml de ${patient?.waterGoal} ml hoje. Faltam ${falta} ml — tente tomar 1 copo de 250 ml antes da próxima refeição!`;
  }
  if (q.includes('treino') || q.includes('academia') || q.includes('exerc') || q.includes('pré-treino') || q.includes('pre')) {
    return `Seu treino hoje está calibrado aos ${patient?.planKcal || 2100} kcal do seu cardápio. Se treinar em até 60 minutos, garanta uma fonte leve de carboidrato (1 banana + 15g aveia) antes de ir.`;
  }
  if (q.includes('consulta') || q.includes('agenda') || q.includes('horário') || q.includes('horario')) {
    return `Anotei sua dúvida sobre agendamento, ${first}! O próximo retorno fica confirmado aqui no Telegram com 24h de antecedência para evitar desencontros.`;
  }
  if (q.includes('fome') || q.includes('doce') || q.includes('noite') || q.includes('ansiedade')) {
    return `Quando bater vontade de doce à noite, ${first}, use a estratégia de volume + proteína do plano: 170g de iogurte natural com cacau 100% + morangos picados e canela (menos de 160 kcal).`;
  }
  return `Recebido, ${first}! Registrei sua mensagem no histórico do seu prontuário para revisão da nutricionista e mantive seu foco ativo no plano "${patient?.planTitle || 'Nutrivvo'}". Quer que eu calcule alguma substituição específica?`;
}
