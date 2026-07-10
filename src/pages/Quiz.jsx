import React, { useState } from 'react';
import { X, Heart, Check, XCircle } from 'lucide-react';

const mockQuestions = [
  {
    id: 1,
    question: "Qual macronutriente fornece a maior quantidade de energia por grama?",
    options: ["Proteínas", "Carboidratos", "Lipídios", "Fibras"],
    correctIndex: 2
  },
  {
    id: 2,
    question: "Qual vitamina é crucial para a absorção de cálcio?",
    options: ["Vitamina A", "Vitamina C", "Vitamina D", "Vitamina K"],
    correctIndex: 2
  }
];

export default function Quiz({ nodeData, onFinish, onClose, hearts }) {
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [status, setStatus] = useState('answering'); // 'answering', 'correct', 'incorrect'
  
  const question = mockQuestions[currentQIndex];
  const progress = (currentQIndex / mockQuestions.length) * 100;

  const handleCheck = () => {
    if (selectedOption === null) return;
    
    if (selectedOption === question.correctIndex) {
      setStatus('correct');
    } else {
      setStatus('incorrect');
    }
  };

  const handleNext = () => {
    if (currentQIndex < mockQuestions.length - 1) {
      setCurrentQIndex(prev => prev + 1);
      setSelectedOption(null);
      setStatus('answering');
    } else {
      onFinish(true, 15); // success, earned 15 gems
    }
  };

  const handleFail = () => {
    onFinish(false, 0);
  };

  const isAnswering = status === 'answering';

  return (
    <div style={styles.container}>
      {/* Quiz Top Bar */}
      <div style={styles.topBar}>
        <button onClick={onClose} style={styles.closeBtn}><X size={24} color="var(--text-muted)"/></button>
        <div style={styles.progressContainer}>
          <div style={{...styles.progressBar, width: `${progress}%`}}>
            <div style={styles.progressHighlight}></div>
          </div>
        </div>
        <div style={styles.hearts}>
          <Heart size={24} fill="var(--danger-color)" color="var(--danger-color)" />
          <span>{hearts}</span>
        </div>
      </div>

      {/* Question Content */}
      <div style={styles.content}>
        <h1 style={styles.questionText}>{question.question}</h1>
        
        <div style={styles.optionsContainer}>
          {question.options.map((opt, idx) => {
            let btnClass = "btn-3d";
            let customStyle = { ...styles.optionBtn };
            
            if (selectedOption === idx) {
              if (status === 'answering') {
                customStyle = { ...customStyle, backgroundColor: '#ddf4ff', borderColor: 'var(--secondary-color)', color: 'var(--secondary-color)', boxShadow: '0 4px 0 var(--secondary-shadow)' };
              } else if (status === 'correct') {
                customStyle = { ...customStyle, backgroundColor: '#d7ffb8', borderColor: 'var(--primary-color)', color: 'var(--primary-shadow)', boxShadow: '0 4px 0 var(--primary-shadow)' };
              } else if (status === 'incorrect') {
                customStyle = { ...customStyle, backgroundColor: '#ffdfdf', borderColor: 'var(--danger-color)', color: 'var(--danger-shadow)', boxShadow: '0 4px 0 var(--danger-shadow)' };
              }
            } else if (status !== 'answering') {
              customStyle = { ...customStyle, opacity: 0.5 };
            }

            return (
              <button 
                key={idx}
                className="btn-3d"
                style={customStyle}
                onClick={() => isAnswering && setSelectedOption(idx)}
                disabled={!isAnswering}
              >
                {opt}
              </button>
            )
          })}
        </div>
      </div>

      {/* Bottom Feedback Sheet */}
      <div style={{
        ...styles.bottomSheet, 
        transform: isAnswering ? 'translateY(100%)' : 'translateY(0)',
        backgroundColor: status === 'correct' ? '#d7ffb8' : '#ffdfdf'
      }}>
        <div style={styles.feedbackContent}>
          <div style={styles.feedbackText}>
            {status === 'correct' ? (
              <div style={{display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary-shadow)', fontSize: '1.5rem'}}>
                <Check size={32} /> <strong>Correto!</strong>
              </div>
            ) : (
              <div style={{display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--danger-shadow)', fontSize: '1.5rem'}}>
                <XCircle size={32} /> <strong>Incorreto!</strong>
              </div>
            )}
          </div>
          
          <button 
            className="btn-3d"
            style={{
              width: '100%', 
              backgroundColor: status === 'correct' ? 'var(--primary-color)' : 'var(--danger-color)',
              boxShadow: `0 4px 0 ${status === 'correct' ? 'var(--primary-shadow)' : 'var(--danger-shadow)'}`,
              color: 'white',
              fontSize: '1.2rem',
              padding: '16px'
            }}
            onClick={status === 'correct' ? handleNext : handleFail}
          >
            {status === 'correct' ? 'CONTINUAR' : 'ENTENDI'}
          </button>
        </div>
      </div>

      {/* Action Button (Check) */}
      {isAnswering && (
        <div style={styles.actionContainer}>
          <button 
            className={`btn-3d ${selectedOption !== null ? 'btn-primary' : 'btn-disabled'}`}
            style={{width: '100%', padding: '16px', fontSize: '1.2rem'}}
            onClick={handleCheck}
            disabled={selectedOption === null}
          >
            VERIFICAR
          </button>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'var(--bg-color)',
    zIndex: 200,
    display: 'flex',
    flexDirection: 'column',
  },
  topBar: {
    display: 'flex',
    alignItems: 'center',
    padding: '20px',
    gap: '16px',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
  },
  progressContainer: {
    flex: 1,
    height: '16px',
    backgroundColor: 'var(--gray-light)',
    borderRadius: '8px',
    overflow: 'hidden',
    position: 'relative'
  },
  progressBar: {
    height: '100%',
    backgroundColor: 'var(--primary-color)',
    borderRadius: '8px',
    transition: 'width 0.3s ease-out',
    position: 'relative'
  },
  progressHighlight: {
    position: 'absolute',
    top: '2px',
    left: '8px',
    right: '8px',
    height: '4px',
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: '2px'
  },
  hearts: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    color: 'var(--danger-color)',
    fontWeight: 'bold',
    fontSize: '1.1rem'
  },
  content: {
    flex: 1,
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    maxWidth: '600px',
    margin: '0 auto',
    width: '100%'
  },
  questionText: {
    fontSize: '1.8rem',
    fontWeight: 'bold',
    marginBottom: '40px',
    marginTop: '20px'
  },
  optionsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  optionBtn: {
    backgroundColor: 'white',
    color: 'var(--text-main)',
    border: '2px solid var(--gray-light)',
    boxShadow: '0 4px 0 var(--gray-shadow)',
    textAlign: 'left',
    justifyContent: 'flex-start',
    padding: '16px 20px',
    fontSize: '1.1rem',
    transition: 'all 0.2s',
    textTransform: 'none'
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: '24px 20px',
    paddingBottom: 'max(24px, env(safe-area-inset-bottom))',
    transition: 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    zIndex: 201,
  },
  feedbackContent: {
    maxWidth: '600px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px'
  },
  actionContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: '24px 20px',
    paddingBottom: 'max(24px, env(safe-area-inset-bottom))',
    maxWidth: '640px',
    margin: '0 auto'
  }
};
