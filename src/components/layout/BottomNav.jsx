import React from 'react';
import { Home, Shield, Target, User } from 'lucide-react';

export default function BottomNav({ currentView, setCurrentView }) {
  const navItems = [
    { id: 'learn', icon: <Home size={28} />, label: 'Aprender' },
    { id: 'leaderboard', icon: <Shield size={28} />, label: 'Ranking' },
    { id: 'quests', icon: <Target size={28} />, label: 'Missões' },
    { id: 'profile', icon: <User size={28} />, label: 'Perfil' }
  ];

  return (
    <div style={styles.navContainer} className="glass-panel">
      {navItems.map(item => {
        const isActive = currentView === item.id;
        return (
          <button 
            key={item.id}
            onClick={() => setCurrentView(item.id)}
            style={{
              ...styles.navItem,
              color: isActive ? 'var(--primary-color)' : 'var(--text-muted)',
              transform: isActive ? 'scale(1.1)' : 'scale(1)',
              background: isActive ? 'rgba(88, 204, 2, 0.1)' : 'transparent'
            }}
          >
            {item.icon}
          </button>
        );
      })}
    </div>
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
    borderBottom: 'none',
    borderLeft: 'none',
    borderRight: 'none',
    borderRadius: '20px 20px 0 0',
    zIndex: 100,
  },
  navItem: {
    border: 'none',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '8px 16px',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  }
};
