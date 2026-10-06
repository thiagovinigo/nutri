import { describe, test, expect } from 'vitest';
import { hasPreparationSteps, shouldShowMealNote } from './mealPreparation';

describe('hasPreparationSteps', () => {
  test('reconhece a receita gerada com o titulo de modo de preparo', () => {
    const desc = '🍳 Omelete\n\nGostosa.\n\n👨‍🍳 Modo de Preparo:\n1. Bata os ovos.\n2. Frite.';
    expect(hasPreparationSteps(desc)).toBe(true);
  });

  test('aceita o titulo em qualquer caixa', () => {
    expect(hasPreparationSteps('modo de preparo: misture tudo')).toBe(true);
  });

  test('frase generica de uma linha nao e modo de preparo', () => {
    expect(hasPreparationSteps('Refeição matinal saudável')).toBe(false);
  });

  test('orientacao curta da nutricionista nao e modo de preparo', () => {
    expect(hasPreparationSteps('Comer com 1 colher de azeite')).toBe(false);
  });

  test('texto longo com passos numerados conta como preparo mesmo sem o titulo', () => {
    const steps = '1. Cozinhe o arroz em fogo baixo por vinte minutos com sal e alho. 2. Grelhe o frango temperado com limao e ervas ate dourar dos dois lados. 3. Sirva com a salada.';
    expect(hasPreparationSteps(steps)).toBe(true);
  });

  test.each([[undefined], [null], [''], ['   '], [42]])('retorna false para %s', (value) => {
    expect(hasPreparationSteps(value)).toBe(false);
  });
});

describe('shouldShowMealNote', () => {
  const AI_SAMPLE = 'Amostra Grátis - IA Nutrivvo';
  const recipe = '🍳 Omelete\n\n👨‍🍳 Modo de Preparo:\n1. Bata os ovos.\n2. Frite.';

  test('amostra da IA com frase generica: nao mostra nada', () => {
    expect(shouldShowMealNote('Refeição matinal saudável', AI_SAMPLE)).toBe(false);
  });

  test('amostra da IA com receita de verdade: mostra', () => {
    expect(shouldShowMealNote(recipe, AI_SAMPLE)).toBe(true);
  });

  test('plano da nutricionista com orientacao curta: mostra', () => {
    expect(shouldShowMealNote('Comer com 1 colher de azeite', 'Plano de emagrecimento')).toBe(true);
  });

  test('plano sem titulo conhecido mantem a orientacao', () => {
    expect(shouldShowMealNote('Comer devagar', undefined)).toBe(true);
  });

  test.each([[undefined], [null], [''], ['   ']])('sem texto (%s) nao mostra nada', (desc) => {
    expect(shouldShowMealNote(desc, 'Plano de emagrecimento')).toBe(false);
  });
});
