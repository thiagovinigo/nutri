import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Flame,
  Award,
  Trophy,
  Zap,
  Camera,
  Droplets,
  Dumbbell,
  Sparkles,
  TrendingUp,
  Heart
} from 'lucide-react';
import PreviewSwitcher from '../components/landing/PreviewSwitcher';
import { landingData } from '../components/landing/landingData';
import '../landing-v2.css';
import '../landing-previews.css';

export default function LandingPreview8() {
  const navigate = useNavigate();
  const [xp, setXp] = useState(520);
  const [streakDays, setStreakDays] = useState(14);
  const [done, setDone] = useState({ photo: false, water: false, exercise: false });

  const completeQuest = (q, points) => {
    if (done[q]) return;
    setDone(prev => ({ ...prev, [q]: true }));
    setXp(prev => prev + points);
  };

  return (
    <div className="p3-body" style={{ minHeight: '100vh', padding: '60px 20px 120px' }}>
      <div className="p3-arcade-glow" />
      <PreviewSwitcher current="p8" />

      {/* Hero Arcade */}
      <div style={{ maxWidth: '960px', margin: '0 auto 40px', textAlign: 'center' }}>
        <div className="p3-streak-badge" style={{ marginBottom: '20px' }}>
          <Flame size={18} color="#f97316" />
          <span>LAYOUT 8 // GAMIFIED ARCADE QUEST</span>
        </div>

        <h1 className="v2-heading" style={{ fontSize: 'clamp(2.4rem, 5vw, 4rem)', color: '#fff', margin: '0 0 16px' }}>
          O que faz o paciente voltar todo dia <br />
          <span style={{ background: 'linear-gradient(135deg, #fff 10%, #fed7aa 40%, #f97316 75%, #ef4444 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'inline-block' }}>
            não é força de vontade. É dopamina.
          </span>
        </h1>

        <p style={{ color: '#fed7aa', fontSize: '1.15rem', maxWidth: '700px', margin: '0 auto 36px' }}>
          {landingData.description}
        </p>

        {/* Minigame Box */}
        <div style={{ maxWidth: '820px', margin: '0 auto', background: 'rgba(20, 16, 34, 0.95)', border: '1px solid rgba(249, 115, 22, 0.4)', borderRadius: '24px', padding: '28px', boxShadow: '0 25px 60px rgba(0,0,0,0.85), 0 0 40px rgba(249, 115, 22, 0.2)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Flame size={28} color="#f97316" />
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>Ofensiva: {streakDays} Dias Seguidos 🔥</div>
                <div style={{ fontSize: '0.8rem', color: '#fed7aa' }}>Nível 4 // Hábito Consolidado</div>
              </div>
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#22c55e' }}>{xp} XP</div>
          </div>

          <div style={{ width: '100%', height: '12px', background: 'rgba(255,255,255,0.08)', borderRadius: '9999px', overflow: 'hidden', marginBottom: '24px' }}>
            <div style={{ height: '100%', width: `${Math.min(100, (xp / 650) * 100)}%`, background: 'linear-gradient(90deg, #f97316, #22c55e)', boxShadow: '0 0 15px #22c55e', transition: 'width 0.4s ease' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
            <button
              onClick={() => completeQuest('photo', 50)}
              style={{
                background: done.photo ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255,255,255,0.05)',
                border: `1px solid ${done.photo ? '#22c55e' : 'rgba(255,255,255,0.1)'}`,
                color: done.photo ? '#4ade80' : '#fff',
                padding: '12px',
                borderRadius: '12px',
                fontWeight: 700,
                cursor: done.photo ? 'default' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                justifyContent: 'center'
              }}
            >
              <Camera size={16} /> {done.photo ? '✅ Prato Lançado (+50 XP)' : '📸 Fotografar Prato (+50 XP)'}
            </button>

            <button
              onClick={() => completeQuest('water', 30)}
              style={{
                background: done.water ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255,255,255,0.05)',
                border: `1px solid ${done.water ? '#22c55e' : 'rgba(255,255,255,0.1)'}`,
                color: done.water ? '#4ade80' : '#fff',
                padding: '12px',
                borderRadius: '12px',
                fontWeight: 700,
                cursor: done.water ? 'default' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                justifyContent: 'center'
              }}
            >
              <Droplets size={16} /> {done.water ? '✅ Água Batida (+30 XP)' : '💧 Beber 2L de Água (+30 XP)'}
            </button>

            <button
              onClick={() => completeQuest('exercise', 70)}
              style={{
                background: done.exercise ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255,255,255,0.05)',
                border: `1px solid ${done.exercise ? '#22c55e' : 'rgba(255,255,255,0.1)'}`,
                color: done.exercise ? '#4ade80' : '#fff',
                padding: '12px',
                borderRadius: '12px',
                fontWeight: 700,
                cursor: done.exercise ? 'default' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                justifyContent: 'center'
              }}
            >
              <Dumbbell size={16} /> {done.exercise ? '✅ Treino Concluído (+70 XP)' : '💪 Treinar Hoje (+70 XP)'}
            </button>
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: '40px' }}>
        <button className="p3-quest-btn" style={{ padding: '16px 36px', fontSize: '1.1rem' }} onClick={() => navigate('/cadastro?role=nutricionista')}>
          Levar a Gamificação para Meus Pacientes <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
}
