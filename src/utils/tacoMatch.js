// Normaliza nomes de alimentos para comparação tolerante a acento, caixa e espaçamento.
// Necessário porque a IA às vezes reproduz o nome do banco TACO com pequenas
// variações (ex.: "Frango, Peito, Grelhado" em vez de "Frango, peito, sem pele, grelhado",
// diferindo só na capitalização/acentuação), o que quebrava o match exato usado na substituição.
function normalizeFoodName(name) {
  return (name || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');
}

/**
 * Encontra o alimento correspondente no banco TACO, tentando primeiro por id
 * e depois por nome (exato e normalizado) antes de desistir.
 * @param {Array} tacoData
 * @param {{ foodId?: string|number, name?: string }} food
 */
export function findTacoFood(tacoData, food) {
  if (!food) return null;

  const byId = tacoData.find(db => String(db.id) === String(food.foodId));
  if (byId) return byId;

  const targetName = normalizeFoodName(food.name);
  if (!targetName) return null;

  return tacoData.find(db => normalizeFoodName(db.name) === targetName) || null;
}
