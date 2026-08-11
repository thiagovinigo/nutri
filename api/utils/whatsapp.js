/**
 * Utilitarios compartilhados de envio via WhatsApp (Evolution API).
 * Extraido de send-whatsapp.js / cron-reminders.js / whatsapp-ai.js, que
 * duplicavam a mesma normalizacao de DDI e o mesmo fetch de sendText.
 */

/**
 * Normaliza um telefone salvo sem DDI (ex: "41988743347", formato usado
 * em SignUp.jsx/Profile.jsx) para o formato completo com DDI 55 exigido
 * pela Evolution API para rotear a mensagem.
 * @param {string} phone
 * @returns {string} dígitos apenas, sempre com DDI 55 na frente
 */
export function normalizePhoneWithDDI(phone) {
  const digitsOnly = String(phone || '').replace(/\D/g, '');
  const withDDI = digitsOnly.startsWith('55') ? digitsOnly : `55${digitsOnly}`;

  // Celular BR completo com DDI = 55 (2) + DDD (2) + 9 (1) + numero (8) = 13 digitos.
  // Numeros salvos sem o 9º digito (comum em cadastros antigos/importados)
  // ficam com 12 digitos - a Evolution API entrega pro JID errado nesse caso
  // (foi o que causou o codigo de verificacao nao chegar em 11/08/2026).
  // Insere o 9 antes do numero de 8 digitos quando detecta esse padrão.
  if (withDDI.length === 12) {
    const ddd = withDDI.slice(2, 4);
    const numero = withDDI.slice(4);
    return `55${ddd}9${numero}`;
  }

  return withDDI;
}

/**
 * Envia uma mensagem de texto via Evolution API.
 * @param {string} remoteJid - numero completo com DDI, ex: "5541988743347@s.whatsapp.net"
 * @param {string} text
 * @returns {Promise<boolean>} true se a Evolution API aceitou o envio
 */
export async function sendWhatsAppText(remoteJid, text) {
  const evolutionUrl = process.env.EVOLUTION_API_URL;
  const instanceName = process.env.EVOLUTION_INSTANCE_NAME;
  const apikey = process.env.EVOLUTION_API_KEY;

  if (!evolutionUrl || !instanceName || !apikey) {
    console.error('Configurações da Evolution API faltando no ambiente.');
    return false;
  }

  const endpoint = `${evolutionUrl}/message/sendText/${instanceName}`;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: apikey
      },
      // Esta versao da Evolution API (v2.3.7) espera "text" direto na raiz
      // do payload, nao aninhado em "textMessage.text" (formato de versoes
      // antigas/outras builds) - confirmado testando direto contra a API.
      body: JSON.stringify({
        number: remoteJid,
        text: text,
        delay: 1500
      })
    });

    if (!response.ok) {
      console.error(`Erro Evolution API: ${response.status} - ${await response.text()}`);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Erro ao fazer requisição para Evolution API:', error);
    return false;
  }
}
