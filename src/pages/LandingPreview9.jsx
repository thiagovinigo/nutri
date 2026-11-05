import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  XCircle,
  ArrowRight,
  ShieldCheck,
  Zap,
  TrendingUp,
  Clock,
  Sparkles,
  Users,
  Brain,
  HelpCircle
} from 'lucide-react';
import PreviewSwitcher from '../components/landing/PreviewSwitcher';
import { landingData } from '../components/landing/landingData';
import '../landing-v2.css';
import '../landing-previews.css';

export default function LandingPreview9() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('geral');

  const categories = [
    { id: 'geral', label: 'Visão Geral do Consultório' },
    { id: 'retencao', label: 'Retenção & Abandono' },
    { id: 'dietas', label: 'Cardápios & Prescrição' },
    { id: 'atendimento', label: 'Comunicação com Paciente' }
  ];

  const battleItems = {
    geral: [
      {
        aspect: 'Tempo gasto por consulta (anamnese + plano)',
        oldWay: '45 a 60 minutos digitando em software lento ou Excel',
        newWay: '12 a 15 minutos com anamnese guiada e IA de síntese clínica',
        nutrivvoAdvantage: 'Economia de 3.5 horas/dia'
      },
      {
        aspect: 'Centralização de Prontuário, Fotos e Bioimpedância',
        oldWay: 'Pastas soltas no Google Drive, WhatsApp e papéis',
        newWay: 'Linha do tempo clínica unificada com comparativo fotográfico lado a lado',
        nutrivvoAdvantage: 'Zero arquivos perdidos'
      },
      {
        aspect: 'Controle de Planos e Cobranças Recorrentes',
        oldWay: 'Cobrança manual por Pix, cobranças esquecidas e calotes',
        newWay: 'Gestão financeira com lembrete amigável automatizado',
        nutrivvoAdvantage: '+22% na taxa de pontualidade'
      }
    ],
    retencao: [
      {
        aspect: 'Como você sabe que o paciente vai desistir?',
        oldWay: 'Só descobre quando ele não responde mais ou falta ao retorno',
        newWay: 'Radar IA avisa no 4º dia de silêncio antes do paciente sumir',
        nutrivvoAdvantage: 'Queda de 72% na evasão'
      },
      {
        aspect: 'Acompanhamento do diário entre as consultas',
        oldWay: 'O paciente anota num caderno que esquece em casa',
        newWay: 'Envio de foto do prato no Telegram com contagem de calorias e macros por IA',
        nutrivvoAdvantage: 'Engajamento diário contínuo'
      },
      {
        aspect: 'Gamificação e Motivação do Paciente',
        oldWay: 'Nenhuma. Depende 100% da força de vontade do paciente',
        newWay: 'Ofensiva diária (streak), missões e conquistas estilo Duolingo',
        nutrivvoAdvantage: 'Adesão comprovada de 89%'
      }
    ],
    dietas: [
      {
        aspect: 'Cálculo de TMB, GET e Distribuição de Macros',
        oldWay: 'Calculadora manual + tabelas TACO/IBGE desatualizadas',
        newWay: 'Cálculo instantâneo com Harris-Benedict, Cunningham ou Katch-McArdle',
        nutrivvoAdvantage: 'Precisão matemática em 1 clique'
      },
      {
        aspect: 'Criação do Plano Alimentar Completo',
        oldWay: 'Copiar e colar templates genéricos no Word por 30 minutos',
        newWay: 'Cardápios clínicos com receitas reais gerados em 3 segundos pela IA',
        nutrivvoAdvantage: 'Plano 100% personalizado'
      },
      {
        aspect: 'Lista de Compras do Paciente',
        oldWay: 'O próprio paciente tenta decifrar a lista no supermercado',
        newWay: 'Lista de compras semanal gerada automaticamente no app do paciente',
        nutrivvoAdvantage: 'Zero atrito no mercado'
      }
    ],
    atendimento: [
      {
        aspect: 'Dúvidas e Substituições de Alimentos à Noite ou Fim de Semana',
        oldWay: 'Mensagens no seu WhatsApp pessoal às 23h roubando seu descanso',
        newWay: 'Secretária Virtual IA no Telegram responde substituições autorizadas 24/7',
        nutrivvoAdvantage: 'Paz mental e limites claros'
      },
      {
        aspect: 'Lembretes de Hidratação e Refeição',
        oldWay: 'Você precisa lembrar de mandar mensagem se tiver tempo',
        newWay: 'Disparos automáticos e humanizados pelo bot do Telegram',
        nutrivvoAdvantage: 'Suporte VIP sem esforço'
      },
      {
        aspect: 'Interpretação de Exames de Sangue',
        oldWay: 'Análise manual item por item em laudos de 8 páginas',
        newWay: 'Upload de PDF/foto com cruzamento automático de marcadores subclínicos',
        nutrivvoAdvantage: 'Diagnóstico 5x mais ágil'
      }
    ]
  };

  return (
    <div style={{ background: '#07090e', minHeight: '100vh', color: '#f1f5f9', padding: '60px 20px 120px' }}>
      <PreviewSwitcher current="p9" />

      {/* Hero Header */}
      <div style={{ maxWidth: '1060px', margin: '0 auto 50px', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '6px 16px', borderRadius: '9999px', color: '#f87171', fontSize: '0.8rem', fontWeight: 800, marginBottom: '20px' }}>
          <Sparkles size={14} />
          <span>LAYOUT 9 // BATTLECARD COMPARATIVO (ANTES VS NUTRIVVO)</span>
        </div>

        <h1 className="v2-heading" style={{ fontSize: 'clamp(2.3rem, 5vw, 3.8rem)', color: '#fff', margin: '0 0 20px', lineHeight: 1.15 }}>
          Por que as melhores nutricionistas <br />
          <span style={{ background: 'linear-gradient(135deg, #f87171, #fb923c, #facc15)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            estão abandonando planilhas e softwares lentos?
          </span>
        </h1>

        <p style={{ color: '#94a3b8', fontSize: '1.15rem', maxWidth: '720px', margin: '0 auto 36px', lineHeight: 1.6 }}>
          Compare lado a lado o método tradicional de consultório contra a nova infraestrutura de IA e automação do Nutrivvo.
        </p>

        {/* Big Numbers Comparison Bar */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', maxWidth: '960px', margin: '0 auto 40px' }}>
          <div style={{ background: 'rgba(239, 68, 68, 0.06)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: '16px', padding: '20px', textAlign: 'center' }}>
            <div style={{ color: '#ef4444', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '4px' }}>Método Antigo</div>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: '#fca5a5' }}>48% Evasão</div>
            <div style={{ color: '#94a3b8', fontSize: '0.82rem' }}>de pacientes somem no 1º mês</div>
          </div>

          <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.4)', borderRadius: '16px', padding: '20px', textAlign: 'center', boxShadow: '0 0 25px rgba(16, 185, 129, 0.15)' }}>
            <div style={{ color: '#10b981', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '4px' }}>Com Nutrivvo IA</div>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: '#34d399' }}>9% Evasão</div>
            <div style={{ color: '#a7f3d0', fontSize: '0.82rem' }}>retenção recorde com Radar Ativo</div>
          </div>

          <div style={{ background: 'rgba(56, 189, 248, 0.08)', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: '16px', padding: '20px', textAlign: 'center' }}>
            <div style={{ color: '#38bdf8', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '4px' }}>Tempo Ganho</div>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: '#7dd3fc' }}>+18 Horas</div>
            <div style={{ color: '#bae6fd', fontSize: '0.82rem' }}>livres por semana no consultório</div>
          </div>
        </div>

        {/* Category Tabs */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '32px' }}>
          {categories.map(c => (
            <button
              key={c.id}
              onClick={() => setActiveTab(c.id)}
              style={{
                background: activeTab === c.id ? '#a855f7' : 'rgba(255, 255, 255, 0.05)',
                color: activeTab === c.id ? '#fff' : '#94a3b8',
                border: activeTab === c.id ? '1px solid #c084fc' : '1px solid rgba(255, 255, 255, 0.1)',
                padding: '10px 18px',
                borderRadius: '9999px',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Battlecard Table Matrix */}
      <div style={{ maxWidth: '1060px', margin: '0 auto', background: 'rgba(15, 18, 30, 0.95)', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 25px 50px rgba(0,0,0,0.8)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1.6fr 1.8fr', background: 'rgba(0, 0, 0, 0.6)', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', padding: '20px 24px', fontWeight: 800, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          <div style={{ color: '#94a3b8' }}>Critério Clínico</div>
          <div style={{ color: '#f87171', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <XCircle size={16} /> Software Tradicional / Planilha
          </div>
          <div style={{ color: '#34d399', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CheckCircle2 size={16} /> Nutrivvo OS com IA
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {battleItems[activeTab].map((item, idx) => (
            <div
              key={idx}
              style={{
                display: 'grid',
                gridTemplateColumns: '1.4fr 1.6fr 1.8fr',
                padding: '24px',
                borderBottom: idx < battleItems[activeTab].length - 1 ? '1px solid rgba(255, 255, 255, 0.06)' : 'none',
                background: idx % 2 === 0 ? 'transparent' : 'rgba(255, 255, 255, 0.02)',
                alignItems: 'center',
                gap: '20px'
              }}
            >
              <div>
                <div style={{ fontWeight: 700, color: '#f8fafc', fontSize: '0.98rem', marginBottom: '4px' }}>
                  {item.aspect}
                </div>
                <span style={{ fontSize: '0.75rem', color: '#c084fc', background: 'rgba(168, 85, 247, 0.15)', padding: '3px 8px', borderRadius: '6px', fontWeight: 700 }}>
                  {item.nutrivvoAdvantage}
                </span>
              </div>

              <div style={{ color: '#cbd5e1', fontSize: '0.88rem', lineHeight: 1.5, background: 'rgba(239, 68, 68, 0.04)', padding: '12px 14px', borderRadius: '10px', borderLeft: '3px solid #ef4444' }}>
                {item.oldWay}
              </div>

              <div style={{ color: '#f1f5f9', fontSize: '0.9rem', lineHeight: 1.5, background: 'rgba(16, 185, 129, 0.06)', padding: '12px 14px', borderRadius: '10px', borderLeft: '3px solid #10b981', fontWeight: 600 }}>
                {item.newWay}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Security & Action Footer */}
      <div style={{ maxWidth: '960px', margin: '50px auto 0', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontSize: '0.85rem', marginBottom: '24px' }}>
          <ShieldCheck size={18} color="#10b981" />
          <span>Em conformidade com a LGPD e resoluções do CFN. Criptografia AES-256 de ponta a ponta.</span>
        </div>

        <div>
          <button
            onClick={() => navigate('/cadastro')}
            className="v2-btn v2-btn-cyber"
            style={{ fontSize: '1.1rem', padding: '16px 36px' }}
          >
            Quero Migrar do Modelo Antigo Agora <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
