/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

import { describe, it, expect } from 'vitest'
import { pruneJobs } from '../OcdBoundedJobStore.js'

/* Minimal job shape mirroring the terminal/non-terminal + completion-time
** contract that OcdLzAddonUpdater feeds into pruneJobs. `now` is always
** injected so eviction is deterministic. */
interface TestJob {
    state: 'running' | 'succeeded' | 'failed' | 'cancelled'
    completedAt?: number
}

const TERMINAL = new Set(['succeeded', 'failed', 'cancelled'])
const isTerminal = (j: TestJob): boolean => TERMINAL.has(j.state)
const completedAt = (j: TestJob): number | undefined => (isTerminal(j) ? j.completedAt : undefined)

const DAY_MS = 24 * 60 * 60 * 1000

const makeStore = (jobs: Array<[string, TestJob]>): Map<string, TestJob> => new Map(jobs)

describe('pruneJobs', () => {
    it('caps total size and retains the NEWEST terminal jobs when over maxSize', () => {
        const now = 10_000_000
        const maxSize = 100
        // Insert 150 terminal jobs with strictly increasing completion times.
        const entries: Array<[string, TestJob]> = Array.from({ length: 150 }, (_, i) => [
            `job-${i}`,
            { state: 'succeeded', completedAt: now - (150 - i) },
        ])
        const store = makeStore(entries)

        pruneJobs(store, { now, ttlMs: DAY_MS, maxSize, isTerminal, completedAt })

        expect(store.size).toBe(maxSize)
        // The 50 oldest (job-0..job-49) are evicted; the newest survive.
        expect(store.has('job-0')).toBe(false)
        expect(store.has('job-49')).toBe(false)
        expect(store.has('job-50')).toBe(true)
        expect(store.has('job-149')).toBe(true)
    })

    it('removes a terminal job whose completion is older than the TTL', () => {
        const now = 10_000_000
        const store = makeStore([
            ['fresh', { state: 'succeeded', completedAt: now - 1_000 }],
            ['stale', { state: 'failed', completedAt: now - DAY_MS - 1 }],
            ['exactly-ttl', { state: 'cancelled', completedAt: now - DAY_MS }],
        ])

        pruneJobs(store, { now, ttlMs: DAY_MS, maxSize: 1000, isTerminal, completedAt })

        expect(store.has('fresh')).toBe(true)
        // Strictly older than the TTL boundary is evicted; exactly-at-TTL is kept.
        expect(store.has('stale')).toBe(false)
        expect(store.has('exactly-ttl')).toBe(true)
    })

    it('NEVER evicts a running job, even when over cap and past TTL', () => {
        const now = 10_000_000
        // A running job that is ancient (note: completedAt is ignored for
        // non-terminal jobs) alongside a stale terminal job, with maxSize 0.
        const store = makeStore([
            ['running-old', { state: 'running' }],
            ['terminal-old', { state: 'succeeded', completedAt: now - 10 * DAY_MS }],
        ])

        pruneJobs(store, { now, ttlMs: DAY_MS, maxSize: 0, isTerminal, completedAt })

        // Stale terminal job is removed; the running job is retained despite
        // being past every bound (maxSize 0 cannot force a running eviction).
        expect(store.has('terminal-old')).toBe(false)
        expect(store.has('running-old')).toBe(true)
        expect(store.size).toBe(1)
    })

    it('keeps running jobs but still bounds terminal jobs when both exceed cap', () => {
        const now = 10_000_000
        const store = makeStore([
            ['run-1', { state: 'running' }],
            ['run-2', { state: 'running' }],
            ['done-old', { state: 'succeeded', completedAt: now - 5_000 }],
            ['done-new', { state: 'succeeded', completedAt: now - 1_000 }],
        ])

        // maxSize 3 with 2 running + 2 terminal: one terminal (oldest) must go.
        pruneJobs(store, { now, ttlMs: DAY_MS, maxSize: 3, isTerminal, completedAt })

        expect(store.has('run-1')).toBe(true)
        expect(store.has('run-2')).toBe(true)
        expect(store.has('done-old')).toBe(false)
        expect(store.has('done-new')).toBe(true)
        expect(store.size).toBe(3)
    })

    it('leaves the store untouched when within bounds', () => {
        const now = 10_000_000
        const store = makeStore([
            ['a', { state: 'succeeded', completedAt: now - 1 }],
            ['b', { state: 'running' }],
        ])

        pruneJobs(store, { now, ttlMs: DAY_MS, maxSize: 1000, isTerminal, completedAt })

        expect(store.size).toBe(2)
    })
})
