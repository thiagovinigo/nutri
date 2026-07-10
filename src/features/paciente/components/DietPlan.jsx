import React, { useState } from 'react';
import { Scale, Utensils, Activity, FileText } from 'lucide-react';
import { useAppContext } from '../../../context/AppContext';

export default function DietPlan({ activePatient, activeTab }) {
  const { addWeight } = useAppContext();
  const [showWeightInput, setShowWeightInput] = useState(false);
  const [weightInput, setWeightInput] = useState('');

  if (activeTab !== 'meu_plano') return null;

  const handleWeightSubmit = (e) => {
    e.preventDefault();
    if (weightInput) {
      addWeight(activePatient.id, weightInput);
      setShowWeightInput(false);
      setWeightInput('');
    }
  };

  const lastWeight = activePatient.weights.length > 0 
    ? activePatient.weights[activePatient.weights.length - 1] 
    : { value: '--', date: 'Sem dados' };

  return (
    <div className="animate-pop-in">
      <h2 style={{marginBottom: '20px'}}>Meu Acompanhamento</h2>

      {/* Weight Logging */}
      <div style={styles.dataCard}>
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px'}}>
          <h3 style={{display: 'flex', alignItems: 'center', gap: '8px'}}><Scale size={20} color="var(--primary-shadow)"/> Peso Atual</h3>
          <span style={{fontWeight: 'bold', color: 'var(--primary-color)', fontSize: '1.2rem'}}>{lastWeight.value} kg</span>
        </div>
        <p style={{fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '12px'}}>Último registro em: {lastWeight.date}</p>
        
        {!showWeightInput ? (
          <button className="btn-3d btn-primary" onClick={() => setShowWeightInput(true)} style={{width: '100%', fontSize: '0.9rem'}}>REGISTRAR PESO HOJE</button>
        ) : (
          <form onSubmit={handleWeightSubmit} style={{display: 'flex', gap: '8px'}}>
            <input type="number" step="0.1" value={weightInput} onChange={e=>setWeightInput(e.target.value)} placeholder="Ex: 70.5" style={styles.input} required autoFocus />
            <button type="submit" className="btn-3d btn-primary">SALVAR</button>
          </form>
        )}
      </div>

      {/* Recipes */}
      <div style={styles.dataCard}>
        <h3 style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px'}}><Utensils size={20} color="var(--warning-shadow)"/> Receitas do Nutri</h3>
        
        {activePatient.recipes.length === 0 ? (
          <p style={{fontSize: '0.9rem', color: 'var(--text-muted)'}}>Nenhuma dieta cadastrada ainda.</p>
        ) : (
          activePatient.recipes.map((rec, idx) => (
            <div key={idx} style={styles.listItem}>
              <div>
                <strong>{rec.title}</strong>
                <p style={{fontSize: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'pre-wrap'}}>{rec.desc}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Exams */}
      <div style={styles.dataCard}>
        <h3 style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px'}}><Activity size={20} color="var(--secondary-shadow)"/> Meus Exames</h3>
        {activePatient.exams.length === 0 ? (
          <p style={{fontSize: '0.9rem', color: 'var(--text-muted)'}}>Nenhum exame analisado pelo nutri ainda.</p>
        ) : (
          activePatient.exams.map((ex, idx) => (
            <div key={idx} style={styles.listItem}>
              <div>
                <strong>{ex.title}</strong>
                <p style={{fontSize: '0.8rem', color: 'var(--danger-color)'}}>{ex.alert}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Medical Records */}
      <div style={styles.dataCard}>
        <h3 style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px'}}><FileText size={20} color="var(--text-muted)"/> Notas do Nutri</h3>
        <div style={{padding: '12px', backgroundColor: 'var(--gray-light)', borderRadius: '12px', fontSize: '0.9rem', whiteSpace: 'pre-wrap'}}>
          {activePatient.records || 'Nenhum recado disponível.'}
        </div>
      </div>
    </div>
  );
}

const styles = {
  dataCard: { backgroundColor: 'white', border: '2px solid var(--gray-light)', borderRadius: '20px', padding: '20px', marginBottom: '16px', boxShadow: '0 4px 0 var(--gray-shadow)' },
  listItem: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '2px solid var(--gray-light)' },
  input: { flex: 1, padding: '10px', borderRadius: '12px', border: '2px solid var(--gray-light)', fontSize: '1rem', outline: 'none', fontFamily: 'inherit' }
};
