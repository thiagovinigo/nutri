import tacoData from '../data/taco.json';
import householdMeasures from '../data/householdMeasures.json';

// Nutricionistas prescrevem em gramas (medida oficial), mas o paciente em
// casa geralmente não tem balança -- usa colher de chá/sopa, xícara,
// unidade etc. (medida caseira). Este utilitário só converte pra exibição;
// a grama continua sendo o valor de referência guardado nos dados.
//
// Fonte dos valores: referências padrão de medida caseira usadas por
// nutricionistas no Brasil (equivalente à tabela complementar da TACO).
// São valores de partida razoáveis, não substituem revisão de uma
// nutricionista -- o arquivo `householdMeasures.json` é só um mapa simples,
// fácil de corrigir item a item.

const FRACTION_STEPS = [0, 0.25, 0.5, 0.75, 1];
const FRACTION_GLYPHS = { 0.25: '¼', 0.5: '½', 0.75: '¾' };

function findEntryByName(name) {
  if (!name) return null;
  const dbFood = tacoData.find(f => f.name === name);
  return dbFood ? householdMeasures[String(dbFood.id)] : null;
}

function formatFraction(qty) {
  const whole = Math.floor(qty);
  const remainder = qty - whole;
  const nearestStep = FRACTION_STEPS.reduce((closest, step) =>
    Math.abs(step - remainder) < Math.abs(closest - remainder) ? step : closest
  , 0);

  if (nearestStep === 0) return whole > 0 ? `${whole}` : '1';
  if (nearestStep === 1) return `${whole + 1}`;
  return whole > 0 ? `${whole}${FRACTION_GLYPHS[nearestStep]}` : FRACTION_GLYPHS[nearestStep];
}

/**
 * Retorna a medida caseira aproximada de um alimento, formatada pra exibição
 * (ex: "≈ 1½ xícara de chá"), ou `null` quando não há mapeamento pra esse
 * alimento (a UI simplesmente não mostra a linha extra nesse caso).
 * @param {{ foodId?: string|number, name?: string, grams: number }} params
 * @returns {string|null}
 */
export function getHouseholdMeasure({ foodId, name, grams }) {
  if (!grams || grams <= 0) return null;
  const entry = (foodId != null && householdMeasures[String(foodId)]) || findEntryByName(name);
  if (!entry) return null;

  const useSmall = entry.small && grams < (entry.large?.grams ?? Infinity) * 0.75;
  const unit = useSmall ? entry.small : entry.large;
  if (!unit) return null;

  const qty = grams / unit.grams;
  if (qty <= 0) return null;
  const label = qty < 1.13 ? unit.label : unit.labelPlural;
  return `≈ ${formatFraction(qty)} ${label}`;
}
