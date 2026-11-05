import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Radio,
  Bot,
  Scan,
  Flame,
  Utensils,
  Dumbbell,
  Stethoscope,
  Wallet,
  Layers,
  Sparkles,
  Layout,
  Calculator,
  Tv,
  MessageSquareQuote,
  Terminal,
  Sliders,
  Award,
  Eye,
  Command,
  SplitSquareVertical,
  Activity,
  RotateCw
} from 'lucide-react';
import '../landing-v2.css';
import '../landing-previews.css';

export default function PreviewsHub() {
  const navigate = useNavigate();

  const previewList = [
    {
      id: 'preview1',
      num: '01',
      title: 'Bento Spotlight Lab',
      tag: 'Bento Grid & Radar IA',
      desc: 'Showcase dos pilares do produto em grid Bento com efeito spotlight no cursor e simulador do Radar de Abandono 360°.',
      icon: Radio,
      color: '#c084fc',
      path: '/preview1'
    },
    {
      id: 'preview2',
      num: '02',
      title: 'Split-Screen 50/50 Dual Canvas',
      tag: 'Split View & Sticky Pitch',
      desc: 'Layout de duas colunas: pitch clínico fixo à esquerda e vitrine interativa com scroll suave e badges dinâmicas à direita.',
      icon: Layers,
      color: '#38bdf8',
      path: '/preview2'
    },
    {
      id: 'preview3',
      num: '03',
      title: 'Glowing Timeline Journey',
      tag: 'Beam Luminoso & Jornada',
      desc: 'Linha do tempo vertical animada conectando os 5 passos da jornada do paciente: da anamnese ao resgate automático.',
      icon: Scan,
      color: '#06b6d4',
      path: '/preview3'
    },
    {
      id: 'preview4',
      num: '04',
      title: 'Conversational Chat-First',
      tag: 'Telegram Interativo 24h',
      desc: 'Interface centralizada em uma janela funcional de chat simulando o atendimento humanizado da IA com o paciente no Telegram.',
      icon: Bot,
      color: '#38bdf8',
      path: '/preview4'
    },
    {
      id: 'preview5',
      num: '05',
      title: 'Dev Terminal & CLI Suite',
      tag: 'NutriCLI & Hacker Green',
      desc: 'Design em modo terminal com fonte monospace, comandos executáveis (`nutri scan --meal`, `nutri radar --status`) e alta tecnologia.',
      icon: Terminal,
      color: '#22c55e',
      path: '/preview5'
    },
    {
      id: 'preview6',
      num: '06',
      title: 'Clean Light Medical',
      tag: 'Swiss Clean & Alta Confiança',
      desc: 'Versão em fundo branco clínico (Slate & Emerald), tipografia sóbria, tabelas médicas nítidas e credibilidade institucional.',
      icon: Stethoscope,
      color: '#10b981',
      path: '/preview6'
    },
    {
      id: 'preview7',
      num: '07',
      title: 'Nutrivvo OS Desktop',
      tag: 'Janela de Sistema Operacional',
      desc: 'Ambiente desktop simulado com Dock inferior, abas interativas, janela do sistema e atalhos rápidos dos módulos clínicos.',
      icon: Layout,
      color: '#a855f7',
      path: '/preview7'
    },
    {
      id: 'preview8',
      num: '08',
      title: 'Gamified Arcade Quest',
      tag: 'Dopamina & Duolingo Style',
      desc: 'Design de gamificação com barra de XP ao vivo, contador de ofensiva em chamas (streak) e botões de missões diárias clicáveis.',
      icon: Flame,
      color: '#f97316',
      path: '/preview8'
    },
    {
      id: 'preview9',
      num: '09',
      title: 'Battlecard Matrix (Antes vs Nutrivvo)',
      tag: 'Comparativo Lado a Lado',
      desc: 'Desconstrução completa do modelo antigo de planilhas e softwares lentos vs Nutrivvo OS em abas temáticas e números de impacto.',
      icon: Award,
      color: '#ef4444',
      path: '/preview9'
    },
    {
      id: 'preview10',
      num: '10',
      title: 'Simulador de ROI & Auditoria',
      tag: 'Calculadora Financeira Interativa',
      desc: 'Sliders em tempo real para pacientes, ticket e taxa de evasão calculando faturamento resgatado e horas clínicas salvas por mês.',
      icon: Calculator,
      color: '#4ade80',
      path: '/preview10'
    },
    {
      id: 'preview11',
      num: '11',
      title: 'Panoramic 16:9 Cinema 3D',
      tag: 'Perspectiva 3D & Ultra-Wide',
      desc: 'Mockup panorâmico 16:9 em perspectiva tridimensional com badges orbitais flutuantes e troca de telas de telemetria.',
      icon: Tv,
      color: '#38bdf8',
      path: '/preview11'
    },
    {
      id: 'preview12',
      num: '12',
      title: 'Mural de Evidências & Prova Social',
      tag: 'Wall of Love & Validação Clínica',
      desc: 'Mural masonry com depoimentos categorizados por especialidade (esportiva, emagrecimento, clínica), CRNs verificados e selos de segurança.',
      icon: MessageSquareQuote,
      color: '#facc15',
      path: '/preview12'
    },
    {
      id: 'preview13',
      num: '13',
      title: 'Swiss Modernist Brutalism',
      tag: 'Alto Contraste & Manifesto',
      desc: 'Design editorial preto e branco puro, bordas grossas de 2px, tipografia massiva, ticker infinito e declaração técnica direta.',
      icon: Sliders,
      color: '#ffffff',
      path: '/preview13'
    },
    {
      id: 'preview14',
      num: '14',
      title: 'Spatial Glassmorphism (Vision OS)',
      tag: 'Apple Vision & Vidro Fosco',
      desc: 'Orbs de luz ambiental, cartões com blur espacial de 36px, anéis de atividade física e janela flutuante em camadas Z.',
      icon: Eye,
      color: '#c084fc',
      path: '/preview14'
    },
    {
      id: 'preview15',
      num: '15',
      title: 'The Master Ultimate Showcase',
      tag: 'O Ecossistema Completo 21st.dev',
      desc: 'Composição suprema: Hero dinâmico, Bento 3x3 interativo, tabela de preços luminosa com toggle mensal/anual e accordion FAQ.',
      icon: Sparkles,
      color: '#34d399',
      path: '/preview15'
    },
    {
      id: 'preview16',
      num: '16',
      title: 'Command Menu Cmd + K Bar First',
      tag: 'Produtividade Raycast / Linear',
      desc: 'Barra de comando rápida central para busca instantânea e execução de ações clínicas com atalhos de teclado.',
      icon: Command,
      color: '#38bdf8',
      path: '/preview16'
    },
    {
      id: 'preview17',
      num: '17',
      title: 'Interactive Before/After Slider',
      tag: 'Comparativo Deslizante 0-100%',
      desc: 'Slider com divisor de arraste em tempo real para comparar a rotina do consultório e a evolução fotográfica do paciente.',
      icon: SplitSquareVertical,
      color: '#f472b6',
      path: '/preview17'
    },
    {
      id: 'preview18',
      num: '18',
      title: 'Multi-Step Onboarding Wizard',
      tag: 'Formulário Progressivo 3 Minutos',
      desc: 'Assistente em 4 etapas guiadas com barra de progresso viva configurando especialidade, radar e bot do consultório.',
      icon: Sliders,
      color: '#818cf8',
      path: '/preview18'
    },
    {
      id: 'preview19',
      num: '19',
      title: 'Live Sparklines & Metrics Bento',
      tag: 'Analytics & Gráficos Vetoriais',
      desc: 'Painel estilo Vercel Analytics com curvas SVG suaves de retenção clínica, faturamento protegido e pratos analisados.',
      icon: Activity,
      color: '#10b981',
      path: '/preview19'
    },
    {
      id: 'preview20',
      num: '20',
      title: '3D Stack Cards / Swipe Deck',
      tag: 'Pilha em Camadas & Prescrição',
      desc: 'Deck de cartões de refeições em camadas 3D que você folheia para aprovar cardápios gerados pela IA em segundos.',
      icon: RotateCw,
      color: '#ec4899',
      path: '/preview20'
    }
  ];

  return (
    <div className="v2-landing" style={{ background: '#030408', minHeight: '100vh', padding: '60px 20px 100px' }}>
      <div className="v2-neon-grid" />

      {/* Header Central */}
      <div style={{ maxWidth: '1000px', margin: '0 auto 60px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(168, 85, 247, 0.12)', border: '1px solid rgba(168, 85, 247, 0.35)', padding: '6px 16px', borderRadius: '9999px', color: '#c084fc', fontSize: '0.82rem', fontWeight: 700, marginBottom: '20px' }}>
          <Sparkles size={14} />
          <span>GALERIA DE SHOWCASE // 20 LAYOUTS 21ST.DEV</span>
        </div>

        <h1 className="v2-heading" style={{ fontSize: 'clamp(2.4rem, 5vw, 3.8rem)', color: '#fff', margin: '0 0 16px', lineHeight: 1.15 }}>
          Hub dos 20 Previews do <span className="gradient-text">Nutrivvo</span>
        </h1>

        <p style={{ color: '#94a3b8', fontSize: '1.15rem', maxWidth: '720px', margin: '0 auto 28px' }}>
          A cobertura mais completa e exaustiva de todos os componentes do 21st.dev.
          Explore 20 páginas com arquiteturas, propostas de valor e experiências interativas radicalmente distintas.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
          <button
            className="v2-btn v2-btn-outline"
            style={{ color: '#fff' }}
            onClick={() => navigate('/')}
          >
            <Layout size={16} /> Voltar para a Landing Original
          </button>
          <button
            className="v2-btn v2-btn-cyber"
            onClick={() => navigate('/preview1')}
          >
            Começar do Preview 1 (Bento) <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* Grid com os 20 Cards */}
      <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px', position: 'relative', zIndex: 1 }}>
        {previewList.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className="v2-bento-card"
              style={{
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '28px'
              }}
              onClick={() => navigate(item.path)}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: `${item.color}20`, border: `1px solid ${item.color}50`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={22} color={item.color} />
                  </div>
                  <span className="v2-mono" style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 800 }}>
                    {item.num} / 20
                  </span>
                </div>

                <div className="v2-mono" style={{ fontSize: '0.72rem', color: item.color, fontWeight: 700, textTransform: 'uppercase', marginBottom: '6px' }}>
                  {item.tag}
                </div>

                <h3 className="v2-heading" style={{ fontSize: '1.25rem', color: '#fff', margin: '0 0 10px' }}>
                  {item.title}
                </h3>

                <p style={{ color: '#94a3b8', fontSize: '0.88rem', lineHeight: 1.5, margin: '0 0 24px' }}>
                  {item.desc}
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '16px' }}>
                <span className="v2-mono" style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>
                  Rota: {item.path}
                </span>
                <span style={{ color: item.color, fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  Abrir <ArrowRight size={14} />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
