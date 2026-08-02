import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, deleteDoc, doc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBPCDEhF1WVsEB782GKR-IPXCmNbL6EWM0",
  authDomain: "nutribase-fea35.firebaseapp.com",
  projectId: "nutribase-fea35",
  storageBucket: "nutribase-fea35.firebasestorage.app",
  messagingSenderId: "939964600683",
  appId: "1:939964600683:web:edfa850ca8940095de7c2e"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
  const targetCpf = "04556459908";
  
  try {
    const patientsSnap = await getDocs(collection(db, 'patients'));
    let found = [];
    patientsSnap.forEach(d => {
      const data = d.data();
      const cleanCpf = String(data.cpf || '').replace(/\D/g, "");
      if (cleanCpf === targetCpf) {
        found.push({ id: d.id, ...data });
      }
    });

    console.log(`Encontrados ${found.length} pacientes com o CPF ${targetCpf}:`);
    found.forEach(f => console.log(`- ${f.name} (ID: ${f.id}, Status: ${f.status})`));

  } catch (error) {
    console.error('Erro de permissão no script. O banco bloqueia leituras sem login.', error.message);
  }
  process.exit();
}

run();
