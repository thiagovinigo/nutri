import { describe, it, expect } from 'vitest';
import { buildPatientExportPayload } from './lgpdExport.js';

describe('buildPatientExportPayload (LGPD Soberania)', () => {
  it('inclui dados do titular e resumo leigo de exames, omitindo campos internos/restritos', () => {
    const samplePatient = {
      id: 'pat-123',
      name: 'Marina Albuquerque',
      email: 'marina@exemplo.com',
      cpf: '11122233344',
      phone: '11999999999',
      age: 32,
      gender: 'F',
      objective: 'Recomposição corporal',
      aversions: 'pimentão',
      medications: 'Vitamina D',
      restrictions: 'sem lactose',
      nutriName: 'Dra. Carla',
      createdAt: '2026-08-01T10:00:00.000Z',
      xp: 480,
      streak: 14,
      lastActivityDate: '2026-11-19T12:00:00.000Z',
      weights: [{ date: '10/11/2026', value: '62.5' }],
      waterLogs: { '19/11/2026': 2000 },
      sleepLogs: [{ date: '19/11/2026', hours: 8, quality: 'Bom' }],
      foodLogs: [{ date: '19/11/2026', mealName: 'Almoço', log: 'Seguiu o plano' }],
      recipes: [{ title: 'Plano TACO', meals: [] }],
      workoutPlan: { title: 'Treino A' },
      exams: [
        {
          id: 'ex-1',
          date: '2026-10-15',
          aiSummaryProfessional:
            '## 3. Tradução para o Paciente\nVitamina D adequada!\n## 4. Visão Técnica Profissional\nParecer técnico interno sigiloso.',
          nutriParecer: 'Manter suplementação atual.'
        }
      ],
      // Campos internos que NUNCA devem vazar na exportação do paciente
      telegram_chat_id: '987654321',
      whatsapp_chat_id: '5511999999999@s.whatsapp.net',
      riskScore: 72,
      riskLevel: 'alto',
      riskFactors: ['Inativo há 4 dias'],
      riskOverride: { level: 'baixo', reason: 'Viagem' }
    };

    const result = buildPatientExportPayload(samplePatient);

    expect(result.platform).toBe('Nutrivvo');
    expect(result.profile.name).toBe('Marina Albuquerque');
    expect(result.profile.email).toBe('marina@exemplo.com');
    expect(result.gamification).toEqual({
      xp: 480,
      streak: 14,
      lastActivityDate: '2026-11-19T12:00:00.000Z'
    });
    expect(result.weights).toEqual([{ date: '10/11/2026', value: '62.5' }]);
    expect(result.waterLogs).toEqual({ '19/11/2026': 2000 });
    expect(result.foodLogs).toHaveLength(1);
    expect(result.recipes).toHaveLength(1);

    // Exames preservam tradução leiga e parecer aprovado, sem abas clínicas internas
    expect(result.exams[0]).toEqual({
      id: 'ex-1',
      date: '2026-10-15',
      patientSummary: 'Vitamina D adequada!',
      nutriParecer: 'Manter suplementação atual.'
    });

    // Verificação estrita de não vazamento de campos server-only/clínicos internos
    const serialized = JSON.stringify(result);
    expect(serialized).not.toContain('telegram_chat_id');
    expect(serialized).not.toContain('whatsapp_chat_id');
    expect(serialized).not.toContain('riskScore');
    expect(serialized).not.toContain('riskLevel');
    expect(serialized).not.toContain('riskFactors');
    expect(serialized).not.toContain('riskOverride');
    expect(serialized).not.toContain('aiSummaryProfessional');
    expect(serialized).not.toContain('Parecer técnico interno sigiloso');
  });
});
