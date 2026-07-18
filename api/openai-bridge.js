export const config = {
  api: {
    bodyParser: {
      sizeLimit: '50mb',
    },
  },
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
      max_tokens: 400
    };

    if (format_json) {
      requestBody.response_format = { type: 'json_object' };
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    console.error("Erro na OpenAI API Bridge:", error);
    res.status(500).json({ error: error.message });
  }
}
