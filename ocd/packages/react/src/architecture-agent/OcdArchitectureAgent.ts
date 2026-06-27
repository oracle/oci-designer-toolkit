import { OcdMetrics } from '@ocd/core'
import { OcdDesign, OcdResource, OcdViewLayer, OciModelResources, OciResource } from '@ocd/model'
import { OcdResourceManagerExporter } from '@ocd/export'

export type ArchitectureResourceKind =
    | 'compartment'
    | 'vcn'
    | 'subnet'
    | 'internet_gateway'
    | 'nat_gateway'
    | 'service_gateway'
    | 'network_security_group'
    | 'load_balancer'
    | 'instance'
    | 'db_system'
    | 'oke_cluster'
    | 'oke_node_pool'
    | 'bastion'
    | 'vault'
    | 'key'
    | 'log_group'
    | 'monitoring_alarm'
    | 'budget'
    | 'policy'
    | 'dynamic_group'
    | 'api_gateway'
    | 'functions_application'
    | 'functions_function'
    | 'web_app_firewall'
    | 'data_safe_target_database'
    | 'data_safe_security_assessment'
    | 'cloud_guard_target'
    | 'log_analytics_log_group'
    | 'service_connector'
    | 'streaming_stream_pool'
    | 'streaming_stream'

export interface ArchitecturePlanResource {
    readonly kind: ArchitectureResourceKind
    readonly displayName: string
    readonly cidrBlock?: string
    readonly tier?: string
    readonly public?: boolean
    readonly count?: number
    readonly notes?: string
}

export interface ArchitecturePlan {
    readonly title: string
    readonly summary: string
    readonly assumptions: readonly string[]
    readonly resources: readonly ArchitecturePlanResource[]
    /**
     * Resource kinds the model asked for that this tool does not support yet.
     * Captured at normalize time (before unsupported kinds are filtered out) so
     * the user is TOLD what was dropped instead of it vanishing silently.
     */
    readonly droppedKinds?: readonly string[]
}

export type ArchitectureValidationStatus = 'ready' | 'warning' | 'blocked'
export type ArchitectureRelationKind = 'parent' | 'association'

export interface ArchitecturePlanValidation {
    readonly status: ArchitectureValidationStatus
    readonly errors: readonly string[]
    readonly warnings: readonly string[]
}

export interface ArchitectureRelationNode {
    readonly id: string
    readonly provider: string
    readonly resourceType: string
    readonly resourceTypeName: string
    readonly displayName: string
}

export interface ArchitectureRelationEdge {
    readonly id: string
    readonly kind: ArchitectureRelationKind
    readonly sourceId: string
    readonly targetId: string
    readonly label: string
}

export interface ArchitectureRelationGraph {
    readonly nodes: readonly ArchitectureRelationNode[]
    readonly edges: readonly ArchitectureRelationEdge[]
}

export interface ArchitectureReadinessCheck {
    readonly id: string
    readonly title: string
    readonly status: ArchitectureValidationStatus
    readonly detail: string
}

export interface ArchitectureAgentReadiness {
    readonly status: ArchitectureValidationStatus
    readonly resourceCount: number
    readonly relationCount: number
    readonly checks: readonly ArchitectureReadinessCheck[]
    readonly nextActions: readonly string[]
}

export interface ArchitectureAgentLlmConfig {
    readonly endpoint: string
    readonly apiKey?: string
    readonly model: string
    readonly temperature?: number
    // Explicit opt-in to allow endpoints whose hostname is a non-routable /
    // internal IPv4 (link-local, metadata, or RFC1918). Off by default so the
    // renderer cannot be tricked into POSTing the prompt to an internal target.
    readonly allowInternalEndpoints?: boolean
}

export interface ArchitectureTerraformPreview {
    readonly ready: boolean
    readonly fileCount: number
    readonly files: readonly string[]
    readonly resourceCount: number
    readonly summary: string
}

const SUPPORTED_KINDS: ArchitectureResourceKind[] = [
    'compartment',
    'vcn',
    'subnet',
    'internet_gateway',
    'nat_gateway',
    'service_gateway',
    'network_security_group',
    'load_balancer',
    'instance',
    'db_system',
    'oke_cluster',
    'oke_node_pool',
    'bastion',
    'vault',
    'key',
    'log_group',
    'monitoring_alarm',
    'budget',
    'policy',
    'dynamic_group',
    'api_gateway',
    'functions_application',
    'functions_function',
    'web_app_firewall',
    'data_safe_target_database',
    'data_safe_security_assessment',
    'cloud_guard_target',
    'log_analytics_log_group',
    'service_connector',
    'streaming_stream_pool',
    'streaming_stream',
]

const MAX_PLAN_RESOURCES = 120
// Hard cap on the LLM response payload (~10 MB) so a hostile or runaway endpoint
// cannot exhaust renderer memory with an unbounded body.
const MAX_LLM_RESPONSE_BYTES = 10 * 1024 * 1024
const SENSITIVE_TEXT_PATTERN = /\b(?:ocid1\.[a-z0-9_-]+\.oc1|(?:api|secret|private|access)[_-]?key|fingerprint|auth[_-]?token)\b/i

/**
 * Returns true when a literal IPv4 hostname points at a non-routable or internal
 * target that the architecture agent must never POST the full prompt to:
 *   - 0.0.0.0            unspecified / "this host"
 *   - 169.254.0.0/16     link-local, including the 169.254.169.254 metadata IP
 *   - 10.0.0.0/8         RFC1918 private
 *   - 172.16.0.0/12      RFC1918 private
 *   - 192.168.0.0/16     RFC1918 private
 *
 * Non-IPv4 hostnames (e.g. api.openai.com) are NOT blocked here — they return
 * false. Loopback (127.0.0.1 / [::1] / localhost) is also not matched by these
 * ranges, leaving the caller's explicit dev-loopback allowance intact.
 */
export function isBlockedLlmHost(hostname: string): boolean {
    // Strip IPv6 brackets defensively; bracketed/colon hosts are never IPv4.
    const host = hostname.trim().replace(/^\[/, '').replace(/\]$/, '')
    const octets = host.split('.')
    if (octets.length !== 4) return false
    // Require canonical 1-3 digit octets so values like "010" or "1e2" that
    // Number() would silently coerce do not slip past the range checks.
    if (!octets.every((part) => /^\d{1,3}$/.test(part))) return false
    const parsed = octets.map((part) => Number(part))
    if (!parsed.every((value) => value >= 0 && value <= 255)) return false
    const [a, b, c, d] = parsed
    if (a === 0 && b === 0 && c === 0 && d === 0) return true // 0.0.0.0
    if (a === 169 && b === 254) return true // link-local / cloud metadata
    if (a === 10) return true // 10.0.0.0/8
    if (a === 172 && b >= 16 && b <= 31) return true // 172.16.0.0/12
    if (a === 192 && b === 168) return true // 192.168.0.0/16
    return false
}

