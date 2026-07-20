import React, { useState } from 'react';
import { useAppContext } from '../../../context/AppContext';
import ConsultationFlow from '../components/ConsultationFlow';
import PatientList from '../components/PatientList';
import { extractTextFromPDF } from '../../../services/pdfService';
import tacoData from '../../../data/taco.json';

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
  const [patAge, setPatAge] = useState('');
  const [patGender, setPatGender] = useState('M');
  const [patAversions, setPatAversions] = useState('');
  const [patMedications, setPatMedications] = useState('');

  const [viewingPatientId, setViewingPatientId] = useState(null);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [synthesisResult, setSynthesisResult] = useState('');

  const [consultationStep, setConsultationStep] = useState(1);
  const [activeApptId, setActiveApptId] = useState(null);
  const [anamnesis, setAnamnesis] = useState('');
  
  const [physicalEval, setPhysicalEval] = useState({
    weight: '',
    height: '',
    bodyFat: '',
    muscleMass: '',
    waist: '',
    hips: '',
    age: '',
    gender: 'M',
    activityLevel: '1.2',
    tmb: '',
    get: '',
    protocoloDobras: 'nenhum',
    triceps: '',
    peitoral: '',
    subescapular: '',
    axilar: '',
    suprailiaca: '',
    abdomen: '',
    coxa: '',
    massaGorda: '',
    massaMagra: ''
  });
  
  const [examUploaded, setExamUploaded] = useState(false);
  const [examAnalyzing, setExamAnalyzing] = useState(false);
  const [examResult, setExamResult] = useState(null);
  const [examTab, setExamTab] = useState('detalhada'); 
  
  const [dietTitle, setDietTitle] = useState('');
  const [dietDescription, setDietDescription] = useState('');
  const [dietSupplements, setDietSupplements] = useState('');
  const [dietDuration, setDietDuration] = useState(1);
  const [dietMeals, setDietMeals] = useState([]);
  const [workoutPlan, setWorkoutPlan] = useState(null);
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
    setPatName(''); setPatObj(''); setPatRest(''); setPatCpf(''); setPatEmail(''); setPatAge(''); setPatGender('M'); setPatAversions(''); setPatMedications('');
    setShowPatientModal(true);
  };

  const openEditPatientModal = (p) => {
    setEditingPatient(p.id);
    setPatName(p.name); setPatObj(p.objective); setPatRest(p.restrictions); setPatCpf(p.cpf || ''); setPatEmail(p.email || ''); setPatAge(p.age || ''); setPatGender(p.gender || 'M'); setPatAversions(p.aversions || ''); setPatMedications(p.medications || '');
    setShowPatientModal(true);
  };

  const handleSavePatient = async (e) => {
    e.preventDefault();

    const normalizeCpf = (cpf) => String(cpf || '').replace(/\D/g, '');
    const normalizeEmail = (email) => String(email || '').toLowerCase().trim();

    // Validação de duplicidade aprimorada e super robusta
    const isDuplicate = patients.some(p => {
      if (editingPatient && p.id === editingPatient) return false;
      const cleanPatCpf = normalizeCpf(patCpf);
      const cleanPatEmail = normalizeEmail(patEmail);
      
      const sameCpf = cleanPatCpf !== '' && normalizeCpf(p.cpf) === cleanPatCpf;
      const sameEmail = cleanPatEmail !== '' && normalizeEmail(p.email) === cleanPatEmail;
      
      return sameCpf || sameEmail;
    });

    if (isDuplicate) {
      alert("Já existe um paciente cadastrado com este E-mail ou CPF!");
      return;
    }

    if (editingPatient) {
      await updatePatient(editingPatient, { name: patName, objective: patObj, restrictions: patRest, cpf: patCpf, email: patEmail, age: patAge, gender: patGender, aversions: patAversions, medications: patMedications });
    } else {
      const newId = await addPatient(patName, patObj, patRest, patCpf, patEmail, patAversions, patMedications, patAge, patGender);
      if (patEmail && newId) {
        const link = `${window.location.origin}/paciente?vincular=${newId}`;
        try {
          fetch('/api/send-email', {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({ to: patEmail, name: patName, link })
          });
        } catch (error) {
          console.error('Serviço de e-mail não configurado.', error);
        }
        // Abre o perfil do paciente recém-criado onde o link de cópia rápida está disponível no topo
        setViewingPatientId(newId);
      }
    }
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
    const pat = patients.find(p => p.id === patientId);
    setPhysicalEval({ weight: '', height: '', bodyFat: '', muscleMass: '', waist: '', hips: '', age: pat?.age || '', gender: pat?.gender || 'M', activityLevel: '1.2', tmb: '', get: '', protocoloDobras: 'nenhum', triceps: '', peitoral: '', subescapular: '', axilar: '', suprailiaca: '', abdomen: '', coxa: '', massaGorda: '', massaMagra: '' });
    setExamUploaded(false);
    setExamResult(null);
    setDietTitle('');
    setDietDescription('');
    setDietSupplements('');
    setDietDuration(1);
    setDietMeals([]);
    setView('consulta');
  };

  const openConsultation = (p) => {
    setActivePatientId(p.id);
    setConsultationStep(1);
    setAnamnesis('');
    setPhysicalEval({ weight: '', height: '', bodyFat: '', muscleMass: '', waist: '', hips: '', age: p.age || '', gender: p.gender || 'M', activityLevel: '1.2', tmb: '', get: '', protocoloDobras: 'nenhum', triceps: '', peitoral: '', subescapular: '', axilar: '', suprailiaca: '', abdomen: '', coxa: '', massaGorda: '', massaMagra: '' });
    setExamUploaded(false);
    setExamResult(null);
    setDietTitle('');
    setDietDescription('');
    setDietSupplements('');
    setDietDuration(1);
    setDietMeals([]);
    setView('consulta');
  };

  const analyzeExamWithAI = async (files) => {
    if (!files || files.length === 0) return;
    setExamAnalyzing(true);
    setExamError('');
    try {
      let contentArray = [
        { type: "text", text: `Contexto do paciente: Objetivo é ${activePatient.objective}. Anamnese de hoje: ${anamnesis}.\n\n` }
      ];

      if (activePatient.exams && activePatient.exams.length > 0) {
        contentArray[0].text += `HISTÓRICO DE EXAMES ANTERIORES DO PACIENTE (para comparação evolutiva):\n${JSON.stringify(activePatient.exams)}\n\n`;
      }
      
      contentArray[0].text += `Analise os novos exames anexados e faça a correlação obrigatória com o histórico acima (se houver):`;

      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.type.startsWith('image/')) {
          const base64 = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
          });
          contentArray.push({ type: "image_url", image_url: { url: base64 } });
        } else if (file.type === 'application/pdf') {
          const extractedText = await extractTextFromPDF(file);
          contentArray.push({ type: "text", text: `\n\n--- Conteúdo do PDF (${file.name}) ---\n${extractedText.substring(0, 450000)}` });
        } else {
          throw new Error(`Formato não suportado: ${file.name}. Envie PDF ou Imagem.`);
        }
      }

      const response = await fetch('/api/openai-bridge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_prompt: `Você é um motor de IA clínica estilo MedHub focado em nutrição funcional. 
Analise TODOS os resultados laboratoriais e de imagem anexados com detalhamento completo. 
Retorne o resultado OBRIGATORIAMENTE em texto formatado em Markdown, sem texto de introdução ou conclusão.
Use EXATAMENTE as seções com headers ## conforme mostrado abaixo (você deve usar esses exatos títulos):

## 1. Análise Detalhada
Liste cada grupo de exames analisados. OBRIGATORIAMENTE use o formato de LISTA (não use tabelas Markdown). Formato esperado para cada item:
- **[Parâmetro]:** [Resultado Encontrado] (Ref: [Valor de Referência]) - Status: [✅ Normal / ⚠️ Alterado / 🚨 Crítico]

## 2. Evolução Clínica (Comparação Histórica)
Se houver histórico de exames anteriores enviado no contexto, compare os achados de agora com os antigos. Mostre o que melhorou, o que piorou e a tendência. Se não houver histórico, diga "Este é o primeiro exame registrado (Linha de Base)".

## 3. Tradução para o Paciente (Linguagem Leiga)
Uma explicação simples, clara e empática sobre o que os exames dizem, perfeita para o profissional ler ou copiar para o paciente. Relacione os achados com os sintomas descritos na anamnese.

## 4. Visão do Profissional (Nutricionista / Comitê MedHub)
Você atua como um comitê clínico de alta performance onde o Nutricionista é o líder principal. Estruture esta seção OBRIGATORIAMENTE com os seguintes subtópicos:
- **Raciocínio Clínico e Metabólico:** Análise profunda das rotas impactadas e hipóteses.
- **Intervenções Dietéticas e Físicas:** Condutas de nutrição (macros, perfil de dieta) e energia para treinos.
- **Suplementação Estratégica:** Vitaminas, minerais e nutracêuticos.
- **Exames Complementares:** O que solicitar na próxima consulta para fechar diagnósticos.
- **Parecer do Comitê Médico:** Não diga apenas "Recomendamos o acionamento de um médico". Você (IA) DEVE ATUAR como o próprio comitê médico (MedHub)! Forneça a análise médica profunda sobre os achados (ex: "O Comitê Médico avalia que a hiperprolactinemia neste cenário indica..."). Ao final do seu parecer médico, adicione uma nota instruindo que o paciente deve ser aconselhado a buscar o especialista presencialmente (ex: Endocrinologista, Cardiologista) para acompanhamento clínico.

## 5. Referências Clínicas
Cite as fontes científicas, guidelines atualizados (como Diretrizes da SBC, SBD, ASPEN, ESPEN, ou artigos pubmed relevantes) que basearam as análises e intervenções sugeridas acima. Cite pelo menos 2 referências.`,
          messages: [{ role: "user", content: contentArray }]
        })
      });
      if (!response.ok) throw new Error("Erro na rede ou na API.");
      const data = await response.json();
      const rawResult = data.choices[0].message.content;
      setExamResult(rawResult);
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
      let promptContext = `Objetivo: ${activePatient.objective}. Restrições: ${activePatient.restrictions || 'Nenhuma'}. Idade: ${activePatient.age || 'Não informada'}. Sexo: ${activePatient.gender === 'M' ? 'Masculino' : 'Feminino'}.`;
      if (activePatient.aversions) promptContext += `\nAversões (Alimentos que o paciente NÃO COME de jeito nenhum): ${activePatient.aversions}`;
      if (activePatient.medications) promptContext += `\nMedicamentos em uso: ${activePatient.medications}`;
      
      const physicalSummary = [];
      if (physicalEval.weight) physicalSummary.push(`Peso: ${physicalEval.weight}kg`);
      if (physicalEval.height) physicalSummary.push(`Altura: ${physicalEval.height}cm`);
      if (physicalEval.bodyFat) physicalSummary.push(`% de Gordura: ${physicalEval.bodyFat}%`);
      if (physicalEval.tmb) physicalSummary.push(`TMB: ${physicalEval.tmb} kcal`);
      if (physicalEval.get) physicalSummary.push(`GET: ${physicalEval.get} kcal`);
      
      if (physicalSummary.length > 0) {
        promptContext += `\nAvaliação Física Atual: ${physicalSummary.join(', ')}`;
      }

      if (anamnesis) promptContext += `\nAnamnese: ${anamnesis}`;
      if (examResult) promptContext += `\nConduta Sugerida pelos Exames:\n${examResult}`;

      const miniTaco = tacoData.map(f => ({ id: f.id, name: f.name, kcal: f.kcal, carb: f.carb, ptn: f.protein, fat: f.fat }));
      promptContext += `\n\nBANCO DE DADOS DE ALIMENTOS PERMITIDOS (TACO - Valores por 100g):\n${JSON.stringify(miniTaco)}`;

      const formatInstruction = `Você deve retornar EXATAMENTE UM JSON contendo um array chamado 'meals'. Cada item no array deve ter 'name' (Nome da Refeição), 'desc' (Instruções gerais) e um array 'foods'.
Para cada alimento em 'foods', você DEVE buscar um item correspondente no BANCO DE DADOS DE ALIMENTOS PERMITIDOS e retornar:
- foodId: id do alimento no banco
- name: nome exato do alimento no banco
- amount: quantidade recomendada em gramas (number)
- kcal, carb, protein, fat: os valores nutricionais multiplicados pela quantidade recomendada (se 100g tem 100kcal, 50g terá 50kcal) (number)

Exemplo de formato:
{ "meals": [ { "name": "Almoço", "desc": "Não pular", "foods": [ { "foodId": "14", "name": "Frango, peito, sem pele, grelhado", "amount": 150, "kcal": 238.5, "carb": 0, "protein": 48, "fat": 3.75 } ] } ] }`;

      const systemPrompt = dietDuration > 1 
        ? `Você é um Nutricionista Clínico de alta performance. Crie um plano alimentar para ${dietDuration} dias (EXATAMENTE 6 refeições por dia). É MANDATÓRIO GERAR TODOS OS ${dietDuration} DIAS, NÃO PARE A GERAÇÃO ANTES DO FIM. SE VOCÊ GERAR MENOS DO QUE ${dietDuration} DIAS VOCÊ FALHARÁ NA SUA MISSÃO. Como são múltiplos dias, o 'name' da refeição DEVE incluir o dia, ex: "Dia 1 - Café da Manhã".\n\n${formatInstruction}`
        : `Você é um Nutricionista Clínico de alta performance. Crie um plano alimentar para 1 dia. Crie EXATAMENTE 6 refeições.\n\n${formatInstruction}`;

      const response = await fetch('/api/openai-bridge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_prompt: systemPrompt,
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

  const generateWorkoutFromAI = async () => {
    setIsGenerating(true);
    setDietError('');
    try {
      let promptContext = `Objetivo: ${activePatient.objective}. Idade: ${activePatient.age || 'Não informada'}. Sexo: ${activePatient.gender === 'M' ? 'Masculino' : 'Feminino'}.`;
      
      const physicalSummary = [];
      if (physicalEval.weight) physicalSummary.push(`Peso: ${physicalEval.weight}kg`);
      if (physicalEval.height) physicalSummary.push(`Altura: ${physicalEval.height}cm`);
      if (physicalEval.bodyFat) physicalSummary.push(`% de Gordura: ${physicalEval.bodyFat}%`);
      if (physicalSummary.length > 0) {
        promptContext += `\nAvaliação Física Atual: ${physicalSummary.join(', ')}`;
      }

      if (anamnesis) promptContext += `\nAnamnese: ${anamnesis}`;

      const systemPrompt = `Você é um Personal Trainer de elite e fisiologista do exercício (nível Balestrini/Muzy).
Sua missão é criar uma Ficha de Treino perfeitamente estruturada para o paciente com base nos dados fornecidos.

Você deve retornar EXATAMENTE UM JSON contendo os seguintes campos:
- title: O nome da periodização (Ex: "Hipertrofia - ABC", "Emagrecimento - FullBody")
- days: Um array de objetos representando cada dia de treino da rotina.
Cada objeto em 'days' deve ter:
  - dayName: O nome do dia ou divisão (Ex: "Treino A - Peito e Tríceps", "Treino B - Costas")
  - exercises: Um array de strings, onde cada string é um exercício formatado. (Ex: "Supino Reto 4x10 a 12 (Descanso 60s)")

Não inclua textos fora do JSON. Apenas o JSON puro.`;

      const response = await fetch('/api/openai-bridge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_prompt: systemPrompt,
          messages: [{ role: "user", content: `Crie a ficha de treino para:\n\n${promptContext}` }],
          format_json: true
        })
      });
      if (!response.ok) throw new Error("Erro na rede ou na API.");
      const data = await response.json();
      const parsed = JSON.parse(data.choices[0].message.content);
      
      setWorkoutPlan(parsed);
    } catch (error) {
      setDietError(error.message || 'Erro ao gerar treino com IA.');
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
    let formattedMeals = [];
    if (dietTitle && dietMeals.length > 0) {
      formattedMeals = dietMeals.map(m => ({ ...m, done: false, log: null }));
      addRecipe(activePatient.id, dietTitle, formattedMeals, dietDescription, dietSupplements);
    }
    if (activeApptId) markAppointmentDone(activeApptId);

    const newConsultation = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString('pt-BR'),
      anamnesis: anamnesis,
      physicalEval: physicalEval,
      examResult: examResult,
      dietTitle: dietTitle,
      dietMeals: formattedMeals,
      dietSupplements: dietSupplements,
      dietDescription: dietDescription
    };
    
    const updatedConsultations = [...(activePatient.consultations || []), newConsultation];

    let updatePayload = { 
      records: activePatient.records + `\n\n[Consulta - ${new Date().toLocaleDateString('pt-BR')}]:\n${anamnesis}`,
      consultations: updatedConsultations
    };

    if (workoutPlan) {
      updatePayload.workoutPlan = workoutPlan;
    }

    if (examResult) {
      const newExam = {
        id: Date.now().toString() + "_ex",
        date: new Date().toLocaleDateString('pt-BR'),
        Glicemia: null,
        Colesterol: null,
        aiSummaryProfessional: examResult
      };
      updatePayload.exams = [...(activePatient.exams || []), newExam];
    }

    updatePatient(activePatient.id, updatePayload);

    setFinishedMessage('Consulta finalizada! Cardápio estruturado enviado e histórico salvo.');
    setTimeout(() => { setFinishedMessage(''); setView('agenda'); }, 1800);
  };

  if (view === 'consulta') {
    return (
      <ConsultationFlow
        activePatient={activePatient}
        activeApptId={activeApptId}
        consultationStep={consultationStep} setConsultationStep={setConsultationStep}
        anamnesis={anamnesis} setAnamnesis={setAnamnesis}
        physicalEval={physicalEval} setPhysicalEval={setPhysicalEval}
        examUploaded={examUploaded} setExamUploaded={setExamUploaded}
        examAnalyzing={examAnalyzing}
        examResult={examResult} setExamTab={setExamTab} examTab={examTab}
        dietTitle={dietTitle} setDietTitle={setDietTitle}
        dietDescription={dietDescription} setDietDescription={setDietDescription}
        dietSupplements={dietSupplements} setDietSupplements={setDietSupplements}
        dietDuration={dietDuration} setDietDuration={setDietDuration}
        dietMeals={dietMeals} setDietMeals={setDietMeals}
        workoutPlan={workoutPlan} setWorkoutPlan={setWorkoutPlan}
        isGenerating={isGenerating}
        analyzeExamWithAI={analyzeExamWithAI}
        generateDietFromAI={generateDietFromAI}
        generateWorkoutFromAI={generateWorkoutFromAI}
        finishConsultation={finishConsultation}
        examError={examError} dietError={dietError} finishedMessage={finishedMessage}
        onSuspend={() => setView(activeApptId ? 'agenda' : 'pacientes')}
        dietTemplates={dietTemplates} addDietTemplate={addDietTemplate}
        recipeLibrary={recipeLibrary}
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
        patName={patName} setPatName={setPatName} patObj={patObj} setPatObj={setPatObj} patRest={patRest} setPatRest={setPatRest} patCpf={patCpf} setPatCpf={setPatCpf} patEmail={patEmail} setPatEmail={setPatEmail} patAge={patAge} setPatAge={setPatAge} patGender={patGender} setPatGender={setPatGender} patAversions={patAversions} setPatAversions={setPatAversions} patMedications={patMedications} setPatMedications={setPatMedications} handleSavePatient={handleSavePatient}
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
