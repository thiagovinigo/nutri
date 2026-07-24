const fs = require('fs');
const path = 'src/features/paciente/components/QuestBoard.jsx';
let text = fs.readFileSync(path, 'utf8');

text = text.replace('const totalMeals = currentRecipe ? currentRecipe.meals.length : 0;', 'const totalMeals = currentRecipe ? (currentRecipe.meals?.length || 0) : 0;');
text = text.replace('const completedMeals = currentRecipe ? currentRecipe.meals.filter(m => getMealLog(m.name)).length : 0;', 'const completedMeals = currentRecipe ? (currentRecipe.meals || []).filter(m => getMealLog(m.name)).length : 0;');
text = text.replace('const mealName = currentRecipe.meals[idx]?.name || \'Refeição\';', 'const mealName = (currentRecipe.meals || [])[idx]?.name || \'Refeição\';');
text = text.replace('const mealTarget = currentRecipe.meals[activeMealIndex];', 'const mealTarget = (currentRecipe.meals || [])[activeMealIndex];');
text = text.replace('const mealName = currentRecipe.meals[activeMealIndex]?.name || \'Refeição\';', 'const mealName = (currentRecipe.meals || [])[activeMealIndex]?.name || \'Refeição\';');
text = text.replace('{currentRecipe.meals.map((meal, idx) => {', '{(currentRecipe.meals || []).map((meal, idx) => {');

fs.writeFileSync(path, text);
