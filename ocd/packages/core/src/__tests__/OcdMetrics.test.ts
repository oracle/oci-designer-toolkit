/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { afterEach, describe, expect, it } from 'vitest'
import { OcdMetrics } from '../OcdMetrics.js'
import type { OcdMetricRecord, OcdMetricSink } from '../OcdMetrics.js'

function recordingSink(): { sink: OcdMetricSink; records: OcdMetricRecord[] } {
    const records: OcdMetricRecord[] = []
    return { sink: { record: (metric) => records.push(metric) }, records }
}

describe('OcdMetrics', () => {
    // Always return to the env-derived default so one test never leaks a sink
    // into the next (the registry is a module-level singleton).
    afterEach(() => {
        OcdMetrics.resetSink()
    })

    it('timer.stop returns a number and records a timing to the sink', () => {
        const { sink, records } = recordingSink()
        OcdMetrics.setSink(sink)

        const timer = OcdMetrics.timer('test.op.ms', { op: 'unit' })
        const elapsed = timer.stop()

        expect(typeof elapsed).toBe('number')
        expect(elapsed).toBeGreaterThanOrEqual(0)
        expect(records).toHaveLength(1)
        expect(records[0]).toMatchObject({ kind: 'timer', name: 'test.op.ms', labels: { op: 'unit' } })
        expect(records[0].value).toBe(elapsed)
        expect(typeof records[0].timestamp).toBe('number')
    })

    it('timer.stop is idempotent — a second stop records nothing and returns the same value', () => {
        const { sink, records } = recordingSink()
        OcdMetrics.setSink(sink)

        const timer = OcdMetrics.timer('test.idempotent.ms')
        const first = timer.stop()
        const second = timer.stop()

        expect(second).toBe(first)
        expect(records).toHaveLength(1)
    })

    it('counter increments reach the sink (default value and explicit value)', () => {
        const { sink, records } = recordingSink()
        OcdMetrics.setSink(sink)

        OcdMetrics.counter('test.count')
        OcdMetrics.counter('test.count', 5, { outcome: 'success' })

        expect(records).toHaveLength(2)
        expect(records[0]).toMatchObject({ kind: 'counter', name: 'test.count', value: 1 })
        expect(records[0].labels).toBeUndefined()
        expect(records[1]).toMatchObject({ kind: 'counter', name: 'test.count', value: 5, labels: { outcome: 'success' } })
    })

    it('gauge records the supplied value', () => {
        const { sink, records } = recordingSink()
        OcdMetrics.setSink(sink)

        OcdMetrics.gauge('test.gauge', 42)

        expect(records).toHaveLength(1)
        expect(records[0]).toMatchObject({ kind: 'gauge', name: 'test.gauge', value: 42 })
    })

    it('time() records a timer even when the wrapped fn rejects, and re-throws', async () => {
        const { sink, records } = recordingSink()
        OcdMetrics.setSink(sink)

        await expect(
            OcdMetrics.time('test.time.ms', async () => {
                throw new Error('boom')
            }),
        ).rejects.toThrow('boom')

        expect(records).toHaveLength(1)
        expect(records[0]).toMatchObject({ kind: 'timer', name: 'test.time.ms' })
    })

    it('time() returns the wrapped fn result on success', async () => {
        const { sink, records } = recordingSink()
        OcdMetrics.setSink(sink)

        const result = await OcdMetrics.time('test.time.ok.ms', async () => 'done')

        expect(result).toBe('done')
        expect(records).toHaveLength(1)
    })

    it('default (no sink set / metrics off) is a no-op: no throw, nothing recorded', () => {
        const { sink, records } = recordingSink()
        // Prove the default path does not touch a previously-installed sink.
        OcdMetrics.setSink(sink)
        OcdMetrics.resetSink()

        expect(() => {
            OcdMetrics.counter('test.noop')
            OcdMetrics.gauge('test.noop.gauge', 1)
            const timer = OcdMetrics.timer('test.noop.ms')
            expect(typeof timer.stop()).toBe('number')
        }).not.toThrow()

        expect(records).toHaveLength(0)
    })
})
