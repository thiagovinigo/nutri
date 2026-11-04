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
  ExternalLink
} from 'lucide-react';
import '../landing-v2.css';
import '../landing-previews.css';

export default function PreviewsHub() {
  const navigate = useNavigate();

  const previewList = [
    {
      id: 'preview1',
      num: '01',
      title: 'Radar de Abandono IA',
      tag: 'Telemetria & Detecção Precoce',
      desc: 'Simulador com radar 360° animado, classificação de risco (Camila 82%, Rodrigo 45%, Beatriz segura) e gatilho de resgate.',
      icon: Radio,
      color: '#c084fc',
      path: '/preview1'
    },
    {
      id: 'preview2',
      num: '02',
      title: 'Secretária Virtual no Telegram',
      tag: 'Chat Interativo 24h',
      desc: 'Chat funcional do Telegram onde você pode digitar mensagens e ver a IA confirmar consultas e receber fotos do prato.',
      icon: Bot,
      color: '#38bdf8',
      path: '/preview2'
    },
    {
      id: 'preview3',
      num: '03',
      title: 'Scanner de Prato por Visão IA',
      tag: 'Visão Computacional',
      desc: 'Scanner a laser animado sobre refeições reais (almoço, café, jantar) com extração automática de gramas, proteínas e calorias.',
      icon: Scan,
      color: '#06b6d4',
      path: '/preview3'
    },
    {
      id: 'preview4',
      num: '04',
      title: 'Gamificação, Ofensiva & XP',
      tag: 'Dopamina & Retenção',
      desc: 'Minigame interativo de hábitos: clique em fotografar prato, bater meta de água ou treino e veja a barra de XP subir ao vivo.',
      icon: Flame,
      color: '#f97316',
      path: '/preview4'
    },
    {
      id: 'preview5',
      num: '05',
      title: 'Gerador de Dietas com IA',
      tag: 'Prescrição em 3 Segundos',
      desc: 'Cardápios clínicos completos com receitas de verdade, modo de preparo, lista de compras e cálculo exato de TMB.',
      icon: Utensils,
      color: '#10b981',
      path: '/preview5'
    },
    {
      id: 'preview6',
      num: '06',
      title: 'Ficha de Treino & Periodização',
      tag: 'Conduta Física Integrada',
      desc: 'Periodização de exercícios (divisão A/B e metabólica) calibrada pela ingestão calórica e limitações articulares.',
      icon: Dumbbell,
      color: '#f472b6',
      path: '/preview6'
    },
    {
      id: 'preview7',
      num: '07',
      title: 'Análise de Exames com IA',
      tag: 'Leitura Laboratorial',
      desc: 'Interpretação inteligente de laudos de sangue com alertas de marcadores subclínicos (insulina, glicemia, ferritina).',
      icon: Stethoscope,
      color: '#34d399',
      path: '/preview7'
    },
    {
      id: 'preview8',
      num: '08',
      title: 'Módulo Financeiro Integrado',
      tag: 'Previsibilidade & Cobrança',
      desc: 'Fluxo de caixa em tempo real, controle de planos mensais/trimestrais e lembrete amigável de renovação no Telegram.',
      icon: Wallet,
      color: '#fbbf24',
      path: '/preview8'
    },
    {
      id: 'preview9',
      num: '09',
      title: 'Prontuário & Evolução Fotográfica',
      tag: 'Linha do Tempo Visual',
      desc: 'Histórico fotográfico antes/depois do paciente, acompanhamento de bioimpedância e gráficos de evolução corporal.',
      icon: Layers,
      color: '#a78bfa',
      path: '/preview9'
    },
    {
      id: 'preview10',
      num: '10',
      title: 'Hub Central Integrado (Master)',
      tag: 'O Ecossistema Completo',
      desc: 'A visão integrada de todos os 9 módulos operando em conjunto na jornada completa do consultório.',
      icon: Sparkles,
      color: '#38bdf8',
      path: '/preview10'
    }
  ];

  return (
    <div className="v2-landing" style={{ background: '#030408', minHeight: '100vh', padding: '60px 20px 100px' }}>
      <div className="v2-neon-grid" />

      {/* Header Central */}
      <div style={{ maxWidth: '1000px', margin: '0 auto 60px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(168, 85, 247, 0.12)', border: '1px solid rgba(168, 85, 247, 0.35)', padding: '6px 16px', borderRadius: '9999px', color: '#c084fc', fontSize: '0.82rem', fontWeight: 700, marginBottom: '20px' }}>
          <Sparkles size={14} />
          <span>GALERIA DE SHOWCASE // 21ST.DEV</span>
        </div>

        <h1 className="v2-heading" style={{ fontSize: 'clamp(2.4rem, 5vw, 3.8rem)', color: '#fff', margin: '0 0 16px', lineHeight: 1.15 }}>
          Hub de Previews do <span className="gradient-text">Nutrivvo</span>
        </h1>

        <p style={{ color: '#94a3b8', fontSize: '1.15rem', maxWidth: '680px', margin: '0 auto 28px' }}>
          Explore as 10 páginas desenvolvidas com os componentes do 21st.dev.
          Cada versão foca em um recurso específico do ecossistema com elementos interativos ao vivo.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '14px' }}>
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
            Abrir Preview 1 (Radar) <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* Grid com os 10 Cards */}
      <div style={{ maxWidth: '1140px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', position: 'relative', zIndex: 1 }}>
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
                    {item.num} / 10
                  </span>
                </div>

                <div className="v2-mono" style={{ fontSize: '0.72rem', color: item.color, fontWeight: 700, textTransform: 'uppercase', marginBottom: '6px' }}>
                  {item.tag}
                </div>

                <h3 className="v2-heading" style={{ fontSize: '1.3rem', color: '#fff', margin: '0 0 10px' }}>
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

