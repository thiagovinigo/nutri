import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  ShieldCheck,
  BrainCircuit,
  Bot,
  HeartPulse,
  Dumbbell,
  Stethoscope,
  Wallet,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  Star,
  Lock,
  Scan,
  Flame,
  Utensils,
  Check
} from 'lucide-react';
import { landingData } from '../components/landing/landingData';
import '../landing-v2.css';
import '../landing-previews.css';

export default function LandingSwissBentoLight() {
  const navigate = useNavigate();

  // Estados Interativos
  const [activeTab, setActiveTab] = useState('nutri');
  const [billingCycle, setBillingCycle] = useState('anual');
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (idx) => setOpenFaq(openFaq === idx ? null : idx);

  return (
    <div className="swiss-grid-bg" style={{ minHeight: '100vh', padding: '0 0 140px' }}>

      {/* ======================================================== */}
      {/* BLOCO 1: NAVBAR LIMPA & NAVEGAÇÃO                        */}
      {/* ======================================================== */}
      <nav style={{ background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(16px)', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: '1160px', margin: '0 auto', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => navigate('/')}>
            <img src="/mark.svg" alt="Nutrivvo" style={{ width: '28px', height: '28px' }} />
            <span style={{ fontSize: '1.3rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.03em' }}>
              Nutrivvo.
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }} className="hidden-mobile">
            <a href="#features" style={{ color: '#475569', fontSize: '0.9rem', fontWeight: 600, textDecoration: 'none' }}>Recursos & IA</a>
            <a href="#comparativo" style={{ color: '#475569', fontSize: '0.9rem', fontWeight: 600, textDecoration: 'none' }}>Comparativo</a>
            <a href="#benefits" style={{ color: '#475569', fontSize: '0.9rem', fontWeight: 600, textDecoration: 'none' }}>Benefícios</a>
            <a href="#seguranca" style={{ color: '#475569', fontSize: '0.9rem', fontWeight: 600, textDecoration: 'none' }}>Segurança</a>
            <a href="#depoimentos" style={{ color: '#475569', fontSize: '0.9rem', fontWeight: 600, textDecoration: 'none' }}>Depoimentos</a>
            <a href="#precos" style={{ color: '#475569', fontSize: '0.9rem', fontWeight: 600, textDecoration: 'none' }}>Planos</a>
            <a href="#faq" style={{ color: '#475569', fontSize: '0.9rem', fontWeight: 600, textDecoration: 'none' }}>Dúvidas</a>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={() => navigate('/login')}
              style={{ background: 'transparent', border: '1px solid #cbd5e1', color: '#334155', padding: '8px 18px', borderRadius: '9999px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}
            >
              Entrar
            </button>
            <button
              onClick={() => navigate('/cadastro?role=nutricionista')}
              style={{ background: '#7c3aed', border: 'none', color: '#fff', padding: '9px 20px', borderRadius: '9999px', fontSize: '0.85rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 4px 12px rgba(124, 58, 237, 0.25)' }}
            >
              Criar Clínica Grátis <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </nav>

      {/* ======================================================== */}
      {/* BLOCO 2: HERO SECTION OFICIAL                            */}
      {/* ======================================================== */}
      <section style={{ maxWidth: '1080px', margin: '0 auto', padding: '60px 20px 40px', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '6px 18px', borderRadius: '9999px', color: '#065f46', fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '24px' }}>
          <ShieldCheck size={16} color="#059669" />
          <span>{landingData.badge}</span>
        </div>

        <h1 style={{ fontSize: 'clamp(2.4rem, 5.2vw, 4.4rem)', fontWeight: 900, color: '#0f172a', lineHeight: 1.12, letterSpacing: '-0.04em', margin: '0 0 24px' }}>
          {landingData.titleLine1} <br />
          <span style={{ color: '#059669' }}>
            {landingData.titleHighlight}
          </span>
        </h1>

        <p style={{ color: '#475569', fontSize: 'clamp(1.05rem, 2vw, 1.25rem)', maxWidth: '780px', margin: '0 auto 36px', lineHeight: 1.6 }}>
          {landingData.description}
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap', marginBottom: '24px' }}>
          <button
            onClick={() => navigate('/cadastro?role=nutricionista')}
            style={{
              background: '#7c3aed',
              color: '#ffffff',
              border: 'none',
              padding: '16px 36px',
              borderRadius: '9999px',
              fontSize: '1rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              boxShadow: '0 10px 25px rgba(124, 58, 237, 0.3)',
              transition: 'transform 0.2s ease'
            }}
          >
            Criar Clínica Grátis <ArrowRight size={18} />
          </button>

          <button
            onClick={() => navigate('/login')}
            style={{
              background: '#ffffff',
              color: '#334155',
              border: '1px solid #cbd5e1',
              padding: '16px 28px',
              borderRadius: '9999px',
              fontSize: '1rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Acessar Minha Conta
          </button>
        </div>

        <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>
          Sem cartão de crédito · Pronto em 2 minutos
        </p>
      </section>

      {/* ======================================================== */}
      {/* BLOCO 3: DUAL MOCKUP INTERATIVO (CRM NUTRI vs PACIENTE)  */}
      {/* ======================================================== */}
      <section style={{ maxWidth: '1080px', margin: '0 auto 80px', padding: '0 20px' }}>
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '24px', padding: '16px', boxShadow: '0 20px 60px rgba(15, 23, 42, 0.08)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '14px', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#f43f5e' }} />
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#f59e0b' }} />
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#10b981' }} />
            </div>

            <div style={{ display: 'inline-flex', background: '#f1f5f9', borderRadius: '9999px', padding: '3px' }}>
              <button
                onClick={() => setActiveTab('nutri')}
                style={{
                  background: activeTab === 'nutri' ? '#ffffff' : 'transparent',
                  color: activeTab === 'nutri' ? '#0f172a' : '#64748b',
                  border: 'none',
                  padding: '6px 16px',
                  borderRadius: '9999px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: activeTab === 'nutri' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none'
                }}
              >
                CRM Nutricionista
              </button>
              <button
                onClick={() => setActiveTab('paciente')}
                style={{
                  background: activeTab === 'paciente' ? '#ffffff' : 'transparent',
                  color: activeTab === 'paciente' ? '#0f172a' : '#64748b',
                  border: 'none',
                  padding: '6px 16px',
                  borderRadius: '9999px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: activeTab === 'paciente' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none'
                }}
              >
                App Paciente
              </button>
            </div>
          </div>

          <div style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid #f1f5f9', background: '#fafbfc' }}>
            <img
              src={activeTab === 'nutri' ? '/screen_nutri.png' : '/screen_paciente.png'}
              alt={activeTab === 'nutri' ? 'CRM Nutricionista' : 'App Paciente'}
              style={{ width: '100%', height: 'auto', display: 'block', maxHeight: '560px', objectFit: 'contain' }}
            />
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* BLOCO 4: BENTO SPOTLIGHT GRID (8 RECURSOS OFICIAIS)      */}
      {/* ======================================================== */}
      <section id="features" style={{ maxWidth: '1160px', margin: '0 auto 90px', padding: '0 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h2 style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', fontWeight: 900, color: '#0f172a', margin: '0 0 12px' }}>
            Por que escolher o Nutrivvo?
          </h2>
          <p style={{ color: '#64748b', fontSize: '1.1rem', maxWidth: '640px', margin: '0 auto' }}>
            Ferramentas desenhadas especificamente para aumentar a adesão ao plano alimentar e reduzir o tempo de consulta.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="swiss-bento-grid">
          
          {/* 1. Radar de Abandono (7 Colunas com HUD Rotativo 360) */}
          <div className="swiss-spotlight-card swiss-col-7" style={{ padding: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <BrainCircuit size={24} color="#7c3aed" />
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#7c3aed', background: '#ede9fe', padding: '4px 10px', borderRadius: '6px' }}>
                TELEMETRIA PREDITIVA
              </span>
            </div>

            <h3 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a', margin: '0 0 8px' }}>
              {landingData.radar.title}
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.94rem', lineHeight: 1.5, margin: '0 0 24px' }}>
              {landingData.radar.desc}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', alignItems: 'center' }}>
              {/* HUD Operacional com rotação 360 e blips pulsantes */}
              <div
                className="v2-radar-hud"
                style={{
                  background: 'radial-gradient(circle, rgba(124, 58, 237, 0.08) 0%, #f8fafc 75%)',
                  borderColor: '#cbd5e1',
                  boxShadow: '0 0 30px rgba(124, 58, 237, 0.12), inset 0 0 20px rgba(124, 58, 237, 0.06)'
                }}
              >
                <div className="v2-radar-sweep" />
                <div className="v2-radar-circle-inner" style={{ borderColor: 'rgba(124, 58, 237, 0.25)' }} />
                <div className="v2-radar-circle-center" style={{ borderColor: 'rgba(124, 58, 237, 0.4)' }} />
                <div className="v2-radar-line-h" style={{ background: 'rgba(124, 58, 237, 0.2)' }} />
                <div className="v2-radar-line-v" style={{ background: 'rgba(124, 58, 237, 0.2)' }} />
                <div className="v2-radar-blip v2-blip-critical" />
                <div className="v2-radar-blip v2-blip-warning" />
                <div className="v2-radar-blip v2-blip-safe" />
              </div>

              {/* Lista de Telemetria */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {landingData.radar.patients.map((p, idx) => (
                  <div key={idx} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '10px 14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0f172a' }}>{p.name}</span>
                      <span style={{ fontSize: '0.72rem', fontWeight: 800, color: p.status === 'critical' ? '#ef4444' : p.status === 'warning' ? '#d97706' : '#059669' }}>
                        {p.badge}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{p.detail}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 2. Secretária Virtual no Telegram (5 Colunas) */}
          <div className="swiss-spotlight-card swiss-col-5" style={{ padding: '32px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
              <Bot size={24} color="#0284c7" />
            </div>

            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0284c7', textTransform: 'uppercase' }}>
              {landingData.telegram.tag}
            </span>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', margin: '6px 0 8px' }}>
              {landingData.telegram.title}
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.5, margin: '0 0 20px' }}>
              {landingData.telegram.desc}
            </p>

            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '14px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {landingData.telegram.chat.map((msg, i) => (
                <div key={i} style={{ alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start', background: msg.sender === 'user' ? '#059669' : '#ffffff', color: msg.sender === 'user' ? '#fff' : '#1e293b', border: msg.sender === 'user' ? 'none' : '1px solid #e2e8f0', borderRadius: '10px', padding: '8px 12px', fontSize: '0.8rem', maxWidth: '90%', lineHeight: 1.4 }}>
                  {msg.text}
                </div>
              ))}
            </div>
          </div>

          {/* 3. Check-in Diário por Foto (6 Colunas) */}
          <div className="swiss-spotlight-card swiss-col-6" style={{ padding: '32px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#cffafe', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
              <Scan size={24} color="#0891b2" />
            </div>

            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0891b2', textTransform: 'uppercase' }}>
              {landingData.scanner.tag}
            </span>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', margin: '6px 0 8px' }}>
              {landingData.scanner.title}
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.5, margin: '0 0 20px' }}>
              {landingData.scanner.desc}
            </p>

            <div className="swiss-scanner-box">
              <img src={landingData.scanner.img} alt="Prato" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div className="swiss-laser-scan" />
              <div className="swiss-scanner-tag">
                {landingData.scanner.telemetry}
              </div>
            </div>
          </div>

          {/* 4. Alta Gamificação & XP (6 Colunas) */}
          <div className="swiss-spotlight-card swiss-col-6" style={{ padding: '32px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#ffedd5', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
              <Flame size={24} color="#ea580c" />
            </div>

            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#ea580c', textTransform: 'uppercase' }}>
              {landingData.gamification.tag}
            </span>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', margin: '6px 0 8px' }}>
              {landingData.gamification.title}
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.5, margin: '0 0 20px' }}>
              {landingData.gamification.desc}
            </p>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#ea580c' }}>
                  🔥 {landingData.gamification.streak}
                </span>
                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#7c3aed' }}>
                  {landingData.gamification.xp}
                </span>
              </div>
              <div style={{ width: '100%', height: '10px', background: '#e2e8f0', borderRadius: '9999px', overflow: 'hidden' }}>
                <div style={{ width: '78%', height: '100%', background: 'linear-gradient(90deg, #ea580c, #f59e0b)' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '0.75rem', color: '#64748b' }}>
                <span>Nível 4: Foco Blindado</span>
                <span>Meta: 1.200 XP</span>
              </div>
            </div>
          </div>

          {/* 5. Dietas com IA (4 Colunas) */}
          <div className="swiss-spotlight-card swiss-col-4" style={{ padding: '28px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
              <Utensils size={20} color="#059669" />
            </div>
            <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: '0 0 6px' }}>{landingData.generator.title}</h4>
            <p style={{ color: '#64748b', fontSize: '0.85rem', lineHeight: 1.5, margin: '0 0 14px' }}>{landingData.generator.desc}</p>
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '8px 12px', borderRadius: '8px', fontSize: '0.78rem', color: '#065f46', fontWeight: 700 }}>
              ⚡ {landingData.generator.result}
            </div>
          </div>

          {/* 6. Treinos com IA (4 Colunas) */}
          <div className="swiss-spotlight-card swiss-col-4" style={{ padding: '28px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
              <Dumbbell size={20} color="#7c3aed" />
            </div>
            <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: '0 0 6px' }}>{landingData.workout.title}</h4>
            <p style={{ color: '#64748b', fontSize: '0.85rem', lineHeight: 1.5, margin: '0 0 14px' }}>{landingData.workout.desc}</p>
            <div style={{ background: '#ede9fe', border: '1px solid #ddd6fe', padding: '8px 12px', borderRadius: '8px', fontSize: '0.78rem', color: '#5b21b6', fontWeight: 700 }}>
              💪 {landingData.workout.result}
            </div>
          </div>

          {/* 7. Exames com IA (4 Colunas) */}
          <div className="swiss-spotlight-card swiss-col-4" style={{ padding: '28px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#fdf2f8', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
              <Stethoscope size={20} color="#db2777" />
            </div>
            <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: '0 0 6px' }}>{landingData.exams.title}</h4>
            <p style={{ color: '#64748b', fontSize: '0.85rem', lineHeight: 1.5, margin: '0 0 14px' }}>{landingData.exams.desc}</p>
            <div style={{ background: '#fce7f3', border: '1px solid #fbcfe8', padding: '8px 12px', borderRadius: '8px', fontSize: '0.78rem', color: '#9d174d', fontWeight: 700 }}>
              🧪 {landingData.exams.result}
            </div>
          </div>

          {/* 8. Financeiro Integrado (12 Colunas) */}
          <div className="swiss-spotlight-card swiss-col-12" style={{ padding: '28px 36px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Wallet size={24} color="#059669" />
              </div>
              <div style={{ flex: 1, minWidth: '240px' }}>
                <h4 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: '0 0 4px' }}>{landingData.financial.title}</h4>
                <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>{landingData.financial.desc}</p>
              </div>
              <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '8px 16px', borderRadius: '9999px', fontSize: '0.8rem', color: '#065f46', fontWeight: 800 }}>
                💳 Lembretes de Renovação Pré-Formatados
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ======================================================== */}
      {/* BLOCO 5: MATRIZ COMPARATIVA DETALHADA                    */}
      {/* ======================================================== */}
      <section id="comparativo" style={{ maxWidth: '1080px', margin: '0 auto 90px', padding: '0 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#059669', textTransform: 'uppercase' }}>
            TABELA DE COMPARAÇÃO DIRETA
          </span>
          <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)', fontWeight: 900, color: '#0f172a', margin: '8px 0 10px' }}>
            Nutrivvo IA vs WhatsApp e Planilhas
          </h2>
          <p style={{ color: '#64748b', fontSize: '1rem', margin: 0 }}>
            Compare o modelo de consultório tradicional contra a automação inteligente.
          </p>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="swiss-matrix-table">
            <thead>
              <tr>
                <th style={{ width: '32%' }}>Critério de Avaliação</th>
                <th className="swiss-th-highlight" style={{ width: '38%' }}>Nutrivvo IA</th>
                <th style={{ width: '30%' }}>WhatsApp & Planilhas</th>
              </tr>
            </thead>
            <tbody>
              {landingData.comparison.map((c, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 700, color: '#1e293b' }}>{c.feature}</td>
                  <td className="swiss-td-highlight">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <CheckCircle2 size={16} color="#059669" />
                      <span>{c.nutrivvo}</span>
                    </div>
                  </td>
                  <td style={{ color: '#94a3b8' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <XCircle size={16} color="#ef4444" />
                      <span>{c.old}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ======================================================== */}
      {/* BLOCO 6: VALUE PROPS DETALHADAS (GESTÃO & ENGAJAMENTO)   */}
      {/* ======================================================== */}
      <section id="benefits" style={{ maxWidth: '1100px', margin: '0 auto 90px', padding: '0 20px' }}>
        {/* Gestão */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '48px', alignItems: 'center', marginBottom: '70px' }}>
          <div>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
              <ShieldCheck size={28} color="#059669" />
            </div>
            <h2 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.7rem)', fontWeight: 900, color: '#0f172a', margin: '0 0 16px' }}>
              Gestão que trabalha por você
            </h2>
            <p style={{ color: '#475569', fontSize: '1.05rem', lineHeight: 1.6, margin: '0 0 16px' }}>
              Monte o cardápio com a IA em minutos: descreva o paciente e receba um plano de 1 a 30 dias pronto, com receita de verdade e modo de preparo — não uma lista de alimentos. Acompanhe se ele está bebendo água e seguindo a dieta em tempo real, sem precisar perguntar.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: '#1e293b', fontWeight: 600 }}>
                <Check size={16} color="#059669" /> Cardápio estruturado com lista de compras e substituições.
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: '#1e293b', fontWeight: 600 }}>
                <Check size={16} color="#059669" /> Periodização de treinos e análise de exames no mesmo prontuário.
              </div>
            </div>
          </div>

          <div style={{ borderRadius: '20px', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 20px 50px rgba(15, 23, 42, 0.06)' }}>
            <img src="/screen_nutri.png" alt="CRM Management" style={{ width: '100%', display: 'block' }} />
          </div>
        </div>

        {/* Engajamento */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '48px', alignItems: 'center' }}>
          <div style={{ borderRadius: '20px', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 20px 50px rgba(15, 23, 42, 0.06)' }}>
            <img src="/screen_paciente.png" alt="Patient Engagement" style={{ width: '100%', display: 'block' }} />
          </div>

          <div>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#fdf2f8', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
              <HeartPulse size={28} color="#db2777" />
            </div>
            <h2 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.7rem)', fontWeight: 900, color: '#0f172a', margin: '0 0 16px' }}>
              Engajamento incomparável
            </h2>
            <p style={{ color: '#475569', fontSize: '1.05rem', lineHeight: 1.6, margin: '0 0 16px' }}>
              O aplicativo do paciente não é apenas um leitor de dieta. É uma experiência motivadora. Toda vez que ele conclui uma refeição no horário, o cérebro recebe uma dose de dopamina pelo avanço — e cada marco vira um cartão pra compartilhar nos stories, marcando sua clínica.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: '#1e293b', fontWeight: 600 }}>
                <Check size={16} color="#db2777" /> Ofensiva diária (streak): mantém o paciente focado até no fim de semana.
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: '#1e293b', fontWeight: 600 }}>
                <Check size={16} color="#db2777" /> Check-in por foto com IA: estimativa de alimentos e registro automático no diário.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* BLOCO 7: SEGURANÇA E PRIVACIDADE DE DADOS                */}
      {/* ======================================================== */}
      <section id="seguranca" style={{ maxWidth: '1080px', margin: '0 auto 80px', padding: '0 20px' }}>
        <div className="swiss-card" style={{ padding: '36px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Lock size={24} color="#059669" />
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#059669', textTransform: 'uppercase' }}>
                {landingData.security.tag}
              </span>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', margin: '2px 0 0' }}>
                {landingData.security.title}
              </h3>
            </div>
          </div>
          <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: 1.6, margin: '0 0 20px' }}>
            {landingData.security.desc}
          </p>
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', fontSize: '0.82rem', color: '#64748b', fontWeight: 700 }}>
            <span>✓ Criptografia AES-256</span>
            <span>✓ Isolamento por Multi-Tenancy</span>
            <span>✓ Conformidade com CFN e LGPD Saúde</span>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* BLOCO 8: PROVA SOCIAL & DEPOIMENTOS CLÍNICOS REAIS       */}
      {/* ======================================================== */}
      <section id="depoimentos" style={{ maxWidth: '1080px', margin: '0 auto 90px', padding: '0 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', color: '#0f172a', fontWeight: 900, margin: '0 0 10px' }}>
            O que dizem os nutricionistas
          </h2>
          <p style={{ color: '#64748b', fontSize: '1.05rem', margin: 0 }}>
            Centenas de profissionais já transformaram a gestão de seus consultórios.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          {[
            {
              name: 'Dra. Camila Rodrigues',
              crn: 'CRN-3 48.912 · Nutrição Esportiva',
              text: 'O Radar de Abandono foi um divisor de águas. Percebi que 40% dos meus atletas sumiam na terceira semana simplesmente por vergonha de relatar pequenos deslizes. Agora o bot resgata eles na hora.',
              metric: '+92% retenção no 2º mês'
            },
            {
              name: 'Dr. Rodrigo Mendes',
              crn: 'CRN-4 12.450 · Nutrição Funcional',
              text: 'Gerar dietas com modo de preparo e receitas de verdade em segundos reduziu o meu tempo de prescrição de 45 minutos para menos de 10. Sobra tempo para acolher o paciente.',
              metric: '32h economizadas / mês'
            },
            {
              name: 'Dra. Beatriz Costa',
              crn: 'CRN-2 33.109 · Emagrecimento e Saúde',
              text: 'Meus pacientes adoram o diário no Telegram e as ofensivas no app. O check-in por foto acabou de vez com a desculpa de que é chato pesar e anotar alimentos.',
              metric: '98% de adesão às fotos'
            }
          ].map((dep, idx) => (
            <div key={idx} className="swiss-card" style={{ padding: '28px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', gap: '4px', marginBottom: '14px' }}>
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} fill="#eab308" color="#eab308" />
                  ))}
                </div>
                <p style={{ color: '#334155', fontSize: '0.94rem', lineHeight: 1.6, margin: '0 0 20px', fontStyle: 'italic' }}>
                  "{dep.text}"
                </p>
              </div>

              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.95rem' }}>{dep.name}</div>
                <div style={{ color: '#64748b', fontSize: '0.8rem', marginBottom: '8px' }}>{dep.crn}</div>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#059669', background: '#ecfdf5', padding: '3px 8px', borderRadius: '4px' }}>
                  📈 {dep.metric}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ======================================================== */}
      {/* BLOCO 8: TABELA DE PREÇOS & PLANOS TRANSPARENTES         */}
      {/* ======================================================== */}
      <section id="precos" style={{ maxWidth: '1080px', margin: '0 auto 90px', padding: '0 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <h2 style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', color: '#0f172a', fontWeight: 900, margin: '0 0 12px' }}>
            Planos simples, transparentes e previsíveis
          </h2>
          <p style={{ color: '#64748b', fontSize: '1.05rem', margin: '0 0 24px' }}>
            Sem contratos longos ou multas. Cancele com um clique quando quiser.
          </p>

          <div style={{ display: 'inline-flex', background: '#e2e8f0', borderRadius: '9999px', padding: '3px' }}>
            <button
              onClick={() => setBillingCycle('mensal')}
              style={{
                background: billingCycle === 'mensal' ? '#ffffff' : 'transparent',
                color: billingCycle === 'mensal' ? '#0f172a' : '#64748b',
                border: 'none',
                padding: '8px 20px',
                borderRadius: '9999px',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Mensal
            </button>
            <button
              onClick={() => setBillingCycle('anual')}
              style={{
                background: billingCycle === 'anual' ? '#ffffff' : 'transparent',
                color: billingCycle === 'anual' ? '#0f172a' : '#64748b',
                border: 'none',
                padding: '8px 20px',
                borderRadius: '9999px',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              Anual <span style={{ background: '#ecfdf5', color: '#059669', fontSize: '0.72rem', fontWeight: 800, padding: '2px 6px', borderRadius: '9999px' }}>20% OFF</span>
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '24px', alignItems: 'stretch' }}>
          
          {/* Plano Gratuito */}
          <div className="swiss-card" style={{ padding: '36px 28px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', margin: '0 0 6px' }}>Gratuito</h3>
              <p style={{ color: '#64748b', fontSize: '0.88rem', margin: '0 0 18px' }}>
                Ideal para recém-formados testarem os recursos essenciais.
              </p>
              <div style={{ fontSize: '2.4rem', fontWeight: 900, color: '#0f172a', margin: '0 0 20px' }}>
                R$ 0<span style={{ fontSize: '0.88rem', color: '#64748b', fontWeight: 500 }}> /mês</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
                {['Até 3 pacientes ativos', 'Diário alimentar com fotos', 'App do paciente com XP e ofensiva', 'Sem Radar de Abandono IA'].map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem', color: idx === 3 ? '#94a3b8' : '#334155' }}>
                    {idx === 3 ? <XCircle size={16} color="#94a3b8" /> : <CheckCircle2 size={16} color="#059669" />}
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => navigate('/cadastro?role=nutricionista')}
              style={{ background: '#f1f5f9', color: '#1e293b', border: '1px solid #cbd5e1', padding: '12px', borderRadius: '9999px', fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer', width: '100%' }}
            >
              Criar Conta Gratuita
            </button>
          </div>

          {/* Plano Profissional IA (Destaque) */}
          <div className="swiss-card swiss-card-highlight" style={{ padding: '36px 28px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: '#7c3aed', color: '#fff', fontSize: '0.72rem', fontWeight: 800, padding: '4px 14px', borderRadius: '9999px', textTransform: 'uppercase' }}>
              Mais Escolhido
            </div>

            <div>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', margin: '0 0 6px' }}>Profissional IA</h3>
              <p style={{ color: '#64748b', fontSize: '0.88rem', margin: '0 0 18px' }}>
                Para nutricionistas autônomos que querem agenda cheia e fidelização.
              </p>
              <div style={{ fontSize: '2.4rem', fontWeight: 900, color: '#0f172a', margin: '0 0 20px' }}>
                {billingCycle === 'anual' ? 'R$ 63' : 'R$ 79'}<span style={{ fontSize: '0.88rem', color: '#64748b', fontWeight: 500 }}> /mês</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
                {[
                  'Até 50 pacientes ativos',
                  'Radar de Abandono Preditivo em tempo real',
                  'Secretária Virtual no Telegram 24/7',
                  'Geração de Cardápios completos com receitas por IA',
                  'Análise de Exames Laboratoriais com IA',
                  'Fichas de Treino periodizadas integradas'
                ].map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem', color: '#1e293b', fontWeight: 600 }}>
                    <CheckCircle2 size={16} color="#7c3aed" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => navigate('/cadastro?role=nutricionista')}
              style={{ background: '#7c3aed', color: '#fff', border: 'none', padding: '14px', borderRadius: '9999px', fontSize: '0.95rem', fontWeight: 800, cursor: 'pointer', width: '100%', boxShadow: '0 6px 20px rgba(124, 58, 237, 0.3)' }}
            >
              Começar 7 Dias Grátis
            </button>
          </div>

          {/* Plano Clínica / Equipe */}
          <div className="swiss-card" style={{ padding: '36px 28px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', margin: '0 0 6px' }}>Clínica</h3>
              <p style={{ color: '#64748b', fontSize: '0.88rem', margin: '0 0 18px' }}>
                Para consultórios com múltiplos nutricionistas e secretária física.
              </p>
              <div style={{ fontSize: '2.4rem', fontWeight: 900, color: '#0f172a', margin: '0 0 20px' }}>
                {billingCycle === 'anual' ? 'R$ 159' : 'R$ 199'}<span style={{ fontSize: '0.88rem', color: '#64748b', fontWeight: 500 }}> /mês</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
                {[
                  'Pacientes ativos ilimitados',
                  'Até 5 nutricionistas na mesma clínica',
                  'Acesso de secretária com controle de agenda',
                  'Dashboard financeiro consolidado',
                  'Treinamento de onboarding e suporte prioritário'
                ].map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem', color: '#334155' }}>
                    <CheckCircle2 size={16} color="#059669" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => navigate('/cadastro?role=nutricionista')}
              style={{ background: '#ffffff', color: '#0f172a', border: '1px solid #cbd5e1', padding: '12px', borderRadius: '9999px', fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer', width: '100%' }}
            >
              Falar com Consultor
            </button>
          </div>

        </div>
      </section>

      {/* ======================================================== */}
      {/* BLOCO 9: FAQ COMPLETO COM SANFONAS INTERATIVAS          */}
      {/* ======================================================== */}
      <section id="faq" style={{ maxWidth: '860px', margin: '0 auto 90px', padding: '0 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', color: '#0f172a', fontWeight: 900, margin: '0 0 10px' }}>
            Perguntas Frequentes
          </h2>
          <p style={{ color: '#64748b', fontSize: '1.05rem', margin: 0 }}>
            Tudo o que você precisa saber antes de começar seu teste gratuito.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[
            {
              q: 'O paciente precisa pagar para usar o aplicativo?',
              a: 'Não. O acesso para o paciente é 100% gratuito. Ele baixa o app pelo link da sua clínica, visualiza a dieta, registra as fotos dos pratos e participa das ofensivas diárias sem pagar nada.'
            },
            {
              q: 'Como funciona a secretária no Telegram sem usar meu WhatsApp pessoal?',
              a: 'A IA opera em um canal verificado do Telegram exclusivo da sua clínica. O paciente tira dúvidas de substituição, confirma consultas e envia fotos por lá. Seu WhatsApp pessoal permanece totalmente privado.'
            },
            {
              q: 'A prescrição de cardápios com IA segue a tabela TACO e diretrizes do CFN?',
              a: 'Sim. A IA do Nutrivvo foi calibrada com tabelas oficiais de composição de alimentos e diretrizes clínicas brasileiras. O nutricionista sempre tem a palavra final: você pode editar qualquer grama ou receita antes de liberar ao paciente.'
            },
            {
              q: 'Como funciona o período de teste de 7 dias?',
              a: 'Você tem 7 dias de acesso irrestrito ao plano Profissional IA sem precisar cadastrar cartão de crédito. Se gostar, escolhe o plano que melhor atende seu consultório.'
            },
            {
              q: 'Posso migrar os dados de outro software que já uso?',
              a: 'Sim. Nossa equipe de suporte auxilia na importação da sua lista de pacientes e históricos sem custo adicional.'
            }
          ].map((faq, idx) => (
            <div key={idx} className="swiss-card" style={{ overflow: 'hidden' }}>
              <button
                onClick={() => toggleFaq(idx)}
                style={{ width: '100%', padding: '20px 24px', background: 'transparent', border: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', textAlign: 'left', cursor: 'pointer', fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}
              >
                <span>{faq.q}</span>
                {openFaq === idx ? <ChevronUp size={20} color="#7c3aed" /> : <ChevronDown size={20} color="#64748b" />}
              </button>
              {openFaq === idx && (
                <div style={{ padding: '0 24px 20px', color: '#475569', fontSize: '0.94rem', lineHeight: 1.6, borderTop: '1px solid #f1f5f9', paddingTop: '14px' }}>
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ======================================================== */}
      {/* BLOCO 10: RODAPÉ INSTITUCIONAL OFICIAL                 */}
      {/* ======================================================== */}
      <footer style={{ borderTop: '1px solid #e2e8f0', background: '#ffffff', padding: '48px 20px 80px' }}>
        <div style={{ maxWidth: '1160px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <img src="/mark.svg" alt="Nutrivvo" style={{ width: '24px', height: '24px' }} />
            <span style={{ fontSize: '1.1rem', fontWeight: 900, color: '#0f172a' }}>Nutrivvo</span>
          </div>

          <div style={{ display: 'flex', gap: '24px', fontSize: '0.85rem', color: '#64748b' }}>
            <a href="#features" style={{ color: '#64748b', textDecoration: 'none' }}>Recursos</a>
            <a href="#comparativo" style={{ color: '#64748b', textDecoration: 'none' }}>Comparativo</a>
            <a href="#precos" style={{ color: '#64748b', textDecoration: 'none' }}>Planos</a>
            <span style={{ cursor: 'pointer' }} onClick={() => navigate('/login')}>Entrar</span>
          </div>

          <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
            © {new Date().getFullYear()} Nutrivvo. Todos os direitos reservados.
          </div>
        </div>
      </footer>

    </div>
  );
}
