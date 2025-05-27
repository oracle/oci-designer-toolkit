/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { createContext, Dispatch, useContext, useEffect, useReducer } from 'react'
import { OcdCacheData } from "../components/OcdCache"

export const CacheContext = createContext<OcdCacheData>(OcdCacheData.new())
export const CacheDispatchContext = createContext<Dispatch<CacheReducerAction>>(() => {})
export type CacheReducerAction = {
    type: 'new' | 'updated' | 'setRegion' | 'setProfile'
    cache: OcdCacheData
    profile?: string
    region?: string
}

export function CacheProvider({ children }: Readonly<{children: JSX.Element | JSX.Element[]}>): JSX.Element {
    const [cache, dispatch] = useReducer(cacheReducer, OcdCacheData.new())
    // Load the Dropdown Resource Cache
    useEffect(() => {
        cache.loadCache().then((results) => {
            console.debug('OcdConsole: useEffect: loadCache:', cache)
            dispatch({
                type: 'updated',
                cache: cache
            })
        })
    }, []) // Empty Array to only run on initial render
    return (
        <CacheContext.Provider value={cache}>
            <CacheDispatchContext.Provider value={dispatch}>
                {children}
            </CacheDispatchContext.Provider>
        </CacheContext.Provider>
    )
}

export function useCache() {
    return useContext(CacheContext)
}

export function useCacheDispatch() {
    return useContext(CacheDispatchContext)
}

function cacheReducer(cache: OcdCacheData, action: CacheReducerAction) {
    console.debug('OcdCacheContext: cacheReducer: cache', cache)
    console.debug('OcdCacheContext: cacheReducer: action', action)
    switch (action.type) {
        case 'new': {
            return OcdCacheData.new()
        }
        case 'updated': {
            return action.cache
        }
        case 'setProfile': {
            const clone = OcdCacheData.clone(cache)
            clone.cache.profile = action.profile ?? ''
            return clone
        }
        case 'setRegion': {
            const clone = OcdCacheData.clone(cache)
            clone.cache.region = action.region ?? ''
            return clone
        }
        default: {
            throw Error(`Unknown action: ${action.type}`)
        }
    }
}
