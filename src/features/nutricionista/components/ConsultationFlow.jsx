import React, { useState } from 'react';
import { FileText, Activity, Sparkles, Edit3, Send, Plus, X, Upload, CheckCircle, Trash2, GripVertical, Download } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

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
    let headerMatch = cleanLine.match(/^#{2,4}\s+(.*)$/);
    if (!headerMatch) {
      headerMatch = cleanLine.match(/^\*\*(.*?)\*\*$/);
    }
    
    if (headerMatch) {
      if (cur) chunks.push(cur);
      cur = { title: normTitle(headerMatch[1]), lines: [] };
    } else if (cur) {
      cur.lines.push(line);
    }
  }
  if (cur) chunks.push(cur);

  const find = (...keys) => {
    const c = chunks.filter(c => keys.some(k => c.title.includes(k)));
    return c.length ? c.map(x => x.lines.join('\n').trim()).join('\n\n---\n\n') : '';
  };

  return {
    detalhada: find('analise detalhada', 'exames'),
    correlacao: find('correlacao clinica', 'achados'),
    conduta: find('conduta nutricional', 'impressao nutricional', 'plano de acao'),
    referencias: find('referencias bibliograficas', 'referencias'),
  };
}

const EXAM_TABS = [
  { key: 'detalhada', label: 'Análise Detalhada' },
  { key: 'correlacao', label: 'Correlação Clínica' },
  { key: 'conduta', label: 'Impressão Nutricional' },
  { key: 'referencias', label: 'Referências' },
];

