/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import http from 'http'
import { performance } from 'node:perf_hooks'
import { OcdLogger } from '@ocd/core'
import {
    cancelLandingZoneAddonUpdateJob,
    createJob,
    createStack,
    errorMessage,
    generateArchitecturePlanFromImageWithGenAi,
    generateArchitecturePlanWithGenAi,
    getLandingZoneAddonUpdateJob,
    getResourceManagerPlanReview,
    listLandingZoneAddonHealth,
    listRegions,
    listStacks,
    listTenancyCompartments,
    loadProfile,
    loadProfileNames,
    queryDiscoverySnapshot,
    queryDropdown,
    queryTenancy,
    startLandingZoneAddonUpdateJob,
    updateLandingZoneAddon,
    updateStack
} from './handlers.js'
import {
    validateGenAiArchitectureImageRouteRequest,
    validateGenAiArchitectureRouteRequest,
    validateLzAddonUpdateRequest,
    validateOciQueryRequest,
    validateResourceManagerCreateStackRequest,
    validateResourceManagerJobRequest,
    validateResourceManagerListStacksQuery,
    validateResourceManagerPlanReviewQuery,
    validateResourceManagerUpdateStackRequest,
} from './OciWebServerValidation.js'

export const HOST = '127.0.0.1'
export const DEFAULT_PORT = 5050
const DEFAULT_MAX_BODY_BYTES = 1_048_576
const logger = OcdLogger.scope('web-server')

const DEFAULT_RATE_LIMIT_WINDOW_MS = 1_000
const DEFAULT_RATE_LIMIT_MAX_REQUESTS = 20

interface RateWindow {
    count: number
    windowStart: number
}

const defaultHandlers = {
    cancelLandingZoneAddonUpdateJob,
    createJob,
    createStack,
    generateArchitecturePlanFromImageWithGenAi,
    generateArchitecturePlanWithGenAi,
    getLandingZoneAddonUpdateJob,
    getResourceManagerPlanReview,
    listLandingZoneAddonHealth,
    listRegions,
    listStacks,
    listTenancyCompartments,
    loadProfile,
    loadProfileNames,
    queryDiscoverySnapshot,
    queryDropdown,
    queryTenancy,
    startLandingZoneAddonUpdateJob,
    updateLandingZoneAddon,
    updateStack,
}

export type OciWebServerHandlers = typeof defaultHandlers

export interface OciWebServerOptions {
    handlers?: Partial<OciWebServerHandlers>
    maxBodyBytes?: number
    rateLimit?: {
        maxRequests?: number
        windowMs?: number
    }
}

type RateLimiter = (key: string, now?: number) => boolean

interface ApiSuccess<T> {
    success: true
    data: T
}

interface ApiError {
    success: false
    error: string
    requestId: string
}

type ApiResponse<T> = ApiSuccess<T> | ApiError

const positiveInteger = (value: number | undefined, fallback: number): number =>
    typeof value === 'number' && Number.isInteger(value) && value > 0 ? value : fallback

const resolveMaxBodyBytes = (value: number | undefined): number =>
    positiveInteger(value, DEFAULT_MAX_BODY_BYTES)

const resolveHandlers = (handlers: Partial<OciWebServerHandlers> = {}): OciWebServerHandlers => ({
    ...defaultHandlers,
    ...handlers,
})

const createRateLimiter = (options: OciWebServerOptions['rateLimit'] = {}): RateLimiter => {
    const windowMs = positiveInteger(options.windowMs, DEFAULT_RATE_LIMIT_WINDOW_MS)
    const maxRequests = positiveInteger(options.maxRequests, DEFAULT_RATE_LIMIT_MAX_REQUESTS)
    const rateBuckets = new Map<string, RateWindow>()
    return (key: string, now = Date.now()): boolean => {
        const bucket = rateBuckets.get(key)
        if (!bucket || now - bucket.windowStart >= windowMs) {
            rateBuckets.set(key, { count: 1, windowStart: now })
            if (rateBuckets.size > 1024) {
                for (const [k, w] of rateBuckets) {
                    if (now - w.windowStart >= windowMs) rateBuckets.delete(k)
                }
            }
            return false
        }
        bucket.count += 1
        return bucket.count > maxRequests
    }
}

