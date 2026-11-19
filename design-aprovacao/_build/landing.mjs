import { ico } from './icons.mjs';
import { spark } from './charts.mjs';
import { BRAND, TAGLINE, FEATURES, PLANS } from './data.mjs';

const brand = `<a class="brand" href="#hero"><span class="brand-mark" aria-hidden="true">${ico('leaf', 22)}</span>${BRAND}</a>`;

const header = `
<header class="site-header">
  ${brand}
  <nav class="site-nav" aria-label="Seções">
    <a href="#recursos">Recursos</a><a href="#prova">Resultados</a><a href="#planos">Planos</a><a href="#cta">Entrar</a>
  </nav>
  <a class="btn btn--primary site-cta" href="#cta">Começar grátis</a>
</header>`;

const hero = `
<section id="hero" class="hero" aria-labelledby="hero-title">
  <div class="hero-copy">
    <p class="eyebrow">Gestão de pacientes para nutricionistas</p>
    <h1 id="hero-title">${TAGLINE}</h1>
    <p class="lede">O Nutrivvo acompanha seus pacientes todos os dias, avisa quem está se afastando e reduz o tempo de consulta.</p>
    <div class="actions">
      <a class="btn btn--primary" href="#cta">Começar grátis ${ico('arrow', 18)}</a>
      <a class="btn btn--ghost" href="#recursos">Ver o painel</a>
    </div>
  </div>
  <div class="hero-art" aria-hidden="true">
    <div class="art-card art-card--risk">
      <span class="chip chip--alert">Risco alto</span>
      <strong class="truncate">Marina A.</strong>
      <small>Inativa há 4 dias · sem foto do almoço</small>
    </div>
    <div class="art-card art-card--streak">${ico('flame', 28)}<strong class="num">14 dias</strong><small>ofensiva ativa</small></div>
    <div class="art-card art-card--adherence">
      <small>Adesão média</small><strong class="num">86%</strong>
      ${spark([62, 66, 71, 70, 78, 82, 86])}
    </div>
  </div>
</section>`;

const problem = `
<section id="problema" class="problem" aria-labelledby="problema-title">
  <h2 id="problema-title">Entre uma consulta e outra, a adesão some.</h2>
  <div class="facts">
    <article class="fact"><p class="fact-num num">41%</p><p>dos pacientes largam o plano em 30 dias</p></article>
    <article class="fact"><p class="fact-num">${ico('clock', 34)}</p><p>Você só descobre na consulta seguinte</p></article>
    <article class="fact fact--solution"><p class="fact-num">${ico('alert', 34)}</p><p>Com o Nutrivvo você vê o risco em tempo real</p></article>
  </div>
</section>`;

const features = `
<section id="recursos" class="features" aria-labelledby="recursos-title">
  <div class="section-head"><p class="eyebrow">Recursos</p><h2 id="recursos-title">Por que escolher o Nutrivvo?</h2></div>
  <div class="feature-grid">
    ${FEATURES.map((f, i) => `<article class="feature feature--${i + 1}"><span class="feature-ico">${ico(f.icon, 26)}</span><h3>${f.title}</h3><p>${f.text}</p></article>`).join('')}
  </div>
</section>`;

const proof = `
<section id="prova" class="proof" aria-labelledby="prova-title">
  <h2 id="prova-title" class="sr-only">O que dizem os nutricionistas</h2>
  <figure class="quote">
    <blockquote>“Reduzi 12 minutos por consulta e meus pacientes voltaram a registrar.”</blockquote>
    <figcaption><strong>Dra. Helena Prado</strong>, nutricionista clínica</figcaption>
  </figure>
  <dl class="metrics">
    <div><dt>pacientes acompanhados</dt><dd class="num">+2.400</dd></div>
    <div><dt>adesão média</dt><dd class="num">86%</dd></div>
    <div><dt>a menos por consulta</dt><dd class="num">12 min</dd></div>
  </dl>
</section>`;

const plans = `
<section id="planos" class="plans" aria-labelledby="planos-title">
  <div class="section-head"><p class="eyebrow">Planos</p><h2 id="planos-title">Cresça no seu ritmo.</h2></div>
  <div class="plan-grid">
    ${PLANS.map((p) => `
    <article class="plan${p.featured ? ' plan--featured' : ''}">
      ${p.featured ? '<span class="plan-badge">Mais escolhido</span>' : ''}
      <h3>${p.name}</h3>
      <p class="price"><span class="num">R$ ${p.price}</span><small>/mês</small></p>
      <p class="plan-limit">${p.limit}</p>
      <ul>${p.perks.map((k) => `<li>${ico('check', 18)}${k}</li>`).join('')}</ul>
      <a class="btn ${p.featured ? 'btn--primary' : 'btn--ghost'}" href="#cta">Escolher ${p.name}</a>
    </article>`).join('')}
  </div>
</section>`;

const cta = `
<section id="cta" class="cta" aria-labelledby="cta-title">
  <h2 id="cta-title">Junte-se aos nutricionistas que automatizaram o acompanhamento entre consultas.</h2>
  <a class="btn btn--primary btn--lg" href="#hero">Criar minha conta</a>
  <p class="cta-note">${ico('shield', 18)}Dados de cada paciente isolados por regra própria — nenhum nutricionista vê paciente de outro.</p>
</section>`;

const footer = `
<footer class="site-footer">
  ${brand}
  <p>© 2026 Nutrivvo. Todos os direitos reservados.</p>
</footer>`;

/** Corpo da landing: 6 <section> dentro de <main>. */
export function landing() {
  return `${header}<main>${hero}${problem}${features}${proof}${plans}${cta}</main>${footer}`;
}
