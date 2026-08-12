import React, { useState, useEffect } from 'react';
import { Lock } from 'lucide-react';
import TopBar from '../../../components/layout/TopBar';
import BottomNav from '../../../components/layout/BottomNav';
import { useAppContext } from '../../../context/AppContext';
import QuestBoard from '../components/QuestBoard';
import DietPlan from '../components/DietPlan';
import WorkoutPlan from '../components/WorkoutPlan';
import BonusRecipes from '../components/BonusRecipes';
import ChatBot from '../components/ChatBot';
import Profile from '../components/Profile';
import PwaInstallPrompt from '../components/PwaInstallPrompt';
import OnboardingProfileForm from '../components/OnboardingProfileForm';
import { getFirebaseErrorMessage } from '../../../utils/firebaseErrors';
import { callOpenAIBridge } from '../../../utils/openaiBridge';

export default function PatientApp() {
  const { patients, activePatientId, setActivePatientId, markNotificationsRead, session, profile, setBypassPatient, fetchProfile, updatePatient, isAuthLoading } = useAppContext();

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    if (session && profile?.role === 'paciente') {
      setIsLoggedIn(true);
    }
  }, [session, profile]);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginCpf, setLoginCpf] = useState('');
  const [loginError, setLoginError] = useState('');
  const [currentView, setCurrentView] = useState('home'); 
  const [chatHistory, setChatHistory] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [useMock, setUseMock] = useState(false);

  const bypassPatient = {
    id: 'mock_1',
    name: 'Paciente Teste (Modo Dev)',
    objective: 'Ganho de massa muscular',
    waterTarget: 3000,
    waterLogs: [],
    mealsCompleted: [],
    xp: 450,
    streak: 3,
    notifications: [{ id: 1, text: 'Aviso: não esqueça da água hoje!', read: false }],
    recipes: [
      {
        date: new Date().toISOString(),
        title: 'Dieta de Alta Performance',
        meals: [
          { 
            id: 1, name: 'Dia 1 - Café da Manhã', desc: 'Panqueca proteica rápida', type: 'cafe', 
            foods: [
              { name: 'Ovo de galinha, inteiro, cru', amount: 100, kcal: 143, carb: 1.6, protein: 13, fat: 8.9, foodId: 234 },
              { name: 'Aveia em flocos, crua', amount: 30, kcal: 118, carb: 20, protein: 4, fat: 2.2, foodId: 21 },
              { name: 'Banana, prata, crua', amount: 100, kcal: 98, carb: 26, protein: 1.3, fat: 0.1, foodId: 299 }
            ]
          },
          { 
            id: 2, name: 'Dia 1 - Almoço', desc: 'Frango com batata doce', type: 'almoco',
            foods: [
              { name: 'Frango, peito, sem pele, grelhado', amount: 150, kcal: 238, carb: 0, protein: 48, fat: 3.7, foodId: 204 },
              { name: 'Batata, doce, cozida', amount: 100, kcal: 77, carb: 18.4, protein: 0.6, fat: 0.1, foodId: 80 }
            ]
          },
          { 
            id: 3, name: 'Dia 2 - Café da Manhã', desc: 'Omelete simples', type: 'cafe', 
            foods: [
              { name: 'Ovo de galinha, inteiro, cru', amount: 150, kcal: 214, carb: 2.4, protein: 19.5, fat: 13.3, foodId: 234 }
            ]
          }
        ]
      }
    ]
  };

  // We now use the global activePatient from context so it can receive updates
  const activePatient = patients.find(p => p.id === activePatientId) || patients[0];
  const currentRecipe = activePatient?.recipes?.length > 0 ? activePatient.recipes[activePatient.recipes.length - 1] : null;

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    if (useMock) {
      // Mock já foi setado pelo botão
      return;
    }
    try {
      const normalizedEmail = loginEmail.trim().toLowerCase();
      
      const { signInWithEmailAndPassword, createUserWithEmailAndPassword } = await import('firebase/auth');
      const { auth, db } = await import('../../../services/firebase');
      const { doc, getDoc, setDoc, deleteDoc } = await import('firebase/firestore');

      try {
        await signInWithEmailAndPassword(auth, normalizedEmail, loginCpf); // loginCpf is the password now
        setIsLoggedIn(true);
      } catch (authError) {
        setLoginError('Paciente não encontrado ou senha incorreta. Verifique suas credenciais.');
      }
    } catch (error) {
      console.error("Erro no login:", error);
      if (error.code === 'auth/email-already-in-use') {
        setLoginError('Este e-mail já possui cadastro. Por favor, use o CPF que você cadastrou originalmente para entrar.');
      } else {
        setLoginError(getFirebaseErrorMessage(error));
      }
    }
  };

  const handleSendChatMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;
    const userMessage = chatInput.trim();
    const newHistory = [...chatHistory, { role: 'user', content: userMessage }];
    setChatHistory(newHistory);
    setChatInput('');
    setIsChatLoading(true);

    const userMessageLower = userMessage.toLowerCase();
    const keywords = ['doce', 'doces', 'chocolate', 'jacada', 'açúcar', 'ansiedade', 'compulsão', 'acucar'];
    if (keywords.some(kw => userMessageLower.includes(kw))) {
      if (activePatient.sleepLogs && activePatient.sleepLogs.length > 0) {
        const latestSleep = [...activePatient.sleepLogs].reverse()[0];
        if (latestSleep.quality === 'Ruim' || parseFloat(latestSleep.hours) < 6) {
           updatePatient(activePatient.id, { behavioral_risk: true });
        }
      }
    }

    try {
      const dietContext = currentRecipe ? currentRecipe.meals.map(m => `- ${m.name}: ${m.desc}`).join('\n') : 'Nenhuma dieta estruturada ativa no momento.';
      const lastWeight = activePatient.weights && activePatient.weights.length > 0 ? activePatient.weights[activePatient.weights.length - 1].value + ' kg' : 'Não informado';
      const waterIntake = activePatient.waterGlasses ? (activePatient.waterGlasses * 250) + ' ml' : 'Nenhuma água registrada hoje';
      const systemPrompt = `Você é a Nutrivvo Bot, assistente clínica da Nutrivvo. Perfil: Médica nutricionista, técnica e baseada em evidências. Objetivo: Tirar dúvidas sobre o plano alimentar e evolução. DADOS: Nome: ${activePatient.name}. Objetivo: ${activePatient.objective}. Restrições: ${activePatient.restrictions || 'Nenhuma'}. BIOMETRIA ATUAL -> Peso: ${lastWeight}. Ingestão de Água hoje: ${waterIntake}. PLANO ATUAL: ${dietContext}. Responda de forma concisa e em pt-BR.`;

      const data = await callOpenAIBridge({ system_prompt: systemPrompt, messages: newHistory });
      setChatHistory([...newHistory, { role: 'assistant', content: data.choices[0].message.content }]);
    } catch (error) {
      console.error('Erro no chat da IA:', error);
      setChatHistory([...newHistory, { role: 'assistant', content: "Erro de conexão clínica. Tente mais tarde." }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const styles = {
    content: { padding: '20px', maxWidth: '600px', margin: '0 auto' }
  };

  if (isAuthLoading) {
    return (
      <div className="patient-container" style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <div className="animate-pulse-glow" style={{width: '60px', height: '60px', borderRadius: '50%', background: 'var(--primary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <span style={{fontSize: '32px'}}>🍏</span>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="patient-container" style={{display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'}}>
        <div className="patient-card patient-glass" style={{width: '100%', maxWidth: '400px'}}>
          <div style={{textAlign: 'center', marginBottom: '32px'}}>
            <div className="animate-pulse-glow" style={{width: '60px', height: '60px', borderRadius: '50%', background: 'var(--primary-color)', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <span style={{fontSize: '32px'}}>🍏</span>
            </div>
            <h1 style={{color: 'var(--patient-text)', margin: '0 0 8px 0', fontSize: '1.8rem'}}>Nutrivvo App</h1>
            <p style={{color: 'var(--patient-text-muted)', margin: 0}}>Acesse seu plano de Alta Performance</p>
          </div>
          {loginError && <div style={{backgroundColor: 'rgba(255,0,85,0.1)', color: 'var(--accent-color)', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.9rem', border: '1px solid var(--accent-color)'}}>{loginError}</div>}
          <form onSubmit={handleLogin} style={{display: 'flex', flexDirection: 'column', gap: '20px'}}>
            <div>
              <label style={{display: 'block', marginBottom: '8px', fontWeight: '600', color: 'var(--patient-text-muted)', fontSize: '0.9rem'}}>E-MAIL</label>
              <input type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} placeholder="Seu e-mail" style={{width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'var(--patient-text)', boxSizing: 'border-box'}} required />
            </div>
            <div>
              <label style={{display: 'block', marginBottom: '8px', fontWeight: '600', color: 'var(--patient-text-muted)', fontSize: '0.9rem'}}>SENHA</label>
              <input type="password" value={loginCpf} onChange={e => setLoginCpf(e.target.value)} placeholder="Sua senha" style={{width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'var(--patient-text)', boxSizing: 'border-box'}} required />
            </div>
            <button type="submit" className="btn-3d btn-primary" style={{width: '100%', marginTop: '12px'}}><Lock size={18} style={{marginRight: '8px'}} /> ACESSAR</button>
          </form>
          
          {import.meta.env.DEV && (
            <button 
              onClick={() => { 
                setBypassPatient(bypassPatient); 
                setUseMock(true); 
                setIsLoggedIn(true); 
              }} 
              className="btn-3d" 
              style={{width: '100%', marginTop: '16px', background: 'var(--glass-panel)', border: '1px solid var(--glass-border)', color: 'var(--patient-text)'}}
            >
              🛠️ BYPASS MODO TESTE (DEV)
            </button>
          )}
        </div>
      </div>
    );
  }

  if (profile?.role === 'incomplete_patient') {
    return (
      <div className="patient-container" style={{display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'}}>
        <div className="patient-card patient-glass" style={{width: '100%', maxWidth: '400px', textAlign: 'center'}}>
          <h2 style={{color: 'var(--accent-color)', marginBottom: '16px'}}>Cadastro Incompleto</h2>
          <p style={{color: 'var(--patient-text)', fontSize: '0.95rem', marginBottom: '24px'}}>
            Seu perfil ainda não foi vinculado ao sistema da sua nutricionista.
          </p>
          <p style={{color: 'var(--patient-text-muted)', fontSize: '0.9rem', marginBottom: '24px'}}>
            Por favor, <strong>peça para ela reenviar o link de convite</strong> e acesse novamente clicando nele, ou saia e tente com as credenciais corretas.
          </p>
          <button onClick={() => { auth.signOut(); setIsLoggedIn(false); window.location.reload(); }} className="btn-3d btn-primary" style={{width: '100%'}}>
            Voltar para o Login
          </button>
        </div>
      </div>
    );
  }

  if (!activePatient) {
    return (
      <div className="patient-container" style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <p style={{color: 'var(--patient-text-muted)', fontSize: '1.2rem', fontWeight: '600'}}>Sincronizando perfil...</p>
      </div>
    );
  }

  // Se o paciente entrou via Self-Service e ainda não completou o onboarding da Degustação IA
  if (!activePatient.nutricionista_id && !activePatient.has_completed_onboarding) {
    return <OnboardingProfileForm patient={activePatient} />;
  }

  return (
    <div className="patient-container">
      <TopBar streak={activePatient.streak} gems={activePatient.xp} notifications={activePatient.notifications || []} onOpenNotifications={() => markNotificationsRead(activePatient.id)} />
      <div style={styles.content}>
        {currentView === 'home' && <QuestBoard activePatient={activePatient} />}
        {currentView === 'diet' && <DietPlan activePatient={activePatient} />}
        {currentView === 'workout' && <WorkoutPlan activePatient={activePatient} />}
        {currentView === 'recipes' && <BonusRecipes activePatient={activePatient} />}
        {currentView === 'quests' && <ChatBot activePatient={activePatient} currentRecipe={currentRecipe} chatHistory={chatHistory} setChatHistory={setChatHistory} chatInput={chatInput} setChatInput={setChatInput} isChatLoading={isChatLoading} setIsChatLoading={setIsChatLoading} handleSendChatMessage={handleSendChatMessage} />}
        {currentView === 'profile' && <Profile activePatient={activePatient} />}
      </div>
      <PwaInstallPrompt />
      <BottomNav currentView={currentView} setCurrentView={setCurrentView} />
    </div>
  );
}

