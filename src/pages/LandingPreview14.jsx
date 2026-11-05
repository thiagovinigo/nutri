import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Layers,
  Activity,
  Heart,
  Droplets,
  Flame,
  ArrowRight,
  Shield,
  Smartphone,
  CheckCircle2,
  Sliders
} from 'lucide-react';
import PreviewSwitcher from '../components/landing/PreviewSwitcher';
import { landingData } from '../components/landing/landingData';
import '../landing-v2.css';
import '../landing-previews.css';

export default function LandingPreview14() {
  const navigate = useNavigate();
  const [activeSpatialTab, setActiveSpatialTab] = useState('prontuario');

  return (
    <div style={{ background: '#080a14', minHeight: '100vh', color: '#f8fafc', padding: '60px 20px 120px', position: 'relative', overflow: 'hidden' }}>
      <PreviewSwitcher current="p14" />

      {/* Spatial Ambient Glowing Orbs */}
      <div style={{ position: 'absolute', top: '5%', left: '15%', width: '450px', height: '450px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(168, 85, 247, 0.22) 0%, rgba(168, 85, 247, 0) 70%)', filter: 'blur(80px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: '35%', right: '10%', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(6, 182, 212, 0.2) 0%, rgba(6, 182, 212, 0) 70%)', filter: 'blur(90px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '10%', left: '25%', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(244, 114, 182, 0.18) 0%, rgba(244, 114, 182, 0) 70%)', filter: 'blur(80px)', pointerEvents: 'none' }} />

      {/* Hero Header */}
      <div style={{ maxWidth: '980px', margin: '0 auto 40px', textAlign: 'center', position: 'relative', zIndex: 2 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255, 255, 255, 0.08)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.2)', padding: '6px 18px', borderRadius: '9999px', color: '#c084fc', fontSize: '0.8rem', fontWeight: 800, marginBottom: '20px' }}>
          <Sparkles size={14} />
          <span>LAYOUT 14 // SPATIAL GLASSMORPHISM (VISION OS STYLE)</span>
        </div>

        <h1 className="v2-heading" style={{ fontSize: 'clamp(2.4rem, 5.5vw, 4.2rem)', color: '#fff', margin: '0 0 16px', lineHeight: 1.15 }}>
          A computação espacial e a IA <br />
          <span style={{ background: 'linear-gradient(135deg, #ffffff 20%, #c084fc 60%, #38bdf8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            redefinindo a consulta nutricional.
          </span>
        </h1>

        <p style={{ color: '#cbd5e1', fontSize: '1.2rem', maxWidth: '720px', margin: '0 auto 36px', lineHeight: 1.6 }}>
          Uma interface com profundidade luminosa projetada para eliminar o ruído visual e colocar a evolução do paciente no centro da experiência.
        </p>

        {/* Spatial Tab Bar */}
        <div style={{ display: 'inline-flex', background: 'rgba(255, 255, 255, 0.06)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '9999px', padding: '6px', gap: '6px' }}>
          {[
            { id: 'prontuario', label: 'Prontuário Imersivo' },
            { id: 'aneis', label: 'Anéis de Adesão em Tempo Real' },
            { id: 'telegram', label: 'Assistente Espacial 24h' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveSpatialTab(tab.id)}
              style={{
                background: activeSpatialTab === tab.id ? 'rgba(255, 255, 255, 0.18)' : 'transparent',
                color: activeSpatialTab === tab.id ? '#fff' : '#94a3b8',
                border: activeSpatialTab === tab.id ? '1px solid rgba(255, 255, 255, 0.25)' : 'none',
                padding: '10px 22px',
                borderRadius: '9999px',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.25s ease'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Floating Spatial Window */}
      <div style={{ maxWidth: '1080px', margin: '0 auto 60px', position: 'relative', zIndex: 2 }}>
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.04)',
            backdropFilter: 'blur(36px)',
            WebkitBackdropFilter: 'blur(36px)',
            border: '1px solid rgba(255, 255, 255, 0.18)',
            borderRadius: '32px',
            padding: '40px',
            boxShadow: '0 30px 90px rgba(0, 0, 0, 0.75), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
          }}
        >
          {activeSpatialTab === 'prontuario' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Acompanhamento Contínuo
                </span>
                <h3 style={{ fontSize: '1.8rem', color: '#fff', margin: '8px 0 16px', fontWeight: 800 }}>
                  Linha do Tempo Visual Sem Fricção
                </h3>
                <p style={{ color: '#cbd5e1', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '24px' }}>
                  Veja fotos do paciente lado a lado, medições de dobras cutâneas e bioimpedância dispostas em camadas de profundidade espacial.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#e2e8f0', fontSize: '0.9rem' }}>
                    <CheckCircle2 size={18} color="#34d399" /> Comparativo fotográfico antes e depois automático
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#e2e8f0', fontSize: '0.9rem' }}>
                    <CheckCircle2 size={18} color="#34d399" /> Curva de massa magra e percentual de gordura sincronizada
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#e2e8f0', fontSize: '0.9rem' }}>
                    <CheckCircle2 size={18} color="#34d399" /> Registro histórico protegido com criptografia de ponta a ponta
                  </div>
                </div>
              </div>

              {/* Spatial Glass Card */}
              <div style={{ background: 'rgba(0, 0, 0, 0.4)', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '24px', padding: '24px', backdropFilter: 'blur(20px)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <span style={{ fontWeight: 800, color: '#fff' }}>Paciente: Camila Rodrigues</span>
                  <span style={{ color: '#34d399', fontSize: '0.8rem', fontWeight: 700, background: 'rgba(52, 211, 153, 0.15)', padding: '4px 10px', borderRadius: '9999px' }}>
                    Adesão Alta (94%)
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div style={{ background: 'rgba(255, 255, 255, 0.04)', borderRadius: '16px', padding: '16px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Peso Inicial</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#fff' }}>74.2 kg</div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Consulta 1</div>
                  </div>

                  <div style={{ background: 'rgba(255, 255, 255, 0.04)', borderRadius: '16px', padding: '16px', textAlign: 'center', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
                    <div style={{ fontSize: '0.75rem', color: '#38bdf8' }}>Peso Atual</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#38bdf8' }}>68.8 kg</div>
                    <div style={{ fontSize: '0.72rem', color: '#34d399' }}>-5.4 kg de gordura</div>
                  </div>
                </div>

                <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '14px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.06)', fontSize: '0.82rem', color: '#cbd5e1' }}>
                  💬 Última mensagem no Telegram: <em>"Nutri, enviei a foto do almoço de hoje! Consegui bater os 2.5L de água."</em>
                </div>
              </div>
            </div>
          )}

          {activeSpatialTab === 'aneis' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#f472b6', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Biofeedback Visual
                </span>
                <h3 style={{ fontSize: '1.8rem', color: '#fff', margin: '8px 0 16px', fontWeight: 800 }}>
                  Anéis de Atividade & Gamificação
                </h3>
                <p style={{ color: '#cbd5e1', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '24px' }}>
                  Inspirado na neurociência do hábito: o paciente fecha anéis diários de fotos de prato, hidratação e treino, gerando dopamina saudável e retenção involuntária.
                </p>

                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '14px', padding: '12px 18px' }}>
                    <div style={{ color: '#ef4444', fontWeight: 800 }}>Refeições</div>
                    <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#fff' }}>4 / 4</div>
                  </div>
                  <div style={{ background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: '14px', padding: '12px 18px' }}>
                    <div style={{ color: '#38bdf8', fontWeight: 800 }}>Água</div>
                    <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#fff' }}>2.8L</div>
                  </div>
                  <div style={{ background: 'rgba(168, 85, 247, 0.1)', border: '1px solid rgba(168, 85, 247, 0.3)', borderRadius: '14px', padding: '12px 18px' }}>
                    <div style={{ color: '#c084fc', fontWeight: 800 }}>Treino</div>
                    <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#fff' }}>Feito</div>
                  </div>
                </div>
              </div>

              {/* Graphical Rings Mockup */}
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '30px' }}>
                <div style={{ width: '220px', height: '220px', borderRadius: '50%', border: '10px solid #ef4444', display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: '0 0 30px rgba(239, 68, 68, 0.3)', position: 'relative' }}>
                  <div style={{ width: '170px', height: '170px', borderRadius: '50%', border: '10px solid #38bdf8', display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: '0 0 25px rgba(56, 189, 248, 0.3)' }}>
                    <div style={{ width: '120px', height: '120px', borderRadius: '50%', border: '10px solid #a855f7', display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: '0 0 20px rgba(168, 85, 247, 0.3)' }}>
                      <Flame size={32} color="#f97316" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSpatialTab === 'telegram' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Automação Gentil
                </span>
                <h3 style={{ fontSize: '1.8rem', color: '#fff', margin: '8px 0 16px', fontWeight: 800 }}>
                  A Secretária IA Que Responde Por Você
                </h3>
                <p style={{ color: '#cbd5e1', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '24px' }}>
                  Nunca mais seja interrompida no domingo para responder se o paciente pode trocar aveia por farelo. A IA orienta com base no plano clínico que você prescreveu.
                </p>

                <div style={{ background: 'rgba(255, 255, 255, 0.04)', borderRadius: '16px', padding: '16px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <div style={{ color: '#34d399', fontWeight: 700, fontSize: '0.85rem', marginBottom: '4px' }}>
                    ✓ 100% calibrada pelos seus parâmetros clínicos
                  </div>
                  <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>
                    Casos que exigem julgamento médico são encaminhados diretamente para a sua lista de prioridades na segunda-feira.
                  </div>
                </div>
              </div>

              {/* Chat Glass Bubble */}
              <div style={{ background: 'rgba(10, 15, 25, 0.7)', borderRadius: '20px', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '20px' }}>
                <div style={{ background: 'rgba(56, 189, 248, 0.12)', border: '1px solid rgba(56, 189, 248, 0.3)', padding: '12px 16px', borderRadius: '14px', marginBottom: '12px', fontSize: '0.88rem' }}>
                  <strong>Paciente:</strong> <em>"Nutri, acabou meu whey protein. Posso comer 3 ovos cozidos no lugar antes do treino?"</em>
                </div>

                <div style={{ background: 'rgba(168, 85, 247, 0.15)', border: '1px solid rgba(168, 85, 247, 0.3)', padding: '12px 16px', borderRadius: '14px', fontSize: '0.88rem', color: '#f3e8ff' }}>
                  <strong>Nutrivvo IA:</strong> <em>"Olá, Rodrigo! Pelo plano da Dra. Camila, sim! 3 ovos fornecem cerca de 18g de proteína de alto valor biológico. Consuma 50 minutos antes para boa digestão."</em>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Floating Action Bar */}
      <div style={{ textAlign: 'center', position: 'relative', zIndex: 2 }}>
        <button
          onClick={() => navigate('/cadastro')}
          className="v2-btn v2-btn-cyber"
          style={{ fontSize: '1.1rem', padding: '16px 40px', backdropFilter: 'blur(20px)' }}
        >
          Experimentar Interface Imersiva Agora <ArrowRight size={18} />
        </button>
      </div>

    </div>
  );
}

