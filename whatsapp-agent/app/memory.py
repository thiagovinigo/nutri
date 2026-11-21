# Guarda e recupera o histórico de cada contato em arquivo JSON - peça CÓDIGO.
import logging
import re
from pathlib import Path

from pydantic_ai.messages import (
    ModelMessage,
    ModelMessagesTypeAdapter,
    ModelRequest,
    UserPromptPart,
)

logger = logging.getLogger(__name__)

LIMITE_MENSAGENS = 20
PASTA = Path(__file__).resolve().parent.parent / "historico"


def _arquivo(contato: str) -> Path:
    # O contato vem de fora (WhatsApp): troca tudo que não é seguro em nome de arquivo.
    nome = re.sub(r"[^\w.-]", "_", contato)
    if not nome.strip("._"):
        raise ValueError(f"Identificador de contato inválido: {contato!r}")
    return PASTA / f"{nome}.json"


def _eh_mensagem_do_cliente(mensagem: ModelMessage) -> bool:
    return isinstance(mensagem, ModelRequest) and any(
        isinstance(parte, UserPromptPart) for parte in mensagem.parts
    )


def _limitar(mensagens: list[ModelMessage]) -> list[ModelMessage]:
    """Mantém as últimas mensagens, sempre começando numa mensagem do cliente."""
    recentes = list(mensagens[-LIMITE_MENSAGENS:])
    for posicao, mensagem in enumerate(recentes):
        if _eh_mensagem_do_cliente(mensagem):
            return recentes[posicao:]
    return []


def pegar_historico(contato: str) -> list[ModelMessage]:
    arquivo = _arquivo(contato)
    if not arquivo.exists():
        return []
    try:
        return ModelMessagesTypeAdapter.validate_json(arquivo.read_bytes())
    except ValueError:
        logger.exception("Histórico corrompido em %s; começando conversa nova", arquivo)
        return []


def salvar_historico(contato: str, mensagens: list[ModelMessage]) -> None:
    arquivo = _arquivo(contato)
    arquivo.parent.mkdir(parents=True, exist_ok=True)
    temporario = arquivo.with_suffix(".json.tmp")
    temporario.write_bytes(ModelMessagesTypeAdapter.dump_json(_limitar(mensagens)))
    temporario.replace(arquivo)
