/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { describe, it, expect, vi } from 'vitest'
import { fetchWithTimeout, DEFAULT_FETCH_TIMEOUT_MS } from '../OcdFetch.js'

describe('fetchWithTimeout', () => {
    it('exposes a 30s default timeout', () => {
        expect(DEFAULT_FETCH_TIMEOUT_MS).toBe(30000)
    })

    it('resolves with the Response when the fetch resolves quickly', async () => {
        const expected = new Response('ok', { status: 200 })
        const fetchImpl = vi.fn(async () => expected) as unknown as typeof fetch

        const response = await fetchWithTimeout('https://example.test/fast', undefined, 1000, fetchImpl)

        expect(response).toBe(expected)
        expect(fetchImpl).toHaveBeenCalledTimes(1)
    })

    it('rejects with a clear timeout error when the fetch never resolves', async () => {
        // Stub that resolves only when its abort signal fires — mirrors a real
        // fetch honouring AbortController, so the timeout path is exercised
        // deterministically with real timers and a tiny timeout.
        const fetchImpl = vi.fn((_input: RequestInfo | URL, init?: RequestInit) =>
            new Promise<Response>((_resolve, reject) => {
                const signal = init?.signal
                if (!signal) return
                signal.addEventListener('abort', () => reject(new Error('aborted')), { once: true })
            }),
        ) as unknown as typeof fetch

        await expect(
            fetchWithTimeout('https://example.test/hang', undefined, 10, fetchImpl),
        ).rejects.toThrow('fetch timed out after 10ms')
    })

    it('propagates a caller-supplied abort distinctly from a timeout', async () => {
        const controller = new AbortController()
        const fetchImpl = vi.fn((_input: RequestInfo | URL, init?: RequestInit) =>
            new Promise<Response>((_resolve, reject) => {
                init?.signal?.addEventListener('abort', () => reject(new Error('caller aborted')), { once: true })
            }),
        ) as unknown as typeof fetch

        const pending = fetchWithTimeout('https://example.test/cancel', { signal: controller.signal }, 5000, fetchImpl)
        controller.abort()

        // Caller-driven abort must not be reported as a timeout.
        await expect(pending).rejects.not.toThrow('fetch timed out')
    })
})
