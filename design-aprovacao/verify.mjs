// Verificador do pacote de aprovação. Uso: node design-aprovacao/verify.mjs
// Sai 0 se tudo certo; 1 listando as falhas.
import { existsSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';

const ROOT = import.meta.dirname;
const STYLES = ['terrasprint', 'spectra', 'otto', 'moveflux'];
const EXPECTED = {
  landing: { pattern: /<section\b/g, count: 6, label: '<section>' },
  nutri: { pattern: /data-screen=/g, count: 6, label: '[data-screen]' },
  paciente: { pattern: /data-screen=/g, count: 6, label: '[data-screen]' },
};
const EXTERNAL = /(?:src|href)=["']https?:|url\(\s*["']?https?:/i;
const REF = /(?:src|href)=["']([^"'#?]+)["']/g;

const failures = [];
const fail = (file, msg) => failures.push(`${file}: ${msg}`);

function checkPage(file, html) {
  if (!/<html[^>]*\blang=["']pt-BR["']/i.test(html)) fail(file, 'falta <html lang="pt-BR">');
  if (!/<meta[^>]+name=["']viewport["']/i.test(html)) fail(file, 'falta meta viewport');
  if (EXTERNAL.test(html)) fail(file, 'referência externa http(s) (deve abrir offline)');
  for (const [, ref] of html.matchAll(REF)) {
    if (/^(mailto:|tel:|data:)/.test(ref)) continue;
    if (!existsSync(join(dirname(file), ref))) fail(file, `arquivo referenciado não existe: ${ref}`);
  }
}

function checkStyleCss(style) {
  const css = join(ROOT, style, 'tokens.css');
  if (!existsSync(css)) return fail(css, 'tokens.css ausente');
  const text = readFileSync(css, 'utf8');
  for (const t of ['--bg', '--surface', '--text', '--text-muted', '--primary', '--accent', '--border', '--radius', '--font-body', '--font-display']) {
    if (!new RegExp(`${t}\\s*:`).test(text)) fail(css, `token ausente: ${t}`);
  }
}

for (const style of STYLES) {
  checkStyleCss(style);
  for (const [name, rule] of Object.entries(EXPECTED)) {
    const file = join(ROOT, style, `${name}.html`);
    if (!existsSync(file)) { fail(file, 'página ausente'); continue; }
    const html = readFileSync(file, 'utf8');
    checkPage(file, html);
    const found = (html.match(rule.pattern) || []).length;
    if (found !== rule.count) fail(file, `esperado ${rule.count} ${rule.label}, encontrado ${found}`);
  }
}

const index = join(ROOT, 'index.html');
if (existsSync(index)) {
  const html = readFileSync(index, 'utf8');
  checkPage(index, html);
  for (const style of STYLES) for (const name of Object.keys(EXPECTED)) {
    if (!html.includes(`${style}/${name}.html`)) fail(index, `falta link para ${style}/${name}.html`);
  }
}

if (failures.length) {
  console.error(`verify: ${failures.length} falha(s)\n- ${failures.join('\n- ')}`);
  process.exit(1);
}
console.log('verify: ok');
