import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Trash2, Eye } from 'lucide-react';

export default function WeeklyCalendar({
  appointments,
  patients,
  clinicConfig,
  onSlotClick,
  startConsultation,
  cancelAppointment,
  viewPatientProfile
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
  const todayISO = new Date().toISOString().split('T')[0];

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
        {weekDays.map(wd => {
          const isToday = wd.isoDate === todayISO;
          return (
            <div key={wd.isoDate} style={{ borderBottom: '1px solid var(--crm-border)', borderTop: isToday ? '3px solid var(--crm-accent)' : '3px solid transparent', backgroundColor: isToday ? 'rgba(255,255,255,0.04)' : 'transparent', backgroundImage: isToday ? 'linear-gradient(180deg, rgba(255,255,255,0.08) 0%, transparent 100%)' : 'none', boxShadow: isToday ? 'inset 0 15px 30px -15px var(--crm-accent)' : 'none', borderRadius: '8px 8px 0 0', padding: '12px', textAlign: 'center', transition: 'all 0.3s ease' }}>
              <div style={{ fontWeight: '700', color: isToday ? 'var(--crm-accent)' : 'var(--crm-text-main)' }}>{wd.name}</div>
              <div style={{ fontSize: '0.85rem', color: isToday ? 'var(--crm-accent)' : 'var(--crm-text-muted)', fontWeight: isToday ? 700 : 400 }}>{wd.dateObj.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}</div>
              {isToday && (
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--crm-accent)', marginTop: '2px', letterSpacing: '0.05em' }}>HOJE</div>
              )}
            </div>
          );
        })}

        {/* Time Rows */}
        {timeSlots.map(time => (
          <React.Fragment key={time}>
            <div style={{ borderBottom: '1px solid var(--crm-border)', borderRight: '1px solid var(--crm-border)', padding: '12px 8px', fontSize: '0.85rem', color: 'var(--crm-text-muted)', textAlign: 'right' }}>
              {time}
            </div>
            {weekDays.map(wd => {
              const appt = apptsMap[wd.isoDate]?.[time];
              const isToday = wd.isoDate === todayISO;
              const todayBandStyle = isToday ? { backgroundColor: 'rgba(255,255,255,0.03)' } : {};

              if (wd.isBlocked) {
                return (
                  <div key={`${wd.isoDate}-${time}`} style={{ backgroundColor: 'var(--crm-surface-2)', borderBottom: '1px solid var(--crm-border)', borderRight: '1px solid var(--crm-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', ...todayBandStyle }}>
                    <span style={{ color: 'var(--crm-text-muted)', fontSize: '0.8rem', transform: 'rotate(-45deg)' }}>Bloqueado</span>
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
                  <div key={`${wd.isoDate}-${time}`} style={{ ...todayBandStyle, backgroundColor: 'rgba(0, 0, 0, 0.25)', backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.2) 10px, rgba(0,0,0,0.2) 20px)', boxShadow: 'inset 0 4px 12px rgba(0,0,0,0.4)', borderBottom: '1px solid var(--crm-border)', borderRight: '1px solid var(--crm-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ color: 'var(--crm-text-muted)', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.05em', opacity: 0.6, textTransform: 'uppercase' }}>Almoço</span>
                  </div>
                );
              }

              if (appt) {
                const pat = patients.find(p => p.id === appt.patientId);
                const isConcluido = appt.status === 'concluido';
                return (
                  <div key={`${wd.isoDate}-${time}`} style={{ borderBottom: '1px solid var(--crm-border)', borderRight: '1px solid var(--crm-border)', padding: '4px', ...todayBandStyle }}>
                    <div style={{ backgroundColor: isConcluido ? '#dcfce7' : 'var(--crm-primary-light, #eff6ff)', borderLeft: `4px solid ${isConcluido ? '#22c55e' : 'var(--crm-primary)'}`, borderRadius: '4px', padding: '8px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ fontWeight: '600', fontSize: '0.85rem', color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{pat?.name || 'Desconhecido'}</div>
                        <div style={{ fontSize: '0.75rem', color: '#475569' }}>{appt.type} {appt.locationType === 'online' ? '(Online)' : ''}</div>
                        {appt.locationType === 'online' && appt.meetingLink && (
                          <a href={appt.meetingLink} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.75rem', color: 'var(--crm-primary)', textDecoration: 'underline', display: 'block', marginTop: '4px' }}>Entrar na Sala</a>
                        )}
                      </div>
                      {!isConcluido && (
                        <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                          <button onClick={() => viewPatientProfile(pat?.id)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }} title="Ver Ficha"><Eye size={16} /></button>
                          <button onClick={() => { if(window.confirm('Tem certeza que deseja cancelar este agendamento?')) cancelAppointment(appt.id); }} style={{ background: 'none', border: 'none', color: 'var(--crm-danger)', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }} title="Cancelar Agendamento"><Trash2 size={16} /></button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={`${wd.isoDate}-${time}`}
                  style={{ borderBottom: '1px solid var(--crm-border)', borderRight: '1px solid var(--crm-border)', cursor: 'pointer', backgroundColor: isToday ? 'rgba(255,255,255,0.03)' : 'transparent' }}
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
