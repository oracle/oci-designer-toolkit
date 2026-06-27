/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { afterEach, describe, expect, it, vi } from 'vitest'
import type { PriceMap } from '@ocd/query/pricing'
import {
    PRICE_LIST_CACHE_TTL_MS,
    readFreshCachedPrices,
    readStaleCachedPrices,
    resolveLivePriceMap,
    writeCachedPrices,
} from '../OcdPriceListWebCache'

const CACHE_KEY = 'ocd.priceList.USD'

const entry = (unitPrice: number): PriceMap[string] => ({
    unitPrice,
    metricName: 'OCPU PER HOUR',
    currency: 'USD',
})

interface MockStorage {
    getItem: (key: string) => string | null
    setItem: (key: string, value: string) => void
    removeItem: (key: string) => void
    readonly store: Map<string, string>
}

const createMockStorage = (): MockStorage => {
    const store = new Map<string, string>()
    return {
        store,
        getItem: (key: string) => (store.has(key) ? store.get(key)! : null),
        setItem: (key: string, value: string) => {
            store.set(key, value)
        },
        removeItem: (key: string) => {
            store.delete(key)
        },
    }
}

const seedCache = (storage: MockStorage, savedAt: number, priceMap: PriceMap): void => {
    storage.setItem(CACHE_KEY, JSON.stringify({ savedAt, priceMap }))
}

afterEach(() => {
    vi.unstubAllGlobals()
})

