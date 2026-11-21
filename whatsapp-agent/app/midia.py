# Transforma áudio, imagem e documento em texto antes de chegar no agente - peça CÓDIGO.
import base64
import logging
from urllib.parse import urlparse

import httpx

from app import config

logger = logging.getLogger(__name__)

OPENAI_URL = "https://api.openai.com/v1"
TIMEOUT_SEGUNDOS = 60
LIMITE_RESUMO_CARACTERES = 500

PEDIDO_IMAGEM = (
    "Descreva esta imagem em português, de forma objetiva e curta, em até três frases, "
    "incluindo qualquer texto que apareça nela."
)
PEDIDO_DOCUMENTO = (
    f"Resuma este documento em português em até {LIMITE_RESUMO_CARACTERES} caracteres, "
    "com o que importa pro atendimento: tipo de documento, valores, datas e nomes."
)


def _autorizacao() -> dict:
    return {"Authorization": f"Bearer {config.OPENAI_API_KEY}"}


def _url_no_waha(url: str) -> str:
    # O WAHA monta o link com o host dele (ex.: localhost); aqui usamos o endereço
    # que este programa realmente alcança, o WAHA_URL.
    alvo = urlparse(config.WAHA_URL)
    return urlparse(url)._replace(scheme=alvo.scheme, netloc=alvo.netloc).geturl()


async def baixar_midia(url: str) -> bytes:
    async with httpx.AsyncClient(timeout=TIMEOUT_SEGUNDOS) as cliente:
        resposta = await cliente.get(_url_no_waha(url), headers={"X-Api-Key": config.WAHA_API_KEY})
        resposta.raise_for_status()
        return resposta.content


def _base64(conteudo: bytes) -> str:
    return base64.b64encode(conteudo).decode("ascii")


async def transcrever_audio(conteudo: bytes, formato: str) -> str:
    async with httpx.AsyncClient(timeout=TIMEOUT_SEGUNDOS) as cliente:
        resposta = await cliente.post(
            f"{OPENAI_URL}/audio/transcriptions",
            headers=_autorizacao(),
            data={"model": "whisper-1", "language": "pt"},
            files={"file": (f"audio.{formato}", conteudo)},
        )
        resposta.raise_for_status()
        return resposta.json()["text"].strip()


async def _perguntar_ao_modelo(pedido: str, anexo: dict) -> str:
    async with httpx.AsyncClient(timeout=TIMEOUT_SEGUNDOS) as cliente:
        resposta = await cliente.post(
            f"{OPENAI_URL}/chat/completions",
            headers=_autorizacao(),
            json={
                "model": config.MODELO_MIDIA,
                "messages": [
                    {"role": "user", "content": [{"type": "text", "text": pedido}, anexo]}
                ],
            },
        )
        resposta.raise_for_status()
        return resposta.json()["choices"][0]["message"]["content"].strip()


async def descrever_imagem(url: str, mimetype: str = "image/jpeg") -> str:
    imagem = await baixar_midia(url)
    anexo = {
        "type": "image_url",
        "image_url": {"url": f"data:{mimetype};base64,{_base64(imagem)}"},
    }
    return await _perguntar_ao_modelo(PEDIDO_IMAGEM, anexo)


async def ler_documento(conteudo: bytes, nome_arquivo: str) -> str:
    anexo = {
        "type": "file",
        "file": {
            "filename": nome_arquivo,
            "file_data": f"data:application/pdf;base64,{_base64(conteudo)}",
        },
    }
    resumo = await _perguntar_ao_modelo(PEDIDO_DOCUMENTO, anexo)
    return resumo[:LIMITE_RESUMO_CARACTERES]


def _formato_do_audio(mimetype: str) -> str:
    # "audio/ogg; codecs=opus" -> "ogg"
    return mimetype.split(";")[0].split("/")[-1] or "ogg"


async def _converter_midia(mensagem: dict) -> str:
    midia = mensagem.get("media") or {}
    mimetype = midia.get("mimetype") or ""
    url = midia.get("url")
    legenda = (mensagem.get("body") or "").strip()
    if not url:
        raise ValueError("WAHA não baixou a mídia (media.url vazio)")

    if mimetype.startswith("audio/"):
        transcricao = await transcrever_audio(await baixar_midia(url), _formato_do_audio(mimetype))
        return f"[áudio do cliente]: {transcricao}"
    if mimetype.startswith("image/"):
        descricao = await descrever_imagem(url, mimetype)
        texto = f"[imagem enviada pelo cliente]: {descricao}"
        return f"{texto}\n{legenda}" if legenda else texto
    if mimetype == "application/pdf":
        nome = midia.get("filename") or "documento.pdf"
        resumo = await ler_documento(await baixar_midia(url), nome)
        return f"[documento PDF enviado pelo cliente, arquivo {nome}]: {resumo}"
    return f"[o cliente mandou um arquivo do tipo {mimetype or 'desconhecido'}]"


async def mensagem_para_texto(mensagem: dict) -> str:
    """Devolve o texto que vai pro buffer; vazio se não há o que responder."""
    if not mensagem.get("hasMedia"):
        return (mensagem.get("body") or "").strip()
    try:
        return await _converter_midia(mensagem)
    except (httpx.HTTPError, ValueError, KeyError):
        logger.exception("Falha ao converter mídia %s", mensagem.get("id"))
        return "[o cliente mandou uma mídia que não foi possível abrir]"
