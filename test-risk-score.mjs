// Testa a lógica pura do score de risco unificado (lib/riskScore.js) sem
// precisar de credenciais do Firebase. Mesmo padrão de test-cpf-guard.mjs
// (assert puro do Node, sem framework - ver backlog.md "Zero testes
// automatizados").
// Uso: node test-risk-score.mjs

import assert from 'node:assert/strict';
import { computeRiskScore } from './lib/riskScore.js';

let passed = 0;
function test(name, fn) {
  fn();
  passed++;
  console.log(`  ok - ${name}`);
}

const REF_DATE = new Date(2026, 8, 12); // 12/09/2026, meio-dia implícito (00:00 local)

function ptBr(date) {
  return date.toLocaleDateString('pt-BR');
}

function daysAgo(n) {
  const d = new Date(REF_DATE);
  d.setDate(d.getDate() - n);
  return d;
}

// Dieta de 1 dia só (sem "Dia N" no nome) -> resolveTodaysMeals retorna todas
// as meals sempre, independente do ciclo - simplifica o cenário de teste.
const SIMPLE_RECIPE = [{ meals: [{ name: 'Café da manhã' }, { name: 'Almoço' }, { name: 'Jantar' }] }];

function basePatient(overrides = {}) {
  return {
    recipes: SIMPLE_RECIPE,
    createdAt: daysAgo(30).toISOString(),
    foodLogs: [],
    waterLogs: {},
    sleepLogs: [],
    streak: 0,
    lastActivityDate: null,
    ...overrides,
  };
}

console.log('computeRiskScore - paciente engajado (sem risco):');
test('adesão alta + atividade recente + água + sono bom -> baixo, score 0', () => {
  const patient = basePatient({
    streak: 5,
    lastActivityDate: REF_DATE.toISOString(),
    foodLogs: [0, 1, 2].flatMap((i) => [
      { date: ptBr(daysAgo(i)), type: 'plano' },
      { date: ptBr(daysAgo(i)), type: 'plano' },
      { date: ptBr(daysAgo(i)), type: 'plano' },
    ]),
    waterLogs: { [ptBr(REF_DATE)]: 2000 },
    sleepLogs: [{ date: ptBr(REF_DATE), hours: 8, quality: 'Bom' }],
  });
  const result = computeRiskScore(patient, REF_DATE);
  assert.equal(result.score, 0);
  assert.equal(result.level, 'baixo');
  assert.deepEqual(result.factors, []);
});

console.log('computeRiskScore - adesão:');
test('zero refeições logadas nos últimos 3 dias -> soma peso 35 e vira fator', () => {
  const patient = basePatient({ streak: 5, lastActivityDate: REF_DATE.toISOString() });
  const result = computeRiskScore(patient, REF_DATE);
  assert.ok(result.score >= 35);
  assert.ok(result.factors.some((f) => f.includes('Adesão de 0%')));
});
test('sem dieta prescrita (recipes vazio) não penaliza adesão', () => {
  const patient = basePatient({ recipes: [], streak: 5, lastActivityDate: REF_DATE.toISOString(), waterLogs: { [ptBr(REF_DATE)]: 2000 } });
  const result = computeRiskScore(patient, REF_DATE);
  assert.equal(result.score, 0);
  assert.ok(!result.factors.some((f) => f.includes('Adesão')));
});

console.log('computeRiskScore - recência:');
test('nunca registrou atividade (lastActivityDate null) -> soma peso 30', () => {
  const patient = basePatient();
  const result = computeRiskScore(patient, REF_DATE);
  assert.ok(result.factors.includes('Nunca registrou atividade'));
});
test('4+ dias sem atividade -> peso 30 cheio', () => {
  const patient = basePatient({ streak: 0, lastActivityDate: daysAgo(5).toISOString() });
  const before = computeRiskScore(basePatient({ streak: 5, lastActivityDate: REF_DATE.toISOString() }), REF_DATE).score;
  const result = computeRiskScore(patient, REF_DATE);
  assert.ok(result.score > before);
  assert.ok(result.factors.some((f) => f.includes('Sem atividade há 5 dias')));
});
test('atividade hoje com streak > 0 não penaliza recência', () => {
  const patient = basePatient({ streak: 3, lastActivityDate: REF_DATE.toISOString() });
  const result = computeRiskScore(patient, REF_DATE);
  assert.ok(!result.factors.some((f) => f.includes('atividade')));
});

console.log('computeRiskScore - hidratação:');
test('sem registro de água nos últimos 2 dias -> soma peso 15', () => {
  const patient = basePatient({ streak: 5, lastActivityDate: REF_DATE.toISOString() });
  const result = computeRiskScore(patient, REF_DATE);
  assert.ok(result.factors.some((f) => f.includes('água')));
});
test('água registrada ontem já é suficiente (não precisa ser hoje)', () => {
  const patient = basePatient({ streak: 5, lastActivityDate: REF_DATE.toISOString(), waterLogs: { [ptBr(daysAgo(1))]: 1500 } });
  const result = computeRiskScore(patient, REF_DATE);
  assert.ok(!result.factors.some((f) => f.includes('água')));
});

