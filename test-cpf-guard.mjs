// Testa a lógica pura do guard de unicidade de CPF (api/patient-cpf-guard.js)
// sem precisar de credenciais do Firebase. Mesmo padrão do script "Onda 1"
// citado no commit 4382ec6 (assert puro do Node, sem framework - o projeto
// não tem vitest/jest, ver backlog.md "Zero testes automatizados").
// Uso: node test-cpf-guard.mjs

import assert from 'node:assert/strict';
import { normalizeCpfDigits, resolveCpfClaim, findCpfConflictGroups } from './lib/patients.js';

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

console.log('findCpfConflictGroups:');
test('paciente único não forma grupo', () => {
  const result = findCpfConflictGroups([{ id: 'a', cpfDigits: '11111111111' }]);
  assert.deepEqual(result, []);
});
test('2 pacientes com o mesmo CPF formam um grupo', () => {
  const result = findCpfConflictGroups([
    { id: 'a', cpfDigits: '11111111111' },
    { id: 'b', cpfDigits: '11111111111' },
  ]);
  assert.equal(result.length, 1);
  assert.equal(result[0].cpfDigits, '11111111111');
  assert.equal(result[0].patients.length, 2);
});
test('CPF vazio/inválido é ignorado (não aparece como grupo)', () => {
  const result = findCpfConflictGroups([
    { id: 'a', cpf: '' },
    { id: 'b', cpf: '' },
    { id: 'c', cpf: '123' },
  ]);
  assert.deepEqual(result, []);
});
test('deriva cpfDigits de cpf quando o campo já normalizado não existe (doc legado)', () => {
  const result = findCpfConflictGroups([
    { id: 'a', cpf: '111.111.111-11' },
    { id: 'b', cpf: '11111111111' },
  ]);
  assert.equal(result.length, 1);
  assert.equal(result[0].patients.length, 2);
});

console.log(`\n${passed} asserts OK.`);
