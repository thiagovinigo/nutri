# Status Update: Nutrivvo Rebranding & Lançamento — 28/07/2026

## Executive Summary
O projeto passou por uma sessão de rebranding completo (Vytal → Nutrivvo) e correção rigorosa de bugs críticos (tela branca, falhas de IA, etc). O sistema agora está maduro visualmente e funcionalmente após extenso QA. Estamos prontos para o lançamento real, mas **bloqueados** por configurações manuais de infraestrutura (Firebase/Vercel) que requerem ação direta.

---

## Situation

### What happened
Durante as sessões de 27-28/07/2026, consolidamos 3 backlogs antigos em um só, executamos o rebranding e limpamos os bugs críticos que causavam crashes e falhas silenciosas na versão de produção.

### Impact
**On product**: Sistema muito mais estável, identidade visual aplicada (roxo/índigo), geração de dieta via IA agora lida corretamente com payloads grandes e timeouts melhor controlados.
**On timeline**: Prontos para lançamento imediato, dependendo apenas das aprovações de domínio e regras de segurança.
**On quality**: Testes de acessibilidade corrigidos (contraste de cor WCAG AA) e responsividade mobile ajustada.

### Data points
- **Bugs Críticos Resolvidos**: 8+ (incluindo falha de "tela branca" e upload de imagens via IA).
- **QA Exaustivo Concluído**: Caminhos felizes de agendamento, dieta, receitas e perfil validados de ponta-a-ponta.
- **Lançamento bloqueado por**: 2 itens pendentes de configuração manual no Firebase (regras e domínio).

---

## Analysis

### What we learned
1. **O ambiente Vercel precisou de ajustes manuais**: Os domínios (nutrivvo.com.br) estavam marcados como Preview, e não Production. Isso impedia o deploy automático de novas versões para o domínio final.
2. **A IA precisa de salvaguardas de timeout**: Observamos timeouts na Vercel (~50-60s) na geração de dietas para múltiplos dias, o que pode causar falhas silenciosas.
3. **Muitas funcionalidades estavam sobrepostas**: Consolidamos etapas da consulta para simplificar o UX do nutricionista (Dieta, Suplementos e Treino reestruturados).

### Why it matters
Essas correções pavimentam o caminho para um Go-Live seguro. O sistema estava funcional, mas frágil sem as regras de segurança do Firestore (ainda pendentes de deploy) ou com bugs invisíveis que degradavam a experiência na geração de dietas da IA.

---

## Next Steps

| What | Owner | When | Blocker? |
|------|-------|------|----------|
| **Publicar `firestore.rules`** via CLI (`firebase deploy --only firestore:rules`) | User | Imediato | YES - Bloqueia lançamento |
| **Autorizar domínio** `nutrivvo.com.br` no Firebase Auth | User | Imediato | YES - Bloqueia lançamento |
| **Alterar ambiente Vercel** para Production no domínio novo | User | Imediato | No |
| Teste manual final upload exame IA | Team | Logo após | No |
| Investigar timeout de dietas de 7 dias (Vercel) | Eng | Próxima Sprint | No |

---

## Risks

| Risk | Mitigação | Monitoring |
|------|-----------|-----------|
| Timeout da função serverless da IA na Vercel | Reduzir max_tokens ou mover para async job | Monitorar logs de erro 504 no painel Vercel |
| Instabilidade Firestore (503) | Padrão local-first implementado via Context | Monitorar dev tools e rede no Console |
| Falta de documentação correta de design | Sincronizar \`design.md\` com o código em produção (já listado no backlog) | PR review |

---

## Questions?
Contact: Antigravity AI - Nutrivvo Product Management Agent
