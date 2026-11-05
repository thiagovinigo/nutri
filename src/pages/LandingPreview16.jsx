import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Command,
  Search,
  Sparkles,
  ArrowRight,
  Radio,
  Scan,
  Utensils,
  Bot,
  Flame,
  CheckCircle2,
  CornerDownLeft,
  ChevronRight
} from 'lucide-react';
import PreviewSwitcher from '../components/landing/PreviewSwitcher';
import { landingData } from '../components/landing/landingData';
import '../landing-v2.css';
import '../landing-previews.css';

export default function LandingPreview16() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAction, setSelectedAction] = useState('radar');

  const actions = [
    {
      id: 'radar',
      name: 'Ver Radar de Abandono',
      desc: '3 pacientes identificados com risco de desistência no 4º dia',
      shortcut: '⌘ R',
      icon: Radio,
      color: '#ef4444',
      preview: {
        title: 'Radar de Abandono Ativo',
        badge: 'ALERTA CRÍTICO',
        text: 'Camila Rodrigues parou de registrar fotos há 4 dias. Protocolo de resgate sugerido: "Oi Camila, percebi que você não mandou as fotos essa semana. Como está a rotina de almoço?"'
      }
    },
    {
      id: 'dieta',
      name: 'Gerar Cardápio por IA',
      desc: 'Prescrição de 2.100 kcal hipertrofia com 5 refeições completas',
      shortcut: '⌘ D',
      icon: Utensils,
      color: '#34d399',
      preview: {
        title: 'Motor de Prescrição Instantânea',
        badge: 'GERADO EM 2.4s',
        text: 'Plano com TMB calculada por Katch-McArdle, distribuição de 2.2g/kg de proteína, tabela TACO calibrada e lista de supermercado inclusa.'
      }
    },
    {
      id: 'scan',
      name: 'Escanear Prato por Visão IA',
      desc: 'Foto recebida no Telegram: filé grelhado, batata e brócolis',
      shortcut: '⌘ S',
      icon: Scan,
      color: '#06b6d4',
      preview: {
        title: 'Visão Computacional Ativa',
        badge: '94% PRECISÃO',
        text: 'Identificado: 150g de peito de frango, 120g de arroz integral, 80g de feijão preto e salada verde. Total: 418 kcal (38g proteína).'
      }
    },
    {
      id: 'telegram',
      name: 'Secretária Virtual Telegram',
      desc: '3 dúvidas de substituição alimentar respondidas automaticamente',
      shortcut: '⌘ T',
      icon: Bot,
      color: '#38bdf8',
      preview: {
        title: 'Secretária IA 24/7',
        badge: 'SEM ROUBAR SEU WHATSAPP',
        text: 'A paciente Beatriz perguntou às 22h se podia trocar aveia por farelo. A IA respondeu confirmando a equivalência conforme suas regras clínicas.'
      }
    }
  ];

  const filtered = actions.filter(a =>
    a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const active = actions.find(a => a.id === selectedAction) || actions[0];
  const ActiveIcon = active.icon;

  return (
    <div style={{ background: '#070913', minHeight: '100vh', color: '#f8fafc', padding: '60px 20px 120px' }}>
      <PreviewSwitcher current="p16" />

      {/* Hero Header */}
      <div style={{ maxWidth: '960px', margin: '0 auto 40px', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(56, 189, 248, 0.12)', border: '1px solid rgba(56, 189, 248, 0.35)', padding: '6px 16px', borderRadius: '9999px', color: '#38bdf8', fontSize: '0.8rem', fontWeight: 800, marginBottom: '20px' }}>
          <Command size={14} />
          <span>LAYOUT 16 // COMMAND MENU `CMD + K` BAR FIRST</span>
        </div>

        <h1 className="v2-heading" style={{ fontSize: 'clamp(2.4rem, 5vw, 4rem)', color: '#fff', margin: '0 0 16px', lineHeight: 1.15 }}>
          Toda a inteligência do seu consultório <br />
          <span style={{ background: 'linear-gradient(135deg, #38bdf8, #818cf8, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            a um atalho de teclado de distância.
          </span>
        </h1>

        <p style={{ color: '#94a3b8', fontSize: '1.15rem', maxWidth: '700px', margin: '0 auto 36px', lineHeight: 1.6 }}>
          Navegação ultra-rápida estilo Raycast e Linear: dispare resgates no Telegram, gere cardápios clínicos e consulte o radar sem perder tempo com menus lentos.
        </p>
      </div>

      {/* Command Palette Stage */}
      <div style={{ maxWidth: '880px', margin: '0 auto 50px', background: 'rgba(15, 20, 36, 0.95)', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 30px 80px rgba(0,0,0,0.9), 0 0 50px rgba(56, 189, 248, 0.2)' }}>
        
        {/* Search Bar Input */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', background: 'rgba(0, 0, 0, 0.4)', gap: '14px' }}>
          <Search size={22} color="#38bdf8" />
          <input
            type="text"
            placeholder="Digite um comando (ex: radar, dieta, prato, telegram)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', background: 'transparent', border: 'none', color: '#fff', fontSize: '1.1rem', outline: 'none', fontWeight: 500 }}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(255, 255, 255, 0.08)', padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700 }}>
            <CornerDownLeft size={12} /> ENTER
          </div>
        </div>

        {/* Command Menu Split View: Action List & Live Preview */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.3fr', minHeight: '340px' }}>
          
          {/* Action List */}
          <div style={{ padding: '16px', borderRight: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', padding: '0 8px', marginBottom: '4px' }}>
              Ações Rápidas Disponíveis
            </div>

            {filtered.map(action => {
              const Icon = action.icon;
              const isSelected = selectedAction === action.id;
              return (
                <div
                  key={action.id}
                  onClick={() => setSelectedAction(action.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    background: isSelected ? 'rgba(56, 189, 248, 0.12)' : 'transparent',
                    border: isSelected ? '1px solid rgba(56, 189, 248, 0.4)' : '1px solid transparent',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: `${action.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon size={18} color={action.color} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#fff' }}>{action.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{action.desc.slice(0, 38)}...</div>
                    </div>
                  </div>

                  <span style={{ fontSize: '0.75rem', color: isSelected ? '#38bdf8' : '#64748b', fontWeight: 700, background: 'rgba(255, 255, 255, 0.05)', padding: '2px 6px', borderRadius: '4px' }}>
                    {action.shortcut}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Live Action Preview */}
          <div style={{ padding: '28px', background: 'rgba(0, 0, 0, 0.25)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: active.color, background: `${active.color}20`, padding: '4px 10px', borderRadius: '6px' }}>
                  {active.preview.badge}
                </span>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Execução Instantânea</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <ActiveIcon size={24} color={active.color} />
                <h3 style={{ fontSize: '1.25rem', color: '#fff', margin: 0, fontWeight: 800 }}>
                  {active.preview.title}
                </h3>
              </div>

              <p style={{ color: '#cbd5e1', fontSize: '0.92rem', lineHeight: 1.6, background: 'rgba(255, 255, 255, 0.04)', padding: '16px', borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                {active.preview.text}
              </p>
            </div>

            <button
              onClick={() => navigate('/cadastro')}
              style={{
                background: 'linear-gradient(135deg, #38bdf8, #818cf8)',
                color: '#fff',
                border: 'none',
                padding: '12px 20px',
                borderRadius: '12px',
                fontSize: '0.92rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              Executar Ação no Nutrivvo <ArrowRight size={16} />
            </button>
          </div>

        </div>

      </div>

      {/* Action Footer */}
      <div style={{ maxWidth: '880px', margin: '0 auto', textAlign: 'center' }}>
        <button
          onClick={() => navigate('/cadastro')}
          className="v2-btn v2-btn-cyber"
          style={{ fontSize: '1.1rem', padding: '16px 38px' }}
        >
          Experimentar a Produtividade do Nutrivvo Grátis <ArrowRight size={18} />
        </button>
      </div>

    </div>
  );
}

