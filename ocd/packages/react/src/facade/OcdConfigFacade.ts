/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { OcdConsoleConfiguration } from "../components/OcdConsoleConfiguration"

/*
** Facade exists so we can switch between Electron based and Web based which will require a web server
*/

export namespace OcdConfigFacade {
    export const loadConsoleConfig = (): Promise<any> => {
        return window.ocdAPI ? window.ocdAPI.loadConsoleConfig() : Promise.reject(new Error('Currently Not Implemented'))
    }
    export const saveConsoleConfig = (config: OcdConsoleConfiguration): Promise<any> => {
        return window.ocdAPI ? window.ocdAPI.saveConsoleConfig(config) : Promise.reject(new Error('Currently Not Implemented'))
    }
}
