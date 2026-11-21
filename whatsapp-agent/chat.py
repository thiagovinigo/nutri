# Chat de teste no terminal: conversa com o agente sem precisar do WhatsApp - peça CÓDIGO.
import sys

from app import config  # noqa: F401  (carrega o .env antes do agente)
from app import memory
from app.agent import agent
from app.ritmo import dividir_mensagens


def main() -> None:
    # Console do Windows usa cp1252 e quebra com emoji; força UTF-8 na saída.
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    contato = "pedro"
    print(f"Falando como: {contato}. Use /contato nome para trocar, ou Ctrl+C para sair.")
    while True:
        try:
            texto = input("\nvocê> ").strip()
        except (EOFError, KeyboardInterrupt):
            print()
            return
        if not texto:
            continue
        if texto.startswith("/contato"):
            nome = texto.removeprefix("/contato").strip()
            if nome:
                contato = nome
            print(f"Agora tu tá falando como: {contato}")
            continue

        resultado = agent.run_sync(texto, message_history=memory.pegar_historico(contato))
        memory.salvar_historico(contato, resultado.all_messages())
        for mensagem in dividir_mensagens(resultado.output):
            print(f"bot> {mensagem}")


if __name__ == "__main__":
    main()
