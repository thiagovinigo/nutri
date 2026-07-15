import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import DashboardNutri from './features/nutricionista/pages/DashboardNutri';
import PatientApp from './features/paciente/pages/PatientApp';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import { AppProvider, useAppContext } from './context/AppContext';

// Em produção, exige sessão real. Em dev (`vite dev`), deixa passar sem login
// para permitir os atalhos "Modo Nutricionista/Paciente" usados em testes.
function RequireAuth({ children }) {
  const { session } = useAppContext();
  if (!session && !import.meta.env.DEV) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

const FeedbackButton = () => {
  const location = useLocation();
  if (location.pathname === '/' || location.pathname === '/login') return null;

  // No /paciente existe uma barra de navegação fixa na parte inferior — o botão
  // sobe para não ficar em cima dela (antes cobria por completo a aba "Perfil").
  const bottomOffset = location.pathname === '/paciente' ? 'calc(env(safe-area-inset-bottom, 0px) + 84px)' : '20px';

  return (
    <a
      href="mailto:suporte@vytal.com?subject=Feedback/Bug Report"
      style={{
        position: 'fixed', bottom: bottomOffset, right: '20px', zIndex: 9999,
        backgroundColor: '#f59e0b', color: 'white', padding: '12px 24px',
        borderRadius: '50px', textDecoration: 'none', fontWeight: 'bold',
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', display: 'flex', alignItems: 'center', gap: '8px'
      }}
    >
      <span>💬 Sugestões/Bugs</span>
    </a>
  );
};

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={<SignUp />} />
          <Route path="/nutri" element={<RequireAuth><DashboardNutri /></RequireAuth>} />
          <Route path="/paciente" element={<PatientApp />} />
        </Routes>
        <FeedbackButton />
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
