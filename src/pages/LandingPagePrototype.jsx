import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Sparkles,
  Bot,
  Activity,
  Flame,
  BrainCircuit,
  ShieldCheck,
  Dumbbell,
  Stethoscope,
  Camera,
  CheckCircle2,
  XCircle,
  ChevronDown,
  Zap,
  Terminal,
  Crosshair,
  Radio,
  Sliders,
  Cpu
} from 'lucide-react';
import PreviewSwitcher from '../components/landing/PreviewSwitcher';
import '../landing-v2.css';
import '../landing-previews.css';

export default function LandingPagePrototype() {
  const navigate = useNavigate();
  const [activeMockupTab, setActiveMockupTab] = useState('nutri');
  const [billingCycle, setBillingCycle] = useState('anual');
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const specialties = [
    'SYS_PROTO: NUTRIÇÃO CLÍNICA FUNCIONAL',
    'AI_MODULE: PERFORMANCE ESPORTIVA',
    'METABOLIC_ENGINE: EMAGRECIMENTO ACELERADO',
    'BIO_DATA: SAÚDE INTESTINAL & MICROBIOTA',
    'NEURO_FEEDBACK: NUTRIÇÃO COMPORTAMENTAL',
    'FITOTERAPIA CLÍNICA AVANÇADA'
  ];

  const faqs = [
    {
      q: 'Como funciona a Secretária IA no Telegram sem usar meu chip pessoal?',
      a: 'O Nutrivvo conecta um bot verificado exclusivo para a sua clínica. Seus pacientes conversam com a IA pelo Telegram de forma instantânea: ela confirma consultas, cobra fotos do diário e tira dúvidas rotineiras sem tocar no seu WhatsApp pessoal.'
    },
    {
      q: 'Como o Radar de Abandono antecipa o sumiço do paciente?',
      a: 'Nosso algoritmo de retenção cruza dados de frequência de abertura do app, envio de fotos de prato e interação com a ofensiva diária. Ao detectar queda de engajamento por mais de 3 dias, o CRM gera um alerta preventivo em vermelho ou amarelo antes da perda do paciente.'
    },
    {
      q: 'Posso importar pacientes de prontuários antigos ou planilhas?',
      a: 'Sim! Com nosso importador inteligente, você sobe planilhas CSV ou cadastra novos pacientes em 30 segundos. Cada paciente recebe um link de acesso com chave criptografada para o aplicativo gamificado.'
    },
    {
      q: 'O paciente precisa pagar para usar o aplicativo?',
      a: 'Não. O app do paciente é 100% gratuito para quem você atender, incluindo a ofensiva diária de XP, registro fotográfico por IA e lembretes de hidratação.'
    }
  ];

  return (
    <div className="v2-landing">
      {/* Sci-Fi Neon Grid & Laser Beams */}
      <div className="v2-neon-grid" />
      <div className="v2-laser-beam" style={{ left: '15%', animationDelay: '0s' }} />
      <div className="v2-laser-beam" style={{ left: '85%', animationDelay: '3.5s' }} />

      <PreviewSwitcher current="p1" />

      {/* Floating Glass Navbar */}
      <header className="v2-nav-wrap">
        <nav className="v2-nav">
          <a href="#" className="v2-logo">
            <div className="v2-logo-icon">
              <Cpu size={18} color="#fff" />
            </div>
            <span className="v2-heading">Nutrivvo<span style={{ color: '#06b6d4' }}>.ai</span></span>
          </a>

          <div className="v2-nav-links">
            <a href="#radar">Radar Anti-Abandono</a>
            <a href="#scanner">Visão Computacional</a>
            <a href="#telegram">Secretária IA</a>
            <a href="#comparativo">Matriz Comparativa</a>
            <a href="#precos">Planos</a>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              className="v2-btn v2-btn-glass"
              style={{ padding: '8px 18px', fontSize: '0.86rem' }}
              onClick={() => navigate('/login')}
            >
              Entrar
            </button>
            <button
              className="v2-btn v2-btn-cyber"
              style={{ padding: '8px 20px', fontSize: '0.86rem' }}
              onClick={() => navigate('/cadastro?role=nutricionista')}
            >
              Criar Clínica Grátis
            </button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="v2-hero">
        <div className="v2-hero-pill">
          <span className="glow-dot" />
          <span className="v2-mono">SISTEMA NEURAL DE RETENÇÃO CLÍNICA</span>
        </div>

        <h1 className="v2-hero-title v2-heading">
          Seu paciente costuma sumir entre consultas. <br />
          <span className="gradient-text">O Nutrivvo detecta e impede.</span>
        </h1>

        <p className="v2-hero-desc">
          Monitoramento em tempo real com radar preditivo de evasão, secretária autônoma no Telegram
          e app gamificado com visão computacional para análise instantânea de refeições.
        </p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', flexWrap: 'wrap', marginBottom: '24px' }}>
          <button
            className="v2-btn v2-btn-cyber"
            style={{ padding: '16px 36px', fontSize: '1.05rem' }}
            onClick={() => navigate('/cadastro?role=nutricionista')}
          >
            Ativar Sistema Grátis <ArrowRight size={18} />
          </button>
          <button
            className="v2-btn v2-btn-glass"
            style={{ padding: '16px 28px', fontSize: '1.05rem' }}
            onClick={() => {
              const el = document.getElementById('radar');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            <Radio size={18} color="#06b6d4" /> Ver Radar Operacional
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px', fontSize: '0.85rem', color: '#64748b' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldCheck size={16} color="#10b981" /> Sem cartão de crédito
          </span>
          <span>•</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Zap size={16} color="#06b6d4" /> Setup em 120 segundos
          </span>
          <span>•</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Terminal size={16} color="#a855f7" /> Acesso Paciente Gratuito
          </span>
        </div>

        {/* Dual Isometric Mockup with Live Floating HUDs */}
        <div className="v2-hero-mockups">
          {/* Hologram Card 1 (Esquerda) */}
          <div className="v2-holo-card v2-holo-card-left">
            <div style={{ background: 'rgba(244, 63, 94, 0.2)', padding: '10px', borderRadius: '12px', border: '1px solid rgba(244, 63, 94, 0.4)' }}>
              <BrainCircuit size={22} color="#f43f5e" />
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '0.7rem', color: '#fda4af', fontFamily: 'JetBrains Mono', fontWeight: 700 }}>
                [TELEMETRY_ALERT: CHURN_RISK]
              </div>
              <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#fff' }}>Camila Silva (82% risco)</div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>3 dias sem registrar refeição</div>
            </div>
          </div>

          {/* Hologram Card 2 (Direita) */}
          <div className="v2-holo-card v2-holo-card-right">
            <div style={{ background: 'rgba(16, 185, 129, 0.2)', padding: '10px', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.4)' }}>
              <Flame size={22} color="#10b981" />
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '0.7rem', color: '#6ee7b7', fontFamily: 'JetBrains Mono', fontWeight: 700 }}>
                [STREAK_SYNC: ACTIVE]
              </div>
              <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#fff' }}>14 Dias de Ofensiva</div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>+120 XP sincronizado no app</div>
            </div>
          </div>

          {/* Frame com Border Beam (21st.dev) */}
          <div className="v2-border-beam-container" style={{ width: '100%', maxWidth: '980px' }}>
            <div className="v2-border-beam-content" style={{ padding: '16px' }}>
              <div className="v2-mockup-tab-bar">
                <div className="v2-browser-dots">
                  <span className="v2-browser-dot" style={{ background: '#f43f5e' }} />
                  <span className="v2-browser-dot" style={{ background: '#f59e0b' }} />
                  <span className="v2-browser-dot" style={{ background: '#10b981' }} />
                </div>

                <div className="v2-tab-switch">
                  <button
                    className={`v2-tab-item ${activeMockupTab === 'nutri' ? 'active' : ''}`}
                    onClick={() => setActiveMockupTab('nutri')}
                  >
                    <Stethoscope size={15} /> CRM Clínico (Nutricionista)
                  </button>
                  <button
                    className={`v2-tab-item ${activeMockupTab === 'paciente' ? 'active' : ''}`}
                    onClick={() => setActiveMockupTab('paciente')}
                  >
                    <Activity size={15} /> App Gamificado (Paciente)
                  </button>
                </div>

                <div className="v2-mono" style={{ fontSize: '0.75rem', color: '#06b6d4' }}>
                  SECURE_SESSION_256_GCM
                </div>
              </div>

              <img
                src={activeMockupTab === 'nutri' ? '/screen_nutri.png' : '/screen_paciente.png'}
                alt="Nutrivvo Interface"
                className="v2-mockup-screen"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Infinite Terminal Marquee */}
      <section style={{ borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '24px 0', background: 'rgba(0,0,0,0.4)', overflow: 'hidden' }}>
        <div style={{ display: 'flex', gap: '48px', width: 'max-content', animation: 'v2Marquee 26s linear infinite' }}>
          {[...specialties, ...specialties, ...specialties].map((item, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#64748b', fontSize: '0.82rem', fontFamily: 'JetBrains Mono', fontWeight: 600 }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#06b6d4', boxShadow: '0 0 8px #06b6d4' }} />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Futuristic Bento Grid Section */}
      <section className="v2-bento-section">
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <div className="v2-section-badge">
            <Radio size={14} /> ARQUITETURA DE RETENÇÃO PROATIVA
          </div>
          <h2 className="v2-section-heading v2-heading">
            O ecossistema que mantém seu consultório lotado
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '1.1rem', maxWidth: '680px', margin: '0 auto' }}>
            Cada paciente é monitorado por telemetria preditiva, eliminando a evasão silenciosa e dobrando os retornos.
          </p>
        </div>

        <div className="v2-bento-grid">
          {/* Card 1: Radar Sci-Fi (Col 7) */}
          <div id="radar" className="v2-bento-box col-span-7">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ background: 'rgba(168, 85, 247, 0.2)', padding: '10px', borderRadius: '10px', border: '1px solid rgba(168, 85, 247, 0.4)' }}>
                  <Radio size={22} color="#c084fc" />
                </div>
                <div>
                  <div className="v2-mono" style={{ fontSize: '0.72rem', color: '#c084fc', fontWeight: 700 }}>
                    RADAR_CORE_ONLINE
                  </div>
                  <h3 className="v2-heading" style={{ fontSize: '1.45rem', color: '#fff', margin: 0 }}>
                    Radar de Abandono em Tempo Real
                  </h3>
                </div>
              </div>
              <span className="v2-mono" style={{ fontSize: '0.75rem', color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', padding: '4px 10px', borderRadius: '9999px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                ● SCANNER ATIVO
              </span>
            </div>

            <p style={{ color: '#94a3b8', fontSize: '0.94rem', margin: '0 0 20px' }}>
              A IA mapeia o ciclo de engajamento do paciente (abertura de app, fotos e resposta no bot) e classifica os riscos antes que ocorra a desistência.
            </p>

            {/* Radar Circular Holográfico */}
            <div className="v2-radar-hud">
              <div className="v2-radar-sweep" />
              <div className="v2-radar-circle-inner" />
              <div className="v2-radar-circle-center" />
              <div className="v2-radar-line-h" />
              <div className="v2-radar-line-v" />

              {/* Blips */}
              <div className="v2-radar-blip v2-blip-critical" title="Paciente em Risco Crítico" />
              <div className="v2-radar-blip v2-blip-warning" title="Atenção" />
              <div className="v2-radar-blip v2-blip-safe" title="Engajado" />
            </div>

            {/* Lista de Telemetria Abaixo do Radar */}
            <div style={{ marginTop: '24px' }}>
              <div className="v2-telemetry-row">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f43f5e', boxShadow: '0 0 10px #f43f5e' }} />
                  <div>
                    <div style={{ color: '#fff', fontWeight: 700, fontSize: '0.88rem' }}>Camila Silva</div>
                    <div className="v2-mono" style={{ color: '#fda4af', fontSize: '0.72rem' }}>RISCO: 82% · INATIVIDADE HÁ 4 DIAS</div>
                  </div>
                </div>
                <button
                  className="v2-btn v2-btn-glass"
                  style={{ padding: '4px 12px', fontSize: '0.75rem', borderColor: 'rgba(244, 63, 94, 0.4)' }}
                  onClick={() => navigate('/cadastro?role=nutricionista')}
                >
                  Resgatar Paciente
                </button>
              </div>

              <div className="v2-telemetry-row">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 10px #10b981' }} />
                  <div>
                    <div style={{ color: '#fff', fontWeight: 700, fontSize: '0.88rem' }}>Rodrigo Mendes</div>
                    <div className="v2-mono" style={{ color: '#6ee7b7', fontSize: '0.72rem' }}>ADESÃO: 98% · OFENSIVA DE 14 DIAS</div>
                  </div>
                </div>
                <span className="v2-mono" style={{ color: '#10b981', fontSize: '0.75rem', fontWeight: 700 }}>
                  ESTÁVEL
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Secretária IA Telegram Terminal (Col 5) */}
          <div id="telegram" className="v2-bento-box col-span-5">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{ background: 'rgba(6, 182, 212, 0.2)', padding: '10px', borderRadius: '10px', border: '1px solid rgba(6, 182, 212, 0.4)' }}>
                <Bot size={22} color="#06b6d4" />
              </div>
              <div>
                <div className="v2-mono" style={{ fontSize: '0.72rem', color: '#06b6d4', fontWeight: 700 }}>
                  AUTONOMOUS_SECRETARY
                </div>
                <h3 className="v2-heading" style={{ fontSize: '1.45rem', color: '#fff', margin: 0 }}>
                  Agente IA no Telegram
                </h3>
              </div>
            </div>

            <p style={{ color: '#94a3b8', fontSize: '0.94rem', margin: 0 }}>
              Confirma e remarca horários, cobra as fotos das refeições e tira dúvidas rotineiras 24 horas por dia.
            </p>

            <div className="v2-telegram-terminal">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '8px' }}>
                <span className="v2-mono" style={{ fontSize: '0.72rem', color: '#06b6d4' }}>
                  TELEGRAM_BOT_V2 // CLINICAL_DISPATCH
                </span>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
              </div>

              <div className="v2-terminal-chat-bubble v2-term-bot">
                🤖 <strong>NutriBot IA:</strong> Olá Marcos! Sua consulta é amanhã às 14:00. Posso confirmar seu horário com a Dra. Mariana?
              </div>

              <div className="v2-terminal-chat-bubble v2-term-user">
                Confirmado! E acabei de postar a foto do almoço.
              </div>

              <div className="v2-terminal-chat-bubble v2-term-bot">
                🎯 <strong>Prato Detectado:</strong> 150g Frango + Arroz integral + Legumes. Registrado com sucesso no diário! <strong>+35 XP</strong> creditados.
              </div>
            </div>
          </div>

          {/* Card 3: Food Scanner HUD com Laser (Col 4) */}
          <div id="scanner" className="v2-bento-box col-span-4">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <div style={{ background: 'rgba(6, 182, 212, 0.2)', padding: '8px', borderRadius: '8px' }}>
                <Camera size={20} color="#06b6d4" />
              </div>
              <h3 className="v2-heading" style={{ fontSize: '1.25rem', color: '#fff', margin: 0 }}>
                Scanner Fotográfico IA
              </h3>
            </div>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: 0 }}>
              Visão computacional que extrai os macros do prato por foto instantânea.
            </p>

            <div className="v2-scanner-container">
              <div className="v2-scanner-laser" />
              <img
                src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80"
                alt="Scanner de Alimentos"
                className="v2-scanner-bg"
              />
              <div className="v2-target-box">
                <span className="v2-target-label">IA_CONFIDENCE: 98.4%</span>
                <span className="v2-target-telemetry">42g PROTEÍNA ESTIMADA</span>
              </div>
            </div>
          </div>

          {/* Card 4: Gamificação & Plasma Bar (Col 4) */}
          <div className="v2-bento-box col-span-4">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <div style={{ background: 'rgba(244, 63, 94, 0.2)', padding: '8px', borderRadius: '8px' }}>
                <Flame size={20} color="#f43f5e" />
              </div>
              <h3 className="v2-heading" style={{ fontSize: '1.25rem', color: '#fff', margin: 0 }}>
                Ofensiva & XP Core
              </h3>
            </div>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: 0 }}>
              Gamificação contínua que transforma a rotina alimentar em um game de hábitos saudáveis.
            </p>

            <div style={{ marginTop: 'auto', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="v2-mono" style={{ fontSize: '0.8rem', color: '#f59e0b' }}>NÍVEL 4 // FOCO TOTAL</span>
                <span className="v2-mono" style={{ fontSize: '0.85rem', color: '#fff', fontWeight: 800 }}>14 DIAS SEGUIDOS</span>
              </div>
              <div className="v2-energy-bar-wrap">
                <div className="v2-energy-bar-fill" />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '0.75rem', color: '#94a3b8' }}>
                <span>XP Atual: 1.840</span>
                <span style={{ color: '#10b981' }}>+120 XP Hoje</span>
              </div>
            </div>
          </div>

          {/* Card 5: Dietas e Treinos em Segundos (Col 4) */}
          <div className="v2-bento-box col-span-4">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <div style={{ background: 'rgba(16, 185, 129, 0.2)', padding: '8px', borderRadius: '8px' }}>
                <Dumbbell size={20} color="#10b981" />
              </div>
              <h3 className="v2-heading" style={{ fontSize: '1.25rem', color: '#fff', margin: 0 }}>
                Gerador Clínico de IA
              </h3>
            </div>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: 0 }}>
              Cardápios de 1 a 30 dias com receitas reais e fichas de treino calibradas por exames laboratoriais.
            </p>

            <div style={{ marginTop: 'auto', background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: '14px', padding: '16px' }}>
              <div className="v2-mono" style={{ fontSize: '0.75rem', color: '#6ee7b7' }}>
                [CLINICAL_ENGINE: GENERATED]
              </div>
              <div style={{ color: '#fff', fontSize: '0.88rem', fontWeight: 700, marginTop: '4px' }}>
                Dieta Hipocalórica + Treino A/B
              </div>
              <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '4px' }}>
                Tempo de cálculo: 1.8s · Zero erro de cálculo de TMB
              </div>
            </div>
          </div>
        </div>

        {/* Futuristic Stats Grid */}
        <div className="v2-stats-grid">
          <div className="v2-stat-tile">
            <div className="v2-stat-num">+87%</div>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: '1.1rem', marginBottom: '4px' }}>
              Retenção Pós-Consulta
            </div>
            <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Pacientes continuam no plano entre o 2º e o 6º mês</div>
          </div>

          <div className="v2-stat-tile">
            <div className="v2-stat-num">14h</div>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: '1.1rem', marginBottom: '4px' }}>
              Economizadas / Mês
            </div>
            <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Automação de cobranças e confirmação no Telegram</div>
          </div>

          <div className="v2-stat-tile">
            <div className="v2-stat-num">3.2x</div>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: '1.1rem', marginBottom: '4px' }}>
              Mais Check-ins de Foto
            </div>
            <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Com a facilidade da visão computacional</div>
          </div>
        </div>
      </section>

      {/* Comparison Matrix Section */}
      <section id="comparativo" className="v2-bento-section" style={{ paddingTop: '40px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div className="v2-section-badge">BENCHMARK COMPARATIVO</div>
          <h2 className="v2-section-heading v2-heading">
            Nutrivvo Neural vs Métodos Manuais
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '1.05rem', maxWidth: '600px', margin: '0 auto' }}>
            A diferença real entre gastar horas no WhatsApp ou operar com inteligência clínica.
          </p>
        </div>

        <div className="v2-table-wrapper">
          <table className="v2-matrix-table">
            <thead>
              <tr>
                <th style={{ width: '40%' }}>Recurso Operacional</th>
                <th className="v2-th-ai" style={{ width: '30%' }}>Nutrivvo IA + Telegram</th>
                <th style={{ width: '30%' }}>WhatsApp Manual + Planilhas</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Identificação de risco de abandono</td>
                <td className="v2-td-ai">
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6ee7b7' }}>
                    <CheckCircle2 size={18} /> Radar preditivo em tempo real
                  </span>
                </td>
                <td>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f43f5e' }}>
                    <XCircle size={18} /> O paciente só avisa sumindo
                  </span>
                </td>
              </tr>
              <tr>
                <td>Cobrança de foto e lembrete de água</td>
                <td className="v2-td-ai">
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6ee7b7' }}>
                    <CheckCircle2 size={18} /> 100% autônomo pelo bot
                  </span>
                </td>
                <td>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f43f5e' }}>
                    <XCircle size={18} /> Você tem que digitar um por um
                  </span>
                </td>
              </tr>
              <tr>
                <td>Estimativa de refeição do paciente</td>
                <td className="v2-td-ai">
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6ee7b7' }}>
                    <CheckCircle2 size={18} /> Visão computacional instantânea
                  </span>
                </td>
                <td>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f43f5e' }}>
                    <XCircle size={18} /> Digitação manual frustrante
                  </span>
                </td>
              </tr>
              <tr>
                <td>Gamificação e Retenção Lúdica</td>
                <td className="v2-td-ai">
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6ee7b7' }}>
                    <CheckCircle2 size={18} /> Ofensiva diária, XP e Níveis
                  </span>
                </td>
                <td>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f43f5e' }}>
                    <XCircle size={18} /> Zero motivação visual
                  </span>
                </td>
              </tr>
              <tr>
                <td>Elaboração de cardápios completos</td>
                <td className="v2-td-ai">
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6ee7b7' }}>
                    <CheckCircle2 size={18} /> Gerado em 3 segundos com receitas
                  </span>
                </td>
                <td>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f43f5e' }}>
                    <XCircle size={18} /> 40 minutos copiando e colando
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Pricing Section with Conic Glow */}
      <section id="precos" className="v2-bento-section">
        <div style={{ textAlign: 'center', marginBottom: '50px' }}>
          <div className="v2-section-badge">INVESTIMENTO ESCALÁVEL</div>
          <h2 className="v2-section-heading v2-heading">Planos para todas as fases</h2>
          <p style={{ color: '#94a3b8', fontSize: '1.05rem', maxWidth: '600px', margin: '0 auto' }}>
            Comece no gratuito e escale conforme a demanda de pacientes aumentar.
          </p>

          {/* Billing Switch */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.04)', padding: '6px 10px', borderRadius: '9999px', border: '1px solid rgba(255,255,255,0.1)', marginTop: '28px' }}>
            <button
              onClick={() => setBillingCycle('mensal')}
              style={{
                background: billingCycle === 'mensal' ? '#a855f7' : 'transparent',
                color: billingCycle === 'mensal' ? '#fff' : '#94a3b8',
                border: 'none',
                padding: '6px 16px',
                borderRadius: '9999px',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: '0.85rem'
              }}
            >
              Mensal
            </button>
            <button
              onClick={() => setBillingCycle('anual')}
              style={{
                background: billingCycle === 'anual' ? '#a855f7' : 'transparent',
                color: billingCycle === 'anual' ? '#fff' : '#94a3b8',
                border: 'none',
                padding: '6px 16px',
                borderRadius: '9999px',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              Anual <span style={{ background: '#10b981', color: '#030408', fontSize: '0.7rem', fontWeight: 800, padding: '2px 6px', borderRadius: '4px' }}>2 MESES GRÁTIS</span>
            </button>
          </div>
        </div>

        <div className="v2-pricing-grid">
          {/* Card Free */}
          <div className="v2-price-card">
            <h3 className="v2-heading" style={{ fontSize: '1.4rem', color: '#fff', margin: '0 0 8px' }}>Gratuito</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '24px' }}>
              Para recém-formados e primeiros testes clínicos.
            </p>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#fff', marginBottom: '24px' }}>
              R$ 0 <span style={{ fontSize: '0.9rem', color: '#64748b' }}>/mês</span>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px', display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.9rem', color: '#cbd5e1' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={16} color="#10b981" /> Até 3 pacientes ativos</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={16} color="#10b981" /> Diário de refeições com fotos</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={16} color="#10b981" /> App do paciente com XP</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b' }}><XCircle size={16} /> Sem Radar Anti-Abandono</li>
            </ul>
            <button
              className="v2-btn v2-btn-glass"
              style={{ width: '100%', marginTop: 'auto' }}
              onClick={() => navigate('/cadastro?role=nutricionista')}
            >
              Criar Conta Grátis
            </button>
          </div>

          {/* Card Pro (Border Beam) */}
          <div className="v2-price-card v2-price-highlight">
            <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg, #a855f7, #06b6d4)', color: '#fff', fontSize: '0.72rem', fontWeight: 800, padding: '4px 14px', borderRadius: '9999px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Mais Escolhido
            </div>
            <h3 className="v2-heading" style={{ fontSize: '1.4rem', color: '#fff', margin: '0 0 8px' }}>Profissional IA</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '24px' }}>
              O arsenal completo para blindar sua retenção de pacientes.
            </p>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#fff', marginBottom: '24px' }}>
              {billingCycle === 'anual' ? 'R$ 79' : 'R$ 97'}
              <span style={{ fontSize: '0.9rem', color: '#64748b' }}>/mês</span>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px', display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.9rem', color: '#cbd5e1' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={16} color="#10b981" /> Pacientes ilimitados</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={16} color="#10b981" /> Radar de Abandono em tempo real</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={16} color="#10b981" /> Secretária no Telegram 24h</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={16} color="#10b981" /> Gerador de Cardápios & Treinos IA</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={16} color="#10b981" /> Gestão Financeira com cobranças</li>
            </ul>
            <button
              className="v2-btn v2-btn-cyber"
              style={{ width: '100%', marginTop: 'auto' }}
              onClick={() => navigate('/cadastro?role=nutricionista')}
            >
              Testar 7 Dias Grátis
            </button>
          </div>

          {/* Card Clínicas */}
          <div className="v2-price-card">
            <h3 className="v2-heading" style={{ fontSize: '1.4rem', color: '#fff', margin: '0 0 8px' }}>Clínicas & Equipes</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '24px' }}>
              Para consultórios com múltiplos profissionais e recepção.
            </p>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#fff', marginBottom: '24px' }}>
              {billingCycle === 'anual' ? 'R$ 189' : 'R$ 229'}
              <span style={{ fontSize: '0.9rem', color: '#64748b' }}>/mês</span>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px', display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.9rem', color: '#cbd5e1' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={16} color="#10b981" /> Tudo do Plano Profissional</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={16} color="#10b981" /> Múltiplos nutricionistas no mesmo CRM</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={16} color="#10b981" /> Relatório consolidado da clínica</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={16} color="#10b981" /> Suporte dedicado prioritário</li>
            </ul>
            <button
              className="v2-btn v2-btn-glass"
              style={{ width: '100%', marginTop: 'auto' }}
              onClick={() => navigate('/cadastro?role=nutricionista')}
            >
              Falar com Especialista
            </button>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="v2-bento-section" style={{ maxWidth: '850px' }}>
        <div style={{ textAlign: 'center', marginBottom: '50px' }}>
          <div className="v2-section-badge">SUPORTE E DÚVIDAS</div>
          <h2 className="v2-section-heading v2-heading">Perguntas Frequentes</h2>
        </div>

        <div>
          {faqs.map((faq, idx) => (
            <div key={idx} style={{
              border: '1px solid rgba(255,255,255,0.08)',
              background: 'rgba(10, 12, 22, 0.7)',
              borderRadius: '14px',
              marginBottom: '12px',
              overflow: 'hidden'
            }}>
              <div
                style={{ padding: '20px 24px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#fff', fontWeight: 600, fontSize: '1.05rem' }}
                onClick={() => toggleFaq(idx)}
              >
                <span>{faq.q}</span>
                <ChevronDown
                  size={18}
                  style={{
                    transform: openFaq === idx ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.25s ease',
                    color: '#a855f7'
                  }}
                />
              </div>
              {openFaq === idx && (
                <div style={{ padding: '0 24px 20px', color: '#94a3b8', lineHeight: 1.6, fontSize: '0.95rem' }}>
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Final Aurora CTA */}
      <section className="v2-aurora-cta">
        <h2 className="v2-heading" style={{ fontSize: 'clamp(2.4rem, 5vw, 3.8rem)', color: '#fff', margin: '0 auto 18px', maxWidth: '850px' }}>
          Pare de perder pacientes no intervalo entre consultas.
        </h2>
        <p style={{ color: '#cbd5e1', fontSize: '1.2rem', maxWidth: '640px', margin: '0 auto 40px', lineHeight: 1.6 }}>
          Ative seu CRM em menos de 2 minutos. Sem fidelidade, sem cartão inicial e com cancelamento a qualquer momento.
        </p>
        <button
          className="v2-btn v2-btn-cyber"
          style={{ padding: '18px 42px', fontSize: '1.15rem' }}
          onClick={() => navigate('/cadastro?role=nutricionista')}
        >
          Criar Minha Clínica Grátis Agora <ArrowRight size={22} />
        </button>
      </section>

      {/* Futuristic Clean Footer */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: '50px 20px', textAlign: 'center', color: '#64748b', fontSize: '0.88rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '14px' }}>
          <div style={{ width: '22px', height: '22px', borderRadius: '6px', background: 'linear-gradient(135deg, #a855f7, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Cpu size={14} color="#fff" />
          </div>
          <span style={{ fontWeight: 800, color: '#fff', fontSize: '1rem' }}>Nutrivvo Neural</span>
          <span style={{ color: '#475569' }}>— Clinical Retention Platform</span>
        </div>
        <div className="v2-mono" style={{ fontSize: '0.78rem', color: '#475569' }}>
          © {new Date().getFullYear()} NUTRIVVO AI CLOUD. ENCRYPTED END-TO-END. CONFORME COM A LGPD E CFM/CFN.
        </div>
      </footer>
    </div>
  );
}
