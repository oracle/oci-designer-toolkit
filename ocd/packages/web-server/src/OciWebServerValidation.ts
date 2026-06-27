import type { OutputDataStringArray } from '@ocd/export'
import {
    validateGenAiArchitectureImageRequest,
    validateGenAiArchitectureRequest,
    type GenAiArchitecturePlanImageRequest,
    type GenAiArchitecturePlanRequest,
    type OciResourceManagerJobOptions,
} from '@ocd/query'

const SOURCE_KEY_PATTERN = /^[a-z0-9-]+$/
const MAX_STRING_LENGTH = 2048

type UnknownRecord = Record<string, unknown>

export interface ValidatedOciQueryRequest {
    profile: string
    region: string
    compartmentIds: string[]
}

export interface ValidatedResourceManagerStackMutationRequest {
    profile: string
    region: string
    compartmentId: string
    stackName: string
    stackId: string
    data: OutputDataStringArray
    jobOptions: OciResourceManagerJobOptions
}

export interface ValidatedResourceManagerJobRequest {
    profile: string
    region: string
    stackId: string
    jobOptions: OciResourceManagerJobOptions
}

export interface ValidatedResourceManagerListStacksQuery {
    profile: string
    region: string
    compartmentId: string
}

export interface ValidatedResourceManagerPlanReviewQuery {
    profile: string
    region: string
    jobId: string
}

export interface ValidatedLzAddonUpdateRequest {
    sourceKey: string
    githubToken?: string
}

export type ValidatedGenAiArchitectureRouteRequest = GenAiArchitecturePlanRequest
export type ValidatedGenAiArchitectureImageRouteRequest = GenAiArchitecturePlanImageRequest

const isRecord = (value: unknown): value is UnknownRecord =>
    Boolean(value) && typeof value === 'object' && !Array.isArray(value)

const stringValue = (
    value: unknown,
    field: string,
    fallback = '',
    required = false,
): string => {
    const next = typeof value === 'string' ? value.trim() : fallback
    if (required && !next) throw new Error(`${field} is required`)
    if (next.length > MAX_STRING_LENGTH) throw new Error(`${field} is too long`)
    return next
}

const bodyRecord = (body: unknown): UnknownRecord => {
    if (!isRecord(body)) throw new Error('Request body must be a JSON object')
    return body
}

const optionalNumber = (value: unknown): number | undefined =>
    typeof value === 'number' && Number.isFinite(value) ? value : undefined

const promptValue = (value: unknown): string =>
    typeof value === 'string' ? value.trim() : ''

const queryValue = (
    searchParams: URLSearchParams,
    field: string,
    fallback = '',
    required = false,
): string => {
    const value = stringValue(searchParams.get(field) ?? fallback, field, fallback, required)
    if (required && !value) throw new Error(`${field} is required`)
    return value
}

export const validateOciQueryRequest = (body: unknown): ValidatedOciQueryRequest => {
    const request = bodyRecord(body)
    const rawCompartmentIds = request.compartmentIds
    if (rawCompartmentIds !== undefined && !Array.isArray(rawCompartmentIds)) {
        throw new Error('compartmentIds must be an array')
    }
    return {
        profile: stringValue(request.profile, 'profile', 'DEFAULT'),
        region: stringValue(request.region, 'region'),
        compartmentIds: (rawCompartmentIds ?? [])
            .filter((value): value is string => typeof value === 'string')
            .map((value) => value.trim())
            .filter(Boolean),
    }
}

export const validateResourceManagerJobOptions = (value: unknown): OciResourceManagerJobOptions => {
    if (value === undefined || value === null) return { operation: 'PLAN' }
    if (!isRecord(value)) throw new Error('jobOptions must be a JSON object')
    const operation = stringValue(value.operation, 'operation', 'PLAN')
    if (operation !== 'PLAN' && operation !== 'APPLY') throw new Error('operation must be PLAN or APPLY')
    if (operation === 'PLAN') return { operation }
    const planJobId = stringValue(value.planJobId, 'planJobId', '', true)
    const approval = stringValue(value.approval, 'approval', '', true)
    if (approval !== 'APPLY') throw new Error('approval must be APPLY')
    // Plan-review-before-apply: an APPLY must reference the PLAN job that was
    // reviewed, so a design can never be applied without first inspecting a plan.
    if (!planJobId.trim()) throw new Error('planJobId is required for APPLY — run and review a PLAN job before applying')
    return { operation, planJobId, approval }
}

export const validateTerraformData = (value: unknown): OutputDataStringArray => {
    if (value === undefined || value === null) return {}
    if (!isRecord(value)) throw new Error('data must be a JSON object')
    return Object.entries(value).reduce<OutputDataStringArray>((accumulator, [filename, contents]) => {
        if (!filename.trim() || !Array.isArray(contents)) return accumulator
        return {
            ...accumulator,
            [filename.trim()]: contents.filter((line): line is string => typeof line === 'string'),
        }
    }, {})
}

