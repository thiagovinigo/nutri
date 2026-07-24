const patients = [
  { id: '1', cpf: '12345678901', email: 'a@a.com' },
  { id: '2', cpf: '', email: '' }
];

const patCpf = '';
const patEmail = '';

const normalizeCpf = (cpf) => String(cpf || '').replace(/\D/g, '');
const normalizeEmail = (email) => String(email || '').toLowerCase().trim();

const isDuplicate = patients.some(p => {
  const cleanPatCpf = normalizeCpf(patCpf);
  const cleanPatEmail = normalizeEmail(patEmail);
  
  const sameCpf = cleanPatCpf !== '' && normalizeCpf(p.cpf) === cleanPatCpf;
  const sameEmail = cleanPatEmail !== '' && normalizeEmail(p.email) === cleanPatEmail;
  
  return sameCpf || sameEmail;
});

console.log('isDuplicate Empty:', isDuplicate);

