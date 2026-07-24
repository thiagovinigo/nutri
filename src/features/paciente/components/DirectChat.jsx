import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { useAppContext } from '../../../context/AppContext';

export default function DirectChat({ activePatient }) {
  const { directMessages, sendDirectMessage } = useAppContext();
  const [chatInput, setChatInput] = useState('');

  const patientMessages = (directMessages || []).filter(m => m.patientId === activePatient?.id);

  const handleSend = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    sendDirectMessage(activePatient.id, 'paciente', chatInput.trim());
    setChatInput('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ marginBottom: '16px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--patient-text-main)' }}>Chat com a Nutri</h2>
        <p style={{ color: 'var(--patient-text-muted)' }}>Mande suas dúvidas diretamente.</p>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', paddingRight: '8px', marginBottom: '16px', minHeight: '300px' }}>
        {patientMessages.length === 0 ? (
          <p style={{ color: 'var(--patient-text-muted)', textAlign: 'center', marginTop: 'auto', marginBottom: 'auto' }}>
            Nenhuma mensagem. Envie a primeira mensagem para sua nutricionista!
          </p>
        ) : (
          patientMessages.map(msg => (
            <div key={msg.id} style={{ 
              alignSelf: msg.sender === 'paciente' ? 'flex-end' : 'flex-start',
              backgroundColor: msg.sender === 'paciente' ? 'var(--primary-color)' : 'var(--crm-surface-2)',
              color: msg.sender === 'paciente' ? '#000' : 'var(--patient-text-main)',
              padding: '12px 16px',
              borderRadius: msg.sender === 'paciente' ? '16px 16px 0 16px' : '16px 16px 16px 0',
              maxWidth: '80%',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
            }}>
              <div style={{ fontSize: '0.95rem' }}>{msg.text}</div>
              <div style={{ fontSize: '0.7rem', color: msg.sender === 'paciente' ? 'rgba(0,0,0,0.6)' : 'var(--patient-text-muted)', marginTop: '4px', textAlign: 'right' }}>
                {new Date(msg.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          ))
        )}
      </div>
      
      <form onSubmit={handleSend} style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
        <input 
          type="text" 
          placeholder="Sua mensagem..." 
          value={chatInput} 
          onChange={e => setChatInput(e.target.value)} 
          style={{ flex: 1, padding: '16px', borderRadius: '24px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '1rem', background: 'var(--crm-surface-2, var(--crm-bg))' }}
        />
        <button type="submit" style={{ backgroundColor: 'var(--primary-color)', color: '#000', border: 'none', borderRadius: '50%', width: '52px', height: '52px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, boxShadow: '0 4px 12px rgba(0, 229, 255, 0.3)' }}>
          <Send size={24} />
        </button>
      </form>
    </div>
  );
}
