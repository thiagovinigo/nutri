# Plan: Paciente — Verificação de Telefone WhatsApp

**Source PRD**: `.claude/prds/verificacao-telefone-whatsapp.prd.md`
**Selected Milestone**: #1 — Paciente verifica o próprio WhatsApp por código, e a IA passa a exigir essa verificação
**Complexity**: Medium (toca Firestore rules + 2 endpoints novos + fluxo de auth ainda não usado no projeto)

## Summary
Fluxo de verificação de posse do número de WhatsApp via código de 6 dígitos (OTP), com o resultado protegido contra escrita direta do client SDK. Dois endpoints novos autenticados por Firebase ID token (`api/whatsapp-verify-send.js`, `api/whatsapp-verify-confirm.js`) usam o Admin SDK (que ignora `firestore.rules`) para gravar `phone_verified`, `phone_otp_hash` e `phone_otp_expires` no doc do paciente — campos que `firestore.rules` passa a bloquear para escrita direta do cliente. `Profile.jsx` ganha um pequeno sub-fluxo (botão → input de código → confirmação) e um badge de status. `api/whatsapp-webhook.js` passa a checar `phone_verified` antes de repassar a mensagem pra IA.

**Decisão de escopo já confirmada no PRD**: nada de SMS/e-mail como canal alternativo — o próprio WhatsApp é o canal de verificação. Nada de auditoria de tentativas nem rate limiting sofisticado no MVP — só cooldown simples e contador de tentativas no próprio doc.

## Patterns to Mirror
| Category | Source | Pattern |
|---|---|---|
| Endpoint serverless com Evolution API | `api/send-whatsapp.js` | Mesma estrutura de `handler(req, res)`, mesma normalização de DDI (`digitsOnly.startsWith('55') ? ... : '55' + ...`) recém-adicionada — extrair pra util compartilhado em vez de duplicar |
| Leitura/escrita via Admin SDK | `api/whatsapp-ai.js:50-52` (`db.collection('patients').doc(patientId)`) | Mesmo padrão de acesso direto à coleção `patients` pelo Admin SDK |
| Botão com estado de loading/sucesso no Profile do paciente | `Profile.jsx:94-105` (`handleSaveWeight`, `weightSaved` com `setTimeout`) | Mesmo padrão de estado local (`useState` + `setTimeout` pra limpar feedback) pro fluxo de verificação |
| Handoff/pausa do bot por condição no paciente | `api/whatsapp-ai.js:107-118` (`isBotPaused`) | Mesmo padrão de checagem de flag no `patientData` antes de processar, com fallback de mensagem única em vez de resposta normal |
| Regra do Firestore restringindo quais campos um update pode tocar | `firestore.rules:43-46` (`diff(resource.data).affectedKeys().hasOnly(['patientId'])` em `appointments`) | Mesma técnica de `affectedKeys()`/`diff()`, aplicada aos campos `phone_verified`, `phone_otp_hash`, `phone_otp_expires` em `patients` |

