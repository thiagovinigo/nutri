// A resposta de erro de /api/openai-bridge nem sempre é JSON: a Vercel pode
// devolver texto puro (ex: "Request Entity Too Large" em 413, ou um timeout em
// 504) antes mesmo da função serverless rodar. Este helper lê o corpo com
// segurança e sempre lança um Error com a causa real, em vez de uma mensagem
// genérica que esconde o problema.
const FRIENDLY_STATUS_MESSAGES = {
  413: 'O conteúdo enviado é grande demais para a IA processar. Tente reduzir o texto ou os anexos.',
  429: 'A IA está recebendo muitas requisições agora. Aguarde um instante e tente novamente.',
  504: 'A IA demorou demais para responder (timeout). Tente novamente ou reduza a complexidade do pedido.',
};

export async function callOpenAIBridge(payload) {
  const response = await fetch('/api/openai-bridge', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const rawText = await response.text();
    let message = FRIENDLY_STATUS_MESSAGES[response.status] || `Erro na API da IA (status ${response.status}).`;
    try {
      const errData = JSON.parse(rawText);
      message = errData.error?.message || message;
    } catch {
      if (rawText) message = `${message} Detalhe: ${rawText.slice(0, 150)}`;
    }
    console.error('Erro na OpenAI Bridge:', response.status, rawText);
    throw new Error(message);
  }

  return response.json();
}
