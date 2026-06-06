import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
// Vite serves index.html for unknown routes by default (appType: 'spa'),
// so browser refresh on any path works without extra config.
export default defineConfig({
  plugins: [react()],
  // Bind on all interfaces (IPv4 + IPv6) so the dev server is reachable via
  // both localhost and 127.0.0.1 from any local browser.
  server: {
    host: true,
    port: 5173,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
