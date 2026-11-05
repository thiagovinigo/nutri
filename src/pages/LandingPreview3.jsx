import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Calendar,
  Utensils,
  Bot,
  Radio,
  TrendingUp,
  ShieldCheck
} from 'lucide-react';
import PreviewSwitcher from '../components/landing/PreviewSwitcher';
import { landingData } from '../components/landing/landingData';
import '../landing-v2.css';
import '../landing-previews.css';

export default function LandingPreview3() {
  const navigate = useNavigate();

  const steps = [
    {
      num: 'PASSO 01',
      title: 'A Consulta & Anamnese Inteligente',
      desc: 'Você atende seu paciente no consultório. Em 3 segundos, a IA analisa os exames anexados e gera o cardápio completo com receitas reais e modo de preparo.',
      tag: 'BASTIDORES CLÍNICOS',
      icon: Utensils,
      color: '#10b981'
    },
    {
      num: 'PASSO 02',
      title: 'O Acolhimento no Telegram 24h',
      desc: 'O paciente recebe as boas-vindas pelo bot verificado no Telegram. Ele confirma consultas, tira dúvidas de horários e recebe lembretes amigáveis de refeição sem ocupar seu número pessoal.',
      tag: 'SECRETÁRIA AUTÔNOMA',
      icon: Bot,
      color: '#06b6d4'
    },
    {
      num: 'PASSO 03',
      title: 'O Check-in Diário por Foto & Gamificação',
      desc: 'O paciente fotografa o almoço. A IA detecta os alimentos e estima os macros. A cada refeição correta, a ofensiva diária acende e ele acumula XP no app.',
      tag: 'ENGAJAMENTO & DOPAMINA',
      icon: Sparkles,
      color: '#f97316'
    },
    {
      num: 'PASSO 04',
      title: 'O Radar de Abandono em Ação',
      desc: 'Se o paciente passar 3 dias sem abrir o app ou faltar no diário, o Radar acende um alerta preventivo no seu CRM antes de qualquer cancelamento.',
      tag: 'PREVENÇÃO ATIVA',
      icon: Radio,
      color: '#c084fc'
    },
    {
      num: 'PASSO 05',
      title: 'O Retorno Garantido & Renovação',
      desc: 'O paciente volta motivado no mês seguinte para conferir a evolução visual no prontuário. O ciclo se renova e seu faturamento recorrente se multiplica.',
      tag: 'RETENÇÃO RECORD',
      icon: TrendingUp,
      color: '#10b981'
    }
  ];

  return (
    <div className="v2-landing" style={{ background: '#04050a' }}>
      <PreviewSwitcher current="p3" />

      {/* Hero Section */}
      <section className="v2-hero" style={{ paddingBottom: '30px' }}>
        <div className="v2-hero-pill">
          <Sparkles size={16} color="#c084fc" />
          <span className="v2-mono">LAYOUT 3 // GLOWING TIMELINE JOURNEY</span>
        </div>

        <h1 className="v2-hero-title v2-heading">
          A jornada contínua que faz o <br />
          <span className="gradient-text">paciente voltar no mês seguinte.</span>
        </h1>

        <p className="v2-hero-desc">
          Entenda passo a passo como o ecossistema Nutrivvo conecta seu consultório ao dia a dia do paciente,
          eliminando o abandono e garantindo retornos consistentes.
        </p>

        <button className="v2-btn v2-btn-cyber" style={{ padding: '16px 36px' }} onClick={() => navigate('/cadastro?role=nutricionista')}>
          Criar Minha Clínica Agora <ArrowRight size={18} />
        </button>
      </section>

      {/* Timeline Vertical com Linha Iluminada */}
      <section className="v2-section" style={{ paddingTop: '20px' }}>
        <div className="timeline-journey-wrap">
          <div className="timeline-vertical-beam" />

          {steps.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div key={idx} className="timeline-step-card">
                <div className="timeline-node-dot" style={{ borderColor: s.color, boxShadow: `0 0 15px ${s.color}` }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span className="v2-mono" style={{ fontSize: '0.78rem', color: s.color, fontWeight: 800 }}>
                    {s.num} // {s.tag}
                  </span>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: `${s.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={18} color={s.color} />
                  </div>
                </div>

                <h3 className="v2-heading" style={{ fontSize: '1.45rem', color: '#fff', margin: '0 0 10px' }}>
                  {s.title}
                </h3>

                <p style={{ color: '#94a3b8', fontSize: '0.98rem', lineHeight: 1.6, margin: 0 }}>
                  {s.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA Final */}
      <section className="v2-aurora-cta">
        <h2 className="v2-heading" style={{ fontSize: 'clamp(2.2rem, 5vw, 3.4rem)', color: '#fff', margin: '0 auto 16px' }}>
          Pronto para automatizar a retenção da sua clínica?
        </h2>
        <button className="v2-btn v2-btn-cyber" style={{ padding: '16px 36px', fontSize: '1.1rem' }} onClick={() => navigate('/cadastro?role=nutricionista')}>
          Começar Grátis em 2 Minutos <ArrowRight size={20} />
        </button>
      </section>

      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: '40px 20px 100px', textAlign: 'center', color: '#64748b' }}>
        © 2026 Nutrivvo — Layout 3: Timeline Journey
      </footer>
    </div>
  );
}
