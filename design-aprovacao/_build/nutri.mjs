import { ico } from './icons.mjs';
import { spark, bars, lineChart, donut } from './charts.mjs';
import { BRAND, PATIENTS, ATTENTION, MEALS, WEEK, TRANSACTIONS, initials } from './data.mjs';

const NAV = [
  { key: 'dashboard', label: 'Dashboard', icon: 'dashboard', target: 'dashboard' },
  { key: 'pacientes', label: 'Pacientes', icon: 'users', target: 'pacientes' },
  { key: 'agenda', label: 'Agenda', icon: 'calendar', target: 'agenda' },
  { key: 'planos', label: 'Planos', icon: 'leaf', target: 'plano' },
  { key: 'financeiro', label: 'Financeiro', icon: 'wallet', target: 'financeiro' },
];

const riskChip = (risk) => `<span class="chip chip--${risk === 'alto' ? 'alert' : risk === 'médio' ? 'warn' : 'ok'}">Risco ${risk}</span>`;
const avatar = (name) => `<span class="avatar" aria-hidden="true">${initials(name)}</span>`;
const adherence = (n) => `<span class="meter" role="img" aria-label="Adesão ${n}%"><span class="meter-fill" data-level="${n < 50 ? 'low' : n < 80 ? 'mid' : 'high'}" style="width:${n}%"></span></span>`;

function sidebar(active) {
  return `
  <aside class="sidebar">
    <a class="brand brand--app" href="#dashboard"><span class="brand-mark" aria-hidden="true">${ico('leaf', 20)}</span><span class="brand-text">${BRAND}</span></a>
    <nav aria-label="Principal">
      <ul>${NAV.map((n) => `<li><a href="#${n.target}"${n.key === active ? ' aria-current="page"' : ''}>${ico(n.icon, 20)}<span>${n.label}</span></a></li>`).join('')}</ul>
    </nav>
    <div class="me">${avatar('Helena Prado')}<div><strong>Dra. Helena Prado</strong><small>Plano Clínica</small></div></div>
  </aside>`;
}

function screen(id, n, title, active, content) {
  return `
<section id="${id}" class="screen" data-screen="${id}" aria-labelledby="${id}-t">
  <h2 id="${id}-t" class="screen-title"><span class="num">${String(n).padStart(2, '0')}</span> ${title}</h2>
  <div class="window">
    ${sidebar(active)}
    <div class="main">${content}</div>
  </div>
</section>`;
}

const topbar = (title, extra = '') => `
<header class="topbar"><h3>${title}</h3><div class="topbar-tools">${extra}<label class="search">${ico('search', 18)}<span class="sr-only">Buscar paciente</span><input type="search" placeholder="Buscar paciente" /></label></div></header>`;

const stat = (label, value, hint, tone = '') => `<article class="stat ${tone}"><p class="stat-label">${label}</p><p class="stat-value num">${value}</p><p class="stat-hint">${hint}</p></article>`;

const dashboard = screen('dashboard', 1, 'Dashboard', 'dashboard', `
  ${topbar('Bom dia, Dra. Helena')}
  <div class="stats">
    ${stat('Pacientes ativos', '64', '+3 este mês')}
    ${stat('Consultas hoje', '5', 'próxima às 09:00')}
    ${stat('Em risco de abandono', '5', 'agir hoje', 'stat--alert')}
    ${stat('Receita do mês', 'R$ 18.450', '+9% vs. outubro')}
  </div>
  <div class="split">
    <section class="panel" aria-label="Precisa de atenção">
      <h4>Precisa de atenção</h4>
      <ul class="attention">${ATTENTION.map((a) => `<li>${avatar(a.name)}<div class="grow"><strong class="truncate">${a.name}</strong><small>${a.note}</small></div>${riskChip(a.risk)}<button class="btn btn--sm btn--ghost" type="button">Enviar mensagem</button></li>`).join('')}</ul>
    </section>
    <section class="panel" aria-label="Adesão semanal">
      <h4>Adesão semanal</h4>
      ${bars([78, 81, 84, 80, 86, 88, 86], ['S', 'T', 'Q', 'Q', 'S', 'S', 'D'], { unit: 'em %' })}
    </section>
  </div>`);

const pacientes = screen('pacientes', 2, 'Pacientes', 'pacientes', `
  ${topbar('Pacientes', '<a class="btn btn--sm btn--primary" href="#pacientes">Novo paciente</a>')}
  <div class="filters" role="group" aria-label="Filtros">
    <button class="filter" type="button" aria-pressed="true">Todos</button><button class="filter" type="button" aria-pressed="false">Em risco</button><button class="filter" type="button" aria-pressed="false">Novos</button><button class="filter" type="button" aria-pressed="false">Plano vencendo</button>
  </div>
  <div class="table-wrap">
    <table class="table">
      <thead><tr><th scope="col">Paciente</th><th scope="col">Idade</th><th scope="col">Objetivo</th><th scope="col">Adesão</th><th scope="col">Risco</th></tr></thead>
      <tbody>${PATIENTS.map((p) => `<tr><th scope="row"><span class="cell-person">${avatar(p.name)}<span class="truncate cell-name">${p.name}</span></span></th><td class="num">${p.age}</td><td>${p.goal}</td><td><span class="cell-adh">${adherence(p.adherence)}<span class="num">${p.adherence}%</span></span></td><td>${riskChip(p.risk)}</td></tr>`).join('')}</tbody>
    </table>
  </div>`);