describe('resolveLivePriceMap (web cache enabled)', () => {
    it('returns cached prices without fetching when the cache is fresh and covers all parts', async () => {
        // Arrange
        const storage = createMockStorage()
        seedCache(storage, Date.now(), { B88514: entry(0.05), B88517: entry(0.025) })
        vi.stubGlobal('localStorage', storage)
        const fetchLive = vi.fn()

        // Act
        const result = await resolveLivePriceMap(['B88514', 'B88517'], 'USD', fetchLive, true)

        // Assert
        expect(fetchLive).not.toHaveBeenCalled()
        expect(result.error).toBeNull()
        expect(result.priceMap.B88514.unitPrice).toBe(0.05)
        expect(result.priceMap.B88517.unitPrice).toBe(0.025)
    })

    it('fetches when the cache entry is older than the 24h TTL', async () => {
        // Arrange
        const storage = createMockStorage()
        seedCache(storage, Date.now() - PRICE_LIST_CACHE_TTL_MS - 1, { B88514: entry(0.05) })
        vi.stubGlobal('localStorage', storage)
        const live: PriceMap = { B88514: entry(0.06) }
        const fetchLive = vi.fn().mockResolvedValue(live)

        // Act
        const result = await resolveLivePriceMap(['B88514'], 'USD', fetchLive, true)

        // Assert
        expect(fetchLive).toHaveBeenCalledTimes(1)
        expect(result.priceMap.B88514.unitPrice).toBe(0.06)
        expect(result.error).toBeNull()
    })

    it('fetches when the fresh cache only covers some of the requested parts', async () => {
        // Arrange
        const storage = createMockStorage()
        seedCache(storage, Date.now(), { B88514: entry(0.05) })
        vi.stubGlobal('localStorage', storage)
        const fetchLive = vi.fn().mockResolvedValue({ B88514: entry(0.05), B91962: entry(0.01) })

        // Act
        const result = await resolveLivePriceMap(['B88514', 'B91962'], 'USD', fetchLive, true)

        // Assert
        expect(fetchLive).toHaveBeenCalledTimes(1)
        expect(Object.keys(result.priceMap).sort()).toEqual(['B88514', 'B91962'])
    })

    it('persists a successful fetch by merging live prices over the previous entry', async () => {
        // Arrange: old entry has a stale price for B88514 plus an extra part B00001.
        const storage = createMockStorage()
        seedCache(storage, Date.now() - PRICE_LIST_CACHE_TTL_MS - 1, {
            B88514: entry(0.05),
            B00001: entry(1.0),
        })
        vi.stubGlobal('localStorage', storage)
        const fetchLive = vi.fn().mockResolvedValue({ B88514: entry(0.06), B91962: entry(0.01) })

        // Act
        await resolveLivePriceMap(['B88514', 'B91962'], 'USD', fetchLive, true)

        // Assert: merged entry keeps the old extra part, live prices win, timestamp refreshed.
        const persisted = JSON.parse(storage.store.get(CACHE_KEY)!)
        expect(persisted.priceMap.B88514.unitPrice).toBe(0.06)
        expect(persisted.priceMap.B91962.unitPrice).toBe(0.01)
        expect(persisted.priceMap.B00001.unitPrice).toBe(1.0)
        expect(Date.now() - persisted.savedAt).toBeLessThan(PRICE_LIST_CACHE_TTL_MS)
    })

    it('falls back to a stale cache entry when the live fetch rejects', async () => {
        // Arrange
        const storage = createMockStorage()
        seedCache(storage, Date.now() - PRICE_LIST_CACHE_TTL_MS - 1, { B88514: entry(0.05) })
        vi.stubGlobal('localStorage', storage)
        const fetchLive = vi.fn().mockRejectedValue(new Error('proxy down'))

        // Act
        const result = await resolveLivePriceMap(['B88514'], 'USD', fetchLive, true)

        // Assert: stale data rescues the failure silently (desktop parity).
        expect(result.priceMap.B88514.unitPrice).toBe(0.05)
        expect(result.error).toBeNull()
    })

    it('falls back to a stale cache entry when the live fetch returns no data', async () => {
        // Arrange
        const storage = createMockStorage()
        seedCache(storage, Date.now() - PRICE_LIST_CACHE_TTL_MS - 1, { B88514: entry(0.05) })
        vi.stubGlobal('localStorage', storage)
        const fetchLive = vi.fn().mockResolvedValue({})

        // Act
        const result = await resolveLivePriceMap(['B88514'], 'USD', fetchLive, true)

        // Assert
        expect(result.priceMap.B88514.unitPrice).toBe(0.05)
        expect(result.error).toBeNull()
    })

    it('surfaces the fetch error when neither live nor cached data exists', async () => {
        // Arrange
        vi.stubGlobal('localStorage', createMockStorage())
        const fetchLive = vi.fn().mockRejectedValue(new Error('proxy down'))

        // Act
        const result = await resolveLivePriceMap(['B88514'], 'USD', fetchLive, true)

        // Assert
        expect(result.priceMap).toEqual({})
        expect(result.error).toBe('Live pricing unavailable (proxy down); using bundled snapshot.')
    })

    it('surfaces the no-data error when the fetch is empty and the cache is empty', async () => {
        // Arrange
        vi.stubGlobal('localStorage', createMockStorage())
        const fetchLive = vi.fn().mockResolvedValue({})

        // Act
        const result = await resolveLivePriceMap(['B88514'], 'USD', fetchLive, true)

        // Assert
        expect(result.error).toBe('Live pricing returned no data; using bundled snapshot.')
    })

    it('resolves immediately with no fetch and no error for an empty part list', async () => {
        // Arrange
        const fetchLive = vi.fn()

        // Act
        const result = await resolveLivePriceMap([], 'USD', fetchLive, true)

        // Assert
        expect(fetchLive).not.toHaveBeenCalled()
        expect(result).toEqual({ priceMap: {}, error: null })
    })
})

