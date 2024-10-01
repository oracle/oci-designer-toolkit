/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

/*
** Facade exists so we can switch between Electron based and Web based which will require a web server
*/

export namespace OciApiFacade {
    export const getVersion = (): Promise<any> => {
        return window.ocdAPI ? window.ocdAPI.getVersion() : Promise.reject('Currently Not Implemented')
    }
    export const loadOCIConfigProfileNames = (): Promise<any> => {
        return window.ocdAPI ? window.ocdAPI.loadOCIConfigProfileNames() : Promise.reject('Currently Not Implemented')
    }
    export const loadOCIConfigProfile = (profile: string = 'shipped'): Promise<any> => {
        return window.ocdAPI ? window.ocdAPI.loadOCIConfigProfile(profile) : Promise.reject('Currently Not Implemented')
    }
    export const listRegions = (profile: string = 'DEFAULT'): Promise<any> => {
        return window.ocdAPI ? window.ocdAPI.listRegions(profile) : Promise.reject('Currently Not Implemented')
    }
    export const listTenancyCompartments = (profile: string = 'DEFAULT'): Promise<any> => {
        return window.ocdAPI ? window.ocdAPI.listTenancyCompartments(profile) : Promise.reject('Currently Not Implemented')
    }
    export const queryTenancy = (profile: string = 'DEFAULT', compartmentIds: string[] = [], region: string): Promise<any> => {
        return window.ocdAPI ? window.ocdAPI.queryTenancy(profile, compartmentIds, region) : Promise.reject('Currently Not Implemented')
    }
    export const queryDropdown = (profile: string = 'DEFAULT', region: string): Promise<any> => {
        return window.ocdAPI ? window.ocdAPI.queryDropdown(profile, region) : Promise.reject('Currently Not Implemented')
    }
}