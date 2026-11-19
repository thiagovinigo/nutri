import { ico } from './icons.mjs';
import { ring, lineChart } from './charts.mjs';

const TABS = [
  { key: 'inicio', label: 'Início', icon: 'home' },
  { key: 'plano', label: 'Plano', icon: 'clipboard' },
  { key: 'treino', label: 'Treino', icon: 'dumbbell' },
  { key: 'receitas', label: 'Receitas', icon: 'book' },
  { key: 'ia', label: 'IA', icon: 'chat' },
  { key: 'perfil', label: 'Perfil', icon: 'user' },
];

const topbar = `<header class="topbar-app"><span class="topbar-brand">NUTRIVVO</span><span class="topbar-tools-app"><span class="stat-chip stat-chip--fire" title="Ofensiva">${ico('flame', 16)}<b class="num">12</b></span><span class="stat-chip stat-chip--xp" title="Nutri Score">${ico('hexagon', 16)}<b class="num">480</b></span><span class="icon-bare" aria-hidden="true">${ico('moon', 18)}</span><span class="icon-bare bell" aria-hidden="true">${ico('bell', 18)}<i>1</i></span></span></header>`;

const nav = (active) => `
<nav class="phone-nav" aria-label="Navegação do app">
  ${TABS.map((t) => `<a href="#${t.key}"${t.key === active ? ' aria-current="page"' : ''}>${ico(t.icon, 22)}<span class="tab-label">${t.label}</span></a>`).join('')}
</nav>`;

function phone(id, n, label, body, active) {
  return `
<section id="${id}" class="phone-wrap" data-screen="${id}" aria-label="${label}">
  <p class="phone-label"><span class="num">${String(n).padStart(2, '0')}</span> · ${label}</p>
  <div class="phone">${topbar}<div class="phone-body">${body}</div>${nav(active)}</div>
</section>`;
}

const dayNav = `<div class="day-nav"><button type="button" class="icon-btn" aria-label="Dia anterior">${ico('left', 18)}</button><strong>Hoje</strong><button type="button" class="icon-btn" aria-label="Próximo dia">${ico('right', 18)}</button></div>`;
const foodChips = (items) => `<ul class="food-chips">${items.map((i) => `<li>${i}</li>`).join('')}</ul>`;

/* 1 · Início (QuestBoard) */
const inicio = phone('inicio', 1, 'Início', `
  ${dayNav}
  <article class="card-row"><div class="grow"><h4>${ico('drop', 18)} Hidratação</h4><small>1.500 ml consumidos</small></div><span class="btn-row"><button class="icon-btn" type="button" aria-label="Remover 200 ml">-</button><button class="btn btn--primary btn--sm" type="button">+ ÁGUA</button></span></article>
  <article class="card-row"><div class="grow"><h4>${ico('moon', 18)} Sono e Recuperação</h4><small>Não registrado hoje</small></div><button class="btn btn--primary btn--sm" type="button">REGISTRAR</button></article>
  <button class="btn btn--ghost btn--block free-meal" type="button">${ico('flame', 18)} Registre refeição livre</button>
  <article class="card-row perf">${ring(33)}<div class="grow"><h4>Performance</h4><small>1 de 3 refeições concluídas</small></div></article>
  <h4 class="section-title">${ico('target', 20)} Refeições de Hoje</h4>
  <article class="meal-real"><div class="grow"><h5>Dia 1 - Café da Manhã</h5><a class="soft-link" href="#inicio">▸ Ver modo de preparo</a>${foodChips(['100g - Ovo de galinha, inteiro, cru', '30g - Aveia em flocos, crua', '100g - Banana, prata, crua'])}<a class="soft-link" href="#inicio">${ico('sparkles', 14)} Gerar Receita com IA</a></div><button class="btn btn--primary btn--sm" type="button">${ico('check', 14)} Fazer Check-in</button></article>
  <article class="meal-real is-done"><div class="grow"><h5>${ico('check', 16)} Almoço</h5>${foodChips(['120g - Arroz integral, cozido', '130g - Peito de frango, grelhado'])}</div><span class="chip chip--ok">CONCLUÍDO</span></article>`, 'inicio');

