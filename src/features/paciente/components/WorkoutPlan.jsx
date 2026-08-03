import React, { useState, useMemo } from 'react';
import { Dumbbell, CheckCircle, Award, CheckSquare, Square, ChevronDown, ChevronUp, Flame, Calendar, Zap, Circle, Minus } from 'lucide-react';
import { useAppContext } from '../../../context/AppContext';

// Distribui os dias de treino nos dias da semana automaticamente
function assignWorkoutDays(trainingDays = []) {
  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const count = trainingDays.length;

  // Mapeamento fixo por quantidade de dias de treino
  const schedules = {
    1: [3],           // Qua
    2: [2, 5],        // Ter, Sex
    3: [1, 3, 5],     // Seg, Qua, Sex
    4: [1, 2, 4, 5],  // Seg, Ter, Qui, Sex
    5: [1, 2, 3, 4, 5], // Seg a Sex
    6: [1, 2, 3, 4, 5, 6], // Seg a Sáb
    7: [0, 1, 2, 3, 4, 5, 6], // todos
  };

  const trainingWeekDays = schedules[Math.min(count, 7)] || schedules[3];

  return weekDays.map((dayLabel, idx) => {
    const trainingIdx = trainingWeekDays.indexOf(idx);
    if (trainingIdx !== -1 && trainingDays[trainingIdx]) {
      return { dayLabel, dayIndex: idx, workout: trainingDays[trainingIdx], isRest: false };
    }
    return { dayLabel, dayIndex: idx, workout: null, isRest: true };
  });
}

// Obtém a data de domingo da semana atual (começo da semana)
function getWeekStart() {
  const now = new Date();
  const day = now.getDay(); // 0 = Dom
  const diff = now.getDate() - day;
  return new Date(now.getFullYear(), now.getMonth(), diff);
}

// Formata data como dd/mm/yyyy para comparar com workoutLogs
function formatDate(dateObj) {
  return dateObj.toLocaleDateString('pt-BR');
}

