import React from 'react';
import { Utensils } from 'lucide-react';

export default function DietPlan({ activePatient }) {
  return (
    <div className="animate-pop-in">
      <h2 style={styles.sectionTitle}><Utensils color="#3b82f6" /> Prescrição Completa</h2>
      
      {activePatient.recipes.length === 0 ? (
        <p style={{color: '#64748b'}}>Nenhum plano alimentar recebido ainda.</p>
      ) : (
        <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
          {activePatient.recipes.slice().reverse().map((r, idx) => (
            <div key={idx} style={{...styles.card, flexDirection: 'column', alignItems: 'stretch'}}>
              <strong style={{fontSize: '1.2rem', marginBottom: '16px', display: 'block'}}>{r.title}</strong>
              
              {r.meals?.map((m, mIdx) => (
                <div key={mIdx} style={{marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px dashed #e2e8f0'}}>
                  <strong style={{color: '#3b82f6'}}>{m.name}</strong>
                  <p style={{margin: '4px 0 0 0', fontSize: '0.95rem', color: '#334155'}}>{m.desc}</p>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      <h2 style={{...styles.sectionTitle, marginTop: '32px'}}><Utensils color="#f59e0b" /> Histórico de Refeições (IA)</h2>
      {(!activePatient.foodLogs || activePatient.foodLogs.length === 0) ? (
        <p style={{color: '#64748b'}}>Nenhuma refeição enviada para análise ainda.</p>
      ) : (
        <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
          {activePatient.foodLogs.slice().reverse().map((log, idx) => (
            <div key={idx} style={{...styles.card, flexDirection: 'column', alignItems: 'stretch', borderColor: log.type === 'extra' ? '#f59e0b' : '#3b82f6'}}>
              <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '8px'}}>
                <strong style={{color: '#1e293b'}}>{log.mealName}</strong>
                <span style={{fontSize: '0.85rem', color: '#64748b'}}>{log.date} às {log.time}</span>
              </div>
              <p style={{margin: '0', fontSize: '0.95rem', color: '#334155', whiteSpace: 'pre-wrap'}}>{log.log}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  sectionTitle: { fontSize: '1.2rem', fontWeight: '800', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: '#1e293b' },
  card: { backgroundColor: '#ffffff', borderRadius: '20px', padding: '20px', border: '2px solid #e2e8f0', boxShadow: '0 4px 0 #cbd5e1', marginBottom: '16px', display: 'flex' }
};
