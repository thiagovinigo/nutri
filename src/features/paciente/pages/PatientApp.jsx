import React, { useState } from 'react';
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
  const { patients, activePatientId, setActivePatientId, markNotificationsRead } = useAppContext();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginCpf, setLoginCpf] = useState('');
  const [loginError, setLoginError] = useState('');
  const [currentView, setCurrentView] = useState('home'); 
  const [chatHistory, setChatHistory] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);

  const activePatient = patients.find(p => p.id === activePatientId) || patients[0];
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
    container: { backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: "'Inter', sans-serif", paddingBottom: '100px', color: '#0f172a' },
    content: { padding: '20px', maxWidth: '600px', margin: '0 auto' },
    card: { backgroundColor: '#ffffff', borderRadius: '20px', padding: '20px', border: '2px solid #e2e8f0', boxShadow: '0 4px 0 #cbd5e1', marginBottom: '16px' },
    actionBtn: { backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '12px', padding: '12px 20px', fontWeight: '800', fontSize: '1rem', cursor: 'pointer', boxShadow: '0 4px 0 #2563eb', display: 'flex', alignItems: 'center', gap: '8px' }
  };

  if (!isLoggedIn) {
    return (
      <div style={{...styles.container, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'}}>
        <div style={{...styles.card, width: '100%', maxWidth: '400px'}}>
          <div style={{textAlign: 'center', marginBottom: '24px'}}>
            <h1 style={{color: '#1e293b', margin: '0 0 8px 0'}}>Vytal App</h1>
            <p style={{color: '#64748b', margin: 0}}>Acesse seu plano alimentar</p>
          </div>
          {loginError && <div style={{backgroundColor: '#fee2e2', color: '#b91c1c', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.9rem'}}>{loginError}</div>}
          <form onSubmit={handleLogin} style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
            <div>
              <label style={{display: 'block', marginBottom: '6px', fontWeight: 'bold', color: '#334155'}}>E-mail cadastrado</label>
              <input type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} placeholder="Ex: ana@silva.com" style={{width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box'}} required />
            </div>
            <div>
              <label style={{display: 'block', marginBottom: '6px', fontWeight: 'bold', color: '#334155'}}>CPF</label>
              <input type="text" value={loginCpf} onChange={e => setLoginCpf(e.target.value)} placeholder="Ex: 111.111.111-11" style={{width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box'}} required />
            </div>
            <button type="submit" className="btn-3d" style={{...styles.actionBtn, justifyContent: 'center', width: '100%', marginTop: '8px'}}><Lock size={18} /> Entrar</button>
          </form>
        </div>
      </div>
    );
  }

  if (!activePatient) {
    return (
      <div style={{...styles.container, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <p style={{color: '#64748b', fontSize: '1.2rem'}}>Carregando seus dados...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
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
