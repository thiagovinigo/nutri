import React, { useState } from 'react';

/**
 * Conic-gradient circular ring inspired by Moveflux (OEM.SZ26) Heart Rate / Nutrition cards.
 */
export function ConicRing({
  percent = 75,
  value,
  unit = '',
  gradient = 'from-cyan',
  size = 94
}) {
  const clamped = Math.max(0, Math.min(100, Number(percent) || 0));
  const bgMap = {
    'from-cyan': `conic-gradient(#0091ff 0deg, #00d4ff ${clamped * 2.2}deg, #a855f7 ${clamped * 3.6}deg, #e2e8f0 ${clamped * 3.6}deg)`,
    'from-macros': `conic-gradient(#10b981 0deg, #f59e0b ${clamped * 1.9}deg, #ec4899 ${clamped * 3.6}deg, #e2e8f0 ${clamped * 3.6}deg)`,
    'from-heart': `conic-gradient(#f43f5e 0deg, #fb923c ${clamped * 2.1}deg, #fbbf24 ${clamped * 3.6}deg, #e2e8f0 ${clamped * 3.6}deg)`
  };

  return (
    <div
      style={{
        position: 'relative',
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
        background: bgMap[gradient] || bgMap['from-cyan'],
        display: 'grid',
        placeItems: 'center',
        flexShrink: 0
      }}
    >
      <div
        style={{
          width: `${size - 12}px`,
          height: `${size - 12}px`,
          borderRadius: '50%',
          background: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: 'inset 0 2px 6px rgba(15, 23, 42, 0.06)'
        }}
      >
        <strong className="cx-tabular" style={{ fontSize: size >= 90 ? '1.12rem' : '0.92rem', lineHeight: 1.05, color: '#0f172a' }}>
          {value}
        </strong>
        {unit && (
          <span style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 500 }}>
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}

/**
 * 3 tinted macro distribution pills matching Moveflux Nutrition panel.
 */
export function MacroPillGroup({ macros }) {
  const m = macros || { carbs: 0, carbsGoal: 180, protein: 0, proteinGoal: 140, fats: 0, fatsGoal: 55 };
  const items = [
    {
      label: 'Carbs',
      val: m.carbs,
      goal: m.carbsGoal,
      pct: Math.min(100, Math.round((m.carbs / Math.max(m.carbsGoal, 1)) * 100)),
      bg: '#fef2f2',
      ring: '#fecaca',
      track: '#fee2e2',
      fill: '#ef4444',
      text: '#b91c1c'
    },
    {
      label: 'Proteína',
      val: m.protein,
      goal: m.proteinGoal,
      pct: Math.min(100, Math.round((m.protein / Math.max(m.proteinGoal, 1)) * 100)),
      bg: '#eff6ff',
      ring: '#bfdbfe',
      track: '#dbeafe',
      fill: '#2563eb',
      text: '#1d4ed8'
    },
    {
      label: 'Gorduras',
      val: m.fats,
      goal: m.fatsGoal,
      pct: Math.min(100, Math.round((m.fats / Math.max(m.fatsGoal, 1)) * 100)),
      bg: '#fefce8',
      ring: '#fde68a',
      track: '#fef08a',
      fill: '#d97706',
      text: '#92400e'
    }
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '0.55rem' }}>
      {items.map((it) => (
        <div
          key={it.label}
          style={{
            borderRadius: '16px',
            padding: '0.65rem 0.5rem',
            background: it.bg,
            border: `1px solid ${it.ring}`,
            textAlign: 'center'
          }}
        >
          <div style={{ height: '6px', borderRadius: '999px', background: it.track, overflow: 'hidden', marginBottom: '0.45rem' }}>
            <div style={{ width: `${it.pct}%`, height: '100%', borderRadius: '999px', background: it.fill, transition: 'width 0.25s ease' }} />
          </div>
          <div style={{ fontSize: '0.7rem', fontWeight: 600, color: it.text }}>{it.label}</div>
          <strong className="cx-tabular" style={{ fontSize: '0.86rem', color: '#0f172a' }}>{it.val}g</strong>
        </div>
      ))}
    </div>
  );
}

/**
 * Dark gradient biometric curve chart modeled on Moveflux's dark Weight Evolution panel.
 */