export const validateResourceManagerStackMutationRequest = (
    body: unknown,
): ValidatedResourceManagerStackMutationRequest => {
    const request = bodyRecord(body)
    return {
        profile: stringValue(request.profile, 'profile', 'DEFAULT'),
        region: stringValue(request.region, 'region', '', true),
        compartmentId: stringValue(request.compartmentId, 'compartmentId', ''),
        stackName: stringValue(request.stackName, 'stackName', ''),
        stackId: stringValue(request.stackId, 'stackId', ''),
        data: validateTerraformData(request.data),
        jobOptions: validateResourceManagerJobOptions(request.jobOptions),
    }
}

export const validateResourceManagerCreateStackRequest = (
    body: unknown,
): ValidatedResourceManagerStackMutationRequest => {
    const request = validateResourceManagerStackMutationRequest(body)
    if (!request.compartmentId) throw new Error('compartmentId is required')
    if (!request.stackName) throw new Error('stackName is required')
    return request
}

export const validateResourceManagerUpdateStackRequest = (
    body: unknown,
): ValidatedResourceManagerStackMutationRequest => {
    const request = validateResourceManagerStackMutationRequest(body)
    if (!request.stackId) throw new Error('stackId is required')
    return request
}

export const validateResourceManagerJobRequest = (body: unknown): ValidatedResourceManagerJobRequest => {
    const request = bodyRecord(body)
    return {
        profile: stringValue(request.profile, 'profile', 'DEFAULT'),
        region: stringValue(request.region, 'region', '', true),
        stackId: stringValue(request.stackId, 'stackId', '', true),
        jobOptions: validateResourceManagerJobOptions(request.jobOptions),
    }
}

export const validateResourceManagerListStacksQuery = (
    searchParams: URLSearchParams,
): ValidatedResourceManagerListStacksQuery => ({
    profile: queryValue(searchParams, 'profile', 'DEFAULT'),
    region: queryValue(searchParams, 'region', '', true),
    compartmentId: queryValue(searchParams, 'compartmentId', '', true),
})

export const validateResourceManagerPlanReviewQuery = (
    searchParams: URLSearchParams,
): ValidatedResourceManagerPlanReviewQuery => ({
    profile: queryValue(searchParams, 'profile', 'DEFAULT'),
    region: queryValue(searchParams, 'region', '', true),
    jobId: queryValue(searchParams, 'jobId', '', true),
})

export const validateLzAddonUpdateRequest = (body: unknown): ValidatedLzAddonUpdateRequest => {
    const request = bodyRecord(body)
    const sourceKey = stringValue(request.sourceKey, 'sourceKey', '', true)
    if (!SOURCE_KEY_PATTERN.test(sourceKey)) throw new Error('Invalid Landing Zone add-on source key')
    const githubToken = stringValue(request.githubToken, 'githubToken')
    if (/[\r\n]/.test(githubToken)) throw new Error('GitHub token must be a single line')
    return {
        sourceKey,
        ...(githubToken ? { githubToken } : {}),
    }
}

export const validateGenAiArchitectureRouteRequest = (
    body: unknown,
): ValidatedGenAiArchitectureRouteRequest => {
    const request = bodyRecord(body)
    return validateGenAiArchitectureRequest({
        profile: stringValue(request.profile, 'profile', 'DEFAULT'),
        region: stringValue(request.region, 'region'),
        compartmentId: stringValue(request.compartmentId, 'compartmentId'),
        modelId: stringValue(request.modelId, 'modelId'),
        prompt: promptValue(request.prompt),
        temperature: optionalNumber(request.temperature),
        maxTokens: optionalNumber(request.maxTokens),
    })
}

/*
** Vision (image) route validator. imageDataUri is NOT run through stringValue because
** a base64 image data-URI exceeds the generic MAX_STRING_LENGTH cap; the @ocd/query
** validator enforces the image/* prefix and the decoded size cap instead.
*/
export const validateGenAiArchitectureImageRouteRequest = (
    body: unknown,
): ValidatedGenAiArchitectureImageRouteRequest => {
    const request = bodyRecord(body)
    return validateGenAiArchitectureImageRequest({
        profile: stringValue(request.profile, 'profile', 'DEFAULT'),
        region: stringValue(request.region, 'region'),
        compartmentId: stringValue(request.compartmentId, 'compartmentId'),
        modelId: stringValue(request.modelId, 'modelId'),
        prompt: promptValue(request.prompt),
        imageDataUri: typeof request.imageDataUri === 'string' ? request.imageDataUri : '',
        temperature: optionalNumber(request.temperature),
        maxTokens: optionalNumber(request.maxTokens),
    })
}
