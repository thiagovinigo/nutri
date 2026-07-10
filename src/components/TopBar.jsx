import React from 'react';
import { Heart, Flame, Hexagon } from 'lucide-react';

export default function TopBar({ hearts, streak, gems }) {
  return (
    <div style={styles.topbar} className="glass-panel">
      {/* Flag / Course Selector (Mock) */}
      <div style={styles.courseIcon}>
        🍏
      </div>
      
      {/* Stats */}
      <div style={styles.statsContainer}>
        <div style={{...styles.statItem, color: '#FF9600'}}>
          <Flame size={20} fill="#FF9600" />
          <span style={styles.statText}>{streak}</span>
        </div>
        
        <div style={{...styles.statItem, color: '#1CB0F6'}}>
          <Hexagon size={20} fill="#1CB0F6" />
          <span style={styles.statText}>{gems}</span>
        </div>
        
        <div style={{...styles.statItem, color: '#FF4B4B'}}>
          <Heart size={20} fill="#FF4B4B" />
          <span style={styles.statText}>{hearts}</span>
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
  courseIcon: {
    fontSize: '24px',
    background: '#E5E5E5',
    width: '40px',
    height: '40px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '2px solid #CECECE'
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
  }
};
