/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { createContext, Dispatch, useContext, useReducer } from 'react'

export const newTheme = () => {return {name: '', modified: false}}

export const ThemeContext = createContext<string>('')
export const ThemeDispatchContext = createContext<Dispatch<ThemeReducerAction>>(() => {})

export type ThemeReducerAction = {
    type: string
    theme: string
}

export const defaultTheme = 'default'

export function ThemeProvider({ children }: Readonly<{children: JSX.Element | JSX.Element[]}>): JSX.Element {
    const [cache, dispatch] = useReducer(themeReducer, defaultTheme)
    return (
        <ThemeContext.Provider value={cache}>
            <ThemeDispatchContext.Provider value={dispatch}>
                {children}
            </ThemeDispatchContext.Provider>
        </ThemeContext.Provider>
    )
}

export function useTheme() {
    return useContext(ThemeContext)
}

export function useThemeDispatch() {
    return useContext(ThemeDispatchContext)
}

function themeReducer(theme: string, action: ThemeReducerAction) {
    switch (action.type) {
        case 'new': {
            return defaultTheme
        }
        case 'set': {
            return action.theme
        }
        default: {
            throw Error(`Unknown action: ${action.type}`)
        }
    }
}
