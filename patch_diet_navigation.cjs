const fs = require('fs');

let code = fs.readFileSync('src/features/paciente/components/DietPlan.jsx', 'utf8');

// 1. Add selectedPlanDay state
const rxState = /const \[loadingMealIdx, setLoadingMealIdx\] = useState\(null\);/;
const stateInsert = `const [loadingMealIdx, setLoadingMealIdx] = useState(null);
  const [selectedPlanDay, setSelectedPlanDay] = useState(1);`;
if (rxState.test(code)) {
  code = code.replace(rxState, stateInsert);
}

// 2. Modify recipe rendering
const rxRecipeMap = /\{activePatient\.recipes\.slice\(\)\.reverse\(\)\.map\(\(r, idx\) => \([\s\S]*?\{r\.meals\?\.map\(\(m, mIdx\) => \(/;

const recipeMapInsert = `{activePatient.recipes.slice().reverse().map((r, idx) => {
            const dayMatches = (r.meals || []).map(m => m.name.match(/Dia (\\d+)/i)).filter(Boolean);
            const maxDays = dayMatches.length > 0 ? Math.max(...dayMatches.map(m => parseInt(m[1], 10))) : 0;
            
            return (
            <div key={idx} style={{...styles.card, flexDirection: 'column', alignItems: 'stretch'}}>
              <strong style={{fontSize: '1.2rem', marginBottom: r.description ? '8px' : '16px', display: 'block'}}>{r.title}</strong>
              {r.description && <p style={{fontSize: '0.95rem', color: 'var(--crm-text-muted)', marginBottom: '16px', marginTop: 0}}>{r.description}</p>}
              
              {maxDays > 0 && (
                <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '16px', scrollbarWidth: 'none' }}>
                  {Array.from({ length: maxDays }).map((_, i) => (
                     <button key={i} onClick={() => setSelectedPlanDay(i + 1)} style={{ padding: '6px 16px', borderRadius: '20px', border: 'none', backgroundColor: selectedPlanDay === i + 1 ? '#10b981' : 'var(--crm-surface-2)', color: selectedPlanDay === i + 1 ? '#FFF' : 'var(--crm-text-main)', cursor: 'pointer', fontWeight: 'bold', flexShrink: 0, boxShadow: selectedPlanDay === i + 1 ? '0 2px 4px rgba(16,185,129,0.3)' : 'none' }}>
                       Dia {i + 1}
                     </button>
                  ))}
                </div>
              )}
              
              {r.meals?.map((m, mIdx) => {
                const hasDayPrefix = /Dia \\d+/i.test(m.name);
                if (hasDayPrefix && !new RegExp(\`Dia \${selectedPlanDay}\\\\b\`, 'i').test(m.name)) {
                  return null;
                }
                return (`;

if (rxRecipeMap.test(code)) {
  code = code.replace(rxRecipeMap, recipeMapInsert);
} else {
  console.log("Failed to patch recipe map");
}

// 3. Fix the closing brace of the map
const rxMapEnd = /<\/div>\s*\}\)\}\s*<\/div>\s*\)\)\}\s*<\/div>/;
const mapEndInsert = `</div>
                  );
                })}
              
            </div>
          )})}
        </div>`;
if (rxMapEnd.test(code)) {
  code = code.replace(rxMapEnd, mapEndInsert);
} else {
  console.log("Failed to patch map end");
}


fs.writeFileSync('src/features/paciente/components/DietPlan.jsx', code, 'utf8');
console.log("DietPlan.jsx patched successfully");
