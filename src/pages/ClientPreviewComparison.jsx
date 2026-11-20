import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowUpRight,
  Bot,
  CheckCircle2,
  Columns2,
  Copy,
  Layers,
  LayoutDashboard,
  Maximize2,
  Smartphone,
  Sparkles,
  X,
  ZoomIn
} from 'lucide-react';
import toast from 'react-hot-toast';
import './client-preview.css';

function AdaptiveIframe({ initialSrc, targetPath, title, viewMode, iframeTestId }) {
  const wrapRef = useRef(null);
  const frameRef = useRef(null);
  const targetRef = useRef(targetPath || initialSrc);
  const [box, setBox] = useState({ width: 0, height: 540 });

  targetRef.current = targetPath || initialSrc;

  useEffect(() => {
    const el = wrapRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return undefined;
    const update = () => {
      setBox({ width: el.clientWidth, height: el.clientHeight || 540 });
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [viewMode]);

  useEffect(() => {
    if (!targetPath) return;
    frameRef.current?.contentWindow?.postMessage(
      { type: 'nutrivvo-preview-nav', path: targetPath },
      window.location.origin
    );
  }, [targetPath]);

  const handleLoad = () => {
    if (!targetRef.current) return;
    frameRef.current?.contentWindow?.postMessage(
      { type: 'nutrivvo-preview-nav', path: targetRef.current },
      window.location.origin
    );
  };

  const shouldScaleDesktop =
    viewMode === 'split' && box.width >= 480 && box.width < 1120;
  const virtualWidth = 1280;
  const scale = shouldScaleDesktop ? box.width / virtualWidth : 1;
  const frameHeight = shouldScaleDesktop ? Math.round(box.height / scale) : undefined;

  const wrapClass = [
    'cp-iframe-wrap',
    viewMode === 'focus-new' ? 'is-full-height' : '',
    viewMode === 'mobile' ? 'is-mobile-frame' : ''
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div ref={wrapRef} className={wrapClass}>
      <iframe
        ref={frameRef}
        src={initialSrc}
        title={title}
        data-testid={iframeTestId}
        onLoad={handleLoad}
        className="cp-frame-device"
        style={
          shouldScaleDesktop
            ? {
                width: `${virtualWidth}px`,
                height: `${frameHeight}px`,
                transform: `scale(${scale})`,
                transformOrigin: 'top left',
                flexShrink: 0
              }
            : undefined
        }
      />
    </div>
  );
}

const TABS = [
  {
    id: 'landing',
    label: '01 · Landing Page',
    icon: Sparkles,
    prodRoute: '/',
    newRoute: '/clarix',
    prodSubtitle: 'Landing atual em produção (hero com prints estáticos e fluxo tradicional).',
    newSubtitle: 'Nova Landing Clarix + NutrIA 3D ao vivo, simulação interativa e painel sincronizado.'
  },
  {
    id: 'crm',
    label: '02 · CRM Nutricionista',
    icon: LayoutDashboard,
    prodRoute: '/nutri',
    newRoute: '/clarix/crm',
    prodSubtitle: 'Tela real do CRM em produção (captura fiel — clique para ampliar em tela cheia).',
    newSubtitle: 'Cockpit Moveflux + Radar 360° + barra semanal + Co-Piloto NutrIA 3D sincronizado.'
  },
  {
    id: 'paciente',
    label: '03 · App do Paciente',
    icon: Smartphone,
    prodRoute: '/paciente',
    newRoute: '/clarix/paciente',
    prodSubtitle: 'App PWA atual do paciente (gamificação escura, check-ins e metas de água).',
    newSubtitle: 'Novo App Luminoso + Anel de Kcal/Macros + Foto IA + NutrIA + Voz interativa.'
  }
];

const VIEW_MODES = [
  { id: 'split', label: 'Lado a Lado', icon: Columns2 },
  { id: 'focus-new', label: 'Nova Proposta', icon: Maximize2 },
  { id: 'mobile', label: 'Mobile 390px', icon: Smartphone }
];

const EVOLUTION_HIGHLIGHTS = [
  {
    title: 'Presença Viva: NutrIA 3D',
    before: 'Assistente apenas em texto estático',
    after: 'Holograma WebGL reativo com estados de alerta, scanner, comemoração e voz',
    badge: 'Inovação Principal'
  },
  {
    title: 'Cockpit Moveflux × Clarix',
    before: 'Tabelas e blocos padrão de CRM',
    after: 'Cartões táteis luminosos, faixa semanal 7 dias, cronômetro de atendimento e curvas escuras',
    badge: 'CRM Nutricionista'
  },
  {
    title: 'App do Paciente Luminoso',
    before: 'Fundo escuro contínuo e checagem simples',
    after: 'Anel calórico, pílulas de Carbs/Proteína/Gordura, scanner visual e feedback da NutrIA',
    badge: 'Retenção Diária'
  },
  {
    title: 'Motor Clínico Já Validado',
    before: 'Landing tinha promessas sem UI LGPD',
    after: 'LGPD (Exportar JSON + Excluir Conta), Lista de Mercado, Radar 360° e Telegram ativos',
    badge: 'Auditoria Concluída'
  }
];

const FEATURE_MATRIX = [
  {
    feature: 'Radar de Abandono 360°',
    prod: 'Score calculado + cron diário + alertas no CRM',
    proposal: 'Mesma inteligência com cards de resgate e alerta reativo na NutrIA 3D',
    status: 'real'
  },
  {
    feature: 'Secretária 24h Telegram (Texto/Foto/Áudio)',
    prod: 'Webhook ativo + Whisper áudio + lembretes automáticos',
    proposal: 'Integrado ao fluxo visual e botão direto de disparo pela NutrIA',
    status: 'real'
  },
  {
    feature: 'Check-in Diário por Foto com IA',
    prod: 'OpenAI Vision lê prato real (+20 XP) e analisa geladeira',
    proposal: 'Interface de scanner animado TACO com feedback instantâneo da NutrIA',
    status: 'real'
  },
  {
    feature: 'Cardápios 1–30d TACO + Lista de Mercado',
    prod: 'Gerador IA por anamnese/exames + Lista de Mercado por categoria',
    proposal: 'Publicação com 1 clique no CRM refletindo na hora no simulador do App',
    status: 'real'
  },
  {
    feature: 'Exames PDF/OCR + Treinos + LGPD',
    prod: 'Análise clínica, periodização A/B e Exportar JSON + Excluir Conta',
    proposal: 'Scanner de exames PDF acoplado ao estado visual da NutrIA 3D',
    status: 'real'
  },
  {
    feature: 'Holograma WebGL NutrIA 3D + Voz no App Web',
    prod: 'Ainda não existe na versão em produção (voz só no Telegram)',
    proposal: 'Experiência central desta proposta para encantar paciente e clínica',
    status: 'new'
  },
  {
    feature: 'Anel Diário de Kcal/Macros & Timer de Consulta',
    prod: 'Cardápio calcula macros, mas diário grava texto livre sem somatório diário',
    proposal: 'Painel Moveflux em tempo real a cada refeição concluída',
    status: 'new'
  }
];

function PaneHeader({ badgeClass, badgeText, routeLabel, href }) {
  return (
    <div className="cp-pane-chrome">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
        <span className={`cp-tag ${badgeClass}`}>{badgeText}</span>
        <span className="cp-route-chip">{routeLabel}</span>
      </div>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="cp-btn cp-btn-sm cp-btn-ghost"
      >
        <span>Abrir</span>
        <ArrowUpRight size={13} aria-hidden="true" />
      </a>
    </div>
  );
}

export default function ClientPreviewComparison() {
  const [activeTab, setActiveTab] = useState('landing');
  const [viewMode, setViewMode] = useState('split');
  const [patientProdImg, setPatientProdImg] = useState('focus');
  const [lightboxImg, setLightboxImg] = useState(null);

  const currentTab = TABS.find((t) => t.id === activeTab) || TABS[0];

  useEffect(() => {
    ['/screen_nutri.png', '/screen_paciente_focus.png', '/screen_paciente.png'].forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  useEffect(() => {
    const prevTitle = document.title;
    document.title = 'Nutrivvo · Proposta de Redesign NutrIA';
    let meta = document.querySelector('meta[name="robots"]');
    const created = !meta;
    const prevContent = meta ? meta.getAttribute('content') : null;
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'robots');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', 'noindex, nofollow');
    return () => {
      document.title = prevTitle;
      if (created) {
        meta.remove();
      } else if (prevContent === null) {
        meta.removeAttribute('content');
      } else {
        meta.setAttribute('content', prevContent);
      }
    };
  }, []);

  useEffect(() => {
    if (!lightboxImg) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') setLightboxImg(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightboxImg]);

  const handleCopyPreviewLink = async () => {
    const shareUrl = `${window.location.origin}/proposta`;
    let copied = false;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
        copied = true;
      }
    } catch {
      copied = false;
    }
    toast.success(copied ? `Link copiado: ${shareUrl}` : `Link da proposta: ${shareUrl}`);
  };

  const prodPatientSrc =
    patientProdImg === 'focus' ? '/screen_paciente_focus.png' : '/screen_paciente.png';

  return (
    <div className="cp-root">
      {/* HEADER FIXO */}
      <header className="cp-header">
        <div className="cp-header-inner">
          <div className="cp-brand">
            <span className="cp-brand-mark" aria-hidden="true">
              <Bot size={18} />
            </span>
            <div>
              <span className="cp-brand-title">Nutrivvo · Comparativo para Aprovação</span>
              <span className="cp-brand-sub">Produção Atual vs. Nova Proposta NutrIA</span>
            </div>
          </div>

          <div className="cp-controls-row">
            <div className="cp-pill-group" role="tablist" aria-label="Tela comparada">
              {TABS.map((t) => {
                const Icon = t.icon;
                const active = activeTab === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    className={`cp-pill-btn${active ? ' is-active' : ''}`}
                    onClick={() => setActiveTab(t.id)}
                  >
                    <Icon size={14} aria-hidden="true" />
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="cp-pill-group" role="group" aria-label="Modo de visualização">
              {VIEW_MODES.map((m) => {
                const Icon = m.icon;
                const active = viewMode === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    className={`cp-pill-btn${active ? ' is-active' : ''}`}
                    onClick={() => setViewMode(m.id)}
                  >
                    <Icon size={13} aria-hidden="true" />
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              className="cp-btn cp-btn-sm cp-btn-primary"
              onClick={handleCopyPreviewLink}
            >
              <Copy size={13} aria-hidden="true" />
              <span>Copiar Link</span>
            </button>
          </div>
        </div>
      </header>

      <main className="cp-container" style={{ paddingBottom: '4rem' }}>
        {/* TÍTULO CONTEXTUAL */}
        <section className="cp-intro">
          <div>
            <span className="cp-eyebrow">
              <Layers size={13} aria-hidden="true" /> VALIDAÇÃO VISUAL &amp; FUNCIONAL INTERATIVA
            </span>
            <h1 className="cp-title">
              Compare o que já roda em produção com o redesign Clarix + NutrIA
            </h1>
          </div>
          <p style={{ margin: 0, maxWidth: '52ch', fontSize: '0.86rem', color: 'var(--cp-muted)' }}>
            Interaja diretamente nos painéis abaixo: a coluna da direita executa o protótipo vivo com estado sincronizado entre Landing, CRM e App do Paciente.
          </p>
        </section>

        {/* PALCO COMPARATIVO */}
        <section
          className={`cp-split${viewMode === 'focus-new' ? ' is-single' : ''}`}
          aria-label={`Comparação de ${currentTab.label}`}
        >
          {/* PAINEL ESQUERDO: PRODUÇÃO ATUAL */}
          {viewMode !== 'focus-new' && (
            <article className="cp-pane" data-testid="pane-prod">
              <PaneHeader
                badgeClass="cp-tag-prod"
                badgeText="Produção Atual"
                routeLabel={currentTab.prodRoute}
                href={currentTab.prodRoute}
              />

              <div style={{ display: activeTab === 'landing' ? 'block' : 'none' }}>
                <AdaptiveIframe
                  initialSrc="/"
                  title="Landing Page em Produção Atual"
                  viewMode={viewMode}
                  iframeTestId="iframe-prod-landing"
                />
              </div>

              {activeTab === 'crm' && (
                <div className="cp-prod-img-stage">
                  <button
                    type="button"
                    className="cp-prod-img-btn"
                    onClick={() =>
                      setLightboxImg({
                        src: '/screen_nutri.png',
                        title: 'CRM Atual em Produção (/nutri)',
                        subtitle: 'Visão clínica real atualmente em produção — sem precisar login para visualizar.'
                      })
                    }
                    aria-label="Ampliar captura do CRM em produção"
                  >
                    <img src="/screen_nutri.png" alt="CRM Nutricionista atual em produção" />
                  </button>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#cbd5e1', fontSize: '0.76rem' }}>
                    <ZoomIn size={14} aria-hidden="true" />
                    <span>Captura real de produção (clique para ampliar em HD)</span>
                  </div>
                </div>
              )}

              {activeTab === 'paciente' && (
                <div className="cp-prod-img-stage">
                  <button
                    type="button"
                    className="cp-prod-img-btn"
                    onClick={() =>
                      setLightboxImg({
                        src: prodPatientSrc,
                        title: 'App do Paciente Atual em Produção (/paciente)',
                        subtitle: 'Tela atual do aplicativo PWA em produção.'
                      })
                    }
                    aria-label="Ampliar captura do App do Paciente em produção"
                  >
                    <img src={prodPatientSrc} alt="App do Paciente atual em produção" />
                  </button>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                    <button
                      type="button"
                      className="cp-btn cp-btn-sm cp-btn-ghost"
                      onClick={() => setPatientProdImg((v) => (v === 'focus' ? 'full' : 'focus'))}
                    >
                      {patientProdImg === 'focus' ? 'Ver tela completa' : 'Ver foco mobile'}
                    </button>
                    <span style={{ color: '#cbd5e1', fontSize: '0.75rem' }}>
                      Clique na imagem para ampliar
                    </span>
                  </div>
                </div>
              )}

              <div style={{ padding: '0.75rem 1rem', fontSize: '0.8rem', color: 'var(--cp-muted)', borderTop: '1px solid var(--cp-line)' }}>
                {currentTab.prodSubtitle}
              </div>
            </article>
          )}

          {/* PAINEL DIREITO: NOVA PROPOSTA NUTRIA */}
          <article className="cp-pane is-new" data-testid="pane-new">
            <PaneHeader
              badgeClass="cp-tag-new"
              badgeText="Nova Proposta · NutrIA"
              routeLabel={currentTab.newRoute}
              href={currentTab.newRoute}
            />

            <AdaptiveIframe
              initialSrc="/clarix"
              targetPath={currentTab.newRoute}
              title={`Nova Proposta — ${currentTab.label}`}
              viewMode={viewMode}
              iframeTestId="iframe-new-proposal"
            />

            <div style={{ padding: '0.75rem 1rem', fontSize: '0.8rem', color: '#0f172a', fontWeight: 500, borderTop: '1px solid var(--cp-line)', background: '#f8fafc' }}>
              {currentTab.newSubtitle}
            </div>
          </article>
        </section>

        {/* DESTAQUES EXECUTIVOS */}
        <section className="cp-diff-grid" aria-label="Resumo da evolução visual e funcional">
          {EVOLUTION_HIGHLIGHTS.map((item) => (
            <article key={item.title} className="cp-card">
              <span className="cp-tag cp-tag-info">{item.badge}</span>
              <h2 style={{ margin: '0.6rem 0 0.45rem', fontSize: '1rem', fontWeight: 700 }}>{item.title}</h2>
              <p style={{ margin: '0 0 0.35rem', fontSize: '0.78rem', color: 'var(--cp-muted)' }}>
                <strong>Antes:</strong> {item.before}
              </p>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#0f172a' }}>
                <strong>Depois:</strong> {item.after}
              </p>
            </article>
          ))}
        </section>

        {/* MATRIZ DE PARIDADE TÉCNICA (TRANSPARÊNCIA PARA O CLIENTE) */}
        <section className="cp-card" style={{ marginTop: '1.35rem' }} aria-label="O que já temos vs novidades da proposta">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.9rem' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700 }}>
                Transparência Técnica: O que já roda hoje × O que é novo nesta interface
              </h2>
              <p style={{ margin: '0.2rem 0 0', fontSize: '0.82rem', color: 'var(--cp-muted)' }}>
                Mapeamento direto contra o código de produção para alinhar escopo sem surpresas.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span className="cp-tag cp-tag-ok">Já ativo no backend real</span>
              <span className="cp-tag cp-tag-new">Novo no redesign</span>
            </div>
          </div>

          <div className="cp-table-wrap">
            <table className="cp-table">
              <thead>
                <tr>
                  <th>Funcionalidade</th>
                  <th>Produção Atual</th>
                  <th>Nova Proposta Clarix + NutrIA</th>
                  <th>Situação</th>
                </tr>
              </thead>
              <tbody>
                {FEATURE_MATRIX.map((row) => (
                  <tr key={row.feature}>
                    <td><strong>{row.feature}</strong></td>
                    <td style={{ color: 'var(--cp-muted)' }}>{row.prod}</td>
                    <td>{row.proposal}</td>
                    <td>
                      <span className={`cp-tag ${row.status === 'real' ? 'cp-tag-ok' : 'cp-tag-new'}`}>
                        {row.status === 'real' ? (
                          <>
                            <CheckCircle2 size={12} aria-hidden="true" /> Backend pronto
                          </>
                        ) : (
                          'Novo no redesign'
                        )}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ATALHOS DIRETOS PARA NAVEGAÇÃO FULLSCREEN */}
        <section className="cp-card" style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.85rem' }}>
          <div>
            <strong style={{ fontSize: '0.96rem', display: 'block' }}>Quer testar alguma tela em tela cheia?</strong>
            <span style={{ fontSize: '0.8rem', color: 'var(--cp-muted)' }}>
              Abra diretamente em nova aba com estado compartilhado via navegador.
            </span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            <a href="/clarix" target="_blank" rel="noopener noreferrer" className="cp-btn cp-btn-accent">
              Landing NutrIA ↗
            </a>
            <a href="/clarix/crm" target="_blank" rel="noopener noreferrer" className="cp-btn cp-btn-primary">
              CRM NutrIA ↗
            </a>
            <a href="/clarix/paciente" target="_blank" rel="noopener noreferrer" className="cp-btn cp-btn-ghost">
              App Paciente NutrIA ↗
            </a>
            <a href="/clarix/componentes" target="_blank" rel="noopener noreferrer" className="cp-btn cp-btn-ghost">
              Design System #components ↗
            </a>
          </div>
        </section>
      </main>

      {/* LIGHTBOX PARA IMAGENS DE PRODUÇÃO */}
      {lightboxImg && (
        <div
          className="cp-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={lightboxImg.title}
          onClick={() => setLightboxImg(null)}
        >
          <div className="cp-lightbox-panel" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.9rem 1.2rem', borderBottom: '1px solid #1e293b', color: '#ffffff' }}>
              <div>
                <strong style={{ display: 'block', fontSize: '0.98rem' }}>{lightboxImg.title}</strong>
                <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{lightboxImg.subtitle}</span>
              </div>
              <button
                type="button"
                onClick={() => setLightboxImg(null)}
                aria-label="Fechar visualização ampliada"
                style={{
                  border: 0,
                  borderRadius: '999px',
                  width: '34px',
                  height: '34px',
                  background: 'rgba(255,255,255,0.12)',
                  color: '#ffffff',
                  cursor: 'pointer',
                  display: 'grid',
                  placeItems: 'center'
                }}
              >
                <X size={18} />
              </button>
            </div>
            <div style={{ padding: '1rem', overflow: 'auto', display: 'flex', justifyContent: 'center', background: '#090d16' }}>
              <img src={lightboxImg.src} alt={lightboxImg.title} style={{ maxWidth: '100%', height: 'auto', borderRadius: '12px' }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
