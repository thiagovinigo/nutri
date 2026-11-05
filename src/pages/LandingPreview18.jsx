import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sliders,
  Bot,
  Radio,
  Utensils,
  ShieldCheck,
  Stethoscope,
  Dumbbell,
  Heart
} from 'lucide-react';
import PreviewSwitcher from '../components/landing/PreviewSwitcher';
import { landingData } from '../components/landing/landingData';
import '../landing-v2.css';
import '../landing-previews.css';

export default function LandingPreview18() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [specialty, setSpecialty] = useState('esportiva');
  const [radarDays, setRadarDays] = useState(4);
  const [botTone, setBotTone] = useState('acolhedor');

  const totalSteps = 4;
  const progressPercent = (step / totalSteps) * 100;

  return (
    <div style={{ background: '#050712', minHeight: '100vh', color: '#f8fafc', padding: '60px 20px 120px' }}>
      <PreviewSwitcher current="p18" />

      {/* Header */}
      <div style={{ maxWidth: '960px', margin: '0 auto 40px', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(99, 102, 241, 0.12)', border: '1px solid rgba(99, 102, 241, 0.35)', padding: '6px 16px', borderRadius: '9999px', color: '#818cf8', fontSize: '0.8rem', fontWeight: 800, marginBottom: '20px' }}>
          <Sliders size={14} />
          <span>LAYOUT 18 // MULTI-STEP ONBOARDING WIZARD</span>
        </div>

        <h1 className="v2-heading" style={{ fontSize: 'clamp(2.4rem, 5vw, 4rem)', color: '#fff', margin: '0 0 16px', lineHeight: 1.15 }}>
          Veja como é simples colocar o Nutrivvo <br />
          <span style={{ background: 'linear-gradient(135deg, #818cf8, #c084fc, #38bdf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            para rodar no seu consultório em 3 minutos.
          </span>
        </h1>

        <p style={{ color: '#94a3b8', fontSize: '1.15rem', maxWidth: '700px', margin: '0 auto 32px', lineHeight: 1.6 }}>
          Simule os 4 passos de personalização da sua clínica com Inteligência Artificial agora mesmo.
        </p>
      </div>

      {/* Wizard Container */}
      <div style={{ maxWidth: '840px', margin: '0 auto 50px', background: 'rgba(15, 20, 38, 0.95)', border: '1px solid rgba(255, 255, 255, 0.14)', borderRadius: '28px', padding: '36px', boxShadow: '0 30px 80px rgba(0,0,0,0.85), 0 0 50px rgba(99, 102, 241, 0.15)' }}>
        
        {/* Progress Bar */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 700, color: '#94a3b8', marginBottom: '10px' }}>
            <span>Passo {step} de {totalSteps}</span>
            <span style={{ color: '#818cf8' }}>{Math.round(progressPercent)}% Concluído</span>
          </div>
          <div style={{ width: '100%', height: '8px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '9999px', overflow: 'hidden' }}>
            <div style={{ width: `${progressPercent}%`, height: '100%', background: 'linear-gradient(90deg, #6366f1, #a855f7, #38bdf8)', transition: 'width 0.3s ease' }} />
          </div>
        </div>

        {/* Step 1: Especialidade */}
        {step === 1 && (
          <div>
            <h3 style={{ fontSize: '1.5rem', color: '#fff', fontWeight: 800, margin: '0 0 8px' }}>
              Qual é o foco principal do seu atendimento?
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '0.92rem', marginBottom: '24px' }}>
              Isso calibra os modelos de cálculo metabólico (Harris-Benedict, Cunningham) e sugestões de cardápios.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '32px' }}>
              {[
                { id: 'esportiva', title: 'Nutrição Esportiva', desc: 'Hipertrofia, endurance e periodização de treinos', icon: Dumbbell },
                { id: 'emagrecimento', title: 'Emagrecimento', desc: 'Déficit calórico progressivo e controle de saciedade', icon: Heart },
                { id: 'clinica', title: 'Clínica & Exames', desc: 'Diabetes, dislipidemias e leitura laboratorial', icon: Stethoscope }
              ].map(item => {
                const Icon = item.icon;
                const isSelected = specialty === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => setSpecialty(item.id)}
                    style={{
                      background: isSelected ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                      border: isSelected ? '2px solid #818cf8' : '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '18px',
                      padding: '20px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <Icon size={24} color={isSelected ? '#818cf8' : '#94a3b8'} style={{ marginBottom: '12px' }} />
                    <div style={{ fontWeight: 800, color: '#fff', fontSize: '1rem', marginBottom: '4px' }}>{item.title}</div>
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.4 }}>{item.desc}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 2: Radar de Abandono */}
        {step === 2 && (
          <div>
            <h3 style={{ fontSize: '1.5rem', color: '#fff', fontWeight: 800, margin: '0 0 8px' }}>
              Quantos dias sem envio de foto devem disparar o Radar?
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '0.92rem', marginBottom: '24px' }}>
              Nosso algoritmo recomenda 4 dias: é o momento exato em que a desmotivação começa, antes do paciente sumir.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
              {[
                { days: 3, label: '3 Dias', tag: 'Modo Rigoroso', desc: 'Ideal para atletas de alta performance em cutting' },
                { days: 4, label: '4 Dias (Recomendado)', tag: 'Padrão Ouro', desc: 'Taxa máxima comprovada de resgate clínico (89%)' },
                { days: 7, label: '7 Dias', tag: 'Modo Flexível', desc: 'Para pacientes que fazem check-in apenas aos fins de semana' }
              ].map(item => {
                const isSelected = radarDays === item.days;
                return (
                  <div
                    key={item.days}
                    onClick={() => setRadarDays(item.days)}
                    style={{
                      background: isSelected ? 'rgba(168, 85, 247, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                      border: isSelected ? '2px solid #c084fc' : '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '18px',
                      padding: '20px',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#c084fc', textTransform: 'uppercase', marginBottom: '6px' }}>{item.tag}</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#fff', marginBottom: '6px' }}>{item.label}</div>
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{item.desc}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 3: Telegram Bot */}
        {step === 3 && (
          <div>
            <h3 style={{ fontSize: '1.5rem', color: '#fff', fontWeight: 800, margin: '0 0 8px' }}>
              Como a sua Secretária IA deve falar com seus pacientes?
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '0.92rem', marginBottom: '24px' }}>
              A IA responderá dúvidas de substituição com base nas regras clínicas que você definir.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
              {[
                { id: 'acolhedor', label: 'Acolhedor & Empático', example: '"Olá, Camila! Vi que hoje foi corrido. Que tal manter o foco na água e tentar o jantar planejado?"' },
                { id: 'direto', label: 'Técnico & Preciso', example: '"Olá, Camila! Substituição autorizada: 100g de batata doce equivalem a 80g de mandioca cozida."' },
                { id: 'motivador', label: 'Motivador & Gamer', example: '"Falta só 1 foto para manter sua ofensiva de 14 dias em chamas! Não deixa o streak cair!"' }
              ].map(item => {
                const isSelected = botTone === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => setBotTone(item.id)}
                    style={{
                      background: isSelected ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                      border: isSelected ? '2px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '18px',
                      padding: '20px',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ fontWeight: 800, color: '#fff', fontSize: '1rem', marginBottom: '8px' }}>{item.label}</div>
                    <div style={{ fontSize: '0.8rem', color: '#cbd5e1', fontStyle: 'italic', lineHeight: 1.4 }}>{item.example}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 4: Concluído & Prévia */}
        {step === 4 && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(52, 211, 153, 0.15)', border: '2px solid #34d399', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <CheckCircle2 size={36} color="#34d399" />
            </div>

            <h3 style={{ fontSize: '1.8rem', color: '#fff', fontWeight: 900, margin: '0 0 10px' }}>
              Seu Consultório Está 100% Configurado!
            </h3>

            <p style={{ color: '#94a3b8', fontSize: '1rem', maxWidth: '520px', margin: '0 auto 28px' }}>
              Especialidade definida como <strong>{specialty}</strong>, Radar calibrado para <strong>{radarDays} dias</strong> e tom de voz <strong>{botTone}</strong>.
            </p>

            <button
              onClick={() => navigate('/cadastro')}
              className="v2-btn v2-btn-cyber"
              style={{ fontSize: '1.1rem', padding: '16px 40px' }}
            >
              Criar Minha Conta e Ativar em Produção <ArrowRight size={18} />
            </button>
          </div>
        )}

        {/* Wizard Navigation Footer */}
        {step < 4 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '20px' }}>
            <button
              onClick={() => setStep(prev => Math.max(1, prev - 1))}
              disabled={step === 1}
              style={{
                background: 'transparent',
                border: 'none',
                color: step === 1 ? '#475569' : '#cbd5e1',
                cursor: step === 1 ? 'not-allowed' : 'pointer',
                fontSize: '0.9rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <ArrowLeft size={16} /> Voltar
            </button>

            <button
              onClick={() => setStep(prev => Math.min(4, prev + 1))}
              style={{
                background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                color: '#fff',
                border: 'none',
                padding: '10px 24px',
                borderRadius: '9999px',
                fontSize: '0.9rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              Avançar <ArrowRight size={16} />
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

