import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DashboardNutri from './features/nutricionista/pages/DashboardNutri';
import PatientApp from './features/paciente/pages/PatientApp';
import LandingPage from './pages/LandingPage';
import LandingPagePrototype from './pages/LandingPagePrototype';
import LandingPreview1 from './pages/LandingPreview1';
import LandingPreview2 from './pages/LandingPreview2';
import LandingPreview3 from './pages/LandingPreview3';
import LandingPreview4 from './pages/LandingPreview4';
import LandingPreview5 from './pages/LandingPreview5';
import LandingPreview6 from './pages/LandingPreview6';
import LandingPreview7 from './pages/LandingPreview7';
import LandingPreview8 from './pages/LandingPreview8';
import LandingPreview9 from './pages/LandingPreview9';
import LandingPreview10 from './pages/LandingPreview10';
import PreviewsHub from './pages/PreviewsHub';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import SignUp from './pages/SignUp';
import PublicBooking from './pages/PublicBooking';
import AdminDashboard from './features/admin/pages/AdminDashboard';
import { AppProvider, useAppContext } from './context/AppContext';
import { Toaster } from 'react-hot-toast';

// Em produção, exige sessão real. Em dev (ite dev), deixa passar sem login
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
          <Route path="/" element={<LandingPage />} />
          <Route path="/previews" element={<PreviewsHub />} />
          <Route path="/preview" element={<PreviewsHub />} />
          <Route path="/preview1" element={<LandingPreview1 />} />
          <Route path="/preview2" element={<LandingPreview2 />} />
          <Route path="/preview3" element={<LandingPreview3 />} />
          <Route path="/preview4" element={<LandingPreview4 />} />
          <Route path="/preview5" element={<LandingPreview5 />} />
          <Route path="/preview6" element={<LandingPreview6 />} />
          <Route path="/preview7" element={<LandingPreview7 />} />
          <Route path="/preview8" element={<LandingPreview8 />} />
          <Route path="/preview9" element={<LandingPreview9 />} />
          <Route path="/preview10" element={<LandingPreview10 />} />
          <Route path="/preview-landing" element={<LandingPagePrototype />} />
          <Route path="/landing-v2" element={<LandingPagePrototype />} />
          <Route path="/login" element={<Login />} />
          <Route path="/recuperar-senha" element={<ForgotPassword />} />
          <Route path="/cadastro" element={<SignUp />} />
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
