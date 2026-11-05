import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MessageSquareQuote,
  Star,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Award,
  TrendingUp,
  Heart,
  Users
} from 'lucide-react';
import PreviewSwitcher from '../components/landing/PreviewSwitcher';
import { landingData } from '../components/landing/landingData';
import '../landing-v2.css';
import '../landing-previews.css';

export default function LandingPreview12() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('todos');

  const testimonials = [
    {
      name: 'Dra. Camila Vasconcelos',
      crn: 'CRN-3 48.912',
      specialty: 'esportiva',
      specialtyLabel: 'Nutrição Esportiva',
      avatar: 'https://images.unsplash.com/photo-1594824813637-295662705572?auto=format&fit=crop&q=80&w=150',
      quote: 'Eu perdia 50% dos atletas no 2º mês porque eles relaxavam no diário. Com o bot do Telegram que avalia a foto do prato em tempo real, a adesão foi para 93%. Meu faturamento aumentou R$ 4.200 no 1º trimestre.',
      metric: '+93% Adesão de Atletas'
    },
    {
      name: 'Dr. Leonardo Silveira',
      crn: 'CRN-4 19.340',
      specialty: 'emagrecimento',
      specialtyLabel: 'Emagrecimento & Obesidade',
      avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=150',
      quote: 'O Radar de Abandono é surreal. Ele me avisou que 3 pacientes tinham parado de mandar fotos no 4º dia. Eu mandei o protocolo de resgate sugerido e recuperei os três. Só aí já pagou a assinatura do ano inteiro.',
      metric: 'Zero Pacientes Perdidos'
    },
    {
      name: 'Dra. Mariana Prado',
      crn: 'CRN-8 31.844',
      specialty: 'clinica',
      specialtyLabel: 'Clínica & Doenças Crônicas',
      avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=150',
      quote: 'O leitor de exames de sangue por IA economizou 30 minutos de cada consulta. Ele já cruza ferritina, insulina e vitamina D na hora. Consigo focar no acolhimento do paciente em vez de ficar digitando.',
      metric: '30 min salvos/consulta'
    },
    {
      name: 'Dra. Beatriz Fontana',
      crn: 'CRN-1 22.409',
      specialty: 'particular',
      specialtyLabel: 'Consultório Particular',
      avatar: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&q=80&w=150',
      quote: 'Antes eu atendia 20 pacientes e estava exausta com dúvidas no WhatsApp meia-noite. Com a secretária virtual IA que só responde perguntas alimentares autorizadas, minha qualidade de vida voltou.',
      metric: 'WhatsApp Pessoal Blindado'
    },
    {
      name: 'Dr. Thiago Mendes',
      crn: 'CRN-2 15.670',
      specialty: 'esportiva',
      specialtyLabel: 'Performance & Treino',
      avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=150',
      quote: 'Integrar a periodização de treino com a dieta no mesmo app para o paciente foi um diferencial competitivo gigante. Cobro o dobro da consulta média da minha cidade e tenho lista de espera.',
      metric: 'Consulta 2x mais valorizada'
    },
    {
      name: 'Dra. Juliana Rocha',
      crn: 'CRN-5 41.220',
      specialty: 'emagrecimento',
      specialtyLabel: 'Emagrecimento Consciente',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150',
      quote: 'A gamificação com streak de fotos e meta de água fez as pacientes competirem saudavelmente. Nenhuma paciente quer quebrar a sequência de 30 dias de ofensiva!',
      metric: 'Streak Médio de 26 dias'
    }
  ];

  const filtered = filter === 'todos' ? testimonials : testimonials.filter(t => t.specialty === filter);

  return (
    <div style={{ background: '#080a12', minHeight: '100vh', color: '#f1f5f9', padding: '60px 20px 120px' }}>
      <PreviewSwitcher current="p12" />

      {/* Hero Header */}
      <div style={{ maxWidth: '980px', margin: '0 auto 40px', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(234, 179, 8, 0.12)', border: '1px solid rgba(234, 179, 8, 0.35)', padding: '6px 16px', borderRadius: '9999px', color: '#facc15', fontSize: '0.8rem', fontWeight: 800, marginBottom: '20px' }}>
          <Award size={14} />
          <span>LAYOUT 12 // MURAL DE EVIDÊNCIAS & PROVA SOCIAL</span>
        </div>

        <h1 className="v2-heading" style={{ fontSize: 'clamp(2.4rem, 5vw, 4rem)', color: '#fff', margin: '0 0 16px', lineHeight: 1.15 }}>
          Validado por quem vive da nutrição clínica <br />
          <span style={{ background: 'linear-gradient(135deg, #facc15, #f59e0b, #fbbf24)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            todos os dias no consultório.
          </span>
        </h1>

        <p style={{ color: '#94a3b8', fontSize: '1.15rem', maxWidth: '680px', margin: '0 auto 36px', lineHeight: 1.6 }}>
          Veja os resultados reais em retenção de pacientes, economia de tempo e faturamento alcançados por profissionais em todo o Brasil.
        </p>

        {/* Aggregate Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', maxWidth: '860px', margin: '0 auto 36px' }}>
          <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '3px', color: '#facc15', marginBottom: '6px' }}>
              {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="#facc15" />)}
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#fff' }}>4.9 / 5.0</div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Nota Média de Satisfação</div>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', padding: '16px' }}>
            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#34d399', marginTop: '6px' }}>+89%</div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>Retenção no 2º Mês</div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>com Radar de Abandono</div>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', padding: '16px' }}>
            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#38bdf8', marginTop: '6px' }}>42.000+</div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>Pratos Escaneados</div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>por Visão IA no Telegram</div>
          </div>
        </div>

        {/* Specialty Filter Buttons */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {[
            { id: 'todos', label: 'Todas as Áreas' },
            { id: 'esportiva', label: 'Nutrição Esportiva' },
            { id: 'emagrecimento', label: 'Emagrecimento' },
            { id: 'clinica', label: 'Clínica & Exames' },
            { id: 'particular', label: 'Consultório Particular' }
          ].map(b => (
            <button
              key={b.id}
              onClick={() => setFilter(b.id)}
              style={{
                background: filter === b.id ? '#facc15' : 'rgba(255, 255, 255, 0.04)',
                color: filter === b.id ? '#000' : '#94a3b8',
                border: filter === b.id ? '1px solid #facc15' : '1px solid rgba(255, 255, 255, 0.08)',
                padding: '8px 16px',
                borderRadius: '9999px',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {b.label}
            </button>
          ))}
        </div>
      </div>

      {/* Masonry / Grid of Testimonials */}
      <div style={{ maxWidth: '1140px', margin: '0 auto 60px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
        {filtered.map((t, idx) => (
          <div
            key={idx}
            className="v2-bento-card"
            style={{
              padding: '28px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              background: 'rgba(15, 18, 30, 0.85)'
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#facc15', background: 'rgba(234, 179, 8, 0.12)', padding: '4px 10px', borderRadius: '6px' }}>
                  {t.specialtyLabel}
                </span>
                <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#34d399', background: 'rgba(52, 211, 153, 0.12)', padding: '4px 10px', borderRadius: '6px' }}>
                  {t.metric}
                </span>
              </div>

              <p style={{ color: '#cbd5e1', fontSize: '0.95rem', lineHeight: 1.6, fontStyle: 'italic', marginBottom: '24px' }}>
                "{t.quote}"
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '16px' }}>
              <img
                src={t.avatar}
                alt={t.name}
                style={{ width: '46px', height: '46px', borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(250, 204, 21, 0.4)' }}
              />
              <div>
                <div style={{ fontWeight: 800, color: '#fff', fontSize: '0.95rem' }}>{t.name}</div>
                <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{t.crn} • Verificado</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Compliance & Trust Seals */}
      <div style={{ maxWidth: '960px', margin: '0 auto', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '20px', padding: '24px', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '32px', flexWrap: 'wrap', alignItems: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldCheck size={18} color="#10b981" /> CFN / CRN Compliant
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldCheck size={18} color="#38bdf8" /> LGPD Saúde & Sigilo Médico
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldCheck size={18} color="#c084fc" /> Criptografia AES-256
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldCheck size={18} color="#facc15" /> Backup Diário em Nuvem
          </span>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: '40px' }}>
        <button
          onClick={() => navigate('/cadastro')}
          className="v2-btn v2-btn-cyber"
          style={{ fontSize: '1.05rem', padding: '16px 36px' }}
        >
          Junte-se às Nutricionistas que Estão Liderando o Setor <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}

