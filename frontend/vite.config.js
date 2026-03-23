import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/login':      { target: 'http://localhost:3003', changeOrigin: true },
      '/cadastro':   { target: 'http://localhost:3003', changeOrigin: true },
      '/usuarios':   { target: 'http://localhost:3003', changeOrigin: true },
      '/perfil':     { target: 'http://localhost:3003', changeOrigin: true },
      '/busca':      { target: 'http://localhost:3003', changeOrigin: true },
      '/servicos':   { target: 'http://localhost:3003', changeOrigin: true },
      '/transparencia': { target: 'http://localhost:3003', changeOrigin: true },
      '/pessoas':    { target: 'http://localhost:3003', changeOrigin: true },
      '/documentos': { target: 'http://localhost:3003', changeOrigin: true },
      '/protocolos': { target: 'http://localhost:3003', changeOrigin: true },
    }
  }
});
