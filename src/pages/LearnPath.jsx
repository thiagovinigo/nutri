import React from 'react';
import { Star, Check } from 'lucide-react';

const mockPath = [
  { id: 1, title: 'Macronutrientes', status: 'completed', type: 'core' },
  { id: 2, title: 'Vitaminas', status: 'completed', type: 'core' },
  { id: 3, title: 'Minerais', status: 'active', type: 'core' },
  { id: 4, title: 'Dietoterapia', status: 'locked', type: 'core' },
  { id: 5, title: 'Suplementos', status: 'locked', type: 'core' },
  { id: 6, title: 'Casos Clínicos', status: 'locked', type: 'bonus' },
];

export default function LearnPath({ onStartNode }) {
  return (
    <div style={styles.container}>
      <div style={styles.sectionHeader}>
        <h2>Fundamentos da Nutrição</h2>
        <p>Unidade 1</p>
      </div>

      <div style={styles.pathContainer}>
        {mockPath.map((node, index) => {
          // Create a winding path using sin wave
          const offset = Math.sin(index * 0.8) * 60;
          
          let bgColor = 'var(--gray-light)';
          let shadowColor = 'var(--gray-shadow)';
          let icon = <Star fill="white" color="white" />;
          let isBounce = false;

          if (node.status === 'completed') {
            bgColor = 'var(--warning-color)';
            shadowColor = 'var(--warning-shadow)';
            icon = <Check strokeWidth={3} color="white" />;
          } else if (node.status === 'active') {
            bgColor = 'var(--primary-color)';
            shadowColor = 'var(--primary-shadow)';
            icon = <Star fill="white" color="white" />;
            isBounce = true;
          }

          return (
            <div key={node.id} style={{...styles.nodeWrapper, transform: `translateX(${offset}px)`}}>
              {node.status === 'active' && (
                <div className="animate-pop-in" style={styles.tooltip}>
                  <div style={styles.tooltipBubble}>
                    <span>Começar</span>
                  </div>
                </div>
              )}
              
              <button 
                className={`btn-3d ${isBounce ? 'animate-bounce' : ''}`}
                onClick={() => node.status !== 'locked' && onStartNode(node)}
                style={{
                  ...styles.nodeBtn,
                  backgroundColor: bgColor,
                  boxShadow: `0 8px 0 ${shadowColor}`,
                  opacity: node.status === 'locked' ? 0.7 : 1,
                  cursor: node.status === 'locked' ? 'not-allowed' : 'pointer'
                }}
              >
                {icon}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
  },
  sectionHeader: {
    backgroundColor: 'var(--primary-color)',
    color: 'white',
    width: '100%',
    padding: '24px 20px',
    borderRadius: '24px',
    marginBottom: '40px',
    boxShadow: '0 4px 0 var(--primary-shadow)',
  },
  pathContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '40px',
    paddingBottom: '40px',
    width: '100%',
  },
  nodeWrapper: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  nodeBtn: {
    width: '80px',
    height: '80px',
    borderRadius: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '4px solid rgba(255,255,255,0.3)',
    zIndex: 2,
  },
  tooltip: {
    position: 'absolute',
    top: '-50px',
    zIndex: 3,
  },
  tooltipBubble: {
    backgroundColor: 'white',
    padding: '8px 16px',
    borderRadius: '12px',
    fontWeight: 'bold',
    color: 'var(--primary-color)',
    border: '2px solid var(--gray-light)',
    position: 'relative',
    textTransform: 'uppercase',
    letterSpacing: '1px'
  }
};
