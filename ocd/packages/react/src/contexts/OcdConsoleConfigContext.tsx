/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import React, { createContext, Dispatch, useContext, useEffect, useReducer } from 'react'
import { OcdConsoleConfig } from "../components/OcdConsoleConfiguration"
import { OcdConfigFacade } from '../facade/OcdConfigFacade'

export const ConsoleConfigContext = createContext<OcdConsoleConfig>(OcdConsoleConfig.new())
export const ConsoleConfigDispatchContext = createContext<Dispatch<ConsoleConfigReducerAction>>(() => {})
// export const ConsoleConfigDispatchContext = createContext<OcdConsoleConfigContext>({ocdConsoleConfig: OcdConsoleConfigData.new(), setOcdConsoleConfig: () => {}})
export type ConsoleConfigReducerAction = {
    type: string
    consoleConfig: OcdConsoleConfig
}

export function ConsoleConfigProvider({ children }: Readonly<{children: JSX.Element | JSX.Element[]}>): JSX.Element {
    const [consoleConfig, dispatch] = useReducer(consoleConfigReducer, OcdConsoleConfig.new())
    // Load the Console Config Information
    useEffect(() => {
        OcdConfigFacade.loadConsoleConfig().then((results) => {
            console.debug('ConsoleConfigProvider: Load Console Config', results)
            const consoleConfig = new OcdConsoleConfig(results)
            dispatch({
                type: 'updated', 
                consoleConfig: consoleConfig
            })
        }).catch((response) => {
            console.debug('ConsoleConfigProvider: Load Console Config', response)
            OcdConfigFacade.saveConsoleConfig(consoleConfig.config).then((results) => {}).catch((response) => console.debug('ConsoleConfigProvider:', response))
        })
    }, []) // Empty Array to only run on initial render
    return (
        <ConsoleConfigContext.Provider value={consoleConfig}>
            <ConsoleConfigDispatchContext.Provider value={dispatch}>
                {children}
            </ConsoleConfigDispatchContext.Provider>
        </ConsoleConfigContext.Provider>
    )
}

export function useConsoleConfig() {
    return useContext(ConsoleConfigContext)
}

export function useConsoleConfigDispatch() {
    return useContext(ConsoleConfigDispatchContext)
}

function consoleConfigReducer(consoleConfig: OcdConsoleConfig, action: ConsoleConfigReducerAction) {
    switch (action.type) {
        case 'new': {
            return OcdConsoleConfig.new()
        }
        case 'updated': {
            return action.consoleConfig
        }
        default: {
            throw Error(`Unknown action: ${action.type}`)
        }
    }
}
