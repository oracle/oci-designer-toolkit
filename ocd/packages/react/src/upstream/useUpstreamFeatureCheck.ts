/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

/*
** React hook wrapping the upstream OKIT feature-availability check.
** Mirrors the shape and lifecycle of useLzUpdateCheck so callers can use both
** hooks symmetrically, and so the banner can remain a single component.
**
** The underlying service never throws; this hook surfaces the status, a loading
** flag, and a derived `hasNewFeatures` boolean so the banner can decide whether
** to show the upstream row.
*/

import { useCallback, useEffect, useState } from 'react'
import {
    UpstreamStatus,
    UpstreamCheckOptions,
    checkUpstream,
} from './OcdUpstreamCheck'

export interface UseUpstreamFeatureCheck {
    status: UpstreamStatus | null
    loading: boolean
    /** True when the check itself could not run (per-field errors live on status.error). */
    error: string | null
    /**
     * True when upstream has moved ahead of the fork's baseline or when new
     * resource hints are available.  False until the first successful check.
     */
    hasNewFeatures: boolean
    refresh: (force?: boolean) => void
}

export function useUpstreamFeatureCheck(): UseUpstreamFeatureCheck {
    const [status, setStatus] = useState<UpstreamStatus | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const load = useCallback(
        async (opts: UpstreamCheckOptions, cancelledRef?: { current: boolean }) => {
            setLoading(true)
            setError(null)
            try {
                const result = await checkUpstream(opts)
                if (cancelledRef?.current) return
                setStatus(result)
                if (result.error) {
                    // Surface the per-status error as a hook-level error for the banner.
                    setError(result.error)
                }
            } catch (err: unknown) {
                // checkUpstream is defensive, but guard anyway so the hook never crashes.
                if (cancelledRef?.current) return
                const msg = err instanceof Error ? err.message : 'Upstream feature check unavailable.'
                setError(msg)
            } finally {
                if (!cancelledRef?.current) setLoading(false)
            }
        },
        [],
    )

    useEffect(() => {
        const cancelledRef = { current: false }
        void load({}, cancelledRef)
        return () => {
            cancelledRef.current = true
        }
    }, [load])

    const refresh = useCallback(
        (force = true) => {
            void load({ force })
        },
        [load],
    )

    const hasNewFeatures =
        status !== null &&
        !status.error &&
        (status.behindBy > 0 || status.newResourceHints.length > 0)

    return { status, loading, error, hasNewFeatures, refresh }
}
