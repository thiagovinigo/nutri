import React, { useState } from 'react';
import { ArrowRight, Check, Send, ShieldCheck, Sparkles } from 'lucide-react';
import { useNoema } from '../noemaStore';
import { NoemaRadar360Svg, NoemaRingSvg } from '../NoemaVisuals';

const CAPABILITIES = [
  {
    num: '01',
    title: 'Radar de Abandono 360°',
    tag: 'TELEMETRIA PREDITIVA',
    summary: 'Monitoramento automático da sequência de dias ativos, hidratação e check-ins visuais antes do paciente desistir.',
    metric: 'Score de risco em tempo real (0–100%)',
    targetPath: '/noema/crm'
  },
  {
    num: '02',
    title: 'Secretária Virtual no Telegram',
    tag: 'BOT 24H INTEGRADO',
    summary: 'Confirma consultas, pede foto do almoço na hora exata e responde dúvidas de substituição sem misturar seu WhatsApp pessoal.',
    metric: '92% de consultas confirmadas sem intervenção humana',
    targetPath: '/noema/crm'
  },
  {
    num: '03',
    title: 'Check-in Diário por Foto IA',
    tag: 'VISÃO COMPUTACIONAL',
    summary: 'O paciente fotografa o prato e a IA estima porções e macros visíveis, creditando +35 XP direto no diário alimentar.',
    metric: 'Análise visual média em 1.2s sem digitação',
    targetPath: '/noema/paciente'
  },
  {
    num: '04',
    title: 'Alta Gamificação & Ofensiva XP',
    tag: 'ENGAJAMENTO CONTÍNUO',
    summary: 'Metas diárias de água, sono e refeições viram ofensiva de dias seguidos e cartões compartilháveis que divulgam sua clínica.',
    metric: 'Retenção ativa entre retornos multiplicada',
    targetPath: '/noema/paciente'
  },
  {
    num: '05',
    title: 'Cardápios TACO com IA Real',
    tag: 'PRESCRIÇÃO RÁPIDA',
    summary: 'Planos de 1 a 30 dias considerando exames laboratoriais, restrições e receitas reais com modo de preparo.',
    metric: 'De 45 minutos para menos de 3 minutos em consulta',
    targetPath: '/noema/crm'
  },
  {
    num: '06',
    title: 'Exames Laboratoriais & Treino',
    tag: 'CONDUTA INTEGRADA',
    summary: 'Leitura evolutiva de ferritina, vitamina D e glicemia conectada à periodização física e composição corporal.',
    metric: 'Histórico comparativo por paciente em SVG limpo',
    targetPath: '/noema/crm'
  }
];

