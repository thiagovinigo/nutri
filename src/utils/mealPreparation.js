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
