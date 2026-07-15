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
    <nav style={styles.navContainer} className="glass-panel" aria-label="Navegação principal">
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
              color: isActive ? 'var(--primary-color)' : 'var(--text-muted)',
              background: isActive ? 'rgba(88, 204, 2, 0.1)' : 'transparent'
            }}
          >
            <span style={{ transform: isActive ? 'scale(1.1)' : 'scale(1)', transition: 'transform 0.2s' }}>{item.icon}</span>
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
    padding: '12px 10px',
    paddingBottom: 'max(12px, env(safe-area-inset-bottom))',
    borderTop: '1px solid #e2e8f0',
    backgroundColor: '#ffffff',
    borderRadius: '20px 20px 0 0',
    zIndex: 100,
  },
  navItem: {
    border: 'none',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '2px',
    padding: '6px 14px',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  navLabel: {
    fontSize: '11px',
    fontWeight: 700,
  }
};
