import React, { useState, useRef } from 'react';
import { Target, Check, Camera, Sparkles, Flame, Droplets, AlertCircle } from 'lucide-react';
import { useAppContext } from '../../../context/AppContext';

export default function QuestBoard({ activePatient }) {
  const { completeQuest, markMealDone, addExtraMealLog, addWater } = useAppContext();
  
  const [analyzing, setAnalyzing] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [activeMealIndex, setActiveMealIndex] = useState(null);
  const [analysisError, setAnalysisError] = useState(null);
  const fileInputRef = useRef(null);

  const currentRecipe = activePatient?.recipes?.length > 0 ? activePatient.recipes[activePatient.recipes.length - 1] : null;
  const totalMeals = currentRecipe ? currentRecipe.meals.length : 0;
  const completedMeals = currentRecipe ? currentRecipe.meals.filter(m => m.done).length : 0;
  const progressPercent = totalMeals > 0 ? Math.round((completedMeals / totalMeals) * 100) : 0;

  const handleDrinkWater = () => {
    addWater(activePatient.id);
    completeQuest(activePatient.id, 2);
  };

  const handleCameraClick = (mealIndex) => {
    setActiveMealIndex(mealIndex);
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file || activeMealIndex === null) return;
    if (fileInputRef.current) fileInputRef.current.value = '';

    setAnalyzing(true);
    setAnalysisError(null);
    setPreviewImage(URL.createObjectURL(file));

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Image = reader.result;
        try {
          let promptText = '';
          if (activeMealIndex === 'extra') {
             promptText = `Você é um avaliador nutricional acolhedor. Paciente registrou refeição livre. 1) Liste ingredientes. 2) Estime peso. 3) Dê mensagem acolhedora sem punição (max 3 frases).`;
          } else {
             const mealTarget = currentRecipe.meals[activeMealIndex];
             promptText = `Você é um avaliador nutricional. Paciente devia comer: "${mealTarget.desc}". 1) Liste o que vê. 2) Estime peso. 3) Diga se bate com a prescrição (max 3 frases).`;
          }

          const response = await fetch('/api/openai-bridge', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              system_prompt: 'Você é um avaliador nutricional. Responda em pt-BR, direto e acolhedor.',
              messages: [{ role: 'user', content: [{ type: 'text', text: promptText }, { type: 'image_url', image_url: { url: base64Image } }] }]
            })
          });
          if (!response.ok) throw new Error('Erro na rede ou na API.');
          const data = await response.json();
          const aiFeedback = data.choices[0].message.content;
          if (activeMealIndex === 'extra') {
            addExtraMealLog(activePatient.id, aiFeedback);
            completeQuest(activePatient.id, 5); 
          } else {
            markMealDone(activePatient.id, activePatient.recipes.length - 1, activeMealIndex, aiFeedback);
            completeQuest(activePatient.id, 20); 
          }
          setPreviewImage(null);
          setActiveMealIndex(null);
        } catch (apiError) {
          setAnalysisError('Não consegui analisar essa foto agora. Tente novamente em instantes.');
          setPreviewImage(null);
        } finally {
          setAnalyzing(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      setAnalysisError('Não consegui processar essa foto. Tente novamente.');
      setPreviewImage(null);
      setAnalyzing(false);
    }
  };

  return (
    <div className="animate-pop-in">
      <input type="file" accept="image/*" capture="environment" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileChange} />
      
      <div style={{...styles.card, display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
        <div>
          <h3 style={{margin: 0, color: '#0284c7', display: 'flex', alignItems: 'center', gap: '6px'}}><Droplets size={20}/> Hidratação</h3>
          <p style={{margin: '4px 0 0 0', color: '#64748b'}}>Você já bebeu {activePatient.waterGlasses || 0} copos hoje.</p>
        </div>
        <button className="btn-3d" style={{...styles.actionBtn, backgroundColor: '#38bdf8', boxShadow: '0 4px 0 #0284c7'}} onClick={handleDrinkWater}>
          + Copo
        </button>
      </div>

      {analysisError && (
        <div role="alert" style={styles.errorBanner}>
          <AlertCircle size={20} color="#dc2626" style={{ flexShrink: 0 }} />
          <span>{analysisError}</span>
        </div>
      )}

      {currentRecipe ? (
        <>
          <div style={{...styles.card, backgroundColor: progressPercent === 100 ? '#dcfce7' : '#fff', borderColor: progressPercent === 100 ? '#86efac' : '#e2e8f0'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <h3 style={{margin: 0, color: progressPercent === 100 ? '#166534' : '#0f172a'}}>Suas Refeições</h3>
              <span style={{fontWeight: 'bold', fontSize: '1.2rem', color: progressPercent === 100 ? '#16a34a' : '#3b82f6'}}>{completedMeals} / {totalMeals}</span>
            </div>
            <div style={styles.progressBarBg}>
              <div style={{...styles.progressBarFill, width: `${progressPercent}%`}}></div>
            </div>
          </div>

          <h2 style={styles.sectionTitle}><Target color="#f59e0b" /> Checklist de Hoje</h2>

          {currentRecipe.meals.map((meal, idx) => {
            const isAnalyzingThis = analyzing && activeMealIndex === idx;
            return (
              <div key={idx} style={{...styles.card, display: 'flex', flexDirection: 'column', borderColor: meal.done ? '#86efac' : '#e2e8f0'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: meal.done && meal.log ? '12px' : '0'}}>
                  <div>
                    <h4 style={{margin: 0, fontSize: '1.1rem', color: meal.done ? '#16a34a' : '#0f172a', display: 'flex', alignItems: 'center', gap: '6px'}}>
                      {meal.done && <Check size={18} color="#16a34a" />} {meal.name}
                    </h4>
                    <p style={{margin: '4px 0 0 0', fontSize: '0.9rem', color: '#64748b'}}>{meal.desc}</p>
                  </div>
                  {!meal.done ? (
                    <button className="btn-3d" style={styles.actionBtn} onClick={() => handleCameraClick(idx)} disabled={analyzing}>
                      <Camera size={20} />
                    </button>
                  ) : (
                    <span style={{backgroundColor: '#16a34a', color: 'white', padding: '6px 12px', borderRadius: '12px', fontWeight: 'bold', fontSize: '0.9rem'}}>FEITO</span>
                  )}
                </div>
                {isAnalyzingThis && (
                  <div style={{marginTop: '12px', padding: '16px', backgroundColor: '#e0f2fe', borderRadius: '12px', textAlign: 'center', animation: 'pulse 1.5s infinite'}}>
                    {previewImage && <img src={previewImage} alt="Preview" style={{width: '80px', height: '80px', objectFit: 'cover', borderRadius: '12px', marginBottom: '12px'}} />}
                    <h4 style={{color: '#0284c7', margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'}}><Sparkles size={18} /> Avaliando sua refeição...</h4>
                  </div>
                )}
                {meal.done && meal.log && (
                  <div style={{marginTop: '12px', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '12px', borderLeft: '4px solid #3b82f6'}}>
                    <p style={{margin: 0, fontSize: '0.9rem', color: '#334155', fontStyle: 'italic'}}>"{meal.log}" - EloIA</p>
                  </div>
                )}
              </div>
            );
          })}

          <div style={{marginTop: '24px'}}>
            <button className="btn-3d" style={{...styles.actionBtn, backgroundColor: '#f1f5f9', color: '#475569', boxShadow: '0 4px 0 #cbd5e1', width: '100%', justifyContent: 'center'}} onClick={() => handleCameraClick('extra')} disabled={analyzing}>
              <Flame size={20} color="#94a3b8" /> Comeu algo diferente? Registre sem culpa!
            </button>
            {analyzing && activeMealIndex === 'extra' && (
              <div style={{marginTop: '12px', padding: '16px', backgroundColor: '#fdf4ff', borderRadius: '12px', textAlign: 'center', animation: 'pulse 1.5s infinite'}}>
                {previewImage && <img src={previewImage} alt="Preview Extra" style={{width: '80px', height: '80px', objectFit: 'cover', borderRadius: '12px', marginBottom: '12px'}} />}
                <h4 style={{color: '#c026d3', margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'}}><Sparkles size={18} /> Registrando com carinho...</h4>
              </div>
            )}
            {activePatient.extraLogs && activePatient.extraLogs.length > 0 && (
              <div style={{marginTop: '16px'}}>
                <h3 style={{...styles.sectionTitle, color: '#8b5cf6'}}><Flame color="#a78bfa"/> Diário de Exceções Livres</h3>
                {activePatient.extraLogs.slice().reverse().map((elog, i) => (
                    <div key={i} style={{...styles.card, flexDirection: 'column', alignItems: 'flex-start', backgroundColor: '#f5f3ff', borderColor: '#ddd6fe'}}>
                      <strong style={{color: '#7c3aed', marginBottom: '8px'}}>Registrado às {elog.time}</strong>
                      <p style={{margin: 0, fontSize: '0.9rem', color: '#5b21b6', fontStyle: 'italic'}}>"{elog.log}" - EloIA</p>
                    </div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        <div style={{textAlign: 'center', padding: '40px 20px', color: '#64748b'}}>
          <AlertCircle size={48} color="#cbd5e1" style={{marginBottom: '16px'}} />
          <h3>Sem Dieta Ativa</h3>
          <p>O seu nutricionista ainda não enviou um cardápio estruturado para você.</p>
        </div>
      )}
    </div>
  );
}

const styles = {
  sectionTitle: { fontSize: '1.2rem', fontWeight: '800', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: '#1e293b' },
  card: { backgroundColor: '#ffffff', borderRadius: '20px', padding: '20px', border: '2px solid #e2e8f0', boxShadow: '0 4px 0 #cbd5e1', marginBottom: '16px' },
  actionBtn: { backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '12px', padding: '12px 20px', fontWeight: '800', fontSize: '1rem', cursor: 'pointer', boxShadow: '0 4px 0 #2563eb', transition: 'transform 0.1s, box-shadow 0.1s', display: 'flex', alignItems: 'center', gap: '8px' },
  progressBarBg: { height: '16px', backgroundColor: '#e2e8f0', borderRadius: '8px', width: '100%', overflow: 'hidden', marginTop: '8px' },
  progressBarFill: { height: '100%', backgroundColor: '#22c55e', transition: 'width 0.5s ease-out' },
  errorBanner: { display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#fef2f2', border: '2px solid #fecaca', borderRadius: '16px', padding: '14px 16px', marginBottom: '16px', color: '#991b1b', fontSize: '0.9rem', fontWeight: 600 }
};
