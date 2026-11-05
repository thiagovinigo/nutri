import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  Activity,
  ArrowRight,
  Sparkles,
  Users,
  Radio,
  Calendar,
  CheckCircle2,
  DollarSign
} from 'lucide-react';
import PreviewSwitcher from '../components/landing/PreviewSwitcher';
import { landingData } from '../components/landing/landingData';
import '../landing-v2.css';
import '../landing-previews.css';

export default function LandingPreview19() {
  const navigate = useNavigate();
  const [period, setPeriod] = useState('30d');

  return (
    <div style={{ background: '#05070e', minHeight: '100vh', color: '#f8fafc', padding: '60px 20px 120px' }}>
      <PreviewSwitcher current="p19" />

      {/* Header */}
      <div style={{ maxWidth: '960px', margin: '0 auto 40px', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.35)', padding: '6px 16px', borderRadius: '9999px', color: '#34d399', fontSize: '0.8rem', fontWeight: 800, marginBottom: '20px' }}>
          <Activity size={14} />
          <span>LAYOUT 19 // LIVE SPARKLINES & METRICS BENTO (ANALYTICS)</span>
        </div>

        <h1 className="v2-heading" style={{ fontSize: 'clamp(2.4rem, 5vw, 4rem)', color: '#fff', margin: '0 0 16px', lineHeight: 1.15 }}>
          Métricas clínicas em tempo real com a <br />
          <span style={{ background: 'linear-gradient(135deg, #34d399, #10b981, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            precisão visual de um terminal analítico.
          </span>
        </h1>

        <p style={{ color: '#94a3b8', fontSize: '1.15rem', maxWidth: '700px', margin: '0 auto 32px', lineHeight: 1.6 }}>
          Acompanhe a curva de adesão dos pacientes, taxa de presença nas consultas e faturamento recuperado em gráficos vetoriais ao vivo.
        </p>

        {/* Period Selector */}
        <div style={{ display: 'inline-flex', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '9999px', padding: '4px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
          {[
            { id: '7d', label: 'Últimos 7 dias' },
            { id: '30d', label: 'Últimos 30 dias' },
            { id: '12m', label: 'Último ano' }
          ].map(p => (
            <button
              key={p.id}
              onClick={() => setPeriod(p.id)}
              style={{
                background: period === p.id ? '#10b981' : 'transparent',
                color: period === p.id ? '#000' : '#94a3b8',
                border: 'none',
                padding: '8px 18px',
                borderRadius: '9999px',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Analytics Bento Grid */}
      <div style={{ maxWidth: '1080px', margin: '0 auto 50px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        
        {/* Card 1: Taxa de Retenção com Sparkline SVG */}
        <div className="v2-bento-card" style={{ padding: '28px', background: 'rgba(12, 17, 30, 0.95)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#34d399', textTransform: 'uppercase' }}>
              Taxa de Retenção Clínica
            </span>
            <span style={{ color: '#34d399', fontSize: '0.75rem', fontWeight: 700, background: 'rgba(52, 211, 153, 0.12)', padding: '2px 8px', borderRadius: '4px' }}>
              +38% vs Sem IA
            </span>
          </div>

          <div style={{ fontSize: '2.4rem', fontWeight: 900, color: '#fff', marginBottom: '12px' }}>
            {period === '7d' ? '96.2%' : period === '30d' ? '91.8%' : '88.4%'}
          </div>

          {/* SVG Sparkline Curve */}
          <div style={{ width: '100%', height: '80px', marginBottom: '16px' }}>
            <svg viewBox="0 0 300 80" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
              <defs>
                <linearGradient id="sparkGradGreen" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d="M 0,60 Q 50,40 100,50 T 200,25 T 300,10 L 300,80 L 0,80 Z"
                fill="url(#sparkGradGreen)"
              />
              <path
                d="M 0,60 Q 50,40 100,50 T 200,25 T 300,10"
                fill="none"
                stroke="#34d399"
                strokeWidth="3"
              />
              <circle cx="300" cy="10" r="4" fill="#34d399" />
            </svg>
          </div>

          <p style={{ color: '#94a3b8', fontSize: '0.82rem', margin: 0 }}>
            Pacientes que continuam comparecendo aos retornos mensais após o monitoramento de fotos no Telegram.
          </p>
        </div>

        {/* Card 2: Faturamento Resgatado */}
        <div className="v2-bento-card" style={{ padding: '28px', background: 'rgba(12, 17, 30, 0.95)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase' }}>
              Faturamento Preservado
            </span>
            <span style={{ color: '#38bdf8', fontSize: '0.75rem', fontWeight: 700, background: 'rgba(56, 189, 248, 0.12)', padding: '2px 8px', borderRadius: '4px' }}>
              Radar de Abandono
            </span>
          </div>

          <div style={{ fontSize: '2.4rem', fontWeight: 900, color: '#fff', marginBottom: '12px' }}>
            {period === '7d' ? 'R$ 1.250' : period === '30d' ? 'R$ 4.750' : 'R$ 52.400'}
          </div>

          {/* SVG Sparkline Curve Blue */}
          <div style={{ width: '100%', height: '80px', marginBottom: '16px' }}>
            <svg viewBox="0 0 300 80" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
              <defs>
                <linearGradient id="sparkGradBlue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d="M 0,70 Q 75,55 150,45 T 250,20 T 300,8 L 300,80 L 0,80 Z"
                fill="url(#sparkGradBlue)"
              />
              <path
                d="M 0,70 Q 75,55 150,45 T 250,20 T 300,8"
                fill="none"
                stroke="#38bdf8"
                strokeWidth="3"
              />
              <circle cx="300" cy="8" r="4" fill="#38bdf8" />
            </svg>
          </div>

          <p style={{ color: '#94a3b8', fontSize: '0.82rem', margin: 0 }}>
            Receita que seria perdida por evasão precoce e que foi blindada pelo alerta no 4º dia de silêncio.
          </p>
        </div>

        {/* Card 3: Fotos de Pratos Analisadas */}
        <div className="v2-bento-card" style={{ padding: '28px', background: 'rgba(12, 17, 30, 0.95)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#c084fc', textTransform: 'uppercase' }}>
              Pratos Escaneados por IA
            </span>
            <span style={{ color: '#c084fc', fontSize: '0.75rem', fontWeight: 700, background: 'rgba(192, 132, 252, 0.12)', padding: '2px 8px', borderRadius: '4px' }}>
              Visão Computacional
            </span>
          </div>

          <div style={{ fontSize: '2.4rem', fontWeight: 900, color: '#fff', marginBottom: '12px' }}>
            {period === '7d' ? '342' : period === '30d' ? '1.480' : '17.200+'}
          </div>

          {/* SVG Sparkline Curve Purple */}
          <div style={{ width: '100%', height: '80px', marginBottom: '16px' }}>
            <svg viewBox="0 0 300 80" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
              <defs>
                <linearGradient id="sparkGradPurple" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#c084fc" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#c084fc" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d="M 0,55 Q 60,65 140,35 T 240,15 T 300,5 L 300,80 L 0,80 Z"
                fill="url(#sparkGradPurple)"
              />
              <path
                d="M 0,55 Q 60,65 140,35 T 240,15 T 300,5"
                fill="none"
                stroke="#c084fc"
                strokeWidth="3"
              />
              <circle cx="300" cy="5" r="4" fill="#c084fc" />
            </svg>
          </div>

          <p style={{ color: '#94a3b8', fontSize: '0.82rem', margin: 0 }}>
            Refeições enviadas pelos pacientes com cálculo automático de gramas, proteínas e calorias.
          </p>
        </div>

      </div>

      {/* Action Footer */}
      <div style={{ maxWidth: '880px', margin: '0 auto', textAlign: 'center' }}>
        <button
          onClick={() => navigate('/cadastro')}
          className="v2-btn v2-btn-cyber"
          style={{ fontSize: '1.1rem', padding: '16px 38px' }}
        >
          Visualizar as Métricas da Minha Clínica ao Vivo <ArrowRight size={18} />
        </button>
      </div>

    </div>
  );
}

