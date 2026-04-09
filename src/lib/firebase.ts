import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
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

// Força o uso de Long Polling e desativa streams de busca para máxima compatibilidade
// Isso ajuda a passar por proxies e firewalls que podem estar bloqueando WebSockets
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
}, (firebaseConfig as any).firestoreDatabaseId || '(default)');

// Teste de conexão detalhado
async function testConnection() {
  try {
    console.log('📡 Testando conexão com Firestore...');
    // Forçamos uma requisição direta ao servidor
    await getDocFromServer(doc(db, '_connection_test_', 'test'));
    console.log('✅ Firestore conectado com sucesso!');
  } catch (error: any) {
    console.group('❌ Detalhes do Erro de Conexão:');
    console.error('Código:', error.code);
    console.error('Mensagem:', error.message);
    console.groupEnd();

    if (error.code === 'permission-denied' || error.code === 'not-found') {
      console.log('📡 O Firestore está ONLINE! (O servidor respondeu, o que é o mais importante).');
    } else if (error.message?.includes('offline') || error.code === 'unavailable') {
      console.warn('⚠️ O cliente ainda reporta offline. Isso pode ser um bloqueio de rede ou o Firestore não está ativado no projeto: ' + firebaseConfig.projectId);
    }
  }
}

testConnection();

export default app;
