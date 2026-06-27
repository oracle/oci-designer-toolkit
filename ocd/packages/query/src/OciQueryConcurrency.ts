/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

/*
** Maximum number of OCI SDK requests a single fan-out (e.g. one list call per
** compartment) will have in flight at any one time. Stops queryTenancy from
** firing an unbounded number of simultaneous requests when a tenancy has a
** large number of compartments.
*/
export const QUERY_CONCURRENCY_LIMIT = 12

/*
** Lightweight promise pool. Starts at most `limit` tasks at any one time whilst
** returning one promise per task, in task order, so callers can continue to use
** Promise.allSettled() and tolerate individual failures exactly as they would
** with an eagerly started array of promises.
*/
export function runWithConcurrency<T>(tasks: (() => Promise<T>)[], limit: number): Promise<T>[] {
    const maxActive = Math.max(1, limit)
    let active = 0
    const queued: (() => void)[] = []
    const startNext = () => {
        active -= 1
        const start = queued.shift()
        if (start !== undefined) start()
    }
    return tasks.map((task) => new Promise<T>((resolve, reject) => {
        const start = () => {
            active += 1
            Promise.resolve().then(task).then(
                (value) => {startNext(); resolve(value)},
                (reason) => {startNext(); reject(reason)}
            )
        }
        if (active < maxActive) start()
        else queued.push(start)
    }))
}

/*
** Default retry policy for transient OCI SDK failures. Three total attempts
** (one initial + two retries) with exponential backoff so a single throttled or
** briefly-unavailable compartment recovers without failing the whole fan-out.
*/
export const DEFAULT_RETRY_ATTEMPTS = 3
export const DEFAULT_RETRY_BASE_MS = 200
export const DEFAULT_RETRY_MAX_MS = 5000

/*
** Node/network-level error codes worth retrying. OCI SDK surfaces HTTP failures
** via `statusCode`; lower-level transport failures surface via `code`.
*/
const RETRYABLE_NETWORK_CODES = new Set<string>([
    'ECONNRESET', 'ECONNREFUSED', 'ETIMEDOUT', 'EAI_AGAIN', 'EPIPE', 'ENETUNREACH',
])

export interface RetryOptions {
    /* Total attempts including the first; default DEFAULT_RETRY_ATTEMPTS. */
    attempts?: number
    /* Base backoff in ms (doubled per attempt); default DEFAULT_RETRY_BASE_MS. */
    baseMs?: number
    /* Upper bound on a single backoff delay; default DEFAULT_RETRY_MAX_MS. */
    maxMs?: number
    /* Decide whether a failure reason is worth retrying; default isRetryableOciError. */
    isRetryable?: (reason: unknown) => boolean
    /* Injectable delay (tests pass a no-op or recorder to stay deterministic). */
    sleep?: (ms: number) => Promise<void>
    /* Injectable jitter source in [0,1); tests pass a constant. */
    random?: () => number
}

/*
** Retry only on transient conditions: OCI throttling (429), server errors (5xx),
** or transport-level network failures. Client errors (4xx other than 429), auth
** failures, and not-found are returned to the caller immediately — retrying them
** only wastes time and aggravates rate limits.
*/
export function isRetryableOciError(reason: unknown): boolean {
    const statusCode = (reason as { statusCode?: unknown })?.statusCode
    if (typeof statusCode === 'number') return statusCode === 429 || statusCode >= 500
    const code = (reason as { code?: unknown })?.code
    if (typeof code === 'string') return RETRYABLE_NETWORK_CODES.has(code)
    return false
}

/*
** Wrap a task thunk so it retries transient failures with exponential backoff
** and jitter, then re-throws the last reason. Returns a thunk of the same shape
** as runWithConcurrency expects, so the two compose: a per-request retry sits
** inside the concurrency pool and a persistent failure still falls through to
** Promise.allSettled / collectSettled (partial-result tolerance preserved).
*/
export function withRetry<T>(task: () => Promise<T>, options: RetryOptions = {}): () => Promise<T> {
    const attempts = Math.max(1, options.attempts ?? DEFAULT_RETRY_ATTEMPTS)
    const baseMs = Math.max(0, options.baseMs ?? DEFAULT_RETRY_BASE_MS)
    const maxMs = Math.max(baseMs, options.maxMs ?? DEFAULT_RETRY_MAX_MS)
    const isRetryable = options.isRetryable ?? isRetryableOciError
    const sleep = options.sleep ?? ((ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms)))
    const random = options.random ?? Math.random
    return async () => {
        let lastReason: unknown
        for (let attempt = 0; attempt < attempts; attempt += 1) {
            try {
                return await task()
            } catch (reason) {
                lastReason = reason
                const isLastAttempt = attempt === attempts - 1
                if (isLastAttempt || !isRetryable(reason)) throw reason
                const backoff = Math.min(maxMs, baseMs * 2 ** attempt)
                const jitter = backoff * 0.5 * random()
                await sleep(backoff + jitter)
            }
        }
        // Unreachable when attempts >= 1, but keeps the type checker satisfied.
        throw lastReason
    }
}
