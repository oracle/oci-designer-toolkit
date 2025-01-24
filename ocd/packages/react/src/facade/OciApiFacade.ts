/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { OutputDataStringArray } from "@ocd/export"

/*
** Facade exists so we can switch between Electron based and Web based which will require a web server
*/

export namespace OciApiFacade {
    export const getVersion = (): Promise<any> => {
        return window.ocdAPI ? window.ocdAPI.getVersion() : Promise.reject(new Error('Currently Not Implemented'))
    }
    export const loadOCIConfigProfileNames = (): Promise<any> => {
        return window.ocdAPI ? window.ocdAPI.loadOCIConfigProfileNames() : Promise.reject(new Error('Currently Not Implemented'))
    }
    export const loadOCIConfigProfile = (profile: string = 'shipped'): Promise<any> => {
        return window.ocdAPI ? window.ocdAPI.loadOCIConfigProfile(profile) : Promise.reject(new Error('Currently Not Implemented'))
    }
    export const listRegions = (profile: string = 'DEFAULT'): Promise<any> => {
        return window.ocdAPI ? window.ocdAPI.listRegions(profile) : Promise.reject(new Error('Currently Not Implemented'))
    }
    export const listTenancyCompartments = (profile: string = 'DEFAULT'): Promise<any> => {
        return window.ocdAPI ? window.ocdAPI.listTenancyCompartments(profile) : Promise.reject(new Error('Currently Not Implemented'))
    }
    export const queryTenancy = (profile: string = 'DEFAULT', compartmentIds: string[] = [], region: string = 'uk-london-1'): Promise<any> => {
        return window.ocdAPI ? window.ocdAPI.queryTenancy(profile, compartmentIds, region) : Promise.reject(new Error('Currently Not Implemented'))
    }
    export const queryDropdown = (profile: string = 'DEFAULT', region: string = 'uk-london-1'): Promise<any> => {
        return window.ocdAPI ? window.ocdAPI.queryDropdown(profile, region) : Promise.reject(new Error('Currently Not Implemented'))
    }
    export const listStacks = (profile: string = 'DEFAULT', region: string = 'uk-london-1', compartmentId: string = ''): Promise<any> => {
        return window.ocdAPI ? window.ocdAPI.listStacks(profile, region, compartmentId) : Promise.reject(new Error('Currently Not Implemented'))
    }
    export const createStack = (profile: string = 'DEFAULT', region: string = 'uk-london-1', compartmentId: string = '', data: OutputDataStringArray = {}, apply: boolean = false): Promise<any> => {
        return window.ocdAPI ? window.ocdAPI.createStack(profile, region, compartmentId, data, apply) : Promise.reject(new Error('Currently Not Implemented'))
    }
    export const updateStack = (profile: string = 'DEFAULT', region: string = 'uk-london-1', stackId: string = '', data: OutputDataStringArray = {}, apply: boolean = false): Promise<any> => {
        return window.ocdAPI ? window.ocdAPI.updateStack(profile, region, stackId, data, apply) : Promise.reject(new Error('Currently Not Implemented'))
    }
    export const createJob = (profile: string = 'DEFAULT', region: string = 'uk-london-1', stackId: string = '', apply: boolean = false): Promise<any> => {
        return window.ocdAPI ? window.ocdAPI.createJob(profile, region, stackId, apply) : Promise.reject(new Error('Currently Not Implemented'))
    }
}