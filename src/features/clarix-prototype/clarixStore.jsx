import React, { createContext, useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  INITIAL_APPOINTMENTS,
  INITIAL_PATIENTS,
  INITIAL_RECIPES,
  MEAL_PLAN_PRESETS,
  calculateMifflinTmbGet,
  formatBRL,
  generateClarixBotReply
} from './clarixData';

const STORAGE_KEY = 'nutrivvo_nutria_proto_v5';

const ClarixContext = createContext(null);

function nowHHMM() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function createInitialState() {
  return {
    patients: INITIAL_PATIENTS,
    activePatientId: 'p-marina',
    appointments: INITIAL_APPOINTMENTS,
    recipes: INITIAL_RECIPES,
    clinicSettings: {
      clinicName: 'Clínica Nutrivvo · Dra. Helena Martins',
      crn: 'CRN-3 48219',
      slotMinutes: 45,
      workDays: 'Seg a Sex · 08h00–19h00',
      telegramActive: true,
      whatsappActive: true
    },
    selectedDayIdx: 2,
    botMood: 'calm',
    botSpeech: 'NutrIA ativa. Monitorando 6 pacientes entre consultas e calibrando trocas TACO em tempo real.',
    botPulseCount: 0,
    syncLog: [
      { id: 'log-1', time: '11:40', text: 'Marina Souza fechou café + almoço e alcançou 2.000 ml de água (+45 XP)', type: 'paciente' },
      { id: 'log-2', time: '10:15', text: 'Radar 360° detectou Camila Silva em Risco Alto (84/100) — sugestão de resgate pronta', type: 'radar' },
      { id: 'log-3', time: '09:30', text: 'NutrIA confirmou consulta de Bioimpedância via Telegram', type: 'bot' }
    ]
  };
}

function loadState() {
  try {
    localStorage.removeItem('nutrivvo_clarix_proto_v1');
    localStorage.removeItem('nutrivvo_vivvo_proto_v2');
    localStorage.removeItem('nutrivvo_nutria_proto_v3');
    localStorage.removeItem('nutrivvo_nutria_proto_v4');
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createInitialState();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed?.patients) || parsed.patients.length === 0) {
      return createInitialState();
    }
    return {
      ...createInitialState(),
      ...parsed,
      patients: parsed.patients,
      appointments: Array.isArray(parsed.appointments) ? parsed.appointments : INITIAL_APPOINTMENTS,
      recipes: Array.isArray(parsed.recipes) ? parsed.recipes : INITIAL_RECIPES,
      clinicSettings: { ...createInitialState().clinicSettings, ...(parsed.clinicSettings || {}) },
      syncLog: Array.isArray(parsed.syncLog) ? parsed.syncLog : createInitialState().syncLog
    };
  } catch {
    return createInitialState();
  }
}

function appendLog(prev, text, type = 'sync') {
  const entry = {
    id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    time: nowHHMM(),
    text,
    type
  };
  return [entry, ...(prev.syncLog || [])].slice(0, 14);
}