const defaultRateLimiter = createRateLimiter()

const ALLOWED_VITE_PORTS = new Set(['5173', '5174', '5175', '5176', '5177', '5178', '5179'])
const allowOriginByRes = new WeakMap<http.ServerResponse, string>()
const requestIdByRes = new WeakMap<http.ServerResponse, string>()
const REQUEST_ID_HEADER = 'x-request-id'
const REQUEST_ID_PATTERN = /^[A-Za-z0-9._:-]{1,128}$/

class HttpBoundaryError extends Error {
    readonly status: number

    constructor(status: number, message: string) {
        super(message)
        this.status = status
    }
}

// Deploy guardrail. Resource Manager create/update/apply operations can change
// real cloud resources, so a design must never deploy into a denylisted (e.g.
// production) OCI profile. The denylist is OCD_DEPLOY_DENY_PROFILES (comma-
// separated, case-insensitive); 'emdemo' is denied by default as a production
// tenancy. Read-only operations (listStacks, plan-review) are not gated.
export const deployDenyProfiles = (): Set<string> => {
    const raw = process.env.OCD_DEPLOY_DENY_PROFILES ?? 'emdemo'
    return new Set(raw.split(',').map((entry) => entry.trim().toLowerCase()).filter(Boolean))
}

export const assertDeployAllowed = (profile: string | undefined): void => {
    const normalised = (profile ?? '').trim().toLowerCase()
    if (normalised && deployDenyProfiles().has(normalised)) {
        throw new HttpBoundaryError(
            403,
            `Deploy blocked: OCI profile '${profile}' is denylisted for Resource Manager deploys. ` +
            `Use a non-production profile, or change OCD_DEPLOY_DENY_PROFILES.`,
        )
    }
}

export const port = (): number => {
    const raw = process.env.OCD_WEB_SERVER_PORT
    const parsed = raw ? Number.parseInt(raw, 10) : NaN
    return Number.isInteger(parsed) && parsed > 0 && parsed < 65536 ? parsed : DEFAULT_PORT
}

const resolveAllowedOrigin = (origin: string | undefined): string => {
    if (!origin) return ''
    try {
        const parsed = new URL(origin)
        const loopback = parsed.protocol === 'http:' && (parsed.hostname === '127.0.0.1' || parsed.hostname === 'localhost')
        return loopback && ALLOWED_VITE_PORTS.has(parsed.port) ? origin : ''
    } catch {
        return ''
    }
}

const isLoopbackHost = (host: string | undefined): boolean => {
    const name = (host ?? '').split(':')[0]
    return name === '' || name === '127.0.0.1' || name === 'localhost'
}

const firstHeader = (value: string | string[] | undefined): string | undefined =>
    Array.isArray(value) ? value[0] : value

const createRequestId = (): string =>
    `ocd-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`

const resolveRequestId = (req: http.IncomingMessage): string => {
    const raw = firstHeader(req.headers[REQUEST_ID_HEADER])
    const trimmed = typeof raw === 'string' ? raw.trim() : ''
    return REQUEST_ID_PATTERN.test(trimmed) ? trimmed : createRequestId()
}

const isJsonContentType = (req: http.IncomingMessage): boolean => {
    const contentType = firstHeader(req.headers['content-type']) ?? ''
    return /^application\/json(?:\s*;|$)/i.test(contentType)
}

const errorStatus = (reason: unknown): number =>
    reason instanceof HttpBoundaryError ? reason.status : 400

const responseRequestId = (res: http.ServerResponse): string => {
    const existing = requestIdByRes.get(res)
    if (existing) return existing
    const generated = createRequestId()
    requestIdByRes.set(res, generated)
    return generated
}

