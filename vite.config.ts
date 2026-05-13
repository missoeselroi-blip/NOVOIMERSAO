import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig, loadEnv } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.API_KEY || env.GEMINI_API_KEY || env.VITE_GEMINI_API_KEY || "";

  return {
    plugins: [react()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(GEMINI_API_KEY),
      'import.meta.env.VITE_GEMINI_API_KEY': JSON.stringify(GEMINI_API_KEY),
      'import.meta.env.VITE_STRIPE_PUBLIC_KEY': JSON.stringify(process.env.VITE_STRIPE_PUBLIC_KEY || env.VITE_STRIPE_PUBLIC_KEY || ""),
    },
    server: {
      host: '0.0.0.0',
      port: 3000,
      hmr: false,
    },
    preview: {
      host: '0.0.0.0',
      port: 3000,
    },
    optimizeDeps: {
      esbuildOptions: {
        define: {
          global: 'globalThis',
        },
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        'firebase/app': path.resolve(__dirname, './src/lib/firebase-mock.ts'),
        'firebase/auth': path.resolve(__dirname, './src/lib/firebase-mock.ts'),
        'firebase/firestore': path.resolve(__dirname, './src/lib/firebase-mock.ts'),
        'firebase/storage': path.resolve(__dirname, './src/lib/firebase-mock.ts'),
        '../lib/firebase': path.resolve(__dirname, './src/lib/firebase-mock.ts'),
        '../../lib/firebase': path.resolve(__dirname, './src/lib/firebase-mock.ts'),
        './lib/firebase': path.resolve(__dirname, './src/lib/firebase-mock.ts')
      },
    },
  };
});
