import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './clarix.css';
import { ClarixProvider } from './clarixStore';
import ClarixShell from './ClarixShell';
import ClarixLandingView from './views/ClarixLandingView';
import ClarixCrmView from './views/ClarixCrmView';
import ClarixPacienteView from './views/ClarixPacienteView';
import ClarixComponentsView from './views/ClarixComponentsView';

function resolveClarixMode(pathname, hash) {
  const path = (pathname || '').toLowerCase();
  const h = (hash || '').toLowerCase();
  if (path.startsWith('/clarix/componentes') || h === '#components') {
    return 'componentes';
  }
  if (path.startsWith('/clarix/crm')) {
    return 'crm';
  }
  if (path.startsWith('/clarix/paciente')) {
    return 'paciente';
  }
  return 'landing';
}

function ClarixRouter() {
  const location = useLocation();
  const navigate = useNavigate();
  const mode = resolveClarixMode(location.pathname, location.hash);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [location.pathname, location.hash]);

  useEffect(() => {
    let meta = document.querySelector('meta[name="robots"]');
    const created = !meta;
    const prevContent = meta ? meta.getAttribute('content') : null;
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'robots');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', 'noindex, nofollow');
    return () => {
      if (created) {
        meta.remove();
      } else if (prevContent === null) {
        meta.removeAttribute('content');
      } else {
        meta.setAttribute('content', prevContent);
      }
    };
  }, []);

  useEffect(() => {
    const onMessage = (e) => {
      if (e.origin !== window.location.origin) return;
      if (e.data?.type === 'nutrivvo-preview-nav' && typeof e.data.path === 'string') {
        navigate(e.data.path);
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [navigate]);

  const handleNavigate = (targetPath) => {
    navigate(targetPath);
  };

  return (
    <ClarixShell activeMode={mode} onNavigate={handleNavigate}>
      {mode === 'landing' && <ClarixLandingView onNavigate={handleNavigate} />}
      {mode === 'crm' && <ClarixCrmView onNavigate={handleNavigate} />}
      {mode === 'paciente' && <ClarixPacienteView onNavigate={handleNavigate} />}
      {mode === 'componentes' && <ClarixComponentsView onNavigate={handleNavigate} />}
    </ClarixShell>
  );
}

export default function ClarixPrototypeApp() {
  return (
    <ClarixProvider>
      <ClarixRouter />
    </ClarixProvider>
  );
}
