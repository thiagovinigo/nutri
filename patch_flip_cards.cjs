const fs = require('fs');

// --- 1. Patch CSS ---
let cssCode = fs.readFileSync('src/index.css', 'utf8');
const flipCss = `
/* Flip Card Component */
.flip-card {
  perspective: 1000px;
  width: 100%;
}
.flip-card-inner {
  display: grid;
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  transform-style: preserve-3d;
}
.flip-card.flipped .flip-card-inner {
  transform: rotateY(180deg);
}
.flip-card-front, .flip-card-back {
  grid-area: 1 / 1;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  width: 100%;
}
.flip-card-front {
  z-index: 2;
  align-self: start;
}
.flip-card-back {
  transform: rotateY(180deg);
  background-color: var(--crm-surface);
  border-radius: 12px;
  padding: 20px;
  border: 2px solid #8b5cf6;
  max-height: 500px;
  overflow-y: auto;
  box-shadow: 0 10px 25px rgba(139, 92, 246, 0.2);
  align-self: start;
}
.ai-synthesis h2, .ai-synthesis h3 {
  color: var(--crm-text-main);
  margin-top: 12px;
}
.ai-synthesis p, .ai-synthesis li {
  color: var(--crm-text-main);
}
`;
if (!cssCode.includes('.flip-card {')) {
  fs.writeFileSync('src/index.css', cssCode + '\n' + flipCss, 'utf8');
}


// --- 2. Patch DietPlan.jsx ---
let code = fs.readFileSync('src/features/paciente/components/DietPlan.jsx', 'utf8');

// Add flippedCards state
if (!code.includes("const [flippedCards, setFlippedCards]")) {
  code = code.replace(
    "const [recipeModal, setRecipeModal] = useState(null);",
    "const [recipeModal, setRecipeModal] = useState(null);\n  const [flippedCards, setFlippedCards] = useState({});"
  );
}

// Helper to flip
const flipHelper = `
  const toggleFlip = (mIdx) => {
    setFlippedCards(prev => ({ ...prev, [mIdx]: !prev[mIdx] }));
  };
`;
if (!code.includes("const toggleFlip")) {
  code = code.replace(
    "const handleGenerateRecipe",
    flipHelper + "\n  const handleGenerateRecipe"
  );
}

// Modify handleGenerateRecipe to take event and handle confirmation
const oldHandleGen = `  const handleGenerateRecipe = async (meal, mIdx) => {
    setLoadingMealIdx(mIdx);
    setIsRecipeLoading(true);
    setRecipeModal('');`;

const newHandleGen = `  const handleGenerateRecipe = async (meal, mIdx) => {
    if (meal.aiRecipe) {
      const confirm = window.confirm("Você já tem uma receita para esta refeição. Deseja gerar uma nova e substituir a atual?");
      if (!confirm) return;
    }
    
    setLoadingMealIdx(mIdx);
    setIsRecipeLoading(true);
    setFlippedCards(prev => ({ ...prev, [mIdx]: true })); // Flip card proactively while loading
`;

if (code.includes(oldHandleGen)) {
  code = code.replace(oldHandleGen, newHandleGen);
}

// Remove setRecipeModal calls from handleGenerateRecipe
code = code.replace(/setRecipeModal\(.*?\);/g, "");

// Modify rendering: wrap the meal rendering block
// Find the exact line where the meal block starts:
// <div key={mIdx} style={{marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px dashed #e2e8f0'}}>
const oldMealBlockStart = `<div key={mIdx} style={{marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px dashed #e2e8f0'}}>`;
const newMealBlockStart = `
                <div key={mIdx} style={{marginBottom: '16px'}}>
                  <div className={\`flip-card \${flippedCards[mIdx] ? 'flipped' : ''}\`}>
                    <div className="flip-card-inner">
                      {/* FRONT OF CARD */}
                      <div className="flip-card-front" style={{paddingBottom: '12px', borderBottom: '1px dashed #e2e8f0'}}>
`;

if (code.includes(oldMealBlockStart)) {
  code = code.replace(oldMealBlockStart, newMealBlockStart);
}

