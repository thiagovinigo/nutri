import React from 'react';
import toast from 'react-hot-toast';
import { Copy, Sparkles } from 'lucide-react';
import ClarixRobotCanvas from '../components/ClarixRobotCanvas';
import { ConicRing, MacroPillGroup, WeightEvolutionChart } from '../components/MovefluxCharts';
import { useClarix } from '../clarixStore';

const SWATCHES = [
  { name: 'Clarix Ice', hex: '#f6fafe', token: '--cx-bg' },
  { name: 'Obsidian Ink', hex: '#0f172a', token: '--cx-ink' },
  { name: 'Electric Cyan', hex: '#00aaff', token: '--cx-cyan' },
  { name: 'Iris Violet', hex: '#8000ff', token: '--cx-purple' },
  { name: 'Hot Magenta', hex: '#ff0099', token: '--cx-pink' },
  { name: 'Coral Energy', hex: '#ff4d4d', token: '--cx-coral' }
];

const MOOD_CONTROLS = [
  { id: 'calm', label: '01 · Calm (Cyan/Iris)', msg: 'Estado padrão: monitoramento nutricional contínuo entre consultas.' },
  { id: 'alert', label: '02 · Alert (Radar Risco)', msg: 'Modo alerta ativado: paciente sem check-in há 3 dias detectado pelo Radar 360°.' },
  { id: 'scanning', label: '03 · Scanning (Foto & PDF)', msg: 'Modo Scanner IA ativo: analisando macros da refeição ou exame PDF.' },
  { id: 'celebrating', label: '04 · Celebrating (Streak/Meta)', msg: 'Celebração de meta! Streak atualizado e XP sincronizado com o CRM.' },
  { id: 'thinking', label: '05 · Thinking (TACO Engine)', msg: 'Calculando equivalências nutricionais com base na Tabela TACO.' }
];

