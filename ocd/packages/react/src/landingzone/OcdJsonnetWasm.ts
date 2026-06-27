/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

/*
** Renderer-side client for the go-jsonnet WASM engine.
**
** Browser/Electron renderers evaluate Jsonnet in a dedicated Web Worker so the
** Landing Zone wizard spinner and controls stay responsive while the OE bundle
** renders. Non-browser test contexts fall back to the direct runtime path.
*/

import { evaluateJsonnetDirect, ensureJsonnetWasmDirect, probeJsonnetEngineDirect } from './OcdJsonnetRuntime'
import {
    EvaluateJsonnetArgs,
    JsonnetEngineProbe,
    JsonnetEvaluate,
    JsonnetRequestOptions,
} from './OcdJsonnetTypes'
import { OcdLogger } from '@ocd/core'

export type { EvaluateJsonnetArgs, JsonnetEngineProbe, JsonnetEvaluate, JsonnetRequestOptions }

const DEFAULT_EVALUATE_TIMEOUT_MS = 30_000
const DEFAULT_PROBE_TIMEOUT_MS = 10_000
const logger = OcdLogger.scope('renderer.jsonnet')

type JsonnetWorkerRequest =
    | { id: number; type: 'evaluate'; args: EvaluateJsonnetArgs }
    | { id: number; type: 'probe' }

type JsonnetWorkerRequestPayload =
    | { type: 'evaluate'; args: EvaluateJsonnetArgs }
    | { type: 'probe' }

type JsonnetWorkerResponse<T> =
    | { id: number; ok: true; result: T }
    | { id: number; ok: false; error: string }

let worker: Worker | null = null
let nextRequestId = 1

const supportsWorker = (): boolean => typeof Worker !== 'undefined'

const createJsonnetWorker = (): Worker =>
    new Worker(new URL('./OcdJsonnetWorker.ts', import.meta.url), { type: 'module' })

const resetWorker = (): void => {
    if (worker) worker.terminate()
    worker = null
}

const getWorker = (): Worker => {
    if (!worker) worker = createJsonnetWorker()
    return worker
}

const postWorkerRequest = <T>(
    request: JsonnetWorkerRequestPayload,
    timeoutMs: number,
): Promise<T> => {
    const activeWorker = getWorker()
    const id = nextRequestId++

    return new Promise<T>((resolve, reject) => {
        let timeout: ReturnType<typeof setTimeout> | undefined
        const cleanup = (): void => {
            if (timeout) clearTimeout(timeout)
            activeWorker.removeEventListener('message', onMessage)
            activeWorker.removeEventListener('error', onError)
            activeWorker.removeEventListener('messageerror', onMessageError)
        }
        const onMessage = (event: MessageEvent<JsonnetWorkerResponse<T>>): void => {
            const response = event.data
            if (response.id !== id) return
            cleanup()
            if (response.ok) resolve(response.result)
            else reject(new Error(response.error))
        }
        const onError = (event: ErrorEvent): void => {
            cleanup()
            resetWorker()
            reject(new Error(event.message || 'Jsonnet worker failed.'))
        }
        const onMessageError = (): void => {
            cleanup()
            resetWorker()
            reject(new Error('Jsonnet worker message could not be deserialized.'))
        }

        timeout = setTimeout(() => {
            cleanup()
            resetWorker()
            reject(new Error(`Jsonnet evaluation timed out after ${timeoutMs}ms.`))
        }, timeoutMs)

        activeWorker.addEventListener('message', onMessage)
        activeWorker.addEventListener('error', onError)
        activeWorker.addEventListener('messageerror', onMessageError)
        activeWorker.postMessage({ id, ...request } satisfies JsonnetWorkerRequest)
    })
}

const withTimeout = <T>(promise: Promise<T>, timeoutMs: number): Promise<T> =>
    new Promise<T>((resolve, reject) => {
        const timeout = setTimeout(() => {
            reject(new Error(`Jsonnet evaluation timed out after ${timeoutMs}ms.`))
        }, timeoutMs)
        promise.then((value) => {
            clearTimeout(timeout)
            resolve(value)
        }).catch((error) => {
            clearTimeout(timeout)
            reject(error)
        })
    })

const timedJsonnetOperation = async <T>(name: string, operation: () => Promise<T>): Promise<T> => {
    const start = performance.now()
    try {
        const result = await operation()
        logger.debug(`${name} completed`, { durationMs: Math.round(performance.now() - start) })
        return result
    } catch (error: unknown) {
        logger.warn(`${name} failed`, {
            durationMs: Math.round(performance.now() - start),
            error: error instanceof Error ? error.message : String(error),
        })
        throw error
    }
}

export async function ensureJsonnetWasm(): Promise<JsonnetEvaluate> {
    return ensureJsonnetWasmDirect()
}

export async function evaluateJsonnet(
    args: EvaluateJsonnetArgs,
    options: JsonnetRequestOptions = {},
): Promise<string> {
    const timeoutMs = options.timeoutMs ?? DEFAULT_EVALUATE_TIMEOUT_MS
    return timedJsonnetOperation('evaluate', () => supportsWorker()
        ? postWorkerRequest<string>({ type: 'evaluate', args }, timeoutMs)
        : withTimeout(evaluateJsonnetDirect(args), timeoutMs))
}

export async function probeJsonnetEngine(options: JsonnetRequestOptions = {}): Promise<JsonnetEngineProbe> {
    const timeoutMs = options.timeoutMs ?? DEFAULT_PROBE_TIMEOUT_MS
    if (!supportsWorker()) return timedJsonnetOperation('probe', () => probeJsonnetEngineDirect())

    try {
        return await timedJsonnetOperation('probe', () => postWorkerRequest<JsonnetEngineProbe>({ type: 'probe' }, timeoutMs))
    } catch (error: unknown) {
        return { available: false, error: error instanceof Error ? error.message : String(error) }
    }
}
