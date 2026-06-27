/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { afterEach, describe, expect, it, vi } from 'vitest'
import { BackendUnavailableError, formatOciBackendError, OciBackendRequestError, OciApiFacade, resetBackendAvailabilityForTests } from '../OciApiFacade'

// NOTE: backend requests now flow through `fetchWithTimeout` (@ocd/core, W5-O1), which
// always passes an options object carrying the AbortController `signal` (even for GETs
// that previously called fetch with a single argument). These assertions therefore pin
// the request URL (and, for writes, the method/body via objectContaining) while
// tolerating the trailing options object that the timeout wrapper adds.

const jsonResponse = (body: unknown, status = 200, headers: Record<string, string> = {}): Response =>
    new Response(JSON.stringify(body), {
        status,
        headers: { 'Content-Type': 'application/json', ...headers },
    })

const htmlResponse = (): Response =>
    new Response('<!doctype html><div id="root"></div>', {
        status: 200,
        headers: { 'Content-Type': 'text/html' },
    })

describe('OciApiFacade static backend handling', () => {
    afterEach(() => {
        vi.restoreAllMocks()
        resetBackendAvailabilityForTests()
        delete (globalThis as { window?: unknown }).window
    })

    it('rejects with BackendUnavailableError when the static Pages fallback returns HTML', async () => {
        ;(globalThis as { window?: { ocdAPI?: unknown } }).window = {}
        const fetchMock = vi.fn().mockResolvedValue(htmlResponse())
        vi.stubGlobal('fetch', fetchMock)

        await expect(OciApiFacade.loadOCIConfigProfileNames()).rejects.toBeInstanceOf(BackendUnavailableError)
        await expect(OciApiFacade.loadOCIConfigProfileNames()).rejects.toMatchObject({
            name: 'BackendUnavailableError',
        })

        expect(fetchMock).toHaveBeenCalledTimes(1)
        expect(fetchMock).toHaveBeenCalledWith('/api/oci/health', expect.anything())
    })

    it('uses the web backend after a successful JSON health probe', async () => {
        ;(globalThis as { window?: { ocdAPI?: unknown } }).window = {}
        const fetchMock = vi
            .fn()
            .mockResolvedValueOnce(jsonResponse({ success: true, data: { status: 'ok' } }))
            .mockResolvedValueOnce(jsonResponse({ success: true, data: { profiles: ['DEFAULT'] } }))
        vi.stubGlobal('fetch', fetchMock)

        await expect(OciApiFacade.loadOCIConfigProfileNames()).resolves.toEqual(['DEFAULT'])

        expect(fetchMock).toHaveBeenNthCalledWith(1, '/api/oci/health', expect.anything())
        expect(fetchMock).toHaveBeenNthCalledWith(2, '/api/oci/profiles', expect.anything())
    })

    it('exposes cached web backend availability for readiness UI', async () => {
        ;(globalThis as { window?: { ocdAPI?: unknown } }).window = {}
        const fetchMock = vi
            .fn()
            .mockResolvedValueOnce(jsonResponse({ success: true, data: { status: 'ok' } }))
        vi.stubGlobal('fetch', fetchMock)

        await expect(OciApiFacade.checkBackendAvailability()).resolves.toBe(true)
        await expect(OciApiFacade.checkBackendAvailability()).resolves.toBe(true)

        expect(fetchMock).toHaveBeenCalledTimes(1)
        expect(fetchMock).toHaveBeenCalledWith('/api/oci/health', expect.anything())
    })

    it('sends an X-Request-Id correlation header on backend calls (distributed tracing)', async () => {
        ;(globalThis as { window?: { ocdAPI?: unknown } }).window = {}
        const fetchMock = vi
            .fn()
            .mockResolvedValueOnce(jsonResponse({ success: true, data: { status: 'ok' } }))
            .mockResolvedValueOnce(jsonResponse({ success: true, data: { model: { oci: { resources: {} } } } }))
        vi.stubGlobal('fetch', fetchMock)

        await OciApiFacade.queryTenancy('DEFAULT', ['compartment-test'], 'eu-frankfurt-1')

        // Call 1 is the health probe; call 2 is the tenancy query and must carry the
        // correlation id so the server scopes its query-layer logger to it.
        const [, queryInit] = fetchMock.mock.calls[1] as [string, RequestInit]
        const requestId = (queryInit.headers as Record<string, string>)['X-Request-Id']
        // Must satisfy the web-server's accepted id pattern so the id is honoured, not regenerated.
        expect(requestId).toMatch(/^[A-Za-z0-9._:-]{1,128}$/)
        expect(fetchMock).toHaveBeenNthCalledWith(2, '/api/oci/query', expect.objectContaining({
            method: 'POST',
            headers: expect.objectContaining({ 'X-Request-Id': expect.any(String) }),
        }))
    })

    it('reports backend availability through Electron without a web health probe', async () => {
        ;(globalThis as { window?: { ocdAPI?: Record<string, unknown> } }).window = {
            ocdAPI: {},
        }
        const fetchMock = vi.fn()
        vi.stubGlobal('fetch', fetchMock)

        await expect(OciApiFacade.checkBackendAvailability()).resolves.toBe(true)

        expect(fetchMock).not.toHaveBeenCalled()
    })

    it('posts add-on update requests to the local web backend after health probe', async () => {
        ;(globalThis as { window?: { ocdAPI?: unknown } }).window = {}
        const fetchMock = vi
            .fn()
            .mockResolvedValueOnce(jsonResponse({ success: true, data: { status: 'ok' } }))
            .mockResolvedValueOnce(jsonResponse({
                success: true,
                data: {
                    sourceKey: 'landing-zone-next-gen',
                    command: 'node scripts/setup_landing_zone.mjs --latest --source landing-zone-next-gen --install',
                    stdout: '',
                    stderr: '',
                },
            }))
        vi.stubGlobal('fetch', fetchMock)

        await expect(OciApiFacade.updateLandingZoneAddon('landing-zone-next-gen')).resolves.toMatchObject({
            sourceKey: 'landing-zone-next-gen',
        })

        expect(fetchMock).toHaveBeenNthCalledWith(1, '/api/oci/health', expect.anything())
        expect(fetchMock).toHaveBeenNthCalledWith(2, '/api/oci/lz/addon/update', expect.objectContaining({
            method: 'POST',
            headers: expect.objectContaining({ 'Content-Type': 'application/json' }),
            body: JSON.stringify({ sourceKey: 'landing-zone-next-gen' }),
        }))
    })

    it('forwards a session GitHub token for private add-on update requests', async () => {
        ;(globalThis as { window?: { ocdAPI?: unknown } }).window = {}
        const fetchMock = vi
            .fn()
            .mockResolvedValueOnce(jsonResponse({ success: true, data: { status: 'ok' } }))
            .mockResolvedValueOnce(jsonResponse({
                success: true,
                data: {
                    sourceKey: 'landing-zone-next-gen',
                    pinnedRef: 'abc123',
                    command: 'node scripts/setup_landing_zone.mjs --latest --source landing-zone-next-gen --install',
                    stdout: '',
                    stderr: '',
                },
            }))
        vi.stubGlobal('fetch', fetchMock)

        await expect(OciApiFacade.updateLandingZoneAddon('landing-zone-next-gen', 'ghp_session_token')).resolves.toMatchObject({
            pinnedRef: 'abc123',
        })

        expect(fetchMock).toHaveBeenNthCalledWith(2, '/api/oci/lz/addon/update', expect.objectContaining({
            method: 'POST',
            headers: expect.objectContaining({ 'Content-Type': 'application/json' }),
            body: JSON.stringify({ sourceKey: 'landing-zone-next-gen', githubToken: 'ghp_session_token' }),
        }))
    })

    it('starts and polls add-on update jobs through the local web backend', async () => {
        ;(globalThis as { window?: { ocdAPI?: unknown } }).window = {}
        const fetchMock = vi
            .fn()
            .mockResolvedValueOnce(jsonResponse({ success: true, data: { status: 'ok' } }))
            .mockResolvedValueOnce(jsonResponse({
                success: true,
                data: {
                    id: 'job-1',
                    sourceKey: 'landing-zone-next-gen',
                    pinnedRef: '',
                    command: 'node scripts/setup_landing_zone.mjs --latest --source landing-zone-next-gen --install',
                    stdout: '',
                    stderr: '',
                    state: 'queued',
                    createdAt: '2026-06-12T00:00:00.000Z',
                    stdoutTruncated: false,
                    stderrTruncated: false,
                },
            }))
            .mockResolvedValueOnce(jsonResponse({
                success: true,
                data: {
                    id: 'job-1',
                    sourceKey: 'landing-zone-next-gen',
                    pinnedRef: 'abc123',
                    command: 'node scripts/setup_landing_zone.mjs --latest --source landing-zone-next-gen --install',
                    stdout: 'done',
                    stderr: '',
                    state: 'succeeded',
                    createdAt: '2026-06-12T00:00:00.000Z',
                    finishedAt: '2026-06-12T00:00:01.000Z',
                    exitCode: 0,
                    stdoutTruncated: false,
                    stderrTruncated: false,
                },
            }))
        vi.stubGlobal('fetch', fetchMock)

        await expect(OciApiFacade.startLandingZoneAddonUpdateJob('landing-zone-next-gen', ' ghp_session_token ')).resolves.toMatchObject({
            id: 'job-1',
            state: 'queued',
        })
        await expect(OciApiFacade.getLandingZoneAddonUpdateJob('job-1')).resolves.toMatchObject({
            state: 'succeeded',
            pinnedRef: 'abc123',
        })

        expect(fetchMock).toHaveBeenNthCalledWith(2, '/api/oci/lz/addon/update-jobs', expect.objectContaining({
            method: 'POST',
            headers: expect.objectContaining({ 'Content-Type': 'application/json' }),
            body: JSON.stringify({ sourceKey: 'landing-zone-next-gen', githubToken: 'ghp_session_token' }),
        }))
        expect(fetchMock).toHaveBeenNthCalledWith(3, '/api/oci/lz/addon/update-jobs/job-1', expect.anything())
    })

    it('cancels add-on update jobs through the local web backend', async () => {
        ;(globalThis as { window?: { ocdAPI?: unknown } }).window = {}
        const fetchMock = vi
            .fn()
            .mockResolvedValueOnce(jsonResponse({ success: true, data: { status: 'ok' } }))
            .mockResolvedValueOnce(jsonResponse({
                success: true,
                data: {
                    id: 'job-1',
                    sourceKey: 'landing-zone-next-gen',
                    pinnedRef: '',
                    command: 'node scripts/setup_landing_zone.mjs --latest --source landing-zone-next-gen --install',
                    stdout: '',
                    stderr: '',
                    state: 'cancelled',
                    createdAt: '2026-06-12T00:00:00.000Z',
                    finishedAt: '2026-06-12T00:00:01.000Z',
                    stdoutTruncated: false,
                    stderrTruncated: false,
                },
            }))
        vi.stubGlobal('fetch', fetchMock)

        await expect(OciApiFacade.cancelLandingZoneAddonUpdateJob('job-1')).resolves.toMatchObject({
            state: 'cancelled',
        })

        expect(fetchMock).toHaveBeenNthCalledWith(2, '/api/oci/lz/addon/update-jobs/job-1', expect.objectContaining({ method: 'DELETE' }))
    })

    it('loads add-on source health from the local web backend after health probe', async () => {
        ;(globalThis as { window?: { ocdAPI?: unknown } }).window = {}
        const fetchMock = vi
            .fn()
            .mockResolvedValueOnce(jsonResponse({ success: true, data: { status: 'ok' } }))
            .mockResolvedValueOnce(jsonResponse({
                success: true,
                data: [{
                    sourceKey: 'landing-zone-next-gen',
                    label: 'Landing Zone Next Gen',
                    repo: 'iwanhoogendoorn/landing-zone-next-gen',
                    role: 'project-addon',
                    pinnedRef: 'abc123',
                    localSubdir: 'external/lz-addons/landing-zone-next-gen',
                    installable: true,
                    installed: true,
                    state: 'installed',
                }],
            }))
        vi.stubGlobal('fetch', fetchMock)

        await expect(OciApiFacade.listLandingZoneAddonHealth()).resolves.toEqual([expect.objectContaining({
            sourceKey: 'landing-zone-next-gen',
            state: 'installed',
        })])

        expect(fetchMock).toHaveBeenNthCalledWith(1, '/api/oci/health', expect.anything())
        expect(fetchMock).toHaveBeenNthCalledWith(2, '/api/oci/lz/addon/health', expect.anything())
    })

    it('submits Resource Manager stack PLAN requests to the local web backend', async () => {
        ;(globalThis as { window?: { ocdAPI?: unknown } }).window = {}
        const fetchMock = vi
            .fn()
            .mockResolvedValueOnce(jsonResponse({ success: true, data: { status: 'ok' } }))
            .mockResolvedValueOnce(jsonResponse({
                success: true,
                data: {
                    stack: { id: 'stack-for-test', displayName: 'discovery-plan' },
                    job: { id: 'plan-job-for-test', operation: 'PLAN' },
                },
            }))
        vi.stubGlobal('fetch', fetchMock)

        await expect(OciApiFacade.createStack(
            'DEFAULT',
            'eu-frankfurt-1',
            'compartment-for-test',
            'discovery-plan',
            { 'main.tf': ['resource "oci_core_vcn" "discovery" {}'] },
            { operation: 'PLAN' },
        )).resolves.toMatchObject({
            job: { id: 'plan-job-for-test' },
        })

        expect(fetchMock).toHaveBeenNthCalledWith(2, '/api/oci/resource-manager/create-stack', expect.objectContaining({
            method: 'POST',
            headers: expect.objectContaining({ 'Content-Type': 'application/json' }),
            body: JSON.stringify({
                profile: 'DEFAULT',
                region: 'eu-frankfurt-1',
                compartmentId: 'compartment-for-test',
                stackName: 'discovery-plan',
                data: { 'main.tf': ['resource "oci_core_vcn" "discovery" {}'] },
                jobOptions: { operation: 'PLAN' },
            }),
        }))
    })

    it('preserves backend request ids on failed web envelopes', async () => {
        ;(globalThis as { window?: { ocdAPI?: unknown } }).window = {}
        const fetchMock = vi
            .fn()
            .mockResolvedValueOnce(jsonResponse({ success: true, data: { status: 'ok' } }))
            .mockResolvedValueOnce(jsonResponse({
                success: false,
                error: 'compartmentId is required',
                requestId: 'req-backend-123',
            }, 400, { 'X-Request-Id': 'req-backend-123' }))
        vi.stubGlobal('fetch', fetchMock)

        await expect(OciApiFacade.createStack(
            'DEFAULT',
            'eu-frankfurt-1',
            '',
            'missing-compartment',
            { 'main.tf': ['resource "oci_core_vcn" "discovery" {}'] },
            { operation: 'PLAN' },
        )).rejects.toMatchObject({
            name: 'OciBackendRequestError',
            message: 'compartmentId is required',
            requestId: 'req-backend-123',
            status: 400,
        })
    })

    it('formats backend request errors with copyable request ids', () => {
        expect(formatOciBackendError(new OciBackendRequestError('compartmentId is required', 'req-backend-123', 400))).toBe(
            'compartmentId is required (Request ID: req-backend-123)',
        )
        expect(formatOciBackendError(new Error('plain failure'))).toBe('plain failure')
        expect(formatOciBackendError('string failure')).toBe('string failure')
    })

    it('loads Resource Manager plan reviews from the local web backend', async () => {
        ;(globalThis as { window?: { ocdAPI?: unknown } }).window = {}
        const fetchMock = vi
            .fn()
            .mockResolvedValueOnce(jsonResponse({ success: true, data: { status: 'ok' } }))
            .mockResolvedValueOnce(jsonResponse({
                success: true,
                data: {
                    job: { id: 'plan-job-for-test', lifecycleState: 'SUCCEEDED' },
                    planText: 'No changes.',
                    terminal: true,
                    succeeded: true,
                    readyToApply: true,
                    summary: { add: 0, change: 0, destroy: 0 },
                },
            }))
        vi.stubGlobal('fetch', fetchMock)

        await expect(OciApiFacade.getResourceManagerPlanReview(
            'DEFAULT',
            'eu-frankfurt-1',
            'plan-job-for-test',
        )).resolves.toMatchObject({
            readyToApply: true,
        })

        expect(fetchMock).toHaveBeenNthCalledWith(2, '/api/oci/resource-manager/plan-review?profile=DEFAULT&region=eu-frankfurt-1&jobId=plan-job-for-test', expect.anything())
    })

    it('posts OCI GenAI architecture requests to the local web backend after health probe', async () => {
        ;(globalThis as { window?: { ocdAPI?: unknown } }).window = {}
        const fetchMock = vi
            .fn()
            .mockResolvedValueOnce(jsonResponse({ success: true, data: { status: 'ok' } }))
            .mockResolvedValueOnce(jsonResponse({
                success: true,
                data: {
                    text: '{"title":"OCI GenAI Plan","summary":"Generated.","assumptions":[],"resources":[]}',
                    modelId: 'cohere.command-a-03-2025',
                },
            }))
        vi.stubGlobal('fetch', fetchMock)

        await expect(OciApiFacade.generateArchitecturePlanWithGenAi(
            'DEFAULT',
            'eu-frankfurt-1',
            '<GENAI_COMPARTMENT_ID>',
            'cohere.command-a-03-2025',
            'Create a private app VCN.',
        )).resolves.toMatchObject({
            modelId: 'cohere.command-a-03-2025',
        })

        expect(fetchMock).toHaveBeenNthCalledWith(1, '/api/oci/health', expect.anything())
        expect(fetchMock).toHaveBeenNthCalledWith(2, '/api/oci/architecture/genai', expect.objectContaining({
            method: 'POST',
            headers: expect.objectContaining({ 'Content-Type': 'application/json' }),
            body: JSON.stringify({
                profile: 'DEFAULT',
                region: 'eu-frankfurt-1',
                compartmentId: '<GENAI_COMPARTMENT_ID>',
                modelId: 'cohere.command-a-03-2025',
                prompt: 'Create a private app VCN.',
                temperature: 0.2,
                maxTokens: 2400,
            }),
        }))
    })

    it('bypasses the web health probe when the Electron API is present', async () => {
        const loadOCIConfigProfileNames = vi.fn().mockResolvedValue(['DEFAULT'])
        ;(globalThis as { window?: { ocdAPI?: { loadOCIConfigProfileNames: typeof loadOCIConfigProfileNames } } }).window = {
            ocdAPI: { loadOCIConfigProfileNames },
        }
        const fetchMock = vi.fn()
        vi.stubGlobal('fetch', fetchMock)

        await expect(OciApiFacade.loadOCIConfigProfileNames()).resolves.toEqual(['DEFAULT'])

        expect(loadOCIConfigProfileNames).toHaveBeenCalledTimes(1)
        expect(fetchMock).not.toHaveBeenCalled()
    })
})
