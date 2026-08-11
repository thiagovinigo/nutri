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
  } catch (e) { }
}

async function resetInstance() {
  loadEnv();
  const RENDER_URL = process.env.EVOLUTION_API_URL || 'https://evolution-api-latest-oy03.onrender.com';
  const API_KEY = process.env.EVOLUTION_API_KEY;
  const INSTANCE_NAME = process.env.EVOLUTION_INSTANCE_NAME || 'nutrivvo_bot';

  if (!API_KEY) return console.error('Sem chave API');

  console.log(`⏳ Deletando a instância travada '${INSTANCE_NAME}'...`);
  await fetch(`${RENDER_URL}/instance/logout/${INSTANCE_NAME}`, {
    method: 'DELETE',
    headers: { 'apikey': API_KEY }
  });
  await fetch(`${RENDER_URL}/instance/delete/${INSTANCE_NAME}`, {
    method: 'DELETE',
    headers: { 'apikey': API_KEY }
  });

  console.log(`⏳ Recriando do zero a instância '${INSTANCE_NAME}'...`);
  const response = await fetch(`${RENDER_URL}/instance/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': API_KEY
    },
    body: JSON.stringify({
      instanceName: INSTANCE_NAME,
      integration: "WHATSAPP-BAILEYS",
      token: "token123",
      qrcode: true,
    })
  });

  const data = await response.json();
  if (data.qrcode && data.qrcode.base64) {
    const base64Data = data.qrcode.base64.replace(/^data:image\/png;base64,/, "");
    fs.writeFileSync('qrcode_novo.png', base64Data, 'base64');
    console.log('✅ SUCESSO! Instância recriada. QR Code salvo em qrcode_novo.png.');
  } else {
    console.log('❌ Erro inesperado ao recriar. Resposta:', data);
  }
}

resetInstance();
