import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromCache, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// For the default database, we can just call getFirestore(app)
// If the ID is "(default)", we pass undefined to use the default instance correctly
export const db = getFirestore(
  app, 
  firebaseConfig.firestoreDatabaseId === "(default)" ? undefined : firebaseConfig.firestoreDatabaseId
);

// Test connection to Firestore
async function testConnection() {
  try {
    // Try to get a dummy document from the server to verify connectivity
    // We use a very short timeout to detect offline status quickly
    await getDocFromServer(doc(db, '_connection_test_', 'test'));
    console.log('Successfully connected to Firestore');
  } catch (error: any) {
    if (error?.message?.includes('the client is offline')) {
      console.error('Firestore connection failed: The client is offline. This is usually caused by a corporate firewall blocking Firebase or a lack of internet connection.');
    } else {
      // Other errors (like permission denied or not found) actually prove we ARE connected to the server
      console.log('Firestore connectivity verified');
    }
  }
}

testConnection();

export default app;
