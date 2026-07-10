import React, { createContext, useState, useContext } from 'react';

const AppContext = createContext();

export function AppProvider({ children }) {
  // Pacientes Base
  const [patients, setPatients] = useState([
    { 
      id: 1, name: 'Ana Silva', streak: 12, xp: 150, status: 'engajado', 
      objective: 'Emagrecimento', restrictions: 'Sem lactose',
      weights: [{ date: '2026-07-01', value: 72.0 }, { date: '2026-07-07', value: 71.5 }],
      recipes: [], exams: [], records: 'Paciente relatou melhora na disposição.'
    },
    { 
      id: 2, name: 'Carlos Mendes', streak: 2, xp: 40, status: 'em_risco', 
      objective: 'Hipertrofia', restrictions: 'Nenhuma',
      weights: [], recipes: [], exams: [], records: ''
    }
  ]);

  // Agenda (CRUD)
  const [appointments, setAppointments] = useState([
    { id: 101, patientId: 1, time: '14:00', type: 'Retorno', status: 'agendado' },
    { id: 102, patientId: 2, time: '15:30', type: 'Primeira Consulta', status: 'agendado' }
  ]);

  const [activePatientId, setActivePatientId] = useState(1);

  // Metodos de Paciente (CRUD Completo)
  const addPatient = (name, objective, restrictions) => {
    const newPatient = {
      id: Date.now(), name, streak: 0, xp: 0, status: 'inativo', objective, restrictions,
      weights: [], recipes: [], exams: [], records: 'Novo paciente cadastrado.'
    };
    setPatients([...patients, newPatient]);
    return newPatient.id;
  };

  const updatePatient = (id, updatedData) => {
    setPatients(prev => prev.map(p => p.id === id ? { ...p, ...updatedData } : p));
  };

  const deletePatient = (id) => {
    setPatients(prev => prev.filter(p => p.id !== id));
    // Limpar agendamentos futuros desse paciente
    setAppointments(prev => prev.filter(a => a.patientId !== id));
    if (activePatientId === id) setActivePatientId(patients[0]?.id || null);
  };

  // Metodos de Funcionalidades do Paciente
  const addRecipe = (patientId, title, desc) => {
    setPatients(prev => prev.map(p => p.id === patientId ? { ...p, recipes: [...p.recipes, { title, desc }] } : p));
  };

  const addWeight = (patientId, value) => {
    const date = new Date().toLocaleDateString('pt-BR');
    setPatients(prev => prev.map(p => p.id === patientId ? { ...p, weights: [...p.weights, { date, value: parseFloat(value) }] } : p));
  };

  const completeQuest = (patientId, xpGained) => {
    setPatients(prev => prev.map(p => p.id === patientId ? { ...p, xp: p.xp + xpGained, streak: p.streak + 1, status: 'engajado' } : p));
  };

  // Metodos de Agenda
  const addAppointment = (patientId, time, type) => {
    setAppointments([...appointments, { id: Date.now(), patientId, time, type, status: 'agendado' }]);
  };

  const cancelAppointment = (id) => {
    setAppointments(prev => prev.filter(a => a.id !== id));
  };

  const markAppointmentDone = (id) => {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'concluido' } : a));
  };

  return (
    <AppContext.Provider value={{
      patients, activePatientId, setActivePatientId,
      addPatient, updatePatient, deletePatient,
      addRecipe, addWeight, completeQuest,
      appointments, addAppointment, cancelAppointment, markAppointmentDone
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}
