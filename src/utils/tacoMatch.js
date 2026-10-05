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

  const exact = tacoData.find(db => normalizeFoodName(db.name) === targetName);
  if (exact) return exact;

  // Nome abreviado ("Pão integral" -> "Pão de forma integral"): só aceita quando
  // todas as palavras aparecem em exatamente um alimento, para nunca chutar.
  const tokens = targetName.split(/[\s,]+/).filter(Boolean);
  const candidates = tacoData.filter(db => {
    const dbTokens = normalizeFoodName(db.name).split(/[\s,]+/);
    return tokens.every(t => dbTokens.includes(t));
  });
  return candidates.length === 1 ? candidates[0] : null;
}

const roundTo = (value, decimals) => {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
};

/**
 * Alinha um alimento gerado pela IA à base TACO: se houver correspondência, usa
 * id, nome e macros oficiais proporcionais à quantidade (o que habilita a
 * substituição automática). Sem correspondência, mantém os dados da IA.
 * Não muta o alimento recebido.
 * @param {Array} tacoData
 * @param {{ foodId?: string|number, name?: string, amount?: number|string }} food
 */
export function reconcileAiFood(tacoData, food) {
  const amount = Number(food.amount) || 100;
  const match = findTacoFood(tacoData, food);

  if (!match) {
    return { ...food, amount, foodId: food.foodId ?? `ai-${normalizeFoodName(food.name)}` };
  }

  const factor = amount / 100;
  return {
    ...food,
    foodId: match.id,
    name: match.name,
    amount,
    kcal: Math.round((match.kcal || 0) * factor),
    carb: roundTo((match.carb || 0) * factor, 1),
    protein: roundTo((match.protein || 0) * factor, 1),
    fat: roundTo((match.fat || 0) * factor, 1),
  };
}
