/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { OcdBackend } from "./OcdBackend"

export interface OcdElectronAPI extends OcdBackend {
    // Build Information
    getVersion: OcdBackend['getVersion']
    // OCI API Calls / Query
    loadOCIConfigProfileNames: OcdBackend['loadOCIConfigProfileNames']
    loadOCIConfigProfile: OcdBackend['loadOCIConfigProfile']
    listRegions: OcdBackend['listRegions']
    listTenancyCompartments: OcdBackend['listTenancyCompartments']
    queryTenancy: OcdBackend['queryTenancy']
    queryDropdown: OcdBackend['queryDropdown']
    queryDiscoverySnapshot: OcdBackend['queryDiscoverySnapshot']
    generateArchitecturePlanWithGenAi: OcdBackend['generateArchitecturePlanWithGenAi']
    generateArchitecturePlanFromImageWithGenAi: OcdBackend['generateArchitecturePlanFromImageWithGenAi']
    listStacks: OcdBackend['listStacks']
    createStack: OcdBackend['createStack']
    updateStack: OcdBackend['updateStack']
    createJob: OcdBackend['createJob']
    getResourceManagerPlanReview: OcdBackend['getResourceManagerPlanReview']
    updateLandingZoneAddon: OcdBackend['updateLandingZoneAddon']
    startLandingZoneAddonUpdateJob: OcdBackend['startLandingZoneAddonUpdateJob']
    getLandingZoneAddonUpdateJob: OcdBackend['getLandingZoneAddonUpdateJob']
    cancelLandingZoneAddonUpdateJob: OcdBackend['cancelLandingZoneAddonUpdateJob']
    listLandingZoneAddonHealth: OcdBackend['listLandingZoneAddonHealth']
    // OCI Pricing
    getOciPriceList: OcdBackend['getOciPriceList']
	// OCD Design
    loadDesign: OcdBackend['loadDesign']
    saveDesign: OcdBackend['saveDesign']
    discardConfirmation: OcdBackend['discardConfirmation']
    loadLibraryIndex: OcdBackend['loadLibraryIndex']
    loadLibraryDesign: OcdBackend['loadLibraryDesign']
    loadSvgCssFiles: OcdBackend['loadSvgCssFiles']
    exportTerraform: OcdBackend['exportTerraform']
    exportToExcel: OcdBackend['exportToExcel']
    exportToMarkdown: OcdBackend['exportToMarkdown']
    exportToSvg: OcdBackend['exportToSvg']
    exportToTerraform: OcdBackend['exportToTerraform']
    importFromTerraform: OcdBackend['importFromTerraform']
	// OCD Configuration
    loadConsoleConfig: OcdBackend['loadConsoleConfig']
    saveConsoleConfig: OcdBackend['saveConsoleConfig']
	// OCD Cache
    loadCache: OcdBackend['loadCache']
    saveCache: OcdBackend['saveCache']
    // External URLs
    openExternalUrl: OcdBackend['openExternalUrl']
}
  
declare global {
    interface Window {
        ocdAPI: OcdElectronAPI
    }
}
