import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig, loadEnv } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  // Priority: 
  // 1. process.env.GEMINI_API_KEY (System environment)
  // 2. env.GEMINI_API_KEY (Loaded from .env files)
  // 3. env.VITE_GEMINI_API_KEY (Vite standard)
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY || env.GEMINI_API_KEY || env.VITE_GEMINI_API_KEY || "";

  return {
    plugins: [react()],
    optimizeDeps: {
      include: ['react-is'],
    },
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(GEMINI_API_KEY),
      'import.meta.env.VITE_GEMINI_API_KEY': JSON.stringify(GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      hmr: false,
    },
  };
});
