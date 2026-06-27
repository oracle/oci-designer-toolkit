/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { generativeaiinference } from 'oci-sdk'
import { OciCommonQuery } from './OciQueryCommon.js'

export interface OciGenAiArchitectureRequest {
    profile: string
    region: string
    compartmentId: string
    modelId: string
    prompt: string
    temperature?: number
    maxTokens?: number
}

/*
** Vision (multimodal) variant of the architecture request. Identical to the text
** request but carries a base64 image data-URI. The pipeline downstream is unchanged:
** the model is asked to emit the SAME ArchitecturePlan JSON the text path produces.
*/
export interface OciGenAiArchitectureImageRequest extends OciGenAiArchitectureRequest {
    imageDataUri: string
}

export interface OciGenAiArchitectureResponse {
    text: string
    modelId?: string
    modelVersion?: string
    opcRequestId?: string
}

export interface OciGenAiChatClient {
    chat(request: generativeaiinference.requests.ChatRequest): Promise<generativeaiinference.responses.ChatResponse | ReadableStream<Uint8Array> | null>
}

export type OciGenAiChatClientFactory = (query: OciGenAiArchitectureQuery) => OciGenAiChatClient

const MAX_PROMPT_CHARS = 16000
export const DEFAULT_OCI_GENAI_ARCHITECT_MODEL_ID = 'cohere.command-a-03-2025'
// OCI GenAI multimodal (vision) model used for the IMAGE -> architecture path.
// Overridable by the caller via request.modelId.
export const DEFAULT_OCI_GENAI_VISION_MODEL_ID = 'meta.llama-3.2-90b-vision-instruct'
export const DEFAULT_MAX_TOKENS = 2400
export const DEFAULT_TEMPERATURE = 0.2
const GENAI_TIMEOUT_MS = 60000

// Accepted inline-image data-URI prefixes for the vision path.
const IMAGE_DATA_URI_PREFIX = /^data:image\/(?:png|jpe?g|webp|gif);base64,/i
// Decoded image size cap (~8 MB). base64 inflates by 4/3, so cap the encoded length.
const MAX_IMAGE_DECODED_BYTES = 8 * 1024 * 1024
const MAX_IMAGE_BASE64_CHARS = Math.ceil(MAX_IMAGE_DECODED_BYTES / 3) * 4

const SENSITIVE_PATTERNS: ReadonlyArray<[RegExp, string]> = [
    [/\bocid1\.[a-z0-9_-]+\.oc1(?:\.[a-z0-9_-]+)?\.[a-z0-9._-]+\b/gi, '<OCI_OCID>'],
    [/\b(?:api|secret|private|access)[_-]?key\s*[:=]\s*[^\s,;]+/gi, '<SECRET_VALUE>'],
    [/\bfingerprint\s*[:=]\s*(?:[a-f0-9]{2}:){8,}[a-f0-9]{2}\b/gi, '<KEY_FINGERPRINT>'],
    [/\b(?:130\.61|161\.153|144\.24|129\.153|141\.147|82\.77|109\.166)\.\d{1,3}\.\d{1,3}\b/g, '<PUBLIC_IP>'],
    [/\b(?:10\.42|10\.0\.10)\.\d{1,3}\.\d{1,3}\b/g, '<PRIVATE_IP>'],
]

const ARCHITECTURE_RESOURCE_KINDS = [
    'compartment', 'vcn', 'subnet', 'internet_gateway', 'nat_gateway', 'service_gateway',
    'network_security_group', 'load_balancer', 'instance', 'db_system', 'oke_cluster',
    'oke_node_pool', 'bastion', 'vault', 'key', 'log_group', 'monitoring_alarm', 'budget',
    'policy', 'dynamic_group', 'api_gateway', 'functions_application', 'functions_function',
    'web_app_firewall', 'data_safe_target_database', 'data_safe_security_assessment',
    'cloud_guard_target', 'log_analytics_log_group', 'service_connector',
    'streaming_stream_pool', 'streaming_stream',
] as const

