import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true 
});

export const analyzeFoodImage = async (base64Image, objective) => {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "user",
        content: [
          { 
            type: "text", 
            text: `Você é um avaliador nutricional gamificado. Analise este prato: 1) Liste rapidamente os ingredientes visíveis. 2) Dê um chute educado do peso total estimado em gramas. 3) Diga se é uma escolha adequada considerando que o objetivo do paciente é: ${objective}. Mantenha um tom muito animado, encorajador e conciso (máximo de 3 frases), como o mascote do Duolingo faria.` 
          },
          { type: "image_url", image_url: { url: base64Image } }
        ]
      }
    ]
  });
  return response.choices[0].message.content;
};

export const generateDiet = async (name, objective, restrictions, examsSummary) => {
  const prompt = `Como um nutricionista experiente, gere 3 opções de cardápio (Café da Manhã, Almoço, Jantar e Lanches) para um paciente com as seguintes características:
Nome: ${name}
Objetivo: ${objective}
Restrições: ${restrictions || 'Nenhuma'}
Resumo de Exames Recentes: ${examsSummary || 'Nenhum exame analisado'}

Sua resposta deve ser estritamente em formato JSON, seguindo este formato:
{
  "opcoes": [
    {
      "titulo": "Opção 1",
      "refeicoes": [
        {"nome": "Café da manhã", "itens": ["item 1", "item 2"]}
      ]
    }
  ]
}`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: "Você é um gerador de dietas profissionais em JSON." },
      { role: "user", content: prompt }
    ]
  });

  return JSON.parse(response.choices[0].message.content);
};
