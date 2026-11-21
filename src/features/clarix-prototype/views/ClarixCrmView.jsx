import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  Activity,
  Bot,
  Calendar,
  ChefHat,
  ClipboardList,
  Copy,
  Droplets,
  Dumbbell,
  FileSearch,
  Footprints,
  LayoutDashboard,
  MapPin,
  Moon,
  Pause,
  Play,
  Plus,
  Radar,
  RotateCcw,
  Send,
  Settings,
  Smartphone,
  Stethoscope,
  Upload,
  Users,
  Utensils,
  Video,
  Wallet,
  X
} from 'lucide-react';
import ClarixRobotCanvas from '../components/ClarixRobotCanvas';
import { ConicRing, MacroPillGroup, WeightEvolutionChart } from '../components/MovefluxCharts';
import {
  ACTIVITY_LEVELS,
  MEAL_PLAN_PRESETS,
  WEEK_DAYS,
  calculateMifflinTmbGet,
  formatBRL
} from '../clarixData';
import { useClarix } from '../clarixStore';

const CRM_NAV = [
  { id: 'cockpit', label: '01 · Visão Geral & Radar', icon: LayoutDashboard },
  { id: 'patients', label: '02 · Meus Pacientes', icon: Users },
  { id: 'plans', label: '03 · Nova Consulta & Prontuário', icon: Stethoscope },
  { id: 'schedule', label: '04 · Agenda Semanal', icon: Calendar },
  { id: 'recipes', label: '05 · Biblioteca de Receitas', icon: ChefHat },
  { id: 'finance', label: '06 · Financeiro & Planos', icon: Wallet },
  { id: 'settings', label: '07 · Configurações', icon: Settings }
];

function formatTimer(totalSec) {
  const s = Math.max(0, Number(totalSec) || 0);
  const hh = String(Math.floor(s / 3600)).padStart(2, '0');
  const mm = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
  const ss = String(s % 60).padStart(2, '0');
  return `${hh}:${mm}:${ss}`;
}

