import hashlib
import hmac
import json

import httpx
import pytest

from app import config, main, midia

CONTATO = "5541999999999@c.us"


def evento(**payload):
    return {"event": "message", "payload": {"from": CONTATO, "fromMe": False, **payload}}


@pytest.fixture
def recebidas(monkeypatch):
    fila: list[tuple[str, str]] = []

    async def adicionar(contato, texto):
        fila.append((contato, texto))

    monkeypatch.setattr(main.ritmo, "adicionar", adicionar)
    monkeypatch.setattr(config, "WAHA_WEBHOOK_HMAC_KEY", "")
    return fila


@pytest.fixture
async def cliente(recebidas):
    transporte = httpx.ASGITransport(app=main.app)
    async with httpx.AsyncClient(transport=transporte, base_url="http://teste") as http:
        yield http


async def test_mensagem_de_texto_vai_pro_buffer(cliente, recebidas):
    resposta = await cliente.post("/webhook", json=evento(body="oi"))

    assert resposta.json() == {"status": "ok"}
    assert recebidas == [(CONTATO, "oi")]


@pytest.mark.parametrize(
    "corpo",
    [
        {"event": "session.status", "payload": {}},
        evento(fromMe=True, body="eco"),
        evento(**{"from": "123@g.us"}, body="grupo"),
        evento(**{"from": "status@broadcast"}, body="status"),
        evento(body="   "),
    ],
)
async def test_ignora_eventos_que_o_agente_nao_deve_responder(cliente, recebidas, corpo):
    await cliente.post("/webhook", json=corpo)

    assert recebidas == []


async def test_json_invalido_retorna_400(cliente):
    resposta = await cliente.post("/webhook", content=b"nao e json")

    assert resposta.status_code == 400


async def test_exige_assinatura_quando_ha_chave_hmac(cliente, recebidas, monkeypatch):
    monkeypatch.setattr(config, "WAHA_WEBHOOK_HMAC_KEY", "segredo")
    corpo = json.dumps(evento(body="oi")).encode()
    assinatura = hmac.new(b"segredo", corpo, hashlib.sha512).hexdigest()

    sem = await cliente.post("/webhook", content=corpo)
    com = await cliente.post("/webhook", content=corpo, headers={"X-Webhook-Hmac": assinatura})

    assert sem.status_code == 401
    assert com.status_code == 200
    assert recebidas == [(CONTATO, "oi")]


async def test_audio_vira_texto_com_marcacao(monkeypatch):
    async def baixar(url):
        return b"bytes"

    async def transcrever(conteudo, formato):
        assert formato == "ogg"
        return "quero marcar corte"

    monkeypatch.setattr(midia, "baixar_midia", baixar)
    monkeypatch.setattr(midia, "transcrever_audio", transcrever)
    mensagem = {"hasMedia": True, "media": {"url": "http://x/a.ogg", "mimetype": "audio/ogg; codecs=opus"}}

    assert await midia.mensagem_para_texto(mensagem) == "[áudio do cliente]: quero marcar corte"


async def test_imagem_inclui_legenda_depois_da_descricao(monkeypatch):
    async def descrever(url, mimetype):
        return "um comprovante de pix"

    monkeypatch.setattr(midia, "descrever_imagem", descrever)
    mensagem = {
        "hasMedia": True,
        "body": "segue",
        "media": {"url": "http://x/i.jpg", "mimetype": "image/jpeg"},
    }

    texto = await midia.mensagem_para_texto(mensagem)

    assert texto == "[imagem enviada pelo cliente]: um comprovante de pix\nsegue"


async def test_arquivo_de_outro_tipo_so_avisa_que_chegou():
    mensagem = {"hasMedia": True, "media": {"url": "http://x/p.zip", "mimetype": "application/zip"}}

    assert await midia.mensagem_para_texto(mensagem) == "[o cliente mandou um arquivo do tipo application/zip]"


async def test_midia_sem_url_nao_derruba_a_conversa():
    mensagem = {"hasMedia": True, "media": {"url": None, "mimetype": "audio/ogg"}}

    texto = await midia.mensagem_para_texto(mensagem)

    assert "não foi possível abrir" in texto


def test_link_do_waha_e_reescrito_para_o_waha_url(monkeypatch):
    monkeypatch.setattr(config, "WAHA_URL", "http://waha:3000")

    assert midia._url_no_waha("http://localhost:3000/api/files/a.jpg") == "http://waha:3000/api/files/a.jpg"
