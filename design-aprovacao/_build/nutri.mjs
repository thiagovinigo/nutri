import { ico } from './icons.mjs';
import { dualLine, donut } from './charts.mjs';
import { BRAND, PATIENTS, initials } from './data.mjs';

const NAV = [
  { key: 'overview', label: 'Visão Geral', icon: 'dashboard', target: '#overview' },
  { key: 'agenda', label: 'Agenda de Hoje', icon: 'calendar', target: '#agenda' },
  { key: 'pacientes', label: 'Meus Pacientes', icon: 'users', target: '#pacientes' },
  { key: 'receitas', label: 'Biblioteca de Receitas', icon: 'book', target: '#' },
  { key: 'financeiro', label: 'Financeiro & Planos', icon: 'dollar', target: '#financeiro' },
];

const avatar = (name) => `<span class="avatar" aria-hidden="true">${initials(name)}</span>`;
const statusChip = (s) => `<span class="chip chip--${s === 'Alto Engajamento' ? 'ok' : s === 'Inativo' ? 'alert' : 'info'}">${s}</span>`;
const payChip = (p) => `<span class="chip chip--${p === 'Pago' ? 'ok' : p === 'Pendente' ? 'warn' : 'alert'}">${p}</span>`;
const link = (n, active) => `<li><a href="${n.target}" aria-label="${n.label}"${n.key === active ? ' aria-current="page"' : ''}>${ico(n.icon, 20)}<span>${n.label}</span></a></li>`;

function sidebar(active) {
  return `
  <aside class="sidebar">
    <div class="side-brand">
      <a class="brand brand--app" href="#overview" aria-label="${BRAND}"><span class="brand-mark" aria-hidden="true">N</span><span class="brand-text">${BRAND}</span></a>
      <span class="tag">CRM Clínico</span><a class="side-link" href="#">Sair</a>
    </div>
    <nav aria-label="Principal">
      <ul>${NAV.map((n) => link(n, active)).join('')}</ul>
      <ul class="side-extra">${link({ key: 'cfg', label: 'Configurações', icon: 'settings', target: '#' }, active)}</ul>
    </nav>
    <div class="toggle-row"><span>${ico('moon', 18)} Dark Mode</span><span class="switch" aria-hidden="true"><i></i></span></div>
  </aside>`;
}

function screen(id, n, title, active, content, extra = '') {
  return `
<section id="${id}" class="screen" data-screen="${id}" aria-labelledby="${id}-t">
  <h2 id="${id}-t" class="screen-title"><span class="num">${String(n).padStart(2, '0')}</span> ${title}</h2>
  <div class="window${extra}">${extra ? '' : sidebar(active)}${content}</div>
</section>`;
}

const head = (title, sub, right = '') => `<header class="page-head"><div><h3>${title}</h3><p>${sub}</p></div>${right}</header>`;
const kpi = (label, value, hint = '', tone = '') => `<article class="stat ${tone}"><p class="stat-label">${label}</p><p class="stat-value num">${value}</p>${hint ? `<p class="stat-hint">${hint}</p>` : ''}</article>`;
const row = (name, sub, right) => `<li class="line-row"><div class="grow"><strong class="truncate">${name}</strong><small>${sub}</small></div>${right}</li>`;

