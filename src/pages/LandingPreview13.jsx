import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Terminal,
  Square,
  Shield,
  Activity,
  Zap,
  CornerDownRight,
  Check
} from 'lucide-react';
import PreviewSwitcher from '../components/landing/PreviewSwitcher';
import { landingData } from '../components/landing/landingData';
import '../landing-v2.css';
import '../landing-previews.css';

export default function LandingPreview13() {
  const navigate = useNavigate();

  return (
    <div style={{ background: '#000000', minHeight: '100vh', color: '#ffffff', fontFamily: '"Space Grotesk", -apple-system, sans-serif', padding: '0 0 120px' }}>
      <PreviewSwitcher current="p13" />

      {/* Infinite Top Ticker */}
      <div style={{ background: '#ffffff', color: '#000000', padding: '8px 0', overflow: 'hidden', whiteSpace: 'nowrap', fontWeight: 800, fontSize: '0.85rem', letterSpacing: '0.15em', textTransform: 'uppercase', borderBottom: '2px solid #fff' }}>
        <div style={{ display: 'inline-block', animation: 'marquee 20s linear infinite' }}>
          [NUTRIVVO OS // v2.4] • RADAR DE ABANDONO ATIVO • SECRETÁRIA TELEGRAM 24/7 • VISÃO COMPUTACIONAL DE PRATOS • PRESCRIÇÃO CLÍNICA EM 3 SEGUNDOS • CRN/CFN COMPLIANT • LGPD SAÚDE • ZERO PLANILHAS • 
          [NUTRIVVO OS // v2.4] • RADAR DE ABANDONO ATIVO • SECRETÁRIA TELEGRAM 24/7 • VISÃO COMPUTACIONAL DE PRATOS • PRESCRIÇÃO CLÍNICA EM 3 SEGUNDOS •
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '40px auto 0', padding: '0 24px' }}>
        
        {/* Brutalist Label */}
        <div style={{ display: 'inline-block', border: '2px solid #ffffff', padding: '6px 14px', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '24px' }}>
          LAYOUT 13 // SWISS MODERNIST BRUTALISM
        </div>

        {/* Hero Title */}
        <h1 style={{ fontSize: 'clamp(3rem, 7vw, 6rem)', fontWeight: 900, lineHeight: 0.95, textTransform: 'uppercase', letterSpacing: '-0.03em', margin: '0 0 32px' }}>
          O FIM DEFINITIVO <br />
          DO ABANDONO DE <br />
          <span style={{ background: '#ffffff', color: '#000000', padding: '0 12px' }}>
            PACIENTES.
          </span>
        </h1>

        {/* Subtitle / Manifesto */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px', borderTop: '2px solid #ffffff', borderBottom: '2px solid #ffffff', padding: '32px 0', marginBottom: '60px' }}>
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', color: '#888', marginBottom: '8px' }}>
              // TESE CLÍNICA
            </div>
            <p style={{ fontSize: '1.2rem', lineHeight: 1.4, margin: 0, fontWeight: 500 }}>
              {landingData.description}
            </p>
          </div>

          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', color: '#888', marginBottom: '8px' }}>
              // RESULTADO IMEDIATO
            </div>
            <p style={{ fontSize: '1.2rem', lineHeight: 1.4, margin: 0, fontWeight: 500 }}>
              Mais do que um prontuário. Um sistema operacional que calcula calorias por visão de foto no Telegram e protege a receita da sua clínica.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <button
              onClick={() => navigate('/cadastro')}
              style={{
                background: '#ffffff',
                color: '#000000',
                border: 'none',
                padding: '20px 32px',
                fontSize: '1.1rem',
                fontWeight: 900,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px'
              }}
            >
              Iniciar Teste Sem Cartão <ArrowRight size={20} />
            </button>
          </div>
        </div>

        {/* Grid Brutalista dos 4 Pilares Centrais */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', border: '2px solid #ffffff', marginBottom: '60px' }}>
          
          <div style={{ borderRight: '2px solid #ffffff', borderBottom: '2px solid #ffffff', padding: '36px' }}>
            <div style={{ fontSize: '3rem', fontWeight: 900, lineHeight: 1, marginBottom: '20px' }}>01</div>
            <div style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#888', marginBottom: '8px' }}>
              TELEMETRIA
            </div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, textTransform: 'uppercase', margin: '0 0 12px' }}>
              Radar de Abandono
            </h3>
            <p style={{ color: '#aaa', fontSize: '0.95rem', lineHeight: 1.5, margin: 0 }}>
              Algoritmo preditivo que rastreia desvio de comportamento no 4º dia e dispara alerta clínico antes da desistência do paciente.
            </p>
          </div>

          <div style={{ borderRight: '2px solid #ffffff', borderBottom: '2px solid #ffffff', padding: '36px' }}>
            <div style={{ fontSize: '3rem', fontWeight: 900, lineHeight: 1, marginBottom: '20px' }}>02</div>
            <div style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#888', marginBottom: '8px' }}>
              AUTOMAÇÃO
            </div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, textTransform: 'uppercase', margin: '0 0 12px' }}>
              Secretária Telegram
            </h3>
            <p style={{ color: '#aaa', fontSize: '0.95rem', lineHeight: 1.5, margin: 0 }}>
              Atendimento 24/7 com IA que tira dúvidas pontuais sobre substituições da dieta sem vazar seu WhatsApp privado.
            </p>
          </div>

          <div style={{ borderRight: '2px solid #ffffff', borderBottom: '2px solid #ffffff', padding: '36px' }}>
            <div style={{ fontSize: '3rem', fontWeight: 900, lineHeight: 1, marginBottom: '20px' }}>03</div>
            <div style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#888', marginBottom: '8px' }}>
              COMPUTER VISION
            </div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, textTransform: 'uppercase', margin: '0 0 12px' }}>
              Scanner de Prato
            </h3>
            <p style={{ color: '#aaa', fontSize: '0.95rem', lineHeight: 1.5, margin: 0 }}>
              O paciente fotografa a refeição e o sistema identifica proteínas, carboidratos e calorias automaticamente.
            </p>
          </div>

          <div style={{ borderBottom: '2px solid #ffffff', padding: '36px' }}>
            <div style={{ fontSize: '3rem', fontWeight: 900, lineHeight: 1, marginBottom: '20px' }}>04</div>
            <div style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#888', marginBottom: '8px' }}>
              SPEED WORKFLOW
            </div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, textTransform: 'uppercase', margin: '0 0 12px' }}>
              Prescrição em 3s
            </h3>
            <p style={{ color: '#aaa', fontSize: '0.95rem', lineHeight: 1.5, margin: 0 }}>
              Cálculo exato de TMB e geração instantânea de cardápios com receitas completas e lista de compras.
            </p>
          </div>
        </div>

        {/* Tabela de Especificações Técnicas Brutalistas */}
        <div style={{ border: '2px solid #ffffff', padding: '32px', marginBottom: '60px' }}>
          <div style={{ fontSize: '1.1rem', fontWeight: 900, textTransform: 'uppercase', marginBottom: '24px', letterSpacing: '0.08em' }}>
            // ESPECIFICAÇÕES DA INFRAESTRUTURA CLÍNICA
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
            <div style={{ borderLeft: '2px solid #fff', paddingLeft: '16px' }}>
              <div style={{ fontSize: '0.75rem', color: '#888', textTransform: 'uppercase' }}>Criptografia</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>AES-256 bits</div>
            </div>
            <div style={{ borderLeft: '2px solid #fff', paddingLeft: '16px' }}>
              <div style={{ fontSize: '0.75rem', color: '#888', textTransform: 'uppercase' }}>Conformidade Legal</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>LGPD Saúde & CFN</div>
            </div>
            <div style={{ borderLeft: '2px solid #fff', paddingLeft: '16px' }}>
              <div style={{ fontSize: '0.75rem', color: '#888', textTransform: 'uppercase' }}>Taxa Média de Retenção</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>89.2% de Adesão</div>
            </div>
            <div style={{ borderLeft: '2px solid #fff', paddingLeft: '16px' }}>
              <div style={{ fontSize: '0.75rem', color: '#888', textTransform: 'uppercase' }}>Disponibilidade SLA</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>99.9% Uptime</div>
            </div>
          </div>
        </div>

        {/* Final Action Statement */}
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <button
            onClick={() => navigate('/cadastro')}
            style={{
              background: '#ffffff',
              color: '#000000',
              border: 'none',
              padding: '24px 48px',
              fontSize: '1.25rem',
              fontWeight: 900,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              cursor: 'pointer'
            }}
          >
            Acessar o Nutrivvo OS Agora
          </button>
        </div>

      </div>
    </div>
  );
}

