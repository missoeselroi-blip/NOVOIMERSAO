import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { initializeFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Log de inicialização para diagnóstico
console.log('🔥 Inicializando Firebase...');
console.log('Projeto:', firebaseConfig.projectId);
console.log('Config check:', {
  hasApiKey: !!firebaseConfig.apiKey,
  authDomain: firebaseConfig.authDomain,
  appId: firebaseConfig.appId
});

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const storage = getStorage(app);

// Força o uso de Long Polling e desativa streams de busca para máxima compatibilidade
// Isso ajuda a passar por proxies e firewalls que podem estar bloqueando WebSockets
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
}, (firebaseConfig as any).firestoreDatabaseId || '(default)');

// Variável global para rastrear se o projeto parece estar suspenso
export const isProjectSuspended = { value: false };

// Teste de conexão detalhado
async function testConnection() {
  try {
    console.log('📡 Testando conexão com Firestore...');
    // Forçamos uma requisição direta ao servidor
    await getDocFromServer(doc(db, '_connection_test_', 'test'));
    console.log('✅ Firestore conectado com sucesso!');
    isProjectSuspended.value = false; // Reset the flag if successful
  } catch (error: any) {
    if (error.code === 'permission-denied' || error.code === 'not-found') {
      console.log('✅ Firestore conectado com sucesso! (O servidor respondeu).');
      isProjectSuspended.value = false; // Server responded, so it's not suspended
    } else {
      console.group('❌ Detalhes do Erro de Conexão:');
      console.error('Código:', error.code);
      console.error('Mensagem:', error.message);
      console.groupEnd();
      
      if (error.message?.includes('offline') || error.code === 'unavailable' || error.message?.includes('suspended')) {
        console.warn('⚠️ O projeto Firebase parece estar suspenso ou indisponível: ' + firebaseConfig.projectId);
        isProjectSuspended.value = true;
      }
    }
  }
}

testConnection();

export default app;
