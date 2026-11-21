import React from 'react';

export function NoemaBrandMark({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" aria-hidden="true" style={{ flexShrink: 0 }}>
      <rect x="0" y="0" width="22" height="120" rx="6" fill="currentColor" />
      <rect x="98" y="0" width="22" height="120" rx="6" fill="currentColor" />
      <polygon points="22,4 62,4 120,116 80,116" fill="currentColor" />
    </svg>
  );
}

export function NoemaRadar360Svg({ activeStatus = 'ativo' }) {
  return (
    <svg viewBox="0 0 180 180" width="180" height="180" aria-hidden="true" style={{ margin: '0 auto', display: 'block' }}>
      <circle cx="90" cy="90" r="82" fill="rgba(108, 99, 255, 0.04)" stroke="var(--n-border)" strokeWidth="1" />
      <circle cx="90" cy="90" r="56" fill="none" stroke="var(--n-border)" strokeWidth="1" strokeDasharray="3 4" />
      <circle cx="90" cy="90" r="28" fill="none" stroke="var(--n-border)" strokeWidth="1" />
      <line x1="8" y1="90" x2="172" y2="90" stroke="var(--n-border)" strokeWidth="1" />
      <line x1="90" y1="8" x2="90" y2="172" stroke="var(--n-border)" strokeWidth="1" />

      <g className="noema-radar-sweep">
        <path d="M90,90 L90,8 A82,82 0 0,1 162,49 Z" fill="rgba(108, 99, 255, 0.22)" />
        <line x1="90" y1="90" x2="90" y2="8" stroke="var(--n-signal)" strokeWidth="2" />
      </g>

      <circle cx="132" cy="52" r={activeStatus === 'risco' ? 8 : 6} fill="var(--n-danger)" />
      <circle cx="56" cy="126" r={activeStatus === 'atencao' ? 8 : 6} fill="var(--n-warn)" />
      <circle cx="62" cy="56" r={activeStatus === 'ativo' ? 8 : 6} fill="var(--n-live)" />
      <circle cx="90" cy="90" r="4" fill="var(--n-signal)" />
    </svg>
  );
}

export function NoemaBiomarkersSvg({ biomarkers }) {
  const visits = biomarkers?.visits || ['Mai', 'Jul', 'Set', 'Nov'];
  const lean = biomarkers?.leanMass || [44.2, 45.1, 46.4, 47.6];
  const fat = biomarkers?.bodyFat || [29.8, 27.4, 24.9, 22.8];

  const xs = visits.length === 1 ? [280] : visits.map((_, i) => 64 + i * (420 / Math.max(1, visits.length - 1)));
  const mapLeanY = (v) => Math.max(24, Math.min(148, 152 - (v - 34) * 5.2));
  const mapFatY = (v) => Math.max(24, Math.min(148, 152 - (v - 10) * 4.2));

  const leanPoints = lean.map((v, i) => `${xs[i]},${mapLeanY(v).toFixed(1)}`).join(' ');
  const fatPoints = fat.map((v, i) => `${xs[i]},${mapFatY(v).toFixed(1)}`).join(' ');

  return (
    <svg viewBox="0 0 560 192" width="100%" height="192" role="img" aria-label="Evolução de Massa Magra e Gordura Corporal">
      {[32, 72, 112, 152].map((y) => (
        <line key={y} x1="40" y1={y} x2="520" y2={y} stroke="var(--n-line)" strokeWidth="1" strokeDasharray={y === 152 ? undefined : '3 4'} />
      ))}

      {lean.length > 1 && (
        <>
          <polyline fill="none" stroke="var(--n-live)" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" points={leanPoints} />
          <polyline fill="none" stroke="var(--n-signal)" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="6 4" points={fatPoints} />
        </>
      )}

      {lean.map((v, i) => (
        <g key={visits[i]}>
          <circle cx={xs[i]} cy={mapLeanY(v)} r="5" fill="var(--n-live)" />
          <circle cx={xs[i]} cy={mapFatY(fat[i])} r="5" fill="var(--n-signal)" />
          <text x={xs[i]} y="176" textAnchor="middle" fill="var(--n-fg-muted)" fontSize="11.5" fontFamily="var(--n-font-mono)">
            {visits[i]} ({v}% / {fat[i]}%)
          </text>
        </g>
      ))}
    </svg>
  );
}

export function NoemaRingSvg({ percent = 70, size = 64 }) {
  const r = 24;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(100, percent));
  const dash = ((clamped / 100) * c).toFixed(1);
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} aria-hidden="true" style={{ flexShrink: 0 }}>
      <circle cx="32" cy="32" r={r} fill="none" stroke="var(--n-border)" strokeWidth="5" />
      <circle
        cx="32"
        cy="32"
        r={r}
        fill="none"
        stroke="var(--n-signal)"
        strokeWidth="5"
        strokeDasharray={`${dash} ${c.toFixed(1)}`}
        strokeLinecap="round"
        transform="rotate(-90 32 32)"
      />
      <text x="32" y="36" textAnchor="middle" fill="var(--n-fg)" fontSize="12.5" fontWeight="700" fontFamily="var(--n-font-mono)">
        {Math.round(clamped)}%
      </text>
    </svg>
  );
}
