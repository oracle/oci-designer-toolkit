/*
** Copyright (c) 2020, 2023, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

export interface OcdElectronAPI {
    loadOCIConfigProfiles: () => Promise<void>,
    listRegions: (profile: string) => Promise<void>,
    listTenancyCompartments: (profile: string) => Promise<void>,
    queryTenancy: (profile: string, compartmentIds: string[], region: string) => Promise<void>,
}
  
declare global {
    interface Window {
        ocdAPI: OcdElectronAPI
    }
}