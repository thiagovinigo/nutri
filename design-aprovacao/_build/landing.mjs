import { ico } from './icons.mjs';
import { ring } from './charts.mjs';
import { BRAND } from './data.mjs';

const mark = '<span class="brand-mark" aria-hidden="true">N</span>';
const brand = `<a class="brand" href="#hero">${mark}${BRAND}<span class="brand-dot">.</span></a>`;

const header = `
<header class="site-header">
  ${brand}
  <nav class="site-nav" aria-label="Seções">
    <a href="#recursos">Recursos</a><a href="#beneficios">Benefícios</a><a href="#seguranca">Segurança</a>
  </nav>
  <a class="btn btn--ghost btn--sm site-login" href="#cta">Entrar</a>
  <a class="btn btn--primary btn--sm site-cta" href="#cta">Criar Clínica Grátis</a>
</header>`;

const mockWindow = `
<div class="mock-window">
  <div class="mock-bar"><i></i><i></i><i></i><span>nutrivvo.com.br/nutri · Painel Clínico</span></div>
  <div class="mock-body">
    <div class="mock-kpis">
      <div><small>Pacientes ativos / inativos</small><strong class="num">4 <span>/ 0</span></strong></div>
      <div><small>Engajamento médio</small><strong class="num">50%</strong></div>
      <div class="warn"><small>Em risco</small><strong class="num">1</strong></div>
      <div class="good"><small>Receita prevista</small><strong class="num">R$ 1.850</strong></div>
    </div>
    <div class="mock-cols">
      <div><b>Próximas Consultas</b><p><span>Ana Beatriz Souza</span><em class="num">14:00</em></p><p><span>Carlos Eduardo Lima</span><em class="num">16:30</em></p></div>
      <div><b>Atenção Necessária</b><p><span>Rodrigo Martins</span><em class="chip chip--warn">Perdendo Foco</em></p></div>
    </div>
  </div>
</div>`;

const mockPhone = `
<div class="mock-phone">
  <div class="mock-top"><span>NUTRIVVO</span><em>${ico('flame', 14)} 3 ${ico('hexagon', 14)} 450</em></div>
  <div class="mock-card"><b>Performance</b>${ring(67, { size: 64 })}<small>2 de 3 refeições concluídas</small></div>
  <div class="mock-card"><b>Dia 1 - Café da Manhã</b><small>100g - Ovo de galinha · 30g - Aveia · 100g - Banana</small><span class="chip chip--ok">${ico('check', 12)} Concluído</span></div>
</div>`;

const hero = `
<section id="hero" class="hero" aria-labelledby="hero-title">
  <div class="hero-copy">
    <p class="badge">Feito para nutricionista autônomo e clínica pequena</p>
    <h1 id="hero-title">Seu paciente some entre consultas. <span class="hl">O Nutrivvo não deixa.</span></h1>
    <p class="lede">Enquanto você atende, a IA do Nutrivvo confirma consulta, cobra a foto do prato e avisa quando um paciente está perdendo o foco — tudo pelo Telegram. Do outro lado, um app gamificado com XP e ofensiva diária faz o paciente voltar sozinho, todo dia.</p>
    <div class="actions">
      <a class="btn btn--primary btn--lg" href="#cta">Criar Clínica Grátis ${ico('arrow', 18)}</a>
      <a class="btn btn--ghost btn--lg" href="#cta">Acessar Minha Conta</a>
    </div>
    <p class="fine">Sem cartão de crédito · Pronto em 2 minutos</p>
  </div>
  <div class="hero-mocks" aria-hidden="true">${mockWindow}${mockPhone}</div>
</section>`;

const radar = `<svg class="radar" viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r="52"/><circle cx="60" cy="60" r="36"/><circle cx="60" cy="60" r="20"/><path class="sweep" d="M60 60 L60 8 A52 52 0 0 1 104 34 Z"/><circle class="blip" cx="84" cy="38" r="4"/></svg>`;