/* 1 · Visão Geral */
const overview = screen('overview', 1, 'Visão Geral', 'overview', `<div class="main">
  ${head('Visão Geral', 'Resumo do dia e atalhos rápidos.')}
  <div class="stats stats--5">
    ${kpi('Pacientes ativos / inativos', '4 <span class="soft">/ 0</span>')}
    ${kpi('Consultas hoje', '3')}
    ${kpi('Engajamento médio', '50%', `${ico('flame', 14)} Sequência média: 5d`)}
    ${kpi('Em risco', '1', '', 'stat--warn')}
    ${kpi('Receita prevista', `${ico('dollar', 18)} 1.850`, '', 'stat--good')}
  </div>
  <div class="btn-row"><a class="btn btn--primary btn--sm" href="#pacientes">${ico('plus', 16)} Novo Paciente</a><a class="btn btn--ghost btn--sm" href="#agenda">${ico('plus', 16)} Novo Agendamento</a></div>
  <div class="cards4">
    <section class="panel" aria-label="Próximas Consultas"><h4 class="panel-head">${ico('calendar', 18)} Próximas Consultas <a href="#agenda">Ver agenda →</a></h4><ul class="rows">
      ${row('Ana Beatriz Souza', 'Hoje - Retorno', '<b class="num">14:00</b>')}${row('Carlos Eduardo Lima', 'Hoje - Primeira Consulta', '<b class="num">16:30</b>')}</ul></section>
    <section class="panel" aria-label="Consultas Realizadas"><h4 class="panel-head ok">${ico('check', 18)} Consultas Realizadas <a href="#agenda">Ver agenda →</a></h4><ul class="rows">
      ${row('Juliana Ferreira', '12/08 - Retorno', '<b class="num">10:00</b>')}</ul></section>
    <section class="panel" aria-label="Atenção Necessária"><h4 class="panel-head warn">${ico('alert', 18)} Atenção Necessária</h4><ul class="rows">
      ${row('Rodrigo Martins', 'Sem registro há 4 dias', '<span class="chip chip--warn">Perdendo Foco</span>')}</ul></section>
    <section class="panel" aria-label="Mais Engajados"><h4 class="panel-head">${ico('trophy', 18)} Mais Engajados</h4><ul class="rows">
      ${PATIENTS.map((p) => row(p.name, '', `<span class="num soft">${ico('flame', 14)} ${p.streak}d · ${p.xp}xp</span>`)).join('')}</ul></section>
  </div>
</div>`);

/* 2 · Agenda semanal */
const DAYS = [['Seg', '16/11'], ['Ter', '17/11'], ['Qua', '18/11'], ['Qui', '19/11', true], ['Sex', '20/11']];
const HOURS = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
const APPT = {
  'Qui 10:00': { who: 'Juliana Ferreira', kind: 'Retorno', done: true },
  'Qui 14:00': { who: 'Ana Beatriz Souza', kind: 'Retorno' },
  'Qui 16:00': { who: 'Carlos Eduardo Lima', kind: 'Primeira Consulta', at: '16:30' },
  'Sex 15:00': { who: 'Rodrigo Martins', kind: 'Retorno (Online)', online: true },
  'Ter 11:00': { who: 'Beatriz Nogueira', kind: 'Avaliação Expressa' },
};
const cell = (day, hour) => {
  if (hour === '12:00') return '<div class="cal-cell cal-lunch">Almoço</div>';
  const a = APPT[`${day} ${hour}`];
  if (!a) return '<div class="cal-cell cal-free"></div>';
  return `<div class="cal-cell"><div class="appt${a.done ? ' appt--done' : ''}"><strong class="truncate">${a.who}</strong><small>${a.at ? `${a.at} · ` : ''}${a.kind}</small>${a.online ? '<a href="#agenda">Entrar na Sala</a>' : ''}<span class="appt-tools">${ico('eye', 14)}${a.done ? '' : ico('trash', 14)}</span></div></div>`;
};
const agenda = screen('agenda', 2, 'Agenda', 'agenda', `<div class="main">
  ${head('Agenda Clínica', 'Controle seus agendamentos e inicie consultas.', `<a class="btn btn--primary btn--sm" href="#agenda">${ico('plus', 16)} Novo Agendamento</a>`)}
  <div class="filters" role="group" aria-label="Filtro"><button class="filter" type="button" aria-pressed="true">Todos</button><button class="filter" type="button" aria-pressed="false">Agendado</button><button class="filter" type="button" aria-pressed="false">Concluído</button></div>
  <section class="cal" aria-label="Calendário semanal">
    <header class="cal-head"><strong>Semana de 16/11/2026</strong><span class="cal-nav"><button type="button" aria-label="Semana anterior">${ico('left', 16)}</button><button type="button">Hoje</button><button type="button" aria-label="Próxima semana">${ico('right', 16)}</button></span></header>
    <div class="cal-scroll"><div class="cal-grid">
      <div class="cal-corner"></div>
      ${DAYS.map(([d, dt, today]) => `<div class="cal-day${today ? ' cal-day--today' : ''}"><b>${d}</b><span class="num">${dt}</span>${today ? '<em>Hoje</em>' : ''}</div>`).join('')}
      ${HOURS.map((h) => `<div class="cal-hour num">${h}</div>${DAYS.map(([d]) => cell(d, h)).join('')}`).join('')}
    </div></div>
  </section>
</div>`);

