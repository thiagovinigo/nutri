import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// A atualização do Service Worker (via autoUpdate do vite-plugin-pwa)
// agora acontece de forma silenciosa. Removemos o window.location.reload()
// forçado no 'controllerchange' para evitar que a página recarregue
// abruptamente enquanto o usuário está preenchendo formulários (ex: Login).

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
