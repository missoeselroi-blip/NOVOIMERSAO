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

// Variável para rastrear se o projeto parece estar indisponível
let suspendedValue = false;
const statusListeners: ((val: boolean) => void)[] = [];

export const isProjectSuspended = {
  get value() { return suspendedValue; },
  set value(val: boolean) {
    if (suspendedValue !== val) {
      suspendedValue = val;
      statusListeners.forEach(l => l(val));
    }
  },
  subscribe: (listener: (val: boolean) => void) => {
    statusListeners.push(listener);
    return () => {
      const index = statusListeners.indexOf(listener);
      if (index > -1) statusListeners.splice(index, 1);
    };
  }
};

// Teste de conexão detalhado
async function testConnection() {
  try {
    console.log('📡 Testando conexão com Firestore...');
    // Forçamos uma requisição direta ao servidor
    await getDocFromServer(doc(db, '_connection_test_', 'test'));
    console.log('✅ Firestore conectado com sucesso!');
    isProjectSuspended.value = false;
  } catch (error: any) {
    if (error.code === 'permission-denied' || error.code === 'not-found') {
      console.log('✅ Firestore conectado com sucesso! (O servidor respondeu).');
      isProjectSuspended.value = false;
    } else {
      console.group('❌ Detalhes do Erro de Conexão:');
      console.error('Código:', error.code);
      console.error('Mensagem:', error.message);
      console.groupEnd();
      
      if (error.message?.includes('offline') || error.code === 'unavailable' || error.message?.includes('suspended')) {
        console.warn('⚠️ O projeto Firebase parece estar indisponível ou em modo offline: ' + firebaseConfig.projectId);
        isProjectSuspended.value = true;
      }
    }
  }
}

testConnection();

export default app;
