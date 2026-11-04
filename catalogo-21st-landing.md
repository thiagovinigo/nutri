# Catálogo de Componentes 21st.dev para Modernização da Landing Page Nutrivvo

Este documento cataloga os melhores padrões, seções e componentes do [21st.dev](https://21st.dev) adaptados para transformar a landing page do **Nutrivvo** em uma vitrine SaaS de padrão internacional (Design Engineering, alto impacto visual e alta conversão).

---

## 1. Visão Geral do 21st.dev

O **21st.dev** ("The npm for Design Engineers") reúne a vanguarda do design de interfaces modernas (comunidades shadcn/ui, Aceternity UI, Magic UI, Kokonut UI, etc.). Os pilares visuais que dominam a plataforma são:

1. **Micro-interações fluidas:** Transições com aceleração natural, hovers magnéticos e efeitos de profundidade.
2. **Efeitos de Luz & Fundo (Lighting):** Glow radial, Spotlights que reagem ao mouse, gradientes aurora e grid/dot patterns.
3. **Bento Grids Asimétricos:** Apresentação modular de recursos com widgets interativos vivos dentro de cada card.
4. **Tipografia de Alta Precisão:** Títulos com contrastes marcantes, texto com máscara de gradiente e badges iluminados.
5. **Simulações ao Vivo:** Cards que mostram o produto funcionando de verdade (chats, scans de IA, gráficos animados).

---

## 2. Catálogo Estruturado por Seções da Landing Page

### 🏷️ Categoria A: Hero Section & Primeira Impressão

| Componente no 21st.dev | Referência / Padrão | Aplicação Direta no Nutrivvo |
| :--- | :--- | :--- |
| **Spotlight Hero** | *uiable / aceternity* | Feixe de luz suave de topo direcionando o olhar para a proposta de valor: *"Seu paciente some entre consultas. O Nutrivvo não deixa."* |
| **Animated Shimmer Badge** | *magic-ui / shadcn* | Badge no topo: `✨ IA + Gamificação para Nutrição Clínica e Esportiva` com borda pulsante sutil. |
| **Dual Device Floating Mockup** | *hero-mockups / 21st* | Mockup do CRM Nutri + App Paciente em ângulo 3D suave, com cartões flutuantes ao redor (ex: `🔥 Ofensiva: 14 dias`, `⚠️ Alerta: Paciente inativo`). |
| **Shimmer Primary Button** | *kokonut / 21st* | Botão CTA principal *"Criar Clínica Grátis"* com feixe de luz reflexivo constante. |

---

### 🍱 Categoria B: Bento Grid de Recursos (Core Features)

O Bento Grid substitui as listas genéricas de cards por blocos visuais assimétricos e vivos:

| Bloco Bento | Componente 21st.dev | Como é renderizado no Nutrivvo |
| :--- | :--- | :--- |
| **Bloco 1 (Destaque Grande 2x2): Radar de Abandono** | *Radar Pulse / Live Status Grid* | Mini-radar interativo com círculos pulsantes concêntricos e cards de pacientes em risco (Verde = Seguro, Amarelo = Atenção, Vermelho = Crítico). |
| **Bloco 2 (Horizontal 2x1): Secretária IA no Telegram** | *Chat Flow Simulator* | Simulação de tela do Telegram mostrando a IA cobrando a foto do almoço e confirmando consulta sem intervenção humana. |
| **Bloco 3 (1x1): Diário por Foto com IA** | *Vision Scanner Card* | Prato de comida com "bounding boxes" e badges de macronutrientes detectados automaticamente: `Arroz (120g)`, `Frango grelhado (150g)`, `Brócolis`. |
| **Bloco 4 (1x1): Gamificação & Ofensiva** | *Streak Counter & XP Progress* | Ícone de chama animado, contagem de 12 dias de ofensiva e barra de XP subindo em tempo real. |
| **Bloco 5 (Horizontal 2x1): Dietas e Treinos com IA** | *Dynamic Code/Doc Preview* | Prévia de plano alimentar completo gerado em 3 segundos com receitas reais e tabela de substituição. |

---

### 🔄 Categoria C: Prova Social & Marquee

| Componente no 21st.dev | Referência / Padrão | Aplicação Direta no Nutrivvo |
| :--- | :--- | :--- |
| **Infinite Marquee** | *magic-ui / 21st* | Linha horizontal infinita com as especialidades e selos: *Nutrição Esportiva · Clínica · Comportamental · Materno-Infantil · Fitoterapia · Alta Performance*. |
| **Live Metrics Bento** | *stats-grid / 21st* | Bloco numérico impactante: `+87%` de adesão ao plano, `14h/mês` salvas em prontuários e `98.2%` de presença em consultas. |
| **Testimonial Carousel / Stack** | *avatar-reviews / 21st* | Cards de depoimentos reais de nutricionistas com estrelas, fotos de perfil e mini-gráficos de evolução do consultório. |

---

### ⚖️ Categoria D: Comparativo Interativo (Nutrivvo vs Método Tradicional)

| Componente no 21st.dev | Referência / Padrão | Aplicação Direta no Nutrivvo |
| :--- | :--- | :--- |
| **Comparison Matrix** | *saas-feature-comparison* | Tabela moderna destacando: *Planilhas/WhatsApp Pessoal* ❌ vs *Nutrivvo com IA & Telegram* ✅. Mostra abandono de pacientes, cobrança manual, tempo gasto em dietas. |
| **Persona Toggle Switch** | *segmented-control-tabs* | Abas elegantes para alternar a visão: *"Para a Nutricionista"* (Gestão, IA, Lucro) vs *"Para o Paciente"* (App fácil, XP, Resultados). |

---

### 💳 Categoria E: Tabela de Preços (Pricing Moderno)

| Componente no 21st.dev | Referência / Padrão | Aplicação Direta no Nutrivvo |
| :--- | :--- | :--- |
| **Glow Border Pricing Tier** | *pricing-cards / 21st* | Card com gradiente de borda dinâmica no plano mais popular ("Profissional"). |
| **Billing Cycle Switch** | *animated-pill-toggle* | Seletor Mensal / Anual com badge animado de `"2 meses grátis"`. |
| **Feature Checklist** | *check-list-icon* | Ícones com check verde brilhante detalhando pacientes ilimitados, IA liberada, Telegram Bot ativo. |

---

### ❓ Categoria F: FAQ Inteligente & CTA Final

| Componente no 21st.dev | Referência / Padrão | Aplicação Direta no Nutrivvo |
| :--- | :--- | :--- |
| **Smooth Spring Accordion** | *accordion-item / shadcn* | Accordion com perguntas frequentes dos profissionais (migração de pacientes, suporte, funcionamento do bot). |
| **Radiant Glow Final CTA** | *aurora-cta / 21st* | Seção final com fundo escuro e degradê violeta (#a855f7) com chamada irrecusável: *"Pare de perder pacientes hoje mesmo"*. |
| **Minimalist Glass Footer** | *saas-footer / 21st* | Rodapé limpo com links, termos, LGPD, status de uptime e copyright. |

---

## 3. Plano de Implementação Técnica no Nutrivvo

1. **Camada de Estilos:**
   - Aproveitar a infraestrutura de variáveis já definida em `src/landing.css` (`--w-primary: #a855f7`, etc.).
   - Criar classes de animação de alto desempenho (GPU-accelerated com `transform`, `opacity` e `@keyframes`).

2. **Componentização React:**
   - Manter a compatibilidade nativa com Vite + React 19 sem dependências quebradas.
   - Criar mini-componentes limpos em `src/components/landing/`:
     - `HeroSection.jsx`
     - `BentoGrid.jsx` (com os widgets de simulação do produto)
     - `ComparisonTable.jsx`
     - `PricingSection.jsx`
     - `FaqSection.jsx`
     - `FinalCta.jsx`

3. **Validação de Qualidade (Quality Gate):**
   - Rodar `npm run build` a cada etapa para garantir zero erros de build ou tela branca.
   - Testar em `npm run dev` com visualização mobile e desktop antes de qualquer release.

