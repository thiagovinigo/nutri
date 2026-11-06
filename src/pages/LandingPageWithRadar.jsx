import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Menu,
  X,
  BrainCircuit,
  Bot,
  ShieldCheck,
  HeartPulse,
  Dumbbell,
  Stethoscope,
  Scan,
  Flame,
  Utensils,
  Lock,
  CheckCircle2,
  ZoomIn,
  Sparkles
} from 'lucide-react';
import { landingData } from '../components/landing/landingData';
import '../landing.css';
import '../landing-v2.css';
import '../landing-previews.css';

export default function LandingPageWithRadar() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeLightboxImg, setActiveLightboxImg] = useState(null);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('[data-w-reveal]').forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="wellness-body">

      {/* ======================================================== */}
      {/* 1. NAVBAR OFICIAL LIMPA                                  */}
      {/* ======================================================== */}
      <nav className="w-nav">
        <div className="w-logo wellness-heading" style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
          <img src="/mark.svg" alt="" aria-hidden="true" />
          Nutrivvo.
        </div>

        <button
          className="w-nav-toggle"
          aria-label={isMenuOpen ? 'Fechar menu' : 'Abrir menu'}
          aria-expanded={isMenuOpen}
          onClick={() => setIsMenuOpen(v => !v)}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <div className={`w-nav-links${isMenuOpen ? ' is-open' : ''}`}>
          <a href="#features" onClick={() => setIsMenuOpen(false)}>Recursos</a>
          <a href="#benefits" onClick={() => setIsMenuOpen(false)}>Benefícios</a>
          <a href="#seguranca" onClick={() => setIsMenuOpen(false)}>Segurança</a>
          <button
            className="w-btn w-btn-outline"
            style={{ padding: '8px 20px' }}
            onClick={() => navigate('/login')}
          >
            Entrar
          </button>
          <button
            className="w-btn w-btn-primary"
            style={{ padding: '8px 20px', fontSize: '0.9rem' }}
            onClick={() => navigate('/cadastro?role=nutricionista')}
          >
            Criar Clínica Grátis
          </button>
        </div>
      </nav>

      {/* ======================================================== */}
      {/* 2. HERO SECTION COM MOCKUPS NITIDOS E ZOOM OTIMIZADO     */}
      {/* ======================================================== */}
      <section className="w-hero">
        <div className="w-hero-bg-glow"></div>
        <div className="w-hero-content">
          <div className="w-hero-badge" data-w-reveal>
            Feito para nutricionista autônomo e clínica pequena
          </div>
          <h1 className="w-hero-title wellness-heading" data-w-reveal>
            Seu paciente some entre consultas. <br />
            <span>O Nutrivvo não deixa.</span>
          </h1>
          <p className="w-hero-subtitle" data-w-reveal>
            Enquanto você atende, a IA do Nutrivvo confirma consulta, cobra a foto do prato e avisa quando um paciente está perdendo o foco — tudo pelo Telegram. Do outro lado, um app gamificado com XP e ofensiva diária faz o paciente voltar sozinho, todo dia.
          </p>
          <div className="w-hero-actions" data-w-reveal>
            <button className="w-btn w-btn-primary" onClick={() => navigate('/cadastro?role=nutricionista')}>
              Criar Clínica Grátis <ArrowRight size={20} />
            </button>
            <button className="w-btn w-btn-outline" onClick={() => navigate('/login')}>
              Acessar Minha Conta
            </button>
          </div>
          <p className="w-hero-trust" data-w-reveal style={{ marginTop: '18px' }}>
            Sem cartão de crédito · Pronto em 2 minutos
          </p>
        </div>

        {/* Dual Mockups Aprimorados: CRM Focado + Smartphone Frame Nítido */}
        <div className="w-mockup-container" data-w-reveal style={{ perspective: 'none', position: 'relative' }}>
          
          {/* Mockup CRM: Desktop Window com Zoom Inteligente */}
          <div
            className="w-mock-card w-mock-nutri"
            style={{
              position: 'relative',
              cursor: 'pointer',
              background: '#090d16',
              border: '1px solid #1e293b',
              padding: '12px',
              borderRadius: '20px',
              boxShadow: '0 25px 60px rgba(15, 23, 42, 0.15)',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease'
            }}
            onClick={() => setActiveLightboxImg({
              src: '/screen_nutri.png',
              title: 'CRM Clínico do Nutricionista',
              subtitle: 'Visão Geral: Pacientes Ativos, Consultas Hoje, Alerta de Desânimo e Receita Prevista'
            })}
          >
            {/* Header da Janela estilo macOS */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 10px 10px', borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: '8px' }}>
              <div style={{ display: 'flex', gap: '6px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444' }} />
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f59e0b' }} />
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981' }} />
              </div>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>nutrivvo.com.br/nutri · Painel Clínico</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#a855f7', fontSize: '0.72rem', fontWeight: 700 }}>
                <ZoomIn size={14} /> Clique para ampliar
              </div>
            </div>

            <div style={{ borderRadius: '10px', overflow: 'hidden' }}>
              <img
                src="/screen_nutri_focus.png"
                alt="CRM Nutricionista"
                style={{ width: '100%', height: 'auto', display: 'block' }}
              />
            </div>
          </div>

          {/* Mockup Smartphone: App Paciente em Moldura Realista com Crop Sem Bordas Pretas */}
          <div
            className="w-mock-card w-mock-paciente"
            style={{
              cursor: 'pointer',
              background: '#0a0e1a',
              border: '4px solid #1e293b',
              borderRadius: '36px',
              padding: '8px',
              boxShadow: '-15px 30px 60px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(255,255,255,0.1)',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease'
            }}
            onClick={() => setActiveLightboxImg({
              src: '/screen_paciente_focus.png',
              title: 'App do Paciente (PWA)',
              subtitle: 'Check-in de refeições, metas de hidratação, sono e evolução em tempo real'
            })}
          >
            {/* Notch do Celular */}
            <div style={{ display: 'flex', justifyContent: 'center', padding: '4px 0 8px' }}>
              <div style={{ width: '48px', height: '5px', background: '#334155', borderRadius: '9999px' }} />
            </div>

            <div style={{ borderRadius: '24px', overflow: 'hidden' }}>
              <img
                src="/screen_paciente_focus.png"
                alt="App Paciente"
                style={{ width: '100%', height: 'auto', display: 'block' }}
              />
            </div>
          </div>

        </div>
      </section>

      {/* ======================================================== */}
      {/* 3. FEATURES SECTION: GRID 2 + 2 + 3 (OS PRINTS DO USUÁRIO) */}
      {/* ======================================================== */}
      <section id="features" className="w-features" style={{ background: '#fafbfc', backgroundImage: 'linear-gradient(to right, rgba(226, 232, 240, 0.6) 1px, transparent 1px), linear-gradient(to bottom, rgba(226, 232, 240, 0.6) 1px, transparent 1px)', backgroundSize: '28px 28px', padding: '100px 5%' }}>
        <div className="w-section-header" data-w-reveal>
          <h2 className="w-section-title wellness-heading">Por que escolher o Nutrivvo?</h2>
          <p className="w-section-desc">Ferramentas desenhadas especificamente para aumentar a adesão ao plano alimentar e reduzir o tempo de consulta.</p>
        </div>

        {/* Grid Sintonizado com os 2 Prints Exatos */}
        <div style={{ maxWidth: '1160px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>

          {/* LINHA 1 (50% / 50%): Radar Preditivo + Secretária Telegram (Print 1) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }} data-w-reveal>
            
            {/* Card 1: Radar de Abandono (Telemetria Preditiva) */}
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '22px', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <BrainCircuit size={24} color="#7c3aed" />
                  </div>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#7c3aed', background: '#ede9fe', padding: '4px 10px', borderRadius: '6px', letterSpacing: '0.04em' }}>
                    TELEMETRIA PREDITIVA
                  </span>
                </div>

                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', margin: '0 0 8px' }}>
                  Identifica o desânimo antes do cancelamento
                </h3>
                <p style={{ color: '#64748b', fontSize: '0.92rem', lineHeight: 1.5, margin: '0 0 24px' }}>
                  O CRM analisa automaticamente a sequência de dias ativos, abertura do app e fotos enviadas para acender alertas em verde, amarelo ou vermelho antes mesmo do paciente sumir.
                </p>
              </div>

              {/* Visual do Radar + Lista de Pacientes */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', alignItems: 'center' }}>
                <div
                  className="v2-radar-hud"
                  style={{
                    width: '180px',
                    height: '180px',
                    margin: '0 auto',
                    background: 'radial-gradient(circle, rgba(124, 58, 237, 0.08) 0%, #f8fafc 75%)',
                    borderColor: '#cbd5e1',
                    boxShadow: '0 0 25px rgba(124, 58, 237, 0.12), inset 0 0 15px rgba(124, 58, 237, 0.06)'
                  }}
                >
                  <div className="v2-radar-sweep" />
                  <div className="v2-radar-circle-inner" style={{ borderColor: 'rgba(124, 58, 237, 0.25)' }} />
                  <div className="v2-radar-circle-center" style={{ borderColor: 'rgba(124, 58, 237, 0.4)' }} />
                  <div className="v2-radar-line-h" style={{ background: 'rgba(124, 58, 237, 0.2)' }} />
                  <div className="v2-radar-line-v" style={{ background: 'rgba(124, 58, 237, 0.2)' }} />
                  <div className="v2-radar-blip v2-blip-critical" />
                  <div className="v2-radar-blip v2-blip-warning" />
                  <div className="v2-radar-blip v2-blip-safe" />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '10px 14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0f172a' }}>Camila Silva</span>
                      <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#ef4444' }}>Risco Alto (82%)</span>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Inativa há 4 dias · Sem foto do almoço</span>
                  </div>

                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '10px 14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0f172a' }}>Rodrigo Mendes</span>
                      <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#d97706' }}>Atenção (45%)</span>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Perdeu a ofensiva no fim de semana</span>
                  </div>

                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '10px 14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0f172a' }}>Beatriz Costa</span>
                      <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#059669' }}>Adesão Segura (98%)</span>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>14 dias ativos seguidos no diário</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: Secretária Virtual no Telegram */}
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '22px', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
                  <Bot size={24} color="#0284c7" />
                </div>

                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  SECRETÁRIA VIRTUAL NO TELEGRAM
                </span>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', margin: '6px 0 8px' }}>
                  Atendimento e lembretes 24h sem usar seu número pessoal
                </h3>
                <p style={{ color: '#64748b', fontSize: '0.92rem', lineHeight: 1.5, margin: '0 0 24px' }}>
                  Confirma e remarca consultas, cobra a foto da refeição no horário certo e acolhe o paciente automaticamente, sem misturar conversas de trabalho com sua vida pessoal no WhatsApp.
                </p>
              </div>

              {/* Chat Balão */}
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '16px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ alignSelf: 'flex-start', background: '#ffffff', color: '#1e293b', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '10px 14px', fontSize: '0.82rem', maxWidth: '92%', lineHeight: 1.4 }}>
                  💬 <strong>NutriBot:</strong> Olá Marcos! Sua consulta com a Dra. Mariana está confirmada para amanhã às 14:00. Posso reservar seu horário?
                </div>
                <div style={{ alignSelf: 'flex-end', background: '#059669', color: '#ffffff', borderRadius: '12px', padding: '10px 14px', fontSize: '0.82rem', maxWidth: '90%', lineHeight: 1.4 }}>
                  Confirmadíssimo! Acabei de almoçar, segue a foto do prato 🍲
                </div>
                <div style={{ alignSelf: 'flex-start', background: '#ffffff', color: '#1e293b', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '10px 14px', fontSize: '0.82rem', maxWidth: '92%', lineHeight: 1.4 }}>
                  🎯 <strong>Prato Detectado:</strong> 150g Frango grelhado + Arroz + Salada. Registrado no diário com sucesso! +35 XP creditados na sua ofensiva.
                </div>
              </div>
            </div>

          </div>

          {/* LINHA 2 (50% / 50%): Foto IA + Gamificação (Print 2 superior) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }} data-w-reveal>
            
            {/* Card 3: Check-in Diário por Foto */}
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '22px', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#cffafe', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
                  <Scan size={24} color="#0891b2" />
                </div>

                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0891b2', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  CHECK-IN DIÁRIO POR FOTO
                </span>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', margin: '6px 0 8px' }}>
                  Reconhecimento de pratos por visão de IA
                </h3>
                <p style={{ color: '#64748b', fontSize: '0.92rem', lineHeight: 1.5, margin: '0 0 20px' }}>
                  O paciente fotografa a refeição e a IA identifica os alimentos visíveis e estima porções de forma acolhedora, creditando XP no diário sem digitação manual cansativa.
                </p>
              </div>

              <div style={{ position: 'relative', borderRadius: '14px', overflow: 'hidden', height: '170px' }}>
                <img
                  src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80"
                  alt="Prato"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div className="swiss-laser-scan" />
                <div style={{ position: 'absolute', bottom: '10px', left: '10px', right: '10px', background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(8px)', color: '#fff', padding: '8px 12px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>🥗 Bowl Mediterrâneo: Salada, Tomate, Tofu, Milho (IA Visual)</span>
                </div>
              </div>
            </div>

            {/* Card 4: Alta Gamificação & XP */}
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '22px', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#ffedd5', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
                  <Flame size={24} color="#ea580c" />
                </div>

                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#ea580c', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  ALTA GAMIFICAÇÃO & XP
                </span>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', margin: '6px 0 8px' }}>
                  Ofensiva Diária e Metas Interativas
                </h3>
                <p style={{ color: '#64748b', fontSize: '0.92rem', lineHeight: 1.5, margin: '0 0 20px' }}>
                  Dietas monótonas são do passado. O paciente constrói uma Ofensiva Diária de dias seguidos, acumula XP a cada refeição e visualiza a própria transformação com orgulho.
                </p>
              </div>

              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#ea580c' }}>
                    🔥 14 DIAS SEGUIDOS
                  </span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#7c3aed' }}>
                    +120 XP Hoje
                  </span>
                </div>
                <div style={{ width: '100%', height: '10px', background: '#e2e8f0', borderRadius: '9999px', overflow: 'hidden' }}>
                  <div style={{ width: '78%', height: '100%', background: 'linear-gradient(90deg, #ea580c, #f59e0b)' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', fontSize: '0.78rem', color: '#64748b' }}>
                  <span>Nível 4: Foco Blindado</span>
                  <span>Meta: 1.200 XP</span>
                </div>
              </div>
            </div>

          </div>

          {/* LINHA 3 (33.3% / 33.3% / 33.3%): Cardápios + Treinos + Exames (Print 2 inferior) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }} data-w-reveal>
            
            {/* Card 5: Cardápios completos em segundos */}
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '28px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
                  <Utensils size={20} color="#059669" />
                </div>
                <h4 style={{ fontSize: '1.18rem', fontWeight: 800, color: '#0f172a', margin: '0 0 8px' }}>
                  Cardápios completos em segundos
                </h4>
                <p style={{ color: '#64748b', fontSize: '0.88rem', lineHeight: 1.5, margin: '0 0 16px' }}>
                  Gere cardápios completos de 1 a 30 dias considerando exames laboratoriais, restrições e medicamentos — com receitas de verdade, nome apetitoso e modo de preparo.
                </p>
              </div>
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '10px 14px', borderRadius: '10px', fontSize: '0.8rem', color: '#065f46', fontWeight: 700 }}>
                ⚡ Cardápio personalizado de 2.100 kcal pronto com lista de compras em 2.4s.
              </div>
            </div>

            {/* Card 6: Periodização física alinhada à dieta */}
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '28px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
                  <Dumbbell size={20} color="#7c3aed" />
                </div>
                <h4 style={{ fontSize: '1.18rem', fontWeight: 800, color: '#0f172a', margin: '0 0 8px' }}>
                  Periodização física alinhada à dieta
                </h4>
                <p style={{ color: '#64748b', fontSize: '0.88rem', lineHeight: 1.5, margin: '0 0 16px' }}>
                  Periodização completa calibrada pelo aporte calórico da dieta prescrita, exames laboratoriais e restrições articulares — pronta sem sair do atendimento.
                </p>
              </div>
              <div style={{ background: '#ede9fe', border: '1px solid #ddd6fe', padding: '10px 14px', borderRadius: '10px', fontSize: '0.8rem', color: '#5b21b6', fontWeight: 700 }}>
                💪 Divisão A/B e periodização metabólica calibrada com volume semanal ideal.
              </div>
            </div>

            {/* Card 7: Leitura laboratorial com parecer clínico */}
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '28px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#fdf2f8', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
                  <Stethoscope size={20} color="#db2777" />
                </div>
                <h4 style={{ fontSize: '1.18rem', fontWeight: 800, color: '#0f172a', margin: '0 0 8px' }}>
                  Leitura laboratorial com parecer clínico
                </h4>
                <p style={{ color: '#64748b', fontSize: '0.88rem', lineHeight: 1.5, margin: '0 0 16px' }}>
                  Anexe os exames laboratoriais do paciente e receba uma análise clínica completa, com evolução comparada ao histórico anterior e parecer pronto para orientar a conduta.
                </p>
              </div>
              <div style={{ background: '#fce7f3', border: '1px solid #fbcfe8', padding: '10px 14px', borderRadius: '10px', fontSize: '0.8rem', color: '#9d174d', fontWeight: 700 }}>
                🧪 Leitura de marcadores metabólicos (Glicemia, Insulina, Ferritina, Perfil Lipídico).
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ======================================================== */}
      {/* 4. VALUE PROPS COM IMAGENS FOCADAS E LIGHTBOX DE ZOOM    */}
      {/* ======================================================== */}
      <section id="benefits" className="w-value-prop">
        <div className="w-value-content" data-w-reveal>
          <ShieldCheck size={40} color="var(--w-primary)" style={{ marginBottom: '24px' }} />
          <h2 className="w-section-title wellness-heading">Gestão que trabalha por você</h2>
          <p className="w-section-desc">
            Monte o cardápio com a IA em minutos: descreva o paciente e receba um plano de 1 a 30 dias pronto, com receita de verdade e modo de preparo — não uma lista de alimentos. Acompanhe se ele está bebendo água e seguindo a dieta em tempo real, sem precisar perguntar.
          </p>
        </div>
        
        {/* CRM em Foco com Moldura de Janela e Atalho de Zoom */}
        <div
          className="w-value-image"
          data-w-reveal
          style={{ cursor: 'pointer' }}
          onClick={() => setActiveLightboxImg({
            src: '/screen_nutri.png',
            title: 'Gestão Completa do Consultório',
            subtitle: 'Dashboard clínico com métricas de retenção, agenda integrada e cardápios inteligentes'
          })}
        >
          <div style={{ background: '#090d16', border: '1px solid #1e293b', borderRadius: '20px', padding: '12px', boxShadow: '0 20px 50px rgba(0,0,0,0.12)', transition: 'transform 0.25s ease' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: '8px' }}>
              <div style={{ display: 'flex', gap: '6px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }} />
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b' }} />
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
              </div>
              <span style={{ fontSize: '0.72rem', color: '#a855f7', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ZoomIn size={13} /> Clique para ver em alta definição
              </span>
            </div>
            <img
              src="/screen_nutri_focus.png"
              alt="CRM Management"
              style={{ width: '100%', height: 'auto', borderRadius: '8px', display: 'block' }}
            />
          </div>
        </div>
      </section>

      {/* Engajamento Incomparável: Smartphone Nítido com Moldura */}
      <section className="w-value-prop reverse" style={{ paddingTop: 0 }}>
        <div className="w-value-content" data-w-reveal>
          <HeartPulse size={40} color="var(--w-primary)" style={{ marginBottom: '24px' }} />
          <h2 className="w-section-title wellness-heading">Engajamento incomparável</h2>
          <p className="w-section-desc">
            O aplicativo do paciente não é apenas um leitor de dieta. É uma experiência motivadora. Toda vez que ele conclui uma refeição no horário, o cérebro recebe uma dose de dopamina pelo avanço — e cada marco vira um cartão pra compartilhar nos stories, marcando sua clínica.
          </p>
        </div>
        
        <div
          className="w-value-image"
          data-w-reveal
          style={{ display: 'flex', justifyContent: 'center', cursor: 'pointer' }}
          onClick={() => setActiveLightboxImg({
            src: '/screen_paciente_focus.png',
            title: 'App Gamificado do Paciente',
            subtitle: 'Registro de refeições por foto, copos de água, metas diárias e streaks'
          })}
        >
          <div style={{ maxWidth: '340px', width: '100%', background: '#0a0e1a', border: '4px solid #1e293b', borderRadius: '36px', padding: '10px', boxShadow: '0 25px 60px rgba(0,0,0,0.2)', transition: 'transform 0.25s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'center', padding: '4px 0 8px' }}>
              <div style={{ width: '48px', height: '5px', background: '#334155', borderRadius: '9999px' }} />
            </div>
            <img
              src="/screen_paciente_focus.png"
              alt="Patient Engagement"
              style={{ width: '100%', height: 'auto', borderRadius: '22px', display: 'block' }}
            />
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 5. SEGURANÇA E PRIVACIDADE DE DADOS (LGPD / CFN)         */}
      {/* ======================================================== */}
      <section id="seguranca" style={{ maxWidth: '1080px', margin: '0 auto 80px', padding: '0 20px' }} data-w-reveal>
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '24px', padding: '40px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 32px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Lock size={24} color="#7c3aed" />
            </div>
            <h3 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', margin: '0 0 8px' }}>
              Segurança e Privacidade de Dados
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.95rem', margin: 0 }}>
              Em conformidade com a LGPD e resoluções éticas do CFN.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px' }}>
              <CheckCircle2 size={20} color="#059669" style={{ marginBottom: '10px' }} />
              <h5 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#0f172a', margin: '0 0 4px' }}>Isolamento Estrito (RLS)</h5>
              <p style={{ color: '#64748b', fontSize: '0.84rem', margin: 0 }}>Nenhum nutricionista tem acesso aos dados, cardápios ou exames de outro colega.</p>
            </div>
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px' }}>
              <CheckCircle2 size={20} color="#059669" style={{ marginBottom: '10px' }} />
              <h5 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#0f172a', margin: '0 0 4px' }}>Criptografia de Ponta</h5>
              <p style={{ color: '#64748b', fontSize: '0.84rem', margin: 0 }}>Tráfego HTTPS com TLS 1.3 e dados clínicos salvos sob criptografia AES-256.</p>
            </div>
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px' }}>
              <CheckCircle2 size={20} color="#059669" style={{ marginBottom: '10px' }} />
              <h5 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#0f172a', margin: '0 0 4px' }}>Soberania do Paciente</h5>
              <p style={{ color: '#64748b', fontSize: '0.84rem', margin: 0 }}>Direito à exportação integral e exclusão definitiva a qualquer momento.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 6. CTA FINAL ORIGINAL                                    */}
      {/* ======================================================== */}
      <section className="w-cta">
        <div className="w-cta-inner" data-w-reveal>
          <h2 className="w-cta-title wellness-heading">Pare de perder paciente no silêncio entre consultas.</h2>
          <p className="w-cta-desc">Junte-se aos nutricionistas que automatizaram o acompanhamento entre consultas.</p>
          <button
            className="w-btn"
            style={{ background: 'white', color: 'var(--w-primary-dark)', padding: '16px 36px', fontSize: '1.1rem', fontWeight: 800 }}
            onClick={() => navigate('/cadastro?role=nutricionista')}
          >
            Começar Grátis <ArrowRight size={20} />
          </button>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 7. FOOTER ORIGINAL                                       */}
      {/* ======================================================== */}
      <footer className="w-footer">
        <p>© 2026 Nutrivvo. Todos os direitos reservados.</p>
        <p className="w-footer-trust">Dados de cada paciente isolados por regra própria no banco — nenhum nutricionista vê paciente de outro.</p>
      </footer>

      {/* ======================================================== */}
      {/* 8. LIGHTBOX MODAL: ZOOM AO CLICAR EM QUALQUER TELA       */}
      {/* ======================================================== */}
      {activeLightboxImg && (
        <div
          onClick={() => setActiveLightboxImg(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(10, 15, 26, 0.88)',
            backdropFilter: 'blur(10px)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '1100px',
              width: '100%',
              background: '#0f172a',
              border: '1px solid #334155',
              borderRadius: '24px',
              overflow: 'hidden',
              boxShadow: '0 30px 80px rgba(0,0,0,0.6)',
              position: 'relative'
            }}
          >
            {/* Header do Modal */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid #1e293b' }}>
              <div>
                <h4 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 800, margin: '0 0 2px' }}>
                  {activeLightboxImg.title}
                </h4>
                <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0 }}>
                  {activeLightboxImg.subtitle}
                </p>
              </div>
              <button
                onClick={() => setActiveLightboxImg(null)}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: 'none',
                  color: '#fff',
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Imagem em Alta Resolução */}
            <div style={{ padding: '20px', maxHeight: '80vh', overflowY: 'auto', display: 'flex', justifyContent: 'center', background: '#090d16' }}>
              <img
                src={activeLightboxImg.src}
                alt={activeLightboxImg.title}
                style={{ maxWidth: '100%', height: 'auto', borderRadius: '12px', border: '1px solid #1e293b' }}
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
