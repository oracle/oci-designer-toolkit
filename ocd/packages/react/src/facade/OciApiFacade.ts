/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { fetchWithTimeout, OcdMetrics } from "@ocd/core"
import { OutputDataStringArray } from "@ocd/export"
import { OcdDesign, OciModelResources } from "@ocd/model"
import { getOciPriceList as fetchOciPriceList, PriceMap } from "@ocd/query/pricing"
import type { GenAiArchitecturePlanResponse, LzAddonSourceHealth, LzAddonUpdateJobStatus, OciResourceManagerJobOptions, OciResourceManagerPlanReview } from "@ocd/query"
import { LzAddonUpdateResult, OciBackend, OciDiscoverySnapshot, OciRegionOption, OciResourceManagerActionResult, OciResourceManagerStackList } from "./OcdBackend"
import { OcdCacheRegionData } from "../components/OcdCache"

/*
** Facade exists so we can switch between Electron based and Web based which will require a web server
*/

/*
** Web (browser) fallback for OCI discovery. The browser cannot read ~/.oci/config nor call
** the OCI SDK (CORS), so when there is no Electron bridge (window.ocdAPI) we call the local
** read-only backend (@ocd/web-server) over the dev-server proxy mount at '/api/oci'
** (see vite.renderer.config.mts). The backend reuses @ocd/query server-side and returns a
** { success, data?, error? } envelope. The Electron path is unchanged.
*/
const OCI_API_BASE_URL = '/api/oci'

/*
** Distributed-tracing correlation id. Each outbound backend call carries an X-Request-Id
** header so the server-side request id (and the query-layer log scope derived from it) can
** be correlated back to the originating renderer call. The web-server accepts a client id
** matching /^[A-Za-z0-9._:-]{1,128}$/ and otherwise generates its own, so the format here is
** kept within that character set. The value is an opaque token only; never an OCID/secret.
*/
const REQUEST_ID_HEADER = 'X-Request-Id'

const createClientRequestId = (): string =>
    `ocd-web-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`

const BACKEND_UNAVAILABLE_MESSAGE = 'OCI backend unavailable in this static build. Start the desktop app or local OCD web server to use live OCI discovery.'

export class BackendUnavailableError extends Error {
    constructor(message = BACKEND_UNAVAILABLE_MESSAGE) {
        super(message)
        this.name = 'BackendUnavailableError'
    }
}

export class OciBackendRequestError extends Error {
    readonly requestId: string
    readonly status: number

    constructor(message: string, requestId: string, status: number) {
        super(message)
        this.name = 'OciBackendRequestError'
        this.requestId = requestId
        this.status = status
    }
}

export const isBackendUnavailableError = (reason: unknown): reason is BackendUnavailableError =>
    reason instanceof BackendUnavailableError || (reason instanceof Error && reason.name === 'BackendUnavailableError')

export const isOciBackendRequestError = (reason: unknown): reason is OciBackendRequestError =>
    reason instanceof OciBackendRequestError || (
        reason instanceof Error &&
        reason.name === 'OciBackendRequestError' &&
        typeof (reason as { requestId?: unknown }).requestId === 'string' &&
        typeof (reason as { status?: unknown }).status === 'number'
    )

export const formatOciBackendError = (reason: unknown): string => {
    if (isOciBackendRequestError(reason)) {
        return reason.requestId ? `${reason.message} (Request ID: ${reason.requestId})` : reason.message
    }
    if (reason instanceof Error) return reason.message
    return `${reason}`
}

interface OcdWebServerResponse<T> {
    success: boolean
    data?: T
    error?: string
    requestId?: string
}

const unwrap = async <T>(response: Response): Promise<T> => {
    let body: OcdWebServerResponse<T>
    try {
        body = (await response.json()) as OcdWebServerResponse<T>
    } catch {
        throw new Error(`OCD web backend returned a non-JSON response (HTTP ${response.status})`)
    }
    if (!body.success) {
        const requestId = body.requestId ?? response.headers.get('x-request-id') ?? ''
        throw new OciBackendRequestError(
            body.error ?? `OCD web backend request failed (HTTP ${response.status})`,
            requestId,
            response.status,
        )
    }
    return body.data as T
}

let backendAvailability: Promise<boolean> | undefined

const hasElectronBackend = (): boolean => typeof window !== 'undefined' && Boolean(window.ocdAPI)

const probeWebBackend = async (): Promise<boolean> => {
    try {
        const response = await fetchWithTimeout(`${OCI_API_BASE_URL}/health`)
        const health = await unwrap<{ status: string }>(response)
        return health.status === 'ok'
    } catch {
        return false
    }
}

