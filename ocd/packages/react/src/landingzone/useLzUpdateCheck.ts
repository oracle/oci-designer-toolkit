/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

/*
** React hook wrapping the OCI Landing Zone update check. Runs the (cached) check
** on mount and exposes a refresh(force) action for the Sources & Updates panel.
** The underlying service never throws, so the hook surfaces results, a loading
** flag, and an aggregate `anyUpdate` derived from the per-source statuses.
*/

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { LzSource, OCI_LZ_SOURCES } from './OcdLzSources'
import { LzUpdateStatus, checkLzUpdates } from './OcdLzUpdateCheck'

export interface UseLzUpdateCheck {
    statuses: LzUpdateStatus[]
    loading: boolean
    /** True only if the whole check failed to run (per-source errors live on each status). */
    error: string | null
    /** True when at least one pinned source has an update available. */
    anyUpdate: boolean
    refresh: (force?: boolean) => void
}

export interface UseLzUpdateCheckOptions {
    githubToken?: string
    pinnedRefs?: Record<string, string>
}

const EMPTY_PINNED_REFS: Record<string, string> = {}

export const buildEffectiveLzUpdateSources = (
    sources: readonly LzSource[],
    pinnedRefs: Record<string, string>,
): LzSource[] => sources.map((source) => ({
    ...source,
    pinnedRef: pinnedRefs[source.key] ?? source.pinnedRef,
}))

export interface ShouldForceLzUpdateCheckInput {
    explicitForce: boolean
    pinnedRefsChanged: boolean
    githubTokenChanged: boolean
}

export const shouldForceLzUpdateCheck = ({
    explicitForce,
    pinnedRefsChanged,
    githubTokenChanged,
}: ShouldForceLzUpdateCheckInput): boolean =>
    explicitForce || pinnedRefsChanged || githubTokenChanged

export function useLzUpdateCheck(sources?: LzSource[], options: UseLzUpdateCheckOptions = {}): UseLzUpdateCheck {
    const [statuses, setStatuses] = useState<LzUpdateStatus[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const pinnedRefs = options.pinnedRefs ?? EMPTY_PINNED_REFS
    const githubToken = options.githubToken ?? ''
    const pinnedRefsFingerprint = useMemo(() => JSON.stringify(Object.entries(pinnedRefs).sort(([left], [right]) => left.localeCompare(right))), [pinnedRefs])
    const previousPinnedRefsFingerprint = useRef(pinnedRefsFingerprint)
    const previousGithubToken = useRef(githubToken)
    const effectiveSources = useMemo(
        () => buildEffectiveLzUpdateSources(sources ?? OCI_LZ_SOURCES, pinnedRefs),
        [sources, pinnedRefs],
    )

    const load = useCallback(
        async (force: boolean, cancelledRef?: { current: boolean }) => {
            setLoading(true)
            setError(null)
            try {
                const result = await checkLzUpdates(effectiveSources, { force, githubToken })
                if (cancelledRef?.current) return
                setStatuses(result)
            } catch (err: unknown) {
                // checkLzUpdates is defensive, but guard anyway so the hook never crashes.
                if (cancelledRef?.current) return
                setError(err instanceof Error ? err.message : 'Update check unavailable.')
            } finally {
                if (!cancelledRef?.current) setLoading(false)
            }
        },
        [effectiveSources, githubToken],
    )

    useEffect(() => {
        const cancelledRef = { current: false }
        const pinnedRefsChanged = previousPinnedRefsFingerprint.current !== pinnedRefsFingerprint
        const githubTokenChanged = previousGithubToken.current !== githubToken
        previousPinnedRefsFingerprint.current = pinnedRefsFingerprint
        previousGithubToken.current = githubToken
        void load(shouldForceLzUpdateCheck({ explicitForce: false, pinnedRefsChanged, githubTokenChanged }), cancelledRef)
        return () => {
            cancelledRef.current = true
        }
    }, [githubToken, load, pinnedRefsFingerprint])

    const refresh = useCallback(
        (force = true) => {
            void load(force)
        },
        [load],
    )

    // Private/unreachable sources (status.unavailable) never count as updates —
    // a 404 on a project-addon source must not trigger the update banner.
    const anyUpdate = statuses.some((status) => status.updateAvailable && !status.unavailable)

    return { statuses, loading, error, anyUpdate, refresh }
}