export default function NoemaLandingView({ onNavigate }) {
  const { patients, activePatient, setActivePatientId, sendTelegramMessage, billingCycle, setBillingCycle } = useNoema();
  const [activeCapIdx, setActiveCapIdx] = useState(0);
  const [sentAlertId, setSentAlertId] = useState(null);

  const avgAdherence = Math.round(patients.reduce((acc, p) => acc + p.adherence, 0) / patients.length);
  const atRiskCount = patients.filter((p) => p.status !== 'ativo').length;
  const activeCap = CAPABILITIES[activeCapIdx] || CAPABILITIES[0];

  const handleQuickNudge = (patient) => {
    setActivePatientId(patient.id);
    sendTelegramMessage(
      patient.id,
      `Oi ${patient.shortName.split(' ')[0]}! Vi aqui no Radar Nutrivvo seu progresso — quer enviar a foto da sua próxima refeição para garantir +35 XP hoje?`
    );
    setSentAlertId(patient.id);
  };

  return (
    <div>
      {/* 01 · HERO VOID COM HALO ELÉTRICO & DUPLO WIDGET AO VIVO */}
      <section className="noema-hero">
        <div className="noema-container noema-hero-grid">
          <div>
            <span className="noema-eyebrow">NØEMA SYSTEM · NUTRIVVO CRM + APP</span>
            <h1 className="noema-display-xl">
              <span>Seu paciente some</span><br />
              <span className="noema-serif-italic">entre consultas.</span><br />
              <span className="noema-stroke">O NUTRIVVO NÃO DEIXA.</span>
            </h1>
            <p style={{ color: 'var(--n-ink-muted)', maxWidth: '58ch', fontSize: '1.05rem', marginBottom: '1.8rem' }}>
              Protótipo funcional no formato NØEMA AI Studio: tudo que você dispara na Landing ou no CRM reflete instantaneamente no aplicativo do paciente e nos alertas do Radar.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
              <button type="button" className="n-btn n-btn-electric" onClick={() => onNavigate('/noema/crm')}>
                Abrir CRM Nutricionista <ArrowRight size={16} aria-hidden="true" />
              </button>
              <button type="button" className="n-btn" onClick={() => onNavigate('/noema/paciente')}>
                Testar App do Paciente
              </button>
              <button type="button" className="n-btn" onClick={() => onNavigate('/noema/componentes')}>
                Catálogo #components
              </button>
            </div>
            <p style={{ fontFamily: 'var(--n-font-mono)', fontSize: '0.72rem', color: 'var(--n-ink-muted)' }}>
              SINCRONIZAÇÃO REAL ATIVA · SEM CARTÃO DE CRÉDITO · PRONTO EM 2 MINUTOS
            </p>
          </div>

          {/* Widget vivo sincronizado com o estado global */}
          <div className="n-grid-2" aria-label="Telemetria ao vivo CRM e App">
            <div className="n-card" style={{ borderColor: 'rgba(169, 165, 255, 0.38)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <span style={{ fontFamily: 'var(--n-font-mono)', fontSize: '0.68rem', color: 'var(--n-signal)' }}>CRM · AO VIVO</span>
                <span className="n-tag n-tag-warn">{atRiskCount} Alertas</span>
              </div>
              <div className="n-grid-2" style={{ gap: '0.65rem', marginBottom: '1rem' }}>
                <div style={{ border: '1px solid var(--n-line)', padding: '0.75rem' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--n-ink-muted)' }}>Carteira</div>
                  <strong className="n-tabular" style={{ fontSize: '1.5rem' }}>{patients.length} Pac.</strong>
                </div>
                <div style={{ border: '1px solid var(--n-line)', padding: '0.75rem' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--n-ink-muted)' }}>Adesão Média</div>
                  <strong className="n-tabular" style={{ fontSize: '1.5rem' }}>{avgAdherence}%</strong>
                </div>
              </div>
              <div style={{ border: '1px solid var(--n-line)', padding: '0.75rem', background: 'var(--n-void)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
                  <strong className="n-truncate" style={{ fontSize: '0.84rem' }}>{activePatient.name}</strong>
                  <span className="n-tag n-tag-ok">{activePatient.streak}d</span>
                </div>
                <div style={{ fontSize: '0.76rem', color: 'var(--n-ink-muted)', marginTop: '0.3rem' }}>
                  {activePatient.lastSeen}
                </div>
              </div>
            </div>

            <div className="n-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.9rem' }}>
                <span style={{ fontFamily: 'var(--n-font-mono)', fontSize: '0.68rem', color: 'var(--n-ink-muted)' }}>APP PACIENTE</span>
                <span className="n-tag n-tag-signal n-tabular">{activePatient.xp} XP</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1rem' }}>
                <NoemaRingSvg percent={Math.min(100, Math.round((activePatient.waterMl / activePatient.waterGoal) * 100))} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.92rem' }} className="n-truncate">{activePatient.shortName}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--n-ink-muted)' }} className="n-tabular">
                    Água: {activePatient.waterMl} / {activePatient.waterGoal} ml
                  </div>
                </div>
              </div>
              <button type="button" className="n-btn n-btn-sm" style={{ width: '100%' }} onClick={() => onNavigate('/noema/paciente')}>
                Interagir neste celular →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 02 · MANIFESTO PAPER + ORBE ELÉTRICO */}
      <section className="noema-paper noema-section noema-manifesto">
        <div className="noema-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2.5rem', alignItems: 'center' }}>
          <div>
            <span className="noema-eyebrow">MANIFESTO CLÍNICO · CONTÍNUIDADE</span>
            <h2 className="noema-display-md" style={{ marginTop: '1rem', fontSize: 'clamp(2.2rem, 4.8vw, 4.4rem)', lineHeight: 0.94 }}>
              Consulta de 1 hora<br />
              <span className="noema-serif-italic">não sustenta 30 dias</span><br />
              <span className="noema-stroke">SEM TELEMETRIA DIÁRIA.</span>
            </h2>
            <p style={{ color: 'var(--n-fg-muted)', maxWidth: '52ch', marginTop: '1.2rem' }}>
              O consultório tradicional só descobre que o paciente abandonou a dieta quando ele falta ao retorno. O Nutrivvo antecipa sinais de desânimo nos primeiros 72 horas.
            </p>
          </div>
          <div className="noema-orb" aria-hidden="true" />
        </div>
      </section>

      {/* 03 · MÉTRICAS ARQUITETURAIS 4 COLUNAS EM PAPER */}
      <section className="noema-metrics" aria-label="Indicadores operacionais da plataforma">
        <div className="noema-metric is-feature">
          <small style={{ fontFamily: 'var(--n-font-mono)', fontSize: '0.68rem', letterSpacing: '0.16em', textTransform: 'uppercase' }}>SISTEMA UNIFICADO</small>
          <strong className="noema-metric-num" style={{ fontSize: 'clamp(2rem, 3.4vw, 3.1rem)', lineHeight: 0.95 }}>CRM + Bot + App</strong>
          <p style={{ fontSize: '0.84rem', color: 'var(--n-paper-muted)' }}>Mesma base clínica em tempo real para nutricionista e paciente.</p>
        </div>
        <div className="noema-metric">
          <small style={{ fontFamily: 'var(--n-font-mono)', fontSize: '0.68rem', letterSpacing: '0.16em', textTransform: 'uppercase' }}>VISÃO IA DE PRATOS</small>
          <strong className="noema-metric-num n-tabular">1.2s</strong>
          <p style={{ fontSize: '0.84rem', color: 'var(--n-paper-muted)' }}>Identificação estimada de alimentos e porções por foto.</p>
        </div>
        <div className="noema-metric">
          <small style={{ fontFamily: 'var(--n-font-mono)', fontSize: '0.68rem', letterSpacing: '0.16em', textTransform: 'uppercase' }}>ADESÃO EM PROJETOS</small>
          <strong className="noema-metric-num n-tabular">{avgAdherence}%</strong>
          <p style={{ fontSize: '0.84rem', color: 'var(--n-paper-muted)' }}>Calculado ao vivo sobre a carteira ativa deste protótipo.</p>
        </div>
        <div className="noema-metric">
          <small style={{ fontFamily: 'var(--n-font-mono)', fontSize: '0.68rem', letterSpacing: '0.16em', textTransform: 'uppercase' }}>SECRETÁRIA TELEGRAM</small>
          <strong className="noema-metric-num n-tabular">24h</strong>
          <p style={{ fontSize: '0.84rem', color: 'var(--n-paper-muted)' }}>Confirmação de agenda e cobranças sem expor seu WhatsApp pessoal.</p>
        </div>
      </section>

      {/* 04 · THESIS RINGS · RADAR 360 INTERATIVO */}
      <section className="noema-section">
        <div className="noema-container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
            <div>
              <span className="noema-eyebrow">01 · TELEMETRIA PREDITIVA AO VIVO</span>
              <h2 className="noema-display-md">Radar de Abandono 360°</h2>
            </div>
            <span className="n-tag n-tag-signal">Clique para acionar no Telegram e testar no App</span>
          </div>

          <div className="noema-radar-stage">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '2rem', alignItems: 'center' }}>
              <div>
                <NoemaRadar360Svg activeStatus={activePatient.status} />
                <p style={{ textAlign: 'center', fontFamily: 'var(--n-font-mono)', fontSize: '0.72rem', color: 'var(--n-ink-muted)', marginTop: '0.85rem' }}>
                  VARREDURA CONTÍNUA · FOCO: {activePatient.shortName.toUpperCase()}
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {patients.slice(0, 3).map((p) => {
                  const tagCls = p.status === 'risco' ? 'n-tag-danger' : p.status === 'atencao' ? 'n-tag-warn' : 'n-tag-ok';
                  return (
                    <div key={p.id} className="n-card" style={{ borderColor: p.id === activePatient.id ? 'var(--n-electric)' : 'var(--n-line)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '0.4rem' }}>
                        <strong className="n-truncate">{p.name}</strong>
                        <span className={`n-tag ${tagCls}`}>{p.riskLabel}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.82rem', color: 'var(--n-ink-muted)' }}>{p.lastSeen}</span>
                        <button type="button" className="n-btn n-btn-sm" onClick={() => handleQuickNudge(p)}>
                          <Send size={13} aria-hidden="true" />
                          <span>{sentAlertId === p.id ? 'Enviado ao Chat ✓' : 'Acionar Telegram'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 05 · CAPABILITY ROWS + STICKY PREVIEW INTERATIVO */}
      <section className="noema-paper noema-section">
        <div className="noema-container">
          <div style={{ marginBottom: '2rem' }}>
            <span className="noema-eyebrow">02 · ARQUITETURA DE RECURSOS</span>
            <h2 className="noema-display-md">Clique em qualquer capacidade para inspecionar</h2>
          </div>

          <div className="noema-cap-grid">
            <div>
              {CAPABILITIES.map((cap, idx) => (
                <button
                  key={cap.num}
                  type="button"
                  className={`noema-capability${idx === activeCapIdx ? ' is-active' : ''}`}
                  onClick={() => setActiveCapIdx(idx)}
                  onMouseEnter={() => setActiveCapIdx(idx)}
                >
                  <small style={{ fontFamily: 'var(--n-font-mono)', fontWeight: 700, color: 'var(--n-accent-text)' }}>{cap.num}</small>
                  <strong style={{ fontSize: 'clamp(1.1rem, 2vw, 1.55rem)', letterSpacing: '-0.03em' }}>{cap.title}</strong>
                  <span className="noema-capability-arrow" aria-hidden="true">↗</span>
                </button>
              ))}
            </div>

            <aside className="n-card" style={{ background: '#ffffff', borderColor: 'var(--n-void)', padding: 'clamp(1.4rem, 3vw, 2.2rem)' }}>
              <span className="n-tag n-tag-signal" style={{ marginBottom: '1rem' }}>
                <Sparkles size={13} aria-hidden="true" /> {activeCap.tag}
              </span>
              <h3 style={{ fontSize: '1.65rem', letterSpacing: '-0.03em', marginBottom: '0.75rem' }}>{activeCap.title}</h3>
              <p style={{ color: 'var(--n-paper-muted)', marginBottom: '1.4rem' }}>{activeCap.summary}</p>
              <div style={{ padding: '0.85rem 1rem', background: 'var(--n-paper)', border: '1px solid var(--n-line-dark)', fontFamily: 'var(--n-font-mono)', fontSize: '0.8rem', fontWeight: 700, marginBottom: '1.4rem' }}>
                {activeCap.metric}
              </div>
              <button type="button" className="n-btn n-btn-paper" onClick={() => onNavigate(activeCap.targetPath)}>
                Abrir este fluxo no protótipo <ArrowRight size={15} aria-hidden="true" />
              </button>
            </aside>
          </div>
        </div>
      </section>

      {/* 06 · PLANOS + SEGURANÇA LGPD/CFN */}
      <section className="noema-section">
        <div className="noema-container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
            <div>
              <span className="noema-eyebrow">03 · INVESTIMENTO & SIGILO CLÍNICO</span>
              <h2 className="noema-display-md">Planos claros em conformidade LGPD / CFN</h2>
            </div>
            <div style={{ display: 'inline-flex', border: '1px solid var(--n-line)' }} role="group" aria-label="Ciclo de cobrança">
              <button
                type="button"
                className={`n-btn n-btn-sm${billingCycle === 'anual' ? ' n-btn-electric' : ''}`}
                style={{ border: 0 }}
                onClick={() => setBillingCycle('anual')}
              >
                Anual (20% off)
              </button>
              <button
                type="button"
                className={`n-btn n-btn-sm${billingCycle === 'mensal' ? ' n-btn-electric' : ''}`}
                style={{ border: 0 }}
                onClick={() => setBillingCycle('mensal')}
              >
                Mensal
              </button>
            </div>
          </div>

          <div className="n-grid-2" style={{ marginBottom: '1.8rem' }}>
            <article className="n-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1.4rem' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                  <h3 style={{ fontSize: '1.35rem' }}>Autônomo</h3>
                  <span className="n-tag">Até 60 pacientes</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.45rem', marginBottom: '1rem' }}>
                  <strong className="n-tabular" style={{ fontSize: '2.5rem', letterSpacing: '-0.04em' }}>
                    {billingCycle === 'anual' ? 'R$ 97' : 'R$ 124'}
                  </strong>
                  <span style={{ color: 'var(--n-ink-muted)', fontSize: '0.86rem' }}>/mês</span>
                </div>
                <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem', padding: 0, listStyle: 'none', color: 'var(--n-ink-muted)', fontSize: '0.9rem' }}>
                  {['Radar de Abandono 360° + Telegram', 'Cardápios TACO e Exames com IA', 'App PWA Gamificado com Foto IA'].map((item) => (
                    <li key={item} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Check size={15} color="var(--n-live)" aria-hidden="true" /> <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <button type="button" className="n-btn" onClick={() => onNavigate('/noema/crm')}>
                Explorar no CRM →
              </button>
            </article>

            <article className="n-card" style={{ borderColor: 'var(--n-electric)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1.4rem' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                  <h3 style={{ fontSize: '1.35rem' }}>Clínica Pro</h3>
                  <span className="n-tag n-tag-signal">Recomendado</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.45rem', marginBottom: '1rem' }}>
                  <strong className="n-tabular" style={{ fontSize: '2.5rem', letterSpacing: '-0.04em' }}>
                    {billingCycle === 'anual' ? 'R$ 187' : 'R$ 234'}
                  </strong>
                  <span style={{ color: 'var(--n-ink-muted)', fontSize: '0.86rem' }}>/mês</span>
                </div>
                <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem', padding: 0, listStyle: 'none', color: 'var(--n-ink-muted)', fontSize: '0.9rem' }}>
                  {['Pacientes ilimitados + Anamnese customizada', 'Financeiro CRM com lembretes Telegram', 'Periodização de treino alinhada à dieta'].map((item) => (
                    <li key={item} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Check size={15} color="var(--n-live)" aria-hidden="true" /> <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <button type="button" className="n-btn n-btn-electric" onClick={() => onNavigate('/noema/crm')}>
                Testar Experiência Clínica Completa →
              </button>
            </article>
          </div>

          <div className="n-grid-3">
            {[
              { t: 'Isolamento Estrito (RLS)', d: 'Nenhum nutricionista acessa prontuários ou exames de outro colega.' },
              { t: 'Sigilo CFN & Criptografia', d: 'Tráfego HTTPS TLS 1.3 com controle granular de consentimento.' },
              { t: 'Dados Soberanos', d: 'Exportação integral do histórico e plano alimentar a qualquer momento.' }
            ].map((sec) => (
              <div key={sec.t} className="n-card" style={{ padding: '1rem 1.2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--n-live)', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.35rem' }}>
                  <ShieldCheck size={16} aria-hidden="true" /> <span>{sec.t}</span>
                </div>
                <p style={{ fontSize: '0.84rem', color: 'var(--n-ink-muted)' }}>{sec.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
