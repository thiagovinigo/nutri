import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import {
  INITIAL_APPOINTMENTS,
  INITIAL_PATIENTS,
  MEAL_PLAN_PRESETS,
  formatBRL,
  generateNutriBotReply
} from './noemaData';

const STORAGE_KEY = 'nutrivvo_noema_proto_v1';
const NoemaContext = createContext(null);

function nowClock() {
  const d = new Date();
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function defaultState() {
  return {
    patients: INITIAL_PATIENTS,
    activePatientId: 'p1',
    appointments: INITIAL_APPOINTMENTS,
    billingCycle: 'anual',
    syncLog: [
      { id: 'l1', ts: '12:18', msg: 'Marina registrou Café da Manhã (+35 XP) e 1.750 ml de água' },
      { id: 'l2', ts: '09:40', msg: 'Radar 360° identificou Camila Silva com Risco Alto (82%)' }
    ]
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed?.patients) || parsed.patients.length === 0) return defaultState();
    return parsed;
  } catch {
    return defaultState();
  }
}

export function NoemaProvider({ children }) {
  const [state, setState] = useState(loadState);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignora quota cheia em navegação privada
    }
  }, [state]);

  const activePatient = useMemo(
    () => state.patients.find((p) => p.id === state.activePatientId) || state.patients[0],
    [state.patients, state.activePatientId]
  );

  const pushLog = (prev, msg) => [{ id: `l_${Date.now()}_${Math.random()}`, ts: nowClock(), msg }, ...prev.syncLog].slice(0, 10);

  const setActivePatientId = (id) => {
    setState((prev) => ({ ...prev, activePatientId: id }));
  };

  const setBillingCycle = (cycle) => {
    setState((prev) => ({ ...prev, billingCycle: cycle }));
  };

  const addPatient = ({ name, goal, planValue }) => {
    const cleanName = String(name || '').trim();
    if (!cleanName) return;
    const numericVal = Math.max(250, Number(planValue) || 1200);
    const shortName = cleanName.split(' ').slice(0, 2).join(' ');
    const newId = `p_${Date.now()}`;
    const preset = MEAL_PLAN_PRESETS[0];

    const newPatient = {
      id: newId,
      name: cleanName,
      shortName,
      goal: String(goal || '').trim() || 'Reeducação alimentar & energia',
      streak: 1,
      xp: 100,
      adherence: 85,
      riskScore: 15,
      riskLabel: 'Novo Paciente (85%)',
      status: 'ativo',
      lastSeen: 'Agora · Onboarding',
      waterMl: 500,
      waterGoal: 2500,
      sleepHours: '7h 30m',
      sleepQuality: 'Bom',
      invoicePlanName: 'Plano Personalizado',
      planValueNum: numericVal,
      planDue: '30/11',
      invoiceStatus: 'pago',
      planTitle: preset.planTitle,
      planKcal: preset.planKcal,
      planMacros: preset.planMacros,
      examSummary: 'Paciente recém-cadastrado. Aguardando primeiro PDF de exames laboratoriais.',
      biomarkers: { visits: ['Nov'], leanMass: [43.0], bodyFat: [26.0] },
      labs: [
        { marker: 'Glicemia em jejum', prev: '—', curr: '90 mg/dL', delta: 'Baseline', tone: 'ok' },
        { marker: 'Ferritina sérica', prev: '—', curr: '48 ng/mL', delta: 'Baseline', tone: 'ok' },
        { marker: 'Vitamina D (25-OH)', prev: '—', curr: '35 ng/mL', delta: 'Baseline', tone: 'ok' },
        { marker: 'Insulina basal', prev: '—', curr: '8,4 µU/mL', delta: 'Baseline', tone: 'ok' }
      ],
      meals: preset.meals.map((m) => ({ ...m })),
      workouts: [{ id: 'w1', name: 'Circuito metabólico inicial', sets: '3x12', done: false }],
      chat: [{ id: `c_${Date.now()}`, from: 'bot', ts: nowClock(), text: `Olá ${shortName.split(' ')[0]}! Sua conta Nutrivvo foi ativada pela nutricionista.` }]
    };

    setState((prev) => ({
      ...prev,
      patients: [newPatient, ...prev.patients],
      activePatientId: newId,
      syncLog: pushLog(prev, `Novo paciente cadastrado no CRM: ${shortName} (${formatBRL(numericVal)})`)
    }));
    toast.success(`${shortName} adicionado(a) e sincronizado com o App do Paciente!`);
  };

  const sendTelegramMessage = (patientId, text) => {
    const cleanText = String(text || '').trim();
    if (!cleanText) return;
    setState((prev) => {
      const target = prev.patients.find((p) => p.id === patientId);
      const nextPatients = prev.patients.map((p) => {
        if (p.id !== patientId) return p;
        return {
          ...p,
          chat: [...p.chat, { id: `tg_${Date.now()}`, from: 'bot', ts: nowClock(), text: cleanText }]
        };
      });
      return {
        ...prev,
        patients: nextPatients,
        syncLog: pushLog(prev, `Telegram NutriBot enviado para ${target?.shortName || 'paciente'}`)
      };
    });
    toast.success('Mensagem enviada pelo Telegram NutriBot e visível no App do Paciente!');
  };

  const sendPatientChatMessage = (patientId, text) => {
    const clean = String(text || '').trim();
    if (!clean) return;
    setState((prev) => {
      const target = prev.patients.find((p) => p.id === patientId);
      const reply = generateNutriBotReply(clean, target);
      const ts = nowClock();
      const nextPatients = prev.patients.map((p) => {
        if (p.id !== patientId) return p;
        return {
          ...p,
          lastSeen: 'Agora · Chat IA',
          chat: [
            ...p.chat,
            { id: `u_${Date.now()}`, from: 'user', ts, text: clean },
            { id: `b_${Date.now() + 1}`, from: 'bot', ts, text: reply }
          ]
        };
      });
      return {
        ...prev,
        patients: nextPatients,
        syncLog: pushLog(prev, `${target?.shortName || 'Paciente'} conversou com NutriBot IA`)
      };
    });
  };

  const publishMealPlan = (patientId, presetOrCustom) => {
    setState((prev) => {
      const target = prev.patients.find((p) => p.id === patientId);
      const nextPatients = prev.patients.map((p) => {
        if (p.id !== patientId) return p;
        return {
          ...p,
          planTitle: presetOrCustom.planTitle,
          planKcal: presetOrCustom.planKcal,
          planMacros: presetOrCustom.planMacros,
          meals: presetOrCustom.meals.map((m, i) => ({ ...m, id: `pub_${Date.now()}_${i}`, checked: false }))
        };
      });
      return {
        ...prev,
        patients: nextPatients,
        syncLog: pushLog(prev, `Novo cardápio (${presetOrCustom.planKcal} kcal) publicado para ${target?.shortName}`)
      };
    });
    toast.success('Plano publicado no CRM e atualizado ao vivo no App do Paciente!');
  };

  const addMealToPlan = (patientId, { slot, name, kcal, prep }) => {
    if (!name?.trim()) return;
    setState((prev) => ({
      ...prev,
      patients: prev.patients.map((p) => {
        if (p.id !== patientId) return p;
        const added = {
          id: `custom_${Date.now()}`,
          slot: slot || '16:00 · Lanche da Tarde',
          name: name.trim(),
          kcal: Number(kcal) || 320,
          checked: false,
          items: ['Porção personalizada no montador NØEMA IA'],
          prep: prep?.trim() || 'Preparo orientado pela nutricionista em consulta.'
        };
        return { ...p, meals: [...p.meals, added] };
      }),
      syncLog: pushLog(prev, `Refeição "${name.trim()}" adicionada ao plano ativo`)
    }));
    toast.success('Refeição adicionada e sincronizada com o App!');
  };

  const simulateExamAnalysis = (patientId, fileName) => {
    setState((prev) => {
      const target = prev.patients.find((p) => p.id === patientId);
      const nextPatients = prev.patients.map((p) => {
        if (p.id !== patientId) return p;
        const lastLean = p.biomarkers.leanMass[p.biomarkers.leanMass.length - 1];
        const lastFat = p.biomarkers.bodyFat[p.biomarkers.bodyFat.length - 1];
        return {
          ...p,
          examSummary: `IA analisou "${fileName || 'exame_laboratorial_recente.pdf'}": melhora na eficiência glicêmica e reserva de ferro estável. Conduta sugerida: manter aporte proteico atual e monitorar hidratação.`,
          biomarkers: {
            visits: [...p.biomarkers.visits.slice(-3), 'Atual'],
            leanMass: [...p.biomarkers.leanMass.slice(-3), Number((lastLean + 0.5).toFixed(1))],
            bodyFat: [...p.biomarkers.bodyFat.slice(-3), Number(Math.max(12, lastFat - 0.6).toFixed(1))]
          }
        };
      });
      return {
        ...prev,
        patients: nextPatients,
        syncLog: pushLog(prev, `Exame IA analisado no prontuário de ${target?.shortName}`)
      };
    });
    toast.success('Análise clínica IA concluída e curva biométrica atualizada!');
  };

  const addAppointment = ({ day, time, patientName, type }) => {
    if (!patientName?.trim()) return;
    setState((prev) => ({
      ...prev,
      appointments: [
        ...prev.appointments,
        {
          id: `a_${Date.now()}`,
          day: day || 'Qui 21',
          time: time || '11:00',
          patientName: patientName.trim(),
          type: type || 'Retorno',
          confirmed: true
        }
      ],
      syncLog: pushLog(prev, `Consulta agendada: ${patientName.trim()} (${day} ${time})`)
    }));
    toast.success('Horário adicionado à agenda e confirmação enviada via Bot!');
  };

  const toggleAppointmentConfirm = (apptId) => {
    setState((prev) => ({
      ...prev,
      appointments: prev.appointments.map((a) => (a.id === apptId ? { ...a, confirmed: !a.confirmed } : a))
    }));
  };

  const toggleInvoicePaid = (patientId) => {
    setState((prev) => {
      const target = prev.patients.find((p) => p.id === patientId);
      const nextPatients = prev.patients.map((p) => {
        if (p.id !== patientId) return p;
        const nextStatus = p.invoiceStatus === 'pago' ? 'vencendo' : 'pago';
        return { ...p, invoiceStatus: nextStatus };
      });
      const becamePaid = target?.invoiceStatus !== 'pago';
      return {
        ...prev,
        patients: nextPatients,
        syncLog: pushLog(prev, `Parcela de ${target?.shortName} marcada como ${becamePaid ? 'Paga' : 'Pendente'}`)
      };
    });
  };

  const addWater = (patientId, ml = 250) => {
    setState((prev) => {
      const target = prev.patients.find((p) => p.id === patientId);
      return {
        ...prev,
        patients: prev.patients.map((p) => {
          if (p.id !== patientId) return p;
          return {
            ...p,
            waterMl: Math.min(p.waterGoal + 1250, p.waterMl + ml),
            xp: p.xp + 10,
            lastSeen: 'Agora · +250 ml água'
          };
        }),
        syncLog: pushLog(prev, `${target?.shortName} registrou +${ml} ml de água (+10 XP)`)
      };
    });
  };

  const updateSleep = (patientId, sleepHours, sleepQuality) => {
    setState((prev) => ({
      ...prev,
      patients: prev.patients.map((p) => (p.id === patientId ? { ...p, sleepHours, sleepQuality } : p)),
      syncLog: pushLog(prev, `Sono atualizado no diário: ${sleepHours} (${sleepQuality})`)
    }));
  };

  const toggleMealCheckin = (patientId, mealId) => {
    setState((prev) => {
      const target = prev.patients.find((p) => p.id === patientId);
      let checkedNow = false;
      const nextPatients = prev.patients.map((p) => {
        if (p.id !== patientId) return p;
        const nextMeals = p.meals.map((m) => {
          if (m.id !== mealId) return m;
          checkedNow = !m.checked;
          return { ...m, checked: checkedNow };
        });
        const deltaXp = checkedNow ? 35 : -35;
        const nextAdherence = Math.min(100, Math.max(15, p.adherence + (checkedNow ? 3 : -3)));
        return {
          ...p,
          meals: nextMeals,
          xp: Math.max(0, p.xp + deltaXp),
          adherence: nextAdherence,
          lastSeen: 'Agora · Check-in refeição'
        };
      });
      return {
        ...prev,
        patients: nextPatients,
        syncLog: pushLog(prev, `${target?.shortName} ${checkedNow ? 'concluiu refeição (+35 XP)' : 'desmarcou refeição'}`)
      };
    });
  };

  const logPhotoMealCheckin = (patientId, dish) => {
    setState((prev) => {
      const target = prev.patients.find((p) => p.id === patientId);
      return {
        ...prev,
        patients: prev.patients.map((p) => {
          if (p.id !== patientId) return p;
          return {
            ...p,
            xp: p.xp + 35,
            adherence: Math.min(100, p.adherence + 2),
            lastSeen: `Agora · Foto IA (${dish.label})`
          };
        }),
        syncLog: pushLog(prev, `Foto IA "${dish.label}" registrada por ${target?.shortName} (+35 XP)`)
      };
    });
    toast.success(`"${dish.label}" registrado no diário (+35 XP sincronizados no CRM)!`);
  };

  const toggleWorkoutExercise = (patientId, exerciseId) => {
    setState((prev) => ({
      ...prev,
      patients: prev.patients.map((p) => {
        if (p.id !== patientId) return p;
        let doneNow = false;
        const nextW = p.workouts.map((w) => {
          if (w.id !== exerciseId) return w;
          doneNow = !w.done;
          return { ...w, done: doneNow };
        });
        return { ...p, workouts: nextW, xp: Math.max(0, p.xp + (doneNow ? 20 : -20)) };
      })
    }));
  };

  const resetDemo = () => {
    const fresh = defaultState();
    setState(fresh);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    toast.success('Protótipo restaurado para os dados iniciais!');
  };

  const value = {
    patients: state.patients,
    activePatient,
    activePatientId: activePatient.id,
    appointments: state.appointments,
    billingCycle: state.billingCycle,
    syncLog: state.syncLog,
    setActivePatientId,
    setBillingCycle,
    addPatient,
    sendTelegramMessage,
    sendPatientChatMessage,
    publishMealPlan,
    addMealToPlan,
    simulateExamAnalysis,
    addAppointment,
    toggleAppointmentConfirm,
    toggleInvoicePaid,
    addWater,
    updateSleep,
    toggleMealCheckin,
    logPhotoMealCheckin,
    toggleWorkoutExercise,
    resetDemo
  };

  return <NoemaContext.Provider value={value}>{children}</NoemaContext.Provider>;
}

export function useNoema() {
  const ctx = useContext(NoemaContext);
  if (!ctx) throw new Error('useNoema deve ser usado dentro de NoemaProvider');
  return ctx;
}
