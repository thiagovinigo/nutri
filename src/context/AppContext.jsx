import React, { createContext, useState, useContext, useEffect } from 'react';
import { auth, db } from '../services/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);

  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [dietTemplates, setDietTemplates] = useState([]);
  const [recipeLibrary, setRecipeLibrary] = useState([]);
  const [activePatientId, setActivePatientId] = useState(null);

  const [clinicConfig, setClinicConfig] = useState({
    name: 'Vytal',
    primaryColor: '#3949AB',
    scheduleConfig: {
      workingDays: [1, 2, 3, 4, 5], // Seg a Sex
      startHour: 9, // 09:00
      endHour: 18,  // 18:00
      lunchStart: '12:00',
      lunchEnd: '13:00',
      slotInterval: 30,
      blockedDates: [] // ex: ['2026-07-20']
    }
  });

  const updateClinicConfig = async (newConfig) => {
    const updatedConfig = { ...clinicConfig, ...newConfig };
    setClinicConfig(updatedConfig);
    if (!isFirebaseConfigured || !profile) return;
    try {
      await updateDoc(doc(db, 'users', profile.id), { clinicConfig: updatedConfig });
    } catch(e) {
      console.warn('Falha ao sincronizar configuração com o Firestore:', e);
    }
  };

  useEffect(() => {
    if (!auth) return;
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setSession(user);
      if (user) fetchProfile(user.uid);
      else setProfile(null);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (profile) {
      fetchPatients();
      fetchAppointments();
      fetchDietTemplates();
      fetchRecipes();
    }
  }, [profile]);

  const fetchProfile = async (userId) => {
    try {
      const docRef = doc(db, 'users', userId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setProfile({ id: docSnap.id, ...data });
        if (data.clinicConfig) {
          setClinicConfig(data.clinicConfig);
        }
      }
    } catch(e) {
      console.log('Erro ao buscar perfil:', e);
    }
  };

  const fetchPatients = async () => {
    try {
      if (profile.role === 'paciente') {
        const docRef = doc(db, 'patients', profile.id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setPatients([{ id: docSnap.id, ...docSnap.data() }]);
          setActivePatientId(docSnap.id);
        }
      } else {
        const q = query(collection(db, 'patients'), where('nutricionista_id', '==', profile.id));
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        setPatients(data);
      }
    } catch(e) {
      console.error("Erro ao buscar pacientes:", e);
    }
  };

  const fetchAppointments = async () => {
    try {
      const q = query(collection(db, 'appointments'), where('nutricionista_id', '==', profile.id));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAppointments(data);
    } catch(e) {
      console.error("Erro ao buscar agenda:", e);
    }
  };

  const fetchDietTemplates = async () => {
    try {
      const q = query(collection(db, 'dietTemplates'), where('nutricionista_id', '==', profile.id));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setDietTemplates(data);
    } catch(e) {
      console.error("Erro ao buscar modelos de dieta:", e);
    }
  };

  const fetchRecipes = async () => {
    try {
      const q = query(collection(db, 'recipes'), where('nutricionista_id', '==', profile.id));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRecipeLibrary(data);
    } catch(e) {
      console.error("Erro ao buscar receitas:", e);
    }
  };

  // CRUD Pacientes — sempre atualiza o estado local; só tenta sincronizar
  // com o Firestore quando o Firebase está configurado. Se a chamada ao
  // Firestore falhar mesmo assim, o estado local já foi atualizado — nunca
  // falha em silêncio para o usuário.
  const addPatient = async (name, objective, restrictions, cpf, email) => {
    const localId = `local-${Date.now()}`;
    const newPatient = {
      name, objective, restrictions, cpf: cpf || '', email: email || '', status: 'inativo', streak: 0, xp: 0, waterGlasses: 0, records: 'Novo paciente.', recipes: [], weights: []
    };
    if (profile) newPatient.nutricionista_id = profile.id;

    // Atualiza o estado local imediatamente (otimista) — a UI nunca fica
    // esperando o Firestore. Se a sincronização for bem-sucedida depois,
    // só trocamos o ID local pelo ID real do documento.
    setPatients(prev => [...prev, { id: localId, ...newPatient }]);
    if (!isFirebaseConfigured) return localId;
    try {
      const docRef = await addDoc(collection(db, 'patients'), newPatient);
      setPatients(prev => prev.map(p => p.id === localId ? { id: docRef.id, ...newPatient } : p));
      return docRef.id;
    } catch (e) {
      console.warn('Falha ao sincronizar novo paciente com o Firestore (mantido localmente):', e);
      return localId;
    }
  };

  const updatePatient = async (id, updatedData) => {
    setPatients(prev => prev.map(p => p.id === id ? { ...p, ...updatedData } : p));
    if (!isFirebaseConfigured) return;
    try {
      await updateDoc(doc(db, 'patients', id), updatedData);
    } catch(e) {
      console.warn('Falha ao sincronizar edição de paciente com o Firestore (mantida localmente):', e);
    }
  };

  const deletePatient = async (id) => {
    setPatients(prev => prev.filter(p => p.id !== id));
    if (activePatientId === id) setActivePatientId(null);
    if (!isFirebaseConfigured) return;
    try {
      await deleteDoc(doc(db, 'patients', id));
    } catch(e) {
      console.warn('Falha ao sincronizar exclusão de paciente com o Firestore (removido localmente):', e);
    }
  };

  const addRecipe = async (patientId, title, meals, description = '', supplements = '') => {
    const p = patients.find(pat => pat.id === patientId);
    if (!p) return;
    const newRecipes = [...(p.recipes || []), { title, description, supplements, meals }];
    setPatients(prev => prev.map(pat => pat.id === patientId ? { ...pat, recipes: newRecipes } : pat));
    if (!isFirebaseConfigured) return;
    try {
      await updateDoc(doc(db, 'patients', patientId), { recipes: newRecipes });
    } catch(e) {
      console.warn('Falha ao sincronizar dieta com o Firestore (mantida localmente):', e);
    }
  };

  const markMealDone = async (patientId, recipeIdx, mealIdx, aiFeedback, mealName = 'Refeição') => {
    const p = patients.find(pat => pat.id === patientId);
    if (!p || !p.recipes || !p.recipes[recipeIdx]) return;

    const newRecipes = [...p.recipes];
    const newMeals = [...newRecipes[recipeIdx].meals];
    newMeals[mealIdx] = { ...newMeals[mealIdx], done: true, log: aiFeedback };
    newRecipes[recipeIdx] = { ...newRecipes[recipeIdx], meals: newMeals };

    const time = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const date = new Date().toLocaleDateString('pt-BR');
    const newFoodLog = { id: `food-${Date.now()}`, type: 'plano', date, time, mealName, log: aiFeedback };
    const newFoodLogs = [...(p.foodLogs || []), newFoodLog];

    await updatePatient(patientId, { recipes: newRecipes, foodLogs: newFoodLogs });
  };

  const addExtraMealLog = async (patientId, aiFeedback) => {
    const p = patients.find(pat => pat.id === patientId);
    if (!p) return;

    const time = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const date = new Date().toLocaleDateString('pt-BR');
    const newFoodLog = { id: `food-${Date.now()}`, type: 'extra', date, time, mealName: 'Refeição Livre', log: aiFeedback };
    const newFoodLogs = [...(p.foodLogs || []), newFoodLog];

    const newExtraLogs = [...(p.extraLogs || []), { time, log: aiFeedback }];

    await updatePatient(patientId, { extraLogs: newExtraLogs, foodLogs: newFoodLogs });
  };
  const addWater = (patientId) => {
    setPatients(prev => prev.map(p => {
      if (p.id === patientId) {
        return { ...p, waterGlasses: (p.waterGlasses || 0) + 1 };
      }
      return p;
    }));
  };

  const addWeight = async (patientId, value) => {
    const date = new Date().toLocaleDateString('pt-BR');
    const p = patients.find(pat => pat.id === patientId);
    if (!p) return;
    const newWeights = [...(p.weights || []), { date, value: parseFloat(value) }];
    setPatients(prev => prev.map(pat => pat.id === patientId ? { ...pat, weights: newWeights } : pat));
    if (!isFirebaseConfigured) return;
    try {
      await updateDoc(doc(db, 'patients', patientId), { weights: newWeights });
    } catch(e) {
      console.warn('Falha ao sincronizar peso com o Firestore (mantido localmente):', e);
    }
  };

  const addNotification = async (patientId, message) => {
    const notif = { id: `notif-${Date.now()}`, message, date: new Date().toLocaleString('pt-BR'), read: false };
    const p = patients.find(pat => pat.id === patientId);
    if (!p) return;
    
    const newNotifications = [...(p.notifications || []), notif];
    
    setPatients(prev => prev.map(pat => {
      if (pat.id !== patientId) return pat;
      return { ...pat, notifications: newNotifications };
    }));

    if (!isFirebaseConfigured) return;
    try {
      await updateDoc(doc(db, 'patients', patientId), { notifications: newNotifications });
    } catch(e) {
      console.warn('Falha ao sincronizar notificação com o Firestore:', e);
    }
  };

  const markNotificationsRead = (patientId) => {
    setPatients(prev => prev.map(p => {
      if (p.id !== patientId) return p;
      return { ...p, notifications: (p.notifications || []).map(n => ({ ...n, read: true })) };
    }));
  };

  const completeQuest = (patientId, xpGained) => {
    setPatients(prev => prev.map(p => {
      if (p.id === patientId) {
        return { ...p, xp: (p.xp || 0) + xpGained };
      }
      return p;
    }));
  };

  const addAppointment = async (patientId, date, time, type) => {
    const localId = `local-${Date.now()}`;
    const newAppt = { patientId, date, time, type, status: 'agendado' };
    if (profile) newAppt.nutricionista_id = profile.id;

    setAppointments(prev => [...prev, { id: localId, ...newAppt }]);
    if (!isFirebaseConfigured) return;
    try {
      const docRef = await addDoc(collection(db, 'appointments'), newAppt);
      setAppointments(prev => prev.map(a => a.id === localId ? { id: docRef.id, ...newAppt } : a));
    } catch(e) {
      console.warn('Falha ao sincronizar agendamento com o Firestore (mantido localmente):', e);
    }
  };

  const cancelAppointment = async (id) => {
    setAppointments(prev => prev.filter(a => a.id !== id));
    if (!isFirebaseConfigured) return;
    try {
      await deleteDoc(doc(db, 'appointments', id));
    } catch(e) {
      console.warn('Falha ao sincronizar cancelamento de agendamento com o Firestore:', e);
    }
  };

  const markAppointmentDone = async (id) => {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'concluido' } : a));
    if (!isFirebaseConfigured) return;
    try {
      await updateDoc(doc(db, 'appointments', id), { status: 'concluido' });
    } catch(e) {
      console.warn('Falha ao sincronizar conclusão de agendamento com o Firestore:', e);
    }
  };

  const isFirebaseConfigured = import.meta.env.VITE_FIREBASE_API_KEY && import.meta.env.VITE_FIREBASE_API_KEY !== 'COLOQUE_AQUI';

  const addDietTemplate = async (title, durationOrMeals, daysOrUndefined) => {
    const localId = `tpl-${Date.now()}`;
    let newTemplate;
    if (Array.isArray(durationOrMeals)) {
      // Compatibilidade com a Consulta rápida (formato antigo)
      newTemplate = { title, duration: 1, days: [{ dayIndex: 1, meals: durationOrMeals }] };
    } else {
      newTemplate = { title, duration: durationOrMeals, days: daysOrUndefined };
    }
    if (profile) newTemplate.nutricionista_id = profile.id;

    setDietTemplates(prev => [...prev, { id: localId, ...newTemplate }]);
    if (!isFirebaseConfigured) return;
    try {
      const docRef = await addDoc(collection(db, 'dietTemplates'), newTemplate);
      setDietTemplates(prev => prev.map(t => t.id === localId ? { id: docRef.id, ...newTemplate } : t));
    } catch(e) {
      console.warn('Falha ao sincronizar template com o Firestore (mantido localmente):', e);
    }
  };

  const deleteDietTemplate = async (id) => {
    setDietTemplates(prev => prev.filter(t => t.id !== id));
    if (!isFirebaseConfigured) return;
    try {
      await deleteDoc(doc(db, 'dietTemplates', id));
    } catch(e) {
      console.warn('Falha ao excluir template do Firestore:', e);
    }
  };

  const addLibraryRecipe = async (title, description, ingredients, instructions, tags) => {
    const localId = `rec-${Date.now()}`;
    const newRecipe = { title, description, ingredients, instructions, tags };
    if (profile) newRecipe.nutricionista_id = profile.id;

    setRecipeLibrary(prev => [...prev, { id: localId, ...newRecipe }]);
    if (!isFirebaseConfigured) return;
    try {
      const docRef = await addDoc(collection(db, 'recipes'), newRecipe);
      setRecipeLibrary(prev => prev.map(r => r.id === localId ? { id: docRef.id, ...newRecipe } : r));
    } catch(e) {
      console.warn('Falha ao sincronizar receita com o Firestore:', e);
    }
  };

  const deleteLibraryRecipe = async (id) => {
    setRecipeLibrary(prev => prev.filter(r => r.id !== id));
    if (!isFirebaseConfigured) return;
    try {
      await deleteDoc(doc(db, 'recipes', id));
    } catch(e) {
      console.warn('Falha ao excluir receita do Firestore:', e);
    }
  };

  const addBonusRecipe = async (patientId, title, content) => {
    const p = patients.find(pat => pat.id === patientId);
    if (!p) return;
    const recipeId = `br-${Date.now()}`;
    const newBonusRecipe = { id: recipeId, title, content, date: new Date().toLocaleDateString('pt-BR') };
    const newBonusRecipes = [...(p.bonusRecipes || []), newBonusRecipe];
    
    setPatients(prev => prev.map(pat => pat.id === patientId ? { ...pat, bonusRecipes: newBonusRecipes } : pat));
    if (!isFirebaseConfigured) return;
    try {
      await updateDoc(doc(db, 'patients', patientId), { bonusRecipes: newBonusRecipes });
    } catch(e) {
      console.warn('Falha ao sincronizar receita bônus com o Firestore:', e);
    }
  };

  return (
    <AppContext.Provider value={{
      session, profile,
      patients, activePatientId, setActivePatientId,
      clinicConfig, updateClinicConfig,
      addPatient, updatePatient, deletePatient,
      addRecipe, markMealDone, addExtraMealLog, addWeight, completeQuest, addWater,
      addNotification, markNotificationsRead,
      appointments, addAppointment, cancelAppointment, markAppointmentDone,
      dietTemplates, addDietTemplate, deleteDietTemplate,
      recipeLibrary, addLibraryRecipe, deleteLibraryRecipe,
      addBonusRecipe,
      isFirebaseConfigured
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}