const sendJson = <T>(res: http.ServerResponse, status: number, payload: ApiResponse<T>): void => {
    const body = JSON.stringify(payload)
    const allowOrigin = allowOriginByRes.get(res) ?? ''
    const requestId = responseRequestId(res)
    res.writeHead(status, {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Length': Buffer.byteLength(body),
        'X-Request-Id': requestId,
        ...(allowOrigin
            ? {
                  'Access-Control-Allow-Origin': allowOrigin,
                  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                  'Access-Control-Allow-Headers': 'Content-Type, X-Request-Id',
                  'Access-Control-Expose-Headers': 'X-Request-Id',
                  Vary: 'Origin'
              }
            : {})
    })
    res.end(body)
}

const sendOk = <T>(res: http.ServerResponse, data: T): void => sendJson(res, 200, { success: true, data })

const sendError = (res: http.ServerResponse, status: number, error: string): void =>
    sendJson(res, status, { success: false, error, requestId: responseRequestId(res) })

const readBody = (req: http.IncomingMessage, maxBodyBytes: number): Promise<string> =>
    new Promise((resolve, reject) => {
        let size = 0
        let rejected = false
        const chunks: Buffer[] = []
        req.on('data', (chunk: Buffer) => {
            if (rejected) return
            size += chunk.length
            if (size > maxBodyBytes) {
                rejected = true
                chunks.length = 0
                reject(new Error('Request body too large'))
                req.resume()
                return
            }
            chunks.push(chunk)
        })
        req.on('end', () => {
            if (!rejected) resolve(Buffer.concat(chunks).toString('utf-8'))
        })
        req.on('error', (reason) => {
            if (!rejected) reject(reason)
        })
    })

const parseJsonBody = async <T>(req: http.IncomingMessage, maxBodyBytes: number): Promise<T> => {
    if (!isJsonContentType(req)) {
        throw new HttpBoundaryError(415, 'Content-Type must be application/json')
    }
    const raw = await readBody(req, maxBodyBytes)
    if (!raw) return {} as T
    try {
        return JSON.parse(raw) as T
    } catch {
        throw new Error('Request body is not valid JSON')
    }
}

const queryParam = (url: URL, name: string, fallback: string): string => {
    const value = url.searchParams.get(name)
    return value !== null && value.length > 0 ? value : fallback
}

const timedOperation = async <T>(requestId: string, name: string, operation: () => T | Promise<T>): Promise<T> => {
    const start = performance.now()
    try {
        const result = await operation()
        logger.info(`${name} completed`, {
            durationMs: Math.round(performance.now() - start),
            requestId,
        })
        return result
    } catch (reason: unknown) {
        logger.warn(`${name} failed`, {
            durationMs: Math.round(performance.now() - start),
            error: errorMessage(reason),
            requestId,
        })
        throw reason
    }
}

