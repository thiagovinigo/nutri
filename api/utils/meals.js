/**
 * Resolucao de "refeicoes do dia" a partir do ciclo de dias da dieta.
 *
 * Extraido de secretariaVirtual.js (28/08/2026) pra ficar testavel sem
 * carregar firebase-admin - esta funcao e pura (so opera sobre patientData em
 * memoria) e agora e usada tanto pela Secretaria Virtual quanto pelo
 * cron-reminders (que antes iterava patient.recipes direto e nunca achava
 * meal.time, entao o lembrete de refeicao por horario nunca disparava).
 */

/**
 * Resolve as refeicoes de um dia (por padrao HOJE) a partir do ciclo de dias
 * da ultima receita - mesma logica de "Dia N" e calculo de ciclo usada em
 * QuestBoard.jsx (currentCycleDay), reimplementada aqui porque api/ e src/
 * sao bundles separados na Vercel (sem import cruzado entre eles).
 *
 * @param {object} patientData - doc do paciente; usa `recipes` e `createdAt`
 * @param {Date} [refDate] - dia de referencia (default: agora). Passe uma data
 *   pra resolver as refeicoes de outro dia (ex: ontem, na checagem de adesao).
 * @returns {Array<object>} refeicoes do dia (meal.foods[], meal.time, etc.)
 */
export function resolveTodaysMeals(patientData, refDate = new Date()) {
  const recipes = patientData.recipes;
  if (!recipes || recipes.length === 0) return [];
  const currentRecipe = recipes[recipes.length - 1];
  if (!currentRecipe?.meals?.length) return [];

  const dayMatches = currentRecipe.meals.map((m) => (m.name || '').match(/Dia (\d+)/i)).filter(Boolean);
  const maxDays = dayMatches.length > 0 ? Math.max(...dayMatches.map((m) => parseInt(m[1], 10))) : 0;

  if (maxDays === 0) return currentRecipe.meals;

  const startOfDiet = patientData.createdAt ? new Date(patientData.createdAt) : new Date();
  startOfDiet.setHours(0, 0, 0, 0);
  const today = new Date(refDate);
  today.setHours(0, 0, 0, 0);
  const daysDiff = Math.floor((today - startOfDiet) / (1000 * 60 * 60 * 24));
  const cycleDay = daysDiff >= 0
    ? (daysDiff % maxDays) + 1
    : maxDays - ((Math.abs(daysDiff) - 1) % maxDays);
  return currentRecipe.meals.filter((m) => {
    const hasDayPrefix = /Dia \d+/i.test(m.name || '');
    return !hasDayPrefix || new RegExp(`Dia ${cycleDay}\\b`, 'i').test(m.name || '');
  });
}
