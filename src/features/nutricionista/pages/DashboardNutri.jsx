import React, { useState } from 'react';
import { useAppContext } from '../../../context/AppContext';
import ConsultationFlow from '../components/ConsultationFlow';
import PatientList from '../components/PatientList';
import { extractTextFromPDF } from '../../../services/pdfService';

export default function DashboardNutri() {
  const { 
    patients, addRecipe, activePatientId, setActivePatientId,
    clinicConfig, updateClinicConfig,
    addPatient, updatePatient, deletePatient,
    appointments, addAppointment, cancelAppointment, markAppointmentDone,
    addNotification,
    dietTemplates, addDietTemplate, deleteDietTemplate,
    recipeLibrary, addLibraryRecipe, deleteLibraryRecipe,
    addBonusRecipe
  } = useAppContext();
  
  const [view, setView] = useState('overview');
  
  const [showApptModal, setShowApptModal] = useState(false);
  const [apptPatientId, setApptPatientId] = useState(patients[0]?.id || '');
  const [apptTime, setApptTime] = useState('');
  const [apptDate, setApptDate] = useState('');
  const [apptType, setApptType] = useState('Retorno');

  const [showPatientModal, setShowPatientModal] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [patName, setPatName] = useState('');
  const [patObj, setPatObj] = useState('');
  const [patRest, setPatRest] = useState('');
  const [patCpf, setPatCpf] = useState('');
  const [patEmail, setPatEmail] = useState('');

  const [viewingPatientId, setViewingPatientId] = useState(null);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [synthesisResult, setSynthesisResult] = useState('');

  const [consultationStep, setConsultationStep] = useState(1);
  const [activeApptId, setActiveApptId] = useState(null);
  const [anamnesis, setAnamnesis] = useState('');
  
  const [examUploaded, setExamUploaded] = useState(false);
  const [examAnalyzing, setExamAnalyzing] = useState(false);
  const [examResult, setExamResult] = useState(null);
  const [examTab, setExamTab] = useState('detalhada'); 
  
  const [dietTitle, setDietTitle] = useState('');
  const [dietMeals, setDietMeals] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const [examError, setExamError] = useState('');
  const [dietError, setDietError] = useState('');
  const [synthesisError, setSynthesisError] = useState('');
  const [finishedMessage, setFinishedMessage] = useState('');

  const activePatient = patients.find(p => p.id === activePatientId) || patients[0];

  const handleCreateAppointment = (e) => {
    e.preventDefault();
    if (apptPatientId && apptDate && apptTime) {
      addAppointment(apptPatientId, apptDate, apptTime, apptType);
      setShowApptModal(false);
      setApptTime('');
      setApptDate('');
    }
  };

  const openNewPatientModal = () => {
    setEditingPatient(null);
    setPatName(''); setPatObj(''); setPatRest(''); setPatCpf(''); setPatEmail('');
    setShowPatientModal(true);
  };

  const openEditPatientModal = (p) => {
    setEditingPatient(p.id);
    setPatName(p.name); setPatObj(p.objective); setPatRest(p.restrictions); setPatCpf(p.cpf || ''); setPatEmail(p.email || '');
    setShowPatientModal(true);
  };

  const handleSavePatient = (e) => {
    e.preventDefault();
    if (editingPatient) updatePatient(editingPatient, { name: patName, objective: patObj, restrictions: patRest, cpf: patCpf, email: patEmail });
    else addPatient(patName, patObj, patRest, patCpf, patEmail);
    setShowPatientModal(false);
  };

  const handleDeletePatient = (id) => {
    if(window.confirm('🚨 AÇÃO IRREVERSÍVEL! Tem certeza absoluta que deseja EXCLUIR todo o histórico deste paciente?')) {
      deletePatient(id);
      if(viewingPatientId === id) setViewingPatientId(null);
      setShowPatientModal(false);
    }
  };

  const startConsultation = (patientId, apptId) => {
    setActivePatientId(patientId);
    setActiveApptId(apptId);
    setConsultationStep(1);
    setAnamnesis('');
    setExamUploaded(false);
    setExamResult(null);
    setDietTitle('');
    setDietMeals([]);
    setView('consulta');
  };

  const analyzeExamWithAI = async (file) => {
    if (!file) return;
    setExamAnalyzing(true);
    setExamError('');
    try {
      let messages = [];
      
      if (file.type.startsWith('image/')) {
        // Converter imagem para Base64
        const base64 = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => resolve(reader.result);
          reader.onerror = error => reject(error);
        });
        
        messages = [{
          role: "user",
          content: [
            { type: "text", text: `Contexto do paciente: Objetivo é ${activePatient.objective}. Anamnese de hoje: ${anamnesis}.\n\nAnalise a imagem do laudo médico anexada:` },
            { type: "image_url", image_url: { url: base64 } }
          ]
        }];
      } else if (file.type === 'application/pdf') {
        const extractedText = await extractTextFromPDF(file);
        messages = [{
          role: "user",
          content: `Contexto do paciente: Objetivo é ${activePatient.objective}. Anamnese de hoje: ${anamnesis}.\n\nResultado do PDF extraído:\n${extractedText.substring(0, 50000)}`
        }];
      } else {
        throw new Error("Formato não suportado. Envie um PDF ou Imagem (JPG/PNG).");
      }

      const response = await fetch('/api/openai-bridge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_prompt: "Você é um motor de IA clínica estilo MedHub focado em nutrição funcional. Analise o exame laboratorial e retorne um JSON estrito com exatamente 3 chaves: 'detalhada' (Descreva minuciosamente os achados, marcadores alterados e seus valores), 'correlacao' (Faça a correlação fisiológica, riscos e diagnósticos cruzando com a anamnese e objetivo) e 'nutricao' (Liste ações de conduta nutricional e suplementação específicas para corrigir esses achados). ATENÇÃO: Os valores dessas chaves devem ser OBRIGATORIAMENTE textos limpos (pode usar quebras de linha \\n), nunca objetos aninhados.",
          messages: messages,
          format_json: true
        })
      });
      if (!response.ok) throw new Error("Erro na rede ou na API.");
      const data = await response.json();
      const parsedResult = JSON.parse(data.choices[0].message.content);
      setExamResult(parsedResult);
      setExamUploaded(true);
    } catch (error) {
      setExamError(error.message || 'Erro ao analisar exame.');
    } finally {
      setExamAnalyzing(false);
    }
  };

  const generateDietFromAI = async () => {
    setIsGenerating(true);
    setDietError('');
    try {
      let promptContext = `Objetivo: ${activePatient.objective}. Restrições: ${activePatient.restrictions || 'Nenhuma'}.`;
      if (anamnesis) promptContext += `\nAnamnese: ${anamnesis}`;
      if (examResult) promptContext += `\nConduta Sugerida pelos Exames: ${examResult.nutricao}`;

      const response = await fetch('/api/openai-bridge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_prompt: "Você é um Nutricionista Clínico de alta performance. Crie um esboço de plano alimentar e retorne EXATAMENTE UM JSON contendo um array chamado 'meals'. O plano deve conter OBRIGATORIAMENTE refeições completas (ex: Café da Manhã, Almoço, Jantar). Cada item no array deve ter 'name' (Nome da Refeição) e 'desc' (O que o paciente deve comer). Ex: { \"meals\": [ { \"name\": \"Almoço\", \"desc\": \"150g frango\" } ] }",
          messages: [{ role: "user", content: `Crie um cardápio considerando este contexto clínico:\n\n${promptContext}` }],
          format_json: true
        })
      });
      if (!response.ok) throw new Error("Erro na rede ou na API.");
      const data = await response.json();
      const parsed = JSON.parse(data.choices[0].message.content);
      
      if (!dietTitle) {
        setDietTitle(`Plano Personalizado - ${new Date().toLocaleDateString('pt-BR')}`);
      }
      
      // Anexa as novas refeições ao final das existentes
      setDietMeals(prev => {
        const currentCount = prev.length;
        const newMeals = parsed.meals || [];
        // Se já existem refeições, podemos adicionar um prefixo para separar os dias,
        // ou simplesmente anexar.
        return [...prev, ...newMeals];
      });
    } catch (error) {
      setDietError(error.message || 'Erro ao gerar dieta com IA.');
    } finally {
      setIsGenerating(false);
    }
  };

  const generatePatientSynthesis = async (patient) => {
    setIsSynthesizing(true);
    setSynthesisResult('');
    setSynthesisError('');
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

      const response = await fetch('/api/openai-bridge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_prompt: "Você é um consultor médico sênior. Dê uma SÍNTESE CLÍNICA INTELIGENTE em 2 ou 3 parágrafos focados: 1) Evolução do paciente. 2) O que focar na próxima consulta. Seja extremamente analítico, profissional e direto.",
          messages: [{ role: "user", content: `Analise os dados deste paciente e gere a síntese clínica:\n${patientDataString}` }],
          format_json: false
        })
      });
      if (!response.ok) throw new Error("Erro na rede ou na API.");
      const data = await response.json();
      setSynthesisResult(data.choices[0].message.content);
    } catch (error) {
      setSynthesisError(error.message || 'Erro ao gerar síntese da IA.');
    } finally {
      setIsSynthesizing(false);
    }
  };

  const finishConsultation = () => {
    if (dietTitle && dietMeals.length > 0) {
      const formattedMeals = dietMeals.map(m => ({ ...m, done: false, log: null }));
      addRecipe(activePatient.id, dietTitle, formattedMeals);
    }
    if (activeApptId) markAppointmentDone(activeApptId);
    updatePatient(activePatient.id, { records: activePatient.records + `\n\n[Consulta - ${new Date().toLocaleDateString('pt-BR')}]:\n${anamnesis}` });

    setFinishedMessage('Consulta finalizada! Cardápio estruturado enviado ao App do paciente.');
    setTimeout(() => { setFinishedMessage(''); setView('agenda'); }, 1800);
  };

  if (view === 'consulta') {
    return (
      <ConsultationFlow
        activePatient={activePatient}
        activeApptId={activeApptId}
        consultationStep={consultationStep} setConsultationStep={setConsultationStep}
        anamnesis={anamnesis} setAnamnesis={setAnamnesis}
        examUploaded={examUploaded} setExamUploaded={setExamUploaded}
        examAnalyzing={examAnalyzing}
        examResult={examResult} setExamTab={setExamTab} examTab={examTab}
        dietTitle={dietTitle} setDietTitle={setDietTitle}
        dietMeals={dietMeals} setDietMeals={setDietMeals}
        isGenerating={isGenerating}
        analyzeExamWithAI={analyzeExamWithAI}
        generateDietFromAI={generateDietFromAI}
        finishConsultation={finishConsultation}
        examError={examError} dietError={dietError} finishedMessage={finishedMessage}
        onSuspend={() => setView(activeApptId ? 'agenda' : 'pacientes')}
        dietTemplates={dietTemplates} addDietTemplate={addDietTemplate}
      />
    );
  }

  return (
    <div style={{ '--crm-primary': clinicConfig.primaryColor }}>
      <PatientList
        view={view} setView={setView}
        patients={patients} appointments={appointments}
        clinicConfig={clinicConfig} updateClinicConfig={updateClinicConfig}
        showApptModal={showApptModal} setShowApptModal={setShowApptModal}
        apptPatientId={apptPatientId} setApptPatientId={setApptPatientId}
        apptTime={apptTime} setApptTime={setApptTime}
        apptDate={apptDate} setApptDate={setApptDate}
        apptType={apptType} setApptType={setApptType}
        handleCreateAppointment={handleCreateAppointment} cancelAppointment={cancelAppointment} startConsultation={startConsultation}
        showPatientModal={showPatientModal} setShowPatientModal={setShowPatientModal}
        openNewPatientModal={openNewPatientModal} openEditPatientModal={openEditPatientModal} editingPatient={editingPatient} handleDeletePatient={handleDeletePatient}
        patName={patName} setPatName={setPatName} patObj={patObj} setPatObj={setPatObj} patRest={patRest} setPatRest={setPatRest} patCpf={patCpf} setPatCpf={setPatCpf} patEmail={patEmail} setPatEmail={setPatEmail} handleSavePatient={handleSavePatient}
        viewingPatientId={viewingPatientId} setViewingPatientId={setViewingPatientId}
        synthesisResult={synthesisResult} setSynthesisResult={setSynthesisResult} isSynthesizing={isSynthesizing} generatePatientSynthesis={generatePatientSynthesis}
        synthesisError={synthesisError}
        addNotification={addNotification}
        dietTemplates={dietTemplates} deleteDietTemplate={deleteDietTemplate}
        recipeLibrary={recipeLibrary} addLibraryRecipe={addLibraryRecipe} deleteLibraryRecipe={deleteLibraryRecipe}
        addBonusRecipe={addBonusRecipe}
      />
    </div>
  );
}
