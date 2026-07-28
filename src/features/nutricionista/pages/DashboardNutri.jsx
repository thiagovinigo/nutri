import React, { useState } from 'react';
import { useAppContext } from '../../../context/AppContext';
import ConsultationFlow from '../components/ConsultationFlow';
import PatientList from '../components/PatientList';
import { extractTextFromPDF } from '../../../services/pdfService';
import tacoData from '../../../data/taco.json';
import supplementsData from '../../../data/supplements.json';
import { callOpenAIBridge } from '../../../utils/openaiBridge';
import { formatAnamnesisAnswers } from '../../../utils/anamnesis';
import { DEFAULT_TEMPLATE as DEFAULT_ANAMNESIS_TEMPLATE } from '../components/AnamnesisTemplateSettings';

export default function DashboardNutri() {
  const { 
    patients, addRecipe, activePatientId, setActivePatientId,
    clinicConfig, updateClinicConfig,
    addPatient, updatePatient, deletePatient,
    appointments, addAppointment, cancelAppointment, markAppointmentDone,
    addNotification,
    dietTemplates, deleteDietTemplate,
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
  const [patPhone, setPatPhone] = useState('');
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
  const [anamnesisAnswers, setAnamnesisAnswers] = useState({});
  const anamnesisTemplate = (clinicConfig?.anamnesisTemplate?.length > 0)
    ? clinicConfig.anamnesisTemplate
    : DEFAULT_ANAMNESIS_TEMPLATE;
  const anamnesisText = formatAnamnesisAnswers(anamnesisAnswers, anamnesisTemplate);
  
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
  const [dietSupplementsList, setDietSupplementsList] = useState([]);
  const [dietDuration, setDietDuration] = useState(1);
  const [dietMeals, setDietMeals] = useState([]);
  const [workoutPlan, setWorkoutPlan] = useState(null);
  const [isGeneratingDiet, setIsGeneratingDiet] = useState(false);
  const [isGeneratingSupplements, setIsGeneratingSupplements] = useState(false);
  const [isGeneratingWorkout, setIsGeneratingWorkout] = useState(false);

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
    setPatName(''); setPatObj(''); setPatRest(''); setPatCpf(''); setPatEmail(''); setPatPhone(''); setPatBirthDate(''); setPatGender('M'); setPatAversions(''); setPatMedications('');
    setShowPatientModal(true);
  };

  const openEditPatientModal = (p) => {
    setEditingPatient(p.id);
    // Pacientes cadastrados antes do campo de telefone existir não têm p.phone —
    // usamos um número padrão de placeholder pra não travar a edição; o
    // nutricionista corrige na hora se precisar mandar WhatsApp de verdade.
    setPatName(p.name); setPatObj(p.objective); setPatRest(p.restrictions); setPatCpf(p.cpf || ''); setPatEmail(p.email || ''); setPatPhone(p.phone || '11999999999'); setPatBirthDate(p.birthDate || ''); setPatGender(p.gender || 'M'); setPatAversions(p.aversions || ''); setPatMedications(p.medications || '');
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

    if (!patCpf || !patEmail || !patPhone) {
      alert("CPF, E-mail e Telefone são obrigatórios!");
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
      await updatePatient(editingPatient, { name: patName, objective: patObj, restrictions: patRest, cpf: patCpf, email: patEmail, phone: patPhone, birthDate: patBirthDate, age: calculatedAge, gender: patGender, aversions: patAversions, medications: patMedications });
    } else {
      const newId = await addPatient(patName, patObj, patRest, patCpf, normalizeEmail(patEmail), patAversions, patMedications, patBirthDate, patGender, calculatedAge, patPhone);
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
    setAnamnesisAnswers({});
    const pat = patients.find(p => p.id === patientId);
    setPhysicalEval({ weight: '', height: '', bodyFat: '', muscleMass: '', waist: '', hips: '', age: pat?.age || '', gender: pat?.gender || 'M', activityLevel: '1.2', tmb: '', get: '', protocoloDobras: 'nenhum', triceps: '', peitoral: '', subescapular: '', axilar: '', suprailiaca: '', abdomen: '', coxa: '', massaGorda: '', massaMagra: '' });
    setExamUploaded(false);
    setExamResult(null);
    setDietTitle('');
    setDietDescription('');
    setDietSupplements('');
    setDietSupplementsList([]);
    setDietDuration(1);
    setDietMeals([]);
    setWorkoutPlan(null);
    setView('consulta');
  };

  const openConsultation = (p) => {
    setActivePatientId(p.id);
    setConsultationStep(1);
    setAnamnesisAnswers({});
    setPhysicalEval({ weight: '', height: '', bodyFat: '', muscleMass: '', waist: '', hips: '', age: p.age || '', gender: p.gender || 'M', activityLevel: '1.2', tmb: '', get: '', protocoloDobras: 'nenhum', triceps: '', peitoral: '', subescapular: '', axilar: '', suprailiaca: '', abdomen: '', coxa: '', massaGorda: '', massaMagra: '' });
    setExamUploaded(false);
    setExamResult(null);
    setDietTitle('');
    setDietDescription('');
    setDietSupplements('');
    setDietSupplementsList([]);
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
        { type: "text", text: `Contexto do paciente: Objetivo é ${activePatient.objective}. Anamnese de hoje: ${anamnesisText}.\n\n` }
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

      const data = await callOpenAIBridge({
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
      });
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
    setIsGeneratingDiet(true);
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

      if (anamnesisText) promptContext += `\nAnamnese: ${anamnesisText}`;
      if (examResult) promptContext += `\nConduta Sugerida pelos Exames:\n${examResult}`;

      const miniTaco = tacoData.map(f => ({ id: f.id, name: f.name, kcal: f.kcal, carb: f.carb, ptn: f.protein, fat: f.fat }));
      promptContext += `\n\nBANCO DE DADOS DE ALIMENTOS PERMITIDOS (TACO - Valores por 100g):\n${JSON.stringify(miniTaco)}`;

      const formatInstruction = `Você deve retornar EXATAMENTE UM JSON contendo um array chamado 'meals'. Cada item no array deve ter 'name' (Nome da Refeição, ex: "Almoço"), 'desc' (a receita completa) e um array 'foods'.
Você é também um Chef de cozinha saudável: o campo 'desc' deve ler como uma RECEITA de verdade, gostosa e convidativa — nunca uma lista fria de instruções técnicas. No campo 'desc', você DEVE incluir, nesta ordem:
1) Um nome apetitoso e criativo para o prato, com um emoji (ex: "🍳 Omelete Cremosa de Espinafre com Queijo"), não apenas o nome genérico dos alimentos.
2) Uma frase curta e convidativa explicando por que esse prato é gostoso e como ele ajuda no objetivo do paciente (tom de chef que ama comida boa, não de relatório clínico).
3) Duas quebras de linha (\\n\\n), seguidas pelo título "👨‍🍳 Modo de Preparo:" e um passo a passo saboroso — combine temperos, texturas, técnicas de preparo (grelhar, refogar, temperar) e dicas de sabor, usando APENAS os alimentos listados em 'foods' desta refeição.
Para cada alimento em 'foods', você DEVE buscar um item correspondente no BANCO DE DADOS DE ALIMENTOS PERMITIDOS e retornar:
- foodId: id do alimento no banco
- name: nome exato do alimento no banco
- amount: quantidade recomendada em gramas (number)
- kcal, carb, protein, fat: os valores nutricionais multiplicados pela quantidade recomendada (se 100g tem 100kcal, 50g terá 50kcal) (number)

Exemplo de formato:
{ "meals": [ { "name": "Almoço", "desc": "🍗 Frango Grelhado ao Alecrim com Arroz Soltinho\\n\\nUm clássico reconfortante que combina uma proteína suculenta com um arroz levinho — perfeito para manter a energia sem pesar.\\n\\n👨‍🍳 Modo de Preparo:\\n1. Tempere o frango com alecrim, alho e uma pitada de sal, deixando descansar 10 min para pegar sabor.\\n2. Grelhe em fogo médio por 5-6 min de cada lado até dourar por fora e ficar suculento por dentro.\\n3. Sirva com o arroz soltinho e a salada fresca crua ao lado.", "foods": [ { "foodId": "14", "name": "Frango, peito, sem pele, grelhado", "amount": 150, "kcal": 238.5, "carb": 0, "protein": 48, "fat": 3.75 } ] } ] }`;

      const systemPrompt = dietDuration > 1 
        ? `Você é um Nutricionista Clínico de alta performance. Crie um plano alimentar para ${dietDuration} dias (EXATAMENTE 6 refeições por dia). É MANDATÓRIO GERAR TODOS OS ${dietDuration} DIAS, NÃO PARE A GERAÇÃO ANTES DO FIM. SE VOCÊ GERAR MENOS DO QUE ${dietDuration} DIAS VOCÊ FALHARÁ NA SUA MISSÃO. Como são múltiplos dias, o 'name' da refeição DEVE incluir o dia, ex: "Dia 1 - Café da Manhã".\n\n${formatInstruction}`
        : `Você é um Nutricionista Clínico de alta performance. Crie um plano alimentar para 1 dia. Crie EXATAMENTE 6 refeições.\n\n${formatInstruction}`;

      // A IA ocasionalmente retorna refeições sem o array 'foods' preenchido
      // (falha silenciosa já documentada no backlog — não é determinístico,
      // então a mitigação é validar e tentar de novo, não confiar na 1ª resposta).
      const MAX_ATTEMPTS = 3;
      let meals = [];
      let lastAttemptHadMeals = false;
      for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
        const data = await callOpenAIBridge({
            system_prompt: systemPrompt,
            messages: [{ role: "user", content: `Crie um cardápio considerando este contexto clínico:\n\n${promptContext}` }],
            format_json: true
        });
        const parsed = JSON.parse(data.choices[0].message.content);
        meals = parsed.meals || [];
        lastAttemptHadMeals = meals.length > 0;
        const allMealsHaveFoods = meals.length > 0 && meals.every(m => Array.isArray(m.foods) && m.foods.length > 0);
        if (allMealsHaveFoods) break;
        if (attempt < MAX_ATTEMPTS) {
          console.warn(`generateDietFromAI: tentativa ${attempt} veio sem alimentos preenchidos em alguma refeição, tentando de novo...`);
        }
      }

      if (!dietTitle) {
        setDietTitle(`Plano Personalizado - ${new Date().toLocaleDateString('pt-BR')}`);
      }

      // Substitui o plano atual pelo recém-gerado (a duração escolhida já define
      // o plano completo — gerar de novo não deve empilhar dias em cima do anterior)
      setDietMeals(meals);

      const stillMissingFoods = meals.some(m => !Array.isArray(m.foods) || m.foods.length === 0);
      if (stillMissingFoods) {
        setDietError(lastAttemptHadMeals
          ? 'A IA gerou o cardápio, mas algumas refeições vieram sem os alimentos detalhados mesmo após tentar de novo. Revise manualmente ou gere novamente.'
          : 'A IA não conseguiu gerar o cardápio após várias tentativas. Tente novamente em instantes.');
      }
    } catch (error) {
      setDietError(error.message || 'Erro ao gerar dieta com IA.');
    } finally {
      setIsGeneratingDiet(false);
    }
  };

  const generateSupplementsFromAI = async () => {
    setIsGeneratingSupplements(true);
    setDietError('');
    try {
      let promptContext = `Objetivo: ${activePatient.objective}. Idade: ${activePatient.age || 'Não informada'}. Sexo: ${activePatient.gender === 'M' ? 'Masculino' : 'Feminino'}.`;
      if (activePatient.restrictions) promptContext += `\nRestrições/Contraindicações: ${activePatient.restrictions}`;
      if (activePatient.medications) promptContext += `\nMedicamentos em uso: ${activePatient.medications}`;
      if (anamnesisText) promptContext += `\nAnamnese: ${anamnesisText}`;
      if (examResult) promptContext += `\nAnálise de Exames: ${examResult}`;

      const catalogList = supplementsData.map(s => `${s.name} (dose usual: ${s.defaultDosage})`).join(', ');
      promptContext += `\n\nCATÁLOGO DISPONÍVEL: ${catalogList}`;

      const mealNames = dietMeals.map(m => m.name).filter(Boolean);
      promptContext += `\n\nREFEIÇÕES JÁ CRIADAS NESTE CARDÁPIO: ${mealNames.length > 0 ? mealNames.join(', ') : 'nenhuma'}. Para cada suplemento sugerido, indique em qual dessas refeições o paciente deve tomá-lo (campo 'mealName', usando exatamente um dos nomes acima) — use o que fizer mais sentido clinicamente (ex: suplemento com gordura junto de uma refeição principal, estimulante longe do jantar). Se nenhuma refeição servir, deixe 'mealName' como string vazia.`;

      const hasExisting = dietSupplementsList.length > 0 || dietSupplements.trim().length > 0;
      if (hasExisting) {
        const existingList = dietSupplementsList.map(s => `${s.name} (${s.dosage}${s.mealName ? `, em ${s.mealName}` : ''})`).join(', ') || 'nenhum';
        promptContext += `\n\nO NUTRICIONISTA JÁ PRESCREVEU: ${existingList}. Observações adicionais já escritas: "${dietSupplements || 'nenhuma'}". Sugira APENAS suplementos complementares que ainda não estão nessa lista — não repita os que já existem.`;
      } else {
        promptContext += `\n\nNenhum suplemento foi prescrito ainda. Sugira uma lista completa e adequada ao caso clínico acima.`;
      }

      const data = await callOpenAIBridge({
        system_prompt: `Você é um Nutricionista Clínico especialista em suplementação. Retorne EXATAMENTE UM JSON com um array 'supplements', cada item com 'name' (nome do suplemento, preferencialmente do catálogo fornecido), 'dosage' (dose recomendada, ex: "1000mg" ou "1 cápsula") e 'mealName' (nome exato de uma das refeições já criadas, ou string vazia se for de uso geral). Não inclua explicações fora do JSON.`,
        messages: [{ role: "user", content: `Sugira suplementos considerando este contexto clínico:\n\n${promptContext}` }],
        format_json: true
      });
      const parsed = JSON.parse(data.choices[0].message.content);
      const suggested = (parsed.supplements || []).map(s => ({ id: Date.now().toString() + Math.random().toString(36).slice(2), name: s.name, dosage: s.dosage, mealName: mealNames.includes(s.mealName) ? s.mealName : '' }));
      setDietSupplementsList([...dietSupplementsList, ...suggested]);
    } catch (error) {
      setDietError(error.message || 'Erro ao sugerir suplementos com IA.');
    } finally {
      setIsGeneratingSupplements(false);
    }
  };

  const generateWorkoutFromAI = async () => {
    setIsGeneratingWorkout(true);
    setDietError('');
    try {
      let promptContext = `Objetivo: ${activePatient.objective}. Idade: ${activePatient.age || 'Não informada'}. Sexo: ${activePatient.gender === 'M' ? 'Masculino' : 'Feminino'}.`;
      
      // Dados físicos e metabólicos
      const physicalSummary = [];
      if (physicalEval.weight) physicalSummary.push(`Peso: ${physicalEval.weight}kg`);
      if (physicalEval.height) physicalSummary.push(`Altura: ${physicalEval.height}cm`);
      if (physicalEval.bodyFat) physicalSummary.push(`% de Gordura: ${physicalEval.bodyFat}%`);
      if (physicalEval.muscleMass) physicalSummary.push(`Massa Muscular: ${physicalEval.muscleMass}kg`);
      if (physicalEval.tmb) physicalSummary.push(`TMB: ${physicalEval.tmb} kcal`);
      if (physicalEval.get) physicalSummary.push(`GET: ${physicalEval.get} kcal`);
      if (physicalSummary.length > 0) {
        promptContext += `\nAvaliação Física Atual: ${physicalSummary.join(', ')}`;
      }

      // Nível de atividade física
      const activityLabels = {
        '1.2': 'Sedentário (sem exercício)',
        '1.375': 'Levemente Ativo (1-3x/semana)',
        '1.55': 'Moderadamente Ativo (3-5x/semana)',
        '1.725': 'Muito Ativo (6-7x/semana)',
        '1.9': 'Extremamente Ativo (atleta/2x dia)'
      };
      if (physicalEval.activityLevel) {
        promptContext += `\nNível de Atividade Atual: ${activityLabels[physicalEval.activityLevel] || physicalEval.activityLevel}`;
      }

      // Restrições, lesões e contraindicações
      if (activePatient.restrictions) {
        promptContext += `\nRestrições / Contraindicações / Lesões: ${activePatient.restrictions} — RESPEITE RIGOROSAMENTE ao montar os exercícios.`;
      }

      // Medicamentos em uso
      if (activePatient.medications) {
        promptContext += `\nMedicamentos em Uso: ${activePatient.medications} — considere possíveis impactos na performance e frequência cardíaca.`;
      }

      // Anamnese
      if (anamnesisText) promptContext += `\nAnamnese Clínica: ${anamnesisText}`;

      // Resultado dos exames laboratoriais (se disponível)
      if (examResult) {
        promptContext += `\n\nEXAMES LABORATORIAIS RECENTES (análise clínica):\n${examResult}\n— Leve em conta marcadores como colesterol, glicemia, hemoglobina, hormônios, etc. ao definir intensidade e volume de treino.`;
      }

      // Dieta prescrita — resumo de macros
      if (dietMeals && dietMeals.length > 0) {
        const totalKcal = dietMeals.reduce((sum, m) => sum + (m.foods?.reduce((s, f) => s + (f.kcal || 0), 0) || 0), 0);
        const totalPtn = dietMeals.reduce((sum, m) => sum + (m.foods?.reduce((s, f) => s + (f.protein || 0), 0) || 0), 0);
        const totalCarb = dietMeals.reduce((sum, m) => sum + (m.foods?.reduce((s, f) => s + (f.carb || 0), 0) || 0), 0);
        const totalFat = dietMeals.reduce((sum, m) => sum + (m.foods?.reduce((s, f) => s + (f.fat || 0), 0) || 0), 0);
        if (totalKcal > 0) {
          promptContext += `\n\nDIETA PRESCRITA (macros totais do plano alimentar atual): ${Math.round(totalKcal)} kcal | Proteína: ${Math.round(totalPtn)}g | Carboidrato: ${Math.round(totalCarb)}g | Gordura: ${Math.round(totalFat)}g`;
          promptContext += `\n— Ajuste o volume e intensidade do treino considerando a disponibilidade calórica. Em déficit calórico, prefira menor volume. Em superávit, mais volume e hipertrofia.`;
        }
      }

      const systemPrompt = `Você é um Personal Trainer de elite e fisiologista do exercício (nível Balestrini/Muzy) com formação clínica em nutrição esportiva.
Sua missão é criar uma Ficha de Treino perfeitamente estruturada, cientificamente embasada e 100% personalizada para o paciente com base em TODOS os dados fornecidos.

DIRETRIZES OBRIGATÓRIAS:
- Respeite TODAS as restrições, lesões e contraindicações informadas (substitua exercícios proibidos por alternativas seguras)
- Considere os resultados dos exames laboratoriais ao definir intensidade (ex: anemia → evitar alta intensidade; alteração hormonal → ajustar volume)
- Calibre volume e intensidade pela dieta prescrita (déficit calórico → menor volume; superávit → maior volume)
- Adapte a frequência semanal ao nível de atividade atual do paciente
- Para cada exercício, especifique séries, repetições E tempo de descanso

Você deve retornar EXATAMENTE UM JSON contendo os seguintes campos:
- title: O nome da periodização (Ex: "Hipertrofia - ABC", "Emagrecimento - FullBody 3x")
- days: Um array de objetos representando cada dia de treino da rotina.
Cada objeto em 'days' deve ter:
  - dayName: O nome do dia ou divisão (Ex: "Treino A - Peito e Tríceps", "Treino B - Costas e Bíceps")
  - exercises: Um array de objetos. Cada objeto deve ter:
    - name: O nome do exercício (Ex: "Supino Reto com Barra")
    - sets: Número de séries como string (Ex: "4")
    - reps: Repetições, carga sugerida e descanso (Ex: "10-12 reps | Descanso: 60s")

Não inclua textos fora do JSON. Apenas o JSON puro.`;

      const data = await callOpenAIBridge({
          system_prompt: systemPrompt,
          messages: [{ role: "user", content: `Crie a ficha de treino para:\n\n${promptContext}` }],
          format_json: true
      });
      const parsed = JSON.parse(data.choices[0].message.content);
      
      setWorkoutPlan(parsed);
    } catch (error) {
      setDietError(error.message || 'Erro ao gerar treino com IA.');
    } finally {
      setIsGeneratingWorkout(false);
    }
  };

  const generatePatientSynthesis = async (patient) => {
    setIsSynthesizing(true);
    setSynthesisResult('');
    setSynthesisError('');
    try {
      const hasHistory = patient.consultations && patient.consultations.length > 0;
      
      const recentFoodLogs = (patient.foodLogs || []).slice(-15).map(f => `[${f.date} ${f.time}] ${f.mealName}: ${f.log}`).join(' | ') || 'Nenhum registro de refeição recente';
      const recentSupplementLogs = (patient.supplementLogs || []).slice(-15).map(s => `[${s.date} ${s.time}] ${s.name}`).join(' | ') || 'Nenhum registro de suplemento tomado';
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
      Adesão a Suplementos/Vitaminas Recente: ${recentSupplementLogs}
      `;

      const sysPrompt = hasHistory 
        ? "Você é um consultor clínico e comportamental sênior de nutrição. Dê uma SÍNTESE CLÍNICA INTELIGENTE em 2 ou 3 parágrafos curtos e focados:\n1) Resumo do comportamento recente (ingestão de água, qualidade do sono, adesão às refeições).\n2) Integração com Cohorts: Avalie o risco de abandono (Se o paciente está em risco ou perdendo foco, justifique cruzando os dados de queda de engajamento, falha de sono ou água).\n3) Conduta e foco para a próxima consulta.\nSeja extremamente analítico, direto e entregue o diagnóstico mastigado."
        : "Você é um consultor clínico e comportamental sênior de nutrição. Este é o PRIMEIRO contato com o paciente. Faça uma análise inicial com base nos dados fornecidos (incluindo sono e água iniciais, se houver). Se o status no Cohort indicar risco de abandono precoce, destaque os possíveis motivos e recomende uma ação imediata de engajamento. NÃO invente evolução.";

      const data = await callOpenAIBridge({
          system_prompt: sysPrompt,
          messages: [{ role: "user", content: `Analise os dados deste paciente e gere a síntese clínica:\n${patientDataString}` }],
          format_json: false
      });
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
      anamnesis: anamnesisText,
      physicalEval: physicalEval,
      examResult: examResult,
      dietTitle: dietTitle,
      dietMeals: formattedMeals,
      dietSupplements: dietSupplements,
      dietSupplementsList: dietSupplementsList,
      dietDescription: dietDescription,
      workoutPlan: workoutPlan
    };
    
    const updatedConsultations = [...(activePatient.consultations || []), newConsultation];

    let updatePayload = { 
      records: activePatient.records + `\n\n[Consulta - ${new Date().toLocaleDateString('pt-BR')}]:\n${anamnesisText}`,
      consultations: updatedConsultations
    };

    if (dietMeals.length > 0) {
      updatePayload.recipes = [{
        title: dietTitle || 'Plano Alimentar Padrão',
        description: dietDescription,
        supplements: dietSupplements,
        supplementsList: dietSupplementsList,
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
        anamnesisAnswers={anamnesisAnswers} setAnamnesisAnswers={setAnamnesisAnswers}
        clinicConfig={clinicConfig}
        physicalEval={physicalEval} setPhysicalEval={setPhysicalEval}
        examUploaded={examUploaded} setExamUploaded={setExamUploaded}
        examAnalyzing={examAnalyzing}
        examResult={examResult} setExamTab={setExamTab} examTab={examTab}
        dietTitle={dietTitle} setDietTitle={setDietTitle}
        dietDescription={dietDescription} setDietDescription={setDietDescription}
        dietSupplements={dietSupplements} setDietSupplements={setDietSupplements}
        dietSupplementsList={dietSupplementsList} setDietSupplementsList={setDietSupplementsList}
        dietDuration={dietDuration} setDietDuration={setDietDuration}
        dietMeals={dietMeals} setDietMeals={setDietMeals}
        workoutPlan={workoutPlan} setWorkoutPlan={setWorkoutPlan}
        isGeneratingDiet={isGeneratingDiet}
        generateSupplementsFromAI={generateSupplementsFromAI}
        isGeneratingSupplements={isGeneratingSupplements}
        isGeneratingWorkout={isGeneratingWorkout}
        analyzeExamWithAI={analyzeExamWithAI}
        generateDietFromAI={generateDietFromAI}
        generateWorkoutFromAI={generateWorkoutFromAI}
        finishConsultation={finishConsultation}
        examError={examError} dietError={dietError} finishedMessage={finishedMessage}
        onSuspend={() => setView(activeApptId ? 'agenda' : 'pacientes')}
        recipeLibrary={recipeLibrary}
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
        patName={patName} setPatName={setPatName} patObj={patObj} setPatObj={setPatObj} patRest={patRest} setPatRest={setPatRest} patCpf={patCpf} setPatCpf={setPatCpf} patEmail={patEmail} setPatEmail={setPatEmail} patPhone={patPhone} setPatPhone={setPatPhone} patBirthDate={patBirthDate} setPatBirthDate={setPatBirthDate} patGender={patGender} setPatGender={setPatGender} patAversions={patAversions} setPatAversions={setPatAversions} patMedications={patMedications} setPatMedications={setPatMedications} handleSavePatient={handleSavePatient}
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
