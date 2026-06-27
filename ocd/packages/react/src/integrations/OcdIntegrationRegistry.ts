import {
    isOciGenAiConfigured,
    isOpenAiCompatibleConfigured,
    resolveArchitectureAgentProviderConfig,
} from '../architecture-agent/OcdArchitectureAgentConfig'

export type OcdIntegrationCategory = 'architecture-source' | 'terraform' | 'discovery' | 'ai' | 'governance'
export type OcdIntegrationRuntime = 'local-backend' | 'electron' | 'external-api' | 'static-reference'
export type OcdIntegrationStatus = 'available' | 'configured' | 'needs-config' | 'planned'
export type OcdIntegrationDisplayPage = 'agent' | 'classic' | 'designer' | 'discovery' | 'governance' | 'landingzone' | 'plan' | 'terraform'
export type OcdIntegrationActionKind = 'navigate' | 'external-link' | 'update-source'
export type OcdIntegrationHealthCheckKind = 'backend' | 'source-status' | 'configuration' | 'static'

export interface OcdIntegrationAction {
    readonly id: string
    readonly label: string
    readonly kind: OcdIntegrationActionKind
    readonly displayPage?: OcdIntegrationDisplayPage
    readonly href?: string
}

export interface OcdIntegrationHealthCheck {
    readonly id: string
    readonly label: string
    readonly kind: OcdIntegrationHealthCheckKind
    readonly required: boolean
}

export interface OcdIntegrationDefinition {
    readonly id: string
    readonly name: string
    readonly vendor: string
    readonly category: OcdIntegrationCategory
    readonly runtime: OcdIntegrationRuntime
    readonly status: OcdIntegrationStatus
    readonly summary: string
    readonly capabilities: readonly string[]
    readonly sourceKey?: string
    readonly healthChecks: readonly OcdIntegrationHealthCheck[]
    readonly actions: readonly OcdIntegrationAction[]
}

export const ocdIntegrationCategories: Record<OcdIntegrationCategory, string> = {
    'architecture-source': 'Architecture sources',
    terraform: 'Terraform and deployment',
    discovery: 'Discovery',
    ai: 'AI architecture',
    governance: 'Governance',
}

export const ocdIntegrationStatusLabels: Record<OcdIntegrationStatus, string> = {
    available: 'Available',
    configured: 'Configured',
    'needs-config': 'Needs config',
    planned: 'Planned',
}

export const ocdIntegrationRuntimeLabels: Record<OcdIntegrationRuntime, string> = {
    'local-backend': 'Local backend',
    electron: 'Desktop bridge',
    'external-api': 'External API',
    'static-reference': 'Static reference',
}

