/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { createContext, Dispatch, useContext, useEffect, useReducer } from 'react'
import { OcdConsoleConfiguration } from "../components/OcdConsoleConfiguration"
import { OcdConfigFacade } from '../facade/OcdConfigFacade'

export const SimpleConsoleConfigContext = createContext<OcdConsoleConfiguration>(OcdConsoleConfiguration.newConfig())
export const SimpleConsoleConfigDispatchContext = createContext<Dispatch<ConsoleConfigReducerAction>>(() => {})
export type ConsoleConfigReducerAction = {
    type: 'new' | 'updated' | 'updateTheme'
    consoleConfig: OcdConsoleConfiguration
}

export function ConsoleConfigProvider({ children }: Readonly<{children: JSX.Element | JSX.Element[]}>): JSX.Element {
    const [consoleConfig, dispatch] = useReducer(consoleConfigReducer, OcdConsoleConfiguration.newConfig())
    // Load the Console Config Information
    useEffect(() => {
        OcdConfigFacade.loadConsoleConfig().then((results) => {
            console.debug('ConsoleConfigProvider: Load Console Config', results)
            const existingConfig = results
            const updatedConfig = {...consoleConfig, ...existingConfig}
            console.debug('ConsoleConfigProvider: consoleConfig:', consoleConfig)
            console.debug('ConsoleConfigProvider: existingConfig:', existingConfig)
            console.debug('ConsoleConfigProvider: updatedConfig:', updatedConfig)
            dispatch({
                type: 'updated', 
                consoleConfig: existingConfig
            })
        }).catch((response) => {
            console.debug('ConsoleConfigProvider: Load Console Config', response)
            OcdConfigFacade.saveConsoleConfig(consoleConfig).then((results) => {}).catch((response) => console.debug('ConsoleConfigProvider:', response))
        })
    }, []) // Empty Array to only run on initial render
    return (
        <SimpleConsoleConfigContext.Provider value={consoleConfig}>
            <SimpleConsoleConfigDispatchContext.Provider value={dispatch}>
                {children}
            </SimpleConsoleConfigDispatchContext.Provider>
        </SimpleConsoleConfigContext.Provider>
    )
}

export function useConsoleConfig() {
    return useContext(SimpleConsoleConfigContext)
}

export function useConsoleConfigDispatch() {
    return useContext(SimpleConsoleConfigDispatchContext)
}

function consoleConfigReducer(consoleConfig: OcdConsoleConfiguration, action: ConsoleConfigReducerAction) {
    switch (action.type) {
        case 'new': {
            return OcdConsoleConfiguration.newConfig()
        }
        case 'updated': {
            OcdConfigFacade.saveConsoleConfig(action.consoleConfig).then((results) => {console.debug('OcdConsoleConfigContext: consoleConfigReducer(updated): Config Saved')}).catch((response) => console.debug('OcdConsoleConfigContext: consoleConfigReducer:', response))
            return action.consoleConfig
        }
        case 'updateTheme': {
            consoleConfig.theme = action.consoleConfig.theme
            OcdConfigFacade.saveConsoleConfig(consoleConfig).then((results) => {console.debug('OcdConsoleConfigContext: consoleConfigReducer(updateTheme): Config Saved')}).catch((response) => console.debug('OcdConsoleConfigContext: consoleConfigReducer:', response))
            return consoleConfig
        }
        default: {
            throw Error(`Unknown action: ${action.type}`)
        }
    }
}
