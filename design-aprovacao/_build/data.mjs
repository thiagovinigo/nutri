// Dados fictícios compartilhados pelos 4 estilos (espelham _shared/content.md).
export const BRAND = 'Nutrivvo';
export const TAGLINE = 'Pare de perder paciente no silêncio entre consultas.';

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

export const PATIENTS = [
  { name: 'Marina Albuquerque Teixeira de Souza', age: 34, goal: 'Emagrecimento', adherence: 38, risk: 'alto' },
  { name: 'Carlos Menezes', age: 47, goal: 'Hipertrofia', adherence: 91, risk: 'baixo' },
  { name: 'Júlia Ferraz', age: 29, goal: 'Reeducação', adherence: 72, risk: 'médio' },
  { name: 'Rafael Tavares', age: 52, goal: 'Diabetes tipo 2', adherence: 84, risk: 'baixo' },
  { name: 'Beatriz Nogueira', age: 41, goal: 'Gestante', adherence: 95, risk: 'baixo' },
];

export const ATTENTION = [
  { name: 'Marina Albuquerque Teixeira de Souza', note: 'Inativa há 4 dias · sem foto do almoço', risk: 'alto' },
  { name: 'Carlos Menezes', note: 'Perdeu a ofensiva no fim de semana', risk: 'médio' },
  { name: 'Júlia Ferraz', note: 'Peso estagnado há 3 semanas', risk: 'médio' },
];

export const FEATURES = [
  { icon: 'calendar', title: 'Agenda e consulta guiada', text: 'Roteiro da consulta, anamnese e retornos em um só lugar.' },
  { icon: 'leaf', title: 'Plano alimentar em minutos', text: 'Monte cardápios com macros calculados e envie ao paciente.' },
  { icon: 'camera', title: 'Diário por foto, sem digitação', text: 'O paciente fotografa o prato e o Nutrivvo faz o registro.' },
  { icon: 'flame', title: 'Gamificação com ofensivas', text: 'Missões e marcos que mantêm o paciente voltando todo dia.' },
  { icon: 'sparkles', title: 'Assistente com IA', text: 'Responde dúvidas do paciente dentro do plano que você definiu.' },
  { icon: 'wallet', title: 'Financeiro do consultório', text: 'Cobranças, recebíveis e inadimplência sem planilha.' },
];

export const PLANS = [
  { name: 'Essencial', price: 49, limit: 'até 20 pacientes', perks: ['Agenda e plano alimentar', 'Diário por foto'], featured: false },
  { name: 'Clínica', price: 99, limit: 'até 80 pacientes', perks: ['Tudo do Essencial', 'Assistente com IA', 'Financeiro'], featured: true },
  { name: 'Estúdio', price: 189, limit: 'pacientes ilimitados', perks: ['Tudo da Clínica', 'Equipe e permissões'], featured: false },
];

export const MEALS = [
  { name: 'Café da manhã', time: '7h30', kcal: 520, items: ['Omelete de 2 ovos', 'Pão integral', 'Mamão papaia', 'Café com leite'] },
  { name: 'Lanche', time: '10h00', kcal: 180, items: ['Iogurte natural', 'Castanhas'] },
  { name: 'Almoço', time: '12h30', kcal: 780, items: ['Arroz integral', 'Filé de frango grelhado', 'Feijão', 'Salada de folhas'] },
  { name: 'Lanche da tarde', time: '16h00', kcal: 220, items: ['Banana com aveia'] },
  { name: 'Jantar', time: '19h30', kcal: 400, items: ['Sopa de legumes com frango'] },
];

export const WEEK = [
  { day: 'Seg', date: '17', events: [{ t: '09:30', who: 'Ana Beltrão', kind: 'avaliação' }, { t: '16:00', who: 'Pedro Lacerda', kind: 'retorno' }] },
  { day: 'Ter', date: '18', events: [{ t: '10:00', who: 'Sofia Duarte', kind: 'retorno' }] },
  { day: 'Qua', date: '19', today: true, events: [
    { t: '09:00', who: 'Carlos Menezes', kind: 'retorno' },
    { t: '10:00', who: 'Júlia Ferraz', kind: 'avaliação' },
    { t: '11:30', who: 'Rafael Tavares', kind: 'retorno' },
    { t: '14:00', who: 'Beatriz Nogueira', kind: 'pré-natal' },
    { t: '15:30', who: 'Marina Albuquerque Teixeira de Souza', kind: 'reengajamento' },
  ] },
  { day: 'Qui', date: '20', events: [{ t: '08:30', who: 'Lúcia Prado', kind: 'avaliação' }, { t: '15:00', who: 'Tiago Brandão', kind: 'retorno' }] },
  { day: 'Sex', date: '21', events: [{ t: '11:00', who: 'Camila Rocha', kind: 'retorno' }] },
];

export const TRANSACTIONS = [
  { what: 'Consulta de retorno', who: 'Rafael Tavares', value: 'R$ 220', status: 'pago' },
  { what: 'Pacote trimestral', who: 'Beatriz Nogueira', value: 'R$ 1.290', status: 'pago' },
  { what: 'Avaliação', who: 'Júlia Ferraz', value: 'R$ 350', status: 'pendente' },
  { what: 'Plano mensal', who: 'Carlos Menezes', value: 'R$ 480', status: 'pago' },
];

export const MISSIONS = [
  { label: 'Registrar o café da manhã', done: true },
  { label: 'Beber 2,5 L de água (1,5 L)', done: false, icon: 'drop' },
  { label: 'Foto do almoço', done: false, icon: 'camera' },
  { label: 'Treino A', done: false, icon: 'dumbbell' },
  { label: 'Fechar o dia no diário', done: true },
];