/* 2 · Plano (DietPlan) */
const plano = phone('plano', 2, 'Plano', `
  <header class="greet"><h3>${ico('clipboard', 22)} Prescrição Completa</h3></header>
  <div class="btn-row btn-row--wrap"><button class="btn btn--ghost btn--sm" type="button">Histórico <b class="count">3</b></button><button class="btn btn--ghost btn--sm" type="button">${ico('printer', 14)} Imprimir Plano</button><button class="btn btn--ok btn--sm" type="button">${ico('cart', 14)} Lista de Mercado</button></div>
  <article class="plan-title"><strong>Dieta de Transição (Verão)</strong><small>Gerada pela sua nutricionista</small></article>
  <div class="carousel"><button class="icon-btn icon-btn--round" type="button" aria-label="Dia anterior">${ico('left', 18)}</button><span><strong>Dia 3</strong><small class="num">3 / 7 dias</small></span><button class="icon-btn icon-btn--round" type="button" aria-label="Próximo dia">${ico('right', 18)}</button></div>
  <article class="meal-plan"><h5>Café da Manhã</h5><ul>
    <li><div class="grow"><strong>100g — Ovo de galinha, inteiro, cru</strong><small class="num">143 kcal | C: 1 | P: 13 | G: 10</small></div><button class="pill-btn" type="button">${ico('swap', 12)} Sub.</button></li>
    <li><div class="grow"><strong>30g — Aveia em flocos, crua</strong><small class="num">118 kcal | C: 20 | P: 4 | G: 2</small></div><button class="pill-btn" type="button">${ico('swap', 12)} Sub.</button></li></ul>
    <a class="soft-link" href="#plano">📖 Ver modo de preparo</a></article>
  <article class="meal-plan"><h5>Almoço</h5><ul><li><div class="grow"><strong>120g — Arroz integral, cozido</strong><small class="num">148 kcal | C: 31 | P: 3 | G: 1</small></div><button class="pill-btn" type="button">${ico('swap', 12)} Sub.</button></li></ul></article>
  <article class="supp"><h5>Vitaminas e Suplementos</h5><p>1000mg — Vitamina C</p></article>`, 'plano');

/* 3 · Treino (WorkoutPlan) */
const WEEK = [['D', 'rest'], ['S', 'done'], ['T', 'rest'], ['Q', 'today'], ['Q', 'next'], ['S', 'missed'], ['S', 'rest']];
const treino = phone('treino', 3, 'Treino', `
  <header class="greet"><h3>${ico('dumbbell', 22)} Meu Treino</h3><span class="chip chip--ok">1/3 treinos esta semana</span></header>
  <p class="notice">${ico('sparkles', 14)} Sugestão opcional gerada por IA — não substitui um Educador Físico.</p>
  <article class="plan-title"><strong>Ficha A/B — Hipertrofia</strong><small>Ficha personalizada — IA Personal Trainer</small></article>
  <h4 class="section-title">Semana Atual</h4>
  <ul class="week-strip">${WEEK.map(([d, s]) => `<li class="wk wk--${s}"><small>${d}</small><span>${s === 'done' ? ico('check', 14) : s === 'missed' ? '−' : s === 'today' ? ico('flame', 14) : s === 'rest' ? '·' : ''}</span></li>`).join('')}</ul>
  <article class="workout is-today"><header><strong>Treino A</strong><span class="chip chip--info">HOJE</span></header><small>5 exercícios · 2/5 marcados</small>
    <ul class="exercises">
      <li class="is-done"><span class="check">${ico('check', 14)}</span><div class="grow"><strong>Supino reto</strong><small>4 séries · 8-10</small></div></li>
      <li class="is-done"><span class="check">${ico('check', 14)}</span><div class="grow"><strong>Crucifixo inclinado</strong><small>3 séries · 12</small></div></li>
      <li><span class="check"></span><div class="grow"><strong>Desenvolvimento com halteres</strong><small>4 séries · 10</small></div></li></ul>
    <button class="btn btn--ok btn--block" type="button">Marcar Treino como Concluído</button></article>
  <article class="workout"><header><strong>Treino B</strong></header><small>5 exercícios · 0/5 marcados</small></article>`, 'treino');