const hasWebBackend = (): Promise<boolean> => {
    backendAvailability ??= probeWebBackend()
    return backendAvailability
}

const ensureWebBackendAvailable = async (): Promise<void> => {
    if (hasElectronBackend()) return
    if (!(await hasWebBackend())) throw new BackendUnavailableError()
}

export const resetBackendAvailabilityForTests = (): void => {
    backendAvailability = undefined
}

const webGet = async <T>(path: string): Promise<T> => {
    await ensureWebBackendAvailable()
    const response = await fetchWithTimeout(`${OCI_API_BASE_URL}${path}`, {
        headers: { [REQUEST_ID_HEADER]: createClientRequestId() }
    })
    return unwrap<T>(response)
}

const webPost = async <T>(path: string, payload: Record<string, unknown>): Promise<T> => {
    await ensureWebBackendAvailable()
    const response = await fetchWithTimeout(`${OCI_API_BASE_URL}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', [REQUEST_ID_HEADER]: createClientRequestId() },
        body: JSON.stringify(payload)
    })
    return unwrap<T>(response)
}

const webDelete = async <T>(path: string): Promise<T> => {
    await ensureWebBackendAvailable()
    const response = await fetchWithTimeout(`${OCI_API_BASE_URL}${path}`, {
        method: 'DELETE',
        headers: { [REQUEST_ID_HEADER]: createClientRequestId() }
    })
    return unwrap<T>(response)
}

export namespace OciApiFacade {
    export const checkBackendAvailability = (): Promise<boolean> => {
        if (hasElectronBackend()) return Promise.resolve(true)
        return hasWebBackend()
    }
    export const getVersion = (): Promise<string> => {
        return window.ocdAPI ? window.ocdAPI.getVersion() : Promise.reject(new Error('Currently Not Implemented'))
    }
    export const loadOCIConfigProfileNames: OciBackend['loadOCIConfigProfileNames'] = () => {
        if (window.ocdAPI) return window.ocdAPI.loadOCIConfigProfileNames()
        // Backend returns { profiles: string[] }; the dialog expects a string[].
        return webGet<{ profiles: string[] }>('/profiles').then((result) => result.profiles)
    }
    export const loadOCIConfigProfile: OciBackend['loadOCIConfigProfile'] = (profile: string = 'shipped') => {
        if (window.ocdAPI) return window.ocdAPI.loadOCIConfigProfile(profile)
        return webGet<Record<string, string>>(`/profile?profile=${encodeURIComponent(profile)}`)
    }
    export const listRegions: OciBackend['listRegions'] = (profile: string = 'DEFAULT') => {
        if (window.ocdAPI) return window.ocdAPI.listRegions(profile)
        return webGet<OciRegionOption[]>(`/regions?profile=${encodeURIComponent(profile)}`)
    }
    export const listTenancyCompartments: OciBackend['listTenancyCompartments'] = (profile: string = 'DEFAULT') => {
        if (window.ocdAPI) return window.ocdAPI.listTenancyCompartments(profile)
        return webGet<OciModelResources.OciCompartment[]>(`/compartments?profile=${encodeURIComponent(profile)}`)
    }
    export const queryTenancy: OciBackend['queryTenancy'] = (profile: string = 'DEFAULT', compartmentIds: string[] = [], region: string = 'uk-london-1') => {
        if (window.ocdAPI) return window.ocdAPI.queryTenancy(profile, compartmentIds, region)
        return webPost<OcdDesign>('/query', { profile, region, compartmentIds })
    }
    export const queryDropdown: OciBackend['queryDropdown'] = (profile: string = 'DEFAULT', region: string = 'uk-london-1') => {
        if (window.ocdAPI) return window.ocdAPI.queryDropdown(profile, region)
        return webPost<OcdCacheRegionData>('/dropdown', { profile, region })
    }
    export const queryDiscoverySnapshot: OciBackend['queryDiscoverySnapshot'] = (profile: string = 'DEFAULT', region: string = 'uk-london-1', compartmentIds: string[] = []) => {
        if (window.ocdAPI) return window.ocdAPI.queryDiscoverySnapshot(profile, region, compartmentIds)
        return webPost<OciDiscoverySnapshot>('/discovery/snapshot', { profile, region, compartmentIds })
    }
    export const generateArchitecturePlanWithGenAi: OciBackend['generateArchitecturePlanWithGenAi'] = (
        profile: string = 'DEFAULT',
        region: string = 'uk-london-1',
        compartmentId: string = '',
        modelId: string = '',
        prompt: string = '',
        temperature: number = 0.2,
        maxTokens: number = 2400,
    ) => {
        if (window.ocdAPI) return window.ocdAPI.generateArchitecturePlanWithGenAi(profile, region, compartmentId, modelId, prompt, temperature, maxTokens)
        return webPost<GenAiArchitecturePlanResponse>('/architecture/genai', { profile, region, compartmentId, modelId, prompt, temperature, maxTokens })
    }
    export const generateArchitecturePlanFromImageWithGenAi: OciBackend['generateArchitecturePlanFromImageWithGenAi'] = (
        profile: string = 'DEFAULT',
        region: string = 'uk-london-1',
        compartmentId: string = '',
        modelId: string = '',
        prompt: string = '',
        imageDataUri: string = '',
        temperature: number = 0.2,
        maxTokens: number = 2400,
    ) => {
        // Desktop: Electron bridge. Pure static build with no backend: webPost's
        // ensureWebBackendAvailable throws BackendUnavailableError (same as the text
        // path) so the UI surfaces "start the desktop app or local web server".
        if (window.ocdAPI) return window.ocdAPI.generateArchitecturePlanFromImageWithGenAi(profile, region, compartmentId, modelId, prompt, imageDataUri, temperature, maxTokens)
        return webPost<GenAiArchitecturePlanResponse>('/architecture/genai/image', { profile, region, compartmentId, modelId, prompt, imageDataUri, temperature, maxTokens })
    }
    export const listStacks: OciBackend['listStacks'] = (profile: string = 'DEFAULT', region: string = 'uk-london-1', compartmentId: string = '') => {
        if (window.ocdAPI) return window.ocdAPI.listStacks(profile, region, compartmentId)
        return webGet<OciResourceManagerStackList>(`/resource-manager/stacks?profile=${encodeURIComponent(profile)}&region=${encodeURIComponent(region)}&compartmentId=${encodeURIComponent(compartmentId)}`)
    }
    export const createStack: OciBackend['createStack'] = (profile: string = 'DEFAULT', region: string = 'uk-london-1', compartmentId: string = '', stackName: string = '', data: OutputDataStringArray = {}, jobOptions: OciResourceManagerJobOptions = { operation: 'PLAN' }) => {
        if (window.ocdAPI) return window.ocdAPI.createStack(profile, region, compartmentId, stackName, data, jobOptions)
        return webPost<OciResourceManagerActionResult>('/resource-manager/create-stack', { profile, region, compartmentId, stackName, data, jobOptions })
    }
    export const updateStack: OciBackend['updateStack'] = (profile: string = 'DEFAULT', region: string = 'uk-london-1', stackId: string = '', data: OutputDataStringArray = {}, jobOptions: OciResourceManagerJobOptions = { operation: 'PLAN' }) => {
        if (window.ocdAPI) return window.ocdAPI.updateStack(profile, region, stackId, data, jobOptions)
        return webPost<OciResourceManagerActionResult>('/resource-manager/update-stack', { profile, region, stackId, data, jobOptions })
    }
    export const createJob: OciBackend['createJob'] = (profile: string = 'DEFAULT', region: string = 'uk-london-1', stackId: string = '', jobOptions: OciResourceManagerJobOptions = { operation: 'PLAN' }) => {
        if (window.ocdAPI) return window.ocdAPI.createJob(profile, region, stackId, jobOptions)
        return webPost<OciResourceManagerActionResult>('/resource-manager/create-job', { profile, region, stackId, jobOptions })
    }
    export const getResourceManagerPlanReview: OciBackend['getResourceManagerPlanReview'] = (profile: string = 'DEFAULT', region: string = 'uk-london-1', jobId: string = '') => {
        // Observability: each call is one plan-review poll. Count it and time the
        // underlying fetch (Electron bridge or web backend). No profile/region/
        // jobId is used as a metric label (LABEL CONTRACT). .finally stops the
        // timer on both resolve and reject without altering the returned value.
        OcdMetrics.counter('rm.planreview.poll')
        const pollTimer = OcdMetrics.timer('rm.planreview.poll.ms')
        const review = window.ocdAPI
            ? window.ocdAPI.getResourceManagerPlanReview(profile, region, jobId)
            : webGet<OciResourceManagerPlanReview>(`/resource-manager/plan-review?profile=${encodeURIComponent(profile)}&region=${encodeURIComponent(region)}&jobId=${encodeURIComponent(jobId)}`)
        return review.finally(() => { pollTimer.stop() })
    }
    export const updateLandingZoneAddon: OciBackend['updateLandingZoneAddon'] = (sourceKey: string, githubToken?: string) => {
        if (window.ocdAPI) return window.ocdAPI.updateLandingZoneAddon(sourceKey, githubToken)
        return webPost<LzAddonUpdateResult>('/lz/addon/update', {
            sourceKey,
            ...(githubToken?.trim() ? { githubToken: githubToken.trim() } : {}),
        })
    }
    export const startLandingZoneAddonUpdateJob: OciBackend['startLandingZoneAddonUpdateJob'] = (sourceKey: string, githubToken?: string) => {
        if (window.ocdAPI) return window.ocdAPI.startLandingZoneAddonUpdateJob(sourceKey, githubToken)
        return webPost<LzAddonUpdateJobStatus>('/lz/addon/update-jobs', {
            sourceKey,
            ...(githubToken?.trim() ? { githubToken: githubToken.trim() } : {}),
        })
    }
    export const getLandingZoneAddonUpdateJob: OciBackend['getLandingZoneAddonUpdateJob'] = (jobId: string) => {
        if (window.ocdAPI) return window.ocdAPI.getLandingZoneAddonUpdateJob(jobId)
        return webGet<LzAddonUpdateJobStatus>(`/lz/addon/update-jobs/${encodeURIComponent(jobId)}`)
    }
    export const cancelLandingZoneAddonUpdateJob: OciBackend['cancelLandingZoneAddonUpdateJob'] = (jobId: string) => {
        if (window.ocdAPI) return window.ocdAPI.cancelLandingZoneAddonUpdateJob(jobId)
        return webDelete<LzAddonUpdateJobStatus>(`/lz/addon/update-jobs/${encodeURIComponent(jobId)}`)
    }
    export const listLandingZoneAddonHealth: OciBackend['listLandingZoneAddonHealth'] = () => {
        if (window.ocdAPI) return window.ocdAPI.listLandingZoneAddonHealth()
        return webGet<LzAddonSourceHealth[]>('/lz/addon/health')
    }
    /*
    ** OCI list-pricing lookup. Desktop routes through the Electron main process
    ** (no CORS, 24h disk cache). Web has no Electron bridge, so it fetches via
    ** the vite dev `server.proxy` mount at '/api/pricing' (see
    ** vite.renderer.config.mts). For a production web deployment, host an
    ** equivalent reverse proxy that forwards '/api/pricing' to
    ** https://apexapps.oracle.com/pls/apex/cetools/api/v1/products.
    */
    export const getOciPriceList: OciBackend['getOciPriceList'] = (partNumbers: string[] = [], currency: string = 'USD'): Promise<PriceMap> => {
        return window.ocdAPI
            ? window.ocdAPI.getOciPriceList(partNumbers, currency)
            : ensureWebBackendAvailable().then(() => fetchOciPriceList(partNumbers, currency, { baseUrl: '/api/pricing' }))
    }
}

export const ociApiBackend: OciBackend = {
    loadOCIConfigProfileNames: OciApiFacade.loadOCIConfigProfileNames,
    loadOCIConfigProfile: OciApiFacade.loadOCIConfigProfile,
    listRegions: OciApiFacade.listRegions,
    listTenancyCompartments: OciApiFacade.listTenancyCompartments,
    queryTenancy: OciApiFacade.queryTenancy,
    queryDropdown: OciApiFacade.queryDropdown,
    queryDiscoverySnapshot: OciApiFacade.queryDiscoverySnapshot,
    generateArchitecturePlanWithGenAi: OciApiFacade.generateArchitecturePlanWithGenAi,
    generateArchitecturePlanFromImageWithGenAi: OciApiFacade.generateArchitecturePlanFromImageWithGenAi,
    listStacks: OciApiFacade.listStacks,
    createStack: OciApiFacade.createStack,
    updateStack: OciApiFacade.updateStack,
    createJob: OciApiFacade.createJob,
    getResourceManagerPlanReview: OciApiFacade.getResourceManagerPlanReview,
    updateLandingZoneAddon: OciApiFacade.updateLandingZoneAddon,
    startLandingZoneAddonUpdateJob: OciApiFacade.startLandingZoneAddonUpdateJob,
    getLandingZoneAddonUpdateJob: OciApiFacade.getLandingZoneAddonUpdateJob,
    cancelLandingZoneAddonUpdateJob: OciApiFacade.cancelLandingZoneAddonUpdateJob,
    listLandingZoneAddonHealth: OciApiFacade.listLandingZoneAddonHealth,
    getOciPriceList: OciApiFacade.getOciPriceList,
}
