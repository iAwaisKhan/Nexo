import { defineConfig } from 'vite';

export default defineConfig({
  // Basic configuration for Vite
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
});
