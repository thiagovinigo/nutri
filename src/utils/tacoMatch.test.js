import { describe, test, expect } from 'vitest';
import { findTacoFood } from './tacoMatch';
import tacoData from '../data/taco.json';

const sample = [
  { id: '1', name: 'Arroz branco, cozido' },
  { id: '2', name: 'Frango, peito, sem pele, grelhado' },
];

describe('findTacoFood', () => {
  test('encontra por id mesmo quando o nome diverge', () => {
    expect(findTacoFood(sample, { foodId: 2, name: 'qualquer' })).toBe(sample[1]);
  });

  test('encontra por nome com caixa e espacamento diferentes', () => {
    const food = { foodId: 'inexistente', name: '  ARROZ   branco, COZIDO ' };
    expect(findTacoFood(sample, food)).toBe(sample[0]);
  });

  test('ignora acentos na comparacao de nome', () => {
    const db = [{ id: '9', name: 'Feijão, cozido' }];
    expect(findTacoFood(db, { name: 'feijao, cozido' })).toBe(db[0]);
  });

  test('retorna null quando nada corresponde', () => {
    expect(findTacoFood(sample, { foodId: '99', name: 'Pizza' })).toBeNull();
  });

  test('retorna null para alimento ausente ou sem nome e sem id valido', () => {
    expect(findTacoFood(sample, null)).toBeNull();
    expect(findTacoFood(sample, { foodId: '99' })).toBeNull();
  });

  test('resolve um alimento real da base TACO pelo nome', () => {
    const first = tacoData[0];
    expect(findTacoFood(tacoData, { name: first.name.toUpperCase() })?.id).toBe(first.id);
  });
});
