import React, { useState } from 'react';
import { Activity, ArrowRight, Check, Lock, Radar, Send, ShieldCheck, Sparkles, Utensils } from 'lucide-react';
import ClarixRobotCanvas from '../components/ClarixRobotCanvas';
import { ConicRing, MacroPillGroup, WeightEvolutionChart } from '../components/MovefluxCharts';
import { BOT_QUICK_SCENARIOS } from '../clarixData';
import { useClarix } from '../clarixStore';

export default function ClarixLandingView({ onNavigate }) {
  const {
    patients,
    activePatient,
    botMood,
    botSpeech,
    botPulseCount,
    setBotMood,
    sendBotMessage,
    sendTelegramNudge
  } = useClarix();

  const [heroPrompt, setHeroPrompt] = useState('');
  const [billing, setBilling] = useState('anual');

  const avgAdherence = Math.round(
    patients.reduce((acc, p) => acc + p.adherence, 0) / Math.max(patients.length, 1)
  );
  const riskPatients = patients.filter((p) => p.riskLevel === 'high' || p.riskLevel === 'medium');
  const kcalPct = Math.round(
    ((activePatient?.kcalConsumed || 0) / Math.max(activePatient?.kcalTarget || 1, 1)) * 100
  );

  const handleHeroSubmit = (e) => {
    e.preventDefault();
    if (!heroPrompt.trim()) return;
    sendBotMessage(activePatient?.id, heroPrompt, 'nutri');
    setHeroPrompt('');
  };

  return (
    <div className="cx-container" style={{ paddingTop: 'clamp(1.75rem, 4vw, 3.2rem)' }}>
      {/* HERO ESPACIAL CLARIX × NUTRIVVO BOT 3D */}
      <section className="cx-hero-grid" aria-label="Apresentação Nutrivvo Clarix">
        <div>
          <span className="cx-eyebrow">
            <Sparkles size={13} aria-hidden="true" /> NUTRIVVO + NutrIA · ACOMPANHAMENTO CONTÍNUO
          </span>

          <h1 className="cx-display-xl" style={{ marginTop: '0.85rem' }}>
            O cuidado nutricional que <span className="cx-serif-accent">não pausa</span> entre consultas.
          </h1>

          <p style={{ marginTop: '1.1rem', fontSize: '1.05rem', color: 'var(--cx-muted)', maxWidth: '58ch' }}>
            Conheça a <strong>NutrIA</strong>, a inteligência que acompanha seu paciente todos os dias:
            cada check-in de refeição, exame PDF ou lembrete sincroniza ao vivo entre Landing, CRM e App.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.7rem', marginTop: '1.6rem' }}>
            <button
              type="button"
              className="cx-btn cx-btn-primary cx-btn-pill"
              onClick={() => onNavigate('/clarix/crm')}
            >
              <span>Abrir Cockpit do Nutricionista</span>
              <ArrowRight size={15} aria-hidden="true" />
            </button>

            <button
              type="button"
              className="cx-btn cx-btn-accent cx-btn-pill"
              onClick={() => onNavigate('/clarix/paciente')}
            >
              Testar App do Paciente
            </button>

            <button
              type="button"
              className="cx-btn cx-btn-ghost cx-btn-pill"
              onClick={() => onNavigate('/clarix/componentes')}
            >
              Laboratório #components
            </button>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.2rem', marginTop: '1.8rem' }}>
            <div>
              <strong className="cx-tabular" style={{ fontSize: '1.45rem', display: 'block', lineHeight: 1.05 }}>{avgAdherence}%</strong>
              <span style={{ fontSize: '0.76rem', color: 'var(--cx-muted)' }}>Adesão média da carteira</span>
            </div>
            <div style={{ width: '1px', background: 'var(--cx-line)' }} aria-hidden="true" />
            <div>
              <strong className="cx-tabular" style={{ fontSize: '1.45rem', display: 'block', lineHeight: 1.05 }}>{patients.length} pac.</strong>
              <span style={{ fontSize: '0.76rem', color: 'var(--cx-muted)' }}>Sincronizados agora</span>
            </div>
            <div style={{ width: '1px', background: 'var(--cx-line)' }} aria-hidden="true" />
            <div>
              <strong className="cx-tabular" style={{ fontSize: '1.45rem', display: 'block', lineHeight: 1.05, color: riskPatients.length ? '#be123c' : '#0f172a' }}>
                {riskPatients.length} alertas
              </strong>
              <span style={{ fontSize: '0.76rem', color: 'var(--cx-muted)' }}>No Radar de Abandono</span>
            </div>
          </div>
        </div>

        {/* PALCO DO ROBÔ CLARIX 3D INTERATIVO */}
        <div className="cx-iridescent-stage">
          <ClarixRobotCanvas
            mood={botMood}
            pulseKey={botPulseCount}
            height={335}
            onRobotClick={() =>
              setBotMood(
                botMood === 'celebrating' ? 'calm' : 'celebrating',
                `Pulso neural ativado! Carteira com ${avgAdherence}% de aderência média e ${riskPatients.length} prioridade(s) de retenção.`
              )
            }
          />

          <div className="cx-speech-bubble" style={{ marginTop: '0.55rem' }}>
            <div style={{ fontFamily: 'var(--cx-font-mono)', fontSize: '0.66rem', color: '#0369a1', marginBottom: '0.2rem' }}>
              NutrIA · ACOMPANHAMENTO ATIVO ({activePatient?.shortName})
            </div>
            <div data-testid="hero-bot-speech">{botSpeech}</div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.7rem' }}>
            {BOT_QUICK_SCENARIOS.map((sc) => (
              <button
                key={sc.id}
                type="button"
                className="cx-btn cx-btn-sm cx-btn-ghost cx-btn-pill"
                onClick={() => {
                  setBotMood(sc.mood);
                  sendBotMessage(activePatient?.id, sc.prompt, 'nutri');
                }}
              >
                {sc.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleHeroSubmit} style={{ display: 'flex', gap: '0.45rem', marginTop: '0.65rem' }}>
            <label htmlFor="hero-bot-input" style={{ position: 'absolute', left: '-9999px' }}>
              Perguntar à NutrIA
            </label>
            <input
              id="hero-bot-input"
              className="cx-input"
              placeholder="Pergunte à NutrIA (ex.: risco, troca, foto)..."
              value={heroPrompt}
              onChange={(e) => setHeroPrompt(e.target.value)}
            />
            <button type="submit" className="cx-btn cx-btn-primary" aria-label="Enviar comando para a NutrIA">
              <Send size={15} aria-hidden="true" />
            </button>
          </form>
        </div>
      </section>

      {/* PAINÉIS BIOMÉTRICOS AO VIVO */}
      <section style={{ marginTop: '3.2rem' }} aria-label="Painéis sincronizados ao vivo">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.2rem' }}>
          <div>
            <span className="cx-eyebrow">DADOS REAIS DO PROTÓTIPO · SINCRONIA BIDIRECIONAL</span>
            <h2 className="cx-display-lg" style={{ marginTop: '0.35rem' }}>Painel Clínico conectado ao App</h2>
          </div>
          <span style={{ fontSize: '0.84rem', color: 'var(--cx-muted)' }}>
            Paciente ativo: <strong>{activePatient?.name}</strong>
          </span>
        </div>

        <div className="cx-bento-3">
          {/* Card 1: Curva Escura Moveflux */}
          <WeightEvolutionChart
            history={activePatient?.weightHistory}
            targetWeight={activePatient?.targetWeight}
          />

          {/* Card 2: Anel Cônico & Macros Moveflux */}
          <article className="cx-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.08rem', fontWeight: 600 }}>Consumo &amp; Macros Hoje</h3>
                <p style={{ margin: '0.15rem 0 0', fontSize: '0.8rem', color: 'var(--cx-muted)' }}>
                  Meta diária: {activePatient?.kcalTarget} kcal
                </p>
              </div>
              <Utensils size={18} color="#0369a1" aria-hidden="true" />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <ConicRing
                percent={kcalPct}
                value={activePatient?.kcalConsumed || 0}
                unit="kcal"
                gradient="from-macros"
                size={96}
              />
              <div style={{ flex: 1, minWidth: '140px' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--cx-muted)' }}>Saldo restante</div>
                <strong className="cx-tabular" style={{ fontSize: '1.35rem' }}>
                  {Math.max(0, (activePatient?.kcalTarget || 0) - (activePatient?.kcalConsumed || 0))} kcal
                </strong>
                <div style={{ fontSize: '0.78rem', color: '#0369a1', marginTop: '0.2rem' }}>
                  Água: {activePatient?.waterMl} / {activePatient?.waterGoal} ml
                </div>
              </div>
            </div>

            <MacroPillGroup macros={activePatient?.macros} />
          </article>

          {/* Card 3: Radar de Abandono 360° */}
          <article className="cx-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '0.9rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.08rem', fontWeight: 600 }}>Radar de Abandono 360°</h3>
                <p style={{ margin: '0.15rem 0 0', fontSize: '0.8rem', color: 'var(--cx-muted)' }}>
                  Prevenção ativa antes da desistência
                </p>
              </div>
              <Radar size={18} color="#be123c" aria-hidden="true" />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
              {patients.slice(0, 3).map((p) => (
                <div
                  key={p.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.6rem',
                    padding: '0.62rem 0.78rem',
                    borderRadius: '16px',
                    background: '#f8fafc',
                    border: '1px solid rgba(15,23,42,0.06)'
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div className="cx-truncate" style={{ fontSize: '0.84rem', fontWeight: 600 }}>{p.shortName}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--cx-muted)' }}>{p.lastSeen}</div>
                  </div>
                  <button
                    type="button"
                    className={`cx-tag ${p.riskLevel === 'high' ? 'cx-tag-risk' : p.riskLevel === 'medium' ? 'cx-tag-warn' : 'cx-tag-ok'}`}
                    style={{ border: 0, cursor: 'pointer' }}
                    onClick={() => sendTelegramNudge(p.id)}
                  >
                    {p.adherence}% · Acionar
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              className="cx-btn cx-btn-primary"
              style={{ width: '100%' }}
              onClick={() => onNavigate('/clarix/crm')}
            >
              Ver Radar Completo no CRM
            </button>
          </article>
        </div>
      </section>

      {/* PLANOS & COMPLIANCE */}
      <section style={{ marginTop: '3.2rem' }} aria-label="Planos do consultório">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <span className="cx-eyebrow">LICENCIAMENTO CLÍNICO</span>
            <h2 className="cx-display-lg" style={{ marginTop: '0.35rem' }}>Arquitetura completa para sua clínica</h2>
          </div>

          <div
            role="group"
            aria-label="Ciclo de faturamento"
            style={{ display: 'inline-flex', padding: '0.25rem', borderRadius: '999px', background: 'rgba(255,255,255,0.88)', border: '1px solid var(--cx-line)' }}
          >
            {[
              { id: 'mensal', label: 'Mensal' },
              { id: 'anual', label: 'Anual (-20%)' }
            ].map((b) => (
              <button
                key={b.id}
                type="button"
                className={`cx-btn cx-btn-sm cx-btn-pill ${billing === b.id ? 'cx-btn-primary' : 'cx-btn-ghost'}`}
                style={{ border: 0 }}
                onClick={() => setBilling(b.id)}
              >
                {b.label}
              </button>
            ))}
          </div>
        </div>

        <div className="cx-grid-2">
          <article className="cx-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong style={{ fontSize: '1.15rem' }}>Clínica Essencial</strong>
              <span className="cx-tag cx-tag-info">Até 40 pacientes</span>
            </div>
            <div>
              <strong className="cx-tabular" style={{ fontSize: '2.2rem', fontFamily: 'var(--cx-font-display)', fontWeight: 200 }}>
                R$ {billing === 'anual' ? '147' : '189'}
              </strong>
              <span style={{ color: 'var(--cx-muted)', fontSize: '0.86rem' }}> / mês</span>
            </div>
            <ul style={{ margin: 0, paddingLeft: '1.1rem', color: 'var(--cx-muted)', fontSize: '0.88rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <li>Painel Biométrico + Agenda Semanal Integrada</li>
              <li>App PWA do Paciente com Gamificação &amp; Hidratação</li>
              <li>Substituições automáticas baseadas na Tabela TACO</li>
            </ul>
            <button type="button" className="cx-btn cx-btn-ghost" onClick={() => onNavigate('/clarix/crm')}>
              Testar Cockpit agora
            </button>
          </article>

          <article className="cx-card-dark" style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong style={{ fontSize: '1.15rem' }}>Clínica Pro 360° + NutrIA</strong>
              <span className="cx-tag cx-tag-purple">Ilimitado</span>
            </div>
            <div>
              <strong className="cx-tabular" style={{ fontSize: '2.2rem', fontFamily: 'var(--cx-font-display)', fontWeight: 200 }}>
                R$ {billing === 'anual' ? '247' : '297'}
              </strong>
              <span style={{ color: '#cbd5e1', fontSize: '0.86rem' }}> / mês</span>
            </div>
            <ul style={{ margin: 0, paddingLeft: '1.1rem', color: '#e2e8f0', fontSize: '0.88rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <li>NutrIA + Disparo Automático no Telegram</li>
              <li>Scanner de Prato por Foto IA + Leitor PDF de Exames</li>
              <li>Radar Preditivo de Abandono 360° + Financeiro CRM</li>
            </ul>
            <button type="button" className="cx-btn cx-btn-accent" onClick={() => onNavigate('/clarix/paciente')}>
              Explorar Fluxo Completo
            </button>
          </article>
        </div>

        <div className="cx-card" style={{ marginTop: '1.25rem', display: 'flex', flexWrap: 'wrap', gap: '1.2rem', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.84rem', fontWeight: 600 }}>
            <ShieldCheck size={17} color="#059669" aria-hidden="true" /> Conformidade LGPD Saúde &amp; Diretrizes CFN
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.84rem', color: 'var(--cx-muted)' }}>
            <Lock size={15} aria-hidden="true" /> Co-piloto assistivo sem prescrição autônoma não supervisionada
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.84rem', color: 'var(--cx-muted)' }}>
            <Check size={15} color="#0369a1" aria-hidden="true" /> Zero impacto nas rotas de produção atuais
          </span>
        </div>
      </section>
    </div>
  );
}
