import React, { useState, useEffect } from 'react';
import { Download, X, Share } from 'lucide-react';

export default function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if the app is already installed
    const _isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
    setIsStandalone(_isStandalone);

    if (_isStandalone) {
      return; // Already installed, do nothing
    }

    // Check for iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const _isIos = /iphone|ipad|ipod/.test(userAgent);
    setIsIos(_isIos);

    if (_isIos) {
      // iOS doesn't support beforeinstallprompt, just show instructions after a delay
      const timer = setTimeout(() => setShowBanner(true), 3000);
      return () => clearTimeout(timer);
    }

    // Android/Desktop: listen to beforeinstallprompt
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowBanner(false);
      }
      setDeferredPrompt(null);
    }
  };

  if (!showBanner || isStandalone) return null;

  return (
    <div className="animate-slide-up" style={{
      position: 'fixed',
      bottom: '90px', // Acima da BottomNav
      left: '20px',
      right: '20px',
      backgroundColor: 'var(--primary-color)',
      color: 'white',
      borderRadius: '16px',
      padding: '16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      boxShadow: '0 10px 25px rgba(16, 185, 129, 0.4)',
      zIndex: 9999
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <h4 style={{ margin: 0, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Download size={18} /> Instale o Vytal App
        </h4>
        <button onClick={() => setShowBanner(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer' }}>
          <X size={20} />
        </button>
      </div>
      
      {isIos ? (
        <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: '1.4' }}>
          Para instalar, toque no botão <strong>Compartilhar</strong> (<Share size={14} style={{ display: 'inline', verticalAlign: 'middle' }}/>) no rodapé do Safari e selecione <strong>Adicionar à Tela de Início</strong>.
        </p>
      ) : (
        <>
          <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: '1.4' }}>
            Tenha acesso rápido ao seu diário e plano alimentar instalando o app no seu celular.
          </p>
          <button 
            onClick={handleInstallClick} 
            className="btn-3d" 
            style={{ 
              backgroundColor: 'white', 
              color: 'var(--primary-shadow)', 
              padding: '10px', 
              fontSize: '0.95rem',
              boxShadow: '0 4px 0 rgba(0,0,0,0.1)'
            }}
          >
            Instalar Agora
          </button>
        </>
      )}
    </div>
  );
}
