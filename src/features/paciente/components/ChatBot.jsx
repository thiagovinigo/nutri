import React, { useRef, useEffect } from 'react';
import { MessageCircle, Send, Activity } from 'lucide-react';

export default function ChatBot({ activePatient, currentRecipe, chatHistory, setChatHistory, chatInput, setChatInput, isChatLoading, setIsChatLoading, handleSendChatMessage }) {
  const chatScrollRef = useRef(null);

  useEffect(() => {
    if(chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatHistory, isChatLoading]);

  return (
    <div className="animate-pop-in">
      <h2 style={styles.sectionTitle}><MessageCircle color="#3b82f6" /> Vytal Bot (Clínica)</h2>
      <p style={{ margin: '-10px 0 16px 0', fontSize: '0.85rem', color: 'var(--crm-text-muted)' }}>IA Médica conectada ao seu prontuário</p>
      
      <div style={styles.chatContainer}>
        <div ref={chatScrollRef} style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '20px' }}>
            {chatHistory.length === 0 && (
              <div style={{ textAlign: 'center', color: 'var(--crm-text-muted)', marginTop: '20px', padding: '20px', backgroundColor: 'var(--crm-surface-2, var(--crm-bg))', borderRadius: '12px' }}>
                <Activity size={32} color='var(--crm-text-muted)' style={{ marginBottom: '12px' }} />
                <p style={{ margin: 0, fontSize: '0.95rem' }}>Olá, {activePatient.name}. Sou a inteligência artificial clínica da Vytal. Como está sua aderência ao protocolo focado em {activePatient.objective} hoje?</p>
              </div>
            )}
            {chatHistory.map((msg, idx) => (
              <div key={idx} style={{ alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', backgroundColor: msg.role === 'user' ? '#3b82f6' : 'var(--crm-surface-2)', color: msg.role === 'user' ? 'white' : 'var(--crm-text-main)', padding: '12px 16px', borderRadius: msg.role === 'user' ? '16px 16px 0 16px' : '16px 16px 16px 0', maxWidth: '85%', fontSize: '0.95rem', lineHeight: '1.5' }}>
                {msg.content}
              </div>
            ))}
            {isChatLoading && (
              <div style={{ alignSelf: 'flex-start', backgroundColor: 'var(--crm-surface-2)', color: 'var(--crm-text-muted)', padding: '12px 16px', borderRadius: '16px 16px 16px 0', animation: 'pulse 1.5s infinite', fontSize: '0.9rem' }}>
                Analisando prontuário...
              </div>
            )}
        </div>

        <div style={{ borderTop: '1px solid #e2e8f0', padding: '12px', backgroundColor: 'var(--crm-surface-2, var(--crm-bg))', flexShrink: 0 }}>
          <form onSubmit={handleSendChatMessage} style={{ display: 'flex', gap: '8px' }}>
              <input 
                type="text" 
                value={chatInput} 
                onChange={e => setChatInput(e.target.value)}
                placeholder="Posso trocar a batata?" 
                style={{ flex: 1, padding: '12px 16px', borderRadius: '24px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.95rem' }}
              />
              <button 
                type="submit" 
                disabled={isChatLoading || !chatInput.trim()} 
                style={{ backgroundColor: chatInput.trim() ? '#3b82f6' : 'var(--crm-border)', color: 'white', border: 'none', borderRadius: '50%', width: '45px', height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: chatInput.trim() ? 'pointer' : 'default', transition: 'background-color 0.2s', flexShrink: 0 }}
              >
                <Send size={18} />
              </button>
          </form>
        </div>
      </div>
    </div>
  );
}

const styles = {
  sectionTitle: {
    fontSize: '1.2rem',
    fontWeight: '800',
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: 'var(--crm-text-main)'
  },
  chatContainer: {
    display: 'flex',
    flexDirection: 'column',
    height: '65vh', 
    backgroundColor: 'var(--crm-surface)',
    borderRadius: '16px',
    border: '1px solid #e2e8f0',
    overflow: 'hidden'
  }
};
