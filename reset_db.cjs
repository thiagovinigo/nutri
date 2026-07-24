const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, deleteDoc, doc } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
  measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function resetCollection(collectionName) {
  console.log(`Buscando documentos na coleção '${collectionName}'...`);
  const collRef = collection(db, collectionName);
  const snapshot = await getDocs(collRef);
  let count = 0;
  for (const document of snapshot.docs) {
    await deleteDoc(doc(db, collectionName, document.id));
    count++;
  }
  console.log(`Deletados ${count} documentos da coleção '${collectionName}'.`);
}

async function run() {
  console.log('Iniciando reset do banco de dados (Firestore)...');
  try {
    await resetCollection('users');
    await resetCollection('patients');
    await resetCollection('consultations');
    
    console.log('✅ Reset do Firestore concluído!');
    console.log('\n⚠️  ATENÇÃO: O Firebase Auth (Contas de Usuário) NÃO pode ser deletado via script de cliente.');
    console.log('Se você quiser um reset 100% total, acesse o Console do Firebase (Authentication) e exclua os usuários manualmente.');
    console.log('Porém, com a nova lógica de login que vou implementar, não será estritamente necessário excluí-los!');
  } catch (error) {
    console.error('Erro ao resetar o banco de dados:', error);
  }
  process.exit();
}

run();
