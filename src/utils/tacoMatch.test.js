import { describe, test, expect } from 'vitest';
import { findTacoFood, reconcileAiFood } from './tacoMatch';
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

describe('findTacoFood - correspondencia por palavras', () => {
  const db = [
    { id: '10', name: 'Pão de forma integral' },
    { id: '11', name: 'Pão francês' },
    { id: '1', name: 'Arroz branco, cozido' },
    { id: '2', name: 'Arroz integral, cozido' },
  ];

  test('casa nome abreviado quando ha um unico candidato', () => {
    expect(findTacoFood(db, { name: 'Pão integral' })).toBe(db[0]);
  });

  test('nao chuta quando ha mais de um candidato', () => {
    expect(findTacoFood(db, { name: 'Arroz' })).toBeNull();
  });
});

describe('reconcileAiFood', () => {
  const db = [{ id: '14', name: 'Ovo de galinha, cozido', kcal: 146, carb: 0.6, protein: 13.3, fat: 9.5 }];

  test('usa id e macros da TACO proporcionais a quantidade', () => {
    const out = reconcileAiFood(db, { foodId: '14', name: 'x', amount: 50, kcal: 999 });
    expect(out).toMatchObject({ foodId: '14', name: 'Ovo de galinha, cozido', amount: 50, kcal: 73, carb: 0.3, protein: 6.7, fat: 4.8 });
  });

  test('mantem o alimento da IA e gera foodId proprio quando nao ha match', () => {
    const food = { name: 'Suco de laranja natural', amount: 200, kcal: 90 };
    const out = reconcileAiFood(db, food);
    expect(out).toMatchObject({ name: 'Suco de laranja natural', amount: 200, kcal: 90 });
    expect(out.foodId).toBeDefined();
  });

  test('nao muta o objeto original e normaliza quantidade invalida para 100', () => {
    const food = { foodId: '14', amount: 'abc' };
    const out = reconcileAiFood(db, food);
    expect(out).not.toBe(food);
    expect(food.name).toBeUndefined();
    expect(out.amount).toBe(100);
  });
});
