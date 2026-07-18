import React, { useState, useEffect } from 'react';
import { FileText, Activity, Sparkles, Edit3, Send, Plus, X, Upload, CheckCircle, Trash2, GripVertical, Download } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import MealBuilder from './MealBuilder';

function normTitle(s) {
  return (s || '').toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z\s]/g, '').trim();
}

function parseMarkdownTabs(markdown) {
  if (!markdown) return {};
  const chunks = [];
  let cur = null;
  const lines = markdown.split('\n');
  for (let line of lines) {
    const cleanLine = line.trim();
    let headerMatch = cleanLine.match(/^#{1,6}\s+(.*)$/);
    if (!headerMatch) {
      headerMatch = cleanLine.match(/^\*\*(.*?)\*\*:?$/);
    }
    
    if (headerMatch) {
      if (cur) chunks.push(cur);
      cur = { title: normTitle(headerMatch[1]), lines: [] };
    } else if (cur) {
      cur.lines.push(line);
    } else if (cleanLine !== '') {
      cur = { title: 'analise detalhada', lines: [line] };
    }
  }
  if (cur) chunks.push(cur);

  const find = (...keys) => {
    const c = chunks.filter(c => keys.some(k => c.title.includes(k)));
    return c.length ? c.map(x => x.lines.join('\n').trim()).join('\n\n---\n\n') : '';
  };

  const parsed = {
    detalhada: find('analise detalhada', 'exames'),
    evolucao: find('evolucao', 'comparacao', 'historico'),
    leiga: find('traducao para o paciente', 'linguagem leiga', 'leiga', 'paciente'),
    profissional: find('visao do profissional', 'medica', 'nutricional', 'tecnica'),
    referencias: find('referencias bibliograficas', 'referencias'),
  };

  if (!parsed.detalhada && !parsed.leiga && !parsed.profissional && !parsed.evolucao) {
    parsed.detalhada = markdown;
  }

  return parsed;
}

const EXAM_TABS = [
  { key: 'detalhada', label: 'Análise Detalhada' },
  { key: 'evolucao', label: 'Evolução Clínica' },
  { key: 'leiga', label: 'Tradução para o Paciente' },
  { key: 'profissional', label: 'Visão do Prof. e Comitê' },
  { key: 'referencias', label: 'Referências' },
];

export default function ConsultationFlow({
  activePatient,
  activeApptId,
  consultationStep, setConsultationStep,
  anamnesis, setAnamnesis,
  physicalEval, setPhysicalEval,
  examUploaded, setExamUploaded,
  examAnalyzing,
  examResult, setExamTab, examTab,
  dietTitle, setDietTitle,
  dietDescription, setDietDescription,
  dietSupplements, setDietSupplements,
  dietDuration, setDietDuration,
  dietMeals, setDietMeals,
  isGenerating,
  analyzeExamWithAI,
  generateDietFromAI,
  finishConsultation,
  examError, dietError, finishedMessage,
  onSuspend,
  dietTemplates, addDietTemplate,
  recipeLibrary
}) {
  const [draggedRecipe, setDraggedRecipe] = useState(null);
  const [selectedExamFiles, setSelectedExamFiles] = useState([]);
  const [prescriptionTab, setPrescriptionTab] = useState('cardapio');

  useEffect(() => {
    if (physicalEval) {
      const weight = parseFloat(physicalEval.weight);
      const height = parseFloat(physicalEval.height);
      const age = parseInt(physicalEval.age, 10);
      const gender = physicalEval.gender || 'M';
      const activityLevel = parseFloat(physicalEval.activityLevel || '1.2');

      if (!isNaN(weight) && !isNaN(height) && !isNaN(age)) {
        let tmbCalc = 0;
        if (gender === 'M') {
          tmbCalc = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
        } else {
          tmbCalc = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
        }
        
        const getCalc = tmbCalc * activityLevel;
        
        const newTmb = Math.round(tmbCalc).toString();
        const newGet = Math.round(getCalc).toString();

        let newBodyFat = physicalEval.bodyFat;
        let newMassaGorda = physicalEval.massaGorda;
        let newMassaMagra = physicalEval.massaMagra;

        const protocolo = physicalEval.protocoloDobras;
        if (protocolo === 'pollock3' || protocolo === 'pollock7') {
          const triceps = parseFloat(physicalEval.triceps || 0);
          const peitoral = parseFloat(physicalEval.peitoral || 0);
          const subescapular = parseFloat(physicalEval.subescapular || 0);
          const axilar = parseFloat(physicalEval.axilar || 0);
          const suprailiaca = parseFloat(physicalEval.suprailiaca || 0);
          const abdomen = parseFloat(physicalEval.abdomen || 0);
          const coxa = parseFloat(physicalEval.coxa || 0);

          let sum = 0;
          let bd = 0;

          if (protocolo === 'pollock3') {
            if (gender === 'M') {
              sum = peitoral + abdomen + coxa;
              if (sum > 0) bd = 1.10938 - (0.0008267 * sum) + (0.0000016 * Math.pow(sum, 2)) - (0.0002574 * age);
            } else {
              sum = triceps + suprailiaca + coxa;
              if (sum > 0) bd = 1.0994921 - (0.0009929 * sum) + (0.0000023 * Math.pow(sum, 2)) - (0.0001392 * age);
            }
          } else if (protocolo === 'pollock7') {
            sum = triceps + peitoral + subescapular + axilar + suprailiaca + abdomen + coxa;
            if (gender === 'M') {
              if (sum > 0) bd = 1.112 - (0.00043499 * sum) + (0.00000055 * Math.pow(sum, 2)) - (0.00028826 * age);
            } else {
              if (sum > 0) bd = 1.097 - (0.00046971 * sum) + (0.00000056 * Math.pow(sum, 2)) - (0.00012828 * age);
            }
          }

          if (bd > 0) {
            const fatPerc = (495 / bd) - 450;
            if (fatPerc > 0 && fatPerc < 100) {
              newBodyFat = fatPerc.toFixed(1);
              const mg = (weight * fatPerc) / 100;
              newMassaGorda = mg.toFixed(1);
              newMassaMagra = (weight - mg).toFixed(1);
            }
          }
        }

        if (physicalEval.tmb !== newTmb || physicalEval.get !== newGet || physicalEval.bodyFat !== newBodyFat || physicalEval.massaGorda !== newMassaGorda || physicalEval.massaMagra !== newMassaMagra) {
          setPhysicalEval(prev => ({
            ...prev,
            tmb: newTmb,
            get: newGet,
            bodyFat: newBodyFat,
            massaGorda: newMassaGorda,
            massaMagra: newMassaMagra
          }));
        }
      } else if (physicalEval.tmb || physicalEval.get) {
        setPhysicalEval(prev => ({
          ...prev,
          tmb: '',
          get: ''
        }));
      }
    }
  }, [
    physicalEval?.weight, physicalEval?.height, physicalEval?.age, physicalEval?.gender, physicalEval?.activityLevel,
    physicalEval?.protocoloDobras, physicalEval?.triceps, physicalEval?.peitoral, physicalEval?.subescapular,
    physicalEval?.axilar, physicalEval?.suprailiaca, physicalEval?.abdomen, physicalEval?.coxa
  ]);

  const handleDragStart = (e, recipe) => {
    setDraggedRecipe(recipe);
    e.dataTransfer.effectAllowed = "copy";
  };

  const handleDropToMeal = (e, idx) => {
    e.preventDefault();
    if (!draggedRecipe) return;
    const newMeals = [...dietMeals];
    const oldDesc = newMeals[idx].desc || '';
    const newContent = `${draggedRecipe.title}\nIngredientes: ${draggedRecipe.ingredients}\nPreparo: ${draggedRecipe.instructions}`;
    newMeals[idx].desc = oldDesc ? `${oldDesc}\n\n---\n${newContent}` : newContent;
    setDietMeals(newMeals);
    setDraggedRecipe(null);
  };
  
  return (
    <div className="crm-container" style={{ display: 'flex', height: '100vh' }}>
      <div style={{ width: '280px', backgroundColor: 'var(--crm-surface)', borderRight: '1px solid var(--crm-border)', padding: '24px', display: 'flex', flexDirection: 'column' }}>
        <button onClick={onSuspend} className="crm-nav-btn" style={{ color: 'var(--crm-danger)', marginBottom: '24px' }}>
          ← Suspender Consulta
        </button>
        
        <div className="crm-card" style={{ padding: '16px', marginBottom: '24px', backgroundColor: '#F8FAFC' }}>
          <strong style={{ fontSize: '1.1rem' }}>{activePatient.name}</strong>
          <p style={{ fontSize: '0.85rem', color: 'var(--crm-text-muted)', marginTop: '4px' }}>Obj: {activePatient.objective}</p>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button className={`crm-nav-btn ${consultationStep === 1 ? 'active' : ''}`} onClick={() => setConsultationStep(1)}>1. Anamnese</button>
          <button className={`crm-nav-btn ${consultationStep === 2 ? 'active' : ''}`} onClick={() => setConsultationStep(2)}>2. Avaliação Física</button>
          <button className={`crm-nav-btn ${consultationStep === 3 ? 'active' : ''}`} onClick={() => setConsultationStep(3)}>3. Exames (IA OpenAI)</button>
          <button className={`crm-nav-btn ${consultationStep === 4 ? 'active' : ''}`} onClick={() => setConsultationStep(4)}>4. Prescrição Estruturada</button>
          <button className={`crm-nav-btn ${consultationStep === 5 ? 'active' : ''}`} onClick={() => setConsultationStep(5)}>5. Resumo e Envio</button>
        </nav>
      </div>

      <div style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
        <div className="animate-pop-in">
          {consultationStep === 1 && (
            <div className="crm-card">
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}><FileText color="var(--crm-accent)" /> Anamnese e Queixas Principais</h2>
              <label className="crm-label">Anotações Clínicas de Hoje</label>
              <textarea className="crm-input" placeholder="Como o paciente tem se sentido? As notas aqui servirão de contexto para a IA gerar a dieta." value={anamnesis} onChange={(e) => setAnamnesis(e.target.value)} style={{ height: '250px', resize: 'vertical' }} />
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
                <button className="crm-btn-primary" onClick={() => setConsultationStep(2)}>Avançar para Avaliação Física →</button>
              </div>
            </div>
          )}

          {consultationStep === 2 && (
            <div className="crm-card animate-pop-in">
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}><Activity color="var(--crm-accent)" /> Avaliação Física e Antropometria</h2>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                <div>
                  <label className="crm-label">Idade (anos)</label>
                  <input type="number" className="crm-input" value={physicalEval?.age || ''} onChange={(e) => setPhysicalEval({...physicalEval, age: e.target.value})} placeholder="Ex: 30" />
                </div>
                <div>
                  <label className="crm-label">Sexo</label>
                  <select className="crm-input" value={physicalEval?.gender || 'M'} onChange={(e) => setPhysicalEval({...physicalEval, gender: e.target.value})}>
                    <option value="M">Masculino</option>
                    <option value="F">Feminino</option>
                  </select>
                </div>
                <div>
                  <label className="crm-label">Peso Atual (kg)</label>
                  <input type="number" className="crm-input" value={physicalEval?.weight || ''} onChange={(e) => setPhysicalEval({...physicalEval, weight: e.target.value})} placeholder="Ex: 75.5" />
                </div>
                <div>
                  <label className="crm-label">Altura (cm)</label>
                  <input type="number" className="crm-input" value={physicalEval?.height || ''} onChange={(e) => setPhysicalEval({...physicalEval, height: e.target.value})} placeholder="Ex: 175" />
                </div>
                <div>
                  <label className="crm-label">Fator de Atividade</label>
                  <select className="crm-input" value={physicalEval?.activityLevel || '1.2'} onChange={(e) => setPhysicalEval({...physicalEval, activityLevel: e.target.value})}>
                    <option value="1.2">Sedentário (pouco/nenhum exp. físico)</option>
                    <option value="1.375">Levemente Ativo (exercício 1-3 dias/sem)</option>
                    <option value="1.55">Moderadamente Ativo (3-5 dias/sem)</option>
                    <option value="1.725">Muito Ativo (6-7 dias/sem)</option>
                    <option value="1.9">Extremamente Ativo (Atleta/treino 2x dia)</option>
                  </select>
                </div>
                </div>

              <div style={{ marginTop: '24px', marginBottom: '24px', backgroundColor: '#F8FAFC', padding: '16px', borderRadius: '8px', border: '1px solid var(--crm-border)' }}>
                <h3 style={{ fontSize: '1rem', marginBottom: '16px', color: 'var(--crm-text-main)' }}>Perímetros (cm)</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '16px' }}>
                  <div>
                    <label className="crm-label">Cintura</label>
                    <input type="number" className="crm-input" value={physicalEval?.waist || ''} onChange={(e) => setPhysicalEval({...physicalEval, waist: e.target.value})} placeholder="Ex: 80" />
                  </div>
                  <div>
                    <label className="crm-label">Abdômen</label>
                    <input type="number" className="crm-input" value={physicalEval?.abdomenCirc || ''} onChange={(e) => setPhysicalEval({...physicalEval, abdomenCirc: e.target.value})} placeholder="Ex: 85" />
                  </div>
                  <div>
                    <label className="crm-label">Quadril</label>
                    <input type="number" className="crm-input" value={physicalEval?.hips || ''} onChange={(e) => setPhysicalEval({...physicalEval, hips: e.target.value})} placeholder="Ex: 100" />
                  </div>
                  <div>
                    <label className="crm-label">Braço Dir.</label>
                    <input type="number" className="crm-input" value={physicalEval?.armRight || ''} onChange={(e) => setPhysicalEval({...physicalEval, armRight: e.target.value})} placeholder="Ex: 30" />
                  </div>
                  <div>
                    <label className="crm-label">Braço Esq.</label>
                    <input type="number" className="crm-input" value={physicalEval?.armLeft || ''} onChange={(e) => setPhysicalEval({...physicalEval, armLeft: e.target.value})} placeholder="Ex: 30" />
                  </div>
                  <div>
                    <label className="crm-label">Coxa Dir.</label>
                    <input type="number" className="crm-input" value={physicalEval?.thighRight || ''} onChange={(e) => setPhysicalEval({...physicalEval, thighRight: e.target.value})} placeholder="Ex: 55" />
                  </div>
                  <div>
                    <label className="crm-label">Coxa Esq.</label>
                    <input type="number" className="crm-input" value={physicalEval?.thighLeft || ''} onChange={(e) => setPhysicalEval({...physicalEval, thighLeft: e.target.value})} placeholder="Ex: 55" />
                  </div>
                  <div>
                    <label className="crm-label">Panturrilha Dir.</label>
                    <input type="number" className="crm-input" value={physicalEval?.calfRight || ''} onChange={(e) => setPhysicalEval({...physicalEval, calfRight: e.target.value})} placeholder="Ex: 35" />
                  </div>
                  <div>
                    <label className="crm-label">Panturrilha Esq.</label>
                    <input type="number" className="crm-input" value={physicalEval?.calfLeft || ''} onChange={(e) => setPhysicalEval({...physicalEval, calfLeft: e.target.value})} placeholder="Ex: 35" />
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '24px', marginBottom: '24px', backgroundColor: '#F8FAFC', padding: '16px', borderRadius: '8px', border: '1px solid var(--crm-border)' }}>
                <h3 style={{ fontSize: '1rem', marginBottom: '16px', color: 'var(--crm-text-main)' }}>Bioimpedância</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                  <div>
                    <label className="crm-label">% Gordura Corporal</label>
                    <input type="number" className="crm-input" value={physicalEval?.bodyFat || ''} onChange={(e) => setPhysicalEval({...physicalEval, bodyFat: e.target.value})} placeholder="Ex: 15" />
                  </div>
                  <div>
                    <label className="crm-label">% Massa Muscular</label>
                    <input type="number" className="crm-input" value={physicalEval?.muscleMass || ''} onChange={(e) => setPhysicalEval({...physicalEval, muscleMass: e.target.value})} placeholder="Ex: 40" />
                  </div>
                  <div>
                    <label className="crm-label">Massa Óssea (kg)</label>
                    <input type="number" className="crm-input" value={physicalEval?.boneMass || ''} onChange={(e) => setPhysicalEval({...physicalEval, boneMass: e.target.value})} placeholder="Ex: 3.5" />
                  </div>
                  <div>
                    <label className="crm-label">Água Corporal (%)</label>
                    <input type="number" className="crm-input" value={physicalEval?.bodyWater || ''} onChange={(e) => setPhysicalEval({...physicalEval, bodyWater: e.target.value})} placeholder="Ex: 55" />
                  </div>
                  <div>
                    <label className="crm-label">Gordura Visceral</label>
                    <input type="number" className="crm-input" value={physicalEval?.visceralFat || ''} onChange={(e) => setPhysicalEval({...physicalEval, visceralFat: e.target.value})} placeholder="Ex: 4" />
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '24px', marginBottom: '24px', backgroundColor: '#F8FAFC', padding: '16px', borderRadius: '8px', border: '1px solid var(--crm-border)' }}>
                <h3 style={{ fontSize: '1rem', marginBottom: '16px', color: 'var(--crm-text-main)' }}>Protocolo de Dobras Cutâneas (Plicometria)</h3>
                <div style={{ marginBottom: '16px' }}>
                  <label className="crm-label">Protocolo Utilizado</label>
                  <select className="crm-input" style={{ width: '300px' }} value={physicalEval?.protocoloDobras || 'nenhum'} onChange={(e) => setPhysicalEval({...physicalEval, protocoloDobras: e.target.value})}>
                    <option value="nenhum">Nenhum (Inserir % Gordura Manualmente)</option>
                    <option value="pollock3">Jackson & Pollock (3 Dobras)</option>
                    <option value="pollock7">Jackson & Pollock (7 Dobras)</option>
                  </select>
                </div>

                {physicalEval?.protocoloDobras !== 'nenhum' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '16px' }}>
                    {(physicalEval?.protocoloDobras === 'pollock7' || (physicalEval?.protocoloDobras === 'pollock3' && physicalEval?.gender === 'F')) && (
                      <div><label className="crm-label">Tríceps (mm)</label><input type="number" className="crm-input" value={physicalEval?.triceps || ''} onChange={(e) => setPhysicalEval({...physicalEval, triceps: e.target.value})} /></div>
                    )}
                    {(physicalEval?.protocoloDobras === 'pollock7' || (physicalEval?.protocoloDobras === 'pollock3' && physicalEval?.gender === 'M')) && (
                      <div><label className="crm-label">Peitoral (mm)</label><input type="number" className="crm-input" value={physicalEval?.peitoral || ''} onChange={(e) => setPhysicalEval({...physicalEval, peitoral: e.target.value})} /></div>
                    )}
                    {(physicalEval?.protocoloDobras === 'pollock7') && (
                      <div><label className="crm-label">Subescapular (mm)</label><input type="number" className="crm-input" value={physicalEval?.subescapular || ''} onChange={(e) => setPhysicalEval({...physicalEval, subescapular: e.target.value})} /></div>
                    )}
                    {(physicalEval?.protocoloDobras === 'pollock7') && (
                      <div><label className="crm-label">Axilar Média (mm)</label><input type="number" className="crm-input" value={physicalEval?.axilar || ''} onChange={(e) => setPhysicalEval({...physicalEval, axilar: e.target.value})} /></div>
                    )}
                    {(physicalEval?.protocoloDobras === 'pollock7' || (physicalEval?.protocoloDobras === 'pollock3' && physicalEval?.gender === 'F')) && (
                      <div><label className="crm-label">Suprailíaca (mm)</label><input type="number" className="crm-input" value={physicalEval?.suprailiaca || ''} onChange={(e) => setPhysicalEval({...physicalEval, suprailiaca: e.target.value})} /></div>
                    )}
                    {(physicalEval?.protocoloDobras === 'pollock7' || (physicalEval?.protocoloDobras === 'pollock3' && physicalEval?.gender === 'M')) && (
                      <div><label className="crm-label">Abdominal (mm)</label><input type="number" className="crm-input" value={physicalEval?.abdomen || ''} onChange={(e) => setPhysicalEval({...physicalEval, abdomen: e.target.value})} /></div>
                    )}
                    {(physicalEval?.protocoloDobras === 'pollock7' || physicalEval?.protocoloDobras === 'pollock3') && (
                      <div><label className="crm-label">Coxa (mm)</label><input type="number" className="crm-input" value={physicalEval?.coxa || ''} onChange={(e) => setPhysicalEval({...physicalEval, coxa: e.target.value})} /></div>
                    )}
                  </div>
                )}
              </div>

              {(physicalEval?.tmb || physicalEval?.massaMagra) && (
                <div style={{ backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '12px', padding: '20px', marginBottom: '24px', display: 'flex', gap: '24px', alignItems: 'center' }}>
                  <div style={{ padding: '12px', backgroundColor: '#DBEAFE', borderRadius: '50%' }}>
                    <Sparkles size={24} color="#1D4ED8" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ color: '#1E3A8A', marginBottom: '16px', fontSize: '1.1rem' }}>Estimativas Biométricas Automáticas</h3>
                    <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
                      {physicalEval?.tmb && (
                        <>
                          <div>
                            <span style={{ fontSize: '0.85rem', color: '#3B82F6', textTransform: 'uppercase', fontWeight: 600 }}>TMB (Basal)</span>
                            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1E3A8A' }}>{physicalEval.tmb} kcal</div>
                          </div>
                          <div>
                            <span style={{ fontSize: '0.85rem', color: '#3B82F6', textTransform: 'uppercase', fontWeight: 600 }}>GET (Total)</span>
                            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1E3A8A' }}>{physicalEval.get} kcal</div>
                          </div>
                        </>
                      )}
                      {physicalEval?.protocoloDobras !== 'nenhum' && physicalEval?.bodyFat && (
                        <>
                          <div>
                            <span style={{ fontSize: '0.85rem', color: '#3B82F6', textTransform: 'uppercase', fontWeight: 600 }}>% Gordura Calculado</span>
                            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1E3A8A' }}>{physicalEval.bodyFat}%</div>
                          </div>
                          <div>
                            <span style={{ fontSize: '0.85rem', color: '#3B82F6', textTransform: 'uppercase', fontWeight: 600 }}>Massa Magra</span>
                            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1E3A8A' }}>{physicalEval.massaMagra} kg</div>
                          </div>
                          <div>
                            <span style={{ fontSize: '0.85rem', color: '#3B82F6', textTransform: 'uppercase', fontWeight: 600 }}>Massa Gorda</span>
                            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1E3A8A' }}>{physicalEval.massaGorda} kg</div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px', borderTop: '1px solid var(--crm-border)', paddingTop: '24px' }}>
                <button className="crm-btn-secondary" onClick={() => setConsultationStep(1)}>← Voltar para Anamnese</button>
                <button className="crm-btn-primary" onClick={() => setConsultationStep(3)}>Avançar para Exames →</button>
              </div>
            </div>
          )}

          {consultationStep === 3 && (
            <div className="crm-card animate-pop-in">
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}><Activity color="var(--crm-accent)" /> Análise de Exames (Powered by OpenAI)</h2>
              {!examUploaded && !examAnalyzing && (
                <div>
                  <div style={{ padding: '40px 20px', border: '2px dashed var(--crm-border)', borderRadius: '12px', backgroundColor: '#F8FAFC', textAlign: 'center', position: 'relative' }}>
                    <Upload size={40} color="var(--crm-text-muted)" style={{ marginBottom: '16px' }} />
                    <h3 style={{ color: 'var(--crm-text-main)', marginBottom: '8px' }}>
                      {selectedExamFiles.length > 0 ? `${selectedExamFiles.length} arquivo(s) adicionado(s) — arraste mais ou clique` : 'Adicione todos os arquivos de uma vez'}
                    </h3>
                    <p style={{ color: 'var(--crm-text-muted)', fontSize: '0.9rem' }}>Imagens (JPG, PNG) · Documentos (PDF)</p>
                    <input 
                      type="file" 
                      multiple
                      accept="application/pdf, image/jpeg, image/png, image/jpg"
                      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          setSelectedExamFiles(prev => [...prev, ...Array.from(e.target.files)]);
                        }
                        // Reseta o valor do input para permitir upload do mesmo arquivo se removido
                        e.target.value = null;
                      }}
                    />
                  </div>

                  {selectedExamFiles.length > 0 && (
                    <div className="animate-pop-in" style={{ marginTop: '24px' }}>
                      <p style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--crm-text-muted)', marginBottom: '12px', textTransform: 'uppercase' }}>
                        Documentos e Exames Laboratoriais ({selectedExamFiles.length})
                      </p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                        {selectedExamFiles.map((f, i) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', backgroundColor: 'rgba(99, 102, 241, 0.1)', color: 'var(--crm-accent)', borderRadius: '8px', fontSize: '0.9rem' }}>
                            <FileText size={16} />
                            <span style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</span>
                            <button onClick={() => setSelectedExamFiles(prev => prev.filter((_, idx) => idx !== i))} style={{ background: 'none', border: 'none', color: 'var(--crm-accent)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                              <X size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                      <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
                        <button className="crm-btn-primary" onClick={() => analyzeExamWithAI(selectedExamFiles)}>
                          <Sparkles size={16} color="#FFF" style={{ marginRight: '8px' }} /> Analisar {selectedExamFiles.length} arquivo(s) com IA
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
              {examError && (
                <div role="alert" style={{ marginTop: '16px', padding: '14px 16px', backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: '8px', color: '#991B1B', fontSize: '0.9rem' }}>
                  {examError}
                </div>
              )}
              {examAnalyzing && (
                <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                  <Sparkles size={48} color="var(--crm-accent)" className="animate-pulse-glow" style={{ marginBottom: '16px', borderRadius: '50%' }} />
                  <h3>Agente Médico analisando exames...</h3>
                  <p style={{ color: 'var(--crm-text-muted)' }}>Classificando parâmetros, correlacionando achados com a anamnese e preparando a segunda opinião.</p>
                </div>
              )}
              {examResult && (
                <div className="animate-pop-in">
                  <div className="results-tabs">
                    {EXAM_TABS.map(t => (
                      <button key={t.key}
                        className={`results-tab-btn ${examTab === t.key ? 'active' : ''}`}
                        onClick={() => setExamTab(t.key)}>
                        {t.label}
                      </button>
                    ))}
                  </div>
                  <div style={{ padding: '24px', backgroundColor: '#FFF', borderRadius: '0 0 12px 12px', minHeight: '300px', border: '1px solid var(--crm-border)', borderTop: 'none' }}>
                    {parseMarkdownTabs(examResult)[examTab] ? (
                      <div className="markdown-body">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{parseMarkdownTabs(examResult)[examTab]}</ReactMarkdown>
                      </div>
                    ) : (
                      <p style={{ color: 'var(--crm-text-muted)' }}>Seção não disponível para esta análise.</p>
                    )}
                  </div>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '32px', borderTop: '1px solid var(--crm-border)', paddingTop: '24px' }}>
                <button className="crm-btn-secondary" onClick={() => setConsultationStep(2)}>← Voltar para Avaliação</button>
                <button className="crm-btn-primary" onClick={() => setConsultationStep(4)}>Avançar para Prescrição →</button>
              </div>
            </div>
          )}

          {consultationStep === 4 && (
            <div className="crm-card animate-pop-in">
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}><Edit3 color="var(--crm-accent)" /> Prescrição Dietética Estruturada</h2>
              
              <div className="results-tabs">
                <button className={prescriptionTab === 'cardapio' ? 'results-tab-btn active' : 'results-tab-btn'} onClick={() => setPrescriptionTab('cardapio')}>Refeições do Cardápio</button>
                <button className={prescriptionTab === 'suplementos' ? 'results-tab-btn active' : 'results-tab-btn'} onClick={() => setPrescriptionTab('suplementos')}>Vitaminas e Suplementos</button>
                <button className={prescriptionTab === 'ferramentas' ? 'results-tab-btn active' : 'results-tab-btn'} onClick={() => setPrescriptionTab('ferramentas')}>Ferramentas e Assistentes</button>
              </div>

              {prescriptionTab === 'ferramentas' && (
                <div className="animate-pop-in">
                  {/* Assistentes de Prescrição */}
                  <div style={{ marginBottom: '32px', padding: '24px', backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '12px' }}>
                    <h3 style={{ fontSize: '1.1rem', color: '#166534', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Sparkles size={18} /> Como você deseja iniciar a prescrição?
                    </h3>
                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                      <div style={{ flex: '1 1 300px' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <select 
                            className="crm-input" 
                            style={{ width: '100px', borderColor: '#10B981', color: '#166534', backgroundColor: '#FFF' }}
                            value={dietDuration}
                            onChange={e => setDietDuration(Number(e.target.value))}
                          >
                            <option value={1}>1 Dia</option>
                            <option value={7}>7 Dias</option>
                            <option value={15}>15 Dias</option>
                            <option value={30}>30 Dias</option>
                          </select>
                          <button className="crm-btn-primary" onClick={async () => {
                            await generateDietFromAI();
                            setPrescriptionTab('cardapio');
                          }} disabled={isGenerating} style={{ flex: 1, backgroundColor: '#10B981', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', padding: '12px' }}>
                            <Sparkles size={16} color="#FFF" /> {isGenerating ? 'Analisando...' : 'Sugerir com IA'}
                          </button>
                        </div>
                        {examResult && (
                          <p style={{ fontSize: '0.8rem', color: '#15803D', marginTop: '8px', textAlign: 'center' }}>
                            A IA utilizará a análise dos exames como base.
                          </p>
                        )}
                      </div>

                    </div>
                  </div>
                  
                  <div style={{ backgroundColor: '#FFF', border: '1px solid var(--crm-border)', borderRadius: '12px', padding: '16px' }}>
                    <h3 style={{ fontSize: '1.1rem', color: 'var(--crm-text-main)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <GripVertical size={18} /> Receitas Salvas
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--crm-text-muted)', marginBottom: '16px' }}>Para utilizar, clique em <strong>Adicionar</strong> para incluir a receita como uma nova refeição no cardápio.</p>
                    
                    {(!recipeLibrary || recipeLibrary.length === 0) ? (
                      <p style={{ fontSize: '0.85rem', color: 'var(--crm-text-muted)', textAlign: 'center', padding: '20px 0' }}>Sua biblioteca está vazia.</p>
                    ) : (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px', maxHeight: '400px', overflowY: 'auto' }}>
                        {recipeLibrary.map(rec => (
                          <div 
                            key={rec.id} 
                            className="recipe-draggable"
                            style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
                          >
                            <div>
                              <strong>{rec.title}</strong>
                              <div style={{ fontSize: '0.75rem', color: 'var(--crm-text-muted)', marginTop: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {rec.ingredients}
                              </div>
                            </div>
                            <button 
                              className="crm-btn-primary" 
                              style={{ marginTop: '8px', padding: '4px 8px', fontSize: '0.8rem', width: '100%' }}
                              onClick={() => {
                                const newMeal = { name: rec.title, desc: rec.ingredients, foods: [] };
                                setDietMeals([...dietMeals, newMeal]);
                                setPrescriptionTab('cardapio');
                              }}
                            >
                              <Plus size={14} style={{ marginRight: '4px' }}/> Adicionar
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {prescriptionTab === 'suplementos' && (
                <div className="animate-pop-in" style={{ marginBottom: '32px' }}>
                  <label className="crm-label">Vitaminas e Suplementação Manipulada</label>
                  <p style={{ fontSize: '0.85rem', color: 'var(--crm-text-muted)', marginBottom: '16px' }}>
                    Descreva os suplementos, dosagens e horários. Este conteúdo aparecerá em destaque no aplicativo do paciente.
                  </p>
                  <textarea 
                    className="crm-input" 
                    placeholder="Ex: Ômega 3 (1000mg) - 1 cápsula após o almoço..." 
                    value={dietSupplements} 
                    onChange={e => setDietSupplements(e.target.value)} 
                    style={{ minHeight: '250px', resize: 'vertical' }} 
                  />
                </div>
              )}

              {prescriptionTab === 'cardapio' && (
                <div className="animate-pop-in" style={{ marginBottom: '32px' }}>
                  <div style={{ marginBottom: '24px' }}>
                    <label className="crm-label">Título do Plano Alimentar</label>
                    <input type="text" className="crm-input" placeholder="Ex: Dieta de Transição (Verão)" value={dietTitle} onChange={e => setDietTitle(e.target.value)} style={{ fontWeight: '600', fontSize: '1.1rem', marginBottom: '16px' }} />
                    
                    <label className="crm-label">Orientações Gerais do Plano (Opcional)</label>
                    <textarea className="crm-input" placeholder="Orientações, metas ou visão geral da dieta..." value={dietDescription} onChange={e => setDietDescription(e.target.value)} style={{ minHeight: '80px', resize: 'vertical' }} />
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '1.1rem', color: 'var(--crm-text-main)' }}>Refeições do Cardápio</h3>
                    
                    {(() => {
                      let totalKcal = 0, totalCarb = 0, totalPtn = 0, totalFat = 0;
                      dietMeals.forEach(m => {
                        if (m.foods) {
                          m.foods.forEach(f => {
                            totalKcal += f.kcal;
                            totalCarb += f.carb;
                            totalPtn += f.protein;
                            totalFat += f.fat;
                          });
                        }
                      });
                      
                      return (totalKcal > 0) ? (
                        <div style={{ display: 'flex', gap: '12px', fontSize: '0.85rem', backgroundColor: '#F8FAFC', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--crm-border)' }}>
                          <div><strong>Kcal Total:</strong> <span style={{color: 'var(--crm-accent)'}}>{totalKcal.toFixed(0)}</span></div>
                          <div><strong>Carb:</strong> {totalCarb.toFixed(0)}g</div>
                          <div><strong>Ptn:</strong> {totalPtn.toFixed(0)}g</div>
                          <div><strong>Gord:</strong> {totalFat.toFixed(0)}g</div>
                        </div>
                      ) : null;
                    })()}
                  </div>

                  {dietMeals.length === 0 ? (
                    <div style={{ padding: '40px', textAlign: 'center', backgroundColor: '#FFF', border: '2px dashed var(--crm-border)', borderRadius: '8px' }}>
                      <p style={{ color: 'var(--crm-text-muted)' }}>Nenhuma refeição cadastrada. Adicione manualmente ou use a aba de Ferramentas.</p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {dietMeals.map((meal, idx) => (
                        <MealBuilder 
                          key={idx}
                          meal={meal}
                          onChange={(updatedMeal) => {
                            const newMeals = [...dietMeals];
                            newMeals[idx] = updatedMeal;
                            setDietMeals(newMeals);
                          }}
                          onDelete={() => setDietMeals(dietMeals.filter((_, i) => i !== idx))}
                          onDrop={e => handleDropToMeal(e, idx)}
                        />
                      ))}
                    </div>
                  )}
                  
                  <button 
                    className="crm-btn-secondary" 
                    style={{ marginTop: '16px', width: '100%', justifyContent: 'center', borderStyle: 'dashed' }}
                    onClick={() => setDietMeals([...dietMeals, { name: '', desc: '' }])}
                  >
                    <Plus size={16} /> Adicionar Refeição Manualmente
                  </button>

                  <div style={{ display: 'flex', gap: '16px', marginTop: '32px', flexWrap: 'wrap', justifyContent: 'flex-end', alignItems: 'center' }}>
                    {dietMeals.length > 0 && (
                      <button className="crm-btn-secondary" onClick={() => setDietMeals([])} style={{ color: 'var(--crm-danger)', borderColor: 'var(--crm-danger)', marginRight: 'auto' }}>
                        <Trash2 size={16} /> Limpar Tudo
                      </button>
                    )}
                    

                  </div>
                </div>
              )}
              
              {dietError && (
                <div role="alert" style={{ marginBottom: '24px', padding: '14px 16px', backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: '8px', color: '#991B1B', fontSize: '0.9rem' }}>
                  {dietError}
                </div>
              )}
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '32px', borderTop: '1px solid var(--crm-border)', paddingTop: '24px' }}>
                <button className="crm-btn-secondary" onClick={() => setConsultationStep(3)}>← Voltar para Exames</button>
                <button className="crm-btn-primary" onClick={() => setConsultationStep(5)}>Revisar e Enviar →</button>
              </div>
            </div>
          )}

          {consultationStep === 5 && (
            <div className="crm-card animate-pop-in">
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}><CheckCircle color="var(--crm-accent)" /> Resumo e Entrega</h2>
              <div style={{ backgroundColor: '#F8FAFC', padding: '24px', borderRadius: '12px', border: '1px solid var(--crm-border)' }}>
                <h3 style={{ marginBottom: '16px' }}>Pronto para enviar para {activePatient.name}?</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.95rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle size={16} color="var(--crm-accent)"/> Anamnese salva no histórico.</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {examUploaded ? <CheckCircle size={16} color="var(--crm-accent)"/> : <X size={16} color="var(--crm-text-muted)"/>} 
                    {examUploaded ? 'Exames processados pela OpenAI.' : 'Nenhum exame analisado nesta consulta.'}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {dietMeals.length > 0 ? <CheckCircle size={16} color="var(--crm-accent)"/> : <X size={16} color="var(--crm-text-muted)"/>}
                    {dietMeals.length > 0 ? `Dieta estruturada em ${dietMeals.length} refeições.` : 'Nenhum plano alimentar prescrito.'}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '32px', borderTop: '1px solid var(--crm-border)', paddingTop: '24px' }}>
                <button className="crm-btn-secondary" onClick={() => setConsultationStep(4)}>← Voltar para Prescrição</button>
                <button className="crm-btn-primary" onClick={finishConsultation} style={{ padding: '12px 24px', fontSize: '1.05rem' }}>
                  <Send size={18} /> Publicar Diário no App
                </button>
              </div>
              {finishedMessage && (
                <div style={{ marginTop: '16px', padding: '14px 16px', backgroundColor: '#E9F6F0', border: '1px solid #A7D8C2', borderRadius: '8px', color: 'var(--crm-good)', fontSize: '0.9rem', fontWeight: 600 }}>
                  {finishedMessage}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
