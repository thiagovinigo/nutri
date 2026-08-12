/**
 * Parser do markdown estruturado retornado pela análise de exames por IA
 * (prompt em src/features/nutricionista/pages/DashboardNutri.jsx,
 * analyzeExamWithAI). Extraído de ConsultationFlow.jsx pra ser reusado
 * também no app do paciente (Profile.jsx, seção "Meus Exames") sem
 * duplicar a lógica.
 */

function normTitle(s) {
  return (s || '').toLowerCase()
    .normalize('NFD').replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z\s]/g, '').trim();
}

/**
 * Quebra o markdown de um laudo em seções nomeadas (detalhada, evolucao,
 * leiga, profissional, referencias) com base nos headers "## N. Titulo".
 * @param {string} markdown
 * @returns {{detalhada?: string, evolucao?: string, leiga?: string, profissional?: string, referencias?: string}}
 */
export function parseMarkdownTabs(markdown) {
  if (!markdown) return {};
  const chunks = [];
  let cur = { title: 'analise detalhada', lines: [] };

  const lines = markdown.split('\n');
  for (let line of lines) {
    const cleanLine = line.trim();
    // Tenta capturar headers como "## Titulo", "**Titulo**", "1. Titulo", "1. **Titulo**", "### **Titulo**"
    let headerMatch = cleanLine.match(/^#{1,6}\s+(?:(?:[0-9]+\.)?\s*)?(?:\*\*)?(.*?)(?:\*\*)?:?$/) ||
                      cleanLine.match(/^(?:[0-9]+\.)?\s*\*\*(.*?)\*\*:?$/) ||
                      cleanLine.match(/^[0-9]+\.\s+(.*)$/);

    if (headerMatch) {
      const parsedTitle = normTitle(headerMatch[1]);
      // Verifica se o header bate com nossas abas esperadas para não quebrar em listas numeradas comuns
      if (['analise', 'evolucao', 'traducao', 'visao', 'comite', 'leiga', 'profissional', 'referencias', 'historico'].some(k => parsedTitle.includes(k))) {
        chunks.push(cur);
        cur = { title: parsedTitle, lines: [] };
        continue;
      }
    }

    cur.lines.push(line);
  }
  chunks.push(cur);

  const find = (...keys) => {
    const c = chunks.filter(c => keys.some(k => c.title.includes(k)));
    return c.length ? c.map(x => x.lines.join('\n').trim()).join('\n\n---\n\n') : '';
  };

  const parsed = {
    detalhada: find('analise', 'exames'),
    evolucao: find('evolucao', 'comparacao', 'historico'),
    leiga: find('traducao', 'leiga', 'paciente'),
    profissional: find('visao', 'medica', 'nutricional', 'tecnica', 'profissional', 'comite'),
    referencias: find('referencias bibliograficas', 'referencias'),
  };

  if (!parsed.detalhada && !parsed.leiga && !parsed.profissional && !parsed.evolucao) {
    parsed.detalhada = markdown;
  }

  return parsed;
}

export const EXAM_TABS = [
  { key: 'detalhada', label: 'Análise Detalhada' },
  { key: 'evolucao', label: 'Evolução Clínica' },
  { key: 'leiga', label: 'Tradução para o Paciente' },
  { key: 'profissional', label: 'Visão do Prof. e Comitê' },
  { key: 'referencias', label: 'Referências' },
];
