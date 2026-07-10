import React, { useState } from 'react';
import { Target, Activity } from 'lucide-react';
import TopBar from '../../../components/layout/TopBar';
import { useAppContext } from '../../../context/AppContext';
import QuestBoard from '../components/QuestBoard';
import DietPlan from '../components/DietPlan';

export default function PatientApp() {
  const { patients, activePatientId } = useAppContext();
  const activePatient = patients.find(p => p.id === activePatientId) || patients[0];
  const [activeTab, setActiveTab] = useState('missoes'); 

  return (
    <div style={styles.appContainer}>
      <TopBar hearts={5} streak={activePatient.streak} gems={activePatient.xp} />

      <div style={styles.content}>
        <QuestBoard activePatient={activePatient} activeTab={activeTab} />
        <DietPlan activePatient={activePatient} activeTab={activeTab} />
      </div>

      <div style={styles.bottomNav}>
        <div onClick={() => setActiveTab('missoes')} style={{...styles.navItem, color: activeTab === 'missoes' ? 'var(--primary-color)' : 'var(--text-muted)'}}>
          <Target size={28} /> Missões
        </div>
        <div onClick={() => setActiveTab('meu_plano')} style={{...styles.navItem, color: activeTab === 'meu_plano' ? 'var(--primary-color)' : 'var(--text-muted)'}}>
          <Activity size={28} /> Plano
        </div>
      </div>
    </div>
  );
}

const styles = {
  appContainer: {
    display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#fcfcfc',
    maxWidth: '500px', margin: '0 auto', borderLeft: '2px solid var(--gray-light)', borderRight: '2px solid var(--gray-light)', position: 'relative'
  },
  content: { flex: 1, overflowY: 'auto', padding: '20px', paddingBottom: '100px' },
  bottomNav: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'white', display: 'flex', justifyContent: 'space-around', padding: '16px', borderTop: '2px solid var(--gray-light)', borderTopLeftRadius: '24px', borderTopRightRadius: '24px' },
  navItem: { display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: '0.8rem', fontWeight: 'bold', gap: '4px', cursor: 'pointer', transition: 'color 0.2s' },
};
