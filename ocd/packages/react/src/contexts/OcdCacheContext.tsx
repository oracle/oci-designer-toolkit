/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import React, { createContext, Dispatch, useContext, useEffect, useReducer } from 'react'
import { OcdCacheData } from "../components/OcdCache"

export const CacheContext = createContext<OcdCacheData>(OcdCacheData.new())
export const CacheDispatchContext = createContext<Dispatch<CacheReducerAction>>(() => {})
// export const CacheDispatchContext = createContext<OcdCacheContext>({ocdCache: OcdCacheData.new(), setOcdCache: () => {}})
export type CacheReducerAction = {
    type: string
    cache: OcdCacheData
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
    switch (action.type) {
        case 'new': {
            return OcdCacheData.new()
        }
        case 'updated': {
            return action.cache
        }
        default: {
            throw Error(`Unknown action: ${action.type}`)
        }
    }
}
