# Plano — Deploy do WhatsApp (WAHA) na VPS

PRD: `.claude/prds/waha-whatsapp.prd.md` (milestones 1 e 2 prontos no código; este é o plano de colocar em produção) · Status: **aguardando execução** · Criado em 21/11/2026

## Estado de partida (verificado em 21/11/2026)
- **Código** (na `main`, commits `53fa0c7`…`f515ff6`): adaptador WAHA, buffer por contato, `@lid`, hidratação, bom dia. 206 testes. Validado **só na máquina local** (WAHA 2026.10.1, motor NOWEB, ~330 MB de RAM com 1 sessão).
- **Produção hoje:** `.env.vps.local` **não tem** nenhuma variável `EVOLUTION_*` nem `WAHA_*` → o WhatsApp já está desligado em produção (o webhook responde 500 sem `WAHA_WEBHOOK_HMAC_KEY`, o que é o comportamento seguro). Telegram, crons e o resto seguem normais.
- **App do paciente:** `Profile.jsx:175-284` mostra "Secretária Virtual (WhatsApp) ainda não está disponível" e **não tem botão de conectar**. Sem a etapa C, o canal não tem como ser usado por pacientes reais.
- **VPS compartilhada (Locaweb):** o Traefik do `evolution-stack` ocupa 80/443; o app roda no `docker-compose.yml` da raiz (`mem_limit: 320m`, rede externa `evolution-stack_web`).

## Etapas

### A. Decisões antes de começar (suas)
1. **Número do bot:** use um chip **dedicado ao Nutrivvo** (não o seu pessoal). O WhatsApp Business costuma ser a melhor escolha. Se for reaproveitar o número usado nos testes locais, confirme antes que ele não está sob restrição.
2. **Acesso:** SSH na VPS e uma janela de manutenção curta (o app reinicia ~1 min no `up -d`).
3. **Motor:** NOWEB (já validado; sem Chromium).

### B. Infra na VPS (eu preparo os arquivos; você roda ou me dá acesso)
1. **Backup e linha de base:** copiar `.env` e `docker-compose.yml`; anotar `docker stats --no-stream` e `free -m` (a VPS é compartilhada: ver quanta RAM sobra para ~512 MB do WAHA).
2. **Serviço `waha` no compose da VPS**, **sem porta publicada e sem labels do Traefik** (só o app o alcança):
   ```yaml
   waha:
     image: devlikeapro/waha:2026.10.1      # versão testada; não usar :latest
     container_name: waha
     restart: unless-stopped
     mem_limit: 640m
     networks: [web]
     environment:
       WAHA_API_KEY: ${WAHA_API_KEY}
       WAHA_DASHBOARD_USERNAME: ${WAHA_DASHBOARD_USERNAME}
       WAHA_DASHBOARD_PASSWORD: ${WAHA_DASHBOARD_PASSWORD}
       WHATSAPP_DEFAULT_ENGINE: NOWEB
       WHATSAPP_START_SESSION: default
       WHATSAPP_RESTART_ALL_SESSIONS: "True"
       WHATSAPP_HOOK_URL: http://nutrivvo-app:3000/api/whatsapp-webhook
       WHATSAPP_HOOK_EVENTS: message
       WHATSAPP_HOOK_HMAC_KEY: ${WAHA_WEBHOOK_HMAC_KEY}
     volumes:
       - waha-sessions:/app/.sessions       # volume NOMEADO; contém a credencial do WhatsApp
   volumes:
     waha-sessions:
   ```
3. **Variáveis no `.env` da VPS** (gerar com `openssl rand -hex 24`; **nunca commitar**): `WAHA_URL=http://waha:3000`, `WAHA_API_KEY`, `WAHA_WEBHOOK_HMAC_KEY`, `WAHA_SESSION=default`, `WHATSAPP_BUFFER_MS=5000`, `WAHA_DASHBOARD_USERNAME/PASSWORD`. No `app`: passar essas variáveis (já usa `env_file: .env`).
4. **Subir:** `docker compose build app && docker compose up -d`; conferir `docker compose ps`, `GET /health` e que o WAHA está `Up`.
5. **Parear o número sem expor o WAHA:** publicar a porta **só em loopback** por alguns minutos (`127.0.0.1:3001:3000`), abrir um túnel `ssh -L 3000:127.0.0.1:3001 usuario@vps` e pegar o QR por `GET /api/default/auth/qr?format=image` com `X-Api-Key` (o dashboard do WAHA Core não lista as sessões sem a chave configurada no navegador). Ler o QR com o celular do número do bot. **Remover a publicação de porta depois.**
6. **Teste de fumaça (checklist):**
   - `curl -X POST https://nutrivvo.com.br/api/whatsapp-webhook` sem assinatura → **401**.
   - `GET /api/sessions/default` (de dentro da rede) → `WORKING`.
   - mensagem real de um celular de teste: `/start <idPacienteTeste>` e depois "oi, bebi 2 copos de água" → resposta única, e o registro cai no paciente de teste.
   - foto e áudio curtos → respondidos.
   - `docker stats` e `free -m` estáveis por 24 h.

