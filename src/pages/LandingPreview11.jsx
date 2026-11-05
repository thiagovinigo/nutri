import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Maximize2,
  Tv,
  ArrowRight,
  Sparkles,
  Bot,
  Flame,
  Radio,
  Scan,
  TrendingUp,
  Activity,
  Layers,
  ChevronRight
} from 'lucide-react';
import PreviewSwitcher from '../components/landing/PreviewSwitcher';
import { landingData } from '../components/landing/landingData';
import '../landing-v2.css';
import '../landing-previews.css';

export default function LandingPreview11() {
  const navigate = useNavigate();
  const [activeScreen, setActiveScreen] = useState('radar');

  return (
    <div style={{ background: '#03050c', minHeight: '100vh', color: '#f8fafc', padding: '60px 20px 120px', overflowX: 'hidden' }}>
      <PreviewSwitcher current="p11" />

      {/* Hero Header */}
      <div style={{ maxWidth: '1060px', margin: '0 auto 40px', textAlign: 'center', position: 'relative', zIndex: 2 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(56, 189, 248, 0.12)', border: '1px solid rgba(56, 189, 248, 0.35)', padding: '6px 16px', borderRadius: '9999px', color: '#38bdf8', fontSize: '0.8rem', fontWeight: 800, marginBottom: '20px' }}>
          <Tv size={14} />
          <span>LAYOUT 11 // PANORAMIC 16:9 CINEMA 3D IMMERSION</span>
        </div>

        <h1 className="v2-heading" style={{ fontSize: 'clamp(2.4rem, 5.5vw, 4.2rem)', color: '#fff', margin: '0 0 16px', lineHeight: 1.1 }}>
          A tela que vai transformar o seu consultório em um <br />
          <span style={{ background: 'linear-gradient(135deg, #38bdf8, #818cf8, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            centro clínico de alta tecnologia.
          </span>
        </h1>

        <p style={{ color: '#94a3b8', fontSize: '1.2rem', maxWidth: '720px', margin: '0 auto 32px', lineHeight: 1.6 }}>
          Uma visão panorâmica de todo o prontuário, radar preditivo e acompanhamento contínuo em ultra-alta fidelidade.
        </p>

        {/* Screen Selector Buttons */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '30px' }}>
          <button
            onClick={() => setActiveScreen('radar')}
            style={{
              background: activeScreen === 'radar' ? '#38bdf8' : 'rgba(255, 255, 255, 0.05)',
              color: activeScreen === 'radar' ? '#000' : '#cbd5e1',
              border: activeScreen === 'radar' ? '1px solid #7dd3fc' : '1px solid rgba(255, 255, 255, 0.1)',
              padding: '10px 20px',
              borderRadius: '9999px',
              fontSize: '0.85rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Radio size={16} /> Radar de Abandono
          </button>

          <button
            onClick={() => setActiveScreen('vision')}
            style={{
              background: activeScreen === 'vision' ? '#06b6d4' : 'rgba(255, 255, 255, 0.05)',
              color: activeScreen === 'vision' ? '#000' : '#cbd5e1',
              border: activeScreen === 'vision' ? '1px solid #22d3ee' : '1px solid rgba(255, 255, 255, 0.1)',
              padding: '10px 20px',
              borderRadius: '9999px',
              fontSize: '0.85rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Scan size={16} /> Visão Computacional do Prato
          </button>

          <button
            onClick={() => setActiveScreen('diet')}
            style={{
              background: activeScreen === 'diet' ? '#a855f7' : 'rgba(255, 255, 255, 0.05)',
              color: activeScreen === 'diet' ? '#fff' : '#cbd5e1',
              border: activeScreen === 'diet' ? '1px solid #c084fc' : '1px solid rgba(255, 255, 255, 0.1)',
              padding: '10px 20px',
              borderRadius: '9999px',
              fontSize: '0.85rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Sparkles size={16} /> Prescrição por IA em 3s
          </button>
        </div>
      </div>

      {/* 3D Cinema Canvas Showcase */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', perspective: '1400px', position: 'relative' }}>
        
        {/* Floating Badges */}
        <div style={{ position: 'absolute', top: '-25px', left: '4%', zIndex: 10, background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(56, 189, 248, 0.5)', padding: '10px 18px', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.8), 0 0 20px rgba(56, 189, 248, 0.3)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#38bdf8', boxShadow: '0 0 10px #38bdf8' }} />
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc' }}>
            ⚡ 1.420 fotos de pratos analisadas hoje
          </span>
        </div>

        <div style={{ position: 'absolute', top: '25%', right: '2%', zIndex: 10, background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(192, 132, 252, 0.5)', padding: '10px 18px', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.8), 0 0 20px rgba(192, 132, 252, 0.3)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Radio size={16} color="#c084fc" />
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc' }}>
            🎯 84 pacientes em zona verde de adesão
          </span>
        </div>

        {/* Panoramic 16:9 Screen */}
        <div
          style={{
            transform: 'rotateX(8deg)',
            transformOrigin: 'center bottom',
            background: 'linear-gradient(145deg, #0d1322, #070a14)',
            border: '2px solid rgba(255, 255, 255, 0.16)',
            borderRadius: '24px',
            boxShadow: '0 40px 100px rgba(0,0,0,0.9), 0 0 80px rgba(56, 189, 248, 0.25)',
            aspectRatio: '16 / 9',
            maxHeight: '620px',
            width: '100%',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            transition: 'transform 0.4s ease'
          }}
        >
          {/* Mockup Window Header */}
          <div style={{ background: 'rgba(0, 0, 0, 0.6)', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ef4444' }} />
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#eab308' }} />
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#22c55e' }} />
            </div>

            <div style={{ fontSize: '0.82rem', color: '#94a3b8', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>https://app.nutrivvo.com.br/dashboard</span>
            </div>

            <div style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: 700 }}>
              ● MODO PANORÂMICO 4K
            </div>
          </div>

          {/* Screen Content based on Selection */}
          <div style={{ flex: 1, padding: '28px', display: 'grid', gridTemplateColumns: '280px 1fr 300px', gap: '20px', overflow: 'hidden' }}>
            
            {/* Sidebar Mockup */}
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '16px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '12px' }}>
                Fila de Pacientes Hoje
              </div>
              {[
                { name: 'Camila Rodrigues', time: '14:00', status: 'Risco 82%', color: '#ef4444' },
                { name: 'Rodrigo Alves', time: '15:00', status: 'Estável', color: '#eab308' },
                { name: 'Beatriz Lima', time: '16:00', status: 'Segura 96%', color: '#22c55e' },
                { name: 'Lucas Santana', time: '17:00', status: 'Novo Plano', color: '#38bdf8' }
              ].map((p, i) => (
                <div key={i} style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '10px 12px', borderRadius: '10px', marginBottom: '8px', borderLeft: `3px solid ${p.color}` }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc' }}>{p.name}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94a3b8' }}>
                    <span>{p.time}</span>
                    <span style={{ color: p.color, fontWeight: 700 }}>{p.status}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Central Stage */}
            <div style={{ background: 'rgba(255, 255, 255, 0.02)', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              {activeScreen === 'radar' && (
                <div style={{ textAlign: 'center' }}>
                  <Radio size={48} color="#38bdf8" style={{ marginBottom: '16px' }} />
                  <h3 style={{ fontSize: '1.4rem', color: '#fff', margin: '0 0 10px' }}>
                    Radar de Telemetria Ativa 360°
                  </h3>
                  <p style={{ color: '#94a3b8', fontSize: '0.9rem', maxWidth: '420px', margin: '0 auto 20px' }}>
                    Monitora micro-sinais de desmotivação (ausência de check-in, queda no consumo de água) e dispara o resgate antes do cancelamento.
                  </p>
                  <div style={{ display: 'inline-flex', gap: '12px', background: 'rgba(56, 189, 248, 0.1)', padding: '8px 18px', borderRadius: '9999px', color: '#7dd3fc', fontSize: '0.85rem', fontWeight: 700 }}>
                    Taxa de Sucesso no Resgate: 84.7%
                  </div>
                </div>
              )}

              {activeScreen === 'vision' && (
                <div style={{ textAlign: 'center' }}>
                  <Scan size={48} color="#06b6d4" style={{ marginBottom: '16px' }} />
                  <h3 style={{ fontSize: '1.4rem', color: '#fff', margin: '0 0 10px' }}>
                    Reconhecimento de Refeição por Visão Computacional
                  </h3>
                  <p style={{ color: '#94a3b8', fontSize: '0.9rem', maxWidth: '420px', margin: '0 auto 20px' }}>
                    Identifica filé de frango, arroz integral e legumes no prato do paciente através da foto no Telegram, calculando gramas e macros instantaneamente.
                  </p>
                  <div style={{ display: 'inline-flex', gap: '12px', background: 'rgba(6, 182, 212, 0.1)', padding: '8px 18px', borderRadius: '9999px', color: '#67e8f9', fontSize: '0.85rem', fontWeight: 700 }}>
                    Precisão Clínica: 94.2%
                  </div>
                </div>
              )}

              {activeScreen === 'diet' && (
                <div style={{ textAlign: 'center' }}>
                  <Sparkles size={48} color="#c084fc" style={{ marginBottom: '16px' }} />
                  <h3 style={{ fontSize: '1.4rem', color: '#fff', margin: '0 0 10px' }}>
                    Motor Clínico de IA para Prescrição
                  </h3>
                  <p style={{ color: '#94a3b8', fontSize: '0.9rem', maxWidth: '420px', margin: '0 auto 20px' }}>
                    Gera cardápio balanceado com modo de preparo, lista de compras e distribuição calórica em menos de 3 segundos, respeitando aversões e alergias.
                  </p>
                  <div style={{ display: 'inline-flex', gap: '12px', background: 'rgba(168, 85, 247, 0.1)', padding: '8px 18px', borderRadius: '9999px', color: '#d8b4fe', fontSize: '0.85rem', fontWeight: 700 }}>
                    Tempo Médio: 2.8 segundos
                  </div>
                </div>
              )}
            </div>

            {/* Right Telemetry Column */}
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '16px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '12px' }}>
                Métricas em Tempo Real
              </div>

              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '12px', marginBottom: '12px' }}>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Adesão Média</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#34d399' }}>91.4%</div>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>+24% vs mês anterior</div>
              </div>

              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '12px', marginBottom: '12px' }}>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Horas Salvas</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#38bdf8' }}>42h / mês</div>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>com IA de cardápios</div>
              </div>

              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '12px' }}>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Mensagens IA</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#c084fc' }}>388 envios</div>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>respondidas 24/7 no Telegram</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div style={{ maxWidth: '960px', margin: '60px auto 0', textAlign: 'center' }}>
        <button
          onClick={() => navigate('/cadastro')}
          className="v2-btn v2-btn-cyber"
          style={{ fontSize: '1.1rem', padding: '16px 36px' }}
        >
          Experimentar Esta Experiência no Meu Consultório <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}

