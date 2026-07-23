import React, { useRef } from 'react';
import { Share2, X, Star } from 'lucide-react';

export default function ShareableMilestone({ onClose }) {
  const cardRef = useRef(null);

  const handleShare = async () => {
    // Em produção, isso usaria html2canvas ou Web Share API
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Vytal App - Dia Perfeito!',
          text: 'Mais um dia de Alta Performance concluído 100% no meu projeto nutricional! 🚀🍏',
        });
      } catch (err) {
        console.log('Cancelado ou erro no share', err);
      }
    } else {
      alert("Print a tela e poste no Instagram marcando seu Nutri! 📸");
    }
  };

  return (
    <div style={styles.overlay} className="animate-pop-in">
      <div style={styles.cardContainer} ref={cardRef}>
        <button onClick={onClose} style={styles.closeBtn}><X size={24} color='var(--crm-surface)' /></button>
        
        <div style={styles.hologramCard} className="animate-pulse-glow">
          <div style={styles.shineLayer}></div>
          <Star size={48} color="#FFD700" fill="#FFD700" style={{marginBottom: '16px'}} />
          <h2 style={{fontSize: '2rem', margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '2px', background: 'linear-gradient(90deg, #FFD700, #FFA500)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>100% Concluído</h2>
          <p style={{fontSize: '1.1rem', color: 'var(--crm-border)', margin: '0 0 24px 0'}}>Dia Perfeito de Alta Performance</p>
          
          <div style={styles.statsRow}>
            <div style={styles.statBox}>
              <span style={styles.statVal}>100%</span>
              <span style={styles.statLbl}>Adesão</span>
            </div>
            <div style={styles.statBox}>
              <span style={styles.statVal}>+20</span>
              <span style={styles.statLbl}>XP</span>
            </div>
          </div>
          
          <p style={{fontSize: '0.8rem', color: 'var(--crm-text-muted)', marginTop: '24px', letterSpacing: '1px'}}>VYTAL PERFORMANCE</p>
        </div>

        <button className="btn-3d btn-primary" style={{width: '100%', marginTop: '24px', fontSize: '1.2rem', padding: '16px'}} onClick={handleShare}>
          <Share2 size={20} style={{marginRight: '8px'}} /> COMPARTILHAR
        </button>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(11, 13, 18, 0.95)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 9999, padding: '20px'
  },
  cardContainer: {
    width: '100%', maxWidth: '380px', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center'
  },
  closeBtn: {
    position: 'absolute', top: '-40px', right: '0px',
    background: 'transparent', border: 'none', cursor: 'pointer', opacity: 0.8
  },
  hologramCard: {
    width: '100%',
    aspectRatio: '3/4',
    background: 'linear-gradient(135deg, #1C1F26 0%, #252A34 100%)',
    borderRadius: '24px',
    border: '1px solid rgba(255, 215, 0, 0.3)',
    boxShadow: '0 20px 50px rgba(0,0,0,0.5), inset 0 0 60px rgba(255, 215, 0, 0.1)',
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    position: 'relative', overflow: 'hidden', padding: '30px', textAlign: 'center'
  },
  shineLayer: {
    position: 'absolute', top: '-100%', left: '-100%', right: '-100%', bottom: '-100%',
    background: 'linear-gradient(45deg, transparent 40%, rgba(255,255,255,0.1) 50%, transparent 60%)',
    animation: 'shimmer 4s infinite linear'
  },
  statsRow: { display: 'flex', gap: '20px', width: '100%', justifyContent: 'center' },
  statBox: { backgroundColor: 'rgba(0,0,0,0.3)', padding: '12px 20px', borderRadius: '16px', display: 'flex', flexDirection: 'column', border: '1px solid rgba(255,255,255,0.05)' },
  statVal: { fontSize: '1.5rem', fontWeight: '900', color: 'var(--crm-surface)' },
  statLbl: { fontSize: '0.75rem', color: 'var(--crm-text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }
};
