/**
 * Limites e fechamento limpo das respostas da IA (Secretária Virtual).
 *
 * Achado em 21/11/2026 (captura do usuário no WhatsApp): uma receita saiu
 * cortada no meio da frase ("Cozinhar a Batata-Doce: Descasque e corte").
 * Causa: a receita era gerada com max_tokens 600 e a resposta final com 500 -
 * uma receita completa (ou duas) passa disso. O texto cortado ainda era salvo
 * no app como a receita do paciente. Aqui ficam os novos orçamentos e o
 * tratamento do caso em que, mesmo assim, o limite é atingido.
 *
 * Lógica PURA (sem rede), testável sem credenciais.
 */

/** Orçamento de tokens da geração de uma receita (ingredientes + modo de preparo). */
export const MAX_RECIPE_TOKENS = 1500;

/** Orçamento de tokens da resposta ao paciente (reapresenta receitas, planos, listas). */
export const MAX_REPLY_TOKENS = 1500;

export const TRUNCATION_NOTICE = '(A resposta ficou longa e foi cortada aqui. Me peça "continua" que eu mando o resto.)';

/**
 * Se a OpenAI parou por limite de tokens (finish_reason "length"), o texto
 * termina no meio de uma frase. Descarta a linha (ou frase) incompleta e avisa o
 * paciente como pedir o resto, em vez de entregar uma resposta quebrada.
 * @param {string|null|undefined} text
 * @param {string|undefined} finishReason - choices[0].finish_reason da OpenAI
 * @returns {string|null|undefined}
 */
export function closeTruncatedReply(text, finishReason) {
  if (typeof text !== 'string' || finishReason !== 'length') return text;

  const trimmed = text.trimEnd();
  if (!trimmed) return TRUNCATION_NOTICE;

  let kept = trimmed;
  const lastLineBreak = trimmed.lastIndexOf('\n');
  if (lastLineBreak > 0) {
    kept = trimmed.slice(0, lastLineBreak);
  } else {
    const lastSentence = /^[\s\S]*[.!?](?=\s|$)/.exec(trimmed);
    if (lastSentence) kept = lastSentence[0];
  }

  return `${kept.trimEnd()}\n\n${TRUNCATION_NOTICE}`;
}
