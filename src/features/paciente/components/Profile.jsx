import React, { useState, useEffect } from 'react';
import { User, Save, Scale, X, Activity, Upload, Sparkles, TrendingUp, FileText, Moon, Sun, ShieldCheck, ShieldAlert } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAppContext } from '../../../context/AppContext';
import { auth } from '../../../services/firebase';

export default function Profile({ activePatient }) {
  const { updatePatient, patchPatientLocal, addWeight, completeQuest, addExam, theme, toggleTheme } = useAppContext();
      const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editCpf, setEditCpf] = useState('');
  const [editAge, setEditAge] = useState('');
  const [editGender, setEditGender] = useState('M');
  const [editAversions, setEditAversions] = useState('');
  const [editMedications, setEditMedications] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [profileSaved, setProfileSaved] = useState(false);
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [weightInput, setWeightInput] = useState('');
  const [weightSaved, setWeightSaved] = useState(false);

  // Verificação de telefone via WhatsApp (OTP)
  const [verifyStep, setVerifyStep] = useState('idle'); // idle | code_sent
  const [otpInput, setOtpInput] = useState('');
  const [verifySending, setVerifySending] = useState(false);
  const [verifyConfirming, setVerifyConfirming] = useState(false);
  const [verifyError, setVerifyError] = useState('');

  useEffect(() => {
    if(activePatient) {
      setEditName(activePatient.name || '');
      setEditEmail(activePatient.email || '');
      setEditCpf(activePatient.cpf || '');
      setEditAge(activePatient.age || '');
      setEditGender(activePatient.gender || 'M');
      setEditAversions(activePatient.aversions || '');
      setEditMedications(activePatient.medications || '');
    }
  }, [activePatient]);

  const formatPhone = (v) => {
    const digits = v.replace(/\D/g, '').slice(0, 11);
    return digits
      .replace(/^(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d{4})$/, '$1-$2');
  };

  useEffect(() => {
    if (activePatient) setEditPhone(formatPhone(activePatient.phone || ''));
  }, [activePatient]);

  
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
      const newPhoneDigits = editPhone.replace(/\D/g, '');
      const phoneChanged = newPhoneDigits !== (activePatient.phone || '');
      const payload = { ...activePatient, name: editName, email: editEmail, cpf: editCpf, age: editAge, gender: editGender, aversions: editAversions, medications: editMedications, phone: newPhoneDigits };
      // Trocar o número derruba a verificação anterior - firestore.rules exige
      // isso no mesmo write (ver .claude/prds/verificacao-telefone-whatsapp.prd.md).
      if (phoneChanged) {
        payload.phone_verified = false;
        setVerifyStep('idle');
        setOtpInput('');
        setVerifyError('');
      }
      updatePatient(activePatient.id, payload);
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 3000);
    }
  };

  const handleSendVerifyCode = async () => {
    if (!activePatient || !auth.currentUser) return;
    setVerifySending(true);
    setVerifyError('');
    try {
      const idToken = await auth.currentUser.getIdToken();
      const res = await fetch('/api/whatsapp-verify-send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${idToken}` },
        body: JSON.stringify({ patientId: activePatient.id })
      });
      const data = await res.json();
      if (!res.ok) {
        setVerifyError(data.error || 'Falha ao enviar código.');
        return;
      }
      setVerifyStep('code_sent');
    } catch (err) {
      console.error('Erro ao enviar código de verificação:', err);
      setVerifyError('Erro de conexão ao enviar código.');
    } finally {
      setVerifySending(false);
    }
  };

  const handleConfirmVerifyCode = async () => {
    if (!activePatient || !auth.currentUser || !otpInput) return;
    setVerifyConfirming(true);
    setVerifyError('');
    try {
      const idToken = await auth.currentUser.getIdToken();
      const res = await fetch('/api/whatsapp-verify-confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${idToken}` },
        body: JSON.stringify({ patientId: activePatient.id, code: otpInput })
      });
      const data = await res.json();
      if (!res.ok) {
        setVerifyError(data.error || 'Código incorreto.');
        return;
      }
      // O write já foi feito pelo servidor (Admin SDK); só refletimos localmente.
      patchPatientLocal(activePatient.id, { phone_verified: true });
      setVerifyStep('idle');
      setOtpInput('');
    } catch (err) {
      console.error('Erro ao confirmar código de verificação:', err);
      setVerifyError('Erro de conexão ao confirmar código.');
    } finally {
      setVerifyConfirming(false);
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
        <div style={{...styles.card, backgroundColor: 'var(--crm-surface-2, var(--crm-bg))', borderColor: 'var(--crm-border)', marginBottom: '24px'}}>
          <p style={{margin: 0, fontSize: '0.9rem', color: 'var(--crm-text-muted)'}}>Nutricionista Responsável</p>
          <h4 style={{margin: '4px 0 0 0', color: 'var(--crm-text-main)', display: 'flex', alignItems: 'center', gap: '8px'}}>
            <Sparkles size={16} color="#8b5cf6"/> {activePatient.nutriName}
          </h4>
        </div>
      )}
      
      <form onSubmit={handleSaveProfile} style={{...styles.card, display: 'flex', flexDirection: 'column', gap: '16px'}}>
        <div>
          <label style={{display: 'block', marginBottom: '6px', fontSize: '0.9rem', color: 'var(--crm-text-muted)'}}>Nome Completo</label>
          <input type="text" value={editName} onChange={e => setEditName(e.target.value)} style={{width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box'}} />
        </div>
        <div>
          <label style={{display: 'block', marginBottom: '6px', fontSize: '0.9rem', color: 'var(--crm-text-muted)'}}>E-mail de Acesso</label>
          <input type="email" value={editEmail} onChange={e => setEditEmail(e.target.value)} style={{width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box'}} />
        </div>
        <div>
          <label style={{display: 'block', marginBottom: '6px', fontSize: '0.9rem', color: 'var(--crm-text-muted)'}}>CPF</label>
          <input type="text" value={editCpf} onChange={e => setEditCpf(e.target.value)} style={{width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box'}} />
        </div>
        <div>
          <label style={{display: 'block', marginBottom: '6px', fontSize: '0.9rem', color: 'var(--crm-text-muted)'}}>Telefone (WhatsApp)</label>
          <input type="text" value={editPhone} onChange={e => setEditPhone(formatPhone(e.target.value))} placeholder="(99) 99999-9999" style={{width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box'}} />

          {activePatient?.phone && (
            <div style={{ marginTop: '10px' }}>
              {activePatient.phone_verified ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#10b981', fontWeight: 700 }}>
                  <ShieldCheck size={16} /> Verificado
                </span>
              ) : (
                <div>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#f59e0b', fontWeight: 700, marginBottom: '8px' }}>
                    <ShieldAlert size={16} /> Não verificado — a Secretária Virtual só responde a números confirmados
                  </span>

                  {verifyStep === 'idle' && (
                    <button type="button" onClick={handleSendVerifyCode} disabled={verifySending}
                      className="btn-3d" style={{...styles.actionBtn, backgroundColor: '#8b5cf6', boxShadow: '0 4px 0 #7c3aed', padding: '8px 14px', fontSize: '0.85rem'}}>
                      {verifySending ? 'Enviando...' : 'Verificar via WhatsApp'}
                    </button>
                  )}

                  {verifyStep === 'code_sent' && (
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                      <input type="text" inputMode="numeric" maxLength={6} placeholder="Código de 6 dígitos"
                        value={otpInput} onChange={e => setOtpInput(e.target.value.replace(/\D/g, ''))}
                        style={{ padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', width: '160px' }} />
                      <button type="button" onClick={handleConfirmVerifyCode} disabled={verifyConfirming || otpInput.length !== 6}
                        className="btn-3d" style={{...styles.actionBtn, backgroundColor: '#10b981', boxShadow: '0 4px 0 #059669', padding: '8px 14px', fontSize: '0.85rem'}}>
                        {verifyConfirming ? 'Confirmando...' : 'Confirmar'}
                      </button>
                      <button type="button" onClick={handleSendVerifyCode} disabled={verifySending}
                        style={{ background: 'none', border: 'none', color: 'var(--crm-text-muted)', fontSize: '0.8rem', cursor: 'pointer', textDecoration: 'underline' }}>
                        Reenviar código
                      </button>
                    </div>
                  )}

                  {verifyError && <p style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '6px' }}>{verifyError}</p>}
                </div>
              )}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <div style={{ flex: 1 }}>
            <label style={{display: 'block', marginBottom: '6px', fontSize: '0.9rem', color: 'var(--crm-text-muted)'}}>Idade (anos)</label>
            <input type="number" value={editAge} onChange={e => setEditAge(e.target.value)} style={{width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box'}} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{display: 'block', marginBottom: '6px', fontSize: '0.9rem', color: 'var(--crm-text-muted)'}}>Sexo Genético</label>
            <select value={editGender} onChange={e => setEditGender(e.target.value)} style={{width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box'}}>
              <option value="M">Masculino</option>
              <option value="F">Feminino</option>
            </select>
          </div>
        </div>
        <div>
          <label style={{display: 'block', marginBottom: '6px', fontSize: '0.9rem', color: 'var(--crm-text-muted)'}}>Alimentos que não como de jeito nenhum (Aversões)</label>
          <textarea value={editAversions} onChange={e => setEditAversions(e.target.value)} style={{width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box', minHeight: '60px', resize: 'vertical'}} placeholder="Ex: pimentão, fígado, coentro..." />
        </div>
        <div>
          <label style={{display: 'block', marginBottom: '6px', fontSize: '0.9rem', color: 'var(--crm-text-muted)'}}>Medicamentos em uso</label>
          <textarea value={editMedications} onChange={e => setEditMedications(e.target.value)} style={{width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box', minHeight: '60px', resize: 'vertical'}} placeholder="Ex: Ritalina, Ozempic, Sertralina..." />
        </div>
        <button type="submit" className="btn-3d" style={{...styles.actionBtn, backgroundColor: '#8b5cf6', boxShadow: '0 4px 0 #7c3aed', justifyContent: 'center'}}>
          <Save size={18} /> Salvar Alterações
        </button>
        {profileSaved && <p style={styles.successText}>Perfil atualizado com sucesso!</p>}
      </form>

      <div style={{...styles.card, marginTop: '24px'}}>
        <div>
          <h4 style={{margin: 0}}>Pesagem Semanal</h4>
          <p style={{margin: '4px 0 16px 0', fontSize: '0.85rem', color: 'var(--crm-text-muted)'}}>Mantenha seu peso atualizado para gerar dados para a Nutri.</p>
        </div>
        <button className="btn-3d" style={{...styles.actionBtn, backgroundColor: '#f59e0b', boxShadow: '0 4px 0 #d97706', width: '100%', justifyContent: 'center'}} onClick={() => setShowWeightModal(true)}>
          <Scale size={20} /> Informar Meu Peso
        </button>
        {weightSaved && <p style={styles.successText}>Peso salvo! Você ganhou +10 XP!</p>}
      </div>

      <div style={{...styles.card, marginTop: '24px'}}>
        <h4 style={{margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--crm-text-main)'}}>
          <TrendingUp size={20} color="#8b5cf6" /> Meu Progresso
        </h4>
        {chartData.length === 0 ? (
          <p style={{ color: 'var(--crm-text-muted)', fontSize: '0.9rem' }}>Nenhuma medição registrada ainda.</p>
        ) : (
          <div style={{ width: '100%', height: 250, marginTop: '16px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke='var(--crm-border)' />
                <XAxis dataKey="date" stroke='var(--crm-text-muted)' fontSize={12} />
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
              <span style={{fontWeight: 700, color: 'var(--crm-text-muted)'}}>kg</span>
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
  sectionTitle: { fontSize: '1.2rem', fontWeight: '800', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--patient-text)' },
  card: { backgroundColor: 'var(--patient-surface)', borderRadius: '20px', padding: '20px', border: '1px solid var(--glass-border)', boxShadow: 'none', marginBottom: '16px' },
  actionBtn: { color: 'var(--patient-text)', border: 'none', borderRadius: '12px', padding: '12px 20px', fontWeight: '800', fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' },
  successText: { margin: '12px 0 0', color: '#10b981', fontWeight: 700, fontSize: '0.9rem', textAlign: 'center' },
  modalOverlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' },
  closeBtn: { background: 'none', border: 'none', cursor: 'pointer', color: 'var(--patient-text-muted)', display: 'flex', padding: 0 }
};
