import React, { useState } from 'react';
import {
  Activity,
  ArrowUpRight,
  Calendar,
  FileUp,
  Plus,
  Send,
  Stethoscope,
  Users,
  Utensils,
  Wallet,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';
import { MEAL_PLAN_PRESETS, formatBRL } from '../noemaData';
import { useNoema } from '../noemaStore';
import { NoemaBiomarkersSvg, NoemaBrandMark, NoemaRadar360Svg } from '../NoemaVisuals';

const CRM_NAV = [
  { id: 'overview', label: '01 · Visão Geral & Radar', icon: Activity },
  { id: 'patients', label: '02 · Meus Pacientes', icon: Users },
  { id: 'biomarkers', label: '03 · Ficha & Exames', icon: Stethoscope },
  { id: 'meal-builder', label: '04 · Plano Alimentar IA', icon: Utensils },
  { id: 'schedule', label: '05 · Agenda & Telegram', icon: Calendar },
  { id: 'finance', label: '06 · Financeiro CRM', icon: Wallet }
];

function statusTagClass(status) {
  if (status === 'risco' || status === 'atrasado') return 'n-tag-danger';
  if (status === 'atencao' || status === 'vencendo') return 'n-tag-warn';
  return 'n-tag-ok';
}

export default function NoemaCrmView({ onNavigate }) {
  const {
    patients,
    activePatient,
    setActivePatientId,
    appointments,
    addPatient,
    sendTelegramMessage,
    publishMealPlan,
    addMealToPlan,
    simulateExamAnalysis,
    addAppointment,
    toggleAppointmentConfirm,
    toggleInvoicePaid
  } = useNoema();

  const [section, setSection] = useState('overview');
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('todos');

  // Modais e forms locais
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newGoal, setNewGoal] = useState('');
  const [newPlanVal, setNewPlanVal] = useState('1200');

  const [isAnalyzingExam, setIsAnalyzingExam] = useState(false);

  const [customMealSlot, setCustomMealSlot] = useState('16:00 · Lanche da Tarde');
  const [customMealName, setCustomMealName] = useState('');
  const [customMealKcal, setCustomMealKcal] = useState('340');
  const [customMealPrep, setCustomMealPrep] = useState('');

  const [showApptForm, setShowApptForm] = useState(false);
  const [apptDay, setApptDay] = useState('Qui 21');
  const [apptTime, setApptTime] = useState('11:00');
  const [apptType, setApptType] = useState('Retorno Online');

  const filteredPatients = patients.filter((p) => {
    const q = search.trim().toLowerCase();
    const matchQ = !q || p.name.toLowerCase().includes(q) || p.goal.toLowerCase().includes(q);
    const matchF = filterStatus === 'todos' || p.status === filterStatus;
    return matchQ && matchF;
  });

  const avgAdherence = Math.round(patients.reduce((acc, p) => acc + p.adherence, 0) / patients.length);
  const riskCount = patients.filter((p) => p.status !== 'ativo').length;

  const totalForecast = patients.reduce((acc, p) => acc + (p.planValueNum || 0), 0);
  const totalReceived = patients.filter((p) => p.invoiceStatus === 'pago').reduce((acc, p) => acc + (p.planValueNum || 0), 0);
  const totalPending = Math.max(0, totalForecast - totalReceived);

  const handleCreatePatient = (e) => {
    e.preventDefault();
    if (!newName.trim()) {
      toast.error('Informe o nome completo do paciente.');
      return;
    }
    addPatient({ name: newName, goal: newGoal, planValue: newPlanVal });
    setNewName('');
    setNewGoal('');
    setNewPlanVal('1200');
    setShowPatientModal(false);
  };

  const handleSimulateExam = (fileName) => {
    setIsAnalyzingExam(true);
    setTimeout(() => {
      setIsAnalyzingExam(false);
      simulateExamAnalysis(activePatient.id, fileName);
    }, 850);
  };

  const handleAddMeal = (e) => {
    e.preventDefault();
    if (!customMealName.trim()) {
      toast.error('Digite o nome da refeição.');
      return;
    }
    addMealToPlan(activePatient.id, {
      slot: customMealSlot,
      name: customMealName,
      kcal: customMealKcal,
      prep: customMealPrep
    });
    setCustomMealName('');
    setCustomMealPrep('');
  };

  const handleCreateAppt = (e) => {
    e.preventDefault();
    addAppointment({
      day: apptDay,
      time: apptTime,
      patientName: activePatient.name,
      type: apptType
    });
    setShowApptForm(false);
  };

  return (
    <section className="noema-section" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      <div className="noema-container">
        {/* Topbar de contexto sincronizado */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
          <div>
            <span className="noema-eyebrow">NØEMA WORKSPACE · CRM CLÍNICO</span>
            <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', letterSpacing: '-0.04em', marginTop: '0.35rem' }}>
              Painel do Nutricionista
            </h1>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
            <label htmlFor="crm-active-patient" className="n-tag">Paciente em foco:</label>
            <select
              id="crm-active-patient"
              className="n-select"
              style={{ width: 'auto', minWidth: '230px' }}
              value={activePatient.id}
              onChange={(e) => setActivePatientId(e.target.value)}
            >
              {patients.map((p) => (
                <option key={p.id} value={p.id}>{p.shortName} · {p.adherence}% adesão</option>
              ))}
            </select>
            <button type="button" className="n-btn n-btn-electric" onClick={() => onNavigate('/noema/paciente')}>
              <span>Abrir App do Paciente</span>
              <ArrowUpRight size={15} aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="noema-crm-shell">
          <aside className="noema-crm-side" aria-label="Navegação interna do CRM">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 0.4rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.92rem' }}>
                <NoemaBrandMark size={18} />
                <span>Clínica NØEMA</span>
              </div>
              <span className="n-tag n-tag-signal">CRN-3</span>
            </div>

            <nav className="noema-crm-nav" aria-label="Módulos do consultório">
              {CRM_NAV.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    className={`noema-crm-btn${section === item.id ? ' is-active' : ''}`}
                    aria-current={section === item.id ? 'page' : undefined}
                    onClick={() => setSection(item.id)}
                  >
                    <Icon size={16} aria-hidden="true" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            <div className="n-card" style={{ marginTop: 'auto', padding: '0.85rem', fontSize: '0.78rem' }}>
              <div style={{ fontFamily: 'var(--n-font-mono)', color: 'var(--n-signal)', marginBottom: '0.3rem' }}>SYNC ATIVO</div>
              <div style={{ color: 'var(--n-ink-muted)' }}>
                Alterações em planos, exames ou mensagens aparecem instantaneamente no App de <strong>{activePatient.shortName}</strong>.
              </div>
            </div>
          </aside>

          <div className="noema-crm-main">
            {/* 01 · VISÃO GERAL & RADAR */}
            {section === 'overview' && (
              <>
                <div className="n-grid-4">
                  <div className="n-card">
                    <div style={{ fontSize: '0.74rem', color: 'var(--n-ink-muted)' }}>Pacientes Ativos</div>
                    <strong className="n-tabular" style={{ fontSize: '1.8rem' }}>{patients.length}</strong>
                  </div>
                  <div className="n-card">
                    <div style={{ fontSize: '0.74rem', color: 'var(--n-ink-muted)' }}>Consultas na Semana</div>
                    <strong className="n-tabular" style={{ fontSize: '1.8rem' }}>{appointments.length}</strong>
                  </div>
                  <div className="n-card">
                    <div style={{ fontSize: '0.74rem', color: 'var(--n-ink-muted)' }}>Adesão Média</div>
                    <strong className="n-tabular" style={{ fontSize: '1.8rem' }}>{avgAdherence}%</strong>
                  </div>
                  <div className="n-card">
                    <div style={{ fontSize: '0.74rem', color: 'var(--n-ink-muted)' }}>Alertas no Radar</div>
                    <strong className="n-tabular" style={{ fontSize: '1.8rem', color: 'var(--n-danger)' }}>{riskCount}</strong>
                  </div>
                </div>

                <div className="n-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.8rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                    <div>
                      <h2 style={{ fontSize: '1.25rem', marginBottom: '0.2rem' }}>Radar de Abandono 360°</h2>
                      <p style={{ fontSize: '0.84rem', color: 'var(--n-ink-muted)' }}>Dispare lembretes no Telegram sem usar seu WhatsApp pessoal.</p>
                    </div>
                    <span className="n-tag n-tag-danger">{riskCount} prioridades de retenção</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', alignItems: 'center' }}>
                    <NoemaRadar360Svg activeStatus={activePatient.status} />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                      {patients.slice(0, 4).map((p) => (
                        <div key={p.id} style={{ border: '1px solid var(--n-line)', padding: '0.75rem 0.9rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                          <div style={{ minWidth: 0, flex: '1 1 180px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                              <strong className="n-truncate" style={{ maxWidth: '240px' }}>{p.name}</strong>
                              <span className={`n-tag ${statusTagClass(p.status)}`}>{p.riskLabel}</span>
                            </div>
                            <div style={{ fontSize: '0.76rem', color: 'var(--n-ink-muted)', marginTop: '0.25rem' }}>{p.lastSeen}</div>
                          </div>
                          <button
                            type="button"
                            className="n-btn n-btn-sm"
                            onClick={() => {
                              setActivePatientId(p.id);
                              sendTelegramMessage(p.id, `Olá ${p.shortName.split(' ')[0]}! Lembrete da sua nutricionista: como estão suas metas de água e refeições hoje?`);
                            }}
                          >
                            <Send size={13} aria-hidden="true" /> Acionar Bot
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* 02 · MEUS PACIENTES */}
            {section === 'patients' && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.8rem', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', flex: '1 1 320px' }}>
                    <label htmlFor="noema-patient-search" style={{ position: 'absolute', left: '-9999px' }}>Buscar paciente</label>
                    <input
                      id="noema-patient-search"
                      className="n-input"
                      style={{ maxWidth: '280px' }}
                      type="search"
                      placeholder="Buscar por nome ou objetivo..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                    <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                      {[
                        { id: 'todos', label: 'Todos' },
                        { id: 'risco', label: 'Risco Alto' },
                        { id: 'atencao', label: 'Atenção' },
                        { id: 'ativo', label: 'Em Dia' }
                      ].map((f) => (
                        <button
                          key={f.id}
                          type="button"
                          className={`n-btn n-btn-sm${filterStatus === f.id ? ' n-btn-electric' : ''}`}
                          onClick={() => setFilterStatus(f.id)}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button type="button" className="n-btn n-btn-electric" onClick={() => setShowPatientModal(true)}>
                    <Plus size={15} aria-hidden="true" /> Novo Paciente
                  </button>
                </div>

                <div className="n-table-wrap">
                  <table className="n-table">
                    <thead>
                      <tr>
                        <th>Paciente & Objetivo</th>
                        <th>Ofensiva / XP</th>
                        <th>Adesão</th>
                        <th>Radar</th>
                        <th>Último Check-in</th>
                        <th>Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPatients.map((p) => (
                        <tr key={p.id}>
                          <td style={{ maxWidth: '260px' }}>
                            <div className="n-truncate" style={{ fontWeight: 700 }} title={p.name}>{p.name}</div>
                            <div className="n-truncate" style={{ fontSize: '0.76rem', color: 'var(--n-ink-muted)' }}>{p.goal}</div>
                          </td>
                          <td className="n-tabular">{p.streak}d · {p.xp} XP</td>
                          <td className="n-tabular">{p.adherence}%</td>
                          <td><span className={`n-tag ${statusTagClass(p.status)}`}>{p.riskLabel}</span></td>
                          <td style={{ fontSize: '0.8rem', color: 'var(--n-ink-muted)' }}>{p.lastSeen}</td>
                          <td>
                            <div style={{ display: 'flex', gap: '0.4rem' }}>
                              <button
                                type="button"
                                className="n-btn n-btn-sm"
                                onClick={() => {
                                  setActivePatientId(p.id);
                                  setSection('biomarkers');
                                }}
                              >
                                Abrir Prontuário
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {/* 03 · FICHA & BIOMARCADORES */}
            {section === 'biomarkers' && (
              <>
                <div className="n-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                  <div style={{ minWidth: 0 }}>
                    <span className="noema-eyebrow">PRONTUÁRIO BIOMÉTRICO</span>
                    <h2 className="n-truncate" style={{ fontSize: '1.35rem', marginTop: '0.25rem' }}>{activePatient.name}</h2>
                    <p style={{ fontSize: '0.84rem', color: 'var(--n-ink-muted)' }}>
                      {activePatient.goal} · Água hoje: {activePatient.waterMl}/{activePatient.waterGoal} ml · {activePatient.xp} XP
                    </p>
                  </div>

                  <label className="n-btn n-btn-electric" style={{ cursor: 'pointer' }}>
                    <FileUp size={15} aria-hidden="true" />
                    <span>{isAnalyzingExam ? 'Analisando PDF com IA...' : 'Analisar Novo Exame PDF (IA)'}</span>
                    <input
                      type="file"
                      accept=".pdf,image/*"
                      style={{ display: 'none' }}
                      onChange={(e) => handleSimulateExam(e.target.files?.[0]?.name || 'hemograma_metabólico.pdf')}
                    />
                  </label>
                </div>

                {isAnalyzingExam && (
                  <div className="n-card" style={{ borderColor: 'var(--n-electric)' }}>
                    <div style={{ fontFamily: 'var(--n-font-mono)', fontSize: '0.78rem', color: 'var(--n-signal)', marginBottom: '0.5rem' }}>
                      PROCESSANDO MARCADORES METABÓLICOS COM IA...
                    </div>
                    <div style={{ height: '6px', background: 'var(--n-line)', overflow: 'hidden' }}>
                      <div style={{ width: '75%', height: '100%', background: 'var(--n-electric)' }} />
                    </div>
                  </div>
                )}

                <div className="n-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <strong>Curva de Composição Corporal</strong>
                    <span style={{ fontFamily: 'var(--n-font-mono)', fontSize: '0.74rem', color: 'var(--n-ink-muted)' }}>
                      VERDE: MASSA MAGRA (%) · TRACEJADA: GORDURA (%)
                    </span>
                  </div>
                  <NoemaBiomarkersSvg biomarkers={activePatient.biomarkers} />
                </div>

                <div className="n-grid-4">
                  {activePatient.labs.map((lab) => (
                    <div key={lab.marker} className="n-card">
                      <div style={{ fontSize: '0.76rem', color: 'var(--n-ink-muted)', marginBottom: '0.3rem' }}>{lab.marker}</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '0.4rem' }}>
                        <strong className="n-tabular" style={{ fontSize: '1.15rem' }}>{lab.curr}</strong>
                        <span className={`n-tag ${lab.tone === 'warn' ? 'n-tag-warn' : 'n-tag-ok'}`}>{lab.delta}</span>
                      </div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--n-ink-muted)', marginTop: '0.35rem' }}>Anterior: {lab.prev}</div>
                    </div>
                  ))}
                </div>

                <div className="n-card" style={{ borderColor: 'var(--n-signal)' }}>
                  <div style={{ fontFamily: 'var(--n-font-mono)', fontSize: '0.72rem', color: 'var(--n-signal)', marginBottom: '0.35rem' }}>
                    PARECER CLÍNICO ASSISTIDO
                  </div>
                  <p style={{ fontSize: '0.92rem' }}>{activePatient.examSummary}</p>
                </div>
              </>
            )}

            {/* 04 · MONTADOR DE PLANO ALIMENTAR IA */}
            {section === 'meal-builder' && (
              <>
                <div className="n-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.8rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                    <div>
                      <span className="noema-eyebrow">GERADOR TACO + RECEITAS IA</span>
                      <h2 style={{ fontSize: '1.25rem', marginTop: '0.25rem' }}>{activePatient.planTitle}</h2>
                      <p style={{ fontSize: '0.84rem', color: 'var(--n-ink-muted)' }}>{activePatient.planMacros}</p>
                    </div>
                    <span className="n-tag n-tag-ok">{activePatient.meals.length} refeições no App de {activePatient.shortName}</span>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {MEAL_PLAN_PRESETS.map((pr) => (
                      <button
                        key={pr.id}
                        type="button"
                        className="n-btn n-btn-sm n-btn-electric"
                        onClick={() => publishMealPlan(activePatient.id, pr)}
                      >
                        Publicar IA: {pr.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="n-grid-3">
                  {activePatient.meals.map((m) => (
                    <article key={m.id} className="n-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '0.8rem' }}>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
                          <span style={{ fontFamily: 'var(--n-font-mono)', fontSize: '0.7rem', color: 'var(--n-signal)' }}>{m.slot}</span>
                          <span className="n-tag n-tabular">{m.kcal} kcal</span>
                        </div>
                        <h3 style={{ fontSize: '1.02rem', marginBottom: '0.55rem' }}>{m.name}</h3>
                        <ul style={{ margin: '0 0 0.7rem', paddingLeft: '1rem', color: 'var(--n-ink-muted)', fontSize: '0.82rem' }}>
                          {m.items.map((it) => <li key={it}>{it}</li>)}
                        </ul>
                      </div>
                      <div style={{ borderTop: '1px solid var(--n-line)', paddingTop: '0.6rem', fontSize: '0.78rem', color: 'var(--n-ink-muted)' }}>
                        <strong>Preparo:</strong> {m.prep}
                      </div>
                    </article>
                  ))}
                </div>

                <form className="n-card" onSubmit={handleAddMeal}>
                  <h3 style={{ fontSize: '1rem', marginBottom: '0.8rem' }}>Adicionar Refeição Customizada (Sincroniza no App)</h3>
                  <div className="n-grid-3" style={{ marginBottom: '0.8rem' }}>
                    <div>
                      <label htmlFor="meal-slot" style={{ display: 'block', fontSize: '0.74rem', marginBottom: '0.3rem' }}>Horário &amp; Turno</label>
                      <input id="meal-slot" className="n-input" value={customMealSlot} onChange={(e) => setCustomMealSlot(e.target.value)} />
                    </div>
                    <div>
                      <label htmlFor="meal-name" style={{ display: 'block', fontSize: '0.74rem', marginBottom: '0.3rem' }}>Nome do Prato</label>
                      <input id="meal-name" className="n-input" placeholder="Ex.: Iogurte proteico com frutas vermelhas" value={customMealName} onChange={(e) => setCustomMealName(e.target.value)} />
                    </div>
                    <div>
                      <label htmlFor="meal-kcal" style={{ display: 'block', fontSize: '0.74rem', marginBottom: '0.3rem' }}>Calorias (kcal)</label>
                      <input id="meal-kcal" className="n-input" type="number" value={customMealKcal} onChange={(e) => setCustomMealKcal(e.target.value)} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <input className="n-input" style={{ flex: '1 1 260px' }} placeholder="Modo de preparo rápido..." value={customMealPrep} onChange={(e) => setCustomMealPrep(e.target.value)} />
                    <button type="submit" className="n-btn n-btn-electric">
                      <Plus size={15} aria-hidden="true" /> Publicar Refeição no App
                    </button>
                  </div>
                </form>
              </>
            )}

            {/* 05 · AGENDA & SECRETÁRIA TELEGRAM */}
            {section === 'schedule' && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                  <div>
                    <h2 style={{ fontSize: '1.25rem' }}>Agenda Semanal &amp; Confirmações Automáticas</h2>
                    <p style={{ fontSize: '0.84rem', color: 'var(--n-ink-muted)' }}>Clique em qualquer status para alternar confirmação do NutriBot.</p>
                  </div>
                  <button type="button" className="n-btn n-btn-electric" onClick={() => setShowApptForm((v) => !v)}>
                    <Plus size={15} aria-hidden="true" /> Agendar Consulta
                  </button>
                </div>

                {showApptForm && (
                  <form className="n-card" onSubmit={handleCreateAppt}>
                    <div className="n-grid-3" style={{ marginBottom: '0.8rem' }}>
                      <select className="n-select" aria-label="Dia" value={apptDay} onChange={(e) => setApptDay(e.target.value)}>
                        {['Seg 18', 'Ter 19', 'Qua 20', 'Qui 21', 'Sex 22'].map((d) => <option key={d}>{d}</option>)}
                      </select>
                      <input className="n-input" aria-label="Horário" value={apptTime} onChange={(e) => setApptTime(e.target.value)} />
                      <input className="n-input" aria-label="Tipo de consulta" value={apptType} onChange={(e) => setApptType(e.target.value)} />
                    </div>
                    <button type="submit" className="n-btn n-btn-electric">Confirmar Horário para {activePatient.shortName}</button>
                  </form>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '0.85rem' }}>
                  {['Seg 18', 'Ter 19', 'Qua 20', 'Qui 21', 'Sex 22'].map((day) => {
                    const dayItems = appointments.filter((a) => a.day === day);
                    return (
                      <div key={day} className="n-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--n-line)', paddingBottom: '0.45rem' }}>
                          <strong>{day}</strong>
                          <span style={{ fontFamily: 'var(--n-font-mono)', fontSize: '0.72rem', color: 'var(--n-ink-muted)' }}>{dayItems.length} cons.</span>
                        </div>
                        {dayItems.length === 0 && <span style={{ fontSize: '0.8rem', color: 'var(--n-ink-muted)' }}>Agenda livre</span>}
                        {dayItems.map((sl) => (
                          <div key={sl.id} style={{ border: '1px solid var(--n-line)', padding: '0.6rem', background: 'var(--n-void)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', color: 'var(--n-ink-muted)' }}>
                              <strong className="n-tabular" style={{ color: 'var(--n-ink)' }}>{sl.time}</strong>
                              <span>{sl.type}</span>
                            </div>
                            <div className="n-truncate" style={{ fontWeight: 700, fontSize: '0.84rem', margin: '0.25rem 0' }}>{sl.patientName}</div>
                            <button
                              type="button"
                              className={`n-tag ${sl.confirmed ? 'n-tag-ok' : 'n-tag-warn'}`}
                              style={{ cursor: 'pointer', border: '1px solid currentColor' }}
                              onClick={() => toggleAppointmentConfirm(sl.id)}
                            >
                              {sl.confirmed ? 'Confirmado Bot ✓' : 'Aguardando ⏳'}
                            </button>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {/* 06 · FINANCEIRO CRM */}
            {section === 'finance' && (
              <>
                <div className="n-grid-3">
                  <div className="n-card">
                    <div style={{ fontSize: '0.76rem', color: 'var(--n-ink-muted)' }}>Previsão Total do Mês</div>
                    <strong className="n-tabular" style={{ fontSize: '1.7rem' }}>{formatBRL(totalForecast)}</strong>
                  </div>
                  <div className="n-card">
                    <div style={{ fontSize: '0.76rem', color: 'var(--n-ink-muted)' }}>Recebido Confirmado</div>
                    <strong className="n-tabular" style={{ fontSize: '1.7rem', color: 'var(--n-live)' }}>{formatBRL(totalReceived)}</strong>
                  </div>
                  <div className="n-card">
                    <div style={{ fontSize: '0.76rem', color: 'var(--n-ink-muted)' }}>A Receber / Pendente</div>
                    <strong className="n-tabular" style={{ fontSize: '1.7rem', color: 'var(--n-warn)' }}>{formatBRL(totalPending)}</strong>
                  </div>
                </div>

                <div className="n-table-wrap">
                  <table className="n-table">
                    <thead>
                      <tr>
                        <th>Paciente &amp; Plano</th>
                        <th>Valor</th>
                        <th>Vencimento</th>
                        <th>Status</th>
                        <th>Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {patients.map((p) => {
                        const statusLabel = p.invoiceStatus === 'pago' ? 'Pago' : p.invoiceStatus === 'atrasado' ? 'Atrasado' : 'Vencendo Hoje';
                        return (
                          <tr key={p.id}>
                            <td style={{ maxWidth: '250px' }}>
                              <div className="n-truncate" style={{ fontWeight: 700 }} title={p.name}>{p.name}</div>
                              <div style={{ fontSize: '0.76rem', color: 'var(--n-ink-muted)' }}>{p.invoicePlanName}</div>
                            </td>
                            <td className="n-tabular"><strong>{formatBRL(p.planValueNum)}</strong></td>
                            <td className="n-tabular">{p.planDue}</td>
                            <td>
                              <span className={`n-tag ${statusTagClass(p.invoiceStatus === 'pago' ? 'ativo' : p.invoiceStatus)}`}>
                                {statusLabel}
                              </span>
                            </td>
                            <td>
                              <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
                                <button type="button" className="n-btn n-btn-sm" onClick={() => toggleInvoicePaid(p.id)}>
                                  {p.invoiceStatus === 'pago' ? 'Reabrir' : 'Marcar Pago'}
                                </button>
                                <button
                                  type="button"
                                  className="n-btn n-btn-sm"
                                  onClick={() => sendTelegramMessage(p.id, `Lembrete gentil de renovação (${p.invoicePlanName} · ${formatBRL(p.planValueNum)}) enviado para ${p.shortName}.`)}
                                >
                                  Lembrete Bot
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Modal Novo Paciente */}
      {showPatientModal && (
        <div className="noema-modal-backdrop" onClick={() => setShowPatientModal(false)}>
          <form className="noema-modal" onClick={(e) => e.stopPropagation()} onSubmit={handleCreatePatient}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.25rem' }}>Cadastrar Novo Paciente</h2>
              <button type="button" className="n-btn n-btn-sm" onClick={() => setShowPatientModal(false)} aria-label="Fechar modal">
                <X size={15} />
              </button>
            </div>
            <div>
              <label htmlFor="modal-pat-name" style={{ display: 'block', fontSize: '0.78rem', marginBottom: '0.3rem' }}>Nome completo</label>
              <input id="modal-pat-name" className="n-input" placeholder="Ex.: Fernanda Oliveira Costa" value={newName} onChange={(e) => setNewName(e.target.value)} autoFocus />
            </div>
            <div>
              <label htmlFor="modal-pat-goal" style={{ display: 'block', fontSize: '0.78rem', marginBottom: '0.3rem' }}>Objetivo clínico</label>
              <input id="modal-pat-goal" className="n-input" placeholder="Ex.: Redução de gordura visceral" value={newGoal} onChange={(e) => setNewGoal(e.target.value)} />
            </div>
            <div>
              <label htmlFor="modal-pat-val" style={{ display: 'block', fontSize: '0.78rem', marginBottom: '0.3rem' }}>Valor do plano (R$)</label>
              <input id="modal-pat-val" className="n-input" type="number" value={newPlanVal} onChange={(e) => setNewPlanVal(e.target.value)} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem' }}>
              <button type="button" className="n-btn" onClick={() => setShowPatientModal(false)}>Cancelar</button>
              <button type="submit" className="n-btn n-btn-electric">Salvar &amp; Sincronizar</button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}
