import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Stethoscope,
  HeartPulse,
  Clock,
  Sparkles,
  Lock
} from 'lucide-react';
import PreviewSwitcher from '../components/landing/PreviewSwitcher';
import { landingData } from '../components/landing/landingData';
import '../landing-v2.css';
import '../landing-previews.css';

export default function LandingPreview6() {
  const navigate = useNavigate();

  return (
    <div className="v2-landing theme-light" style={{ background: '#fafafa', color: '#0f172a', minHeight: '100vh', padding: '60px 20px 100px' }}>
      <PreviewSwitcher current="p6" />

      {/* Hero Section Clean Light */}
      <div style={{ maxWidth: '960px', margin: '0 auto', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#ede9fe', color: '#7c3aed', padding: '6px 16px', borderRadius: '9999px', fontSize: '0.82rem', fontWeight: 800, marginBottom: '20px' }}>
          <Sparkles size={14} />
          <span>LAYOUT 6 // SWISS CLINICAL LIGHT MODE</span>
        </div>

        <h1 className="v2-heading" style={{ fontSize: 'clamp(2.5rem, 5.5vw, 4rem)', color: '#0f172a', lineHeight: 1.12, margin: '0 0 20px' }}>
          {landingData.titleLine1} <br />
          <span style={{ color: '#7c3aed' }}>{landingData.titleHighlight}</span>
        </h1>

        <p style={{ color: '#475569', fontSize: '1.18rem', lineHeight: 1.6, maxWidth: '720px', margin: '0 auto 36px' }}>
          {landingData.description}
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', marginBottom: '40px' }}>
          <button
            style={{
              background: '#7c3aed',
              color: '#fff',
              border: 'none',
              padding: '16px 36px',
              borderRadius: '9999px',
              fontWeight: 800,
              fontSize: '1.05rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 10px 25px rgba(124, 58, 237, 0.3)'
            }}
            onClick={() => navigate('/cadastro?role=nutricionista')}
          >
            Criar Clínica Grátis <ArrowRight size={18} />
          </button>
        </div>

        {/* Mockup Frame Claro */}
        <div style={{ background: '#fff', borderRadius: '24px', padding: '16px', border: '1px solid #e2e8f0', boxShadow: '0 25px 60px rgba(0,0,0,0.08)', marginBottom: '60px' }}>
          <img src="/screen_nutri.png" alt="CRM" style={{ width: '100%', borderRadius: '12px' }} />
        </div>

        {/* Grid de 3 Pilares Claros */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', textAlign: 'left' }}>
          <div style={{ background: '#fff', padding: '28px', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 15px rgba(0,0,0,0.04)' }}>
            <Clock size={28} color="#7c3aed" style={{ marginBottom: '14px' }} />
            <h3 className="v2-heading" style={{ fontSize: '1.25rem', color: '#0f172a', margin: '0 0 8px' }}>Gestão que trabalha por você</h3>
            <p style={{ color: '#64748b', fontSize: '0.92rem', lineHeight: 1.5, margin: 0 }}>
              {landingData.valueProps.management.desc}
            </p>
          </div>

          <div style={{ background: '#fff', padding: '28px', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 15px rgba(0,0,0,0.04)' }}>
            <HeartPulse size={28} color="#7c3aed" style={{ marginBottom: '14px' }} />
            <h3 className="v2-heading" style={{ fontSize: '1.25rem', color: '#0f172a', margin: '0 0 8px' }}>Engajamento diário com XP</h3>
            <p style={{ color: '#64748b', fontSize: '0.92rem', lineHeight: 1.5, margin: 0 }}>
              {landingData.valueProps.engagement.desc}
            </p>
          </div>

          <div style={{ background: '#fff', padding: '28px', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 15px rgba(0,0,0,0.04)' }}>
            <Lock size={28} color="#7c3aed" style={{ marginBottom: '14px' }} />
            <h3 className="v2-heading" style={{ fontSize: '1.25rem', color: '#0f172a', margin: '0 0 8px' }}>Sigilo e Regras LGPD</h3>
            <p style={{ color: '#64748b', fontSize: '0.92rem', lineHeight: 1.5, margin: 0 }}>
              {landingData.security.desc}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
