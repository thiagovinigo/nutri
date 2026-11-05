import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calculator,
  TrendingUp,
  DollarSign,
  Clock,
  Users,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Zap,
  CheckCircle2,
  Lock
} from 'lucide-react';
import PreviewSwitcher from '../components/landing/PreviewSwitcher';
import { landingData } from '../components/landing/landingData';
import '../landing-v2.css';
import '../landing-previews.css';

export default function LandingPreview10() {
  const navigate = useNavigate();

  // Financial Calculator States
  const [patients, setPatients] = useState(40);
  const [ticketPrice, setTicketPrice] = useState(250);
  const [churnRate, setChurnRate] = useState(35); // 35% de abandono normal de mercado

  // Calculated Metrics
  const monthlyRevenueCurrent = patients * ticketPrice;
  const lostPatientsPerMonth = Math.round((patients * (churnRate / 100)));
  const lostRevenuePerMonth = lostPatientsPerMonth * ticketPrice;

  // With Nutrivvo: 75% reduction in churn
  const savedPatientsPerMonth = Math.round(lostPatientsPerMonth * 0.75);
  const recoveredRevenueMonthly = savedPatientsPerMonth * ticketPrice;
  const recoveredRevenueAnnual = recoveredRevenueMonthly * 12;

  // Time Saved: 3 hours per patient diet creation & support
  const hoursSavedPerMonth = Math.round(patients * 0.75); // approx 45 mins saved per patient per month
  const nutrivvoSubscription = 97; // Pro plan base
  const roiMultiplier = Math.round((recoveredRevenueMonthly / nutrivvoSubscription));

  return (
    <div style={{ background: '#05070e', minHeight: '100vh', color: '#f8fafc', padding: '60px 20px 120px' }}>
      <PreviewSwitcher current="p10" />

      {/* Header */}
      <div style={{ maxWidth: '980px', margin: '0 auto 40px', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)', padding: '6px 16px', borderRadius: '9999px', color: '#4ade80', fontSize: '0.8rem', fontWeight: 800, marginBottom: '20px' }}>
          <Calculator size={14} />
          <span>LAYOUT 10 // SIMULADOR DE ROI & AUDITORIA FINANCEIRA</span>
        </div>

        <h1 className="v2-heading" style={{ fontSize: 'clamp(2.3rem, 5vw, 3.8rem)', color: '#fff', margin: '0 0 16px', lineHeight: 1.15 }}>
          Quanto dinheiro o seu consultório <br />
          <span style={{ background: 'linear-gradient(135deg, #4ade80, #22c55e, #10b981)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            está deixando na mesa todos os meses?
          </span>
        </h1>

        <p style={{ color: '#94a3b8', fontSize: '1.15rem', maxWidth: '700px', margin: '0 auto', lineHeight: 1.6 }}>
          Calcule em tempo real o faturamento resgatado pelo Radar de Abandono e as horas clínicas devolvidas pela automação com Inteligência Artificial.
        </p>
      </div>

      {/* Main Interactive Calculator Card */}
      <div style={{ maxWidth: '1080px', margin: '0 auto 60px', background: 'rgba(15, 20, 35, 0.95)', border: '1px solid rgba(34, 197, 94, 0.3)', borderRadius: '28px', padding: '36px', boxShadow: '0 30px 80px rgba(0,0,0,0.9), 0 0 50px rgba(34, 197, 94, 0.15)', display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '40px' }}>
        
        {/* Left Side: Sliders Controls */}
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <TrendingUp size={22} color="#4ade80" /> Parâmetros do seu Consultório
          </h2>

          {/* Slider 1: Pacientes */}
          <div style={{ marginBottom: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <label style={{ fontSize: '0.9rem', color: '#cbd5e1', fontWeight: 600 }}>
                Pacientes Ativos na Carteira
              </label>
              <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#38bdf8' }}>
                {patients} pacientes
              </span>
            </div>
            <input
              type="range"
              min="10"
              max="150"
              step="5"
              value={patients}
              onChange={(e) => setPatients(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#38bdf8', cursor: 'pointer', height: '6px' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
              <span>10</span>
              <span>80</span>
              <span>150</span>
            </div>
          </div>

          {/* Slider 2: Ticket Médio */}
          <div style={{ marginBottom: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <label style={{ fontSize: '0.9rem', color: '#cbd5e1', fontWeight: 600 }}>
                Valor da Consulta / Mensalidade
              </label>
              <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#4ade80' }}>
                R$ {ticketPrice}
              </span>
            </div>
            <input
              type="range"
              min="120"
              max="600"
              step="10"
              value={ticketPrice}
              onChange={(e) => setTicketPrice(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#4ade80', cursor: 'pointer', height: '6px' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
              <span>R$ 120</span>
              <span>R$ 350</span>
              <span>R$ 600</span>
            </div>
          </div>

          {/* Slider 3: Taxa de Evasão Atual */}
          <div style={{ marginBottom: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <label style={{ fontSize: '0.9rem', color: '#cbd5e1', fontWeight: 600 }}>
                Taxa de Abandono Estimada (sem IA)
              </label>
              <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#f87171' }}>
                {churnRate}% ao mês
              </span>
            </div>
            <input
              type="range"
              min="15"
              max="60"
              step="5"
              value={churnRate}
              onChange={(e) => setChurnRate(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#f87171', cursor: 'pointer', height: '6px' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
              <span>15% (Baixa)</span>
              <span>35% (Média de Mercado)</span>
              <span>60% (Alta)</span>
            </div>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.04)', borderRadius: '16px', padding: '16px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div style={{ fontSize: '0.82rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Lock size={14} color="#38bdf8" /> Faturamento atual sem proteção: 
              <strong style={{ color: '#fff' }}>R$ {monthlyRevenueCurrent.toLocaleString('pt-BR')} / mês</strong>
            </div>
          </div>
        </div>

        {/* Right Side: Dynamic ROI Output */}
        <div style={{ background: 'linear-gradient(145deg, rgba(20, 28, 48, 0.9), rgba(12, 16, 28, 0.95))', border: '1px solid rgba(74, 222, 128, 0.35)', borderRadius: '24px', padding: '32px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#4ade80', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
              Retorno Projetado com Nutrivvo OS
            </div>

            <div style={{ fontSize: 'clamp(2.2rem, 3.5vw, 3.2rem)', fontWeight: 900, color: '#fff', marginBottom: '4px' }}>
              + R$ {recoveredRevenueMonthly.toLocaleString('pt-BR')}
              <span style={{ fontSize: '1rem', color: '#94a3b8', fontWeight: 500 }}> / mês</span>
            </div>
            <div style={{ color: '#86efac', fontSize: '0.95rem', fontWeight: 600, marginBottom: '24px' }}>
              R$ {recoveredRevenueAnnual.toLocaleString('pt-BR')} extras preservados por ano
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '28px' }}>
              <div style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', padding: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#38bdf8', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px' }}>
                  <Users size={14} /> Pacientes Salvos
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#fff' }}>
                  +{savedPatientsPerMonth}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>resgatados pelo Radar IA</div>
              </div>

              <div style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', padding: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#c084fc', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px' }}>
                  <Clock size={14} /> Tempo Economizado
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#fff' }}>
                  +{hoursSavedPerMonth}h
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>livres de digitação/mês</div>
              </div>
            </div>

            <div style={{ background: 'rgba(74, 222, 128, 0.1)', border: '1px dashed rgba(74, 222, 128, 0.4)', borderRadius: '14px', padding: '14px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.85rem', color: '#dcfce7', fontWeight: 600 }}>
                Multiplicador de Retorno:
              </span>
              <span style={{ fontSize: '1.2rem', fontWeight: 900, color: '#4ade80' }}>
                {roiMultiplier}x o valor da assinatura
              </span>
            </div>
          </div>

          <button
            onClick={() => navigate('/cadastro')}
            className="v2-btn v2-btn-cyber"
            style={{ width: '100%', justifyContent: 'center', fontSize: '1.05rem', padding: '16px' }}
          >
            Começar Teste Grátis de 7 Dias <ArrowRight size={18} />
          </button>
        </div>
      </div>

      {/* Feature Pillar Summary */}
      <div style={{ maxWidth: '1080px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        <div className="v2-bento-card" style={{ padding: '24px' }}>
          <Zap size={24} color="#4ade80" style={{ marginBottom: '12px' }} />
          <h3 style={{ fontSize: '1.15rem', color: '#fff', margin: '0 0 8px' }}>Cobrança Pontual Sem Constrangimento</h3>
          <p style={{ color: '#94a3b8', fontSize: '0.88rem', lineHeight: 1.5, margin: 0 }}>
            Lembretes elegantes de renovação enviados automaticamente pelo Telegram antes do vencimento do plano do paciente.
          </p>
        </div>

        <div className="v2-bento-card" style={{ padding: '24px' }}>
          <Users size={24} color="#38bdf8" style={{ marginBottom: '12px' }} />
          <h3 style={{ fontSize: '1.15rem', color: '#fff', margin: '0 0 8px' }}>Prevenção de Abandono em 4 Dias</h3>
          <p style={{ color: '#94a3b8', fontSize: '0.88rem', lineHeight: 1.5, margin: 0 }}>
            O Radar identifica a perda de adesão no 4º dia sem registro de prato e aciona o protocolo de resgate humanizado.
          </p>
        </div>

        <div className="v2-bento-card" style={{ padding: '24px' }}>
          <Clock size={24} color="#c084fc" style={{ marginBottom: '12px' }} />
          <h3 style={{ fontSize: '1.15rem', color: '#fff', margin: '0 0 8px' }}>Mais Pacientes, Menos Exaustão</h3>
          <p style={{ color: '#94a3b8', fontSize: '0.88rem', lineHeight: 1.5, margin: 0 }}>
            Ao reduzir o tempo de prescrição de 40 para 3 minutos, você dobra sua capacidade de atendimento sem dobrar suas horas de trabalho.
          </p>
        </div>
      </div>
    </div>
  );
}
