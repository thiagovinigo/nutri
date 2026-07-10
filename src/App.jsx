import React, { useState } from 'react';
import DashboardNutri from './pages/DashboardNutri';
import PatientApp from './pages/PatientApp';
import { ArrowRightLeft } from 'lucide-react';
import { AppProvider, useAppContext } from './context/AppContext';

function MainLayout() {
  const [role, setRole] = useState('patient'); // 'patient' or 'nutri'
  const { patients, activePatientId, setActivePatientId } = useAppContext();

  return (
    <div style={{ height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column' }}>
      {/* Dev Toggle Bar */}
      <div style={{
        background: '#333', color: 'white', padding: '12px 16px', display: 'flex', 
        justifyContent: 'space-between', alignItems: 'center', zIndex: 1000, flexShrink: 0
      }}>
        <div style={{display: 'flex', alignItems: 'center', gap: '16px'}}>
          <strong style={{ letterSpacing: '1px' }}>EloNutri <span style={{fontWeight: 'normal', opacity: 0.7}}>MVP</span></strong>
          
          <select 
            value={activePatientId} 
            onChange={(e) => setActivePatientId(parseInt(e.target.value))}
            style={{padding: '4px', borderRadius: '4px', background: '#555', color: 'white', border: 'none'}}
          >
            {patients.map(p => (
              <option key={p.id} value={p.id}>Simulando Paciente: {p.name}</option>
            ))}
          </select>
        </div>

        <button 
          onClick={() => setRole(role === 'patient' ? 'nutri' : 'patient')}
          style={{
            background: 'var(--primary-color)', border: 'none', color: 'white', 
            padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
            fontWeight: 'bold'
          }}
        >
          <ArrowRightLeft size={16} />
          Trocar para Visão {role === 'patient' ? 'Nutricionista' : 'Paciente'}
        </button>
      </div>

      <div style={{ flex: 1, overflow: 'hidden' }}>
        {role === 'patient' ? <PatientApp /> : <DashboardNutri />}
      </div>
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}

export default App;
