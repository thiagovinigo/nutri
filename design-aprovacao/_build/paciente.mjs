import { ico } from './icons.mjs';
import { BRAND, MEALS, MISSIONS } from './data.mjs';

const TABS = [
  { key: 'home', label: 'Início', icon: 'home' },
  { key: 'plano', label: 'Plano', icon: 'leaf' },
  { key: 'receita', label: 'Receita', icon: 'camera' },
  { key: 'chat', label: 'Chat', icon: 'chat' },
  { key: 'perfil', label: 'Perfil', icon: 'user' },
];

const nav = (active) => `
<nav class="phone-nav" aria-label="Navegação do app">
  ${TABS.map((t) => `<a href="#${t.key}"${t.key === active ? ' aria-current="page"' : ''}>${ico(t.icon, 22)}<span class="tab-label">${t.label}</span></a>`).join('')}
</nav>`;

function phone(id, n, label, body, active) {
  return `
<section id="${id}" class="phone-wrap" data-screen="${id}" aria-label="${label}">
  <p class="phone-label"><span class="num">${String(n).padStart(2, '0')}</span> · ${label}</p>
  <div class="phone">
    <div class="phone-body">${body}</div>
    ${active ? nav(active) : ''}
  </div>
</section>`;
}

const onboarding = phone('onboarding', 1, 'Onboarding', `
  <div class="ob">
    <p class="steps" aria-label="Passo 1 de 3"><i class="on"></i><i></i><i></i></p>
    <span class="brand-mark brand-mark--lg" aria-hidden="true">${ico('leaf', 30)}</span>
    <h3>Bem-vindo ao ${BRAND}, Carlos</h3>
    <p class="muted">Três passos rápidos para montar o seu acompanhamento.</p>
    <ol class="ob-steps">
      <li class="is-done"><span class="step-dot">${ico('check', 16)}</span><div><strong>Seus dados</strong><small>Peso, altura e rotina</small></div></li>
      <li class="is-now"><span class="step-dot">2</span><div><strong>Seu objetivo</strong><small>Ganhar massa magra</small></div></li>
      <li><span class="step-dot">3</span><div><strong>Suas preferências</strong><small>Alimentos e horários</small></div></li>
    </ol>
    <button class="btn btn--primary btn--block" type="button">Continuar ${ico('arrow', 18)}</button>
  </div>`, null);

const home = phone('home', 2, 'Início e missões', `
  <header class="greet"><div><small>Quarta-feira</small><h3>Olá, Carlos</h3></div><span class="avatar" aria-hidden="true">CM</span></header>
  <article class="streak-card">${ico('flame', 34)}<div><strong class="num">Ofensiva: 14 dias</strong><small>Não perca o ritmo hoje</small></div></article>
  <section aria-label="Missões do dia">
    <div class="row-head"><h4>Missões do dia</h4><span class="num">3 de 5 missões</span></div>
    <div class="progress" role="img" aria-label="3 de 5 missões"><span style="width:60%"></span></div>
    <ul class="missions">${MISSIONS.map((m) => `<li><button type="button" class="mission${m.done ? ' is-done' : ''}" aria-pressed="${m.done}"><span class="check">${m.done ? ico('check', 16) : ''}</span><span class="grow">${m.label}</span>${m.icon && !m.done ? ico(m.icon, 20) : ''}</button></li>`).join('')}</ul>
  </section>`, 'home');

const plano = phone('plano', 3, 'Plano do dia', `
  <header class="greet"><div><small>Hoje</small><h3>Seu plano do dia</h3></div></header>
  <p class="total num">Total do dia: <strong>2.100 kcal</strong></p>
  <ul class="plan-meals">${[MEALS[0], MEALS[2], MEALS[4]].map((m, i) => `<li><button type="button" class="meal-card${i === 0 ? ' is-done' : ''}" aria-pressed="${i === 0}"><span class="meal-time num">${m.time}</span><span class="grow"><strong>${m.name}</strong><small>${m.items.slice(0, 3).join(', ').toLowerCase()}</small></span><span class="num kcal">${m.kcal}</span></button></li>`).join('')}</ul>
  <p class="hint">Toque para marcar como feito.</p>`, 'plano');

const receita = phone('receita', 4, 'Receita por foto', `
  <header class="greet"><div><small>Receita por foto</small><h3>Tire uma foto dos ingredientes</h3></div></header>
  <div class="viewfinder" aria-hidden="true">${ico('camera', 40)}<i class="vf vf-1"></i><i class="vf vf-2"></i><i class="vf vf-3"></i><i class="vf vf-4"></i></div>
  <article class="result">
    <span class="chip chip--ok">${ico('sparkles', 14)} Sugestão da IA</span>
    <h4>Panqueca de banana e aveia</h4>
    <ul class="facts-row"><li class="num"><strong>280</strong> kcal</li><li class="num"><strong>12 g</strong> proteína</li><li class="num"><strong>8</strong> minutos</li></ul>
    <button class="btn btn--primary btn--block" type="button">Salvar no plano</button>
  </article>`, 'receita');

const chat = phone('chat', 5, 'Chat com IA', `
  <header class="greet"><div><small>Assistente</small><h3>Nutri IA</h3></div>${ico('sparkles', 24)}</header>
  <ul class="bubbles">
    <li class="bubble bubble--me">Posso trocar o arroz por batata-doce no almoço?</li>
    <li class="bubble bubble--ai"><small>Nutri IA</small>Pode, Carlos. 150 g de batata-doce cozida equivalem ao seu arroz. Mantém seus carboidratos dentro da meta.</li>
  </ul>
  <form class="composer" onsubmit="return false"><label class="sr-only" for="msg">Mensagem</label><input id="msg" type="text" placeholder="Pergunte sobre o seu plano" /><button class="btn btn--primary btn--icon" type="button" aria-label="Enviar">${ico('send', 20)}</button></form>`, 'chat');

const perfil = phone('perfil', 6, 'Perfil e marco', `
  <article class="milestone">${ico('trophy', 36)}<h3>Você chegou a 14 dias seguidos!</h3><p>Continue assim, Carlos.</p><button class="btn btn--ghost btn--block" type="button">${ico('share', 18)} Compartilhar conquista</button></article>
  <dl class="stat-grid"><div><dt>Peso</dt><dd class="num">82,4 kg</dd></div><div><dt>Meta</dt><dd class="num">78 kg</dd></div><div><dt>Faltam</dt><dd class="num">4,4 kg</dd></div></dl>
  <section aria-label="Conquistas"><h4>Conquistas</h4><ul class="badges"><li>${ico('flame', 22)}<span>14 dias</span></li><li>${ico('dumbbell', 22)}<span>1º treino</span></li><li>${ico('camera', 22)}<span>30 fotos</span></li></ul></section>`, 'perfil');

/** Corpo da página do paciente: 6 telas [data-screen] em molduras de celular. */
export function paciente() {
  return `<main class="phone-stage">${onboarding}${home}${plano}${receita}${chat}${perfil}</main>`;
}
