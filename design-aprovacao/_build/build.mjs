// Gera as 12 páginas + índice. Uso: node design-aprovacao/_build/build.mjs
import { copyFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { STYLES, SURFACES, BRAND } from './data.mjs';
import { landing } from './landing.mjs';
import { nutri } from './nutri.mjs';
import { paciente } from './paciente.mjs';

const OUT = join(import.meta.dirname, '..');
const BODIES = { landing, nutri, paciente };
const TITLES = {
  landing: `${BRAND} — Landing`,
  nutri: `${BRAND} — App do nutricionista`,
  paciente: `${BRAND} — App do paciente`,
};

function protoBar(style, current) {
  const links = SURFACES.map((s) => `<a href="${s.id}.html"${s.id === current ? ' aria-current="page"' : ''}>${s.label}</a>`).join('');
  return `<nav class="proto-bar" aria-label="Protótipo para aprovação"><a href="../index.html">← Todos os estilos</a><span class="proto-name">Estilo ${style.letter} · ${style.name}</span>${links}</nav>`;
}

function page(style, surface) {
  const frame = surface === 'paciente' ? '<link rel="stylesheet" href="../_shared/mobile-frame.css" />\n  ' : '';
  return `<!doctype html>
<html lang="pt-BR" data-style="${style.id}" data-surface="${surface}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${TITLES[surface]} · ${style.name}</title>
  <link rel="stylesheet" href="tokens.css" />
  <link rel="stylesheet" href="../_shared/base.css" />
  <link rel="stylesheet" href="../_shared/components.css" />
  ${frame}<link rel="stylesheet" href="style.css" />
</head>
<body class="${surface}">
  ${protoBar(style, surface)}
  ${BODIES[surface]()}
</body>
</html>
`;
}

function indexPage() {
  const cards = STYLES.map((s) => `
    <article class="card">
      <p class="letter">Estilo ${s.letter}</p>
      <h2>${s.name}</h2>
      <p>${s.vibe}</p>
      <div class="swatches" aria-hidden="true">${s.swatches.map((c) => `<span style="background:${c}"></span>`).join('')}</div>
      <div class="links">${SURFACES.map((x) => `<a href="${s.id}/${x.id}.html">${x.label} <span aria-hidden="true">→</span></a>`).join('')}</div>
    </article>`).join('');
  return `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${BRAND} — Redesign para aprovação</title>
  <link rel="stylesheet" href="_shared/base.css" />
  <link rel="stylesheet" href="_shared/index.css" />
</head>
<body>
  <main class="wrap">
    <p id="zip-warn" class="zip-warn" role="alert" hidden><strong>Extraia o arquivo .zip antes de abrir.</strong> Você abriu o índice de dentro do .zip, por isso os links dos estilos não funcionam. Clique com o botão direito no .zip, escolha “Extrair tudo…” e abra o <code>index.html</code> da pasta extraída.</p>
    <header class="head">
      <h1>Redesign do ${BRAND}: escolha o estilo</h1>
      <p>Quatro direções visuais, cada uma com a landing, o app do nutricionista e o app do paciente. O conteúdo e os dados são os mesmos (fictícios); muda só o visual.</p>
      <p class="how"><strong>Como aprovar:</strong> abra os três links de cada estilo, compare e responda com a letra do estilo escolhido (A, B, C ou D) e o que gostaria de ajustar.</p>
    </header>
    <div class="grid">${cards}</div>
    <section class="atual" aria-labelledby="atual-t">
      <h2 id="atual-t">Como é hoje</h2>
      <p>As telas reais do Nutrivvo em produção, para comparar com os estilos acima. Os 4 estilos redesenham estas mesmas telas.</p>
      <div class="atual-grid">
        <figure><img src="_shared/atual/screen_nutri.png" alt="Painel Visão Geral do CRM do nutricionista, atual" /><figcaption>CRM do nutricionista · Visão Geral</figcaption></figure>
        <figure><img src="_shared/atual/screen_paciente.png" alt="Tela Início do app do paciente, atual" /><figcaption>App do paciente · Início</figcaption></figure>
      </div>
    </section>
    <p class="foot">Protótipos estáticos para validar o visual. Nenhum dado é real.</p>
  </main>
  <script>
    try { if (/\.zip([\\/]|$)|Temp\d+_/i.test(decodeURIComponent(location.href))) document.getElementById('zip-warn').hidden = false; } catch (e) {}
  </script>
</body>
</html>
`;
}

// Prints reais do produto, usados no índice como "Como é hoje".
mkdirSync(join(OUT, '_shared', 'atual'), { recursive: true });
for (const f of ['screen_nutri.png', 'screen_paciente.png']) {
  copyFileSync(join(OUT, '..', 'public', f), join(OUT, '_shared', 'atual', f));
}

for (const style of STYLES) {
  mkdirSync(join(OUT, style.id), { recursive: true });
  for (const surface of SURFACES) {
    writeFileSync(join(OUT, style.id, `${surface.id}.html`), page(style, surface.id));
  }
}
writeFileSync(join(OUT, 'index.html'), indexPage());
console.log(`build: ${STYLES.length * SURFACES.length} páginas + index.html`);
