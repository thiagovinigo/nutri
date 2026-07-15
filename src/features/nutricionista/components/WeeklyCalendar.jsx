import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, PlayCircle, Trash2 } from 'lucide-react';

export default function WeeklyCalendar({
  appointments,
  patients,
  clinicConfig,
  onSlotClick,
  startConsultation,
  cancelAppointment
}) {
  const scheduleConfig = clinicConfig.scheduleConfig || { workingDays: [1,2,3,4,5], startHour: 9, endHour: 18, blockedDates: [] };
  const { workingDays, startHour, endHour, blockedDates, lunchStart = '12:00', lunchEnd = '13:00', slotInterval = 30 } = scheduleConfig;

  // Initialize with current week's Sunday
  const [currentDate, setCurrentDate] = useState(() => {
    const d = new Date();
    d.setHours(0,0,0,0);
    return d;
  });

  const getStartOfWeek = (d) => {
    const date = new Date(d);
    const day = date.getDay();
    const diff = date.getDate() - day;
    return new Date(date.setDate(diff));
  };

  const startOfWeek = getStartOfWeek(currentDate);

  const prevWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() - 7);
    setCurrentDate(newDate);
  };

  const nextWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + 7);
    setCurrentDate(newDate);
  };

  // Generate the days to display
  const weekDays = [];
  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  for (let i = 0; i < 7; i++) {
    if (workingDays.includes(i)) {
      const dateObj = new Date(startOfWeek);
      dateObj.setDate(startOfWeek.getDate() + i);
      const isoDate = dateObj.toISOString().split('T')[0];
      weekDays.push({
        dayIndex: i,
        name: dayNames[i],
        dateObj,
        isoDate,
        isBlocked: blockedDates.includes(isoDate)
      });
    }
  }

  // Generate time slots based on slotInterval
  const timeSlots = [];
  for (let h = startHour; h < endHour; h++) {
    const hr = h.toString().padStart(2, '0');
    timeSlots.push(`${hr}:00`);
    if (slotInterval === 30) {
      timeSlots.push(`${hr}:30`);
    }
  }

  // Map appointments to an easy lookup structure: appointmentsByDateAndTime[isoDate][time]
  const apptsMap = {};
  appointments.forEach(appt => {
    if (!apptsMap[appt.date]) apptsMap[appt.date] = {};
    apptsMap[appt.date][appt.time] = appt;
  });

  return (
    <div className="crm-card" style={{ padding: '24px', overflowX: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.4rem', color: 'var(--crm-text-main)', margin: 0 }}>
          Semana de {startOfWeek.toLocaleDateString('pt-BR')}
        </h2>
        <div style={{ display: 'flex', gap: '16px' }}>
          <button className="crm-btn-secondary" onClick={prevWeek} style={{ padding: '8px' }}><ChevronLeft size={20} /></button>
          <button className="crm-btn-secondary" onClick={() => setCurrentDate(new Date())}>Hoje</button>
          <button className="crm-btn-secondary" onClick={nextWeek} style={{ padding: '8px' }}><ChevronRight size={20} /></button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: `80px repeat(${weekDays.length}, minmax(180px, 1fr))` }}>
        {/* Header Row */}
        <div style={{ borderBottom: '2px solid var(--crm-border)', padding: '12px' }}></div>
        {weekDays.map(wd => (
          <div key={wd.isoDate} style={{ borderBottom: '2px solid var(--crm-border)', padding: '12px', textAlign: 'center' }}>
            <div style={{ fontWeight: '700', color: 'var(--crm-text-main)' }}>{wd.name}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--crm-text-muted)' }}>{wd.dateObj.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}</div>
          </div>
        ))}

        {/* Time Rows */}
        {timeSlots.map(time => (
          <React.Fragment key={time}>
            <div style={{ borderBottom: '1px solid var(--crm-border)', borderRight: '1px solid var(--crm-border)', padding: '12px 8px', fontSize: '0.85rem', color: 'var(--crm-text-muted)', textAlign: 'right' }}>
              {time}
            </div>
            {weekDays.map(wd => {
              const appt = apptsMap[wd.isoDate]?.[time];
              
              if (wd.isBlocked) {
                return (
                  <div key={`${wd.isoDate}-${time}`} style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid var(--crm-border)', borderRight: '1px solid var(--crm-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ color: '#94a3b8', fontSize: '0.8rem', transform: 'rotate(-45deg)' }}>Bloqueado</span>
                  </div>
                );
              }

              const timeToMinutes = (t) => {
                const [h, m] = t.split(':').map(Number);
                return h * 60 + m;
              };
              const tMins = timeToMinutes(time);
              const lsMins = timeToMinutes(lunchStart);
              const leMins = timeToMinutes(lunchEnd);
              
              if (tMins >= lsMins && tMins < leMins) {
                return (
                  <div key={`${wd.isoDate}-${time}`} style={{ backgroundColor: '#fff7ed', borderBottom: '1px solid var(--crm-border)', borderRight: '1px solid var(--crm-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ color: '#fb923c', fontSize: '0.8rem', fontWeight: 600 }}>Almoço</span>
                  </div>
                );
              }

              if (appt) {
                const pat = patients.find(p => p.id === appt.patientId);
                const isConcluido = appt.status === 'concluido';
                return (
                  <div key={`${wd.isoDate}-${time}`} style={{ borderBottom: '1px solid var(--crm-border)', borderRight: '1px solid var(--crm-border)', padding: '4px' }}>
                    <div style={{ backgroundColor: isConcluido ? '#dcfce7' : '#e0e7ff', borderLeft: `4px solid ${isConcluido ? '#22c55e' : '#3b82f6'}`, borderRadius: '4px', padding: '8px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ fontWeight: '600', fontSize: '0.85rem', color: 'var(--crm-text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{pat?.name || 'Desconhecido'}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--crm-text-muted)' }}>{appt.type}</div>
                      </div>
                      {!isConcluido && (
                        <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                          <button onClick={() => startConsultation(pat?.id, appt.id)} style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', padding: 0 }} title="Iniciar"><PlayCircle size={16} /></button>
                          <button onClick={() => cancelAppointment(appt.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 0 }} title="Cancelar"><Trash2 size={16} /></button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              }

              return (
                <div 
                  key={`${wd.isoDate}-${time}`} 
                  style={{ borderBottom: '1px solid var(--crm-border)', borderRight: '1px solid var(--crm-border)', cursor: 'pointer' }}
                  className="agenda-slot"
                  onClick={() => onSlotClick(wd.isoDate, time)}
                />
              );
            })}
          </React.Fragment>
        ))}
      </div>
      <style>{`
        .agenda-slot:hover {
          background-color: #f8fafc;
        }
      `}</style>
    </div>
  );
}
