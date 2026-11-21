import { describe, test, expect } from 'vitest';
import {
  MAX_REPLY_TOKENS,
  MAX_RECIPE_TOKENS,
  TRUNCATION_NOTICE,
  closeTruncatedReply,
} from './aiReply.js';

describe('orcamento de tokens', () => {
  test('cabe uma receita completa e a resposta que a reapresenta (eram 600 e 500, e cortavam no meio)', () => {
    expect(MAX_RECIPE_TOKENS).toBeGreaterThanOrEqual(1200);
    expect(MAX_REPLY_TOKENS).toBeGreaterThanOrEqual(1200);
  });
});

describe('closeTruncatedReply', () => {
  test('resposta que terminou normalmente nao e alterada', () => {
    const texto = 'Receita pronta!\n\n1. Misture tudo.';
    expect(closeTruncatedReply(texto, 'stop')).toBe(texto);
    expect(closeTruncatedReply(texto, undefined)).toBe(texto);
  });

  test('resposta cortada pelo limite descarta a linha incompleta e avisa o paciente', () => {
    const cortada = '1. Cozinhar a quinoa.\n2. Refogar os legumes.\n3. Cozinhar a Batata-Doce: Descasque e corte';

    const resultado = closeTruncatedReply(cortada, 'length');

    expect(resultado.startsWith('1. Cozinhar a quinoa.\n2. Refogar os legumes.')).toBe(true);
    expect(resultado).not.toContain('Descasque e corte');
    expect(resultado.endsWith(TRUNCATION_NOTICE)).toBe(true);
  });

  test('texto cortado sem quebra de linha volta ate o ultimo fim de frase', () => {
    const resultado = closeTruncatedReply('Beba agua. Durma bem. E nao esqueca de camin', 'length');

    expect(resultado).toContain('Beba agua. Durma bem.');
    expect(resultado).not.toContain('camin');
    expect(resultado.endsWith(TRUNCATION_NOTICE)).toBe(true);
  });

  test('sem ponto de corte limpo mantem o texto e so acrescenta o aviso (nunca devolve vazio)', () => {
    const resultado = closeTruncatedReply('palavracortada', 'length');

    expect(resultado).toContain('palavracortada');
    expect(resultado.endsWith(TRUNCATION_NOTICE)).toBe(true);
  });

  test('texto vazio ou nao textual nao quebra', () => {
    expect(closeTruncatedReply('', 'length')).toBe(TRUNCATION_NOTICE);
    expect(closeTruncatedReply(null, 'length')).toBeNull();
    expect(closeTruncatedReply(null, 'stop')).toBeNull();
  });
});
