import React, { useState } from 'react';
import { Dumbbell, CheckCircle, Award, CheckSquare, Square } from 'lucide-react';
import { useAppContext } from '../../../context/AppContext';

export default function WorkoutPlan({ activePatient }) {
  const { markWorkoutDone, completeQuest } = useAppContext();
  const [completedDays, setCompletedDays] = useState({});
  const [checkedExercises, setCheckedExercises] = useState({}); // { dayName: { exIdx: boolean } }

  const workoutPlan = activePatient?.workoutPlan;

  const toggleExercise = (dayName, exIdx, totalExercises) => {
    if (completedDays[dayName]) return;

    setCheckedExercises(prev => {
      const dayChecks = prev[dayName] || {};
      const newChecks = { ...dayChecks, [exIdx]: !dayChecks[exIdx] };
      const newPrev = { ...prev, [dayName]: newChecks };
      
      // Auto-submit if all checked
      const allChecked = Object.keys(newChecks).length === totalExercises && Object.values(newChecks).every(v => v);
      if (allChecked) {
        setTimeout(() => handleCompleteDay(dayName, newChecks, totalExercises), 300);
      }
      
      return newPrev;
    });
  };

  const handleCompleteDay = (dayName, checksArg = null, totalExercises = 0) => {
    if (completedDays[dayName]) return;
    
    const dayChecks = checksArg || checkedExercises[dayName] || {};
    const completedList = Object.keys(dayChecks).filter(k => dayChecks[k]).map(k => parseInt(k));
    
    // Se o usuário clicar no botão sem marcar todos, totalExercises vem como argumento
    // Se for clicado do botão manual, precisamos pegar do plano
    const actualTotal = totalExercises || workoutPlan?.days?.find(d => d.dayName === dayName)?.exercises?.length || 0;

    // Animação/State
    setCompletedDays(prev => ({ ...prev, [dayName]: true }));
    
    // Lógica
    markWorkoutDone(activePatient.id, dayName, completedList, actualTotal);
    completeQuest(activePatient.id, 15); // XP por treinar
  };

  return (
    <div className="animate-pop-in" style={{ position: 'relative', paddingBottom: '30px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ fontSize: '1.4rem', color: 'var(--crm-text-main)', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
          <Dumbbell color="#3b82f6" /> Meu Treino
        </h2>
      </div>

      {!workoutPlan ? (
        <div style={{ padding: '24px', backgroundColor: 'var(--crm-surface-2, var(--crm-bg))', borderRadius: '16px', textAlign: 'center', border: '1px dashed #CBD5E1' }}>
          <Dumbbell size={32} color='var(--crm-text-muted)' style={{ marginBottom: '16px' }} />
          <p style={{ color: 'var(--crm-text-muted)', margin: 0 }}>Nenhuma ficha de treino foi prescrita ainda.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ padding: '16px', backgroundColor: 'rgba(59, 130, 246, 0.1)', borderRadius: '12px', border: '1px solid #BFDBFE' }}>
            <h3 style={{ margin: 0, color: '#1D4ED8', fontSize: '1.2rem' }}>{workoutPlan.title}</h3>
            <p style={{ margin: '4px 0 0', color: '#3B82F6', fontSize: '0.9rem' }}>Ficha gerada por IA Personal</p>
          </div>

          {workoutPlan.days?.map((day, idx) => {
            const isCompleted = completedDays[day.dayName];
            const totalExercises = day.exercises?.length || 0;
            const dayChecks = checkedExercises[day.dayName] || {};
            const completedCount = Object.values(dayChecks).filter(v => v).length;

            return (
              <div key={idx} style={{ padding: '20px', backgroundColor: 'var(--crm-surface)', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h4 style={{ margin: 0, color: 'var(--crm-text-main)', fontSize: '1.1rem' }}>{day.dayName}</h4>
                  {isCompleted ? (
                    <span style={{ backgroundColor: '#D1FAE5', color: '#059669', padding: '4px 8px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}><Award size={14} /> Feito!</span>
                  ) : (
                    <span style={{ fontSize: '0.85rem', color: 'var(--crm-text-muted)' }}>{completedCount}/{totalExercises}</span>
                  )}
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                  {day.exercises?.map((ex, exIdx) => {
                    const isExChecked = dayChecks[exIdx] || isCompleted;
                    return (
                      <div 
                        key={exIdx} 
                        onClick={() => toggleExercise(day.dayName, exIdx, totalExercises)}
                        style={{ 
                          display: 'flex', gap: '12px', alignItems: 'center', padding: '12px', 
                          backgroundColor: isExChecked ? '#F0FDF4' : 'var(--crm-surface-2, var(--crm-bg))', 
                          borderRadius: '8px', 
                          borderLeft: `3px solid ${isExChecked ? '#22C55E' : '#3B82F6'}`,
                          cursor: isCompleted ? 'default' : 'pointer',
                          transition: 'all 0.2s'
                        }}
                      >
                        {isExChecked ? <CheckSquare size={20} color="#22C55E" /> : <Square size={20} color='var(--crm-text-muted)' />}
                        <span style={{ 
                          color: isExChecked ? '#166534' : 'var(--crm-text-main)', 
                          fontWeight: '500', 
                          fontSize: '0.95rem',
                          textDecoration: isExChecked ? 'line-through' : 'none',
                          opacity: isExChecked ? 0.7 : 1
                        }}>
                          {typeof ex === 'object' ? `${ex.name} - ${ex.sets}x${ex.reps}` : ex}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <button 
                  onClick={() => handleCompleteDay(day.dayName, null, totalExercises)}
                  disabled={isCompleted}
                  className="btn-3d"
                  style={{ 
                    width: '100%', 
                    backgroundColor: isCompleted ? 'var(--crm-border)' : '#10B981', 
                    color: isCompleted ? 'var(--crm-text-muted)' : 'var(--crm-surface)', 
                    border: 'none', 
                    padding: '12px', 
                    borderRadius: '12px', 
                    fontWeight: 'bold', 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    gap: '8px', 
                    cursor: isCompleted ? 'not-allowed' : 'pointer', 
                    boxShadow: isCompleted ? 'none' : '0 4px 0 #059669',
                    transition: 'all 0.2s'
                  }}>
                  <CheckCircle size={18} /> {isCompleted ? 'Treino Concluído' : 'Marcar como Concluído Hoje'}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
