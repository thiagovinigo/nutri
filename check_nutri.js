import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, getDoc, query, where } from "firebase/firestore";

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
  const nutriId = '4vB28yX6LIfBOv9sezEHRhlBNQc2';
  
  try {
    const nutriRef = doc(db, 'users', nutriId);
    const nutriSnap = await getDoc(nutriRef);
    
    if (nutriSnap.exists()) {
      console.log('=== DADOS DO NUTRICIONISTA ===');
      console.log(nutriSnap.data());
    } else {
      console.log('Nutricionista não encontrado na coleção "users".');
    }

    console.log('\n=== PACIENTES VINCULADOS ===');
    const q = query(collection(db, 'patients'), where('nutricionista_id', '==', nutriId));
    const patientsSnap = await getDocs(q);
    
    if (patientsSnap.empty) {
      console.log('Nenhum paciente encontrado para este nutricionista.');
    } else {
      patientsSnap.forEach(doc => {
        console.log(`- Paciente ID: ${doc.id}`);
        console.log(doc.data());
        console.log('---');
      });
    }

  } catch (error) {
    console.error('Erro ao consultar banco:', error);
  }
  process.exit();
}

run();
