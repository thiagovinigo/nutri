# Redesign para aprovação do cliente — Plano de implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Entregar `design-aprovacao/` com 4 estilos × (landing, nutri, paciente) × 6 telas/seções, mais um índice, para o cliente aprovar o novo visual do Nutrivvo.

**Architecture:** HTML estático autônomo por página, um CSS de tokens + um CSS de layout por estilo, conteúdo fictício compartilhado em `design-aprovacao/_shared/content.md`. Um script `verify.mjs` valida estrutura e offline-first; capturas de tela em 390/1024/1440 validam layout.

**Tech Stack:** HTML5, CSS (custom properties), fontes `.woff2` locais extraídas dos zips, Node (script de verificação) e Playwright (capturas).

**Spec:** `docs/superpowers/specs/2026-11-19-redesign-aprovacao-cliente-design.md`

## Global Constraints

- Não tocar em `src/`, `server/`, `api/` nem nas alterações pendentes de `src/pages/LandingPage.jsx` e `LandingPageWithRadar.jsx`.
- Pasta de saída: `design-aprovacao/{terrasprint,spectra,otto,moveflux}/{landing,nutri,paciente}.html` + `design-aprovacao/index.html`.
- Estilos e bases: TerraSprint (claro, Source Serif 4, verde `#2f6844`), Spectra (escuro, DM Sans, `#3f8568` sobre `#0a1814`), Otto (claro, creme `#fffdf7`, verde `#172e2b`), Moveflux (claro, Inter, stone + âmbar `#f59e0b`).
- Landing: 6 seções. Nutri: 6 telas a 1440px. Paciente: 6 telas a 390px.
- Nome e textos do Nutrivvo; pacientes fictícios, sem CPF nem dado real.
- Cada estilo usa só tokens e fontes da própria referência; fontes locais, sem CDN, abre offline.
- Contraste AA, alvos de toque ≥ 44px no mobile, `prefers-reduced-motion` respeitado, sem scroll horizontal em 390/1024/1440.
- Idioma `pt-BR`, HTML semântico (`header/nav/main/section/footer`).
- Commits só de arquivos de `design-aprovacao/` e `docs/`, direto na `main`, sem push (o usuário pede quando quiser).

## Review Focus

- Nome de paciente muito longo ou valor monetário grande quebrando card/tabela em 390px (esperado: truncar com reticências, sem overflow).
- Estilo escuro (Spectra) com texto secundário abaixo de AA (esperado: contraste ≥ 4.5:1).
- Página aberta sem internet (esperado: fontes e ícones carregam, nenhuma requisição `http(s)`).
- Usuário com `prefers-reduced-motion` (esperado: animações desligadas).
- Tela de paciente aberta em desktop (esperado: moldura de celular centralizada, sem esticar).

---

### Task 1: Fundação e verificador

**Files:**
- Create: `design-aprovacao/_shared/content.md`, `design-aprovacao/_shared/mobile-frame.css`, `design-aprovacao/verify.mjs`
- Create (por estilo): `design-aprovacao/<estilo>/assets/fonts/*.woff2`, `tokens.css`

**Interfaces:**
- Produces: `content.md` com as seções `## Landing`, `## Nutri` e `## Paciente`, cada uma listando as 6 telas/seções com textos e dados fictícios (pacientes, refeições, valores) que os Tasks 2–5 copiam literalmente.
- Produces: `node design-aprovacao/verify.mjs` → sai 0 se tudo certo, 1 listando falhas. Checa, para cada `*.html` existente: `<html lang="pt-BR">`, meta viewport, ausência de `http://`/`https://` em `src`/`href`/`url()`, contagem esperada (landing 6 `<section>`, nutri 6 `[data-screen]`, paciente 6 `[data-screen]`), e existência dos arquivos referenciados.
- Produces: `tokens.css` por estilo com `:root` contendo `--bg`, `--surface`, `--text`, `--text-muted`, `--primary`, `--accent`, `--border`, `--radius`, `--font-body`, `--font-display`.
- Produces: `mobile-frame.css` com a classe `.phone` (390×844, centralizada) usada pelos Tasks de paciente.

- [ ] **Step 1: Escrever `verify.mjs` com falha esperada.** Rodar `node design-aprovacao/verify.mjs` → deve sair 1 ("nenhuma página encontrada").
- [ ] **Step 2: Escrever `content.md`** com 6 itens por superfície, pacientes fictícios (ex.: "Marina Albuquerque Teixeira de Souza" para testar nome longo) e valores em R$.
- [ ] **Step 3: Extrair fontes** dos zips em `referencias/` (`unzip` para pasta temporária, copiar só os `.woff2` usados para `<estilo>/assets/fonts/`). Escrever `<estilo>/tokens.css` com `@font-face` locais e os tokens acima, usando os hex do Global Constraints.
- [ ] **Step 4: Verificar.** `node design-aprovacao/verify.mjs` ainda sai 1 (sem páginas), mas `ls design-aprovacao/*/assets/fonts` lista fontes nos 4 estilos.
- [ ] **Step 5: Commit** `chore(design): fundação e verificador do redesign`.

