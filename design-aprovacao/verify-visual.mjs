// Verificação visual no navegador. Uso: node design-aprovacao/verify-visual.mjs
// Requer Playwright global (npm i -g playwright). Sai 0 se tudo certo; 1 listando falhas.
//  1. contraste AA de todo texto visível (considera gradientes, alpha e opacidade);
//  2. foco visível nos campos de busca;
//  3. nome acessível em todo link de navegação (também com rótulos ocultos);
//  4. respiro entre o CTA e o rodapé / blocos da landing.
import { execSync } from 'node:child_process';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const { chromium } = await import(pathToFileURL(join(execSync('npm root -g').toString().trim(), 'playwright', 'index.mjs')).href);
const ROOT = import.meta.dirname;
const STYLES = ['terrasprint', 'spectra', 'otto', 'moveflux'];
const SURFACES = ['landing', 'nutri', 'paciente'];
const url = (s, p) => pathToFileURL(join(ROOT, s, `${p}.html`)).href;
const failures = [];

/** Roda no navegador: devolve violações de contraste da página. */
function contrastProbe() {
  const num = (s) => s.match(/-?\d*\.?\d+(?:e-?\d+)?/g).map(Number);
  const parse = (s) => {
    if (!s || s === 'transparent') return [0, 0, 0, 0];
    const v = num(s);
    if (s.startsWith('color(')) return [v[0] * 255, v[1] * 255, v[2] * 255, v[3] ?? 1];
    return [v[0], v[1], v[2], v[3] ?? 1];
  };
  const over = (top, bot) => {
    const a = top[3];
    return [top[0] * a + bot[0] * (1 - a), top[1] * a + bot[1] * (1 - a), top[2] * a + bot[2] * (1 - a), 1];
  };
  const lum = (c) => {
    const [r, g, b] = c.slice(0, 3).map((x) => { const v = x / 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const ratio = (a, b) => { const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x); return (hi + 0.05) / (lo + 0.05); };
  const stops = (img) => (img.match(/(?:rgba?|color)\([^)]*\)/g) || []).map(parse).filter((c) => c[3] > 0.02);
  const bgs = (el) => {
    const parent = el.parentElement;
    let base = parent ? bgs(parent) : [[255, 255, 255, 1]];
    const cs = getComputedStyle(el);
    const own = parse(cs.backgroundColor);
    if (own[3] > 0.02) base = base.map((b) => over(own, b));
    if (cs.backgroundImage && cs.backgroundImage !== 'none' && /gradient/.test(cs.backgroundImage)) {
      const st = stops(cs.backgroundImage);
      if (st.length) base = st.flatMap((s) => base.map((b) => over(s, b)));
    }
    return base;
  };
  const opacityOf = (el) => { let o = 1; for (let e = el; e; e = e.parentElement) o *= parseFloat(getComputedStyle(e).opacity); return o; };
  const out = [];
  for (const el of document.querySelectorAll('body *')) {
    if (el.closest('.proto-bar, svg, .sr-only') || !el.getClientRects().length) continue;
    const own = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
    if (!own) continue;
    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || cs.display === 'none') continue;
    const fg = parse(cs.color);
    if (fg[3] < 0.02) continue; // texto transparente (background-clip: text) é avaliado a olho, não por cor
    const op = opacityOf(el);
    const size = parseFloat(cs.fontSize);
    const large = size >= 24 || (size >= 18.66 && parseInt(cs.fontWeight, 10) >= 700);
    const min = large ? 3 : 4.5;
    let worst = Infinity;
    for (const bg of bgs(el)) {
      const solid = over([fg[0], fg[1], fg[2], fg[3] * op], bg);
      worst = Math.min(worst, ratio(solid, bg));
    }
    if (worst < min) out.push({ sel: `${el.tagName.toLowerCase()}.${String(el.className).split(' ')[0]}`, text: el.textContent.trim().slice(0, 28), ratio: +worst.toFixed(2), min });
  }
  return out;
}

const browser = await chromium.launch();
for (const style of STYLES) {
  // 1. contraste (1440 mostra desktop e as 3 molduras de celular por linha)
  for (const page of SURFACES) {
    const p = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await p.goto(url(style, page));
    const found = await p.evaluate(contrastProbe);
    const uniq = [...new Map(found.map((f) => [`${f.sel}|${f.text}`, f])).values()];
    for (const f of uniq) failures.push(`contraste ${style}/${page}: ${f.sel} "${f.text}" ${f.ratio}:1 (mín ${f.min})`);
    await p.close();
  }
  // 2 e 3. foco e nome acessível no app do nutricionista, em desktop e mobile
  for (const width of [1440, 390]) {
    const p = await browser.newPage({ viewport: { width, height: 900 } });
    await p.goto(url(style, 'nutri'));
    const unnamed = await p.evaluate(() => [...document.querySelectorAll('nav a, .brand')].filter((a) => !(a.getAttribute('aria-label') || a.innerText || '').trim()).length);
    if (unnamed) failures.push(`nome acessível ${style}/nutri@${width}: ${unnamed} link(s) sem nome`);
    if (width === 1440) {
      const input = p.locator('.search input').first();
      await input.focus();
      const ring = await p.evaluate(() => {
        const i = document.activeElement;
        const box = i.closest('.search');
        const vis = (e) => { const c = getComputedStyle(e); return (c.outlineStyle !== 'none' && parseFloat(c.outlineWidth) > 0) || c.boxShadow !== 'none'; };
        return vis(i) || vis(box);
      });
      if (!ring) failures.push(`foco ${style}/nutri: campo de busca sem indicador de foco`);
    }
    await p.close();
  }
  // 4. respiro na landing
  const p = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto(url(style, 'landing'));
  const gaps = await p.evaluate(() => {
    const m = (s) => { const e = document.querySelector(s); return e ? getComputedStyle(e) : null; };
    return { cta: parseFloat(m('.cta').marginBottom), problem: parseFloat(m('.problem').marginTop) };
  });
  if (gaps.cta < 24) failures.push(`respiro ${style}/landing: .cta margin-bottom ${gaps.cta}px (mín 24)`);
  if (style === 'otto' && gaps.problem < 24) failures.push(`respiro otto/landing: .problem margin-top ${gaps.problem}px (mín 24)`);
  await p.close();
}
await browser.close();

if (failures.length) {
  console.error(`verify-visual: ${failures.length} falha(s)\n- ${failures.join('\n- ')}`);
  process.exit(1);
}
console.log('verify-visual: ok');
