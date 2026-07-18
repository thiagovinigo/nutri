import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, User, ShieldCheck, Activity, Bot, Zap, BrainCircuit } from 'lucide-react';
import '../landing.css';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing-body">
      {/* Background Orbs */}
      <div className="landing-bg-glow"></div>
      <div className="landing-bg-glow-2"></div>

      <div className="landing-container">
        
        {/* Navbar */}
        <nav className="landing-nav">
          <div className="landing-logo">Vytal</div>
          <div className="landing-nav-links">
            <a href="#features" className="landing-link">Recursos</a>
            <button 
              className="l-btn l-btn-secondary" 
              style={{ padding: '10px 20px', fontSize: '0.9rem' }}
              onClick={() => navigate('/login')}
            >
              Entrar
            </button>
          </div>
        </nav>

        {/* Hero */}
        <section className="landing-hero">
          <div className="landing-hero-badge">
            <Zap size={16} /> O Futuro da Nutrição Digital
          </div>
          <h1 className="landing-title">
            A única clínica digital que une <br/>
            <span>CRM, Gamificação e IA.</span>
          </h1>
          <p className="landing-subtitle">
            Transforme pacientes em fãs. O Vytal combina uma gestão clínica poderosa para o nutricionista com uma experiência gamificada e imersiva para o paciente.
          </p>
          
          <div className="landing-btn-group">
            <button className="l-btn l-btn-primary" onClick={() => navigate('/cadastro?role=nutricionista')}>
              <ShieldCheck size={20} />
              Sou Nutricionista (Criar CRM)
            </button>
            <button className="l-btn l-btn-secondary" onClick={() => navigate('/cadastro?role=paciente')}>
              <User size={20} />
              Sou Paciente (Entrar no App)
            </button>
          </div>

          <div className="landing-mockup-dual">
            <img src="/screen_nutri.png" alt="CRM Interface" className="mockup-nutri" />
            <img src="/screen_paciente.png" alt="Patient App Interface" className="mockup-paciente" />
          </div>
        </section>

        {/* Features */}
        <section id="features" className="landing-features">
          <h2 className="landing-section-title">Por que escolher o Vytal?</h2>
          
          <div className="landing-grid">
            <div className="landing-feature-card">
              <div className="landing-feature-icon icon-blue">
                <BrainCircuit />
              </div>
              <h3 className="landing-feature-title">Inteligência de Cohorts</h3>
              <p className="landing-feature-desc">
                Pare de perder pacientes no meio do plano. Nosso CRM prevê automaticamente quem está com risco de abandono com base na frequência de login e ofensiva, permitindo ação rápida.
              </p>
            </div>
            
            <div className="landing-feature-card">
              <div className="landing-feature-icon icon-pink">
                <Activity />
              </div>
              <h3 className="landing-feature-title">Alta Gamificação</h3>
              <p className="landing-feature-desc">
                Dietas monótonas são coisa do passado. Seu paciente constrói uma 'Ofensiva Diária', acumula XP a cada refeição no horário e visualiza gráficos circulares de meta cumprida.
              </p>
            </div>
            
            <div className="landing-feature-card">
              <div className="landing-feature-icon icon-purple">
                <Bot />
              </div>
              <h3 className="landing-feature-title">Vytal Bot (IA)</h3>
              <p className="landing-feature-desc">
                Uma assistente médica que conhece o peso, a dieta e a hidratação do paciente. Ela tira dúvidas 24/7 sobre substituições do cardápio sem alucinar, poupando o tempo do nutricionista.
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="landing-cta">
          <div className="landing-cta-box">
            <h2 className="landing-cta-title">Pronto para a nova era da nutrição?</h2>
            <div className="landing-btn-group">
              <button className="l-btn l-btn-primary" onClick={() => navigate('/cadastro?role=nutricionista')}>
                Começar Grátis <ArrowRight size={20} />
              </button>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
