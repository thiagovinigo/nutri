import React from 'react';

/**
 * Presentational puro - tabela de nutricionistas entre todos os tenants.
 * @param {{ nutris: Array, loading: boolean }} props
 */
export default function UsersPanel({ nutris, loading }) {
  if (loading) return <p style={{ color: 'var(--crm-text-muted)' }}>Carregando usuários...</p>;
  if (!nutris || nutris.length === 0) return <p style={{ color: 'var(--crm-text-muted)' }}>Nenhum nutricionista cadastrado.</p>;

  return (
    <div style={{ overflowX: 'auto' }}>
      <table className="crm-table">
        <thead>
          <tr>
            <th>Nome</th>
            <th>E-mail</th>
            <th>CRN</th>
            <th>Pacientes ativos</th>
            <th>Fichas provisórias</th>
          </tr>
        </thead>
        <tbody>
          {nutris.map(n => (
            <tr key={n.id}>
              <td>{n.name || '—'}</td>
              <td>{n.email || '—'}</td>
              <td>{n.crn || '—'}</td>
              <td>{n.pacientesAtivos}</td>
              <td>{n.pacientesInativos}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
