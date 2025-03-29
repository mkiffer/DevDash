import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
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