const clampNumber = (value: number | undefined, fallback: number, min: number, max: number): number => {
    if (value === undefined || !Number.isFinite(value)) return fallback
    return Math.min(max, Math.max(min, value))
}

const requireNonEmpty = (value: string, label: string): string => {
    const trimmed = value.trim()
    if (!trimmed) throw new Error(`${label} is required.`)
    return trimmed
}

const envValue = (env: Record<string, string | undefined>, ...keys: string[]): string => {
    for (const key of keys) {
        const value = env[key]?.trim()
        if (value) return value
    }
    return ''
}

const readNodeEnv = (): Record<string, string | undefined> =>
    (globalThis as unknown as { process?: { env?: Record<string, string | undefined> } }).process?.env ?? {}

export const resolveGenAiArchitectureRequestDefaults = (
    request: OciGenAiArchitectureRequest,
    env: Record<string, string | undefined> = readNodeEnv(),
): OciGenAiArchitectureRequest => ({
    ...request,
    profile: request.profile || envValue(env, 'OCD_ARCHITECT_OCI_PROFILE', 'OCI_PROFILE') || 'DEFAULT',
    region: request.region || envValue(env, 'OCD_ARCHITECT_OCI_REGION', 'OCI_REGION'),
    compartmentId: request.compartmentId || envValue(env, 'OCD_ARCHITECT_OCI_COMPARTMENT_ID', 'OCI_GENAI_COMPARTMENT_ID'),
    modelId: request.modelId || envValue(env, 'OCD_ARCHITECT_OCI_MODEL_ID', 'OCI_GENAI_MODEL_ID') || DEFAULT_OCI_GENAI_ARCHITECT_MODEL_ID,
})

export const redactArchitecturePrompt = (prompt: string): string =>
    SENSITIVE_PATTERNS.reduce((current, [pattern, replacement]) => current.replace(pattern, replacement), prompt)

/**
 * The OCI GenAI backend is intentionally independent from the React architecture
 * workbench, so it owns the inference contract that turns a natural-language
 * request into the JSON plan consumed by the canvas, relation graph, and
 * Terraform exporter. Keep this contract explicit: JSON mode alone constrains
 * syntax, not the architecture-plan shape or dependency guidance.
 */
export const buildOciGenAiArchitecturePrompt = (prompt: string): string => {
    const userRequest = redactArchitecturePrompt(prompt)
    return [
        'You are an OCI architecture design agent for Oracle Cloud Designer Toolkit.',
        'Create an editable, deployment-neutral OCI architecture plan from the user request.',
        'Return only valid JSON. Do not include markdown, explanations, OCIDs, credentials, IP addresses, or Terraform.',
        'Schema: {"title": string, "summary": string, "assumptions": string[], "resources": [{"kind": string, "displayName": string, "cidrBlock"?: string, "tier"?: string, "public"?: boolean, "count"?: number, "notes"?: string}]}.',
        `Supported resource kinds: ${ARCHITECTURE_RESOURCE_KINDS.join(', ')}.`,
        'Model relations through compatible resources: subnets require a VCN; compute, databases, and load balancers require subnets; OKE node pools require an OKE cluster; Functions functions require a Functions application.',
        'Prefer private application and database subnets, explicit public edge subnets only where required, least-privilege IAM, logging, monitoring, and cost controls when relevant.',
        'This is a design proposal only. Never claim to create or apply cloud resources; the operator must review generated Terraform and run PLAN before APPLY.',
        `User request: ${userRequest}`,
    ].join('\n')
}

