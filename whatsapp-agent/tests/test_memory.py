import pytest
from pydantic_ai.messages import ModelRequest, ModelResponse, TextPart, UserPromptPart

from app import memory


@pytest.fixture(autouse=True)
def pasta_temporaria(tmp_path, monkeypatch):
    monkeypatch.setattr(memory, "PASTA", tmp_path / "historico")


def pergunta(texto: str) -> ModelRequest:
    return ModelRequest(parts=[UserPromptPart(content=texto)])


def resposta(texto: str) -> ModelResponse:
    return ModelResponse(parts=[TextPart(content=texto)])


def conversa(turnos: int):
    mensagens = []
    for i in range(turnos):
        mensagens += [pergunta(f"p{i}"), resposta(f"r{i}")]
    return mensagens


def test_contato_novo_tem_historico_vazio():
    assert memory.pegar_historico("pedro") == []


def test_salva_e_recupera_o_historico_do_contato():
    memory.salvar_historico("pedro", conversa(1))

    recuperado = memory.pegar_historico("pedro")

    assert [type(m) for m in recuperado] == [ModelRequest, ModelResponse]
    assert recuperado[0].parts[0].content == "p0"


def test_contatos_diferentes_nao_misturam_historico():
    memory.salvar_historico("pedro", conversa(1))

    assert memory.pegar_historico("maria") == []


def test_limita_a_vinte_mensagens():
    memory.salvar_historico("pedro", conversa(30))

    assert len(memory.pegar_historico("pedro")) == memory.LIMITE_MENSAGENS


def test_historico_cortado_sempre_comeca_numa_mensagem_do_cliente():
    # 21 mensagens: o corte nas últimas 20 deixaria uma resposta do agente na frente.
    mensagens = conversa(10) + [pergunta("extra")]

    memory.salvar_historico("pedro", mensagens)

    primeira = memory.pegar_historico("pedro")[0]
    assert isinstance(primeira, ModelRequest)


def test_identificador_com_caracteres_perigosos_nao_escapa_da_pasta():
    memory.salvar_historico("../../fora@c.us", conversa(1))

    arquivos = list(memory.PASTA.glob("*.json"))
    assert len(arquivos) == 1
    assert arquivos[0].parent == memory.PASTA


def test_identificador_vazio_e_rejeitado():
    with pytest.raises(ValueError):
        memory.pegar_historico("..")


def test_arquivo_corrompido_vira_conversa_nova():
    memory.salvar_historico("pedro", conversa(1))
    (memory.PASTA / "pedro.json").write_text("isso não é json", encoding="utf-8")

    assert memory.pegar_historico("pedro") == []
