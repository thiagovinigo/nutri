import admin from 'firebase-admin';

// Evita recriar a instância do app em hot reloads no ambiente de desenvolvimento serverless
if (!admin.apps.length) {
  try {
    // FIREBASE_SERVICE_ACCOUNT precisa ser uma string JSON válida no ambiente Vercel
    const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT;
    
    if (!serviceAccountString) {
      console.warn('Variável FIREBASE_SERVICE_ACCOUNT não definida. Admin SDK pode falhar se não houver credenciais padrão.');
      admin.initializeApp(); // Tenta usar Application Default Credentials se estiver local com gcloud auth
    } else {
      const serviceAccount = JSON.parse(serviceAccountString);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
    }
    console.log('Firebase Admin inicializado com sucesso.');
  } catch (error) {
    console.error('Erro ao inicializar Firebase Admin:', error);
  }
}

export const db = admin.firestore();
export default admin;