export const validateGenAiArchitectureRequest = (request: OciGenAiArchitectureRequest): OciGenAiArchitectureRequest => {
    const resolved = resolveGenAiArchitectureRequestDefaults(request)
    const profile = requireNonEmpty(resolved.profile, 'OCI profile')
    const region = requireNonEmpty(resolved.region, 'OCI region')
    const compartmentId = requireNonEmpty(resolved.compartmentId, 'OCI GenAI compartment')
    const modelId = requireNonEmpty(resolved.modelId, 'OCI GenAI model')
    const prompt = requireNonEmpty(resolved.prompt, 'Architecture prompt')
    if (prompt.length > MAX_PROMPT_CHARS) throw new Error(`Architecture prompt is too large; maximum is ${MAX_PROMPT_CHARS} characters.`)
    return {
        profile,
        region,
        compartmentId,
        modelId,
        prompt,
        temperature: clampNumber(resolved.temperature, DEFAULT_TEMPERATURE, 0, 1),
        maxTokens: Math.round(clampNumber(resolved.maxTokens, DEFAULT_MAX_TOKENS, 256, 4000)),
    }
}

/*
** Validate a base64 image data-URI for the vision path. Enforces an image/* base64
** prefix and a decoded ~8 MB size cap. NEVER logs or echoes the image bytes; only the
** validated data-URI is returned to the caller (and later placed in the chat content).
*/
export const validateArchitectureImageDataUri = (dataUri: string): string => {
    const trimmed = typeof dataUri === 'string' ? dataUri.trim() : ''
    if (!trimmed) throw new Error('Architecture diagram image is required.')
    const match = IMAGE_DATA_URI_PREFIX.exec(trimmed)
    if (!match) throw new Error('Architecture diagram image must be a base64 data URI (data:image/png|jpeg|jpg|webp|gif;base64,...).')
    const base64 = trimmed.slice(match[0].length)
    if (!base64) throw new Error('Architecture diagram image data is empty.')
    if (base64.length > MAX_IMAGE_BASE64_CHARS) {
        throw new Error(`Architecture diagram image is too large; maximum is ${Math.floor(MAX_IMAGE_DECODED_BYTES / (1024 * 1024))} MB.`)
    }
    return trimmed
}

export const validateGenAiArchitectureImageRequest = (request: OciGenAiArchitectureImageRequest): OciGenAiArchitectureImageRequest => {
    const imageDataUri = validateArchitectureImageDataUri(request.imageDataUri)
    // Default the model to the vision model when the caller did not pick one. Passing a
    // non-empty modelId short-circuits the env/text-model fallback in the shared resolver.
    const validated = validateGenAiArchitectureRequest({
        ...request,
        modelId: request.modelId?.trim() ? request.modelId : DEFAULT_OCI_GENAI_VISION_MODEL_ID,
    })
    return { ...validated, imageDataUri }
}

export const buildGenAiArchitectureChatRequest = (request: OciGenAiArchitectureRequest): generativeaiinference.requests.ChatRequest => {
    const validated = validateGenAiArchitectureRequest(request)
    return {
        chatDetails: {
            compartmentId: validated.compartmentId,
            servingMode: {
                servingType: generativeaiinference.models.OnDemandServingMode.servingType,
                modelId: validated.modelId,
            },
            chatRequest: {
                apiFormat: generativeaiinference.models.GenericChatRequest.apiFormat,
                isStream: false,
                maxTokens: validated.maxTokens,
                temperature: validated.temperature,
                responseFormat: {
                    type: generativeaiinference.models.JsonObjectResponseFormat.type,
                },
                messages: [{
                    role: generativeaiinference.models.UserMessage.role,
                    content: [{
                        type: generativeaiinference.models.TextContent.type,
                        text: buildOciGenAiArchitecturePrompt(validated.prompt),
                    } as generativeaiinference.models.TextContent],
                }],
            },
        },
    }
}