/* 4 · Receitas (Por Foto) */
const receitas = phone('receitas', 4, 'Receitas', `
  <header class="greet"><h3>${ico('book', 22)} Biblioteca de Receitas</h3></header>
  <div class="segmented" role="tablist" aria-label="Receitas"><button role="tab" aria-selected="false" type="button">Da Nutri</button><button role="tab" aria-selected="false" type="button">Minhas Receitas</button><button role="tab" aria-selected="true" type="button">📷 Por Foto</button></div>
  <div class="dashed dashed--photo">${ico('camera', 28)}<p>Fotografe os ingredientes que você tem disponíveis (geladeira, despensa) e a IA sugere uma receita prática pra você.</p>
    <button class="btn btn--ghost btn--sm" type="button">Tirar Foto dos Ingredientes</button><button class="btn btn--primary btn--sm" type="button">Gerar com ChefIA</button></div>
  <article class="recipe is-open"><header><div class="grow"><strong>Omelete de forno com legumes</strong><small>Gerada em 19/11/2026</small></div><span class="icon-btn icon-btn--round" aria-hidden="true">${ico('right', 16)}</span></header>
    <p>Ingredientes: 3 ovos, 1 tomate, ½ abobrinha, queijo cottage.</p><p>Preparo: misture tudo, tempere e leve ao forno por 20 minutos.</p>
    <div class="btn-row"><button class="btn btn--ghost btn--sm" type="button">Regerar</button><button class="btn btn--ghost btn--sm" type="button">Editar</button><button class="btn btn--ghost btn--sm" type="button">Excluir</button></div></article>`, 'receitas');

/* 5 · IA (ChatBot) */
const ia = phone('ia', 5, 'IA', `
  <header class="greet"><div><h3>Nutrivvo Bot (Clínica)</h3><small>IA Médica conectada ao seu prontuário</small></div></header>
  <ul class="bubbles">
    <li class="bubble bubble--ai">Olá, Ana. Sou a inteligência artificial clínica da Nutrivvo. Como está sua aderência ao protocolo focado em Emagrecimento hoje?</li>
    <li class="bubble bubble--me">Posso trocar a batata?</li>
    <li class="bubble bubble--ai">Pode, Ana. 150 g de batata-doce cozida equivalem ao seu arroz integral e mantêm seus carboidratos dentro da meta.</li></ul>
  <form class="composer" onsubmit="return false"><label class="sr-only" for="msg">Mensagem</label><input id="msg" type="text" placeholder="Posso trocar a batata?" /><button class="btn btn--primary btn--icon" type="button" aria-label="Enviar">${ico('send', 20)}</button></form>`, 'ia');

/* 6 · Perfil */
const perfil = phone('perfil', 6, 'Perfil', `
  <header class="greet"><h3>${ico('user', 22)} Seu Perfil Pessoal</h3></header>
  <article class="card-row"><div class="grow"><small>Nutricionista Responsável</small><h4>${ico('sparkles', 16)} Dra. Helena Prado</h4><small>${ico('home', 12)} Av. Paulista, 1000 — São Paulo</small></div></article>
  <article class="panel"><h4>${ico('chart', 18)} Meu Progresso</h4><small>Mantenha seu peso atualizado para gerar dados para a Nutri.</small>
    <button class="btn btn--primary btn--block" type="button">Informar Meu Peso</button>
    ${lineChart([82.4, 81.6, 80.9, 80.1, 79.2, 78.5], ['06/10', '13/10', '20/10', '27/10', '03/11', '10/11'], { min: 77.5, max: 83, h: 180 })}</article>
  <article class="panel"><h4>Meus Dados</h4>
    <details open><summary>Contato &amp; Telegram <span class="chip chip--warn">ação necessária</span></summary><p class="warn-line">Não conectado — a Secretária Virtual só responde depois de conectar</p><button class="btn btn--ghost btn--sm" type="button">Conectar no Telegram</button></details>
    <details><summary>Dados Clínicos</summary></details><details><summary>Identidade &amp; Acesso <small>raramente muda</small></summary></details>
    <button class="btn btn--primary btn--block" type="button">Salvar Alterações</button></article>
  <article class="achievements"><strong>Conquistas</strong><span class="num">${ico('flame', 18)} 12 dias seguidos</span><span class="num">${ico('hexagon', 18)} 480 XP</span></article>`, 'perfil');

/** Corpo da página do paciente: 6 telas [data-screen] do app real, com TopBar e BottomNav. */
export function paciente() {
  return `<main class="phone-stage">${inicio}${plano}${treino}${receitas}${ia}${perfil}</main>`;
}
