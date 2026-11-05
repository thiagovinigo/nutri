import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Terminal,
  Cpu,
  Radio,
  CheckCircle2,
  ShieldCheck,
  Zap
} from 'lucide-react';
import PreviewSwitcher from '../components/landing/PreviewSwitcher';
import { landingData } from '../components/landing/landingData';
import '../landing-v2.css';
import '../landing-previews.css';

export default function LandingPreview5() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('radar');

  const cliOutputs = {
    radar: `[INFO] Iniciando varredura neural do radar...
[SYNC] Conectado ao Firebase Firestore + Telegram Webhook
[ALERT] Paciente: Camila Silva // Score de Risco: 82% (Crítico)
[CAUSE] Inatividade detectada: 4 dias sem check-in alimentar
[DISPATCH] Mensagem de reengajamento enfileirada no Telegram.`,
    dieta: `[RUN] nutrivvo diet:generate --patient=Rodrigo --goal=hipertrofia
[AI_CORE] Processando biomarcadores laboratoriais...
[OK] TMB Calculada: 1.840 kcal // GET Alvo: 2.650 kcal
[SUCCESS] Cardápio de 4 refeições + Tabela de substituição montados em 1.8s.`,
    telegram: `[DAEMON] NutriBot Telegram v2.4 ativo no canal oficial
[STATUS] 48 pacientes sincronizados // 0 mensagens pendentes
[CHECKIN] 12 fotos de refeição processadas por visão computacional hoje.`
  };

  return (
    <div className="v2-landing" style={{ background: '#04070a', minHeight: '100vh', padding: '60px 20px 100px' }}>
      <PreviewSwitcher current="p5" />

      {/* Hero Terminal */}
      <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
        <div className="v2-hero-pill" style={{ borderColor: 'rgba(6, 182, 212, 0.4)', background: 'rgba(6, 182, 212, 0.1)', color: '#06b6d4', marginBottom: '24px' }}>
          <Terminal size={16} />
          <span className="v2-mono">LAYOUT 5 // CLI & DEVELOPER TERMINAL SUITE</span>
        </div>

        <h1 className="v2-heading" style={{ fontSize: 'clamp(2.4rem, 5vw, 3.6rem)', color: '#fff', margin: '0 0 16px' }}>
          Infraestrutura clínica executada <br />
          <span className="gradient-text">com precisão de linha de comando.</span>
        </h1>

        <p style={{ color: '#94a3b8', fontSize: '1.1rem', marginBottom: '36px' }}>
          {landingData.description}
        </p>
      </div>

      {/* Terminal Window */}
      <div className="terminal-window-frame" style={{ maxWidth: '840px', margin: '0 auto' }}>
        <div className="terminal-top-bar">
          <div style={{ display: 'flex', gap: '6px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f43f5e' }} />
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f59e0b' }} />
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981' }} />
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setActiveTab('radar')}
              style={{
                background: activeTab === 'radar' ? '#1f2937' : 'transparent',
                color: activeTab === 'radar' ? '#06b6d4' : '#64748b',
                border: 'none',
                padding: '4px 10px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.75rem',
                fontFamily: 'JetBrains Mono'
              }}
            >
              $ radar --scan
            </button>
            <button
              onClick={() => setActiveTab('dieta')}
              style={{
                background: activeTab === 'dieta' ? '#1f2937' : 'transparent',
                color: activeTab === 'dieta' ? '#06b6d4' : '#64748b',
                border: 'none',
                padding: '4px 10px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.75rem',
                fontFamily: 'JetBrains Mono'
              }}
            >
              $ diet:generate
            </button>
            <button
              onClick={() => setActiveTab('telegram')}
              style={{
                background: activeTab === 'telegram' ? '#1f2937' : 'transparent',
                color: activeTab === 'telegram' ? '#06b6d4' : '#64748b',
                border: 'none',
                padding: '4px 10px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.75rem',
                fontFamily: 'JetBrains Mono'
              }}
            >
              $ telegram --status
            </button>
          </div>

          <span style={{ fontSize: '0.75rem', color: '#10b981' }}>● ONLINE</span>
        </div>

        <div style={{ padding: '24px', textAlign: 'left', minHeight: '220px', color: '#67e8f9', fontSize: '0.88rem', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
          {cliOutputs[activeTab]}
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: '40px' }}>
        <button className="v2-btn v2-btn-cyber" style={{ padding: '16px 36px', fontSize: '1.05rem' }} onClick={() => navigate('/cadastro?role=nutricionista')}>
          Inicializar Consultório Grátis <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}
