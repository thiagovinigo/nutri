import React from 'react';
import { Target } from 'lucide-react';
import PhotoLogger from './PhotoLogger';

export default function QuestBoard({ activePatient, activeTab }) {
  if (activeTab !== 'missoes') return null;

  return (
    <div className="animate-pop-in">
      <div style={styles.sectionHeader}>
        <h2 style={{color: 'white'}}>Suas Missões Hoje</h2>
        <p style={{color: 'rgba(255,255,255,0.8)'}}>Olá, {activePatient.name}. Mantenha sua ofensiva!</p>
      </div>

      <div style={styles.questCard}>
        <div style={styles.questIcon}><Target size={24} color="white" /></div>
        <div style={{flex: 1}}>
          <h4 style={{marginBottom: '4px'}}>Beber 2L de Água</h4>
          <div style={styles.progressBarBg}>
            <div style={{...styles.progressBarFill, width: '50%'}}></div>
          </div>
          <p style={{fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px'}}>1L / 2L</p>
        </div>
        <button className="btn-3d btn-primary" style={{padding: '8px 12px', fontSize: '0.9rem'}}>+250ml</button>
      </div>

      <PhotoLogger activePatient={activePatient} />
    </div>
  );
}

const styles = {
  sectionHeader: { backgroundColor: 'var(--primary-color)', color: 'white', padding: '24px 20px', borderRadius: '24px', marginBottom: '24px', boxShadow: '0 4px 0 var(--primary-shadow)' },
  questCard: { backgroundColor: 'white', border: '2px solid var(--gray-light)', borderRadius: '20px', padding: '16px', display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px', boxShadow: '0 4px 0 var(--gray-shadow)' },
  questIcon: { width: '48px', height: '48px', borderRadius: '16px', backgroundColor: 'var(--primary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  progressBarBg: { height: '12px', backgroundColor: 'var(--gray-light)', borderRadius: '6px', overflow: 'hidden', marginTop: '8px' },
  progressBarFill: { height: '100%', backgroundColor: '#1CB0F6', borderRadius: '6px' },
};
