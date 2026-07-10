import React, { useState, useRef } from 'react';
import { Flame, Hexagon, Camera, Check, Target, Gift, FileText, Activity, Utensils, Scale, ChevronRight, Sparkles } from 'lucide-react';
import TopBar from '../components/TopBar';
import { useAppContext } from '../context/AppContext';
import OpenAI from 'openai';

// Configuração do OpenAI para rodar no frontend
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true 
});

export default function PatientApp() {
  const { patients, activePatientId, completeQuest, addWeight } = useAppContext();
  const activePatient = patients.find(p => p.id === activePatientId) || patients[0];
  
  const [activeTab, setActiveTab] = useState('missoes'); 
  
  // Photo Logger State
  const [photoUploaded, setPhotoUploaded] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState('');
  const [previewImage, setPreviewImage] = useState(null);
  const fileInputRef = useRef(null);
  
  // Weight Logging State
  const [showWeightInput, setShowWeightInput] = useState(false);
  const [weightInput, setWeightInput] = useState('');

  // Manipulador real de imagem
  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Resetar input para permitir selecionar o mesmo arquivo novamente em caso de erro
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    // Validar tipo de arquivo
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      alert("Formato não suportado. Por favor, envie apenas imagens JPG, PNG ou WEBP.");
      return;
    }

    // Validar tamanho (max 10MB para garantir que a API aceite)
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
          const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
              {
                role: "user",
                content: [
                  { 
                    type: "text", 
                    text: `Você é um avaliador nutricional gamificado. Analise este prato: 1) Liste rapidamente os ingredientes visíveis. 2) Dê um chute educado do peso total estimado em gramas. 3) Diga se é uma escolha adequada considerando que o objetivo do paciente é: ${activePatient.objective}. Mantenha um tom muito animado, encorajador e conciso (máximo de 3 frases), como o mascote do Duolingo faria.` 
                  },
                  { type: "image_url", image_url: { url: base64Image } }
                ]
              }
            ]
          });

          setAiAnalysisResult(response.choices[0].message.content);
          setPhotoUploaded(true);
          completeQuest(activePatient.id, 50); // XP reward via Global State
        } catch (apiError) {
          console.error("Erro na API da OpenAI:", apiError);
          alert("Erro ao analisar a imagem pela IA. Verifique sua chave de API.");
        } finally {
          setAnalyzing(false);
        }
      };

      // Inicia a leitura do arquivo
      reader.readAsDataURL(file);

    } catch (error) {
      console.error(error);
      alert("Erro ao processar a imagem.");
      setAnalyzing(false);
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleWeightSubmit = (e) => {
    e.preventDefault();
    if (weightInput) {
      addWeight(activePatient.id, weightInput);
      setShowWeightInput(false);
      setWeightInput('');
    }
  };

  const lastWeight = activePatient.weights.length > 0 
    ? activePatient.weights[activePatient.weights.length - 1] 
    : { value: '--', date: 'Sem dados' };

  return (
    <div style={styles.appContainer}>
      <TopBar hearts={5} streak={activePatient.streak} gems={activePatient.xp} />

      <div style={styles.content}>
        
        {activeTab === 'missoes' && (
          <div className="animate-pop-in">
            <div style={styles.sectionHeader}>
              <h2 style={{color: 'white'}}>Suas Missões Hoje</h2>
              <p style={{color: 'rgba(255,255,255,0.8)'}}>Olá, {activePatient.name}. Mantenha sua ofensiva!</p>
            </div>

            {/* Quest 1 */}
            <div style={styles.questCard}>
              <div style={styles.questIcon}><Target size={24} color="white" /></div>
              <div style={{flex: 1}}>
                <h4 style={{marginBottom: '4px'}}>Beber 2L de Água</h4>
                <div style={styles.progressBarBg}>
                  <div style={{...styles.progressBarFill, width: '50%'}}></div>
                </div>
                <p style={{fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px'}}>1L / 2L</p>
              </div>
              <button className="btn-3d btn-primary" style={{padding: '8px 12px', fontSize: '0.9rem'}}>+250ml</button>
            </div>

            {/* Quest 2 (Photo Logger Real) */}
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
          </div>
        )}

        {activeTab === 'meu_plano' && (
          <div className="animate-pop-in">
            <h2 style={{marginBottom: '20px'}}>Meu Acompanhamento</h2>

            {/* Weight Logging */}
            <div style={styles.dataCard}>
              <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px'}}>
                <h3 style={{display: 'flex', alignItems: 'center', gap: '8px'}}><Scale size={20} color="var(--primary-shadow)"/> Peso Atual</h3>
                <span style={{fontWeight: 'bold', color: 'var(--primary-color)', fontSize: '1.2rem'}}>{lastWeight.value} kg</span>
              </div>
              <p style={{fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '12px'}}>Último registro em: {lastWeight.date}</p>
              
              {!showWeightInput ? (
                <button className="btn-3d btn-primary" onClick={() => setShowWeightInput(true)} style={{width: '100%', fontSize: '0.9rem'}}>REGISTRAR PESO HOJE</button>
              ) : (
                <form onSubmit={handleWeightSubmit} style={{display: 'flex', gap: '8px'}}>
                  <input type="number" step="0.1" value={weightInput} onChange={e=>setWeightInput(e.target.value)} placeholder="Ex: 70.5" style={styles.input} required autoFocus />
                  <button type="submit" className="btn-3d btn-primary">SALVAR</button>
                </form>
              )}
            </div>

            {/* Recipes */}
            <div style={styles.dataCard}>
              <h3 style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px'}}><Utensils size={20} color="var(--warning-shadow)"/> Receitas do Nutri</h3>
              
              {activePatient.recipes.length === 0 ? (
                <p style={{fontSize: '0.9rem', color: 'var(--text-muted)'}}>Nenhuma dieta cadastrada ainda.</p>
              ) : (
                activePatient.recipes.map((rec, idx) => (
                  <div key={idx} style={styles.listItem}>
                    <div>
                      <strong>{rec.title}</strong>
                      <p style={{fontSize: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'pre-wrap'}}>{rec.desc}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Exams */}
            <div style={styles.dataCard}>
              <h3 style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px'}}><Activity size={20} color="var(--secondary-shadow)"/> Meus Exames</h3>
              {activePatient.exams.length === 0 ? (
                <p style={{fontSize: '0.9rem', color: 'var(--text-muted)'}}>Nenhum exame analisado pelo nutri ainda.</p>
              ) : (
                activePatient.exams.map((ex, idx) => (
                  <div key={idx} style={styles.listItem}>
                    <div>
                      <strong>{ex.title}</strong>
                      <p style={{fontSize: '0.8rem', color: 'var(--danger-color)'}}>{ex.alert}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Medical Records */}
            <div style={styles.dataCard}>
              <h3 style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px'}}><FileText size={20} color="var(--text-muted)"/> Notas do Nutri</h3>
              <div style={{padding: '12px', backgroundColor: 'var(--gray-light)', borderRadius: '12px', fontSize: '0.9rem', whiteSpace: 'pre-wrap'}}>
                {activePatient.records || 'Nenhum recado disponível.'}
              </div>
            </div>

          </div>
        )}

      </div>

      {/* Bottom Nav */}
      <div style={styles.bottomNav}>
        <div onClick={() => setActiveTab('missoes')} style={{...styles.navItem, color: activeTab === 'missoes' ? 'var(--primary-color)' : 'var(--text-muted)'}}>
          <Target size={28} /> Missões
        </div>
        <div onClick={() => setActiveTab('meu_plano')} style={{...styles.navItem, color: activeTab === 'meu_plano' ? 'var(--primary-color)' : 'var(--text-muted)'}}>
          <Activity size={28} /> Plano
        </div>
      </div>
    </div>
  );
}

const styles = {
  appContainer: {
    display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#fcfcfc',
    maxWidth: '500px', margin: '0 auto', borderLeft: '2px solid var(--gray-light)', borderRight: '2px solid var(--gray-light)', position: 'relative'
  },
  content: { flex: 1, overflowY: 'auto', padding: '20px', paddingBottom: '100px' },
  sectionHeader: { backgroundColor: 'var(--primary-color)', color: 'white', padding: '24px 20px', borderRadius: '24px', marginBottom: '24px', boxShadow: '0 4px 0 var(--primary-shadow)' },
  questCard: { backgroundColor: 'white', border: '2px solid var(--gray-light)', borderRadius: '20px', padding: '16px', display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px', boxShadow: '0 4px 0 var(--gray-shadow)' },
  questIcon: { width: '48px', height: '48px', borderRadius: '16px', backgroundColor: 'var(--primary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  progressBarBg: { height: '12px', backgroundColor: 'var(--gray-light)', borderRadius: '6px', overflow: 'hidden', marginTop: '8px' },
  progressBarFill: { height: '100%', backgroundColor: '#1CB0F6', borderRadius: '6px' },
  bottomNav: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'white', display: 'flex', justifyContent: 'space-around', padding: '16px', borderTop: '2px solid var(--gray-light)', borderTopLeftRadius: '24px', borderTopRightRadius: '24px' },
  navItem: { display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: '0.8rem', fontWeight: 'bold', gap: '4px', cursor: 'pointer', transition: 'color 0.2s' },
  dataCard: { backgroundColor: 'white', border: '2px solid var(--gray-light)', borderRadius: '20px', padding: '20px', marginBottom: '16px', boxShadow: '0 4px 0 var(--gray-shadow)' },
  listItem: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '2px solid var(--gray-light)' },
  input: { flex: 1, padding: '10px', borderRadius: '12px', border: '2px solid var(--gray-light)', fontSize: '1rem', outline: 'none', fontFamily: 'inherit' }
};
