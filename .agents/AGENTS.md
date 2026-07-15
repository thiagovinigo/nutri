# Regras de Verificação de Qualidade (Quality Gate)

**Contexto:** O projeto Nutri é um CRM complexo em React. Erros de sintaxe ou variáveis não definidas quebram a interface do usuário (tela branca).

**Regra Obrigatória para o Agente:**
1. **Sempre valide o código:** Antes de finalizar qualquer alteração em arquivos React (`.jsx` ou `.js`) e dizer que a tarefa foi concluída, você **DEVE** rodar o comando `npm run build` usando a sua ferramenta de terminal.
2. **Zero Tolerância a Erros:** Se o comando de build falhar com erros de sintaxe ou variáveis não definidas, você não deve finalizar o turno. Você deve corrigir o código e rodar `npm run build` novamente.
3. **Prevenção de Tela Branca:** O build é o nosso validador oficial. Se o build passa, a chance de erro de sintaxe/tela branca em produção cai para quase zero.