const features = `
<section id="recursos" class="features" aria-labelledby="recursos-title">
  <div class="section-head"><h2 id="recursos-title">Por que escolher o Nutrivvo?</h2><p>Ferramentas desenhadas especificamente para aumentar a adesão ao plano alimentar e reduzir o tempo de consulta.</p></div>
  <div class="bento">
    <article class="bento-card bento--radar">
      <p class="eyebrow">Telemetria preditiva</p><h3>Identifica o desânimo antes do cancelamento</h3>
      <div class="radar-row">${radar}
        <ul class="risk-list">
          <li><span class="dot dot--alert"></span><div class="grow"><strong>Camila Silva</strong><small>Inativa há 4 dias · Sem foto do almoço</small></div><span class="chip chip--alert">Risco Alto (82%)</span></li>
          <li><span class="dot dot--warn"></span><div class="grow"><strong>Rodrigo Mendes</strong><small>Perdeu a ofensiva no fim de semana</small></div><span class="chip chip--warn">Atenção (45%)</span></li>
          <li><span class="dot dot--ok"></span><div class="grow"><strong>Beatriz Costa</strong><small>14 dias ativos seguidos no diário</small></div><span class="chip chip--ok">Adesão Segura (98%)</span></li>
        </ul>
      </div>
    </article>
    <article class="bento-card bento--chat">
      <p class="eyebrow">Secretária virtual no Telegram</p><h3>Atendimento e lembretes 24h sem usar seu número pessoal</h3>
      <ul class="bubbles bubbles--demo">
        <li class="bubble bubble--ai"><small>NutriBot</small>Olá Marcos! Sua consulta com a Dra. Mariana está confirmada para amanhã às 14:00.</li>
        <li class="bubble bubble--me">Confirmadíssimo! Acabei de almoçar, segue a foto do prato</li>
        <li class="bubble bubble--ai"><small>NutriBot</small>Prato detectado: 150g Frango grelhado + Arroz + Salada. +35 XP creditados na sua ofensiva.</li>
      </ul>
    </article>
    <article class="bento-card bento--photo">
      <p class="eyebrow">Check-in diário por foto</p><h3>Reconhecimento de pratos por visão de IA</h3>
      <div class="vision"><p class="vision-head"><span>IA VISUAL ATIVA</span><em class="num">1.2s</em></p>
        <ul class="chips"><li>Frango Grelhado · ~150g</li><li>Arroz Integral · ~120g</li><li>Salada Mista</li></ul>
        <p class="vision-xp">${ico('sparkles', 16)} +35 XP creditados</p></div>
    </article>
    <article class="bento-card bento--xp">
      <p class="eyebrow">Alta gamificação &amp; XP</p><h3>Ofensiva diária e metas interativas</h3>
      <div class="xp"><p class="xp-streak">${ico('flame', 28)}<strong class="num">14 DIAS SEGUIDOS</strong></p><p class="xp-today num">+120 XP Hoje</p>
        <div class="progress" role="img" aria-label="78% da meta"><span style="width:78%"></span></div>
        <p class="xp-level"><span>Nível 4: Foco Blindado</span><span class="num">Meta: 1.200 XP</span></p></div>
    </article>
    <article class="bento-card"><span class="feature-ico">${ico('leaf', 24)}</span><h3>Cardápios completos em segundos</h3><p>Cardápio personalizado de 2.100 kcal pronto com lista de compras em 2.4s.</p></article>
    <article class="bento-card"><span class="feature-ico">${ico('dumbbell', 24)}</span><h3>Periodização física alinhada à dieta</h3><p>Divisão A/B de treino montada junto com o plano alimentar.</p></article>
    <article class="bento-card"><span class="feature-ico">${ico('chart', 24)}</span><h3>Leitura laboratorial com parecer clínico</h3><p>Leitura de marcadores metabólicos (Glicemia, Insulina, Ferritina, Perfil Lipídico).</p></article>
  </div>
</section>`;

const benefits = `
<section id="beneficios" class="benefits" aria-labelledby="beneficios-title">
  <h2 id="beneficios-title" class="sr-only">Benefícios</h2>
  <article class="benefit">
    <span class="feature-ico">${ico('shield', 24)}</span>
    <h3>Gestão que trabalha por você</h3>
    <p>Agenda, prontuário, financeiro e alertas de abandono no mesmo painel. O consultório roda enquanto você atende.</p>
    <ul class="ticks"><li>${ico('check', 18)}Agenda semanal com link público de agendamento</li><li>${ico('check', 18)}Financeiro com previsão de receita e renovações</li><li>${ico('check', 18)}Prontuário com histórico de cada consulta</li></ul>
  </article>
  <article class="benefit">
    <span class="feature-ico">${ico('flame', 24)}</span>
    <h3>Engajamento incomparável</h3>
    <p>O aplicativo do paciente é uma experiência motivadora: cada refeição feita no horário vira XP e mantém a ofensiva. Cada marco vira um cartão pronto para os stories, marcando a sua clínica.</p>
    <ul class="ticks"><li>${ico('check', 18)}Ofensiva diária e Nutri Score</li><li>${ico('check', 18)}Cartão compartilhável de Dia Perfeito</li><li>${ico('check', 18)}Check-in por foto, sem digitação</li></ul>
  </article>
</section>`;

const security = `
<section id="seguranca" class="security" aria-labelledby="seguranca-title">
  <div class="section-head"><h2 id="seguranca-title">Segurança e Privacidade de Dados</h2><p>Em conformidade com a LGPD e resoluções éticas do CFN.</p></div>
  <div class="sec-grid">
    <article class="sec-card"><span class="check-badge">${ico('check', 16)}</span><h3>Isolamento Estrito (RLS)</h3><p>Nenhum nutricionista tem acesso aos dados, cardápios ou exames de outro colega.</p></article>
    <article class="sec-card"><span class="check-badge">${ico('check', 16)}</span><h3>Criptografia de Ponta</h3><p>Tráfego HTTPS com TLS 1.3 e dados clínicos salvos sob criptografia AES-256.</p></article>
    <article class="sec-card"><span class="check-badge">${ico('check', 16)}</span><h3>Soberania do Paciente</h3><p>Direito à exportação integral e exclusão definitiva a qualquer momento.</p></article>
  </div>
</section>`;

const cta = `
<section id="cta" class="cta" aria-labelledby="cta-title">
  <h2 id="cta-title">Pare de perder paciente no silêncio entre consultas.</h2>
  <p>Junte-se aos nutricionistas que automatizaram o acompanhamento entre consultas.</p>
  <a class="btn btn--primary btn--lg" href="#hero">Começar Grátis ${ico('arrow', 18)}</a>
</section>`;

const footer = `
<footer class="site-footer">
  ${brand}
  <p>© 2026 Nutrivvo. Todos os direitos reservados.</p>
  <p>Dados de cada paciente isolados por regra própria no banco — nenhum nutricionista vê paciente de outro.</p>
</footer>`;

/** Corpo da landing real: 5 <section> dentro de <main>. */
export function landing() {
  return `${header}<main>${hero}${features}${benefits}${security}${cta}</main>${footer}`;
}
