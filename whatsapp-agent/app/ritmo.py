# Dá ritmo humano ao agente: buffer de mensagens, "digitando" e mensagens curtas - peça CÓDIGO.
import asyncio
import logging
import re
import time

from app import config, memory, whatsapp
from app.agent import agent

logger = logging.getLogger(__name__)

MAX_MENSAGENS = 3
SEGUNDOS_BASE = 1.0
SEGUNDOS_POR_CARACTERE = 0.04
SEGUNDOS_MAXIMOS = 8.0

_filas: dict[str, list[str]] = {}
_temporizadores: dict[str, asyncio.Task] = {}
_trancas: dict[str, asyncio.Lock] = {}
_tarefas_em_andamento: set[asyncio.Task] = set()


def tempo_de_digitacao(texto: str) -> float:
    return min(SEGUNDOS_BASE + SEGUNDOS_POR_CARACTERE * len(texto), SEGUNDOS_MAXIMOS)


def _limpar_markdown(texto: str) -> str:
    texto = re.sub(r"\[([^\]]*)\]\([^)]*\)", r"\1", texto)  # [texto](link) -> texto
    texto = re.sub(r"^\s{0,3}#{1,6}\s+", "", texto, flags=re.MULTILINE)  # títulos
    texto = re.sub(r"[*`]", "", texto)  # negrito, itálico e código
    texto = re.sub(r"(?<!\w)_+|_+(?!\w)", "", texto)  # _itálico_
    return texto


def dividir_mensagens(texto: str) -> list[str]:
    pedacos = [p.strip() for p in re.split(r"\n\s*\n", _limpar_markdown(texto))]
    pedacos = [p for p in pedacos if p]
    if len(pedacos) > MAX_MENSAGENS:
        pedacos = pedacos[: MAX_MENSAGENS - 1] + ["\n".join(pedacos[MAX_MENSAGENS - 1 :])]
    return pedacos


async def adicionar(contato: str, texto: str) -> None:
    """Põe a mensagem na fila do contato e (re)inicia a contagem do buffer."""
    _filas.setdefault(contato, []).append(texto)
    anterior = _temporizadores.get(contato)
    if anterior:
        anterior.cancel()
    tarefa = asyncio.create_task(_esperar_e_responder(contato))
    _temporizadores[contato] = tarefa
    _tarefas_em_andamento.add(tarefa)
    tarefa.add_done_callback(_tarefas_em_andamento.discard)


async def _esperar_e_responder(contato: str) -> None:
    await asyncio.sleep(config.BUFFER_SEGUNDOS)
    # Daqui em diante não há await até tirar a fila: mensagem nova vira um buffer novo,
    # e o temporizador que já está respondendo nunca é cancelado.
    mensagens = _filas.pop(contato, [])
    _temporizadores.pop(contato, None)
    if not mensagens:
        return
    tranca = _trancas.setdefault(contato, asyncio.Lock())
    async with tranca:  # um contato nunca recebe duas respostas ao mesmo tempo
        try:
            await _responder(contato, "\n".join(mensagens))
        except Exception:
            logger.exception("Falha ao responder o contato %s", contato)


async def _responder(contato: str, texto: str) -> None:
    await whatsapp.marcar_como_lida(contato)
    await whatsapp.comecar_digitando(contato)
    inicio = time.monotonic()
    try:
        resultado = await agent.run(texto, message_history=memory.pegar_historico(contato))
        memory.salvar_historico(contato, resultado.all_messages())

        for posicao, mensagem in enumerate(dividir_mensagens(resultado.output)):
            if posicao > 0:
                await whatsapp.comecar_digitando(contato)
            espera = tempo_de_digitacao(mensagem)
            if posicao == 0:
                espera -= time.monotonic() - inicio  # o tempo pensando já conta
            await asyncio.sleep(max(0.0, espera))
            await whatsapp.parar_digitando(contato)
            await whatsapp.enviar_mensagem(contato, mensagem)
    finally:
        await whatsapp.parar_digitando(contato)