/*
** Vision builder: mirrors buildGenAiArchitectureChatRequest but adds an ImageContent
** part to the user message content array. The TEXT prompt is still redacted; the image
** data-URI is passed through untouched (validated by validateGenAiArchitectureImageRequest).
*/
export const buildGenAiArchitectureVisionChatRequest = (request: OciGenAiArchitectureImageRequest): generativeaiinference.requests.ChatRequest => {
    const validated = validateGenAiArchitectureImageRequest(request)
    return {
        chatDetails: {
            compartmentId: validated.compartmentId,
            servingMode: {
                servingType: generativeaiinference.models.OnDemandServingMode.servingType,
                modelId: validated.modelId,
            },
            chatRequest: {
                apiFormat: generativeaiinference.models.GenericChatRequest.apiFormat,
                isStream: false,
                maxTokens: validated.maxTokens,
                temperature: validated.temperature,
                responseFormat: {
                    type: generativeaiinference.models.JsonObjectResponseFormat.type,
                },
                messages: [{
                    role: generativeaiinference.models.UserMessage.role,
                    content: [
                        {
                            type: generativeaiinference.models.TextContent.type,
                            text: [
                                'Use the attached architecture diagram as an additional source of truth. Identify its components, tiers, and connections.',
                                buildOciGenAiArchitecturePrompt(validated.prompt),
                            ].join('\n'),
                        } as generativeaiinference.models.TextContent,
                        {
                            type: generativeaiinference.models.ImageContent.type,
                            imageUrl: {
                                url: validated.imageDataUri,
                            },
                        } as generativeaiinference.models.ImageContent,
                    ],
                }],
            },
        },
    }
}

const textFromContent = (content: unknown): string => {
    if (typeof content === 'string') return content
    if (!Array.isArray(content)) return ''
    return content
        .map((item) => {
            if (!item || typeof item !== 'object') return ''
            const text = (item as { text?: unknown }).text
            return typeof text === 'string' ? text : ''
        })
        .filter((value) => value.trim() !== '')
        .join('\n')
}

export const extractGenAiArchitectureText = (response: generativeaiinference.responses.ChatResponse | null): OciGenAiArchitectureResponse => {
    const result = response?.chatResult
    const chatResponse = result?.chatResponse as { text?: unknown; choices?: Array<{ message?: { content?: unknown } }> } | undefined
    const text = typeof chatResponse?.text === 'string'
        ? chatResponse.text
        : textFromContent(chatResponse?.choices?.[0]?.message?.content)
    if (!text.trim()) throw new Error('OCI GenAI response did not include architecture plan content.')
    return {
        text,
        modelId: result?.modelId,
        modelVersion: result?.modelVersion,
        opcRequestId: response?.opcRequestId,
    }
}

export class OciGenAiArchitectureQuery extends OciCommonQuery {
    genAiClient: OciGenAiChatClient

    constructor(profile: string = 'DEFAULT', region?: string, clientFactory?: OciGenAiChatClientFactory) {
        super(profile, region)
        this.genAiClient = clientFactory
            ? clientFactory(this)
            : new generativeaiinference.GenerativeAiInferenceClient(this.authenticationConfiguration, this.clientConfiguration)
    }

    generateArchitecturePlan(request: OciGenAiArchitectureRequest): Promise<OciGenAiArchitectureResponse> {
        const chatRequest = buildGenAiArchitectureChatRequest(request)
        return this.withTimeout(this.genAiClient.chat(chatRequest), 'generateArchitecturePlan', GENAI_TIMEOUT_MS)
            .then((response) => {
                if (response instanceof ReadableStream) throw new Error('OCI GenAI streaming responses are not supported for architecture planning.')
                return extractGenAiArchitectureText(response)
            })
    }

    generateArchitecturePlanFromImage(request: OciGenAiArchitectureImageRequest): Promise<OciGenAiArchitectureResponse> {
        const chatRequest = buildGenAiArchitectureVisionChatRequest(request)
        return this.withTimeout(this.genAiClient.chat(chatRequest), 'generateArchitecturePlanFromImage', GENAI_TIMEOUT_MS)
            .then((response) => {
                if (response instanceof ReadableStream) throw new Error('OCI GenAI streaming responses are not supported for architecture planning.')
                return extractGenAiArchitectureText(response)
            })
    }
}
