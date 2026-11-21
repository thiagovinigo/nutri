import React, { useEffect, useState } from 'react';
import {
  Activity,
  ArrowLeftRight,
  Bot,
  Camera,
  Check,
  ChefHat,
  Download,
  Droplets,
  Dumbbell,
  FileText,
  Flame,
  Home,
  LayoutDashboard,
  Lock,
  Mic,
  Pause,
  Play,
  Send,
  TrendingUp,
  Utensils
} from 'lucide-react';
import toast from 'react-hot-toast';
import ClarixRobotCanvas from '../components/ClarixRobotCanvas';
import {
  ConicRing,
  MacroPillGroup,
  VoiceWaveVisualizer,
  WeightEvolutionChart
} from '../components/MovefluxCharts';
import { PHOTO_DISH_SAMPLES, TACO_SUBSTITUTIONS, WEEK_DAYS } from '../clarixData';
import { useClarix } from '../clarixStore';

export default function ClarixPacienteView({ onNavigate }) {
  const {
    patients,
    activePatient,
    recipes,
    syncLog,
    botMood,
    botSpeech,
    botPulseCount,
    selectedDayIdx,
    selectPatient,
    setBotMood,
    addWater,
    toggleMealCheckin,
    logPhotoMealCheckin,
    toggleWorkoutExercise,
    updateSleep,
    sendBotMessage,
    setSelectedDayIdx
  } = useClarix();

  const [tab, setTab] = useState('hoje');
  const [chatText, setChatText] = useState('');
  const [voiceActive, setVoiceActive] = useState(false);

  // Scanner Foto IA
  const [selectedDish, setSelectedDish] = useState(PHOTO_DISH_SAMPLES[0]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanReady, setScanReady] = useState(true);
  const [uploadedPreviewUrl, setUploadedPreviewUrl] = useState('');

  // Timer de treino/jejum no celular
  const [focusRunning, setFocusRunning] = useState(false);
  const [focusSec, setFocusSec] = useState(1420);

  useEffect(() => {
    if (!focusRunning) return undefined;
    const t = window.setInterval(() => setFocusSec((s) => s + 1), 1000);
    return () => window.clearInterval(t);
  }, [focusRunning]);

  useEffect(() => {
    return () => {
      if (uploadedPreviewUrl) URL.revokeObjectURL(uploadedPreviewUrl);
    };
  }, [uploadedPreviewUrl]);

  const waterPct = Math.min(100, Math.round(((activePatient?.waterMl || 0) / Math.max(activePatient?.waterGoal || 1, 1)) * 100));
  const kcalPct = Math.min(100, Math.round(((activePatient?.kcalConsumed || 0) / Math.max(activePatient?.kcalTarget || 1, 1)) * 100));

  const formatClock = (s) => {
    const mm = String(Math.floor(s / 60)).padStart(2, '0');
    const ss = String(s % 60).padStart(2, '0');
    return `${mm}:${ss}`;
  };

  const triggerDishScan = (dish, previewUrl = '') => {
    setSelectedDish(dish);
    if (previewUrl) setUploadedPreviewUrl(previewUrl);
    setScanReady(false);
    setIsScanning(true);
    setBotMood('scanning', `Analisando imagem do prato "${dish.label}" com visão TACO IA...`);
    window.setTimeout(() => {
      setIsScanning(false);
      setScanReady(true);
      setBotMood('celebrating', `Análise pronta! ${dish.label} possui ~${dish.kcal} kcal e ${dish.adherencePct}% de alinhamento com sua meta.`);
    }, 900);
  };

  const handleVoiceDemo = () => {
    const next = !voiceActive;
    setVoiceActive(next);
    if (next) {
      setBotMood('thinking', 'Ouvindo comando de voz simulado do paciente...');
      window.setTimeout(() => {
        setVoiceActive(false);
        sendBotMessage(activePatient?.id, 'Acabei de treinar e posso trocar o frango por ovos ou patinho?', 'patient');
      }, 950);
    }
  };

  const handleChatSubmit = (e) => {
    e.preventDefault();
    if (!chatText.trim()) return;
    sendBotMessage(activePatient?.id, chatText, 'patient');
    setChatText('');
  };

  return (
    <div className="cx-container" style={{ paddingTop: '1.5rem' }}>
      <div className="cx-patient-layout">
        {/* COLUNA ESQUERDA: SMARTPHONE PWA DO PACIENTE */}
        <div>
          <div className="cx-phone" role="region" aria-label="Aplicativo móvel do paciente Nutrivvo Clarix">
            <div className="cx-phone-status">
              <span>09:41</span>
              <span style={{ width: '54px', height: '4px', borderRadius: '99px', background: 'rgba(15,23,42,0.2)' }} aria-hidden="true" />
              <span>PWA · 5G</span>
            </div>

            <div className="cx-phone-top">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <span className="cx-brand-mark" style={{ width: '26px', height: '26px', borderRadius: '8px' }} aria-hidden="true">
                  <Bot size={14} />
                </span>
                <strong style={{ fontSize: '0.88rem' }}>Nutrivvo</strong>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span className="cx-tag cx-tag-warn">{activePatient?.streak}d</span>
                <span className="cx-tag cx-tag-info cx-tabular" data-testid="patient-xp-badge">{activePatient?.xp} XP</span>
              </div>
            </div>

            <div className="cx-phone-body">
              {/* ABA 1: HOJE (MOVEFLUX + GAMIFICAÇÃO) */}
              {tab === 'hoje' && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontFamily: 'var(--cx-font-mono)', fontSize: '0.66rem', color: '#0369a1' }}>ROTINA ATIVA</div>
                      <h2 className="cx-truncate" style={{ margin: '0.15rem 0 0', fontSize: '1.12rem' }}>{activePatient?.name}</h2>
                    </div>
                    <ConicRing
                      percent={kcalPct}
                      value={activePatient?.kcalConsumed}
                      unit="kcal"
                      gradient="from-macros"
                      size={66}
                    />
                  </div>

                  {/* Faixa 7 dias */}
                  <div className="cx-week-strip">
                    {WEEK_DAYS.map((d, idx) => (
                      <button
                        key={d.day}
                        type="button"
                        className={`cx-day-pill${selectedDayIdx === idx ? ' is-active' : ''}`}
                        onClick={() => setSelectedDayIdx(idx)}
                      >
                        <div style={{ fontSize: '0.62rem' }}>{d.short}</div>
                        <strong style={{ fontSize: '0.78rem' }}>{d.day}</strong>
                      </button>
                    ))}
                  </div>

                  {/* Macros */}
                  <MacroPillGroup macros={activePatient?.macros} />

                  {/* Hidratação Interativa */}
                  <div className="cx-card cx-card-tight">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem' }}>
                      <strong style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.86rem' }}>
                        <Droplets size={15} color="#0284c7" aria-hidden="true" /> Hidratação
                      </strong>
                      <span className="cx-tabular" style={{ fontSize: '0.8rem', fontWeight: 700 }}>
                        {activePatient?.waterMl} / {activePatient?.waterGoal} ml
                      </span>
                    </div>
                    <div style={{ height: '7px', borderRadius: '999px', background: '#e2e8f0', overflow: 'hidden', marginBottom: '0.65rem' }}>
                      <div style={{ width: `${waterPct}%`, height: '100%', background: 'linear-gradient(90deg, #00aaff, #0070d1)', borderRadius: '999px', transition: 'width 0.25s ease' }} />
                    </div>
                    <button
                      type="button"
                      className="cx-btn cx-btn-primary"
                      style={{ width: '100%' }}
                      onClick={() => addWater(activePatient?.id, 250)}
                    >
                      + 250 ml de água (+10 XP)
                    </button>
                  </div>

                  {/* Missões de Check-in */}
                  <div className="cx-card cx-card-tight" style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
                    <strong style={{ fontSize: '0.86rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Flame size={15} color="#ea580c" aria-hidden="true" /> Missões de Refeição (+35 XP)
                    </strong>
                    {(activePatient?.meals || []).map((m) => (
                      <div
                        key={m.id}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          gap: '0.45rem',
                          paddingTop: '0.5rem',
                          borderTop: '1px solid var(--cx-line)'
                        }}
                      >
                        <div style={{ minWidth: 0 }}>
                          <div className="cx-truncate" style={{ fontSize: '0.8rem', fontWeight: 600 }}>{m.name}</div>
                          <div style={{ fontSize: '0.68rem', color: 'var(--cx-muted)' }}>{m.slot} · {m.kcal} kcal</div>
                        </div>
                        <button
                          type="button"
                          className={`cx-btn cx-btn-sm ${m.checked ? 'cx-btn-accent' : 'cx-btn-ghost'}`}
                          style={{ whiteSpace: 'nowrap', flexShrink: 0 }}
                          onClick={() => toggleMealCheckin(activePatient?.id, m.id)}
                        >
                          {m.checked ? 'Concluído ✓' : 'Check-in'}
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Sono + Cronômetro Foco */}
                  <div className="cx-card cx-card-tight" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
                    <div>
                      <strong style={{ fontSize: '0.82rem', display: 'block' }}>Sono &amp; Treino Foco</strong>
                      <span className="cx-tabular" style={{ fontSize: '0.72rem', color: 'var(--cx-muted)' }}>
                        Timer: {formatClock(focusSec)}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                      <select
                        aria-label="Registrar duração do sono"
                        className="cx-select"
                        style={{ width: 'auto', minHeight: '34px', fontSize: '0.74rem', padding: '0.25rem 0.5rem' }}
                        value={activePatient?.sleepHours}
                        onChange={(e) => updateSleep(activePatient?.id, e.target.value, 'Qualidade sincronizada')}
                      >
                        <option value="5h 45m">5h 45m</option>
                        <option value="6h 30m">6h 30m</option>
                        <option value="7h 30m">7h 30m</option>
                        <option value="7h 45m">7h 45m</option>
                        <option value="8h 15m">8h 15m</option>
                      </select>
                      <button
                        type="button"
                        className="cx-btn cx-btn-sm cx-btn-primary"
                        onClick={() => setFocusRunning((r) => !r)}
                        aria-label="Alternar timer de foco"
                      >
                        {focusRunning ? <Pause size={13} /> : <Play size={13} />}
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* ABA 2: NUTRIBOT CONVERSACIONAL + MODO VOZ */}
              {tab === 'bot' && (
                <>
                  <div className="cx-card cx-card-tight" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
                    <div>
                      <strong style={{ fontSize: '0.88rem', display: 'block' }}>NutrIA + Voz</strong>
                      <span style={{ fontSize: '0.72rem', color: 'var(--cx-muted)' }}>Tira-dúvidas e trocas TACO 24h</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                      <VoiceWaveVisualizer active={voiceActive} />
                      <button
                        type="button"
                        className={`cx-btn cx-btn-sm cx-btn-pill ${voiceActive ? 'cx-btn-accent' : 'cx-btn-primary'}`}
                        onClick={handleVoiceDemo}
                      >
                        <Mic size={13} aria-hidden="true" />
                        <span>{voiceActive ? 'Ouvindo...' : 'Voz IA'}</span>
                      </button>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                    {[
                      'Posso trocar arroz por batata doce?',
                      'Como está minha meta de água?',
                      'Sugira lanche rápido proteico'
                    ].map((q) => (
                      <button
                        key={q}
                        type="button"
                        className="cx-btn cx-btn-sm cx-btn-ghost cx-btn-pill"
                        onClick={() => sendBotMessage(activePatient?.id, q, 'patient')}
                      >
                        {q}
                      </button>
                    ))}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {(activePatient?.chatHistory || []).map((msg) => (
                      <div
                        key={msg.id}
                        style={{
                          alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                          maxWidth: '88%',
                          padding: '0.62rem 0.85rem',
                          borderRadius: msg.sender === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                          background: msg.sender === 'user' ? '#0f172a' : '#ffffff',
                          color: msg.sender === 'user' ? '#ffffff' : '#0f172a',
                          border: msg.sender === 'user' ? '0' : '1px solid rgba(15,23,42,0.08)',
                          fontSize: '0.8rem',
                          boxShadow: '0 4px 12px -6px rgba(15,23,42,0.12)'
                        }}
                      >
                        <div>{msg.text}</div>
                        <div style={{ fontSize: '0.64rem', opacity: 0.7, marginTop: '0.2rem' }}>{msg.time}</div>
                      </div>
                    ))}
                  </div>

                  <form onSubmit={handleChatSubmit} style={{ display: 'flex', gap: '0.4rem' }}>
                    <label htmlFor="cx-patient-chat-input" style={{ position: 'absolute', left: '-9999px' }}>
                      Perguntar à NutrIA
                    </label>
                    <input
                      id="cx-patient-chat-input"
                      className="cx-input"
                      placeholder="Pergunte à NutrIA sobre trocas ou metas..."
                      value={chatText}
                      onChange={(e) => setChatText(e.target.value)}
                    />
                    <button type="submit" className="cx-btn cx-btn-primary" aria-label="Enviar para NutrIA">
                      <Send size={14} aria-hidden="true" />
                    </button>
                  </form>
                </>
              )}

              {/* ABA 3: SCANNER FOTO IA DO PRATO */}
              {tab === 'foto' && (
                <>
                  <div>
                    <div style={{ fontFamily: 'var(--cx-font-mono)', fontSize: '0.66rem', color: '#0369a1' }}>VISÃO COMPUTACIONAL TACO</div>
                    <h2 style={{ margin: '0.15rem 0 0', fontSize: '1.12rem' }}>Scanner de Prato por Foto IA</h2>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                    {PHOTO_DISH_SAMPLES.map((dish) => (
                      <button
                        key={dish.id}
                        type="button"
                        className={`cx-btn cx-btn-sm cx-btn-pill ${selectedDish.id === dish.id && !uploadedPreviewUrl ? 'cx-btn-primary' : 'cx-btn-ghost'}`}
                        onClick={() => {
                          if (uploadedPreviewUrl) {
                            URL.revokeObjectURL(uploadedPreviewUrl);
                            setUploadedPreviewUrl('');
                          }
                          triggerDishScan(dish);
                        }}
                      >
                        {dish.label}
                      </button>
                    ))}
                  </div>

                  <label className="cx-btn cx-btn-sm cx-btn-ghost" style={{ cursor: 'pointer' }}>
                    <Camera size={14} aria-hidden="true" />
                    <span>Enviar foto do seu dispositivo</span>
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        triggerDishScan(
                          {
                            id: 'custom-upload',
                            label: file.name.replace(/\.[^.]+$/, '').slice(0, 28),
                            subtitle: 'Foto real analisada · Estimativa NutrIA',
                            kcal: 560,
                            protein: 42,
                            carbs: 54,
                            fats: 16,
                            adherencePct: 94,
                            items: ['Proteína magra · ~150g', 'Carboidrato complexo · ~120g', 'Vegetais & fibras · ~130g']
                          },
                          URL.createObjectURL(file)
                        );
                      }}
                    />
                  </label>

                  <div className="cx-scan-stage">
                    {isScanning && <div className="cx-scan-beam" aria-hidden="true" />}
                    {uploadedPreviewUrl ? (
                      <img src={uploadedPreviewUrl} alt="Prévia do prato enviado" style={{ width: '100%', height: '130px', objectFit: 'cover', borderRadius: '12px', marginBottom: '0.55rem' }} />
                    ) : (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                        <strong style={{ fontSize: '0.9rem' }}>{selectedDish.label}</strong>
                        <span className="cx-tag cx-tag-ok">{isScanning ? 'Escaneando...' : `${selectedDish.adherencePct}% meta`}</span>
                      </div>
                    )}
                    <div style={{ fontSize: '0.75rem', color: 'var(--cx-muted)', marginBottom: '0.5rem' }}>{selectedDish.subtitle}</div>
                    {scanReady && (
                      <ul style={{ margin: 0, paddingLeft: '1rem', fontSize: '0.78rem', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                        {selectedDish.items.map((it) => <li key={it}>{it}</li>)}
                      </ul>
                    )}
                  </div>

                  <button
                    type="button"
                    className="cx-btn cx-btn-accent"
                    disabled={isScanning}
                    onClick={() => logPhotoMealCheckin(activePatient?.id, selectedDish)}
                  >
                    Registrar Prato no Diário (+35 XP)
                  </button>
                </>
              )}

              {/* ABA 4: PLANO ALIMENTAR, SUBSTITUIÇÃO TACO, TREINOS & RECEITAS */}
              {tab === 'plano' && (
                <>
                  <div className="cx-card cx-card-tight" style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
                    <strong style={{ fontSize: '0.88rem' }}>Cardápio Sincronizado ({activePatient?.kcalTarget} kcal)</strong>
                    {(activePatient?.meals || []).map((m, idx) => {
                      const swapSample = TACO_SUBSTITUTIONS[idx % TACO_SUBSTITUTIONS.length];
                      return (
                        <details key={m.id} style={{ borderTop: '1px solid var(--cx-line)', paddingTop: '0.45rem', fontSize: '0.8rem' }}>
                          <summary style={{ cursor: 'pointer', fontWeight: 600 }}>
                            {m.slot} — {m.name}
                          </summary>
                          <p style={{ margin: '0.35rem 0', color: 'var(--cx-muted)', fontSize: '0.75rem' }}>
                            {m.prep} ({m.kcal} kcal · P {m.protein}g · C {m.carbs}g · G {m.fats}g)
                          </p>
                          <button
                            type="button"
                            className="cx-btn cx-btn-sm cx-btn-ghost cx-btn-pill"
                            style={{ fontSize: '0.7rem', padding: '0.24rem 0.55rem' }}
                            onClick={() =>
                              sendBotMessage(
                                activePatient?.id,
                                `Quero substituir "${m.name}" respeitando TACO (${swapSample.swap})`,
                                'patient'
                              )
                            }
                          >
                            <ArrowLeftRight size={11} aria-hidden="true" />
                            <span>Trocar via TACO</span>
                          </button>
                        </details>
                      );
                    })}
                  </div>

                  <div className="cx-card cx-card-tight" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <strong style={{ fontSize: '0.88rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Dumbbell size={15} color="#0369a1" aria-hidden="true" /> Periodização de Treino (+20 XP)
                    </strong>
                    {(activePatient?.workouts || []).map((w) => (
                      <button
                        key={w.id}
                        type="button"
                        onClick={() => toggleWorkoutExercise(activePatient?.id, w.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '0.5rem',
                          padding: '0.55rem 0.7rem',
                          borderRadius: '14px',
                          border: '1px solid var(--cx-line)',
                          background: w.done ? '#ecfdf5' : '#ffffff',
                          textAlign: 'left',
                          cursor: 'pointer'
                        }}
                      >
                        <div>
                          <strong style={{ fontSize: '0.8rem', display: 'block' }}>{w.title}</strong>
                          <span style={{ fontSize: '0.7rem', color: 'var(--cx-muted)' }}>{w.detail}</span>
                        </div>
                        <span className={`cx-tag ${w.done ? 'cx-tag-ok' : 'cx-tag-info'}`}>
                          {w.done ? <Check size={12} /> : 'Fazer'}
                        </span>
                      </button>
                    ))}
                  </div>

                  <div className="cx-card cx-card-tight" style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                    <strong style={{ fontSize: '0.86rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                      <ChefHat size={15} color="#0369a1" aria-hidden="true" /> Receitas Bônus da Nutri ({(recipes || []).length})
                    </strong>
                    {(recipes || []).slice(0, 3).map((rec) => (
                      <div key={rec.id} style={{ borderTop: '1px solid var(--cx-line)', paddingTop: '0.4rem', fontSize: '0.75rem' }}>
                        <strong style={{ display: 'block' }}>{rec.title} · {rec.kcal} kcal</strong>
                        <span style={{ color: 'var(--cx-muted)' }}>{rec.prep}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* ABA 5: EVOLUÇÃO, EXAMES & LGPD */}
              {tab === 'evolucao' && (
                <>
                  <WeightEvolutionChart
                    history={activePatient?.weightHistory}
                    targetWeight={activePatient?.targetWeight}
                  />
                  <div className="cx-card cx-card-tight" style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                    <strong style={{ fontSize: '0.86rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                      <FileText size={14} color="#0369a1" aria-hidden="true" /> Exames &amp; Parecer da Nutri
                    </strong>
                    {(activePatient?.labExams || []).map((ex) => (
                      <div key={ex.name} style={{ borderTop: '1px solid var(--cx-line)', paddingTop: '0.4rem', fontSize: '0.75rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.4rem' }}>
                          <strong>{ex.name}</strong>
                          <span className="cx-tag cx-tag-info">{ex.value}</span>
                        </div>
                        {ex.parecer && (
                          <div style={{ marginTop: '0.2rem', color: '#0369a1', fontWeight: 500 }}>
                            Parecer: {ex.parecer}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="cx-card cx-card-tight" style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                    <strong style={{ fontSize: '0.84rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Lock size={14} color="#6d28d9" aria-hidden="true" /> Privacidade &amp; Dados (LGPD)
                    </strong>
                    <div style={{ fontSize: '0.74rem', color: 'var(--cx-muted)' }}>
                      Adesão atual em <strong>{activePatient?.adherence}%</strong> ({activePatient?.streak} dias seguidos). Portabilidade JSON ativa no app real.
                    </div>
                    <button
                      type="button"
                      className="cx-btn cx-btn-sm cx-btn-ghost cx-btn-pill"
                      onClick={() => toast.success(`Pacote LGPD de ${activePatient?.shortName} pronto para exportação JSON!`)}
                    >
                      <Download size={12} aria-hidden="true" />
                      <span>Exportar Meus Dados (JSON)</span>
                    </button>
                  </div>
                </>
              )}
            </div>

            <nav className="cx-phone-nav" aria-label="Abas do App do Paciente">
              {[
                { id: 'hoje', label: 'Hoje', icon: Home },
                { id: 'bot', label: 'NutrIA', icon: Bot },
                { id: 'foto', label: 'Foto IA', icon: Camera },
                { id: 'plano', label: 'Plano', icon: Utensils },
                { id: 'evolucao', label: 'Evolução', icon: TrendingUp }
              ].map((t) => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.id}
                    type="button"
                    className={`cx-phone-tab${tab === t.id ? ' is-active' : ''}`}
                    onClick={() => setTab(t.id)}
                  >
                    <Icon size={16} aria-hidden="true" />
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* COLUNA DIREITA: NutrIA COMPANION + TELEMETRIA AO VIVO */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem', minWidth: 0 }}>
          <div className="cx-iridescent-stage">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.6rem', marginBottom: '0.6rem' }}>
              <div>
                <span className="cx-eyebrow">SUA COMPANHEIRA DE ROTINA</span>
                <h1 className="cx-display-md" style={{ marginTop: '0.2rem' }}>NutrIA × App do Paciente</h1>
              </div>

              <button
                type="button"
                className="cx-btn cx-btn-primary cx-btn-sm cx-btn-pill"
                onClick={() => onNavigate('/clarix/crm')}
              >
                <LayoutDashboard size={14} aria-hidden="true" />
                <span>Conferir no Cockpit do Nutri →</span>
              </button>
            </div>

            <ClarixRobotCanvas
              mood={botMood}
              pulseKey={botPulseCount}
              height={285}
              onRobotClick={() =>
                setBotMood(
                  'celebrating',
                  `Continue firme, ${activePatient?.shortName}! Você está com ${activePatient?.xp} XP e ${activePatient?.waterMl} ml hidratados hoje.`
                )
              }
            />

            <div className="cx-speech-bubble" style={{ marginTop: '0.55rem' }}>
              <div style={{ fontFamily: 'var(--cx-font-mono)', fontSize: '0.66rem', color: '#0369a1', marginBottom: '0.2rem' }}>
                NutrIA · ACOMPANHAMENTO ATIVO ({activePatient?.shortName})
              </div>
              <div>{botSpeech}</div>
            </div>
          </div>

          <article className="cx-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
              <label htmlFor="patient-switcher-right" style={{ fontSize: '0.84rem', fontWeight: 600 }}>
                Simular outro paciente no celular:
              </label>
              <select
                id="patient-switcher-right"
                className="cx-select"
                style={{ width: 'auto', minWidth: '220px' }}
                value={activePatient?.id}
                onChange={(e) => selectPatient(e.target.value)}
              >
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.shortName} · {p.adherence}% ({p.xp} XP)
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--cx-line)', paddingTop: '0.7rem' }}>
              <strong style={{ fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                <Activity size={15} color="#0070d1" aria-hidden="true" /> Eventos Recebidos pelo CRM
              </strong>
              <span className="cx-tag cx-tag-ok">SYNC REAL</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
              {syncLog.slice(0, 6).map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: '0.6rem',
                    fontSize: '0.8rem',
                    paddingTop: '0.45rem',
                    borderTop: '1px solid var(--cx-line)'
                  }}
                >
                  <span>{item.text}</span>
                  <span className="cx-tabular" style={{ fontFamily: 'var(--cx-font-mono)', fontSize: '0.7rem', color: 'var(--cx-muted)', flexShrink: 0 }}>
                    {item.time}
                  </span>
                </div>
              ))}
            </div>
          </article>
        </div>
      </div>
    </div>
  );
}