const ficha = screen('ficha', 3, 'Ficha do paciente', 'pacientes', `
  ${topbar('Ficha do paciente')}
  <div class="profile">
    ${avatar('Carlos Menezes')}
    <div class="grow"><h3>Carlos Menezes</h3><p>47 anos · Hipertrofia</p></div>
    <ul class="profile-facts"><li><small>Peso</small><strong class="num">82,4 kg</strong><small>meta 78 kg</small></li><li><small>Ofensiva</small><strong class="num">${ico('flame', 16)} 14 dias</strong></li></ul>
  </div>
  <div class="biomarkers">
    <article class="panel"><small>Glicemia</small><strong class="num">92 mg/dL</strong>${spark([98, 96, 95, 94, 93, 92], 120, 36, 'Glicemia em queda')}</article>
    <article class="panel"><small>Colesterol total</small><strong class="num">188 mg/dL</strong>${spark([214, 205, 199, 195, 191, 188], 120, 36, 'Colesterol em queda')}</article>
    <article class="panel"><small>HbA1c</small><strong class="num">5,4%</strong>${spark([6.1, 5.9, 5.8, 5.6, 5.5, 5.4], 120, 36, 'HbA1c em queda')}</article>
  </div>
  <div class="split">
    <section class="panel" aria-label="HbA1c em 6 meses"><h4>HbA1c — 6 meses</h4>${lineChart([6.1, 5.9, 5.8, 5.6, 5.5, 5.4], ['Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov'], { min: 5.2, max: 6.3 })}</section>
    <section class="panel" aria-label="Diário por foto"><h4>Últimas fotos do diário</h4>
      <ul class="photos">${['Café · 07:42', 'Almoço · 12:55', 'Lanche · 16:10', 'Jantar · 20:05'].map((l) => `<li class="photo">${ico('camera', 22)}<span>${l}</span></li>`).join('')}</ul>
    </section>
  </div>`);

const plano = screen('plano', 4, 'Montador de plano alimentar', 'planos', `
  ${topbar('Plano de 2.100 kcal', '<a class="btn btn--sm btn--primary" href="#plano">Enviar ao paciente</a>')}
  <div class="split split--plan">
    <section class="panel" aria-label="Refeições">
      <h4>Refeições</h4>
      <ol class="meals">${MEALS.map((m) => `<li class="meal"><div class="meal-head"><strong>${m.name}</strong><span class="num">${m.kcal} kcal</span></div><p>${m.items.join(' · ')}</p></li>`).join('')}</ol>
    </section>
    <section class="panel macros" aria-label="Macros">
      <h4>Distribuição de macros</h4>
      ${donut([{ pct: 28, label: 'Proteína' }, { pct: 47, label: 'Carboidrato' }, { pct: 25, label: 'Gordura' }], { value: '2.100', label: 'kcal' })}
      <ul class="legend"><li><i class="sw sw-1"></i>Proteína <b class="num">28%</b></li><li><i class="sw sw-2"></i>Carboidrato <b class="num">47%</b></li><li><i class="sw sw-3"></i>Gordura <b class="num">25%</b></li></ul>
    </section>
  </div>`);

const agenda = screen('agenda', 5, 'Agenda semanal', 'agenda', `
  ${topbar('Semana de 17 a 21 de novembro')}
  <div class="week">
    ${WEEK.map((d) => `<section class="day${d.today ? ' day--today' : ''}" aria-label="${d.day} ${d.date}"><h4><span>${d.day}</span><span class="num">${d.date}</span></h4><ul>${d.events.map((e) => `<li class="event"><span class="num">${e.t}</span><strong class="truncate">${e.who}</strong><small>${e.kind}</small></li>`).join('')}</ul></section>`).join('')}
  </div>`);

const financeiro = screen('financeiro', 6, 'Financeiro', 'financeiro', `
  ${topbar('Financeiro')}
  <div class="stats stats--3">
    ${stat('Receita do mês', 'R$ 18.450', '+9% vs. outubro')}
    ${stat('A receber', 'R$ 3.200', '4 cobranças')}
    ${stat('Inadimplência', '4%', 'abaixo da média', 'stat--ok')}
  </div>
  <div class="split">
    <section class="panel" aria-label="Receita por mês"><h4>Receita por mês (R$ mil)</h4>${bars([12.1, 13.4, 15.2, 14.8, 16.9, 18.45], ['Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov'], { unit: 'em R$ mil' })}</section>
    <section class="panel" aria-label="Lançamentos"><h4>Lançamentos</h4>
      <ul class="ledger">${TRANSACTIONS.map((t) => `<li><div class="grow"><strong>${t.what}</strong><small class="truncate">${t.who}</small></div><span class="num">${t.value}</span><span class="chip chip--${t.status === 'pago' ? 'ok' : 'warn'}">${t.status}</span></li>`).join('')}</ul>
    </section>
  </div>`);

/** Corpo da página do nutricionista: 6 telas [data-screen]. */
export function nutri() {
  return `<main class="screens">${dashboard}${pacientes}${ficha}${plano}${agenda}${financeiro}</main>`;
}
