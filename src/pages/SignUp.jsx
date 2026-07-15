import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth, db } from '../services/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc, deleteDoc } from 'firebase/firestore';

export default function SignUp() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('paciente'); // Padrão
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(window.location.search);
  const nutriIdParam = searchParams.get('nutri');

  // Se vier com o parâmetro, já trava no papel de paciente
  React.useEffect(() => {
    if (nutriIdParam) setRole('paciente');
  }, [nutriIdParam]);

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    
    if (!auth || !db) {
      setErrorMsg('Firebase não está configurado. Preencha o arquivo .env!');
      setLoading(false);
      return;
    }

    try {
      // Cria o usuário no Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Salva o documento do usuário (role e nome)
      await setDoc(doc(db, 'users', user.uid), {
        name: name,
        email: email,
        role: role,
        createdAt: new Date().toISOString()
      });

      // Se for paciente, criamos também o registro inicial em 'patients' para não dar erro no AppContext
      // Se for paciente, criamos também o registro inicial em 'patients' para não dar erro no AppContext
      if (role === 'paciente') {
        let initialData = {
          name: name,
          email: email, // garantindo o email no doc também
          nutricionista_id: nutriIdParam || null,
          objective: 'Melhorar alimentação',
          restrictions: 'Nenhuma registrada',
          status: 'ativo',
          streak: 1,
          xp: 10,
          water_glasses: 0,
          records: nutriIdParam ? 'Cadastrado por Convite do Nutricionista.' : 'Cadastro self-service pelo App.',
          recipes: [],
          weights: []
        };

        const vincularId = searchParams.get('vincular');
        if (vincularId) {
          try {
            const tempDocRef = doc(db, 'patients', vincularId);
            const tempDocSnap = await getDoc(tempDocRef);
            if (tempDocSnap.exists()) {
              // Mescla os dados do cadastro temporário com o default (sobrescrevendo o default)
              initialData = { ...initialData, ...tempDocSnap.data(), name: name, email: email, status: 'ativo' };
              // Deleta o temporário
              await deleteDoc(tempDocRef);
            }
          } catch(e) {
            console.warn("Falha ao mesclar dados do convite. Pode ser restrição de permissão se o e-mail for diferente.", e);
          }
        }

        await setDoc(doc(db, 'patients', user.uid), initialData);
      }

      // Redireciona com base na role escolhida
      if (role === 'nutricionista') {
        navigate('/nutri');
      } else {
        navigate('/paciente');
      }
      
    } catch (error) {
      setErrorMsg(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc', padding: '20px' }}>
      <div style={{ width: '400px', padding: '40px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '8px', textAlign: 'center', color: '#0f172a' }}>Vytal</h1>
        <p style={{ textAlign: 'center', color: '#64748b', marginBottom: '32px' }}>Crie sua conta gratuitamente</p>
        
        {errorMsg && (
          <div style={{ padding: '12px', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '6px', marginBottom: '16px', fontSize: '0.9rem' }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSignUp}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: '#334155' }}>Nome Completo</label>
            <input 
              type="text" 
              required
              style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="João da Silva"
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: '#334155' }}>E-mail</label>
            <input 
              type="email" 
              required
              style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="joao@email.com"
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: '#334155' }}>Senha</label>
            <input 
              type="password" 
              required
              style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Minimo 6 caracteres"
              minLength="6"
            />
          </div>

          {!nutriIdParam && (
            <div style={{ marginBottom: '32px' }}>
              <label style={{ display: 'block', marginBottom: '12px', fontWeight: '500', color: '#334155' }}>Eu sou...</label>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div 
                  onClick={() => setRole('paciente')}
                  style={{ 
                    flex: 1, padding: '12px', textAlign: 'center', borderRadius: '8px', cursor: 'pointer', border: '2px solid',
                    borderColor: role === 'paciente' ? '#2563eb' : '#e2e8f0',
                    backgroundColor: role === 'paciente' ? '#eff6ff' : 'white',
                    color: role === 'paciente' ? '#1e40af' : '#64748b',
                    fontWeight: role === 'paciente' ? 'bold' : 'normal'
                  }}
                >
                  🥗 Paciente
                </div>
                <div 
                  onClick={() => setRole('nutricionista')}
                  style={{ 
                    flex: 1, padding: '12px', textAlign: 'center', borderRadius: '8px', cursor: 'pointer', border: '2px solid',
                    borderColor: role === 'nutricionista' ? '#2563eb' : '#e2e8f0',
                    backgroundColor: role === 'nutricionista' ? '#eff6ff' : 'white',
                    color: role === 'nutricionista' ? '#1e40af' : '#64748b',
                    fontWeight: role === 'nutricionista' ? 'bold' : 'normal'
                  }}
                >
                  🩺 Nutri
                </div>
              </div>
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            style={{ width: '100%', padding: '14px', backgroundColor: '#2563eb', color: 'white', borderRadius: '6px', border: 'none', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '1rem' }}
          >
            {loading ? 'Criando Conta...' : (role === 'paciente' ? 'Criar e Ganhar 1 Consulta Grátis' : 'Criar Conta de Especialista')}
          </button>

          <div style={{ marginTop: '24px', textAlign: 'center' }}>
            <span style={{ color: '#64748b' }}>Já tem uma conta? </span>
            <Link to={nutriIdParam ? `/login?nutri=${nutriIdParam}` : "/login"} style={{ color: '#2563eb', textDecoration: 'none', fontWeight: 'bold' }}>Faça login aqui</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
