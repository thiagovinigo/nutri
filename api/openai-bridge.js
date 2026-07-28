export const config = {
  api: {
    bodyParser: {
      sizeLimit: '50mb',
    },
  },
  // Planos de dieta longos (ex: 7 dias, 42 refeições com receitas completas)
  // podem legitimamente levar mais que o limite padrão da Vercel (10s no
  // Hobby) só pra gerar a resposta da OpenAI — sem isso a função é morta
  // no meio e o cliente fica esperando um 504 que nunca chega a tempo.
  maxDuration: 120,
};

export default async function handler(req, res) {
  // CORS Headers para requisições de outras origens (caso necessário)
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { messages, system_prompt, format_json } = req.body;
    
    // Obter chave da OpenAI dos Environment Variables da Vercel
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    
    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not defined in Vercel Environment Variables");
    }

    const requestBody = {
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: system_prompt || 'Você é um assistente.' },
        ...messages
      ],
      max_tokens: 15000
    };

    if (format_json) {
      requestBody.response_format = { type: 'json_object' };
    }

    // Timeout próprio, abaixo do maxDuration da função: se a OpenAI travar,
    // preferimos responder com um erro claro em vez de deixar a Vercel matar
    // a função no meio e o cliente ficar esperando indefinidamente.
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 110000);

    let response;
    try {
      response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeoutId);
    }

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    console.error("Erro na OpenAI API Bridge:", error);
    if (error.name === 'AbortError') {
      return res.status(504).json({ error: { message: 'A IA demorou demais para responder (timeout interno). Tente novamente ou reduza a duração do plano.' } });
    }
    res.status(500).json({ error: error.message });
  }
}
