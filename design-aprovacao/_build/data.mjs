// Dados do pacote. Textos de interface copiados das telas reais do Nutrivvo;
// pacientes e valores são os do modo demo do próprio app (fictícios).
export const BRAND = 'Nutrivvo';

export const STYLES = [
  { id: 'terrasprint', letter: 'A', name: 'TerraSprint', vibe: 'Editorial e orgânico: serifa, verde-folha e tons quentes.', swatches: ['#f4f5f5', '#2f6844', '#b4532f', '#f1ded6'] },
  { id: 'spectra', letter: 'B', name: 'Spectra', vibe: 'Escuro premium: verde-floresta sobre quase-preto, tipografia leve.', swatches: ['#0a1814', '#34d399', '#3f8568', '#eaf4ef'] },
  { id: 'otto', letter: 'C', name: 'Otto', vibe: 'Acolhedor: creme, verde profundo e pastéis arredondados.', swatches: ['#fffdf7', '#172e2b', '#c6d7b6', '#f3dbca'] },
  { id: 'moveflux', letter: 'D', name: 'Moveflux', vibe: 'Denso e preciso: neutros stone, âmbar e tabelas compactas.', swatches: ['#fafaf9', '#1c1917', '#f59e0b', '#e7e5e4'] },
];

export const SURFACES = [
  { id: 'landing', label: 'Landing' },
  { id: 'nutri', label: 'Nutri' },
  { id: 'paciente', label: 'Paciente' },
];

export const initials = (name) => {
  const w = name.split(' ');
  return (w[0][0] + w[w.length - 1][0]).toUpperCase();
};

/** Pacientes do modo demo do app. */
export const PATIENTS = [
  { name: 'Ana Beatriz Souza', goal: 'Emagrecimento', streak: 12, xp: 480, status: 'Alto Engajamento', plan: 'Plano Mensal', pay: 'Pago' },
  { name: 'Carlos Eduardo Lima', goal: 'Hipertrofia', streak: 5, xp: 220, status: 'Ativo', plan: 'Plano Trimestral VIP', pay: 'Pendente' },
  { name: 'Juliana Ferreira', goal: 'Performance esportiva', streak: 1, xp: 40, status: 'Ativo', plan: 'Consulta Avulsa', pay: 'Pago' },
  { name: 'Rodrigo Martins', goal: 'Manutenção de saúde', streak: 0, xp: 90, status: 'Inativo', plan: 'Plano Mensal', pay: 'Atrasado', risk: true },
];
