import { parseMarkdownTabs } from './examMarkdown.js';

/**
 * Monta o pacote JSON estruturado para portabilidade e exportação integral dos
 * dados pessoais do titular (Art. 18, LGPD), omitindo campos internos do
 * servidor (chat_ids de mensageiros, scores internos do radar e abas clínicas
 * restritas ao profissional).
 *
 * @param {object} patient
 * @returns {object}
 */
export function buildPatientExportPayload(patient) {
  const safe = patient || {};
  const rawExams = Array.isArray(safe.exams) ? safe.exams : [];

  return {
    exportedAt: new Date().toISOString(),
    platform: 'Nutrivvo',
    lgpdNotice: 'Exportação integral dos dados pessoais e registros clínicos do titular (Art. 18, LGPD).',
    profile: {
      name: safe.name || '',
      email: safe.email || '',
      cpf: safe.cpf || '',
      phone: safe.phone || '',
      age: safe.age || '',
      gender: safe.gender || '',
      objective: safe.objective || '',
      aversions: safe.aversions || '',
      medications: safe.medications || '',
      restrictions: safe.restrictions || '',
      nutriName: safe.nutriName || '',
      createdAt: safe.createdAt || null
    },
    gamification: {
      xp: safe.xp || 0,
      streak: safe.streak || 0,
      lastActivityDate: safe.lastActivityDate || null
    },
    weights: Array.isArray(safe.weights) ? safe.weights : [],
    waterLogs: safe.waterLogs && typeof safe.waterLogs === 'object' ? safe.waterLogs : {},
    sleepLogs: Array.isArray(safe.sleepLogs) ? safe.sleepLogs : [],
    foodLogs: Array.isArray(safe.foodLogs) ? safe.foodLogs : [],
    recipes: Array.isArray(safe.recipes) ? safe.recipes : [],
    workoutPlan: safe.workoutPlan || null,
    exams: rawExams.map((ex) => {
      const parsed = parseMarkdownTabs(ex?.aiSummaryProfessional || ex?.analysis || '');
      return {
        id: ex?.id || null,
        date: ex?.date || ex?.dateUploaded || null,
        patientSummary: parsed.leiga || null,
        nutriParecer: ex?.nutriParecer || null
      };
    })
  };
}

/**
 * Gera download direto no navegador do arquivo meus-dados-nutrivvo.json.
 *
 * @param {object} patient
 */
export function downloadPatientExportJson(patient) {
  const payload = buildPatientExportPayload(patient);
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'meus-dados-nutrivvo.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
