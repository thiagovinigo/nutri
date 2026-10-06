// Escolha do modelo do /api/openai-bridge. Vive em lib/ (fora de api/) pra ser
// testável e pra não contar no limite de 12 Serverless Functions da Vercel.
//
// Fotos: o gpt-4o recusava fotos de comida de forma intermitente
// ("Desculpe, não posso ajudar com isso.") - medido em 05/10/2026 com o prompt do
// check-in do diário: ~30% de recusas (3/8 e 2/8) em duas fotos diferentes, contra
// 0/16 no gpt-4.1, 0/16 no gpt-4.1-mini e 0/16 no gpt-5.4-mini. Requisições só de
// texto continuam no gpt-4o, pra não mudar o comportamento dos outros fluxos.

export const TEXT_MODEL = 'gpt-4o';
export const VISION_MODEL = 'gpt-4.1';

const isImagePart = (part) => part?.type === 'image_url';

/** @param {Array<{ content?: unknown }> | undefined} messages @returns {string} */
export function pickChatModel(messages) {
  const hasImage = Array.isArray(messages)
    && messages.some((message) => Array.isArray(message?.content) && message.content.some(isImagePart));
  return hasImage ? VISION_MODEL : TEXT_MODEL;
}
