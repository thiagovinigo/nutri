import React, { useState, useMemo } from 'react';
import { Users, Calendar, PlayCircle, Trash2, Plus, Eye, Edit3, TrendingUp, Utensils, FileText, BrainCircuit, Play, Sparkles, Activity, Settings, CreditCard, Palette, AlertTriangle, Trophy, Star, Zap, LayoutDashboard, Search, ChevronUp, ChevronDown, ArrowRight, UserCog, BookOpen, ChefHat, Link as LinkIcon, Camera } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../../context/AppContext';
import WeeklyCalendar from './WeeklyCalendar';

export default function PatientList({
  view, setView,
  patients, appointments,
  showApptModal, setShowApptModal,
  apptPatientId, setApptPatientId,
  apptTime, setApptTime,
  apptDate, setApptDate,
  apptType, setApptType,
  handleCreateAppointment, cancelAppointment, startConsultation,
  showPatientModal, setShowPatientModal,
  openNewPatientModal, openEditPatientModal, editingPatient, handleDeletePatient,
  patName, setPatName, patObj, setPatObj, patRest, setPatRest, patCpf, setPatCpf, patEmail, setPatEmail, handleSavePatient,
  viewingPatientId, setViewingPatientId,
  synthesisResult, setSynthesisResult, isSynthesizing, generatePatientSynthesis, synthesisError,
  addNotification,
  dietTemplates, deleteDietTemplate,
  recipeLibrary, addLibraryRecipe, deleteLibraryRecipe,
  addBonusRecipe,
  clinicConfig, updateClinicConfig
}) {
  const navigate = useNavigate();
  const { profile } = useAppContext();
  const viewedPatient = patients.find(p => p.id === viewingPatientId);

  const [copiedGeneralLink, setCopiedGeneralLink] = useState(false);
  const [copiedPatientLink, setCopiedPatientLink] = useState(false);

  // Busca/filtro/ordenação — Meus Pacientes
  const [patientSearch, setPatientSearch] = useState('');
  const [patientStatusFilter, setPatientStatusFilter] = useState('todos');
  const [sortKey, setSortKey] = useState('name');
  const [sortDir, setSortDir] = useState('asc');

  // Filtro de status — Agenda
  const [agendaStatusFilter, setAgendaStatusFilter] = useState('todos');

  // Perfil do profissional — Configurações
  const [activeSettingsTab, setActiveSettingsTab] = useState('perfil');
  const [profName, setProfName] = useState('');
  const [profCrn, setProfCrn] = useState('');
  const [profSpecialty, setProfSpecialty] = useState('');
  const [profSaved, setProfSaved] = useState(false);

  // Receitas
  const [showRecipeModal, setShowRecipeModal] = useState(false);
  const [recipeTitle, setRecipeTitle] = useState('');
  const [recipeDescription, setRecipeDescription] = useState('');
  const [recipeIngredients, setRecipeIngredients] = useState('');
  const [recipeInstructions, setRecipeInstructions] = useState('');
  const [isGeneratingRecipe, setIsGeneratingRecipe] = useState(false);
  const [showAttachRecipeModal, setShowAttachRecipeModal] = useState(false);

  // Diet Builder
  const [showDietBuilder, setShowDietBuilder] = useState(false);
  const [dietBuilderTitle, setDietBuilderTitle] = useState('');
  const [dietBuilderDuration, setDietBuilderDuration] = useState(7);
  const [dietBuilderDays, setDietBuilderDays] = useState([]);
  const [selectedDayIndex, setSelectedDayIndex] = useState(1);
  
  const generateInitialDietDays = (duration) => {
    const days = [];
    const defaultMeals = [
      { name: 'Café da Manhã', time: '08:00', desc: '' },
      { name: 'Lanche da Manhã', time: '10:30', desc: '' },
      { name: 'Almoço', time: '13:00', desc: '' },
      { name: 'Lanche da Tarde', time: '16:00', desc: '' },
      { name: 'Jantar', time: '19:30', desc: '' },
      { name: 'Ceia', time: '22:00', desc: '' }
    ];
    for(let i=1; i<=duration; i++) {
      days.push({ dayIndex: i, meals: JSON.parse(JSON.stringify(defaultMeals)) });
    }
    setDietBuilderDays(days);
  };

  const initDietBuilder = () => {
    setShowDietBuilder(true);
    setDietBuilderTitle('');
    setDietBuilderDuration(7);
    generateInitialDietDays(7);
    setSelectedDayIndex(1);
  };

  const [dietBuilderMessage, setDietBuilderMessage] = useState('');
  const handleCopyDay1 = () => {
    if (dietBuilderDays.length === 0) return;
    const day1Meals = JSON.stringify(dietBuilderDays[0].meals);
    setDietBuilderDays(prev => prev.map(d => ({ ...d, meals: JSON.parse(day1Meals) })));
    setDietBuilderMessage('Refeições do Dia 1 replicadas para todos os dias!');
    setTimeout(() => setDietBuilderMessage(''), 3000);
  };

  const handleAddMeal = (dayIdx) => {
    setDietBuilderDays(prev => {
      const newDays = [...prev];
      newDays[dayIdx].meals.push({ name: 'Nova Refeição', time: '00:00', desc: '' });
      return newDays;
    });
  };

  const handleUpdateMeal = (dayIdx, mealIdx, field, value) => {
    setDietBuilderDays(prev => {
      const newDays = [...prev];
      newDays[dayIdx].meals[mealIdx][field] = value;
      return newDays;
    });
  };

  const handleSaveDietBuilder = () => {
    if (!dietBuilderTitle) {
      alert('Dê um nome para a dieta.');
      return;
    }
    // Salvando template com o novo formato Day-by-Day (usando addDietTemplate injetada no AppContext)
    addDietTemplate(dietBuilderTitle, dietBuilderDuration, dietBuilderDays);
    setShowDietBuilder(false);
  };

  // Receitas Bônus
  const [bonusRecipeTitle, setBonusRecipeTitle] = useState('');
  const [bonusRecipeContent, setBonusRecipeContent] = useState('');

  // Alerta de churn — Cohorts
  const [churnAlertMessage, setChurnAlertMessage] = useState('');
  const handleSendChurnAlert = (patient) => {
    addNotification(patient.id, `Sua nutri notou que você está há alguns dias sem registrar refeições. Que tal retomar hoje? 💪`);
    setChurnAlertMessage(`Alerta registrado para follow-up manual com ${patient.name} — e uma notificação já foi enviada pro app dele(a). O envio automático por WhatsApp/e-mail ainda não está conectado.`);
    setTimeout(() => setChurnAlertMessage(''), 4500);
  };

  // KPIs para o Dashboard de Retenção
  const activePatients = patients.filter(p => p.status !== 'inativo');
  const totalXP = activePatients.reduce((sum, p) => sum + (p.xp || 0), 0);
  const avgStreak = activePatients.length > 0
    ? Math.round(activePatients.reduce((sum, p) => sum + (p.streak || 0), 0) / activePatients.length)
    : 0;
  const engagedCount = activePatients.filter(p => p.status === 'engajado').length;
  const engagedPercentage = activePatients.length > 0
    ? Math.round((engagedCount / activePatients.length) * 100)
    : 0;
  const topEngagedPatients = [...activePatients].sort((a, b) => (b.xp || 0) - (a.xp || 0)).slice(0, 5);
  const atRiskPatients = patients.filter(p => p.status === 'em_risco');
  const todayAppointments = appointments.filter(a => a.status === 'agendado').sort((a, b) => {
    const dA = a.date || ''; const dB = b.date || '';
    return dA === dB ? (a.time || '').localeCompare(b.time || '') : dA.localeCompare(dB);
  });

  const sortedFilteredPatients = useMemo(() => {
    let list = patients.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(patientSearch.toLowerCase());
      const matchesStatus = patientStatusFilter === 'todos' || p.status === patientStatusFilter;
      return matchesSearch && matchesStatus;
    });
    list = [...list].sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1;
      if (sortKey === 'name') return a.name.localeCompare(b.name) * dir;
      return ((a[sortKey] || 0) - (b[sortKey] || 0)) * dir;
    });
    return list;
  }, [patients, patientSearch, patientStatusFilter, sortKey, sortDir]);

  const filteredAppointments = appointments
    .filter(a => agendaStatusFilter === 'todos' || a.status === agendaStatusFilter)
    .sort((a, b) => {
      const dA = a.date || ''; const dB = b.date || '';
      return dA === dB ? (a.time || '').localeCompare(b.time || '') : dA.localeCompare(dB);
    });

  const handleSort = (key) => {
    if (sortKey === key) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const handleSaveProfessionalProfile = (e) => {
    e.preventDefault();
    setProfSaved(true);
    setTimeout(() => setProfSaved(false), 3000);
  };

  return (
    <div className="crm-container" style={{ display: 'flex', height: '100vh' }}>
      
      <div className="crm-sidebar">
        <div style={{ marginBottom: '40px' }}>
          <h2 className="crm-sidebar-brand">{clinicConfig?.name || 'Vytal'}</h2>
          <span className="crm-sidebar-tag">CRM Clínico</span>
          <button onClick={() => navigate('/')} className="crm-sidebar-exit">Sair (Trocar Papel)</button>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <button className={`crm-nav-btn ${view === 'overview' ? 'active' : ''}`} onClick={() => {setView('overview'); setViewingPatientId(null); setSynthesisResult('');}}>
            <LayoutDashboard size={18} /> Visão Geral
          </button>
          <button className={`crm-nav-btn ${view === 'agenda' ? 'active' : ''}`} onClick={() => {setView('agenda'); setViewingPatientId(null); setSynthesisResult('');}}>
            <Calendar size={18} /> Agenda de Hoje
          </button>
          <button className={`crm-nav-btn ${view === 'pacientes' ? 'active' : ''}`} onClick={() => {setView('pacientes'); setViewingPatientId(null); setSynthesisResult('');}}>
            <Users size={18} /> Meus Pacientes
          </button>
          <button className={`crm-nav-btn ${view === 'biblioteca' ? 'active' : ''}`} onClick={() => {setView('biblioteca'); setViewingPatientId(null); setSynthesisResult('');}}>
            <BookOpen size={18} /> Biblioteca de Dietas
          </button>
          <button className={`crm-nav-btn ${view === 'receitas' ? 'active' : ''}`} onClick={() => {setView('receitas'); setViewingPatientId(null); setSynthesisResult('');}}>
            <ChefHat size={18} /> Biblioteca de Receitas
          </button>
          <button className={`crm-nav-btn ${view === 'cohorts' ? 'active' : ''}`} onClick={() => {setView('cohorts'); setViewingPatientId(null); setSynthesisResult('');}}>
            <Activity size={18} /> Inteligência de Cohorts
          </button>
          <div style={{ margin: '16px 8px', height: '1px', backgroundColor: 'rgba(255,255,255,0.08)' }} />
          <button className={`crm-nav-btn ${view === 'settings' ? 'active' : ''}`} onClick={() => {setView('settings'); setViewingPatientId(null); setSynthesisResult('');}}>
            <Settings size={18} /> Configurações
          </button>
        </nav>
      </div>

      <div style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
        <div className="animate-pop-in">
          
          {/* VISÃO GERAL */}
          {view === 'overview' && (
            <div className="animate-pop-in">
              <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '1.8rem', fontWeight: '700', color: 'var(--crm-text-main)', marginBottom: '8px' }}>Visão Geral</h1>
                <p style={{ color: 'var(--crm-text-muted)' }}>Resumo do dia e atalhos rápidos.</p>
              </div>

              <div style={{ display: 'flex', gap: '24px', marginBottom: '32px', flexWrap: 'wrap' }}>
                <div className="crm-card" style={{ flex: '1 1 200px' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--crm-text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Pacientes Ativos</div>
                  <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--crm-text-main)', marginTop: '4px' }}>{activePatients.length}</div>
                </div>
                <div className="crm-card" style={{ flex: '1 1 200px' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--crm-text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Consultas Hoje</div>
                  <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--crm-text-main)', marginTop: '4px' }}>{todayAppointments.length}</div>
                </div>
                <div className="crm-card" style={{ flex: '1 1 200px' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--crm-text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Engajamento Médio</div>
                  <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--crm-text-main)', marginTop: '4px' }}>{engagedPercentage}%</div>
                </div>
                <div className="crm-card" style={{ flex: '1 1 200px', borderLeft: atRiskPatients.length > 0 ? '3px solid var(--crm-warn)' : undefined }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--crm-text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Em Risco</div>
                  <div style={{ fontSize: '2rem', fontWeight: '700', color: atRiskPatients.length > 0 ? 'var(--crm-warn)' : 'var(--crm-text-main)', marginTop: '4px' }}>{atRiskPatients.length}</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginBottom: '32px' }}>
                <button className="crm-btn-primary" onClick={openNewPatientModal}><Plus size={18} /> Novo Paciente</button>
                <button className="crm-btn-secondary" onClick={() => setShowApptModal(true)}><Plus size={18} /> Novo Agendamento</button>
              </div>

              <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                <div className="crm-card" style={{ flex: '1 1 340px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Calendar size={18} color="var(--crm-accent)" /> Próximas Consultas</h3>
                    <button className="crm-nav-btn" style={{ fontSize: '0.82rem', padding: '4px 8px' }} onClick={() => setView('agenda')}>Ver agenda <ArrowRight size={14} /></button>
                  </div>
                  {todayAppointments.length === 0 ? (
                    <p style={{ color: 'var(--crm-text-muted)', fontSize: '0.9rem' }}>Nenhuma consulta agendada.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {todayAppointments.slice(0, 4).map(appt => {
                        const pat = patients.find(p => p.id === appt.patientId);
                        if (!pat) return null;
                        return (
                          <div key={appt.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--crm-border)' }}>
                            <div>
                              <div style={{ fontWeight: '600', fontSize: '0.92rem' }}>{pat.name}</div>
                              <div style={{ fontSize: '0.8rem', color: 'var(--crm-text-muted)' }}>{appt.type}</div>
                            </div>
                            <span style={{ fontWeight: '700', fontVariantNumeric: 'tabular-nums' }}>{appt.time}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="crm-card" style={{ flex: '1 1 340px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#B45A09' }}><AlertTriangle size={18} /> Atenção Necessária</h3>
                    <button className="crm-nav-btn" style={{ fontSize: '0.82rem', padding: '4px 8px' }} onClick={() => setView('cohorts')}>Ver cohorts <ArrowRight size={14} /></button>
                  </div>
                  {atRiskPatients.length === 0 ? (
                    <p style={{ color: 'var(--crm-text-muted)', fontSize: '0.9rem' }}>Nenhum paciente em risco no momento.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {atRiskPatients.slice(0, 4).map(p => (
                        <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--crm-border)' }}>
                          <span style={{ fontWeight: '600', fontSize: '0.92rem' }}>{p.name}</span>
                          <span className="crm-badge-orange">Perdendo Foco</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TABELA DE AGENDA */}
          {view === 'agenda' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                  <h1 style={{ fontSize: '1.8rem', fontWeight: '700', color: 'var(--crm-text-main)', marginBottom: '8px' }}>Agenda Clínica</h1>
                  <p style={{ color: 'var(--crm-text-muted)' }}>Controle seus agendamentos e inicie consultas.</p>
                </div>
                <button className="crm-btn-primary" onClick={() => setShowApptModal(true)}>
                  <Plus size={18} /> Novo Agendamento
                </button>
              </div>

              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                {[['todos', 'Todos'], ['agendado', 'Agendado'], ['concluido', 'Concluído']].map(([key, label]) => (
                  <button
                    key={key}
                    className={agendaStatusFilter === key ? 'crm-btn-primary' : 'crm-btn-secondary'}
                    style={{ padding: '6px 14px', fontSize: '0.85rem' }}
                    onClick={() => setAgendaStatusFilter(key)}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <WeeklyCalendar 
                appointments={filteredAppointments}
                patients={patients}
                clinicConfig={clinicConfig}
                startConsultation={startConsultation}
                cancelAppointment={cancelAppointment}
                onSlotClick={(date, time) => {
                  setApptDate(date);
                  setApptTime(time);
                  setShowApptModal(true);
                }}
              />
            </div>
          )}

          {/* TABELA DE PACIENTES */}
          {view === 'pacientes' && !viewingPatientId && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                  <h1 style={{ fontSize: '1.8rem', fontWeight: '700', color: 'var(--crm-text-main)', marginBottom: '8px' }}>Meus Pacientes</h1>
                  <p style={{ color: 'var(--crm-text-muted)' }}>Gestão do seu portfólio clínico.</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button className={copiedGeneralLink ? "crm-btn-primary" : "crm-btn-secondary"} style={{ display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.3s ease' }} onClick={() => {
                    if (!profile?.id) return alert('Perfil não carregado!');
                    const link = `${window.location.origin}/cadastro?nutri=${profile.id}`;
                    navigator.clipboard.writeText(link);
                    setCopiedGeneralLink(true);
                    setTimeout(() => setCopiedGeneralLink(false), 2000);
                  }}>
                    <LinkIcon size={18} /> {copiedGeneralLink ? 'Link Copiado!' : 'Link Geral de Convite'}
                  </button>
                  <button className="crm-btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={openNewPatientModal}>
                    <Plus size={18} /> Novo Paciente
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flex: '1 1 220px' }}>
                  <Search size={16} color="var(--crm-text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    className="crm-input"
                    style={{ paddingLeft: '36px' }}
                    placeholder="Buscar paciente por nome..."
                    value={patientSearch}
                    onChange={e => setPatientSearch(e.target.value)}
                  />
                </div>
                <select className="crm-input" style={{ width: 'auto' }} value={patientStatusFilter} onChange={e => setPatientStatusFilter(e.target.value)}>
                  <option value="todos">Todos os status</option>
                  <option value="engajado">Alto Engajamento</option>
                  <option value="em_risco">Perdendo Foco</option>
                  <option value="inativo">Inativo</option>
                </select>
              </div>

              <div className="crm-card">
                <table className="crm-table">
                  <thead>
                    <tr>
                      <th style={{ cursor: 'pointer' }} onClick={() => handleSort('name')}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>Nome {sortKey === 'name' && (sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}</span>
                      </th>
                      <th>Objetivo</th>
                      <th style={{ cursor: 'pointer' }} onClick={() => handleSort('streak')}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>Adesão App {sortKey === 'streak' && (sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}</span>
                      </th>
                      <th>Status</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedFilteredPatients.length === 0 && (
                      <tr><td colSpan="5" style={{ textAlign: 'center', color: 'var(--crm-text-muted)', padding: '32px 0' }}>Nenhum paciente encontrado.</td></tr>
                    )}
                    {sortedFilteredPatients.map(p => (
                      <tr key={p.id}>
                        <td style={{ fontWeight: '500' }}>{p.name}</td>
                        <td style={{ color: 'var(--crm-text-muted)', fontSize: '0.9rem' }}>{p.objective}</td>
                        <td>🔥 {p.streak} dias</td>
                        <td>
                          {p.status === 'engajado' && <span className="crm-badge-green">Alto Engajamento</span>}
                          {p.status === 'em_risco' && <span className="crm-badge-orange">Perdendo Foco</span>}
                          {p.status === 'inativo' && <span style={{ padding: '4px 10px', borderRadius: '16px', fontSize: '0.8rem', fontWeight: '600', backgroundColor: '#FEE2E2', color: '#EF4444' }}>Inativo</span>}
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button className="crm-btn-secondary" onClick={() => setViewingPatientId(p.id)} title="Ver Prontuário" style={{ padding: '6px' }}>
                              <Eye size={16} /> Ver
                            </button>
                            <button className="crm-btn-secondary" onClick={() => openEditPatientModal(p)} title="Editar" style={{ padding: '6px' }}>
                              <Edit3 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* VISÃO DO PRONTUÁRIO DO PACIENTE */}
          {view === 'pacientes' && viewingPatientId && viewedPatient && (
            <div className="animate-pop-in">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <button className="crm-nav-btn" onClick={() => { setViewingPatientId(null); setSynthesisResult(''); }}>
                  ← Voltar para Lista
                </button>
                <div style={{ display: 'flex', gap: '12px' }}>

                  <button className={copiedPatientLink ? "crm-btn-primary" : "crm-btn-secondary"} onClick={() => {
                    const link = `${window.location.origin}/paciente?vincular=${viewedPatient.id}`;
                    navigator.clipboard.writeText(link);
                    setCopiedPatientLink(true);
                    setTimeout(() => setCopiedPatientLink(false), 2000);
                  }} style={{ display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.3s ease' }}>
                    <LinkIcon size={16} /> {copiedPatientLink ? 'Link Copiado!' : 'Copiar Link'}
                  </button>
                  <button className="crm-btn-secondary" onClick={() => generatePatientSynthesis(viewedPatient)} disabled={isSynthesizing} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <BrainCircuit size={16} color="var(--crm-accent)" /> 
                    {isSynthesizing ? 'Analisando Histórico...' : 'Gerar Síntese Clínica (IA)'}
                  </button>
                  <button className="crm-btn-primary" onClick={() => startConsultation(viewedPatient.id, null)} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Play size={16} /> Iniciar Consulta Avulsa
                  </button>
                </div>
              </div>

              {synthesisError && (
                <div role="alert" className="crm-card animate-pop-in" style={{ marginBottom: '24px', borderLeft: '4px solid var(--crm-danger)', backgroundColor: '#FEF2F2', color: '#991B1B' }}>
                  {synthesisError}
                </div>
              )}

              {synthesisResult && (
                <div className="crm-card animate-pop-in" style={{ marginBottom: '24px', borderLeft: '4px solid var(--crm-accent)', backgroundColor: '#EFF6FF' }}>
                  <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: '#1E3A8A' }}>
                    <Sparkles size={20} /> Resumo Analítico da IA
                  </h3>
                  <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6', fontSize: '0.95rem', color: '#1E3A8A' }}>
                    {synthesisResult}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                <div className="crm-card" style={{ flex: '1 1 300px', backgroundColor: 'var(--crm-primary)', color: 'white' }}>
                  <h2 style={{ fontSize: '1.8rem', marginBottom: '8px', color: 'white' }}>{viewedPatient.name}</h2>
                  <p style={{ color: '#94a3b8', marginBottom: '24px' }}>Objetivo: {viewedPatient.objective}</p>
                  
                  <div style={{ display: 'flex', gap: '24px' }}>
                    <div>
                      <div style={{ fontSize: '0.85rem', color: '#94a3b8', textTransform: 'uppercase' }}>Ofensiva App</div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>🔥 {viewedPatient.streak} dias</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.85rem', color: '#94a3b8', textTransform: 'uppercase' }}>Gamificação</div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>💎 {viewedPatient.xp} XP</div>
                    </div>
                  </div>
                </div>

                <div className="crm-card" style={{ flex: '1 1 300px' }}>
                  <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                    <TrendingUp size={20} color="var(--crm-accent)" /> Histórico de Peso
                  </h3>
                  {viewedPatient.weights.length === 0 ? (
                    <p style={{ color: 'var(--crm-text-muted)' }}>Nenhuma medição registrada.</p>
                  ) : (
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                      {viewedPatient.weights.slice().reverse().map((w, idx) => (
                        <li key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--crm-border)' }}>
                          <span style={{ color: 'var(--crm-text-muted)' }}>{w.date}</span>
                          <strong style={{ fontSize: '1.1rem' }}>{w.value} kg</strong>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '24px', marginTop: '24px', flexWrap: 'wrap' }}>
                <div className="crm-card" style={{ flex: '2 1 400px' }}>
                  <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                    <Utensils size={20} color="var(--crm-accent)" /> Prescrições Dietéticas Ativas
                  </h3>
                  {viewedPatient.recipes.length === 0 ? (
                    <p style={{ color: 'var(--crm-text-muted)' }}>Nenhuma dieta cadastrada para este paciente.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {viewedPatient.recipes.map((r, idx) => (
                        <div key={idx} style={{ padding: '16px', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid var(--crm-border)' }}>
                          <strong style={{ fontSize: '1.1rem', display: 'block', marginBottom: '8px' }}>{r.title}</strong>
                          <ul style={{ margin: 0, paddingLeft: '20px', color: 'var(--crm-text-muted)', fontSize: '0.95rem' }}>
                            {r.meals?.map((m, midx) => (
                              <li key={midx} style={{ marginBottom: '8px' }}>
                                <strong>{m.name}:</strong> {m.desc}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="crm-card" style={{ flex: '1 1 400px' }}>
                  <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                    <Camera size={20} color="var(--crm-accent)" /> Diário Alimentar (Análises da IA)
                  </h3>
                  {(!viewedPatient.foodLogs || viewedPatient.foodLogs.length === 0) ? (
                    <p style={{ color: 'var(--crm-text-muted)' }}>Nenhuma refeição registrada com foto ainda.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '400px', overflowY: 'auto', paddingRight: '8px' }}>
                      {viewedPatient.foodLogs.slice().reverse().map((log, idx) => (
                        <div key={idx} style={{ padding: '16px', backgroundColor: '#F8FAFC', borderRadius: '8px', borderLeft: log.type === 'extra' ? '4px solid #F59E0B' : '4px solid var(--crm-accent)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <strong style={{ fontSize: '1rem', color: 'var(--crm-text-main)' }}>{log.mealName}</strong>
                            <span style={{ fontSize: '0.85rem', color: 'var(--crm-text-muted)' }}>{log.date} às {log.time}</span>
                          </div>
                          <div style={{ fontSize: '0.95rem', color: 'var(--crm-text-muted)', whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>
                            {log.log}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="crm-card" style={{ flex: '1 1 300px' }}>
                  <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                    <FileText size={20} color="var(--crm-accent)" /> Anotações do Prontuário
                  </h3>
                  <div style={{ padding: '16px', backgroundColor: '#FFFBEB', borderLeft: '4px solid #F59E0B', borderRadius: '4px', color: 'var(--crm-text-main)', fontSize: '0.95rem', whiteSpace: 'pre-wrap' }}>
                    {viewedPatient.records || 'Nenhuma anotação médica disponível.'}
                  </div>
                </div>

                <div className="crm-card" style={{ flex: '1 1 300px' }}>
                  <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                    <BookOpen size={20} color="var(--crm-accent)" /> Receitas Bônus
                  </h3>
                  {viewedPatient.bonusRecipes?.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
                      {viewedPatient.bonusRecipes.map(br => (
                        <div key={br.id} style={{ padding: '12px', border: '1px solid var(--crm-border)', borderRadius: '8px', backgroundColor: '#F8FAFC' }}>
                          <strong style={{ display: 'block', fontSize: '1rem', color: 'var(--crm-text-main)' }}>{br.title}</strong>
                          <span style={{ fontSize: '0.8rem', color: 'var(--crm-text-muted)' }}>Adicionado em {br.date}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ color: 'var(--crm-text-muted)', fontSize: '0.95rem', marginBottom: '16px' }}>O paciente ainda não possui receitas bônus.</p>
                  )}
                  <button className="crm-btn-primary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} onClick={() => setShowAttachRecipeModal(true)}>
                    <ChefHat size={16} /> Anexar Receita da Biblioteca
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* BIBLIOTECA DE DIETAS */}
          {view === 'biblioteca' && (
            <div className="animate-pop-in">
              {!showDietBuilder ? (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                    <div>
                      <h1 style={{ fontSize: '1.8rem', fontWeight: '700', color: 'var(--crm-text-main)', marginBottom: '8px' }}>Biblioteca de Dietas</h1>
                      <p style={{ color: 'var(--crm-text-muted)' }}>Gerencie seus templates de dieta reutilizáveis.</p>
                    </div>
                    <button className="crm-btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={initDietBuilder}>
                      <Plus size={16} /> Novo Template Day-by-Day
                    </button>
                  </div>

                  {dietTemplates?.length === 0 ? (
                    <div style={{ padding: '40px', textAlign: 'center', backgroundColor: '#F8FAFC', borderRadius: '12px', border: '2px dashed var(--crm-border)' }}>
                      <BookOpen size={48} color="var(--crm-text-muted)" style={{ marginBottom: '16px' }} />
                      <h3 style={{ color: 'var(--crm-text-main)', marginBottom: '8px' }}>Nenhum template salvo</h3>
                      <p style={{ color: 'var(--crm-text-muted)' }}>Você pode criar templates Day-by-Day clicando em "Novo Template".</p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                      {dietTemplates.map(tpl => (
                        <div key={tpl.id} className="crm-card" style={{ flex: '1 1 300px', padding: '24px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                            <h3 style={{ fontSize: '1.2rem', color: 'var(--crm-text-main)', margin: 0 }}>{tpl.title}</h3>
                            <button onClick={() => { if(window.confirm('Excluir template?')) deleteDietTemplate(tpl.id) }} style={{ background: 'none', border: 'none', color: 'var(--crm-danger)', cursor: 'pointer', padding: '4px' }} title="Excluir Template">
                              <Trash2 size={18} />
                            </button>
                          </div>
                          <div style={{ color: 'var(--crm-text-muted)', fontSize: '0.9rem', marginBottom: '16px' }}>
                            {tpl.duration ? `${tpl.duration} dias configurados` : (tpl.days ? `${tpl.days.length} dias configurados` : `${tpl.meals?.length || 0} refeições`)}
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '150px', overflowY: 'auto' }}>
                            {/* Mostrar preview do dia 1 ou refeições antigas */}
                            {tpl.days ? (
                              tpl.days[0].meals.map((m, midx) => (
                                <div key={midx} style={{ fontSize: '0.85rem', color: 'var(--crm-text-main)' }}>
                                  <strong>{m.name}:</strong> <span style={{ color: 'var(--crm-text-muted)' }}>{m.desc?.length > 50 ? m.desc.substring(0, 50) + '...' : m.desc}</span>
                                </div>
                              ))
                            ) : (
                              tpl.meals?.map((m, midx) => (
                                <div key={midx} style={{ fontSize: '0.85rem', color: 'var(--crm-text-main)' }}>
                                  <strong>{m.name}:</strong> <span style={{ color: 'var(--crm-text-muted)' }}>{m.desc?.length > 50 ? m.desc.substring(0, 50) + '...' : m.desc}</span>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid var(--crm-border)', paddingBottom: '16px' }}>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label className="crm-label">Nome do Template</label>
                        <input type="text" className="crm-input-modern" placeholder="Ex: Dieta Hipertrofia..." value={dietBuilderTitle} onChange={e => setDietBuilderTitle(e.target.value)} style={{ width: '300px' }} />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label className="crm-label">Duração</label>
                        <select className="crm-input-modern" value={dietBuilderDuration} onChange={e => {
                          const val = Number(e.target.value);
                          setDietBuilderDuration(val);
                          generateInitialDietDays(val);
                          setSelectedDayIndex(1);
                        }}>
                          <option value={7}>7 Dias</option>
                          <option value={30}>30 Dias</option>
                        </select>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button className="crm-btn-secondary" onClick={() => setShowDietBuilder(false)}>Cancelar</button>
                      <button className="crm-btn-primary" onClick={handleSaveDietBuilder}>Salvar Template</button>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
                    {/* Menu Lateral de Dias */}
                    <div style={{ flex: '0 0 150px', display: 'flex', flexDirection: 'column', gap: '4px', borderRight: '1px solid var(--crm-border)', paddingRight: '16px', maxHeight: '600px', overflowY: 'auto' }}>
                      {dietBuilderDays.map(d => (
                        <button key={d.dayIndex} 
                          onClick={() => setSelectedDayIndex(d.dayIndex)}
                          style={{
                            padding: '10px 16px',
                            textAlign: 'left',
                            borderRadius: '8px',
                            border: 'none',
                            backgroundColor: selectedDayIndex === d.dayIndex ? 'var(--crm-primary)' : 'transparent',
                            color: selectedDayIndex === d.dayIndex ? 'white' : 'var(--crm-text-main)',
                            fontWeight: selectedDayIndex === d.dayIndex ? 'bold' : 'normal',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}>
                          Dia {d.dayIndex}
                        </button>
                      ))}
                    </div>

                    {/* Conteúdo do Dia */}
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <h2 style={{ fontSize: '1.4rem' }}>Cardápio - Dia {selectedDayIndex}</h2>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          {dietBuilderMessage && <span style={{ color: 'var(--crm-good)', fontSize: '0.82rem', fontWeight: 600 }}>{dietBuilderMessage}</span>}
                          {selectedDayIndex !== 1 && (
                            <button className="crm-btn-secondary" onClick={handleCopyDay1} style={{ fontSize: '0.85rem', padding: '6px 12px' }}>
                              Copiar do Dia 1 para todos
                            </button>
                          )}
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {dietBuilderDays[selectedDayIndex - 1]?.meals.map((meal, midx) => (
                          <div key={midx} style={{ padding: '16px', border: '1px solid var(--crm-border)', borderRadius: '8px', backgroundColor: '#F8FAFC' }}>
                            <div style={{ display: 'flex', gap: '16px', marginBottom: '12px' }}>
                              <input type="time" className="crm-input-modern" value={meal.time || ''} onChange={e => handleUpdateMeal(selectedDayIndex-1, midx, 'time', e.target.value)} style={{ width: '120px' }} />
                              <input type="text" className="crm-input-modern" value={meal.name} onChange={e => handleUpdateMeal(selectedDayIndex-1, midx, 'name', e.target.value)} placeholder="Nome da Refeição" style={{ flex: 1 }} />
                              <button onClick={() => {
                                setDietBuilderDays(prev => {
                                  const newDays = [...prev];
                                  newDays[selectedDayIndex-1].meals.splice(midx, 1);
                                  return newDays;
                                });
                              }} style={{ background: 'none', border: 'none', color: 'var(--crm-danger)', cursor: 'pointer' }}>
                                <Trash2 size={18} />
                              </button>
                            </div>
                            <textarea className="crm-input-modern" rows="3" value={meal.desc} onChange={e => handleUpdateMeal(selectedDayIndex-1, midx, 'desc', e.target.value)} placeholder="Opções e alimentos..." style={{ width: '100%' }} />
                          </div>
                        ))}
                      </div>
                      
                      <button className="crm-btn-secondary" onClick={() => handleAddMeal(selectedDayIndex - 1)} style={{ marginTop: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Plus size={16} /> Adicionar Refeição Extra
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* BIBLIOTECA DE RECEITAS */}
          {view === 'receitas' && (
            <div className="animate-pop-in">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                  <h1 style={{ fontSize: '1.8rem', fontWeight: '700', color: 'var(--crm-text-main)', marginBottom: '8px' }}>Biblioteca de Receitas</h1>
                  <p style={{ color: 'var(--crm-text-muted)' }}>Crie, importe e acesse suas receitas favoritas para anexar aos pacientes.</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button className="crm-btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={async () => {
                    setIsGeneratingRecipe(true);
                    try {
                      const response = await fetch('/api/openai-bridge', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          system_prompt: "Você é um chef e nutricionista de alta gastronomia saudável. Retorne APENAS um JSON válido com o seguinte formato: { \"title\": \"Nome da Receita\", \"description\": \"Descrição\", \"ingredients\": [\"Ingrediente 1\", \"Ingrediente 2\"], \"instructions\": \"Passo a passo\" }",
                          messages: [{ role: "user", content: "Crie uma receita saudável, rápida e inovadora." }],
                          format_json: true
                        })
                      });
                      if (!response.ok) throw new Error("Erro na API.");
                      const data = await response.json();
                      const parsed = JSON.parse(data.choices[0].message.content);
                      setRecipeTitle(parsed.title || '');
                      setRecipeDescription(parsed.description || '');
                      setRecipeIngredients(Array.isArray(parsed.ingredients) ? parsed.ingredients.join('\n') : (parsed.ingredients || ''));
                      setRecipeInstructions(parsed.instructions || '');
                    } catch(e) {
                      console.error(e);
                      // Fallback mock
                      setRecipeTitle('Bowl de Frutas Vermelhas com Chia (IA Fallback)');
                      setRecipeDescription('Receita leve, rica em antioxidantes e fácil de preparar.');
                      setRecipeIngredients('1 xícara de frutas vermelhas congeladas\n2 colheres de sopa de chia\n150ml de leite vegetal\n1 colher de mel');
                      setRecipeInstructions('1. Bata as frutas com o leite.\n2. Misture a chia e deixe descansar por 2 horas.\n3. Sirva gelado com um fio de mel.');
                    } finally {
                      setIsGeneratingRecipe(false);
                      setShowRecipeModal(true);
                    }
                  }}>
                    <Sparkles size={16} /> Gerar com IA
                  </button>
                  <button className="crm-btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => {
                    setRecipeTitle(''); setRecipeDescription(''); setRecipeIngredients(''); setRecipeInstructions('');
                    setShowRecipeModal(true);
                  }}>
                    <Plus size={16} /> Nova Receita
                  </button>
                </div>
              </div>

              {isGeneratingRecipe && (
                <div style={{ padding: '24px', textAlign: 'center', backgroundColor: '#EFF6FF', borderRadius: '12px', border: '1px solid #BFDBFE', marginBottom: '24px' }}>
                  <Sparkles size={32} color="#3B82F6" className="animate-pulse" style={{ marginBottom: '16px' }} />
                  <div style={{ color: '#1D4ED8', fontWeight: '600' }}>A Inteligência Artificial está criando uma nova receita criativa...</div>
                </div>
              )}

              {recipeLibrary?.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', backgroundColor: '#F8FAFC', borderRadius: '12px', border: '2px dashed var(--crm-border)' }}>
                  <ChefHat size={48} color="var(--crm-text-muted)" style={{ marginBottom: '16px' }} />
                  <h3 style={{ color: 'var(--crm-text-main)', marginBottom: '8px' }}>Nenhuma receita salva</h3>
                  <p style={{ color: 'var(--crm-text-muted)' }}>Comece criando uma receita manualmente ou peça ajuda da IA.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                  {recipeLibrary.map(rec => (
                    <div key={rec.id} className="crm-card" style={{ flex: '1 1 300px', padding: '24px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                        <h3 style={{ fontSize: '1.2rem', color: 'var(--crm-text-main)', margin: 0 }}>{rec.title}</h3>
                        <button onClick={() => { if(window.confirm('Excluir receita?')) deleteLibraryRecipe(rec.id) }} style={{ background: 'none', border: 'none', color: 'var(--crm-danger)', cursor: 'pointer', padding: '4px' }} title="Excluir">
                          <Trash2 size={18} />
                        </button>
                      </div>
                      <p style={{ fontSize: '0.9rem', color: 'var(--crm-text-muted)', marginBottom: '16px' }}>{rec.description}</p>
                      <div style={{ fontSize: '0.85rem', color: 'var(--crm-text-main)' }}>
                        <strong style={{ display: 'block', marginBottom: '4px' }}>Ingredientes ({rec.ingredients?.length || 0}):</strong>
                        <ul style={{ paddingLeft: '20px', color: 'var(--crm-text-muted)', marginBottom: '12px', margin: 0 }}>
                          {rec.ingredients?.slice(0, 3).map((ing, i) => <li key={i}>{ing}</li>)}
                          {rec.ingredients?.length > 3 && <li>...</li>}
                        </ul>
                        <strong style={{ display: 'block', marginBottom: '4px' }}>Preparo:</strong>
                        <div style={{ color: 'var(--crm-text-muted)', whiteSpace: 'pre-wrap' }}>
                          {rec.instructions?.length > 80 ? rec.instructions.substring(0, 80) + '...' : rec.instructions}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TELA DE COHORTS / INTELIGÊNCIA */}
          {view === 'cohorts' && (
            <div className="animate-pop-in">
              <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '1.8rem', fontWeight: '700', color: 'var(--crm-text-main)', marginBottom: '8px' }}>Dashboard de Retenção</h1>
                <p style={{ color: 'var(--crm-text-muted)' }}>Métricas em tempo real de gamificação e risco de abandono.</p>
              </div>

              {/* KPIs de Gamificação */}
              <div style={{ display: 'flex', gap: '24px', marginBottom: '32px', flexWrap: 'wrap' }}>
                <div className="crm-card" style={{ flex: '1 1 200px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ padding: '16px', backgroundColor: '#EFF6FF', borderRadius: '50%', color: '#3B82F6' }}>
                    <Zap size={32} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--crm-text-muted)', fontWeight: '600' }}>Ofensiva Média</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--crm-text-main)' }}>🔥 {avgStreak} dias</div>
                  </div>
                </div>
                
                <div className="crm-card" style={{ flex: '1 1 200px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ padding: '16px', backgroundColor: '#ECFDF5', borderRadius: '50%', color: '#10B981' }}>
                    <Activity size={32} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--crm-text-muted)', fontWeight: '600' }}>Engajamento Alto</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--crm-text-main)' }}>{engagedPercentage}%</div>
                  </div>
                </div>

                <div className="crm-card" style={{ flex: '1 1 200px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ padding: '16px', backgroundColor: '#FEFCE8', borderRadius: '50%', color: '#EAB308' }}>
                    <Star size={32} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--crm-text-muted)', fontWeight: '600' }}>XP Total da Clínica</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--crm-text-main)' }}>💎 {totalXP}</div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', marginBottom: '32px' }}>
                
                {/* LEADERBOARD */}
                <div className="crm-card" style={{ flex: '1 1 300px' }}>
                  <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', color: 'var(--crm-text-main)' }}>
                    <Trophy size={20} color="#EAB308" /> Leaderboard de Pacientes
                  </h3>
                  
                  {topEngagedPatients.length === 0 ? (
                    <p style={{ color: 'var(--crm-text-muted)' }}>Nenhum paciente ativo com XP.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {topEngagedPatients.map((p, idx) => (
                        <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '12px', backgroundColor: idx === 0 ? '#FEFCE8' : '#F8FAFC', borderRadius: '8px', border: idx === 0 ? '1px solid #FEF08A' : '1px solid var(--crm-border)' }}>
                          <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: idx === 0 ? '#EAB308' : '#CBD5E1', color: idx === 0 ? 'white' : '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.1rem' }}>
                            {idx + 1}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: '600', color: 'var(--crm-text-main)' }}>{p.name}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--crm-text-muted)' }}>🔥 {p.streak} dias de foco</div>
                          </div>
                          <div style={{ fontWeight: 'bold', color: '#EAB308', fontSize: '1.2rem' }}>
                            {p.xp} XP
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* PACIENTES EM RISCO DE CHURN */}
                <div className="crm-card" style={{ flex: '2 1 400px', backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5' }}>
                  <h3 style={{ color: '#DC2626', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                    <AlertTriangle size={20} /> Pacientes em Risco de Abandono (Churn)
                  </h3>
                  <p style={{ color: '#991B1B', marginBottom: '16px', fontSize: '0.95rem' }}>O Vytal identificou pacientes com queda abrupta de engajamento na última semana.</p>
                  {churnAlertMessage && (
                    <div role="status" style={{ marginBottom: '16px', padding: '10px 14px', backgroundColor: '#FFFFFF', border: '1px solid #FCA5A5', borderRadius: '8px', color: '#991B1B', fontSize: '0.85rem' }}>
                      {churnAlertMessage}
                    </div>
                  )}
                  <table className="crm-table">
                    <thead>
                      <tr>
                        <th>Paciente</th>
                        <th>Último Peso</th>
                        <th>Dias sem logar</th>
                        <th>Ação Recomendada</th>
                      </tr>
                    </thead>
                    <tbody>
                      {patients.filter(p => p.status === 'em_risco' || p.status === 'inativo').map(p => (
                        <tr key={p.id}>
                          <td style={{ fontWeight: '500' }}>{p.name}</td>
                          <td>{p.weights && p.weights.length > 0 ? p.weights[p.weights.length - 1].value + ' kg' : 'N/A'}</td>
                          <td style={{ color: '#DC2626', fontWeight: 'bold' }}>{p.streak === 0 ? '7+ dias' : `${3 - p.streak} dias`}</td>
                          <td>
                            <button className="crm-btn-primary" style={{ backgroundColor: '#DC2626', fontSize: '0.85rem', padding: '6px 12px' }} onClick={() => handleSendChurnAlert(p)}>
                              Enviar Alerta
                            </button>
                          </td>
                        </tr>
                      ))}
                      {patients.filter(p => p.status === 'em_risco' || p.status === 'inativo').length === 0 && (
                        <tr><td colSpan="4" style={{ textAlign: 'center', color: '#991B1B' }}>Nenhum paciente em risco no momento.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>

              </div>
            </div>
          )}

          {/* TELA DE CONFIGURAÇÕES / WHITE-LABEL / BILLING */}
          {view === 'settings' && (
            <div className="animate-pop-in">
              <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '1.8rem', fontWeight: '700', color: 'var(--crm-text-main)', marginBottom: '8px' }}>Configurações</h1>
                <p style={{ color: 'var(--crm-text-muted)' }}>Gerencie suas preferências, agenda e assinatura.</p>
              </div>

              <div className="settings-container">
                <div className="settings-sidebar">
                  <button className={`settings-nav-item ${activeSettingsTab === 'perfil' ? 'active' : ''}`} onClick={() => setActiveSettingsTab('perfil')}>
                    <UserCog size={18} /> Perfil Profissional
                  </button>
                  <button className={`settings-nav-item ${activeSettingsTab === 'agenda' ? 'active' : ''}`} onClick={() => setActiveSettingsTab('agenda')}>
                    <Calendar size={18} /> Configuração de Agenda
                  </button>
                  <button className={`settings-nav-item ${activeSettingsTab === 'whitelabel' ? 'active' : ''}`} onClick={() => setActiveSettingsTab('whitelabel')}>
                    <Palette size={18} /> Identidade Visual
                  </button>
                  <button className={`settings-nav-item ${activeSettingsTab === 'assinatura' ? 'active' : ''}`} onClick={() => setActiveSettingsTab('assinatura')}>
                    <CreditCard size={18} /> Plano e Assinatura
                  </button>
                </div>

                <div className="settings-content">
                  {activeSettingsTab === 'perfil' && (
                    <div>
                      <div className="settings-content-header">
                        <h2>Perfil do Profissional</h2>
                        <p>Essas informações aparecem em relatórios e documentos gerados para os pacientes.</p>
                      </div>
                      <form onSubmit={handleSaveProfessionalProfile}>
                        <div className="settings-fieldset">
                          <label className="crm-label">Nome Completo</label>
                          <input type="text" className="crm-input-modern" placeholder="Dra. Ana Souza" value={profName} onChange={e => setProfName(e.target.value)} />
                        </div>
                        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                          <div style={{ flex: 1 }}>
                            <label className="crm-label">CRN</label>
                            <input type="text" className="crm-input-modern" placeholder="CRN-3 12345" value={profCrn} onChange={e => setProfCrn(e.target.value)} />
                          </div>
                          <div style={{ flex: 1 }}>
                            <label className="crm-label">Especialidade</label>
                            <input type="text" className="crm-input-modern" placeholder="Nutrição Clínica" value={profSpecialty} onChange={e => setProfSpecialty(e.target.value)} />
                          </div>
                        </div>
                        <button type="submit" className="crm-btn-primary">Salvar Perfil</button>
                        {profSaved && <p style={{ color: 'var(--crm-good)', fontSize: '0.85rem', fontWeight: 600, marginTop: '16px' }}>Perfil salvo com sucesso!</p>}
                      </form>
                    </div>
                  )}

                  {activeSettingsTab === 'agenda' && (
                    <div>
                      <div className="settings-content-header">
                        <h2>Configuração de Agenda</h2>
                        <p>Defina seus horários, dias úteis e bloqueios de calendário.</p>
                      </div>
                      <div className="settings-fieldset">
                        <label className="crm-label">Dias de Atendimento</label>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((dia, idx) => {
                            const isSelected = clinicConfig.scheduleConfig?.workingDays?.includes(idx);
                            return (
                              <button 
                                key={idx}
                                type="button"
                                className={`settings-pill ${isSelected ? 'active' : ''}`}
                                onClick={() => {
                                  const wd = clinicConfig.scheduleConfig?.workingDays || [];
                                  const newWd = isSelected ? wd.filter(d => d !== idx) : [...wd, idx];
                                  updateClinicConfig({ scheduleConfig: { ...clinicConfig.scheduleConfig, workingDays: newWd } });
                                }}
                              >
                                {dia}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '24px', marginBottom: '24px' }}>
                        <div style={{ flex: 1 }}>
                          <label className="crm-label">Hora Início (ex: 9)</label>
                          <input type="number" className="crm-input-modern" value={clinicConfig.scheduleConfig?.startHour || ''} onChange={e => updateClinicConfig({ scheduleConfig: { ...clinicConfig.scheduleConfig, startHour: parseInt(e.target.value) } })} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <label className="crm-label">Hora Fim (ex: 18)</label>
                          <input type="number" className="crm-input-modern" value={clinicConfig.scheduleConfig?.endHour || ''} onChange={e => updateClinicConfig({ scheduleConfig: { ...clinicConfig.scheduleConfig, endHour: parseInt(e.target.value) } })} />
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '24px', marginBottom: '24px' }}>
                        <div style={{ flex: 1 }}>
                          <label className="crm-label">Início do Almoço</label>
                          <input type="time" className="crm-input-modern" value={clinicConfig.scheduleConfig?.lunchStart || '12:00'} onChange={e => updateClinicConfig({ scheduleConfig: { ...clinicConfig.scheduleConfig, lunchStart: e.target.value } })} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <label className="crm-label">Fim do Almoço</label>
                          <input type="time" className="crm-input-modern" value={clinicConfig.scheduleConfig?.lunchEnd || '13:00'} onChange={e => updateClinicConfig({ scheduleConfig: { ...clinicConfig.scheduleConfig, lunchEnd: e.target.value } })} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <label className="crm-label">Duração da Consulta</label>
                          <select className="crm-input-modern" value={clinicConfig.scheduleConfig?.slotInterval || 30} onChange={e => updateClinicConfig({ scheduleConfig: { ...clinicConfig.scheduleConfig, slotInterval: parseInt(e.target.value) } })}>
                            <option value={30}>30 minutos</option>
                            <option value={60}>1 hora</option>
                          </select>
                        </div>
                      </div>
                      <div className="settings-fieldset" style={{ borderTop: '1px solid var(--crm-border)', paddingTop: '24px' }}>
                        <label className="crm-label">Bloquear Data Específica</label>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                          <input type="date" className="crm-input-modern" id="blockDateInput" style={{ maxWidth: '200px' }} />
                          <button className="crm-btn-primary" onClick={() => {
                            const dt = document.getElementById('blockDateInput').value;
                            if (dt) {
                              const bd = clinicConfig.scheduleConfig?.blockedDates || [];
                              if (!bd.includes(dt)) {
                                updateClinicConfig({ scheduleConfig: { ...clinicConfig.scheduleConfig, blockedDates: [...bd, dt] } });
                              }
                              document.getElementById('blockDateInput').value = '';
                            }
                          }}>Bloquear Data</button>
                        </div>
                        {clinicConfig.scheduleConfig?.blockedDates?.length > 0 && (
                          <div style={{ marginTop: '16px', backgroundColor: '#f8fafc', padding: '16px', borderRadius: '8px' }}>
                            <strong style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Datas Bloqueadas:</strong>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                              {clinicConfig.scheduleConfig.blockedDates.map(bd => (
                                <li key={bd} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #e2e8f0' }}>
                                  <span style={{ fontWeight: 500 }}>{bd.split('-').reverse().join('/')}</span>
                                  <button onClick={() => {
                                    const newBd = clinicConfig.scheduleConfig.blockedDates.filter(d => d !== bd);
                                    updateClinicConfig({ scheduleConfig: { ...clinicConfig.scheduleConfig, blockedDates: newBd } });
                                  }} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem' }}>
                                    <Trash2 size={14} /> Remover
                                  </button>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {activeSettingsTab === 'whitelabel' && (
                    <div>
                      <div className="settings-content-header">
                        <h2>Identidade Visual (White-Label)</h2>
                        <p>Personalize o Vytal com as cores e nome da sua clínica.</p>
                      </div>
                      <div className="settings-fieldset">
                        <label className="crm-label">Nome da Clínica</label>
                        <input type="text" className="crm-input-modern" value={clinicConfig?.name || ''} onChange={e => updateClinicConfig({ name: e.target.value })} />
                      </div>
                      <div className="settings-fieldset">
                        <label className="crm-label">Cor Principal da Marca</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', backgroundColor: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid var(--crm-border)' }}>
                          <input type="color" value={clinicConfig?.primaryColor || '#2563eb'} onChange={e => updateClinicConfig({ primaryColor: e.target.value })} style={{ width: '48px', height: '48px', padding: '0', border: 'none', borderRadius: '8px', cursor: 'pointer' }} />
                          <div>
                            <div style={{ fontFamily: 'monospace', fontSize: '1.1rem', fontWeight: 600 }}>{clinicConfig?.primaryColor}</div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--crm-text-muted)' }}>Utilizado em botões e destaques do app do paciente.</div>
                          </div>
                        </div>
                      </div>
                      <button className="crm-btn-primary" onClick={() => alert('Configurações salvas e aplicadas!')}>
                        Aplicar Identidade Visual
                      </button>
                    </div>
                  )}

                  {activeSettingsTab === 'assinatura' && (
                    <div>
                      <div className="settings-content-header">
                        <h2>Assinatura e Faturamento</h2>
                        <p>Gerencie o plano da sua conta Vytal.</p>
                      </div>
                      
                      <div style={{ padding: '24px', backgroundColor: '#F8FAFC', borderRadius: '12px', border: '1px solid var(--crm-border)', marginBottom: '32px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                          <div>
                            <div style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--crm-text-muted)', fontWeight: 600, marginBottom: '4px' }}>Plano Atual</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--crm-text-main)' }}>Grátis (Trial)</div>
                          </div>
                          <span className="crm-badge-orange">Expirando em 3 dias</span>
                        </div>
                        <p style={{ color: 'var(--crm-text-muted)', fontSize: '0.95rem', margin: 0 }}>Você usou 3 de 5 pacientes gratuitos.</p>
                      </div>
                      
                      <div style={{ border: '1px solid var(--crm-border)', borderRadius: '12px', overflow: 'hidden' }}>
                        <div style={{ padding: '24px', borderBottom: '1px solid var(--crm-border)' }}>
                          <h4 style={{ fontWeight: '700', fontSize: '1.2rem', marginBottom: '8px' }}>Vytal Premium</h4>
                          <p style={{ color: 'var(--crm-text-muted)', fontSize: '0.95rem', margin: 0 }}>Pacientes ilimitados, White-label completo, relatórios customizados e IA preditiva de Cohorts.</p>
                        </div>
                        <div style={{ padding: '24px', backgroundColor: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>R$ 149<span style={{ fontSize: '1rem', color: 'var(--crm-text-muted)', fontWeight: 500 }}>/mês</span></div>
                          </div>
                          <button className="crm-btn-primary" style={{ padding: '12px 24px', fontSize: '1rem' }} onClick={() => alert('Em breve — o checkout de pagamento via Stripe será aberto aqui.')}>
                            Assinar Agora
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {showApptModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div className="crm-card" style={{ width: '400px', animation: 'popIn 0.2s ease-out' }}>
            <h3 style={{ marginBottom: '24px' }}>Novo Agendamento</h3>
            <form onSubmit={handleCreateAppointment}>
              <div style={{ marginBottom: '16px' }}>
                <label className="crm-label">Paciente</label>
                <select className="crm-input" value={apptPatientId} onChange={e => setApptPatientId(e.target.value)} required>
                  <option value="" disabled>Selecione...</option>
                  {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label className="crm-label">Data</label>
                  <input type="date" className="crm-input" value={apptDate} onChange={e => setApptDate(e.target.value)} required />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="crm-label">Horário</label>
                  <select className="crm-input" value={apptTime} onChange={e => setApptTime(e.target.value)} required>
                    <option value="" disabled>Selecione...</option>
                    {(() => {
                      const startH = clinicConfig.scheduleConfig?.startHour || 8;
                      const endH = clinicConfig.scheduleConfig?.endHour || 18;
                      const interval = clinicConfig.scheduleConfig?.slotInterval || 30;
                      const options = [];
                      for (let h = startH; h < endH; h++) {
                        const hr = h.toString().padStart(2, '0');
                        options.push(<option key={`${hr}:00`} value={`${hr}:00`}>{hr}:00</option>);
                        if (interval === 30) {
                          options.push(<option key={`${hr}:30`} value={`${hr}:30`}>{hr}:30</option>);
                        }
                      }
                      return options;
                    })()}
                  </select>
                </div>
              </div>
              <div style={{ marginBottom: '24px' }}>
                <label className="crm-label">Tipo de Consulta</label>
                <select className="crm-input" value={apptType} onChange={e => setApptType(e.target.value)}>
                  <option>Primeira Consulta</option>
                  <option>Retorno</option>
                  <option>Avaliação Expressa</option>
                </select>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" className="crm-btn-secondary" onClick={() => setShowApptModal(false)}>Cancelar</button>
                <button type="submit" className="crm-btn-primary">Salvar Agendamento</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showPatientModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div className="crm-card" style={{ width: '400px', animation: 'popIn 0.2s ease-out' }}>
            <h3 style={{ marginBottom: '24px' }}>{editingPatient ? 'Editar Paciente' : 'Novo Paciente'}</h3>
            <form onSubmit={handleSavePatient}>
              <div style={{ marginBottom: '16px' }}>
                <label className="crm-label">Nome Completo</label>
                <input type="text" className="crm-input" value={patName} onChange={e => setPatName(e.target.value)} required />
              </div>
              <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label className="crm-label">CPF</label>
                  <input type="text" className="crm-input" placeholder="000.000.000-00" value={patCpf} onChange={e => setPatCpf(e.target.value)} />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="crm-label">E-mail</label>
                  <input type="email" className="crm-input" placeholder="email@paciente.com" value={patEmail} onChange={e => setPatEmail(e.target.value)} />
                </div>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label className="crm-label">Objetivo Clínico</label>
                <input type="text" className="crm-input" placeholder="Ex: Emagrecimento, Hipertrofia..." value={patObj} onChange={e => setPatObj(e.target.value)} required />
              </div>
              <div style={{ marginBottom: '24px' }}>
                <label className="crm-label">Restrições (Opcional)</label>
                <input type="text" className="crm-input" placeholder="Ex: Sem lactose, Vegano..." value={patRest} onChange={e => setPatRest(e.target.value)} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {editingPatient ? (
                  <button type="button" onClick={() => handleDeletePatient(editingPatient)} style={{ background: 'none', border: 'none', color: 'var(--crm-danger)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', fontWeight: 'bold' }}>
                    <Trash2 size={16} /> Excluir Paciente
                  </button>
                ) : <div />}
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button type="button" className="crm-btn-secondary" onClick={() => setShowPatientModal(false)}>Cancelar</button>
                  <button type="submit" className="crm-btn-primary">Salvar Paciente</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {showRecipeModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div className="crm-card" style={{ width: '500px', animation: 'popIn 0.2s ease-out' }}>
            <h3 style={{ marginBottom: '24px' }}>Nova Receita</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              addLibraryRecipe(recipeTitle, recipeDescription, recipeIngredients.split('\n').filter(i=>i.trim()), recipeInstructions, []);
              setShowRecipeModal(false);
            }}>
              <div style={{ marginBottom: '16px' }}>
                <label className="crm-label">Título da Receita</label>
                <input type="text" className="crm-input" value={recipeTitle} onChange={e => setRecipeTitle(e.target.value)} required placeholder="Ex: Suco Verde Detox" />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label className="crm-label">Breve Descrição</label>
                <input type="text" className="crm-input" value={recipeDescription} onChange={e => setRecipeDescription(e.target.value)} placeholder="Ex: Ótimo para começar o dia" />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label className="crm-label">Ingredientes (Um por linha)</label>
                <textarea className="crm-input" rows="4" value={recipeIngredients} onChange={e => setRecipeIngredients(e.target.value)} required placeholder="1 maçã&#10;1 folha de couve..." />
              </div>
              <div style={{ marginBottom: '24px' }}>
                <label className="crm-label">Modo de Preparo</label>
                <textarea className="crm-input" rows="4" value={recipeInstructions} onChange={e => setRecipeInstructions(e.target.value)} required placeholder="Bata tudo no liquidificador..." />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" className="crm-btn-secondary" onClick={() => setShowRecipeModal(false)}>Cancelar</button>
                <button type="submit" className="crm-btn-primary">Salvar na Biblioteca</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAttachRecipeModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div className="crm-card" style={{ width: '400px', animation: 'popIn 0.2s ease-out' }}>
            <h3 style={{ marginBottom: '24px' }}>Anexar Receita a {viewedPatient?.name.split(' ')[0]}</h3>
            {recipeLibrary?.length === 0 ? (
              <p style={{ color: 'var(--crm-text-muted)' }}>Sua biblioteca de receitas está vazia.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '300px', overflowY: 'auto', marginBottom: '24px' }}>
                {recipeLibrary.map(rec => (
                  <div key={rec.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', border: '1px solid var(--crm-border)', borderRadius: '8px' }}>
                    <strong style={{ fontSize: '0.95rem' }}>{rec.title}</strong>
                    <button className="crm-btn-primary" style={{ padding: '6px 12px', fontSize: '0.85rem' }} onClick={() => {
                      addBonusRecipe(viewedPatient.id, rec.title, `Ingredientes:\n${rec.ingredients?.join('\n')}\n\nPreparo:\n${rec.instructions}`);
                      setShowAttachRecipeModal(false);
                    }}>
                      Anexar
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="button" className="crm-btn-secondary" onClick={() => setShowAttachRecipeModal(false)}>Fechar</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
