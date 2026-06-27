/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

/*
** OcdFetch - shared timeout wrapper around the platform `fetch`.
**
** RATIONALE: A raw `fetch()` has no timeout, so a stalled backend, hung TCP
** connection or unresponsive asset host can block a UI or Electron-main flow
** indefinitely (a single point of failure). `fetchWithTimeout` aborts the
** request after `timeoutMs` and rejects with a clear error, so callers can
** surface a failure instead of hanging forever.
**
** Renderer-safe: relies only on `fetch`, `AbortController` and `setTimeout`
** (all present in browser, worker, Electron-main and Node 18+ contexts). No
** node-only APIs and no third-party dependencies.
*/

export const DEFAULT_FETCH_TIMEOUT_MS = 30000

// Narrow shape for the optional `AbortSignal.any` static (Node 20+/modern
// browsers). Feature-detected at runtime so older runtimes fall back to a
// manual listener chain.
type AbortSignalWithAny = typeof AbortSignal & {
    any?: (signals: AbortSignal[]) => AbortSignal
}

/*
** Combine the caller-supplied signal (if any) with the timeout controller's
** signal so the request aborts when *either* fires. Returns the signal to use
** plus a cleanup function that detaches any listener we attached.
*/
function combineSignals(
    timeoutSignal: AbortSignal,
    callerSignal: AbortSignal | null | undefined,
): { readonly signal: AbortSignal; readonly cleanup: () => void } {
    if (!callerSignal) {
        return { signal: timeoutSignal, cleanup: () => {} }
    }

    const abortSignalCtor = AbortSignal as AbortSignalWithAny
    if (typeof abortSignalCtor.any === 'function') {
        return { signal: abortSignalCtor.any([timeoutSignal, callerSignal]), cleanup: () => {} }
    }

    // Fallback: drive a fresh controller from whichever input aborts first.
    const linked = new AbortController()
    const onAbort = (source: AbortSignal): void => {
        if (!linked.signal.aborted) linked.abort(source.reason)
    }
    const onTimeoutAbort = (): void => onAbort(timeoutSignal)
    const onCallerAbort = (): void => onAbort(callerSignal)

    if (timeoutSignal.aborted) onTimeoutAbort()
    else if (callerSignal.aborted) onCallerAbort()
    else {
        timeoutSignal.addEventListener('abort', onTimeoutAbort, { once: true })
        callerSignal.addEventListener('abort', onCallerAbort, { once: true })
    }

    return {
        signal: linked.signal,
        cleanup: () => {
            timeoutSignal.removeEventListener('abort', onTimeoutAbort)
            callerSignal.removeEventListener('abort', onCallerAbort)
        },
    }
}

/*
** `fetch` with a hard timeout. Aborts after `timeoutMs` and rejects with a
** clear timeout error. A caller-supplied `init.signal` is honoured too: the
** request aborts if either the timeout or the caller's signal fires.
**
** `fetchImpl` defaults to the global `fetch` and exists for testability.
*/
export async function fetchWithTimeout(
    input: RequestInfo | URL,
    init?: RequestInit,
    timeoutMs: number = DEFAULT_FETCH_TIMEOUT_MS,
    fetchImpl: typeof fetch = fetch,
): Promise<Response> {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)
    const { signal, cleanup } = combineSignals(controller.signal, init?.signal)

    try {
        return await fetchImpl(input, { ...init, signal })
    } catch (error: unknown) {
        // The timeout controller fired: surface a clear, actionable message
        // (but only when the caller's own signal was not the cause).
        if (controller.signal.aborted && !(init?.signal?.aborted ?? false)) {
            throw new Error(`fetch timed out after ${timeoutMs}ms`)
        }
        throw error
    } finally {
        clearTimeout(timer)
        cleanup()
    }
}
