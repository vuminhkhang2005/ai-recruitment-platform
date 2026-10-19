import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on('error', (_err) => {
            // Suppress transient proxy errors
          });
        }
      },
      '/ws': {
        target: 'ws://localhost:8080',
        ws: true,
        configure: (proxy) => {
          proxy.on('error', (_err) => {
            // Suppress transient socket resets
          });
        }
      }
    }
  }
})