### Task 2: Estilo A — TerraSprint (landing, nutri, paciente)

**Files:**
- Create: `design-aprovacao/terrasprint/{landing,nutri,paciente}.html`, `design-aprovacao/terrasprint/style.css`

**Interfaces:**
- Consumes: `terrasprint/tokens.css`, `_shared/content.md`, `_shared/mobile-frame.css` (Task 1).
- Produces: 3 páginas que passam em `verify.mjs`; usam serifa nos títulos, verde `#2f6844` como primária, tons quentes de apoio.

- [ ] **Step 1: Rodar `verify.mjs`** → falha apontando as 3 páginas ausentes.
- [ ] **Step 2: Landing** com 6 `<section>` na ordem do doc de design; hero editorial (escala tipográfica forte, sem hero genérico centralizado com blob).
- [ ] **Step 3: Nutri** com 6 `[data-screen]` a 1440px (dashboard, pacientes, ficha com biomarcadores em gráfico SVG, montador de plano, agenda, financeiro).
- [ ] **Step 4: Paciente** com 6 `[data-screen]` dentro de `.phone` (onboarding, home/missões, plano do dia, receita por foto, chat IA, perfil/marco).
- [ ] **Step 5: Capturar telas** com Playwright em 390, 1024 e 1440 para as 3 páginas; abrir os PNGs e corrigir overflow, truncamentos e contraste.
- [ ] **Step 6: `verify.mjs`** → só falham os estilos ainda não feitos. Commit `feat(design): estilo TerraSprint`.

### Task 3: Estilo B — Spectra (escuro)

**Files:** `design-aprovacao/spectra/{landing,nutri,paciente}.html`, `style.css`

**Interfaces:** consome o mesmo que o Task 2; fundo `#0a1814`, DM Sans leve, `#3f8568`/`#34d399` como destaques.

- [ ] **Step 1–4:** mesmos passos de landing, nutri e paciente do Task 2, com conteúdo idêntico de `content.md`.
- [ ] **Step 5: Teste de contraste.** Script no `verify.mjs` ou conferência manual: texto secundário ≥ 4.5:1 sobre `--surface`; corrigir tokens se falhar.
- [ ] **Step 6:** capturas nos 3 tamanhos, correções, `verify.mjs`, commit `feat(design): estilo Spectra`.

### Task 4: Estilo C — Otto

**Files:** `design-aprovacao/otto/{landing,nutri,paciente}.html`, `style.css`

**Interfaces:** consome o mesmo; creme `#fffdf7`, verde `#172e2b`, pastéis `#c6d7b6`, `#f3dbca`, `#f6df92` como superfícies de apoio. Dar ênfase ao paciente (acolhedor).

- [ ] **Step 1–4:** landing, nutri, paciente como no Task 2.
- [ ] **Step 5:** capturas nos 3 tamanhos, correções, `verify.mjs`, commit `feat(design): estilo Otto`.

### Task 5: Estilo D — Moveflux

**Files:** `design-aprovacao/moveflux/{landing,nutri,paciente}.html`, `style.css`

**Interfaces:** consome o mesmo; Inter, neutros stone, âmbar `#f59e0b` como destaque. Dar ênfase à densidade do nutri (tabelas, filtros).

- [ ] **Step 1–4:** landing, nutri, paciente como no Task 2.
- [ ] **Step 5:** capturas nos 3 tamanhos, correções, `verify.mjs`, commit `feat(design): estilo Moveflux`.

### Task 6: Índice de aprovação e verificação final

**Files:** Create `design-aprovacao/index.html`, `design-aprovacao/LEIA-ME.md`

**Interfaces:** consome as 12 páginas; `index.html` lista os 4 estilos em cartões (nome, vibe, 3 links: landing/nutri/paciente) e uma linha de "como aprovar" (responder com a letra A–D).

- [ ] **Step 1:** `verify.mjs` deve estar sem falhas; adicionar checagem de que o índice linka as 12 páginas e todos os links existem.
- [ ] **Step 2:** Escrever `index.html` (também offline, sem CDN) e `LEIA-ME.md` (como abrir, estrutura, como gerar PDF/zip para enviar).
- [ ] **Step 3: Verificação ponta a ponta:** `node design-aprovacao/verify.mjs` → sai 0; capturar o índice em 390 e 1440; conferir com `prefers-reduced-motion: reduce` no Playwright que nenhuma animação roda.
- [ ] **Step 4: Rodar o `code-reviewer`** sobre `design-aprovacao/` (acessibilidade e HTML), corrigir CRITICAL/HIGH.
- [ ] **Step 5: Commit** `feat(design): índice e verificação final do redesign`.
