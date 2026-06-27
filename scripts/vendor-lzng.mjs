// Re-vendor the embedded LZNG source-of-truth from the upstream checkout.
//
//   node scripts/vendor-lzng.mjs   (run from the ocd/ workspace root)
//
// Copies the iwan landing-zone-next-gen *source* from the runtime checkout
// (external/lz-addons/landing-zone-next-gen, at the pinned ref) into the
// committed embedded copy (ocd/external/landing-zone-next-gen), EXCLUDING:
//   - .git/            (history; would become a nested repo)
//   - 3rd/             (go-jsonnet wasm + OCI operating entities — vendored
//                       separately in the toolkit; ~7.5 MB duplicate)
//   - node_modules/, dist/, *.log
//   - .env, .env.* (incl. .env.example) — never embed key-shaped material;
//                       iwan's .env.example carries a placeholder GITHUB_PRIVATE_KEY
//                       that trips the redaction gate.
import { cpSync, existsSync, rmSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..')
const SRC = path.join(repoRoot, 'external', 'lz-addons', 'landing-zone-next-gen')
const DST = path.join(repoRoot, 'ocd', 'external', 'landing-zone-next-gen')

const EXCLUDE_DIRS = new Set(['.git', '3rd', 'node_modules', 'dist'])
const EXCLUDE_FILE = (name) => name.startsWith('.env') || name.endsWith('.log')

if (!existsSync(SRC)) {
    console.error(`[vendor-lzng] upstream checkout not found: ${SRC}`)
    console.error('[vendor-lzng] run `npm run setup-lz:latest -- --source landing-zone-next-gen --install` first')
    process.exit(1)
}

// Wipe the embedded copy (except its committed VENDORED.md) and re-copy clean.
const keep = path.join(DST, 'VENDORED.md')
const keptVendored = existsSync(keep)
for (const entry of existsSync(DST) ? (await import('node:fs')).readdirSync(DST) : []) {
    if (entry === 'VENDORED.md') continue
    rmSync(path.join(DST, entry), { recursive: true, force: true })
}

cpSync(SRC, DST, {
    recursive: true,
    force: true,
    filter: (source) => {
        const base = path.basename(source)
        if (EXCLUDE_DIRS.has(base)) return false
        if (EXCLUDE_FILE(base)) return false
        return true
    },
})

console.log(`[vendor-lzng] re-vendored ${path.relative(repoRoot, SRC)} -> ${path.relative(repoRoot, DST)}`)
console.log(`[vendor-lzng] excluded: ${[...EXCLUDE_DIRS].join(', ')}, .env*, *.log${keptVendored ? ' (kept VENDORED.md)' : ''}`)