console.log('computeRiskScore - sono:');
test('sono ruim (quality Ruim) nos últimos 3 dias -> soma peso 10', () => {
  const patient = basePatient({ streak: 5, lastActivityDate: REF_DATE.toISOString(), sleepLogs: [{ date: ptBr(REF_DATE), hours: 8, quality: 'Ruim' }] });
  const result = computeRiskScore(patient, REF_DATE);
  assert.ok(result.factors.some((f) => f.includes('Sono ruim')));
});
test('poucas horas de sono (< 6h) também penaliza mesmo com quality boa', () => {
  const patient = basePatient({ streak: 5, lastActivityDate: REF_DATE.toISOString(), sleepLogs: [{ date: ptBr(REF_DATE), hours: 4, quality: 'Bom' }] });
  const result = computeRiskScore(patient, REF_DATE);
  assert.ok(result.factors.some((f) => f.includes('Sono ruim')));
});
test('sono ruim fora da janela de 3 dias é ignorado', () => {
  const patient = basePatient({ streak: 5, lastActivityDate: REF_DATE.toISOString(), sleepLogs: [{ date: ptBr(daysAgo(10)), hours: 3, quality: 'Ruim' }] });
  const result = computeRiskScore(patient, REF_DATE);
  assert.ok(!result.factors.some((f) => f.includes('Sono ruim')));
});

console.log('computeRiskScore - sinais reativos (aiRiskSignal / behavioralRiskSignal):');
test('aiRiskSignal recente força nível mínimo médio mesmo com o resto ok', () => {
  const patient = basePatient({
    streak: 5,
    lastActivityDate: REF_DATE.toISOString(),
    waterLogs: { [ptBr(REF_DATE)]: 2000 },
    aiRiskSignal: { reason: 'Paciente relatou ansiedade forte', detectedAt: daysAgo(0).toISOString() },
  });
  const result = computeRiskScore(patient, REF_DATE);
  assert.notEqual(result.level, 'baixo');
  assert.ok(result.factors.some((f) => f.includes('Sinalizado pela IA')));
});
test('behavioralRiskSignal fora da janela de 48h é ignorado', () => {
  const patient = basePatient({
    streak: 5,
    lastActivityDate: REF_DATE.toISOString(),
    waterLogs: { [ptBr(REF_DATE)]: 2000 },
    behavioralRiskSignal: { detectedAt: daysAgo(5).toISOString(), keyword: 'doce' },
  });
  const result = computeRiskScore(patient, REF_DATE);
  assert.equal(result.level, 'baixo');
  assert.ok(!result.factors.some((f) => f.includes('ansiedade alimentar')));
});
test('sinal futuro (relógio do cliente adiantado) não conta - isWithinHours exige diffMs >= 0', () => {
  const patient = basePatient({
    streak: 5,
    lastActivityDate: REF_DATE.toISOString(),
    waterLogs: { [ptBr(REF_DATE)]: 2000 },
    aiRiskSignal: { reason: 'x', detectedAt: new Date(REF_DATE.getTime() + 60 * 60 * 1000).toISOString() },
  });
  const result = computeRiskScore(patient, REF_DATE);
  assert.equal(result.level, 'baixo');
});

console.log('computeRiskScore - cortes de nível:');
test('score < 40 -> baixo', () => {
  // Sem dieta (zera adesão), atividade há 3 dias com streak > 0 (recência
  // parcial: 30 * 0.6 = 18), sem sono ruim -> só falta água (15). Total 33.
  const patient = basePatient({ recipes: [], streak: 2, lastActivityDate: daysAgo(3).toISOString() });
  const result = computeRiskScore(patient, REF_DATE);
  assert.ok(result.score < 40, `esperado <40, obtido ${result.score}`);
  assert.equal(result.level, 'baixo');
});
test('40 <= score < 70 -> medio', () => {
  // Sem dieta (zera adesão): recência crítica (30) + sem água (15) = 45.
  const patient = basePatient({ recipes: [], streak: 0, lastActivityDate: daysAgo(5).toISOString() });
  const result = computeRiskScore(patient, REF_DATE);
  assert.ok(result.score >= 40 && result.score < 70, `esperado [40,70), obtido ${result.score}`);
  assert.equal(result.level, 'medio');
});
test('score >= 70 -> alto', () => {
  const patient = basePatient({ streak: 0, lastActivityDate: null }); // recência 30 + adesão 35 (sem log) + hidratação 15 = 80
  const result = computeRiskScore(patient, REF_DATE);
  assert.ok(result.score >= 70);
  assert.equal(result.level, 'alto');
});
test('score nunca passa de 100', () => {
  const patient = basePatient({
    streak: 0,
    lastActivityDate: null,
    sleepLogs: [{ date: ptBr(REF_DATE), hours: 3, quality: 'Ruim' }],
    aiRiskSignal: { reason: 'x', detectedAt: REF_DATE.toISOString() },
    behavioralRiskSignal: { detectedAt: REF_DATE.toISOString(), keyword: 'doce' },
  });
  const result = computeRiskScore(patient, REF_DATE);
  assert.ok(result.score <= 100);
});

console.log(`\n${passed} asserts OK.`);
