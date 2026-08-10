import { db } from './utils/firebase-admin.js';
import { processWhatsAppMessage } from './whatsapp-ai.js';

export const config = {
  api: {
    bodyParser: true,
  },
};

export default async function handler(req, res) {
  // 1. Validação de Método e Segurança
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // (Opcional) Validar um token/header para garantir que a request vem da SUA Evolution API
  const webhookSecret = process.env.WEBHOOK_SECRET;
  if (webhookSecret && req.headers['authorization'] !== `Bearer ${webhookSecret}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // 2. Extração de Dados da Evolution API
  try {
    const payload = req.body;
    
    // Ignorar eventos que não sejam novas mensagens recebidas
    if (payload.event !== 'messages.upsert') {
      return res.status(200).send('Event ignored');
    }

    const messageData = payload.data?.message;
    const isFromMe = payload.data?.key?.fromMe;
    
    // Ignora mensagens enviadas pelo próprio bot ou mensagens de sistema vazias
    if (isFromMe || !messageData) {
      return res.status(200).send('Ignored self message');
    }

    const remoteJid = payload.data?.key?.remoteJid; // Formato: 5511999999999@s.whatsapp.net
    if (!remoteJid || remoteJid.includes('@g.us')) {
      // Ignorar mensagens de grupos por enquanto
      return res.status(200).send('Ignored group message');
    }

    let phoneNumber = remoteJid.split('@')[0];
    // Numeros brasileiros chegam com o DDI 55 (ex: 5541988743347), mas o app
    // salva o telefone do paciente sem DDI (ex: 41988743347) - ver SignUp.jsx/Profile.jsx.
    // Sem essa normalizacao a busca abaixo nunca encontra o paciente.
    if (phoneNumber.startsWith('55') && (phoneNumber.length === 12 || phoneNumber.length === 13)) {
      phoneNumber = phoneNumber.slice(2);
    }
    
    // A mensagem pode vir em diferentes formatos no WhatsApp (texto simples, texto com imagem, etc)
    const textContent = 
      messageData.conversation || 
      messageData.extendedTextMessage?.text || 
      messageData.imageMessage?.caption || 
      '';

    if (!textContent && !messageData.imageMessage) {
      return res.status(200).send('No text or image content');
    }

    // Retornamos 200 OK imediatamente para a Evolution API não dar timeout ou ficar re-enviando
    res.status(200).json({ status: 'received' });

    // 3. Busca do Paciente no Banco
    // Nota: Como estamos numa função serverless assíncrona que acabou de fechar a 'res',
    // a Vercel pode matar a execução. Para garantir execução em background,
    // seria ideal usar Vercel Inngest, Upstash QStash, ou chamar via fetch internamente sem await.
    // Mas para testes, rodar a promessa solta pode funcionar dependendo da configuração.
    
    (async () => {
      try {
        console.log(`Buscando paciente com telefone: ${phoneNumber}`);
        // Normaliza a busca (se o formato salvo tiver + ou DDD diferente, pode precisar de regex)
        const patientsRef = db.collection('patients');
        const snapshot = await patientsRef.where('phone', '==', phoneNumber).limit(1).get();
        
        let patientId = null;
        let patientData = null;

        if (!snapshot.empty) {
          const doc = snapshot.docs[0];
          patientId = doc.id;
          patientData = doc.data();
          console.log(`Paciente encontrado: ${patientData.name} (${patientId})`);
        } else {
          console.log(`Telefone ${phoneNumber} não encontrado na base de pacientes.`);
          // Podemos decidir responder "Desculpe, seu número não está cadastrado"
          // Mas por segurança contra spam, é melhor ignorar.
          return;
        }

        // 4. Repassa para a Inteligência Artificial
        await processWhatsAppMessage(phoneNumber, patientId, patientData, textContent, remoteJid);
      } catch (err) {
        console.error('Erro no processamento background:', err);
      }
    })();
    
  } catch (error) {
    console.error('Erro geral no webhook:', error);
    // Se res já foi enviada, não podemos dar status 500
    if (!res.headersSent) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}
