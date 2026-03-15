import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/login':      { target: 'http://localhost:3000', changeOrigin: true },
      '/cadastro':   { target: 'http://localhost:3000', changeOrigin: true },
      '/usuarios':   { target: 'http://localhost:3000', changeOrigin: true },
      '/pessoas':    { target: 'http://localhost:3000', changeOrigin: true },
      '/documentos': { target: 'http://localhost:3000', changeOrigin: true },
    }
  }
});
