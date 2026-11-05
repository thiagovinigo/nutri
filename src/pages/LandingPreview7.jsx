import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Radio,
  Bot,
  Camera,
  Flame,
  Utensils,
  Dumbbell,
  Stethoscope,
  Wallet,
  Sparkles,
  Layers
} from 'lucide-react';
import PreviewSwitcher from '../components/landing/PreviewSwitcher';
import { landingData } from '../components/landing/landingData';
import '../landing-v2.css';
import '../landing-previews.css';

export default function LandingPreview7() {
  const navigate = useNavigate();
  const [activeApp, setActiveApp] = useState('radar');

  const apps = {
    radar: {
      title: 'Radar de Abandono em Tempo Real',
      tag: 'VARREDURA ATIVA',
      icon: Radio,
      color: '#c084fc',
      content: (
        <div style={{ textAlign: 'center' }}>
          <div className="v2-radar-hud" style={{ margin: '0 auto 20px' }}>
            <div className="v2-radar-sweep" />
            <div className="v2-radar-circle-inner" />
            <div className="v2-radar-blip v2-blip-critical" />
            <div className="v2-radar-blip v2-blip-safe" />
          </div>
          <p style={{ color: '#cbd5e1', fontSize: '0.95rem' }}>{landingData.radar.desc}</p>
        </div>
      )
    },
    telegram: {
      title: 'Secretária Virtual no Telegram 24h',
      tag: 'AUTÔNOMO',
      icon: Bot,
      color: '#06b6d4',
      content: (
        <div style={{ maxWidth: '560px', margin: '0 auto' }}>
          <div className="v2-telegram-terminal">
            {landingData.telegram.chat.map((c, i) => (
              <div key={i} className={`v2-terminal-chat-bubble ${c.sender === 'bot' ? 'v2-term-bot' : 'v2-term-user'}`}>{c.text}</div>
            ))}
          </div>
        </div>
      )
    },
    dieta: {
      title: 'Gerador Clínico de Cardápios & Receitas',
      tag: 'PROCESSAMENTO 2.4s',
      icon: Utensils,
      color: '#10b981',
      content: (
        <div style={{ background: 'rgba(16,185,129,0.1)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(16,185,129,0.3)', textAlign: 'left' }}>
          <div style={{ color: '#fff', fontWeight: 800, fontSize: '1.1rem', marginBottom: '8px' }}>Plano Clínico Personalizado (2.100 kcal)</div>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>{landingData.generator.desc}</p>
          <div style={{ color: '#6ee7b7', fontWeight: 700, marginTop: '12px' }}>{landingData.generator.result}</div>
        </div>
      )
    },
    treino: {
      title: 'Ficha de Treino Integrada à Dieta',
      tag: 'CONDUTA UNIFICADA',
      icon: Dumbbell,
      color: '#f472b6',
      content: (
        <div style={{ background: 'rgba(236,72,153,0.1)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(236,72,153,0.3)', textAlign: 'left' }}>
          <div style={{ color: '#fff', fontWeight: 800, fontSize: '1.1rem', marginBottom: '8px' }}>Periodização A/B Calibrada</div>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>{landingData.workout.desc}</p>
          <div style={{ color: '#fbcfe8', fontWeight: 700, marginTop: '12px' }}>{landingData.workout.result}</div>
        </div>
      )
    }
  };

  const current = apps[activeApp];

  return (
    <div className="v2-landing" style={{ background: '#060710', minHeight: '100vh', padding: '60px 20px 120px' }}>
      <PreviewSwitcher current="p7" />

      {/* Hero OS */}
      <div style={{ maxWidth: '960px', margin: '0 auto 30px', textAlign: 'center' }}>
        <div className="v2-hero-pill" style={{ marginBottom: '20px' }}>
          <Sparkles size={16} color="#c084fc" />
          <span className="v2-mono">LAYOUT 7 // NUTRIVVO DESKTOP SUITE</span>
        </div>

        <h1 className="v2-heading" style={{ fontSize: 'clamp(2.4rem, 5vw, 3.8rem)', color: '#fff', margin: '0 0 16px' }}>
          Seu consultório operando em um <br />
          <span className="gradient-text">sistema clínico de alta precisão.</span>
        </h1>

        <p style={{ color: '#94a3b8', fontSize: '1.1rem', maxWidth: '680px', margin: '0 auto 36px' }}>
          Clique nos ícones do Dock abaixo para alternar entre os aplicativos do sistema em tempo real:
        </p>

        {/* Dock Bar */}
        <div className="os-dock-bar">
          <button className={`os-dock-btn ${activeApp === 'radar' ? 'active' : ''}`} onClick={() => setActiveApp('radar')}>
            <Radio size={16} /> Radar Anti-Abandono
          </button>
          <button className={`os-dock-btn ${activeApp === 'telegram' ? 'active' : ''}`} onClick={() => setActiveApp('telegram')}>
            <Bot size={16} /> Secretária Telegram
          </button>
          <button className={`os-dock-btn ${activeApp === 'dieta' ? 'active' : ''}`} onClick={() => setActiveApp('dieta')}>
            <Utensils size={16} /> Cardápios com IA
          </button>
          <button className={`os-dock-btn ${activeApp === 'treino' ? 'active' : ''}`} onClick={() => setActiveApp('treino')}>
            <Dumbbell size={16} /> Treinos com IA
          </button>
        </div>
      </div>

      {/* Janela Central do OS */}
      <div className="os-desktop-window" style={{ maxWidth: '960px', margin: '0 auto', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '16px', marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f43f5e' }} />
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f59e0b' }} />
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981' }} />
            <span className="v2-mono" style={{ fontSize: '0.8rem', color: '#fff', marginLeft: '12px', fontWeight: 700 }}>
              Nutrivvo OS // {current.title}
            </span>
          </div>

          <span className="v2-mono" style={{ fontSize: '0.72rem', color: current.color, fontWeight: 800 }}>
            {current.tag}
          </span>
        </div>

        {current.content}
      </div>

      <div style={{ textAlign: 'center', marginTop: '40px' }}>
        <button className="v2-btn v2-btn-cyber" style={{ padding: '16px 36px', fontSize: '1.05rem' }} onClick={() => navigate('/cadastro?role=nutricionista')}>
          Criar Minha Clínica no Nutrivvo OS <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}
