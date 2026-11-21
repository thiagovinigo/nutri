import React, { useEffect, useState } from 'react';
import { RotateCcw, X } from 'lucide-react';
import { useNoema } from './noemaStore';
import { NoemaBrandMark } from './NoemaVisuals';

const TABS = [
  { id: 'landing', path: '/noema', num: '01', label: 'Landing' },
  { id: 'crm', path: '/noema/crm', num: '02', label: 'CRM Nutri' },
  { id: 'paciente', path: '/noema/paciente', num: '03', label: 'App Paciente' },
  { id: 'componentes', path: '/noema/componentes', num: '04', label: 'Componentes' }
];

export default function NoemaShell({ activeMode, onNavigate, children }) {
  const { patients, activePatient, setActivePatientId, resetDemo } = useNoema();
  const [scrollPct, setScrollPct] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement;
      const max = Math.max(1, doc.scrollHeight - window.innerHeight);
      setScrollPct(Math.min(100, Math.round((window.scrollY / max) * 100)));
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [activeMode]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const go = (path) => {
    setMenuOpen(false);
    onNavigate(path);
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  return (
    <div className="noema-root">
      <div className="noema-noise" aria-hidden="true" />
      <div className="noema-progress" aria-hidden="true">
        <div className="noema-progress-fill" style={{ width: `${scrollPct}%` }} />
      </div>

      <header className="noema-nav">
        <div className="noema-nav-inner">
          <button type="button" className="noema-brand" onClick={() => go('/noema')}>
            <NoemaBrandMark size={22} />
            <span>NØEMA × NUTRIVVO</span>
          </button>

          <div className="noema-status-live" aria-label="Status de sincronização">
            <span className="noema-pulse-dot" aria-hidden="true" />
            <span>SYNC AO VIVO · {activePatient.shortName}</span>
          </div>

          <nav className="noema-tabs" aria-label="Alternar módulo do protótipo NØEMA">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                className={`noema-tab${activeMode === t.id ? ' is-active' : ''}`}
                aria-current={activeMode === t.id ? 'page' : undefined}
                onClick={() => go(t.path)}
              >
                <span>{t.num}</span>
                <span>{t.label}</span>
              </button>
            ))}
          </nav>

          <div className="noema-nav-right">
            <button
              type="button"
              className="noema-tab"
              title="Restaurar dados iniciais da demonstração"
              onClick={resetDemo}
            >
              <RotateCcw size={13} aria-hidden="true" />
              <span>Resetar</span>
            </button>
            <button
              type="button"
              className="noema-menu-btn"
              aria-label={menuOpen ? 'Fechar índice NØEMA' : 'Abrir índice NØEMA'}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
            >
              <span />
              <span />
            </button>
          </div>
        </div>
      </header>

      {menuOpen && (
        <div className="noema-overlay" role="dialog" aria-modal="true" aria-label="Índice do protótipo NØEMA">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--n-line-dark)', paddingBottom: '1rem' }}>
            <span style={{ fontFamily: 'var(--n-font-mono)', fontSize: '0.72rem', letterSpacing: '0.16em', textTransform: 'uppercase' }}>
              NUTRIVVO / ARQUITETURA NØEMA-74
            </span>
            <button
              type="button"
              className="n-btn n-btn-paper n-btn-sm"
              onClick={() => setMenuOpen(false)}
              aria-label="Fechar menu"
            >
              <X size={16} aria-hidden="true" /> Fechar
            </button>
          </div>

          <nav className="noema-overlay-links" aria-label="Navegação ampliada">
            {TABS.map((t) => (
              <button key={t.id} type="button" className="noema-overlay-link" onClick={() => go(t.path)}>
                <span>{t.label}</span>
                <span style={{ fontFamily: 'var(--n-font-mono)', fontSize: '0.85rem' }}>{t.num} ↗</span>
              </button>
            ))}
          </nav>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderTop: '1px solid var(--n-line-dark)', paddingTop: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
              <label htmlFor="overlay-patient-select" style={{ fontFamily: 'var(--n-font-mono)', fontSize: '0.72rem', textTransform: 'uppercase' }}>
                Paciente Sincronizado:
              </label>
              <select
                id="overlay-patient-select"
                className="n-select"
                style={{ width: 'auto', minWidth: '240px', background: '#fff', color: '#050506', borderColor: '#050506' }}
                value={activePatient.id}
                onChange={(e) => setActivePatientId(e.target.value)}
              >
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <span style={{ fontFamily: 'var(--n-font-mono)', fontSize: '0.72rem', color: '#464642' }}>
              ROTAS DE PRODUÇÃO INTACTAS (/, /nutri, /paciente)
            </span>
          </div>
        </div>
      )}

      <main>{children}</main>

      <footer style={{ borderTop: '1px solid var(--n-line)', padding: '2.2rem 0', background: 'var(--n-void)' }}>
        <div className="noema-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
            <NoemaBrandMark size={20} />
            <strong>Nutrivvo.</strong>
            <span style={{ color: 'var(--n-ink-muted)', fontSize: '0.84rem' }}>
              Protótipo funcional no sistema NØEMA AI Studio 74 (`/noema`)
            </span>
          </div>
          <div style={{ fontFamily: 'var(--n-font-mono)', fontSize: '0.72rem', color: 'var(--n-ink-muted)' }}>
            ISOLAMENTO LGPD/CFN · ESTADO SINCRONIZADO LOCALMENTE
          </div>
        </div>
      </footer>
    </div>
  );
}
