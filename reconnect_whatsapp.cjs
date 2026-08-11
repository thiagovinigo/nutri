const fs = require('fs');

function loadEnv() {
  try {
    const envFile = fs.readFileSync('.env', 'utf-8');
    envFile.split('\n').forEach(line => {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) {
        process.env[match[1].trim()] = match[2].trim();
      }
    });
  } catch (e) {
    // .env might not exist, ignore
  }
}

async function getNewQrCode() {
  loadEnv(); // Carrega as variaveis direto do seu .env

  const RENDER_URL = process.env.EVOLUTION_API_URL || 'https://evolution-api-latest-oy03.onrender.com';
  const API_KEY = process.env.EVOLUTION_API_KEY;
  const INSTANCE_NAME = process.env.EVOLUTION_INSTANCE_NAME || 'nutrivvo_bot';

  if (!API_KEY) {
    console.error('❌ ERRO: Faltou a EVOLUTION_API_KEY no arquivo .env.');
    return;
  }

  console.log(`⏳ Buscando status da instância '${INSTANCE_NAME}' em ${RENDER_URL}...`);

  try {
    const stateRes = await fetch(`${RENDER_URL}/instance/connectionState/${INSTANCE_NAME}`, {
      headers: { 'apikey': API_KEY }
    });
    
    if (stateRes.status === 404) {
      console.error(`❌ Instância '${INSTANCE_NAME}' não encontrada! Talvez você precise recriá-la rodando o setup_evolution.cjs novamente.`);
      return;
    }
    
    const stateData = await stateRes.json();

    if (stateData.instance?.state === 'open' || stateData.state === 'open') {
      console.log('✅ Tudo certo! O WhatsApp já está CONECTADO e pareado!');
      return;
    }

    console.log('⏳ A instância existe mas está desconectada. Gerando um NOVO QR Code...');
    const connectRes = await fetch(`${RENDER_URL}/instance/connect/${INSTANCE_NAME}`, {
      headers: { 'apikey': API_KEY }
    });
    
    const connectData = await connectRes.json();
    
    if (connectData.base64) {
      const base64Data = connectData.base64.replace(/^data:image\/png;base64,/, "");
      fs.writeFileSync('qrcode_novo.png', base64Data, 'base64');
      console.log('✅ SUCESSO! Novo QR Code salvo como "qrcode_novo.png".');
      console.log('⚠️ ATENÇÃO: O QR Code do WhatsApp expira super rápido (~40 segundos).');
      console.log('📱 Abra o arquivo qrcode_novo.png na sua pasta AGORA MESMO e escaneie com seu celular!');
    } else {
      console.error('❌ Falha ao gerar novo QR code. Resposta da API:', connectData);
    }

  } catch (err) {
    console.error('❌ Erro de conexão com a Evolution API:', err);
  }
}

getNewQrCode();
