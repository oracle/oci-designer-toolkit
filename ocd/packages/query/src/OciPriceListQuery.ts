/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

/*
** Unauthenticated client for the Oracle Cloud public list-pricing API
** (the "Cost Estimator Tools" / cetools endpoint).
**
** IMPORTANT: This module intentionally does NOT import oci-sdk and does NOT
** extend OciCommonQuery. The pricing endpoint is public and unauthenticated,
** so it only needs the global fetch API. Keeping it SDK-free ensures the web
** bundle does not pull in oci-sdk via this path.
**
** Live API shape (verified 2026-06-02 against
**   https://apexapps.oracle.com/pls/apex/cetools/api/v1/products/?partNumber=B97384&currencyCode=USD ):
**
**   {
**     "lastUpdated": "...",
**     "items": [
**       {
**         "partNumber": "B97384",
**         "displayName": "Compute - Standard - E5 - OCPU",
**         "metricName": "OCPU Per Hour",
**         "serviceCategory": "Compute - Virtual Machine",
**         "currencyCodeLocalizations": [
**           { "currencyCode": "USD", "prices": [ { "model": "PAY_AS_YOU_GO", "value": 0.03 } ] }
**         ]
**       }
**     ]
**   }
**
** The types below mirror that REAL shape. (An earlier design sketch assumed a
** doubly-nested prices[].prices[] structure; the live API uses
** currencyCodeLocalizations[].prices[] instead, so we model that.)
*/

import { OcdLogger } from '@ocd/core'

const logger = OcdLogger.scope('OciPriceListQuery')

export interface CetoolsPriceTier {
    model: string // e.g. "PAY_AS_YOU_GO"
    value: number
    rangeMin?: number
    rangeMax?: number
    rangeUnit?: string
}

export interface CetoolsCurrencyPrices {
    currencyCode: string
    prices: CetoolsPriceTier[]
}

export interface CetoolsProductItem {
    partNumber: string
    displayName?: string
    metricName?: string
    serviceCategory?: string
    currencyCodeLocalizations?: CetoolsCurrencyPrices[]
}

export interface CetoolsResponse {
    lastUpdated?: string
    items?: CetoolsProductItem[]
}

export interface PriceMapEntry {
    unitPrice: number
    metricName: string
    currency: string
    displayName?: string
}

export type PriceMap = Record<string, PriceMapEntry>

export const CETOOLS_PRICING_BASE_URL = 'https://apexapps.oracle.com/pls/apex/cetools/api/v1/products/'

const DEFAULT_TIMEOUT_MS = 8000

export interface PriceListOptions {
    baseUrl?: string
    timeoutMs?: number
    signal?: AbortSignal
}

// Module-scoped in-memory cache. Keyed by `${currency}|${baseUrl}` so the
// desktop (live API base) and web (proxy base) caches never collide.
const inMemoryCache: Map<string, PriceMap> = new Map()

const cacheKey = (currency: string, baseUrl: string): string => `${currency.toUpperCase()}|${baseUrl}`

export class OciPriceListQuery {
    /*
    ** Reduce a single product item to a flat PriceMapEntry for the requested
    ** currency. Picks the matching currencyCodeLocalizations entry, then the
    ** PAY_AS_YOU_GO tier with the smallest rangeMin (the entry-level / first
    ** tier price). Returns undefined when the item has no usable price.
    */
    static normalizeItem(item: CetoolsProductItem, currency: string): PriceMapEntry | undefined {
        if (!item || !Array.isArray(item.currencyCodeLocalizations)) return undefined
        const wanted = currency.toUpperCase()
        const localization = item.currencyCodeLocalizations.find((l) => (l.currencyCode || '').toUpperCase() === wanted)
        if (!localization || !Array.isArray(localization.prices) || localization.prices.length === 0) return undefined
        const payg = localization.prices.filter((p) => (p.model || '').toUpperCase() === 'PAY_AS_YOU_GO')
        const candidates = payg.length > 0 ? payg : localization.prices
        // Smallest rangeMin first (undefined rangeMin treated as 0 / entry tier).
        const tier = [...candidates].sort((a, b) => (a.rangeMin ?? 0) - (b.rangeMin ?? 0))[0]
        if (!tier || typeof tier.value !== 'number') return undefined
        return {
            unitPrice: tier.value,
            metricName: item.metricName ?? '',
            currency: wanted,
            displayName: item.displayName
        }
    }

    static getCached(currency: string, baseUrl: string): PriceMap | undefined {
        return inMemoryCache.get(cacheKey(currency, baseUrl))
    }

    getOciPriceList(partNumbers: string[], currency: string, options: PriceListOptions = {}): Promise<PriceMap> {
        return getOciPriceList(partNumbers, currency, options)
    }
}

/*
** Fetch a PriceMap for the requested part numbers and currency.
**
** NEVER throws on a network / parse error: callers (BOM page, snapshot merge)
** rely on always getting a usable PriceMap. On failure it returns whatever was
** successfully resolved (possibly an empty map). The caller is responsible for
** falling back to the bundled snapshot.
*/
export async function getOciPriceList(
    partNumbers: string[],
    currencyCode: string,
    options: PriceListOptions = {}
): Promise<PriceMap> {
    const currency = (currencyCode || 'USD').toUpperCase()
    const baseUrl = options.baseUrl ?? CETOOLS_PRICING_BASE_URL
    const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS
    const requested = Array.from(new Set((partNumbers || []).filter((p) => typeof p === 'string' && p.length > 0)))

    if (requested.length === 0) return {}

    // Serve from the in-memory cache when every requested part is present.
    const cached = inMemoryCache.get(cacheKey(currency, baseUrl))
    if (cached && requested.every((p) => p in cached)) {
        return requested.reduce<PriceMap>((acc, p) => {
            acc[p] = cached[p]
            return acc
        }, {})
    }

    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)
    // If the caller supplied a signal, abort our request when theirs aborts.
    if (options.signal) {
        if (options.signal.aborted) controller.abort()
        else options.signal.addEventListener('abort', () => controller.abort(), { once: true })
    }

    const result: PriceMap = {}
    try {
        // The cetools endpoint returns the full catalogue and ignores the
        // partNumber filter for multi-part requests, so we fetch the whole
        // currency catalogue once and select the parts we need locally.
        const url = `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}currencyCode=${encodeURIComponent(currency)}`
        const response = await fetch(url, { signal: controller.signal })
        if (!response.ok) {
            logger.warn(`pricing request failed with status ${response.status}`)
            return result
        }
        const data = (await response.json()) as CetoolsResponse
        const items = Array.isArray(data.items) ? data.items : []
        const byPart = new Map<string, CetoolsProductItem>()
        for (const item of items) {
            if (item && typeof item.partNumber === 'string') byPart.set(item.partNumber, item)
        }
        for (const part of requested) {
            const item = byPart.get(part)
            if (!item) continue
            const entry = OciPriceListQuery.normalizeItem(item, currency)
            if (entry) result[part] = entry
        }
        // Merge into the in-memory cache (never drop previously cached parts).
        const key = cacheKey(currency, baseUrl)
        inMemoryCache.set(key, { ...(inMemoryCache.get(key) ?? {}), ...result })
    } catch (error: unknown) {
        // Explicitly handled: log and return the partial map. Do NOT rethrow.
        const message = error instanceof Error ? error.message : String(error)
        logger.warn(`pricing fetch error (${message}); returning partial price map`)
    } finally {
        clearTimeout(timer)
    }
    return result
}
