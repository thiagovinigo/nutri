import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { NoemaRadar360Svg } from '../NoemaVisuals';

const SWATCHES = [
  { name: 'Void Base', token: '--n-void', hex: '#050506', onLight: false },
  { name: 'Void Surface', token: '--n-void-soft', hex: '#0b0b0d', onLight: false },
  { name: 'Ink Light', token: '--n-ink', hex: '#f1f0ea', onLight: true },
  { name: 'Paper Warm', token: '--n-paper', hex: '#e7e5de', onLight: true },
  { name: 'Electric Violet', token: '--n-electric', hex: '#6c63ff', onLight: false },
  { name: 'Electric AA Btn', token: '--n-electric-btn', hex: '#544be6', onLight: false },
  { name: 'Signal Violet', token: '--n-signal', hex: '#a9a5ff', onLight: true },
  { name: 'Live Pulse', token: '--n-live', hex: '#7bff82', onLight: true }
];

export default function NoemaComponentsView({ onNavigate }) {
  const [sampleInput, setSampleInput] = useState('Marina Albuquerque Teixeira de Souza');
  const [activeRow, setActiveRow] = useState(0);

  const copyHex = async (hex, name) => {
    try {
      await navigator.clipboard.writeText(hex);
      toast.success(`${name} (${hex}) copiado!`);
    } catch {
      toast.success(`${name}: ${hex}`);
    }
  };

  return (
    <div>
      {/* Cabeçalho Catalogo NØEMA #components */}
      <section className="noema-section" style={{ paddingBottom: '2.5rem' }}>
        <div className="noema-container">
          <span className="noema-eyebrow">DESIGN SYSTEM NØEMA-74 · CATÁLOGO #COMPONENTS</span>
          <h1 className="noema-display-xl" style={{ fontSize: 'clamp(2.2rem, 5vw, 4.6rem)' }}>
            Tokens &amp; Componentes<br />
            <span className="noema-serif-italic">aplicados ao Nutrivvo</span>
          </h1>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '1.2rem' }}>
            {[
              { href: '#ds-typo', label: '01 Tipografia' },
              { href: '#ds-colors', label: '02 Cores & Swatches' },
              { href: '#ds-surfaces', label: '03 Polaridades & Anéis' },
              { href: '#ds-actions', label: '04 Ações & Capability Rows' },
              { href: '#ds-inputs', label: '05 Inputs & Status' }
            ].map((item) => (
              <a key={item.href} href={item.href} className="n-btn n-btn-sm">{item.label}</a>
            ))}
          </div>
        </div>
      </section>

      {/* 01 · TIPOGRAFIA */}
      <section id="ds-typo" className="noema-paper noema-section">
        <div className="noema-container">
          <span className="noema-eyebrow">01 · TRIO TIPOGRÁFICO</span>
          <h2 className="noema-display-md" style={{ marginBottom: '2rem' }}>Grotesk apertado + Georgia itálica + Mono HUD</h2>

          <div className="n-grid-3">
            <div className="n-card">
              <div style={{ fontFamily: 'var(--n-font-mono)', fontSize: '0.72rem', color: 'var(--n-accent-text)', marginBottom: '0.5rem' }}>DISPLAY / GROTESK</div>
              <div style={{ fontSize: '2rem', fontWeight: 600, letterSpacing: '-0.055em', lineHeight: 0.95 }}>Adesão Contínua</div>
              <p style={{ fontSize: '0.82rem', color: 'var(--n-fg-muted)', marginTop: '0.6rem' }}>Inter / Arial tight (-0.06em) para impacto clínico.</p>
            </div>
            <div className="n-card">
              <div style={{ fontFamily: 'var(--n-font-mono)', fontSize: '0.72rem', color: 'var(--n-accent-text)', marginBottom: '0.5rem' }}>DESTAQUE / SERIF ITALIC</div>
              <div className="noema-serif-italic" style={{ fontSize: '2rem', lineHeight: 1.05 }}>entre consultas.</div>
              <p style={{ fontSize: '0.82rem', color: 'var(--n-fg-muted)', marginTop: '0.6rem' }}>Georgia Italic (400) humaniza termos-chave no manifesto.</p>
            </div>
            <div className="n-card">
              <div style={{ fontFamily: 'var(--n-font-mono)', fontSize: '0.72rem', color: 'var(--n-accent-text)', marginBottom: '0.5rem' }}>TELEMETRIA / MONO</div>
              <div style={{ fontFamily: 'var(--n-font-mono)', fontSize: '1.15rem', letterSpacing: '0.1em' }}>RADAR.360 // 82%</div>
              <p style={{ fontSize: '0.82rem', color: 'var(--n-fg-muted)', marginTop: '0.6rem' }}>Courier / Mono uppercase para eyebrows, tokens e placares.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 02 · CORES */}
      <section id="ds-colors" className="noema-section">
        <div className="noema-container">
          <span className="noema-eyebrow">02 · PALETA &amp; CLIQUE P/ COPIAR</span>
          <h2 className="noema-display-md" style={{ marginBottom: '1.5rem' }}>Cores oficiais com garantia WCAG AA</h2>
          <div className="n-grid-4">
            {SWATCHES.map((sw) => (
              <button
                key={sw.token}
                type="button"
                className="n-card"
                style={{ textAlign: 'left', cursor: 'pointer' }}
                onClick={() => copyHex(sw.hex, sw.name)}
              >
                <div style={{ height: '64px', background: sw.hex, border: '1px solid var(--n-line)', marginBottom: '0.7rem' }} />
                <strong style={{ display: 'block', fontSize: '0.94rem' }}>{sw.name}</strong>
                <div style={{ fontFamily: 'var(--n-font-mono)', fontSize: '0.74rem', color: 'var(--n-ink-muted)' }}>{sw.hex} · {sw.token}</div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 03 · SUPERFÍCIES, ORBE & RADAR */}
      <section id="ds-surfaces" className="noema-paper noema-section">
        <div className="noema-container">
          <span className="noema-eyebrow">03 · SUPERFÍCIES &amp; GEOMETRIA</span>
          <h2 className="noema-display-md" style={{ marginBottom: '1.5rem' }}>Orbe do Manifesto + Métrica com Anel Expansivo</h2>

          <div className="n-grid-2" style={{ alignItems: 'center' }}>
            <div className="noema-metrics" style={{ gridTemplateColumns: 'minmax(0, 1fr)' }}>
              <div className="noema-metric">
                <small style={{ fontFamily: 'var(--n-font-mono)', fontSize: '0.7rem', letterSpacing: '0.14em' }}>PASSE O MOUSE NA CÉLULA</small>
                <strong className="noema-metric-num n-tabular">96%</strong>
                <p style={{ fontSize: '0.84rem', color: 'var(--n-paper-muted)' }}>Anel inferior expande no hover replicando `.metric::after` do NØEMA.</p>
              </div>
            </div>
            <div className="n-card" style={{ background: 'var(--n-void)', color: 'var(--n-ink)', borderColor: 'var(--n-void)' }}>
              <NoemaRadar360Svg activeStatus="risco" />
              <div style={{ textAlign: 'center', fontFamily: 'var(--n-font-mono)', fontSize: '0.72rem', color: 'var(--n-signal)', marginTop: '0.6rem' }}>
                RADAR PREDITIVO · MODO VOID EMBUTIDO
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 04 · AÇÕES & CAPABILITY ROWS */}
      <section id="ds-actions" className="noema-section">
        <div className="noema-container">
          <span className="noema-eyebrow">04 · AÇÕES &amp; LINHAS INTERATIVAS</span>
          <h2 className="noema-display-md" style={{ marginBottom: '1.5rem' }}>Capability Rows &amp; Botões</h2>

          <div className="n-grid-2">
            <div>
              {['01 · Radar de Abandono', '02 · Secretária Telegram', '03 · Scanner Prato Foto IA'].map((label, i) => (
                <button
                  key={label}
                  type="button"
                  className={`noema-capability${activeRow === i ? ' is-active' : ''}`}
                  onClick={() => setActiveRow(i)}
                >
                  <small style={{ fontFamily: 'var(--n-font-mono)', color: 'var(--n-signal)' }}>0{i + 1}</small>
                  <strong style={{ fontSize: '1.15rem' }}>{label.slice(5)}</strong>
                  <span className="noema-capability-arrow" aria-hidden="true">↗</span>
                </button>
              ))}
            </div>
            <div className="n-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
                <button type="button" className="n-btn n-btn-electric" onClick={() => onNavigate('/noema/crm')}>Botão Elétrico Primário</button>
                <button type="button" className="n-btn" onClick={() => onNavigate('/noema/paciente')}>Botão Neutro Void</button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                <span className="n-tag n-tag-ok">Adesão Segura</span>
                <span className="n-tag n-tag-warn">Atenção 45%</span>
                <span className="n-tag n-tag-danger">Risco Alto 82%</span>
                <span className="n-tag n-tag-signal">IA Visual</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 05 · INPUTS & TELEMETRIA AO VIVO */}
      <section id="ds-inputs" className="noema-paper noema-section">
        <div className="noema-container">
          <span className="noema-eyebrow">05 · CAMPOS &amp; INDICADOR VIVO</span>
          <h2 className="noema-display-md" style={{ marginBottom: '1.5rem' }}>Formulário &amp; Status Indicator</h2>

          <div className="n-card" style={{ maxWidth: '560px', display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'var(--n-font-mono)', fontSize: '0.74rem' }}>
              <span className="noema-pulse-dot" style={{ background: 'var(--n-live-dark)' }} aria-hidden="true" />
              <span>STATUS LIVE · FOCO DE TECLADO VISÍVEL</span>
            </div>
            <div>
              <label htmlFor="ds-sample-input" style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.35rem' }}>Nome longo (teste de truncamento)</label>
              <input id="ds-sample-input" className="n-input" value={sampleInput} onChange={(e) => setSampleInput(e.target.value)} />
            </div>
            <div style={{ padding: '0.65rem 0.85rem', border: '1px solid var(--n-border)', background: 'var(--n-surface)' }}>
              <div className="n-truncate" style={{ fontWeight: 700 }}>{sampleInput}</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
