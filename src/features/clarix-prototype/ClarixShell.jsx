import React from 'react';
import { Bot, Layers, LayoutDashboard, RotateCcw, Smartphone, Sparkles } from 'lucide-react';
import ClarixAsciiField from './components/ClarixAsciiField';
import { useClarix } from './clarixStore';

const NAV_TABS = [
  { id: 'landing', path: '/clarix', label: '01 Landing', icon: Sparkles },
  { id: 'crm', path: '/clarix/crm', label: '02 CRM Nutri', icon: LayoutDashboard },
  { id: 'paciente', path: '/clarix/paciente', label: '03 App Paciente', icon: Smartphone },
  { id: 'componentes', path: '/clarix/componentes', label: '04 Componentes', icon: Layers }
];

export default function ClarixShell({ activeMode, onNavigate, children }) {
  const { activePatient, botMood, resetDemo } = useClarix();

  const moodTextMap = {
    calm: 'NutrIA Ativa',
    alert: 'Radar Alerta',
    scanning: 'Scanner IA',
    celebrating: 'Sync OK',
    thinking: 'Analisando'
  };

  return (
    <div className="clarix-root">
      <ClarixAsciiField />

      <div className="cx-content-layer">
        <header className="cx-nav">
          <div className="cx-nav-inner">
            <button
              type="button"
              className="cx-brand"
              onClick={() => onNavigate('/clarix')}
            >
              <span className="cx-brand-mark" aria-hidden="true">
                <Bot size={18} />
              </span>
              <span>
                <span className="cx-brand-title">Nutrivvo</span>
                <span className="cx-brand-sub">NutrIA · Saúde Digital</span>
              </span>
            </button>

            <div className="cx-status-pill" aria-label="Status da NutrIA e Paciente em Foco">
              <span
                className={`cx-live-dot${botMood === 'alert' ? ' is-alert' : botMood === 'scanning' ? ' is-scanning' : botMood === 'celebrating' ? ' is-celebrating' : ''}`}
                aria-hidden="true"
              />
              <span className="cx-truncate" style={{ maxWidth: '210px' }}>
                {moodTextMap[botMood] || 'Sync'} · {activePatient?.shortName || 'Marina Souza'}
              </span>
            </div>

            <nav className="cx-tabs" aria-label="Módulos do protótipo Clarix">
              {NAV_TABS.map((t) => {
                const Icon = t.icon;
                const active = activeMode === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    className={`cx-tab${active ? ' is-active' : ''}`}
                    onClick={() => onNavigate(t.path)}
                    aria-current={active ? 'page' : undefined}
                  >
                    <Icon size={14} aria-hidden="true" />
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </nav>

            <button
              type="button"
              className="cx-btn cx-btn-sm cx-btn-ghost cx-btn-pill"
              onClick={resetDemo}
              title="Restaurar dados iniciais do protótipo"
            >
              <RotateCcw size={13} aria-hidden="true" />
              <span>Resetar</span>
            </button>
          </div>
        </header>

        <main style={{ paddingBottom: '4rem' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
