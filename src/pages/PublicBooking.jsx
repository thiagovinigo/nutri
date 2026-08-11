import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../services/firebase';
import { collection, query, where, getDocs, doc, getDoc, addDoc } from 'firebase/firestore';
import { Calendar as CalendarIcon, Clock, User, CheckCircle2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PublicBooking() {
  const { nutriId } = useParams();
  const navigate = useNavigate();
  const [nutri, setNutri] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [selectedDate, setSelectedDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedTime, setSelectedTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [patientData, setPatientData] = useState({
    name: '', phone: '', email: ''
  });

  useEffect(() => {
    async function fetchNutri() {
      try {
        const nDoc = await getDoc(doc(db, 'users', nutriId));
        if (nDoc.exists() && nDoc.data().role === 'nutricionista') {
          setNutri({ id: nDoc.id, ...nDoc.data() });
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchNutri();
  }, [nutriId]);

  useEffect(() => {
    if (!selectedDate || !nutri) return;
    
    async function loadSlots() {
      try {
        const defaultSlots = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'];
        
        const q = query(collection(db, 'appointments'), 
          where('nutricionista_id', '==', nutriId),
          where('date', '==', selectedDate),
          where('status', '==', 'agendado')
        );
        const snap = await getDocs(q);
        const bookedTimes = snap.docs.map(d => d.data().time);
        
        const available = defaultSlots.filter(t => !bookedTimes.includes(t));
        
        const today = new Date().toISOString().split('T')[0];
        if (selectedDate === today) {
          const nowStr = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
          setAvailableSlots(available.filter(t => t > nowStr));
        } else {
          setAvailableSlots(available);
        }
      } catch (e) {
        console.error(e);
        toast.error('Erro ao buscar horários.');
      }
    }
    loadSlots();
  }, [selectedDate, nutriId, nutri]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDate || !selectedTime) return toast.error('Selecione data e hora');
    
    setIsSubmitting(true);
    try {
      const newAppt = {
        nutricionista_id: nutriId,
        date: selectedDate,
        time: selectedTime,
        status: 'agendado',
        type: 'Primeira Consulta (Online)',
        locationType: 'online',
        patientName: patientData.name,
        patientPhone: patientData.phone,
        patientEmail: patientData.email,
        isGuest: true, // Indica que é um lead, não um paciente cadastrado no firestore ainda
        createdAt: new Date().toISOString()
      };
      
      await addDoc(collection(db, 'appointments'), newAppt);
      setSuccess(true);
    } catch (error) {
      console.error(error);
      toast.error('Falha ao agendar. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getMinDate = () => {
    const tzoffset = (new Date()).getTimezoneOffset() * 60000;
    return (new Date(Date.now() - tzoffset)).toISOString().split('T')[0];
  };

  if (loading) return <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#0a0a14', color: '#fff' }}>Carregando agenda...</div>;
  
  if (!nutri) return (
    <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#0a0a14', color: '#fff' }}>
      <div style={{ textAlign: 'center' }}>
        <AlertCircle size={48} color="#ef4444" style={{ marginBottom: '16px' }} />
        <h2>Nutricionista não encontrado</h2>
        <p style={{ color: '#94a3b8' }}>O link que você acessou é inválido ou expirou.</p>
      </div>
    </div>
  );

  if (success) return (
    <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#0a0a14', color: '#fff' }}>
      <div style={{ textAlign: 'center', backgroundColor: 'rgba(20,20,32,0.8)', padding: '40px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
        <CheckCircle2 size={64} color="#10b981" style={{ marginBottom: '16px', display: 'inline-block' }} />
        <h2>Agendamento Solicitado!</h2>
        <p style={{ color: '#94a3b8', marginTop: '8px', maxWidth: '400px' }}>
          Sua consulta com <strong>{nutri.name}</strong> foi pré-agendada para <strong>{selectedDate.split('-').reverse().join('/')}</strong> às <strong>{selectedTime}</strong>.
        </p>
        <p style={{ color: '#94a3b8', marginTop: '8px' }}>O profissional entrará em contato via WhatsApp ({patientData.phone}) para confirmar e enviar o link.</p>
        
        <div style={{ marginTop: '32px' }}>
          <button className="crm-btn-primary" onClick={() => navigate('/')}>Voltar ao Início</button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#0a0a14', padding: '20px', position: 'relative' }}>
      <div style={{
        position: 'absolute', top: '50%', left: '50%', width: '700px', height: '700px',
        transform: 'translate(-50%, -50%)', pointerEvents: 'none',
        background: 'radial-gradient(circle, rgba(168,85,247,0.15) 0%, transparent 60%)',
        filter: 'blur(20px)'
      }} />
      
      <div style={{
        width: '100%', maxWidth: '800px', position: 'relative', zIndex: 1,
        backgroundColor: 'rgba(20, 20, 32, 0.75)', backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px',
        overflow: 'hidden', display: 'flex', flexDirection: 'column'
      }}>
        
        <div style={{ padding: '32px', borderBottom: '1px solid rgba(255,255,255,0.05)', backgroundColor: 'rgba(255,255,255,0.02)', textAlign: 'center' }}>
          <h1 style={{ fontSize: '1.8rem', color: '#f8fafc', margin: 0 }}>Agendar Consulta</h1>
          <p style={{ color: '#94a3b8', marginTop: '8px' }}>com {nutri.name}</p>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '32px', display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
          
          <div style={{ flex: '1 1 300px' }}>
            <h3 style={{ color: '#f8fafc', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}><CalendarIcon size={18} color="#a855f7" /> 1. Escolha a Data</h3>
            
            <input 
              type="date"
              min={getMinDate()}
              value={selectedDate}
              onChange={(e) => { setSelectedDate(e.target.value); setSelectedTime(''); }}
              style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.12)', backgroundColor: 'rgba(0,0,0,0.3)', color: '#fff', marginBottom: '24px', colorScheme: 'dark' }}
              required
            />

            {selectedDate && (
              <>
                <h3 style={{ color: '#f8fafc', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}><Clock size={18} color="#a855f7" /> 2. Horários Disponíveis</h3>
                
                {availableSlots.length === 0 ? (
                  <p style={{ color: '#ef4444', fontSize: '0.9rem', backgroundColor: 'rgba(239,68,68,0.1)', padding: '12px', borderRadius: '8px' }}>Nenhum horário disponível para esta data.</p>
                ) : (
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
                    {availableSlots.map(time => (
                      <div 
                        key={time}
                        onClick={() => setSelectedTime(time)}
                        style={{
                          padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', border: '1px solid',
                          borderColor: selectedTime === time ? '#a855f7' : 'rgba(255,255,255,0.1)',
                          backgroundColor: selectedTime === time ? 'rgba(168,85,247,0.15)' : 'rgba(0,0,0,0.2)',
                          color: selectedTime === time ? '#e9d5ff' : '#cbd5e1'
                        }}
                      >
                        {time}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          <div style={{ flex: '1 1 300px', backgroundColor: 'rgba(0,0,0,0.15)', padding: '24px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <h3 style={{ color: '#f8fafc', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}><User size={18} color="#a855f7" /> Seus Dados</h3>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', color: '#cbd5e1', fontSize: '0.9rem' }}>Nome Completo</label>
              <input type="text" required value={patientData.name} onChange={e => setPatientData({...patientData, name: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(0,0,0,0.4)', color: '#fff' }} />
            </div>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', color: '#cbd5e1', fontSize: '0.9rem' }}>E-mail</label>
              <input type="email" required value={patientData.email} onChange={e => setPatientData({...patientData, email: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(0,0,0,0.4)', color: '#fff' }} />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '6px', color: '#cbd5e1', fontSize: '0.9rem' }}>WhatsApp</label>
              <input type="tel" required value={patientData.phone} onChange={e => {
                    let v = e.target.value.replace(/\D/g, '');
                    if (v.length > 11) v = v.slice(0, 11);
                    v = v.replace(/^(\d{2})(\d)/, '($1) $2');
                    v = v.replace(/(\d{5})(\d{4})$/, '$1-$2');
                    setPatientData({...patientData, phone: v});
                  }} placeholder="(11) 99999-9999" style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(0,0,0,0.4)', color: '#fff' }} />
            </div>

            <button 
              type="submit" 
              disabled={!selectedTime || isSubmitting}
              style={{
                width: '100%', padding: '14px', borderRadius: '8px', border: 'none', fontWeight: 'bold', color: '#fff', fontSize: '1rem',
                background: (!selectedTime || isSubmitting) ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)',
                cursor: (!selectedTime || isSubmitting) ? 'not-allowed' : 'pointer'
              }}
            >
              {isSubmitting ? 'Confirmando...' : 'Confirmar Agendamento'}
            </button>
          </div>
          
        </form>
      </div>
    </div>
  );
}
