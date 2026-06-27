// Copy runtime static assets into the react package's public/ dir so the
// standalone Vite dev server (and `vite build`) serve them at the app root.
//
// Mirrors packages/desktop/scripts/prepare-static-assets.mjs: the Landing Zone
// wizard loads `libjsonnet.wasm` (go-jsonnet engine) and `library/` templates
// relative to document.baseURI, so both must live under public/. Without this,
// `/libjsonnet.wasm` falls through to index.html (text/html) and the engine
// reports "Landing Zone engine unavailable".
import { copyFileSync, cpSync, existsSync, mkdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const reactRoot = path.resolve(scriptDir, '..')
const repoOcdRoot = path.resolve(reactRoot, '../..')

const ensureDir = (dir) => mkdirSync(dir, { recursive: true })

const copyJsonnetWasm = () => {
    const source = path.join(reactRoot, 'src', 'landingzone', 'wasm', 'libjsonnet.wasm')
    const target = path.join(reactRoot, 'public', 'libjsonnet.wasm')
    ensureDir(path.dirname(target))
    copyFileSync(source, target)
    console.log(`${path.relative(reactRoot, source)} -> ${path.relative(reactRoot, target)}`)
}

const copyLibrary = () => {
    const source = path.join(repoOcdRoot, 'library')
    if (!existsSync(source)) return
    const target = path.join(reactRoot, 'public', 'library')
    ensureDir(path.dirname(target))
    cpSync(source, target, { recursive: true, force: true })
    console.log(`${path.relative(reactRoot, source)} -> ${path.relative(reactRoot, target)}`)
}

copyJsonnetWasm()
copyLibrary()
