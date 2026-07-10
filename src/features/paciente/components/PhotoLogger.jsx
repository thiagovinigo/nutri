import React, { useState, useRef } from 'react';
import { Camera, Check, Sparkles } from 'lucide-react';
import { useAppContext } from '../../../context/AppContext';
import { analyzeFoodImage } from '../../../services/openaiService';

export default function PhotoLogger({ activePatient }) {
  const { completeQuest } = useAppContext();
  const [photoUploaded, setPhotoUploaded] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState('');
  const [previewImage, setPreviewImage] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (fileInputRef.current) fileInputRef.current.value = '';

    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      alert("Formato não suportado. Por favor, envie apenas imagens JPG, PNG ou WEBP.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert("A imagem é muito grande. O tamanho máximo permitido é 10MB.");
      return;
    }

    setAnalyzing(true);
    setPreviewImage(URL.createObjectURL(file));

    try {
      const reader = new FileReader();
      reader.onerror = () => {
        alert("Erro ao tentar ler o arquivo de imagem no seu dispositivo.");
        setAnalyzing(false);
      };
      reader.onload = async () => {
        const base64Image = reader.result;
        try {
          const result = await analyzeFoodImage(base64Image, activePatient.objective);
          setAiAnalysisResult(result);
          setPhotoUploaded(true);
          completeQuest(activePatient.id, 50); 
        } catch (apiError) {
          alert("Erro ao analisar a imagem pela IA. Verifique sua chave de API.");
        } finally {
          setAnalyzing(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      alert("Erro ao processar a imagem.");
      setAnalyzing(false);
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  return (
    <>
      <div style={{...styles.questCard, opacity: photoUploaded ? 0.6 : 1}}>
        <div style={{...styles.questIcon, backgroundColor: photoUploaded ? 'var(--warning-color)' : 'var(--secondary-color)'}}>
          {photoUploaded ? <Check size={24} color="white" /> : <Camera size={24} color="white" />}
        </div>
        <div style={{flex: 1}}>
          <h4 style={{marginBottom: '4px'}}>Diário com IA</h4>
          <p style={{fontSize: '0.8rem', color: 'var(--text-muted)'}}>Tire foto do seu prato real</p>
        </div>
        
        <input 
          type="file" 
          accept="image/*" 
          capture="environment" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          style={{ display: 'none' }} 
        />

        {!photoUploaded ? (
          <button 
            className="btn-3d btn-secondary" 
            style={{padding: '8px 12px', fontSize: '0.9rem'}}
            onClick={triggerFileInput}
            disabled={analyzing}
          >
            {analyzing ? 'ANALISANDO...' : 'FOTOGRAFAR'}
          </button>
        ) : (
          <div style={{fontWeight: 'bold', color: 'var(--warning-shadow)'}}>+50 XP</div>
        )}
      </div>

      {previewImage && analyzing && (
          <div className="animate-pop-in" style={{...styles.questCard, flexDirection: 'column', alignItems: 'center', backgroundColor: '#e0f2fe'}}>
            <img src={previewImage} alt="Prato" style={{width: '100px', height: '100px', objectFit: 'cover', borderRadius: '12px', marginBottom: '12px'}} />
            <h4 style={{color: '#0284c7', display: 'flex', alignItems: 'center', gap: '8px'}} className="animate-bounce">
              <Sparkles size={20} /> IA processando sua refeição...
            </h4>
          </div>
      )}

      {photoUploaded && aiAnalysisResult && (
        <div className="animate-pop-in" style={{...styles.questCard, backgroundColor: '#d7ffb8', borderColor: 'var(--primary-color)', flexDirection: 'column', alignItems: 'flex-start'}}>
          <h4 style={{color: 'var(--primary-shadow)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px'}}>
            <Check size={20} /> IA Analisou seu prato!
          </h4>
          {previewImage && (
            <img src={previewImage} alt="Seu Prato" style={{width: '100%', maxHeight: '150px', objectFit: 'cover', borderRadius: '8px', marginBottom: '12px'}} />
          )}
          <p style={{fontSize: '0.95rem', color: '#4b4b4b', lineHeight: '1.5'}}>
            {aiAnalysisResult}
          </p>
        </div>
      )}
    </>
  );
}

const styles = {
  questCard: { backgroundColor: 'white', border: '2px solid var(--gray-light)', borderRadius: '20px', padding: '16px', display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px', boxShadow: '0 4px 0 var(--gray-shadow)' },
  questIcon: { width: '48px', height: '48px', borderRadius: '16px', backgroundColor: 'var(--primary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
};