export default function ClarixComponentsView() {
  const { activePatient, botMood, botSpeech, botPulseCount, setBotMood } = useClarix();

  const copySwatch = (hex, name) => {
    try {
      navigator.clipboard?.writeText(hex);
    } catch {
      // ignore clipboard restrictions
    }
    toast.success(`${name} (${hex}) copiado!`);
  };

  return (
    <div className="cx-container" style={{ paddingTop: '2rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <span className="cx-eyebrow">
          <Sparkles size={13} aria-hidden="true" /> CLARIX × MOVEFLUX DESIGN SYSTEM (#components)
        </span>
        <h1 className="cx-display-xl" style={{ marginTop: '0.5rem' }}>
          Holografia <span className="cx-serif-accent">Clarix</span> &amp; Painéis Moveflux
        </h1>
      </div>

      <div className="cx-components-layout">
        {/* DARK SIDEBAR #ds-side */}
        <aside className="cx-sidebar-dark" aria-label="Índice de especificações">
          <div className="cx-side-label">Foundations</div>
          <a href="#cx-bot-lab" className="cx-side-link is-active" style={{ textDecoration: 'none' }}>01 · NutrIA Mood Lab</a>
          <a href="#cx-typo" className="cx-side-link" style={{ textDecoration: 'none' }}>02 · Sarabun Typography</a>
          <a href="#cx-colors" className="cx-side-link" style={{ textDecoration: 'none' }}>03 · Holographic Palette</a>
          <a href="#cx-panels" className="cx-side-link" style={{ textDecoration: 'none' }}>04 · Moveflux Panels</a>
        </aside>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', minWidth: 0 }}>
          {/* 01 · NUTRIA MOOD LAB */}
          <section id="cx-bot-lab" className="cx-iridescent-stage">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.6rem', marginBottom: '0.75rem' }}>
              <div>
                <span className="cx-eyebrow">01 · INTERACTIVE WEBGL MESH</span>
                <h2 className="cx-display-md" style={{ marginTop: '0.2rem' }}>NutrIA — Laboratório de Estados</h2>
              </div>
              <button
                type="button"
                className="cx-btn cx-btn-primary cx-btn-sm cx-btn-pill"
                onClick={() => setBotMood(botMood, 'Pulso radial 360° disparado pelo catálogo de componentes!')}
              >
                Pulso 360°
              </button>
            </div>

            <ClarixRobotCanvas mood={botMood} pulseKey={botPulseCount} height={320} />

            <div className="cx-speech-bubble" style={{ marginTop: '0.6rem' }}>
              <strong>Estado ({botMood}):</strong> {botSpeech}
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem', marginTop: '0.85rem' }}>
              {MOOD_CONTROLS.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  className={`cx-btn cx-btn-sm cx-btn-pill ${botMood === m.id ? 'cx-btn-primary' : 'cx-btn-ghost'}`}
                  onClick={() => setBotMood(m.id, m.msg)}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </section>

          {/* 02 · TIPOGRAFIA SARABUN */}
          <section id="cx-typo" className="cx-card">
            <span className="cx-eyebrow">02 · ESCALA TIPOGRÁFICA</span>
            <h2 className="cx-display-md" style={{ marginTop: '0.35rem', marginBottom: '1rem' }}>Sarabun ExtraLight (200) + Inter UI + Mono HUD</h2>

            <div className="cx-bento-3">
              <div style={{ padding: '1rem', borderRadius: '18px', background: '#f8fafc', border: '1px solid var(--cx-line)' }}>
                <div style={{ fontFamily: 'var(--cx-font-mono)', fontSize: '0.68rem', color: '#0369a1' }}>DISPLAY / SARABUN 200</div>
                <div style={{ fontFamily: 'var(--cx-font-display)', fontWeight: 200, fontSize: '2rem', lineHeight: 1.05, marginTop: '0.4rem' }}>
                  Precisão Clínica
                </div>
                <p style={{ fontSize: '0.78rem', color: 'var(--cx-muted)', marginTop: '0.5rem' }}>Títulos leves e respirados sobre fundo #f6fafe.</p>
              </div>
              <div style={{ padding: '1rem', borderRadius: '18px', background: '#f8fafc', border: '1px solid var(--cx-line)' }}>
                <div style={{ fontFamily: 'var(--cx-font-mono)', fontSize: '0.68rem', color: '#0369a1' }}>IRIDESCENT ITALIC</div>
                <div className="cx-serif-accent" style={{ fontSize: '2rem', lineHeight: 1.08, marginTop: '0.4rem' }}>
                  entre consultas.
                </div>
                <p style={{ fontSize: '0.78rem', color: 'var(--cx-muted)', marginTop: '0.5rem' }}>Ênfase cromática azul-violeta-magenta com alto contraste.</p>
              </div>
              <div style={{ padding: '1rem', borderRadius: '18px', background: '#f8fafc', border: '1px solid var(--cx-line)' }}>
                <div style={{ fontFamily: 'var(--cx-font-mono)', fontSize: '0.68rem', color: '#0369a1' }}>INTER / TABULAR NUMS</div>
                <div className="cx-tabular" style={{ fontSize: '2rem', fontWeight: 700, lineHeight: 1.05, marginTop: '0.4rem' }}>
                  00:18:16
                </div>
                <p style={{ fontSize: '0.78rem', color: 'var(--cx-muted)', marginTop: '0.5rem' }}>Métricas e cronômetros Moveflux sem tremor horizontal.</p>
              </div>
            </div>
          </section>

          {/* 03 · PALETA HOLOGRÁFICA */}
          <section id="cx-colors" className="cx-card">
            <span className="cx-eyebrow">03 · TOKENS CROMÁTICOS (CLIQUE PARA COPIAR)</span>
            <h2 className="cx-display-md" style={{ marginTop: '0.35rem', marginBottom: '1rem' }}>Gradientes de Shader + Fundos de Vidro</h2>

            <div className="cx-bento-3">
              {SWATCHES.map((sw) => (
                <button
                  key={sw.token}
                  type="button"
                  onClick={() => copySwatch(sw.hex, sw.name)}
                  style={{
                    textAlign: 'left',
                    padding: '0.85rem',
                    borderRadius: '18px',
                    border: '1px solid rgba(15,23,42,0.09)',
                    background: '#ffffff',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ height: '54px', borderRadius: '12px', background: sw.hex, border: '1px solid rgba(15,23,42,0.1)', marginBottom: '0.6rem' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ fontSize: '0.88rem' }}>{sw.name}</strong>
                    <Copy size={13} color="#64748b" aria-hidden="true" />
                  </div>
                  <div style={{ fontFamily: 'var(--cx-font-mono)', fontSize: '0.72rem', color: 'var(--cx-muted)' }}>
                    {sw.hex} · {sw.token}
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* 04 · ESPÉCIMES MOVEFLUX AO VIVO */}
          <section id="cx-panels" className="cx-grid-2">
            <WeightEvolutionChart
              history={activePatient?.weightHistory}
              targetWeight={activePatient?.targetWeight}
            />
            <article className="cx-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span className="cx-eyebrow">SPECIMEN MOVEFLUX</span>
                  <h3 style={{ margin: '0.2rem 0 0', fontSize: '1.1rem' }}>Conic Gauge + Macro Pills</h3>
                </div>
                <ConicRing percent={78} value="120" unit="BPM" gradient="from-heart" size={82} />
              </div>
              <MacroPillGroup macros={activePatient?.macros} />
            </article>
          </section>
        </div>
      </div>
    </div>
  );
}
