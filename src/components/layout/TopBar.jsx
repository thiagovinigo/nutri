import React, { useState } from 'react';
import { Flame, Hexagon, Bell } from 'lucide-react';

export default function TopBar({ streak, gems, notifications = [], onOpenNotifications }) {
  const [open, setOpen] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  const handleToggle = () => {
    const next = !open;
    setOpen(next);
    if (next && unreadCount > 0 && onOpenNotifications) onOpenNotifications();
  };

  return (
    <div style={styles.topbar} className="patient-glass">
      {/* Vytal Logo/Brand */}
      <div style={styles.brand}>
        VYTAL
      </div>

      <div style={styles.statsContainer}>
        <div style={{...styles.statItem, color: '#FF4500'}} title="Ofensiva (dias seguidos)">
          <Flame size={20} fill="#FF4500" />
          <span style={styles.statText}>{streak}</span>
        </div>

        <div style={{...styles.statItem, color: '#00E5FF'}} title="Nutri Score">
          <Hexagon size={20} fill="#00E5FF" />
          <span style={styles.statText}>{gems}</span>
        </div>

        <div style={{ position: 'relative' }}>
          <button onClick={handleToggle} style={styles.bellBtn} aria-label="Notificações">
            <Bell size={20} color="var(--patient-text-muted)" />
            {unreadCount > 0 && <span style={styles.badge}>{unreadCount}</span>}
          </button>
          {open && (
            <>
              <div style={styles.backdrop} onClick={() => setOpen(false)} />
              <div style={styles.dropdown} className="patient-glass">
                <strong style={{ fontSize: '0.9rem', color: 'var(--patient-text)' }}>Notificações</strong>
                {notifications.length === 0 ? (
                  <p style={{ color: 'var(--patient-text-muted)', fontSize: '0.85rem', margin: '12px 0 0' }}>Você está em dia!</p>
                ) : (
                  <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '260px', overflowY: 'auto' }}>
                    {notifications.slice().reverse().map(n => (
                      <div key={n.id} style={{ padding: '10px', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.05)', fontSize: '0.85rem', color: 'var(--patient-text)' }}>
                        <div>{n.message}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--patient-text-muted)', marginTop: '4px' }}>{n.date}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  topbar: {
    position: 'sticky',
    top: 0,
    zIndex: 10,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 20px',
    margin: '-20px -20px 20px -20px', // Negate padding of main content to stick to edges
    borderTop: 'none',
    borderLeft: 'none',
    borderRight: 'none',
    borderRadius: '0 0 20px 20px',
  },
  brand: {
    fontSize: '20px',
    fontWeight: '900',
    letterSpacing: '1px',
    background: 'linear-gradient(135deg, var(--primary-color) 0%, #00B4D8 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsContainer: {
    display: 'flex',
    gap: '16px'
  },
  statItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontWeight: '700',
    fontSize: '1.1rem'
  },
  statText: {
    marginTop: '2px'
  },
  bellBtn: {
    position: 'relative',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    padding: '4px'
  },
  badge: {
    position: 'absolute',
    top: '-2px',
    right: '-2px',
    backgroundColor: '#FF4B4B',
    color: 'white',
    fontSize: '10px',
    fontWeight: 700,
    borderRadius: '999px',
    minWidth: '16px',
    height: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 3px'
  },
  backdrop: {
    position: 'fixed',
    inset: 0,
    zIndex: 20
  },
  dropdown: {
    position: 'absolute',
    top: '36px',
    right: 0,
    width: '280px',
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 8px 24px -8px rgba(15,23,42,0.25)',
    padding: '14px',
    zIndex: 21
  }
};
