import React, { useState, useEffect } from 'react';
import { Lock } from 'lucide-react';
import TopBar from '../../../components/layout/TopBar';
import BottomNav from '../../../components/layout/BottomNav';
import { useAppContext } from '../../../context/AppContext';
import QuestBoard from '../components/QuestBoard';
import DietPlan from '../components/DietPlan';
import BonusRecipes from '../components/BonusRecipes';
import ChatBot from '../components/ChatBot';
import Profile from '../components/Profile';

export default function PatientApp() {
  const { patients, activePatientId, setActivePatientId, markNotificationsRead, session, profile } = useAppContext();

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
    recipes: [{
      date: new Date().toISOString(),
      meals: [
        { id: 1, name: 'Café da Manhã', desc: '2 ovos mexidos, 1 fatia de pão integral, café preto.', type: 'cafe' },
        { id: 2, name: 'Almoço', desc: '150g de peito de frango, 100g de arroz integral, salada à vontade.', type: 'almoco' }
      ]
    }]
  };

  const activePatient = useMock ? bypassPatient : (patients.find(p => p.id === activePatientId) || patients[0]);
  const currentRecipe = activePatient?.recipes?.length > 0 ? activePatient.recipes[activePatient.recipes.length - 1] : null;

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    try {
      // 1. Tenta logar no Firebase com o CPF como senha
      const { signInWithEmailAndPassword, createUserWithEmailAndPassword } = await import('firebase/auth');
      const { auth, db } = await import('../../../services/firebase');
      const { doc, getDoc, setDoc, deleteDoc } = await import('firebase/firestore');
      
      try {
        await signInWithEmailAndPassword(auth, loginEmail, loginCpf);
        setIsLoggedIn(true);
      } catch (authError) {
        // Se der erro (usuário não encontrado ou credencial inválida), verifica se há link de vínculo
        const params = new URLSearchParams(window.location.search);
        const vincularId = params.get('vincular');
        
        if (vincularId) {
          // É o primeiro acesso, vamos registrar o paciente com o CPF sendo a senha
          const userCredential = await createUserWithEmailAndPassword(auth, loginEmail, loginCpf);
          const user = userCredential.user;
          
          // Buscar o doc temporário no Firestore criado pelo Nutricionista
          const tempDocRef = doc(db, 'patients', vincularId);
          const tempDocSnap = await getDoc(tempDocRef);
          
          if (tempDocSnap.exists()) {
            const data = tempDocSnap.data();
            
            // Criar o perfil de acesso como paciente
            await setDoc(doc(db, 'users', user.uid), { role: 'paciente', email: loginEmail });
            
            // Mover os dados da ficha para o ID do Firebase Auth
            await setDoc(doc(db, 'patients', user.uid), { ...data, id: user.uid });
            
            // Deletar o documento temporário para não sujar o BD
            await deleteDoc(tempDocRef);
            
            // Remover o parâmetro da URL
            window.history.replaceState({}, document.title, window.location.pathname);
            setIsLoggedIn(true);
          } else {
            setLoginError('Link de convite inválido ou já utilizado.');
          }
        } else {
          setLoginError('Paciente não encontrado. Verifique seu E-mail e CPF ou acesse pelo link enviado pela sua Nutri no primeiro acesso.');
        }
      }
    } catch (error) {
      console.error(error);
      setLoginError('Erro de conexão ao tentar fazer login.');
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

    try {
      const dietContext = currentRecipe ? currentRecipe.meals.map(m => `- ${m.name}: ${m.desc}`).join('\n') : 'Nenhuma dieta estruturada ativa no momento.';
      const systemPrompt = `Você é a Vytal Bot, assistente clínica da Vytal. Perfil: Médica nutricionista, técnica e baseada em evidências. Objetivo: Tirar dúvidas sobre o plano alimentar. DADOS: Nome: ${activePatient.name}. Objetivo: ${activePatient.objective}. Restrições: ${activePatient.restrictions || 'Nenhuma'}. PLANO ATUAL: ${dietContext}. Responda de forma concisa e em pt-BR.`;

      const response = await fetch('/api/openai-bridge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ system_prompt: systemPrompt, messages: newHistory })
      });
      if (!response.ok) throw new Error('Erro na rede ou na API.');
      const data = await response.json();
      setChatHistory([...newHistory, { role: 'assistant', content: data.choices[0].message.content }]);
    } catch (error) {
      setChatHistory([...newHistory, { role: 'assistant', content: "Erro de conexão clínica. Tente mais tarde." }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const styles = {
    content: { padding: '20px', maxWidth: '600px', margin: '0 auto' }
  };

  if (!isLoggedIn) {
    return (
      <div className="patient-container" style={{display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'}}>
        <div className="patient-card patient-glass" style={{width: '100%', maxWidth: '400px'}}>
          <div style={{textAlign: 'center', marginBottom: '32px'}}>
            <div className="animate-pulse-glow" style={{width: '60px', height: '60px', borderRadius: '50%', background: 'var(--primary-color)', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <span style={{fontSize: '32px'}}>🍏</span>
            </div>
            <h1 style={{color: 'var(--patient-text)', margin: '0 0 8px 0', fontSize: '1.8rem'}}>Vytal App</h1>
            <p style={{color: 'var(--patient-text-muted)', margin: 0}}>Acesse seu plano de Alta Performance</p>
          </div>
          {loginError && <div style={{backgroundColor: 'rgba(255,0,85,0.1)', color: 'var(--accent-color)', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.9rem', border: '1px solid var(--accent-color)'}}>{loginError}</div>}
          <form onSubmit={handleLogin} style={{display: 'flex', flexDirection: 'column', gap: '20px'}}>
            <div>
              <label style={{display: 'block', marginBottom: '8px', fontWeight: '600', color: 'var(--patient-text-muted)', fontSize: '0.9rem'}}>E-MAIL</label>
              <input type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} placeholder="Seu e-mail" style={{width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'var(--patient-text)', boxSizing: 'border-box'}} required />
            </div>
            <div>
              <label style={{display: 'block', marginBottom: '8px', fontWeight: '600', color: 'var(--patient-text-muted)', fontSize: '0.9rem'}}>CPF</label>
              <input type="text" value={loginCpf} onChange={e => setLoginCpf(e.target.value)} placeholder="111.111.111-11" style={{width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'var(--patient-text)', boxSizing: 'border-box'}} required />
            </div>
            <button type="submit" className="btn-3d btn-primary" style={{width: '100%', marginTop: '12px'}}><Lock size={18} style={{marginRight: '8px'}} /> ACESSAR</button>
          </form>
          
          {import.meta.env.DEV && (
            <button 
              onClick={() => { setUseMock(true); setIsLoggedIn(true); }} 
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

  if (!activePatient) {
    return (
      <div className="patient-container" style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <p style={{color: 'var(--patient-text-muted)', fontSize: '1.2rem', fontWeight: '600'}}>Sincronizando perfil...</p>
      </div>
    );
  }

  return (
    <div className="patient-container">
      <TopBar streak={activePatient.streak} gems={activePatient.xp} notifications={activePatient.notifications || []} onOpenNotifications={() => markNotificationsRead(activePatient.id)} />
      <div style={styles.content}>
        {currentView === 'home' && <QuestBoard activePatient={activePatient} />}
        {currentView === 'diet' && <DietPlan activePatient={activePatient} />}
        {currentView === 'recipes' && <BonusRecipes activePatient={activePatient} />}
        {currentView === 'quests' && <ChatBot activePatient={activePatient} currentRecipe={currentRecipe} chatHistory={chatHistory} setChatHistory={setChatHistory} chatInput={chatInput} setChatInput={setChatInput} isChatLoading={isChatLoading} setIsChatLoading={setIsChatLoading} handleSendChatMessage={handleSendChatMessage} />}
        {currentView === 'profile' && <Profile activePatient={activePatient} />}
      </div>
      <BottomNav currentView={currentView} setCurrentView={setCurrentView} />
    </div>
  );
}
