# Cliente do WAHA: envia mensagens, marca como lida e controla o "digitando" - peça CANAL.
import logging

import httpx

from app import config

logger = logging.getLogger(__name__)

TIMEOUT_SEGUNDOS = 30


async def _post(caminho: str, corpo: dict) -> None:
    async with httpx.AsyncClient(timeout=TIMEOUT_SEGUNDOS) as cliente:
        resposta = await cliente.post(
            f"{config.WAHA_URL}{caminho}",
            json={"session": config.SESSAO_WAHA, **corpo},
            headers={"X-Api-Key": config.WAHA_API_KEY},
        )
        resposta.raise_for_status()


async def _post_opcional(caminho: str, chat_id: str) -> None:
    """Visto e 'digitando' são só aparência: se falharem, a conversa segue."""
    try:
        await _post(caminho, {"chatId": chat_id})
    except httpx.HTTPError:
        logger.warning("Falha em %s para %s", caminho, chat_id, exc_info=True)


async def enviar_mensagem(chat_id: str, texto: str) -> None:
    await _post("/api/sendText", {"chatId": chat_id, "text": texto})


async def marcar_como_lida(chat_id: str) -> None:
    await _post_opcional("/api/sendSeen", chat_id)


async def comecar_digitando(chat_id: str) -> None:
    await _post_opcional("/api/startTyping", chat_id)


async def parar_digitando(chat_id: str) -> None:
    await _post_opcional("/api/stopTyping", chat_id)
