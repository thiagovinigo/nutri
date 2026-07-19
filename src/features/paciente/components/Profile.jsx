import React, { useState, useEffect } from 'react';
import { User, Save, Scale, X, Activity, Upload, Sparkles, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAppContext } from '../../../context/AppContext';

export default function Profile({ activePatient }) {
  const { updatePatient, addWeight, completeQuest } = useAppContext();
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editCpf, setEditCpf] = useState('');
  const [profileSaved, setProfileSaved] = useState(false);
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [weightInput, setWeightInput] = useState('');
  const [weightSaved, setWeightSaved] = useState(false);

  useEffect(() => {
    if(activePatient) {
      setEditName(activePatient.name || '');
      setEditEmail(activePatient.email || '');
      setEditCpf(activePatient.cpf || '');
    }
  }, [activePatient]);

  const latestExam = activePatient?.exams?.slice(-1)[0];

  // Prepare data for the chart
  let chartData = [];
  
  if (activePatient?.weights) {
    activePatient.weights.forEach(w => {
      const existing = chartData.find(d => d.date === w.date);
      if (existing) {
        existing.Peso = parseFloat(w.value);
      } else {
        chartData.push({ date: w.date, Peso: parseFloat(w.value) });
      }
    });
  }
  
  if (activePatient?.consultations) {
    activePatient.consultations.forEach(c => {
      if (c.physicalEval) {
        const date = c.date;
        const existing = chartData.find(d => d.date === date);
        const weight = c.physicalEval.weight ? parseFloat(c.physicalEval.weight) : null;
        const bodyFat = c.physicalEval.bodyFat ? parseFloat(c.physicalEval.bodyFat) : null;
        
        if (existing) {
          if (weight) existing.Peso = weight;
          if (bodyFat) existing.Gordura = bodyFat;
        } else {
          if (weight || bodyFat) {
            chartData.push({ date, Peso: weight, Gordura: bodyFat });
          }
        }
      }
    });
  }

  // Sort by date (assuming dd/mm/yyyy format)
  chartData.sort((a, b) => {
    const [d1, m1, y1] = a.date.split('/');
    const [d2, m2, y2] = b.date.split('/');
    return new Date(`${y1}-${m1}-${d1}`) - new Date(`${y2}-${m2}-${d2}`);
  });
  const handleSaveProfile = (e) => {
    e.preventDefault();
    if(activePatient) {
      updatePatient(activePatient.id, { ...activePatient, name: editName, email: editEmail, cpf: editCpf });
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 3000);
    }
  };

  const handleSaveWeight = (e) => {
    e.preventDefault();
    const value = parseFloat(weightInput.replace(',', '.'));
    if (!isNaN(value) && value > 0) {
      addWeight(activePatient.id, value);
      completeQuest(activePatient.id, 10);
      setShowWeightModal(false);
      setWeightInput('');
      setWeightSaved(true);
      setTimeout(() => setWeightSaved(false), 3000);
    }
  };

  return (
    <div className="animate-pop-in">
      <h2 style={styles.sectionTitle}><User color="#8b5cf6" /> Seu Perfil Pessoal</h2>

      {activePatient?.nutriName && (
        <div style={{...styles.card, backgroundColor: '#f8fafc', borderColor: '#e2e8f0', marginBottom: '24px'}}>
          <p style={{margin: 0, fontSize: '0.9rem', color: '#64748b'}}>Nutricionista Responsável</p>
          <h4 style={{margin: '4px 0 0 0', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px'}}>
            <Sparkles size={16} color="#8b5cf6"/> {activePatient.nutriName}
          </h4>
        </div>
      )}
      
      <form onSubmit={handleSaveProfile} style={{...styles.card, display: 'flex', flexDirection: 'column', gap: '16px'}}>
        <div>
          <label style={{display: 'block', marginBottom: '6px', fontSize: '0.9rem', color: '#64748b'}}>Nome Completo</label>
          <input type="text" value={editName} onChange={e => setEditName(e.target.value)} style={{width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box'}} />
        </div>
        <div>
          <label style={{display: 'block', marginBottom: '6px', fontSize: '0.9rem', color: '#64748b'}}>E-mail de Acesso</label>
          <input type="email" value={editEmail} onChange={e => setEditEmail(e.target.value)} style={{width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box'}} />
        </div>
        <div>
          <label style={{display: 'block', marginBottom: '6px', fontSize: '0.9rem', color: '#64748b'}}>CPF</label>
          <input type="text" value={editCpf} onChange={e => setEditCpf(e.target.value)} style={{width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box'}} />
        </div>
        <button type="submit" className="btn-3d" style={{...styles.actionBtn, backgroundColor: '#8b5cf6', boxShadow: '0 4px 0 #7c3aed', justifyContent: 'center'}}>
          <Save size={18} /> Salvar Alterações
        </button>
        {profileSaved && <p style={styles.successText}>Perfil atualizado com sucesso!</p>}
      </form>

      <div style={{...styles.card, marginTop: '24px'}}>
        <div>
          <h4 style={{margin: 0}}>Pesagem Semanal</h4>
          <p style={{margin: '4px 0 16px 0', fontSize: '0.85rem', color: '#64748b'}}>Mantenha seu peso atualizado para gerar dados para a Nutri.</p>
        </div>
        <button className="btn-3d" style={{...styles.actionBtn, backgroundColor: '#f59e0b', boxShadow: '0 4px 0 #d97706', width: '100%', justifyContent: 'center'}} onClick={() => setShowWeightModal(true)}>
          <Scale size={20} /> Informar Meu Peso
        </button>
        {weightSaved && <p style={styles.successText}>Peso salvo! Você ganhou +10 XP!</p>}
      </div>

      <div style={{...styles.card, marginTop: '24px'}}>
        <h4 style={{margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px', color: '#1e293b'}}>
          <TrendingUp size={20} color="#8b5cf6" /> Meu Progresso
        </h4>
        {chartData.length === 0 ? (
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Nenhuma medição registrada ainda.</p>
        ) : (
          <div style={{ width: '100%', height: 250, marginTop: '16px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
                <YAxis yAxisId="left" stroke="#8b5cf6" fontSize={12} />
                <YAxis yAxisId="right" orientation="right" stroke="#f43f5e" fontSize={12} />
                <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', fontSize: '0.85rem' }} />
                <Legend wrapperStyle={{ fontSize: '0.85rem' }} />
                <Line yAxisId="left" type="monotone" dataKey="Peso" stroke="#8b5cf6" strokeWidth={3} activeDot={{ r: 6 }} />
                <Line yAxisId="right" type="monotone" dataKey="Gordura" stroke="#f43f5e" strokeWidth={3} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
      <div style={{...styles.card, marginTop: '24px', borderColor: '#8b5cf6', background: 'linear-gradient(145deg, #ffffff 0%, #f3e8ff 100%)' }}>
        <h4 style={{margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '8px', color: '#6d28d9'}}>
          <Activity size={20} /> Evolução Clínica VIP
        </h4>
        
        {latestExam && latestExam.aiSummaryPatient ? (
          <div style={{ marginBottom: '16px' }}>
            <p style={{ margin: '0 0 8px 0', fontSize: '0.95rem', color: '#4c1d95', lineHeight: '1.5' }}>
              <Sparkles size={16} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'text-bottom' }} />
              {latestExam.aiSummaryPatient}
            </p>
            <span style={{ fontSize: '0.8rem', color: '#6d28d9' }}>Última análise em {latestExam.dateUploaded}</span>
          </div>
        ) : (
          <p style={{ margin: '0 0 16px 0', fontSize: '0.9rem', color: '#64748b' }}>
            Nenhum exame analisado recentemente. Envie seus exames para a Nutri acompanhar sua saúde de perto!
          </p>
        )}
        
        <button className="btn-3d" style={{...styles.actionBtn, backgroundColor: '#8b5cf6', boxShadow: '0 4px 0 #7c3aed', width: '100%', justifyContent: 'center'}} onClick={() => {
          alert('Exame enviado para a fila da Nutri! Ela avaliará em breve.');
        }}>
          <Upload size={20} /> Enviar Novo Exame (PDF/Foto)
        </button>
      </div>

      <div style={{...styles.card, marginTop: '24px'}}>
        <h4 style={{margin: '0 0 16px 0'}}>Estatísticas do Game</h4>
        <p>🔥 <strong>Ofensiva:</strong> {activePatient.streak} dias seguidos</p>
        <p>💎 <strong>Total de XP:</strong> {activePatient.xp} XP</p>
      </div>

      {showWeightModal && (
        <div style={styles.modalOverlay} onClick={() => setShowWeightModal(false)}>
          <form onSubmit={handleSaveWeight} style={{...styles.card, width: '320px'}} onClick={e => e.stopPropagation()}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px'}}>
              <h4 style={{margin: 0}}>Qual seu peso hoje?</h4>
              <button type="button" onClick={() => setShowWeightModal(false)} style={styles.closeBtn} aria-label="Fechar"><X size={20} /></button>
            </div>
            <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px'}}>
              <input
                type="text"
                inputMode="decimal"
                autoFocus
                placeholder="Ex: 78,5"
                value={weightInput}
                onChange={e => setWeightInput(e.target.value)}
                style={{flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '1.1rem', boxSizing: 'border-box'}}
              />
              <span style={{fontWeight: 700, color: '#64748b'}}>kg</span>
            </div>
            <button type="submit" className="btn-3d" style={{...styles.actionBtn, backgroundColor: '#f59e0b', boxShadow: '0 4px 0 #d97706', width: '100%', justifyContent: 'center'}}>
              <Scale size={18} /> Salvar Peso
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

const styles = {
  sectionTitle: { fontSize: '1.2rem', fontWeight: '800', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: '#1e293b' },
  card: { backgroundColor: '#ffffff', borderRadius: '20px', padding: '20px', border: '2px solid #e2e8f0', boxShadow: '0 4px 0 #cbd5e1', marginBottom: '16px' },
  actionBtn: { color: 'white', border: 'none', borderRadius: '12px', padding: '12px 20px', fontWeight: '800', fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' },
  successText: { margin: '12px 0 0', color: '#16a34a', fontWeight: 700, fontSize: '0.9rem', textAlign: 'center' },
  modalOverlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(15,23,42,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' },
  closeBtn: { background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex', padding: 0 }
};
