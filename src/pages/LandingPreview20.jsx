import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Layers,
  ArrowRight,
  Sparkles,
  Check,
  RotateCw,
  Utensils,
  Flame,
  Clock,
  Heart
} from 'lucide-react';
import PreviewSwitcher from '../components/landing/PreviewSwitcher';
import { landingData } from '../components/landing/landingData';
import '../landing-v2.css';
import '../landing-previews.css';

export default function LandingPreview20() {
  const navigate = useNavigate();
  const [currentCardIndex, setCurrentCardIndex] = useState(0);

  const mealCards = [
    {
      title: 'Opção 1: Almoço Equilibrado & Prático',
      calories: '420 kcal',
      macros: '38g Proteína • 45g Carbo • 8g Gordura',
      time: '15 min de preparo',
      tag: 'Alta Saciedade',
      color: '#34d399',
      items: [
        '150g de peito de frango grelhado com açafrão',
        '100g de arroz integral cozido',
        '80g de feijão preto ou carioca',
        'Salada de folhas verdes à vontade com azeite extravirgem (5ml)'
      ]
    },
    {
      title: 'Opção 2: Jantar Low Carb com Peixe',
      calories: '360 kcal',
      macros: '35g Proteína • 18g Carbo • 12g Gordura',
      time: '20 min de preparo',
      tag: 'Digestão Leve',
      color: '#38bdf8',
      items: [
        '160g de filé de tilápia com raspas de limão e ervas',
        '150g de purê de abóbora cabotiá',
        'Brócolis e cenoura cozidos no vapor à vontade',
        'Mix de sementes de abóbora tostadas (10g)'
      ]
    },
    {
      title: 'Opção 3: Café da Manhã Anabólico',
      calories: '410 kcal',
      macros: '32g Proteína • 40g Carbo • 11g Gordura',
      time: '8 min de preparo',
      tag: 'Rápido & Nutritivo',
      color: '#c084fc',
      items: [
        '3 ovos mexidos (2 claras + 1 gema) com orégano',
        '2 fatias de pão integral 100%',
        '1 banana média com 15g de aveia em flocos e canela',
        'Café passado sem açúcar'
      ]
    },
    {
      title: 'Opção 4: Lanche Pré-Treino de Absorção Rápida',
      calories: '280 kcal',
      macros: '24g Proteína • 35g Carbo • 4g Gordura',
      time: '5 min de preparo',
      tag: 'Performance',
      color: '#f97316',
      items: [
        '1 pote de iogurte natural desnatado (160g)',
        '30g de Whey Protein isolado sabor baunilha',
        '1 maçã picada com canela',
        '1 castanha-do-pará'
      ]
    }
  ];

  const nextCard = () => {
    setCurrentCardIndex((prev) => (prev + 1) % mealCards.length);
  };

  const currentMeal = mealCards[currentCardIndex];

  return (
    <div style={{ background: '#060814', minHeight: '100vh', color: '#f8fafc', padding: '60px 20px 120px' }}>
      <PreviewSwitcher current="p20" />

      {/* Header */}
      <div style={{ maxWidth: '960px', margin: '0 auto 40px', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(236, 72, 153, 0.12)', border: '1px solid rgba(236, 72, 153, 0.35)', padding: '6px 16px', borderRadius: '9999px', color: '#f472b6', fontSize: '0.8rem', fontWeight: 800, marginBottom: '20px' }}>
          <Layers size={14} />
          <span>LAYOUT 20 // 3D STACK CARDS / SWIPE DECK SHOWCASE</span>
        </div>

        <h1 className="v2-heading" style={{ fontSize: 'clamp(2.4rem, 5vw, 4rem)', color: '#fff', margin: '0 0 16px', lineHeight: 1.15 }}>
          Prescrição clínica na velocidade de um swipe: <br />
          <span style={{ background: 'linear-gradient(135deg, #f472b6, #ec4899, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            opções reais, sem receitas genéricas.
          </span>
        </h1>

        <p style={{ color: '#94a3b8', fontSize: '1.15rem', maxWidth: '700px', margin: '0 auto 32px', lineHeight: 1.6 }}>
          Folheie a pilha de cartões em 3D e veja como o motor de IA sugere combinações nutritivas com tabela TACO, calorias e modo de preparo.
        </p>
      </div>

      {/* 3D Stack Stage */}
      <div style={{ maxWidth: '640px', margin: '0 auto 50px', position: 'relative', height: '440px', perspective: '1000px' }}>
        
        {/* Underneath Ghost Card 2 (Bottom Layer) */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            borderRadius: '28px',
            transform: 'translateY(28px) scale(0.9)',
            zIndex: 1,
            pointerEvents: 'none'
          }}
        />

        {/* Underneath Ghost Card 1 (Middle Layer) */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '28px',
            transform: 'translateY(14px) scale(0.95)',
            zIndex: 2,
            pointerEvents: 'none'
          }}
        />

        {/* Main Active 3D Card (Top Layer) */}
        <div
          key={currentCardIndex}
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(145deg, rgba(25, 20, 40, 0.95), rgba(12, 15, 28, 0.98))',
            border: `2px solid ${currentMeal.color}60`,
            borderRadius: '28px',
            padding: '36px',
            boxShadow: `0 25px 60px rgba(0,0,0,0.9), 0 0 40px ${currentMeal.color}25`,
            zIndex: 3,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            transition: 'all 0.3s ease'
          }}
        >
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: currentMeal.color, background: `${currentMeal.color}20`, padding: '4px 10px', borderRadius: '6px' }}>
                {currentMeal.tag}
              </span>
              <span style={{ fontSize: '0.82rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={14} /> {currentMeal.time}
              </span>
            </div>

            <h3 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#fff', margin: '0 0 10px' }}>
              {currentMeal.title}
            </h3>

            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '1rem', fontWeight: 900, color: currentMeal.color }}>
                {currentMeal.calories}
              </span>
              <span style={{ color: 'rgba(255,255,255,0.2)' }}>•</span>
              <span style={{ fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 600 }}>
                {currentMeal.macros}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {currentMeal.items.map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.9rem', color: '#e2e8f0', lineHeight: 1.4 }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: currentMeal.color, marginTop: '7px', flexShrink: 0 }} />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '20px' }}>
            <button
              onClick={nextCard}
              style={{
                flex: 1,
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#fff',
                padding: '12px',
                borderRadius: '12px',
                fontSize: '0.9rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <RotateCw size={16} /> Ver Próxima Opção
            </button>

            <button
              onClick={() => navigate('/cadastro')}
              style={{
                flex: 1,
                background: currentMeal.color,
                border: 'none',
                color: '#000',
                padding: '12px',
                borderRadius: '12px',
                fontSize: '0.9rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <Check size={16} /> Aprovar Cardápio
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
          Prescrever com a Velocidade da IA no Meu Consultório <ArrowRight size={18} />
        </button>
      </div>

    </div>
  );
}

