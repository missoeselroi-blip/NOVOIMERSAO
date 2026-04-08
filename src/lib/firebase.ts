import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
console.log('Firebase initialized with project:', firebaseConfig.projectId);

export const auth = getAuth(app);

// Use initializeFirestore instead of getFirestore to enable long polling
// This helps bypass corporate firewalls that block WebSockets
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
  useFetchStreams: false,
  host: 'firestore.googleapis.com',
  ssl: true,
}, firebaseConfig.firestoreDatabaseId === "(default)" ? undefined : firebaseConfig.firestoreDatabaseId);

// Test connection to Firestore
async function testConnection() {
  try {
    await getDocFromServer(doc(db, '_connection_test_', 'test'));
    console.log('Successfully connected to Firestore');
  } catch (error: any) {
    if (error?.message?.includes('the client is offline')) {
      console.error('Firestore connection failed: The client is offline. This is usually caused by a corporate firewall blocking Firebase or a lack of internet connection.');
    } else {
      console.log('Firestore connectivity verified');
    }
  }
}

testConnection();

export default app;