export const handleOciWebRequest = async (
    req: http.IncomingMessage,
    res: http.ServerResponse,
    isRequestRateLimited: RateLimiter = defaultRateLimiter,
    maxBodyBytes = DEFAULT_MAX_BODY_BYTES,
    handlers = defaultHandlers,
): Promise<void> => {
    const requestId = resolveRequestId(req)
    requestIdByRes.set(res, requestId)
    const method = req.method ?? 'GET'
    const url = new URL(req.url ?? '/', `http://${HOST}`)
    const pathname = url.pathname

    if (!isLoopbackHost(req.headers.host)) {
        sendError(res, 403, 'Forbidden')
        return
    }

    const allowOrigin = resolveAllowedOrigin(req.headers.origin)
    allowOriginByRes.set(res, allowOrigin)

    if (method === 'OPTIONS') {
        res.writeHead(204, allowOrigin
            ? {
                  'Access-Control-Allow-Origin': allowOrigin,
                  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                  'Access-Control-Allow-Headers': 'Content-Type, X-Request-Id',
                  'Access-Control-Expose-Headers': 'X-Request-Id',
                  'X-Request-Id': requestId,
                  Vary: 'Origin'
              }
            : { 'X-Request-Id': requestId, Vary: 'Origin' })
        res.end()
        return
    }

    if (method === 'GET' && pathname === '/api/oci/health') {
        sendOk(res, { status: 'ok' })
        return
    }

    if (isRequestRateLimited(req.socket.remoteAddress ?? 'unknown')) {
        sendError(res, 429, 'Too many requests — rate limit exceeded')
        return
    }

    try {
        if (method === 'GET' && pathname === '/api/oci/profiles') {
            sendOk(res, handlers.loadProfileNames())
            return
        }
        if (method === 'GET' && pathname === '/api/oci/profile') {
            const profile = queryParam(url, 'profile', 'DEFAULT')
            sendOk(res, handlers.loadProfile(profile))
            return
        }
        if (method === 'GET' && pathname === '/api/oci/regions') {
            const profile = queryParam(url, 'profile', 'DEFAULT')
            sendOk(res, await timedOperation(requestId, 'listRegions', () => handlers.listRegions(profile)))
            return
        }
        if (method === 'GET' && pathname === '/api/oci/compartments') {
            const profile = queryParam(url, 'profile', 'DEFAULT')
            sendOk(res, await timedOperation(requestId, 'listTenancyCompartments', () => handlers.listTenancyCompartments(profile)))
            return
        }
        if (method === 'POST' && pathname === '/api/oci/query') {
            const body = validateOciQueryRequest(await parseJsonBody<unknown>(req, maxBodyBytes))
            const result = await timedOperation(requestId, 'queryTenancy', () => handlers.queryTenancy({
                profile: body.profile,
                region: body.region,
                compartmentIds: body.compartmentIds,
                requestId
            }))
            sendOk(res, result)
            return
        }
        if (method === 'POST' && pathname === '/api/oci/dropdown') {
            const body = validateOciQueryRequest(await parseJsonBody<unknown>(req, maxBodyBytes))
            const result = await timedOperation(requestId, 'queryDropdown', () => handlers.queryDropdown({
                profile: body.profile,
                region: body.region
            }))
            sendOk(res, result)
            return
        }
        if (method === 'POST' && pathname === '/api/oci/discovery/snapshot') {
            const body = validateOciQueryRequest(await parseJsonBody<unknown>(req, maxBodyBytes))
            const result = await timedOperation(requestId, 'queryDiscoverySnapshot', () => handlers.queryDiscoverySnapshot({
                profile: body.profile,
                region: body.region,
                compartmentIds: body.compartmentIds
            }))
            sendOk(res, result)
            return
        }
        if (method === 'POST' && pathname === '/api/oci/architecture/genai') {
            const body = validateGenAiArchitectureRouteRequest(await parseJsonBody<unknown>(req, maxBodyBytes))
            const result = await timedOperation(requestId, 'generateArchitecturePlanWithGenAi', () => handlers.generateArchitecturePlanWithGenAi(body))
            sendOk(res, result)
            return
        }
        if (method === 'POST' && pathname === '/api/oci/architecture/genai/image') {
            const body = validateGenAiArchitectureImageRouteRequest(await parseJsonBody<unknown>(req, maxBodyBytes))
            const result = await timedOperation(requestId, 'generateArchitecturePlanFromImageWithGenAi', () => handlers.generateArchitecturePlanFromImageWithGenAi(body))
            sendOk(res, result)
            return
        }
        if (method === 'GET' && pathname === '/api/oci/resource-manager/stacks') {
            const query = validateResourceManagerListStacksQuery(url.searchParams)
            const result = await timedOperation(requestId, 'listStacks', () => handlers.listStacks(query.profile, query.region, query.compartmentId))
            sendOk(res, result)
            return
        }
        if (method === 'POST' && pathname === '/api/oci/resource-manager/create-stack') {
            const body = validateResourceManagerCreateStackRequest(await parseJsonBody<unknown>(req, maxBodyBytes))
            assertDeployAllowed(body.profile)
            const result = await timedOperation(requestId, 'createStack', () => handlers.createStack({
                profile: body.profile,
                region: body.region,
                compartmentId: body.compartmentId,
                stackName: body.stackName,
                data: body.data,
                jobOptions: body.jobOptions,
            }))
            sendOk(res, result)
            return
        }
        if (method === 'POST' && pathname === '/api/oci/resource-manager/update-stack') {
            const body = validateResourceManagerUpdateStackRequest(await parseJsonBody<unknown>(req, maxBodyBytes))
            assertDeployAllowed(body.profile)
            const result = await timedOperation(requestId, 'updateStack', () => handlers.updateStack({
                profile: body.profile,
                region: body.region,
                stackId: body.stackId,
                data: body.data,
                jobOptions: body.jobOptions,
            }))
            sendOk(res, result)
            return
        }
        if (method === 'POST' && pathname === '/api/oci/resource-manager/create-job') {
            const body = validateResourceManagerJobRequest(await parseJsonBody<unknown>(req, maxBodyBytes))
            assertDeployAllowed(body.profile)
            const result = await timedOperation(requestId, 'createJob', () => handlers.createJob({
                profile: body.profile,
                region: body.region,
                stackId: body.stackId,
                jobOptions: body.jobOptions,
            }))
            sendOk(res, result)
            return
        }
        if (method === 'GET' && pathname === '/api/oci/resource-manager/plan-review') {
            const query = validateResourceManagerPlanReviewQuery(url.searchParams)
            const result = await timedOperation(requestId, 'getResourceManagerPlanReview', () => handlers.getResourceManagerPlanReview(query))
            sendOk(res, result)
            return
        }
        if (method === 'POST' && pathname === '/api/oci/lz/addon/update') {
            const body = validateLzAddonUpdateRequest(await parseJsonBody<unknown>(req, maxBodyBytes))
            const result = await timedOperation(requestId, 'updateLandingZoneAddon', () => handlers.updateLandingZoneAddon(body.sourceKey, {
                githubToken: body.githubToken,
            }))
            sendOk(res, result)
            return
        }
        if (method === 'POST' && pathname === '/api/oci/lz/addon/update-jobs') {
            const body = validateLzAddonUpdateRequest(await parseJsonBody<unknown>(req, maxBodyBytes))
            const result = await timedOperation(requestId, 'startLandingZoneAddonUpdateJob', () => Promise.resolve(handlers.startLandingZoneAddonUpdateJob(body.sourceKey, {
                githubToken: body.githubToken,
            })))
            sendOk(res, result)
            return
        }
        const updateJobMatch = pathname.match(/^\/api\/oci\/lz\/addon\/update-jobs\/([A-Za-z0-9-]+)$/)
        if (updateJobMatch && method === 'GET') {
            const result = await timedOperation(requestId, 'getLandingZoneAddonUpdateJob', () => Promise.resolve(handlers.getLandingZoneAddonUpdateJob(updateJobMatch[1])))
            sendOk(res, result)
            return
        }
        if (updateJobMatch && method === 'DELETE') {
            const result = await timedOperation(requestId, 'cancelLandingZoneAddonUpdateJob', () => Promise.resolve(handlers.cancelLandingZoneAddonUpdateJob(updateJobMatch[1])))
            sendOk(res, result)
            return
        }
        if (method === 'GET' && pathname === '/api/oci/lz/addon/health') {
            const result = await timedOperation(requestId, 'listLandingZoneAddonHealth', () => handlers.listLandingZoneAddonHealth())
            sendOk(res, result)
            return
        }
        sendError(res, 404, `Unknown endpoint: ${method} ${pathname}`)
    } catch (reason: unknown) {
        sendError(res, errorStatus(reason), errorMessage(reason))
    }
}

export const createOciWebServer = (options: OciWebServerOptions = {}): http.Server => {
    const isRequestRateLimited = createRateLimiter(options.rateLimit)
    const maxBodyBytes = resolveMaxBodyBytes(options.maxBodyBytes)
    const handlers = resolveHandlers(options.handlers)
    return http.createServer((req, res) => {
        handleOciWebRequest(req, res, isRequestRateLimited, maxBodyBytes, handlers).catch((reason: unknown) => {
            sendError(res, 500, errorMessage(reason))
        })
    })
}
