import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    disabled: true,
  },
  server: {
    port: 3000,
    host: '0.0.0.0',
    hmr: false,
  },
});
