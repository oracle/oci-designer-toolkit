/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

/*
** localStorage-backed price-list cache for the WEB build.
**
** Mirrors the desktop disk cache (Electron main process,
** desktop/src/handlers/OciPriceListHandlers.ts): same 24h TTL, same
** `{savedAt, priceMap}` entry shape keyed by currency, same merge semantics
** (old entry merged under fresh live data) and the same stale-entry fallback
** when a live fetch fails. The Electron renderer never uses this module's
** cache: `isWebPricingRuntime()` is false when `window.ocdAPI` exists, so
** desktop pricing keeps flowing through the main-process cache only and is
** never double-cached here.
**
** All localStorage access is best-effort: quota errors, privacy modes that
** throw on access, and missing/disabled storage all degrade silently to
** no-cache behaviour (every read returns undefined, every write is a no-op).
*/

import type { PriceMap } from '@ocd/query/pricing'

export const PRICE_LIST_CACHE_TTL_MS = 24 * 60 * 60 * 1000 // 24 hours, matches the desktop disk cache TTL
const CACHE_KEY_PREFIX = 'ocd.priceList.'

export interface WebPriceCacheEntry {
    savedAt: number
    priceMap: PriceMap
}

export type PriceListFetcher = (partNumbers: string[], currency: string) => Promise<PriceMap>

export interface ResolvedLivePrices {
    /** Live or cache-derived prices for the requested parts ({} when nothing usable). */
    priceMap: PriceMap
    /** Non-null only when neither live nor cached data was available. */
    error: string | null
}

const cacheKey = (currency: string): string => `${CACHE_KEY_PREFIX}${(currency || 'USD').toUpperCase()}`

/*
** True when pricing should use this module's cache: any non-Electron runtime.
** In Electron (`window.ocdAPI` present) the main process already owns a 24h
** disk cache, so caching again here would only serve stale data twice.
*/
export const isWebPricingRuntime = (): boolean => typeof window === 'undefined' || !window.ocdAPI

const pickParts = (priceMap: PriceMap, partNumbers: string[]): PriceMap =>
    partNumbers.reduce<PriceMap>((acc, p) => {
        if (p in priceMap) acc[p] = priceMap[p]
        return acc
    }, {})

const readEntry = (currency: string): WebPriceCacheEntry | undefined => {
    try {
        if (typeof localStorage === 'undefined' || localStorage === null) return undefined
        const raw = localStorage.getItem(cacheKey(currency))
        if (!raw) return undefined
        const parsed = JSON.parse(raw) as WebPriceCacheEntry
        if (!parsed || typeof parsed.savedAt !== 'number' || typeof parsed.priceMap !== 'object' || parsed.priceMap === null) return undefined
        return parsed
    } catch {
        // Disabled storage / privacy mode / corrupt JSON: behave as cache miss.
        return undefined
    }
}

/*
** Fresh (within TTL) cache hit covering ALL requested parts, or undefined.
** A partial hit is treated as a miss so a live fetch can fill the gaps.
*/
export const readFreshCachedPrices = (currency: string, partNumbers: string[], now: number = Date.now()): PriceMap | undefined => {
    if (partNumbers.length === 0) return undefined
    const entry = readEntry(currency)
    if (!entry || now - entry.savedAt >= PRICE_LIST_CACHE_TTL_MS) return undefined
    if (!partNumbers.every((p) => p in entry.priceMap)) return undefined
    return pickParts(entry.priceMap, partNumbers)
}

/*
** Whatever cached prices exist for the requested parts, ignoring TTL.
** Used only as a fallback after a failed/empty live fetch (mirrors the
** desktop handler's stale-entry fallback). Undefined when nothing matches.
*/
export const readStaleCachedPrices = (currency: string, partNumbers: string[]): PriceMap | undefined => {
    const entry = readEntry(currency)
    if (!entry) return undefined
    const picked = pickParts(entry.priceMap, partNumbers)
    return Object.keys(picked).length > 0 ? picked : undefined
}

/*
** Persist live prices, merging over any previous entry (old parts are kept,
** fresh prices win) — identical merge semantics to the desktop disk cache.
** On write failure (e.g. QuotaExceededError) the entry is pruned so a stale
** or oversized entry never lingers; pruning failures are ignored too.
*/
export const writeCachedPrices = (currency: string, live: PriceMap, now: number = Date.now()): void => {
    try {
        if (typeof localStorage === 'undefined' || localStorage === null) return
        const merged: PriceMap = { ...(readEntry(currency)?.priceMap ?? {}), ...live }
        const entry: WebPriceCacheEntry = { savedAt: now, priceMap: merged }
        localStorage.setItem(cacheKey(currency), JSON.stringify(entry))
    } catch {
        try {
            localStorage.removeItem(cacheKey(currency))
        } catch {
            // Storage entirely unavailable: nothing to prune.
        }
    }
}

/*
** Resolve live prices for the requested parts, never rejecting:
**  1. fresh cache covering all parts  -> cached prices, no fetch (web only)
**  2. live fetch succeeds (non-empty) -> live prices, persisted to cache (web only)
**  3. live fetch empty or throws      -> stale cache (web only), else {} + error
** The error strings match the hook's pre-cache messages exactly so the UI
** semantics ('live' vs 'snapshot' + error banner) are unchanged.
*/
export const resolveLivePriceMap = async (
    partNumbers: string[],
    currency: string,
    fetchLive: PriceListFetcher,
    useCache: boolean = isWebPricingRuntime()
): Promise<ResolvedLivePrices> => {
    if (partNumbers.length === 0) return { priceMap: {}, error: null }

    if (useCache) {
        const fresh = readFreshCachedPrices(currency, partNumbers)
        if (fresh) return { priceMap: fresh, error: null }
    }

    try {
        const live = await fetchLive(partNumbers, currency)
        if (live && Object.keys(live).length > 0) {
            if (useCache) writeCachedPrices(currency, live)
            return { priceMap: live, error: null }
        }
        const stale = useCache ? readStaleCachedPrices(currency, partNumbers) : undefined
        if (stale) return { priceMap: stale, error: null }
        return { priceMap: {}, error: 'Live pricing returned no data; using bundled snapshot.' }
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err)
        const stale = useCache ? readStaleCachedPrices(currency, partNumbers) : undefined
        if (stale) return { priceMap: stale, error: null }
        return { priceMap: {}, error: `Live pricing unavailable (${message}); using bundled snapshot.` }
    }
}
