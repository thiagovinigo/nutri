import React, { useState } from 'react';
import { Sparkles, ArrowRight, Loader2, Target, Coffee, Activity, Pill } from 'lucide-react';
import { callOpenAIBridge } from '../../../utils/openaiBridge';
import { useAppContext } from '../../../context/AppContext';

export default function OnboardingProfileForm({ patient }) {
  const { updatePatient } = useAppContext();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    objective: '',
    aversions: '',
    activityLevel: '',
    supplements: ''
  });

  const handleNext = () => setStep(s => s + 1);
  const handlePrev = () => setStep(s => s - 1);

  const handleGenerateTrial = async () => {
    setLoading(true);
    setError('');

    try {
      // 1. Gerar Dieta de 1 Dia
      const dietPrompt = `Você é um nutricionista esportivo de elite. Crie um cardápio de 1 DIA exato para este paciente. 
      NOME: ${patient.name}
      OBJETIVO: ${formData.objective}
      AVERSÕES/ALERGIAS: ${formData.aversions || 'Nenhuma'}
      NÍVEL DE ATIVIDADE: ${formData.activityLevel}
      
      RETORNE APENAS UM JSON VÁLIDO exatamente neste formato:
      {
        "meals": [
          {
            "name": "Café da Manhã",
            "desc": "Nome amigável da refeição",
            "type": "cafe",
            "foods": [
              { "name": "Nome do Alimento", "amount": 100, "kcal": 150, "carb": 10, "protein": 20, "fat": 5 }
            ]
          }
        ]
      }
      Gere 4 refeições (Café, Almoço, Lanche, Jantar).
      `;

      const dietResponse = await callOpenAIBridge({
        system_prompt: dietPrompt,
        messages: [{ role: 'user', content: 'Gere a dieta em JSON.' }],
        format_json: true
      });

      let dietData;
      try {
        dietData = JSON.parse(dietResponse.choices[0].message.content);
      } catch(e) {
        throw new Error("Falha ao interpretar a dieta gerada pela IA.");
      }

      // Adicionando IDs e formatando para o modelo do Nutrivvo
      const formattedMeals = dietData.meals.map((m, i) => ({
        ...m,
        id: Date.now() + i,
        foods: m.foods.map((f, j) => ({ ...f, foodId: Date.now() + j, amount: Number(f.amount) || 100 }))
      }));

      const newRecipe = {
        date: new Date().toISOString(),
        title: 'Amostra Grátis - IA Nutrivvo',
        meals: formattedMeals
      };

      // 2. Gerar Treino Completo
      const workoutPrompt = `Você é um Personal Trainer de elite. Crie um plano de treino para este paciente com base nos dados:
      OBJETIVO: ${formData.objective}
      NÍVEL DE ATIVIDADE: ${formData.activityLevel}
      
      RETORNE APENAS UM JSON VÁLIDO exatamente neste formato:
      {
        "workouts": [
          {
            "name": "Treino A - Membros Inferiores",
            "exercises": [
              { "name": "Agachamento Livre", "sets": "4", "reps": "10 a 12", "notes": "Focar na cadência" }
            ]
          }
        ]
      }
      Gere de 2 a 5 treinos dependendo do nível de atividade (Sedentário = 2 a 3, Ativo = 4 a 5).
      `;

      const workoutResponse = await callOpenAIBridge({
        system_prompt: workoutPrompt,
        messages: [{ role: 'user', content: 'Gere o treino em JSON.' }],
        format_json: true
      });

      let workoutData;
      try {
        workoutData = JSON.parse(workoutResponse.choices[0].message.content);
      } catch(e) {
        throw new Error("Falha ao interpretar o treino gerado pela IA.");
      }

      const formattedWorkouts = workoutData.workouts.map((w, i) => ({
        id: Date.now() + 1000 + i,
        name: w.name,
        exercises: w.exercises.map((ex, j) => ({ ...ex, id: Date.now() + 2000 + j }))
      }));

      // 3. Atualizar no Firestore
      await updatePatient(patient.id, {
        objective: formData.objective,
        restrictions: formData.aversions,
        activity_level: formData.activityLevel,
        supplements_taken: formData.supplements,
        has_completed_onboarding: true,
        recipes: [newRecipe],
        workoutPlan: { days: formattedWorkouts },
        records: 'Onboarding com Degustação IA realizado.'
      });

      // Recarrega a tela forçando o estado
      window.location.reload();

    } catch (err) {
      console.error(err);
      setError('Houve um erro ao gerar seu plano. Tente novamente.');
      setLoading(false);
    }
  };

  const isStep1Valid = formData.objective !== '';
  const isStep2Valid = true; // Opcional
  const isStep3Valid = formData.activityLevel !== '';
  
  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#0a0a14', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{
        width: '100%', maxWidth: '500px', backgroundColor: 'rgba(20, 20, 32, 0.75)', backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '40px',
        boxShadow: '0 25px 60px -15px rgba(0,0,0,0.6)', position: 'relative'
      }}>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Loader2 size={48} color="#c084fc" className="animate-spin" style={{ margin: '0 auto 24px' }} />
            <h2 style={{ color: '#f8fafc', fontSize: '1.5rem', marginBottom: '12px' }}>A IA está trabalhando...</h2>
            <p style={{ color: '#94a3b8' }}>Analisando seu perfil e montando seu Cardápio de 1 Dia e Plano de Treino exclusivos.</p>
          </div>
        ) : (
          <>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(168,85,247,0.1)', color: '#c084fc', marginBottom: '16px' }}>
                <Sparkles size={28} />
              </div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f8fafc', marginBottom: '8px' }}>Desbloqueie sua Amostra Grátis</h1>
              <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>Responda rápido para a nossa Inteligência Artificial montar seu teste de 1 dia.</p>
            </div>

            {error && (
              <div style={{ padding: '12px', backgroundColor: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5', borderRadius: '10px', marginBottom: '16px', fontSize: '0.9rem' }}>
                {error}
              </div>
            )}

            {/* Passo 1: Objetivo */}
            {step === 1 && (
              <div className="animate-fade-in">
                <h3 style={{ color: '#e2e8f0', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}><Target size={20} color="#c084fc" /> Qual o seu principal objetivo?</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {['Emagrecimento', 'Hipertrofia (Ganho de Massa)', 'Manutenção de Saúde', 'Performance Esportiva'].map(obj => (
                    <button
                      key={obj}
                      onClick={() => setFormData({...formData, objective: obj})}
                      style={{
                        padding: '16px', borderRadius: '12px', textAlign: 'left', fontSize: '1rem', cursor: 'pointer', transition: 'all 0.2s',
                        background: formData.objective === obj ? 'rgba(168,85,247,0.2)' : 'rgba(255,255,255,0.05)',
                        border: `1px solid ${formData.objective === obj ? '#c084fc' : 'rgba(255,255,255,0.1)'}`,
                        color: formData.objective === obj ? '#f8fafc' : '#cbd5e1'
                      }}
                    >
                      {obj}
                    </button>
                  ))}
                </div>
                <button 
                  onClick={handleNext} disabled={!isStep1Valid}
                  className="btn-3d btn-primary" style={{ width: '100%', marginTop: '24px', opacity: isStep1Valid ? 1 : 0.5 }}
                >
                  Continuar <ArrowRight size={18} style={{ marginLeft: '8px' }} />
                </button>
              </div>
            )}

            {/* Passo 2: Aversões e Suplementos */}
            {step === 2 && (
              <div className="animate-fade-in">
                <h3 style={{ color: '#e2e8f0', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}><Coffee size={20} color="#c084fc" /> Alimentação e Suplementos</h3>
                
                <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8', fontSize: '0.9rem' }}>O que você <strong>NÃO</strong> gosta ou não pode comer? (Aversões / Alergias)</label>
                <textarea 
                  value={formData.aversions}
                  onChange={e => setFormData({...formData, aversions: e.target.value})}
                  placeholder="Ex: Não como carne vermelha, alergia a amendoim, odeio brócolis..."
                  style={{ width: '100%', padding: '12px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#f8fafc', marginBottom: '20px', minHeight: '80px', outline: 'none' }}
                />

                <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}><Pill size={16} /> Você já toma algum suplemento ou remédio?</label>
                <input 
                  type="text"
                  value={formData.supplements}
                  onChange={e => setFormData({...formData, supplements: e.target.value})}
                  placeholder="Ex: Whey, Creatina, Ômega 3..."
                  style={{ width: '100%', padding: '12px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#f8fafc', outline: 'none' }}
                />

                <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                  <button onClick={handlePrev} style={{ padding: '12px', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '10px', color: '#cbd5e1', cursor: 'pointer' }}>Voltar</button>
                  <button onClick={handleNext} className="btn-3d btn-primary" style={{ flex: 1 }}>Continuar <ArrowRight size={18} style={{ marginLeft: '8px' }} /></button>
                </div>
              </div>
            )}

            {/* Passo 3: Atividade Física */}
            {step === 3 && (
              <div className="animate-fade-in">
                <h3 style={{ color: '#e2e8f0', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}><Activity size={20} color="#c084fc" /> Nível de Atividade Física</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[
                    { val: 'Sedentário (Nenhuma ou pouca)', label: 'Sedentário (0 a 1 vez na semana)' },
                    { val: 'Leve (1 a 3 dias na semana)', label: 'Leve (1 a 3 dias)' },
                    { val: 'Moderado (3 a 5 dias na semana)', label: 'Moderado (3 a 5 dias)' },
                    { val: 'Intenso (6 a 7 dias na semana)', label: 'Intenso (Todos os dias)' }
                  ].map(lvl => (
                    <button
                      key={lvl.val}
                      onClick={() => setFormData({...formData, activityLevel: lvl.val})}
                      style={{
                        padding: '16px', borderRadius: '12px', textAlign: 'left', fontSize: '1rem', cursor: 'pointer', transition: 'all 0.2s',
                        background: formData.activityLevel === lvl.val ? 'rgba(168,85,247,0.2)' : 'rgba(255,255,255,0.05)',
                        border: `1px solid ${formData.activityLevel === lvl.val ? '#c084fc' : 'rgba(255,255,255,0.1)'}`,
                        color: formData.activityLevel === lvl.val ? '#f8fafc' : '#cbd5e1'
                      }}
                    >
                      {lvl.label}
                    </button>
                  ))}
                </div>
                
                <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                  <button onClick={handlePrev} style={{ padding: '12px', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '10px', color: '#cbd5e1', cursor: 'pointer' }}>Voltar</button>
                  <button 
                    onClick={handleGenerateTrial} disabled={!isStep3Valid}
                    className="btn-3d btn-primary" style={{ flex: 1, opacity: isStep3Valid ? 1 : 0.5, background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)', boxShadow: '0 8px 20px -6px rgba(34,197,94,0.5)' }}
                  >
                    Gerar Meu Plano com IA <Sparkles size={16} style={{ marginLeft: '8px' }} />
                  </button>
                </div>
              </div>
            )}

            {/* Stepper Dots */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '32px' }}>
              {[1, 2, 3].map(i => (
                <div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%', background: step === i ? '#c084fc' : 'rgba(255,255,255,0.1)' }} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