/* 3 · Meus Pacientes */
const pacientes = screen('pacientes', 3, 'Meus Pacientes', 'pacientes', `<div class="main">
  ${head('Meus Pacientes', 'Gestão do seu portfólio clínico.', `<span class="btn-row"><a class="btn btn--ghost btn--sm" href="#pacientes">Link Geral de Convite</a><a class="btn btn--primary btn--sm" href="#pacientes">${ico('plus', 16)} Novo Paciente</a></span>`)}
  <div class="toolbar"><label class="search search--wide">${ico('search', 18)}<span class="sr-only">Buscar paciente</span><input type="search" placeholder="Buscar paciente por nome..." /></label>
    <label class="select"><span class="sr-only">Status</span><select><option>Todos os status</option><option>Alto Engajamento</option><option>Perdendo Foco</option><option>Inativo</option></select></label></div>
  <div class="table-wrap"><table class="table">
    <thead><tr><th scope="col">Nome</th><th scope="col">Objetivo</th><th scope="col">Adesão App</th><th scope="col">Status</th><th scope="col">Financeiro</th><th scope="col">Ações</th></tr></thead>
    <tbody>${PATIENTS.map((p) => `<tr><th scope="row"><span class="cell-person">${avatar(p.name)}<span class="cell-name"><span class="truncate">${p.name}</span>${p.risk ? '<span class="chip chip--alert">▲ Alto Risco</span>' : ''}</span></span></th><td>${p.goal}</td><td class="num">${ico('flame', 14)} ${p.streak} dias</td><td>${statusChip(p.status)}</td><td><span class="cell-pay"><small>${p.plan}</small>${payChip(p.pay)}</span></td><td><span class="cell-actions"><a class="btn btn--ghost btn--sm" href="#prontuario">${ico('eye', 14)} Ver</a><button type="button" class="icon-btn" aria-label="Editar ${p.name}">${ico('edit', 16)}</button></span></td></tr>`).join('')}</tbody>
  </table></div>
</div>`);

/* 4 · Prontuário (Visão Geral) */
const prontuario = screen('prontuario', 4, 'Prontuário do paciente', 'pacientes', `<div class="main">
  <div class="page-head"><a class="btn btn--ghost btn--sm" href="#pacientes">← Voltar para Lista</a><a class="btn btn--primary btn--sm" href="#consulta">▶ Iniciar Prontuário (14:00)</a></div>
  <section class="panel command" aria-label="Status de engajamento">
    <div><h4 class="panel-head">${ico('chart', 18)} Status de Engajamento (Cohort)</h4>
      <dl class="kv kv--3"><div><dt>Status</dt><dd class="ok">Alto Engajamento</dd></div><div><dt>Ofensiva App</dt><dd class="num">${ico('flame', 16)} 12 dias</dd></div><div><dt>Risco de Abandono</dt><dd class="ok">Baixo</dd></div></dl>
      <p class="hint-line">${ico('sparkles', 14)} Sugestão da IA: manter o acompanhamento semanal</p></div>
    <div class="dashed"><h4 class="panel-head">${ico('sparkles', 18)} Síntese Clínica</h4><p>Clique em "Gerar Análise" para a IA cruzar o histórico deste paciente com os parâmetros de Cohort e sugerir a conduta ideal.</p><button class="btn btn--ghost btn--sm" type="button">Gerar Análise</button></div>
  </section>
  <div class="tabs" role="tablist" aria-label="Abas do prontuário"><button class="tab" role="tab" aria-selected="true" type="button">Visão Geral</button><button class="tab" role="tab" aria-selected="false" type="button">Protocolo Vigente</button><button class="tab" role="tab" aria-selected="false" type="button">Exames &amp; Biomarcadores</button><button class="tab" role="tab" aria-selected="false" type="button">Plano &amp; Contrato</button></div>
  <section class="hero-card" aria-label="Resumo do paciente"><div><h3>Ana Beatriz Souza</h3><p>Objetivo: Emagrecimento</p></div><dl class="hero-stats"><div><dt>Ofensiva App</dt><dd class="num">${ico('flame', 20)} 12 dias</dd></div><div><dt>Gamificação</dt><dd class="num">${ico('hexagon', 20)} 480 XP</dd></div></dl></section>
  <div class="split">
    <section class="panel" aria-label="Evolução clínica"><h4 class="panel-head">${ico('chart', 18)} Evolução Clínica</h4>
      ${dualLine([82.4, 81.6, 80.9, 80.1, 79.2, 78.5], [31.2, 30.6, 30.1, 29.5, 29.0, 28.4], ['06/10', '13/10', '20/10', '27/10', '03/11', '10/11'])}
      <p class="legend-inline"><i class="sw sw-1"></i>Peso (kg) <i class="sw sw-2"></i>% Gordura</p></section>
    <section class="panel" aria-label="Última avaliação física"><h4 class="panel-head">Última Avaliação Física Completa</h4>
      <dl class="kv kv--grid">${[['Peso', '78,5 kg'], ['Altura', '165 cm'], ['% Gordura', '28,4%'], ['% Músculo', '34,1%'], ['Gordura Visceral', '7'], ['Cintura', '82 cm'], ['Quadril', '104 cm'], ['TMB', '1.412 kcal']].map(([k, v]) => `<div><dt>${k}</dt><dd class="num">${v}</dd></div>`).join('')}</dl></section>
  </div>
</div>`);

