/**
 * Motor da Secretária Virtual (IA) - extraído de whatsapp-ai.js pra ser
 * compartilhado entre canais (WhatsApp, Telegram) sem duplicar o prompt/
 * function-calling. Não sabe nada sobre transporte (WhatsApp/Telegram) -
 * quem chama decide como entregar `replyText` pro paciente.
 */
import { FieldValue } from 'firebase-admin/firestore';
import { db } from './firebase-admin.js';

/**
 * Remove o payload base64 de fotos antes de persistir o histórico no
 * Firestore. Uma foto de refeição facilmente passa de 100-500KB em base64,
 * e o Firestore tem limite de 1MiB por documento - guardar isso em toda
 * mensagem do histórico estouraria o limite depois de poucas fotos. A IA já
 * respondeu com base na imagem antes desse ponto, então trocar por um
 * marcador textual não perde nada pro paciente.
 * @param {Array<object>} messages
 * @returns {Array<object>}
 */
function sanitizeForStorage(messages) {
  return messages.map((msg) => {
    if (!Array.isArray(msg?.content)) return msg;
    const textPart = msg.content.find((part) => part.type === 'text')?.text || '';
    return { ...msg, content: `${textPart} [foto anexada]`.trim() };
  });
}

/**
 * Processa uma mensagem recebida do paciente com a IA e persiste o
 * histórico da conversa no Firestore. Não envia a resposta - só retorna o
 * texto final pro chamador entregar no canal certo.
 * @param {string} patientId
 * @param {object} patientData
 * @param {string} textContent
 * @param {string|null} [imageDataUrl] - data URL "data:image/...;base64,..." de uma foto
 *   enviada pelo paciente (ex: foto do prato). Quando presente, a mensagem vai
 *   multimodal pra OpenAI pra IA de fato "ver" a refeição em vez de só receber texto/legenda.
 * @returns {Promise<string|null>} texto da resposta, ou null se o bot está pausado/erro
 */
