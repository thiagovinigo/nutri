// Recusa de política do modelo de visão (gpt-4o), tipicamente quando a foto tem
// pessoas, rostos ou conteúdo que ele considera sensível. Vem como resposta 200
// com um texto curto de recusa, não como erro HTTP - e antes era gravada pelo
// app como se fosse a análise da refeição (e ainda dava XP ao paciente).
//
// Só frases de recusa de POLÍTICA entram aqui. "Não consigo reconhecer os
// ingredientes" é uma resposta útil (foto ruim) e continua sendo mostrada.
const MAX_REFUSAL_LENGTH = 120;
const REFUSAL_PATTERNS = [
  /^(desculpe|sinto muito|lamento)[,.!]?\s+(mas\s+)?(eu\s+)?n[aã]o\s+(posso|consigo)\s+(te\s+)?(ajudar|auxiliar|atender)\b/i,
  /^(i'?m sorry|sorry|i apologi[sz]e)[,.!]?\s+(but\s+)?i\s+(can'?t|cannot|can not)\s+(assist|help)\b/i,
];

export const IMAGE_REFUSAL_MESSAGE =
  'A IA não conseguiu analisar essa foto (ela costuma recusar imagens com pessoas, rostos ou conteúdo sensível). '
  + 'Tente uma foto só do prato ou dos alimentos, bem iluminada e sem pessoas.';

/** @param {unknown} text resposta da IA @returns {boolean} */
export function isModelRefusal(text) {
  if (typeof text !== 'string') return false;
  const trimmed = text.trim();
  if (!trimmed || trimmed.length > MAX_REFUSAL_LENGTH) return false;
  return REFUSAL_PATTERNS.some((pattern) => pattern.test(trimmed));
}

/** @param {{ messages?: Array<{ content?: unknown }> } | null | undefined} payload @returns {boolean} */
export function hasImageInput(payload) {
  const messages = payload?.messages;
  if (!Array.isArray(messages)) return false;
  return messages.some(
    (message) => Array.isArray(message?.content) && message.content.some((part) => part?.type === 'image_url')
  );
}
