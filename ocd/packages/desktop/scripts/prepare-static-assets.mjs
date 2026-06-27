import { copyFileSync, cpSync, mkdirSync, readdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const desktopRoot = path.resolve(scriptDir, '..')
const repoOcdRoot = path.resolve(desktopRoot, '../..')
const reactRoot = path.join(repoOcdRoot, 'packages', 'react')

const ensureDir = (dir) => mkdirSync(dir, { recursive: true })

const copyCss = () => {
    const sourceDir = path.join(reactRoot, 'src', 'css')
    const targetDir = path.join(desktopRoot, 'src', 'css')
    ensureDir(targetDir)
    for (const file of readdirSync(sourceDir)) {
        if (!file.endsWith('.css')) continue
        copyFileSync(path.join(sourceDir, file), path.join(targetDir, file))
        console.log(`${path.relative(desktopRoot, path.join(sourceDir, file))} -> ${path.relative(desktopRoot, path.join(targetDir, file))}`)
    }
}

const copyJsonnetWasm = () => {
    const source = path.join(reactRoot, 'src', 'landingzone', 'wasm', 'libjsonnet.wasm')
    const target = path.join(desktopRoot, 'public', 'libjsonnet.wasm')
    ensureDir(path.dirname(target))
    copyFileSync(source, target)
    console.log(`${path.relative(desktopRoot, source)} -> ${path.relative(desktopRoot, target)}`)
}

const copyLibrary = () => {
    const source = path.join(repoOcdRoot, 'library')
    const target = path.join(desktopRoot, 'public', 'library')
    ensureDir(path.dirname(target))
    cpSync(source, target, { recursive: true, force: true })
    console.log(`${path.relative(desktopRoot, source)} -> ${path.relative(desktopRoot, target)}`)
}

copyCss()
copyJsonnetWasm()
copyLibrary()