## Files to Change
| File | Action | Why |
|---|---|---|
| `api/utils/whatsapp.js` | CREATE | Extrai `normalizePhoneWithDDI(phone)` e `sendWhatsAppText(remoteJid, text)` de `api/send-whatsapp.js`/`api/cron-reminders.js` (hoje duplicados) — reaproveitado pelos 2 endpoints novos sem duplicar pela 3ª vez |
| `api/utils/auth.js` | CREATE | `requireAuthUid(req)` — extrai `Authorization: Bearer <idToken>`, chama `admin.auth().verifyIdToken(idToken)`, retorna `uid` ou lança erro 401. Primeiro uso de verificação de ID token no projeto — centralizado aqui pra reaproveitar em endpoints futuros |
| `api/whatsapp-verify-send.js` | CREATE | Handler POST `{patientId}`: `requireAuthUid` e confere `uid === patientId`; busca doc do paciente, checa cooldown (`phone_otp_sent_at` < 60s atrás → 429); gera código de 6 dígitos, grava `phone_otp_hash` (SHA-256, módulo `crypto` nativo), `phone_otp_expires` (agora + 10 min), `phone_otp_attempts: 0`, `phone_otp_sent_at`; envia via `sendWhatsAppText` pro `patient.phone` |
| `api/whatsapp-verify-confirm.js` | CREATE | Handler POST `{patientId, code}`: `requireAuthUid` e confere `uid === patientId`; busca doc, valida `phone_otp_expires` não passou e `phone_otp_attempts < 5`; compara hash; se bater, grava `phone_verified: true` e limpa os 3 campos de OTP; se não bater, incrementa `phone_otp_attempts` e retorna erro |
| `firestore.rules` | UPDATE | Em `match /patients/{patientId}`, trocar a regra de `update` do próprio paciente (linha 13) para bloquear escrita de `phone_verified` (exceto valor `false`), `phone_otp_hash`, `phone_otp_expires`, `phone_otp_attempts`, `phone_otp_sent_at`; exigir que qualquer update que mude `phone` também zere `phone_verified` para `false` no mesmo write |
| `src/features/paciente/components/Profile.jsx` | UPDATE | Adicionar estado (`verifyStep`, `otpCode`, `verifySending`, `verifyError`) e UI ao lado do campo de telefone: badge "✅ Verificado"/"⚠️ Não verificado", botão "Verificar via WhatsApp" (chama `whatsapp-verify-send` com `idToken` de `auth.currentUser.getIdToken()`), input de código + botão "Confirmar" (chama `whatsapp-verify-confirm`). Ao editar o campo `phone` manualmente, resetar visualmente o badge pra "não verificado" e incluir `phone_verified: false` no próximo `updatePatient` |
| `api/whatsapp-webhook.js` | UPDATE | Após achar `patientData` (linha ~81), checar `patientData.phone_verified === true`; se não, e ainda não foi avisado (`patientData.phone_verify_reminder_sent` não setado), enviar uma mensagem única via `sendWhatsAppText` pedindo pra verificar o número no app e marcar `phone_verify_reminder_sent: true`; se já foi avisado, ignorar silenciosamente (não repetir a cada mensagem) |

## Tasks

### Task 1: Extrair utilitários compartilhados de WhatsApp e auth
- **Action**: Criar `api/utils/whatsapp.js` com `normalizePhoneWithDDI(phone)` (mesma lógica hoje duplicada em `send-whatsapp.js`/`cron-reminders.js`) e `sendWhatsAppText(remoteJid, text)` (POST pra `EVOLUTION_API_URL/message/sendText/EVOLUTION_INSTANCE_NAME`, mesmo payload já usado nos 3 arquivos existentes). Atualizar `api/send-whatsapp.js`, `api/cron-reminders.js` e `api/whatsapp-ai.js` pra importar dali em vez de repetir o fetch inline. Criar `api/utils/auth.js` com `requireAuthUid(req)` usando `admin.auth().verifyIdToken`.
- **Mirror**: `api/utils/firebase-admin.js` para o padrão de módulo utilitário compartilhado em `api/utils/`.
- **Validate**: `node --check` nos 5 arquivos tocados; `curl` manual no `send-whatsapp.js` continua funcionando igual (mesmo comportamento, só refatorado).

### Task 2: Endpoints de envio e confirmação de código
- **Action**: Criar `api/whatsapp-verify-send.js` e `api/whatsapp-verify-confirm.js` conforme descrito na tabela acima. Usar `crypto.createHash('sha256').update(code + patientId).digest('hex')` como hash (salgado com o próprio `patientId` pra evitar rainbow table trivial entre pacientes). Código gerado com `crypto.randomInt(100000, 999999)`.
- **Mirror**: `api/whatsapp-webhook.js` para o padrão de handler `(req, res)` com validação de método e try/catch; `api/whatsapp-ai.js:50-52` para acesso ao doc do paciente via Admin SDK.
- **Validate**: Testar via `curl` com um ID token real (login como paciente de teste no app, capturar token via `auth.currentUser.getIdToken()` no console do navegador): enviar código, conferir que chega no WhatsApp; confirmar com código certo (sucesso) e errado (erro, contador incrementa); confirmar que expira depois de 10 min (ajustar temporariamente pra 10s durante o teste, reverter depois).

