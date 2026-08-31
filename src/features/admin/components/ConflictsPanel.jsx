import React, { useState } from 'react';

/**
 * Presentational + a chamada de ação em si (fica local pra controlar o
 * estado "resolvendo" por par de botão sem subir isso pro container). Grupos
 * com 3+ pacientes resolvem um par por clique - depois de arquivar, o
 * container recarrega a lista e o restante aparece de novo se ainda houver
 * duplicata (auto-corretivo, sem precisar de UI pra escolher "qual outro").
 * @param {{ groups: Array, loading: boolean, onResolve: (keepId: string, archiveId: string) => Promise<void> }} props
 */
export default function ConflictsPanel({ groups, loading, onResolve }) {
  const [resolvingId, setResolvingId] = useState(null);

  if (loading) return <p style={{ color: 'var(--crm-text-muted)' }}>Procurando conflitos...</p>;
  if (!groups || groups.length === 0) {
    return <p style={{ color: 'var(--crm-text-muted)' }}>Nenhum conflito de CPF encontrado entre pacientes ativos. 🎉</p>;
  }

  const handleKeep = async (keepId, archiveId) => {
    setResolvingId(archiveId);
    try {
      await onResolve(keepId, archiveId);
    } finally {
      setResolvingId(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {groups.map(group => (
        <div key={group.cpfDigits} className="crm-card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--crm-text-muted)', marginBottom: '10px' }}>
            CPF ***.{group.cpfDigits.slice(3, 6)}.{group.cpfDigits.slice(6, 9)}-**
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            {group.patients.map(p => (
              <div key={p.id} style={{ flex: '1 1 220px', border: '1px solid var(--crm-border)', borderRadius: '8px', padding: '12px' }}>
                <div style={{ fontWeight: 'bold', color: 'var(--crm-text-main)' }}>{p.name || '(sem nome)'}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--crm-text-muted)' }}>{p.email || '—'}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--crm-text-muted)' }}>Nutri: {p.nutricionistaNome}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--crm-text-muted)', marginBottom: '10px' }}>
                  🔥 {p.streak}d · {p.xp}xp
                </div>
                <button
                  type="button"
                  className="crm-btn-primary"
                  disabled={resolvingId !== null}
                  onClick={() => {
                    const outro = group.patients.find(other => other.id !== p.id);
                    if (!outro) return;
                    handleKeep(p.id, outro.id);
                  }}
                >
                  {resolvingId ? 'Aguarde...' : 'Manter este, arquivar o outro'}
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
