/*
** Copyright (c) 2020, 2023, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

/*
** Facade exists so we can switch between Electron based and Web based which will require a web server
*/

export namespace OciApiFacade {
    export const loadOCIConfigProfiles = (): Promise<any> => {
        return window.ocdAPI ? window.ocdAPI.loadOCIConfigProfiles() : new Promise((resolve, reject) => {reject('Currently Not Implemented')})
    }
    export const listRegions = (profile: string = 'DEFAULT'): Promise<any> => {
        return window.ocdAPI ? window.ocdAPI.listRegions(profile) : new Promise((resolve, reject) => {reject('Currently Not Implemented')})
    }
    export const listTenancyCompartments = (profile: string = 'DEFAULT'): Promise<any> => {
        return window.ocdAPI ? window.ocdAPI.listTenancyCompartments(profile) : new Promise((resolve, reject) => {reject('Currently Not Implemented')})
    }
}