### Task 3: Travar os campos no Firestore rules
- **Action**: Atualizar a regra de `update` de paciente em `firestore.rules` para negar o write se o diff tocar `phone_otp_hash`, `phone_otp_expires`, ou `phone_otp_attempts`; e para `phone_verified`, só permitir se o novo valor for `false` (nunca `true` vindo do cliente); e exigir que qualquer diff que inclua `phone` também inclua `phone_verified: false` no mesmo write.
- **Mirror**: `firestore.rules:43-46` (regra de `appointments` restringindo campos via `affectedKeys().hasOnly(...)`).
- **Validate**: Logado como paciente de teste no navegador, abrir o console e tentar `updateDoc(doc(db,'patients', meuUid), {phone_verified: true})` diretamente — **deve ser rejeitado** (`permission-denied`). Depois confirmar que o fluxo normal via UI (Task 2) ainda funciona, já que ele passa pelo Admin SDK.

### Task 4: UI de verificação em `Profile.jsx`
- **Action**: Adicionar badge de status e o sub-fluxo de 2 passos (enviar código → confirmar código) ao lado do campo de telefone, com feedback de loading/erro/sucesso seguindo o padrão de `weightSaved`. Ao editar manualmente o campo de telefone, incluir `phone_verified: false` no objeto salvo por `handleSaveProfile`.
- **Mirror**: `Profile.jsx:94-105` (`handleSaveWeight`/`weightSaved`) para o padrão de estado + feedback temporário.
- **Validate**: Fluxo manual completo na UI: editar telefone → salvar (badge vira "não verificado") → clicar "Verificar via WhatsApp" → receber código no celular → digitar → badge vira "verificado".

### Task 5: Webhook exige verificação antes de liberar a IA
- **Action**: Em `api/whatsapp-webhook.js`, após encontrar `patientData`, checar `phone_verified`. Se falso/ausente e `phone_verify_reminder_sent` ainda não setado, mandar mensagem única via `sendWhatsAppText` (novo util da Task 1) pedindo verificação no app, e gravar `phone_verify_reminder_sent: true` no doc via Admin SDK. Se já avisado antes, apenas `return` sem responder (evita spam a cada mensagem de quem ainda não verificou). Se `phone_verified === true`, segue fluxo normal pra `processWhatsAppMessage`.
- **Mirror**: `api/whatsapp-ai.js:107-118` (`isBotPaused`) para o padrão de checar uma flag no `patientData` e desviar do fluxo normal.
- **Validate**: Com paciente de teste **não verificado**, mandar mensagem → recebe aviso pedindo verificação (só na primeira vez). Mandar segunda mensagem → sem resposta nenhuma (confirma que não repete o aviso). Depois de verificar (Task 4), mandar mensagem → resposta normal da IA volta a funcionar.

## Validation
```bash
npm run dev      # smoke test manual — não há suite de testes automatizados no projeto
npm run lint
npm run build
firebase deploy --only firestore:rules   # deploy das regras atualizadas
```
Sem testes automatizados neste projeto — validação manual cobre: (1) bypass client-side das regras (Task 3, o teste mais crítico); (2) fluxo ponta-a-ponta de verificação na UI (Task 4); (3) webhook respeitando o flag pra paciente verificado e não verificado (Task 5).

## Risks
| Risk | Likelihood | Mitigation |
|---|---|---|
| Regra do Firestore com sintaxe errada bloqueia updates legítimos do próprio paciente (ex: salvar peso, editar nome) | Média | Testar explicitamente um update comum (ex: salvar peso) depois de publicar a regra nova, não só o caso de bypass |
| `admin.auth().verifyIdToken` falhar silenciosamente em produção por token expirado/relógio dessincronizado | Baixa | Retornar erro 401 explícito com mensagem clara pro frontend re-logar, não deixar a Promise rejeitar sem tratamento |
| Primeira vez que o projeto verifica ID token em endpoint — pode expor um gap se outro endpoint existente (`send-whatsapp.js`) continuar sem nenhuma auth | Média (risco pré-existente, não introduzido por este plano) | Fora de escopo deste milestone corrigir `send-whatsapp.js`/`cron-reminders.js`; registrar como débito técnico separado no backlog |

