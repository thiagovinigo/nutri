# Redesign Nutrivvo — pacote para aprovação do cliente

Quatro direções visuais que redesenham as **telas reais do Nutrivvo**: a landing de produção (5 seções), o CRM do nutricionista (Visão Geral, Agenda, Meus Pacientes, Prontuário, Consulta, Financeiro) e o app do paciente (Início, Plano, Treino, Receitas, IA, Perfil). Textos, estrutura e fluxos vêm do app atual; os dados são os do modo demo (fictícios). Muda só o visual. O índice mostra os prints atuais em "Como é hoje" para comparar.

## Como abrir
Dê dois cliques em `index.html` (abre no navegador, sem internet e sem instalar nada).

| Estilo | Referência | Perfil |
|---|---|---|
| A · TerraSprint | `referencias/terrasprint-ai-design-system.zip` | Editorial e orgânico: serifa, verde-folha, tons quentes |
| B · Spectra | `referencias/spectra-design-system.zip` | Escuro premium: verde-floresta, tipografia leve |
| C · Otto | `referencias/otto-cinematic-9-design-system.zip` | Acolhedor: creme, pastéis, formas arredondadas |
| D · Moveflux | `referencias/oemsz26-design-system.zip` | Denso e preciso: neutros stone, âmbar, tabelas compactas |

## Para enviar ao cliente
Compacte a pasta `design-aprovacao/` inteira (exceto `_build/` se quiser) e envie o `.zip`. O cliente abre `index.html` e responde com a letra do estilo escolhido e o que quer ajustar.

## Estrutura
```
design-aprovacao/
├── index.html              índice para comparar os 4 estilos
├── <estilo>/               terrasprint | spectra | otto | moveflux
│   ├── landing.html  nutri.html  paciente.html
│   ├── tokens.css          cores, fontes e raio do estilo
│   ├── style.css           personalidade (composição, formas, tipografia)
│   └── assets/fonts/       fontes locais da referência
├── _shared/                base.css, components.css (layout), mobile-frame.css, content.md
├── _build/                 gerador das páginas
└── verify.mjs              verificação (estrutura, offline, links)
```

## Manutenção
As páginas HTML são **geradas**. Para mudar texto, dados ou marcação, edite `_build/*.mjs` (ou `_shared/content.md` como referência) e rode:

```
node design-aprovacao/_build/build.mjs
node design-aprovacao/verify.mjs          # estrutura, offline, links
node design-aprovacao/verify-visual.mjs   # contraste AA, foco, nomes acessíveis, margens (precisa de Playwright global)
```

Para mudar só o visual de um estilo, edite `<estilo>/tokens.css` e `<estilo>/style.css`.

## Observações
- TerraSprint usa Fraunces + Geist (as fontes que a referência distribui).
- Nenhum arquivo de `src/` foi alterado; isto é um protótipo para validar o visual, não o app em produção.
- Contraste de texto ≥ 4,5:1 nos tokens de todos os estilos; sem scroll horizontal em 390, 1024 e 1440 px; animações desligam com `prefers-reduced-motion`.