export function WeightEvolutionChart({ history = [], targetWeight = 62 }) {
  const [metric, setMetric] = useState('weight');
  const [hoverIdx, setHoverIdx] = useState(Math.max(0, history.length - 1));

  const metricConfig = {
    weight: { label: 'Peso', unit: 'kg', stroke: '#fef3c7', dot: '#f59e0b', fill: 'rgba(251, 191, 36, 0.22)' },
    leanMass: { label: 'Massa Magra', unit: 'kg', stroke: '#7dd3fc', dot: '#00aaff', fill: 'rgba(0, 170, 255, 0.22)' },
    fatPct: { label: 'Gordura', unit: '%', stroke: '#f9a8d4', dot: '#ff0099', fill: 'rgba(255, 0, 153, 0.20)' }
  };

  const cfg = metricConfig[metric] || metricConfig.weight;
  const pts = history.length ? history : [{ month: 'Nov', weight: 65, leanMass: 45, fatPct: 22 }];
  const values = pts.map((p) => Number(p[metric]) || 0);
  const minVal = Math.min(...values) - 1.4;
  const maxVal = Math.max(...values) + 1.4;
  const span = Math.max(maxVal - minVal, 1);

  const W = 320;
  const H = 132;
  const padX = 18;
  const padY = 18;

  const coords = pts.map((p, i) => {
    const x = pts.length === 1 ? W / 2 : padX + (i / (pts.length - 1)) * (W - padX * 2);
    const y = H - padY - ((Number(p[metric]) - minVal) / span) * (H - padY * 2);
    return { x, y, val: p[metric], month: p.month };
  });

  const linePath = coords.map((c, i) => `${i === 0 ? 'M' : 'L'}${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(' ');
  const areaPath = `${linePath} L${coords[coords.length - 1].x.toFixed(1)},${H - 6} L${coords[0].x.toFixed(1)},${H - 6} Z`;
  const focused = coords[Math.min(hoverIdx, coords.length - 1)] || coords[coords.length - 1];

  return (
    <div className="cx-card-dark">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.65rem' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.08rem', fontWeight: 600 }}>Composição &amp; Tendência</h3>
          <p style={{ margin: '0.15rem 0 0', fontSize: '0.78rem', color: '#cbd5e1' }}>
            Alvo clínico: {targetWeight} kg · {focused.month}: <strong style={{ color: '#fff' }}>{focused.val} {cfg.unit}</strong>
          </p>
        </div>
        <div style={{ display: 'inline-flex', gap: '0.25rem', background: 'rgba(255,255,255,0.08)', padding: '0.2rem', borderRadius: '999px' }}>
          {Object.entries(metricConfig).map(([key, item]) => (
            <button
              key={key}
              type="button"
              onClick={() => setMetric(key)}
              style={{
                border: 0,
                borderRadius: '999px',
                padding: '0.25rem 0.55rem',
                fontSize: '0.68rem',
                fontWeight: 600,
                cursor: 'pointer',
                background: metric === key ? '#ffffff' : 'transparent',
                color: metric === key ? '#0f172a' : '#e2e8f0'
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ borderRadius: '18px', background: 'rgba(15, 23, 42, 0.56)', padding: '0.6rem 0.55rem 0.35rem', border: '1px solid rgba(255,255,255,0.08)' }}>
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="132" role="img" aria-label={`Curva de ${cfg.label}`}>
          <path d={areaPath} fill={cfg.fill} />
          <path d={linePath} fill="none" stroke={cfg.stroke} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          {coords.map((c, i) => (
            <g key={c.month} style={{ cursor: 'pointer' }} onClick={() => setHoverIdx(i)}>
              <circle
                cx={c.x}
                cy={c.y}
                r={i === hoverIdx ? 5.5 : 3.6}
                fill={i === hoverIdx ? cfg.dot : '#e2e8f0'}
                stroke={cfg.dot}
                strokeWidth="1.6"
              />
              <text
                x={c.x}
                y={H - 2}
                textAnchor="middle"
                fill="#cbd5e1"
                fontSize="9.5"
                fontFamily="ui-monospace, monospace"
              >
                {c.month}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}

/**
 * Animated voice bars for Nutrivvo Bot Voice Mode simulation.
 */
export function VoiceWaveVisualizer({ active = false }) {
  const heights = [10, 22, 16, 28, 18, 26, 12, 20, 14];
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', height: '28px' }} aria-hidden="true">
      {heights.map((h, i) => (
        <span
          key={i}
          style={{
            width: '3px',
            height: `${active ? h : 6}px`,
            borderRadius: '999px',
            background: active ? 'linear-gradient(180deg, #00aaff, #8000ff)' : '#94a3b8',
            transition: `height 0.25s ease ${(i * 40) % 240}ms`
          }}
        />
      ))}
    </div>
  );
}
