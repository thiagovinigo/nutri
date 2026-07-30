import { db } from './utils/firebase-admin.js';

/**
 * Envia uma mensagem de volta para o WhatsApp usando a Evolution API.
 */
async function sendMessageToWhatsApp(remoteJid, text) {
  const evolutionUrl = process.env.EVOLUTION_API_URL;
  const instanceName = process.env.EVOLUTION_INSTANCE_NAME;
  const apikey = process.env.EVOLUTION_API_KEY;

  if (!evolutionUrl || !instanceName || !apikey) {
    console.error("Configurações da Evolution API faltando no ambiente.");
    return;
  }

  const endpoint = `${evolutionUrl}/message/sendText/${instanceName}`;
  
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': apikey
      },
      body: JSON.stringify({
        number: remoteJid,
        options: {
          delay: 2000, // delay de 2s para simular digitação e evitar ban
          presence: 'composing' // Mostra "digitando..."
        },
        textMessage: {
          text: text
        }
      })
    });

    if (!response.ok) {
      console.error(`Erro Evolution API: ${response.status} - ${await response.text()}`);
    } else {
      console.log(`Mensagem enviada com sucesso para ${remoteJid}`);
    }
  } catch (error) {
    console.error("Erro ao fazer requisição para Evolution API:", error);
  }
}

/**
 * Processa a mensagem usando OpenAI e mantém contexto no Firestore
 */
export async function processWhatsAppMessage(phoneNumber, patientId, patientData, textContent, remoteJid) {
  const sessionRef = db.collection('whatsapp_sessions').doc(phoneNumber);
  const sessionSnap = await sessionRef.get();
  
  let messagesHistory = [];
  
  if (sessionSnap.exists) {
    messagesHistory = sessionSnap.data().messages || [];
  } else {
    // Inicia a sessão com o prompt de sistema
    const systemPrompt = {
      role: 'system',
      content: `Você é o Nutrivvo Bot, um assistente de nutrição ativo e acolhedor.
Você está falando com o paciente chamado "${patientData.nome}".
O nutricionista responsável por ele já montou o plano alimentar no sistema.
Sua missão é ajudar o paciente a manter a adesão, tirar dúvidas rápidas sobre substituições e registrar o que ele comeu.
Seja conciso (mensagens curtas de WhatsApp, use emojis, linguagem leve).
NUNCA julgue se o paciente furou a dieta, sempre acolha e incentive a voltar ao foco na próxima refeição.`
    };
    messagesHistory.push(systemPrompt);
  }

  // Adiciona a mensagem do usuário ao histórico
  messagesHistory.push({ role: 'user', content: textContent });

  // Poda o histórico para não exceder limites de token (mantém system + últimas 10 msgs)
  if (messagesHistory.length > 11) {
    const system = messagesHistory[0];
    const recent = messagesHistory.slice(messagesHistory.length - 10);
    messagesHistory = [system, ...recent];
  }

  // Chama a OpenAI com ferramentas
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  if (!OPENAI_API_KEY) {
    console.error("OPENAI_API_KEY não definida");
    return;
  }

  try {
    const tools = [
      {
        type: "function",
        function: {
          name: "log_meal",
          description: "Registra uma refeição consumida pelo paciente (dentro ou fora da dieta) no diário dele.",
          parameters: {
            type: "object",
            properties: {
              descricao: { type: "string", description: "O que o paciente comeu" },
              furo_dieta: { type: "boolean", description: "Verdadeiro se o paciente relatar que furou a dieta" }
            },
            required: ["descricao", "furo_dieta"]
          }
        }
      }
    ];

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: messagesHistory,
        tools: tools,
        tool_choice: "auto",
        max_tokens: 500
      })
    });

    const data = await openaiResponse.json();
    const responseMessage = data.choices?.[0]?.message;

    if (!responseMessage) {
      console.error("Resposta inválida da OpenAI:", data);
      return;
    }

    // Processa Function Calling, se houver
    if (responseMessage.tool_calls) {
      for (const toolCall of responseMessage.tool_calls) {
        if (toolCall.function.name === 'log_meal') {
          const args = JSON.parse(toolCall.function.arguments);
          console.log(`[FUNCTION CALL] log_meal chamado para paciente ${patientId}:`, args);
          
          // O bot pode salvar isso no Firestore em uma subcoleção 'diario' do paciente
          await db.collection('patients').doc(patientId).collection('diario').add({
            timestamp: new Date(),
            descricao: args.descricao,
            furo_dieta: args.furo_dieta,
            origem: 'whatsapp'
          });

          // Adiciona a chamada e o resultado ao histórico para a IA continuar
          messagesHistory.push(responseMessage);
          messagesHistory.push({
            role: "tool",
            tool_call_id: toolCall.id,
            name: toolCall.function.name,
            content: "Refeição salva com sucesso no diário do paciente."
          });

          // Chama a IA de novo para ela dar a resposta final ao usuário
          const secondResponse = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
              model: 'gpt-4o-mini',
              messages: messagesHistory,
              max_tokens: 500
            })
          });

          const secondData = await secondResponse.json();
          const finalMessage = secondData.choices?.[0]?.message;
          
          if (finalMessage) {
            messagesHistory.push(finalMessage);
            await sendMessageToWhatsApp(remoteJid, finalMessage.content);
          }
        }
      }
    } else if (responseMessage.content) {
      // Resposta normal de texto
      messagesHistory.push(responseMessage);
      await sendMessageToWhatsApp(remoteJid, responseMessage.content);
    }

    // Atualiza o estado no Firebase
    await sessionRef.set({
      messages: messagesHistory,
      last_interaction: new Date(),
      patientId: patientId
    }, { merge: true });

  } catch (error) {
    console.error("Erro ao chamar OpenAI:", error);
  }
}