export function ClarixProvider({ children }) {
  const [state, setState] = useState(loadState);
  const [sessionTimer, setSessionTimer] = useState({ elapsedSec: 1096, running: true });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore storage quota failures in restricted browsing contexts
    }
  }, [state]);

  useEffect(() => {
    if (!sessionTimer.running) return undefined;
    const timer = window.setInterval(() => {
      setSessionTimer((prev) => (prev.running ? { ...prev, elapsedSec: prev.elapsedSec + 1 } : prev));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [sessionTimer.running]);

  const activePatient =
    state.patients.find((p) => p.id === state.activePatientId) || state.patients[0];

  const selectPatient = (patientId) => {
    setState((prev) => {
      const target = prev.patients.find((p) => p.id === patientId);
      if (!target) return prev;
      const isRisk = target.riskLevel === 'high';
      return {
        ...prev,
        activePatientId: patientId,
        botMood: isRisk ? 'alert' : 'calm',
        botSpeech: isRisk
          ? `Radar 360° em alerta para ${target.shortName}: aderência em ${target.adherence}% (${target.lastSeen}). Deseja enviar lembrete acolhedor agora?`
          : `Foco sincronizado em ${target.shortName}: ${target.adherence}% de aderência, ${target.streak} dias de streak e meta ${target.kcalTarget} kcal.`,
        botPulseCount: prev.botPulseCount + 1
      };
    });
  };

  const setBotMood = (mood, speech) => {
    setState((prev) => ({
      ...prev,
      botMood: mood,
      botSpeech: speech || prev.botSpeech,
      botPulseCount: prev.botPulseCount + 1
    }));
  };

  const addPatient = ({
    name,
    goal,
    invoiceValue,
    targetWeight,
    cpf,
    phone,
    email,
    birthDate,
    gender,
    restrictions,
    aversions,
    medications
  }) => {
    const cleanName = String(name || '').trim();
    if (!cleanName) return;
    const shortName = cleanName.split(/\s+/).slice(0, 2).join(' ');
    const numericVal = Math.max(0, Number(invoiceValue) || 480);
    const goalWeight = Number(targetWeight) || 68;
    const newId = `p-${Date.now()}`;
    const safeGender = gender === 'M' ? 'M' : 'F';
    const baseEval = {
      weight: String(goalWeight + 1.4),
      height: safeGender === 'M' ? '176' : '165',
      age: '31',
      gender: safeGender,
      activityLevel: '1.55',
      bodyFat: safeGender === 'M' ? '18.5' : '24.0',
      muscleMass: safeGender === 'M' ? '56.0' : '45.0',
      waist: safeGender === 'M' ? '82' : '74',
      hips: safeGender === 'M' ? '96' : '99'
    };
    const { tmb, get } = calculateMifflinTmbGet(baseEval);

    const newPatient = {
      id: newId,
      name: cleanName,
      shortName,
      cpf: String(cpf || '').trim() || 'Não informado',
      phone: String(phone || '').trim() || '(11) 99000-0000',
      email: String(email || '').trim() || 'paciente@nutrivvo.com.br',
      birthDate: String(birthDate || '').trim() || '1994-05-12',
      gender: safeGender,
      restrictions: String(restrictions || '').trim() || 'Nenhuma informada',
      aversions: String(aversions || '').trim() || 'Nenhuma informada',
      medications: String(medications || '').trim() || 'Sem uso contínuo',
      goal: String(goal || '').trim() || 'Reeducação Alimentar & Saúde',
      adherence: 88,
      riskLevel: 'low',
      riskScore: 15,
      riskLabel: 'Novo Paciente',
      streak: 1,
      xp: 120,
      waterMl: 500,
      waterGoal: 2500,
      steps: 4200,
      stepsGoal: 8000,
      sleepHours: '7h 30m',
      sleepQuality: '86% bom',
      kcalTarget: get ? Math.max(1450, get - 250) : 1900,
      kcalConsumed: 420,
      targetWeight: goalWeight,
      macros: { carbs: 46, carbsGoal: 190, protein: 32, proteinGoal: 150, fats: 12, fatsGoal: 58 },
      invoiceValue: numericVal,
      invoiceStatus: 'pendente',
      lastSeen: 'Agora · Cadastrado no CRM',
      anamnesis: {
        routine: 'Acorda 07h, trabalha em escritório, treino 3x/semana às 18h.',
        sleep: '7h por noite, desperta descansado(a).',
        digestion: 'Funcionamento intestinal regular (1x/dia).',
        hydration: 'Ingere ~1,5 L de água; consumo social eventual.',
        notes: 'Cadastro completo sincronizado com App do Paciente.'
      },
      physicalEval: { ...baseEval, tmb, get },
      weightHistory: [
        { month: 'Jun', weight: goalWeight + 4.4, leanMass: 45.0, fatPct: 26.2 },
        { month: 'Jul', weight: goalWeight + 3.8, leanMass: 45.3, fatPct: 25.5 },
        { month: 'Ago', weight: goalWeight + 3.1, leanMass: 45.6, fatPct: 24.8 },
        { month: 'Set', weight: goalWeight + 2.4, leanMass: 45.8, fatPct: 24.1 },
        { month: 'Out', weight: goalWeight + 1.8, leanMass: 46.1, fatPct: 23.4 },
        { month: 'Nov', weight: goalWeight + 1.4, leanMass: 46.4, fatPct: 22.9 }
      ],
      meals: MEAL_PLAN_PRESETS[0].meals.map((m, idx) => ({
        ...m,
        id: `${newId}-m-${idx}`,
        checked: idx === 0
      })),
      workouts: [
        { id: `${newId}-w-1`, title: 'Treino Base · Força + Core', detail: '45 min', done: false }
      ],
      labExams: [
        { name: 'Triagem Inicial NutrIA', value: 'Aguardando PDF', status: 'Novo', note: 'Pronto para leitura de exame PDF' }
      ],
      chatHistory: [
        { id: `${newId}-c-1`, sender: 'bot', time: nowHHMM(), text: `Olá ${shortName}! Seu aplicativo e plano Nutrivvo + NutrIA já estão sincronizados com o consultório.` }
      ]
    };

    setState((prev) => ({
      ...prev,
      patients: [newPatient, ...prev.patients],
      activePatientId: newId,
      botMood: 'celebrating',
      botSpeech: `${shortName} cadastrado(a)! Cardápio inicial e acompanhamento da NutrIA já foram ativados no App do Paciente.`,
      botPulseCount: prev.botPulseCount + 1,
      syncLog: appendLog(prev, `Novo paciente no CRM: ${shortName} (${formatBRL(numericVal)})`, 'crm')
    }));
    toast.success(`${shortName} adicionado ao CRM e sincronizado com o App!`);
  };

  const sendTelegramNudge = (patientId, customMsg) => {
    const target = state.patients.find((p) => p.id === patientId) || activePatient;
    if (!target) return;
    const messageText =
      customMsg ||
      `Oi ${target.shortName}! Aqui é a NutrIA passando para lembrar do seu check-in visual no Nutrivvo e completar os ${Math.max(250, target.waterGoal - target.waterMl)} ml de água de hoje.`;

    setState((prev) => ({
      ...prev,
      patients: prev.patients.map((p) =>
        p.id === target.id
          ? {
              ...p,
              lastSeen: 'Agora · NutrIA acionada',
              chatHistory: [
                ...p.chatHistory,
                { id: `bot-${Date.now()}`, sender: 'bot', time: nowHHMM(), text: messageText }
              ]
            }
          : p
      ),
      botMood: 'celebrating',
      botSpeech: `Mensagem disparada pela NutrIA para ${target.shortName}! Visível em tempo real no App do Paciente.`,
      botPulseCount: prev.botPulseCount + 1,
      syncLog: appendLog(prev, `NutrIA enviou lembrete para ${target.shortName}`, 'bot')
    }));
    toast.success(`NutrIA enviou mensagem para ${target.shortName}!`);
  };

  const sendBotMessage = (patientId, text, role = 'patient') => {
    const clean = String(text || '').trim();
    if (!clean) return;
    const target = state.patients.find((p) => p.id === patientId) || activePatient;
    if (!target) return;

    const userMsgId = `u-${Date.now()}`;
    setState((prev) => ({
      ...prev,
      botMood: 'thinking',
      botSpeech: 'NutrIA analisando contexto clínico, histórico TACO e aderência em tempo real...',
      patients: prev.patients.map((p) =>
        p.id === target.id
          ? {
              ...p,
              chatHistory: [
                ...p.chatHistory,
                { id: userMsgId, sender: 'user', time: nowHHMM(), text: clean }
              ]
            }
          : p
      )
    }));

    window.setTimeout(() => {
      const outcome = generateClarixBotReply(clean, target, role);
      setState((prev) => ({
        ...prev,
        botMood: outcome.mood,
        botSpeech: outcome.reply,
        botPulseCount: prev.botPulseCount + 1,
        patients: prev.patients.map((p) =>
          p.id === target.id
            ? {
                ...p,
                lastSeen: 'Agora · Chat NutrIA',
                chatHistory: [
                  ...p.chatHistory,
                  { id: `b-${Date.now()}`, sender: 'bot', time: nowHHMM(), text: outcome.reply }
                ]
              }
            : p
        ),
        syncLog: appendLog(prev, `${target.shortName}: conversa com a NutrIA (${outcome.summaryTag})`, 'bot')
      }));
    }, 320);
  };

  const publishMealPreset = (patientId, presetId) => {
    const preset = MEAL_PLAN_PRESETS.find((pr) => pr.id === presetId);
    const target = state.patients.find((p) => p.id === patientId) || activePatient;
    if (!preset || !target) return;

    const checkedMeals = preset.meals.filter((m) => m.checked);
    const consumed = checkedMeals.reduce((acc, m) => acc + (m.kcal || 0), 0);
    const consumedMacros = {
      ...preset.macros,
      carbs: checkedMeals.reduce((acc, m) => acc + (m.carbs || 0), 0),
      protein: checkedMeals.reduce((acc, m) => acc + (m.protein || 0), 0),
      fats: checkedMeals.reduce((acc, m) => acc + (m.fats || 0), 0)
    };

    setState((prev) => ({
      ...prev,
      botMood: 'celebrating',
      botSpeech: `Plano "${preset.label}" publicado para ${target.shortName}! O App do Paciente já exibe as refeições e macros atualizados.`,
      botPulseCount: prev.botPulseCount + 1,
      patients: prev.patients.map((p) =>
        p.id === target.id
          ? {
              ...p,
              kcalTarget: preset.kcalTarget,
              kcalConsumed: consumed,
              macros: consumedMacros,
              meals: preset.meals.map((m, idx) => ({ ...m, id: `${target.id}-pr-${idx}-${Date.now()}` })),
              chatHistory: [
                ...p.chatHistory,
                { id: `plan-${Date.now()}`, sender: 'bot', time: nowHHMM(), text: `Seu novo cardápio (${preset.label}) acabou de chegar do consultório!` }
              ]
            }
          : p
      ),
      syncLog: appendLog(prev, `Cardápio ${preset.label} publicado para ${target.shortName}`, 'crm')
    }));
    toast.success(`Cardápio "${preset.label}" sincronizado com ${target.shortName}!`);
  };

  const addCustomMeal = (patientId, { slot, name, prep }) => {
    const cleanName = String(name || '').trim();
    if (!cleanName) return;
    const target = state.patients.find((p) => p.id === patientId) || activePatient;
    if (!target) return;

    const meal = {
      id: `cm-${Date.now()}`,
      slot: String(slot || '').trim() || '16:00 · Lanche Extra',
      name: cleanName,
      kcal: 340,
      protein: 26,
      carbs: 34,
      fats: 10,
      prep: String(prep || '').trim() || 'Preparo rápido calibrado via TACO no CRM.',
      checked: false
    };

    setState((prev) => ({
      ...prev,
      botMood: 'celebrating',
      botSpeech: `Refeição "${cleanName}" adicionada ao app de ${target.shortName}.`,
      botPulseCount: prev.botPulseCount + 1,
      patients: prev.patients.map((p) =>
        p.id === target.id ? { ...p, meals: [...p.meals, meal] } : p
      ),
      syncLog: appendLog(prev, `Refeição "${cleanName}" enviada para ${target.shortName}`, 'crm')
    }));
    toast.success('Refeição adicionada ao App do Paciente!');
  };

  const runLabExamScan = (patientId, { filename } = {}) => {
    const target = state.patients.find((p) => p.id === patientId) || activePatient;
    if (!target) return;
    const cleanFile = String(filename || '').trim();

    setState((prev) => ({
      ...prev,
      botMood: 'scanning',
      botSpeech: cleanFile
        ? `NutrIA lendo arquivo "${cleanFile}" de ${target.shortName} com OCR + IA Clínica...`
        : `NutrIA lendo biomarcadores laboratoriais de ${target.shortName} com IA Clínica...`,
      botPulseCount: prev.botPulseCount + 1
    }));

    window.setTimeout(() => {
      const updatedExams = [
        ...(cleanFile
          ? [
              {
                name: `Laudo ${cleanFile}`,
                value: 'Analisado IA',
                status: 'Novo PDF',
                note: 'Biomarcadores extraídos automaticamente e prontos para parecer.',
                parecer: ''
              }
            ]
          : []),
        { name: 'Vitamina D (25-OH) · IA PDF', value: '48 ng/mL', status: 'Ideal', note: 'Meta atingida com suplementação atual', parecer: 'Manter 2.000 UI/dia após almoço.' },
        { name: 'Ferritina Sérica · IA PDF', value: '74 ng/mL', status: 'Ótimo', note: 'Alta reserva de ferro para treino', parecer: 'Reserva adequada para treinos de força.' },
        { name: 'Glicemia em Jejum · IA PDF', value: '86 mg/dL', status: 'Excelente', note: 'Curva estável pós-protocolo', parecer: '' }
      ];
      setState((prev) => ({
        ...prev,
        botMood: 'celebrating',
        botSpeech: `Leitura ${cleanFile ? `de "${cleanFile}"` : 'PDF'} concluída para ${target.shortName}! Biomarcadores atualizados.`,
        botPulseCount: prev.botPulseCount + 1,
        patients: prev.patients.map((p) =>
          p.id === target.id
            ? {
                ...p,
                labExams: updatedExams,
                adherence: Math.min(100, p.adherence + 2)
              }
            : p
        ),
        syncLog: appendLog(
          prev,
          `NutrIA analisou ${cleanFile ? `exame "${cleanFile}"` : 'novo exame PDF'} de ${target.shortName}`,
          'crm'
        )
      }));
      toast.success(`Exame ${cleanFile ? `"${cleanFile}" ` : 'PDF '}analisado pela NutrIA!`);
    }, 900);
  };

  const updateExamParecer = (patientId, examName, parecerText) => {
    const target = state.patients.find((p) => p.id === patientId) || activePatient;
    if (!target) return;
    setState((prev) => ({
      ...prev,
      patients: prev.patients.map((p) =>
        p.id === target.id
          ? {
              ...p,
              labExams: (p.labExams || []).map((ex) =>
                ex.name === examName ? { ...ex, parecer: parecerText } : ex
              )
            }
          : p
      ),
      syncLog: appendLog(prev, `Parecer clínico salvo em "${examName}" para ${target.shortName}`, 'crm')
    }));
    toast.success('Parecer clínico salvo e visível no App do Paciente!');
  };

  const addWorkoutItem = (patientId, { title, detail }) => {
    const cleanTitle = String(title || '').trim();
    if (!cleanTitle) return;
    const target = state.patients.find((p) => p.id === patientId) || activePatient;
    if (!target) return;
    const item = {
      id: `wk-${Date.now()}`,
      title: cleanTitle,
      detail: String(detail || '').trim() || '45 min · Prescrição do consultório',
      done: false
    };
    setState((prev) => ({
      ...prev,
      botMood: 'celebrating',
      botSpeech: `Treino "${cleanTitle}" publicado para ${target.shortName}!`,
      patients: prev.patients.map((p) =>
        p.id === target.id ? { ...p, workouts: [...(p.workouts || []), item] } : p
      ),
      syncLog: appendLog(prev, `Treino "${cleanTitle}" enviado para ${target.shortName}`, 'crm')
    }));
    toast.success('Treino publicado no App do Paciente!');
  };

  const addRecipeToLibrary = ({ title, category, kcal, prep, sendToPatient }) => {
    const cleanTitle = String(title || '').trim();
    if (!cleanTitle) return;
    const rec = {
      id: `rec-${Date.now()}`,
      title: cleanTitle,
      category: String(category || '').trim() || 'Receita Funcional',
      kcal: Math.max(80, Number(kcal) || 350),
      prep: String(prep || '').trim() || 'Preparo rápido indicado pela nutricionista.'
    };
    setState((prev) => ({
      ...prev,
      recipes: [rec, ...(prev.recipes || [])],
      botMood: 'celebrating',
      botSpeech: sendToPatient
        ? `Receita "${cleanTitle}" salva na biblioteca e enviada para ${activePatient?.shortName}!`
        : `Receita "${cleanTitle}" adicionada à Biblioteca da Clínica.`,
      syncLog: appendLog(prev, `Receita "${cleanTitle}" adicionada à Biblioteca`, 'crm')
    }));
    toast.success('Receita adicionada à Biblioteca da Clínica!');
  };

  const updateClinicSettings = (partial) => {
    setState((prev) => ({
      ...prev,
      clinicSettings: { ...(prev.clinicSettings || {}), ...(partial || {}) },
      syncLog: appendLog(prev, 'Configurações da clínica atualizadas', 'crm')
    }));
    toast.success('Configurações da clínica salvas!');
  };

  const addWater = (patientId, ml = 250) => {
    const target = state.patients.find((p) => p.id === patientId) || activePatient;
    if (!target) return;

    setState((prev) => {
      const nextWater = Math.min(4000, target.waterMl + ml);
      return {
        ...prev,
        botMood: 'celebrating',
        botSpeech: `Boa, ${target.shortName}! +${ml} ml registrados (${nextWater} / ${target.waterGoal} ml). +10 XP adicionados no painel!`,
        botPulseCount: prev.botPulseCount + 1,
        patients: prev.patients.map((p) =>
          p.id === target.id
            ? {
                ...p,
                waterMl: nextWater,
                xp: p.xp + 10,
                adherence: Math.min(100, p.adherence + 1),
                lastSeen: `Agora · +${ml} ml água`
              }
            : p
        ),
        syncLog: appendLog(prev, `${target.shortName} registrou +${ml} ml de água (+10 XP)`, 'paciente')
      };
    });
    toast.success(`+${ml} ml registrados! (+10 XP sincronizados)`);
  };

  const toggleMealCheckin = (patientId, mealId) => {
    const target = state.patients.find((p) => p.id === patientId) || activePatient;
    if (!target) return;
    const mealObj = target.meals.find((m) => m.id === mealId);
    if (!mealObj) return;
    const turningOn = !mealObj.checked;

    setState((prev) => {
      const nextMeals = target.meals.map((m) => (m.id === mealId ? { ...m, checked: turningOn } : m));
      const deltaXp = turningOn ? 35 : -35;
      const deltaKcal = turningOn ? (mealObj.kcal || 420) : -(mealObj.kcal || 420);
      const deltaProtein = turningOn ? (mealObj.protein || 30) : -(mealObj.protein || 30);
      const deltaCarbs = turningOn ? (mealObj.carbs || 40) : -(mealObj.carbs || 40);
      const deltaFats = turningOn ? (mealObj.fats || 12) : -(mealObj.fats || 12);

      return {
        ...prev,
        botMood: turningOn ? 'celebrating' : 'calm',
        botSpeech: turningOn
          ? `Check-in confirmado: "${mealObj.name}". Macros atualizados e +35 XP enviados ao CRM!`
          : `Check-in desmarcado em "${mealObj.name}".`,
        botPulseCount: prev.botPulseCount + 1,
        patients: prev.patients.map((p) =>
          p.id === target.id
            ? {
                ...p,
                meals: nextMeals,
                xp: Math.max(0, p.xp + deltaXp),
                kcalConsumed: Math.max(0, p.kcalConsumed + deltaKcal),
                macros: {
                  ...p.macros,
                  protein: Math.max(0, p.macros.protein + deltaProtein),
                  carbs: Math.max(0, p.macros.carbs + deltaCarbs),
                  fats: Math.max(0, p.macros.fats + deltaFats)
                },
                adherence: Math.min(100, Math.max(15, p.adherence + (turningOn ? 3 : -3))),
                riskLevel: turningOn && p.adherence + 3 >= 70 ? 'low' : p.riskLevel,
                lastSeen: turningOn ? 'Agora · Check-in refeição' : p.lastSeen
              }
            : p
        ),
        syncLog: appendLog(
          prev,
          `${target.shortName} ${turningOn ? 'concluiu' : 'reabriu'} ${mealObj.name} (${turningOn ? '+35 XP' : '-35 XP'})`,
          'paciente'
        )
      };
    });
  };

  const logPhotoMealCheckin = (patientId, dish) => {
    const target = state.patients.find((p) => p.id === patientId) || activePatient;
    if (!target || !dish) return;

    setState((prev) => ({
      ...prev,
      botMood: 'celebrating',
      botSpeech: `Foto IA confirmada (${dish.label})! Estimei ~${dish.kcal || 540} kcal com ${dish.adherencePct}% de aderência ao plano (+35 XP).`,
      botPulseCount: prev.botPulseCount + 1,
      patients: prev.patients.map((p) =>
        p.id === target.id
          ? {
              ...p,
              xp: p.xp + 35,
              kcalConsumed: p.kcalConsumed + (dish.kcal || 540),
              macros: {
                ...p.macros,
                protein: p.macros.protein + (dish.protein || 38),
                carbs: p.macros.carbs + (dish.carbs || 52),
                fats: p.macros.fats + (dish.fats || 16)
              },
              adherence: Math.min(100, p.adherence + 4),
              riskLevel: p.adherence + 4 >= 72 ? 'low' : p.riskLevel,
              lastSeen: `Agora · Foto IA (${dish.label})`,
              chatHistory: [
                ...p.chatHistory,
                {
                  id: `photo-${Date.now()}`,
                  sender: 'bot',
                  time: nowHHMM(),
                  text: `Visão IA: "${dish.label}" registrado com ${dish.adherencePct}% de aderência (${dish.kcal || 540} kcal, ${dish.protein || 38}g proteína). +35 XP!`
                }
              ]
            }
          : p
      ),
      syncLog: appendLog(prev, `Foto IA "${dish.label}" registrada por ${target.shortName} (+35 XP)`, 'paciente')
    }));
    toast.success(`Prato "${dish.label}" contabilizado no diário e no CRM! (+35 XP)`);
  };

  const toggleWorkoutExercise = (patientId, exId) => {
    const target = state.patients.find((p) => p.id === patientId) || activePatient;
    if (!target) return;
    const item = target.workouts.find((w) => w.id === exId);
    const turningOn = item ? !item.done : true;

    setState((prev) => ({
      ...prev,
      botMood: turningOn ? 'celebrating' : 'calm',
      botSpeech: turningOn ? `Treino concluído por ${target.shortName}! (+20 XP)` : prev.botSpeech,
      patients: prev.patients.map((p) =>
        p.id === target.id
          ? {
              ...p,
              xp: Math.max(0, p.xp + (turningOn ? 20 : -20)),
              steps: turningOn ? p.steps + 1400 : Math.max(0, p.steps - 1400),
              workouts: p.workouts.map((w) => (w.id === exId ? { ...w, done: turningOn } : w))
            }
          : p
      ),
      syncLog: appendLog(prev, `${target.shortName} ${turningOn ? 'concluiu' : 'reabriu'} treino (${turningOn ? '+20 XP' : '-20 XP'})`, 'paciente')
    }));
  };

  const updateSleep = (patientId, hours, quality) => {
    const target = state.patients.find((p) => p.id === patientId) || activePatient;
    if (!target) return;
    setState((prev) => ({
      ...prev,
      botMood: 'calm',
      botSpeech: `Recuperação noturna de ${target.shortName} atualizada para ${hours} (${quality}).`,
      patients: prev.patients.map((p) =>
        p.id === target.id ? { ...p, sleepHours: hours, sleepQuality: quality } : p
      ),
      syncLog: appendLog(prev, `Sono atualizado (${hours}) para ${target.shortName}`, 'paciente')
    }));
  };

  const toggleAppointmentStatus = (apptId) => {
    setState((prev) => {
      const nextAppts = prev.appointments.map((a) => {
        if (a.id !== apptId) return a;
        const nextStatus =
          a.status === 'pendente' ? 'confirmado' : a.status === 'confirmado' ? 'proximo' : 'pendente';
        return { ...a, status: nextStatus };
      });
      return {
        ...prev,
        appointments: nextAppts,
        botMood: 'calm',
        botSpeech: 'Status da agenda atualizado e sincronizado com lembretes automáticos da NutrIA.',
        syncLog: appendLog(prev, 'Status de consulta alternado na Agenda do CRM', 'crm')
      };
    });
  };

  const addAppointment = ({ day, time, patientId, type, locationType, meetingLink }) => {
    const pat = state.patients.find((p) => p.id === patientId) || activePatient;
    if (!pat) return;
    const loc = locationType === 'online' ? 'online' : 'local';
    const appt = {
      id: `ap-${Date.now()}`,
      day: day || 'Sex 21',
      time: time || '15:00',
      patientId: pat.id,
      patientName: pat.shortName,
      type: String(type || '').trim() || 'Retorno Clínico Nutrivvo',
      locationType: loc,
      meetingLink: loc === 'online' ? String(meetingLink || '').trim() || `https://meet.jit.si/nutrivvo-${pat.id}` : '',
      status: 'confirmado'
    };
    setState((prev) => ({
      ...prev,
      appointments: [appt, ...prev.appointments],
      botMood: 'celebrating',
      botSpeech: `Consulta ${loc === 'online' ? 'online' : 'presencial'} marcada com ${pat.shortName} (${appt.day} às ${appt.time}). Lembrete automático agendado.`,
      syncLog: appendLog(prev, `Nova consulta (${loc === 'online' ? 'Online' : 'Presencial'}): ${pat.shortName} · ${appt.day} ${appt.time}`, 'crm')
    }));
    toast.success(`Consulta de ${pat.shortName} adicionada à agenda!`);
  };

  const saveConsultationRecord = (patientId, { anamnesis, physicalEval }) => {
    const target = state.patients.find((p) => p.id === patientId) || activePatient;
    if (!target) return;
    const calc = calculateMifflinTmbGet(physicalEval || {});
    const nextEval = { ...(target.physicalEval || {}), ...(physicalEval || {}), ...calc };
    const nextWeight = Number(nextEval.weight);
    const nextFat = Number(nextEval.bodyFat);
    const nextLean = Number(nextEval.muscleMass);
    const nextKcalTarget = calc.get > 0 ? Math.max(1350, calc.get - 250) : target.kcalTarget;

    setState((prev) => ({
      ...prev,
      botMood: 'celebrating',
      botSpeech: `Prontuário de ${target.shortName} salvo! TMB ${calc.tmb} kcal · GET ${calc.get} kcal · Meta calibrada para ${nextKcalTarget} kcal.`,
      botPulseCount: prev.botPulseCount + 1,
      patients: prev.patients.map((p) => {
        if (p.id !== target.id) return p;
        const hist = Array.isArray(p.weightHistory) ? [...p.weightHistory] : [];
        if (hist.length > 0 && nextWeight > 0) {
          hist[hist.length - 1] = {
            ...hist[hist.length - 1],
            weight: nextWeight,
            leanMass: nextLean > 0 ? nextLean : hist[hist.length - 1].leanMass,
            fatPct: nextFat > 0 ? nextFat : hist[hist.length - 1].fatPct
          };
        }
        return {
          ...p,
          kcalTarget: nextKcalTarget,
          anamnesis: { ...(p.anamnesis || {}), ...(anamnesis || {}) },
          physicalEval: nextEval,
          weightHistory: hist,
          lastSeen: 'Agora · Prontuário atualizado'
        };
      }),
      syncLog: appendLog(prev, `Consulta & TMB/GET salvos para ${target.shortName} (${calc.get} kcal)`, 'crm')
    }));
    toast.success(`Anamnese e Avaliação Física de ${target.shortName} salvas!`);
  };

  const toggleInvoiceStatus = (patientId) => {
    const target = state.patients.find((p) => p.id === patientId);
    if (!target) return;
    const nextStatus = target.invoiceStatus === 'pago' ? 'pendente' : 'pago';

    setState((prev) => ({
      ...prev,
      botMood: nextStatus === 'pago' ? 'celebrating' : 'alert',
      botSpeech:
        nextStatus === 'pago'
          ? `Parcela de ${target.shortName} (${formatBRL(target.invoiceValue)}) confirmada como paga!`
          : `Parcela de ${target.shortName} marcada em aberto.`,
      patients: prev.patients.map((p) =>
        p.id === patientId ? { ...p, invoiceStatus: nextStatus } : p
      ),
      syncLog: appendLog(prev, `Fatura de ${target.shortName} marcada como ${nextStatus}`, 'crm')
    }));
    toast.success(`Fatura marcada como ${nextStatus}!`);
  };

  const toggleSessionTimer = () => {
    setSessionTimer((prev) => ({ ...prev, running: !prev.running }));
  };

  const resetSessionTimer = () => {
    setSessionTimer({ elapsedSec: 0, running: true });
  };

  const setSelectedDayIdx = (idx) => {
    setState((prev) => ({ ...prev, selectedDayIdx: idx }));
  };

  const resetDemo = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    setState(createInitialState());
    setSessionTimer({ elapsedSec: 1096, running: true });
    toast.success('Protótipo Nutrivvo + NutrIA restaurado para o estado inicial!');
  };

  return (
    <ClarixContext.Provider
      value={{
        patients: state.patients,
        activePatient,
        activePatientId: activePatient?.id,
        appointments: state.appointments,
        recipes: state.recipes,
        clinicSettings: state.clinicSettings,
        syncLog: state.syncLog,
        botMood: state.botMood,
        botSpeech: state.botSpeech,
        botPulseCount: state.botPulseCount,
        sessionTimer,
        selectedDayIdx: state.selectedDayIdx,
        selectPatient,
        setBotMood,
        addPatient,
        sendTelegramNudge,
        sendBotMessage,
        publishMealPreset,
        addCustomMeal,
        runLabExamScan,
        updateExamParecer,
        addWorkoutItem,
        addRecipeToLibrary,
        updateClinicSettings,
        addWater,
        toggleMealCheckin,
        logPhotoMealCheckin,
        toggleWorkoutExercise,
        updateSleep,
        toggleAppointmentStatus,
        addAppointment,
        saveConsultationRecord,
        toggleInvoiceStatus,
        toggleSessionTimer,
        resetSessionTimer,
        setSelectedDayIdx,
        resetDemo
      }}
    >
      {children}
    </ClarixContext.Provider>
  );
}

export function useClarix() {
  const ctx = useContext(ClarixContext);
  if (!ctx) throw new Error('useClarix must be used inside ClarixProvider');
  return ctx;
}
