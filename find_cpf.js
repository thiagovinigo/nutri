import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBPCDEhF1WVsEB782GKR-IPXCmNbL6EWM0",
  authDomain: "nutribase-fea35.firebaseapp.com",
  projectId: "nutribase-fea35",
  storageBucket: "nutribase-fea35.firebasestorage.app",
  messagingSenderId: "939964600683",
  appId: "1:939964600683:web:edfa850ca8940095de7c2e",
  measurementId: "G-9TYRB05DF7"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
  const targetCpf = "045.564.599-08".replace(/\D/g, "");
  
  try {
    const patientsSnap = await getDocs(collection(db, 'patients'));
    console.log(`Buscando pacientes com CPF contendo os números ${targetCpf}...`);
    
    let found = false;
    patientsSnap.forEach(doc => {
      const data = doc.data();
      const cleanCpf = String(data.cpf || '').replace(/\D/g, "");
      
      if (cleanCpf === targetCpf) {
        found = true;
        console.log(`\n=== CONFLITO ENCONTRADO ===`);
        console.log(`Nome do Paciente: ${data.name}`);
        console.log(`ID do Documento: ${doc.id}`);
        console.log(`E-mail: ${data.email || 'Não informado'}`);
        console.log(`Status: ${data.status || 'Ativo'}`);
        console.log(`===========================\n`);
      }
    });

    if (!found) {
      console.log('Nenhum paciente com esse CPF foi encontrado na base toda.');
    }
  } catch (error) {
    console.error('Erro:', error);
  }
  process.exit();
}

run();
