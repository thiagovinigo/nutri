import React, { useState } from 'react';
import {
  Activity,
  Bot,
  Calendar,
  Droplets,
  FileSearch,
  Footprints,
  LayoutDashboard,
  Moon,
  Pause,
  Play,
  Plus,
  Radar,
  RotateCcw,
  Send,
  Smartphone,
  Users,
  Utensils,
  Wallet,
  X
} from 'lucide-react';
import ClarixRobotCanvas from '../components/ClarixRobotCanvas';
import { ConicRing, MacroPillGroup, WeightEvolutionChart } from '../components/MovefluxCharts';
import { MEAL_PLAN_PRESETS, WEEK_DAYS, formatBRL } from '../clarixData';
import { useClarix } from '../clarixStore';

const CRM_NAV = [
  { id: 'cockpit', label: '01 · Cockpit & Radar', icon: LayoutDashboard },
  { id: 'patients', label: '02 · Pacientes', icon: Users },
  { id: 'plans', label: '03 · Plano & Exames IA', icon: Utensils },
  { id: 'schedule', label: '04 · Agenda & Financeiro', icon: Calendar }
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
    toggleAppointmentStatus,
    addAppointment,
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

  // Modal Novo Paciente
  const [showModal, setShowModal] = useState(false);
  const [patName, setPatName] = useState('');
  const [patGoal, setPatGoal] = useState('');
  const [patVal, setPatVal] = useState('480');

  // Form Refeição Personalizada
  const [customSlot, setCustomSlot] = useState('16:00 · Lanche Proteico');
  const [customMealName, setCustomMealName] = useState('');
  const [customPrep, setCustomPrep] = useState('');

  // Form Nova Consulta
  const [apptDay, setApptDay] = useState('Sex 21');
  const [apptTime, setApptTime] = useState('15:30');
  const [apptType, setApptType] = useState('Retorno + Bioimpedância');

  const waterPct = Math.min(100, Math.round(((activePatient?.waterMl || 0) / Math.max(activePatient?.waterGoal || 1, 1)) * 100));
  const stepsPct = Math.min(100, Math.round(((activePatient?.steps || 0) / Math.max(activePatient?.stepsGoal || 1, 1)) * 100));
  const kcalPct = Math.min(100, Math.round(((activePatient?.kcalConsumed || 0) / Math.max(activePatient?.kcalTarget || 1, 1)) * 100));

  const sortedRadarPatients = [...patients].sort((a, b) => b.riskScore - a.riskScore);
  const filteredPatients = patients.filter((p) => {
    const matchText =
      !searchTerm.trim() ||
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.goal.toLowerCase().includes(searchTerm.toLowerCase());
    const matchRisk = riskFilter === 'all' || p.riskLevel === riskFilter;
    return matchText && matchRisk;
  });

  const paidSum = patients.filter((p) => p.invoiceStatus === 'pago').reduce((a, p) => a + p.invoiceValue, 0);
  const pendingSum = patients.filter((p) => p.invoiceStatus !== 'pago').reduce((a, p) => a + p.invoiceValue, 0);
  const avgTicket = Math.round((paidSum + pendingSum) / Math.max(patients.length, 1));

  const handleCreatePatient = (e) => {
    e.preventDefault();
    if (!patName.trim()) return;
    addPatient({ name: patName, goal: patGoal, invoiceValue: patVal });
    setPatName('');
    setPatGoal('');
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

          {/* MÓDULO 02: PACIENTES */}
          {section === 'patients' && (
            <article className="cx-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.2rem' }}>Carteira de Pacientes</h2>
                  <p style={{ margin: '0.15rem 0 0', fontSize: '0.82rem', color: 'var(--cx-muted)' }}>
                    Clique em qualquer paciente para carregar seus biomarcadores e ativar a NutrIA.
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
                  placeholder="Buscar por nome ou objetivo clínico..."
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

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {filteredPatients.map((p) => (
                  <div
                    key={p.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '0.8rem',
                      flexWrap: 'wrap',
                      padding: '0.85rem 1rem',
                      borderRadius: '18px',
                      background: '#f8fafc',
                      border: p.id === activePatient?.id ? '1.5px solid #0070d1' : '1px solid rgba(15,23,42,0.08)'
                    }}
                  >
                    <div style={{ minWidth: 0, flex: '1 1 240px' }}>
                      <strong className="cx-truncate" style={{ display: 'block', fontSize: '0.94rem' }}>{p.name}</strong>
                      <div style={{ fontSize: '0.78rem', color: 'var(--cx-muted)' }}>{p.goal} · {p.lastSeen}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <span className={`cx-tag ${p.riskLevel === 'high' ? 'cx-tag-risk' : p.riskLevel === 'medium' ? 'cx-tag-warn' : 'cx-tag-ok'}`}>
                        {p.adherence}% adesão
                      </span>
                      <button type="button" className="cx-btn cx-btn-sm cx-btn-ghost" onClick={() => selectPatient(p.id)}>
                        Selecionar
                      </button>
                      <button type="button" className="cx-btn cx-btn-sm cx-btn-primary" onClick={() => sendTelegramNudge(p.id)}>
                        Acionar Bot
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </article>
          )}

          {/* MÓDULO 03: PLANO ALIMENTAR IA & LEITOR PDF DE EXAMES */}
          {section === 'plans' && (
            <>
              <article className="cx-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.95rem' }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.18rem' }}>Publicação Instantânea TACO · {activePatient?.shortName}</h2>
                  <p style={{ margin: '0.15rem 0 0', fontSize: '0.82rem', color: 'var(--cx-muted)' }}>
                    Escolha um protocolo completo para publicar imediatamente no aplicativo móvel do paciente.
                  </p>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.55rem' }}>
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
                  <strong style={{ fontSize: '0.86rem' }}>Adicionar refeição avulsa no app de {activePatient?.shortName}</strong>
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
              </article>

              <article className="cx-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.6rem' }}>
                  <div>
                    <h2 style={{ margin: 0, fontSize: '1.15rem' }}>Leitor IA de Exames PDF</h2>
                    <p style={{ margin: '0.15rem 0 0', fontSize: '0.82rem', color: 'var(--cx-muted)' }}>
                      A NutrIA entra em modo Scanner e interpreta biomarcadores laboratoriais.
                    </p>
                  </div>
                  <button
                    type="button"
                    className="cx-btn cx-btn-accent cx-btn-sm cx-btn-pill"
                    onClick={() => runLabExamScan(activePatient?.id)}
                  >
                    <FileSearch size={14} aria-hidden="true" />
                    <span>Simular Leitura de Exame PDF com NutrIA</span>
                  </button>
                </div>

                {botMood === 'scanning' && (
                  <div className="cx-scan-stage" style={{ minHeight: '56px', display: 'flex', alignItems: 'center' }}>
                    <div className="cx-scan-beam" aria-hidden="true" />
                    <strong style={{ fontSize: '0.84rem', color: '#0369a1' }}>Extraindo marcadores bioquímicos com a NutrIA...</strong>
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {(activePatient?.labExams || []).map((ex) => (
                    <div
                      key={ex.name}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '0.6rem',
                        flexWrap: 'wrap',
                        padding: '0.7rem 0.9rem',
                        borderRadius: '16px',
                        background: '#f8fafc',
                        border: '1px solid rgba(15,23,42,0.07)'
                      }}
                    >
                      <div>
                        <strong style={{ fontSize: '0.86rem' }}>{ex.name}</strong>
                        <div style={{ fontSize: '0.75rem', color: 'var(--cx-muted)' }}>{ex.note}</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                        <strong className="cx-tabular" style={{ fontSize: '0.86rem' }}>{ex.value}</strong>
                        <span className="cx-tag cx-tag-info">{ex.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </article>
            </>
          )}

          {/* MÓDULO 04: AGENDA SEMANAL + FINANCEIRO CRM */}
          {section === 'schedule' && (
            <>
              <article className="cx-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.18rem' }}>Agenda da Clínica</h2>
                  <p style={{ margin: '0.15rem 0 0', fontSize: '0.8rem', color: 'var(--cx-muted)' }}>
                    Clique em qualquer selo de status para alternar confirmação da NutrIA.
                  </p>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    addAppointment({ day: apptDay, time: apptTime, patientId: activePatient?.id, type: apptType });
                  }}
                  style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}
                >
                  <select className="cx-select" style={{ width: 'auto' }} value={apptDay} onChange={(e) => setApptDay(e.target.value)} aria-label="Dia da consulta">
                    {WEEK_DAYS.map((d) => <option key={d.day} value={`${d.short} ${d.day}`}>{d.short} {d.day}</option>)}
                  </select>
                  <input className="cx-input" style={{ width: '92px' }} value={apptTime} onChange={(e) => setApptTime(e.target.value)} aria-label="Horário" />
                  <input className="cx-input" style={{ flex: '1 1 180px' }} value={apptType} onChange={(e) => setApptType(e.target.value)} aria-label="Tipo de consulta" />
                  <button type="submit" className="cx-btn cx-btn-primary cx-btn-sm">Agendar</button>
                </form>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {appointments.map((a) => (
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
                        <div style={{ fontSize: '0.76rem', color: 'var(--cx-muted)' }}>{a.type}</div>
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

      {/* MODAL FROSTED NOVO PACIENTE */}
      {showModal && (
        <div className="cx-modal-backdrop" onClick={() => setShowModal(false)}>
          <form className="cx-modal" onClick={(e) => e.stopPropagation()} onSubmit={handleCreatePatient}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '1.2rem' }}>Cadastrar Novo Paciente</h2>
              <button type="button" className="cx-btn cx-btn-sm cx-btn-ghost" onClick={() => setShowModal(false)} aria-label="Fechar modal">
                <X size={15} />
              </button>
            </div>
            <div>
              <label htmlFor="cx-pat-name" style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: '0.3rem' }}>Nome completo</label>
              <input id="cx-pat-name" className="cx-input" placeholder="Ex.: Clara Teixeira Souza" value={patName} onChange={(e) => setPatName(e.target.value)} autoFocus />
            </div>
            <div>
              <label htmlFor="cx-pat-goal" style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: '0.3rem' }}>Objetivo clínico</label>
              <input id="cx-pat-goal" className="cx-input" placeholder="Ex.: Recomposição corporal (-4 kg)" value={patGoal} onChange={(e) => setPatGoal(e.target.value)} />
            </div>
            <div>
              <label htmlFor="cx-pat-val" style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: '0.3rem' }}>Mensalidade / Pacote (R$)</label>
              <input id="cx-pat-val" className="cx-input" type="number" value={patVal} onChange={(e) => setPatVal(e.target.value)} />
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
