/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { OciApiFacade } from "../facade/OciApiFacade"
import { defaultCache } from '../data/OcdDefaultCache'
import { OcdCacheFacade } from "../facade/OcdCacheFacade"

export interface OcdCacheEntry extends Record <string, any> {}

export interface OcdCacheRegionData extends Record <string, OcdCacheEntry[] | OcdCacheEntry> {}

export interface OcdCacheProfileData extends Record <string, OcdCacheRegionData> {}

export interface OcdCache {
    profile: string,
    region: string,
    dropdownData: Record<string, OcdCacheProfileData>
}

export class OcdCacheData {
    cache: OcdCache
    constructor (cache: any = undefined) {
        this.cache = this.newCache()
        if (typeof cache === 'string' && cache.length > 0) this.cache = JSON.parse(cache)
        else if (cache instanceof Object) this.cache = cache
        else this.cache = this.newCache()
    }

    static readonly new = () => new OcdCacheData()
    static readonly clone = (ocdConsoleState: OcdCacheData) => new OcdCacheData(ocdConsoleState.cache)

    newCache = (): OcdCache => defaultCache

    loadProfileRegionCache(profile: string, region: string = 'all'): Promise<OcdCacheRegionData> {
        return new Promise((resolve, reject) => {
            if (profile === 'shipped') {
                this.cache.profile = profile
                resolve(this.cache.dropdownData.shipped.all)
            } else if (Object.hasOwn(this.cache.dropdownData, profile) && Object.hasOwn(this.cache.dropdownData[profile], region)) {
                this.cache.profile = profile
                resolve(this.cache.dropdownData[profile][region])
            } else if (Object.hasOwn(this.cache.dropdownData, profile) && Object.hasOwn(this.cache.dropdownData[profile], 'all')) {
                this.cache.profile = profile
                resolve(this.cache.dropdownData[profile]['all'])
            } else if (region === 'all') {
                OciApiFacade.loadOCIConfigProfile(profile).then((results) => {
                    region = results.region
                    OciApiFacade.queryDropdown(profile, region).then((results) => {
                        this.cache.dropdownData[profile] = {all: results}
                        this.cache.profile = profile
                        this.saveCache()
                        resolve(this.cache.dropdownData[profile]['all'])
                        // resolve(this.cache.dropdownData[profile][region])
                    })
                })
            } else {
                OciApiFacade.queryDropdown(profile, region).then((results) => {
                    this.cache.dropdownData[profile] = {all: results}
                    this.cache.profile = profile
                    this.saveCache()
                    resolve(this.cache.dropdownData[profile]['all'])
                })
            }
        })
    }

    loadCache(): Promise<any> {
        return OcdCacheFacade.loadCache().then((results) => {
            this.cache = results
            const shippedCacheAsString = JSON.stringify(defaultCache.dropdownData.shipped)
            const localCacheAsString = JSON.stringify(this.cache.dropdownData.shipped)
            const defaultCacheAsString = JSON.stringify(defaultCache.dropdownData.shipped)
            if (localCacheAsString.localeCompare(defaultCacheAsString) !== 0) {
                console.debug('OcdCacheData: Shipped/Default Cache differs from local Cache')
                this.cache.dropdownData.shipped = JSON.parse(shippedCacheAsString)
                this.saveCache()
            } else {
                console.debug('OcdCacheData: Shipped/Default Cache same as local Cache')
            }
        }).catch((response) => {
            this.cache = this.newCache()
            this.saveCache()
        })
    }

    saveCache(): Promise<any> {
        return OcdCacheFacade.saveCache(this.cache).then((results) => {}).catch((response) => console.debug('OcdCacheData:', response))
    }

    getOciReferenceDataList(resource: string, profile?: string, region?: string) {
        console.debug('OcdCacheData: getOciReferenceDataList:', resource, profile, region)
        profile ??= this.cache.profile
        region ??= this.cache.region
        console.debug('OcdCacheData: getOciReferenceDataList:', resource, profile, region)
        if (profile === undefined || !Object.hasOwn(this.cache.dropdownData, profile)) {
            profile = 'shipped'
            region = 'all'
        }
        if (region === undefined || !Object.hasOwn(this.cache.dropdownData[profile], region)) {
            profile = 'shipped'
            region = 'all'
        }
        console.debug('OcdCacheData: getOciReferenceDataList:', resource, profile, region, this.cache.dropdownData[profile][region])
        return Object.hasOwn(this.cache.dropdownData[profile][region], resource) ? this.cache.dropdownData[profile][region][resource] : []
    }
}
