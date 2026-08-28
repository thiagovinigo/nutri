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
//
// 28/08/2026: um PWA instalado mantido em segundo plano nunca re-baixava o
// script do SW, então nunca detectava deploy novo - paciente ficava preso num
// bundle antigo por semanas (relatado: tela e logo antigas de login). Duas
// correções abaixo: (1) checagem periódica de versão enquanto o app está
// aberto; (2) nas rotas sem formulário preenchido (landing e login no
// primeiro paint), a nova versão aplica sozinha depois de alguns segundos em
// vez de depender do clique no toast.

// Rotas onde ainda não há nada digitado pra perder no primeiro paint.
const AUTO_UPDATE_PATHS = new Set(['/', '/login']);
// Espera antes de aplicar sozinho numa rota segura - se o paciente começar a
// digitar/focar um campo nesse meio tempo, cai no toast manual.
const AUTO_UPDATE_DELAY_MS = 5000;
// De quanto em quanto tempo checar por deploy novo com o app aberto.
const UPDATE_CHECK_INTERVAL_MS = 60 * 60 * 1000;

let updateSW;

function hasUnsavedInput() {
  const active = document.activeElement;
  if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.isContentEditable)) {
    return true;
  }
  return Array.from(document.querySelectorAll('input, textarea')).some((el) => el.value && el.value.trim() !== '');
}

function showUpdateToast() {
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
}

function handleNeedRefresh() {
  const path = window.location.pathname;
  if (!AUTO_UPDATE_PATHS.has(path)) {
    showUpdateToast();
    return;
  }
  // Rota segura: aplica sozinho depois do delay, contanto que o paciente não
  // tenha mudado de rota nem começado a preencher um campo nesse meio tempo.
  setTimeout(() => {
    if (window.location.pathname === path && !hasUnsavedInput()) {
      updateSW(true);
    } else {
      showUpdateToast();
    }
  }, AUTO_UPDATE_DELAY_MS);
}

updateSW = registerSW({
  immediate: true,
  onRegisteredSW(_swUrl, registration) {
    if (registration) {
      setInterval(() => { registration.update(); }, UPDATE_CHECK_INTERVAL_MS);
    }
  },
  onNeedRefresh: handleNeedRefresh,
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
