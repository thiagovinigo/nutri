import { describe, test, expect } from 'vitest';
import {
  generateNutriLinkCode,
  isWellFormedLinkCode,
  isLinkCodeActive,
  parseNutriStartCode,
  NUTRI_LINK_CODE_TTL_MS,
} from './nutriLinkCode.js';

describe('generateNutriLinkCode', () => {
  test('gera 32 caracteres hexadecimais', () => {
    expect(generateNutriLinkCode()).toMatch(/^[a-f0-9]{32}$/);
  });

  test('gera valores diferentes a cada chamada', () => {
    expect(generateNutriLinkCode()).not.toBe(generateNutriLinkCode());
  });
});

describe('isWellFormedLinkCode', () => {
  test('aceita o formato gerado', () => {
    expect(isWellFormedLinkCode(generateNutriLinkCode())).toBe(true);
  });

  test.each([
    ['uid do Firebase', 'aB3dE5gH7jK9mN1pQ3sT5vX7zA9c'],
    ['vazio', ''],
    ['caminho de documento', 'a/b'],
    ['maiusculas', 'A'.repeat(32)],
    ['nao string', 123],
    [null, null],
  ])('rejeita %s', (_label, value) => {
    expect(isWellFormedLinkCode(value)).toBe(false);
  });
});

describe('isLinkCodeActive', () => {
  const now = 1_000_000;

  test('ativo antes de expirar', () => {
    expect(isLinkCodeActive(now + NUTRI_LINK_CODE_TTL_MS, now)).toBe(true);
  });

  test('expirado no instante limite e depois', () => {
    expect(isLinkCodeActive(now, now)).toBe(false);
    expect(isLinkCodeActive(now - 1, now)).toBe(false);
  });

  test('ausente ou invalido conta como expirado', () => {
    expect(isLinkCodeActive(undefined, now)).toBe(false);
    expect(isLinkCodeActive('amanha', now)).toBe(false);
  });
});

describe('parseNutriStartCode', () => {
  const code = 'a'.repeat(32);

  test('extrai o codigo de /start nutri:<codigo>', () => {
    expect(parseNutriStartCode(`/start nutri:${code}`)).toBe(code);
  });

  test('aceita a forma de grupo /start@NomeDoBot', () => {
    expect(parseNutriStartCode(`/start@nutrivvo_bot nutri:${code}`)).toBe(code);
  });

  test('retorna string vazia quando o codigo esta ausente', () => {
    expect(parseNutriStartCode('/start nutri:')).toBe('');
  });

  test('retorna null quando nao e vinculo de nutricionista', () => {
    expect(parseNutriStartCode('/start abc123')).toBeNull();
    expect(parseNutriStartCode('oi, tudo bem?')).toBeNull();
    expect(parseNutriStartCode(undefined)).toBeNull();
  });
});
