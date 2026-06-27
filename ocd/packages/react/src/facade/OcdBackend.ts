/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { OutputDataStringArray } from '@ocd/export'
import { OcdDesign, OciModelResources } from '@ocd/model'
import { PriceMap } from '@ocd/query/pricing'
import type { GenAiArchitecturePlanResponse, LzAddonSourceHealth, LzAddonUpdateJobStatus, OciResourceManagerJobOptions, OciResourceManagerPlanReview } from '@ocd/query'
import { OcdCache, OcdCacheRegionData } from '../components/OcdCache'
import { OcdConsoleConfiguration } from '../components/OcdConsoleConfiguration'

export interface OcdDesignFileResult<TDesign = OcdDesign | undefined> {
    canceled: boolean
    filename: string
    design: TDesign
}

export interface OciDiscoverySnapshot {
    source: 'oci-query'
    generatedAt?: string
    profile?: string
    region?: string
    compartmentIds?: string[]
    compartments: unknown
    design?: OcdDesign
    resourceSummary?: Record<string, number>
}

export interface OciRegionOption {
    id: string
    displayName: string
    isHomeRegion?: boolean
}

export interface OciResourceManagerStack {
    id: string
    displayName?: string
}

export interface OciResourceManagerStackList {
    stacks?: OciResourceManagerStack[]
}

export interface OciResourceManagerJob {
    id: string
    operation?: string
}

export interface OciResourceManagerActionResult {
    stack?: OciResourceManagerStack
    job?: OciResourceManagerJob
}

export interface LzAddonUpdateResult {
    sourceKey: string
    pinnedRef: string
    command: string
    stdout: string
    stderr: string
}

export interface OciBackend {
    loadOCIConfigProfileNames: () => Promise<string[]>
    loadOCIConfigProfile: (profile: string) => Promise<Record<string, string>>
    listRegions: (profile: string) => Promise<OciRegionOption[]>
    listTenancyCompartments: (profile: string) => Promise<OciModelResources.OciCompartment[]>
    queryTenancy: (profile: string, compartmentIds: string[], region: string) => Promise<OcdDesign>
    queryDropdown: (profile: string, region: string) => Promise<OcdCacheRegionData>
    queryDiscoverySnapshot: (profile: string, region: string, compartmentIds?: string[]) => Promise<OciDiscoverySnapshot>
    generateArchitecturePlanWithGenAi: (profile: string, region: string, compartmentId: string, modelId: string, prompt: string, temperature?: number, maxTokens?: number) => Promise<GenAiArchitecturePlanResponse>
    generateArchitecturePlanFromImageWithGenAi: (profile: string, region: string, compartmentId: string, modelId: string, prompt: string, imageDataUri: string, temperature?: number, maxTokens?: number) => Promise<GenAiArchitecturePlanResponse>
    listStacks: (profile: string, region: string, compartmentId: string) => Promise<OciResourceManagerStackList>
    createStack: (profile: string, region: string, compartmentId: string, stackName: string, data: OutputDataStringArray, jobOptions?: OciResourceManagerJobOptions) => Promise<OciResourceManagerActionResult>
    updateStack: (profile: string, region: string, stackId: string, data: OutputDataStringArray, jobOptions?: OciResourceManagerJobOptions) => Promise<OciResourceManagerActionResult>
    createJob: (profile: string, region: string, stackId: string, jobOptions?: OciResourceManagerJobOptions) => Promise<OciResourceManagerActionResult>
    getResourceManagerPlanReview: (profile: string, region: string, jobId: string) => Promise<OciResourceManagerPlanReview>
    updateLandingZoneAddon: (sourceKey: string, githubToken?: string) => Promise<LzAddonUpdateResult>
    startLandingZoneAddonUpdateJob: (sourceKey: string, githubToken?: string) => Promise<LzAddonUpdateJobStatus>
    getLandingZoneAddonUpdateJob: (jobId: string) => Promise<LzAddonUpdateJobStatus>
    cancelLandingZoneAddonUpdateJob: (jobId: string) => Promise<LzAddonUpdateJobStatus>
    listLandingZoneAddonHealth: () => Promise<LzAddonSourceHealth[]>
    getOciPriceList: (partNumbers: string[], currencyCode: string) => Promise<PriceMap>
}

export interface OcdBackend extends OciBackend {
    getVersion: () => Promise<string>
    loadDesign: (filename: string) => Promise<OcdDesignFileResult<OcdDesign | undefined>>
    saveDesign: (design: OcdDesign | string, filename: string, suggestedFilename: string | undefined) => Promise<OcdDesignFileResult<OcdDesign>>
    discardConfirmation: () => Promise<boolean>
    loadLibraryIndex: () => Promise<Record<string, unknown>>
    loadLibraryDesign: (section: string, filename: string) => Promise<OcdDesignFileResult<OcdDesign>>
    loadSvgCssFiles: () => Promise<string[]>
    exportTerraform: (design: OcdDesign | string, directory: string) => Promise<unknown>
    exportToExcel: (design: OcdDesign | string, suggestedFilename: string | undefined) => Promise<OcdDesignFileResult<OcdDesign>>
    exportToMarkdown: (design: OcdDesign | string, css: string[], suggestedFilename: string | undefined) => Promise<OcdDesignFileResult<OcdDesign>>
    exportToSvg: (design: OcdDesign | string, css: string[], directory: string, suggestedFilename: string | undefined) => Promise<OcdDesignFileResult<OcdDesign>>
    exportToTerraform: (design: OcdDesign | string, directory: string) => Promise<OcdDesignFileResult<OcdDesign>>
    importFromTerraform: () => Promise<OcdDesignFileResult<OcdDesign | undefined>>
    loadConsoleConfig: () => Promise<OcdConsoleConfiguration>
    saveConsoleConfig: (config: OcdConsoleConfiguration) => Promise<OcdConsoleConfiguration | void>
    loadCache: () => Promise<OcdCache>
    saveCache: (cache: OcdCache) => Promise<OcdCache | void>
    openExternalUrl: (href: string) => Promise<void>
}
