import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth } from '../services/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import { getFirebaseErrorMessage } from '../utils/firebaseErrors';

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

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const navigate = useNavigate();

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    if (!auth) {
      setErrorMsg('Firebase não está configurado.');
      setLoading(false);
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      setSuccessMsg('E-mail de recuperação enviado! Verifique sua caixa de entrada (e spam) para redefinir a senha.');
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
        <p style={{ textAlign: 'center', color: '#94a3b8', marginBottom: '32px' }}>Recuperação de Conta</p>

        {errorMsg && (
          <div style={{ padding: '12px', backgroundColor: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5', borderRadius: '10px', marginBottom: '16px', fontSize: '0.9rem' }}>
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div style={{ padding: '12px', backgroundColor: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)', color: '#86efac', borderRadius: '10px', marginBottom: '16px', fontSize: '0.9rem' }}>
            {successMsg}
          </div>
        )}

        {!successMsg ? (
          <form onSubmit={handleResetPassword}>
            <div style={{ marginBottom: '24px' }}>
              <label style={darkLabelStyle}>E-mail cadastrado</label>
              <input
                type="email"
                required
                style={darkInputStyle}
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="seuemail@exemplo.com"
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
              {loading ? 'Enviando...' : 'Receber link por e-mail'}
            </button>
          </form>
        ) : (
          <button
            onClick={() => navigate('/login')}
            style={{
              width: '100%', padding: '13px', color: 'white', borderRadius: '10px', border: 'none',
              fontWeight: 'bold', cursor: 'pointer', fontSize: '0.95rem',
              background: 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)',
              boxShadow: '0 8px 20px -6px rgba(168,85,247,0.5)',
            }}
          >
            Voltar para o Login
          </button>
        )}

        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <Link to="/login" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.9rem' }}>
            ← Voltar
          </Link>
        </div>
      </div>
    </div>
  );
}
