import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

// firebase-admin v12+ trocou a API legada (admin.apps, admin.credential,
// admin.firestore(), admin.auth()) pela API modular acima. O código antigo
// aqui usava a API legada e crashava em TODA chamada (TypeError: Cannot
// read properties of undefined (reading 'length') em admin.apps.length),
// derrubando silenciosamente qualquer endpoint que dependesse de Firestore
// ou Auth no backend (whatsapp-ai.js, whatsapp-webhook.js, cron-reminders.js
// e os endpoints de verificação de telefone).

// Evita recriar a instância do app em hot reloads no ambiente de desenvolvimento serverless
let app;
if (!getApps().length) {
  try {
    // FIREBASE_SERVICE_ACCOUNT precisa ser uma string JSON válida no ambiente Vercel
    const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT;

    if (!serviceAccountString) {
      console.warn('Variável FIREBASE_SERVICE_ACCOUNT não definida. Admin SDK pode falhar se não houver credenciais padrão.');
      app = initializeApp(); // Tenta usar Application Default Credentials se estiver local com gcloud auth
    } else {
      const serviceAccount = JSON.parse(serviceAccountString);
      app = initializeApp({
        credential: cert(serviceAccount)
      });
    }
    console.log('Firebase Admin inicializado com sucesso.');
  } catch (error) {
    console.error('Erro ao inicializar Firebase Admin:', error);
  }
} else {
  app = getApps()[0];
}

export const db = getFirestore(app);
export const auth = getAuth(app);
