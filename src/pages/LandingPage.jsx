import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, BrainCircuit, Activity, Bot, ShieldCheck, HeartPulse } from 'lucide-react';
import '../landing.css';

export default function LandingPage() {
  const navigate = useNavigate();

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
        <div className="w-logo wellness-heading">Vytal.</div>
        <div className="w-nav-links">
          <a href="#features">Recursos</a>
          <a href="#benefits">Benefícios</a>
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
          <div className="w-hero-badge" data-w-reveal>O Futuro da Nutrição Digital</div>
          <h1 className="w-hero-title wellness-heading" data-w-reveal>
            A única clínica digital que une <br/>
            <span>CRM, Gamificação e IA.</span>
          </h1>
          <p className="w-hero-subtitle" data-w-reveal>
            Transforme pacientes em fãs. O Vytal combina uma gestão clínica poderosa para você com uma experiência gamificada e imersiva para o seu paciente.
          </p>
          <div className="w-hero-actions" data-w-reveal>
            <button className="w-btn w-btn-primary" onClick={() => navigate('/cadastro?role=nutricionista')}>
              Criar Clínica Grátis <ArrowRight size={20} />
            </button>
            <button className="w-btn w-btn-outline" onClick={() => navigate('/cadastro?role=paciente')}>
              Sou Paciente
            </button>
          </div>
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
          <h2 className="w-section-title wellness-heading">Por que escolher o Vytal?</h2>
          <p className="w-section-desc">Ferramentas desenhadas especificamente para aumentar a adesão ao plano alimentar e reduzir o tempo de consulta.</p>
        </div>

        <div className="w-grid">
          <div className="w-feature-card" data-w-reveal>
            <div className="w-icon-box"><BrainCircuit size={28} /></div>
            <h3 className="w-feature-title wellness-heading">Inteligência de Cohorts</h3>
            <p className="w-feature-desc">Nosso CRM prevê automaticamente quem está com risco de abandono com base na frequência do paciente no app, permitindo uma ação rápida.</p>
          </div>
          
          <div className="w-feature-card" data-w-reveal>
            <div className="w-icon-box"><Activity size={28} /></div>
            <h3 className="w-feature-title wellness-heading">Alta Gamificação</h3>
            <p className="w-feature-desc">Dietas monótonas são do passado. O paciente constrói uma 'Ofensiva Diária', acumula XP a cada refeição e visualiza o progresso visualmente.</p>
          </div>
          
          <div className="w-feature-card" data-w-reveal>
            <div className="w-icon-box"><Bot size={28} /></div>
            <h3 className="w-feature-title wellness-heading">Vytal Bot (IA Clínica)</h3>
            <p className="w-feature-desc">Uma assistente treinada que conhece o peso, dieta e evolução do paciente. Ela responde dúvidas sobre substituições, poupando seu WhatsApp.</p>
          </div>
        </div>
      </section>

      {/* Value Prop 1 */}
      <section id="benefits" className="w-value-prop">
        <div className="w-value-content" data-w-reveal>
          <ShieldCheck size={40} color="var(--w-primary)" style={{marginBottom: '24px'}} />
          <h2 className="w-section-title wellness-heading">Gestão que trabalha por você</h2>
          <p className="w-section-desc">
            Cadastre planos alimentares em minutos usando nossos templates inteligentes. Acompanhe se o paciente está bebendo água e seguindo a dieta em tempo real, sem precisar perguntar.
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
            O aplicativo do paciente não é apenas um leitor de dieta. É uma experiência motivadora. Toda vez que ele conclui uma refeição no horário, o cérebro recebe uma dose de dopamina pelo avanço.
          </p>
        </div>
        <div className="w-value-image" data-w-reveal>
          <img src="/screen_paciente.png" alt="Patient Engagement" />
        </div>
      </section>

      {/* CTA */}
      <section className="w-cta">
        <div className="w-cta-inner" data-w-reveal>
          <h2 className="w-cta-title wellness-heading">Pronto para a nova era da nutrição?</h2>
          <p className="w-cta-desc">Junte-se à plataforma que está revolucionando o acompanhamento clínico.</p>
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
        <p>© 2026 Vytal. Todos os direitos reservados.</p>
      </footer>

    </div>
  );
}
