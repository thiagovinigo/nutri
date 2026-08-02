const fs = require('fs');

async function createInstance() {
  const RENDER_URL = 'https://evolution-api-latest-oy03.onrender.com';
  const API_KEY = '!Nutrivv0@2016';
  const INSTANCE_NAME = 'nutrivvo_bot';

  console.log(`⏳ Criando instância '${INSTANCE_NAME}' no servidor ${RENDER_URL}...`);

  try {
    const response = await fetch(`${RENDER_URL}/instance/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': API_KEY
      },
      body: JSON.stringify({
        instanceName: INSTANCE_NAME,
        integration: "WHATSAPP-BAILEYS",
        token: "token123", // Pode ser qualquer coisa
        qrcode: true, // Importante: pede pra gerar o QR Code de pareamento
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Falha ao criar instância:', data);
      return;
    }

    if (data.qrcode && data.qrcode.base64) {
      // Limpa a string base64 para poder salvar como imagem
      const base64Data = data.qrcode.base64.replace(/^data:image\/png;base64,/, "");

      fs.writeFileSync('qrcode.png', base64Data, 'base64');
      console.log('✅ SUCESSO! Instância criada.');
      console.log('📱 O QR Code foi salvo como "qrcode.png" na pasta do seu projeto!');
      console.log('Abra o arquivo qrcode.png, vá no WhatsApp do Nutrivvo e escaneie a tela para conectar.');
    } else {
      console.log('⚠️ Instância criada, mas o QR Code não veio no formato esperado.');
      console.log(data);
    }

  } catch (err) {
    console.error('❌ Erro de conexão. Verifique se a URL do Render está correta e tente de novo.', err);
  }
}

createInstance();
