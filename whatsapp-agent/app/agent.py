# Define o agente PydanticAI, o modelo e as instruções - peça LLM.
from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo

from pydantic_ai import Agent

from app import config

SYSTEM_PROMPT = (Path(__file__).resolve().parent.parent / "prompts" / "system_prompt.md").read_text(
    encoding="utf-8"
)

DIAS_DA_SEMANA = [
    "segunda-feira", "terça-feira", "quarta-feira", "quinta-feira",
    "sexta-feira", "sábado", "domingo",
]
MESES = [
    "janeiro", "fevereiro", "março", "abril", "maio", "junho",
    "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
]

# defer_model_check: só exige a chave da OpenAI na hora de rodar, não ao importar.
agent = Agent(config.MODELO_AGENTE, instructions=SYSTEM_PROMPT, defer_model_check=True)


def descrever_agora(agora: datetime) -> str:
    return (
        f"Agora é {DIAS_DA_SEMANA[agora.weekday()]}, {agora.day} de {MESES[agora.month - 1]} "
        f"de {agora.year}, {agora:%H:%M} (horário de São Paulo)."
    )


@agent.instructions
def data_e_hora_de_hoje() -> str:
    return descrever_agora(datetime.now(ZoneInfo("America/Sao_Paulo")))
