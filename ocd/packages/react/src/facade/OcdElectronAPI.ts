/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { OcdDesign } from "@ocd/model"
import { OcdConsoleConfiguration } from "../components/OcdConsoleConfiguration"
import { OcdCache } from "../components/OcdCache"

export interface OcdElectronAPI {
    // Build Information
    getVersion: () => Promise<void>
    // OCI API Calls / Query
    loadOCIConfigProfileNames: () => Promise<void>
    loadOCIConfigProfile: (profile: string) => Promise<void>
    listRegions: (profile: string) => Promise<void>
    listTenancyCompartments: (profile: string) => Promise<void>
    queryTenancy: (profile: string, compartmentIds: string[], region: string) => Promise<void>
    queryDropdown: (profile: string, region: string) => Promise<void>
	// OCD Design 
    loadDesign: (filename: string) => Promise<void>
    saveDesign: (design: OcdDesign | string, filename: string, suggestedFilename: string | undefined) => Promise<void>
    discardConfirmation: () => Promise<void>
    exportTerraform: (design: OcdDesign | string, directory: string) => Promise<void>
    loadLibraryIndex: () => Promise<void>
    loadLibraryDesign: (section: string, filename: string) => Promise<void>
    loadSvgCssFiles: () => Promise<void>
	// OCD Configuration
    loadConsoleConfig: () => Promise<void>
    saveConsoleConfig: (config: OcdConsoleConfiguration) => Promise<void>
	// OCD Cache
    loadCache: () => Promise<void>
    saveCache: (cache: OcdCache) => Promise<void>
    // External URLs
    openExternalUrl: (href: string) => Promise<void>
}
  
declare global {
    interface Window {
        ocdAPI: OcdElectronAPI
    }
}