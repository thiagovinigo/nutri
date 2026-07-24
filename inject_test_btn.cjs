const fs = require('fs');
const path = 'src/pages/Login.jsx';
let text = fs.readFileSync(path, 'utf8');

const replacement = 
                    <button
                        type="button"
                        onClick={() => {
                          const testPat = {
                            id: 'test_pat_structured',
                            name: 'Teste Estruturado',
                            age: 25,
                            gender: 'M',
                            recipes: [
                              {
                                id: 'r1',
                                title: 'Dieta Teste',
                                meals: [
                                  {
                                    name: 'Almoço',
                                    foods: [
                                      { name: 'Arroz branco, cozido', amount: 100, kcal: 130, protein: 2.5, carb: 28.1, fat: 0.2, foodId: '1' }
                                    ]
                                  }
                                ]
                              }
                            ]
                          };
                          bypassLoginAsPatient(testPat);
                          navigate('/paciente');
                        }}
                        style={{ padding: '8px 16px', backgroundColor: '#bfdbfe', color: '#1e3a8a', borderRadius: '6px', border: '1px solid #93c5fd', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 'bold' }}
                      >
                        DEV: Test Patient (Structured)
                      </button>
;

text = text.replace('{patients.find(p => p.name && p.name.toLowerCase().includes(\\'lucas\\')) && (', replacement + '\n{patients.find(p => p.name && p.name.toLowerCase().includes(\\'lucas\\')) && (');

fs.writeFileSync(path, text);
