import React from 'react';
import { Home, ClipboardList, BookOpen, User, MessageCircle } from 'lucide-react';

export default function BottomNav({ currentView, setCurrentView }) {
  const navItems = [
    { id: 'home', icon: <Home size={28} />, label: 'Início' },
    { id: 'diet', icon: <ClipboardList size={28} />, label: 'Plano' },
    { id: 'recipes', icon: <BookOpen size={28} />, label: 'Receitas' },
    { id: 'quests', icon: <MessageCircle size={28} />, label: 'Nutri-Bot' },
    { id: 'profile', icon: <User size={28} />, label: 'Perfil' }
  ];

  return (
    <nav style={styles.navContainer} className="patient-glass" aria-label="Navegação principal">
      {navItems.map(item => {
        const isActive = currentView === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setCurrentView(item.id)}
            aria-label={item.label}
            aria-current={isActive ? 'page' : undefined}
            style={{
              ...styles.navItem,
              color: isActive ? 'var(--primary-color)' : 'var(--patient-text-muted)',
              background: isActive ? 'rgba(0, 229, 255, 0.1)' : 'transparent',
              textShadow: isActive ? '0 0 10px rgba(0, 229, 255, 0.4)' : 'none'
            }}
          >
            <span style={{ transform: isActive ? 'scale(1.15)' : 'scale(1)', transition: 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}>{item.icon}</span>
            <span style={styles.navLabel}>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

const styles = {
  navContainer: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    display: 'flex',
    justifyContent: 'space-around',
    padding: '16px 10px',
    paddingBottom: 'max(16px, env(safe-area-inset-bottom))',
    borderTop: 'none',
    borderBottom: 'none',
    borderLeft: 'none',
    borderRight: 'none',
    borderRadius: '24px 24px 0 0',
    zIndex: 100,
  },
  navItem: {
    border: 'none',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    padding: '8px 16px',
    borderRadius: '16px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  navLabel: {
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '0.5px'
  }
};
