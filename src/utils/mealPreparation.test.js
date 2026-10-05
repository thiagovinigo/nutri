import { describe, test, expect } from 'vitest';
import { hasPreparationSteps } from './mealPreparation';

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