/* 5 · Consulta · passo 4 */
const STEPS = ['1. Anamnese', '2. Avaliação Física', '3. Exames (IA OpenAI)', '4. Prescrição Estruturada', '5. Resumo e Envio'];
const foodRows = (rows) => rows.map(([f, g, k, c, p, gd]) => `<tr><th scope="row"><span class="truncate">${f}</span></th><td class="num">${g}</td><td class="num">${k}</td><td class="num">${c}</td><td class="num">${p}</td><td class="num">${gd}</td></tr>`).join('');
const mealBlock = (name, rows, total) => `<article class="meal-block"><header><strong>${name}</strong><button class="link-btn" type="button">Remover</button></header>
  <div class="table-wrap"><table class="table table--tight"><thead><tr><th scope="col">Alimento</th><th scope="col">Qtd (g)</th><th scope="col">Kcal</th><th scope="col">Carb (g)</th><th scope="col">Ptn (g)</th><th scope="col">Gord (g)</th></tr></thead><tbody>${foodRows(rows)}</tbody><tfoot><tr><th scope="row">TOTAL DA REFEIÇÃO</th><td></td>${total.map((t) => `<td class="num">${t}</td>`).join('')}</tr></tfoot></table></div></article>`;
const consulta = screen('consulta', 5, 'Consulta · Prescrição Dietética', 'pacientes', `
  <aside class="consult-side"><a class="danger-link" href="#prontuario">← Suspender Consulta</a>
    <div class="who">${avatar('Ana Beatriz Souza')}<div><strong>Ana Beatriz Souza</strong><small>Obj: Emagrecimento</small></div></div>
    <ol class="steps-list">${STEPS.map((s, i) => `<li${i === 3 ? ' aria-current="step"' : ''}>${s}</li>`).join('')}</ol></aside>
  <div class="main">
    ${head('Prescrição Dietética Estruturada', '')}
    <div class="tabs" role="tablist" aria-label="Prescrição"><button class="tab" role="tab" aria-selected="true" type="button">Refeições do Cardápio</button><button class="tab" role="tab" aria-selected="false" type="button">Vitaminas e Suplementos</button><button class="tab" role="tab" aria-selected="false" type="button">Ficha de Treino</button></div>
    <section class="panel ai-card" aria-label="Gerador de cardápio"><h4 class="panel-head">${ico('sparkles', 18)} Gerador de Cardápio (IA Nutricionista)</h4><div class="btn-row"><label class="select"><span class="sr-only">Duração</span><select><option>1 Dia</option><option selected>7 Dias</option><option>15 Dias</option><option>30 Dias</option></select></label><button class="btn btn--primary btn--sm" type="button">Sugerir com IA</button></div></section>
    <label class="field"><span>Título do Plano Alimentar</span><input type="text" value="Dieta de Transição (Verão)" /></label>
    <div class="split">
      <section class="panel macros" aria-label="Distribuição de macros"><h4>Distribuição de Macros</h4>${donut([{ pct: 47, label: 'Carboidratos' }, { pct: 28, label: 'Proteínas' }, { pct: 25, label: 'Gorduras' }], { value: '1.680', label: 'kcal' })}
        <ul class="legend"><li><i class="sw sw-1"></i>Carboidratos <b class="num">47%</b></li><li><i class="sw sw-2"></i>Proteínas <b class="num">28%</b></li><li><i class="sw sw-3"></i>Gorduras <b class="num">25%</b></li></ul></section>
      <section class="panel" aria-label="Calorias da dieta"><h4>Calorias da Dieta vs GET</h4><p class="big num">1.680 <small>kcal</small></p><div class="progress" role="img" aria-label="Déficit calórico"><span style="width:82%"></span></div><p class="deficit">▼ Déficit de 370 kcal (Cutting)</p><small>GET estimado: 2.050 kcal</small></section>
    </div>
    ${mealBlock('Café da Manhã', [['Ovo de galinha, inteiro, cru', 100, 143, 1, 13, 10], ['Aveia em flocos, crua', 30, 118, 20, 4, 2], ['Banana, prata, crua', 100, 98, 26, 1, 0]], [359, 47, 18, 12])}
    ${mealBlock('Almoço', [['Arroz integral, cozido', 120, 148, 31, 3, 1], ['Peito de frango, grelhado', 130, 214, 0, 40, 5]], [362, 31, 43, 6])}
    <p class="hint-line"><button class="btn btn--ghost btn--sm" type="button">+ Adicionar Refeição Manualmente</button></p>
  </div>`, ' window--consulta');