export const resolveOcdIntegrations = (
    env?: Record<string, string | undefined>,
): readonly OcdIntegrationDefinition[] => {
    const architectureAgentConfig = resolveArchitectureAgentProviderConfig(env)
    const ociGenAiConfigured = isOciGenAiConfigured(architectureAgentConfig)
    const openAiConfigured = isOpenAiCompatibleConfigured(architectureAgentConfig)
    return [
    {
        id: 'landing-zone-next-gen',
        name: 'Landing Zone Next-Gen',
        vendor: 'Oracle / project add-on',
        category: 'architecture-source',
        runtime: 'local-backend',
        status: 'configured',
        sourceKey: 'landing-zone-next-gen',
        summary: 'Build an editable OCI architecture from the Landing Zone wizard, then reconcile frames, relations, and Terraform preview.',
        capabilities: ['Wizard-driven OCI architecture', 'Add-on source updates', 'Designer handoff'],
        healthChecks: [
            { id: 'backend', label: 'Local backend', kind: 'backend', required: true },
            { id: 'source', label: 'Source status', kind: 'source-status', required: false },
        ],
        actions: [
            { id: 'open-lz', label: 'Open wizard', kind: 'navigate', displayPage: 'landingzone' },
            { id: 'update-lzng', label: 'Update source', kind: 'update-source' },
        ],
    },
    {
        id: 'oci-operating-entities',
        name: 'OCI Operating Entities',
        vendor: 'Oracle Landing Zones',
        category: 'architecture-source',
        runtime: 'local-backend',
        status: 'configured',
        sourceKey: 'operating-entities',
        summary: 'Vendored Jsonnet source for official operating-entity Landing Zone generation.',
        capabilities: ['Pinned upstream source', 'Jsonnet generation', 'Update status tracking'],
        healthChecks: [
            { id: 'backend', label: 'Local backend', kind: 'backend', required: true },
            { id: 'source', label: 'Source status', kind: 'source-status', required: false },
        ],
        actions: [
            { id: 'open-sources', label: 'View sources', kind: 'navigate', displayPage: 'landingzone' },
        ],
    },
    {
        id: 'terraform-import',
        name: 'Terraform Import',
        vendor: 'OCD',
        category: 'terraform',
        runtime: 'electron',
        status: 'available',
        summary: 'Import existing Terraform modules and normalize them into editable OCI resource models.',
        capabilities: ['HCL ingestion', 'Model mapping', 'Designer layout'],
        healthChecks: [
            { id: 'desktop', label: 'Desktop bridge', kind: 'backend', required: true },
        ],
        actions: [
            { id: 'open-designer', label: 'Open designer', kind: 'navigate', displayPage: 'designer' },
        ],
    },
    {
        id: 'resource-manager-plan',
        name: 'Resource Manager Plan Review',
        vendor: 'Oracle Cloud Infrastructure',
        category: 'terraform',
        runtime: 'electron',
        status: 'needs-config',
        summary: 'Create plan-only jobs, inspect Terraform output, and require an explicit apply step.',
        capabilities: ['PLAN-first workflow', 'Job polling', 'Plan output preview'],
        healthChecks: [
            { id: 'desktop', label: 'Desktop bridge', kind: 'backend', required: true },
            { id: 'oci-profile', label: 'OCI profile and compartment', kind: 'configuration', required: true },
        ],
        actions: [
            { id: 'open-plan', label: 'Open plan review', kind: 'navigate', displayPage: 'plan' },
        ],
    },
    {
        id: 'oci-discovery',
        name: 'OCI Discovery Workbench',
        vendor: 'Oracle Cloud Infrastructure',
        category: 'discovery',
        runtime: 'local-backend',
        status: 'available',
        summary: 'Query OCI resources through the local backend and turn discovered inventory into architecture prompts or diagrams.',
        capabilities: ['Profile and region discovery', 'Inventory snapshot', 'Agent prompt brief'],
        healthChecks: [
            { id: 'backend', label: 'Local backend', kind: 'backend', required: true },
            { id: 'oci-profile', label: 'OCI profile and region', kind: 'configuration', required: false },
        ],
        actions: [
            { id: 'open-discovery', label: 'Open discovery', kind: 'navigate', displayPage: 'discovery' },
        ],
    },
    {
        id: 'oci-genai-architect',
        name: 'OCI GenAI Architecture Agent',
        vendor: 'Oracle Cloud Infrastructure',
        category: 'ai',
        runtime: 'local-backend',
        status: ociGenAiConfigured ? 'configured' : 'needs-config',
        summary: 'Use OCI Generative AI through the backend bridge, with redacted prompts and validated Architecture Plan output.',
        capabilities: ['OCI SDK profile auth', 'Prompt redaction', 'JSON plan contract', 'Designer apply gate'],
        healthChecks: [
            { id: 'backend', label: 'Local backend', kind: 'backend', required: true },
            { id: 'genai', label: ociGenAiConfigured ? 'OCI GenAI variables configured' : 'Set OCI GenAI profile, region, compartment, model', kind: 'configuration', required: true },
        ],
        actions: [
            { id: 'open-agent', label: 'Open agent', kind: 'navigate', displayPage: 'agent' },
        ],
    },
    {
        id: 'openai-compatible-architect',
        name: 'OpenAI-Compatible Architecture Agent',
        vendor: 'OpenAI-compatible endpoint',
        category: 'ai',
        runtime: 'external-api',
        status: openAiConfigured ? 'configured' : 'needs-config',
        summary: 'Use a Chat Completions-compatible endpoint for Architecture Plan generation. API keys stay in memory unless the operator enters them for the session.',
        capabilities: ['Chat Completions contract', 'JSON plan validation', 'Designer apply gate'],
        healthChecks: [
            { id: 'openai-compatible', label: openAiConfigured ? 'Endpoint and model configured' : 'Set endpoint and model', kind: 'configuration', required: true },
        ],
        actions: [
            { id: 'open-agent-openai', label: 'Open agent', kind: 'navigate', displayPage: 'agent' },
        ],
    },
    {
        id: 'governance-checks',
        name: 'Governance and Compliance Checks',
        vendor: 'OCD',
        category: 'governance',
        runtime: 'static-reference',
        status: 'available',
        summary: 'Run local design checks for security posture, reachability, and remediation guidance.',
        capabilities: ['Offline validation', 'Reachability analysis', 'Safe remediation actions'],
        healthChecks: [
            { id: 'offline', label: 'Offline checks', kind: 'static', required: false },
        ],
        actions: [
            { id: 'open-governance', label: 'Open governance', kind: 'navigate', displayPage: 'governance' },
        ],
    },
]}

export const ocdIntegrations: readonly OcdIntegrationDefinition[] = resolveOcdIntegrations()

export const getOcdIntegrationSummary = (integrations: readonly OcdIntegrationDefinition[] = ocdIntegrations) => ({
    total: integrations.length,
    configured: integrations.filter((integration) => integration.status === 'configured').length,
    needsConfig: integrations.filter((integration) => integration.status === 'needs-config').length,
    localBackend: integrations.filter((integration) => integration.runtime === 'local-backend').length,
})