export default function WorkoutPlan({ activePatient }) {
  const { markWorkoutDone, completeQuest } = useAppContext();
  const [expandedDay, setExpandedDay] = useState(null);
  const [checkedExercises, setCheckedExercises] = useState({});
  const [localCompleted, setLocalCompleted] = useState({});

  const workoutPlan = activePatient?.workoutPlan;
  const workoutLogs = activePatient?.workoutLogs || [];

  const today = new Date();
  const todayIndex = today.getDay(); // 0 = Dom
  const weekStart = getWeekStart();

  // Monta a agenda da semana
  const weekSchedule = useMemo(() => {
    if (!workoutPlan?.days) return [];
    return assignWorkoutDays(workoutPlan.days);
  }, [workoutPlan]);

  // Verifica se um dia da semana foi concluído esta semana
  const isDayCompletedThisWeek = (dayIndex, dayName) => {
    if (localCompleted[dayIndex]) return true;
    const dateOfDay = new Date(weekStart);
    dateOfDay.setDate(weekStart.getDate() + dayIndex);
    const dateStr = formatDate(dateOfDay);
    return workoutLogs.some(log => log.date === dateStr && log.dayName === dayName);
  };

  const isPastDay = (dayIndex) => dayIndex < todayIndex;
  const isToday = (dayIndex) => dayIndex === todayIndex;

  const toggleExercise = (dayIndex, dayName, exIdx, totalExercises) => {
    if (localCompleted[dayIndex] || isDayCompletedThisWeek(dayIndex, dayName)) return;

    setCheckedExercises(prev => {
      const key = `${dayIndex}`;
      const dayChecks = prev[key] || {};
      const newChecks = { ...dayChecks, [exIdx]: !dayChecks[exIdx] };
      const newPrev = { ...prev, [key]: newChecks };

      // Auto-complete se todos marcados
      const allChecked =
        Object.keys(newChecks).length === totalExercises &&
        Object.values(newChecks).every(v => v);
      if (allChecked) {
        setTimeout(() => handleCompleteDay(dayIndex, dayName, newChecks, totalExercises), 400);
      }

      return newPrev;
    });
  };

  const handleCompleteDay = (dayIndex, dayName, checksArg = null, totalExercises = 0) => {
    if (localCompleted[dayIndex] || isDayCompletedThisWeek(dayIndex, dayName)) return;

    const dayChecks = checksArg || checkedExercises[`${dayIndex}`] || {};
    const completedList = Object.keys(dayChecks).filter(k => dayChecks[k]).map(k => parseInt(k));

    const dateOfDay = new Date(weekStart);
    dateOfDay.setDate(weekStart.getDate() + dayIndex);
    const dateStr = formatDate(dateOfDay);

    setLocalCompleted(prev => ({ ...prev, [dayIndex]: true }));
    markWorkoutDone(activePatient.id, dayName, completedList, totalExercises, dateStr);
    completeQuest(activePatient.id, 15);
  };

  // Contagem da semana
  const weeklyDoneCount = weekSchedule.filter(d =>
    !d.isRest && isDayCompletedThisWeek(d.dayIndex, d.workout?.dayName)
  ).length;
  const weeklyTrainingCount = weekSchedule.filter(d => !d.isRest).length;

  if (!workoutPlan) {
    return (
      <div className="animate-pop-in" style={{ paddingBottom: '30px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '1.4rem', color: 'var(--crm-text-main)', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
            <Dumbbell color="var(--primary-color)" /> Meu Treino
          </h2>
        </div>
        <div style={{ padding: '32px 24px', backgroundColor: 'var(--crm-surface)', borderRadius: '16px', textAlign: 'center', border: '1px dashed #CBD5E1' }}>
          <Dumbbell size={36} color="var(--crm-text-muted)" style={{ marginBottom: '12px' }} />
          <p style={{ color: 'var(--crm-text-muted)', margin: 0 }}>Nenhuma ficha de treino foi prescrita ainda.</p>
          <p style={{ color: 'var(--crm-text-muted)', margin: '4px 0 0', fontSize: '0.85rem' }}>Aguarde seu nutricionista cadastrar seu plano.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-pop-in" style={{ paddingBottom: '30px' }}>
      {!activePatient.nutricionista_id && (
        <div style={{ backgroundColor: 'rgba(168, 85, 247, 0.1)', border: '1px solid #a855f7', borderRadius: '12px', padding: '12px', marginBottom: '20px', textAlign: 'center', color: '#e9d5ff' }}>
          <strong style={{ display: 'block', marginBottom: '4px', color: '#c084fc' }}>🎁 Amostra Grátis (IA)</strong>
          Gostou do treino? Para acompanhamento completo de evolução e periodização, conecte-se a um Nutricionista Nutrivvo!
        </div>
      )}
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ fontSize: '1.4rem', color: 'var(--crm-text-main)', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
          <Dumbbell color="var(--primary-color)" /> Meu Treino
        </h2>
        <span style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          backgroundColor: weeklyDoneCount === weeklyTrainingCount && weeklyTrainingCount > 0 ? '#D1FAE5' : 'rgba(59,130,246,0.1)',
          color: weeklyDoneCount === weeklyTrainingCount && weeklyTrainingCount > 0 ? '#059669' : 'var(--primary-color)',
          padding: '6px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '600'
        }}>
          <Flame size={14} />
          {weeklyDoneCount}/{weeklyTrainingCount} treinos esta semana
        </span>
      </div>

      {/* Card da periodização */}
      <div style={{ padding: '14px 16px', backgroundColor: 'rgba(59, 130, 246, 0.08)', borderRadius: '12px', border: '1px solid #BFDBFE', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Zap size={16} color="var(--primary-color)" />
          <h3 style={{ margin: 0, color: 'var(--primary-shadow, #4338CA)', fontSize: '1rem', fontWeight: '700' }}>{workoutPlan.title}</h3>
        </div>
        <p style={{ margin: '4px 0 0 24px', color: 'var(--primary-color)', fontSize: '0.82rem' }}>Ficha personalizada — IA Personal Trainer</p>
      </div>

      {/* Calendário semanal */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
          <Calendar size={15} color="var(--crm-text-muted)" />
          <span style={{ fontSize: '0.82rem', color: 'var(--crm-text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Semana Atual
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' }}>
          {weekSchedule.map((slot) => {
            const done = !slot.isRest && isDayCompletedThisWeek(slot.dayIndex, slot.workout?.dayName);
            const missed = !slot.isRest && isPastDay(slot.dayIndex) && !done && !isToday(slot.dayIndex);
            const isTodaySlot = isToday(slot.dayIndex);

            let bg = 'var(--crm-surface)';
            let border = '1px solid var(--crm-border)';
            let textColor = 'var(--crm-text-muted)';

            if (slot.isRest) {
              bg = 'var(--crm-bg)';
              border = '1px dashed var(--crm-border)';
            } else if (done) {
              bg = '#D1FAE5';
              border = '1.5px solid #34D399';
              textColor = '#065F46';
            } else if (missed) {
              bg = 'rgba(239,68,68,0.06)';
              border = '1px solid rgba(239,68,68,0.2)';
              textColor = '#F87171';
            } else if (isTodaySlot && !slot.isRest) {
              bg = 'rgba(59,130,246,0.12)';
              border = '2px solid var(--primary-color)';
              textColor = 'var(--primary-shadow, #4338CA)';
            }

            return (
              <div
                key={slot.dayIndex}
                onClick={() => {
                  if (!slot.isRest) {
                    setExpandedDay(expandedDay === slot.dayIndex ? null : slot.dayIndex);
                  }
                }}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  padding: '10px 4px', borderRadius: '12px', background: bg, border,
                  cursor: slot.isRest ? 'default' : 'pointer', transition: 'all 0.2s',
                  minHeight: '72px', position: 'relative'
                }}
              >
                <span style={{ fontSize: '0.7rem', fontWeight: '700', color: textColor, marginBottom: '4px' }}>
                  {slot.dayLabel}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '18px' }}>
                  {slot.isRest ? (
                    <span style={{ fontSize: '0.95rem' }}>🏖️</span>
                  ) : done ? (
                    <CheckCircle size={16} color="#10B981" />
                  ) : missed ? (
                    <Minus size={16} color="#F87171" />
                  ) : isTodaySlot ? (
                    <Flame size={16} color="var(--primary-color)" />
                  ) : (
                    <Circle size={13} color="#94A3B8" />
                  )}
                </span>
                {!slot.isRest && (
                  <span style={{ fontSize: '0.6rem', color: textColor, marginTop: '4px', textAlign: 'center', lineHeight: 1.2, fontWeight: '500' }}>
                    {slot.workout?.dayName?.split(' - ')[0] || 'Treino'}
                  </span>
                )}
                {isTodaySlot && !slot.isRest && (
                  <div style={{
                    position: 'absolute', top: '-4px', right: '-4px',
                    width: '10px', height: '10px', borderRadius: '50%',
                    backgroundColor: 'var(--primary-color)', border: '2px solid var(--crm-bg)'
                  }} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Treino do dia / expandido */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {weekSchedule.filter(s => !s.isRest).map((slot) => {
          const day = slot.workout;
          if (!day) return null;
          const isExpanded = expandedDay === slot.dayIndex;
          const done = isDayCompletedThisWeek(slot.dayIndex, day.dayName);
          const isTodaySlot = isToday(slot.dayIndex);
          const totalExercises = day.exercises?.length || 0;
          const dayChecks = checkedExercises[`${slot.dayIndex}`] || {};
          const completedCount = Object.values(dayChecks).filter(v => v).length;
          const missed = isPastDay(slot.dayIndex) && !done && !isTodaySlot;

          return (
            <div
              key={slot.dayIndex}
              style={{
                borderRadius: '16px',
                border: done
                  ? '1.5px solid #34D399'
                  : isTodaySlot
                  ? '2px solid var(--primary-color)'
                  : missed
                  ? '1px solid rgba(239,68,68,0.25)'
                  : '1px solid var(--crm-border)',
                backgroundColor: done
                  ? 'rgba(209,250,229,0.3)'
                  : isTodaySlot
                  ? 'rgba(59,130,246,0.05)'
                  : 'var(--crm-surface)',
                overflow: 'hidden',
                transition: 'all 0.2s',
                opacity: missed ? 0.65 : 1
              }}
            >
              {/* Header do treino */}
              <div
                onClick={() => setExpandedDay(isExpanded ? null : slot.dayIndex)}
                style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '16px 20px', cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '10px',
                    backgroundColor: done ? '#D1FAE5' : isTodaySlot ? 'rgba(59,130,246,0.15)' : 'var(--crm-surface-2, var(--crm-bg))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    {done
                      ? <Award size={18} color="#059669" />
                      : <Dumbbell size={18} color={isTodaySlot ? 'var(--primary-color)' : 'var(--crm-text-muted)'} />
                    }
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontWeight: '700', fontSize: '0.95rem', color: 'var(--crm-text-main)' }}>
                        {day.dayName}
                      </span>
                      {isTodaySlot && !done && (
                        <span style={{
                          fontSize: '0.7rem', fontWeight: '600', color: 'var(--primary-color)',
                          backgroundColor: 'rgba(59,130,246,0.1)', padding: '2px 8px', borderRadius: '10px'
                        }}>
                          HOJE
                        </span>
                      )}
                      {done && (
                        <span style={{
                          fontSize: '0.7rem', fontWeight: '600', color: '#059669',
                          backgroundColor: '#D1FAE5', padding: '2px 8px', borderRadius: '10px'
                        }}>
                          CONCLUÍDO ✓
                        </span>
                      )}
                      {missed && (
                        <span style={{
                          fontSize: '0.7rem', fontWeight: '600', color: '#EF4444',
                          backgroundColor: 'rgba(239,68,68,0.1)', padding: '2px 8px', borderRadius: '10px'
                        }}>
                          PERDIDO
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: '0.78rem', color: 'var(--crm-text-muted)' }}>
                      {slot.dayLabel} — {totalExercises} exercícios
                      {!done && isExpanded && ` · ${completedCount}/${totalExercises} marcados`}
                    </span>
                  </div>
                </div>
                {isExpanded ? <ChevronUp size={18} color="var(--crm-text-muted)" /> : <ChevronDown size={18} color="var(--crm-text-muted)" />}
              </div>

              {/* Exercícios expandidos */}
              {isExpanded && (
                <div style={{ padding: '0 20px 20px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                    {day.exercises?.map((ex, exIdx) => {
                      const isExChecked = (dayChecks[exIdx] || done);
                      return (
                        <div
                          key={exIdx}
                          onClick={() => toggleExercise(slot.dayIndex, day.dayName, exIdx, totalExercises)}
                          style={{
                            display: 'flex', gap: '12px', alignItems: 'center', padding: '12px 14px',
                            backgroundColor: isExChecked ? '#F0FDF4' : 'var(--crm-surface-2, var(--crm-bg))',
                            borderRadius: '10px',
                            borderLeft: `3px solid ${isExChecked ? '#22C55E' : isTodaySlot ? 'var(--primary-color)' : '#94A3B8'}`,
                            cursor: done ? 'default' : 'pointer',
                            transition: 'all 0.2s'
                          }}
                        >
                          {isExChecked
                            ? <CheckSquare size={18} color="#22C55E" />
                            : <Square size={18} color="var(--crm-text-muted)" />
                          }
                          <div style={{ flex: 1 }}>
                            <span style={{
                              color: isExChecked ? '#166534' : 'var(--crm-text-main)',
                              fontWeight: '600', fontSize: '0.9rem',
                              textDecoration: isExChecked ? 'line-through' : 'none',
                              opacity: isExChecked ? 0.75 : 1
                            }}>
                              {typeof ex === 'object' ? ex.name : ex}
                            </span>
                            {typeof ex === 'object' && (ex.sets || ex.reps) && (
                              <div style={{ fontSize: '0.78rem', color: 'var(--crm-text-muted)', marginTop: '2px' }}>
                                {ex.sets && `${ex.sets} séries`}{ex.sets && ex.reps && ' · '}{ex.reps}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {!done && (
                    <button
                      onClick={() => handleCompleteDay(slot.dayIndex, day.dayName, null, totalExercises)}
                      className="btn-3d"
                      style={{
                        width: '100%', backgroundColor: '#10B981', color: '#fff',
                        border: 'none', padding: '13px', borderRadius: '12px', fontWeight: 'bold',
                        display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px',
                        cursor: 'pointer', boxShadow: '0 4px 0 #059669', transition: 'all 0.2s', fontSize: '0.95rem'
                      }}
                    >
                      <CheckCircle size={18} /> Marcar Treino como Concluído
                    </button>
                  )}

                  {done && (
                    <div style={{
                      textAlign: 'center', padding: '12px', borderRadius: '12px',
                      backgroundColor: '#D1FAE5', color: '#065F46', fontWeight: '700', fontSize: '0.9rem',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                    }}>
                      <Award size={18} /> Treino concluído! +15 XP 🎉
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
