import React, { useState, useEffect, useRef } from 'react';
import { doc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../../services/firebase';
import { Send, Bot, User, PauseCircle, PlayCircle } from 'lucide-react';

export default function ChatIA({ patient, clinicConfig }) {
  const [messages, setMessages] = useState([]);
  const [botPaused, setBotPaused] = useState(false);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  
  const phone = patient.phone ? String(patient.phone).replace(/\D/g, '') : null;
  const phoneNumber = phone ? (phone.startsWith('55') ? phone : `55${phone}`) : null;

  useEffect(() => {
    if (!phoneNumber) {
      setLoading(false);
      return;
    }
    
    // Ouve o documento do paciente no Firestore em tempo real
    const docRef = doc(db, 'patients', patient.id);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setMessages(data.whatsapp_messages || []);
        setBotPaused(data.bot_paused || false);
      } else {
        setMessages([]);
      }
      setLoading(false);
    }, (error) => {
      console.error("Erro ao carregar histórico do WhatsApp:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [phoneNumber, patient.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const toggleBotPause = async () => {
    if (!phoneNumber) return;
    const docRef = doc(db, 'patients', patient.id);
    try {
      await updateDoc(docRef, { bot_paused: !botPaused });
      setBotPaused(!botPaused);
    } catch (err) {
      console.error("Erro ao pausar bot:", err);
      // Fallback local se falhar
      setBotPaused(!botPaused);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !phoneNumber) return;
    
    const newMsg = {
      role: 'assistant',
      content: inputText.trim(),
      isManual: true,
      timestamp: new Date().toISOString()
    };
    
    const updatedMessages = [...messages, newMsg];
    setInputText('');
    setMessages(updatedMessages);
    
    const docRef = doc(db, 'patients', patient.id);
    try {
      await updateDoc(docRef, { whatsapp_messages: updatedMessages });
      
      // Envia via endpoint server-side (api/send-whatsapp.js), que usa a
      // apikey da Evolution API a partir de variaveis de ambiente no
      // servidor. NUNCA chamar a Evolution API direto do navegador aqui -
      // isso expunha a apikey (controle administrativo total da instancia)
      // no bundle JS publico, visivel a qualquer um pelo DevTools.
      await fetch('/api/send-whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: patient.phone, message: newMsg.content })
      });
      
    } catch (err) {
      console.error("Erro ao enviar mensagem:", err);
    }
  };

  if (!patient.phone) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--crm-text-light)' }}>
        Este paciente não possui um número de telefone válido cadastrado para usar o WhatsApp.
      </div>
    );
  }

  // Filtra as mensagens de 'system' e 'tool' que não interessam visualmente ao chat
  const chatMessages = messages.filter(m => m.role === 'user' || m.role === 'assistant');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '600px', background: 'var(--crm-card)', borderRadius: '12px', border: '1px solid var(--crm-border)', overflow: 'hidden' }}>
      
      {/* Header do Chat */}
      <div style={{ padding: '16px', background: 'var(--crm-bg)', borderBottom: '1px solid var(--crm-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--crm-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
            {patient.name.charAt(0)}
          </div>
          <div>
            <h4 style={{ margin: 0, color: 'var(--crm-text)' }}>Chat: {patient.name}</h4>
            <span style={{ fontSize: '12px', color: 'var(--crm-text-light)' }}>
              +{phoneNumber} • {botPaused ? '🤖 IA Pausada' : '🟢 IA Ativa'}
            </span>
          </div>
        </div>
        <button 
          onClick={toggleBotPause}
          style={{ 
            display: 'flex', alignItems: 'center', gap: '8px', 
            padding: '8px 16px', borderRadius: '20px', border: 'none', cursor: 'pointer',
            fontWeight: '600', transition: 'all 0.2s',
            background: botPaused ? '#FEF2F2' : '#F0FDF4',
            color: botPaused ? '#DC2626' : '#16A34A',
            border: `1px solid ${botPaused ? '#FCA5A5' : '#86EFAC'}`
          }}
        >
          {botPaused ? <PlayCircle size={18} /> : <PauseCircle size={18} />}
          {botPaused ? 'Reativar Bot' : 'Pausar Bot'}
        </button>
      </div>

      {/* Área de Mensagens */}
      <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px', background: 'var(--crm-bg-soft)' }}>
        {loading ? (
          <div style={{ textAlign: 'center', color: 'var(--crm-text-light)' }}>Carregando histórico...</div>
        ) : chatMessages.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--crm-text-light)', marginTop: 'auto', marginBottom: 'auto' }}>
            Nenhuma mensagem trocada ainda.
          </div>
        ) : (
          chatMessages.map((msg, i) => {
            const isUser = msg.role === 'user';
            return (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: isUser ? 'flex-start' : 'flex-end' }}>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', flexDirection: isUser ? 'row' : 'row-reverse' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: isUser ? '#E2E8F0' : (msg.isManual ? 'var(--crm-primary)' : '#10B981'), color: isUser ? '#475569' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {isUser ? <User size={14} /> : (msg.isManual ? 'N' : <Bot size={14} />)}
                  </div>
                  <div style={{ 
                    maxWidth: '300px', padding: '12px 16px', borderRadius: '16px',
                    borderBottomLeftRadius: isUser ? '4px' : '16px',
                    borderBottomRightRadius: isUser ? '16px' : '4px',
                    background: isUser ? 'white' : (msg.isManual ? 'var(--crm-primary)' : '#D1FAE5'),
                    color: isUser ? '#1E293B' : (msg.isManual ? 'white' : '#065F46'),
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                    fontSize: '14px', lineHeight: '1.4'
                  }}>
                    {msg.content}
                  </div>
                </div>
                {msg.isManual && <span style={{ fontSize: '10px', color: 'var(--crm-text-light)', marginTop: '4px', marginRight: '36px' }}>Enviado por você</span>}
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input de Mensagem */}
      <div style={{ padding: '16px', background: 'var(--crm-bg)', borderTop: '1px solid var(--crm-border)' }}>
        {botPaused ? (
           <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '12px' }}>
            <input 
              type="text" 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Digite uma mensagem manual para o paciente..." 
              style={{ flex: 1, padding: '12px 16px', borderRadius: '24px', border: '1px solid var(--crm-border)', outline: 'none', background: 'var(--crm-bg-soft)', color: 'var(--crm-text)' }}
            />
            <button type="submit" disabled={!inputText.trim()} style={{ width: '48px', height: '48px', borderRadius: '50%', background: inputText.trim() ? 'var(--crm-primary)' : '#CBD5E1', color: 'white', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: inputText.trim() ? 'pointer' : 'not-allowed', transition: 'background 0.2s' }}>
              <Send size={20} style={{ marginLeft: '4px' }} />
            </button>
          </form>
        ) : (
          <div style={{ textAlign: 'center', color: 'var(--crm-text-light)', padding: '12px', background: 'var(--crm-bg-soft)', borderRadius: '8px', fontSize: '14px', border: '1px dashed var(--crm-border)' }}>
            A IA está ativa controlando este chat. Para enviar mensagens manuais, pause o bot primeiro.
          </div>
        )}
      </div>
    </div>
  );
}
