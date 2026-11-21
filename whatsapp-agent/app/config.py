# Carrega o .env e expõe as configurações do projeto - peça CÓDIGO.
import os

from dotenv import load_dotenv

# Carrega antes de qualquer outro módulo ler a chave da OpenAI do ambiente.
load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
MODELO_AGENTE = os.getenv("MODELO_AGENTE", "openai:gpt-4o-mini")
MODELO_MIDIA = os.getenv("MODELO_MIDIA", "gpt-4o-mini")

WAHA_URL = os.getenv("WAHA_URL", "http://localhost:3000").rstrip("/")
WAHA_API_KEY = os.getenv("WAHA_API_KEY", "")
WAHA_WEBHOOK_HMAC_KEY = os.getenv("WAHA_WEBHOOK_HMAC_KEY", "")
SESSAO_WAHA = "default"

BUFFER_SEGUNDOS = float(os.getenv("BUFFER_SEGUNDOS", "2"))