function isValidIpv4Cidr(value: string): boolean {
    const match = value.match(/^(\d{1,3})(?:\.(\d{1,3})){3}\/(\d{1,2})$/)
    if (!match) return false
    const [address, prefixText] = value.split('/')
    const octets = address.split('.').map(Number)
    const prefix = Number(prefixText)
    return octets.every((octet) => Number.isInteger(octet) && octet >= 0 && octet <= 255)
        && Number.isInteger(prefix)
        && prefix >= 0
        && prefix <= 32
}

function planTextFields(plan: ArchitecturePlan): string[] {
    return [
        plan.title,
        plan.summary,
        ...plan.assumptions,
        ...plan.resources.flatMap((resource) => [
            resource.kind,
            resource.displayName,
            resource.tier ?? '',
            resource.notes ?? '',
        ]),
    ].filter((value) => value.trim() !== '')
}

function formatResource(resource: OcdResource): string {
    const displayName = 'displayName' in resource && typeof resource.displayName === 'string' ? resource.displayName : ''
    return displayName || resource.resourceTypeName || resource.resourceType || resource.id
}

function statusFromFindings(errors: readonly string[], warnings: readonly string[]): ArchitectureValidationStatus {
    if (errors.length > 0) return 'blocked'
    if (warnings.length > 0) return 'warning'
    return 'ready'
}

function unique(values: readonly string[]): string[] {
    return Array.from(new Set(values.filter((value) => value.trim() !== '')))
}

function addRelationEdge(
    edges: ArchitectureRelationEdge[],
    edge: Omit<ArchitectureRelationEdge, 'id'>,
): ArchitectureRelationEdge[] {
    if (edge.sourceId === edge.targetId) return edges
    const id = `${edge.kind}:${edge.sourceId}:${edge.targetId}:${edge.label}`
    if (edges.some((existing) => existing.id === id)) return edges
    return [...edges, { ...edge, id }]
}

function collectResourceReferenceIds(value: unknown, knownIds: ReadonlySet<string>, path = ''): Array<{ readonly id: string; readonly path: string }> {
    if (!value || typeof value !== 'object') return []
    if (Array.isArray(value)) {
        return value.flatMap((item, index) => collectResourceReferenceIds(item, knownIds, `${path}[${index}]`))
    }
    return Object.entries(value as Record<string, unknown>).flatMap(([key, item]) => {
        const nextPath = path ? `${path}.${key}` : key
        if (typeof item === 'string' && knownIds.has(item) && /(^|\.)([a-zA-Z0-9]+Id)$/.test(nextPath)) {
            return [{ id: item, path: nextPath }]
        }
        if (Array.isArray(item) && /(^|\.)([a-zA-Z0-9]+Ids)$/.test(nextPath)) {
            return item
                .filter((id): id is string => typeof id === 'string' && knownIds.has(id))
                .map((id) => ({ id, path: nextPath }))
        }
        if (item && typeof item === 'object') return collectResourceReferenceIds(item, knownIds, nextPath)
        return []
    })
}

export function validateArchitecturePlan(plan: ArchitecturePlan): ArchitecturePlanValidation {
    const errors: string[] = []
    const warnings: string[] = []

    if (!plan.title.trim()) errors.push('Architecture plan title is required.')
    if (!plan.summary.trim()) errors.push('Architecture plan summary is required.')
    if (plan.resources.length === 0) errors.push('Architecture plan must contain at least one resource.')
    if (plan.resources.length > MAX_PLAN_RESOURCES) errors.push(`Architecture plan contains ${plan.resources.length} resources; maximum supported is ${MAX_PLAN_RESOURCES}.`)

    const unknownKinds = unique(plan.resources
        .map((resource) => resource.kind)
        .filter((kind) => !SUPPORTED_KINDS.includes(kind)))
    if (unknownKinds.length > 0) errors.push(`Unsupported resource kinds: ${unknownKinds.join(', ')}.`)

    plan.resources.forEach((resource) => {
        if (!resource.displayName.trim()) errors.push(`Resource ${resource.kind} requires a display name.`)
        if (resource.cidrBlock && !isValidIpv4Cidr(resource.cidrBlock)) errors.push(`Invalid CIDR for ${resource.displayName}: ${resource.cidrBlock}.`)
        if (resource.count !== undefined && (!Number.isInteger(resource.count) || resource.count < 1 || resource.count > 50)) {
            errors.push(`Invalid count for ${resource.displayName}: expected an integer from 1 to 50.`)
        }
    })

    if (planTextFields(plan).some((value) => SENSITIVE_TEXT_PATTERN.test(value))) {
        errors.push('Architecture plan contains sensitive OCI identifiers or credential-like text.')
    }

    if (!plan.resources.some((resource) => resource.kind === 'vcn')) warnings.push('Architecture plan does not include a VCN resource.')
    if (!plan.resources.some((resource) => resource.kind === 'subnet')) warnings.push('Architecture plan does not include subnet resources.')

    // Tell the user what the model asked for that we could not build, instead of
    // silently dropping it (normalizePlan filters unsupported kinds out).
    if (plan.droppedKinds && plan.droppedKinds.length > 0) {
        warnings.push(`Dropped ${plan.droppedKinds.length} unsupported resource kind(s): ${plan.droppedKinds.join(', ')}. They are not in the design and will not be provisioned.`)
    }

    warnings.push(...architectureRelationshipWarnings(plan))

    return {
        status: statusFromFindings(errors, warnings),
        errors,
        warnings,
    }
}

/**
 * Catch plans that schema-validate but will not deploy: dependent resources whose
 * required peer is missing. Surfaced as warnings so the user can fix the prompt
 * before exporting Terraform that would only fail at OCI apply time.
 */
export function architectureRelationshipWarnings(plan: ArchitecturePlan): string[] {
    const warnings: string[] = []
    const has = (kind: ArchitectureResourceKind) => plan.resources.some((resource) => resource.kind === kind)
    const hasPublicSubnet = plan.resources.some((resource) => resource.kind === 'subnet' && resource.public === true)

    if (has('oke_node_pool') && !has('oke_cluster')) {
        warnings.push('OKE node pool has no OKE cluster in the plan; it cannot be provisioned on its own.')
    }
    if (has('functions_function') && !has('functions_application')) {
        warnings.push('Functions function has no Functions application in the plan; it cannot be provisioned on its own.')
    }
    if (has('load_balancer') && !plan.resources.some((resource) => resource.kind === 'subnet')) {
        warnings.push('Load balancer has no subnet in the plan; OCI requires at least one subnet.')
    }
    if (has('oke_cluster') && !hasPublicSubnet) {
        warnings.push('OKE cluster has no public subnet; the service load balancer subnet usually must be public.')
    }
    return warnings
}

