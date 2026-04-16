import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    // Serve index.html for all routes so browser refresh works on any page
    historyApiFallback: true,
  },
  preview: {
    // Same fallback for `vite preview`
    historyApiFallback: true,
  },
})
