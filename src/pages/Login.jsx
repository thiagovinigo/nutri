import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth, db } from '../services/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

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
      setErrorMsg(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' }}>
      <div style={{ width: '400px', padding: '40px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '8px', textAlign: 'center', color: '#0f172a' }}>Vytal</h1>
        <p style={{ textAlign: 'center', color: '#64748b', marginBottom: '32px' }}>Faça login para acessar sua conta</p>
        
        {errorMsg && (
          <div style={{ padding: '12px', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '6px', marginBottom: '16px', fontSize: '0.9rem' }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: '#334155' }}>E-mail</label>
            <input 
              type="email" 
              required
              style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              value={email}
              onChange={e => setEmail(e.target.value)}
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
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            style={{ width: '100%', padding: '12px', backgroundColor: '#2563eb', color: 'white', borderRadius: '6px', border: 'none', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer' }}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
          
          <div style={{ marginTop: '24px', textAlign: 'center' }}>
            <span style={{ color: '#64748b' }}>Ainda não tem conta? </span>
            <Link to="/cadastro" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: 'bold' }}>Cadastre-se grátis</Link>
          </div>

          {import.meta.env.DEV && (
            <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #e2e8f0', textAlign: 'center' }}>
              <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '16px' }}>Ou teste as interfaces sem login (visível só em dev):</p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <button
                  type="button"
                  onClick={() => navigate('/nutri')}
                  style={{ padding: '8px 16px', backgroundColor: '#f1f5f9', color: '#334155', borderRadius: '6px', border: '1px solid #cbd5e1', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '500' }}
                >
                  Modo Nutricionista
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/paciente')}
                  style={{ padding: '8px 16px', backgroundColor: '#f1f5f9', color: '#334155', borderRadius: '6px', border: '1px solid #cbd5e1', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '500' }}
                >
                  Modo Paciente
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
