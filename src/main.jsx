import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import toast from 'react-hot-toast'
import './index.css'
import App from './App.jsx'

// registerType: 'prompt' (vite.config.js) + injectRegister: false: o Service
// Worker novo baixa em segundo plano mas NUNCA assume sozinho - só quando o
// paciente confirma pelo toast abaixo, ou na próxima vez que o app for
// aberto do zero. Antes (autoUpdate + skipWaiting + clientsClaim), um deploy
// novo podia forçar reload da página no meio do login, apagando o que o
// paciente tinha digitado (relatado em 13/08/2026).
const updateSW = registerSW({
  immediate: true,
  onNeedRefresh() {
    toast((t) => (
      <span style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        Nova versão disponível.
        <button
          onClick={() => { toast.dismiss(t.id); updateSW(true); }}
          style={{ background: 'var(--primary-color, #3949AB)', color: '#fff', border: 'none', borderRadius: '6px', padding: '6px 12px', cursor: 'pointer', fontWeight: 600 }}
        >
          Atualizar
        </button>
      </span>
    ), { duration: Infinity });
  },
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
