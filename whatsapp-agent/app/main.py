# Servidor web que recebe o webhook do WAHA e põe a mensagem no buffer - peça CANAL.
import hashlib
import hmac
import json
import logging

from fastapi import BackgroundTasks, FastAPI, HTTPException, Request

from app import config, midia, ritmo

logger = logging.getLogger(__name__)

app = FastAPI()


def _assinatura_valida(corpo: bytes, assinatura: str | None) -> bool:
    if not config.WAHA_WEBHOOK_HMAC_KEY:
        return True
    esperado = hmac.new(config.WAHA_WEBHOOK_HMAC_KEY.encode(), corpo, hashlib.sha512).hexdigest()
    return hmac.compare_digest(esperado, assinatura or "")


def _deve_ignorar(mensagem: dict) -> bool:
    origem = mensagem.get("from") or ""
    return (
        not origem
        or bool(mensagem.get("fromMe"))
        or origem.endswith("@g.us")
        or origem == "status@broadcast"
    )


async def _enfileirar(mensagem: dict) -> None:
    texto = await midia.mensagem_para_texto(mensagem)
    if texto:
        await ritmo.adicionar(mensagem["from"], texto)


@app.post("/webhook")
async def webhook(requisicao: Request, em_segundo_plano: BackgroundTasks) -> dict:
    corpo = await requisicao.body()
    if not _assinatura_valida(corpo, requisicao.headers.get("x-webhook-hmac")):
        raise HTTPException(status_code=401, detail="Assinatura inválida")

    try:
        evento = json.loads(corpo)
    except ValueError:
        raise HTTPException(status_code=400, detail="JSON inválido")

    if not isinstance(evento, dict) or evento.get("event") != "message":
        return {"status": "ignorado"}
    mensagem = evento.get("payload")
    if not isinstance(mensagem, dict) or _deve_ignorar(mensagem):
        return {"status": "ignorado"}

    # Responde ao WAHA na hora; baixar/transcrever mídia roda depois.
    em_segundo_plano.add_task(_enfileirar, mensagem)
    return {"status": "ok"}
