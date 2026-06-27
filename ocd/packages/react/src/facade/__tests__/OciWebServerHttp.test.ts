import http from 'http'
import { afterEach, describe, expect, it } from 'vitest'
import { createOciWebServer, type OciWebServerOptions } from '../../../../web-server/src/OciWebServerHttp'

const runningServers: http.Server[] = []

const startServer = async (options?: OciWebServerOptions): Promise<{ baseUrl: string; server: http.Server }> =>
    new Promise((resolve, reject) => {
        const server = createOciWebServer(options)
        runningServers.push(server)
        server.once('error', reject)
        server.listen(0, '127.0.0.1', () => {
            const address = server.address()
            if (!address || typeof address === 'string') {
                reject(new Error('Expected TCP server address'))
                return
            }
            resolve({ baseUrl: `http://127.0.0.1:${address.port}`, server })
        })
    })

const closeServer = async (server: http.Server): Promise<void> =>
    new Promise((resolve, reject) => {
        server.close((reason) => reason ? reject(reason) : resolve())
    })

const postJson = (baseUrl: string, path: string, body: unknown): Promise<Response> =>
    fetch(`${baseUrl}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: typeof body === 'string' ? body : JSON.stringify(body),
    })

interface RawHttpResponse {
    status: number
    headers: http.IncomingHttpHeaders
    body: unknown
}

interface ErrorEnvelope {
    success: false
    error: string
    requestId: string
}

const expectRawRequestId = (response: RawHttpResponse): string => {
    const requestId = response.headers['x-request-id']
    expect(requestId).toEqual(expect.any(String))
    expect(Array.isArray(requestId)).toBe(false)
    return requestId as string
}

const expectFetchRequestId = (response: Response): string => {
    const requestId = response.headers.get('x-request-id')
    expect(requestId).toEqual(expect.any(String))
    return requestId as string
}

const expectRawError = (response: RawHttpResponse, error: string): ErrorEnvelope => {
    const requestId = expectRawRequestId(response)
    const body = response.body as ErrorEnvelope
    expect(body).toEqual({ success: false, error, requestId })
    return body
}

const expectFetchError = async (response: Response, error: string): Promise<ErrorEnvelope> => {
    const requestId = expectFetchRequestId(response)
    const body = await response.json() as ErrorEnvelope
    expect(body).toEqual({ success: false, error, requestId })
    return body
}

const rawRequest = (
    baseUrl: string,
    path: string,
    options: { method?: string; headers?: http.OutgoingHttpHeaders; body?: string },
): Promise<RawHttpResponse> =>
    new Promise((resolve, reject) => {
        const url = new URL(path, baseUrl)
        const request = http.request({
            hostname: url.hostname,
            port: url.port,
            path: url.pathname + url.search,
            method: options.method ?? 'GET',
            headers: options.headers,
        }, (response) => {
            const chunks: Buffer[] = []
            response.on('data', (chunk: Buffer) => chunks.push(chunk))
            response.on('end', () => {
                const raw = Buffer.concat(chunks).toString('utf-8')
                try {
                    resolve({
                        status: response.statusCode ?? 0,
                        headers: response.headers,
                        body: raw ? JSON.parse(raw) : undefined,
                    })
                } catch (reason) {
                    reject(reason)
                }
            })
        })
        request.on('error', reject)
        if (options.body !== undefined) request.write(options.body)
        request.end()
    })

const getWithHost = (baseUrl: string, path: string, host: string): Promise<RawHttpResponse> =>
    rawRequest(baseUrl, path, { headers: { Host: host } })

const optionsWithOrigin = (baseUrl: string, origin: string): Promise<RawHttpResponse> =>
    rawRequest(baseUrl, '/api/oci/query', {
        method: 'OPTIONS',
        headers: {
            Origin: origin,
            'Access-Control-Request-Method': 'POST',
            'Access-Control-Request-Headers': 'Content-Type',
        },
    })

describe('Oci web server HTTP boundary', () => {
    afterEach(async () => {
        await Promise.all(runningServers.splice(0).map((server) => closeServer(server)))
    })

    it('returns structured JSON errors for invalid request payloads before backend handlers run', async () => {
        const { baseUrl } = await startServer()

        const createStackResponse = await postJson(baseUrl, '/api/oci/resource-manager/create-stack', {
            profile: 'DEFAULT',
            region: 'eu-frankfurt-1',
            stackName: 'Stack',
            data: {},
        })
        expect(createStackResponse.status).toBe(400)
        await expectFetchError(createStackResponse, 'compartmentId is required')

        const genAiResponse = await postJson(baseUrl, '/api/oci/architecture/genai', {
            profile: 'DEFAULT',
            region: 'eu-frankfurt-1',
            compartmentId: 'genai-compartment',
            modelId: 'cohere.command-a-03-2025',
            prompt: '',
        })
        expect(genAiResponse.status).toBe(400)
        await expectFetchError(genAiResponse, 'Architecture prompt is required.')
    })

    it('validates Resource Manager query parameters at HTTP level', async () => {
        const { baseUrl } = await startServer()

        const response = await fetch(`${baseUrl}/api/oci/resource-manager/plan-review?profile=DEFAULT&region=eu-frankfurt-1`)

        expect(response.status).toBe(400)
        await expectFetchError(response, 'jobId is required')
    })

    it('returns the standard JSON error envelope for rejected Host headers', async () => {
        const { baseUrl } = await startServer()

        const response = await getWithHost(baseUrl, '/api/oci/health', 'malicious.example')

        expect(response.status).toBe(403)
        expectRawError(response, 'Forbidden')
    })

    it('echoes a valid inbound request id through the HTTP error envelope', async () => {
        const { baseUrl } = await startServer()

        const response = await rawRequest(baseUrl, '/api/oci/resource-manager/create-stack', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Request-Id': 'req-test-123',
            },
            body: JSON.stringify({
                profile: 'DEFAULT',
                region: 'eu-frankfurt-1',
                stackName: 'Stack',
                data: {},
            }),
        })

        expect(response.status).toBe(400)
        expect(response.headers['x-request-id']).toBe('req-test-123')
        expect(response.body).toEqual({
            success: false,
            error: 'compartmentId is required',
            requestId: 'req-test-123',
        })
    })

    it('generates a request id for unknown endpoints and mirrors it in the error body', async () => {
        const { baseUrl } = await startServer()

        const response = await rawRequest(baseUrl, '/api/oci/unknown', {})

        expect(response.status).toBe(404)
        const body = expectRawError(response, 'Unknown endpoint: GET /api/oci/unknown')
        expect(body.requestId).toMatch(/^ocd-[a-z0-9]+-[a-z0-9]+$/)
    })

    it('allows local Vite fallback origins while denying non-loopback origins', async () => {
        const { baseUrl } = await startServer()

        const fallbackOrigin = await optionsWithOrigin(baseUrl, 'http://127.0.0.1:5176')
        expect(fallbackOrigin.status).toBe(204)
        expect(fallbackOrigin.headers['access-control-allow-origin']).toBe('http://127.0.0.1:5176')
        expect(fallbackOrigin.headers.vary).toBe('Origin')

        const externalOrigin = await optionsWithOrigin(baseUrl, 'https://malicious.example')
        expect(externalOrigin.status).toBe(204)
        expect(externalOrigin.headers['access-control-allow-origin']).toBeUndefined()
        expect(externalOrigin.headers.vary).toBe('Origin')
    })

    it('returns a structured JSON envelope when a client exceeds the local rate limit', async () => {
        const { baseUrl } = await startServer({
            rateLimit: { maxRequests: 1, windowMs: 1000 },
        })

        const first = await fetch(`${baseUrl}/api/oci/unknown`)
        expect(first.status).toBe(404)
        await expectFetchError(first, 'Unknown endpoint: GET /api/oci/unknown')

        const second = await fetch(`${baseUrl}/api/oci/unknown`)
        expect(second.status).toBe(429)
        await expectFetchError(second, 'Too many requests — rate limit exceeded')
    })

    it('returns a structured JSON envelope when a request body exceeds the configured cap', async () => {
        const { baseUrl } = await startServer({ maxBodyBytes: 16 })

        const response = await rawRequest(baseUrl, '/api/oci/query', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ payload: 'this body is intentionally too large' }),
        })

        expect(response.status).toBe(400)
        expectRawError(response, 'Request body too large')
    })

    it('rejects malformed JSON before invoking backend handlers', async () => {
        let queryTenancyCalls = 0
        const { baseUrl } = await startServer({
            handlers: {
                queryTenancy: async () => {
                    queryTenancyCalls += 1
                    return { unreachable: true }
                },
            },
        })

        const response = await rawRequest(baseUrl, '/api/oci/query', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: '{not-json',
        })

        expect(response.status).toBe(400)
        expectRawError(response, 'Request body is not valid JSON')
        expect(queryTenancyCalls).toBe(0)
    })

    it('rejects non-JSON content types before invoking backend handlers', async () => {
        let queryTenancyCalls = 0
        const { baseUrl } = await startServer({
            handlers: {
                queryTenancy: async () => {
                    queryTenancyCalls += 1
                    return { unreachable: true }
                },
            },
        })

        const response = await rawRequest(baseUrl, '/api/oci/query', {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain' },
            body: JSON.stringify({
                profile: 'DEFAULT',
                region: 'eu-frankfurt-1',
            }),
        })

        expect(response.status).toBe(415)
        expectRawError(response, 'Content-Type must be application/json')
        expect(queryTenancyCalls).toBe(0)
    })

    it('can serve success-path HTTP tests through injected handlers without calling live OCI', async () => {
        const { baseUrl } = await startServer({
            handlers: {
                queryTenancy: async (request) => ({
                    source: 'stubbed-query-tenancy',
                    profile: request.profile,
                    region: request.region,
                    compartmentIds: request.compartmentIds,
                }),
            },
        })

        const response = await postJson(baseUrl, '/api/oci/query', {
            profile: 'TEST',
            region: 'eu-frankfurt-1',
            compartmentIds: ['compartment-a', 'compartment-b'],
        })

        expect(response.status).toBe(200)
        await expect(response.json()).resolves.toEqual({
            success: true,
            data: {
                source: 'stubbed-query-tenancy',
                profile: 'TEST',
                region: 'eu-frankfurt-1',
                compartmentIds: ['compartment-a', 'compartment-b'],
            },
        })
    })

    it('can serve Resource Manager stack creation through injected handlers without live OCI', async () => {
        const { baseUrl } = await startServer({
            handlers: {
                createStack: async (request) => ({
                    stack: {
                        id: 'stack-for-test',
                        displayName: request.stackName,
                    },
                    job: {
                        id: 'job-for-test',
                        operation: request.jobOptions.operation,
                    },
                    requestEcho: {
                        profile: request.profile,
                        region: request.region,
                        compartmentId: request.compartmentId,
                        dataKeys: Object.keys(request.data),
                    },
                }),
            },
        })

        const response = await postJson(baseUrl, '/api/oci/resource-manager/create-stack', {
            profile: 'TEST',
            region: 'eu-frankfurt-1',
            compartmentId: 'compartment-for-test',
            stackName: 'generated-plan',
            data: { 'main.tf': ['resource "oci_core_vcn" "generated" {}'] },
            jobOptions: { operation: 'PLAN' },
        })

        expect(response.status).toBe(200)
        await expect(response.json()).resolves.toEqual({
            success: true,
            data: {
                stack: {
                    id: 'stack-for-test',
                    displayName: 'generated-plan',
                },
                job: {
                    id: 'job-for-test',
                    operation: 'PLAN',
                },
                requestEcho: {
                    profile: 'TEST',
                    region: 'eu-frankfurt-1',
                    compartmentId: 'compartment-for-test',
                    dataKeys: ['main.tf'],
                },
            },
        })
    })

    it('can serve Resource Manager stack updates through injected handlers with request ids', async () => {
        const { baseUrl } = await startServer({
            handlers: {
                updateStack: async (request) => ({
                    stack: {
                        id: request.stackId,
                        displayName: 'updated-stack',
                    },
                    job: {
                        id: 'update-job-for-test',
                        operation: request.jobOptions.operation,
                    },
                    requestEcho: {
                        profile: request.profile,
                        region: request.region,
                        dataKeys: Object.keys(request.data),
                    },
                }),
            },
        })

        const response = await rawRequest(baseUrl, '/api/oci/resource-manager/update-stack', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Request-Id': 'req-update-stack-123',
            },
            body: JSON.stringify({
                profile: 'TEST',
                region: 'eu-frankfurt-1',
                stackId: 'stack-for-test',
                data: { 'main.tf': ['resource "oci_core_vcn" "updated" {}'] },
                jobOptions: { operation: 'PLAN' },
            }),
        })

        expect(response.status).toBe(200)
        expect(response.headers['x-request-id']).toBe('req-update-stack-123')
        expect(response.body).toEqual({
            success: true,
            data: {
                stack: {
                    id: 'stack-for-test',
                    displayName: 'updated-stack',
                },
                job: {
                    id: 'update-job-for-test',
                    operation: 'PLAN',
                },
                requestEcho: {
                    profile: 'TEST',
                    region: 'eu-frankfurt-1',
                    dataKeys: ['main.tf'],
                },
            },
        })
    })

    it('can serve Resource Manager apply jobs through injected handlers with request ids', async () => {
        const { baseUrl } = await startServer({
            handlers: {
                createJob: async (request) => ({
                    job: {
                        id: 'apply-job-for-test',
                        operation: request.jobOptions.operation,
                    },
                    requestEcho: {
                        profile: request.profile,
                        region: request.region,
                        stackId: request.stackId,
                        planJobId: request.jobOptions.operation === 'APPLY' ? request.jobOptions.planJobId : '',
                    },
                }),
            },
        })

        const response = await rawRequest(baseUrl, '/api/oci/resource-manager/create-job', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Request-Id': 'req-create-job-123',
            },
            body: JSON.stringify({
                profile: 'TEST',
                region: 'eu-frankfurt-1',
                stackId: 'stack-for-test',
                jobOptions: {
                    operation: 'APPLY',
                    planJobId: 'plan-job-for-test',
                    approval: 'APPLY',
                },
            }),
        })

        expect(response.status).toBe(200)
        expect(response.headers['x-request-id']).toBe('req-create-job-123')
        expect(response.body).toEqual({
            success: true,
            data: {
                job: {
                    id: 'apply-job-for-test',
                    operation: 'APPLY',
                },
                requestEcho: {
                    profile: 'TEST',
                    region: 'eu-frankfurt-1',
                    stackId: 'stack-for-test',
                    planJobId: 'plan-job-for-test',
                },
            },
        })
    })

    it('can serve Landing Zone add-on updates through injected handlers with request ids', async () => {
        const { baseUrl } = await startServer({
            handlers: {
                updateLandingZoneAddon: async (sourceKey, options) => ({
                    sourceKey,
                    pinnedRef: 'abc123',
                    command: 'node scripts/setup_landing_zone.mjs --latest --source landing-zone-next-gen --install',
                    stdout: '',
                    stderr: '',
                    requestEcho: {
                        githubToken: options.githubToken,
                    },
                }),
            },
        })

        const response = await rawRequest(baseUrl, '/api/oci/lz/addon/update', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Request-Id': 'req-lz-update-123',
            },
            body: JSON.stringify({
                sourceKey: 'landing-zone-next-gen',
                githubToken: ' session-token ',
            }),
        })

        expect(response.status).toBe(200)
        expect(response.headers['x-request-id']).toBe('req-lz-update-123')
        expect(response.body).toEqual({
            success: true,
            data: {
                sourceKey: 'landing-zone-next-gen',
                pinnedRef: 'abc123',
                command: 'node scripts/setup_landing_zone.mjs --latest --source landing-zone-next-gen --install',
                stdout: '',
                stderr: '',
                requestEcho: {
                    githubToken: 'session-token',
                },
            },
        })
    })

    it('can serve GenAI architecture requests through injected handlers without live OCI', async () => {
        const { baseUrl } = await startServer({
            handlers: {
                generateArchitecturePlanWithGenAi: async (request) => ({
                    text: JSON.stringify({
                        title: 'Generated Architecture',
                        resources: [],
                    }),
                    modelId: request.modelId,
                    requestEcho: {
                        profile: request.profile,
                        region: request.region,
                        compartmentId: request.compartmentId,
                        temperature: request.temperature,
                        maxTokens: request.maxTokens,
                    },
                }),
            },
        })

        const response = await postJson(baseUrl, '/api/oci/architecture/genai', {
            profile: 'TEST',
            region: 'eu-frankfurt-1',
            compartmentId: 'genai-compartment',
            modelId: 'cohere.command-a-03-2025',
            prompt: 'Create a private OCI application landing zone.',
            temperature: 0.3,
            maxTokens: 1200,
        })

        expect(response.status).toBe(200)
        await expect(response.json()).resolves.toEqual({
            success: true,
            data: {
                text: '{"title":"Generated Architecture","resources":[]}',
                modelId: 'cohere.command-a-03-2025',
                requestEcho: {
                    profile: 'TEST',
                    region: 'eu-frankfurt-1',
                    compartmentId: 'genai-compartment',
                    temperature: 0.3,
                    maxTokens: 1200,
                },
            },
        })
    })
})
