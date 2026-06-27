/*
** Post-process the static web build for GitHub Pages.
**
** GitHub Pages runs Jekyll by default, which strips files/directories whose names
** start with an underscore (Vite occasionally emits `_assets` etc.). A `.nojekyll`
** marker disables that. We also copy index.html -> 404.html so deep links / SPA
** routes resolve to the app shell instead of a GitHub 404 page.
**
** Usage: node scripts/prepare-pages-build.mjs [distDir]   (default: web-dist)
*/

import { copyFile, writeFile, access } from 'node:fs/promises'
import { constants } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const packageRoot = path.resolve(scriptDir, '..')

async function exists(p) {
  try {
    await access(p, constants.F_OK)
    return true
  } catch {
    return false
  }
}

async function main() {
  const distArg = process.argv[2] || 'web-dist'
  const distDir = path.isAbsolute(distArg) ? distArg : path.join(packageRoot, distArg)

  const indexPath = path.join(distDir, 'index.html')
  if (!(await exists(indexPath))) {
    throw new Error(`[prepare-pages] ${indexPath} not found — run the vite build first`)
  }

  // SPA fallback so non-root paths still serve the app shell.
  const fallbackPath = path.join(distDir, '404.html')
  await copyFile(indexPath, fallbackPath)

  // Disable Jekyll so underscore-prefixed assets are served verbatim.
  const noJekyllPath = path.join(distDir, '.nojekyll')
  await writeFile(noJekyllPath, '', 'utf8')

  console.log(`[prepare-pages] wrote ${fallbackPath}`)
  console.log(`[prepare-pages] wrote ${noJekyllPath}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