export async function runSecretariaVirtual(patientId, patientData, textContent, imageDataUrl = null) {
  const sessionRef = db.collection('patients').doc(patientId);
  const sessionSnap = await sessionRef.get();

  let messagesHistory = [];

  if (sessionSnap.exists && sessionSnap.data().whatsapp_messages) {
    messagesHistory = sessionSnap.data().whatsapp_messages || [];
  } else {
    const dietPlan = patientData.recipes ? JSON.stringify(patientData.recipes) : 'Nenhum plano alimentar cadastrado ainda.';
    const objective = patientData.objective || 'Não informado';
    const restrictions = patientData.restrictions || 'Nenhuma restrição informada';

    const systemPrompt = {
      role: 'system',
      content: `Você é o Nutrivvo Bot, um assistente de nutrição ativo, acolhedor e altamente empático (Secretária Virtual e Detetive Comportamental).
Você está falando com o paciente chamado "${patientData.name}".
O nutricionista responsável por ele já montou o plano alimentar no sistema.

DIRETRIZES DE COMPORTAMENTO E TOM DE VOZ:
- Seja extremamente empático, humano e motivador.
- Use mensagens curtas (formato chat), separe parágrafos e use emojis com moderação.
- NUNCA julgue se o paciente furou a dieta. Sempre o acolha, valide o sentimento e incentive a voltar ao foco na próxima refeição ("Tá tudo bem! O importante é a constância, vamos focar na próxima refeição! 🥗").
- Fale de forma simples, evitando jargões técnicos complexos.

LIMITES MÉDICOS E ÉTICOS (GUARDRAILS):
- VOCÊ NÃO É MÉDICO. Nunca diagnostique doenças, não prescreva ou altere suplementos/remédios.
- Se o paciente relatar dor forte, sintomas médicos graves, instrua-o a procurar um médico imediatamente e avise que o nutricionista avaliará o caso.
- Você não pode alterar a estrutura calórica ou macros do plano alimentar.
- Sua função é tirar dúvidas de substituição alimentar, apoiar a adesão e agendar consultas.

DADOS DO PACIENTE:
- Objetivo: ${objective}
- Restrições/Alergias: ${restrictions}
- Plano Alimentar Atual: ${dietPlan}

INSTRUÇÕES DE AÇÃO (FERRAMENTAS):
1. 'log_meal': SEMPRE que o paciente relatar o que comeu (seja na dieta ou um furo). Se não estiver claro qual refeição é (café da manhã, almoço, lanche, jantar, ceia), PERGUNTE antes de registrar - não assuma.
2. 'alertar_nutricionista': Se o paciente demonstrar desânimo extremo, intenção de desistir, compulsão alimentar repetitiva, ou não estiver se hidratando/dormindo, USE esta ferramenta para alertar o nutricionista (Isso marca o paciente como 'Em Risco'). Não avise o paciente que acionou o alerta, apenas seja acolhedor.
3. 'verificar_disponibilidade': Se o paciente quiser marcar consulta, use isso para checar os dias/horários livres do nutricionista.
4. 'agendar_consulta': Após confirmar o dia e hora com o paciente e verificar que está livre, use esta ferramenta para agendar no sistema. Lembre-se: se falhar por conflito, avise o paciente e peça outro horário.
5. Se o paciente enviar uma FOTO da refeição, você VÊ a imagem diretamente. Descreva o que identifica no prato (alimentos, porção aproximada) de forma natural e acolhedora, e chame 'log_meal' com a descrição baseada no que você viu na foto - nunca peça pro paciente descrever em texto o que já está visível na imagem.`
    };
    messagesHistory.push(systemPrompt);
  }

  messagesHistory.push(
    imageDataUrl
      ? {
          role: 'user',
          content: [
            { type: 'text', text: textContent || 'Aqui está a foto da minha refeição.' },
            { type: 'image_url', image_url: { url: imageDataUrl } }
          ]
        }
      : { role: 'user', content: textContent }
  );

  // Poda o histórico para não exceder limites de token (mantém system + últimas 10 msgs)
  if (messagesHistory.length > 11) {
    const system = messagesHistory[0];
    const recent = messagesHistory.slice(messagesHistory.length - 10);
    messagesHistory = [system, ...recent];
  }

  // Verifica se o bot está pausado para atendimento humano (Human Handoff)
  const isBotPaused = sessionSnap.exists && sessionSnap.data().bot_paused === true;

  if (isBotPaused) {
    console.log(`Bot pausado para o paciente ${patientId}. Salvando mensagem e encerrando.`);
    await sessionRef.set({
      whatsapp_messages: sanitizeForStorage(messagesHistory),
      last_interaction: new Date(),
      bot_paused: true
    }, { merge: true });
    return null;
  }

  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  if (!OPENAI_API_KEY) {
    console.error("OPENAI_API_KEY não definida");
    return null;
  }

  try {
    const tools = [
      {
        type: "function",
        function: {
          name: "log_meal",
          description: "Registra uma refeição consumida pelo paciente (dentro ou fora da dieta) no diário alimentar dele - aparece no app do paciente e no CRM do nutricionista.",
          parameters: {
            type: "object",
            properties: {
              descricao: { type: "string", description: "O que o paciente comeu" },
              refeicao: { type: "string", description: "Qual refeição é essa: Café da Manhã, Almoço, Lanche da Tarde, Jantar, Ceia ou Refeição Livre (se não se encaixar em nenhuma das anteriores)" },
              furo_dieta: { type: "boolean", description: "Verdadeiro se o paciente relatar que furou a dieta" }
            },
            required: ["descricao", "refeicao", "furo_dieta"]
          }
        }
      },
      {
        type: "function",
        function: {
          name: "alertar_nutricionista",
          description: "Alerta o nutricionista que o paciente está com problemas (risco de abandono, compulsão, estresse grave). Marca o paciente como 'Em Risco' no CRM.",
          parameters: {
            type: "object",
            properties: {
              motivo: { type: "string", description: "O motivo detalhado do alerta (ex: paciente relata que comeu 3 pizzas, está muito ansioso)" }
            },
            required: ["motivo"]
          }
        }
      },
      {
        type: "function",
        function: {
          name: "verificar_disponibilidade",
          description: "Verifica os horários de atendimento do nutricionista para um dia específico.",
          parameters: {
            type: "object",
            properties: {
              data: { type: "string", description: "Data no formato YYYY-MM-DD" }
            },
            required: ["data"]
          }
        }
      },
      {
        type: "function",
        function: {
          name: "agendar_consulta",
          description: "Agenda uma consulta para o paciente no sistema.",
          parameters: {
            type: "object",
            properties: {
              data: { type: "string", description: "Data no formato YYYY-MM-DD" },
              hora: { type: "string", description: "Horário no formato HH:MM" },
              tipo: { type: "string", description: "Tipo de consulta (ex: Retorno, Primeira Consulta)" }
            },
            required: ["data", "hora", "tipo"]
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
      return null;
    }

    let finalText = null;

    if (responseMessage.tool_calls) {
      messagesHistory.push(responseMessage);

      for (const toolCall of responseMessage.tool_calls) {
        if (toolCall.function.name === 'log_meal') {
          const args = JSON.parse(toolCall.function.arguments);
          console.log(`[FUNCTION CALL] log_meal chamado para paciente ${patientId}`);

          // Grava no MESMO campo/formato que o app do paciente (QuestBoard -
          // "Diário Livre") e o CRM (Diário Alimentar) já leem - patients/{id}
          // .foodLogs, um array com {date, time, mealName, log} em pt-BR
          // (ver addExtraMealLog em AppContext.jsx). A versão anterior gravava
          // numa subcoleção "diario" que nenhuma tela do app lê - o paciente
          // via a IA dizer "registrei" mas a refeição nunca aparecia.
          const now = new Date();
          const logText = args.furo_dieta ? `⚠️ Fora do planejado: ${args.descricao}` : `✅ ${args.descricao}`;
          await db.collection('patients').doc(patientId).update({
            foodLogs: FieldValue.arrayUnion({
              id: `food-${now.getTime()}`,
              type: 'extra',
              date: now.toLocaleDateString('pt-BR'),
              time: now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
              mealName: args.refeicao || 'Refeição Livre',
              log: logText
            })
          });

          messagesHistory.push({
            role: "tool",
            tool_call_id: toolCall.id,
            name: toolCall.function.name,
            content: "Refeição salva com sucesso no diário do paciente."
          });
        } else if (toolCall.function.name === 'alertar_nutricionista') {
          const args = JSON.parse(toolCall.function.arguments);
          console.log(`[FUNCTION CALL] alertar_nutricionista chamado para paciente ${patientId}`);

          await db.collection('patients').doc(patientId).update({
            status: 'Em Risco',
            riskReason: `Alerta da IA (${new Date().toLocaleDateString()}): ${args.motivo}`
          });

          messagesHistory.push({
            role: "tool",
            tool_call_id: toolCall.id,
            name: toolCall.function.name,
            content: "Nutricionista alertado com sucesso. O paciente foi marcado como 'Em Risco'."
          });
        } else if (toolCall.function.name === 'verificar_disponibilidade') {
          const args = JSON.parse(toolCall.function.arguments);
          console.log(`[FUNCTION CALL] verificar_disponibilidade chamado para data ${args.data}`);

          const appointmentsSnap = await db.collection('appointments')
            .where('date', '==', args.data)
            .where('status', 'in', ['Agendado', 'Confirmado'])
            .get();

          const horariosOcupados = appointmentsSnap.docs.map(d => d.data().time);

          messagesHistory.push({
            role: "tool",
            tool_call_id: toolCall.id,
            name: toolCall.function.name,
            content: `Horários ocupados neste dia: ${horariosOcupados.length > 0 ? horariosOcupados.join(', ') : 'Nenhum horário ocupado'}. Os horários de atendimento padrão são de 08:00 às 18:00. Use o bom senso para sugerir horários disponíveis nessa faixa.`
          });
        } else if (toolCall.function.name === 'agendar_consulta') {
          const args = JSON.parse(toolCall.function.arguments);
          console.log(`[FUNCTION CALL] agendar_consulta chamado para paciente ${patientId}:`, args);

          const checkSnap = await db.collection('appointments')
            .where('date', '==', args.data)
            .where('time', '==', args.hora)
            .where('status', 'in', ['Agendado', 'Confirmado'])
            .get();

          if (!checkSnap.empty) {
            messagesHistory.push({
              role: "tool",
              tool_call_id: toolCall.id,
              name: toolCall.function.name,
              content: "Erro: Esse horário já está ocupado por outro agendamento. Peça para o paciente escolher outro horário livre."
            });
          } else {
            await db.collection('appointments').add({
              patientId: patientId,
              patientName: patientData.name,
              date: args.data,
              time: args.hora,
              type: args.tipo || 'Retorno',
              status: 'Agendado',
              notes: 'Agendado automaticamente pela Secretária Virtual (IA)',
              createdAt: new Date().toISOString()
            });

            messagesHistory.push({
              role: "tool",
              tool_call_id: toolCall.id,
              name: toolCall.function.name,
              content: "Consulta agendada com sucesso no sistema. Avise o paciente."
            });
          }
        }
      }

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
        finalText = finalMessage.content;
      }
    } else if (responseMessage.content) {
      messagesHistory.push(responseMessage);
      finalText = responseMessage.content;
    }

    await sessionRef.set({
      whatsapp_messages: sanitizeForStorage(messagesHistory),
      last_interaction: new Date()
    }, { merge: true });

    return finalText;
  } catch (error) {
    console.error("Erro ao chamar OpenAI:", error);
    return null;
  }
}
