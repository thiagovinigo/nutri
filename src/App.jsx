import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DashboardNutri from './features/nutricionista/pages/DashboardNutri';
import PatientApp from './features/paciente/pages/PatientApp';
import LandingPage from './pages/LandingPage';
import LandingPageOld from './pages/LandingPageOld';
import LandingPageWithRadar from './pages/LandingPageWithRadar';
import LandingPagePrototype from './pages/LandingPagePrototype';
import LandingSwissBentoLight from './pages/LandingSwissBentoLight';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import SignUp from './pages/SignUp';
import PublicBooking from './pages/PublicBooking';
import AdminDashboard from './features/admin/pages/AdminDashboard';
import { AppProvider, useAppContext } from './context/AppContext';
import { Toaster } from 'react-hot-toast';

// Em produção, exige sessão real. Em dev (vite dev), deixa passar sem login
// para permitir os atalhos "Modo Nutricionista/Paciente" usados em testes.
function RequireAuth({ children }) {
  const { session, isAuthLoading } = useAppContext();
  if (isAuthLoading) {
    return <div style={{height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a14'}}><span style={{color: '#fff'}}>Carregando...</span></div>;
  }
  if (!session && !import.meta.env.DEV) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function App() {
  return (
    <AppProvider>
      <Toaster position="top-right" />
      <BrowserRouter>
        <Routes>
          {/* Landing Page Oficial em Produção */}
          <Route path="/" element={<LandingPage />} />

          {/* Rota da Versão Antiga Salva (Backup) */}
          <Route path="/old" element={<LandingPageOld />} />
          <Route path="/landing-old" element={<LandingPageOld />} />

          {/* Rotas de Preview e Compatibilidade */}
          <Route path="/preview" element={<LandingPage />} />
          <Route path="/preview-final" element={<LandingPage />} />
          <Route path="/radar" element={<LandingPage />} />
          <Route path="/swiss-light" element={<LandingSwissBentoLight />} />

          {/* Rotas Auxiliares e Autenticação */}
          <Route path="/preview-landing" element={<LandingPagePrototype />} />
          <Route path="/landing-v2" element={<LandingPagePrototype />} />
          <Route path="/login" element={<Login />} />
          <Route path="/recuperar-senha" element={<ForgotPassword />} />
          <Route path="/cadastro" element={<SignUp />} />

          {/* Áreas do Sistema */}
          <Route path="/nutri" element={<RequireAuth><DashboardNutri /></RequireAuth>} />
          <Route path="/paciente" element={<PatientApp />} />
          <Route path="/agendar/:nutriId" element={<PublicBooking />} />
          <Route path="/admin" element={<RequireAuth><AdminDashboard /></RequireAuth>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