export function buildArchitectureRelationGraph(design: OcdDesign): ArchitectureRelationGraph {
    const resources = OcdDesign.getResources(design) as OcdResource[]
    const resourceLists = OcdDesign.getResourceLists(design)
    const knownIds = new Set(resources.map((resource) => resource.id))
    const nodes = resources.map((resource): ArchitectureRelationNode => ({
        id: resource.id,
        provider: resource.provider,
        resourceType: resource.resourceType,
        resourceTypeName: resource.resourceTypeName,
        displayName: formatResource(resource),
    }))

    const edges = resources.reduce((currentEdges, resource) => {
        if (resource.provider !== 'oci') return currentEdges
        let nextEdges = currentEdges
        const parentId = OciResource.getParentId(resource as OciResource, resourceLists)
        if (parentId && knownIds.has(parentId)) {
            nextEdges = addRelationEdge(nextEdges, {
                kind: 'parent',
                sourceId: resource.id,
                targetId: parentId,
                label: `${formatResource(resource)} contained by ${formatResource(resources.find((candidate) => candidate.id === parentId) as OcdResource)}`,
            })
        }

        const explicitAssociations = OciResource.getAssociationIds(resource as OciResource, resourceLists)
            .filter((id) => knownIds.has(id) && id !== parentId)
            .map((id) => ({ id, path: 'model association' }))
        const inferredAssociations = collectResourceReferenceIds(resource, knownIds)
            .filter((reference) => reference.id !== parentId && reference.path !== 'compartmentId')
        unique([...explicitAssociations, ...inferredAssociations].map((reference) => `${reference.id}|${reference.path}`))
            .map((entry) => {
                const [targetId, path] = entry.split('|')
                return { id: targetId, path }
            })
            .forEach((reference) => {
                nextEdges = addRelationEdge(nextEdges, {
                    kind: 'association',
                    sourceId: resource.id,
                    targetId: reference.id,
                    label: `${formatResource(resource)} references ${reference.path}`,
                })
            })
        return nextEdges
    }, [] as ArchitectureRelationEdge[])

    return { nodes, edges }
}

export function buildArchitectureAgentReadiness(plan: ArchitecturePlan, design: OcdDesign): ArchitectureAgentReadiness {
    const validation = validateArchitecturePlan(plan)
    const graph = buildArchitectureRelationGraph(design)
    const relationStatus: ArchitectureValidationStatus = graph.edges.length > 0 ? 'ready' : 'warning'
    const checks: ArchitectureReadinessCheck[] = [
        {
            id: 'plan-schema',
            title: 'Architecture plan schema',
            status: validation.status,
            detail: validation.errors[0] ?? validation.warnings[0] ?? 'Plan schema and sensitive-data checks passed.',
        },
        {
            id: 'relation-graph',
            title: 'Relation graph',
            status: relationStatus,
            detail: graph.edges.length > 0 ? `${graph.edges.length} relations derived from model references.` : 'No relations were derived from the generated design.',
        },
        {
            id: 'terraform-contract',
            title: 'Terraform generation contract',
            status: graph.nodes.length > 0 && validation.status !== 'blocked' ? 'ready' : 'blocked',
            detail: graph.nodes.length > 0 ? 'Design has resources that can be handed to the existing Terraform exporter.' : 'Design has no resources to export.',
        },
        {
            id: 'deployment-safety',
            title: 'Deployment safety gate',
            status: validation.status === 'blocked' ? 'blocked' : 'ready',
            detail: 'PLAN is required before APPLY; Cap tenancy execution must use explicit profile, compartment, and operator approval.',
        },
    ]
    const status = statusFromFindings(
        checks.filter((check) => check.status === 'blocked').map((check) => check.detail),
        checks.filter((check) => check.status === 'warning').map((check) => check.detail),
    )
    return {
        status,
        resourceCount: graph.nodes.length,
        relationCount: graph.edges.length,
        checks,
        nextActions: status === 'blocked'
            ? ['Fix blocked readiness checks before generating Terraform or submitting Resource Manager jobs.']
            : ['Generate Terraform package and run plan before apply.', 'Review relation graph and plan output before targeting Cap tenancy.'],
    }
}

