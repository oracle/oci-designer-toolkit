import { defineConfig } from 'vite';
import { resolve } from 'path'
import react from '@vitejs/plugin-react'

// Build @ocd/react from its TypeScript SOURCE (not the prebuilt dist), exactly as
// the static web build (vite.web.config.mts) does. This guarantees the Electron
// desktop renderer and the web build ship the SAME features (no stale-dist lag —
// source edits land in both without rebuilding the @ocd/react workspace). The
// React plugin handles the source .tsx files.
const ocdReactSrc = resolve(__dirname, '../react/src/index.ts')

// https://vitejs.dev/config
export default defineConfig({
  plugins: [react()],
  assetsInclude: ['**/*.wasm'],
  resolve: {
    alias: {
      '@ocd/react': ocdReactSrc,
    },
  },
  build: {
    target: 'esnext'
  },
  server: {
    proxy: {
      // Proxy the unauthenticated OCI list-pricing API so the renderer (web /
      // dev server) can fetch it without CORS issues. The Electron desktop build
      // routes pricing through the main process instead (see OciPriceListHandlers).
      '/api/pricing': {
        target: 'https://apexapps.oracle.com',
        changeOrigin: true,
        secure: true,
        rewrite: (p: string) => p.replace(/^\/api\/pricing/, '/pls/apex/cetools/api/v1/products')
      },
      // Proxy OCI discovery (import-from-OCI / Reference Data Query) to the local
      // read-only backend (@ocd/web-server, default 127.0.0.1:5050) so the browser
      // build can read ~/.oci/config and call the OCI SDK server-side without CORS.
      // The Electron desktop build routes these through the main process instead.
      // Override the backend port with the OCD_WEB_SERVER_PORT env var if it differs.
      '/api/oci': {
        target: process.env.OCD_WEB_SERVER_URL || 'http://127.0.0.1:5050',
        changeOrigin: true,
        secure: false
      }
    }
  }
});
