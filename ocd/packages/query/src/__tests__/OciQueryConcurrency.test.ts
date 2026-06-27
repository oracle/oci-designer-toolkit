/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { describe, it, expect } from 'vitest'
import {
    runWithConcurrency,
    withRetry,
    isRetryableOciError,
} from '../OciQueryConcurrency.js'

/* Deterministic test harness: record backoff delays instead of waiting, and
** pin jitter to zero so asserted delays are exact. */
const recorder = () => {
    const delays: number[] = []
    const sleep = async (ms: number): Promise<void> => {
        delays.push(ms)
    }
    return { delays, sleep, random: () => 0 }
}

describe('runWithConcurrency', () => {
    it('never exceeds the active limit and preserves task order', async () => {
        let active = 0
        let peak = 0
        const tasks = Array.from({ length: 10 }, (_, i) => async () => {
            active += 1
            peak = Math.max(peak, active)
            await Promise.resolve()
            active -= 1
            return i
        })
        const results = await Promise.all(runWithConcurrency(tasks, 3))
        expect(peak).toBeLessThanOrEqual(3)
        expect(results).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
    })

    it('tolerates individual rejections via allSettled', async () => {
        const tasks = [
            async () => 'ok',
            async () => { throw new Error('boom') },
        ]
        const settled = await Promise.allSettled(runWithConcurrency(tasks, 2))
        expect(settled[0]).toMatchObject({ status: 'fulfilled', value: 'ok' })
        expect(settled[1].status).toBe('rejected')
    })
})

describe('isRetryableOciError', () => {
    it('retries throttling and server errors', () => {
        expect(isRetryableOciError({ statusCode: 429 })).toBe(true)
        expect(isRetryableOciError({ statusCode: 500 })).toBe(true)
        expect(isRetryableOciError({ statusCode: 503 })).toBe(true)
    })
    it('does not retry client errors or auth failures', () => {
        expect(isRetryableOciError({ statusCode: 400 })).toBe(false)
        expect(isRetryableOciError({ statusCode: 401 })).toBe(false)
        expect(isRetryableOciError({ statusCode: 404 })).toBe(false)
    })
    it('retries known transport-level network codes', () => {
        expect(isRetryableOciError({ code: 'ECONNRESET' })).toBe(true)
        expect(isRetryableOciError({ code: 'ETIMEDOUT' })).toBe(true)
        expect(isRetryableOciError({ code: 'NOPE' })).toBe(false)
    })
    it('defaults to non-retryable for unknown shapes', () => {
        expect(isRetryableOciError(new Error('plain'))).toBe(false)
        expect(isRetryableOciError(undefined)).toBe(false)
    })
})

describe('withRetry', () => {
    it('resolves on first success without sleeping', async () => {
        const { delays, sleep, random } = recorder()
        let calls = 0
        const task = withRetry(async () => { calls += 1; return 'value' }, { sleep, random })
        await expect(task()).resolves.toBe('value')
        expect(calls).toBe(1)
        expect(delays).toEqual([])
    })

    it('retries a retryable failure twice then succeeds', async () => {
        const { delays, sleep, random } = recorder()
        let calls = 0
        const task = withRetry(async () => {
            calls += 1
            if (calls < 3) throw { statusCode: 429 }
            return 'recovered'
        }, { sleep, random, baseMs: 100 })
        await expect(task()).resolves.toBe('recovered')
        expect(calls).toBe(3)
        // Exponential backoff with zero jitter: 100, then 200.
        expect(delays).toEqual([100, 200])
    })

    it('does not retry a non-retryable failure', async () => {
        const { delays, sleep, random } = recorder()
        let calls = 0
        const task = withRetry(async () => { calls += 1; throw { statusCode: 400 } }, { sleep, random })
        await expect(task()).rejects.toMatchObject({ statusCode: 400 })
        expect(calls).toBe(1)
        expect(delays).toEqual([])
    })

    it('gives up after the configured attempts and rethrows the last reason', async () => {
        const { delays, sleep, random } = recorder()
        let calls = 0
        const task = withRetry(async () => { calls += 1; throw { statusCode: 503 } }, { attempts: 3, baseMs: 50, sleep, random })
        await expect(task()).rejects.toMatchObject({ statusCode: 503 })
        expect(calls).toBe(3)
        // Two backoffs between three attempts: 50, then 100.
        expect(delays).toEqual([50, 100])
    })

    it('caps a single backoff delay at maxMs', async () => {
        const { delays, sleep, random } = recorder()
        let calls = 0
        const task = withRetry(async () => {
            calls += 1
            if (calls < 3) throw { statusCode: 500 }
            return 'ok'
        }, { sleep, random, baseMs: 1000, maxMs: 1500 })
        await task()
        // 1000, then min(2000, 1500) = 1500.
        expect(delays).toEqual([1000, 1500])
    })

    it('composes with runWithConcurrency: a transient failure recovers in the pool', async () => {
        const { sleep, random } = recorder()
        let firstCalls = 0
        const tasks = [
            withRetry(async () => { firstCalls += 1; if (firstCalls < 2) throw { statusCode: 500 }; return 'a' }, { sleep, random }),
            withRetry(async () => 'b', { sleep, random }),
        ]
        const settled = await Promise.allSettled(runWithConcurrency(tasks, 2))
        expect(settled.map((s) => (s.status === 'fulfilled' ? s.value : null))).toEqual(['a', 'b'])
        expect(firstCalls).toBe(2)
    })
})
