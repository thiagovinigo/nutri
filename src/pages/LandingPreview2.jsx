import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Radio,
  Bot,
  Camera,
  Flame,
  Utensils,
  Dumbbell,
  Stethoscope,
  Wallet,
  ChevronDown
} from 'lucide-react';
import PreviewSwitcher from '../components/landing/PreviewSwitcher';
import { landingData } from '../components/landing/landingData';
import '../landing-v2.css';
import '../landing-previews.css';

export default function LandingPreview2() {
  const navigate = useNavigate();
  const [billingCycle, setBillingCycle] = useState('anual');

  return (
    <div className="v2-landing" style={{ background: '#05060b' }}>
      <PreviewSwitcher current="p2" />

      {/* Split Screen 50/50 Container */}
      <div className="split-screen-container">
        {/* Lado Esquerdo Fixo */}
        <div className="split-screen-left">
          <div className="v2-hero-pill" style={{ width: 'max-content' }}>
            <span className="glow-dot" />
            <span className="v2-mono">LAYOUT 2 // SPLIT-SCREEN 50/50</span>
          </div>

          <h1 className="v2-heading" style={{ fontSize: 'clamp(2.4rem, 4vw, 3.6rem)', color: '#fff', lineHeight: 1.1, margin: '20px 0' }}>
            {landingData.titleLine1} <br />
            <span className="gradient-text">{landingData.titleHighlight}</span>
          </h1>

          <p style={{ color: '#94a3b8', fontSize: '1.1rem', lineHeight: 1.6, marginBottom: '32px' }}>
            {landingData.description}
          </p>

          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', marginBottom: '28px' }}>
            <button className="v2-btn v2-btn-cyber" style={{ padding: '16px 32px' }} onClick={() => navigate('/cadastro?role=nutricionista')}>
              Criar Clínica Grátis <ArrowRight size={18} />
            </button>
            <button className="v2-btn v2-btn-glass" onClick={() => navigate('/login')}>
              Acessar Conta
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem', color: '#64748b' }}>
            {landingData.trustBadges.slice(0, 3).map((badge, i) => (
              <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck size={16} color="#10b981" /> {badge}
              </span>
            ))}
          </div>
        </div>

        {/* Lado Direito com Scroll Fluido */}
        <div className="split-screen-right">
          {/* Seção Gestão */}
          <div className="v2-bento-card" style={{ marginBottom: '24px' }}>
            <span className="v2-mono" style={{ fontSize: '0.75rem', color: '#c084fc', fontWeight: 800 }}>
              {landingData.valueProps.management.tag}
            </span>
            <h3 className="v2-heading" style={{ fontSize: '1.4rem', color: '#fff', margin: '8px 0 12px' }}>
              {landingData.valueProps.management.title}
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '0.94rem', lineHeight: 1.6 }}>
              {landingData.valueProps.management.desc}
            </p>
            <img src="/screen_nutri.png" alt="CRM" style={{ width: '100%', borderRadius: '12px', marginTop: '16px' }} />
          </div>

          {/* Seção Engajamento */}
          <div className="v2-bento-card" style={{ marginBottom: '24px' }}>
            <span className="v2-mono" style={{ fontSize: '0.75rem', color: '#f43f5e', fontWeight: 800 }}>
              {landingData.valueProps.engagement.tag}
            </span>
            <h3 className="v2-heading" style={{ fontSize: '1.4rem', color: '#fff', margin: '8px 0 12px' }}>
              {landingData.valueProps.engagement.title}
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '0.94rem', lineHeight: 1.6 }}>
              {landingData.valueProps.engagement.desc}
            </p>
            <img src="/screen_paciente.png" alt="App Paciente" style={{ width: '100%', borderRadius: '12px', marginTop: '16px' }} />
          </div>

          {/* Radar e Telegram em Cards */}
          <div className="v2-bento-card" style={{ marginBottom: '24px' }}>
            <span className="v2-mono" style={{ fontSize: '0.75rem', color: '#c084fc', fontWeight: 800 }}>{landingData.radar.tag}</span>
            <h3 className="v2-heading" style={{ fontSize: '1.3rem', color: '#fff', margin: '6px 0 8px' }}>{landingData.radar.title}</h3>
            <div className="v2-radar-hud" style={{ margin: '20px auto' }}>
              <div className="v2-radar-sweep" />
              <div className="v2-radar-circle-inner" />
              <div className="v2-radar-blip v2-blip-critical" />
              <div className="v2-radar-blip v2-blip-safe" />
            </div>
          </div>

          {/* Comparativo */}
          <div className="v2-table-wrapper" style={{ marginBottom: '32px' }}>
            <table className="v2-matrix-table">
              <thead>
                <tr>
                  <th>Recurso</th>
                  <th className="v2-th-ai">Nutrivvo IA</th>
                  <th>WhatsApp & Planilhas</th>
                </tr>
              </thead>
              <tbody>
                {landingData.comparison.slice(0, 4).map((c, i) => (
                  <tr key={i}>
                    <td>{c.feature}</td>
                    <td className="v2-td-ai">{c.nutrivvo}</td>
                    <td style={{ color: '#f43f5e' }}>{c.old}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Preços */}
          <div className="v2-price-card v2-price-highlight" style={{ textAlign: 'center' }}>
            <div className="v2-pricing-badge">Mais Escolhido</div>
            <h3 className="v2-heading" style={{ fontSize: '1.5rem', color: '#fff', margin: '0 0 8px' }}>Profissional IA</h3>
            <div style={{ fontSize: '2.8rem', fontWeight: 800, color: '#fff', margin: '16px 0' }}>R$ 79<span style={{ fontSize: '0.9rem', color: '#64748b' }}>/mês</span></div>
            <button className="v2-btn v2-btn-cyber" style={{ width: '100%' }} onClick={() => navigate('/cadastro?role=nutricionista')}>
              Começar com 7 Dias Grátis
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
