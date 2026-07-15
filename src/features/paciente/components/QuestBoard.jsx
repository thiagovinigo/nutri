import React, { useState, useRef, useEffect } from 'react';
import { Target, Check, Camera, Sparkles, Flame, Droplets, AlertCircle } from 'lucide-react';
import { useAppContext } from '../../../context/AppContext';
import ShareableMilestone from './ShareableMilestone';

export default function QuestBoard({ activePatient }) {
  const { completeQuest, markMealDone, addExtraMealLog, addWater } = useAppContext();
  
  const [analyzing, setAnalyzing] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [activeMealIndex, setActiveMealIndex] = useState(null);
  const [analysisError, setAnalysisError] = useState(null);
  const [showMilestone, setShowMilestone] = useState(false);
  const fileInputRef = useRef(null);

  const currentRecipe = activePatient?.recipes?.length > 0 ? activePatient.recipes[activePatient.recipes.length - 1] : null;
  const totalMeals = currentRecipe ? currentRecipe.meals.length : 0;
  const completedMeals = currentRecipe ? currentRecipe.meals.filter(m => m.done).length : 0;
  const progressPercent = totalMeals > 0 ? Math.round((completedMeals / totalMeals) * 100) : 0;

  // Mostra milestone quando atinge 100%
  useEffect(() => {
    if (progressPercent === 100 && totalMeals > 0 && !activePatient.milestoneShownToday) {
      setShowMilestone(true);
    }
  }, [progressPercent, totalMeals, activePatient.milestoneShownToday]);

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

  // SVG Circular Progress
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  return (
    <div className="animate-pop-in">
      <input type="file" accept="image/*" capture="environment" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileChange} />
      
      {showMilestone && <ShareableMilestone onClose={() => setShowMilestone(false)} />}

      <div className="patient-card patient-glass" style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px'}}>
        <div>
          <h3 style={{margin: 0, color: 'var(--primary-color)', display: 'flex', alignItems: 'center', gap: '8px'}}><Droplets size={20}/> Hidratação</h3>
          <p style={{margin: '4px 0 0 0', color: 'var(--patient-text-muted)'}}>{activePatient.waterGlasses || 0} copos hoje</p>
        </div>
        <button className="btn-3d btn-primary" style={{padding: '10px 16px', fontSize: '0.9rem'}} onClick={handleDrinkWater}>
          + COPO
        </button>
      </div>

      {analysisError && (
        <div role="alert" className="patient-card" style={{borderColor: 'var(--accent-color)', backgroundColor: 'rgba(255,0,85,0.1)', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--accent-color)', marginBottom: '20px'}}>
          <AlertCircle size={20} style={{ flexShrink: 0 }} />
          <span>{analysisError}</span>
        </div>
      )}

      {currentRecipe ? (
        <>
          <div className="patient-card patient-glass" style={{display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px'}}>
            <div style={{position: 'relative', width: '100px', height: '100px'}}>
              <svg width="100" height="100" style={{transform: 'rotate(-90deg)'}}>
                <circle cx="50" cy="50" r={radius} stroke="rgba(255,255,255,0.1)" strokeWidth="8" fill="none" />
                <circle cx="50" cy="50" r={radius} stroke="var(--primary-color)" strokeWidth="8" fill="none" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} style={{transition: 'stroke-dashoffset 1s ease-in-out', strokeLinecap: 'round'}} />
              </svg>
              <div style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column'}}>
                <span style={{fontSize: '1.2rem', fontWeight: '900', color: progressPercent === 100 ? '#FFD700' : 'var(--patient-text)'}}>{progressPercent}%</span>
              </div>
            </div>
            <div>
              <h3 style={{margin: '0 0 4px 0', fontSize: '1.3rem', color: 'var(--patient-text)'}}>Performance</h3>
              <p style={{margin: 0, color: 'var(--patient-text-muted)'}}>{completedMeals} de {totalMeals} refeições concluídas</p>
            </div>
          </div>

          <h2 style={{fontSize: '1.2rem', fontWeight: '800', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--patient-text)'}}><Target color="var(--primary-color)" /> Refeições de Hoje</h2>

          {currentRecipe.meals.map((meal, idx) => {
            const isAnalyzingThis = analyzing && activeMealIndex === idx;
            return (
              <div key={idx} className="patient-card patient-glass" style={{display: 'flex', flexDirection: 'column', marginBottom: '16px', borderColor: meal.done ? 'var(--primary-color)' : 'var(--glass-border)'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: meal.done && meal.log ? '12px' : '0'}}>
                  <div>
                    <h4 style={{margin: 0, fontSize: '1.1rem', color: meal.done ? 'var(--primary-color)' : 'var(--patient-text)', display: 'flex', alignItems: 'center', gap: '8px'}}>
                      {meal.done && <Check size={18} color="var(--primary-color)" />} {meal.name}
                    </h4>
                    <p style={{margin: '4px 0 0 0', fontSize: '0.9rem', color: 'var(--patient-text-muted)'}}>{meal.desc}</p>
                  </div>
                  {!meal.done ? (
                    <button className="btn-3d btn-primary" style={{padding: '12px', borderRadius: '50%'}} onClick={() => handleCameraClick(idx)} disabled={analyzing}>
                      <Camera size={20} />
                    </button>
                  ) : (
                    <span style={{backgroundColor: 'rgba(0,229,255,0.2)', color: 'var(--primary-color)', padding: '6px 12px', borderRadius: '12px', fontWeight: 'bold', fontSize: '0.8rem'}}>CONCLUÍDO</span>
                  )}
                </div>
                {isAnalyzingThis && (
                  <div className="animate-pulse-glow" style={{marginTop: '16px', padding: '16px', backgroundColor: 'rgba(0,229,255,0.1)', borderRadius: '12px', textAlign: 'center'}}>
                    {previewImage && <img src={previewImage} alt="Preview" style={{width: '80px', height: '80px', objectFit: 'cover', borderRadius: '12px', marginBottom: '12px', border: '1px solid var(--primary-color)'}} />}
                    <h4 style={{color: 'var(--primary-color)', margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'}}><Sparkles size={18} /> IA Analisando Nutrientes...</h4>
                  </div>
                )}
                {meal.done && meal.log && (
                  <div style={{marginTop: '16px', padding: '12px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '12px', borderLeft: '3px solid var(--primary-color)'}}>
                    <p style={{margin: 0, fontSize: '0.9rem', color: 'var(--patient-text)', fontStyle: 'italic'}}>"{meal.log}" - Vytal AI</p>
                  </div>
                )}
              </div>
            );
          })}

          <div style={{marginTop: '32px'}}>
            <button className="btn-3d btn-secondary" style={{width: '100%', justifyContent: 'center'}} onClick={() => handleCameraClick('extra')} disabled={analyzing}>
              <Flame size={20} style={{marginRight: '8px'}} /> Registre refeição livre
            </button>
            {analyzing && activeMealIndex === 'extra' && (
              <div className="animate-pulse-glow" style={{marginTop: '16px', padding: '16px', backgroundColor: 'rgba(255,0,85,0.1)', borderRadius: '12px', textAlign: 'center'}}>
                {previewImage && <img src={previewImage} alt="Preview Extra" style={{width: '80px', height: '80px', objectFit: 'cover', borderRadius: '12px', marginBottom: '12px', border: '1px solid var(--accent-color)'}} />}
                <h4 style={{color: 'var(--accent-color)', margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'}}><Sparkles size={18} /> Analisando sem culpa...</h4>
              </div>
            )}
            {activePatient.extraLogs && activePatient.extraLogs.length > 0 && (
              <div style={{marginTop: '24px'}}>
                <h3 style={{fontSize: '1.1rem', fontWeight: '800', marginBottom: '16px', color: 'var(--accent-color)', display: 'flex', alignItems: 'center', gap: '8px'}}><Flame color="var(--accent-color)"/> Diário Livre</h3>
                {activePatient.extraLogs.slice().reverse().map((elog, i) => (
                    <div key={i} className="patient-card patient-glass" style={{marginBottom: '12px', borderColor: 'rgba(255,0,85,0.3)'}}>
                      <strong style={{color: 'var(--accent-color)', marginBottom: '8px', display: 'block', fontSize: '0.8rem'}}>Registrado às {elog.time}</strong>
                      <p style={{margin: 0, fontSize: '0.9rem', color: 'var(--patient-text)', fontStyle: 'italic'}}>"{elog.log}" - Vytal AI</p>
                    </div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        <div style={{textAlign: 'center', padding: '60px 20px', color: 'var(--patient-text-muted)'}}>
          <AlertCircle size={48} color="var(--glass-border)" style={{marginBottom: '16px'}} />
          <h3 style={{color: 'var(--patient-text)'}}>Sem Plano Ativo</h3>
          <p>O seu nutricionista ainda não liberou seu cardápio de Alta Performance.</p>
        </div>
      )}
    </div>
  );
}