/* 6 · Financeiro */
const fin = (label, value, hint, tone) => `<article class="stat stat--edge ${tone}"><p class="stat-label">${label}</p><p class="stat-value num">${value}</p><p class="stat-hint">${hint}</p></article>`;
const financeiro = screen('financeiro', 6, 'Financeiro & Planos', 'financeiro', `<div class="main">
  ${head('Gestão Financeira & Planos do Consultório', 'Controle honorários, pacotes de acompanhamento e previsibilidade de receita.', `<a class="btn btn--primary btn--sm" href="#financeiro">${ico('plus', 16)} Cadastrar Novo Plano</a>`)}
  <div class="tabs" role="tablist" aria-label="Financeiro"><button class="tab" role="tab" aria-selected="true" type="button">Visão Geral &amp; Previsões</button><button class="tab" role="tab" aria-selected="false" type="button">Honorários por Paciente (4)</button><button class="tab" role="tab" aria-selected="false" type="button">Catálogo de Planos (3)</button></div>
  <div class="stats">
    ${fin('Faturamento Esperado (Mês)', 'R$ 1.850', 'Previsão de receita dos contratos ativos', 'edge-1')}
    ${fin('Recebimentos Confirmados (Pagos)', 'R$ 1.150', '62% da receita liquidada', 'edge-2')}
    ${fin('A Receber / Pendente', 'R$ 700', 'Acompanhar datas de vencimento', 'edge-3')}
    ${fin('Ticket Médio por Paciente', 'R$ 463', 'Em 4 pacientes ativos', 'edge-4')}
  </div>
  <section class="banner" aria-label="Inteligência preditiva"><h4>Inteligência Preditiva: Oportunidades de Renovação</h4><p>Cruzando a pontuação de XP dos pacientes com a data de término dos planos, o Nutrivvo sugere quem está pronto para renovar.</p>
    <ul class="rows rows--card"><li class="line-row">${avatar('Carlos Eduardo Lima')}<div class="grow"><strong>Carlos Eduardo Lima</strong><small>Plano Atual: Plano Trimestral VIP (Vence em 26/11/2026)</small></div><span class="chip chip--ok">Alta Adesão (Apto para Upgrade)</span><button class="btn btn--primary btn--sm" type="button">Oferecer Renovação</button></li></ul></section>
</div>`);

/** Corpo da página do nutricionista: 6 telas [data-screen] baseadas no CRM real. */
export function nutri() {
  return `<main class="screens">${overview}${agenda}${pacientes}${prontuario}${consulta}${financeiro}</main>`;
}