## Acceptance
- [ ] `updateDoc` direto do client tentando `phone_verified: true` é rejeitado pelo Firestore (`permission-denied`) — regra publicada no Firebase Console em 10/08, mas o teste de bypass em si (abrir console do navegador logado como paciente e tentar) ainda não foi executado
- [ ] Paciente consegue disparar o código, recebê-lo no WhatsApp real, e confirmar pela UI — **bloqueado**: número de teste do bot ficou restrito 5h pelo WhatsApp por volume de testes automatizados no mesmo dia (ver Status Log)
- [x] Badge em `Profile.jsx` reflete corretamente verificado/não verificado, inclusive resetando ao editar o telefone — implementado, não testado ponta-a-ponta ainda (depende do item acima)
- [ ] `api/whatsapp-webhook.js` não libera a IA pra número não verificado, manda aviso uma única vez — implementado, não testado ainda
- [x] `npm run build` e `npm run lint` passam sem erros novos
- [x] Débito técnico (`send-whatsapp.js`/`cron-reminders.js` sem auth) registrado no `backlog.md` para tratamento futuro

## Status Log (10/08/2026)
Toda a infraestrutura foi corrigida e confirmada funcionando — só falta reconectar o WhatsApp e rodar o teste ponta-a-ponta:

**Confirmado funcionando:**
- Auth: `requireAuthUid` verifica ID token corretamente em produção (testado com request sem token → 401 limpo)
- Firestore: Admin SDK inicializa com a service account certa (`nutribase-fea35`)
- Evolution API: payload `{number, text, delay}` confirmado funcionando via teste direto (envio real entregue, HTTP 201)
- `firestore.rules` publicada no Firebase Console (bloqueio de `phone_verified`/campos OTP)
- Env vars corretas na Vercel Production: `FIREBASE_SERVICE_ACCOUNT`, `EVOLUTION_API_URL`, `EVOLUTION_INSTANCE_NAME`, `EVOLUTION_API_KEY` (rotacionada)

**Bugs achados e corrigidos nesta sessão (fora do escopo original, mas bloqueavam tudo):**
1. `patient.telefone`/`patient.nome` (campos inexistentes) → `patient.phone`/`patient.name` em `whatsapp-webhook.js`, `whatsapp-ai.js`, `cron-reminders.js`
2. Telefone sem DDI salvo no perfil vs. Evolution API exigindo DDI completo — normalizado nos dois sentidos
3. `api/utils/firebase-admin.js` usava API legada do `firebase-admin` (removida na v14) — migrado pra API modular
4. `jose@6` (ESM-only) incompatível com `jwks-rsa` (CJS) — pinado em `jose@^5.10.0` via `overrides` no `package.json`
5. `FIREBASE_SERVICE_ACCOUNT` só marcada pra "Preview" na Vercel, não "Production"
6. Valor colado em `FIREBASE_SERVICE_ACCOUNT` era código JS por engano (corrigido via Vercel CLI, contornando bug de paste no navegador)
7. Payload da Evolution API mudou de formato (`textMessage.text` → `text` na raiz) nesta versão (v2.3.7)
8. **Crítico:** `ChatIA.jsx` chamava a Evolution API direto do navegador com a apikey hardcoded no código — expunha controle administrativo total da instância no bundle JS público. Corrigido pra usar `/api/send-whatsapp` (server-side); apikey rotacionada por precaução

**Bloqueado agora:** número do bot (`nutrivvo_bot`) ficou restrito por 5h pelo WhatsApp — padrão de detecção de bot por volume de mensagens automatizadas de teste no mesmo dia (múltiplos pareamentos, testes de payload, teste de envio direto, etc.). Não é bug de código — é o WhatsApp aplicando rate-limit/anti-abuso no número.

**Para retomar:**
1. Esperar a restrição de 5h passar (ou usar horário diferente do dia)
2. Escanear QR novo pra reconectar (`instance/connect/nutrivvo_bot`)
3. Testar o fluxo completo, **espaçando os envios** (não repetir rajadas de teste) pra não disparar o mesmo bloqueio de novo
4. Rodar o teste de bypass do Firestore rules (console do navegador) explicitamente
5. Testar `whatsapp-webhook.js` com paciente verificado e não verificado
