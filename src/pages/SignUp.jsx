import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth, db } from '../services/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc, deleteDoc, collection, query, where, getDocs, updateDoc } from 'firebase/firestore';
import { getFirebaseErrorMessage } from '../utils/firebaseErrors';
import { useAppContext } from '../context/AppContext';

const NLogo = () => (
  <svg width="40" height="40" viewBox="0 0 48 48" fill="none">
    <defs>
      <linearGradient id="signupNGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#c084fc" />
        <stop offset="1" stopColor="#6366f1" />
      </linearGradient>
    </defs>
    <rect x="0" y="0" width="9" height="40" rx="3" fill="url(#signupNGrad)" />
    <rect x="39" y="0" width="9" height="40" rx="3" fill="url(#signupNGrad)" />
    <polygon points="9,2 22,2 48,38 35,38" fill="url(#signupNGrad)" />
  </svg>
);

const darkInputStyle = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: '10px',
  border: '1px solid rgba(255,255,255,0.12)',
  backgroundColor: 'rgba(255,255,255,0.05)',
  color: '#f1f5f9',
};

const darkLabelStyle = {
  display: 'block',
  marginBottom: '6px',
  fontWeight: '500',
  color: '#cbd5e1',
};

export default function SignUp() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [phone, setPhone] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [crn, setCrn] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLinked, setIsLinked] = useState(false);
  const [loadingInvite, setLoadingInvite] = useState(false);
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
      setLoadingInvite(true);
      const tempDocRef = doc(db, 'patients', vincularId);
      getDoc(tempDocRef).then(snap => {
        if (snap.exists()) {
          const data = snap.data();
          if (data.name) setName(data.name);
          if (data.email) setEmail(data.email);
          if (data.cpf) setCpf(data.cpf);
          if (data.phone) setPhone(data.phone);
          if (data.birthDate) setBirthDate(data.birthDate);
        }
      }).catch(e => console.warn('Erro ao carregar dados do link direto', e))
        .finally(() => setLoadingInvite(false));
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
        phone: phone || '11999999999',
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
          phone: phone || '11999999999',
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
              initialData = { ...initialData, ...tempDocSnap.data(), name: name, email: email, cpf: cpf, phone: phone || tempDocSnap.data().phone || '11999999999', birthDate: birthDate, age: calculatedAge, status: 'ativo' };

              // O paciente pode já ter consultas agendadas pelo nutricionista
              // antes de terminar o cadastro (fluxo comum: cadastra -> já
              // agenda -> manda o link). Essas consultas referenciam o ID
              // temporário (vincularId) — sem essa migração, elas ficam órfãs
              // assim que o doc temporário é deletado abaixo, porque o
              // paciente passa a existir só sob o UID do Firebase Auth.
              try {
                const apptsQuery = query(collection(db, 'appointments'), where('patientId', '==', vincularId));
                const apptsSnap = await getDocs(apptsQuery);
                await Promise.all(apptsSnap.docs.map(d => updateDoc(doc(db, 'appointments', d.id), { patientId: user.uid })));
              } catch (apptError) {
                console.warn('Falha ao migrar agendamentos do convite para o novo ID do paciente.', apptError);
              }

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
    <div style={{ display: 'flex', minHeight: '100vh', justifyContent: 'center', alignItems: 'center', backgroundColor: '#0a0a14', padding: '20px', position: 'relative', overflow: 'hidden' }}>
      <div style={{
        position: 'absolute', top: '50%', left: '50%', width: '700px', height: '700px',
        transform: 'translate(-50%, -50%)', pointerEvents: 'none',
        background: 'radial-gradient(circle, rgba(168,85,247,0.35) 0%, rgba(99,102,241,0.15) 45%, transparent 70%)',
        filter: 'blur(10px)'
      }} />
      <div style={{
        width: '400px', padding: '40px', position: 'relative', zIndex: 1,
        backgroundColor: 'rgba(20, 20, 32, 0.75)', backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px',
        boxShadow: '0 25px 60px -15px rgba(0,0,0,0.6)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
          <NLogo />
        </div>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '8px', textAlign: 'center', color: '#f8fafc' }}>Nutrivvo</h1>
        <p style={{ textAlign: 'center', color: '#94a3b8', marginBottom: '32px' }}>Crie sua conta gratuitamente</p>

        {errorMsg && (
          <div style={{ padding: '12px', backgroundColor: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5', borderRadius: '10px', marginBottom: '16px', fontSize: '0.9rem' }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSignUp}>
          {isLinked ? (
            <div style={{ marginBottom: '24px', padding: '16px', borderRadius: '12px', backgroundColor: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.25)' }}>
              <p style={{ margin: '0 0 10px 0', color: '#94a3b8', fontSize: '0.82rem' }}>Dados enviados pelo seu nutricionista — confirme e crie sua senha:</p>
              {loadingInvite ? (
                <p style={{ margin: 0, color: '#cbd5e1', fontSize: '0.9rem' }}>Carregando seus dados...</p>
              ) : (
                <>
                  <div style={{ color: '#f8fafc', fontWeight: 'bold', fontSize: '1.05rem' }}>{name || '—'}</div>
                  <div style={{ color: '#cbd5e1', fontSize: '0.9rem', marginTop: '4px' }}>{email || '—'}</div>
                  <div style={{ color: '#cbd5e1', fontSize: '0.9rem' }}>{cpf || '—'}{phone ? ` · ${phone}` : ''}</div>
                  {birthDate && (
                    <div style={{ color: '#cbd5e1', fontSize: '0.9rem' }}>{new Date(birthDate + 'T00:00:00').toLocaleDateString('pt-BR')}</div>
                  )}
                </>
              )}
            </div>
          ) : (
            <>
              <div style={{ marginBottom: '16px' }}>
                <label style={darkLabelStyle}>Nome Completo</label>
                <input
                  type="text"
                  required
                  style={darkInputStyle}
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="João da Silva"
                />
              </div>

              <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={darkLabelStyle}>{role === 'nutricionista' ? 'CPF / CNPJ' : 'CPF'}</label>
                  <input
                    type="text"
                    required
                    style={darkInputStyle}
                    value={cpf}
                    onChange={handleDocumentChange}
                    placeholder={role === 'nutricionista' ? 'CPF ou CNPJ' : '111.111.111-11'}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={darkLabelStyle}>Data Nasc.</label>
                  <input
                    type="date"
                    required
                    style={darkInputStyle}
                    value={birthDate}
                    onChange={e => setBirthDate(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={darkLabelStyle}>E-mail</label>
                <input
                  type="email"
                  required
                  style={darkInputStyle}
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="joao@email.com"
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={darkLabelStyle}>Telefone (WhatsApp)</label>
                <input
                  type="tel"
                  required
                  style={darkInputStyle}
                  value={phone}
                  onChange={e => {
                    let v = e.target.value.replace(/\D/g, '');
                    if (v.length > 11) v = v.slice(0, 11);
                    v = v.replace(/^(\d{2})(\d)/, '($1) $2');
                    v = v.replace(/(\d{5})(\d{4})$/, '$1-$2');
                    setPhone(v);
                  }}
                  placeholder="(11) 99999-9999"
                />
              </div>
            </>
          )}

          {role === 'nutricionista' && (
            <div style={{ marginBottom: '16px' }}>
              <label style={darkLabelStyle}>CRN</label>
              <input 
                type="text" 
                required
                style={darkInputStyle}
                value={crn}
                onChange={e => setCrn(e.target.value)}
                placeholder="Ex: CRN-3 12345"
              />
            </div>
          )}

          <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
            <div style={{ flex: 1 }}>
              <label style={darkLabelStyle}>Senha</label>
              <input 
                type="password" 
                required
                style={darkInputStyle}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Mínimo 6 char"
                minLength="6"
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={darkLabelStyle}>Confirmação</label>
              <input 
                type="password" 
                required
                style={darkInputStyle}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Repita a senha"
                minLength="6"
              />
            </div>
          </div>

          {!nutriIdParam && !vincularId && (
            <div style={{ marginBottom: '32px' }}>
              <label style={{ display: 'block', marginBottom: '12px', fontWeight: '500', color: '#cbd5e1' }}>Eu sou...</label>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div
                  onClick={() => setRole('paciente')}
                  style={{
                    flex: 1, padding: '12px 6px', textAlign: 'center', borderRadius: '10px', cursor: 'pointer', border: '2px solid',
                    borderColor: role === 'paciente' ? '#a855f7' : 'rgba(255,255,255,0.12)',
                    backgroundColor: role === 'paciente' ? 'rgba(168,85,247,0.15)' : 'rgba(255,255,255,0.03)',
                    color: role === 'paciente' ? '#e9d5ff' : '#94a3b8',
                    fontWeight: role === 'paciente' ? 'bold' : 'normal',
                    fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                  }}
                >
                  🥗 Paciente
                </div>
                <div
                  onClick={() => setRole('nutricionista')}
                  style={{
                    flex: 1, padding: '12px 6px', textAlign: 'center', borderRadius: '10px', cursor: 'pointer', border: '2px solid',
                    borderColor: role === 'nutricionista' ? '#a855f7' : 'rgba(255,255,255,0.12)',
                    backgroundColor: role === 'nutricionista' ? 'rgba(168,85,247,0.15)' : 'rgba(255,255,255,0.03)',
                    color: role === 'nutricionista' ? '#e9d5ff' : '#94a3b8',
                    fontWeight: role === 'nutricionista' ? 'bold' : 'normal',
                    fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                  }}
                >
                  🩺 Nutricionista
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || loadingInvite}
            style={{
              width: '100%', padding: '14px', color: 'white', borderRadius: '10px', border: 'none',
              fontWeight: 'bold', cursor: (loading || loadingInvite) ? 'not-allowed' : 'pointer', fontSize: '1rem',
              background: 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)',
              boxShadow: '0 8px 20px -6px rgba(168,85,247,0.5)',
              opacity: (loading || loadingInvite) ? 0.7 : 1,
            }}
          >
            {loading ? 'Criando Conta...' : (role === 'paciente' ? 'Criar e Ganhar 1 Consulta Grátis' : 'Criar Conta de Especialista')}
          </button>

          <div style={{ marginTop: '24px', textAlign: 'center' }}>
            <span style={{ color: '#94a3b8' }}>Já tem uma conta? </span>
            <Link to={nutriIdParam ? `/login?nutri=${nutriIdParam}` : "/login"} style={{ color: '#c084fc', textDecoration: 'none', fontWeight: 'bold' }}>Faça login aqui</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
