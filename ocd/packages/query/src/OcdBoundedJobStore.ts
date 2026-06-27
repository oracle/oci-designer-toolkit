/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

/*
** Bounded retention for an in-memory job store.
**
** Long-running web-server processes accumulate completed/cancelled/failed
** ("terminal") job records forever unless they are evicted. `pruneJobs` applies
** two bounds — a TTL on terminal jobs and a maximum retained-job count — while
** never evicting an in-progress job.
**
** The function is deterministic: `now` is injected rather than read from
** `Date.now()`, so the eviction logic is fully testable.
*/

export interface PruneJobsOptions<J> {
    /** Current time in epoch milliseconds (inject `Date.now()` in production). */
    now: number
    /** Terminal jobs whose completion is older than this many ms are removed. */
    ttlMs: number
    /** Maximum number of jobs to retain; oldest terminal jobs evicted first. */
    maxSize: number
    /** Whether a job has reached a terminal state and is eligible for eviction. */
    isTerminal: (job: J) => boolean
    /** Terminal-completion time (epoch ms); undefined when not yet recorded. */
    completedAt: (job: J) => number | undefined
}

/*
** Evict terminal jobs from `jobs` in place. Two passes:
**   1. TTL sweep — remove terminal jobs whose completion predates `now - ttlMs`.
**   2. Size cap — while over `maxSize`, evict the OLDEST terminal jobs first.
** Non-terminal (running/queued) jobs are never evicted, even when this leaves
** the store above `maxSize`.
*/
export function pruneJobs<J>(jobs: Map<string, J>, opts: PruneJobsOptions<J>): void {
    const { now, ttlMs, maxSize, isTerminal, completedAt } = opts

    // Pass 1: TTL sweep.
    for (const [id, job] of jobs) {
        if (!isTerminal(job)) continue
        const completed = completedAt(job)
        if (completed !== undefined && now - completed > ttlMs) {
            jobs.delete(id)
        }
    }

    // Pass 2: size cap. Only terminal jobs are eviction candidates; sort oldest
    // first (an undefined completion time sorts as oldest so it is evicted first).
    if (jobs.size <= maxSize) return
    const terminalByAge = [...jobs.entries()]
        .filter(([, job]) => isTerminal(job))
        .sort(([, a], [, b]) => (completedAt(a) ?? 0) - (completedAt(b) ?? 0))

    let overBy = jobs.size - maxSize
    for (const [id] of terminalByAge) {
        if (overBy <= 0) break
        jobs.delete(id)
        overBy -= 1
    }
}
