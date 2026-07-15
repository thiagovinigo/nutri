import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, ShieldCheck } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={{margin: '0 0 8px 0', color: '#1e293b'}}>Vytal</h1>
        <p style={{margin: '0 0 32px 0', color: '#64748b', fontSize: '1.1rem'}}>Selecione o seu perfil de acesso</p>
        
        <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
          <button 
            className="btn-3d" 
            style={{...styles.btn, backgroundColor: '#3b82f6', boxShadow: '0 6px 0 #2563eb'}}
            onClick={() => navigate('/cadastro')}
          >
            <User size={28} />
            <div style={{textAlign: 'left'}}>
              <span style={{display: 'block', fontSize: '1.2rem'}}>Criar Conta Grátis</span>
              <span style={{fontSize: '0.85rem', fontWeight: 'normal'}}>Ganhe 1 consulta IA agora</span>
            </div>
          </button>
          
          <button 
            className="btn-3d" 
            style={{...styles.btn, backgroundColor: '#8b5cf6', boxShadow: '0 6px 0 #7c3aed'}}
            onClick={() => navigate('/login')}
          >
            <ShieldCheck size={28} />
            <div style={{textAlign: 'left'}}>
              <span style={{display: 'block', fontSize: '1.2rem'}}>Já tenho uma conta</span>
              <span style={{fontSize: '0.85rem', fontWeight: 'normal'}}>Fazer login na plataforma</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    height: '100vh',
    width: '100vw',
    backgroundColor: '#f8fafc',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    boxSizing: 'border-box'
  },
  card: {
    backgroundColor: '#ffffff',
    padding: '40px 32px',
    borderRadius: '24px',
    border: '3px solid #e2e8f0',
    boxShadow: '0 8px 0 #cbd5e1',
    textAlign: 'center',
    maxWidth: '400px',
    width: '100%'
  },
  btn: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    color: 'white',
    border: 'none',
    padding: '16px 20px',
    borderRadius: '16px',
    fontWeight: '800',
    cursor: 'pointer',
    transition: 'transform 0.1s, box-shadow 0.1s'
  }
};
