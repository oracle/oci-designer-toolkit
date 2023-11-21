/*
** Copyright (c) 2020, 2023, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { OciApiFacade } from "../facade/OciApiFacade"
import { defaultCache } from '../data/DefaultCache'

export interface OcdCacheEntry extends Record <string, any> {}

export interface OcdCacheRegionData extends Record <string, OcdCacheEntry[]> {}

export interface OcdCacheProfileData extends Record <string, OcdCacheRegionData> {}

export interface OcdCache {
    profile: string,
    region: string,
    dropdownData: Record<string, OcdCacheProfileData>
}

export class OcdCacheData {
    cache: OcdCache
    constructor (cache: any = undefined) {
        if (typeof cache === 'string' && cache.length > 0) this.cache = JSON.parse(cache)
        else if (cache instanceof Object) this.cache = cache
        else this.cache = this.newCache()
    }

    static new = () => new OcdCacheData()
    static clone = (ocdConsoleState: OcdCacheData) => new OcdCacheData(ocdConsoleState.cache)

    newCache = (): OcdCache => defaultCache
    // newConsoleConfiguration = (): OcdCache => {
    //     return {
    //         profile: 'DEFAULT',
    //         region: '',
    //         dropdownData: {
    //             shipped: {
    //                 all: {}
    //             }
    //         }
    //     }
    // }

    loadProfileRegionCache(profile: string, region: string): Promise<OcdCacheRegionData> {
        return new Promise((resolve, reject) => {
            if (Object.hasOwn(this.cache.dropdownData, profile) && Object.hasOwn(this.cache.dropdownData[profile], region)) {
                resolve(this.cache.dropdownData[profile][region])
            } else {
                OciApiFacade.queryDropdown(profile, region).then((results) => {})
            }
        })
    }
}
