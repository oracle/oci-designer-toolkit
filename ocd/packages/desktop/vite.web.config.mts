import { defineConfig } from 'vite'
import { resolve } from 'path'
import react from '@vitejs/plugin-react'

// Standalone STATIC web build of the Electron renderer for GitHub Pages.
//
// This config is intentionally SEPARATE from `vite.renderer.config.mts` (which is
// driven by electron-forge / @electron-forge/plugin-vite). It builds the same
// `index.html` -> `/src/main.tsx` renderer entry into a plain static `web-dist`
// directory that can be served from any static host (GitHub Pages, S3, nginx).
//
// Base path:
//   GitHub Pages serves a project site under https://<user>.github.io/<repo>/, so
//   every asset URL must be prefixed with that sub-path. The default targets the
//   canonical repo name `oci-designer-toolkit`. Override for a fork / different
//   repo name or a root deploy:
//
//     OCD_PAGES_BASE=/my-fork/ npm run build:pages   # project site
//     OCD_PAGES_BASE=/        npm run build:pages    # user/org root or custom domain
//
// The Landing Zone wizard resolves `libjsonnet.wasm` against `document.baseURI`
// (see OcdJsonnetWasm.ts). The wasm lives in `public/` and is emitted at the base
// root, so `new URL('libjsonnet.wasm', document.baseURI)` resolves correctly under
// the Pages sub-path with no extra wiring.
//
// What is NOT available on a static deploy (no backend):
//   - /api/oci  (OCI discovery) -> the local @ocd/web-server is absent; the
//     discovery dialog shows its connection error. Expected.
//   - /api/pricing (live cetools) -> absent; the cost estimator falls back to the
//     bundled price snapshot. Expected.
// Everything else (wizard jsonnet-WASM generation, Terraform import, palette,
// theme, cost snapshot, LZ update notifications) is fully client-side and works.

function normalizeBase(raw: string | undefined): string {
  const fallback = '/oci-designer-toolkit/'
  if (!raw || raw.trim() === '') return fallback
  let base = raw.trim()
  if (!base.startsWith('/')) base = `/${base}`
  if (!base.endsWith('/')) base = `${base}/`
  return base
}

const base = normalizeBase(process.env.OCD_PAGES_BASE)

// Resolve the @ocd/react workspace package root.
// When Vite processes the static web build it dereferences the npm workspace
// symlink (node_modules/@ocd/react -> ../../packages/react). The dist/ files
// are already-bundled prebuilt chunks; they carry circular inter-dependencies
// that prevent Rollup's manualChunks from splitting them further.
// Pointing directly at the TypeScript source lets Vite:
//   1. Honour the existing React.lazy() boundary (OcdLandingZone stays lazy).
//   2. Route third-party packages (@xyflow/react, exceljs, react-markdown …)
//      through manualChunks because they live in workspace node_modules and
//      their ids contain "node_modules/".
//   3. Avoid duplicate React / ReactDOM copies (prebuilt chunks bundled their
//      own copy of @xyflow/react's react dep into index-Cdi2_*.js).
const ocdReactSrc = resolve(__dirname, '../../packages/react/src/index.ts')

function normalizeId(id: string): string {
  return id.split('\\').join('/')
}

function generatedWorkspaceChunk(id: string): string | undefined {
  const normalized = normalizeId(id)

  if (normalized.includes('/packages/react/src/data/OcdDefaultCache.ts')) return 'data-default-cache'
  if (normalized.includes('/packages/react/src/data/OcdPalette.ts')) return 'data-palette'

  return undefined
}

// https://vitejs.dev/config
export default defineConfig({
  base,
  plugins: [react()],
  assetsInclude: ['**/*.wasm'],
  // Route @ocd/react to its TypeScript source so Vite can split the bundle
  // properly (see comment above). The React plugin handles the source .tsx files.
  resolve: {
    alias: {
      '@ocd/react': ocdReactSrc,
    },
  },
  build: {
    target: 'esnext',
    // ExcelJS publishes one browser bundle around 0.9 MB minified, and the
    // initial designer still carries the shared model/document core. The
    // expensive per-resource OCI property panels are lazy-loaded, so keep the
    // warning budget explicit at 3 MB rather than letting Vite's generic 500 kB
    // web-site default flag this app's expected tool-surface payload.
    chunkSizeWarningLimit: 3000,
    // Dedicated output dir so the static build never collides with electron-forge's
    // `.vite/` / `out/` directories or the desktop `dist`.
    outDir: 'web-dist',
    emptyOutDir: true,
    // Split heavy vendors into separate chunks so the static deploy ships a smaller
    // initial payload and browsers can cache vendor code across app deploys. Without
    // this the whole renderer collapses into one ~5MB chunk (Vite warns >500kB).
    rollupOptions: {
      onwarn(warning, warn) {
        if (
          warning.code === 'MODULE_LEVEL_DIRECTIVE'
          && warning.message.includes('"use client"')
          && warning.message.includes('@xyflow/react')
        ) return
        warn(warning)
      },
      output: {
        manualChunks(id: string) {
          const workspaceChunk = generatedWorkspaceChunk(id)
          if (workspaceChunk) return workspaceChunk

          if (!id.includes('node_modules')) return undefined
          // Normalise to the top-level package name (handles scoped packages).
          const pkgPath = id.split('node_modules/').pop() as string
          const pkg = pkgPath.startsWith('@')
            ? pkgPath.split('/').slice(0, 2).join('/')
            : pkgPath.split('/')[0]
          // Heavy, independently-cacheable vendors get their own chunks.
          if (pkg === 'exceljs') return 'vendor-exceljs'        // xlsx export, large
          if (pkg === 'oci-sdk') return 'vendor-oci-sdk'         // OCI SDK, large
          if (pkg === '@xyflow/react') return 'vendor-reactflow' // wizard diagram
          if (pkg === 'react' || pkg === 'react-dom' || pkg === 'scheduler') return 'vendor-react'
          // NOTE: react-markdown and its unified/remark/rehype/hast/micromark ecosystem
          // packages form a circular import graph with other vendor packages (hast-util-*)
          // when split into a separate chunk from source. Merging them into the main
          // vendor bundle eliminates the TDZ/circular-chunk issue. They are medium-weight
          // (~130 kB gzip) and used only on the Documentation tab.
          return 'vendor' // everything else (incl. markdown ecosystem)
        },
      },
    },
  },
  server: {
    // Mirror the dev proxy so `vite preview --config vite.web.config.mts` behaves
    // like `npm run web` if a developer points it at a running backend. On a real
    // static Pages deploy these proxies do not exist (and are not needed).
    proxy: {
      '/api/pricing': {
        target: 'https://apexapps.oracle.com',
        changeOrigin: true,
        secure: true,
        rewrite: (p: string) => p.replace(/^\/api\/pricing/, '/pls/apex/cetools/api/v1/products'),
      },
      '/api/oci': {
        target: process.env.OCD_WEB_SERVER_URL || 'http://127.0.0.1:5050',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
