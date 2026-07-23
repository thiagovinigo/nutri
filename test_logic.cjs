const patients = [
  { id: '1', cpf: '111.111.111-11', email: 'test1@test.com' },
  { id: '2', cpf: '', email: '' },
  { id: '3' }
];

const patCpf = '222.222.222-22';
const patEmail = 'novo@test.com';

const normalizeCpf = (cpf) => String(cpf || '').replace(/\D/g, '');
const normalizeEmail = (email) => String(email || '').toLowerCase().trim();

const isDuplicate = patients.some(p => {
  const cleanPatCpf = normalizeCpf(patCpf);
  const cleanPatEmail = normalizeEmail(patEmail);
  
  const sameCpf = cleanPatCpf !== '' && normalizeCpf(p.cpf) === cleanPatCpf;
  const sameEmail = cleanPatEmail !== '' && normalizeEmail(p.email) === cleanPatEmail;
  
  return sameCpf || sameEmail;
});

console.log('isDuplicate for new cpf/email:', isDuplicate);

const isDuplicateEmpty = patients.some(p => {
  const cleanPatCpf = normalizeCpf('');
  const cleanPatEmail = normalizeEmail('');
  
  const sameCpf = cleanPatCpf !== '' && normalizeCpf(p.cpf) === cleanPatCpf;
  const sameEmail = cleanPatEmail !== '' && normalizeEmail(p.email) === cleanPatEmail;
  
  return sameCpf || sameEmail;
});

console.log('isDuplicate for empty cpf/email:', isDuplicateEmpty);

const isDuplicateSame = patients.some(p => {
  const cleanPatCpf = normalizeCpf('11111111111');
  const cleanPatEmail = normalizeEmail('');
  
  const sameCpf = cleanPatCpf !== '' && normalizeCpf(p.cpf) === cleanPatCpf;
  const sameEmail = cleanPatEmail !== '' && normalizeEmail(p.email) === cleanPatEmail;
  
  return sameCpf || sameEmail;
});
console.log('isDuplicate for existing cpf:', isDuplicateSame);

