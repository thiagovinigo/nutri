const fs = require('fs');

let code = fs.readFileSync('src/features/paciente/components/DietPlan.jsx', 'utf8');

// 1. Restore updateMealAiRecipe call in handleGenerateRecipe
const oldHandleGen = `      if (!response.ok) throw new Error('Network error');
      const data = await response.json();
      setRecipeModal({ title: \`Receita para: \${meal.name}\`, content: data.choices[0].message.content });
    } catch (err) {`;

const newHandleGen = `      if (!response.ok) throw new Error('Network error');
      const data = await response.json();
      const newAiRecipe = { title: \`Receita para: \${meal.name}\`, content: data.choices[0].message.content };
      setRecipeModal(newAiRecipe);
      updateMealAiRecipe(activePatient.id, activePatient.recipes.length - 1, mIdx, newAiRecipe);
    } catch (err) {`;

if (code.includes(oldHandleGen)) {
  code = code.replace(oldHandleGen, newHandleGen);
} else {
  console.error("Could not find the target inside handleGenerateRecipe.");
}

// 2. Restore Recipe Modal
const recipeModalCode = `
      {/* Recipe Modal */}
      {recipeModal && createPortal(
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 99999, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
          <div className="animate-pop-in" style={{ backgroundColor: 'var(--crm-surface)', width: '100%', maxWidth: '650px', borderRadius: '24px', overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '90vh', boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}>
            <div style={{ backgroundColor: '#8b5cf6', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#fff' }}>
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}><Sparkles size={20} /> {recipeModal.title || 'Receita IA'}</h3>
              <button onClick={() => setRecipeModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={24} /></button>
            </div>
            <div className="ai-synthesis" style={{ padding: '24px', overflowY: 'auto', flex: 1, backgroundColor: 'var(--crm-surface)' }}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {recipeModal.content}
              </ReactMarkdown>
            </div>
          </div>
        </div>,
        document.body
      )}
`;

if (!code.includes("Recipe Modal") && !code.includes("{recipeModal && createPortal")) {
  code = code.replace(
    "{/* Substitutions Modal */}",
    recipeModalCode + "\n      {/* Substitutions Modal */}"
  );
}

fs.writeFileSync('src/features/paciente/components/DietPlan.jsx', code, 'utf8');
console.log('Modal and updateMealAiRecipe successfully restored!');
