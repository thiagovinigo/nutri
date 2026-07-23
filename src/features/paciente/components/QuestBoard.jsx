import React, { useState, useRef, useEffect } from 'react';
import { Target, Check, Camera, Sparkles, Flame, Droplets, AlertCircle, X, ChevronLeft, ChevronRight, Moon } from 'lucide-react';
import { useAppContext } from '../../../context/AppContext';
import ShareableMilestone from './ShareableMilestone';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function QuestBoard({ activePatient }) {
  const { completeQuest, markMealDone, addExtraMealLog, updateWater, addSleepLog, updatePatient } = useAppContext();
  
  const [selectedDateObj, setSelectedDateObj] = useState(new Date());
  
  const [analyzing, setAnalyzing] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [activeMealIndex, setActiveMealIndex] = useState(null);
  const [analysisError, setAnalysisError] = useState(null);
  const [checkInMealIndex, setCheckInMealIndex] = useState(null);
  const [ateOnTime, setAteOnTime] = useState(null);
  const [followedDiet, setFollowedDiet] = useState(null);
  const [divergenceText, setDivergenceText] = useState('');
  const [showMilestone, setShowMilestone] = useState(false);
  const [showExtraMealSelector, setShowExtraMealSelector] = useState(false);
  const [showWaterSelector, setShowWaterSelector] = useState(false);
  const [showSleepModal, setShowSleepModal] = useState(false);
  const [sleepHours, setSleepHours] = useState(8);
  const [sleepQuality, setSleepQuality] = useState('Bom');
  const [selectedExtraMealName, setSelectedExtraMealName] = useState('Refeição Livre');
  const fileInputRef = useRef(null);

  const selectedDateFormatted = selectedDateObj.toLocaleDateString('pt-BR');

  const currentRecipe = activePatient?.recipes?.length > 0 ? activePatient.recipes[activePatient.recipes.length - 1] : null;
  
  const getMealLog = (mealName) => {
    return (activePatient.foodLogs || []).find(log => log.date === selectedDateFormatted && log.mealName === mealName);
  };

  const totalMeals = currentRecipe ? currentRecipe.meals.length : 0;
  const completedMeals = currentRecipe ? currentRecipe.meals.filter(m => getMealLog(m.name)).length : 0;
  const progressPercent = totalMeals > 0 ? Math.round((completedMeals / totalMeals) * 100) : 0;

  const currentWaterMl = (activePatient.waterLogs || {})[selectedDateFormatted] || 0;

  // Mostra milestone quando atinge 100%
  useEffect(() => {
    const shownDates = activePatient.milestoneShownDates || [];
    if (progressPercent === 100 && totalMeals > 0 && !shownDates.includes(selectedDateFormatted)) {
      setShowMilestone(true);
      updatePatient(activePatient.id, { milestoneShownDates: [...shownDates, selectedDateFormatted] });
    }
  }, [progressPercent, totalMeals, selectedDateFormatted, activePatient.milestoneShownDates, activePatient.id, updatePatient]);

  const handlePrevDay = () => {
    const newDate = new Date(selectedDateObj);
    newDate.setDate(newDate.getDate() - 1);
    setSelectedDateObj(newDate);
  };

  const handleNextDay = () => {
    const newDate = new Date(selectedDateObj);
    newDate.setDate(newDate.getDate() + 1);
    setSelectedDateObj(newDate);
  };

  const handleAddWater = (ml) => {
    updateWater(activePatient.id, selectedDateFormatted, ml);
    completeQuest(activePatient.id, 2);
    setShowWaterSelector(false);
  };

  const handleSaveSleep = () => {
    addSleepLog(activePatient.id, selectedDateFormatted, sleepHours, sleepQuality);
    completeQuest(activePatient.id, 10);
    setShowSleepModal(false);
  };

  const handleRemoveWater = () => {
    if (currentWaterMl > 0) {
      updateWater(activePatient.id, selectedDateFormatted, -200); // Remove 200ml by default
    }
  };

  const openCheckIn = (idx) => {
    setCheckInMealIndex(idx);
    setAteOnTime(null);
    setFollowedDiet(null);
    setDivergenceText('');
  };

  const handleSaveCheckIn = (idx) => {
    if (ateOnTime === null || followedDiet === null) return;
    if (followedDiet === false && !divergenceText.trim()) return;

    let logStr = ateOnTime ? "⏰ No horário. " : "⚠️ Fora do horário. ";
    if (followedDiet) {
      logStr += "✅ Seguiu a dieta.";
    } else {
      logStr += `❌ Comeu diferente: ${divergenceText}`;
    }

    const mealName = currentRecipe.meals[idx]?.name || 'Refeição';
    markMealDone(activePatient.id, activePatient.recipes.length - 1, idx, logStr, mealName, selectedDateFormatted);
    
    // XP Rewards
    let xp = 10;
    if (ateOnTime && followedDiet) xp = 20;
    completeQuest(activePatient.id, xp);

    setCheckInMealIndex(null);
    setAteOnTime(null);
    setFollowedDiet(null);
    setDivergenceText('');
  };

  const handleCameraClick = (mealIndex) => {
    setActiveMealIndex(mealIndex);
    if (mealIndex === 'extra') {
      setShowExtraMealSelector(true);
    } else {
      if (fileInputRef.current) fileInputRef.current.click();
    }
  };

  const handleSelectExtraMeal = (mealName) => {
    setSelectedExtraMealName(mealName);
    setShowExtraMealSelector(false);
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
             promptText = `Você é um assistente inteligente de diário alimentar. O usuário enviou uma foto de uma refeição livre. Use formatação Markdown. 1) Liste os alimentos que você vê na imagem, já incluindo ao lado de cada um a estimativa de peso EM GRAMAS (obrigatório). 2) Dê uma mensagem amigável e motivadora (max 3 frases).`;
          } else {
             const mealTarget = currentRecipe.meals[activeMealIndex];
             promptText = `Você é um assistente inteligente de diário alimentar. O usuário deveria comer: "${mealTarget.desc}". Use formatação Markdown. 1) Liste os alimentos reais que você vê na foto, já incluindo ao lado de cada um a estimativa de peso EM GRAMAS (obrigatório). 2) Diga amigavelmente se parece estar dentro do planejado (max 3 frases).`;
          }

          const response = await fetch('/api/openai-bridge', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              system_prompt: 'Você é um assistente virtual amigável ajudando um usuário a registrar seu diário alimentar. Aja de forma leve e motivadora.',
              messages: [{ role: 'user', content: [{ type: 'text', text: promptText }, { type: 'image_url', image_url: { url: base64Image } }] }]
            })
          });
          if (!response.ok) {
            const errData = await response.json();
            console.error("OpenAI Error:", errData);
            throw new Error(errData.error?.message || 'Erro na rede ou na API.');
          }
          const data = await response.json();
          const aiFeedback = data.choices[0].message.content;
          if (activeMealIndex === 'extra') {
            addExtraMealLog(activePatient.id, aiFeedback, selectedExtraMealName, selectedDateFormatted);
            completeQuest(activePatient.id, 5); 
          } else {
            const mealName = currentRecipe.meals[activeMealIndex]?.name || 'Refeição';
            markMealDone(activePatient.id, activePatient.recipes.length - 1, activeMealIndex, aiFeedback, mealName, selectedDateFormatted);
            completeQuest(activePatient.id, 20); 
          }
          setPreviewImage(null);
          setActiveMealIndex(null);
        } catch (apiError) {
          const errMsg = apiError.message || 'Não consegui analisar essa foto agora. Tente novamente em instantes.';
          setAnalysisError(errMsg);
          alert("ERRO NA IA: " + errMsg);
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

  const extraLogsForDate = (activePatient.foodLogs || []).filter(log => log.type === 'extra' && log.date === selectedDateFormatted);

  return (
    <div className="animate-pop-in">
      <input type="file" accept="image/*" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileChange} />
      
      {showMilestone && <ShareableMilestone onClose={() => setShowMilestone(false)} />}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginBottom: '24px' }}>
        <button onClick={handlePrevDay} className="btn-3d btn-secondary" style={{ padding: '8px' }}><ChevronLeft size={20} /></button>
        <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--patient-text)' }}>
          {selectedDateObj.toLocaleDateString('pt-BR') === new Date().toLocaleDateString('pt-BR') ? 'Hoje' : selectedDateFormatted}
        </div>
        <button onClick={handleNextDay} className="btn-3d btn-secondary" style={{ padding: '8px' }}><ChevronRight size={20} /></button>
      </div>

      <div className="patient-card patient-glass" style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', position: 'relative', zIndex: 50}}>
        <div>
          <h3 style={{margin: 0, color: 'var(--primary-color)', display: 'flex', alignItems: 'center', gap: '8px'}}><Droplets size={20}/> Hidratação</h3>
          <p style={{margin: '4px 0 0 0', color: 'var(--patient-text-muted)'}}>{currentWaterMl} ml consumidos</p>
        </div>
        <div style={{display: 'flex', gap: '8px', position: 'relative', zIndex: 50}}>
          <button className="btn-3d btn-secondary" style={{padding: '10px', fontSize: '0.9rem'}} onClick={handleRemoveWater} disabled={currentWaterMl === 0}>
            -
          </button>
          <button className="btn-3d btn-primary" style={{padding: '10px 16px', fontSize: '0.9rem'}} onClick={() => setShowWaterSelector(!showWaterSelector)}>
            + ÁGUA
          </button>
          
          {showWaterSelector && (
            <div className="animate-pop-in" style={{position: 'absolute', top: '100%', right: 0, marginTop: '8px', backgroundColor: 'var(--patient-surface)', border: '1px solid var(--glass-border)', borderRadius: '12px', padding: '8px', display: 'flex', flexDirection: 'column', gap: '4px', zIndex: 10, boxShadow: '0 10px 25px rgba(0,0,0,0.1)'}}>
              <button onClick={() => handleAddWater(100)} className="btn-3d btn-secondary" style={{padding: '8px', fontSize: '0.85rem', width: '120px'}}>100 ml</button>
              <button onClick={() => handleAddWater(500)} className="btn-3d btn-secondary" style={{padding: '8px', fontSize: '0.85rem'}}>500 ml</button>
              <button onClick={() => handleAddWater(1000)} className="btn-3d btn-secondary" style={{padding: '8px', fontSize: '0.85rem'}}>1 Litro</button>
              <button onClick={() => handleAddWater(2000)} className="btn-3d btn-secondary" style={{padding: '8px', fontSize: '0.85rem'}}>2 Litros</button>
            </div>
          )}
        </div>
        </div>

        {/* Sleep Tracker */}
        {(() => {
          const sleepLog = (activePatient?.sleepLogs || []).find(log => log.date === selectedDateFormatted);
          
          return (
            <div className="patient-card patient-glass" style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', position: 'relative', zIndex: 40}}>
              <div>
                <h3 style={{margin: 0, color: 'var(--primary-color)', display: 'flex', alignItems: 'center', gap: '8px'}}><Moon size={20}/> Sono e Recuperação</h3>
                <p style={{margin: '4px 0 0 0', color: 'var(--patient-text-muted)'}}>
                  {sleepLog ? `${sleepLog.hours}h de sono (${sleepLog.quality})` : 'Não registrado hoje'}
                </p>
              </div>
              <div>
                {sleepLog ? (
                  <span style={{ backgroundColor: '#D1FAE5', color: '#059669', padding: '6px 12px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Check size={16} /> Feito
                  </span>
                ) : (
                  <button className="btn-3d btn-primary" style={{padding: '10px 16px', fontSize: '0.9rem'}} onClick={() => setShowSleepModal(true)}>
                    REGISTRAR
                  </button>
                )}
              </div>
            </div>
          );
        })()}

        {analysisError && (
        <div role="alert" className="patient-card" style={{borderColor: 'var(--accent-color)', backgroundColor: 'rgba(245, 158, 11, 0.1)', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--accent-color)', marginBottom: '20px'}}>
          <AlertCircle size={20} style={{ flexShrink: 0 }} />
          <span>{analysisError}</span>
        </div>
      )}

      <div style={{marginBottom: '32px'}}>
        <button className="btn-3d btn-secondary" style={{width: '100%', justifyContent: 'center'}} onClick={() => handleCameraClick('extra')} disabled={analyzing || showExtraMealSelector}>
          <Flame size={20} style={{marginRight: '8px'}} /> Registre refeição livre
        </button>
        
        {showExtraMealSelector && (
          <div className="patient-card patient-glass animate-pop-in" style={{marginTop: '16px'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px'}}>
              <h4 style={{margin: 0, color: 'var(--patient-text)'}}>Qual refeição foi essa?</h4>
              <button onClick={() => setShowExtraMealSelector(false)} style={{background: 'none', border: 'none', color: 'var(--patient-text-muted)', cursor: 'pointer'}}><X size={20}/></button>
            </div>
            <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
              {['Café da Manhã', 'Lanche da Manhã', 'Almoço', 'Lanche da Tarde', 'Jantar', 'Ceia'].map(meal => (
                <button key={meal} className="btn-3d" style={{background: 'var(--patient-surface-2)', border: '1px solid var(--glass-border)', color: 'var(--patient-text)', width: '100%'}} onClick={() => handleSelectExtraMeal(meal)}>
                  {meal}
                </button>
              ))}
            </div>
          </div>
        )}

        {analyzing && activeMealIndex === 'extra' && !showExtraMealSelector && (
          <div className="animate-pulse-glow" style={{marginTop: '16px', padding: '16px', backgroundColor: 'rgba(245, 158, 11, 0.1)', borderRadius: '12px', textAlign: 'center'}}>
            {previewImage && <img src={previewImage} alt="Preview Extra" style={{width: '80px', height: '80px', objectFit: 'cover', borderRadius: '12px', marginBottom: '12px', border: '1px solid var(--accent-color)'}} />}
            <h4 style={{color: 'var(--accent-color)', margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'}}><Sparkles size={18} /> Analisando sem culpa...</h4>
          </div>
        )}
        
        {extraLogsForDate.length > 0 && (
          <div style={{marginTop: '24px'}}>
            <h3 style={{fontSize: '1.1rem', fontWeight: '800', marginBottom: '16px', color: 'var(--accent-color)', display: 'flex', alignItems: 'center', gap: '8px'}}><Flame color="var(--accent-color)"/> Diário Livre</h3>
            {extraLogsForDate.slice().reverse().map((elog, i) => (
                <div key={i} className="patient-card patient-glass" style={{marginBottom: '12px', borderColor: 'rgba(245, 158, 11, 0.3)'}}>
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px'}}>
                    <strong style={{color: 'var(--accent-color)', fontSize: '0.9rem'}}>{elog.mealName || 'Refeição Livre'}</strong>
                    <span style={{color: 'var(--patient-text-muted)', fontSize: '0.8rem'}}>{elog.time}</span>
                  </div>
                  <div className="markdown-content" style={{margin: 0, fontSize: '0.9rem', color: 'var(--patient-text)', lineHeight: '1.5'}}>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{elog.log}</ReactMarkdown>
                  </div>
                </div>
            ))}
          </div>
        )}
      </div>

      {currentRecipe ? (
        <>
          <div className="patient-card patient-glass" style={{display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px'}}>
            <div style={{position: 'relative', width: '100px', height: '100px'}}>
              <svg width="100" height="100" style={{transform: 'rotate(-90deg)'}}>
                <circle cx="50" cy="50" r={radius} stroke="rgba(0,0,0,0.05)" strokeWidth="8" fill="none" />
                <circle cx="50" cy="50" r={radius} stroke="var(--primary-color)" strokeWidth="8" fill="none" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} style={{transition: 'stroke-dashoffset 1s ease-in-out', strokeLinecap: 'round'}} />
              </svg>
              <div style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column'}}>
                <span style={{fontSize: '1.2rem', fontWeight: '900', color: progressPercent === 100 ? '#F59E0B' : 'var(--patient-text)'}}>{progressPercent}%</span>
              </div>
            </div>
            <div>
              <h3 style={{margin: '0 0 4px 0', fontSize: '1.3rem', color: 'var(--patient-text)'}}>Performance</h3>
              <p style={{margin: 0, color: 'var(--patient-text-muted)'}}>{completedMeals} de {totalMeals} refeições concluídas</p>
            </div>
          </div>



          <h2 style={{fontSize: '1.2rem', fontWeight: '800', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--patient-text)'}}><Target color="var(--primary-color)" /> Refeições de {selectedDateObj.toLocaleDateString('pt-BR') === new Date().toLocaleDateString('pt-BR') ? 'Hoje' : selectedDateFormatted}</h2>

          {currentRecipe.meals.map((meal, idx) => {
            const log = getMealLog(meal.name);
            const isDone = !!log;
            const isAnalyzingThis = analyzing && activeMealIndex === idx;
            return (
              <div key={idx} className="patient-card patient-glass" style={{display: 'flex', flexDirection: 'column', marginBottom: '16px', borderColor: isDone ? 'var(--primary-color)' : 'var(--glass-border)'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isDone && log?.log ? '12px' : '0'}}>
                  <div>
                    <h4 style={{margin: 0, fontSize: '1.1rem', color: isDone ? 'var(--primary-color)' : 'var(--patient-text)', display: 'flex', alignItems: 'center', gap: '8px'}}>
                      {isDone && <Check size={18} color="var(--primary-color)" />} {meal.name}
                    </h4>
                    <p style={{margin: '4px 0 0 0', fontSize: '0.9rem', color: 'var(--patient-text-muted)'}}>{meal.desc}</p>
                  </div>
                  {!isDone ? (
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <button className="btn-3d btn-primary" style={{padding: '8px 12px', fontSize: '0.85rem'}} onClick={() => openCheckIn(idx)} disabled={analyzing || checkInMealIndex === idx}>
                        <Check size={16} style={{marginRight: '4px'}} /> Fazer Check-in
                      </button>
                    </div>
                  ) : (
                    <span style={{backgroundColor: 'rgba(16, 185, 129, 0.2)', color: 'var(--primary-color)', padding: '6px 12px', borderRadius: '12px', fontWeight: 'bold', fontSize: '0.8rem'}}>CONCLUÍDO</span>
                  )}
                </div>
                
                {checkInMealIndex === idx && !isDone && (
                  <div className="animate-pop-in" style={{marginTop: '12px', backgroundColor: 'var(--patient-surface-2)', padding: '16px', borderRadius: '12px', border: '1px solid var(--glass-border)'}}>
                    
                    <div style={{ marginBottom: '16px' }}>
                      <label style={{display: 'block', fontSize: '0.95rem', color: 'var(--patient-text)', marginBottom: '8px', fontWeight: 600}}>Comeu no horário planejado?</label>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className={`btn-3d ${ateOnTime === true ? 'btn-primary' : 'btn-secondary'}`} style={{flex: 1, padding: '8px', fontSize: '0.9rem'}} onClick={() => setAteOnTime(true)}>Sim</button>
                        <button className={`btn-3d ${ateOnTime === false ? 'btn-primary' : 'btn-secondary'}`} style={{flex: 1, padding: '8px', fontSize: '0.9rem'}} onClick={() => setAteOnTime(false)}>Não</button>
                      </div>
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                      <label style={{display: 'block', fontSize: '0.95rem', color: 'var(--patient-text)', marginBottom: '8px', fontWeight: 600}}>Seguiu a dieta prescrita?</label>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className={`btn-3d ${followedDiet === true ? 'btn-primary' : 'btn-secondary'}`} style={{flex: 1, padding: '8px', fontSize: '0.9rem'}} onClick={() => setFollowedDiet(true)}>Sim</button>
                        <button className={`btn-3d ${followedDiet === false ? 'btn-primary' : 'btn-secondary'}`} style={{flex: 1, padding: '8px', fontSize: '0.9rem'}} onClick={() => setFollowedDiet(false)}>Não</button>
                      </div>
                    </div>

                    {followedDiet === false && (
                      <div style={{ marginBottom: '16px' }}>
                        <label style={{display: 'block', fontSize: '0.85rem', color: 'var(--patient-text-muted)', marginBottom: '8px'}}>O que você comeu de diferente?</label>
                        <textarea 
                          value={divergenceText} 
                          onChange={(e) => setDivergenceText(e.target.value)} 
                          placeholder="Ex: 2 fatias de pizza de calabresa e refrigerante..." 
                          style={{width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--glass-border)', backgroundColor: 'var(--patient-surface)', color: 'var(--patient-text)', fontSize: '0.9rem', minHeight: '80px', resize: 'none'}}
                        />
                        <div style={{marginTop: '12px', display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', backgroundColor: 'rgba(245, 158, 11, 0.05)', borderRadius: '8px', border: '1px dashed var(--accent-color)'}}>
                          <div style={{flex: 1}}>
                            <strong style={{display: 'block', fontSize: '0.85rem', color: 'var(--accent-color)'}}>Com preguiça de digitar?</strong>
                            <span style={{fontSize: '0.8rem', color: 'var(--patient-text-muted)'}}>Mande uma foto e a IA descreve por você!</span>
                          </div>
                          <button className="btn-3d btn-secondary" style={{padding: '8px 12px', fontSize: '0.85rem', borderColor: 'var(--accent-color)', color: 'var(--accent-color)'}} onClick={() => handleCameraClick(idx)} disabled={analyzing}>
                            <Camera size={16} style={{marginRight: '4px'}} /> Foto IA
                          </button>
                        </div>
                      </div>
                    )}

                    <div style={{display: 'flex', justifyContent: 'flex-end', marginTop: '16px'}}>
                      <button className="btn-3d btn-primary" style={{padding: '10px 24px', fontSize: '0.95rem'}} onClick={() => handleSaveCheckIn(idx)} disabled={ateOnTime === null || followedDiet === null || (followedDiet === false && !divergenceText.trim())}>
                        Salvar Diário
                      </button>
                    </div>
                  </div>
                )}
                {isAnalyzingThis && (
                  <div className="animate-pulse-glow" style={{marginTop: '16px', padding: '16px', backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px', textAlign: 'center'}}>
                    {previewImage && <img src={previewImage} alt="Preview" style={{width: '80px', height: '80px', objectFit: 'cover', borderRadius: '12px', marginBottom: '12px', border: '1px solid var(--primary-color)'}} />}
                    <h4 style={{color: 'var(--primary-color)', margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'}}><Sparkles size={18} /> IA Analisando Nutrientes...</h4>
                  </div>
                )}
                {isDone && log?.log && (
                  <div style={{marginTop: '16px', padding: '12px', backgroundColor: 'var(--patient-surface-2)', borderRadius: '12px', borderLeft: '3px solid var(--primary-color)'}}>
                    <div className="markdown-content" style={{margin: 0, fontSize: '0.9rem', color: 'var(--patient-text)', lineHeight: '1.5'}}>
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{log.log}</ReactMarkdown>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

        </>
      ) : (
        <div style={{textAlign: 'center', padding: '60px 20px', color: 'var(--patient-text-muted)'}}>
          <AlertCircle size={48} color="var(--glass-border)" style={{marginBottom: '16px'}} />
          <h3 style={{color: 'var(--patient-text)'}}>Sem Plano Ativo</h3>
          <p>O seu nutricionista ainda não liberou seu cardápio de Alta Performance.</p>
        </div>
      )}

      {/* Modal de Sono */}
      {showSleepModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          backgroundColor: 'rgba(15, 23, 42, 0.8)', 
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000,
          backdropFilter: 'blur(4px)'
        }}>
          <div className="animate-pop-in" style={{
            backgroundColor: 'var(--patient-surface)', padding: '24px', borderRadius: '24px', 
            width: '90%', maxWidth: '400px', border: '1px solid var(--glass-border)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, color: 'var(--patient-text)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Moon size={24} color="var(--primary-color)" /> Como você dormiu?
              </h3>
              <button onClick={() => setShowSleepModal(false)} style={{ background: 'none', border: 'none', color: 'var(--patient-text-muted)', cursor: 'pointer' }}>
                <X size={24} />
              </button>
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--patient-text-muted)', fontSize: '0.9rem' }}>Horas de sono</label>
              <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px' }}>
                {[4, 5, 6, 7, 8, 9, 10, 11, 12].map(h => (
                  <button 
                    key={h}
                    onClick={() => setSleepHours(h)}
                    style={{
                      flex: '0 0 auto',
                      width: '40px', height: '40px', borderRadius: '50%', border: 'none',
                      backgroundColor: sleepHours === h ? 'var(--primary-color)' : 'var(--patient-bg)',
                      color: sleepHours === h ? '#fff' : 'var(--patient-text-muted)',
                      fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s'
                    }}
                  >
                    {h}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--patient-text-muted)', fontSize: '0.9rem' }}>Qualidade do sono</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {['Ruim', 'Razoável', 'Bom', 'Excelente'].map(q => (
                  <button 
                    key={q}
                    onClick={() => setSleepQuality(q)}
                    style={{
                      flex: 1, padding: '10px 0', borderRadius: '12px', border: 'none',
                      backgroundColor: sleepQuality === q ? 'var(--primary-color)' : 'var(--patient-bg)',
                      color: sleepQuality === q ? '#fff' : 'var(--patient-text-muted)',
                      fontSize: '0.85rem', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s'
                    }}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            <button onClick={handleSaveSleep} className="btn-3d btn-primary" style={{ width: '100%', padding: '14px', fontSize: '1rem' }}>
              Salvar Registro
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
