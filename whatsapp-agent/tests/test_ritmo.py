import asyncio
from datetime import datetime
from types import SimpleNamespace

import pytest

from app import agent as agente_modulo
from app import config, memory, ritmo


def test_divide_nas_linhas_em_branco():
    assert ritmo.dividir_mensagens("oi\n\ntudo bem?") == ["oi", "tudo bem?"]


def test_remove_markdown_e_descarta_pedacos_vazios():
    texto = "**oi**\n\n\n\n`corte` por R$ 50\n\n   \n\n# título"
    assert ritmo.dividir_mensagens(texto) == ["oi", "corte por R$ 50", "título"]


def test_junta_o_que_passar_de_tres_na_terceira():
    assert ritmo.dividir_mensagens("a\n\nb\n\nc\n\nd\n\ne") == ["a", "b", "c\nd\ne"]


def test_texto_vazio_nao_gera_mensagens():
    assert ritmo.dividir_mensagens("  \n\n ") == []


def test_tempo_de_digitacao_proporcional_e_limitado():
    assert ritmo.tempo_de_digitacao("x" * 25) == pytest.approx(2.0)
    assert ritmo.tempo_de_digitacao("x" * 1000) == 8.0


def test_descreve_data_em_portugues():
    texto = agente_modulo.descrever_agora(datetime(2026, 11, 21, 9, 30))
    assert texto == "Agora é sábado, 21 de novembro de 2026, 09:30 (horário de São Paulo)."


@pytest.fixture
def ambiente(monkeypatch, tmp_path):
    """Troca WhatsApp e agente por falsos e acelera o buffer."""
    eventos: list[tuple] = []

    def falso(nome):
        async def chamada(chat_id, *resto):
            eventos.append((nome, chat_id, *resto))

        return chamada

    class AgenteFalso:
        def __init__(self):
            self.chamadas: list[str] = []

        async def run(self, texto, message_history):
            self.chamadas.append(texto)
            return SimpleNamespace(output="oi!\n\ntudo bem?", all_messages=lambda: [])

    agente = AgenteFalso()
    monkeypatch.setattr(ritmo.whatsapp, "enviar_mensagem", falso("enviar"))
    monkeypatch.setattr(ritmo.whatsapp, "marcar_como_lida", falso("lida"))
    monkeypatch.setattr(ritmo.whatsapp, "comecar_digitando", falso("digitando"))
    monkeypatch.setattr(ritmo.whatsapp, "parar_digitando", falso("parou"))
    monkeypatch.setattr(ritmo, "agent", agente)
    monkeypatch.setattr(memory, "PASTA", tmp_path / "historico")
    monkeypatch.setattr(config, "BUFFER_SEGUNDOS", 0.05)
    monkeypatch.setattr(ritmo, "SEGUNDOS_BASE", 0.0)
    monkeypatch.setattr(ritmo, "SEGUNDOS_POR_CARACTERE", 0.0)
    return SimpleNamespace(eventos=eventos, agente=agente)


async def esperar_tarefas():
    while ritmo._tarefas_em_andamento:
        await asyncio.gather(*list(ritmo._tarefas_em_andamento), return_exceptions=True)


async def test_juntam_mensagens_picadas_numa_chamada_so(ambiente):
    await ritmo.adicionar("5541@c.us", "oi")
    await ritmo.adicionar("5541@c.us", "quanto tá o corte?")
    await esperar_tarefas()

    assert ambiente.agente.chamadas == ["oi\nquanto tá o corte?"]


async def test_ordem_visto_digitando_e_mensagens_curtas(ambiente):
    await ritmo.adicionar("5541@c.us", "oi")
    await esperar_tarefas()

    nomes = [e[0] for e in ambiente.eventos]
    assert nomes[:2] == ["lida", "digitando"]
    enviados = [e[2] for e in ambiente.eventos if e[0] == "enviar"]
    assert enviados == ["oi!", "tudo bem?"]
    assert nomes.index("parou") < nomes.index("enviar")


async def test_mensagem_durante_a_resposta_espera_a_vez(ambiente):
    await ritmo.adicionar("5541@c.us", "primeira")
    await asyncio.sleep(0.15)  # buffer fechou; a resposta já começou
    await ritmo.adicionar("5541@c.us", "segunda")
    await esperar_tarefas()

    assert ambiente.agente.chamadas == ["primeira", "segunda"]
