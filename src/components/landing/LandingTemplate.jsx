import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Radio,
  Cpu,
  Bot,
  BrainCircuit,
  Flame,
  Camera,
  Activity,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Terminal,
  Zap,
  ChevronDown,
  Dumbbell,
  Sparkles,
  Layers,
  HeartPulse,
  Lock,
  Wallet,
  Stethoscope,
  Utensils
} from 'lucide-react';
import PreviewSwitcher from './PreviewSwitcher';
import { landingData } from './landingData';
import '../../landing-v2.css';
import '../../landing-previews.css';

export default function LandingTemplate({ variant = 'p1', titleStyle = 'Cyber' }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('nutri');
  const [billingCycle, setBillingCycle] = useState('anual');
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (idx) => setOpenFaq(openFaq === idx ? null : idx);

  const isLight = variant === 'p6';
  const isArcade = variant === 'p3';
  const isAurora = variant === 'p2';
  const isRetro = variant === 'p5';
  const isBorderBeam = variant === 'p8';

  const bgStyle = isLight
    ? { background: '#f8fafc', color: '#0f172a' }
    : isArcade
    ? { background: '#090510' }
    : isAurora
    ? { background: '#050a0a' }
    : isRetro
    ? { background: '#04020a' }
    : { background: '#030408' };

  return (
    <div className={`v2-landing ${isLight ? 'theme-light' : ''}`} style={bgStyle}>
      {/* Backgrounds Especializados por Versão */}
      {variant === 'p1' && (
        <>
          <div className="v2-neon-grid" />
          <div className="v2-laser-beam" style={{ left: '15%', animationDelay: '0s' }} />
          <div className="v2-laser-beam" style={{ left: '85%', animationDelay: '3.5s' }} />
        </>
      )}

      {variant === 'p2' && (
        <>
          <div className="p2-aurora-glow-1" />
          <div className="p2-aurora-glow-2" />
        </>
      )}

      {variant === 'p3' && (
        <div className="p3-arcade-glow" />
      )}

      {variant === 'p4' && (
        <div style={{ position: 'absolute', top: '-150px', left: '50%', transform: 'translateX(-50%)', width: '900px', height: '600px', background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)', filter: 'blur(70px)', pointerEvents: 'none' }} />
      )}

      {variant === 'p5' && (
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(to right, rgba(236,72,153,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(6,182,212,0.08) 1px, transparent 1px)', backgroundSize: '40px 40px', maskImage: 'radial-gradient(circle at 50% 30%, #000 60%, transparent 100%)', pointerEvents: 'none' }} />
      )}

      {variant === 'p7' && (
        <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '1000px', height: '500px', background: 'radial-gradient(ellipse at center, rgba(168,85,247,0.15) 0%, rgba(244,63,94,0.1) 40%, rgba(6,182,212,0.1) 70%, transparent 90%)', filter: 'blur(80px)', pointerEvents: 'none' }} />
      )}

      {variant === 'p10' && (
        <>
          <div className="v2-neon-grid" />
          <div className="p2-aurora-glow-1" style={{ top: '30%' }} />
          <div className="v2-laser-beam" style={{ left: '10%', animationDelay: '1s' }} />
        </>
      )}

      {/* Switcher Global */}
      <PreviewSwitcher current={variant} />

      {/* Navbar Flutuante */}
      <header className="v2-nav-wrap">
        <nav className="v2-nav" style={isLight ? { background: 'rgba(255,255,255,0.85)', borderColor: '#e2e8f0', boxShadow: '0 10px 30px rgba(0,0,0,0.06)' } : {}}>
          <a href="#" className="v2-logo" style={isLight ? { color: '#0f172a' } : {}}>
            <div className="v2-logo-icon" style={isArcade ? { background: 'linear-gradient(135deg, #f97316, #ef4444)' } : isAurora ? { background: 'linear-gradient(135deg, #10b981, #06b6d4)' } : {}}>
              <Sparkles size={18} color="#fff" />
            </div>
            <span className="v2-heading">Nutrivvo<span style={{ color: isArcade ? '#f97316' : isAurora ? '#10b981' : '#06b6d4' }}>.{variant}</span></span>
          </a>

          <div className="v2-nav-links">
            <a href="#gestao" style={isLight ? { color: '#64748b' } : {}}>Como Funciona</a>
            <a href="#radar" style={isLight ? { color: '#64748b' } : {}}>Recursos & IA</a>
            <a href="#comparativo" style={isLight ? { color: '#64748b' } : {}}>Comparativo</a>
            <a href="#precos" style={isLight ? { color: '#64748b' } : {}}>Planos</a>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button className={isLight ? 'v2-btn v2-btn-outline' : 'v2-btn v2-btn-glass'} style={isLight ? { color: '#0f172a' } : {}} onClick={() => navigate('/login')}>
              Entrar
            </button>
            <button
              className="v2-btn v2-btn-cyber"
              style={isArcade ? { background: 'linear-gradient(135deg, #f97316, #ef4444)' } : isAurora ? { background: 'linear-gradient(135deg, #10b981, #059669)' } : {}}
              onClick={() => navigate('/cadastro?role=nutricionista')}
            >
              Criar Clínica Grátis
            </button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="v2-hero">
        <div className="v2-hero-pill" style={isLight ? { background: '#f1f5f9', color: '#64748b', borderColor: '#cbd5e1' } : {}}>
          <span className="glow-dot" style={isArcade ? { background: '#f97316' } : isAurora ? { background: '#10b981' } : {}} />
          <span className="v2-mono">{landingData.badge}</span>
        </div>

        <h1 className="v2-hero-title v2-heading" style={isLight ? { color: '#0f172a' } : {}}>
          {landingData.titleLine1} <br />
          <span className="gradient-text" style={isArcade ? { background: 'linear-gradient(135deg, #f97316, #ef4444)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' } : isAurora ? { background: 'linear-gradient(135deg, #10b981, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' } : {}}>
            {landingData.titleHighlight}
          </span>
        </h1>

        <p className="v2-hero-desc" style={isLight ? { color: '#475569' } : {}}>
          {landingData.description}
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap', marginBottom: '24px' }}>
          <button
            className="v2-btn v2-btn-cyber"
            style={{
              padding: '16px 36px',
              fontSize: '1.05rem',
              background: isArcade ? 'linear-gradient(135deg, #f97316, #ef4444)' : isAurora ? 'linear-gradient(135deg, #10b981, #059669)' : undefined
            }}
            onClick={() => navigate('/cadastro?role=nutricionista')}
          >
            Criar Minha Clínica Grátis <ArrowRight size={18} />
          </button>
          <button
            className={isLight ? 'v2-btn v2-btn-outline' : 'v2-btn v2-btn-glass'}
            style={{ padding: '16px 28px', fontSize: '1.05rem', color: isLight ? '#0f172a' : undefined }}
            onClick={() => {
              const el = document.getElementById('gestao');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            <Radio size={18} color={isArcade ? '#f97316' : isAurora ? '#10b981' : '#06b6d4'} /> Ver Como Funciona
          </button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', fontSize: '0.85rem', color: '#64748b', flexWrap: 'wrap' }}>
          {landingData.trustBadges.map((badge, i) => (
            <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={16} color="#10b981" /> {badge}
            </span>
          ))}
        </div>

        {/* Mockup Frame com Alternador Dual */}
        <div className={isBorderBeam ? 'v2-border-beam-container' : ''} style={{ maxWidth: '980px', margin: '40px auto 0', borderRadius: '24px', overflow: 'hidden', border: isLight ? '1px solid #e2e8f0' : '1px solid rgba(255,255,255,0.12)', boxShadow: '0 40px 100px -20px rgba(0,0,0,0.8)' }}>
          <div style={{ background: isLight ? '#ffffff' : 'rgba(12, 14, 25, 0.95)', padding: '16px' }}>
            <div className="v2-mockup-tab-bar">
              <div className="v2-browser-dots">
                <span className="v2-browser-dot" style={{ background: '#f43f5e' }} />
                <span className="v2-browser-dot" style={{ background: '#f59e0b' }} />
                <span className="v2-browser-dot" style={{ background: '#10b981' }} />
              </div>
              <div className="v2-tab-switch" style={isLight ? { background: '#f1f5f9' } : {}}>
                <button className={`v2-tab-item ${activeTab === 'nutri' ? 'active' : ''}`} onClick={() => setActiveTab('nutri')}>
                  CRM Nutricionista
                </button>
                <button className={`v2-tab-item ${activeTab === 'paciente' ? 'active' : ''}`} onClick={() => setActiveTab('paciente')}>
                  App do Paciente
                </button>
              </div>
              <span className="v2-mono" style={{ fontSize: '0.75rem', color: isArcade ? '#f97316' : '#10b981' }}>
                VISUAL_THEME: {titleStyle.toUpperCase()}
              </span>
            </div>
            <img src={activeTab === 'nutri' ? '/screen_nutri.png' : '/screen_paciente.png'} alt="Interface Nutrivvo" className="v2-mockup-screen" />
          </div>
        </div>
      </section>

      {/* Marquee de Especialidades */}
      <section style={{ borderTop: isLight ? '1px solid #e2e8f0' : '1px solid rgba(255,255,255,0.06)', borderBottom: isLight ? '1px solid #e2e8f0' : '1px solid rgba(255,255,26,0.06)', padding: '20px 0', background: isLight ? '#f1f5f9' : 'rgba(0,0,0,0.4)', overflow: 'hidden' }}>
        <div style={{ display: 'flex', gap: '48px', width: 'max-content', animation: 'v2Marquee 26s linear infinite' }}>
          {[...landingData.specialties, ...landingData.specialties].map((item, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', color: isLight ? '#64748b' : '#64748b', fontSize: '0.82rem', fontFamily: 'JetBrains Mono', fontWeight: 600 }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: isArcade ? '#f97316' : '#06b6d4' }} />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </section>

      {/* SEÇÃO 1 DO ORIGINAL: GESTÃO QUE TRABALHA POR VOCÊ */}
      <section id="gestao" className="v2-section" style={{ padding: '80px 20px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '48px', alignItems: 'center' }}>
          <div style={{ textAlign: 'left' }}>
            <span className="v2-mono" style={{ fontSize: '0.8rem', color: isArcade ? '#f97316' : '#c084fc', fontWeight: 800 }}>
              {landingData.valueProps.management.tag}
            </span>
            <h2 className="v2-section-title v2-heading" style={{ color: isLight ? '#0f172a' : '#fff', fontSize: 'clamp(2rem, 3.5vw, 2.8rem)', margin: '8px 0 20px' }}>
              {landingData.valueProps.management.title}
            </h2>
            <p style={{ color: isLight ? '#475569' : '#94a3b8', fontSize: '1.05rem', lineHeight: 1.6, marginBottom: '24px' }}>
              {landingData.valueProps.management.desc}
            </p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '10px', color: isLight ? '#334155' : '#e2e8f0', fontSize: '0.95rem' }}>
                <CheckCircle2 size={18} color="#10b981" /> {landingData.valueProps.management.bullet1}
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '10px', color: isLight ? '#334155' : '#e2e8f0', fontSize: '0.95rem' }}>
                <CheckCircle2 size={18} color="#10b981" /> {landingData.valueProps.management.bullet2}
              </li>
            </ul>
          </div>

          <div style={{ borderRadius: '20px', overflow: 'hidden', border: isLight ? '1px solid #e2e8f0' : '1px solid rgba(255,255,255,0.1)', boxShadow: '0 25px 60px rgba(0,0,0,0.5)' }}>
            <img src={landingData.valueProps.management.img} alt="Gestão CRM" style={{ width: '100%', display: 'block' }} />
          </div>
        </div>
      </section>

      {/* SEÇÃO 2 DO ORIGINAL: ENGAJAMENTO INCOMPARÁVEL (APP PACIENTE) */}
      <section className="v2-section" style={{ padding: '40px 20px 80px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '48px', alignItems: 'center' }}>
          <div style={{ borderRadius: '20px', overflow: 'hidden', border: isLight ? '1px solid #e2e8f0' : '1px solid rgba(255,255,255,0.1)', boxShadow: '0 25px 60px rgba(0,0,0,0.5)', order: 2 }}>
            <img src={landingData.valueProps.engagement.img} alt="App Paciente" style={{ width: '100%', display: 'block' }} />
          </div>

          <div style={{ textAlign: 'left', order: 1 }}>
            <span className="v2-mono" style={{ fontSize: '0.8rem', color: isArcade ? '#f97316' : '#f43f5e', fontWeight: 800 }}>
              {landingData.valueProps.engagement.tag}
            </span>
            <h2 className="v2-section-title v2-heading" style={{ color: isLight ? '#0f172a' : '#fff', fontSize: 'clamp(2rem, 3.5vw, 2.8rem)', margin: '8px 0 20px' }}>
              {landingData.valueProps.engagement.title}
            </h2>
            <p style={{ color: isLight ? '#475569' : '#94a3b8', fontSize: '1.05rem', lineHeight: 1.6, marginBottom: '24px' }}>
              {landingData.valueProps.engagement.desc}
            </p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '10px', color: isLight ? '#334155' : '#e2e8f0', fontSize: '0.95rem' }}>
                <CheckCircle2 size={18} color="#f43f5e" /> {landingData.valueProps.engagement.bullet1}
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '10px', color: isLight ? '#334155' : '#e2e8f0', fontSize: '0.95rem' }}>
                <CheckCircle2 size={18} color="#f43f5e" /> {landingData.valueProps.engagement.bullet2}
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* BENTO GRID COM OS 8 GRANDES DIFERENCIAIS */}
      <section id="radar" className="v2-bento-section">
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <span className="v2-mono" style={{ fontSize: '0.85rem', color: isArcade ? '#f97316' : '#06b6d4', fontWeight: 800 }}>
            OS RECURSOS QUE MUDAM O JOGO
          </span>
          <h2 className="v2-section-heading v2-heading" style={{ color: isLight ? '#0f172a' : '#fff', marginTop: '8px' }}>
            Por que escolher o Nutrivvo para seu consultório?
          </h2>
          <p style={{ color: isLight ? '#475569' : '#94a3b8', fontSize: '1.1rem', maxWidth: '680px', margin: '0 auto' }}>
            Ferramentas desenhadas especificamente para aumentar a adesão ao plano alimentar e reduzir o tempo de consulta.
          </p>
        </div>

        <div className="v2-bento-grid">
          {/* Card 1: Radar de Abandono */}
          <div className="v2-bento-box col-span-7" style={isLight ? { background: '#ffffff', borderColor: '#e2e8f0' } : {}}>
            <span className="v2-mono" style={{ fontSize: '0.75rem', color: isArcade ? '#f97316' : '#c084fc', fontWeight: 700 }}>{landingData.radar.tag}</span>
            <h3 className="v2-heading" style={{ fontSize: '1.45rem', color: isLight ? '#0f172a' : '#fff', margin: '4px 0 12px' }}>{landingData.radar.title}</h3>
            <p style={{ color: isLight ? '#475569' : '#94a3b8', fontSize: '0.94rem', margin: '0 0 20px' }}>{landingData.radar.desc}</p>
            
            <div className="v2-radar-hud" style={isLight ? { background: '#f8fafc', borderColor: '#cbd5e1' } : {}}>
              <div className="v2-radar-sweep" />
              <div className="v2-radar-circle-inner" />
              <div className="v2-radar-circle-center" />
              <div className="v2-radar-blip v2-blip-critical" />
              <div className="v2-radar-blip v2-blip-warning" />
              <div className="v2-radar-blip v2-blip-safe" />
            </div>

            <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {landingData.radar.patients.map((p, idx) => (
                <div key={idx} className="v2-telemetry-row" style={isLight ? { background: '#f8fafc', borderColor: '#e2e8f0' } : {}}>
                  <div>
                    <div style={{ color: isLight ? '#0f172a' : '#fff', fontWeight: 700, fontSize: '0.88rem' }}>{p.name}</div>
                    <div className="v2-mono" style={{ color: p.status === 'critical' ? '#f43f5e' : p.status === 'warning' ? '#f59e0b' : '#10b981', fontSize: '0.72rem' }}>{p.detail}</div>
                  </div>
                  <span className={`v2-status-pill ${p.status === 'critical' ? 'v2-status-red' : p.status === 'warning' ? 'v2-status-yellow' : 'v2-status-green'}`}>
                    ● {p.badge}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Card 2: Secretária Telegram */}
          <div className="v2-bento-box col-span-5" style={isLight ? { background: '#ffffff', borderColor: '#e2e8f0' } : {}}>
            <span className="v2-mono" style={{ fontSize: '0.75rem', color: isArcade ? '#f97316' : '#06b6d4', fontWeight: 700 }}>{landingData.telegram.tag}</span>
            <h3 className="v2-heading" style={{ fontSize: '1.45rem', color: isLight ? '#0f172a' : '#fff', margin: '4px 0 12px' }}>{landingData.telegram.title}</h3>
            <p style={{ color: isLight ? '#475569' : '#94a3b8', fontSize: '0.94rem', margin: 0 }}>{landingData.telegram.desc}</p>
            <div className="v2-telegram-terminal">
              {landingData.telegram.chat.map((c, idx) => (
                <div key={idx} className={`v2-terminal-chat-bubble ${c.sender === 'bot' ? 'v2-term-bot' : 'v2-term-user'}`}>
                  {c.text}
                </div>
              ))}
            </div>
          </div>

          {/* Card 3: Check-in por Foto */}
          <div className="v2-bento-box col-span-4" style={isLight ? { background: '#ffffff', borderColor: '#e2e8f0' } : {}}>
            <span className="v2-mono" style={{ fontSize: '0.75rem', color: '#06b6d4', fontWeight: 700 }}>{landingData.scanner.tag}</span>
            <h3 className="v2-heading" style={{ fontSize: '1.25rem', color: isLight ? '#0f172a' : '#fff', margin: '4px 0 8px' }}>{landingData.scanner.title}</h3>
            <p style={{ color: isLight ? '#475569' : '#94a3b8', fontSize: '0.9rem', margin: 0 }}>{landingData.scanner.desc}</p>
            <div className="v2-scanner-container">
              <div className="v2-scanner-laser" />
              <img src={landingData.scanner.img} alt="Scanner" className="v2-scanner-bg" />
              <div className="v2-target-box">
                <span className="v2-target-label">{landingData.scanner.confidence}</span>
                <span className="v2-target-telemetry">{landingData.scanner.telemetry}</span>
              </div>
            </div>
          </div>

          {/* Card 4: Gamificação & XP */}
          <div className="v2-bento-box col-span-4" style={isLight ? { background: '#ffffff', borderColor: '#e2e8f0' } : {}}>
            <span className="v2-mono" style={{ fontSize: '0.75rem', color: '#f43f5e', fontWeight: 700 }}>{landingData.gamification.tag}</span>
            <h3 className="v2-heading" style={{ fontSize: '1.25rem', color: isLight ? '#0f172a' : '#fff', margin: '4px 0 8px' }}>{landingData.gamification.title}</h3>
            <p style={{ color: isLight ? '#475569' : '#94a3b8', fontSize: '0.9rem', margin: 0 }}>{landingData.gamification.desc}</p>
            <div style={{ marginTop: 'auto', background: isLight ? '#f8fafc' : 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '14px', border: isLight ? '1px solid #e2e8f0' : '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="v2-mono" style={{ fontSize: '0.8rem', color: '#f59e0b' }}>{landingData.gamification.level}</span>
                <span className="v2-mono" style={{ fontSize: '0.85rem', color: isLight ? '#0f172a' : '#fff', fontWeight: 800 }}>{landingData.gamification.streak}</span>
              </div>
              <div className="v2-energy-bar-wrap"><div className="v2-energy-bar-fill" /></div>
            </div>
          </div>

          {/* Card 5: Dietas com IA */}
          <div className="v2-bento-box col-span-4" style={isLight ? { background: '#ffffff', borderColor: '#e2e8f0' } : {}}>
            <span className="v2-mono" style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 700 }}>{landingData.generator.tag}</span>
            <h3 className="v2-heading" style={{ fontSize: '1.25rem', color: isLight ? '#0f172a' : '#fff', margin: '4px 0 8px' }}>{landingData.generator.title}</h3>
            <p style={{ color: isLight ? '#475569' : '#94a3b8', fontSize: '0.9rem', margin: 0 }}>{landingData.generator.desc}</p>
            <div style={{ marginTop: 'auto', background: isLight ? '#f0fdf4' : 'rgba(16, 185, 129, 0.05)', padding: '16px', borderRadius: '14px', border: isLight ? '1px solid #bbf7d0' : '1px solid rgba(16, 185, 129, 0.25)' }}>
              <div style={{ color: isLight ? '#166534' : '#fff', fontSize: '0.88rem', fontWeight: 700 }}>{landingData.generator.result}</div>
            </div>
          </div>

          {/* Card 6: Ficha de Treino */}
          <div className="v2-bento-box col-span-4" style={isLight ? { background: '#ffffff', borderColor: '#e2e8f0' } : {}}>
            <span className="v2-mono" style={{ fontSize: '0.75rem', color: '#f472b6', fontWeight: 700 }}>{landingData.workout.tag}</span>
            <h3 className="v2-heading" style={{ fontSize: '1.25rem', color: isLight ? '#0f172a' : '#fff', margin: '4px 0 8px' }}>{landingData.workout.title}</h3>
            <p style={{ color: isLight ? '#475569' : '#94a3b8', fontSize: '0.9rem', margin: 0 }}>{landingData.workout.desc}</p>
            <div style={{ marginTop: 'auto', background: isLight ? '#fdf2f8' : 'rgba(236, 72, 153, 0.05)', padding: '16px', borderRadius: '14px', border: isLight ? '1px solid #fbcfe8' : '1px solid rgba(236, 72, 153, 0.25)' }}>
              <div style={{ color: isLight ? '#9d174d' : '#fff', fontSize: '0.88rem', fontWeight: 700 }}>{landingData.workout.result}</div>
            </div>
          </div>

          {/* Card 7: Análise de Exames */}
          <div className="v2-bento-box col-span-4" style={isLight ? { background: '#ffffff', borderColor: '#e2e8f0' } : {}}>
            <span className="v2-mono" style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: 700 }}>{landingData.exams.tag}</span>
            <h3 className="v2-heading" style={{ fontSize: '1.25rem', color: isLight ? '#0f172a' : '#fff', margin: '4px 0 8px' }}>{landingData.exams.title}</h3>
            <p style={{ color: isLight ? '#475569' : '#94a3b8', fontSize: '0.9rem', margin: 0 }}>{landingData.exams.desc}</p>
            <div style={{ marginTop: 'auto', background: isLight ? '#ecfdf5' : 'rgba(52, 211, 153, 0.05)', padding: '16px', borderRadius: '14px', border: isLight ? '1px solid #a7f3d0' : '1px solid rgba(52, 211, 153, 0.25)' }}>
              <div style={{ color: isLight ? '#065f46' : '#fff', fontSize: '0.88rem', fontWeight: 700 }}>{landingData.exams.result}</div>
            </div>
          </div>

          {/* Card 8: Financeiro */}
          <div className="v2-bento-box col-span-4" style={isLight ? { background: '#ffffff', borderColor: '#e2e8f0' } : {}}>
            <span className="v2-mono" style={{ fontSize: '0.75rem', color: '#fbbf24', fontWeight: 700 }}>{landingData.financial.tag}</span>
            <h3 className="v2-heading" style={{ fontSize: '1.25rem', color: isLight ? '#0f172a' : '#fff', margin: '4px 0 8px' }}>{landingData.financial.title}</h3>
            <p style={{ color: isLight ? '#475569' : '#94a3b8', fontSize: '0.9rem', margin: 0 }}>{landingData.financial.desc}</p>
            <div style={{ marginTop: 'auto', background: isLight ? '#fffbeb' : 'rgba(251, 191, 36, 0.05)', padding: '16px', borderRadius: '14px', border: isLight ? '1px solid #fde68a' : '1px solid rgba(251, 191, 36, 0.25)' }}>
              <div style={{ color: isLight ? '#92400e' : '#fff', fontSize: '0.88rem', fontWeight: 700 }}>{landingData.financial.result}</div>
            </div>
          </div>
        </div>

        {/* Linha de Métricas */}
        <div className="v2-stats-grid">
          {landingData.metrics.map((m, idx) => (
            <div key={idx} className="v2-stat-tile" style={isLight ? { background: '#ffffff', borderColor: '#e2e8f0' } : {}}>
              <div className="v2-stat-num" style={isLight ? { color: '#0f172a', background: 'none', WebkitTextFillColor: 'initial' } : {}}>{m.num}</div>
              <div style={{ color: isLight ? '#0f172a' : '#fff', fontWeight: 700, fontSize: '1.1rem', marginBottom: '4px' }}>{m.label}</div>
              <div style={{ color: isLight ? '#64748b' : '#94a3b8', fontSize: '0.85rem' }}>{m.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* MATRIZ COMPARATIVA (NUTauthor vs PLANILHAS) */}
      <section id="comparativo" className="v2-bento-section" style={{ paddingTop: '20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 className="v2-section-heading v2-heading" style={{ color: isLight ? '#0f172a' : '#fff' }}>
            Nutrivvo com IA vs Métodos Tradicionais
          </h2>
          <p style={{ color: isLight ? '#475569' : '#94a3b8', fontSize: '1.05rem', maxWidth: '600px', margin: '0 auto' }}>
            Veja por que continuar no WhatsApp e planilhas limita o crescimento da sua clínica.
          </p>
        </div>

        <div className="v2-table-wrapper" style={isLight ? { background: '#ffffff', borderColor: '#e2e8f0' } : {}}>
          <table className="v2-matrix-table">
            <thead>
              <tr>
                <th style={isLight ? { color: '#0f172a', background: '#f8fafc' } : { width: '40%' }}>Recurso / Experiência</th>
                <th className="v2-th-ai" style={{ width: '30%' }}>Nutrivvo com IA & Telegram</th>
                <th style={isLight ? { color: '#64748b', background: '#f8fafc' } : { width: '30%' }}>WhatsApp Pessoal + Planilhas</th>
              </tr>
            </thead>
            <tbody>
              {landingData.comparison.map((c, idx) => (
                <tr key={idx} style={isLight ? { borderColor: '#e2e8f0' } : {}}>
                  <td style={isLight ? { color: '#334155' } : {}}>{c.feature}</td>
                  <td className="v2-td-ai">
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981' }}>
                      <CheckCircle2 size={18} /> {c.nutrivvo}
                    </span>
                  </td>
                  <td>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f43f5e' }}>
                      <XCircle size={18} /> {c.old}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* SEÇÃO DE SEGURANÇA E PRIVACIDADE (LGPD) */}
      <section className="v2-section" style={{ padding: '40px 20px 80px' }}>
        <div style={{
          maxWidth: '960px',
          margin: '0 auto',
          background: isLight ? '#f1f5f9' : 'rgba(255,255,255,0.02)',
          border: isLight ? '1px solid #cbd5e1' : '1px solid rgba(255,255,255,0.08)',
          borderRadius: '24px',
          padding: '40px 32px',
          textAlign: 'center'
        }}>
          <div style={{ width: '50px', height: '50px', borderRadius: '14px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Lock size={26} color="#10b981" />
          </div>
          <span className="v2-mono" style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 800 }}>{landingData.security.tag}</span>
          <h3 className="v2-heading" style={{ fontSize: '1.6rem', color: isLight ? '#0f172a' : '#fff', margin: '8px 0 12px' }}>{landingData.security.title}</h3>
          <p style={{ color: isLight ? '#475569' : '#94a3b8', fontSize: '1rem', maxWidth: '720px', margin: '0 auto', lineHeight: 1.6 }}>
            {landingData.security.desc}
          </p>
        </div>
      </section>

      {/* TABELA DE PREÇOS */}
      <section id="precos" className="v2-bento-section">
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 className="v2-section-heading v2-heading" style={isLight ? { color: '#0f172a' } : {}}>Planos desenhados para o seu momento</h2>
          <p style={{ color: isLight ? '#475569' : '#94a3b8', fontSize: '1.05rem', margin: '0 auto' }}>
            Comece grátis, teste com pacientes reais e faça o upgrade apenas quando sua clínica estiver escalando.
          </p>
          <div style={{ display: 'inline-flex', gap: '8px', background: isLight ? '#f1f5f9' : 'rgba(255,255,255,0.04)', padding: '6px 10px', borderRadius: '9999px', border: isLight ? '1px solid #cbd5e1' : '1px solid rgba(255,255,255,0.1)', marginTop: '20px' }}>
            <button onClick={() => setBillingCycle('mensal')} style={{ background: billingCycle === 'mensal' ? (isArcade ? '#f97316' : '#a855f7') : 'transparent', color: billingCycle === 'mensal' ? '#fff' : (isLight ? '#64748b' : '#94a3b8'), border: 'none', padding: '6px 16px', borderRadius: '9999px', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem' }}>Mensal</button>
            <button onClick={() => setBillingCycle('anual')} style={{ background: billingCycle === 'anual' ? (isArcade ? '#f97316' : '#a855f7') : 'transparent', color: billingCycle === 'anual' ? '#fff' : (isLight ? '#64748b' : '#94a3b8'), border: 'none', padding: '6px 16px', borderRadius: '9999px', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem' }}>Anual (2 meses grátis)</button>
          </div>
        </div>

        <div className="v2-pricing-grid">
          {landingData.pricing.map((p, idx) => (
            <div key={idx} className={`v2-price-card ${p.popular ? 'v2-price-highlight' : ''}`} style={isLight ? { background: '#ffffff', borderColor: p.popular ? '#a855f7' : '#e2e8f0', boxShadow: p.popular ? '0 10px 30px rgba(168,85,247,0.15)' : 'none' } : {}}>
              {p.popular && (
                <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: isArcade ? '#f97316' : '#a855f7', color: '#fff', fontSize: '0.72rem', fontWeight: 800, padding: '4px 14px', borderRadius: '9999px', textTransform: 'uppercase' }}>
                  Mais Escolhido
                </div>
              )}
              <h3 className="v2-heading" style={{ fontSize: '1.4rem', color: isLight ? '#0f172a' : '#fff', margin: '0 0 8px' }}>{p.name}</h3>
              <p style={{ color: isLight ? '#64748b' : '#94a3b8', fontSize: '0.9rem', marginBottom: '24px' }}>{p.desc}</p>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: isLight ? '#0f172a' : '#fff', marginBottom: '24px' }}>
                {p.price || (billingCycle === 'anual' ? p.priceAnual : p.priceMensal)}
                <span style={{ fontSize: '0.9rem', color: '#64748b' }}>{p.period}</span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.9rem', color: isLight ? '#334155' : '#cbd5e1' }}>
                {p.features.map((f, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircle2 size={16} color="#10b981" /> {f}
                  </li>
                ))}
              </ul>
              <button
                className={p.popular ? 'v2-btn v2-btn-cyber' : (isLight ? 'v2-btn v2-btn-outline' : 'v2-btn v2-btn-glass')}
                style={{
                  width: '100%',
                  marginTop: 'auto',
                  background: p.popular && isArcade ? 'linear-gradient(135deg, #f97316, #ef4444)' : undefined,
                  color: !p.popular && isLight ? '#0f172a' : undefined
                }}
                onClick={() => navigate('/cadastro?role=nutricionista')}
              >
                {p.popular ? 'Assinar com 7 Dias Grátis' : 'Começar Grátis'}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="v2-bento-section" style={{ maxWidth: '850px' }}>
        <h2 className="v2-section-heading v2-heading" style={{ textAlign: 'center', marginBottom: '40px', color: isLight ? '#0f172a' : undefined }}>Perguntas Frequentes</h2>
        {landingData.faqs.map((faq, idx) => (
          <div key={idx} style={{ border: isLight ? '1px solid #e2e8f0' : '1px solid rgba(255,255,255,0.08)', background: isLight ? '#ffffff' : 'rgba(10, 12, 22, 0.7)', borderRadius: '14px', marginBottom: '12px', overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: isLight ? '#0f172a' : '#fff', fontWeight: 600, fontSize: '1.05rem' }} onClick={() => toggleFaq(idx)}>
              <span>{faq.q}</span>
              <ChevronDown size={18} style={{ transform: openFaq === idx ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.25s ease', color: '#a855f7' }} />
            </div>
            {openFaq === idx && <div style={{ padding: '0 24px 20px', color: isLight ? '#475569' : '#94a3b8', lineHeight: 1.6, fontSize: '0.95rem' }}>{faq.a}</div>}
          </div>
        ))}
      </section>

      {/* FINAL AURORA CTA */}
      <section className="v2-aurora-cta" style={isLight ? { background: 'linear-gradient(135deg, #ede9fe 0%, #e0f2fe 100%)', borderColor: '#cbd5e1' } : {}}>
        <h2 className="v2-heading" style={{ fontSize: 'clamp(2.4rem, 5vw, 3.8rem)', color: isLight ? '#0f172a' : '#fff', margin: '0 auto 18px', maxWidth: '850px' }}>{landingData.finalCta.title}</h2>
        <p style={{ color: isLight ? '#475569' : '#cbd5e1', fontSize: '1.2rem', maxWidth: '640px', margin: '0 auto 40px' }}>{landingData.finalCta.desc}</p>
        <button
          className="v2-btn v2-btn-cyber"
          style={{
            padding: '18px 42px',
            fontSize: '1.15rem',
            background: isArcade ? 'linear-gradient(135deg, #f97316, #ef4444)' : undefined
          }}
          onClick={() => navigate('/cadastro?role=nutricionista')}
        >
          {landingData.finalCta.btn} <ArrowRight size={22} />
        </button>
      </section>

      <footer style={{ borderTop: isLight ? '1px solid #e2e8f0' : '1px solid rgba(255,255,255,0.08)', padding: '50px 20px', textAlign: 'center', color: '#64748b' }}>
        <p>© 2026 Nutrivvo. Todos os direitos reservados. — {titleStyle}</p>
        <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '6px' }}>Dados de cada paciente isolados por regra própria no banco — nenhum nutricionista vê paciente de outro.</p>
      </footer>
    </div>
  );
}