export function buildArchitectureTerraformPreview(plan: ArchitecturePlan): ArchitectureTerraformPreview {
    try {
        const design = buildDesignFromArchitecturePlan(plan)
        const terraform = exportResourceManagerTerraformQuietly(design)
        const files = Object.keys(terraform).toSorted()
        const resourceCount = files
            .map((file) => terraform[file].join('\n'))
            .reduce((count, content) => count + (content.match(/\bresource\s+"/g)?.length ?? 0), 0)
        const hasTerraformFiles = files.some((file) => file.endsWith('.tf'))
        return {
            ready: hasTerraformFiles && resourceCount > 0,
            fileCount: files.length,
            files,
            resourceCount,
            summary: `${files.length} Terraform files, ${resourceCount} resource blocks.`,
        }
    } catch (reason) {
        return {
            ready: false,
            fileCount: 0,
            files: [],
            resourceCount: 0,
            summary: reason instanceof Error ? reason.message : 'Terraform preview could not be generated.',
        }
    }
}

function exportResourceManagerTerraformQuietly(design: OcdDesign): Record<string, string[]> {
    const originalDebug = console.debug
    try {
        console.debug = (...args: unknown[]) => {
            const [message] = args
            if (typeof message === 'string' && message.startsWith('OcdTerraformExporter: ociExport: idTFResourceMap:')) return
            originalDebug(...args)
        }
        return new OcdResourceManagerExporter().export(design)
    } finally {
        console.debug = originalDebug
    }
}

export function buildArchitectureAgentPrompt(userPrompt: string): string {
    return [
        'You are an OCI architecture design agent for oci-designer-toolkit-next-gen.',
        'Create a practical OCI architecture plan from the user request.',
        'Return only valid JSON. Do not include markdown outside the JSON object.',
        'Schema: {"title": string, "summary": string, "assumptions": string[], "resources": [{"kind": string, "displayName": string, "cidrBlock"?: string, "tier"?: string, "public"?: boolean, "count"?: number, "notes"?: string}]}',
        `Supported resource kinds: ${SUPPORTED_KINDS.join(', ')}.`,
        'Prefer secure private subnets, explicit network tiers, observability, governance tags, and cost controls when relevant.',
        'For agentic AI or Zero Trust requests, separate reasoning from execution: reasoning proposes, policy decides, and a scoped identity executes.',
        'For agentic AI or Zero Trust requests, include API Gateway, Functions policy gate, dynamic group, IAM policy, Vault, NSGs, Bastion, Data Safe, Cloud Guard, Logging Analytics, Service Connector, and Streaming resources when relevant.',
        `User request: ${userPrompt}`,
    ].join('\n')
}

/*
** Vision prompt: instructs a multimodal model to read the attached architecture diagram
** and emit the SAME strict ArchitecturePlan JSON the text path produces. Reuses the exact
** schema/kinds text from buildArchitectureAgentPrompt so both paths stay in lock-step.
*/
export function buildArchitectureVisionPrompt(userPrompt: string): string {
    const trimmed = userPrompt.trim()
    return [
        'You are an OCI architecture design agent for oci-designer-toolkit-next-gen.',
        'Read the attached architecture diagram image and replicate the architecture it shows as an OCI architecture plan.',
        'Identify every component, network tier, and connection visible in the diagram and map them to supported OCI resource kinds.',
        'Return only valid JSON. Do not include markdown outside the JSON object.',
        'Schema: {"title": string, "summary": string, "assumptions": string[], "resources": [{"kind": string, "displayName": string, "cidrBlock"?: string, "tier"?: string, "public"?: boolean, "count"?: number, "notes"?: string}]}',
        `Supported resource kinds: ${SUPPORTED_KINDS.join(', ')}.`,
        'Prefer secure private subnets, explicit network tiers, observability, governance tags, and cost controls when relevant.',
        'For agentic AI or Zero Trust diagrams, separate reasoning from execution: reasoning proposes, policy decides, and a scoped identity executes.',
        `Additional context from the user: ${trimmed || 'Replicate the architecture shown in the attached diagram as faithfully as possible.'}`,
    ].join('\n')
}

export async function callOpenAiCompatibleArchitectureAgent(
    config: ArchitectureAgentLlmConfig,
    userPrompt: string,
    fetchImpl: typeof fetch = fetch,
): Promise<ArchitecturePlan> {
    const endpoint = config.endpoint.trim()
    if (!endpoint) throw new Error('LLM endpoint is required.')
    if (!config.model.trim()) throw new Error('LLM model is required.')
    // Enforce HTTPS unconditionally to prevent the renderer from POSTing the full
    // prompt to an attacker-chosen http:// target (e.g. cloud metadata at
    // 169.254.169.254). Plain http: is allowed ONLY for loopback hosts so local
    // Ollama / LM Studio endpoints keep working. (Previously this check was gated
    // on an apiKey being present, leaving the keyless local-LLM path wide open.)
    const endpointUrl = new URL(endpoint)
    const loopbackHosts = new Set(['localhost', '127.0.0.1', '[::1]', '::1'])
    const isLoopback = loopbackHosts.has(endpointUrl.hostname)
    if (endpointUrl.protocol !== 'https:' && !(endpointUrl.protocol === 'http:' && isLoopback)) {
        throw new Error('LLM endpoint must use HTTPS (plain http is allowed only for localhost).')
    }
    // Egress hardening: even over HTTPS, refuse endpoints whose hostname is a
    // literal internal/non-routable IPv4 (cloud metadata at 169.254.169.254,
    // RFC1918 ranges, 0.0.0.0) unless the operator explicitly opts in. Loopback
    // hosts are not matched by isBlockedLlmHost, so the dev allowance is kept.
    if (isBlockedLlmHost(endpointUrl.hostname) && !(config.allowInternalEndpoints ?? false)) {
        throw new Error('LLM endpoint resolves to a non-routable or internal address (link-local, metadata, or RFC1918 range); set allowInternalEndpoints to override.')
    }
    // Observability: time the GenAI/LLM round-trip (request + bounded read +
    // parse) and tally success/failure. No prompt text, endpoint, model name or
    // key material is ever passed as a metric label (LABEL CONTRACT). try/finally
    // so the timer stops and the failure counter fires even when the call throws.
    const genaiTimer = OcdMetrics.timer('architecture.genai.ms')
    try {
        const response = await fetchImpl(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(config.apiKey ? { Authorization: `Bearer ${config.apiKey}` } : {}),
            },
            body: JSON.stringify({
                model: config.model,
                temperature: config.temperature ?? 0.2,
                messages: [
                    {
                        role: 'system',
                        content: 'You produce OCI architecture plans as strict JSON for an architecture design tool.',
                    },
                    {
                        role: 'user',
                        content: buildArchitectureAgentPrompt(userPrompt),
                    },
                ],
            }),
        })
        if (!response.ok) throw new Error(`LLM request failed with HTTP ${response.status}.`)
        // Response size cap: reject payloads that advertise a body larger than the
        // cap before we read it into memory. (A full streaming-bounded read could
        // additionally guard against a lying/absent Content-Length.)
        const contentLengthHeader = response.headers?.get?.('content-length')
        const contentLength = contentLengthHeader != null ? Number(contentLengthHeader) : Number.NaN
        if (Number.isFinite(contentLength) && contentLength > MAX_LLM_RESPONSE_BYTES) {
            throw new Error(`LLM response is too large (${contentLength} bytes exceeds the ${MAX_LLM_RESPONSE_BYTES} byte limit).`)
        }
        const payload = await response.json()
        const content = payload?.choices?.[0]?.message?.content ?? payload?.choices?.[0]?.text
        if (typeof content !== 'string' || content.trim() === '') throw new Error('LLM response did not include plan content.')
        const plan = parseArchitecturePlanResponse(content)
        OcdMetrics.counter('architecture.genai.success')
        return plan
    } catch (error: unknown) {
        OcdMetrics.counter('architecture.genai.failure')
        throw error
    } finally {
        genaiTimer.stop()
    }
}

export function parseArchitecturePlanResponse(response: string): ArchitecturePlan {
    return extractValidArchitecturePlan(response)
}

/**
 * Robustly recover an architecture plan from a free-form LLM response. Instead
 * of trusting a single first-brace/last-brace slice (which a crafted response
 * can fool — e.g. a decoy object before the real plan), gather every plausible
 * JSON candidate, JSON.parse each, and return the FIRST one that also passes the
 * existing schema-validation gate. The validator stays the sole authority for
 * what a valid plan is.
 */
export function extractValidArchitecturePlan(response: string): ArchitecturePlan {
    let sawParseableJson = false
    for (const candidate of collectJsonCandidates(response)) {
        let parsed: unknown
        try {
            parsed = JSON.parse(candidate)
        } catch {
            continue
        }
        sawParseableJson = true
        const plan = normalizePlan(parsed)
        if (validateArchitecturePlan(plan).status !== 'blocked') return plan
    }
    throw new Error(sawParseableJson
        ? 'Architecture agent response contained JSON but no schema-valid architecture plan.'
        : 'Architecture agent response did not contain a JSON object.')
}

export function createArchitecturePlanFromPrompt(prompt: string): ArchitecturePlan {
    const text = prompt.toLowerCase()
    if (text.includes('zero trust') || text.includes('agentic') || text.includes('policy gate') || text.includes('scoped identity')) return buildAgenticZeroTrustPlan(prompt)
    if (text.includes('oke') || text.includes('kubernetes') || text.includes('container')) return buildOkePlan(prompt)
    if (text.includes('hub') && text.includes('spoke')) return buildHubSpokePlan(prompt)
    return buildThreeTierPlan(prompt)
}

export function buildDesignFromArchitecturePlan(plan: ArchitecturePlan): OcdDesign {
    const validation = validateArchitecturePlan(plan)
    if (validation.status === 'blocked') {
        throw new Error(`Architecture plan failed validation: ${validation.errors.join(' ')}`)
    }
    const design = OcdDesign.newDesign()
    design.metadata.title = plan.title
    design.metadata.documentation = [plan.summary, ...plan.assumptions.map((a) => `Assumption: ${a}`)].join('\n')
    design.model.oci.resources = {}
    if (design.view.pages[0]) {
        design.view.pages[0].title = plan.title
        design.view.pages[0].layers = []
        design.view.pages[0].coords = []
        design.view.pages[0].connectors = []
    }

    const compartment = OciModelResources.OciCompartment.newResource()
    compartment.displayName = `${plan.title} Compartment`
    compartment.description = plan.summary
    push(design, 'compartment', compartment)
    addLayer(design, compartment.id, true)

    const vcnResource = plan.resources.find((r) => r.kind === 'vcn')
    const vcn = OciModelResources.OciVcn.newResource()
    vcn.displayName = vcnResource?.displayName ?? 'Agent Generated VCN'
    vcn.cidrBlocks = [vcnResource?.cidrBlock ?? '10.40.0.0/16']
    vcn.compartmentId = compartment.id
    push(design, 'vcn', vcn)

    const subnetIds: Record<string, string> = {}
    plan.resources.filter((r) => r.kind === 'subnet').forEach((resource, index) => {
        const subnet = OciModelResources.OciSubnet.newResource()
        subnet.displayName = resource.displayName
        subnet.cidrBlock = resource.cidrBlock ?? `10.40.${index + 1}.0/24`
        subnet.compartmentId = compartment.id
        subnet.vcnId = vcn.id
        subnet.prohibitPublicIpOnVnic = resource.public === false
        subnetIds[resource.tier ?? resource.displayName.toLowerCase()] = subnet.id
        push(design, 'subnet', subnet)
    })

    const firstSubnetId = Object.values(subnetIds)[0] ?? ''
    const publicSubnetId = subnetIds['load-balancer'] ?? subnetIds['public'] ?? firstSubnetId
    const appSubnetId = subnetIds['app'] ?? subnetIds['application'] ?? firstSubnetId
    const dbSubnetId = subnetIds['database'] ?? subnetIds['db'] ?? appSubnetId
    let loadBalancerId = ''
    let functionsApplicationId = ''
    let dbSystemId = ''
    let streamPoolId = ''

    plan.resources.forEach((resource) => {
        switch (resource.kind) {
            case 'internet_gateway': {
                const item = OciModelResources.OciInternetGateway.newResource()
                item.displayName = resource.displayName
                item.compartmentId = compartment.id
                item.vcnId = vcn.id
                push(design, 'internet_gateway', item)
                break
            }
            case 'nat_gateway': {
                const item = OciModelResources.OciNatGateway.newResource()
                item.displayName = resource.displayName
                item.compartmentId = compartment.id
                item.vcnId = vcn.id
                push(design, 'nat_gateway', item)
                break
            }
            case 'service_gateway': {
                const item = OciModelResources.OciServiceGateway.newResource()
                item.displayName = resource.displayName
                item.compartmentId = compartment.id
                item.vcnId = vcn.id
                push(design, 'service_gateway', item)
                break
            }
            case 'network_security_group': {
                const item = OciModelResources.OciNetworkSecurityGroup.newResource()
                item.displayName = resource.displayName
                item.compartmentId = compartment.id
                item.vcnId = vcn.id
                push(design, 'network_security_group', item)
                break
            }
            case 'load_balancer': {
                const item = OciModelResources.OciLoadBalancer.newResource()
                item.displayName = resource.displayName
                item.compartmentId = compartment.id
                item.subnetIds = publicSubnetId ? [publicSubnetId] : []
                push(design, 'load_balancer', item)
                loadBalancerId = item.id
                break
            }
            case 'instance': {
                const count = Math.max(1, resource.count ?? 1)
                Array.from({ length: count }).forEach((_, index) => {
                    const item = OciModelResources.OciInstance.newResource()
                    item.displayName = count > 1 ? `${resource.displayName} ${index + 1}` : resource.displayName
                    item.compartmentId = compartment.id
                    if (item.createVnicDetails) item.createVnicDetails.subnetId = appSubnetId
                    push(design, 'instance', item)
                })
                break
            }
            case 'db_system': {
                const item = OciModelResources.OciDbSystem.newResource()
                item.displayName = resource.displayName
                item.compartmentId = compartment.id
                item.subnetId = dbSubnetId
                push(design, 'db_system', item)
                dbSystemId = item.id
                break
            }
            case 'oke_cluster': {
                const item = OciModelResources.OciOkeCluster.newResource()
                item.displayName = resource.displayName
                item.compartmentId = compartment.id
                item.vcnId = vcn.id
                if (item.endpointConfig) item.endpointConfig.subnetId = appSubnetId
                if (item.options) item.options.serviceLbSubnetIds = publicSubnetId ? [publicSubnetId] : []
                push(design, 'oke_cluster', item)
                break
            }
            case 'oke_node_pool': {
                const item = OciModelResources.OciOkeNodePool.newResource()
                item.displayName = resource.displayName
                item.compartmentId = compartment.id
                item.subnetIds = appSubnetId ? [appSubnetId] : []
                push(design, 'oke_node_pool', item)
                break
            }
            case 'bastion': {
                const item = OciModelResources.OciBastion.newResource()
                item.displayName = resource.displayName
                item.compartmentId = compartment.id
                item.bastionType = 'standard'
                item.targetSubnetId = appSubnetId
                item.maxSessionTtlInSeconds = 10800
                item.clientCidrBlockAllowList = []
                push(design, 'bastion', item)
                break
            }
            case 'vault': {
                const item = OciModelResources.OciVault.newResource()
                item.displayName = resource.displayName
                item.compartmentId = compartment.id
                push(design, 'vault', item)
                break
            }
            case 'key': {
                const item = OciModelResources.OciKey.newResource()
                item.displayName = resource.displayName
                item.compartmentId = compartment.id
                push(design, 'key', item)
                break
            }
            case 'log_group': {
                const item = OciModelResources.OciLogGroup.newResource()
                item.displayName = resource.displayName
                item.compartmentId = compartment.id
                push(design, 'log_group', item)
                break
            }
            case 'monitoring_alarm': {
                const item = OciModelResources.OciMonitoringAlarm.newResource()
                item.displayName = resource.displayName
                item.compartmentId = compartment.id
                push(design, 'monitoring_alarm', item)
                break
            }
            case 'budget': {
                const item = OciModelResources.OciBudget.newResource()
                item.displayName = resource.displayName
                item.compartmentId = compartment.id
                push(design, 'budget', item)
                break
            }
            case 'policy': {
                const item = OciModelResources.OciPolicy.newResource()
                item.displayName = resource.displayName
                item.compartmentId = compartment.id
                push(design, 'policy', item)
                break
            }
            case 'dynamic_group': {
                const item = OciModelResources.OciDynamicGroup.newResource()
                item.displayName = resource.displayName
                item.compartmentId = compartment.id
                push(design, 'dynamic_group', item)
                break
            }
            case 'api_gateway': {
                const item = OciModelResources.OciApiGateway.newResource()
                item.displayName = resource.displayName
                item.compartmentId = compartment.id
                item.endpointType = resource.public ? 'PUBLIC' : 'PRIVATE'
                item.subnetId = publicSubnetId || appSubnetId
                push(design, 'api_gateway', item)
                break
            }
            case 'functions_application': {
                const item = OciModelResources.OciFunctionsApplication.newResource()
                item.displayName = resource.displayName
                item.compartmentId = compartment.id
                item.subnetIds = appSubnetId ? [appSubnetId] : []
                if (item.traceConfig) item.traceConfig.isEnabled = true
                push(design, 'functions_application', item)
                functionsApplicationId = item.id
                break
            }
            case 'functions_function': {
                const item = OciModelResources.OciFunctionsFunction.newResource()
                item.displayName = resource.displayName
                item.compartmentId = compartment.id
                item.applicationId = functionsApplicationId
                item.memoryInMbs = '512'
                item.timeoutInSeconds = 60
                push(design, 'functions_function', item)
                break
            }
            case 'web_app_firewall': {
                const item = OciModelResources.OciWebAppFirewall.newResource()
                item.displayName = resource.displayName
                item.compartmentId = compartment.id
                item.backendType = 'LOAD_BALANCER'
                item.loadBalancerId = loadBalancerId
                push(design, 'web_app_firewall', item)
                break
            }
            case 'data_safe_target_database': {
                const item = OciModelResources.OciDataSafeTargetDatabase.newResource()
                item.displayName = resource.displayName
                item.compartmentId = compartment.id
                item.description = resource.notes ?? 'Data Safe target for agentic architecture evidence.'
                if (item.databaseDetails) {
                    item.databaseDetails.databaseType = 'DATABASE_CLOUD_SERVICE'
                    item.databaseDetails.infrastructureType = 'ORACLE_CLOUD'
                    item.databaseDetails.dbSystemId = dbSystemId
                }
                push(design, 'data_safe_target_database', item)
                break
            }
            case 'data_safe_security_assessment': {
                const item = OciModelResources.OciDataSafeSecurityAssessment.newResource()
                item.displayName = resource.displayName
                item.compartmentId = compartment.id
                push(design, 'data_safe_security_assessment', item)
                break
            }
            case 'cloud_guard_target': {
                const item = OciModelResources.OciCloudGuardTarget.newResource()
                item.displayName = resource.displayName
                item.compartmentId = compartment.id
                item.description = resource.notes ?? 'Cloud Guard target for posture and responder evidence.'
                item.targetResourceId = compartment.id
                item.targetResourceType = 'COMPARTMENT'
                push(design, 'cloud_guard_target', item)
                break
            }
            case 'log_analytics_log_group': {
                const item = OciModelResources.OciLogAnalyticsLogGroup.newResource()
                item.displayName = resource.displayName
                item.compartmentId = compartment.id
                item.description = resource.notes ?? 'Logging Analytics group for agent action and policy decision evidence.'
                item.namespace = '<LA_NAMESPACE>'
                push(design, 'log_analytics_log_group', item)
                break
            }
            case 'service_connector': {
                const item = OciModelResources.OciServiceConnector.newResource()
                item.displayName = resource.displayName
                item.compartmentId = compartment.id
                item.description = resource.notes ?? 'Routes audit, logging, and policy decision events to evidence storage and SIEM.'
                push(design, 'service_connector', item)
                break
            }
            case 'streaming_stream_pool': {
                const item = OciModelResources.OciStreamingStreamPool.newResource()
                item.displayName = resource.displayName
                item.compartmentId = compartment.id
                item.isPrivate = true
                if (item.privateEndpointSettings) item.privateEndpointSettings.subnetId = appSubnetId
                push(design, 'streaming_stream_pool', item)
                streamPoolId = item.id
                break
            }
            case 'streaming_stream': {
                const item = OciModelResources.OciStreamingStream.newResource()
                item.displayName = resource.displayName
                item.compartmentId = compartment.id
                item.partitions = Math.max(1, resource.count ?? 1)
                item.retentionInHours = 24 * 7
                item.streamPoolId = streamPoolId || design.model.oci.resources.streaming_stream_pool?.[0]?.id || ''
                push(design, 'streaming_stream', item)
                break
            }
            default:
                break
        }
    })

    const relationGraph = buildArchitectureRelationGraph(design)
    const readiness = buildArchitectureAgentReadiness(plan, design)
    design.userDefined.architectureAgent = {
        generated: true,
        planTitle: plan.title,
        summary: plan.summary,
        assumptions: [...plan.assumptions],
        validation,
        relationGraph,
        readiness,
    }
    return design
}

function normalizePlan(value: any): ArchitecturePlan {
    const resources = Array.isArray(value?.resources) ? value.resources : []
    const droppedKinds = unique(
        resources
            .map((resource: any) => (typeof resource?.kind === 'string' ? resource.kind : ''))
            .filter((kind: string) => kind && !SUPPORTED_KINDS.includes(kind as ArchitectureResourceKind)),
    )
    return {
        title: String(value?.title || 'Agent Generated OCI Architecture'),
        summary: String(value?.summary || 'Generated by the architecture agent.'),
        assumptions: Array.isArray(value?.assumptions) ? value.assumptions.map(String) : [],
        droppedKinds: droppedKinds.length > 0 ? droppedKinds : undefined,
        resources: resources
            .filter((resource: any) => SUPPORTED_KINDS.includes(resource?.kind as ArchitectureResourceKind))
            .map((resource: any): ArchitecturePlanResource => ({
                kind: resource.kind,
                displayName: String(resource.displayName || toTitle(resource.kind)),
                cidrBlock: resource.cidrBlock ? String(resource.cidrBlock) : undefined,
                tier: resource.tier ? String(resource.tier) : undefined,
                public: typeof resource.public === 'boolean' ? resource.public : undefined,
                count: Number.isFinite(Number(resource.count)) ? Number(resource.count) : undefined,
                notes: resource.notes ? String(resource.notes) : undefined,
            })),
    }
}

/**
 * Build an ordered, de-duplicated list of candidate JSON strings to try:
 *   1. The contents of any ```json ... ``` fenced block(s), plus each balanced
 *      object found inside them (a decoy can share a fence with the real plan).
 *   2. Every balanced { ... } object found across the whole response.
 *   3. The whole response as-is.
 *   4. Last resort: the first '{' to last '}' span (legacy behaviour).
 */
function collectJsonCandidates(text: string): string[] {
    const candidates: string[] = []
    const add = (value: string | undefined): void => {
        const trimmed = value?.trim()
        if (trimmed && !candidates.includes(trimmed)) candidates.push(trimmed)
    }

    const fencePattern = /```(?:json)?\s*([\s\S]*?)```/gi
    let fenceMatch: RegExpExecArray | null
    while ((fenceMatch = fencePattern.exec(text)) !== null) {
        collectBalancedJsonObjects(fenceMatch[1]).forEach(add)
        add(fenceMatch[1])
    }

    collectBalancedJsonObjects(text).forEach(add)
    add(text)

    const start = text.indexOf('{')
    const end = text.lastIndexOf('}')
    if (start >= 0 && end > start) add(text.slice(start, end + 1))

    return candidates
}

/**
 * Scan text and return every top-level, brace-balanced { ... } substring. String
 * literals (and their escapes) are tracked so braces inside JSON string values
 * do not corrupt the depth count.
 */
function collectBalancedJsonObjects(text: string): string[] {
    const objects: string[] = []
    let depth = 0
    let start = -1
    let inString = false
    let escaped = false
    for (let index = 0; index < text.length; index += 1) {
        const char = text[index]
        if (inString) {
            if (escaped) escaped = false
            else if (char === '\\') escaped = true
            else if (char === '"') inString = false
            continue
        }
        if (char === '"') {
            inString = true
            continue
        }
        if (char === '{') {
            if (depth === 0) start = index
            depth += 1
        } else if (char === '}' && depth > 0) {
            depth -= 1
            if (depth === 0 && start >= 0) {
                objects.push(text.slice(start, index + 1))
                start = -1
            }
        }
    }
    return objects
}

function buildAgenticZeroTrustPlan(_prompt: string): ArchitecturePlan {
    return {
        title: 'Agentic Zero Trust Architecture',
        summary: 'OCI-native architecture that separates AI reasoning from action execution through a deterministic policy gate, scoped identity, and continuous evidence loop.',
        assumptions: [
            'Reasoning proposes actions but holds no standing privilege.',
            'A Functions policy gate validates identity, data class, tool, destination, and approval tier before execution.',
            'Execution uses short-lived resource principals, Vault-backed secrets, and complete Audit, Logging, and Logging Analytics evidence.',
            'ZPR and Security Zones are modeled as required controls because they are not editable designer resources yet.',
        ],
        resources: [
            { kind: 'vcn', displayName: 'Agentic Zero Trust VCN', cidrBlock: '10.70.0.0/16' },
            { kind: 'subnet', displayName: 'Authenticated API Gateway Subnet', cidrBlock: '10.70.1.0/24', tier: 'load-balancer', public: true },
            { kind: 'subnet', displayName: 'Private Agent Sandbox Subnet', cidrBlock: '10.70.2.0/24', tier: 'app', public: false },
            { kind: 'subnet', displayName: 'Private Data Control Subnet', cidrBlock: '10.70.3.0/24', tier: 'database', public: false },
            { kind: 'internet_gateway', displayName: 'Controlled Internet Gateway' },
            { kind: 'nat_gateway', displayName: 'Agent Egress NAT Gateway' },
            { kind: 'service_gateway', displayName: 'Private OCI Service Gateway' },
            { kind: 'network_security_group', displayName: 'API Gateway Boundary NSG' },
            { kind: 'network_security_group', displayName: 'Agent Runtime Boundary NSG' },
            { kind: 'network_security_group', displayName: 'Data Control Boundary NSG' },
            { kind: 'load_balancer', displayName: 'Agent Tool Ingress Load Balancer' },
            { kind: 'web_app_firewall', displayName: 'Agent Tool Web Application Firewall' },
            { kind: 'api_gateway', displayName: 'Agent Tool API Gateway', public: true },
            { kind: 'functions_application', displayName: 'Policy Gate Functions Application' },
            { kind: 'functions_function', displayName: 'Deterministic Policy Decision Function' },
            { kind: 'oke_cluster', displayName: 'Reasoning Sandbox OKE Cluster' },
            { kind: 'oke_node_pool', displayName: 'Private Agent Runtime Node Pool' },
            { kind: 'bastion', displayName: 'Break Glass Agent Runtime Bastion' },
            { kind: 'dynamic_group', displayName: 'Scoped Agent Execution Dynamic Group' },
            { kind: 'policy', displayName: 'Least Agency Execution Policy' },
            { kind: 'vault', displayName: 'Agent Secret Vault' },
            { kind: 'key', displayName: 'Agent Evidence Encryption Key' },
            { kind: 'db_system', displayName: 'Protected Enterprise Database' },
            { kind: 'data_safe_target_database', displayName: 'Data Safe Protected Database Target' },
            { kind: 'data_safe_security_assessment', displayName: 'Data Safe Security Assessment' },
            { kind: 'cloud_guard_target', displayName: 'Agentic Compartment Cloud Guard Target' },
            { kind: 'log_group', displayName: 'Agent Action Log Group' },
            { kind: 'log_analytics_log_group', displayName: 'Agent Evidence Analytics Log Group' },
            { kind: 'streaming_stream_pool', displayName: 'Private Agent Evidence Stream Pool' },
            { kind: 'streaming_stream', displayName: 'Policy Decision Evidence Stream', count: 3 },
            { kind: 'service_connector', displayName: 'Evidence Service Connector' },
            { kind: 'monitoring_alarm', displayName: 'Policy Gate Health Alarm' },
            { kind: 'budget', displayName: 'Agentic AI Cost Guardrail Budget' },
        ],
    }
}

function buildThreeTierPlan(prompt: string): ArchitecturePlan {
    const secure = /secure|private|governance|production|prod/.test(prompt.toLowerCase())
    return {
        title: 'Agent Three-Tier Web Architecture',
        summary: 'Load-balanced web application with private application and database tiers.',
        assumptions: [
            'CIDR ranges are placeholders and should be adjusted to the target tenancy network plan.',
            secure ? 'Private subnets, observability, and budget controls are included by default.' : 'Public access is limited to the load-balancer tier.',
        ],
        resources: [
            { kind: 'vcn', displayName: 'Agent App VCN', cidrBlock: '10.40.0.0/16' },
            { kind: 'subnet', displayName: 'Public Load Balancer Subnet', cidrBlock: '10.40.1.0/24', tier: 'load-balancer', public: true },
            { kind: 'subnet', displayName: 'Private App Subnet', cidrBlock: '10.40.2.0/24', tier: 'app', public: false },
            { kind: 'subnet', displayName: 'Private Database Subnet', cidrBlock: '10.40.3.0/24', tier: 'database', public: false },
            { kind: 'internet_gateway', displayName: 'Internet Gateway' },
            { kind: 'nat_gateway', displayName: 'NAT Gateway' },
            { kind: 'service_gateway', displayName: 'Service Gateway' },
            { kind: 'load_balancer', displayName: 'Public Load Balancer' },
            { kind: 'instance', displayName: 'Application Server', count: 2 },
            { kind: 'db_system', displayName: 'Application Database' },
            { kind: 'log_group', displayName: 'Application Log Group' },
            { kind: 'monitoring_alarm', displayName: 'Application Health Alarm' },
            { kind: 'budget', displayName: 'Application Budget' },
        ],
    }
}

function buildOkePlan(_prompt: string): ArchitecturePlan {
    return {
        title: 'Agent OKE Platform Architecture',
        summary: 'Secure OKE platform with private worker and pod networking, ingress, vault, logging, and monitoring.',
        assumptions: [
            'The cluster uses VCN-native networking with dedicated pod and worker subnets.',
            'Ingress is isolated to the load-balancer subnet; worker and pod subnets remain private.',
        ],
        resources: [
            { kind: 'vcn', displayName: 'OKE Platform VCN', cidrBlock: '10.50.0.0/16' },
            { kind: 'subnet', displayName: 'OKE Load Balancer Subnet', cidrBlock: '10.50.1.0/24', tier: 'load-balancer', public: true },
            { kind: 'subnet', displayName: 'OKE Worker Subnet', cidrBlock: '10.50.2.0/24', tier: 'app', public: false },
            { kind: 'subnet', displayName: 'OKE Pod Subnet', cidrBlock: '10.50.3.0/24', tier: 'pod', public: false },
            { kind: 'internet_gateway', displayName: 'OKE Internet Gateway' },
            { kind: 'nat_gateway', displayName: 'OKE NAT Gateway' },
            { kind: 'service_gateway', displayName: 'OKE Service Gateway' },
            { kind: 'load_balancer', displayName: 'OKE Ingress Load Balancer' },
            { kind: 'oke_cluster', displayName: 'OKE Enhanced Cluster' },
            { kind: 'oke_node_pool', displayName: 'OKE Private Node Pool' },
            { kind: 'dynamic_group', displayName: 'OKE Workload Identity Dynamic Group' },
            { kind: 'policy', displayName: 'OKE Workload Identity Policy' },
            { kind: 'vault', displayName: 'OKE Vault' },
            { kind: 'key', displayName: 'OKE Encryption Key' },
            { kind: 'log_group', displayName: 'OKE Log Group' },
            { kind: 'monitoring_alarm', displayName: 'OKE Health Alarm' },
            { kind: 'budget', displayName: 'OKE Platform Budget' },
        ],
    }
}

function buildHubSpokePlan(_prompt: string): ArchitecturePlan {
    return {
        title: 'Agent Hub-Spoke Network Architecture',
        summary: 'Central hub network with two private workload spokes and shared egress controls.',
        assumptions: [
            'DRG and LPG details should be finalized against the target region and connectivity model.',
            'Spoke workloads are private by default and route egress through the hub.',
        ],
        resources: [
            { kind: 'vcn', displayName: 'Hub VCN', cidrBlock: '10.60.0.0/16' },
            { kind: 'subnet', displayName: 'Hub Transit Subnet', cidrBlock: '10.60.1.0/24', tier: 'transit', public: false },
            { kind: 'subnet', displayName: 'Spoke A App Subnet', cidrBlock: '10.61.1.0/24', tier: 'app', public: false },
            { kind: 'subnet', displayName: 'Spoke B App Subnet', cidrBlock: '10.62.1.0/24', tier: 'app', public: false },
            { kind: 'nat_gateway', displayName: 'Hub NAT Gateway' },
            { kind: 'service_gateway', displayName: 'Hub Service Gateway' },
            { kind: 'log_group', displayName: 'Network Log Group' },
            { kind: 'monitoring_alarm', displayName: 'Network Health Alarm' },
            { kind: 'budget', displayName: 'Network Budget' },
        ],
    }
}

function push(design: OcdDesign, key: string, resource: object): void {
    if (!Object.hasOwn(design.model.oci.resources, key)) design.model.oci.resources[key] = []
    design.model.oci.resources[key].push(resource)
}

function addLayer(design: OcdDesign, compartmentId: string, selected: boolean): void {
    const layer: OcdViewLayer = {
        id: compartmentId,
        class: 'oci-compartment',
        visible: true,
        selected,
    }
    design.view.pages.forEach((page) => page.layers.push(layer))
}

function toTitle(value: string): string {
    return value.split('_').map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`).join(' ')
}
