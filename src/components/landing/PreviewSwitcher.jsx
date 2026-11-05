import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Layout } from 'lucide-react';
import '../../landing-previews.css';

export default function PreviewSwitcher({ current }) {
  const navigate = useNavigate();

  const layouts = [
    { id: 'p1', path: '/preview1', label: '1. Bento Spotlight' },
    { id: 'p2', path: '/preview2', label: '2. Split 50/50' },
    { id: 'p3', path: '/preview3', label: '3. Timeline Journey' },
    { id: 'p4', path: '/preview4', label: '4. Chat-First Flow' },
    { id: 'p5', path: '/preview5', label: '5. Dev Terminal CLI' },
    { id: 'p6', path: '/preview6', label: '6. Clean Light Medical' },
    { id: 'p7', path: '/preview7', label: '7. Tabbed OS Desktop' },
    { id: 'p8', path: '/preview8', label: '8. Gamified Arcade' },
    { id: 'p9', path: '/preview9', label: '9. Battlecard Matrix' },
    { id: 'p10', path: '/preview10', label: '10. Calculadora ROI' },
    { id: 'p11', path: '/preview11', label: '11. Cinema Mockup 3D' },
    { id: 'p12', path: '/preview12', label: '12. Social Evidence Wall' },
    { id: 'p13', path: '/preview13', label: '13. Swiss Brutalism' },
    { id: 'p14', path: '/preview14', label: '14. Spatial Glassmorphism' },
    { id: 'p15', path: '/preview15', label: '15. Master Ultimate' },
    { id: 'p16', path: '/preview16', label: '16. Cmd+K Bar' },
    { id: 'p17', path: '/preview17', label: '17. Before/After Slider' },
    { id: 'p18', path: '/preview18', label: '18. Onboarding Wizard' },
    { id: 'p19', path: '/preview19', label: '19. Live Sparklines' },
    { id: 'p20', path: '/preview20', label: '20. 3D Stack Cards' }
  ];

  return (
    <div className="preview-nav-bar">
      <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#06b6d4', textTransform: 'uppercase', marginRight: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
        <Eye size={12} /> 20 Layouts 21st.dev:
      </span>

      {layouts.map(l => (
        <button
          key={l.id}
          className={`preview-nav-pill ${current === l.id ? 'active' : ''}`}
          onClick={() => navigate(l.path)}
        >
          {l.label}
        </button>
      ))}

      <span style={{ color: 'rgba(255,255,255,0.2)' }}>|</span>

      <button
        className="preview-nav-pill"
        style={{ color: '#c084fc', borderColor: 'rgba(168,85,247,0.4)', background: 'rgba(168,85,247,0.15)' }}
        onClick={() => navigate('/previews')}
        title="Abrir Galeria com os 20 Layouts"
      >
        📋 Galeria 20 Telas
      </button>

      <button
        className="preview-nav-pill"
        style={{ color: '#94a3b8' }}
        onClick={() => navigate('/')}
        title="Ir para a Landing Page Original"
      >
        <Layout size={12} style={{ display: 'inline', marginRight: '4px' }} /> Original
      </button>
    </div>
  );
}
