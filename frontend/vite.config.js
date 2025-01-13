import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    // Add base URL configuration
    base: '/',
    // Ensure assets are handled correctly
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  }
})