# Regras de Verificação de Qualidade (Quality Gate)

**Contexto:** O projeto Nutri é um CRM complexo em React. Erros de sintaxe ou variáveis não definidas quebram a interface do usuário (tela branca).

**Regra Obrigatória para o Agente:**
1. **Sempre valide o código (Quality Gate):** Antes de finalizar qualquer alteração em arquivos React (`.jsx` ou `.js`), você **DEVE** rodar o comando `npm run build`.
2. **Zero Tolerância a Erros:** Se o comando de build falhar com erros de sintaxe ou variáveis não definidas, você não deve finalizar o turno. Corrija o código e rode `npm run build` novamente.
3. **Teste Local Antes do Deploy (PROIBIDO PUSH DIRETO):** Mesmo que o build passe, o agente **NUNCA** deve fazer `git push` para a branch `main` (produção) sem antes convidar o usuário para testar e validar as mudanças localmente (`npm run dev`). O deploy para produção só deve ser executado mediante autorização explícita do usuário após o teste visual/funcional.
4. **Prevenção de Tela Branca e Regressões:** O build técnico somado à validação humana local garante que a chance de bugs ou quebra de fluxo em produção caia para quase zero.
