/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

/*
** Shared backend implementation for OCI config/discovery operations.
**
** Electron IPC and the localhost web-server expose different transports, but the
** profile parsing and OCI query behavior must stay identical. Keep transport
** envelopes outside this module.
*/

import { common } from 'oci-sdk'
import { OciGenAiArchitectureImageRequest, OciGenAiArchitectureQuery, OciGenAiArchitectureRequest, OciGenAiArchitectureResponse } from './OciGenAiArchitectureQuery.js'
import { OciQuery } from './OciQuery.js'
import { OciReferenceDataQuery } from './OciReferenceDataQuery.js'
import { OciResourceManagerJobOptions, OciResourceManagerPlanReview, OciResourceManagerQuery } from './OciResourceManagerQuery.js'

export interface ProfilesResult {
    profiles: string[]
}

export interface QueryTenancyRequest {
    profile: string
    region: string
    compartmentIds: string[]
}

export interface QueryDropdownRequest {
    profile: string
    region: string
}

export interface QueryDiscoverySnapshotRequest {
    profile: string
    region: string
    compartmentIds?: string[]
}

export interface StackActionRequest {
    profile: string
    region: string
    compartmentId?: string
    stackId?: string
    stackName?: string
    data?: Record<string, string[]>
    apply?: boolean
    jobOptions?: OciResourceManagerJobOptions
}

export interface ResourceManagerJobReviewRequest {
    profile: string
    region: string
    jobId: string
}

export type GenAiArchitecturePlanRequest = OciGenAiArchitectureRequest
export type GenAiArchitecturePlanImageRequest = OciGenAiArchitectureImageRequest
export type GenAiArchitecturePlanResponse = OciGenAiArchitectureResponse

interface ParsedOciConfig {
    accumulator: {
        configurationsByProfile: Map<string, Map<string, string>>
    }
}

const SENSITIVE_PROFILE_KEYS: ReadonlyArray<string> = [
    'key_file',
    'security_token_file',
    'pass_phrase',
    'passphrase',
    'fingerprint',
    'cert-bundle',
]

export const errorMessage = (reason: unknown): string => {
    if (reason instanceof Error) return reason.message
    if (typeof reason === 'string') return reason
    return 'Unexpected error'
}

const readDefaultOciConfig = (): ParsedOciConfig => {
    try {
        return common.ConfigFileReader.parseDefault(null) as ParsedOciConfig
    } catch (reason: unknown) {
        throw new Error(`Unable to read OCI config (~/.oci/config): ${errorMessage(reason)}`)
    }
}

export const getOciConfigProfileNames = (parsed: ParsedOciConfig): string[] => {
    const profiles = Array.from(parsed.accumulator.configurationsByProfile.keys())
    if (profiles.length === 0) throw new Error('No OCI profiles found in ~/.oci/config')
    return profiles
}

export const sanitizeOciConfigProfile = (
    profileData: Map<string, string> | undefined,
    profile = 'DEFAULT',
): Record<string, string> => {
    if (profileData === undefined) throw new Error(`OCI profile '${profile}' not found in ~/.oci/config`)
    const sanitized: Record<string, string> = {}
    for (const [key, value] of profileData.entries()) {
        if (!SENSITIVE_PROFILE_KEYS.includes(key)) sanitized[key] = value
    }
    return sanitized
}

export const loadOciConfigProfileNames = (): string[] => getOciConfigProfileNames(readDefaultOciConfig())

export const loadOciConfigProfiles = (): ProfilesResult => ({ profiles: loadOciConfigProfileNames() })

export const loadOciConfigProfile = (profile: string): Record<string, string> => {
    const parsed = readDefaultOciConfig()
    return sanitizeOciConfigProfile(parsed.accumulator.configurationsByProfile.get(profile), profile)
}

export const listRegions = (profile: string): Promise<unknown> => {
    const query = new OciQuery(profile)
    return query.withTimeout(query.listRegions(), 'listRegions')
}

export const listTenancyCompartments = (profile: string): Promise<unknown> => {
    const query = new OciQuery(profile)
    return query.withTimeout(query.listTenancyCompartments(), 'listTenancyCompartments')
}

export const queryTenancy = (request: QueryTenancyRequest): Promise<unknown> => {
    const { profile, region, compartmentIds } = request
    const query = new OciQuery(profile, region)
    return query.withTimeout(query.queryTenancy(compartmentIds), 'queryTenancy')
}

export const queryDropdown = (request: QueryDropdownRequest): Promise<unknown> => {
    const { profile, region } = request
    const query = new OciReferenceDataQuery(profile, region)
    return query.withTimeout(query.query(), 'queryDropdown')
}

export const queryDiscoverySnapshot = async (request: QueryDiscoverySnapshotRequest): Promise<unknown> => {
    const { profile, region } = request
    const compartmentIds = Array.isArray(request.compartmentIds) ? request.compartmentIds : []
    const query = new OciQuery(profile, region)
    const compartments = await query.withTimeout(query.listTenancyCompartments(), 'discoverySnapshotCompartments')
    if (compartmentIds.length === 0) {
        return {
            source: 'oci-query',
            generatedAt: new Date().toISOString(),
            profile,
            region,
            compartmentIds,
            compartments,
            resourceSummary: {},
        }
    }
    const design = await query.withTimeout(query.queryTenancy(compartmentIds), 'discoverySnapshotDesign')
    const resources = design?.model?.oci?.resources ?? {}
    const resourceSummary = Object.fromEntries(
        Object.entries(resources)
            .filter(([, value]) => Array.isArray(value))
            .map(([key, value]) => [key, (value as unknown[]).length])
    )
    return {
        source: 'oci-query',
        generatedAt: new Date().toISOString(),
        profile,
        region,
        compartmentIds,
        compartments,
        design,
        resourceSummary,
    }
}

export const listStacks = (profile: string, region: string, compartmentId: string): Promise<unknown> => {
    const query = new OciResourceManagerQuery(profile, region)
    return query.query([compartmentId])
}

export const createStack = (request: StackActionRequest): Promise<unknown> => {
    const query = new OciResourceManagerQuery(request.profile, request.region)
    return query.createStack(request.compartmentId ?? '', request.stackName ?? '', request.data ?? {}, request.jobOptions ?? request.apply ?? false)
}

export const updateStack = (request: StackActionRequest): Promise<unknown> => {
    const query = new OciResourceManagerQuery(request.profile, request.region)
    return query.updateStack(request.stackId ?? '', request.data ?? {}, request.jobOptions ?? request.apply ?? false)
}

export const createJob = (request: StackActionRequest): Promise<unknown> => {
    const query = new OciResourceManagerQuery(request.profile, request.region)
    return query.createJob(request.stackId ?? '', request.jobOptions ?? request.apply ?? false).then((job) => ({ job }))
}

export const getResourceManagerPlanReview = (request: ResourceManagerJobReviewRequest): Promise<OciResourceManagerPlanReview> => {
    const query = new OciResourceManagerQuery(request.profile, request.region)
    return query.getPlanReview(request.jobId)
}

export const generateArchitecturePlanWithGenAi = (request: GenAiArchitecturePlanRequest): Promise<GenAiArchitecturePlanResponse> => {
    const query = new OciGenAiArchitectureQuery(request.profile, request.region)
    return query.generateArchitecturePlan(request)
}

export const generateArchitecturePlanFromImageWithGenAi = (request: GenAiArchitecturePlanImageRequest): Promise<GenAiArchitecturePlanResponse> => {
    const query = new OciGenAiArchitectureQuery(request.profile, request.region)
    return query.generateArchitecturePlanFromImage(request)
}
