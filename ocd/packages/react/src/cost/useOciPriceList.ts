/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

/*
** React hook that resolves a usable PriceMap for the requested part numbers and
** currency. Always resolves: live prices (Electron main / web proxy via the
** facade) are merged over the bundled offline snapshot. If the live fetch
** rejects or returns nothing usable, the snapshot is used and an error string
** is surfaced (the snapshot fallback never silently swallows the failure).
**
** The bundled snapshot (a large generated table) is loaded via dynamic
** `import()` so bundlers split it into its own chunk instead of shipping it in
** the entry bundle; the hook starts with an empty map + `loading: true` and
** seeds the snapshot as soon as the chunk resolves.
**
** On the WEB build, live prices are additionally cached in localStorage for
** 24h (OcdPriceListWebCache) so repeat visits skip the cetools fetch. The
** Electron build is unaffected: its main process already disk-caches pricing,
** so the web cache layer disables itself when `window.ocdAPI` exists.
*/

import { useEffect, useMemo, useState } from 'react'
import type { PriceMap } from '@ocd/query/pricing'
import { OciApiFacade } from '../facade/OciApiFacade'
import { resolveLivePriceMap } from './OcdPriceListWebCache'

export type PriceListSource = 'live' | 'snapshot'

export interface UseOciPriceListResult {
    priceMap: PriceMap
    loading: boolean
    error: string | null
    source: PriceListSource
    /** Capture date (YYYY-MM-DD) of the bundled offline price snapshot ('' until the snapshot chunk loads). */
    snapshotDate: string
}

export function useOciPriceList(partNumbers: string[], currency: string): UseOciPriceListResult {
    // Stable key so the effect only re-runs when the actual parts/currency change.
    const partsKey = useMemo(() => Array.from(new Set(partNumbers)).sort().join(','), [partNumbers])

    const [priceMap, setPriceMap] = useState<PriceMap>({})
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)
    const [source, setSource] = useState<PriceListSource>('snapshot')
    const [snapshotDate, setSnapshotDate] = useState<string>('')

    useEffect(() => {
        let cancelled = false
        const parts = partsKey.length > 0 ? partsKey.split(',') : []

        setLoading(true)
        setError(null)
        setSource('snapshot')

        const load = async (): Promise<void> => {
            // Code-split: the generated snapshot table only loads when pricing is
            // actually requested (e.g. the BoM / cost-estimate page).
            const { getSnapshotPriceMap, OCI_PRICE_SNAPSHOT_DATE } = await import('../data/OciPriceListSnapshot')
            if (cancelled) return
            const snapshot = getSnapshotPriceMap(currency)
            setSnapshotDate(OCI_PRICE_SNAPSHOT_DATE)
            // Seed with the snapshot immediately so the UI always has data.
            setPriceMap(snapshot)
            setSource('snapshot')

            if (parts.length === 0) {
                setLoading(false)
                return
            }

            // resolveLivePriceMap never rejects: it wraps the facade fetch with
            // the web localStorage cache (fresh hit skips the fetch; stale entry
            // rescues a failed fetch) and falls through to `{}` + error string.
            // On desktop (`window.ocdAPI`) it is a plain pass-through to the
            // facade — the Electron main process owns its own disk cache.
            const { priceMap: live, error: liveError } = await resolveLivePriceMap(parts, currency, OciApiFacade.getOciPriceList)
            if (cancelled) return
            if (Object.keys(live).length > 0) {
                setPriceMap({ ...snapshot, ...live })
                setSource('live')
                setError(null)
            } else {
                // No live or cached data came back; keep snapshot and note it.
                setPriceMap(snapshot)
                setSource('snapshot')
                setError(liveError)
            }
            setLoading(false)
        }

        load().catch((err: unknown) => {
            // Snapshot chunk itself failed to load — surface it, never swallow.
            if (cancelled) return
            const message = err instanceof Error ? err.message : String(err)
            setError(`Price snapshot failed to load (${message}).`)
            setLoading(false)
        })

        return () => {
            cancelled = true
        }
    }, [partsKey, currency])

    return { priceMap, loading, error, source, snapshotDate }
}
