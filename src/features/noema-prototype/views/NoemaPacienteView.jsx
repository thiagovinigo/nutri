import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Camera,
  Check,
  Droplets,
  Dumbbell,
  Home,
  MessageSquare,
  Send,
  Share2,
  User,
  Utensils
} from 'lucide-react';
import toast from 'react-hot-toast';
import { PHOTO_DISH_SAMPLES } from '../noemaData';
import { useNoema } from '../noemaStore';
import { NoemaBrandMark, NoemaRingSvg } from '../NoemaVisuals';

export default function NoemaPacienteView({ onNavigate }) {
  const {
    patients,
    activePatient,
    setActivePatientId,
    syncLog,
    addWater,
    updateSleep,
    toggleMealCheckin,
    logPhotoMealCheckin,
    toggleWorkoutExercise,
    sendPatientChatMessage
  } = useNoema();

  const [tab, setTab] = useState('home');
  const [selectedDish, setSelectedDish] = useState(PHOTO_DISH_SAMPLES[0]);
  const [uploadedPreviewUrl, setUploadedPreviewUrl] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanReady, setScanReady] = useState(true);
  const [chatDraft, setChatDraft] = useState('');
  const [cardTheme, setCardTheme] = useState('void');

  useEffect(() => {
    return () => {
      if (uploadedPreviewUrl) URL.revokeObjectURL(uploadedPreviewUrl);
    };
  }, [uploadedPreviewUrl]);

  const waterPct = Math.min(100, Math.round((activePatient.waterMl / activePatient.waterGoal) * 100));
  const doneMeals = activePatient.meals.filter((m) => m.checked).length;

  const triggerScan = (dish, customUrl = '') => {
    setSelectedDish(dish);
    if (customUrl) {
      if (uploadedPreviewUrl) URL.revokeObjectURL(uploadedPreviewUrl);
      setUploadedPreviewUrl(customUrl);
    }
    setScanReady(false);
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setScanReady(true);
    }, 900);
  };

  const handleChatSubmit = (e) => {
    e.preventDefault();
    if (!chatDraft.trim()) return;
    sendPatientChatMessage(activePatient.id, chatDraft);
    setChatDraft('');
  };

  const handleCopyStories = async () => {
    const caption = `14 dias de foco no Nutrivvo! ${activePatient.xp} XP acumulados · Plano acompanhado com telemetria real.`;
    try {
      await navigator.clipboard.writeText(caption);
      toast.success('Legenda copiada para postar nos Stories!');
    } catch {
      toast.success('Cartão gerado para Stories!');
    }
  };

  return (
    <section className="noema-section" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      <div className="noema-container">
        <div className="noema-paciente-split">
          {/* MOLDURA MOBILE REAL (390PX) DO APP DO PACIENTE */}
          <div className="noema-phone" role="region" aria-label="Aplicativo móvel do paciente Nutrivvo">
            <div className="noema-phone-bar">
              <span>09:41</span>
              <span style={{ width: '64px', height: '5px', background: 'var(--n-line)', borderRadius: '99px' }} aria-hidden="true" />
              <span>PWA · 5G</span>
            </div>

            <div className="noema-phone-top">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontWeight: 700, fontSize: '0.88rem' }}>
                <NoemaBrandMark size={18} />
                <span>Nutrivvo</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span className="n-tag n-tag-warn">{activePatient.streak}d</span>
                <span className="n-tag n-tag-signal n-tabular">{activePatient.xp} XP</span>
              </div>
            </div>

            <div className="noema-phone-body">
              {/* ABA 1 · INÍCIO & MISSÕES */}
              {tab === 'home' && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontFamily: 'var(--n-font-mono)', fontSize: '0.66rem', color: 'var(--n-signal)' }}>HOJE · ROTINA ATIVA</div>
                      <h2 className="n-truncate" style={{ fontSize: '1.18rem', margin: '0.2rem 0 0' }}>{activePatient.name}</h2>
                      <div style={{ fontSize: '0.76rem', color: 'var(--n-ink-muted)' }}>{doneMeals} de {activePatient.meals.length} refeições concluídas</div>
                    </div>
                    <NoemaRingSvg percent={waterPct} size={60} />
                  </div>

                  {/* Hidratação Interativa */}
                  <div className="n-card" style={{ padding: '0.9rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <strong style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.88rem' }}>
                        <Droplets size={15} color="var(--n-signal)" aria-hidden="true" /> Hidratação
                      </strong>
                      <span className="n-tabular" style={{ fontSize: '0.8rem', fontWeight: 700 }}>
                        {activePatient.waterMl} / {activePatient.waterGoal} ml
                      </span>
                    </div>
                    <div style={{ height: '7px', background: 'var(--n-line)', marginBottom: '0.7rem', overflow: 'hidden' }}>
                      <div style={{ width: `${waterPct}%`, height: '100%', background: 'var(--n-signal)', transition: 'width 0.25s ease' }} />
                    </div>
                    <button
                      type="button"
                      className="n-btn n-btn-electric"
                      style={{ width: '100%' }}
                      onClick={() => addWater(activePatient.id, 250)}
                    >
                      + 250 ml de água (+10 XP)
                    </button>
                  </div>

                  {/* Missões de Refeição */}
                  <div className="n-card" style={{ padding: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    <strong style={{ fontSize: '0.88rem' }}>Missões de Check-in (+35 XP)</strong>
                    {activePatient.meals.map((m) => (
                      <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', borderTop: '1px solid var(--n-line)', paddingTop: '0.55rem' }}>
                        <div style={{ minWidth: 0 }}>
                          <div className="n-truncate" style={{ fontSize: '0.82rem', fontWeight: 600 }}>{m.name}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--n-ink-muted)' }}>{m.slot}</div>
                        </div>
                        <button
                          type="button"
                          className={`n-btn n-btn-sm${m.checked ? ' n-btn-electric' : ''}`}
                          onClick={() => toggleMealCheckin(activePatient.id, m.id)}
                        >
                          {m.checked ? 'Concluído ✓' : 'Check-in'}
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Sono */}
                  <div className="n-card" style={{ padding: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
                    <div>
                      <strong style={{ fontSize: '0.84rem', display: 'block' }}>Sono &amp; Recuperação</strong>
                      <span style={{ fontSize: '0.75rem', color: 'var(--n-ink-muted)' }}>{activePatient.sleepHours} · {activePatient.sleepQuality}</span>
                    </div>
                    <select
                      aria-label="Registrar duração do sono"
                      className="n-select"
                      style={{ width: 'auto', minHeight: '38px', fontSize: '0.78rem' }}
                      value={activePatient.sleepHours}
                      onChange={(e) => updateSleep(activePatient.id, e.target.value, e.target.value.startsWith('8') ? 'Excelente' : 'Ótimo')}
                    >
                      <option value="6h 30m">6h 30m</option>
                      <option value="7h 45m">7h 45m</option>
                      <option value="8h 20m">8h 20m</option>
                    </select>
                  </div>
                </>
              )}

              {/* ABA 2 · PLANO DO DIA */}
              {tab === 'plano' && (
                <>
                  <div>
                    <div style={{ fontFamily: 'var(--n-font-mono)', fontSize: '0.68rem', color: 'var(--n-signal)' }}>SINCRONIZADO DO CRM</div>
                    <h2 style={{ fontSize: '1.12rem', margin: '0.2rem 0' }}>{activePatient.planTitle}</h2>
                    <div style={{ fontSize: '0.76rem', color: 'var(--n-ink-muted)' }}>{activePatient.planMacros}</div>
                  </div>
                  {activePatient.meals.map((m) => (
                    <div key={m.id} className="n-card" style={{ padding: '0.85rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.4rem', marginBottom: '0.35rem' }}>
                        <span style={{ fontSize: '0.72rem', color: 'var(--n-signal)', fontFamily: 'var(--n-font-mono)' }}>{m.slot}</span>
                        <span className="n-tag n-tabular">{m.kcal} kcal</span>
                      </div>
                      <strong style={{ fontSize: '0.88rem', display: 'block', marginBottom: '0.4rem' }}>{m.name}</strong>
                      <ul style={{ margin: '0 0 0.45rem', paddingLeft: '1rem', fontSize: '0.78rem', color: 'var(--n-ink-muted)' }}>
                        {m.items.map((it) => <li key={it}>{it}</li>)}
                      </ul>
                      <details style={{ fontSize: '0.78rem', marginBottom: '0.5rem' }}>
                        <summary style={{ cursor: 'pointer', color: 'var(--n-signal)', fontWeight: 600 }}>Ver modo de preparo</summary>
                        <p style={{ color: 'var(--n-ink-muted)', marginTop: '0.3rem' }}>{m.prep}</p>
                      </details>
                      <button
                        type="button"
                        className={`n-btn n-btn-sm${m.checked ? ' n-btn-electric' : ''}`}
                        style={{ width: '100%' }}
                        onClick={() => toggleMealCheckin(activePatient.id, m.id)}
                      >
                        {m.checked ? 'Refeição Concluída ✓' : 'Marcar como Concluída (+35 XP)'}
                      </button>
                    </div>
                  ))}
                </>
              )}

              {/* ABA 3 · SCANNER FOTO IA */}
              {tab === 'foto' && (
                <>
                  <div>
                    <div style={{ fontFamily: 'var(--n-font-mono)', fontSize: '0.68rem', color: 'var(--n-signal)' }}>VISÃO COMPUTACIONAL</div>
                    <h2 style={{ fontSize: '1.15rem', marginTop: '0.2rem' }}>Check-in por Foto do Prato</h2>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                    {PHOTO_DISH_SAMPLES.map((dish) => (
                      <button
                        key={dish.id}
                        type="button"
                        className={`n-btn n-btn-sm${selectedDish.id === dish.id && !uploadedPreviewUrl ? ' n-btn-electric' : ''}`}
                        onClick={() => {
                          if (uploadedPreviewUrl) {
                            URL.revokeObjectURL(uploadedPreviewUrl);
                            setUploadedPreviewUrl('');
                          }
                          triggerScan(dish);
                        }}
                      >
                        {dish.label}
                      </button>
                    ))}
                  </div>

                  <label className="n-btn n-btn-sm" style={{ cursor: 'pointer' }}>
                    <Camera size={14} aria-hidden="true" />
                    <span>Enviar foto do seu computador/celular</span>
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (!f) return;
                        triggerScan(
                          {
                            id: 'custom-photo',
                            label: f.name.replace(/\.[^.]+$/, '').slice(0, 28),
                            subtitle: 'Foto enviada pelo dispositivo · Estimativa IA',
                            items: ['Proteína grelhada · ~145g', 'Carboidrato complexo · ~110g', 'Vegetais frescos · ~120g'],
                            adherencePct: 93
                          },
                          URL.createObjectURL(f)
                        );
                      }}
                    />
                  </label>

                  <div className="noema-scan-stage">
                    {isScanning && <div className="noema-scan-beam" aria-hidden="true" />}
                    {uploadedPreviewUrl ? (
                      <img src={uploadedPreviewUrl} alt="Prévia da refeição enviada" style={{ width: '100%', height: '140px', objectFit: 'cover', marginBottom: '0.65rem' }} />
                    ) : (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <strong>{selectedDish.label}</strong>
                        <span className="n-tag n-tag-ok">{isScanning ? 'Escaneando...' : `${selectedDish.adherencePct}% meta`}</span>
                      </div>
                    )}
                    <div style={{ fontSize: '0.76rem', color: 'var(--n-ink-muted)', marginBottom: '0.6rem' }}>{selectedDish.subtitle}</div>
                    {scanReady && (
                      <ul style={{ margin: 0, paddingLeft: '1rem', fontSize: '0.78rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        {selectedDish.items.map((it) => <li key={it}>{it}</li>)}
                      </ul>
                    )}
                  </div>

                  <button
                    type="button"
                    className="n-btn n-btn-electric"
                    disabled={isScanning}
                    onClick={() => logPhotoMealCheckin(activePatient.id, selectedDish)}
                  >
                    Registrar Prato no Diário (+35 XP)
                  </button>
                </>
              )}

              {/* ABA 4 · TREINO & NUTRIBOT CHAT */}
              {tab === 'treino' && (
                <>
                  <div className="n-card" style={{ padding: '0.85rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.55rem' }}>
                      <strong style={{ fontSize: '0.88rem' }}>Treino Alinhado à Dieta (+20 XP)</strong>
                      <span className="n-tag">{activePatient.planKcal} kcal</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                      {activePatient.workouts.map((w) => (
                        <button
                          key={w.id}
                          type="button"
                          className="n-btn n-btn-sm"
                          style={{ justifyContent: 'space-between', borderColor: w.done ? 'var(--n-live)' : 'var(--n-line)' }}
                          onClick={() => toggleWorkoutExercise(activePatient.id, w.id)}
                        >
                          <span className="n-truncate">{w.name} · {w.sets}</span>
                          <span style={{ color: w.done ? 'var(--n-live)' : 'var(--n-ink-muted)' }}>{w.done ? 'Feito ✓' : 'Marcar'}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="n-card" style={{ padding: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.86rem' }}>
                        <MessageSquare size={14} color="var(--n-signal)" aria-hidden="true" /> NutriBot Telegram IA
                      </strong>
                      <span className="noema-pulse-dot" aria-hidden="true" />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', maxHeight: '210px', overflowY: 'auto' }}>
                      {activePatient.chat.map((c) => (
                        <div
                          key={c.id}
                          style={{
                            alignSelf: c.from === 'user' ? 'flex-end' : 'flex-start',
                            maxWidth: '90%',
                            padding: '0.55rem 0.7rem',
                            fontSize: '0.78rem',
                            background: c.from === 'user' ? '#544be6' : 'var(--n-void)',
                            color: c.from === 'user' ? '#ffffff' : 'var(--n-ink)',
                            border: '1px solid var(--n-line)'
                          }}
                        >
                          <div>{c.text}</div>
                          <div style={{ fontSize: '0.64rem', opacity: 0.75, marginTop: '0.2rem' }}>{c.ts}</div>
                        </div>
                      ))}
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                      {['Posso trocar frango?', 'Falta muita água?', 'Fome à noite'].map((sug) => (
                        <button key={sug} type="button" className="n-btn n-btn-sm" style={{ fontSize: '0.72rem' }} onClick={() => sendPatientChatMessage(activePatient.id, sug)}>
                          {sug}
                        </button>
                      ))}
                    </div>

                    <form onSubmit={handleChatSubmit} style={{ display: 'flex', gap: '0.4rem' }}>
                      <label htmlFor="patient-chat-input" style={{ position: 'absolute', left: '-9999px' }}>Perguntar ao NutriBot</label>
                      <input
                        id="patient-chat-input"
                        className="n-input"
                        placeholder="Pergunte sobre trocas ou treino..."
                        value={chatDraft}
                        onChange={(e) => setChatDraft(e.target.value)}
                      />
                      <button type="submit" className="n-btn n-btn-electric" aria-label="Enviar mensagem no chat">
                        <Send size={15} />
                      </button>
                    </form>
                  </div>
                </>
              )}

              {/* ABA 5 · PERFIL & CARTÃO COMPARTILHÁVEL */}
              {tab === 'perfil' && (
                <>
                  <div
                    className={cardTheme === 'paper' ? 'noema-paper' : ''}
                    style={{
                      padding: '1.25rem',
                      border: '1px solid var(--n-border)',
                      background: cardTheme === 'paper' ? 'var(--n-paper)' : 'linear-gradient(155deg, rgba(108,99,255,0.22), var(--n-void-elev))',
                      textAlign: 'center'
                    }}
                  >
                    <span className="n-tag n-tag-signal" style={{ marginBottom: '0.6rem' }}>MARCO COMPARTILHÁVEL</span>
                    <h2 style={{ fontSize: '1.5rem', letterSpacing: '-0.04em', margin: '0.25rem 0' }}>{activePatient.streak} Dias de Ofensiva!</h2>
                    <p style={{ fontSize: '0.82rem', color: 'var(--n-fg-muted)', marginBottom: '1rem' }}>
                      {activePatient.shortName} mantém {activePatient.adherence}% de adesão com a clínica.
                    </p>
                    <div className="n-grid-2" style={{ gap: '0.5rem', marginBottom: '1rem' }}>
                      <div style={{ border: '1px solid var(--n-border)', padding: '0.6rem' }}>
                        <div style={{ fontSize: '0.7rem', color: 'var(--n-fg-muted)' }}>XP Total</div>
                        <strong className="n-tabular">{activePatient.xp} XP</strong>
                      </div>
                      <div style={{ border: '1px solid var(--n-border)', padding: '0.6rem' }}>
                        <div style={{ fontSize: '0.7rem', color: 'var(--n-fg-muted)' }}>Nível</div>
                        <strong>Foco Blindado</strong>
                      </div>
                    </div>
                    <button type="button" className="n-btn n-btn-electric" style={{ width: '100%' }} onClick={handleCopyStories}>
                      <Share2 size={15} aria-hidden="true" /> Copiar Cartão p/ Stories
                    </button>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button type="button" className={`n-btn n-btn-sm${cardTheme === 'void' ? ' n-btn-electric' : ''}`} style={{ flex: 1 }} onClick={() => setCardTheme('void')}>
                      Cartão Void
                    </button>
                    <button type="button" className={`n-btn n-btn-sm${cardTheme === 'paper' ? ' n-btn-electric' : ''}`} style={{ flex: 1 }} onClick={() => setCardTheme('paper')}>
                      Cartão Paper
                    </button>
                  </div>
                </>
              )}
            </div>

            <nav className="noema-phone-nav" aria-label="Abas do App do Paciente">
              {[
                { id: 'home', label: 'Início', icon: Home },
                { id: 'plano', label: 'Plano', icon: Utensils },
                { id: 'foto', label: 'Foto IA', icon: Camera },
                { id: 'treino', label: 'Bot/Treino', icon: Dumbbell },
                { id: 'perfil', label: 'Perfil', icon: User }
              ].map((t) => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.id}
                    type="button"
                    className={`noema-phone-tab${tab === t.id ? ' is-active' : ''}`}
                    onClick={() => setTab(t.id)}
                  >
                    <Icon size={16} aria-hidden="true" />
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* PAINEL LATERAL DE TELEMETRIA E SINCRONIZAÇÃO CRM ↔ PACIENTE */}
          <aside style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="n-card">
              <span className="noema-eyebrow">TELEMETRIA SINCRONIZADA EM TEMPO REAL</span>
              <h1 style={{ fontSize: 'clamp(1.5rem, 2.8vw, 2.1rem)', letterSpacing: '-0.04em', margin: '0.45rem 0 0.65rem' }}>
                App do Paciente × CRM Nutrivvo
              </h1>
              <p style={{ color: 'var(--n-ink-muted)', fontSize: '0.94rem', marginBottom: '1.1rem' }}>
                Troque o paciente abaixo ou interaja no celular ao lado (adicione água, faça check-in de refeição, teste o scanner de foto ou converse com o NutriBot) e volte ao CRM para ver os números e histórico atualizados.
              </p>

              <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <label htmlFor="pac-switch" style={{ fontFamily: 'var(--n-font-mono)', fontSize: '0.72rem' }}>PACIENTE ATIVO:</label>
                <select
                  id="pac-switch"
                  className="n-select"
                  style={{ width: 'auto', minWidth: '250px' }}
                  value={activePatient.id}
                  onChange={(e) => setActivePatientId(e.target.value)}
                >
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
                <button type="button" className="n-btn n-btn-electric" onClick={() => onNavigate('/noema/crm')}>
                  <ArrowLeft size={15} aria-hidden="true" /> Conferir no CRM
                </button>
              </div>
            </div>

            <div className="n-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <strong>Log de Eventos Sincronizados</strong>
                <span className="n-tag n-tag-ok">Ao Vivo</span>
              </div>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {syncLog.map((item) => (
                  <li key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid var(--n-line)', paddingBottom: '0.45rem', fontSize: '0.84rem' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}>
                      <Check size={14} color="var(--n-live)" aria-hidden="true" />
                      <span>{item.msg}</span>
                    </span>
                    <span style={{ fontFamily: 'var(--n-font-mono)', fontSize: '0.72rem', color: 'var(--n-ink-muted)', flexShrink: 0 }}>{item.ts}</span>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
