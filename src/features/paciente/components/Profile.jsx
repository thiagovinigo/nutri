import React, { useState, useEffect } from 'react';
import { User, Save, Scale, X, Sparkles, TrendingUp, ShieldCheck, ShieldAlert, ChevronDown, Flame, Gem, FileText, Activity } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import toast from 'react-hot-toast';
import { useAppContext } from '../../../context/AppContext';
import { auth } from '../../../services/firebase';
import { parseMarkdownTabs } from '../../../utils/examMarkdown';

function formatExamDate(d) {
  if (!d) return '—';
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(d);
  return m ? `${m[3]}/${m[2]}/${m[1]}` : d;
}

function formatPhone(v) {
  const digits = v.replace(/\D/g, '').slice(0, 11);
  return digits
    .replace(/^(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d{4})$/, '$1-$2');
}

function formatCpf(v) {
  const digits = v.replace(/\D/g, '').slice(0, 11);
  return digits
    .replace(/^(\d{3})(\d)/, '$1.$2')
    .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d{1,2})$/, '.$1-$2');
}

export default function Profile({ activePatient }) {
  const { updatePatient, patchPatientLocal, addWeight, completeQuest } = useAppContext();
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editCpf, setEditCpf] = useState('');
  const [editAge, setEditAge] = useState('');
  const [editGender, setEditGender] = useState('M');
  const [editAversions, setEditAversions] = useState('');
  const [editMedications, setEditMedications] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [weightInput, setWeightInput] = useState('');

  // Verificação de telefone via WhatsApp (OTP)
  const [verifyStep, setVerifyStep] = useState('idle'); // idle | code_sent
  const [otpInput, setOtpInput] = useState('');
  const [verifySending, setVerifySending] = useState(false);
  const [verifyConfirming, setVerifyConfirming] = useState(false);
  const [verifyError, setVerifyError] = useState('');

  useEffect(() => {
    if (activePatient) {
      setEditName(activePatient.name || '');
      setEditEmail(activePatient.email || '');
      setEditCpf(formatCpf(activePatient.cpf || ''));
      setEditAge(activePatient.age || '');
      setEditGender(activePatient.gender || 'M');
      setEditAversions(activePatient.aversions || '');
      setEditMedications(activePatient.medications || '');
      setEditPhone(formatPhone(activePatient.phone || ''));
    }
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
        } else if (weight || bodyFat) {
          chartData.push({ date, Peso: weight, Gordura: bodyFat });
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
    if (activePatient) {
      const newPhoneDigits = editPhone.replace(/\D/g, '');
      const phoneChanged = newPhoneDigits !== (activePatient.phone || '');
      const payload = { ...activePatient, name: editName, email: editEmail, cpf: editCpf.replace(/\D/g, ''), age: editAge, gender: editGender, aversions: editAversions, medications: editMedications, phone: newPhoneDigits };
      // Trocar o número derruba a verificação anterior - firestore.rules exige
      // isso no mesmo write (ver .claude/prds/verificacao-telefone-whatsapp.prd.md).
      if (phoneChanged) {
        payload.phone_verified = false;
        setVerifyStep('idle');
        setOtpInput('');
        setVerifyError('');
      }
      updatePatient(activePatient.id, payload);
      toast.success('Perfil atualizado com sucesso!');
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
      toast.success('Telefone verificado!');
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
      toast.success('Peso salvo! Você ganhou +10 XP!');
    }
  };

  const phoneVerified = !!activePatient?.phone_verified;
  const needsPhoneAction = !!activePatient?.phone && !phoneVerified;

  return (
    <div className="animate-pop-in">
      <h2 style={styles.sectionTitle}><User color="#8b5cf6" /> Seu Perfil Pessoal</h2>

      {activePatient?.nutriName && (
        <div className="patient-card" style={{ marginBottom: '16px' }}>
          <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--patient-text-muted)' }}>Nutricionista Responsável</p>
          <h4 style={{ margin: '4px 0 0 0', color: 'var(--patient-text)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={16} color="#8b5cf6" /> {activePatient.nutriName}
          </h4>
        </div>
      )}

      {/* Bloco 1: Meu Progresso — pesagem + gráfico juntos, é o que mais engaja */}
      <div className="patient-card" style={{ marginBottom: '16px' }}>
        <h3 style={styles.cardTitle}>
          <TrendingUp size={20} color="#8b5cf6" /> Meu Progresso
        </h3>
        <p style={{ margin: '4px 0 12px 0', fontSize: '0.85rem', color: 'var(--patient-text-muted)' }}>
          Mantenha seu peso atualizado para gerar dados para a Nutri.
        </p>
        <button type="button" className="btn-3d btn-primary" style={{ width: '100%' }} onClick={() => setShowWeightModal(true)}>
          <Scale size={18} style={{ marginRight: '8px' }} /> Informar Meu Peso
        </button>

        {chartData.length === 0 ? (
          <p style={{ color: 'var(--patient-text-muted)', fontSize: '0.9rem', marginTop: '16px' }}>Nenhuma medição registrada ainda.</p>
        ) : (
          <div style={{ width: '100%', height: 250, marginTop: '16px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" />
                <XAxis dataKey="date" stroke="var(--patient-text-muted)" fontSize={12} />
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

      {/* Bloco 2: Meus Dados — 3 grupos em acordeão, em vez de 8 campos soltos */}
      <form onSubmit={handleSaveProfile} className="patient-card" style={{ marginBottom: '16px' }}>
        <h3 style={styles.cardTitle}>Meus Dados</h3>

        <details className="patient-accordion" open={needsPhoneAction}>
          <summary>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: needsPhoneAction ? '#f59e0b' : '#10b981', flexShrink: 0 }} />
            Contato &amp; Verificação
            {needsPhoneAction && <span style={styles.summaryHint}>ação necessária</span>}
            <ChevronDown size={18} className="patient-accordion-chevron" />
          </summary>
          <div className="patient-accordion-body">
            <div>
              <label className="patient-label" htmlFor="profile-phone">Telefone (WhatsApp)</label>
              <input id="profile-phone" type="text" className="patient-input" value={editPhone} onChange={e => setEditPhone(formatPhone(e.target.value))} placeholder="(99) 99999-9999" />

              {activePatient?.phone && (
                <div style={{ marginTop: '10px' }}>
                  {phoneVerified ? (
                    <span style={styles.verifiedBadge}>
                      <ShieldCheck size={16} /> Verificado
                    </span>
                  ) : (
                    <div>
                      <span style={styles.unverifiedBadge}>
                        <ShieldAlert size={16} /> Não verificado — a Secretária Virtual só responde a números confirmados
                      </span>

                      {verifyStep === 'idle' && (
                        <button type="button" onClick={handleSendVerifyCode} disabled={verifySending}
                          className="btn-3d btn-primary" style={{ padding: '8px 14px', fontSize: '0.85rem' }}>
                          {verifySending ? 'Enviando...' : 'Verificar via WhatsApp'}
                        </button>
                      )}

                      {verifyStep === 'code_sent' && (
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                          <label className="sr-only" htmlFor="profile-otp">Código de verificação</label>
                          <input id="profile-otp" type="text" inputMode="numeric" maxLength={6} placeholder="Código de 6 dígitos"
                            className="patient-input" value={otpInput} onChange={e => setOtpInput(e.target.value.replace(/\D/g, ''))}
                            style={{ width: '160px' }} />
                          <button type="button" onClick={handleConfirmVerifyCode} disabled={verifyConfirming || otpInput.length !== 6}
                            className="btn-3d" style={{ ...styles.actionBtn, backgroundColor: '#10b981', boxShadow: '0 4px 0 #059669', padding: '8px 14px', fontSize: '0.85rem' }}>
                            {verifyConfirming ? 'Confirmando...' : 'Confirmar'}
                          </button>
                          <button type="button" onClick={handleSendVerifyCode} disabled={verifySending} style={styles.resendBtn}>
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
          </div>
        </details>

        <details className="patient-accordion" open>
          <summary>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#8b5cf6', flexShrink: 0 }} />
            Dados Clínicos
            <ChevronDown size={18} className="patient-accordion-chevron" />
          </summary>
          <div className="patient-accordion-body">
            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ flex: 1 }}>
                <label className="patient-label" htmlFor="profile-age">Idade (anos)</label>
                <input id="profile-age" type="number" className="patient-input" value={editAge} onChange={e => setEditAge(e.target.value)} />
              </div>
              <div style={{ flex: 1 }}>
                <label className="patient-label" htmlFor="profile-gender">Sexo Genético</label>
                <select id="profile-gender" className="patient-input" value={editGender} onChange={e => setEditGender(e.target.value)}>
                  <option value="M">Masculino</option>
                  <option value="F">Feminino</option>
                </select>
              </div>
            </div>
            <div>
              <label className="patient-label" htmlFor="profile-aversions">Alimentos que não como de jeito nenhum (Aversões)</label>
              <textarea id="profile-aversions" className="patient-input" value={editAversions} onChange={e => setEditAversions(e.target.value)} placeholder="Ex: pimentão, fígado, coentro..." />
            </div>
            <div>
              <label className="patient-label" htmlFor="profile-medications">Medicamentos em uso</label>
              <textarea id="profile-medications" className="patient-input" value={editMedications} onChange={e => setEditMedications(e.target.value)} placeholder="Ex: Ritalina, Ozempic, Sertralina..." />
            </div>
          </div>
        </details>

        <details className="patient-accordion">
          <summary>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--patient-text-muted)', flexShrink: 0 }} />
            Identidade &amp; Acesso
            <span style={styles.summaryHint}>raramente muda</span>
            <ChevronDown size={18} className="patient-accordion-chevron" />
          </summary>
          <div className="patient-accordion-body">
            <div>
              <label className="patient-label" htmlFor="profile-name">Nome Completo</label>
              <input id="profile-name" type="text" className="patient-input" value={editName} onChange={e => setEditName(e.target.value)} />
            </div>
            <div>
              <label className="patient-label" htmlFor="profile-email">E-mail de Acesso</label>
              <input id="profile-email" type="email" className="patient-input" value={editEmail} onChange={e => setEditEmail(e.target.value)} />
            </div>
            <div>
              <label className="patient-label" htmlFor="profile-cpf">CPF</label>
              <input id="profile-cpf" type="text" inputMode="numeric" className="patient-input" value={editCpf} onChange={e => setEditCpf(formatCpf(e.target.value))} placeholder="000.000.000-00" />
            </div>
          </div>
        </details>

        <button type="submit" className="btn-3d btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '16px' }}>
          <Save size={18} style={{ marginRight: '8px' }} /> Salvar Alterações
        </button>
      </form>

      {/* Meus Exames — o nutricionista sempre via o laudo, o paciente nunca via
          o próprio resultado. Mostra só a tradução em linguagem leiga (seção
          "Tradução para o Paciente" do laudo), nunca o parecer clínico interno
          completo (ver src/utils/examMarkdown.js). */}
      {activePatient?.exams?.length > 0 && (
        <div className="patient-card" style={{ marginBottom: '16px' }}>
          <h3 style={styles.cardTitle}>
            <Activity size={20} color="#8b5cf6" /> Meus Exames
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {activePatient.exams.slice().reverse().map((ex, idx) => {
              const parsed = parseMarkdownTabs(ex.aiSummaryProfessional || ex.analysis || '');
              const summary = parsed.leiga || 'Resultado ainda sem tradução disponível — fale com sua nutricionista.';
              return (
                <details key={ex.id || idx} className="patient-accordion">
                  <summary>
                    <FileText size={16} style={{ flexShrink: 0 }} />
                    Exame de {formatExamDate(ex.date || ex.dateUploaded)}
                    <ChevronDown size={18} className="patient-accordion-chevron" />
                  </summary>
                  <div className="patient-accordion-body">
                    <div className="markdown-content" style={{ fontSize: '0.9rem', color: 'var(--patient-text)' }}>
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{summary}</ReactMarkdown>
                    </div>
                  </div>
                </details>
              );
            })}
          </div>
        </div>
      )}

      {/* Bloco 3: Conquistas — tira do 4º card, vira uma faixa curta (não duplica a TopBar) */}
      <div className="patient-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', fontWeight: 700, color: 'var(--patient-text)' }}>
          <Flame size={18} color="#f97316" /> {activePatient?.streak ?? 0} dias seguidos
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', fontWeight: 700, color: 'var(--patient-text)' }}>
          <Gem size={18} color="#8b5cf6" /> {activePatient?.xp ?? 0} XP
        </span>
      </div>

      {showWeightModal && (
        <div style={styles.modalOverlay} onClick={() => setShowWeightModal(false)}>
          <form onSubmit={handleSaveWeight} className="patient-card" style={{ width: '320px' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h4 style={{ margin: 0, color: 'var(--patient-text)' }}>Qual seu peso hoje?</h4>
              <button type="button" onClick={() => setShowWeightModal(false)} style={styles.closeBtn} aria-label="Fechar"><X size={20} /></button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
              <label className="sr-only" htmlFor="profile-weight-input">Peso em quilos</label>
              <input
                id="profile-weight-input"
                type="text"
                inputMode="decimal"
                autoFocus
                placeholder="Ex: 78,5"
                value={weightInput}
                onChange={e => setWeightInput(e.target.value)}
                className="patient-input"
                style={{ flex: 1, fontSize: '1.1rem' }}
              />
              <span style={{ fontWeight: 700, color: 'var(--patient-text-muted)' }}>kg</span>
            </div>
            <button type="submit" className="btn-3d" style={{ ...styles.actionBtn, backgroundColor: '#f59e0b', boxShadow: '0 4px 0 #d97706', width: '100%', justifyContent: 'center' }}>
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
  cardTitle: { margin: '0 0 12px 0', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--patient-text)' },
  actionBtn: { color: 'var(--patient-text)', border: 'none', borderRadius: '12px', padding: '12px 20px', fontWeight: '800', fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' },
  verifiedBadge: { display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#10b981', fontWeight: 700 },
  unverifiedBadge: { display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#f59e0b', fontWeight: 700, marginBottom: '8px' },
  resendBtn: { background: 'none', border: 'none', color: 'var(--patient-text-muted)', fontSize: '0.85rem', cursor: 'pointer', textDecoration: 'underline', padding: '12px 4px', minHeight: '44px' },
  summaryHint: { fontSize: '0.72rem', fontWeight: 600, color: 'var(--patient-text-muted)', marginLeft: 'auto' },
  modalOverlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' },
  closeBtn: { background: 'none', border: 'none', cursor: 'pointer', color: 'var(--patient-text-muted)', display: 'flex', padding: 0 }
};
