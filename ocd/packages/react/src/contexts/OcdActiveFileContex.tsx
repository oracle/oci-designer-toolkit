/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import React, { createContext, Dispatch, useContext, useReducer } from 'react'
import { OcdActiveFile } from '../types/Console'

export const newActiveFile = () => {return {name: '', modified: false}}

export const ActiveFileContext = createContext<OcdActiveFile>(newActiveFile())
export const ActiveFileDispatchContext = createContext<Dispatch<ActiveFileReducerAction>>(() => {})

export type ActiveFileReducerAction = {
    type: string
    activeFile: OcdActiveFile
}

export function ActiveFileProvider({ children }: Readonly<{children: JSX.Element | JSX.Element[]}>): JSX.Element {
    const [cache, dispatch] = useReducer(cacheReducer, newActiveFile())
    return (
        <ActiveFileContext.Provider value={cache}>
            <ActiveFileDispatchContext.Provider value={dispatch}>
                {children}
            </ActiveFileDispatchContext.Provider>
        </ActiveFileContext.Provider>
    )
}

export function useActiveFile() {
    return useContext(ActiveFileContext)
}

export function useActiveFileDispatch() {
    return useContext(ActiveFileDispatchContext)
}

function cacheReducer(activeFile: OcdActiveFile, action: ActiveFileReducerAction) {
    switch (action.type) {
        case 'new': {
            return newActiveFile()
        }
        case 'updated': {
            return action.activeFile
        }
        default: {
            throw Error(`Unknown action: ${action.type}`)
        }
    }
}
