export type ArchitecturePlannerMode = 'local' | 'openai' | 'oci-genai'

export interface ArchitectureAgentProviderConfig {
    readonly plannerMode: ArchitecturePlannerMode
    readonly openAiEndpoint: string
    readonly openAiModel: string
    readonly ociProfile: string
    readonly ociRegion: string
    readonly ociCompartmentId: string
    readonly ociModelId: string
    readonly temperature: number
    readonly maxTokens: number
}

export interface ArchitectureAgentProviderReadinessIssue {
    readonly field: string
    readonly label: string
    readonly variable: string
}

export interface ArchitectureAgentProviderReadiness {
    readonly ready: boolean
    readonly label: string
    readonly message: string
    readonly issues: readonly ArchitectureAgentProviderReadinessIssue[]
}

export const DEFAULT_OCI_GENAI_MODEL_ID = 'cohere.command-a-03-2025'
export const DEFAULT_ARCHITECTURE_AGENT_TEMPERATURE = 0.2
export const DEFAULT_ARCHITECTURE_AGENT_MAX_TOKENS = 2400

const PLANNER_MODES = new Set<ArchitecturePlannerMode>(['local', 'openai', 'oci-genai'])

const envValue = (env: Record<string, string | undefined>, ...keys: string[]): string => {
    for (const key of keys) {
        const value = env[key]?.trim()
        if (value) return value
    }
    return ''
}

const numberValue = (
    env: Record<string, string | undefined>,
    fallback: number,
    min: number,
    max: number,
    ...keys: string[]
): number => {
    const raw = envValue(env, ...keys)
    if (!raw) return fallback
    const parsed = Number(raw)
    if (!Number.isFinite(parsed)) return fallback
    return Math.min(max, Math.max(min, parsed))
}

const readViteEnv = (): Record<string, string | undefined> => {
    const env = import.meta.env as Record<string, string | undefined> | undefined
    return env ?? {}
}

export const isOciGenAiConfigured = (config: Pick<ArchitectureAgentProviderConfig, 'ociRegion' | 'ociCompartmentId' | 'ociModelId'>): boolean =>
    Boolean(config.ociRegion.trim() && config.ociCompartmentId.trim() && config.ociModelId.trim())

export const isOpenAiCompatibleConfigured = (config: Pick<ArchitectureAgentProviderConfig, 'openAiEndpoint' | 'openAiModel'>): boolean =>
    Boolean(config.openAiEndpoint.trim() && config.openAiModel.trim())

export const getArchitectureAgentProviderLabel = (plannerMode: ArchitecturePlannerMode): string => {
    if (plannerMode === 'oci-genai') return 'OCI GenAI'
    if (plannerMode === 'openai') return 'OpenAI-compatible'
    return 'Local'
}

export const getArchitectureAgentProviderReadiness = (
    config: Pick<
        ArchitectureAgentProviderConfig,
        'plannerMode' | 'openAiEndpoint' | 'openAiModel' | 'ociProfile' | 'ociRegion' | 'ociCompartmentId' | 'ociModelId'
    >,
): ArchitectureAgentProviderReadiness => {
    const label = getArchitectureAgentProviderLabel(config.plannerMode)
    const issues: ArchitectureAgentProviderReadinessIssue[] = []
    if (config.plannerMode === 'openai') {
        if (!config.openAiEndpoint.trim()) {
            issues.push({ field: 'openAiEndpoint', label: 'Endpoint', variable: 'VITE_OCD_ARCHITECT_OPENAI_ENDPOINT' })
        }
        if (!config.openAiModel.trim()) {
            issues.push({ field: 'openAiModel', label: 'Model', variable: 'VITE_OCD_ARCHITECT_OPENAI_MODEL' })
        }
    }
    if (config.plannerMode === 'oci-genai') {
        if (!config.ociProfile.trim()) {
            issues.push({ field: 'ociProfile', label: 'OCI Profile', variable: 'VITE_OCD_ARCHITECT_OCI_PROFILE' })
        }
        if (!config.ociRegion.trim()) {
            issues.push({ field: 'ociRegion', label: 'OCI Region', variable: 'VITE_OCD_ARCHITECT_OCI_REGION' })
        }
        if (!config.ociCompartmentId.trim()) {
            issues.push({ field: 'ociCompartmentId', label: 'GenAI Compartment', variable: 'VITE_OCD_ARCHITECT_OCI_COMPARTMENT_ID' })
        }
        if (!config.ociModelId.trim()) {
            issues.push({ field: 'ociModelId', label: 'OCI GenAI Model', variable: 'VITE_OCD_ARCHITECT_OCI_MODEL_ID' })
        }
    }
    const ready = issues.length === 0
    return {
        ready,
        label,
        issues,
        message: ready
            ? `${label} planner is ready.`
            : `${label} planner needs ${issues.map((issue) => issue.label).join(', ')}.`,
    }
}

export const resolveArchitectureAgentProviderConfig = (
    env: Record<string, string | undefined> = readViteEnv(),
): ArchitectureAgentProviderConfig => {
    const openAiEndpoint = envValue(env, 'VITE_OCD_ARCHITECT_OPENAI_ENDPOINT', 'VITE_OPENAI_ENDPOINT')
    const openAiModel = envValue(env, 'VITE_OCD_ARCHITECT_OPENAI_MODEL', 'VITE_OPENAI_MODEL')
    const ociProfile = envValue(env, 'VITE_OCD_ARCHITECT_OCI_PROFILE', 'VITE_OCI_PROFILE') || 'DEFAULT'
    const ociRegion = envValue(env, 'VITE_OCD_ARCHITECT_OCI_REGION', 'VITE_OCI_REGION')
    const ociCompartmentId = envValue(env, 'VITE_OCD_ARCHITECT_OCI_COMPARTMENT_ID', 'VITE_OCI_GENAI_COMPARTMENT_ID')
    const ociModelId = envValue(env, 'VITE_OCD_ARCHITECT_OCI_MODEL_ID', 'VITE_OCI_GENAI_MODEL_ID') || DEFAULT_OCI_GENAI_MODEL_ID
    const temperature = numberValue(env, DEFAULT_ARCHITECTURE_AGENT_TEMPERATURE, 0, 1, 'VITE_OCD_ARCHITECT_TEMPERATURE')
    const maxTokens = Math.round(numberValue(env, DEFAULT_ARCHITECTURE_AGENT_MAX_TOKENS, 256, 4000, 'VITE_OCD_ARCHITECT_MAX_TOKENS'))
    const requestedMode = envValue(env, 'VITE_OCD_ARCHITECT_PROVIDER', 'VITE_OCD_ARCHITECT_PLANNER') as ArchitecturePlannerMode
    const baseConfig = {
        plannerMode: 'local' as ArchitecturePlannerMode,
        openAiEndpoint,
        openAiModel,
        ociProfile,
        ociRegion,
        ociCompartmentId,
        ociModelId,
        temperature,
        maxTokens,
    }
    const inferredMode = isOciGenAiConfigured(baseConfig)
        ? 'oci-genai'
        : isOpenAiCompatibleConfigured(baseConfig)
            ? 'openai'
            : 'local'
    return {
        ...baseConfig,
        plannerMode: PLANNER_MODES.has(requestedMode) ? requestedMode : inferredMode,
    }
}
