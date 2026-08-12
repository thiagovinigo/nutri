import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth, db } from '../services/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc, deleteDoc, collection, query, where, getDocs, updateDoc } from 'firebase/firestore';
import { getFirebaseErrorMessage } from '../utils/firebaseErrors';
import { useAppContext } from '../context/AppContext';

const NLogo = () => (
  <svg width="40" height="40" viewBox="0 0 48 48" fill="none">
    <defs>
      <linearGradient id="loginNGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#c084fc" />
        <stop offset="1" stopColor="#6366f1" />
      </linearGradient>
    </defs>
    <rect x="0" y="0" width="9" height="40" rx="3" fill="url(#loginNGrad)" />
    <rect x="39" y="0" width="9" height="40" rx="3" fill="url(#loginNGrad)" />
    <polygon points="9,2 22,2 48,38 35,38" fill="url(#loginNGrad)" />
  </svg>
);

const darkInputStyle = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: '10px',
  border: '1px solid rgba(255,255,255,0.12)',
  backgroundColor: 'rgba(255,255,255,0.05)',
  color: '#f1f5f9',
  fontSize: '0.95rem',
  outline: 'none',
};

const darkLabelStyle = {
  display: 'block',
  marginBottom: '6px',
  fontWeight: '500',
  color: '#cbd5e1',
  fontSize: '0.9rem',
};

