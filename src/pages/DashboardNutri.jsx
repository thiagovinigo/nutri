import React, { useState } from 'react';
import { 
  Users, Calendar, Clock, PlayCircle, CheckCircle, Upload, 
  FileText, Activity, Sparkles, Edit3, Send, Plus, X, Trash2,
  Eye, TrendingUp, Utensils, BrainCircuit, Play
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true 
});

export default function DashboardNutri() {
  const { 
    patients, addRecipe, activePatientId, setActivePatientId,
    addPatient, updatePatient, deletePatient,
    appointments, addAppointment, cancelAppointment, markAppointmentDone
  } = useAppContext();
  
  const [view, setView] = useState('agenda'); 
  
  // Modals e Formulários
  const [showApptModal, setShowApptModal] = useState(false);
  const [apptPatientId, setApptPatientId] = useState(patients[0]?.id || '');
  const [apptTime, setApptTime] = useState('');
  const [apptType, setApptType] = useState('Retorno');

  const [showPatientModal, setShowPatientModal] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [patName, setPatName] = useState('');
  const [patObj, setPatObj] = useState('');
  const [patRest, setPatRest] = useState('');

  // Prontuário
  const [viewingPatientId, setViewingPatientId] = useState(null);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [synthesisResult, setSynthesisResult] = useState('');

  // Estado da Consulta
  const [consultationStep, setConsultationStep] = useState(1);
  const [activeApptId, setActiveApptId] = useState(null);
  const [anamnesis, setAnamnesis] = useState('');
  
  const [examUploaded, setExamUploaded] = useState(false);
  const [examAnalyzing, setExamAnalyzing] = useState(false);
  const [examResult, setExamResult] = useState(null);
  const [examTab, setExamTab] = useState('detalhada'); 
  
  const [dietTitle, setDietTitle] = useState('');
  const [dietContent, setDietContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const activePatient = patients.find(p => p.id === activePatientId) || patients[0];
  const viewedPatient = patients.find(p => p.id === viewingPatientId);

  // Handlers CRUD Agenda
  const handleCreateAppointment = (e) => {
    e.preventDefault();
    if (apptPatientId && apptTime) {
      addAppointment(parseInt(apptPatientId), apptTime, apptType);
      setShowApptModal(false);
      setApptTime('');
    }
  };

  // Handlers CRUD Paciente
  const openNewPatientModal = () => {
    setEditingPatient(null);
    setPatName(''); setPatObj(''); setPatRest('');
    setShowPatientModal(true);
  };

  const openEditPatientModal = (p) => {
    setEditingPatient(p.id);
    setPatName(p.name); setPatObj(p.objective); setPatRest(p.restrictions);
    setShowPatientModal(true);
  };

  const handleSavePatient = (e) => {
    e.preventDefault();
    if (editingPatient) {
      updatePatient(editingPatient, { name: patName, objective: patObj, restrictions: patRest });
    } else {
      addPatient(patName, patObj, patRest);
    }
    setShowPatientModal(false);
  };

  const handleDeletePatient = (id) => {
    if(window.confirm('Tem certeza que deseja excluir este paciente?')) {
      deletePatient(id);
      if(viewingPatientId === id) setViewingPatientId(null);
    }
  };

  // Funções de Consulta
  const startConsultation = (patientId, apptId) => {
    setActivePatientId(patientId);
    setActiveApptId(apptId);
    setConsultationStep(1);
    setAnamnesis('');
    setExamUploaded(false);
    setExamResult(null);
    setDietTitle('');
    setDietContent('');
    setView('consulta');
  };

  // IA: Leitura de Exame
  const analyzeExamWithAI = async () => {
    setExamAnalyzing(true);
    try {
      const mockRawPdfText = "EXAME SANGUE: Hemoglobina 14 g/dL. Glicemia jejum 98 mg/dL. Colesterol Total 220 mg/dL. LDL 150 mg/dL. HDL 40 mg/dL. Vitamina D 18 ng/mL.";
      
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "Você é um motor de IA clínica estilo Medhub focado em nutrição. Retorne um JSON estrito com as chaves: 'detalhada' (resumo dos achados e valores alterados), 'correlacao' (como os resultados afetam o quadro do paciente) e 'nutricao' (condutas nutricionais específicas baseadas nos achados). Mantenha as respostas profissionais e baseadas em evidências." },
          { role: "user", content: `Contexto do paciente: Objetivo é ${activePatient.objective}. Anamnese de hoje: ${anamnesis}. \n\nResultado do PDF processado: ${mockRawPdfText}` }
        ],
        response_format: { type: "json_object" }
      });

      const parsedResult = JSON.parse(response.choices[0].message.content);
      setExamResult(parsedResult);
      setExamUploaded(true);
    } catch (error) {
      console.error("Erro ao analisar exame:", error);
      alert("Erro ao conectar com a IA. Verifique a chave da API.");
    } finally {
      setExamAnalyzing(false);
    }
  };

  // IA: Gerar Dieta
  const generateDietFromAI = async () => {
    setIsGenerating(true);
    try {
      let promptContext = `Objetivo: ${activePatient.objective}. Restrições: ${activePatient.restrictions || 'Nenhuma'}.`;
      if (anamnesis) promptContext += `\nAnamnese: ${anamnesis}`;
      if (examResult) promptContext += `\nConduta Sugerida pelos Exames: ${examResult.nutricao}`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: "Você é um Nutricionista Clínico de alta performance. Crie um esboço de plano alimentar detalhado. Formate em texto claro com as refeições (Café da manhã, Almoço, Lanche, Jantar, Suplementação). Seja criativo mas mantenha evidências científicas. Não use formatação markdown extravagante, apenas texto limpo com quebras de linha." },
          { role: "user", content: `Crie um cardápio considerando este contexto clínico:\n\n${promptContext}` }
        ]
      });

      setDietTitle(`Plano Personalizado - ${new Date().toLocaleDateString('pt-BR')}`);
      setDietContent(response.choices[0].message.content);
    } catch (error) {
      console.error("Erro ao gerar dieta:", error);
      alert("Erro ao gerar dieta com IA.");
    } finally {
      setIsGenerating(false);
    }
  };

  // IA: Síntese de Prontuário
  const generatePatientSynthesis = async (patient) => {
    setIsSynthesizing(true);
    setSynthesisResult('');
    try {
      const patientDataString = `
      Nome: ${patient.name}
      Objetivo: ${patient.objective}
      Restrições: ${patient.restrictions || 'Nenhuma'}
      Anotações Antigas: ${patient.records || 'Sem anotações'}
      Últimos Pesos: ${patient.weights.map(w => `${w.date}: ${w.value}kg`).join(' | ')}
      Últimas Dietas Prescritas: ${patient.recipes.map(r => r.title).join(', ')}
      Nível de Engajamento App: ${patient.streak} dias seguidos
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: "Você é um consultor médico/nutricional sênior. O Nutricionista pediu para você ler o prontuário cru deste paciente e dar uma SÍNTESE CLÍNICA INTELIGENTE em 2 ou 3 parágrafos focados: 1) Qual a situação atual de evolução do paciente? (Analise pesos, engajamento e histórico). 2) O que o nutricionista deve focar e investigar na próxima consulta? Seja extremamente analítico, profissional e vá direto ao ponto." },
          { role: "user", content: `Analise os dados deste paciente e gere a síntese clínica:\n${patientDataString}` }
        ]
      });

      setSynthesisResult(response.choices[0].message.content);
    } catch (error) {
      console.error(error);
      alert("Erro ao gerar síntese da IA.");
    } finally {
      setIsSynthesizing(false);
    }
  };

  const finishConsultation = () => {
    if (dietTitle && dietContent) addRecipe(activePatient.id, dietTitle, dietContent);
    if (activeApptId) markAppointmentDone(activeApptId);
    // Para simplificar, atualizamos o record do paciente também com a anamnese
    updatePatient(activePatient.id, { records: activePatient.records + `\n\n[Consulta - ${new Date().toLocaleDateString('pt-BR')}]:\n${anamnesis}` });
    
    alert(`Consulta finalizada! Dados enviados ao App do paciente.`);
    setView('agenda');
  };

  // ----------------------------------------------------
  // VIEW: CONSULTA (WIZARD COM NAVEGAÇÃO LIVRE)
  // ----------------------------------------------------
  if (view === 'consulta') {
    return (
      <div className="crm-container" style={{ display: 'flex', height: '100vh' }}>
        <div style={{ width: '280px', backgroundColor: 'var(--crm-surface)', borderRight: '1px solid var(--crm-border)', padding: '24px', display: 'flex', flexDirection: 'column' }}>
          <button onClick={() => setView(activeApptId ? 'agenda' : 'pacientes')} className="crm-nav-btn" style={{ color: 'var(--crm-danger)', marginBottom: '24px' }}>
            ← Suspender Consulta
          </button>
          
          <div className="crm-card" style={{ padding: '16px', marginBottom: '24px', backgroundColor: '#F8FAFC' }}>
            <strong style={{ fontSize: '1.1rem' }}>{activePatient.name}</strong>
            <p style={{ fontSize: '0.85rem', color: 'var(--crm-text-muted)', marginTop: '4px' }}>Obj: {activePatient.objective}</p>
          </div>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button className={`crm-nav-btn ${consultationStep === 1 ? 'active' : ''}`} onClick={() => setConsultationStep(1)}>
              1. Anamnese
            </button>
            <button className={`crm-nav-btn ${consultationStep === 2 ? 'active' : ''}`} onClick={() => setConsultationStep(2)}>
              2. Exames (IA OpenAI)
            </button>
            <button className={`crm-nav-btn ${consultationStep === 3 ? 'active' : ''}`} onClick={() => setConsultationStep(3)}>
              3. Prescrição (IA OpenAI)
            </button>
            <button className={`crm-nav-btn ${consultationStep === 4 ? 'active' : ''}`} onClick={() => setConsultationStep(4)}>
              4. Resumo e Envio
            </button>
          </nav>
        </div>

        <div style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
          <div className="animate-pop-in">
            {consultationStep === 1 && (
              <div className="crm-card">
                <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
                  <FileText color="var(--crm-accent)" /> Anamnese e Queixas Principais
                </h2>
                <label className="crm-label">Anotações Clínicas de Hoje</label>
                <textarea 
                  className="crm-input"
                  placeholder="Como o paciente tem se sentido? As notas aqui servirão de contexto para a IA gerar a dieta."
                  value={anamnesis}
                  onChange={(e) => setAnamnesis(e.target.value)}
                  style={{ height: '250px', resize: 'vertical' }}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
                  <button className="crm-btn-primary" onClick={() => setConsultationStep(2)}>Salvar e Avançar</button>
                </div>
              </div>
            )}

            {consultationStep === 2 && (
              <div className="crm-card">
                <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
                  <Activity color="var(--crm-accent)" /> Análise de Exames (Powered by OpenAI)
                </h2>
                
                {!examUploaded && !examAnalyzing && (
                  <div style={{ textAlign: 'center', padding: '60px 20px', border: '2px dashed var(--crm-border)', borderRadius: '12px', backgroundColor: '#F8FAFC', cursor: 'pointer' }} onClick={analyzeExamWithAI}>
                    <Upload size={48} color="var(--crm-text-muted)" style={{ marginBottom: '16px' }} />
                    <h3 style={{ color: 'var(--crm-text-main)' }}>Clique para Simular Leitura do PDF via OpenAI</h3>
                    <p style={{ color: 'var(--crm-text-muted)', marginTop: '8px' }}>O motor GPT irá extrair marcadores e correlacionar com o objetivo de {activePatient.objective}.</p>
                  </div>
                )}

                {examAnalyzing && (
                  <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                    <Sparkles size={48} color="var(--crm-accent)" className="animate-bounce" style={{ marginBottom: '16px' }} />
                    <h3>Consultando API da OpenAI...</h3>
                    <p style={{ color: 'var(--crm-text-muted)' }}>Mapeando referências médicas e cruzando com o quadro clínico real.</p>
                  </div>
                )}

                {examResult && (
                  <div className="animate-pop-in">
                    <div style={{ display: 'flex', gap: '16px', borderBottom: '1px solid var(--crm-border)', paddingBottom: '12px', marginBottom: '24px' }}>
                      <button onClick={() => setExamTab('detalhada')} style={{ background: 'none', border: 'none', fontSize: '0.95rem', fontWeight: examTab === 'detalhada' ? '600' : '400', color: examTab === 'detalhada' ? 'var(--crm-accent)' : 'var(--crm-text-muted)', cursor: 'pointer' }}>Análise Detalhada</button>
                      <button onClick={() => setExamTab('correlacao')} style={{ background: 'none', border: 'none', fontSize: '0.95rem', fontWeight: examTab === 'correlacao' ? '600' : '400', color: examTab === 'correlacao' ? 'var(--crm-accent)' : 'var(--crm-text-muted)', cursor: 'pointer' }}>Correlação Clínica</button>
                      <button onClick={() => setExamTab('nutricao')} style={{ background: 'none', border: 'none', fontSize: '0.95rem', fontWeight: examTab === 'nutricao' ? '600' : '400', color: examTab === 'nutricao' ? 'var(--crm-accent)' : 'var(--crm-text-muted)', cursor: 'pointer' }}>Conduta Nutricional</button>
                    </div>
                    
                    <div style={{ padding: '24px', backgroundColor: '#F8FAFC', borderRadius: '12px', minHeight: '200px', whiteSpace: 'pre-wrap', lineHeight: '1.6', fontSize: '0.95rem', color: 'var(--crm-text-main)' }}>
                      {examResult[examTab]}
                    </div>
                  </div>
                )}
              </div>
            )}

            {consultationStep === 3 && (
              <div className="crm-card">
                <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
                  <Edit3 color="var(--crm-accent)" /> Prescrição Dietética
                </h2>
                
                {examResult && (
                  <div style={{ padding: '16px', backgroundColor: '#EFF6FF', borderLeft: '4px solid var(--crm-accent)', marginBottom: '24px', borderRadius: '4px' }}>
                    <p style={{ fontSize: '0.9rem', color: '#1E3A8A' }}><strong>Insight OpenAI Ativo:</strong> A IA considerará a anamnese e os achados dos exames para estruturar o cardápio automaticamente.</p>
                  </div>
                )}

                <label className="crm-label">Título do Plano</label>
                <input type="text" className="crm-input" placeholder="Ex: Dieta de Manutenção" value={dietTitle} onChange={e => setDietTitle(e.target.value)} style={{ marginBottom: '24px', fontWeight: '600' }} />
                
                <label className="crm-label">Composição do Cardápio</label>
                <textarea 
                  className="crm-input"
                  placeholder="Escreva a prescrição ou clique em Gerar com IA para a OpenAI preencher com base no quadro..."
                  value={dietContent}
                  onChange={e => setDietContent(e.target.value)}
                  style={{ height: '350px', resize: 'vertical', lineHeight: '1.6' }}
                />
                
                <div style={{ display: 'flex', gap: '16px', marginTop: '24px' }}>
                  <button className="crm-btn-secondary" onClick={generateDietFromAI} disabled={isGenerating}>
                    <Sparkles size={16} color="var(--crm-accent)" /> {isGenerating ? 'Gerando com OpenAI GPT-4o...' : 'Gerar Esboço Completo com OpenAI'}
                  </button>
                </div>
              </div>
            )}

            {consultationStep === 4 && (
              <div className="crm-card">
                <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
                  <CheckCircle color="var(--crm-accent)" /> Resumo e Entrega
                </h2>
                
                <div style={{ backgroundColor: '#F8FAFC', padding: '24px', borderRadius: '12px', border: '1px solid var(--crm-border)' }}>
                  <h3 style={{ marginBottom: '16px' }}>Pronto para enviar para {activePatient.name}?</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.95rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle size={16} color="var(--crm-accent)"/> Anamnese salva no histórico.</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {examUploaded ? <CheckCircle size={16} color="var(--crm-accent)"/> : <X size={16} color="var(--crm-text-muted)"/>} 
                      {examUploaded ? 'Exames processados pela OpenAI.' : 'Nenhum exame analisado nesta consulta.'}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {dietTitle ? <CheckCircle size={16} color="var(--crm-accent)"/> : <X size={16} color="var(--crm-text-muted)"/>}
                      {dietTitle ? `Dieta "${dietTitle}" pronta.` : 'Nenhum plano alimentar prescrito.'}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '32px' }}>
                  <button className="crm-btn-primary" onClick={finishConsultation} style={{ padding: '12px 24px', fontSize: '1.05rem' }}>
                    <Send size={18} /> Finalizar e Publicar no App
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // VIEW: DASHBOARD PRINCIPAL (AGENDA E PACIENTES)
  // ----------------------------------------------------
  return (
    <div className="crm-container" style={{ display: 'flex', height: '100vh' }}>
      
      <div style={{ width: '260px', backgroundColor: 'var(--crm-surface)', borderRight: '1px solid var(--crm-border)', padding: '24px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ marginBottom: '40px' }}>
          <h2 style={{ color: 'var(--crm-text-main)', fontSize: '1.5rem', fontWeight: '700', letterSpacing: '-0.5px' }}>EloNutri</h2>
          <span className="crm-badge-blue" style={{ marginTop: '8px', display: 'inline-block' }}>CRM Clínico</span>
        </div>
        
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button className={`crm-nav-btn ${view === 'agenda' ? 'active' : ''}`} onClick={() => {setView('agenda'); setViewingPatientId(null); setSynthesisResult('');}}>
            <Calendar size={18} /> Agenda de Hoje
          </button>
          <button className={`crm-nav-btn ${view === 'pacientes' ? 'active' : ''}`} onClick={() => {setView('pacientes'); setViewingPatientId(null); setSynthesisResult('');}}>
            <Users size={18} /> Meus Pacientes
          </button>
        </nav>
      </div>

      <div style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
        <div className="animate-pop-in">
          
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

              <div className="crm-card">
                {appointments.length === 0 ? (
                  <p style={{ color: 'var(--crm-text-muted)', textAlign: 'center', padding: '40px 0' }}>Nenhuma consulta agendada.</p>
                ) : (
                  <table className="crm-table">
                    <thead>
                      <tr>
                        <th>Horário</th>
                        <th>Paciente</th>
                        <th>Tipo</th>
                        <th>Status</th>
                        <th>Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {appointments.sort((a,b) => a.time.localeCompare(b.time)).map(appt => {
                        const pat = patients.find(p => p.id === appt.patientId);
                        if (!pat) return null;
                        return (
                          <tr key={appt.id}>
                            <td style={{ fontWeight: '600' }}>{appt.time}</td>
                            <td>
                              <div style={{ fontWeight: '500' }}>{pat.name}</div>
                              <div style={{ fontSize: '0.8rem', color: 'var(--crm-text-muted)' }}>{pat.objective}</div>
                            </td>
                            <td>{appt.type}</td>
                            <td>
                              {appt.status === 'agendado' && <span className="crm-badge-blue">Agendado</span>}
                              {appt.status === 'concluido' && <span className="crm-badge-green">Concluído</span>}
                            </td>
                            <td>
                              {appt.status === 'agendado' ? (
                                <div style={{ display: 'flex', gap: '8px' }}>
                                  <button className="crm-btn-primary" onClick={() => startConsultation(pat.id, appt.id)} style={{ padding: '6px 12px' }}>
                                    <PlayCircle size={16} /> Iniciar
                                  </button>
                                  <button className="crm-btn-danger" onClick={() => cancelAppointment(appt.id)} title="Cancelar Agendamento" style={{ padding: '6px' }}>
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              ) : (
                                <span style={{ color: 'var(--crm-text-muted)', fontSize: '0.9rem' }}>Atendido</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
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
                <button className="crm-btn-primary" onClick={openNewPatientModal}>
                  <Plus size={18} /> Novo Paciente
                </button>
              </div>
              
              <div className="crm-card">
                <table className="crm-table">
                  <thead>
                    <tr>
                      <th>Nome</th>
                      <th>Objetivo</th>
                      <th>Adesão App</th>
                      <th>Status</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patients.map(p => (
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
                            <button className="crm-btn-danger" onClick={() => handleDeletePatient(p.id)} title="Excluir" style={{ padding: '6px' }}>
                              <Trash2 size={16} />
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
                  <button className="crm-btn-secondary" onClick={() => generatePatientSynthesis(viewedPatient)} disabled={isSynthesizing} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <BrainCircuit size={16} color="var(--crm-accent)" /> 
                    {isSynthesizing ? 'Analisando Histórico...' : 'Gerar Síntese Clínica (IA)'}
                  </button>
                  <button className="crm-btn-primary" onClick={() => startConsultation(viewedPatient.id, null)} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Play size={16} /> Iniciar Consulta Avulsa
                  </button>
                </div>
              </div>

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
                          <pre style={{ fontFamily: 'inherit', whiteSpace: 'pre-wrap', color: 'var(--crm-text-muted)', fontSize: '0.95rem' }}>{r.desc}</pre>
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
              <div style={{ marginBottom: '16px' }}>
                <label className="crm-label">Horário (ex: 14:00)</label>
                <input type="time" className="crm-input" value={apptTime} onChange={e => setApptTime(e.target.value)} required />
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
              <div style={{ marginBottom: '16px' }}>
                <label className="crm-label">Objetivo Clínico</label>
                <input type="text" className="crm-input" placeholder="Ex: Emagrecimento, Hipertrofia..." value={patObj} onChange={e => setPatObj(e.target.value)} required />
              </div>
              <div style={{ marginBottom: '24px' }}>
                <label className="crm-label">Restrições (Opcional)</label>
                <input type="text" className="crm-input" placeholder="Ex: Sem lactose, Vegano..." value={patRest} onChange={e => setPatRest(e.target.value)} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" className="crm-btn-secondary" onClick={() => setShowPatientModal(false)}>Cancelar</button>
                <button type="submit" className="crm-btn-primary">Salvar Paciente</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