describe('resolveLivePriceMap graceful degradation', () => {
    it('still resolves live prices when localStorage is undefined', async () => {
        // Arrange
        vi.stubGlobal('localStorage', undefined)
        const fetchLive = vi.fn().mockResolvedValue({ B88514: entry(0.06) })

        // Act
        const result = await resolveLivePriceMap(['B88514'], 'USD', fetchLive, true)

        // Assert
        expect(result.priceMap.B88514.unitPrice).toBe(0.06)
        expect(result.error).toBeNull()
    })

    it('treats a throwing localStorage (privacy mode) as a cache miss', async () => {
        // Arrange
        vi.stubGlobal('localStorage', {
            getItem: () => {
                throw new Error('SecurityError')
            },
            setItem: () => {
                throw new Error('SecurityError')
            },
            removeItem: () => {
                throw new Error('SecurityError')
            },
        })
        const fetchLive = vi.fn().mockResolvedValue({ B88514: entry(0.06) })

        // Act
        const result = await resolveLivePriceMap(['B88514'], 'USD', fetchLive, true)

        // Assert
        expect(fetchLive).toHaveBeenCalledTimes(1)
        expect(result.priceMap.B88514.unitPrice).toBe(0.06)
        expect(result.error).toBeNull()
    })

    it('prunes the cache entry and still resolves when setItem hits the quota', async () => {
        // Arrange
        const storage = createMockStorage()
        seedCache(storage, Date.now() - PRICE_LIST_CACHE_TTL_MS - 1, { B88514: entry(0.05) })
        const removeItem = vi.spyOn(storage, 'removeItem')
        vi.spyOn(storage, 'setItem').mockImplementation(() => {
            throw new DOMException('quota', 'QuotaExceededError')
        })
        vi.stubGlobal('localStorage', storage)
        const fetchLive = vi.fn().mockResolvedValue({ B88514: entry(0.06) })

        // Act
        const result = await resolveLivePriceMap(['B88514'], 'USD', fetchLive, true)

        // Assert
        expect(result.priceMap.B88514.unitPrice).toBe(0.06)
        expect(result.error).toBeNull()
        expect(removeItem).toHaveBeenCalledWith(CACHE_KEY)
    })

    it('ignores a corrupt cache entry and fetches live', async () => {
        // Arrange
        const storage = createMockStorage()
        storage.setItem(CACHE_KEY, 'not-json{')
        vi.stubGlobal('localStorage', storage)
        const fetchLive = vi.fn().mockResolvedValue({ B88514: entry(0.06) })

        // Act
        const result = await resolveLivePriceMap(['B88514'], 'USD', fetchLive, true)

        // Assert
        expect(fetchLive).toHaveBeenCalledTimes(1)
        expect(result.priceMap.B88514.unitPrice).toBe(0.06)
    })
})

describe('resolveLivePriceMap desktop pass-through (useCache=false)', () => {
    it('never touches localStorage when caching is disabled', async () => {
        // Arrange: a fresh, fully-covering cache entry that MUST be ignored.
        const storage = createMockStorage()
        seedCache(storage, Date.now(), { B88514: entry(0.99) })
        const getItem = vi.spyOn(storage, 'getItem')
        const setItem = vi.spyOn(storage, 'setItem')
        vi.stubGlobal('localStorage', storage)
        const fetchLive = vi.fn().mockResolvedValue({ B88514: entry(0.06) })

        // Act
        const result = await resolveLivePriceMap(['B88514'], 'USD', fetchLive, false)

        // Assert: the fetch (Electron IPC on desktop) is the single source.
        expect(fetchLive).toHaveBeenCalledTimes(1)
        expect(result.priceMap.B88514.unitPrice).toBe(0.06)
        expect(getItem).not.toHaveBeenCalled()
        expect(setItem).not.toHaveBeenCalled()
    })

    it('surfaces fetch failures directly without consulting stale cache entries', async () => {
        // Arrange
        const storage = createMockStorage()
        seedCache(storage, Date.now(), { B88514: entry(0.99) })
        vi.stubGlobal('localStorage', storage)
        const fetchLive = vi.fn().mockRejectedValue(new Error('ipc failed'))

        // Act
        const result = await resolveLivePriceMap(['B88514'], 'USD', fetchLive, false)

        // Assert
        expect(result.priceMap).toEqual({})
        expect(result.error).toBe('Live pricing unavailable (ipc failed); using bundled snapshot.')
    })
})

describe('cache primitives', () => {
    it('readFreshCachedPrices returns only the requested parts', () => {
        // Arrange
        const storage = createMockStorage()
        seedCache(storage, Date.now(), { B88514: entry(0.05), B00001: entry(1.0) })
        vi.stubGlobal('localStorage', storage)

        // Act
        const fresh = readFreshCachedPrices('USD', ['B88514'])

        // Assert
        expect(Object.keys(fresh!)).toEqual(['B88514'])
    })

    it('readStaleCachedPrices returns undefined when no requested part is cached', () => {
        // Arrange
        const storage = createMockStorage()
        seedCache(storage, 0, { B00001: entry(1.0) })
        vi.stubGlobal('localStorage', storage)

        // Act / Assert
        expect(readStaleCachedPrices('USD', ['B88514'])).toBeUndefined()
    })

    it('writeCachedPrices uppercases the currency cache key', () => {
        // Arrange
        const storage = createMockStorage()
        vi.stubGlobal('localStorage', storage)

        // Act
        writeCachedPrices('usd', { B88514: entry(0.05) })

        // Assert
        expect(storage.store.has(CACHE_KEY)).toBe(true)
    })
})