export default function Login() {
  const { patients, bypassLoginAsPatient, setBypassNutriData } = useAppContext();

  const handleBypassNutriDemo = () => {
    const mockPatients = [
      { id: 'demo_1', name: 'Ana Beatriz Souza', objective: 'Emagrecimento', status: 'engajado', streak: 12, xp: 480, financialPlanId: 'plano_mensal' },
      { id: 'demo_2', name: 'Carlos Eduardo Lima', objective: 'Hipertrofia', status: 'engajado', streak: 5, xp: 220, financialPlanId: 'plano_trimestral' },
      { id: 'demo_3', name: 'Juliana Ferreira', objective: 'Performance esportiva', status: 'ativo', streak: 1, xp: 40, financialPlanId: 'plano_avulso' },
      { id: 'demo_4', name: 'Rodrigo Martins', objective: 'Manutenção de saúde', status: 'ativo', streak: 0, xp: 90, financialPlanId: 'plano_mensal' },
    ];
    const todayISO = new Date().toISOString().split('T')[0];
    const mockAppointments = [
      { id: 'demo_appt_1', patientId: 'demo_1', date: todayISO, time: '14:00', type: 'Retorno', status: 'agendado' },
      { id: 'demo_appt_2', patientId: 'demo_2', date: todayISO, time: '16:30', type: 'Primeira Consulta', status: 'agendado' },
      { id: 'demo_appt_3', patientId: 'demo_3', date: todayISO, time: '10:00', type: 'Retorno', status: 'concluido' },
    ];
    setBypassNutriData(mockPatients, mockAppointments);
    navigate('/nutri');
  };
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(window.location.search);
  const nutriIdParam = searchParams.get('nutri');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    if (!auth || !db) {
      setErrorMsg('Firebase não está configurado. Preencha o arquivo .env!');
      setLoading(false);
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Checar se o perfil é nutricionista ou paciente no Firestore
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const profile = docSnap.data();

        const vincularId = searchParams.get('vincular');

        if (vincularId && profile.role !== 'nutricionista') {
          try {
            const tempDocRef = doc(db, 'patients', vincularId);
            const tempDocSnap = await getDoc(tempDocRef);
            if (tempDocSnap.exists()) {
              const tempData = tempDocSnap.data();
              // Mescla o nutricionista_id e atualiza o records
              await setDoc(doc(db, 'patients', user.uid), {
                nutricionista_id: tempData.nutricionista_id || nutriIdParam,
                records: 'Vinculado ao nutricionista após login.',
                status: 'ativo'
              }, { merge: true });

              // Migrar agendamentos do ID temporário para o UID real do paciente
              try {
                const apptsQuery = query(collection(db, 'appointments'), where('patientId', '==', vincularId));
                const apptsSnap = await getDocs(apptsQuery);
                await Promise.all(apptsSnap.docs.map(d => updateDoc(doc(db, 'appointments', d.id), { patientId: user.uid })));
              } catch (apptError) {
                console.warn('Falha ao migrar agendamentos no login.', apptError);
              }

              // Deletar o registro temporário criado pelo nutri
              await deleteDoc(tempDocRef);
            }
          } catch(e) {
            console.warn("Falha ao mesclar dados do convite no login.", e);
          }
        } else if (nutriIdParam && profile.role !== 'nutricionista') {
          await setDoc(doc(db, 'patients', user.uid), {
            nutricionista_id: nutriIdParam,
            records: 'Vinculado ao nutricionista via convite de login.'
          }, { merge: true });
        }

        if (profile.role === 'nutricionista') {
          navigate('/nutri');
        } else {
          navigate('/paciente');
        }
      } else {
        // Se não houver role salva, redireciona por padrão para nutri
        navigate('/nutri');
      }

    } catch (error) {
      setErrorMsg(getFirebaseErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center',
      backgroundColor: '#0a0a14', position: 'relative', overflow: 'hidden'
    }}>
      {/* Glow roxo de fundo */}
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
        <p style={{ textAlign: 'center', color: '#94a3b8', marginBottom: '32px' }}>Faça login para acessar sua conta</p>

        {errorMsg && (
          <div style={{ padding: '12px', backgroundColor: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5', borderRadius: '10px', marginBottom: '16px', fontSize: '0.9rem' }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '16px' }}>
            <label style={darkLabelStyle}>E-mail</label>
            <input
              type="email"
              required
              style={darkInputStyle}
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <label style={{ ...darkLabelStyle, marginBottom: 0 }}>Senha</label>
              <Link to={`/recuperar-senha?${searchParams.toString()}`} style={{ color: '#c084fc', textDecoration: 'none', fontSize: '0.85rem' }}>Esqueceu a senha?</Link>
            </div>
            <input
              type="password"
              required
              style={darkInputStyle}
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '13px', color: 'white', borderRadius: '10px', border: 'none',
              fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '0.95rem',
              background: 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)',
              boxShadow: '0 8px 20px -6px rgba(168,85,247,0.5)',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>

          <div style={{ marginTop: '24px', textAlign: 'center' }}>
            <span style={{ color: '#94a3b8' }}>Ainda não tem conta? </span>
            <Link to={`/cadastro?${searchParams.toString()}`} style={{ color: '#c084fc', textDecoration: 'none', fontWeight: 'bold' }}>Cadastre-se grátis</Link>
          </div>

          {import.meta.env.DEV && (
            <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.08)', textAlign: 'center' }}>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '16px' }}>Ou teste as interfaces sem login (visível só em dev):</p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => navigate('/nutri')}
                  style={{ padding: '8px 16px', backgroundColor: 'rgba(255,255,255,0.06)', color: '#cbd5e1', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.12)', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '500' }}
                >
                  Modo Nutricionista
                </button>
                <button
                  type="button"
                  onClick={handleBypassNutriDemo}
                  style={{ padding: '8px 16px', backgroundColor: 'rgba(34,197,94,0.15)', color: '#86efac', borderRadius: '8px', border: '1px solid rgba(34,197,94,0.3)', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 'bold' }}
                >
                  BYPASS CRM COM DADO FAKE (DEV)
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/paciente')}
                  style={{ padding: '8px 16px', backgroundColor: 'rgba(255,255,255,0.06)', color: '#cbd5e1', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.12)', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '500' }}
                >
                  Modo Paciente
                </button>
                {patients.find(p => p.name && p.name.toLowerCase().includes('lucas')) && (
                  <button
                    type="button"
                    onClick={() => {
                      const lucas = patients.find(p => p.name && p.name.toLowerCase().includes('lucas'));
                      bypassLoginAsPatient(lucas);
                      navigate('/paciente');
                    }}
                    style={{ padding: '8px 16px', backgroundColor: 'rgba(34,197,94,0.15)', color: '#86efac', borderRadius: '8px', border: '1px solid rgba(34,197,94,0.3)', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 'bold' }}
                  >
                    BYPASS MODO TESTE (DEV)
                  </button>
                )}
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
