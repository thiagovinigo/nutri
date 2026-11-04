import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Layout } from 'lucide-react';
import '../../landing-previews.css';

export default function PreviewSwitcher({ current }) {
  const navigate = useNavigate();

  const elements = [
    { id: 'p1', path: '/preview1', label: '1. Radar de Abandono' },
    { id: 'p2', path: '/preview2', label: '2. Secretária Telegram' },
    { id: 'p3', path: '/preview3', label: '3. Scanner de Prato IA' },
    { id: 'p4', path: '/preview4', label: '4. Gamificação & XP' },
    { id: 'p5', path: '/preview5', label: '5. Gerador de Dietas' },
    { id: 'p6', path: '/preview6', label: '6. Ficha de Treino IA' },
    { id: 'p7', path: '/preview7', label: '7. Análise de Exames' },
    { id: 'p8', path: '/preview8', label: '8. Gestão Financeira' },
    { id: 'p9', path: '/preview9', label: '9. Prontuário & Fotos' },
    { id: 'p10', path: '/preview10', label: '10. Hub Central Integrado' }
  ];

  return (
    <div className="preview-nav-bar">
      <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#06b6d4', textTransform: 'uppercase', marginRight: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
        <Eye size={12} /> Recursos do App:
      </span>

      {elements.map(el => (
        <button
          key={el.id}
          className={`preview-nav-pill ${current === el.id ? 'active' : ''}`}
          onClick={() => navigate(el.path)}
        >
          {el.label}
        </button>
      ))}

      <span style={{ color: 'rgba(255,255,255,0.2)' }}>|</span>

      <button
        className="preview-nav-pill"
        style={{ color: '#c084fc', borderColor: 'rgba(168,85,247,0.4)', background: 'rgba(168,85,247,0.15)' }}
        onClick={() => navigate('/previews')}
        title="Abrir Galeria com os 10 Previews"
      >
        📋 Ver Todos os 10
      </button>

      <button
        className="preview-nav-pill"
        style={{ color: '#cbd5e1' }}
        onClick={() => navigate('/')}
        title="Voltar para a Landing Original"
      >
        <Layout size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
        Original
      </button>
    </div>
  );
}
