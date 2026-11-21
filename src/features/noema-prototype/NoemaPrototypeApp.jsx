import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './noema.css';
import { NoemaProvider } from './noemaStore';
import NoemaShell from './NoemaShell';
import NoemaLandingView from './views/NoemaLandingView';
import NoemaCrmView from './views/NoemaCrmView';
import NoemaPacienteView from './views/NoemaPacienteView';
import NoemaComponentsView from './views/NoemaComponentsView';

function resolveNoemaMode(pathname, hash) {
  const path = (pathname || '').toLowerCase();
  const h = (hash || '').toLowerCase();
  if (path.startsWith('/noema/componentes') || h === '#components') {
    return 'componentes';
  }
  if (path.startsWith('/noema/crm')) {
    return 'crm';
  }
  if (path.startsWith('/noema/paciente')) {
    return 'paciente';
  }
  return 'landing';
}

function NoemaPrototypeRouter() {
  const location = useLocation();
  const navigate = useNavigate();
  const mode = resolveNoemaMode(location.pathname, location.hash);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [location.pathname, location.hash]);

  const handleNavigate = (targetPath) => {
    navigate(targetPath);
  };

  return (
    <NoemaShell activeMode={mode} onNavigate={handleNavigate}>
      {mode === 'landing' && <NoemaLandingView onNavigate={handleNavigate} />}
      {mode === 'crm' && <NoemaCrmView onNavigate={handleNavigate} />}
      {mode === 'paciente' && <NoemaPacienteView onNavigate={handleNavigate} />}
      {mode === 'componentes' && <NoemaComponentsView onNavigate={handleNavigate} />}
    </NoemaShell>
  );
}

export default function NoemaPrototypeApp() {
  return (
    <NoemaProvider>
      <NoemaPrototypeRouter />
    </NoemaProvider>
  );
}
