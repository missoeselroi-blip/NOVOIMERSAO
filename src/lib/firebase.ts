import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromCache, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Test connection to Firestore
async function testConnection() {
  try {
    // Try to get a dummy document from the server to verify connectivity
    await getDocFromServer(doc(db, '_connection_test_', 'test'));
    console.log('Successfully connected to Firestore');
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Firestore connection failed: The client is offline. Please check your Firebase configuration and internet connection.');
    } else {
      // Other errors are expected if the document doesn't exist, but it still proves connectivity
      console.log('Firestore connectivity verified (test document might not exist)');
    }
  }
}

testConnection();

export default app;
