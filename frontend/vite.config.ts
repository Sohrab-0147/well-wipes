import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

const BACKEND_TUNNEL = 'https://guarantees-speaking-mention-strike.trycloudflare.com';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  server: {
    port: 5173,
    host: true,
    allowedHosts: ['.trycloudflare.com'],
    proxy: {
      '/api': {
        target: BACKEND_TUNNEL,
        changeOrigin: true,
        secure: false,
      },
      '/oauth2': {
        target: BACKEND_TUNNEL,
        changeOrigin: true,
        secure: false,
      },
      '/login/oauth2': {
        target: BACKEND_TUNNEL,
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
