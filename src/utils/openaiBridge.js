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
  // Timeout no cliente: mesmo que a rede trave em algum ponto entre o
  // navegador e a Vercel (proxy, CDN etc.), a UI não deve ficar presa em
  // "Analisando..." pra sempre — deve sempre virar um erro visível.
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 130000);

  let response;
  try {
    response = await fetch('/api/openai-bridge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('A IA demorou demais para responder. Tente novamente ou reduza a duração/complexidade do pedido.');
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }

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