export default function ClarixCrmView({ onNavigate }) {
  const {
    patients,
    activePatient,
    appointments,
    recipes,
    clinicSettings,
    syncLog,
    botMood,
    botSpeech,
    botPulseCount,
    sessionTimer,
    selectedDayIdx,
    selectPatient,
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
    toggleAppointmentStatus,
    addAppointment,
    saveConsultationRecord,
    toggleInvoiceStatus,
    toggleSessionTimer,
    resetSessionTimer,
    setSelectedDayIdx,
    setBotMood
  } = useClarix();

  const [section, setSection] = useState('cockpit');
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState('all');
  const [crmPrompt, setCrmPrompt] = useState('');

  // Modal Novo Paciente (Cadastro Clínico Completo)
  const [showModal, setShowModal] = useState(false);
  const [patName, setPatName] = useState('');
  const [patCpf, setPatCpf] = useState('');
  const [patPhone, setPatPhone] = useState('');
  const [patEmail, setPatEmail] = useState('');
  const [patBirthDate, setPatBirthDate] = useState('1994-05-12');
  const [patGender, setPatGender] = useState('F');
  const [patGoal, setPatGoal] = useState('');
  const [patRest, setPatRest] = useState('');
  const [patAversions, setPatAversions] = useState('');
  const [patMedications, setPatMedications] = useState('');
  const [patVal, setPatVal] = useState('480');

  // Fluxo de Consulta em 4 Etapas (Anamnese -> Avaliação TMB/GET -> Exames -> Cardápio)
  const [consultStep, setConsultStep] = useState('anamnesis');
  const [anamnesisForm, setAnamnesisForm] = useState(() => ({ ...(activePatient?.anamnesis || {}) }));
  const [physForm, setPhysForm] = useState(() => ({ ...(activePatient?.physicalEval || {}) }));

  useEffect(() => {
    setAnamnesisForm({ ...(activePatient?.anamnesis || {}) });
    setPhysForm({ ...(activePatient?.physicalEval || {}) });
    setApptPatientId(activePatient?.id || '');
  }, [activePatient?.id]);

  const liveCalc = calculateMifflinTmbGet(physForm);

  // Form Refeição Personalizada & Treino
  const [customSlot, setCustomSlot] = useState('16:00 · Lanche Proteico');
  const [customMealName, setCustomMealName] = useState('');
  const [customPrep, setCustomPrep] = useState('');
  const [workoutTitle, setWorkoutTitle] = useState('');
  const [workoutDetail, setWorkoutDetail] = useState('45 min · Hipertrofia / Core');

  // Form Biblioteca de Receitas
  const [recTitle, setRecTitle] = useState('');
  const [recCategory, setRecCategory] = useState('Almoço Rápido');
  const [recKcal, setRecKcal] = useState('420');
  const [recPrep, setRecPrep] = useState('');

  // Configurações da Clínica
  const [settingsForm, setSettingsForm] = useState(() => ({ ...(clinicSettings || {}) }));
  const [parecerDrafts, setParecerDrafts] = useState({});

  // Form Nova Consulta & Filtro Semanal
  const [apptPatientId, setApptPatientId] = useState(activePatient?.id || '');
  const [apptDay, setApptDay] = useState('Sex 21');
  const [apptTime, setApptTime] = useState('15:30');
  const [apptType, setApptType] = useState('Retorno + Bioimpedância');
  const [apptLocationType, setApptLocationType] = useState('local');
  const [apptMeetingLink, setApptMeetingLink] = useState('');
  const [scheduleDayFilter, setScheduleDayFilter] = useState('all');

  const waterPct = Math.min(100, Math.round(((activePatient?.waterMl || 0) / Math.max(activePatient?.waterGoal || 1, 1)) * 100));
  const stepsPct = Math.min(100, Math.round(((activePatient?.steps || 0) / Math.max(activePatient?.stepsGoal || 1, 1)) * 100));
  const kcalPct = Math.min(100, Math.round(((activePatient?.kcalConsumed || 0) / Math.max(activePatient?.kcalTarget || 1, 1)) * 100));

  const sortedRadarPatients = [...patients].sort((a, b) => b.riskScore - a.riskScore);
  const filteredPatients = patients.filter((p) => {
    const matchText =
      !searchTerm.trim() ||
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.goal.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(p.cpf || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchRisk = riskFilter === 'all' || p.riskLevel === riskFilter;
    return matchText && matchRisk;
  });

  const filteredAppointments =
    scheduleDayFilter === 'all'
      ? appointments
      : appointments.filter((a) => a.day === scheduleDayFilter);

  const paidSum = patients.filter((p) => p.invoiceStatus === 'pago').reduce((a, p) => a + p.invoiceValue, 0);
  const pendingSum = patients.filter((p) => p.invoiceStatus !== 'pago').reduce((a, p) => a + p.invoiceValue, 0);
  const avgTicket = Math.round((paidSum + pendingSum) / Math.max(patients.length, 1));

  const handleCreatePatient = (e) => {
    e.preventDefault();
    if (!patName.trim()) return;
    addPatient({
      name: patName,
      cpf: patCpf,
      phone: patPhone,
      email: patEmail,
      birthDate: patBirthDate,
      gender: patGender,
      goal: patGoal,
      restrictions: patRest,
      aversions: patAversions,
      medications: patMedications,
      invoiceValue: patVal
    });
    setPatName('');
    setPatCpf('');
    setPatPhone('');
    setPatEmail('');
    setPatGoal('');
    setPatRest('');
    setPatAversions('');
    setPatMedications('');
    setPatVal('480');
    setShowModal(false);
  };

  const handleBotSubmit = (e) => {
    e.preventDefault();
    if (!crmPrompt.trim()) return;
    sendBotMessage(activePatient?.id, crmPrompt, 'nutri');
    setCrmPrompt('');
  };

  return (
    <div className="cx-container" style={{ paddingTop: '1.5rem' }}>
      {/* Header do Consultório */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.85rem', marginBottom: '1.25rem' }}>
        <div>
          <span className="cx-eyebrow">CLÍNICA DIGITAL NUTRIVVO + NutrIA</span>
          <h1 className="cx-display-md" style={{ marginTop: '0.2rem' }}>Cockpit do Nutricionista</h1>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', flexWrap: 'wrap' }}>
          <label htmlFor="crm-patient-focus" style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--cx-muted)' }}>
            Em foco:
          </label>
          <select
            id="crm-patient-focus"
            className="cx-select"
            style={{ width: 'auto', minWidth: '210px' }}
            value={activePatient?.id}
            onChange={(e) => selectPatient(e.target.value)}
          >
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.shortName} · {p.adherence}%
              </option>
            ))}
          </select>

          <button
            type="button"
            className="cx-btn cx-btn-primary cx-btn-sm cx-btn-pill"
            onClick={() => {
              setSection('plans');
              setConsultStep('anamnesis');
            }}
          >
            <Stethoscope size={14} aria-hidden="true" />
            <span>+ Nova Consulta</span>
          </button>

          <button
            type="button"
            className="cx-btn cx-btn-ghost cx-btn-sm cx-btn-pill"
            onClick={() => setShowModal(true)}
          >
            <Plus size={14} aria-hidden="true" />
            <span>Novo Paciente</span>
          </button>

          <button
            type="button"
            className="cx-btn cx-btn-accent cx-btn-sm cx-btn-pill"
            onClick={() => onNavigate('/clarix/paciente')}
          >
            <Smartphone size={14} aria-hidden="true" />
            <span>App do Paciente ↗</span>
          </button>
        </div>
      </div>

      {/* GRID PRINCIPAL DE 3 COLUNAS */}
      <div className="cx-crm-layout">
        {/* COLUNA ESQUERDA: DARK FROSTED SIDEBAR (ESTILO CLARIX #ds-side) */}
        <aside className="cx-sidebar-dark" aria-label="Navegação interna do CRM">
          <div className="cx-side-label">Módulos Clínicos</div>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            {CRM_NAV.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`cx-side-link${section === item.id ? ' is-active' : ''}`}
                  onClick={() => setSection(item.id)}
                >
                  <Icon size={16} aria-hidden="true" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div style={{ marginTop: '1rem', paddingTop: '0.9rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingInline: '0.45rem' }}>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Paciente selecionado</div>
            <strong style={{ display: 'block', fontSize: '0.9rem', marginTop: '0.15rem' }}>{activePatient?.shortName}</strong>
            <div style={{ fontSize: '0.74rem', color: '#7dd3fc', marginTop: '0.15rem' }}>
              {activePatient?.xp} XP · {activePatient?.streak}d streak
            </div>
            <button
              type="button"
              className="cx-btn cx-btn-sm cx-btn-dark-ghost cx-btn-pill"
              style={{ width: '100%', marginTop: '0.7rem' }}
              onClick={() => sendTelegramNudge(activePatient?.id)}
            >
              <Send size={13} aria-hidden="true" />
              <span>Acionar NutrIA Agora</span>
            </button>
          </div>
        </aside>

        {/* COLUNA CENTRAL: PAINÉIS MOVEFLUX (OEM.SZ26) */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem', minWidth: 0 }}>
          {section === 'cockpit' && (
            <>
              {/* LINHA SUPERIOR: TRACKING DE CONSULTA + ADERÊNCIA / MACROS */}
              <div className="cx-grid-2">
                <article className="cx-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '0.85rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--cx-muted)' }}>
                      Atendimento Ao Vivo · Teleconsulta
                    </span>
                    <div style={{ display: 'flex', gap: '0.35rem' }}>
                      <button
                        type="button"
                        className="cx-btn cx-btn-sm cx-btn-ghost"
                        style={{ padding: '0.35rem 0.55rem' }}
                        onClick={toggleSessionTimer}
                        aria-label={sessionTimer.running ? 'Pausar cronômetro' : 'Iniciar cronômetro'}
                      >
                        {sessionTimer.running ? <Pause size={14} /> : <Play size={14} />}
                      </button>
                      <button
                        type="button"
                        className="cx-btn cx-btn-sm cx-btn-ghost"
                        style={{ padding: '0.35rem 0.55rem' }}
                        onClick={resetSessionTimer}
                        aria-label="Zerar cronômetro"
                      >
                        <RotateCcw size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="cx-tabular" style={{ fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.03em' }}>
                    {formatTimer(sessionTimer.elapsedSec)}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '0.45rem' }}>
                    {[
                      { when: '5d atrás', metric: '-0,6 kg' },
                      { when: '14d atrás', metric: '94% plano' },
                      { when: '30d atrás', metric: '+1,1 kg MM' }
                    ].map((h) => (
                      <div key={h.when} style={{ padding: '0.45rem 0.55rem', borderRadius: '14px', background: '#f8fafc', border: '1px solid rgba(15,23,42,0.07)' }}>
                        <div style={{ fontSize: '0.68rem', color: 'var(--cx-muted)' }}>{h.when}</div>
                        <strong style={{ fontSize: '0.78rem' }}>{h.metric}</strong>
                      </div>
                    ))}
                  </div>
                </article>

                <article className="cx-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '0.8rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong style={{ fontSize: '0.96rem' }}>Ingestão &amp; Metas</strong>
                      <div style={{ fontSize: '0.76rem', color: 'var(--cx-muted)' }}>{activePatient?.goal}</div>
                    </div>
                    <ConicRing
                      percent={kcalPct}
                      value={activePatient?.kcalConsumed}
                      unit="kcal"
                      gradient="from-macros"
                      size={74}
                    />
                  </div>
                  <MacroPillGroup macros={activePatient?.macros} />
                </article>
              </div>

              {/* 4 MINI-CARDS BIOMÉTRICOS (ESTILO MOVEFLUX) */}
              <div className="cx-grid-2">
                <article className="cx-card cx-card-tight">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--cx-muted)' }}>Hidratação Hoje</span>
                    <Droplets size={16} color="#0284c7" aria-hidden="true" />
                  </div>
                  <strong className="cx-tabular" style={{ display: 'block', fontSize: '1.5rem', marginTop: '0.35rem' }}>
                    {activePatient?.waterMl} <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--cx-muted)' }}>/ {activePatient?.waterGoal} ml</span>
                  </strong>
                  <div style={{ height: '7px', borderRadius: '999px', background: '#e2e8f0', overflow: 'hidden', marginTop: '0.55rem' }}>
                    <div style={{ width: `${waterPct}%`, height: '100%', background: 'linear-gradient(90deg, #38bdf8, #0284c7)', borderRadius: '999px' }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.55rem' }}>
                    <span style={{ fontSize: '0.74rem', color: 'var(--cx-muted)' }}>{waterPct}% concluído</span>
                    <button type="button" className="cx-btn cx-btn-sm cx-btn-ghost cx-btn-pill" onClick={() => sendTelegramNudge(activePatient?.id, `Lembrete rápido de hidratação para ${activePatient?.shortName}: tome +250 ml agora!`)}>
                      Cobrar água
                    </button>
                  </div>
                </article>

                <article className="cx-card cx-card-tight">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--cx-muted)' }}>Sono &amp; Atividade</span>
                    <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                      <Moon size={16} color="#6366f1" aria-hidden="true" />
                      <Footprints size={16} color="#d97706" aria-hidden="true" />
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '0.35rem' }}>
                    <strong className="cx-tabular" style={{ fontSize: '1.45rem' }}>{activePatient?.sleepHours}</strong>
                    <strong className="cx-tabular" style={{ fontSize: '1.05rem', color: '#0369a1' }}>{activePatient?.steps} passos</strong>
                  </div>
                  <div style={{ height: '7px', borderRadius: '999px', background: '#e2e8f0', overflow: 'hidden', marginTop: '0.55rem' }}>
                    <div style={{ width: `${stepsPct}%`, height: '100%', background: 'linear-gradient(90deg, #818cf8, #f59e0b)', borderRadius: '999px' }} />
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--cx-muted)', marginTop: '0.55rem' }}>
                    Qualidade do sono: {activePatient?.sleepQuality} · Meta {activePatient?.stepsGoal} passos
                  </div>
                </article>
              </div>

              {/* FAIXA SEMANAL DE 7 DIAS + RADAR DE ABANDONO 360° */}
              <article className="cx-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <h2 style={{ margin: 0, fontSize: '1.12rem', fontWeight: 600 }}>Semana Clínica &amp; Radar de Abandono 360°</h2>
                    <p style={{ margin: '0.15rem 0 0', fontSize: '0.8rem', color: 'var(--cx-muted)' }}>
                      Dia selecionado: {WEEK_DAYS[selectedDayIdx]?.short} {WEEK_DAYS[selectedDayIdx]?.day} · {WEEK_DAYS[selectedDayIdx]?.adherence}% aderência média
                    </p>
                  </div>
                  <span className="cx-tag cx-tag-risk">
                    <Radar size={13} aria-hidden="true" /> {patients.filter((p) => p.riskLevel === 'high').length} riscos críticos
                  </span>
                </div>

                <div className="cx-week-strip">
                  {WEEK_DAYS.map((d, idx) => (
                    <button
                      key={d.day}
                      type="button"
                      className={`cx-day-pill${selectedDayIdx === idx ? ' is-active' : ''}`}
                      onClick={() => setSelectedDayIdx(idx)}
                    >
                      <div style={{ fontSize: '0.68rem', fontWeight: 500 }}>{d.short}</div>
                      <strong className="cx-tabular" style={{ fontSize: '0.88rem' }}>{d.day}</strong>
                    </button>
                  ))}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
                  {sortedRadarPatients.map((p) => (
                    <div
                      key={p.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '0.75rem',
                        flexWrap: 'wrap',
                        padding: '0.75rem 0.9rem',
                        borderRadius: '18px',
                        background: p.id === activePatient?.id ? 'rgba(0, 145, 255, 0.08)' : '#f8fafc',
                        border: p.id === activePatient?.id ? '1px solid rgba(0, 145, 255, 0.28)' : '1px solid rgba(15, 23, 42, 0.07)'
                      }}
                    >
                      <div style={{ minWidth: 0, flex: '1 1 200px', cursor: 'pointer' }} onClick={() => selectPatient(p.id)}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
                          <strong className="cx-truncate" style={{ fontSize: '0.88rem', maxWidth: '240px' }}>{p.name}</strong>
                          <span className={`cx-tag ${p.riskLevel === 'high' ? 'cx-tag-risk' : p.riskLevel === 'medium' ? 'cx-tag-warn' : 'cx-tag-ok'}`}>
                            {p.riskLabel} ({p.adherence}%)
                          </span>
                        </div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--cx-muted)', marginTop: '0.15rem' }}>
                          {p.lastSeen} · Água: {p.waterMl} ml
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '0.45rem' }}>
                        <button
                          type="button"
                          className="cx-btn cx-btn-sm cx-btn-ghost cx-btn-pill"
                          onClick={() => selectPatient(p.id)}
                        >
                          Focar
                        </button>
                        <button
                          type="button"
                          className="cx-btn cx-btn-sm cx-btn-primary cx-btn-pill"
                          onClick={() => sendTelegramNudge(p.id)}
                        >
                          <Send size={12} aria-hidden="true" />
                          <span>Resgate NutrIA</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </article>

              {/* GRÁFICO ESCURO DE EVOLUÇÃO BIOMÉTRICA */}
              <WeightEvolutionChart
                history={activePatient?.weightHistory}
                targetWeight={activePatient?.targetWeight}
              />
            </>
          )}

          {/* MÓDULO 02: PACIENTES & FICHA CLÍNICA REAL */}
          {section === 'patients' && (
            <article className="cx-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.2rem' }}>Carteira &amp; Ficha Clínica Completa</h2>
                  <p style={{ margin: '0.15rem 0 0', fontSize: '0.82rem', color: 'var(--cx-muted)' }}>
                    Todos os dados cadastrais reais preservados (CPF, Telegram, restrições, aversões, medicamentos e TMB/GET).
                  </p>
                </div>
                <button type="button" className="cx-btn cx-btn-primary cx-btn-pill" onClick={() => setShowModal(true)}>
                  <Plus size={15} aria-hidden="true" />
                  <span>Novo Paciente</span>
                </button>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <input
                  className="cx-input"
                  style={{ flex: '1 1 220px' }}
                  placeholder="Buscar por nome, CPF ou objetivo clínico..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {[
                  { id: 'all', label: 'Todos' },
                  { id: 'high', label: 'Risco Alto' },
                  { id: 'medium', label: 'Atenção' },
                  { id: 'low', label: 'Em Dia' }
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    className={`cx-btn cx-btn-sm cx-btn-pill ${riskFilter === f.id ? 'cx-btn-primary' : 'cx-btn-ghost'}`}
                    onClick={() => setRiskFilter(f.id)}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
                {filteredPatients.map((p) => (
                  <div
                    key={p.id}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.55rem',
                      padding: '0.9rem 1rem',
                      borderRadius: '18px',
                      background: '#f8fafc',
                      border: p.id === activePatient?.id ? '1.5px solid #0070d1' : '1px solid rgba(15,23,42,0.08)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.8rem', flexWrap: 'wrap' }}>
                      <div style={{ minWidth: 0, flex: '1 1 240px' }}>
                        <strong className="cx-truncate" style={{ display: 'block', fontSize: '0.94rem' }}>{p.name}</strong>
                        <div style={{ fontSize: '0.78rem', color: 'var(--cx-muted)' }}>
                          {p.goal} · CPF: {p.cpf || '—'} · Tel: {p.phone || '—'}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
                        <span className={`cx-tag ${p.riskLevel === 'high' ? 'cx-tag-risk' : p.riskLevel === 'medium' ? 'cx-tag-warn' : 'cx-tag-ok'}`}>
                          {p.adherence}% adesão
                        </span>
                        <button
                          type="button"
                          className="cx-btn cx-btn-sm cx-btn-ghost"
                          onClick={() => {
                            selectPatient(p.id);
                            setSection('plans');
                            setConsultStep('anamnesis');
                          }}
                        >
                          <ClipboardList size={13} aria-hidden="true" />
                          <span>Nova Consulta</span>
                        </button>
                        <button
                          type="button"
                          className="cx-btn cx-btn-sm cx-btn-ghost"
                          onClick={() => {
                            selectPatient(p.id);
                            setSection('plans');
                            setConsultStep('exams');
                          }}
                        >
                          <Upload size={13} aria-hidden="true" />
                          <span>Subir Exame</span>
                        </button>
                        <button type="button" className="cx-btn cx-btn-sm cx-btn-primary" onClick={() => sendTelegramNudge(p.id)}>
                          Acionar Bot
                        </button>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', fontSize: '0.73rem', color: '#334155', paddingTop: '0.45rem', borderTop: '1px dashed rgba(15,23,42,0.09)' }}>
                      <span><strong>Restrições:</strong> {p.restrictions || 'Nenhuma'}</span>
                      <span>·</span>
                      <span><strong>Aversões:</strong> {p.aversions || 'Nenhuma'}</span>
                      <span>·</span>
                      <span><strong>Medicações:</strong> {p.medications || 'Nenhuma'}</span>
                      {p.physicalEval?.get > 0 && (
                        <>
                          <span>·</span>
                          <span className="cx-tabular"><strong>TMB/GET:</strong> {p.physicalEval.tmb} / {p.physicalEval.get} kcal</span>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </article>
          )}

          {/* MÓDULO 03: CONSULTA EM 4 ETAPAS (ANAMNESE + TMB/GET + EXAMES + PLANO TACO) */}
          {section === 'plans' && (
            <>
              <article className="cx-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.95rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.6rem' }}>
                  <div>
                    <h2 style={{ margin: 0, fontSize: '1.18rem' }}>Fluxo de Consulta &amp; Registro Clínico · {activePatient?.shortName}</h2>
                    <p style={{ margin: '0.15rem 0 0', fontSize: '0.82rem', color: 'var(--cx-muted)' }}>
                      Forma original de registrar informações mantida integralmente, agora com cálculo instantâneo e visual Clarix.
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                    {[
                      { id: 'anamnesis', label: '1. Anamnese' },
                      { id: 'physical', label: '2. Avaliação & TMB/GET' },
                      { id: 'exams', label: '3. Subir Exame PDF' },
                      { id: 'diet', label: '4. Cardápio TACO & Treino' }
                    ].map((st) => (
                      <button
                        key={st.id}
                        type="button"
                        className={`cx-btn cx-btn-sm cx-btn-pill ${consultStep === st.id ? 'cx-btn-primary' : 'cx-btn-ghost'}`}
                        onClick={() => setConsultStep(st.id)}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* ETAPA 1: ANAMNESE ESTRUTURADA */}
                {consultStep === 'anamnesis' && (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      saveConsultationRecord(activePatient?.id, { anamnesis: anamnesisForm, physicalEval: physForm });
                      setConsultStep('physical');
                    }}
                    style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}
                  >
                    <div className="cx-grid-2">
                      <div>
                        <label htmlFor="cx-ana-routine" style={{ display: 'block', fontSize: '0.76rem', fontWeight: 600, marginBottom: '0.25rem' }}>Rotina &amp; Horários de Treino/Trabalho</label>
                        <input
                          id="cx-ana-routine"
                          className="cx-input"
                          value={anamnesisForm.routine || ''}
                          onChange={(e) => setAnamnesisForm((prev) => ({ ...prev, routine: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label htmlFor="cx-ana-sleep" style={{ display: 'block', fontSize: '0.76rem', fontWeight: 600, marginBottom: '0.25rem' }}>Qualidade do Sono</label>
                        <input
                          id="cx-ana-sleep"
                          className="cx-input"
                          value={anamnesisForm.sleep || ''}
                          onChange={(e) => setAnamnesisForm((prev) => ({ ...prev, sleep: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label htmlFor="cx-ana-digestion" style={{ display: 'block', fontSize: '0.76rem', fontWeight: 600, marginBottom: '0.25rem' }}>Intestino &amp; Digestão</label>
                        <input
                          id="cx-ana-digestion"
                          className="cx-input"
                          value={anamnesisForm.digestion || ''}
                          onChange={(e) => setAnamnesisForm((prev) => ({ ...prev, digestion: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label htmlFor="cx-ana-hydration" style={{ display: 'block', fontSize: '0.76rem', fontWeight: 600, marginBottom: '0.25rem' }}>Hidratação &amp; Álcool</label>
                        <input
                          id="cx-ana-hydration"
                          className="cx-input"
                          value={anamnesisForm.hydration || ''}
                          onChange={(e) => setAnamnesisForm((prev) => ({ ...prev, hydration: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="cx-ana-notes" style={{ display: 'block', fontSize: '0.76rem', fontWeight: 600, marginBottom: '0.25rem' }}>Conduta &amp; Observações Clínicas</label>
                      <input
                        id="cx-ana-notes"
                        className="cx-input"
                        value={anamnesisForm.notes || ''}
                        onChange={(e) => setAnamnesisForm((prev) => ({ ...prev, notes: e.target.value }))}
                      />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.76rem', color: 'var(--cx-muted)' }}>
                        Restrições: <strong>{activePatient?.restrictions}</strong> · Medicação: <strong>{activePatient?.medications}</strong>
                      </span>
                      <button type="submit" className="cx-btn cx-btn-primary cx-btn-sm">
                        Salvar Anamnese &amp; Avançar →
                      </button>
                    </div>
                  </form>
                )}

                {/* ETAPA 2: AVALIAÇÃO FÍSICA + MIFFLIN-ST JEOR TMB/GET */}
                {consultStep === 'physical' && (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      saveConsultationRecord(activePatient?.id, { anamnesis: anamnesisForm, physicalEval: physForm });
                    }}
                    style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
                  >
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '0.55rem' }}>
                      <div>
                        <label htmlFor="cx-eval-weight" style={{ display: 'block', fontSize: '0.74rem', fontWeight: 600, marginBottom: '0.2rem' }}>Peso (kg)</label>
                        <input id="cx-eval-weight" type="number" step="0.1" className="cx-input" value={physForm.weight || ''} onChange={(e) => setPhysForm((p) => ({ ...p, weight: e.target.value }))} />
                      </div>
                      <div>
                        <label htmlFor="cx-eval-height" style={{ display: 'block', fontSize: '0.74rem', fontWeight: 600, marginBottom: '0.2rem' }}>Altura (cm)</label>
                        <input id="cx-eval-height" type="number" className="cx-input" value={physForm.height || ''} onChange={(e) => setPhysForm((p) => ({ ...p, height: e.target.value }))} />
                      </div>
                      <div>
                        <label htmlFor="cx-eval-age" style={{ display: 'block', fontSize: '0.74rem', fontWeight: 600, marginBottom: '0.2rem' }}>Idade</label>
                        <input id="cx-eval-age" type="number" className="cx-input" value={physForm.age || ''} onChange={(e) => setPhysForm((p) => ({ ...p, age: e.target.value }))} />
                      </div>
                      <div>
                        <label htmlFor="cx-eval-gender" style={{ display: 'block', fontSize: '0.74rem', fontWeight: 600, marginBottom: '0.2rem' }}>Sexo</label>
                        <select id="cx-eval-gender" className="cx-select" value={physForm.gender || 'F'} onChange={(e) => setPhysForm((p) => ({ ...p, gender: e.target.value }))}>
                          <option value="F">Feminino</option>
                          <option value="M">Masculino</option>
                        </select>
                      </div>
                      <div>
                        <label htmlFor="cx-eval-fat" style={{ display: 'block', fontSize: '0.74rem', fontWeight: 600, marginBottom: '0.2rem' }}>% Gordura</label>
                        <input id="cx-eval-fat" type="number" step="0.1" className="cx-input" value={physForm.bodyFat || ''} onChange={(e) => setPhysForm((p) => ({ ...p, bodyFat: e.target.value }))} />
                      </div>
                      <div>
                        <label htmlFor="cx-eval-lean" style={{ display: 'block', fontSize: '0.74rem', fontWeight: 600, marginBottom: '0.2rem' }}>Massa Magra (kg)</label>
                        <input id="cx-eval-lean" type="number" step="0.1" className="cx-input" value={physForm.muscleMass || ''} onChange={(e) => setPhysForm((p) => ({ ...p, muscleMass: e.target.value }))} />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '0.6rem', alignItems: 'end' }}>
                      <div>
                        <label htmlFor="cx-eval-act" style={{ display: 'block', fontSize: '0.74rem', fontWeight: 600, marginBottom: '0.2rem' }}>Fator de Atividade (GET)</label>
                        <select id="cx-eval-act" className="cx-select" value={physForm.activityLevel || '1.55'} onChange={(e) => setPhysForm((p) => ({ ...p, activityLevel: e.target.value }))}>
                          {ACTIVITY_LEVELS.map((lvl) => (
                            <option key={lvl.value} value={lvl.value}>{lvl.label}</option>
                          ))}
                        </select>
                      </div>
                      <div style={{ padding: '0.65rem 0.85rem', borderRadius: '14px', background: '#eff6ff', border: '1px solid #bfdbfe' }}>
                        <div style={{ fontSize: '0.7rem', color: '#1d4ed8', fontWeight: 700 }}>TMB (Mifflin-St Jeor)</div>
                        <strong className="cx-tabular" style={{ fontSize: '1.1rem' }}>{liveCalc.tmb} kcal/dia</strong>
                      </div>
                      <div style={{ padding: '0.65rem 0.85rem', borderRadius: '14px', background: '#ecfdf5', border: '1px solid #a7f3d0' }}>
                        <div style={{ fontSize: '0.7rem', color: '#047857', fontWeight: 700 }}>GET Estimado</div>
                        <strong className="cx-tabular" style={{ fontSize: '1.1rem' }}>{liveCalc.get} kcal/dia</strong>
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                      <button type="submit" className="cx-btn cx-btn-primary cx-btn-sm">
                        Salvar Avaliação &amp; Recalcular Meta
                      </button>
                    </div>
                  </form>
                )}

                {/* ETAPA 3: SUBIR EXAME PDF/IMAGEM + PARECER DA NUTRI */}
                {consultStep === 'exams' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.6rem', padding: '0.85rem', borderRadius: '16px', background: '#f0f9ff', border: '1px dashed #38bdf8' }}>
                      <div>
                        <strong style={{ fontSize: '0.88rem', display: 'block' }}>Subir Exame Laboratorial (PDF ou Imagem)</strong>
                        <span style={{ fontSize: '0.76rem', color: 'var(--cx-muted)' }}>
                          Anexe o arquivo real do paciente para a NutrIA extrair biomarcadores ou rode a demonstração instantânea.
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap', alignItems: 'center' }}>
                        <label className="cx-btn cx-btn-primary cx-btn-sm cx-btn-pill" style={{ cursor: 'pointer' }}>
                          <Upload size={13} aria-hidden="true" />
                          <span>Anexar PDF/Imagem</span>
                          <input
                            type="file"
                            accept=".pdf,image/*"
                            style={{ display: 'none' }}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) runLabExamScan(activePatient?.id, { filename: file.name });
                              e.target.value = '';
                            }}
                          />
                        </label>
                        <button type="button" className="cx-btn cx-btn-accent cx-btn-sm cx-btn-pill" onClick={() => runLabExamScan(activePatient?.id)}>
                          <FileSearch size={14} aria-hidden="true" />
                          <span>Simular Leitura PDF</span>
                        </button>
                      </div>
                    </div>

                    {botMood === 'scanning' && (
                      <div className="cx-scan-stage" style={{ minHeight: '52px', display: 'flex', alignItems: 'center' }}>
                        <div className="cx-scan-beam" aria-hidden="true" />
                        <strong style={{ fontSize: '0.84rem', color: '#0369a1' }}>Extraindo marcadores bioquímicos com a NutrIA...</strong>
                      </div>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
                      {(activePatient?.labExams || []).map((ex) => {
                        const draftVal = parecerDrafts[ex.name] !== undefined ? parecerDrafts[ex.name] : (ex.parecer || '');
                        return (
                          <div key={ex.name} style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', padding: '0.75rem 0.9rem', borderRadius: '16px', background: '#f8fafc', border: '1px solid rgba(15,23,42,0.08)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                              <div>
                                <strong style={{ fontSize: '0.86rem' }}>{ex.name}</strong>
                                <div style={{ fontSize: '0.74rem', color: 'var(--cx-muted)' }}>{ex.note}</div>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                                <strong className="cx-tabular" style={{ fontSize: '0.86rem' }}>{ex.value}</strong>
                                <span className="cx-tag cx-tag-info">{ex.status}</span>
                              </div>
                            </div>
                            <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap', paddingTop: '0.35rem', borderTop: '1px dashed rgba(15,23,42,0.08)' }}>
                              <input
                                className="cx-input"
                                style={{ flex: '1 1 220px', fontSize: '0.76rem' }}
                                placeholder="Parecer do nutricionista (visível no App do Paciente)..."
                                value={draftVal}
                                onChange={(e) => setParecerDrafts((prev) => ({ ...prev, [ex.name]: e.target.value }))}
                                aria-label={`Parecer clínico para ${ex.name}`}
                              />
                              <button
                                type="button"
                                className="cx-btn cx-btn-sm cx-btn-ghost"
                                onClick={() => updateExamParecer(activePatient?.id, ex.name, draftVal)}
                              >
                                Salvar Parecer
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* ETAPA 4: CARDÁPIO TACO & TREINO */}
                {consultStep === 'diet' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {MEAL_PLAN_PRESETS.map((pr) => (
                        <button
                          key={pr.id}
                          type="button"
                          className="cx-btn cx-btn-accent cx-btn-sm cx-btn-pill"
                          onClick={() => publishMealPreset(activePatient?.id, pr.id)}
                        >
                          Publicar IA: {pr.label}
                        </button>
                      ))}
                    </div>

                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        addCustomMeal(activePatient?.id, { slot: customSlot, name: customMealName, prep: customPrep });
                        setCustomMealName('');
                        setCustomPrep('');
                      }}
                      style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', paddingTop: '0.65rem', borderTop: '1px solid var(--cx-line)' }}
                    >
                      <strong style={{ fontSize: '0.84rem' }}>Adicionar refeição avulsa (Tabela TACO) no app de {activePatient?.shortName}</strong>
                      <div className="cx-grid-2">
                        <input className="cx-input" value={customSlot} onChange={(e) => setCustomSlot(e.target.value)} aria-label="Horário da refeição" />
                        <input className="cx-input" placeholder="Ex.: Iogurte proteico com frutas" value={customMealName} onChange={(e) => setCustomMealName(e.target.value)} aria-label="Nome da refeição" />
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <input className="cx-input" style={{ flex: '1 1 240px' }} placeholder="Modo de preparo..." value={customPrep} onChange={(e) => setCustomPrep(e.target.value)} aria-label="Modo de preparo" />
                        <button type="submit" className="cx-btn cx-btn-primary">
                          <Plus size={14} aria-hidden="true" /> Publicar Refeição no App
                        </button>
                      </div>
                    </form>

                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        addWorkoutItem(activePatient?.id, { title: workoutTitle, detail: workoutDetail });
                        setWorkoutTitle('');
                      }}
                      style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem', paddingTop: '0.65rem', borderTop: '1px solid var(--cx-line)' }}
                    >
                      <strong style={{ fontSize: '0.84rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Dumbbell size={14} color="#0369a1" aria-hidden="true" /> Prescrever Treino (sincroniza com aba Plano do Paciente)
                      </strong>
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <input className="cx-input" style={{ flex: '1 1 180px' }} placeholder="Ex.: Treino C · Glúteos & Posterior" value={workoutTitle} onChange={(e) => setWorkoutTitle(e.target.value)} aria-label="Título do treino" />
                        <input className="cx-input" style={{ flex: '1 1 180px' }} placeholder="Duração / Observação" value={workoutDetail} onChange={(e) => setWorkoutDetail(e.target.value)} aria-label="Detalhes do treino" />
                        <button type="submit" className="cx-btn cx-btn-ghost cx-btn-sm">Publicar Treino</button>
                      </div>
                    </form>
                  </div>
                )}
              </article>
            </>
          )}

          {/* MÓDULO 04: AGENDA SEMANAL (PRESENCIAL/ONLINE) + FINANCEIRO CRM */}
          {section === 'schedule' && (
            <>
              <article className="cx-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <h2 style={{ margin: 0, fontSize: '1.18rem' }}>Agenda Semanal da Clínica</h2>
                    <p style={{ margin: '0.15rem 0 0', fontSize: '0.8rem', color: 'var(--cx-muted)' }}>
                      Presencial ou Teleconsulta com link público de agendamento `/agendar/:nutriId` mantido integralmente.
                    </p>
                  </div>
                  <button
                    type="button"
                    className="cx-btn cx-btn-sm cx-btn-ghost cx-btn-pill"
                    onClick={async () => {
                      const url = `${window.location.origin}/agendar/dra-nutrivvo`;
                      try {
                        await navigator.clipboard?.writeText(url);
                      } catch {
                        // ignore clipboard restriction
                      }
                      toast.success(`Link público da agenda: ${url}`);
                    }}
                  >
                    <Copy size={13} aria-hidden="true" />
                    <span>Copiar Link Público (/agendar)</span>
                  </button>
                </div>

                {/* FILTRO DE GRADE SEMANAL */}
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    className={`cx-btn cx-btn-sm cx-btn-pill ${scheduleDayFilter === 'all' ? 'cx-btn-primary' : 'cx-btn-ghost'}`}
                    onClick={() => setScheduleDayFilter('all')}
                  >
                    Semana Completa ({appointments.length})
                  </button>
                  {WEEK_DAYS.map((d) => {
                    const key = `${d.short} ${d.day}`;
                    const count = appointments.filter((a) => a.day === key).length;
                    return (
                      <button
                        key={key}
                        type="button"
                        className={`cx-btn cx-btn-sm cx-btn-pill ${scheduleDayFilter === key ? 'cx-btn-primary' : 'cx-btn-ghost'}`}
                        onClick={() => setScheduleDayFilter(key)}
                      >
                        {key} ({count})
                      </button>
                    );
                  })}
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    addAppointment({
                      day: apptDay,
                      time: apptTime,
                      patientId: apptPatientId || activePatient?.id,
                      type: apptType,
                      locationType: apptLocationType,
                      meetingLink: apptMeetingLink
                    });
                    setApptMeetingLink('');
                  }}
                  style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem', padding: '0.85rem', borderRadius: '16px', background: '#f8fafc', border: '1px solid rgba(15,23,42,0.08)' }}
                >
                  <strong style={{ fontSize: '0.84rem' }}>Novo Agendamento</strong>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <select className="cx-select" style={{ flex: '1 1 180px' }} value={apptPatientId} onChange={(e) => setApptPatientId(e.target.value)} aria-label="Paciente da consulta">
                      {patients.map((p) => (
                        <option key={p.id} value={p.id}>{p.shortName}</option>
                      ))}
                    </select>
                    <select className="cx-select" style={{ width: 'auto' }} value={apptDay} onChange={(e) => setApptDay(e.target.value)} aria-label="Dia da consulta">
                      {WEEK_DAYS.map((d) => <option key={d.day} value={`${d.short} ${d.day}`}>{d.short} {d.day}</option>)}
                    </select>
                    <input className="cx-input" style={{ width: '90px' }} value={apptTime} onChange={(e) => setApptTime(e.target.value)} aria-label="Horário" />
                    <select className="cx-select" style={{ width: 'auto' }} value={apptLocationType} onChange={(e) => setApptLocationType(e.target.value)} aria-label="Modalidade">
                      <option value="local">Presencial</option>
                      <option value="online">Teleconsulta (Online)</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <input className="cx-input" style={{ flex: '1 1 190px' }} value={apptType} onChange={(e) => setApptType(e.target.value)} aria-label="Tipo de consulta" placeholder="Tipo (Retorno, Primeira Consulta, Bioimpedância...)" />
                    {apptLocationType === 'online' && (
                      <input className="cx-input" style={{ flex: '1 1 200px' }} value={apptMeetingLink} onChange={(e) => setApptMeetingLink(e.target.value)} aria-label="Link da teleconsulta" placeholder="https://meet.jit.si/sala (opcional)" />
                    )}
                    <button type="submit" className="cx-btn cx-btn-primary cx-btn-sm">Agendar Consulta</button>
                  </div>
                </form>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {filteredAppointments.map((a) => (
                    <div
                      key={a.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '0.6rem',
                        flexWrap: 'wrap',
                        padding: '0.72rem 0.9rem',
                        borderRadius: '16px',
                        background: a.status === 'confirmado' ? '#ecfdf5' : a.status === 'proximo' ? '#fff7ed' : '#f8fafc',
                        border: '1px solid rgba(15,23,42,0.08)'
                      }}
                    >
                      <div>
                        <strong style={{ fontSize: '0.88rem' }}>{a.day} · {a.time} — {a.patientName}</strong>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap', fontSize: '0.76rem', color: 'var(--cx-muted)', marginTop: '0.12rem' }}>
                          <span>{a.type}</span>
                          <span>·</span>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem', color: a.locationType === 'online' ? '#0369a1' : '#334155', fontWeight: 600 }}>
                            {a.locationType === 'online' ? <Video size={12} aria-hidden="true" /> : <MapPin size={12} aria-hidden="true" />}
                            {a.locationType === 'online' ? 'Teleconsulta' : 'Presencial'}
                          </span>
                          {a.meetingLink && (
                            <span style={{ fontFamily: 'var(--cx-font-mono)', fontSize: '0.7rem', color: '#0369a1' }}>
                              ({a.meetingLink})
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        type="button"
                        className={`cx-tag ${a.status === 'confirmado' ? 'cx-tag-ok' : a.status === 'proximo' ? 'cx-tag-warn' : 'cx-tag-purple'}`}
                        style={{ border: 0, cursor: 'pointer' }}
                        onClick={() => toggleAppointmentStatus(a.id)}
                      >
                        {a.status}
                      </button>
                    </div>
                  ))}
                </div>
              </article>
            </>
          )}

          {/* MÓDULO 05: BIBLIOTECA DE RECEITAS */}
          {section === 'recipes' && (
            <article className="cx-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.95rem' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.18rem' }}>Biblioteca de Receitas da Clínica</h2>
                <p style={{ margin: '0.15rem 0 0', fontSize: '0.82rem', color: 'var(--cx-muted)' }}>
                  Cadastre receitas funcionais e compartilhe diretamente na aba Plano do App do Paciente.
                </p>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  addRecipeToLibrary({
                    title: recTitle,
                    category: recCategory,
                    kcal: recKcal,
                    prep: recPrep,
                    sendToPatient: true
                  });
                  setRecTitle('');
                  setRecPrep('');
                }}
                style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem', padding: '0.85rem', borderRadius: '16px', background: '#f8fafc', border: '1px solid rgba(15,23,42,0.08)' }}
              >
                <strong style={{ fontSize: '0.84rem' }}>Nova Receita Bônus</strong>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <input className="cx-input" style={{ flex: '2 1 200px' }} placeholder="Nome da receita (ex.: Muffin Proteico de Aveia)" value={recTitle} onChange={(e) => setRecTitle(e.target.value)} aria-label="Nome da receita" />
                  <input className="cx-input" style={{ flex: '1 1 130px' }} value={recCategory} onChange={(e) => setRecCategory(e.target.value)} aria-label="Categoria" />
                  <input className="cx-input" type="number" style={{ width: '100px' }} value={recKcal} onChange={(e) => setRecKcal(e.target.value)} aria-label="Calorias" />
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <input className="cx-input" style={{ flex: '1 1 240px' }} placeholder="Ingredientes e modo de preparo..." value={recPrep} onChange={(e) => setRecPrep(e.target.value)} aria-label="Modo de preparo da receita" />
                  <button type="submit" className="cx-btn cx-btn-primary cx-btn-sm">Salvar &amp; Enviar ao App</button>
                </div>
              </form>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
                {(recipes || []).map((rec) => (
                  <div key={rec.id} style={{ padding: '0.8rem 0.95rem', borderRadius: '16px', background: '#f8fafc', border: '1px solid rgba(15,23,42,0.07)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <strong style={{ fontSize: '0.9rem' }}>{rec.title}</strong>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <span className="cx-tag cx-tag-info">{rec.category}</span>
                        <span className="cx-tag cx-tag-ok cx-tabular">{rec.kcal} kcal</span>
                      </div>
                    </div>
                    <div style={{ fontSize: '0.77rem', color: 'var(--cx-muted)', marginTop: '0.25rem' }}>{rec.prep}</div>
                  </div>
                ))}
              </div>
            </article>
          )}

          {/* MÓDULO 06: FINANCEIRO & PLANOS */}
          {section === 'finance' && (
            <>
              <article className="cx-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <Wallet size={18} color="#0369a1" aria-hidden="true" />
                  <h2 style={{ margin: 0, fontSize: '1.15rem' }}>Financeiro CRM</h2>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '0.65rem' }}>
                  <div style={{ padding: '0.75rem', borderRadius: '16px', background: '#ecfdf5', border: '1px solid #a7f3d0' }}>
                    <div style={{ fontSize: '0.72rem', color: '#065f46' }}>Recebido</div>
                    <strong className="cx-tabular" style={{ fontSize: '1rem' }}>{formatBRL(paidSum)}</strong>
                  </div>
                  <div style={{ padding: '0.75rem', borderRadius: '16px', background: '#fff1f2', border: '1px solid #fecdd3' }}>
                    <div style={{ fontSize: '0.72rem', color: '#9f1239' }}>Pendente</div>
                    <strong className="cx-tabular" style={{ fontSize: '1rem' }}>{formatBRL(pendingSum)}</strong>
                  </div>
                  <div style={{ padding: '0.75rem', borderRadius: '16px', background: '#f8fafc', border: '1px solid rgba(15,23,42,0.08)' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--cx-muted)' }}>Ticket Médio</div>
                    <strong className="cx-tabular" style={{ fontSize: '1rem' }}>{formatBRL(avgTicket)}</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {patients.map((p) => (
                    <div
                      key={p.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '0.6rem',
                        flexWrap: 'wrap',
                        padding: '0.68rem 0.9rem',
                        borderRadius: '16px',
                        background: '#f8fafc',
                        border: '1px solid rgba(15,23,42,0.07)'
                      }}
                    >
                      <div>
                        <strong style={{ fontSize: '0.86rem' }}>{p.shortName}</strong>
                        <div className="cx-tabular" style={{ fontSize: '0.76rem', color: 'var(--cx-muted)' }}>{formatBRL(p.invoiceValue)}</div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.45rem', alignItems: 'center' }}>
                        <span className={`cx-tag ${p.invoiceStatus === 'pago' ? 'cx-tag-ok' : 'cx-tag-risk'}`}>
                          {p.invoiceStatus}
                        </span>
                        <button
                          type="button"
                          className="cx-btn cx-btn-sm cx-btn-primary"
                          onClick={() => toggleInvoiceStatus(p.id)}
                        >
                          {p.invoiceStatus === 'pago' ? 'Reabrir' : 'Marcar Pago'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </article>
            </>
          )}

          {/* MÓDULO 07: CONFIGURAÇÕES DA CLÍNICA & SECRETÁRIA 24H */}
          {section === 'settings' && (
            <article className="cx-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.95rem' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.18rem' }}>Configurações da Clínica &amp; Canais</h2>
                <p style={{ margin: '0.15rem 0 0', fontSize: '0.82rem', color: 'var(--cx-muted)' }}>
                  Identidade profissional (CRN), horários da agenda e integração com Telegram/WhatsApp.
                </p>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  updateClinicSettings(settingsForm);
                }}
                style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}
              >
                <div className="cx-grid-2">
                  <div>
                    <label htmlFor="cx-cfg-clinic" style={{ display: 'block', fontSize: '0.76rem', fontWeight: 600, marginBottom: '0.25rem' }}>Nome da Clínica / Profissional</label>
                    <input
                      id="cx-cfg-clinic"
                      className="cx-input"
                      value={settingsForm.clinicName || ''}
                      onChange={(e) => setSettingsForm((s) => ({ ...s, clinicName: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label htmlFor="cx-cfg-crn" style={{ display: 'block', fontSize: '0.76rem', fontWeight: 600, marginBottom: '0.25rem' }}>Registro CRN</label>
                    <input
                      id="cx-cfg-crn"
                      className="cx-input"
                      value={settingsForm.crn || ''}
                      onChange={(e) => setSettingsForm((s) => ({ ...s, crn: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label htmlFor="cx-cfg-hours" style={{ display: 'block', fontSize: '0.76rem', fontWeight: 600, marginBottom: '0.25rem' }}>Dias e Horários de Atendimento</label>
                    <input
                      id="cx-cfg-hours"
                      className="cx-input"
                      value={settingsForm.workDays || ''}
                      onChange={(e) => setSettingsForm((s) => ({ ...s, workDays: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label htmlFor="cx-cfg-slot" style={{ display: 'block', fontSize: '0.76rem', fontWeight: 600, marginBottom: '0.25rem' }}>Duração padrão da consulta (min)</label>
                    <input
                      id="cx-cfg-slot"
                      type="number"
                      className="cx-input"
                      value={settingsForm.slotMinutes || 45}
                      onChange={(e) => setSettingsForm((s) => ({ ...s, slotMinutes: Number(e.target.value) || 45 }))}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap', padding: '0.75rem', borderRadius: '14px', background: '#f8fafc', border: '1px solid rgba(15,23,42,0.08)' }}>
                  <span className="cx-tag cx-tag-ok">Telegram Bot 24h: Ativo</span>
                  <span className="cx-tag cx-tag-ok">WhatsApp Secretária: Conectado</span>
                  <span className="cx-tag cx-tag-info">Radar de Abandono 360°: Diário 08h</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button type="submit" className="cx-btn cx-btn-primary cx-btn-sm">Salvar Configurações</button>
                </div>
              </form>
            </article>
          )}
        </section>

        {/* COLUNA DIREITA: NutrIA CO-PILOTO + FEED SINCRONIZADO */}
        <aside className="cx-crm-bot-col" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }} aria-label="NutrIA Co-Piloto e Atividades">
          <div className="cx-iridescent-stage">
            <ClarixRobotCanvas
              mood={botMood}
              pulseKey={botPulseCount}
              height={245}
              onRobotClick={() =>
                setBotMood(
                  botMood === 'thinking' ? 'celebrating' : 'thinking',
                  `Briefing rápido de ${activePatient?.shortName}: ${activePatient?.adherence}% de aderência, meta ${activePatient?.kcalTarget} kcal e último registro "${activePatient?.lastSeen}".`
                )
              }
            />

            <div className="cx-speech-bubble" style={{ marginTop: '0.5rem' }}>
              <div style={{ fontFamily: 'var(--cx-font-mono)', fontSize: '0.65rem', color: '#0369a1', marginBottom: '0.2rem' }}>
                NutrIA · CO-PILOTO CLÍNICO ({activePatient?.shortName})
              </div>
              <div>{botSpeech}</div>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.65rem' }}>
              <button type="button" className="cx-btn cx-btn-sm cx-btn-ghost cx-btn-pill" onClick={() => sendBotMessage(activePatient?.id, 'Resuma riscos do Radar 360 hoje', 'nutri')}>
                Resumo Radar
              </button>
              <button type="button" className="cx-btn cx-btn-sm cx-btn-ghost cx-btn-pill" onClick={() => runLabExamScan(activePatient?.id)}>
                Ler Exame IA
              </button>
              <button type="button" className="cx-btn cx-btn-sm cx-btn-ghost cx-btn-pill" onClick={() => sendTelegramNudge(activePatient?.id)}>
                Enviar Nudge
              </button>
            </div>

            <form onSubmit={handleBotSubmit} style={{ display: 'flex', gap: '0.4rem', marginTop: '0.6rem' }}>
              <label htmlFor="crm-bot-input" style={{ position: 'absolute', left: '-9999px' }}>
                Comando clínico para a NutrIA
              </label>
              <input
                id="crm-bot-input"
                className="cx-input"
                placeholder="Comando à NutrIA..."
                value={crmPrompt}
                onChange={(e) => setCrmPrompt(e.target.value)}
              />
              <button type="submit" className="cx-btn cx-btn-primary" aria-label="Enviar comando à NutrIA">
                <Bot size={15} aria-hidden="true" />
              </button>
            </form>
          </div>

          {/* FEED DE ATIVIDADES RECENTES MOVEFLUX */}
          <article className="cx-card cx-card-tight">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
              <strong style={{ fontSize: '0.92rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                <Activity size={15} color="#0070d1" aria-hidden="true" /> Feed Sincronizado
              </strong>
              <span className="cx-tag cx-tag-info">AO VIVO</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
              {syncLog.slice(0, 5).map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: '0.55rem',
                    fontSize: '0.78rem',
                    paddingTop: '0.45rem',
                    borderTop: '1px solid var(--cx-line)'
                  }}
                >
                  <span style={{ color: 'var(--cx-ink)' }}>{item.text}</span>
                  <span className="cx-tabular" style={{ fontFamily: 'var(--cx-font-mono)', fontSize: '0.68rem', color: 'var(--cx-muted)', flexShrink: 0 }}>
                    {item.time}
                  </span>
                </div>
              ))}
            </div>
          </article>
        </aside>
      </div>

      {/* MODAL FROSTED NOVO PACIENTE (CADASTRO CLÍNICO COMPLETO) */}
      {showModal && (
        <div className="cx-modal-backdrop" onClick={() => setShowModal(false)}>
          <form className="cx-modal" style={{ maxWidth: '580px', maxHeight: '90vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()} onSubmit={handleCreatePatient}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.18rem' }}>Cadastrar Novo Paciente</h2>
                <span style={{ fontSize: '0.75rem', color: 'var(--cx-muted)' }}>Campos completos preservados do CRM (CPF, Telegram e restrições).</span>
              </div>
              <button type="button" className="cx-btn cx-btn-sm cx-btn-ghost" onClick={() => setShowModal(false)} aria-label="Fechar modal">
                <X size={15} />
              </button>
            </div>
            <div className="cx-grid-2">
              <div>
                <label htmlFor="cx-pat-name" style={{ display: 'block', fontSize: '0.76rem', fontWeight: 600, marginBottom: '0.25rem' }}>Nome completo *</label>
                <input id="cx-pat-name" className="cx-input" placeholder="Ex.: Clara Teixeira Souza" value={patName} onChange={(e) => setPatName(e.target.value)} autoFocus required />
              </div>
              <div>
                <label htmlFor="cx-pat-cpf" style={{ display: 'block', fontSize: '0.76rem', fontWeight: 600, marginBottom: '0.25rem' }}>CPF</label>
                <input id="cx-pat-cpf" className="cx-input" placeholder="000.000.000-00" value={patCpf} onChange={(e) => setPatCpf(e.target.value)} />
              </div>
              <div>
                <label htmlFor="cx-pat-phone" style={{ display: 'block', fontSize: '0.76rem', fontWeight: 600, marginBottom: '0.25rem' }}>Telefone (Telegram)</label>
                <input id="cx-pat-phone" className="cx-input" placeholder="(11) 99999-9999" value={patPhone} onChange={(e) => setPatPhone(e.target.value)} />
              </div>
              <div>
                <label htmlFor="cx-pat-email" style={{ display: 'block', fontSize: '0.76rem', fontWeight: 600, marginBottom: '0.25rem' }}>E-mail</label>
                <input id="cx-pat-email" type="email" className="cx-input" placeholder="paciente@email.com" value={patEmail} onChange={(e) => setPatEmail(e.target.value)} />
              </div>
              <div>
                <label htmlFor="cx-pat-birth" style={{ display: 'block', fontSize: '0.76rem', fontWeight: 600, marginBottom: '0.25rem' }}>Nascimento</label>
                <input id="cx-pat-birth" type="date" className="cx-input" value={patBirthDate} onChange={(e) => setPatBirthDate(e.target.value)} />
              </div>
              <div>
                <label htmlFor="cx-pat-gender" style={{ display: 'block', fontSize: '0.76rem', fontWeight: 600, marginBottom: '0.25rem' }}>Sexo biológico</label>
                <select id="cx-pat-gender" className="cx-select" value={patGender} onChange={(e) => setPatGender(e.target.value)}>
                  <option value="F">Feminino</option>
                  <option value="M">Masculino</option>
                </select>
              </div>
              <div>
                <label htmlFor="cx-pat-goal" style={{ display: 'block', fontSize: '0.76rem', fontWeight: 600, marginBottom: '0.25rem' }}>Objetivo clínico</label>
                <input id="cx-pat-goal" className="cx-input" placeholder="Ex.: Recomposição corporal (-4 kg)" value={patGoal} onChange={(e) => setPatGoal(e.target.value)} />
              </div>
              <div>
                <label htmlFor="cx-pat-val" style={{ display: 'block', fontSize: '0.76rem', fontWeight: 600, marginBottom: '0.25rem' }}>Mensalidade / Pacote (R$)</label>
                <input id="cx-pat-val" className="cx-input" type="number" value={patVal} onChange={(e) => setPatVal(e.target.value)} />
              </div>
            </div>
            <div>
              <label htmlFor="cx-pat-rest" style={{ display: 'block', fontSize: '0.76rem', fontWeight: 600, marginBottom: '0.25rem' }}>Restrições / Alergias</label>
              <input id="cx-pat-rest" className="cx-input" placeholder="Ex.: Intolerância à lactose, doença celíaca..." value={patRest} onChange={(e) => setPatRest(e.target.value)} />
            </div>
            <div className="cx-grid-2">
              <div>
                <label htmlFor="cx-pat-aver" style={{ display: 'block', fontSize: '0.76rem', fontWeight: 600, marginBottom: '0.25rem' }}>Aversões alimentares</label>
                <input id="cx-pat-aver" className="cx-input" placeholder="Ex.: Fígado, quiabo" value={patAversions} onChange={(e) => setPatAversions(e.target.value)} />
              </div>
              <div>
                <label htmlFor="cx-pat-meds" style={{ display: 'block', fontSize: '0.76rem', fontWeight: 600, marginBottom: '0.25rem' }}>Medicações / Suplementos</label>
                <input id="cx-pat-meds" className="cx-input" placeholder="Ex.: Vitamina D 2.000 UI" value={patMedications} onChange={(e) => setPatMedications(e.target.value)} />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.55rem' }}>
              <button type="button" className="cx-btn cx-btn-ghost" onClick={() => setShowModal(false)}>Cancelar</button>
              <button type="submit" className="cx-btn cx-btn-primary">Salvar &amp; Sincronizar</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
