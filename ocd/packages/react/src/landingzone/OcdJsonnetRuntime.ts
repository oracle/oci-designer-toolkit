/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

/*
** Runtime side of the go-jsonnet WASM engine. This module is safe to import from
** both the renderer and the dedicated Jsonnet worker.
*/

import './wasm/wasmExec'
import { fetchWithTimeout, OcdMetrics } from '@ocd/core'
import { EvaluateJsonnetArgs, JsonnetEngineProbe, JsonnetEvaluate } from './OcdJsonnetTypes'

// `Go` is installed on globalThis by ./wasm/wasmExec (loosely typed Go runtime).
interface GoRuntime {
    importObject: WebAssembly.Imports
    run(instance: WebAssembly.Instance): void
}
interface JsonnetGlobals {
    Go?: new () => GoRuntime
    jsonnet_evaluate_snippet?: JsonnetEvaluate
}

const globalScope = globalThis as unknown as JsonnetGlobals

const WASM_FILENAME = 'libjsonnet.wasm'
const VITE_DEV_WASM_URL = '/src/landingzone/wasm/libjsonnet.wasm'
const WASM_MAGIC = [0x00, 0x61, 0x73, 0x6d]

// The .wasm ships as a deterministic copy under the renderer's public root
// (placed there by the desktop `prebuild` step; served at the web dev root too).
// Candidates cover web dev, packaged file://, and worker asset contexts.
function wasmCandidateUrls(): string[] {
    const candidates: string[] = []
    // Vite dev serves source assets directly; the packaged desktop app copies
    // the same binary to the public root as /libjsonnet.wasm.
    candidates.push(VITE_DEV_WASM_URL)
    try {
        if (typeof document !== 'undefined' && document.baseURI) {
            candidates.push(new URL(WASM_FILENAME, document.baseURI).href)
        }
    } catch {
        /* ignore malformed base */
    }
    try {
        const workerLocation = typeof self !== 'undefined' && 'location' in self ? self.location?.href : ''
        if (workerLocation) candidates.push(new URL(`../${WASM_FILENAME}`, workerLocation).href)
    } catch {
        /* ignore malformed worker location */
    }
    candidates.push(`./${WASM_FILENAME}`)
    candidates.push(`/${WASM_FILENAME}`)
    // De-duplicate while preserving order.
    return Array.from(new Set(candidates))
}

let runtimePromise: Promise<JsonnetEvaluate> | null = null

export function isWasmBinary(bytes: ArrayBuffer): boolean {
    if (bytes.byteLength < WASM_MAGIC.length) return false
    const header = new Uint8Array(bytes, 0, WASM_MAGIC.length)
    return WASM_MAGIC.every((value, index) => header[index] === value)
}

async function fetchWasmBinary(): Promise<{ readonly bytes: ArrayBuffer; readonly url: string }> {
    const candidates = wasmCandidateUrls()
    const errors: string[] = []
    for (const url of candidates) {
        try {
            const response = await fetchWithTimeout(url, undefined, 10000)
            if (!response.ok) {
                errors.push(`${url}: HTTP ${response.status}`)
                continue
            }
            const bytes = await response.arrayBuffer()
            if (!isWasmBinary(bytes)) {
                const contentType = response.headers.get('content-type') || 'unknown content type'
                errors.push(`${url}: response was not a WASM binary (${contentType})`)
                continue
            }
            return { bytes, url: response.url || url }
        } catch (error: unknown) {
            errors.push(`${url}: ${error instanceof Error ? error.message : String(error)}`)
        }
    }
    throw new Error(`Failed to load go-jsonnet WASM from any known location. ${errors.join('; ')}`)
}

async function instantiateWasm(go: GoRuntime): Promise<WebAssembly.WebAssemblyInstantiatedSource> {
    const { bytes } = await fetchWasmBinary()
    return WebAssembly.instantiate(bytes, go.importObject)
}

export async function ensureJsonnetWasmDirect(): Promise<JsonnetEvaluate> {
    if (!runtimePromise) {
        const promise = (async (): Promise<JsonnetEvaluate> => {
            // Observability: time the one-shot WASM load path (fetch + instantiate
            // + goroutine registration) and tally success/failure. try/finally so
            // the timer stops and the failure counter fires even when load throws.
            const loadTimer = OcdMetrics.timer('lz.wasm.load.ms')
            try {
                if (!globalScope.Go) {
                    throw new Error('Go WASM runtime did not initialize (globalThis.Go missing).')
                }

                const go = new globalScope.Go()
                const result = await instantiateWasm(go)
                go.run(result.instance)

                if (!globalScope.jsonnet_evaluate_snippet) {
                    // The Go main() registers the snippet evaluator on its goroutine;
                    // yield once so the registration lands before we read it.
                    await new Promise((resolve) => setTimeout(resolve, 0))
                }
                if (!globalScope.jsonnet_evaluate_snippet) {
                    throw new Error('go-jsonnet WASM did not expose jsonnet_evaluate_snippet.')
                }
                OcdMetrics.counter('lz.wasm.load.success')
                return globalScope.jsonnet_evaluate_snippet
            } catch (error: unknown) {
                OcdMetrics.counter('lz.wasm.load.failure')
                throw error
            } finally {
                loadTimer.stop()
            }
        })()
        runtimePromise = promise.catch((error: unknown) => {
            runtimePromise = null
            throw error
        })
    }
    return runtimePromise
}

export async function evaluateJsonnetDirect({ filename, code, files, tlaCodes = {} }: EvaluateJsonnetArgs): Promise<string> {
    const evaluate = await ensureJsonnetWasmDirect()
    return evaluate(filename, code, files, {}, {}, {}, tlaCodes)
}

let probePromise: Promise<JsonnetEngineProbe> | null = null

export async function probeJsonnetEngineDirect(): Promise<JsonnetEngineProbe> {
    if (!probePromise) {
        probePromise = ensureJsonnetWasmDirect()
            .then((): JsonnetEngineProbe => ({ available: true }))
            .catch((error: unknown): JsonnetEngineProbe => {
                // Allow a retry on the next probe (ensureJsonnetWasmDirect resets too).
                probePromise = null
                return { available: false, error: error instanceof Error ? error.message : String(error) }
            })
    }
    return probePromise
}