### C. App do paciente e do nutricionista (código novo, antes de abrir para pacientes reais)
1. **Pré-requisito de segurança:** trocar o `/start <patientId>` por **código de uso único** (como já existe para o nutri em `lib/nutriLinkCode.js`). Hoje quem souber o `patientId` vincula o próprio WhatsApp a ele (achado do `security-reviewer`, no backlog).
2. **Botão "Conectar WhatsApp" no Perfil do paciente** (`Profile.jsx`), gerando `https://wa.me/<numero-do-bot>?text=/start <codigo>`; número vindo de `VITE_WHATSAPP_BOT_NUMBER` (novo `ARG` no `Dockerfile` e no `compose`). Variável vazia = mantém "Em breve" (é também o interruptor de rollback).
3. **Botão equivalente para o nutri** no Perfil Profissional (`/start nutri:<codigo>`, o backend já existe).
4. TDD + `code-reviewer` + `security-reviewer`; rebuild da imagem.

### D. Aquecimento e regras anti-banimento do número (já queimaram 3)
1. **Só responder**: nenhuma mensagem proativa, nem em massa. O bom dia e os lembretes ficam **só no Telegram**.
2. **Antes de pacientes reais**, implementar o restante do milestone 2: visto, "digitando", espera proporcional e mensagens curtas (já existe no protótipo `whatsapp-agent/app/ritmo.py`).
3. **Rampa:** dias 1–3 só você e 1–2 pessoas de confiança; dias 4–7 até ~10 pacientes; depois liberar aos poucos. Conversas normais, sem repetir texto idêntico.
4. **Nunca** usar botões/listas nativas (já é texto puro numerado).
5. Ao menor sinal de restrição (sessão cai para `FAILED`/`STOPPED` fora de reinício, aviso do WhatsApp), **parar** e investigar antes de reconectar.

### E. Desligar a Evolution
Só depois de **7 dias estáveis**: `docker compose stop` nos serviços da Evolution (sem `down -v`, **não apagar volumes**) para liberar memória. Remover os scripts `setup_evolution.cjs`, `reset_whatsapp.cjs`, `reconnect_whatsapp.cjs` em um commit separado.

### F. Monitoramento
- Verificação diária: `GET /api/sessions/default` → `WORKING` (script simples + alerta no Telegram do nutri se não for).
- `docker stats`/`free -m` na VPS; logs do `waha` e do `app` (`docker compose logs --since 1h`).
- **Backup do volume `waha-sessions`**: ele guarda a credencial do WhatsApp; tratar como segredo (criptografado, fora do repositório).

### G. Rollback
1. `docker compose stop waha` (o app continua; webhook devolve erro e o Telegram não é afetado).
2. Esvaziar `VITE_WHATSAPP_BOT_NUMBER` e rebuildar → o app volta a mostrar "Em breve".
3. A Evolution continua parada, **não removida**, por 7 dias.

## Ordem e dependências
| # | Etapa | Depende de | Quem |
|---|---|---|---|
| 1 | A. decisões (número, janela) | você | você |
| 2 | B. WAHA na VPS + pareamento + fumaça | acesso SSH, chip do bot | você + eu |
| 3 | C. código dos botões + código de uso único | nada (pode começar já) | eu |
| 4 | D. ritmo humano + rampa | etapa 2 | eu + você |
| 5 | Abrir para pacientes reais | 2, 3 e 4 | você |
| 6 | E. desligar Evolution | 7 dias estáveis | você |

## Riscos específicos
- **Memória da VPS compartilhada:** ~330 MB medidos localmente; reservar 640 MB. Se faltar, parar a Evolution antes (ela deixou de ser usada).
- **Banimento** continua possível (canal não oficial). Plano B: Cloud API oficial da Meta (templates, também permite lembretes proativos).
- **Webhook sem `rawBody`:** só funciona no servidor Express (VPS). Não usar a Vercel para este endpoint.
- **Fuso do servidor:** o código usa São Paulo explicitamente (`brDateKey`, `nowBR`), mas conferir `date` na VPS.
- **`@lid`:** hoje resolvido pelo campo alternativo do payload (funcionou no teste local); se algum contato vier sem ele, ativar o *store* do NOWEB (mais memória) para a API de LIDs.
