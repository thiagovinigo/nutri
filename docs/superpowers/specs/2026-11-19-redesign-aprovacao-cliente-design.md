# Redesign visual para aprovação do cliente — Design

Data: 2026-11-19 · Status: aprovado pelo usuário ("proposta ótima")

## Intenção
Mostrar ao cliente como o Nutrivvo ficaria com uma nova identidade visual, em sequências de telas navegáveis para ele aprovar um estilo antes de qualquer refatoração no app real. Cada estilo parte de um design system da pasta `referencias/`.

## Objetivos
- 4 estilos, cada um com 3 conjuntos: **landing**, **app do nutricionista** (desktop) e **app do paciente** (mobile).
- Uma página índice para o cliente comparar e navegar entre os estilos.
- Telas baseadas nos fluxos reais, com dados fictícios de nutrição.

## Não-objetivos
- Não alterar `src/` nem o app em produção.
- Não implementar lógica, backend ou autenticação.
- Não commitar nem apagar as alterações pendentes em `LandingPage.jsx` e `LandingPageWithRadar.jsx`.

## Anti-objetivo
Estilos que pareçam bonitos isolados, mas não se sustentem em tela densa de CRM ou em app mobile de uso diário (falha mesmo que "funcione").

## Abordagem
Considerei três caminhos:
1. **HTML estático autônomo em pasta nova** (escolhido): rápido de revisar, abre sem build, não toca o código real, dá para enviar ao cliente.
2. Rotas novas dentro do app React: reaproveita componentes, mas mistura protótipo com produção e exige build/deploy.
3. Ferramenta de design (Figma/Miro): bom para comentários, mas não temos os arquivos e não valida o estilo em código.

## Os 4 estilos (minha escolha, a partir da paleta e das fontes de cada referência)
| Estilo | Referência | Por quê | Base |
|---|---|---|---|
| A | TerraSprint | Serifa (Source Serif 4) + verde `#2f6844` + tons quentes; orgânico, "nutrição", editorial | claro |
| B | Spectra | Verde-floresta `#3f8568` sobre `#0a1814`, DM Sans leve; premium, saúde moderna | escuro |
| C | Otto | Creme `#fffdf7`, verde profundo `#172e2b`, pastéis sálvia/pêssego/amarelo; acolhedor, bom para o paciente | claro |
| D | Moveflux (oemsz26) | Neutros stone + âmbar `#f59e0b`, Inter; denso e limpo, bom para CRM | claro |

Descartados: Clarix (neon futurista de IA), Grotesk Zero (brutalista), VOID/03 (moda/lookbook). `kit-harness-engineering` não é visual.

## Telas por estilo
- **Landing (6 seções):** hero, problema/solução, recursos (agenda, plano alimentar, gamificação, IA), prova social, planos, CTA/rodapé.
- **Nutricionista (6 telas, 1440px):** dashboard, lista de pacientes, ficha do paciente com biomarcadores, montador de plano alimentar, agenda semanal, financeiro.
- **Paciente (6 telas, 390px):** onboarding, home/missões, plano alimentar do dia, receita por foto, chat com IA, perfil/marco compartilhável.

Total: 4 estilos × 3 conjuntos × 6 telas, mais o índice.

## Restrições
- Nome, logo e textos reais do Nutrivvo; dados de pacientes fictícios (nada de CPF ou dado real).
- Cada estilo usa só os tokens e as fontes da sua referência (fontes locais copiadas do zip, sem depender de CDN para abrir offline).
- Acessibilidade: contraste AA, alvos de toque ≥ 44px no mobile, `prefers-reduced-motion` respeitado.
- Layout verificado em 390px, 1024px e 1440px.

## Decisões minhas (para você conferir)
- Pasta de saída: `design-aprovacao/{terrasprint,spectra,otto,moveflux}/{landing,nutri,paciente}.html` + `design-aprovacao/index.html`.
- Cada arquivo é uma página rolável (nutri e paciente como sequência de telas lado a lado/em coluna), sem JavaScript além de navegação simples.
- Uma única base de conteúdo (textos e dados) compartilhada entre os 4 estilos, para o cliente comparar só o visual.
- Os arquivos dos design systems ficam em `referencias/` (zips) e só os tokens/fontes necessários são copiados.

## Deixado para quem constrói
Composição exata de cada tela, ilustrações/gráficos, microinterações e a ordem das telas dentro de cada sequência.
