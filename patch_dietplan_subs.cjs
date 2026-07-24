const fs = require('fs');

let code = fs.readFileSync('src/features/paciente/components/DietPlan.jsx', 'utf8');

// 1. Add Context Import
if (!code.includes("import { useAppContext }")) {
  code = code.replace("import React, { useState } from 'react';", "import React, { useState } from 'react';\nimport { useAppContext } from '../../../context/AppContext';");
}

// 2. Add Context hook call
const funcStart = "export default function DietPlan({ activePatient }) {";
if (!code.includes("const { updateMealAiRecipe, updatePatient } = useAppContext();")) {
  code = code.replace(
    funcStart,
    funcStart + "\n  const { updateMealAiRecipe, updatePatient } = useAppContext();"
  );
}

// 3. Update handleOpenSub
code = code.replace(
  "const handleOpenSub = (food) => {",
  "const handleOpenSub = (meal, mIdx, food, fIdx) => {"
);
code = code.replace(
  "setSubModal({\n      original: food,",
  "setSubModal({\n      mIdx, fIdx, meal, original: food,"
);

// 4. Add applySub function
const applySubFunc = `
  const applySub = (alt, replaceAll) => {
    if (!activePatient) return;
    const newRecipes = [...(activePatient.recipes || [])];
    const recipeIdx = newRecipes.length - 1;
    if (recipeIdx < 0) return;
    const currentRecipe = newRecipes[recipeIdx];
    
    const { mIdx, fIdx, original } = subModal;

    const newFood = {
      foodId: alt.id,
      name: alt.name,
      amount: alt.suggestedAmount,
      kcal: Math.round((alt.kcal / 100) * alt.suggestedAmount),
      protein: Math.round((alt.protein / 100) * alt.suggestedAmount * 10) / 10,
      carb: Math.round((alt.carb / 100) * alt.suggestedAmount * 10) / 10,
      fat: Math.round((alt.fat / 100) * alt.suggestedAmount * 10) / 10
    };

    if (replaceAll) {
      currentRecipe.meals.forEach((m) => {
        if (m.foods) {
          m.foods.forEach((f, i) => {
            if (String(f.foodId) === String(original.foodId) || f.name === original.name) {
              m.foods[i] = { ...newFood };
            }
          });
        }
      });
    } else {
      if (currentRecipe.meals[mIdx] && currentRecipe.meals[mIdx].foods) {
        currentRecipe.meals[mIdx].foods[fIdx] = newFood;
      }
    }

    updatePatient(activePatient.id, { recipes: newRecipes });
    setSubModal(null);
  };
`;
if (!code.includes("const applySub =")) {
  code = code.replace(
    "const currentRecipe = activePatient?.recipes?.slice(-1)[0];",
    applySubFunc + "\n  const currentRecipe = activePatient?.recipes?.slice(-1)[0];"
  );
}

// 5. Update onClick button
code = code.replace(
  "onClick={() => handleOpenSub(f)}",
  "onClick={() => handleOpenSub(m, mIdx, f, fIdx)}"
);

// 6. Update SubModal alternatives render
const oldAlts = `{subModal.alternatives.map(alt => (
                <div key={alt.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
                  <strong style={{ color: '#3b82f6', fontSize: '1.1rem' }}>{alt.suggestedAmount}g</strong>
                  <span style={{ color: 'var(--crm-text-main)', flex: 1, marginLeft: '12px' }}>de {alt.name}</span>
                </div>
              ))}`;

const newAlts = `{subModal.alternatives.map(alt => (
                <div key={alt.id} style={{ padding: '16px', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <strong style={{ color: '#3b82f6', fontSize: '1.1rem' }}>{alt.suggestedAmount}g</strong>
                    <span style={{ color: 'var(--crm-text-main)', flex: 1, marginLeft: '12px' }}>de {alt.name}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <button className="btn-3d" onClick={() => applySub(alt, false)} style={{ fontSize: '0.8rem', padding: '6px 12px', backgroundColor: 'var(--crm-surface-2, #334155)', color: 'var(--crm-text-main)', border: '1px solid var(--glass-border)' }}>Somente Hoje</button>
                    <button className="btn-3d btn-primary" onClick={() => applySub(alt, true)} style={{ fontSize: '0.8rem', padding: '6px 12px' }}>Todos os Dias</button>
                  </div>
                </div>
              ))}`;

if (code.includes(oldAlts)) {
  code = code.replace(oldAlts, newAlts);
} else {
  console.log("oldAlts NOT FOUND - might need manual update");
}

fs.writeFileSync('src/features/paciente/components/DietPlan.jsx', code, 'utf8');
console.log('DietPlan patched successfully');
