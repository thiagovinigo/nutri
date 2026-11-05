import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  SplitSquareVertical,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  XCircle,
  Sliders,
  TrendingUp,
  Flame,
  ShieldCheck
} from 'lucide-react';
import PreviewSwitcher from '../components/landing/PreviewSwitcher';
import { landingData } from '../components/landing/landingData';
import '../landing-v2.css';
import '../landing-previews.css';

export default function LandingPreview17() {
  const navigate = useNavigate();
  const [sliderPos, setSliderPos] = useState(50);
  const [activeMode, setActiveMode] = useState('clinica'); // 'clinica' ou 'paciente'

  return (
    <div style={{ background: '#060811', minHeight: '100vh', color: '#f8fafc', padding: '60px 20px 120px' }}>
      <PreviewSwitcher current="p17" />

      {/* Header */}
      <div style={{ maxWidth: '960px', margin: '0 auto 40px', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(244, 114, 182, 0.12)', border: '1px solid rgba(244, 114, 182, 0.35)', padding: '6px 16px', borderRadius: '9999px', color: '#f472b6', fontSize: '0.8rem', fontWeight: 800, marginBottom: '20px' }}>
          <SplitSquareVertical size={14} />
          <span>LAYOUT 17 // INTERACTIVE BEFORE / AFTER COMPARISON SLIDER</span>
        </div>

        <h1 className="v2-heading" style={{ fontSize: 'clamp(2.4rem, 5vw, 4rem)', color: '#fff', margin: '0 0 16px', lineHeight: 1.15 }}>
          Arraste o cursor e veja a transformação <br />
          <span style={{ background: 'linear-gradient(135deg, #f472b6, #fb7185, #fda4af)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            do seu consultório antes e depois da IA.
          </span>
        </h1>

        <p style={{ color: '#94a3b8', fontSize: '1.15rem', maxWidth: '700px', margin: '0 auto 32px', lineHeight: 1.6 }}>
          Deslize a barra para comparar a rotina de trabalho exaustiva com planilhas contra a eficiência automatizada do Nutrivvo.
        </p>

        {/* Mode Selector */}
        <div style={{ display: 'inline-flex', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '9999px', padding: '4px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <button
            onClick={() => setActiveMode('clinica')}
            style={{
              background: activeMode === 'clinica' ? '#f472b6' : 'transparent',
              color: activeMode === 'clinica' ? '#fff' : '#94a3b8',
              border: 'none',
              padding: '8px 20px',
              borderRadius: '9999px',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Visão do Consultório
          </button>
          <button
            onClick={() => setActiveMode('paciente')}
            style={{
              background: activeMode === 'paciente' ? '#f472b6' : 'transparent',
              color: activeMode === 'paciente' ? '#fff' : '#94a3b8',
              border: 'none',
              padding: '8px 20px',
              borderRadius: '9999px',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Evolução do Paciente
          </button>
        </div>
      </div>

      {/* Interactive Slider Stage */}
      <div style={{ maxWidth: '1000px', margin: '0 auto 50px' }}>
        
        {/* Slider Controls Hint */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', padding: '0 8px' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#f87171', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <XCircle size={16} /> ANTES (SEM NUTRIVVO)
          </span>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
            Arraste o slider para comparar ({sliderPos}%)
          </span>
          <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#34d399', display: 'flex', alignItems: 'center', gap: '6px' }}>
            DEPOIS (COM NUTRIVVO IA) <CheckCircle2 size={16} />
          </span>
        </div>

        {/* Comparison Box */}
        <div
          style={{
            position: 'relative',
            height: '420px',
            borderRadius: '28px',
            overflow: 'hidden',
            border: '2px solid rgba(255, 255, 255, 0.15)',
            boxShadow: '0 30px 80px rgba(0,0,0,0.85)',
            background: '#090d1a'
          }}
        >
          {/* Layer 1: AFTER (Full Background Right Side) */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(6, 182, 212, 0.15))',
              padding: '40px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'flex-end',
              textAlign: 'right'
            }}
          >
            <div style={{ maxWidth: '420px' }}>
              <span style={{ background: '#10b981', color: '#000', fontSize: '0.75rem', fontWeight: 900, padding: '4px 10px', borderRadius: '6px', textTransform: 'uppercase' }}>
                Nutrivvo OS Ativo
              </span>

              {activeMode === 'clinica' ? (
                <>
                  <h3 style={{ fontSize: '1.8rem', color: '#fff', margin: '14px 0 10px', fontWeight: 800 }}>
                    12 min por Consulta & 89% Retenção
                  </h3>
                  <p style={{ color: '#cbd5e1', fontSize: '0.95rem', lineHeight: 1.5, margin: '0 0 16px' }}>
                    Dieta gerada em 3 segundos pela IA. Secretária no Telegram tirando dúvidas de pratos 24/7 sem tocar no seu WhatsApp pessoal.
                  </p>
                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                    <span style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', padding: '6px 12px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700 }}>
                      +18h livres na semana
                    </span>
                    <span style={{ background: 'rgba(6, 182, 212, 0.2)', color: '#22d3ee', padding: '6px 12px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700 }}>
                      Radar de Abandono Ativo
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <h3 style={{ fontSize: '1.8rem', color: '#fff', margin: '14px 0 10px', fontWeight: 800 }}>
                    Paciente Engajado com Streak de 28 Dias
                  </h3>
                  <p style={{ color: '#cbd5e1', fontSize: '0.95rem', lineHeight: 1.5, margin: '0 0 16px' }}>
                    Fotos de prato enviadas diariamente no Telegram com leitura automática de calorias. O paciente sente suporte contínuo e não desiste.
                  </p>
                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                    <span style={{ background: 'rgba(249, 115, 22, 0.2)', color: '#fb923c', padding: '6px 12px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700 }}>
                      🔥 Ofensiva mantida
                    </span>
                    <span style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', padding: '6px 12px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700 }}>
                      -4.8kg de gordura
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Layer 2: BEFORE (Clipped on Left Side according to slider) */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              bottom: 0,
              width: `${sliderPos}%`,
              background: 'linear-gradient(135deg, #180d14, #261118)',
              borderRight: '3px solid #f472b6',
              boxShadow: '5px 0 30px rgba(0,0,0,0.7)',
              padding: '40px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              overflow: 'hidden'
            }}
          >
            <div style={{ minWidth: '420px', maxWidth: '420px' }}>
              <span style={{ background: '#ef4444', color: '#fff', fontSize: '0.75rem', fontWeight: 900, padding: '4px 10px', borderRadius: '6px', textTransform: 'uppercase' }}>
                Método Antigo em Planilhas
              </span>

              {activeMode === 'clinica' ? (
                <>
                  <h3 style={{ fontSize: '1.8rem', color: '#fff', margin: '14px 0 10px', fontWeight: 800 }}>
                    50 min por Paciente & 48% Evasão
                  </h3>
                  <p style={{ color: '#fca5a5', fontSize: '0.95rem', lineHeight: 1.5, margin: '0 0 16px' }}>
                    Copiar e colar tabelas manuais no Word. Mensagens no seu WhatsApp às 23h. O paciente para de responder e você nem descobre o motivo.
                  </p>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <span style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#fca5a5', padding: '6px 12px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700 }}>
                      Exaustão clínica
                    </span>
                    <span style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#fca5a5', padding: '6px 12px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700 }}>
                      Calotes e atrasos
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <h3 style={{ fontSize: '1.8rem', color: '#fff', margin: '14px 0 10px', fontWeight: 800 }}>
                    Paciente Solitário e Desmotivado
                  </h3>
                  <p style={{ color: '#fca5a5', fontSize: '0.95rem', lineHeight: 1.5, margin: '0 0 16px' }}>
                    O paciente recebe um PDF estático de dieta, perde a motivação na segunda semana e cancela a consulta de retorno por vergonha.
                  </p>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <span style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#fca5a5', padding: '6px 12px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700 }}>
                      Desistência no 1º mês
                    </span>
                    <span style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#fca5a5', padding: '6px 12px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700 }}>
                      Zero acompanhamento
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Vertical Divider Handle Line */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: `${sliderPos}%`,
              transform: 'translate(-50%, -50%)',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: '#f472b6',
              boxShadow: '0 0 25px #f472b6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none'
            }}
          >
            <Sliders size={20} color="#fff" />
          </div>
        </div>

        {/* Input Range Slider */}
        <div style={{ marginTop: '20px' }}>
          <input
            type="range"
            min="5"
            max="95"
            value={sliderPos}
            onChange={(e) => setSliderPos(Number(e.target.value))}
            style={{ width: '100%', accentColor: '#f472b6', cursor: 'pointer', height: '8px' }}
          />
        </div>
      </div>

      {/* Action Footer */}
      <div style={{ maxWidth: '880px', margin: '0 auto', textAlign: 'center' }}>
        <button
          onClick={() => navigate('/cadastro')}
          className="v2-btn v2-btn-cyber"
          style={{ fontSize: '1.1rem', padding: '16px 38px' }}
        >
          Mudar Meu Consultório para o Lado Direito Agora <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}