export default function ConsultationFlow({
  activePatient,
  activeApptId,
  consultationStep, setConsultationStep,
  anamnesis, setAnamnesis,
  examUploaded, setExamUploaded,
  examAnalyzing,
  examResult, setExamTab, examTab,
  dietTitle, setDietTitle,
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
          <button className={`crm-nav-btn ${consultationStep === 2 ? 'active' : ''}`} onClick={() => setConsultationStep(2)}>2. Exames (IA OpenAI)</button>
          <button className={`crm-nav-btn ${consultationStep === 3 ? 'active' : ''}`} onClick={() => setConsultationStep(3)}>3. Prescrição Estruturada</button>
          <button className={`crm-nav-btn ${consultationStep === 4 ? 'active' : ''}`} onClick={() => setConsultationStep(4)}>4. Resumo e Envio</button>
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
                <button className="crm-btn-primary" onClick={() => setConsultationStep(2)}>Avançar para Exames →</button>
              </div>
            </div>
          )}

          {consultationStep === 2 && (
            <div className="crm-card">
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}><Activity color="var(--crm-accent)" /> Análise de Exames (Powered by OpenAI)</h2>
              {!examUploaded && !examAnalyzing && (
                <div style={{ textAlign: 'center', padding: '60px 20px', border: '2px dashed var(--crm-border)', borderRadius: '12px', backgroundColor: '#F8FAFC' }}>
                  <Upload size={48} color="var(--crm-text-muted)" style={{ marginBottom: '16px' }} />
                  <h3 style={{ color: 'var(--crm-text-main)', marginBottom: '16px' }}>Faça o upload dos exames do paciente</h3>
                  <input 
                    type="file" 
                    multiple
                    accept="application/pdf, image/jpeg, image/png, image/jpg"
                    style={{ padding: '8px', border: '1px solid var(--crm-border)', borderRadius: '8px', cursor: 'pointer', width: '100%', maxWidth: '300px' }}
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        analyzeExamWithAI(Array.from(e.target.files));
                      }
                    }}
                  />
                  <p style={{ color: 'var(--crm-text-muted)', marginTop: '16px', fontSize: '0.9rem' }}>Você pode selecionar múltiplos arquivos (PDFs e Imagens). A IA extrairá e cruzará tudo com o quadro clínico.</p>
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
                <button className="crm-btn-secondary" onClick={() => setConsultationStep(1)}>← Voltar para Anamnese</button>
                <button className="crm-btn-primary" onClick={() => setConsultationStep(3)}>Avançar para Prescrição →</button>
              </div>
            </div>
          )}

          {consultationStep === 3 && (
            <div className="crm-card">
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}><Edit3 color="var(--crm-accent)" /> Prescrição Dietética Estruturada</h2>
              
              {/* Assistentes de Prescrição */}
              <div style={{ marginBottom: '32px', padding: '24px', backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '12px' }}>
                <h3 style={{ fontSize: '1.1rem', color: '#166534', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={18} /> Como você deseja iniciar a prescrição?
                </h3>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ flex: 1 }}>
                    <button className="crm-btn-primary" onClick={generateDietFromAI} disabled={isGenerating} style={{ width: '100%', backgroundColor: '#10B981', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', padding: '12px' }}>
                      <Sparkles size={16} color="#FFF" /> {isGenerating ? 'Analisando...' : 'Sugerir com Inteligência Artificial'}
                    </button>
                    {examResult && (
                      <p style={{ fontSize: '0.8rem', color: '#15803D', marginTop: '8px', textAlign: 'center' }}>
                        A IA utilizará a análise dos exames como base.
                      </p>
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <select 
                      className="crm-input" 
                      style={{ width: '100%', padding: '12px', borderColor: '#10B981', color: '#166534', cursor: 'pointer', backgroundColor: '#FFF' }}
                      onChange={e => {
                        const tpl = dietTemplates?.find(t => t.id === e.target.value);
                        if (tpl) {
                          if (!dietTitle) setDietTitle(tpl.title);
                          const newMeals = tpl.days 
                            ? tpl.days.flatMap(d => d.meals.map(m => ({ ...m, name: `Dia ${d.dayIndex} - ${m.name}` }))) 
                            : (tpl.meals || []);
                          
                          setDietMeals(prev => [...prev, ...newMeals]);
                          e.target.value = "";
                        }
                      }}
                      defaultValue=""
                    >
                      <option value="" disabled>Carregar Template Salvo...</option>
                      {dietTemplates?.map(t => (
                        <option key={t.id} value={t.id}>{t.title}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Área de Trabalho Manual (Canvas) */}
              <div style={{ display: 'flex', gap: '24px', marginBottom: '32px' }}>
                <div style={{ flex: 2 }}>
                  <div style={{ marginBottom: '24px' }}>
                    <label className="crm-label">Título do Plano Alimentar</label>
                    <input type="text" className="crm-input" placeholder="Ex: Dieta de Transição (Verão)" value={dietTitle} onChange={e => setDietTitle(e.target.value)} style={{ fontWeight: '600', fontSize: '1.1rem' }} />
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '1.1rem', color: 'var(--crm-text-main)' }}>Refeições do Cardápio</h3>
                  </div>

                  {dietMeals.length === 0 ? (
                    <div style={{ padding: '40px', textAlign: 'center', backgroundColor: '#FFF', border: '2px dashed var(--crm-border)', borderRadius: '8px' }}>
                      <p style={{ color: 'var(--crm-text-muted)' }}>Nenhuma refeição cadastrada. Adicione manualmente ou use a IA.</p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {dietMeals.map((meal, idx) => (
                        <div 
                          key={idx} 
                          className="meal-dropzone"
                          onDragOver={e => e.preventDefault()}
                          onDrop={e => handleDropToMeal(e, idx)}
                          style={{ padding: '16px', backgroundColor: '#FFF', border: '2px dashed var(--crm-border)', borderRadius: '8px', position: 'relative' }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <input type="text" className="crm-input" style={{ fontWeight: '600', border: 'none', padding: 0, borderBottom: '1px solid transparent', borderRadius: 0, width: '80%', background: 'transparent' }} value={meal.name} onChange={(e) => {
                              const newMeals = [...dietMeals];
                              newMeals[idx].name = e.target.value;
                              setDietMeals(newMeals);
                            }} placeholder="Nome da Refeição (ex: Café da Manhã)" />
                            <button onClick={() => setDietMeals(dietMeals.filter((_, i) => i !== idx))} style={{ background: 'none', border: 'none', color: 'var(--crm-danger)', cursor: 'pointer' }}><Trash2 size={16} /></button>
                          </div>
                          <textarea className="crm-input" style={{ width: '100%', minHeight: '80px', resize: 'vertical', background: 'transparent', border: '1px solid var(--crm-border)' }} value={meal.desc} onChange={(e) => {
                              const newMeals = [...dietMeals];
                              newMeals[idx].desc = e.target.value;
                              setDietMeals(newMeals);
                          }} placeholder="Descreva os alimentos ou arraste uma receita aqui..." />
                        </div>
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
                </div>

                <div style={{ flex: 1, backgroundColor: '#FFF', border: '1px solid var(--crm-border)', borderRadius: '12px', padding: '16px', alignSelf: 'flex-start', position: 'sticky', top: '24px' }}>
                  <h3 style={{ fontSize: '1rem', color: 'var(--crm-text-main)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <GripVertical size={16} /> Receitas Salvas
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--crm-text-muted)', marginBottom: '16px' }}>Arraste uma receita para dentro de uma refeição ao lado.</p>
                  
                  {(!recipeLibrary || recipeLibrary.length === 0) ? (
                    <p style={{ fontSize: '0.85rem', color: 'var(--crm-text-muted)', textAlign: 'center', padding: '20px 0' }}>Sua biblioteca está vazia.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '400px', overflowY: 'auto' }}>
                      {recipeLibrary.map(rec => (
                        <div 
                          key={rec.id} 
                          className="recipe-draggable"
                          draggable
                          onDragStart={e => handleDragStart(e, rec)}
                        >
                          <strong>{rec.title}</strong>
                          <div style={{ fontSize: '0.75rem', color: 'var(--crm-text-muted)', marginTop: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {rec.ingredients}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                <div>
                  <button 
                    className="crm-btn-secondary" 
                    onClick={() => {
                      if (dietTitle && dietMeals.length > 0) {
                        addDietTemplate(dietTitle, dietMeals);
                        alert('Template salvo com sucesso na sua biblioteca!');
                      } else {
                        alert('Preencha o título e as refeições antes de salvar.');
                      }
                    }}
                  >
                    <Download size={16} color="var(--crm-text-main)" /> Salvar como Template Reutilizável
                  </button>
                </div>
                {dietMeals.length > 0 && (
                  <button className="crm-btn-secondary" onClick={() => setDietMeals([])} style={{ color: 'var(--crm-danger)', borderColor: 'var(--crm-danger)' }}>
                    <Trash2 size={16} /> Limpar Tudo
                  </button>
                )}
              </div>
              
              {dietError && (
                <div role="alert" style={{ marginBottom: '24px', padding: '14px 16px', backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: '8px', color: '#991B1B', fontSize: '0.9rem' }}>
                  {dietError}
                </div>
              )}
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '32px', borderTop: '1px solid var(--crm-border)', paddingTop: '24px' }}>
                <button className="crm-btn-secondary" onClick={() => setConsultationStep(2)}>← Voltar para Exames</button>
                <button className="crm-btn-primary" onClick={() => setConsultationStep(4)}>Revisar e Enviar →</button>
              </div>
            </div>
          )}

          {consultationStep === 4 && (
            <div className="crm-card">
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
                <button className="crm-btn-secondary" onClick={() => setConsultationStep(3)}>← Voltar para Prescrição</button>
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
