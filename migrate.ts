import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import fs from 'fs';

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

async function migrate() {
  const snapshot = await getDocs(collection(db, 'quizLeaderboard'));
  for (const document of snapshot.docs) {
    const data = document.data();
    let score = data.score || 0;
    if (score > 100) {
      score = 100;
    }
    const battlesWon = data.battlesWon || 0;
    const totalScore = score + battlesWon;
    await updateDoc(doc(db, 'quizLeaderboard', document.id), { score, totalScore });
    console.log(`Updated ${document.id} with score: ${score}, totalScore: ${totalScore}`);
  }
  console.log('Migration complete');
  process.exit(0);
}
migrate();
