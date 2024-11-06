/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { OcdCache } from "../components/OcdCache"

/*
** Facade exists so we can switch between Electron based and Web based which will require a web server
*/

export namespace OcdCacheFacade {
    export const loadCache = (): Promise<any> => {
        return window.ocdAPI ? window.ocdAPI.loadCache() : Promise.reject(new Error('Currently Not Implemented'))
    }
    export const saveCache = (cache: OcdCache): Promise<any> => {
        return window.ocdAPI ? window.ocdAPI.saveCache(cache) : Promise.reject(new Error('Currently Not Implemented'))
    }
}
