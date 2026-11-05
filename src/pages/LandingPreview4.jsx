import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Send,
  Bot,
  User,
  Sparkles,
  Camera,
  CheckCheck,
  ShieldCheck,
  Activity
} from 'lucide-react';
import PreviewSwitcher from '../components/landing/PreviewSwitcher';
import { landingData } from '../components/landing/landingData';
import '../landing-v2.css';
import '../landing-previews.css';

export default function LandingPreview4() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    { role: 'nutri', author: 'Dra. Mariana (Nutricionista)', text: 'Como o Nutrivvo me ajuda a não perder pacientes entre as consultas?', time: '10:00' },
    { role: 'bot', author: 'Nutrivvo IA Assistant', text: 'Enquanto você atende no consultório, monitoramos os pacientes 24h: nossa IA cobra as fotos do almoço pelo Telegram, alimenta o diário por visão computacional e liga o Radar se alguém ficar 3 dias inativo.', time: '10:01' },
    { role: 'paciente', author: 'Felipe (Paciente)', text: 'E pra mim? O que eu ganho?', time: '10:02' },
    { role: 'bot', author: 'Nutrivvo IA Assistant', text: 'Você tem um app gamificado com Ofensiva Diária e XP a cada prato fotografado. Zero digitação chata de gramas e apoio diário no Telegram!', time: '10:02' }
  ]);
  const [inputVal, setInputVal] = useState('');

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputVal.trim()) return;
    const txt = inputVal;
    setInputVal('');
    setMessages(prev => [...prev, { role: 'nutri', author: 'Você (Nutricionista)', text: txt, time: 'Agora' }]);

    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          role: 'bot',
          author: 'Nutrivvo IA Assistant',
          text: `Resposta: Com o plano Profissional IA, você tem tudo isso automatizado para pacientes ilimitados por R$ 79/mês. Vamos testar por 7 dias grátis?`,
          time: 'Agora'
        }
      ]);
    }, 800);
  };

  return (
    <div className="v2-landing" style={{ background: '#0a0d18', minHeight: '100vh', padding: '60px 20px 100px' }}>
      <PreviewSwitcher current="p4" />

      {/* Hero Central em Formato Conversacional */}
      <div style={{ maxWidth: '840px', margin: '0 auto', textAlign: 'center' }}>
        <div className="v2-hero-pill" style={{ marginBottom: '20px' }}>
          <Bot size={16} color="#38bdf8" />
          <span className="v2-mono">LAYOUT 4 // CONVERSATIONAL CHAT FLOW</span>
        </div>

        <h1 className="v2-heading" style={{ fontSize: 'clamp(2.2rem, 4.5vw, 3.4rem)', color: '#fff', margin: '0 0 16px' }}>
          {landingData.titleLine1} <br />
          <span className="gradient-text">{landingData.titleHighlight}</span>
        </h1>

        <p style={{ color: '#94a3b8', fontSize: '1.1rem', marginBottom: '36px' }}>
          Acompanhe a conversa entre nutricionista, paciente e inteligência artificial para entender como funciona:
        </p>
      </div>

      {/* Container de Chat da Landing Page */}
      <div style={{ maxWidth: '840px', margin: '0 auto', background: 'rgba(15, 20, 36, 0.95)', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: '24px', padding: '28px', boxShadow: '0 30px 80px rgba(0,0,0,0.85)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', minHeight: '380px', marginBottom: '24px' }}>
          {messages.map((m, idx) => (
            <div
              key={idx}
              style={{
                alignSelf: m.role === 'nutri' ? 'flex-end' : 'flex-start',
                maxWidth: '85%',
                background: m.role === 'nutri' ? '#2b5278' : m.role === 'paciente' ? '#2d3748' : '#1e293b',
                borderLeft: m.role === 'bot' ? '3px solid #38bdf8' : undefined,
                color: '#fff',
                padding: '14px 18px',
                borderRadius: '16px',
                textAlign: 'left'
              }}
            >
              <div style={{ fontSize: '0.75rem', color: m.role === 'bot' ? '#38bdf8' : '#cbd5e1', fontWeight: 800, marginBottom: '4px' }}>
                {m.author}
              </div>
              <div style={{ fontSize: '0.94rem', lineHeight: 1.5 }}>{m.text}</div>
              <div style={{ fontSize: '0.68rem', color: '#94a3b8', textAlign: 'right', marginTop: '6px' }}>{m.time}</div>
            </div>
          ))}
        </div>

        {/* Input interativo */}
        <form onSubmit={handleSend} style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            placeholder="Faça uma pergunta sobre o Nutrivvo para testar a IA..."
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            style={{
              flex: 1,
              background: '#090d16',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#fff',
              padding: '14px 20px',
              borderRadius: '9999px',
              outline: 'none',
              fontSize: '0.95rem'
            }}
          />
          <button className="v2-btn v2-btn-cyber" type="submit" style={{ padding: '12px 24px' }}>
            <Send size={18} />
          </button>
        </form>
      </div>

      <div style={{ textAlign: 'center', marginTop: '40px' }}>
        <button className="v2-btn v2-btn-cyber" style={{ padding: '16px 36px', fontSize: '1.05rem' }} onClick={() => navigate('/cadastro?role=nutricionista')}>
          Criar Minha Clínica Grátis Agora <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}
