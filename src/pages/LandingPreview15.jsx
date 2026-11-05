import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Radio,
  Scan,
  Bot,
  Flame,
  Utensils,
  Dumbbell,
  Stethoscope,
  Wallet,
  ChevronDown,
  ChevronUp,
  Star,
  Zap,
  HelpCircle
} from 'lucide-react';
import PreviewSwitcher from '../components/landing/PreviewSwitcher';
import { landingData } from '../components/landing/landingData';
import '../landing-v2.css';
import '../landing-previews.css';

export default function LandingPreview15() {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState(0);
  const [billingCycle, setBillingCycle] = useState('anual'); // 'mensal' ou 'anual'

  return (
    <div style={{ background: '#04060d', minHeight: '100vh', color: '#f8fafc', padding: '60px 20px 140px' }}>
      <PreviewSwitcher current="p15" />

      {/* Hero Master */}
      <div style={{ maxWidth: '1100px', margin: '0 auto 60px', textAlign: 'center', position: 'relative' }}>
        
        {/* Glow de Fundo */}
        <div style={{ position: 'absolute', top: '-60px', left: '50%', transform: 'translateX(-50%)', width: '600px', height: '350px', background: 'radial-gradient(ellipse at center, rgba(168, 85, 247, 0.28) 0%, rgba(6, 182, 212, 0.15) 50%, rgba(0, 0, 0, 0) 75%)', filter: 'blur(70px)', pointerEvents: 'none' }} />

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(168, 85, 247, 0.15)', border: '1px solid rgba(168, 85, 247, 0.4)', padding: '8px 20px', borderRadius: '9999px', color: '#c084fc', fontSize: '0.82rem', fontWeight: 800, marginBottom: '24px' }}>
          <Sparkles size={16} />
          <span>LAYOUT 15 // O SHOWCASE DEFINITIVO (MASTER 21ST.DEV)</span>
        </div>

        <h1 className="v2-heading" style={{ fontSize: 'clamp(2.6rem, 6vw, 4.8rem)', color: '#fff', margin: '0 0 20px', lineHeight: 1.08, letterSpacing: '-0.02em' }}>
          A plataforma completa de IA que <br />
          <span style={{ background: 'linear-gradient(135deg, #a855f7, #38bdf8, #34d399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            revoluciona a clínica do consultório ao Telegram.
          </span>
        </h1>

        <p style={{ color: '#94a3b8', fontSize: '1.25rem', maxWidth: '780px', margin: '0 auto 36px', lineHeight: 1.6 }}>
          {landingData.description}
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap', marginBottom: '40px' }}>
          <button
            onClick={() => navigate('/cadastro')}
            className="v2-btn v2-btn-cyber"
            style={{ fontSize: '1.15rem', padding: '16px 38px' }}
          >
            Iniciar Teste de 7 Dias Grátis <ArrowRight size={18} />
          </button>

          <button
            onClick={() => navigate('/previews')}
            className="v2-btn v2-btn-outline"
            style={{ color: '#fff', padding: '16px 28px' }}
          >
            Ver os 15 Layouts no Hub
          </button>
        </div>

        {/* Floating Mini Telemetry Bar */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '20px', background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '10px 24px', borderRadius: '9999px', fontSize: '0.82rem', color: '#cbd5e1' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#34d399', display: 'inline-block' }} /> 98.4% de satisfação
          </span>
          <span style={{ color: 'rgba(255,255,255,0.2)' }}>|</span>
          <span>Economia média de 18h/semana</span>
          <span style={{ color: 'rgba(255,255,255,0.2)' }}>|</span>
          <span style={{ color: '#38bdf8', fontWeight: 700 }}>Sem fidelidade</span>
        </div>
      </div>

      {/* Bento Grid 3x3 Master Showcase */}
      <div style={{ maxWidth: '1180px', margin: '0 auto 80px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#fff', margin: '0 0 12px' }}>
            Tudo o que sua clínica precisa em um só ecossistema
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '1rem', maxWidth: '600px', margin: '0 auto' }}>
            Cada módulo foi arquitetado com base no fluxo real de trabalho de nutricionistas de alta performance.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
          
          {/* Card 1: Radar */}
          <div className="v2-bento-card" style={{ padding: '30px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(168, 85, 247, 0.15)', border: '1px solid rgba(168, 85, 247, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <Radio size={24} color="#c084fc" />
            </div>
            <h3 style={{ fontSize: '1.25rem', color: '#fff', margin: '0 0 10px' }}>Radar de Abandono IA</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.5, margin: 0 }}>
              Algoritmo que monitora a queda no envio de fotos e ingestão de água, alertando você no 4º dia para resgatar o paciente antes da desistência.
            </p>
          </div>

          {/* Card 2: Secretária Telegram */}
          <div className="v2-bento-card" style={{ padding: '30px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(56, 189, 248, 0.15)', border: '1px solid rgba(56, 189, 248, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <Bot size={24} color="#38bdf8" />
            </div>
            <h3 style={{ fontSize: '1.25rem', color: '#fff', margin: '0 0 10px' }}>Secretária Virtual no Telegram</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.5, margin: 0 }}>
              Atende o paciente 24h por dia para dúvidas pontuais de substituição alimentar, sem expor seu WhatsApp pessoal fora do expediente.
            </p>
          </div>

          {/* Card 3: Scanner de Prato */}
          <div className="v2-bento-card" style={{ padding: '30px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(6, 182, 212, 0.15)', border: '1px solid rgba(6, 182, 212, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <Scan size={24} color="#06b6d4" />
            </div>
            <h3 style={{ fontSize: '1.25rem', color: '#fff', margin: '0 0 10px' }}>Scanner de Prato por Visão IA</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.5, margin: 0 }}>
              O paciente tira foto do almoço e o bot reconhece arroz, feijão, frango e salada, calculando gramas aproximadas e calorias na hora.
            </p>
          </div>

          {/* Card 4: Prescrição em 3s */}
          <div className="v2-bento-card" style={{ padding: '30px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(52, 211, 153, 0.15)', border: '1px solid rgba(52, 211, 153, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <Utensils size={24} color="#34d399" />
            </div>
            <h3 style={{ fontSize: '1.25rem', color: '#fff', margin: '0 0 10px' }}>Gerador de Dietas em 3s</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.5, margin: 0 }}>
              Cardápios clínicos completos com receitas práticas, lista de compras e cálculo automatizado de TMB e GET.
            </p>
          </div>

          {/* Card 5: Gamificação */}
          <div className="v2-bento-card" style={{ padding: '30px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(249, 115, 22, 0.15)', border: '1px solid rgba(249, 115, 22, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <Flame size={24} color="#f97316" />
            </div>
            <h3 style={{ fontSize: '1.25rem', color: '#fff', margin: '0 0 10px' }}>Gamificação & Ofensiva Diária</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.5, margin: 0 }}>
              Contador de streak de fotos, missões diárias de água e barra de XP que engajam o paciente como num jogo estimulante.
            </p>
          </div>

          {/* Card 6: Treino & Exames */}
          <div className="v2-bento-card" style={{ padding: '30px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(244, 114, 182, 0.15)', border: '1px solid rgba(244, 114, 182, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <Dumbbell size={24} color="#f472b6" />
            </div>
            <h3 style={{ fontSize: '1.25rem', color: '#fff', margin: '0 0 10px' }}>Treinos & Leitor de Exames</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.5, margin: 0 }}>
              Prescreva fichas de exercícios integradas à ingestão calórica e suba laudos de sangue com cruzamento imediato de biomarcadores.
            </p>
          </div>

        </div>
      </div>

      {/* Pricing Showcase with Animated Glowing Border */}
      <div style={{ maxWidth: '960px', margin: '0 auto 80px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#fff', margin: '0 0 16px' }}>
          Investimento que se paga no primeiro paciente salvo
        </h2>

        {/* Toggle Mensal / Anual */}
        <div style={{ display: 'inline-flex', background: 'rgba(255, 255, 255, 0.06)', borderRadius: '9999px', padding: '4px', marginBottom: '40px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <button
            onClick={() => setBillingCycle('mensal')}
            style={{
              background: billingCycle === 'mensal' ? '#a855f7' : 'transparent',
              color: billingCycle === 'mensal' ? '#fff' : '#94a3b8',
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
              background: billingCycle === 'anual' ? '#a855f7' : 'transparent',
              color: billingCycle === 'anual' ? '#fff' : '#94a3b8',
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
            Anual <span style={{ background: '#34d399', color: '#000', fontSize: '0.68rem', padding: '2px 6px', borderRadius: '9999px', fontWeight: 900 }}>20% OFF</span>
          </button>
        </div>

        {/* Price Card */}
        <div style={{ maxWidth: '480px', margin: '0 auto', background: 'linear-gradient(145deg, rgba(25, 20, 45, 0.95), rgba(12, 14, 25, 0.98))', border: '2px solid rgba(168, 85, 247, 0.6)', borderRadius: '28px', padding: '36px', boxShadow: '0 25px 70px rgba(0,0,0,0.9), 0 0 50px rgba(168, 85, 247, 0.25)' }}>
          <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#c084fc', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>
            Plano Profissional Completo
          </div>

          <div style={{ fontSize: '3.4rem', fontWeight: 900, color: '#fff', marginBottom: '4px' }}>
            R$ {billingCycle === 'anual' ? '97' : '127'}
            <span style={{ fontSize: '1.1rem', color: '#94a3b8', fontWeight: 500 }}> / mês</span>
          </div>
          <div style={{ fontSize: '0.82rem', color: '#34d399', fontWeight: 700, marginBottom: '28px' }}>
            {billingCycle === 'anual' ? 'Cobrado anualmente (Economia de R$ 360)' : 'Cobrança mensal sem contrato de fidelidade'}
          </div>

          <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', color: '#cbd5e1' }}>
              <CheckCircle2 size={18} color="#34d399" /> Pacientes ilimitados no consultório
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', color: '#cbd5e1' }}>
              <CheckCircle2 size={18} color="#34d399" /> Radar de Abandono IA ativo 24/7
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', color: '#cbd5e1' }}>
              <CheckCircle2 size={18} color="#34d399" /> Bot Secretária no Telegram exclusivo
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', color: '#cbd5e1' }}>
              <CheckCircle2 size={18} color="#34d399" /> Scanner de fotos de prato por Visão IA
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', color: '#cbd5e1' }}>
              <CheckCircle2 size={18} color="#34d399" /> Prescrição de Dietas e Treinos em 3s
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', color: '#cbd5e1' }}>
              <CheckCircle2 size={18} color="#34d399" /> Prontuário, Bioimpedância e Fotos
            </div>
          </div>

          <button
            onClick={() => navigate('/cadastro')}
            className="v2-btn v2-btn-cyber"
            style={{ width: '100%', justifyContent: 'center', fontSize: '1.1rem', padding: '16px' }}
          >
            Começar 7 Dias Sem Risco <ArrowRight size={18} />
          </button>
        </div>
      </div>

      {/* Accordion FAQ */}
      <div style={{ maxWidth: '820px', margin: '0 auto 80px' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', textAlign: 'center', marginBottom: '36px' }}>
          Perguntas Frequentes de Nutricionistas
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {landingData.faqs.map((faq, idx) => (
            <div
              key={idx}
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '16px',
                overflow: 'hidden'
              }}
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? -1 : idx)}
                style={{
                  width: '100%',
                  padding: '20px 24px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: 'transparent',
                  border: 'none',
                  color: '#fff',
                  fontSize: '1rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <span>{faq.q}</span>
                {openFaq === idx ? <ChevronUp size={20} color="#a855f7" /> : <ChevronDown size={20} color="#94a3b8" />}
              </button>

              {openFaq === idx && (
                <div style={{ padding: '0 24px 20px', color: '#94a3b8', fontSize: '0.95rem', lineHeight: 1.6 }}>
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Trust & Guarantee Box */}
      <div style={{ maxWidth: '960px', margin: '0 auto', textAlign: 'center', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '24px', padding: '36px' }}>
        <ShieldCheck size={40} color="#34d399" style={{ marginBottom: '16px' }} />
        <h3 style={{ fontSize: '1.4rem', color: '#fff', margin: '0 0 10px', fontWeight: 800 }}>
          Garantia Incondicional de 7 Dias
        </h3>
        <p style={{ color: '#94a3b8', fontSize: '0.95rem', maxWidth: '600px', margin: '0 auto 24px', lineHeight: 1.6 }}>
          Cadastre seus pacientes, use a secretária no Telegram e experimente o gerador de dietas. Se não transformar seu consultório, cancele com 1 clique.
        </p>
        <button
          onClick={() => navigate('/cadastro')}
          className="v2-btn v2-btn-cyber"
          style={{ fontSize: '1.1rem', padding: '16px 40px' }}
        >
          Criar Minha Conta Gratuita Agora <ArrowRight size={18} />
        </button>
      </div>

    </div>
  );
}

