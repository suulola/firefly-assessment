import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    // Dev-only same-origin proxy so the frontend can call the backend
    // without needing backend CORS config (that's issue 008's concern,
    // for the deployed production origins).
    proxy: {
      '/health': 'http://localhost:4000',
      '/pokemon': 'http://localhost:4000',
      '/favorites': 'http://localhost:4000',
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./test/setup.ts'],
    include: ['test/**/*.test.tsx', 'test/**/*.test.ts'],
  },
})
