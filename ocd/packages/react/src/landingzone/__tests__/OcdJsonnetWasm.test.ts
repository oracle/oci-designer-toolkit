/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

/*
** Unit tests for the `probeJsonnetEngine` health probe. The wasm_exec side
** effect shim is mocked away so the probe runs against a controlled
** `globalThis.Go` (or its absence) instead of the real Go runtime.
*/

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../wasm/wasmExec', () => ({}))

type JsonnetTestGlobals = {
    Go?: unknown
    jsonnet_evaluate_snippet?: unknown
}
const testGlobals = globalThis as JsonnetTestGlobals

// Each test re-imports a fresh module instance so the probe / runtime caches
// inside OcdJsonnetWasm.ts start empty.
async function loadModule() {
    vi.resetModules()
    return await import('../OcdJsonnetWasm')
}

interface FakeWorkerMessage {
    id: number
    type: string
    args?: unknown
}

class FakeWorker {
    static instances: FakeWorker[] = []

    messages: FakeWorkerMessage[] = []
    terminated = false
    private readonly listeners = new Map<string, Set<(event: any) => void>>()

    constructor() {
        FakeWorker.instances.push(this)
    }

    addEventListener(type: string, listener: (event: any) => void): void {
        const listeners = this.listeners.get(type) ?? new Set<(event: any) => void>()
        listeners.add(listener)
        this.listeners.set(type, listeners)
    }

    removeEventListener(type: string, listener: (event: any) => void): void {
        this.listeners.get(type)?.delete(listener)
    }

    postMessage(message: FakeWorkerMessage): void {
        this.messages.push(message)
    }

    emit(type: string, event: any): void {
        this.listeners.get(type)?.forEach((listener) => listener(event))
    }

    terminate(): void {
        this.terminated = true
    }
}

function stubWorkingEngine(): { fetchMock: ReturnType<typeof vi.fn> } {
    const fakeEvaluate = async (): Promise<string> => '{}'
    class FakeGo {
        importObject = {}
        run(): void {
            testGlobals.jsonnet_evaluate_snippet = fakeEvaluate
        }
    }
    testGlobals.Go = FakeGo
    const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        url: 'http://localhost/libjsonnet.wasm',
        headers: new Headers({ 'content-type': 'application/wasm' }),
        arrayBuffer: async () => new Uint8Array([0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00]).buffer,
    })
    vi.stubGlobal('fetch', fetchMock)
    vi.stubGlobal('WebAssembly', {
        instantiate: vi.fn().mockResolvedValue({ instance: {} }),
    })
    return { fetchMock }
}

describe('probeJsonnetEngine', () => {
    beforeEach(() => {
        delete testGlobals.Go
        delete testGlobals.jsonnet_evaluate_snippet
    })

    afterEach(() => {
        vi.unstubAllGlobals()
        FakeWorker.instances = []
        delete testGlobals.Go
        delete testGlobals.jsonnet_evaluate_snippet
    })

    it('resolves unavailable (never rejects) when the Go runtime is missing', async () => {
        const { probeJsonnetEngine } = await loadModule()

        const probe = await probeJsonnetEngine()

        expect(probe.available).toBe(false)
        expect(probe.error).toMatch(/Go WASM runtime did not initialize/)
    })

    it('resolves unavailable with the fetch error when the wasm asset cannot be loaded', async () => {
        class FakeGo {
            importObject = {}
            run(): void {}
        }
        testGlobals.Go = FakeGo
        vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('boom: network down')))
        const { probeJsonnetEngine } = await loadModule()

        const probe = await probeJsonnetEngine()

        expect(probe.available).toBe(false)
        expect(probe.error).toContain('boom: network down')
    })

    it('resolves available and caches the load (no double fetch) on success', async () => {
        const { fetchMock } = stubWorkingEngine()
        const { probeJsonnetEngine } = await loadModule()

        const [first, second] = await Promise.all([probeJsonnetEngine(), probeJsonnetEngine()])
        const third = await probeJsonnetEngine()

        expect(first).toEqual({ available: true })
        expect(second).toEqual({ available: true })
        expect(third).toEqual({ available: true })
        expect(fetchMock).toHaveBeenCalledTimes(1)
    })

    it('skips HTML fallback responses when probing the wasm engine', async () => {
        const fakeEvaluate = async (): Promise<string> => '{}'
        class FakeGo {
            importObject = {}
            run(): void {
                testGlobals.jsonnet_evaluate_snippet = fakeEvaluate
            }
        }
        testGlobals.Go = FakeGo
        const fetchMock = vi.fn()
            .mockResolvedValueOnce({
                ok: true,
                url: 'http://localhost/oci-designer-toolkit/libjsonnet.wasm',
                headers: new Headers({ 'content-type': 'text/html' }),
                arrayBuffer: async () => new TextEncoder().encode('<!DOCTYPE html>').buffer,
            })
            .mockResolvedValueOnce({
                ok: true,
                url: 'http://localhost/libjsonnet.wasm',
                headers: new Headers({ 'content-type': 'application/wasm' }),
                arrayBuffer: async () => new Uint8Array([0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00]).buffer,
            })
        vi.stubGlobal('fetch', fetchMock)
        vi.stubGlobal('WebAssembly', {
            instantiate: vi.fn().mockResolvedValue({ instance: {} }),
        })
        const { probeJsonnetEngine } = await loadModule()

        const probe = await probeJsonnetEngine()

        expect(probe).toEqual({ available: true })
        expect(fetchMock).toHaveBeenCalledTimes(2)
    })

    it('retries after a failed probe instead of caching the failure', async () => {
        const { probeJsonnetEngine } = await loadModule()

        const failed = await probeJsonnetEngine()
        expect(failed.available).toBe(false)

        // Environment recovers: install a working engine and re-probe.
        stubWorkingEngine()
        const recovered = await probeJsonnetEngine()
        expect(recovered).toEqual({ available: true })
    })

    it('routes evaluateJsonnet through a Web Worker when one is available', async () => {
        vi.stubGlobal('Worker', FakeWorker)
        const { evaluateJsonnet } = await loadModule()

        const result = evaluateJsonnet({
            filename: '/gen/main.jsonnet',
            code: '{}',
            files: { '/gen/main.jsonnet': '{}' },
        })
        const worker = FakeWorker.instances[0]
        const message = worker.messages[0]

        expect(message.type).toBe('evaluate')
        expect(message.args).toMatchObject({ filename: '/gen/main.jsonnet' })

        worker.emit('message', { data: { id: message.id, ok: true, result: '{"network":{}}' } })

        await expect(result).resolves.toBe('{"network":{}}')
    })

    it('terminates and rejects when a worker evaluation times out', async () => {
        vi.stubGlobal('Worker', FakeWorker)
        const { evaluateJsonnet } = await loadModule()

        const result = evaluateJsonnet({
            filename: '/gen/main.jsonnet',
            code: '{}',
            files: { '/gen/main.jsonnet': '{}' },
        }, { timeoutMs: 1 })
        const worker = FakeWorker.instances[0]

        await expect(result).rejects.toThrow(/Jsonnet evaluation timed out/)
        expect(worker.terminated).toBe(true)
    })

    it('probes the engine through the worker in browser contexts', async () => {
        vi.stubGlobal('Worker', FakeWorker)
        const { probeJsonnetEngine } = await loadModule()

        const result = probeJsonnetEngine()
        const worker = FakeWorker.instances[0]
        const message = worker.messages[0]
        expect(message.type).toBe('probe')

        worker.emit('message', { data: { id: message.id, ok: true, result: { available: true } } })

        await expect(result).resolves.toEqual({ available: true })
    })
})
