/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

/*
** Headless sanity check for the Landing Zone Wizard NON-WASM pipeline.
**
** Proves, without a browser/Electron runtime or the go-jsonnet WASM:
**   1. validateStep1(DEFAULT_STEP1) yields zero errors.
**   2. serializeStep1Config(DEFAULT_STEP1) contains the expected realm/region/hub
**      fields.
**   3. getOperatingEntitiesJsonnetFiles() returns a map with BOTH
**      '/gen/landing_zone_multi.jsonnet' and 'landing_zone_multi.jsonnet' keys and
**      146 logical sources (292 keys).
**   4. The generator pipeline turns a fake evaluator's JSON into sorted files.
**
** Uses esbuild to bundle the pure-logic TS service files (stubbing the WASM
** runtime module so no DOM/global side effects run). The actual WASM execution
** is a packaged-DMG follow-up.
*/

import { fileURLToPath, pathToFileURL } from 'node:url'
import { writeFileSync, mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..')

// esbuild is installed under ocd/node_modules (workspace), not the repo root.
const esbuildUrl = pathToFileURL(path.join(repoRoot, 'ocd', 'node_modules', 'esbuild', 'lib', 'main.js')).href
const { build } = await import(esbuildUrl)
const lzDir = path.join(repoRoot, 'ocd', 'packages', 'react', 'src', 'landingzone')

const tmp = mkdtempSync(path.join(tmpdir(), 'ocd-lz-check-'))
const entry = path.join(tmp, 'entry.mjs')
const outFile = path.join(tmp, 'bundle.mjs')

// Stub OcdJsonnetWasm so the generator can be imported without loading wasmExec
// (which expects a DOM/global runtime). The fake evaluator below is used instead.
const stubWasm = path.join(tmp, 'OcdJsonnetWasm.ts')
writeFileSync(stubWasm, `
export const evaluateJsonnet = async () => { throw new Error('wasm not available in headless check') }
export const ensureJsonnetWasm = async () => { throw new Error('wasm not available in headless check') }
`)

writeFileSync(entry, `
export * as step1 from ${JSON.stringify(path.join(lzDir, 'OcdLzStep1Config.ts'))}
export * as oe from ${JSON.stringify(path.join(lzDir, 'OcdOeJsonnetFiles.ts'))}
export * as gen from ${JSON.stringify(path.join(lzDir, 'OcdLzGenerator.ts'))}
`)

function assert(condition, message) {
    if (!condition) {
        console.error(`FAIL: ${message}`)
        process.exitCode = 1
        throw new Error(message)
    }
    console.log(`ok: ${message}`)
}

async function main() {
    const stubWasmPlugin = {
        name: 'stub-jsonnet-wasm',
        setup(buildApi) {
            // Redirect any import of OcdJsonnetWasm to the stub (skip DOM/global side effects).
            buildApi.onResolve({ filter: /OcdJsonnetWasm$/ }, () => ({ path: stubWasm }))
        },
    }

    await build({
        entryPoints: [entry],
        bundle: true,
        format: 'esm',
        platform: 'node',
        outfile: outFile,
        logLevel: 'error',
        plugins: [stubWasmPlugin],
        loader: { '.ts': 'ts' },
    })

    const mod = await import(pathToFileURL(outFile).href)
    const { step1, oe, gen } = mod

    // 1. validateStep1 on DEFAULT_STEP1 -> no errors
    const validation = step1.validateStep1(step1.DEFAULT_STEP1)
    assert(validation.errors.length === 0, `validateStep1(DEFAULT_STEP1) has no errors (got: ${validation.errors.join(' | ')})`)

    // 2. serializeStep1Config contains realm/region/hub fields
    const config = step1.serializeStep1Config(step1.DEFAULT_STEP1)
    assert(config.includes("realm: 'oc1'"), "config.jsonnet contains realm: 'oc1'")
    assert(config.includes("region: 'eu-frankfurt-1'"), "config.jsonnet contains region: 'eu-frankfurt-1'")
    assert(config.includes("region_short_name: 'fra'"), "config.jsonnet contains region_short_name: 'fra'")
    assert(config.includes("kind: 'hub_a'"), "config.jsonnet contains hub kind 'hub_a'")
    assert(config.includes("network: { vcn: '10.100.0.0/21' }"), "config.jsonnet contains hub network vcn")
    assert(config.includes("security_targets: ['prod']"), "config.jsonnet contains security_targets: ['prod']")

    // 3. OE files map: both keys + 146 logical sources
    const files = oe.getOperatingEntitiesJsonnetFiles()
    assert(typeof files['/gen/landing_zone_multi.jsonnet'] === 'string', "files has '/gen/landing_zone_multi.jsonnet'")
    assert(typeof files['landing_zone_multi.jsonnet'] === 'string', "files has 'landing_zone_multi.jsonnet'")
    assert(files['/gen/landing_zone_multi.jsonnet'].includes('function(config)'), 'entry source is a function(config)')
    const keyCount = Object.keys(files).length
    assert(keyCount === 292, `files map has 292 keys (146 logical sources x2), got ${keyCount}`)
    assert(files['/gen/constants.libsonnet'].includes('oc19:'), 'constants.libsonnet has oc19 overlay')

    // 4. generator pipeline with a fake evaluator
    const fakeEvaluate = async (args) => {
        assert(args.filename === '/gen/landing_zone_multi.jsonnet', 'generator invokes the multi entrypoint')
        assert(args.tlaCodes.config.includes("region_short_name: 'fra'"), 'generator passes config as TLA code')
        return JSON.stringify({ 'network.json': { ok: true }, 'iam.json': { groups: {} } })
    }
    const result = await gen.generateLandingZoneFiles(step1.DEFAULT_STEP1, fakeEvaluate)
    assert(result.renderer === 'go-jsonnet-wasm', 'generator renderer is go-jsonnet-wasm')
    assert(JSON.stringify(result.files.map((f) => f.name)) === JSON.stringify(['iam.json', 'network.json']), 'generator sorts output files')

    console.log('\nALL LANDING ZONE PIPELINE SANITY CHECKS PASSED')
}

main().catch((err) => {
    console.error(err)
    process.exitCode = 1
})
