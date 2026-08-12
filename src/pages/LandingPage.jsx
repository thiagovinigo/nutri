import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Menu, X, BrainCircuit, Activity, Bot, ShieldCheck, HeartPulse, Dumbbell, Stethoscope, Wallet } from 'lucide-react';
import '../landing.css';

export default function LandingPage() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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

      {/* Navbar */}
      <nav className="w-nav">
        <div className="w-logo wellness-heading">
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
          <button
            className="w-btn w-btn-outline"
            style={{ padding: '8px 20px' }}
            onClick={() => navigate('/login')}
          >
            Entrar
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="w-hero">
        <div className="w-hero-bg-glow"></div>
        <div className="w-hero-content">
          <div className="w-hero-badge" data-w-reveal>Feito para nutricionista autônomo e clínica pequena</div>
          <h1 className="w-hero-title wellness-heading" data-w-reveal>
            Seu paciente some do WhatsApp. <br/>
            <span>O Nutrivvo não deixa.</span>
          </h1>
          <p className="w-hero-subtitle" data-w-reveal>
            Enquanto você atende, a IA do Nutrivvo confirma consulta, cobra a foto do prato e avisa quando um paciente está perdendo o foco — tudo pelo WhatsApp. Do outro lado, um app gamificado com XP e ofensiva diária faz o paciente voltar sozinho, todo dia.
          </p>
          <div className="w-hero-actions" data-w-reveal>
            <button className="w-btn w-btn-primary" onClick={() => navigate('/cadastro?role=nutricionista')}>
              Criar Clínica Grátis <ArrowRight size={20} />
            </button>
          </div>
          <p className="w-hero-trust" data-w-reveal>
            Sem cartão de crédito · Pronto em 2 minutos ·{' '}
            <a href="/cadastro?role=paciente" onClick={(e) => { e.preventDefault(); navigate('/cadastro?role=paciente'); }}>
              sou paciente
            </a>
          </p>
        </div>

        {/* Dual Mockups */}
        <div className="w-mockup-container" data-w-reveal>
          <div className="w-mock-card w-mock-nutri">
            <img src="/screen_nutri.png" alt="CRM Nutricionista" />
          </div>
          <div className="w-mock-card w-mock-paciente">
            <img src="/screen_paciente.png" alt="App Paciente" />
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="w-features">
        <div className="w-section-header" data-w-reveal>
          <h2 className="w-section-title wellness-heading">Por que escolher o Nutrivvo?</h2>
          <p className="w-section-desc">Ferramentas desenhadas especificamente para aumentar a adesão ao plano alimentar e reduzir o tempo de consulta.</p>
        </div>

        <div className="w-grid">
          <div className="w-feature-card" data-w-reveal>
            <div className="w-icon-box"><Bot size={28} /></div>
            <h3 className="w-feature-title wellness-heading">Secretária Virtual no WhatsApp</h3>
            <p className="w-feature-desc">Confirma e remarca consulta, cobra a foto da refeição e avisa você quando um paciente dá sinais de estar perdendo o foco — tudo automático, sem ocupar o seu número pessoal.</p>
          </div>

          <div className="w-feature-card" data-w-reveal>
            <div className="w-icon-box"><Activity size={28} /></div>
            <h3 className="w-feature-title wellness-heading">Alta Gamificação</h3>
            <p className="w-feature-desc">Dietas monótonas são do passado. O paciente constrói uma 'Ofensiva Diária', acumula XP a cada refeição e visualiza o progresso visualmente.</p>
          </div>

          <div className="w-feature-card" data-w-reveal>
            <div className="w-icon-box"><BrainCircuit size={28} /></div>
            <h3 className="w-feature-title wellness-heading">Radar de Abandono</h3>
            <p className="w-feature-desc">O CRM identifica automaticamente quem está sumindo, olhando pra sequência de dias ativos e uso do app — sem você precisar perguntar.</p>
          </div>

          <div className="w-feature-card" data-w-reveal>
            <div className="w-icon-box"><ShieldCheck size={28} /></div>
            <h3 className="w-feature-title wellness-heading">Dietas com IA (de verdade)</h3>
            <p className="w-feature-desc">Gere cardápios completos de 1 a 30 dias considerando exames, restrições e medicamentos — com receitas de verdade, nome apetitoso e modo de preparo, não só uma lista de alimentos.</p>
          </div>

          <div className="w-feature-card" data-w-reveal>
            <div className="w-icon-box"><Dumbbell size={28} /></div>
            <h3 className="w-feature-title wellness-heading">Ficha de Treino com IA</h3>
            <p className="w-feature-desc">Periodização completa calibrada pela dieta prescrita, exames laboratoriais e restrições físicas do paciente — pronta em segundos, sem sair da consulta.</p>
          </div>

          <div className="w-feature-card" data-w-reveal>
            <div className="w-icon-box"><Stethoscope size={28} /></div>
            <h3 className="w-feature-title wellness-heading">Análise de Exames com IA</h3>
            <p className="w-feature-desc">Anexe os exames do paciente e receba uma análise clínica completa, com evolução comparada ao histórico e parecer pronto para orientar a conduta.</p>
          </div>

          <div className="w-feature-card" data-w-reveal>
            <div className="w-icon-box"><Wallet size={28} /></div>
            <h3 className="w-feature-title wellness-heading">Financeiro Integrado</h3>
            <p className="w-feature-desc">Controle planos, vencimentos e cobranças direto no CRM, com lembretes automáticos de renovação enviados por WhatsApp.</p>
          </div>

          <div className="w-feature-card" data-w-reveal>
            <div className="w-icon-box"><HeartPulse size={28} /></div>
            <h3 className="w-feature-title wellness-heading">Check-in Diário por Foto</h3>
            <p className="w-feature-desc">O paciente fotografa a refeição e a IA identifica os alimentos e estima as porções — registro rápido, sem digitação, direto no diário alimentar.</p>
          </div>
        </div>
      </section>

      {/* Value Prop 1 */}
      <section id="benefits" className="w-value-prop">
        <div className="w-value-content" data-w-reveal>
          <ShieldCheck size={40} color="var(--w-primary)" style={{marginBottom: '24px'}} />
          <h2 className="w-section-title wellness-heading">Gestão que trabalha por você</h2>
          <p className="w-section-desc">
            Monte o cardápio com a IA em minutos: descreva o paciente e receba um plano de 1 a 30 dias pronto, com receita de verdade e modo de preparo — não uma lista de alimentos. Acompanhe se ele está bebendo água e seguindo a dieta em tempo real, sem precisar perguntar.
          </p>
        </div>
        <div className="w-value-image" data-w-reveal>
          <img src="/screen_nutri.png" alt="CRM Management" />
        </div>
      </section>

      {/* Value Prop 2 */}
      <section className="w-value-prop reverse" style={{paddingTop: 0}}>
        <div className="w-value-content" data-w-reveal>
          <HeartPulse size={40} color="var(--w-primary)" style={{marginBottom: '24px'}} />
          <h2 className="w-section-title wellness-heading">Engajamento incomparável</h2>
          <p className="w-section-desc">
            O aplicativo do paciente não é apenas um leitor de dieta. É uma experiência motivadora. Toda vez que ele conclui uma refeição no horário, o cérebro recebe uma dose de dopamina pelo avanço — e cada marco vira um cartão pra compartilhar nos stories, marcando sua clínica.
          </p>
        </div>
        <div className="w-value-image" data-w-reveal>
          <img src="/screen_paciente.png" alt="Patient Engagement" />
        </div>
      </section>

      {/* CTA */}
      <section className="w-cta">
        <div className="w-cta-inner" data-w-reveal>
          <h2 className="w-cta-title wellness-heading">Pare de perder paciente no silêncio do WhatsApp.</h2>
          <p className="w-cta-desc">Junte-se aos nutricionistas que automatizaram o acompanhamento entre consultas.</p>
          <button
            className="w-btn"
            style={{background: 'white', color: 'var(--w-primary-dark)', padding: '16px 32px', fontSize: '1.1rem'}}
            onClick={() => navigate('/cadastro?role=nutricionista')}
          >
            Começar Grátis <ArrowRight size={20} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-footer">
        <p>© 2026 Nutrivvo. Todos os direitos reservados.</p>
        <p className="w-footer-trust">Dados de cada paciente isolados por regra própria no banco — nenhum nutricionista vê paciente de outro.</p>
      </footer>

    </div>
  );
}
