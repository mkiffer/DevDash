import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react'
import path from "path"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts', // Optional: for global setup
    css: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    include: ['axios'], // Ensure axios is included during optimization
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    watch: {
      usePolling: true,  // Important for Docker environments
      interval: 100      // Polling interval in ms
    },
    hmr: {
      clientPort: 5173  // Match the port exposed in docker-compose
    }
  },
  base: './' 
})
