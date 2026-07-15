import React from 'react';
import { FileText, Activity, Sparkles, Edit3, Send, Plus, X, Upload, CheckCircle } from 'lucide-react';

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
  dietTemplates, addDietTemplate
}) {
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
                  <h3 style={{ color: 'var(--crm-text-main)', marginBottom: '16px' }}>Faça o upload do exame do paciente</h3>
                  <input 
                    type="file" 
                    accept="application/pdf, image/jpeg, image/png, image/jpg"
                    style={{ padding: '8px', border: '1px solid var(--crm-border)', borderRadius: '8px', cursor: 'pointer' }}
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        analyzeExamWithAI(e.target.files[0]);
                      }
                    }}
                  />
                  <p style={{ color: 'var(--crm-text-muted)', marginTop: '16px', fontSize: '0.9rem' }}>O motor GPT irá extrair o texto do PDF e cruzar com o objetivo de {activePatient.objective}.</p>
                </div>
              )}
              {examError && (
                <div role="alert" style={{ marginTop: '16px', padding: '14px 16px', backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: '8px', color: '#991B1B', fontSize: '0.9rem' }}>
                  {examError}
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
                    {typeof examResult[examTab] === 'object' ? JSON.stringify(examResult[examTab], null, 2) : examResult[examTab]}
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
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}><Edit3 color="var(--crm-accent)" /> Prescrição Dietética (JSON)</h2>
              {examResult && (
                <div style={{ padding: '16px', backgroundColor: '#EFF6FF', borderLeft: '4px solid var(--crm-accent)', marginBottom: '24px', borderRadius: '4px' }}>
                  <p style={{ fontSize: '0.9rem', color: '#1E3A8A' }}><strong>Insight OpenAI Ativo:</strong> A IA considerará a anamnese e os achados dos exames para estruturar o cardápio em blocos de refeições para o app.</p>
                </div>
              )}
              <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                <div style={{ flex: 1 }}>
                  <label className="crm-label">Título do Plano</label>
                  <input type="text" className="crm-input" placeholder="Ex: Dieta de Transição" value={dietTitle} onChange={e => setDietTitle(e.target.value)} style={{ fontWeight: '600' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="crm-label">Importar Template da Biblioteca</label>
                  <select 
                    className="crm-input" 
                    onChange={e => {
                      const tpl = dietTemplates?.find(t => t.id === e.target.value);
                      if (tpl) {
                        if (!dietTitle) setDietTitle(tpl.title);
                        const newMeals = tpl.days 
                          ? tpl.days.flatMap(d => d.meals.map(m => ({ ...m, name: `Dia ${d.dayIndex} - ${m.name}` }))) 
                          : (tpl.meals || []);
                        
                        setDietMeals(prev => [...prev, ...newMeals]);
                        
                        // Reset select so we can import the same one again if needed
                        e.target.value = "";
                      }
                    }}
                    defaultValue=""
                  >
                    <option value="" disabled>Adicionar refeições de um template...</option>
                    {dietTemplates?.map(t => (
                      <option key={t.id} value={t.id}>{t.title}</option>
                    ))}
                  </select>
                  <p style={{ fontSize: '0.8rem', color: 'var(--crm-text-muted)', marginTop: '4px' }}>Selecionar um template irá anexá-lo ao cardápio atual.</p>
                </div>
              </div>
              <label className="crm-label">Refeições Estruturadas</label>
              {dietMeals.length === 0 ? (
                <div style={{ padding: '40px 20px', textAlign: 'center', backgroundColor: '#F8FAFC', border: '2px dashed var(--crm-border)', borderRadius: '12px', marginBottom: '24px' }}>
                  <p style={{ color: 'var(--crm-text-muted)', marginBottom: '16px' }}>O cardápio será gerado e fatiado em refeições (Café, Almoço, etc) para criar a Checklist no App do Paciente.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px', maxHeight: '350px', overflowY: 'auto', paddingRight: '8px' }}>
                  {dietMeals.map((meal, idx) => (
                    <div key={idx} style={{ padding: '16px', backgroundColor: '#FFF', border: '1px solid var(--crm-border)', borderRadius: '8px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                      <strong style={{ fontSize: '1.05rem', color: 'var(--crm-text-main)', display: 'block', marginBottom: '8px' }}>{meal.name}</strong>
                      <p style={{ color: 'var(--crm-text-muted)', fontSize: '0.95rem', margin: 0, whiteSpace: 'pre-wrap' }}>{meal.desc}</p>
                    </div>
                  ))}
                </div>
              )}
              <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
                <button className="crm-btn-secondary" onClick={generateDietFromAI} disabled={isGenerating}>
                  <Sparkles size={16} color="var(--crm-accent)" /> {isGenerating ? 'Adicionando...' : 'Adicionar Novo Dia com IA'}
                </button>
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
                  <Edit3 size={16} color="var(--crm-text-main)" /> Salvar como Template
                </button>
                {dietMeals.length > 0 && (
                  <button className="crm-btn-secondary" onClick={() => setDietMeals([])} style={{ color: 'var(--crm-danger)', borderColor: 'var(--crm-danger)' }}>
                    <X size={16} /> Limpar Refeições
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