// Replace the button section and close the FRONT, then add the BACK
const oldButtonSectionRegex = /<div style={{ marginTop: '16px' }}>[\s\S]*?<button[\s\S]*?onClick=\{\(\) => handleGenerateRecipe\(m, mIdx\)\}[\s\S]*?disabled=\{isRecipeLoading\}[\s\S]*?className="btn-3d"[\s\S]*?style=\{\{[\s\S]*?\}\}[\s\S]*?>[\s\S]*?\{isRecipeLoading && loadingMealIdx === mIdx \? \([\s\S]*?\) : m\.aiRecipe \? \([\s\S]*?\) : \([\s\S]*?\)\}[\s\S]*?<\/button>[\s\S]*?<\/div>/;

const newButtonSection = `
                  <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
                    {m.aiRecipe ? (
                      <button 
                        onClick={() => toggleFlip(mIdx)} 
                        className="btn-3d" 
                        style={{ backgroundColor: '#8b5cf6', color: '#FFF', border: 'none', padding: '8px 16px', borderRadius: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', boxShadow: '0 4px 0 #7c3aed', fontSize: '0.85rem' }}
                      >
                        <Sparkles size={16} /> Ver Receita da IA
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleGenerateRecipe(m, mIdx)} 
                        disabled={isRecipeLoading}
                        className="btn-3d" 
                        style={{ backgroundColor: '#8b5cf6', color: '#FFF', border: 'none', padding: '8px 16px', borderRadius: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', cursor: isRecipeLoading ? 'wait' : 'pointer', boxShadow: '0 4px 0 #7c3aed', fontSize: '0.85rem' }}
                      >
                        {isRecipeLoading && loadingMealIdx === mIdx ? <><Loader2 size={16} className="spin" /> Gerando...</> : <><Sparkles size={16} /> Gerar Receita com IA</>}
                      </button>
                    )}
                  </div>
                </div> {/* End Front */}

                {/* BACK OF CARD */}
                <div className="flip-card-back">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid rgba(139, 92, 246, 0.3)', paddingBottom: '12px' }}>
                    <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: '#8b5cf6' }}>
                      <Sparkles size={20} /> Receita da IA
                    </h3>
                    <button onClick={() => toggleFlip(mIdx)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--crm-text-muted)' }}><X size={20} /></button>
                  </div>
                  
                  <div className="ai-synthesis" style={{ flex: 1 }}>
                    {isRecipeLoading && loadingMealIdx === mIdx ? (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 0', color: '#8b5cf6' }}>
                        <Loader2 size={32} className="spin" style={{ marginBottom: '16px' }} />
                        <strong>Chef IA preparando algo delicioso...</strong>
                      </div>
                    ) : m.aiRecipe ? (
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {m.aiRecipe.content || ''}
                      </ReactMarkdown>
                    ) : (
                      <p style={{color: 'var(--crm-text-muted)'}}>Nenhuma receita gerada ainda.</p>
                    )}
                  </div>

                  <div style={{ marginTop: '20px', display: 'flex', gap: '12px', justifyContent: 'flex-end', borderTop: '1px solid rgba(139, 92, 246, 0.3)', paddingTop: '16px' }}>
                    <button onClick={() => handleGenerateRecipe(m, mIdx)} disabled={isRecipeLoading} className="btn-3d" style={{ backgroundColor: 'var(--crm-surface-2, #f1f5f9)', color: '#8b5cf6', border: '1px solid #8b5cf6', padding: '8px 16px', borderRadius: '8px', fontWeight: 'bold', fontSize: '0.8rem', cursor: 'pointer' }}>
                      <RefreshCw size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} /> Regerar
                    </button>
                    <button onClick={() => toggleFlip(mIdx)} className="btn-3d btn-primary" style={{ padding: '8px 16px', fontSize: '0.8rem' }}>
                      Concluído
                    </button>
                  </div>
                </div> {/* End Back */}
              </div>
            </div> {/* End flip-card */}
`;

code = code.replace(oldButtonSectionRegex, newButtonSection);

// Remove the old Recipe Modal entirely
const recipeModalRegex = /\{\/\* Recipe Modal \*\/\}\s*\{recipeModal && createPortal\([\s\S]*?document\.body\s*\)\}/;
code = code.replace(recipeModalRegex, "");

fs.writeFileSync('src/features/paciente/components/DietPlan.jsx', code, 'utf8');
console.log('Flip Card UX applied successfully!');
