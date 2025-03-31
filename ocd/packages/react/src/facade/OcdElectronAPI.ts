/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { OcdDesign } from "@ocd/model"
import { OcdConsoleConfiguration } from "../components/OcdConsoleConfiguration"
import { OcdCache } from "../components/OcdCache"
import { OutputDataStringArray } from "@ocd/export"

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
    listStacks: (profile: string, region: string, compartmentId: string) => Promise<void>
    createStack: (profile: string, region: string, compartmentId: string, data: OutputDataStringArray, apply: boolean) => Promise<void>
    updateStack: (profile: string, region: string, stackId: string, data: OutputDataStringArray, apply: boolean) => Promise<void>
    createJob: (profile: string, region: string, stackId: string, apply: boolean) => Promise<void>
	// OCD Design 
    loadDesign: (filename: string) => Promise<void>
    saveDesign: (design: OcdDesign | string, filename: string, suggestedFilename: string | undefined) => Promise<void>
    discardConfirmation: () => Promise<void>
    loadLibraryIndex: () => Promise<void>
    loadLibraryDesign: (section: string, filename: string) => Promise<void>
    loadSvgCssFiles: () => Promise<void>
    exportTerraform: (design: OcdDesign | string, directory: string) => Promise<void>
    exportToExcel: (design: OcdDesign | string, suggestedFilename: string | undefined) => Promise<void>
    exportToMarkdown: (design: OcdDesign | string, css: string[], suggestedFilename: string | undefined) => Promise<void>
    exportToSvg: (design: OcdDesign | string, css: string[], directory: string, suggestedFilename: string | undefined) => Promise<void>
    exportToTerraform: (design: OcdDesign | string, directory: string) => Promise<void>
    importFromTerraform: () => Promise<void>
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