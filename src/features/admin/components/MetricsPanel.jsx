import React from 'react';

const cardStyle = {
  padding: '20px',
  minWidth: '160px',
  flex: '1 1 160px',
};

const labelStyle = { fontSize: '0.85rem', color: 'var(--crm-text-muted)', marginBottom: '6px' };
const valueStyle = { fontSize: '2rem', fontWeight: 'bold', color: 'var(--crm-text-main)' };

/**
 * Presentational puro - recebe as métricas já buscadas por AdminDashboard.
 * @param {{ metrics: { nutrisAtivos: number, pacientesAtivos: number, pacientesInativos: number, streakMedio: number, xpMedio: number } | null, loading: boolean }} props
 */
export default function MetricsPanel({ metrics, loading }) {
  if (loading) return <p style={{ color: 'var(--crm-text-muted)' }}>Carregando métricas...</p>;
  if (!metrics) return null;

  const cards = [
    { label: 'Nutricionistas ativos', value: metrics.nutrisAtivos },
    { label: 'Pacientes ativos', value: metrics.pacientesAtivos },
    { label: 'Fichas provisórias (inativo)', value: metrics.pacientesInativos },
    { label: 'Streak médio', value: `${metrics.streakMedio}d` },
    { label: 'XP médio', value: metrics.xpMedio },
  ];

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
      {cards.map(c => (
        <div key={c.label} className="crm-card" style={cardStyle}>
          <div style={labelStyle}>{c.label}</div>
          <div style={valueStyle}>{c.value}</div>
        </div>
      ))}
    </div>
  );
}
