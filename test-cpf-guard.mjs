// Testa a lógica pura do guard de unicidade de CPF (api/patient-cpf-guard.js)
// sem precisar de credenciais do Firebase. Mesmo padrão do script "Onda 1"
// citado no commit 4382ec6 (assert puro do Node, sem framework - o projeto
// não tem vitest/jest, ver backlog.md "Zero testes automatizados").
// Uso: node test-cpf-guard.mjs

import assert from 'node:assert/strict';
import { normalizeCpfDigits, resolveCpfClaim } from './api/utils/patients.js';

let passed = 0;
function test(name, fn) {
  fn();
  passed++;
  console.log(`  ok - ${name}`);
}

console.log('normalizeCpfDigits:');
test('remove pontuação', () => {
  assert.equal(normalizeCpfDigits('123.456.789-00'), '12345678900');
});
test('já só com dígitos permanece igual', () => {
  assert.equal(normalizeCpfDigits('12345678900'), '12345678900');
});
test('null/undefined vira string vazia', () => {
  assert.equal(normalizeCpfDigits(null), '');
  assert.equal(normalizeCpfDigits(undefined), '');
});
test('espaços e letras são removidos (CPF inválido, mas não deve crashar)', () => {
  assert.equal(normalizeCpfDigits('abc 123'), '123');
});

console.log('resolveCpfClaim:');
test('CPF nunca reservado -> reserve', () => {
  assert.equal(
    resolveCpfClaim({ indexPatientId: null, targetPatientId: 'uid-a', conflictingDocExists: false }),
    'reserve'
  );
});
test('CPF já reservado pelo próprio paciente -> idempotent', () => {
  assert.equal(
    resolveCpfClaim({ indexPatientId: 'uid-a', targetPatientId: 'uid-a', conflictingDocExists: true }),
    'idempotent'
  );
});
test('CPF reservado por outro paciente ainda ativo -> conflict', () => {
  assert.equal(
    resolveCpfClaim({ indexPatientId: 'uid-b', targetPatientId: 'uid-a', conflictingDocExists: true }),
    'conflict'
  );
});
test('CPF reservado por doc que não existe mais (conta apagada/inativa) -> reclaim', () => {
  assert.equal(
    resolveCpfClaim({ indexPatientId: 'uid-b', targetPatientId: 'uid-a', conflictingDocExists: false }),
    'reclaim'
  );
});

console.log(`\n${passed} asserts OK.`);
