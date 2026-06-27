/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// LZNG Vite config.
//   - dev server binds 0.0.0.0 so LAN hosts can hit it
//   - dev /api + /auth proxy to the Express server on :8080
//   - vitest scans both src-drawio and src-lzng for *.test.{ts,tsx}
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'node',
    include: ['src-drawio/**/*.test.{ts,tsx}', 'src-lzng/**/*.test.{ts,tsx}'],
    passWithNoTests: true,
  },
  root: '.',
  build: {
    outDir: 'dist',
  },
  server: {
    port: 5173,
    host: true,
    open: '/',
    proxy: {
      '/api':  { target: 'http://localhost:8080', changeOrigin: true },
      '/auth': { target: 'http://localhost:8080', changeOrigin: true },
    },
  },
  envPrefix: 'VITE_',
});
