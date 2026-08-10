# Paciente — Verificação de Telefone WhatsApp

## Problem
O campo `phone` do paciente (usado pela Secretária Virtual de WhatsApp para reconhecer quem está escrevendo) é livremente editável pelo próprio paciente em `Profile.jsx`, sem qualquer confirmação de que o número realmente pertence a ele. Hoje, qualquer mensagem recebida de um número que bata com `patients.phone` é tratada como sendo daquele paciente e recebe plano alimentar, histórico e outros dados de saúde (`api/whatsapp-ai.js`). Isso cria risco real de vazamento de dados de saúde por erro de digitação, reciclagem de número por operadora, ou má-fé de terceiros.

## Evidence
- Observação direta de código: `Profile.jsx:134-136` permite o paciente editar `phone` livremente; `firestore.rules:11-13` permite `update` irrestrito no próprio doc (`allow read, create, update: if request.auth.uid == patientId`), sem proteção de campo.
- `api/whatsapp-webhook.js` (corrigido em 2026-08-10) busca o paciente só por `where('phone', '==', phoneNumber)` — não há segundo fator de confirmação antes de liberar contexto de saúde pela IA (`api/whatsapp-ai.js`).
- Pedido direto do usuário (dono do produto), 2026-08-10: "podemos ter alguma forma do usuário ter o número no seu perfil pra adicionar pra facilitar e alguma segurança?" — confirmando que o campo de auto-cadastro já existe, mas falta a camada de segurança.

## Users
- **Primary**: Paciente que quer confirmar/atualizar seu próprio número de WhatsApp com segurança, sabendo que só ele pode "ativar" aquele número pra receber seus dados.
- **Secondary**: Nutricionista, que ganha confiança de que os dados enviados pela Secretária Virtual chegam à pessoa certa (reduz risco reputacional/LGPD do consultório).
- **Not for**: Verificação de telefone no cadastro inicial (`SignUp.jsx`) — fora de escopo deste milestone; o foco é o ciclo de vida pós-cadastro (edição/confirmação em `Profile.jsx`).

## Hypothesis
We believe **adicionar um fluxo de verificação por código de 6 dígitos enviado via WhatsApp (Evolution API), com o resultado (`phone_verified`) protegido por regra do Firestore contra escrita direta do cliente, e o webhook da IA passando a exigir esse flag antes de liberar dados de saúde** will **eliminar o risco de um número não confirmado receber dados de saúde de outro paciente** for **pacientes e nutricionistas do Nutrivvo**.
We'll know we're right when **o paciente consegue verificar o próprio número pela UI, o flag não é escrita possível via client SDK (confirmado por teste manual tentando `updateDoc` com `phone_verified: true` direto), e mensagens de um número não verificado não recebem mais resposta da IA com dados do paciente**.

## Success Metrics
| Metric | Target | How measured |
|---|---|---|
| Tentativa de escrita direta de `phone_verified: true` pelo client SDK é rejeitada | 100% | Teste manual via console do navegador logado como paciente |
| Webhook da IA ignora/pede verificação para número não confirmado | 100% dos casos testados | Teste manual: mensagem de número não vinculado a nenhum `phone_verified: true` |
| Paciente completa o fluxo de verificação (envia código, recebe no WhatsApp, confirma) | Fluxo funciona ponta-a-ponta em teste manual | QA manual pós-implementação |

## Scope
**MVP** — Em `Profile.jsx`, ao lado do campo de telefone, botão "Verificar via WhatsApp" que:
1. Chama endpoint novo (`api/whatsapp-verify-send.js`) autenticado por Firebase ID token, que gera código de 6 dígitos, salva hash (nunca o código puro) + expiração de 10 min no doc do paciente via Admin SDK, e envia o código por WhatsApp reaproveitando a lógica de `send-whatsapp.js`.
2. Paciente digita o código recebido num input que aparece na tela.
3. Endpoint novo (`api/whatsapp-verify-confirm.js`) confere o hash e expiração, e só ele (Admin SDK, fora do alcance das regras do Firestore) marca `phone_verified: true`.
4. `firestore.rules` atualizado: cliente pode escrever qualquer campo do próprio doc **exceto** setar `phone_verified` para `true` e **exceto** tocar nos campos internos de OTP (`phone_otp_hash`, `phone_otp_expires`) — e trocar o valor de `phone` sem re-verificar exige que o mesmo write já zere `phone_verified` para `false`.
5. `api/whatsapp-webhook.js` passa a checar `patientData.phone_verified === true` antes de repassar a mensagem pra `processWhatsAppMessage`; se não verificado, responde com uma mensagem única pedindo pra verificar o número no app (sem repetir a cada mensagem — usar o mesmo padrão de "bot pausado" já existente).
6. Badge visual em `Profile.jsx` ("✅ Verificado" / "⚠️ Não verificado") ao lado do campo de telefone.

**Out of scope**
- Verificação no fluxo de `SignUp.jsx` (cadastro inicial) — fica pra um milestone futuro se o pedido aparecer.
- Rate limiting sofisticado (Redis, etc.) — MVP usa contadores simples no próprio doc do paciente (ex: não permitir novo envio antes de 60s, invalidar código após 5 tentativas erradas).
- Verificação de outros canais (e-mail, SMS) — fora de escopo, o canal é sempre WhatsApp (já é o canal que está sendo confirmado).
- Auditoria/histórico de tentativas de verificação — fica pra depois se necessidade real aparecer.

## Delivery Milestones
<!-- Business outcomes, not engineering tasks. /plan turns each into a plan. -->
<!-- Status: pending | in-progress | complete -->

| # | Milestone | Outcome | Status | Plan |
|---|---|---|---|---|
| 1 | Paciente verifica o próprio WhatsApp por código, e a IA passa a exigir essa verificação | Paciente vê badge de status, consegue disparar e confirmar o código; regra do Firestore impede bypass client-side; webhook da IA respeita o flag | pending | `.claude/plans/verificacao-telefone-whatsapp.plan.md` |

## Open Questions
- [ ] O que a IA responde pra um número não verificado que manda mensagem, se esse número **não bate com nenhum paciente** (caso já tratado hoje, ignora silenciosamente) vs **bate com um paciente mas `phone_verified` é `false`**— este milestone assume que deve orientar a verificar no app, não ignorar silenciosamente, pra não parecer bug pro paciente legítimo que ainda não verificou. Confirmar esse comportamento é o desejado.
- [ ] Pacientes já existentes, cadastrados antes desta feature, ficam com `phone_verified` ausente (falsy) — todos precisarão verificar retroativamente na primeira mensagem que mandarem. Aceitável para o MVP, mas vale avisar o usuário (dono do produto) que isso pausa a Secretária Virtual pra base atual até cada paciente verificar.

## Risks
| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Regra do Firestore mal escrita permite bypass (client setar `phone_verified: true` direto) | Baixa/Média | Alto — anula o propósito inteiro da feature | Task de validação dedicada testando exatamente esse bypass via console antes de considerar a milestone concluída |
| Paciente antigo sem `phone_verified` fica sem resposta da IA e acha que o bot quebrou | Média | Médio | Mensagem de fallback clara pedindo verificação, enviada uma vez (não repetida a cada mensagem) |
| Abuso de envio de código (spam pro próprio número ou de terceiros) | Baixa | Baixo/Médio (custo de mensagens Evolution API) | Cooldown de 60s entre envios + máximo de tentativas de confirmação por código, ambos no MVP |

---
*Status: DRAFT — requirements only. Implementation planning pending via /plan.*
