import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth, db } from '../services/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc, deleteDoc } from 'firebase/firestore';
import { getFirebaseErrorMessage } from '../utils/firebaseErrors';
import { useAppContext } from '../context/AppContext';

export default function SignUp() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [crn, setCrn] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLinked, setIsLinked] = useState(false);
  const [role, setRole] = useState('paciente'); // Padrão
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();
  const { fetchProfile } = useAppContext();
  const searchParams = new URLSearchParams(window.location.search);
  const nutriIdParam = searchParams.get('nutri');
  const vincularId = searchParams.get('vincular');

  const roleParam = searchParams.get('role');

  // Se vier com o parâmetro, já trava no papel de paciente e preenche dados
  React.useEffect(() => {
    if (vincularId) {
      setRole('paciente');
      setIsLinked(true);
      const tempDocRef = doc(db, 'patients', vincularId);
      getDoc(tempDocRef).then(snap => {
        if (snap.exists()) {
          const data = snap.data();
          if (data.name) setName(data.name);
          if (data.email) setEmail(data.email);
          if (data.cpf) setCpf(data.cpf);
          if (data.birthDate) setBirthDate(data.birthDate);
        }
      }).catch(e => console.warn('Erro ao carregar dados do link direto', e));
    } else if (nutriIdParam) {
      setRole('paciente');
    } else if (roleParam === 'nutricionista') {
      setRole('nutricionista');
    } else {
      setRole('paciente');
    }
  }, [nutriIdParam, roleParam, vincularId]);

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    
    if (password !== confirmPassword) {
      setErrorMsg('As senhas não conferem.');
      setLoading(false);
      return;
    }

    if (!auth || !db) {
      setErrorMsg('Firebase não está configurado. Preencha o arquivo .env!');
      setLoading(false);
      return;
    }

    try {
      // Cria o usuário no Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      const userDoc = {
        name: name,
        email: email,
        role: role,
        createdAt: new Date().toISOString()
      };
      if (role === 'nutricionista' && crn) {
        userDoc.crn = crn;
      }

      // Salva o documento do usuário (role e nome)
      await setDoc(doc(db, 'users', user.uid), userDoc);

      // Se for paciente, criamos também o registro inicial em 'patients' para não dar erro no AppContext
      if (role === 'paciente') {
        let calculatedAge = 0;
        if (birthDate) {
          const bDate = new Date(birthDate);
          const today = new Date();
          calculatedAge = today.getFullYear() - bDate.getFullYear();
          const m = today.getMonth() - bDate.getMonth();
          if (m < 0 || (m === 0 && today.getDate() < bDate.getDate())) { calculatedAge--; }
        }

        let initialData = {
          name: name,
          email: email, // garantindo o email no doc também
          cpf: cpf,
          birthDate: birthDate,
          age: calculatedAge,
          nutricionista_id: nutriIdParam || null,
          objective: 'Melhorar alimentação',
          restrictions: 'Nenhuma registrada',
          status: 'ativo',
          streak: 0,
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
              initialData = { ...initialData, ...tempDocSnap.data(), name: name, email: email, cpf: cpf, birthDate: birthDate, age: calculatedAge, status: 'ativo' };
              // Deleta o temporário
              await deleteDoc(tempDocRef);
            }
          } catch(e) {
            console.warn("Falha ao mesclar dados do convite. Pode ser restrição de permissão se o e-mail for diferente.", e);
          }
        }

        await setDoc(doc(db, 'patients', user.uid), initialData);
      }

      // Garante que o profile seja lido agora, para evitar "race condition" com o onAuthStateChanged
      await fetchProfile(user.uid);

      // Redireciona com base na role escolhida
      if (role === 'nutricionista') {
        navigate('/nutri');
      } else {
        navigate('/paciente');
      }
      
    } catch (error) {
      setErrorMsg(getFirebaseErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };
  
  const handleDocumentChange = (e) => {
    let rawValue = e.target.value.replace(/\D/g, "");
    if (role !== 'nutricionista') {
      rawValue = rawValue.substring(0, 11);
    } else {
      rawValue = rawValue.substring(0, 14);
    }
    
    let v = rawValue;
    if (rawValue.length <= 11) {
      v = v.replace(/(\d{3})(\d)/, "$1.$2");
      v = v.replace(/(\d{3})(\d)/, "$1.$2");
      v = v.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    } else {
      v = v.replace(/^(\d{2})(\d)/, "$1.$2");
      v = v.replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3");
      v = v.replace(/\.(\d{3})(\d)/, ".$1/$2");
      v = v.replace(/(\d{4})(\d)/, "$1-$2");
    }
    setCpf(v);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc', padding: '20px' }}>
      <div style={{ width: '400px', padding: '40px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '8px', textAlign: 'center', color: '#0f172a' }}>Nutrivvo</h1>
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

          <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: '#334155' }}>{role === 'nutricionista' ? 'CPF / CNPJ' : 'CPF'}</label>
              <input 
                type="text" 
                required
                style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                value={cpf}
                onChange={handleDocumentChange}
                placeholder={role === 'nutricionista' ? 'CPF ou CNPJ' : '111.111.111-11'}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: '#334155' }}>Data Nasc.</label>
              <input 
                type="date" 
                required
                style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                value={birthDate}
                onChange={e => setBirthDate(e.target.value)}
              />
            </div>
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

          {role === 'nutricionista' && (
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: '#334155' }}>CRN</label>
              <input 
                type="text" 
                required
                style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                value={crn}
                onChange={e => setCrn(e.target.value)}
                placeholder="Ex: CRN-3 12345"
              />
            </div>
          )}

          <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: '#334155' }}>Senha</label>
              <input 
                type="password" 
                required
                style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Mínimo 6 char"
                minLength="6"
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: '#334155' }}>Confirmação</label>
              <input 
                type="password" 
                required
                style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Repita a senha"
                minLength="6"
              />
            </div>
          </div>

          {!nutriIdParam && !vincularId && (
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
                  🩺 Nutricionista
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
