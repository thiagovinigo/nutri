import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DashboardNutri from './features/nutricionista/pages/DashboardNutri';
import PatientApp from './features/paciente/pages/PatientApp';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import { AppProvider, useAppContext } from './context/AppContext';

// Em produção, exige sessão real. Em dev (ite dev), deixa passar sem login
// para permitir os atalhos "Modo Nutricionista/Paciente" usados em testes.
function RequireAuth({ children }) {
  const { session } = useAppContext();
  if (!session && !import.meta.env.DEV) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

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
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
