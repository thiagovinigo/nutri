import React, { useState, useMemo } from 'react';
import { Users, Calendar, PlayCircle, Trash2, Plus, Eye, Edit3, TrendingUp, Utensils, FileText, BrainCircuit, Play, Sparkles, Activity, Settings, CreditCard, Palette, AlertTriangle, Trophy, Star, Zap, LayoutDashboard, Search, ChevronUp, ChevronDown, ArrowRight, UserCog, BookOpen, ChefHat, Link as LinkIcon, Camera, Upload, Moon } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../../context/AppContext';
import WeeklyCalendar from './WeeklyCalendar';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

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
  patName, setPatName, patObj, setPatObj, patRest, setPatRest, patCpf, setPatCpf, patEmail, setPatEmail, patAge, setPatAge, patGender, setPatGender, patAversions, setPatAversions, patMedications, setPatMedications, handleSavePatient,
  viewingPatientId, setViewingPatientId,
  synthesisResult, setSynthesisResult, isSynthesizing, generatePatientSynthesis, synthesisError,
  addNotification, addExam,
  dietTemplates, deleteDietTemplate,
  recipeLibrary, addLibraryRecipe, deleteLibraryRecipe,
  directMessages, sendDirectMessage,
  addBonusRecipe,
  clinicConfig, updateClinicConfig
}) {
  const navigate = useNavigate();
  const { profile, updatePatient } = useAppContext();
  const viewedPatient = patients.find(p => p.id === viewingPatientId);

  const [copiedGeneralLink, setCopiedGeneralLink] = useState(false);
  const [copiedPatientLink, setCopiedPatientLink] = useState(false);
  const [foodDiaryDate, setFoodDiaryDate] = useState(new Date());
  const [prontuarioTab, setProntuarioTab] = useState('resumo');
  const [protocoloSubTab, setProtocoloSubTab] = useState('dieta');
  const [historicoSubTab, setHistoricoSubTab] = useState('anamnese');
  const [selectedHistoryIdx, setSelectedHistoryIdx] = useState(null);
  
  const [editingMealPath, setEditingMealPath] = useState(null); // { rIdx, mIdx }
  const [editingMealDesc, setEditingMealDesc] = useState('');
  
  const [chatInput, setChatInput] = useState('');

  const handleDeleteActiveRecipe = (rIdx) => {
    if(window.confirm('Tem certeza que deseja excluir toda essa prescrição?')) {
      const newRecipes = viewedPatient.recipes.filter((_, i) => i !== rIdx);
      updatePatient(viewedPatient.id, { recipes: newRecipes });
    }
  };

  const handleDeleteActiveMeal = (rIdx, mIdx) => {
    if(window.confirm('Tem certeza que deseja excluir esta refeição?')) {
      const newRecipes = [...viewedPatient.recipes];
      newRecipes[rIdx].meals = newRecipes[rIdx].meals.filter((_, i) => i !== mIdx);
      updatePatient(viewedPatient.id, { recipes: newRecipes });
    }
  };

  const handleSaveActiveMealEdit = (rIdx, mIdx) => {
    const newRecipes = [...viewedPatient.recipes];
    newRecipes[rIdx].meals[mIdx].desc = editingMealDesc;
    updatePatient(viewedPatient.id, { recipes: newRecipes });
    setEditingMealPath(null);
  };


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
    // 1. Notificação Push no App
    addNotification(patient.id, `Sua nutri notou que você está há alguns dias sem registrar refeições. Que tal retomar hoje? 🎯`);
    
    // 2. Mock de Envio de E-mail (Transacional)
    console.log(`[API Mock] Enviando e-mail transacional para ${patient.email}...`);
    
    setChurnAlertMessage(`✅ Notificação Push e E-mail enviados com sucesso para ${patient.name}!`);
    setTimeout(() => setChurnAlertMessage(''), 4500);
  };

  // Upload de Exames (Nutri)
  const [showUploadExamModal, setShowUploadExamModal] = useState(false);
  const [isUploadingExam, setIsUploadingExam] = useState(false);
  
  const handleUploadExam = async () => {
    setIsUploadingExam(true);
    // Simulating AI extraction for now until we bridge with OpenAI
    setTimeout(() => {
      const mockData = {
        date: new Date().toLocaleDateString('pt-BR'),
        Glicemia: Math.floor(Math.random() * (110 - 80) + 80),
        Colesterol: Math.floor(Math.random() * (220 - 150) + 150),
        VitaminaD: Math.floor(Math.random() * (40 - 20) + 20),
        aiSummaryProfessional: "Paciente apresenta leve aumento no colesterol LDL, glicemia sob controle. Manter foco em fibras.",
        aiSummaryPatient: "Sua saúde está no caminho certo! Notamos uma melhora na sua energia, continue com as fibras que conversamos."
      };
      addExam(viewedPatient.id, mockData);
      setIsUploadingExam(false);
      setShowUploadExamModal(false);
    }, 2000);
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

              {/* TABS DO PRONTUÁRIO */}
              <div className="results-tabs" style={{ marginBottom: '24px' }}>
                <button className={prontuarioTab === 'resumo' ? 'results-tab-btn active' : 'results-tab-btn'} onClick={() => setProntuarioTab('resumo')}>Visão Geral</button>
                <button className={prontuarioTab === 'consultas' ? 'results-tab-btn active' : 'results-tab-btn'} onClick={() => { setProntuarioTab('consultas'); setSelectedHistoryIdx(null); }}>Protocolo Vigente</button>
                <button className={prontuarioTab === 'exames' ? 'results-tab-btn active' : 'results-tab-btn'} onClick={() => setProntuarioTab('exames')}>Exames & Biomarcadores</button>
                <button className={prontuarioTab === 'chat' ? 'results-tab-btn active' : 'results-tab-btn'} onClick={() => setProntuarioTab('chat')}>Chat / Mensagens</button>
              </div>

              {prontuarioTab === 'resumo' && (
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

                {(() => {
                  // Prepare data for the chart
                  let chartData = [];
                  
                  // Add weights from activePatient.weights
                  if (viewedPatient.weights) {
                    viewedPatient.weights.forEach(w => {
                      chartData.push({ date: w.date, Peso: parseFloat(w.value) });
                    });
                  }
                  
                  // Add weights and bodyFat from consultations
                  if (viewedPatient.consultations) {
                    viewedPatient.consultations.forEach(c => {
                      if (c.physicalEval) {
                        const date = c.date;
                        const existing = chartData.find(d => d.date === date);
                        const weight = c.physicalEval.weight ? parseFloat(c.physicalEval.weight) : null;
                        const bodyFat = c.physicalEval.bodyFat ? parseFloat(c.physicalEval.bodyFat) : null;
                        
                        if (existing) {
                          if (weight) existing.Peso = weight;
                          if (bodyFat) existing.Gordura = bodyFat;
                        } else {
                          if (weight || bodyFat) {
                            chartData.push({ date, Peso: weight, Gordura: bodyFat });
                          }
                        }
                      }
                    });
                  }

                  // Sort by date (assuming dd/mm/yyyy format)
                  chartData.sort((a, b) => {
                    const [d1, m1, y1] = a.date.split('/');
                    const [d2, m2, y2] = b.date.split('/');
                    return new Date(`${y1}-${m1}-${d1}`) - new Date(`${y2}-${m2}-${d2}`);
                  });

                  return (
                    <div className="crm-card" style={{ flex: '1 1 100%' }}>
                      <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                        <TrendingUp size={20} color="var(--crm-accent)" /> Evolução Clínica
                      </h3>
                      {chartData.length === 0 ? (
                        <p style={{ color: 'var(--crm-text-muted)' }}>Nenhuma medição registrada.</p>
                      ) : (
                        <div style={{ width: '100%', height: 300 }}>
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                              <XAxis dataKey="date" stroke="#94a3b8" />
                              <YAxis yAxisId="left" stroke="#8b5cf6" label={{ value: 'Peso (kg)', angle: -90, position: 'insideLeft', fill: '#8b5cf6' }} />
                              <YAxis yAxisId="right" orientation="right" stroke="#f43f5e" label={{ value: '% Gordura', angle: 90, position: 'insideRight', fill: '#f43f5e' }} />
                              <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                              <Legend />
                              <Line yAxisId="left" type="monotone" dataKey="Peso" stroke="#8b5cf6" strokeWidth={3} activeDot={{ r: 8 }} />
                              <Line yAxisId="right" type="monotone" dataKey="Gordura" stroke="#f43f5e" strokeWidth={3} activeDot={{ r: 8 }} />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      )}
                    </div>
                  );
                })()}

                {(() => {
                  const latestEval = viewedPatient.consultations?.slice().reverse().find(c => c.physicalEval && Object.values(c.physicalEval).some(v => v !== ''))?.physicalEval;
                  if (!latestEval) return null;
                  return (
                    <div className="crm-card" style={{ flex: '1 1 100%' }}>
                      <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                        <Activity size={20} color="var(--crm-accent)" /> Última Avaliação Física Completa
                      </h3>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px' }}>
                        {latestEval.weight && <div><span style={{ color: 'var(--crm-text-muted)', fontSize: '0.85rem' }}>Peso:</span><br/><strong>{latestEval.weight} kg</strong></div>}
                        {latestEval.height && <div><span style={{ color: 'var(--crm-text-muted)', fontSize: '0.85rem' }}>Altura:</span><br/><strong>{latestEval.height} cm</strong></div>}
                        
                        {/* Bioimpedância e Dobras */}
                        {latestEval.bodyFat && <div><span style={{ color: 'var(--crm-text-muted)', fontSize: '0.85rem' }}>% Gordura:</span><br/><strong>{latestEval.bodyFat}%</strong></div>}
                        {latestEval.muscleMass && <div><span style={{ color: 'var(--crm-text-muted)', fontSize: '0.85rem' }}>% Músculo:</span><br/><strong>{latestEval.muscleMass}%</strong></div>}
                        {latestEval.boneMass && <div><span style={{ color: 'var(--crm-text-muted)', fontSize: '0.85rem' }}>Massa Óssea:</span><br/><strong>{latestEval.boneMass} kg</strong></div>}
                        {latestEval.bodyWater && <div><span style={{ color: 'var(--crm-text-muted)', fontSize: '0.85rem' }}>Água Corporal:</span><br/><strong>{latestEval.bodyWater}%</strong></div>}
                        {latestEval.visceralFat && <div><span style={{ color: 'var(--crm-text-muted)', fontSize: '0.85rem' }}>Gordura Visceral:</span><br/><strong>{latestEval.visceralFat}</strong></div>}
                        {latestEval.massaMagra && <div><span style={{ color: 'var(--crm-text-muted)', fontSize: '0.85rem' }}>Massa Magra Calc:</span><br/><strong>{latestEval.massaMagra} kg</strong></div>}
                        {latestEval.massaGorda && <div><span style={{ color: 'var(--crm-text-muted)', fontSize: '0.85rem' }}>Massa Gorda Calc:</span><br/><strong>{latestEval.massaGorda} kg</strong></div>}
                        
                        {/* Perímetros */}
                        {latestEval.waist && <div><span style={{ color: 'var(--crm-text-muted)', fontSize: '0.85rem' }}>Cintura:</span><br/><strong>{latestEval.waist} cm</strong></div>}
                        {latestEval.abdomenCirc && <div><span style={{ color: 'var(--crm-text-muted)', fontSize: '0.85rem' }}>Abdômen:</span><br/><strong>{latestEval.abdomenCirc} cm</strong></div>}
                        {latestEval.hips && <div><span style={{ color: 'var(--crm-text-muted)', fontSize: '0.85rem' }}>Quadril:</span><br/><strong>{latestEval.hips} cm</strong></div>}
                        {latestEval.armRight && <div><span style={{ color: 'var(--crm-text-muted)', fontSize: '0.85rem' }}>Braço Dir:</span><br/><strong>{latestEval.armRight} cm</strong></div>}
                        {latestEval.armLeft && <div><span style={{ color: 'var(--crm-text-muted)', fontSize: '0.85rem' }}>Braço Esq:</span><br/><strong>{latestEval.armLeft} cm</strong></div>}
                        {latestEval.thighRight && <div><span style={{ color: 'var(--crm-text-muted)', fontSize: '0.85rem' }}>Coxa Dir:</span><br/><strong>{latestEval.thighRight} cm</strong></div>}
                        {latestEval.thighLeft && <div><span style={{ color: 'var(--crm-text-muted)', fontSize: '0.85rem' }}>Coxa Esq:</span><br/><strong>{latestEval.thighLeft} cm</strong></div>}
                        {latestEval.calfRight && <div><span style={{ color: 'var(--crm-text-muted)', fontSize: '0.85rem' }}>Panturrilha Dir:</span><br/><strong>{latestEval.calfRight} cm</strong></div>}
                        {latestEval.calfLeft && <div><span style={{ color: 'var(--crm-text-muted)', fontSize: '0.85rem' }}>Panturrilha Esq:</span><br/><strong>{latestEval.calfLeft} cm</strong></div>}
                        
                        {latestEval.tmb && <div><span style={{ color: 'var(--crm-text-muted)', fontSize: '0.85rem' }}>TMB:</span><br/><strong>{latestEval.tmb} kcal</strong></div>}
                        {latestEval.get && <div><span style={{ color: 'var(--crm-text-muted)', fontSize: '0.85rem' }}>GET:</span><br/><strong>{latestEval.get} kcal</strong></div>}
                      </div>
                    </div>
                  );
                })()}

                <div className="crm-card" style={{ flex: '1 1 100%' }}>
                  <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                    <Moon size={20} color="var(--crm-accent)" /> Histórico de Sono
                  </h3>
                  {(!viewedPatient.sleepLogs || viewedPatient.sleepLogs.length === 0) ? (
                    <p style={{ color: 'var(--crm-text-muted)' }}>Nenhum registro de sono no momento.</p>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
                      {[...viewedPatient.sleepLogs].reverse().slice(0, 7).map((log, i) => (
                        <div key={i} style={{ padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', backgroundColor: '#f8fafc' }}>
                          <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '4px' }}>{log.date}</div>
                          <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{log.hours} horas</div>
                          <div style={{ fontSize: '0.9rem', color: log.quality === 'Ruim' ? '#ef4444' : log.quality === 'Razoável' ? '#f59e0b' : '#10b981', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                            Qualidade: {log.quality}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="crm-card" style={{ flex: '1 1 100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Camera size={20} color="var(--crm-accent)" /> Diário Alimentar (Análises da IA)
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: '#F8FAFC', padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--crm-border)' }}>
                      <button onClick={() => { const d = new Date(foodDiaryDate); d.setDate(d.getDate() - 1); setFoodDiaryDate(d); }} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }} title="Dia Anterior"><ChevronUp size={18} style={{ transform: 'rotate(-90deg)', color: 'var(--crm-text-main)' }} /></button>
                      <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--crm-text-main)', minWidth: '85px', textAlign: 'center' }}>
                        {foodDiaryDate.toLocaleDateString('pt-BR') === new Date().toLocaleDateString('pt-BR') ? 'Hoje' : foodDiaryDate.toLocaleDateString('pt-BR').slice(0,5)}
                      </span>
                      <button onClick={() => { const d = new Date(foodDiaryDate); d.setDate(d.getDate() + 1); setFoodDiaryDate(d); }} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }} disabled={foodDiaryDate.toLocaleDateString('pt-BR') === new Date().toLocaleDateString('pt-BR')} title="Próximo Dia"><ChevronUp size={18} style={{ transform: 'rotate(90deg)', color: foodDiaryDate.toLocaleDateString('pt-BR') === new Date().toLocaleDateString('pt-BR') ? 'var(--crm-text-muted)' : 'var(--crm-text-main)' }} /></button>
                    </div>
                  </div>
                  {(() => {
                    const targetDateStr = foodDiaryDate.toLocaleDateString('pt-BR');
                    const dayLogs = (viewedPatient.foodLogs || []).filter(log => log.date === targetDateStr);
                    
                    if (!viewedPatient.foodLogs || viewedPatient.foodLogs.length === 0) {
                      return <p style={{ color: 'var(--crm-text-muted)' }}>Nenhuma refeição registrada com foto ainda.</p>;
                    }
                    if (dayLogs.length === 0) {
                      return <p style={{ color: 'var(--crm-text-muted)' }}>Nenhum diário alimentar registrado para este dia.</p>;
                    }
                    return (
                      <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '16px' }}>
                        {dayLogs.slice().reverse().map((log, idx) => (
                          <div key={idx} style={{ flex: '0 0 350px', padding: '16px', backgroundColor: '#F8FAFC', borderRadius: '8px', borderLeft: log.type === 'extra' ? '4px solid #F59E0B' : '4px solid var(--crm-accent)' }}>
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
                    );
                  })()}
                </div>

                </div>
              )}
              
              {prontuarioTab === 'exames' && (
                <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                  {/* HISTÓRICO DE EXAMES */}
                <div className="crm-card" style={{ flex: '1 1 500px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                      <Activity size={20} color="var(--crm-accent)" /> Exames & Biomarcadores (IA)
                    </h3>
                  </div>
                  
                  {(!viewedPatient.exams || viewedPatient.exams.length === 0) ? (
                    <p style={{ color: 'var(--crm-text-muted)' }}>Nenhum exame registrado.</p>
                  ) : (
                    <div>

                      
                      {viewedPatient.exams.slice().reverse().map((ex, idx) => (
                        <div key={ex.id || idx} style={{ padding: '16px', border: '1px solid var(--crm-border)', borderRadius: '8px', marginBottom: '16px', backgroundColor: '#F8FAFC' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '1px solid #E2E8F0', paddingBottom: '8px' }}>
                            <strong style={{ fontSize: '1.1rem' }}>Exame de {ex.date}</strong>
                            <span style={{ fontSize: '0.85rem', color: 'var(--crm-text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <BrainCircuit size={14} /> Laudo Inteligente
                            </span>
                          </div>
                          <div style={{ fontSize: '0.95rem', color: 'var(--crm-text-main)', lineHeight: '1.6' }}>
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{ex.aiSummaryProfessional}</ReactMarkdown>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                </div>
              )}

              {prontuarioTab === 'chat' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <div className="crm-card" style={{ flex: '1 1 500px', display: 'flex', flexDirection: 'column', height: '500px' }}>
                    <div style={{ paddingBottom: '16px', borderBottom: '1px solid var(--crm-border)', marginBottom: '16px' }}>
                      <h3 style={{ margin: 0, color: 'var(--crm-text-main)' }}>Chat Direto: {viewedPatient.name}</h3>
                      <p style={{ fontSize: '0.85rem', color: 'var(--crm-text-muted)', margin: '4px 0 0 0' }}>Comunicação em tempo real no app do paciente.</p>
                    </div>
                    
                    <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', paddingRight: '8px' }}>
                      {(directMessages || []).filter(m => m.patientId === viewedPatient.id).length === 0 ? (
                        <p style={{ color: 'var(--crm-text-muted)', textAlign: 'center', marginTop: 'auto', marginBottom: 'auto' }}>Nenhuma mensagem ainda. Envie a primeira mensagem!</p>
                      ) : (
                        (directMessages || []).filter(m => m.patientId === viewedPatient.id).map(msg => (
                          <div key={msg.id} style={{ 
                            alignSelf: msg.sender === 'nutri' ? 'flex-end' : 'flex-start',
                            backgroundColor: msg.sender === 'nutri' ? '#E0F2FE' : '#F1F5F9',
                            color: 'var(--crm-text-main)',
                            padding: '12px 16px',
                            borderRadius: msg.sender === 'nutri' ? '12px 12px 0 12px' : '12px 12px 12px 0',
                            maxWidth: '75%',
                            border: msg.sender === 'nutri' ? '1px solid #BAE6FD' : '1px solid #E2E8F0'
                          }}>
                            <div style={{ fontSize: '0.95rem' }}>{msg.text}</div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--crm-text-muted)', marginTop: '4px', textAlign: 'right' }}>
                              {new Date(msg.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    
                    <form 
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!chatInput.trim()) return;
                        sendDirectMessage(viewedPatient.id, 'nutri', chatInput.trim());
                        setChatInput('');
                      }} 
                      style={{ display: 'flex', gap: '8px', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--crm-border)' }}
                    >
                      <input 
                        type="text" 
                        className="crm-input" 
                        placeholder="Digite sua mensagem..." 
                        value={chatInput} 
                        onChange={e => setChatInput(e.target.value)} 
                        style={{ flex: 1 }}
                      />
                      <button type="submit" className="crm-btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0 20px' }}>
                        <Send size={16} /> Enviar
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {prontuarioTab === 'consultas' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <div className="results-tabs" style={{ marginBottom: '0', borderBottom: '1px solid var(--crm-border)' }}>
                    <button className={protocoloSubTab === 'dieta' ? 'results-tab-btn active' : 'results-tab-btn'} onClick={() => setProtocoloSubTab('dieta')}>Dietética Vigente</button>
                    <button className={protocoloSubTab === 'avaliacao' ? 'results-tab-btn active' : 'results-tab-btn'} onClick={() => setProtocoloSubTab('avaliacao')}>Avaliação Médica</button>
                    <button className={protocoloSubTab === 'receitas' ? 'results-tab-btn active' : 'results-tab-btn'} onClick={() => setProtocoloSubTab('receitas')}>Biblioteca de Receitas</button>
                    <button className={protocoloSubTab === 'historico' ? 'results-tab-btn active' : 'results-tab-btn'} onClick={() => { setProtocoloSubTab('historico'); setSelectedHistoryIdx(null); }}>Histórico de Consultas</button>
                  </div>

                  {(() => {
                    const lastCons = viewedPatient.consultations && viewedPatient.consultations.length > 0 
                      ? viewedPatient.consultations[viewedPatient.consultations.length - 1] 
                      : null;
                      
                    return (
                      <>
                        {protocoloSubTab === 'avaliacao' && lastCons && (
                          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                            {lastCons.anamnesis && (
                              <div className="crm-card animate-pop-in" style={{ flex: '1 1 300px' }}>
                                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                                  <FileText size={20} color="var(--crm-accent)" /> Anamnese (Última Consulta)
                                </h3>
                                <div style={{ padding: '16px', backgroundColor: '#FFFBEB', borderLeft: '4px solid #F59E0B', borderRadius: '4px', color: 'var(--crm-text-main)', fontSize: '0.95rem', whiteSpace: 'pre-wrap' }}>
                                  {lastCons.anamnesis}
                                </div>
                              </div>
                            )}

                            {lastCons.examResult && (
                              <div className="crm-card animate-pop-in" style={{ flex: '1 1 400px' }}>
                                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                                  <BrainCircuit size={20} color="var(--crm-accent)" /> Análise Clínica (Última Consulta)
                                </h3>
                                <div style={{ padding: '16px', backgroundColor: '#EFF6FF', borderLeft: '4px solid var(--crm-accent)', borderRadius: '4px', color: '#1E3A8A', fontSize: '0.95rem', lineHeight: '1.6' }}>
                                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{lastCons.examResult}</ReactMarkdown>
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {protocoloSubTab === 'dieta' && (
                          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                            <div className="crm-card animate-pop-in" style={{ flex: '2 1 400px' }}>
                              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                                <Utensils size={20} color="var(--crm-accent)" /> Prescrições Dietéticas Ativas
                              </h3>
                              {(!viewedPatient.recipes || viewedPatient.recipes.length === 0) ? (
                                <p style={{ color: 'var(--crm-text-muted)' }}>Nenhuma dieta cadastrada para este paciente.</p>
                              ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                  {viewedPatient.recipes.map((r, idx) => (
                                    <div key={idx} style={{ padding: '16px', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid var(--crm-border)' }}>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                        <strong style={{ fontSize: '1.1rem' }}>{r.title}</strong>
                                        <button onClick={() => handleDeleteActiveRecipe(idx)} style={{ background: 'none', border: 'none', color: 'var(--crm-danger)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem' }}>
                                          <Trash2 size={14} /> Excluir Plano
                                        </button>
                                      </div>
                                      <ul style={{ margin: 0, paddingLeft: '0', color: 'var(--crm-text-muted)', fontSize: '0.95rem', listStyle: 'none' }}>
                                        {r.meals?.map((m, midx) => {
                                          const isEditing = editingMealPath?.rIdx === idx && editingMealPath?.mIdx === midx;
                                          return (
                                            <li key={midx} style={{ marginBottom: '12px', position: 'relative' }}>
                                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                <div style={{ flex: 1, paddingRight: '12px' }}>
                                                  <strong style={{ color: 'var(--crm-text-main)' }}>{m.name}:</strong> 
                                                  {isEditing ? (
                                                    <textarea 
                                                      className="crm-input" 
                                                      style={{ width: '100%', minHeight: '60px', marginTop: '4px', fontSize: '0.9rem' }} 
                                                      value={editingMealDesc} 
                                                      onChange={e => setEditingMealDesc(e.target.value)} 
                                                    />
                                                  ) : (
                                                    <span> {m.desc}</span>
                                                  )}
                                                </div>
                                                <div style={{ display: 'flex', gap: '8px', marginTop: '2px' }}>
                                                  {isEditing ? (
                                                    <button onClick={() => handleSaveActiveMealEdit(idx, midx)} className="crm-btn-primary" style={{ padding: '4px 12px', fontSize: '0.8rem' }}>Salvar</button>
                                                  ) : (
                                                    <>
                                                      <button onClick={() => { setEditingMealPath({ rIdx: idx, mIdx: midx }); setEditingMealDesc(m.desc); }} style={{ background: 'none', border: 'none', color: 'var(--crm-accent)', cursor: 'pointer', padding: '4px' }}><Edit3 size={14} /></button>
                                                      <button onClick={() => handleDeleteActiveMeal(idx, midx)} style={{ background: 'none', border: 'none', color: 'var(--crm-danger)', cursor: 'pointer', padding: '4px' }}><Trash2 size={14} /></button>
                                                    </>
                                                  )}
                                                </div>
                                              </div>
                                            </li>
                                          );
                                        })}
                                      </ul>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {protocoloSubTab === 'receitas' && (
                          <div className="crm-card animate-pop-in">
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                              <BookOpen size={20} color="var(--crm-accent)" /> Receitas Bônus Ativas
                            </h3>
                            {viewedPatient.bonusRecipes?.length > 0 ? (
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
                                {viewedPatient.bonusRecipes.map(br => (
                                  <div key={br.id} style={{ flex: '1 1 200px', padding: '12px', border: '1px solid var(--crm-border)', borderRadius: '8px', backgroundColor: '#F8FAFC' }}>
                                    <strong style={{ display: 'block', fontSize: '1rem', color: 'var(--crm-text-main)' }}>{br.title}</strong>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--crm-text-muted)' }}>Adicionado em {br.date}</span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p style={{ color: 'var(--crm-text-muted)', fontSize: '0.95rem', marginBottom: '16px' }}>O paciente ainda não possui receitas bônus vigentes.</p>
                            )}
                            <button className="crm-btn-primary" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} onClick={() => setShowAttachRecipeModal(true)}>
                              <ChefHat size={16} /> Anexar Receita da Biblioteca
                            </button>
                          </div>
                        )}
                        {protocoloSubTab === 'historico' && (
                          <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
                            <div className="crm-card" style={{ flex: '0 0 300px' }}>
                              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                                <Calendar size={20} color="var(--crm-accent)" /> Histórico
                              </h3>
                              {(!viewedPatient.consultations || viewedPatient.consultations.length === 0) ? (
                                <p style={{ color: 'var(--crm-text-muted)' }}>Nenhuma consulta registrada com o novo modelo.</p>
                              ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                  {viewedPatient.consultations.slice().reverse().map((cons, idx) => (
                                    <div 
                                      key={idx} 
                                      onClick={() => setSelectedHistoryIdx(idx)}
                                      style={{ 
                                        padding: '12px', 
                                        backgroundColor: selectedHistoryIdx === idx ? 'var(--crm-accent)' : '#F8FAFC', 
                                        color: selectedHistoryIdx === idx ? '#FFF' : 'var(--crm-text-main)',
                                        borderRadius: '8px', 
                                        border: '1px solid var(--crm-border)', 
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                      }}>
                                      <strong style={{ display: 'block', fontSize: '1rem' }}>Consulta de {cons.date}</strong>
                                      <span style={{ fontSize: '0.85rem', color: selectedHistoryIdx === idx ? 'rgba(255,255,255,0.8)' : 'var(--crm-text-muted)' }}>
                                        {cons.dietTitle ? 'Com dieta prescrita' : 'Acompanhamento'}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            <div style={{ flex: '1' }}>
                              {selectedHistoryIdx === null ? (
                                <div className="crm-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px', color: 'var(--crm-text-muted)' }}>
                                  <Search size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
                                  <p>Selecione uma consulta no menu lateral para visualizar os detalhes.</p>
                                </div>
                              ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                  {(() => {
                                    const cons = viewedPatient.consultations.slice().reverse()[selectedHistoryIdx];
                                    return (
                                      <>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                          <div>
                                            <h2 style={{ fontSize: '1.5rem', marginBottom: '4px', color: 'var(--crm-text-main)' }}>Visão Histórica: {cons.date}</h2>
                                            <p style={{ color: 'var(--crm-text-muted)', fontSize: '0.9rem' }}>Modo somente leitura.</p>
                                          </div>
                                        </div>

                                        <div className="results-tabs" style={{ marginBottom: '24px', borderBottom: '1px solid var(--crm-border)' }}>
                                          <button className={historicoSubTab === 'anamnese' ? 'results-tab-btn active' : 'results-tab-btn'} onClick={() => setHistoricoSubTab('anamnese')}>Anamnese</button>
                                          <button className={historicoSubTab === 'fisica' ? 'results-tab-btn active' : 'results-tab-btn'} onClick={() => setHistoricoSubTab('fisica')}>Avaliação Física</button>
                                          <button className={historicoSubTab === 'exames' ? 'results-tab-btn active' : 'results-tab-btn'} onClick={() => setHistoricoSubTab('exames')}>Análise Clínica</button>
                                          <button className={historicoSubTab === 'dieta' ? 'results-tab-btn active' : 'results-tab-btn'} onClick={() => setHistoricoSubTab('dieta')}>Prescrição Dietética</button>
                                        </div>
                                        
                                        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                                            {historicoSubTab === 'anamnese' && (
                                              <div className="crm-card animate-pop-in" style={{ flex: '1 1 100%' }}>
                                                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                                                  <FileText size={20} color="var(--crm-accent)" /> Anamnese
                                                </h3>
                                                {cons.anamnesis ? (
                                                  <div style={{ padding: '16px', backgroundColor: '#F8FAFC', borderLeft: '4px solid #94A3B8', borderRadius: '4px', color: 'var(--crm-text-main)', fontSize: '0.95rem', whiteSpace: 'pre-wrap' }}>
                                                    {cons.anamnesis}
                                                  </div>
                                                ) : (
                                                  <p style={{ color: 'var(--crm-text-muted)' }}>Nenhuma anamnese registrada.</p>
                                                )}
                                              </div>
                                            )}

                                            {historicoSubTab === 'fisica' && (
                                              <div className="crm-card animate-pop-in" style={{ flex: '1 1 100%' }}>
                                                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                                                  <Activity size={20} color="var(--crm-accent)" /> Avaliação Física
                                                </h3>
                                                {cons.physicalEval && Object.values(cons.physicalEval).some(v => v !== '') ? (
                                                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', backgroundColor: '#F8FAFC', padding: '16px', borderRadius: '8px', border: '1px solid var(--crm-border)' }}>
                                                    {cons.physicalEval.weight && <div><span style={{ color: 'var(--crm-text-muted)', fontSize: '0.85rem' }}>Peso:</span><br/><strong>{cons.physicalEval.weight} kg</strong></div>}
                                                    {cons.physicalEval.height && <div><span style={{ color: 'var(--crm-text-muted)', fontSize: '0.85rem' }}>Altura:</span><br/><strong>{cons.physicalEval.height} cm</strong></div>}
                                                    {cons.physicalEval.bodyFat && <div><span style={{ color: 'var(--crm-text-muted)', fontSize: '0.85rem' }}>% Gordura:</span><br/><strong>{cons.physicalEval.bodyFat}%</strong></div>}
                                                    {cons.physicalEval.muscleMass && <div><span style={{ color: 'var(--crm-text-muted)', fontSize: '0.85rem' }}>% Músculo:</span><br/><strong>{cons.physicalEval.muscleMass}%</strong></div>}
                                                    {cons.physicalEval.waist && <div><span style={{ color: 'var(--crm-text-muted)', fontSize: '0.85rem' }}>Cintura:</span><br/><strong>{cons.physicalEval.waist} cm</strong></div>}
                                                    {cons.physicalEval.hips && <div><span style={{ color: 'var(--crm-text-muted)', fontSize: '0.85rem' }}>Quadril:</span><br/><strong>{cons.physicalEval.hips} cm</strong></div>}
                                                    {cons.physicalEval.tmb && <div><span style={{ color: 'var(--crm-text-muted)', fontSize: '0.85rem' }}>TMB:</span><br/><strong>{cons.physicalEval.tmb} kcal</strong></div>}
                                                    {cons.physicalEval.get && <div><span style={{ color: 'var(--crm-text-muted)', fontSize: '0.85rem' }}>GET:</span><br/><strong>{cons.physicalEval.get} kcal</strong></div>}
                                                    {cons.physicalEval.massaMagra && <div><span style={{ color: 'var(--crm-text-muted)', fontSize: '0.85rem' }}>Massa Magra:</span><br/><strong>{cons.physicalEval.massaMagra} kg</strong></div>}
                                                    {cons.physicalEval.massaGorda && <div><span style={{ color: 'var(--crm-text-muted)', fontSize: '0.85rem' }}>Massa Gorda:</span><br/><strong>{cons.physicalEval.massaGorda} kg</strong></div>}
                                                  </div>
                                                ) : (
                                                  <p style={{ color: 'var(--crm-text-muted)' }}>Nenhuma avaliação física registrada nesta consulta.</p>
                                                )}
                                              </div>
                                            )}

                                          {historicoSubTab === 'exames' && (
                                            <div className="crm-card animate-pop-in" style={{ flex: '1 1 100%' }}>
                                              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                                                <BrainCircuit size={20} color="var(--crm-accent)" /> Análise Clínica
                                              </h3>
                                              {cons.examResult ? (
                                                <div style={{ padding: '16px', backgroundColor: '#F8FAFC', borderLeft: '4px solid #94A3B8', borderRadius: '4px', color: 'var(--crm-text-main)', fontSize: '0.95rem', lineHeight: '1.6' }}>
                                                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{cons.examResult}</ReactMarkdown>
                                                </div>
                                              ) : (
                                                <p style={{ color: 'var(--crm-text-muted)' }}>Nenhuma análise clínica registrada.</p>
                                              )}
                                            </div>
                                          )}

                                          {historicoSubTab === 'dieta' && (
                                            <div className="crm-card animate-pop-in" style={{ flex: '1 1 100%' }}>
                                              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                                                <Utensils size={20} color="var(--crm-accent)" /> Prescrição Dietética
                                              </h3>
                                              {cons.dietTitle ? (
                                                <>
                                                  <div style={{ padding: '16px', backgroundColor: '#F8FAFC', border: '1px solid var(--crm-border)', borderRadius: '8px', marginBottom: '16px' }}>
                                                    <h4 style={{ fontSize: '1.1rem', color: 'var(--crm-text-main)', marginBottom: '12px' }}>{cons.dietTitle}</h4>
                                                    
                                                    {cons.dietDescription && (
                                                      <div style={{ marginBottom: '16px', fontSize: '0.95rem', color: 'var(--crm-text-main)' }}>
                                                        <ReactMarkdown>{cons.dietDescription}</ReactMarkdown>
                                                      </div>
                                                    )}

                                                    {cons.dietMeals && cons.dietMeals.length > 0 && (
                                                      <ul style={{ margin: 0, paddingLeft: '0', listStyle: 'none', color: 'var(--crm-text-muted)', fontSize: '0.95rem' }}>
                                                        {cons.dietMeals.map((m, midx) => (
                                                          <li key={midx} style={{ marginBottom: '8px', paddingBottom: '8px', borderBottom: '1px solid #E2E8F0' }}>
                                                            <strong style={{ color: 'var(--crm-text-main)' }}>{m.name}:</strong> {m.desc}
                                                          </li>
                                                        ))}
                                                      </ul>
                                                    )}

                                                    {cons.dietSupplements && (
                                                      <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#EFF6FF', borderRadius: '4px', borderLeft: '4px solid #3B82F6' }}>
                                                        <strong style={{ display: 'block', marginBottom: '4px', color: '#1E3A8A' }}>Suplementação:</strong>
                                                        <div style={{ fontSize: '0.9rem', color: '#1E3A8A' }}>
                                                          <ReactMarkdown>{cons.dietSupplements}</ReactMarkdown>
                                                        </div>
                                                      </div>
                                                    )}
                                                  </div>
                                                  <p style={{ color: 'var(--crm-text-muted)', fontSize: '0.85rem' }}>
                                                    Para ver as refeições ativas e editá-las, consulte a aba "Protocolo Vigente". Esta é uma visão histórica e não pode ser alterada.
                                                  </p>
                                                </>
                                              ) : (
                                                <p style={{ color: 'var(--crm-text-muted)' }}>Nenhuma dieta prescrita nesta consulta.</p>
                                              )}
                                            </div>
                                          )}
                                        </div>
                                      </>
                                    )
                                  })()}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </>
                    );
                  })()}
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
                      {patients.filter(p => p.status === 'em_risco').map(p => (
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
                      {patients.filter(p => p.status === 'em_risco').length === 0 && (
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
              <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label className="crm-label">Idade</label>
                  <input type="number" className="crm-input" placeholder="Ex: 30" value={patAge} onChange={e => setPatAge(e.target.value)} />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="crm-label">Gênero</label>
                  <select className="crm-input" value={patGender} onChange={e => setPatGender(e.target.value)}>
                    <option value="M">Masculino</option>
                    <option value="F">Feminino</option>
                  </select>
                </div>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label className="crm-label">Objetivo Clínico</label>
                <input type="text" className="crm-input" placeholder="Ex: Emagrecimento, Hipertrofia..." value={patObj} onChange={e => setPatObj(e.target.value)} required />
              </div>
              <div style={{ marginBottom: '24px' }}>
                <label className="crm-label">Restrições Gerais (Opcional)</label>
                <input type="text" className="crm-input" placeholder="Ex: Sem lactose, Vegano..." value={patRest} onChange={e => setPatRest(e.target.value)} />
              </div>
              <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                <div style={{ flex: 1 }}>
                  <label className="crm-label">Alimentos que NÃO come (Aversões)</label>
                  <textarea className="crm-input" placeholder="Ex: Pimentão, coentro, fígado..." value={patAversions} onChange={e => setPatAversions(e.target.value)} style={{ minHeight: '80px', resize: 'vertical' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="crm-label">Medicamentos em Uso</label>
                  <textarea className="crm-input" placeholder="Ex: Ritalina, Ozempic..." value={patMedications} onChange={e => setPatMedications(e.target.value)} style={{ minHeight: '80px', resize: 'vertical' }} />
                </div>
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
      
      {/* MODAL UPLOAD EXAME */}
      {showUploadExamModal && (
        <div className="crm-modal-overlay">
          <div className="crm-modal animate-pop-in" style={{ maxWidth: '500px' }}>
            <h2 style={{ marginBottom: '16px' }}>Analisar Novo Exame (IA)</h2>
            <p style={{ color: 'var(--crm-text-muted)', marginBottom: '24px', fontSize: '0.95rem' }}>
              Faça o upload do PDF do exame. A IA vai ler os biomarcadores e gerar a síntese evolutiva automaticamente.
            </p>
            <div style={{ position: 'relative', padding: '40px', border: '2px dashed var(--crm-border)', borderRadius: '8px', textAlign: 'center', marginBottom: '24px', backgroundColor: '#F8FAFC' }}>
              <Upload size={32} color="var(--crm-text-muted)" style={{ margin: '0 auto 16px' }} />
              <p style={{ margin: 0 }}>Arraste o PDF ou clique para selecionar</p>
              <input type="file" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }} />
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button className="crm-btn-secondary" onClick={() => setShowUploadExamModal(false)} disabled={isUploadingExam}>Cancelar</button>
              <button className="crm-btn-primary" onClick={handleUploadExam} disabled={isUploadingExam}>
                {isUploadingExam ? 'Processando (IA)...' : 'Enviar e Analisar'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
