const MIN_STEPS_TEXT_LENGTH = 120;
const PREPARATION_TITLE = /modo de preparo/i;
const NUMBERED_STEP = /\b\d\.\s/;

/**
 * Diz se o texto de uma refeição (`meal.desc`) é de fato um modo de preparo.
 * Planos antigos gerados pela IA do onboarding guardaram só uma frase genérica
 * ("Refeição matinal saudável") nesse campo; mostrá-la sob o rótulo "modo de
 * preparo" engana o paciente. Texto curto da nutricionista também não conta.
 * @param {unknown} desc
 * @returns {boolean}
 */
export function hasPreparationSteps(desc) {
  if (typeof desc !== 'string') return false;
  const text = desc.trim();
  if (PREPARATION_TITLE.test(text)) return true;
  return text.length >= MIN_STEPS_TEXT_LENGTH && NUMBERED_STEP.test(text);
}

// Título dado pelo onboarding (OnboardingProfileForm.jsx) ao plano de amostra
// gerado pela IA. Foi essa amostra que guardou frases genéricas em `desc`.
const AI_SAMPLE_TITLE_PREFIX = 'Amostra Grátis';

/**
 * Decide se a descrição de uma refeição deve aparecer pro paciente.
 * Na amostra da IA, só vale se for um modo de preparo de verdade: a frase
 * genérica que ela guardou ("Refeição matinal saudável") não ajuda e é
 * removida. Em planos escritos pela nutricionista, qualquer texto aparece,
 * porque uma orientação curta ("Comer com 1 colher de azeite") é legítima.
 * @param {unknown} desc `meal.desc`
 * @param {unknown} planTitle título do plano (`recipe.title`)
 * @returns {boolean}
 */
export function shouldShowMealNote(desc, planTitle) {
  if (typeof desc !== 'string' || !desc.trim()) return false;
  if (hasPreparationSteps(desc)) return true;
  const isAiSample = typeof planTitle === 'string' && planTitle.startsWith(AI_SAMPLE_TITLE_PREFIX);
  return !isAiSample;
}
