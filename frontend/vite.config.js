import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@': path.resolve(import.meta.dirname, './src') } },
  server: {
    host: true,
    port: 5173,
    allowedHosts: ['.trycloudflare.com'],
    proxy: {
      '/api':          { target: 'http://127.0.0.1:8080', changeOrigin: true },
      '/oauth2':       { target: 'http://127.0.0.1:8081', changeOrigin: true },
      '/login/oauth2': { target: 'http://127.0.0.1:8081', changeOrigin: true },
    },
  },
})
