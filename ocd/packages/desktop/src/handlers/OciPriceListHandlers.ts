/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

/*
** Electron IPC handler for the unauthenticated OCI list-pricing fetch.
**
** Runs in the Electron MAIN process (no CORS) and wraps getOciPriceList from
** @ocd/query with a ~/.ocd/pricing-cache.json disk cache (24h TTL). All disk
** access is best-effort: cache read/write failures degrade gracefully and never
** prevent a fresh fetch or a successful response.
*/

import { app } from 'electron'
import path from 'path'
import fs from 'fs'
import { getOciPriceList, PriceMap } from '@ocd/query'
import { OcdLogger } from '@ocd/core'

const logger = OcdLogger.scope('OciPriceListHandlers')

const CACHE_TTL_MS = 24 * 60 * 60 * 1000 // 24 hours

interface PricingCacheEntry {
    savedAt: number
    priceMap: PriceMap
}

type PricingCache = Record<string, PricingCacheEntry> // keyed by currency

const pricingCacheFilename = (): string => path.join(app.getPath('home'), '.ocd', 'pricing-cache.json')

const readCache = (): PricingCache => {
    try {
        const filename = pricingCacheFilename()
        if (!fs.existsSync(filename)) return {}
        return JSON.parse(fs.readFileSync(filename, 'utf-8')) as PricingCache
    } catch (err: unknown) {
        logger.warn('handleGetOciPriceList: failed reading pricing cache', err)
        return {}
    }
}

const writeCache = (cache: PricingCache): void => {
    try {
        const filename = pricingCacheFilename()
        const dir = path.dirname(filename)
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
        fs.writeFileSync(filename, JSON.stringify(cache, null, 2))
    } catch (err: unknown) {
        logger.warn('handleGetOciPriceList: failed writing pricing cache', err)
    }
}

const allPartsCached = (entry: PricingCacheEntry | undefined, partNumbers: string[]): boolean =>
    !!entry && partNumbers.every((p) => p in entry.priceMap)

export async function handleGetOciPriceList(
    event: any,
    partNumbers: string[],
    currencyCode: string
): Promise<PriceMap> {
    const currency = (currencyCode || 'USD').toUpperCase()
    const requested = Array.from(new Set((partNumbers || []).filter((p) => typeof p === 'string' && p.length > 0)))
    logger.debug('handleGetOciPriceList', currency, requested.length, 'parts')
    if (requested.length === 0) return {}

    const cache = readCache()
    const entry = cache[currency]
    const fresh = entry && Date.now() - entry.savedAt < CACHE_TTL_MS

    if (fresh && allPartsCached(entry, requested)) {
        return requested.reduce<PriceMap>((acc, p) => {
            acc[p] = entry!.priceMap[p]
            return acc
        }, {})
    }

    // getOciPriceList never throws; returns a partial/empty map on failure.
    const live = await getOciPriceList(requested, currency)

    if (Object.keys(live).length > 0) {
        const merged: PriceMap = { ...(entry?.priceMap ?? {}), ...live }
        cache[currency] = { savedAt: Date.now(), priceMap: merged }
        writeCache(cache)
        return live
    }

    // Live fetch yielded nothing. Fall back to a (possibly stale) cache entry so
    // the renderer still gets usable data; the renderer also has the snapshot.
    if (entry) {
        return requested.reduce<PriceMap>((acc, p) => {
            if (p in entry.priceMap) acc[p] = entry.priceMap[p]
            return acc
        }, {})
    }
    return {}
}
