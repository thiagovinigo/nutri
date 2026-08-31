import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { adminWhoami, adminGetMetrics, adminListNutris, adminListConflicts, adminResolveConflict } from '../../../utils/adminApi';
import MetricsPanel from '../components/MetricsPanel';
import UsersPanel from '../components/UsersPanel';
import ConflictsPanel from '../components/ConflictsPanel';

const TABS = [
  { id: 'metrics', label: 'Métricas' },
  { id: 'users', label: 'Usuários' },
  { id: 'conflicts', label: 'Conflitos' },
];

// Console de admin V1 - dono único do sistema, não um dos nutricionistas.
// A autorização de verdade é 100% server-side (env var ADMIN_UID em
// api/admin.js) - esta página só faz um "whoami" ao montar pra decidir se
// mostra o painel ou manda embora; nunca confia em estado do client pra
// esconder dado sensível (ver react/security.md).
export default function AdminDashboard() {
  const navigate = useNavigate();
  const [authorized, setAuthorized] = useState(null); // null = checando, true/false = resultado
  const [tab, setTab] = useState('metrics');

  const [metrics, setMetrics] = useState(null);
  const [metricsLoading, setMetricsLoading] = useState(false);
  const [nutris, setNutris] = useState(null);
  const [nutrisLoading, setNutrisLoading] = useState(false);
  const [conflicts, setConflicts] = useState(null);
  const [conflictsLoading, setConflictsLoading] = useState(false);

  useEffect(() => {
    adminWhoami()
      .then(() => setAuthorized(true))
      .catch(() => {
        setAuthorized(false);
        navigate('/', { replace: true });
      });
  }, [navigate]);

  const loadMetrics = useCallback(() => {
    setMetricsLoading(true);
    adminGetMetrics().then(setMetrics).catch(e => toast.error(e.message)).finally(() => setMetricsLoading(false));
  }, []);

  const loadNutris = useCallback(() => {
    setNutrisLoading(true);
    adminListNutris().then(d => setNutris(d.nutris)).catch(e => toast.error(e.message)).finally(() => setNutrisLoading(false));
  }, []);

  const loadConflicts = useCallback(() => {
    setConflictsLoading(true);
    adminListConflicts().then(d => setConflicts(d.groups)).catch(e => toast.error(e.message)).finally(() => setConflictsLoading(false));
  }, []);

  // Busca lazy - só ao abrir a aba pela primeira vez.
  useEffect(() => {
    if (!authorized) return;
    if (tab === 'metrics' && metrics === null) loadMetrics();
    if (tab === 'users' && nutris === null) loadNutris();
    if (tab === 'conflicts' && conflicts === null) loadConflicts();
  }, [authorized, tab, metrics, nutris, conflicts, loadMetrics, loadNutris, loadConflicts]);

  const handleResolve = async (keepId, archiveId) => {
    try {
      await adminResolveConflict(keepId, archiveId);
      toast.success('Conflito resolvido.');
      loadConflicts();
    } catch (e) {
      toast.error(e.message);
    }
  };

  if (authorized === null) {
    return <div style={{ padding: '40px', color: 'var(--crm-text-muted)' }}>Verificando acesso...</div>;
  }
  if (authorized === false) {
    return null; // já está navegando pra '/'
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--crm-bg)', padding: '24px' }}>
      <h1 style={{ color: 'var(--crm-text-main)', marginBottom: '16px' }}>Admin</h1>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        {TABS.map(t => (
          <button
            key={t.id}
            type="button"
            className={tab === t.id ? 'crm-btn-primary' : 'crm-btn-secondary'}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'metrics' && <MetricsPanel metrics={metrics} loading={metricsLoading} />}
      {tab === 'users' && <UsersPanel nutris={nutris} loading={nutrisLoading} />}
      {tab === 'conflicts' && <ConflictsPanel groups={conflicts} loading={conflictsLoading} onResolve={handleResolve} />}
    </div>
  );
}
