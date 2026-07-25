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
  const [apptLocationType, setApptLocationType] = useState('local');
  const [apptMeetingLink, setApptMeetingLink] = useState('');

  const [showPatientModal, setShowPatientModal] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [patName, setPatName] = useState('');
  const [patObj, setPatObj] = useState('');
  const [patRest, setPatRest] = useState('');
  const [patCpf, setPatCpf] = useState('');
  const [patEmail, setPatEmail] = useState('');
  const [patBirthDate, setPatBirthDate] = useState('');
  const [patGender, setPatGender] = useState('M');
  const [patAversions, setPatAversions] = useState('');
  const [patMedications, setPatMedications] = useState('');

  const [viewingPatientId, setViewingPatientId] = useState(null);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [synthesisResult, setSynthesisResult] = useState('');

  const [consultationStep, setConsultationStep] = useState(1);
  const [consultationType, setConsultationType] = useState('Primeira Consulta');
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
  const [toastMessage, setToastMessage] = useState('');

  const activePatient = patients.find(p => p.id === activePatientId) || patients[0];

  const handleCreateAppointment = (e) => {
    e.preventDefault();
    if (apptPatientId && apptDate && apptTime) {
      const conflict = appointments.some(a => a.date === apptDate && a.time === apptTime && a.status === 'agendado');
      if (conflict) {
        alert('Já existe um agendamento para esta mesma data e horário. Por favor, escolha outro horário.');
        return;
      }
      addAppointment(apptPatientId, apptDate, apptTime, apptType, apptLocationType, apptMeetingLink);
      setShowApptModal(false);
      setApptTime('');
      setApptDate('');
      setApptLocationType('local');
      setApptMeetingLink('');
    }
  };

  const openNewPatientModal = () => {
    setEditingPatient(null);
    setPatName(''); setPatObj(''); setPatRest(''); setPatCpf(''); setPatEmail(''); setPatBirthDate(''); setPatGender('M'); setPatAversions(''); setPatMedications('');
    setShowPatientModal(true);
  };

  const openEditPatientModal = (p) => {
    setEditingPatient(p.id);
    setPatName(p.name); setPatObj(p.objective); setPatRest(p.restrictions); setPatCpf(p.cpf || ''); setPatEmail(p.email || ''); setPatBirthDate(p.birthDate || ''); setPatGender(p.gender || 'M'); setPatAversions(p.aversions || ''); setPatMedications(p.medications || '');
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

    if (!patCpf || !patEmail) {
      alert("CPF e E-mail são obrigatórios!");
      return;
    }
    
    let calculatedAge = 0;
    if (patBirthDate) {
      const today = new Date();
      const bDate = new Date(patBirthDate);
      calculatedAge = today.getFullYear() - bDate.getFullYear();
      const m = today.getMonth() - bDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < bDate.getDate())) { calculatedAge--; }
    }

    if (editingPatient) {
      await updatePatient(editingPatient, { name: patName, objective: patObj, restrictions: patRest, cpf: patCpf, email: patEmail, birthDate: patBirthDate, age: calculatedAge, gender: patGender, aversions: patAversions, medications: patMedications });
    } else {
      const newId = await addPatient(patName, patObj, patRest, patCpf, normalizeEmail(patEmail), patAversions, patMedications, patBirthDate, patGender, calculatedAge);
      if (patEmail && newId) {
        const link = `${window.location.origin}/cadastro?vincular=${newId}`;
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
        setToastMessage('Paciente cadastrado com sucesso!');
        setTimeout(() => setToastMessage(''), 3000);
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
    setWorkoutPlan(null);
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
    setWorkoutPlan(null);
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
      
      const hasPreviousExams = activePatient.exams && activePatient.exams.length > 0;

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
${hasPreviousExams 
  ? 'Compare os achados atuais com o HISTÓRICO DE EXAMES ANTERIORES fornecido no contexto. Mostre o que melhorou, o que piorou e a tendência para cada marcador.' 
  : 'NÃO EXISTEM EXAMES ANTERIORES! Escreva EXATAMENTE E APENAS a seguinte frase nesta seção: "Não há dados para evolução por ser o primeiro exame registrado (Linha de Base)." NÃO INVENTE valores passados nem tente comparar com o normal.'}

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

      const formatInstruction = `Você deve retornar EXATAMENTE UM JSON contendo um array chamado 'meals'. Cada item no array deve ter 'name' (Nome da Refeição), 'desc' (Instruções gerais e preparo) e um array 'foods'.
No campo 'desc', você DEVE incluir:
1) A frase curta com a sugestão ou objetivo da refeição (ex: "Iniciar o dia com uma refeição rica em proteínas e carboidratos complexos.").
2) Duas quebras de linha (\\n\\n), seguidas pelo título "👨‍🍳 Sugestão de Preparo:" e um passo a passo completo e prático ensinando o paciente a preparar e combinar os alimentos dessa refeição.
Para cada alimento em 'foods', você DEVE buscar um item correspondente no BANCO DE DADOS DE ALIMENTOS PERMITIDOS e retornar:
- foodId: id do alimento no banco
- name: nome exato do alimento no banco
- amount: quantidade recomendada em gramas (number)
- kcal, carb, protein, fat: os valores nutricionais multiplicados pela quantidade recomendada (se 100g tem 100kcal, 50g terá 50kcal) (number)

Exemplo de formato:
{ "meals": [ { "name": "Almoço", "desc": "Refeição equilibrada e rica em nutrientes.\\n\\n👨‍🍳 Sugestão de Preparo:\\n1. Tempere o frango com ervas e grelhe no azeite por 5 min de cada lado.\\n2. Sirva acompanhado do arroz e salada fresca crua.", "foods": [ { "foodId": "14", "name": "Frango, peito, sem pele, grelhado", "amount": 150, "kcal": 238.5, "carb": 0, "protein": 48, "fat": 3.75 } ] } ] }`;

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
  - exercises: Um array de objetos. Cada objeto deve ter:
    - name: O nome do exercício (Ex: "Supino Reto")
    - sets: Número de séries (Ex: "4")
    - reps: Repetições e instruções (Ex: "10 a 12 (Descanso 60s)")

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
      const hasHistory = patient.consultations && patient.consultations.length > 0;
      
      const recentFoodLogs = (patient.foodLogs || []).slice(-15).map(f => `[${f.date} ${f.time}] ${f.mealName}: ${f.log}`).join(' | ') || 'Nenhum registro de refeição recente';
      const recentWaterLogs = patient.waterLogs ? Object.entries(patient.waterLogs).slice(-7).map(([date, ml]) => `${date}: ${ml}ml`).join(' | ') : 'Nenhum registro de água';
      const recentSleepLogs = (patient.sleepLogs || []).slice(-7).map(s => `${s.date}: ${s.hours}h (${s.quality})`).join(' | ') || 'Nenhum registro de sono';
      const statusCohort = patient.status === 'em_risco' ? '⚠️ EM RISCO DE ABANDONO (PERDENDO FOCO)' : (patient.status || 'Ativo');

      const patientDataString = `
      Nome: ${patient.name}
      Objetivo: ${patient.objective}
      Status no Cohort: ${statusCohort}
      Nível de Engajamento: ${patient.streak} dias seguidos (${patient.xp || 0} XP)
      Restrições: ${patient.restrictions || 'Nenhuma'}
      Anotações Antigas: ${patient.records || 'Sem anotações'}
      Últimos Pesos: ${patient.weights ? patient.weights.map(w => `${w.date}: ${w.value}kg`).join(' | ') : 'Nenhum'}
      Últimas Dietas Prescritas: ${patient.recipes ? patient.recipes.map(r => r.title).join(', ') : 'Nenhuma'}
      Exames Registrados: ${patient.exams ? patient.exams.map(e => e.date).join(', ') : 'Nenhum'}
      Consultas Realizadas: ${patient.consultations ? patient.consultations.length : 0}
      --- HISTÓRICO DE COMPORTAMENTO RECENTE (ÁGUA, SONO E REFEIÇÕES) ---
      Consumo de Água Recente: ${recentWaterLogs}
      Qualidade do Sono Recente: ${recentSleepLogs}
      Diário Alimentar Recente: ${recentFoodLogs}
      `;

      const sysPrompt = hasHistory 
        ? "Você é um consultor clínico e comportamental sênior de nutrição. Dê uma SÍNTESE CLÍNICA INTELIGENTE em 2 ou 3 parágrafos curtos e focados:\n1) Resumo do comportamento recente (ingestão de água, qualidade do sono, adesão às refeições).\n2) Integração com Cohorts: Avalie o risco de abandono (Se o paciente está em risco ou perdendo foco, justifique cruzando os dados de queda de engajamento, falha de sono ou água).\n3) Conduta e foco para a próxima consulta.\nSeja extremamente analítico, direto e entregue o diagnóstico mastigado."
        : "Você é um consultor clínico e comportamental sênior de nutrição. Este é o PRIMEIRO contato com o paciente. Faça uma análise inicial com base nos dados fornecidos (incluindo sono e água iniciais, se houver). Se o status no Cohort indicar risco de abandono precoce, destaque os possíveis motivos e recomende uma ação imediata de engajamento. NÃO invente evolução.";

      const response = await fetch('/api/openai-bridge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_prompt: sysPrompt,
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
    }
    if (activeApptId) markAppointmentDone(activeApptId);

    // Finalizar e salvar histórico de consulta
    const newConsultation = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      type: consultationType || 'Primeira Consulta',
      anamnesis: anamnesis,
      physicalEval: physicalEval,
      examResult: examResult,
      dietTitle: dietTitle,
      dietMeals: formattedMeals,
      dietSupplements: dietSupplements,
      dietDescription: dietDescription,
      workoutPlan: workoutPlan
    };
    
    const updatedConsultations = [...(activePatient.consultations || []), newConsultation];

    let updatePayload = { 
      records: activePatient.records + `\n\n[Consulta - ${new Date().toLocaleDateString('pt-BR')}]:\n${anamnesis}`,
      consultations: updatedConsultations
    };

    if (dietMeals.length > 0) {
      updatePayload.recipes = [{
        title: dietTitle || 'Plano Alimentar Padrão',
        description: dietDescription,
        supplements: dietSupplements,
        meals: formattedMeals
      }];
    }

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
        consultationType={consultationType} setConsultationType={setConsultationType}
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
        recipeLibrary={recipeLibrary} addBonusRecipe={addBonusRecipe}
      />
    );
  }

  return (
    <div style={{ '--crm-primary': clinicConfig.primaryColor }}>
      {toastMessage && (
        <div style={{ position: 'fixed', top: '20px', right: '20px', background: 'var(--crm-good)', color: 'white', padding: '16px 24px', borderRadius: '8px', zIndex: 9999, boxShadow: '0 4px 12px rgba(0,0,0,0.15)', fontWeight: '600', animation: 'fadeIn 0.3s ease' }}>
          {toastMessage}
        </div>
      )}
      <PatientList
        view={view} setView={setView}
        patients={patients} appointments={appointments}
        clinicConfig={clinicConfig} updateClinicConfig={updateClinicConfig}
        showApptModal={showApptModal} setShowApptModal={setShowApptModal}
        apptPatientId={apptPatientId} setApptPatientId={setApptPatientId}
        apptTime={apptTime} setApptTime={setApptTime}
        apptDate={apptDate} setApptDate={setApptDate}
        apptType={apptType} setApptType={setApptType}
        apptLocationType={apptLocationType} setApptLocationType={setApptLocationType}
        apptMeetingLink={apptMeetingLink} setApptMeetingLink={setApptMeetingLink}
        handleCreateAppointment={handleCreateAppointment} cancelAppointment={cancelAppointment} startConsultation={startConsultation}
        showPatientModal={showPatientModal} setShowPatientModal={setShowPatientModal}
        openNewPatientModal={openNewPatientModal} openEditPatientModal={openEditPatientModal} editingPatient={editingPatient} handleDeletePatient={handleDeletePatient}
        patName={patName} setPatName={setPatName} patObj={patObj} setPatObj={setPatObj} patRest={patRest} setPatRest={setPatRest} patCpf={patCpf} setPatCpf={setPatCpf} patEmail={patEmail} setPatEmail={setPatEmail} patBirthDate={patBirthDate} setPatBirthDate={setPatBirthDate} patGender={patGender} setPatGender={setPatGender} patAversions={patAversions} setPatAversions={setPatAversions} patMedications={patMedications} setPatMedications={setPatMedications} handleSavePatient={handleSavePatient}
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
