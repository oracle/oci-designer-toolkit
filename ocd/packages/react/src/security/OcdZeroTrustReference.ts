export interface ZeroTrustControl {
    readonly principle: string
    readonly ociControls: readonly string[]
    readonly agenticExtension: string
    readonly evidence: readonly string[]
}

export interface ZeroTrustFlowStep {
    readonly title: string
    readonly summary: string
    readonly controls: readonly string[]
}

export interface AgentPromptTemplate {
    readonly label: string
    readonly prompt: string
}

export const zeroTrustFlowSteps: ZeroTrustFlowStep[] = [
    {
        title: 'Reasoning proposes',
        summary: 'The model plans actions inside an isolated sandbox with no standing privilege.',
        controls: ['OKE or Functions sandbox', 'Tool registry', 'Egress allowlist'],
    },
    {
        title: 'Policy decides',
        summary: 'A deterministic gate checks identity, data class, tool, destination, and approval tier.',
        controls: ['Functions policy gate', 'IAM policy', 'ZPR attributes'],
    },
    {
        title: 'Scoped identity executes',
        summary: 'Approved actions run once through short-lived resource principals and produce evidence.',
        controls: ['Dynamic groups', 'Vault', 'Audit and Logging'],
    },
]

export const zeroTrustControls: ZeroTrustControl[] = [
    {
        principle: 'Verify explicitly',
        ociControls: ['IAM', 'Identity Domains', 'MFA', 'Audit'],
        agenticExtension: 'Register each agent, tool, and request with cryptographic IDs and request IDs.',
        evidence: ['Sign-in logs', 'Agent lifecycle records', 'Policy decisions'],
    },
    {
        principle: 'Use least privilege',
        ociControls: ['IAM policies', 'Dynamic groups', 'Resource principals'],
        agenticExtension: 'Enforce least agency with tool allowlists, parameter validation, and scoped execution roles.',
        evidence: ['Policy files', 'Decision ledger', 'Execution role TTL'],
    },
    {
        principle: 'Assume breach',
        ociControls: ['Security Zones', 'ZPR', 'Private endpoints', 'Vault', 'Cloud Guard'],
        agenticExtension: 'Keep reasoning untrusted, mediate every action, and isolate runtime and network paths.',
        evidence: ['Denied operations', 'ZPR decisions', 'Sandbox logs', 'Incident cases'],
    },
    {
        principle: 'Protect data',
        ociControls: ['Data Safe', 'Vault', 'KMS', 'Object Storage policies'],
        agenticExtension: 'Require data-class checks before tool execution and block sensitive data exfiltration paths.',
        evidence: ['Data Safe findings', 'Key usage', 'Masking policies', 'Data access logs'],
    },
    {
        principle: 'Monitor continuously',
        ociControls: ['Logging', 'Monitoring', 'Events', 'Logging Analytics', 'Service Connector Hub'],
        agenticExtension: 'Stream action telemetry, policy decisions, and outcomes to the evidence lake and SOC.',
        evidence: ['SIEM events', 'Control dashboards', 'Cloud Guard problems'],
    },
]

export const agentPromptTemplates: AgentPromptTemplate[] = [
    {
        label: 'Agentic Zero Trust',
        prompt: 'Create an agentic Zero Trust OCI architecture where reasoning proposes actions, a policy gate decides, and scoped identities execute with Vault, Data Safe, Cloud Guard, Logging Analytics, and Service Connector evidence.',
    },
    {
        label: 'Secure OKE',
        prompt: 'Create a secure private OKE platform with ingress isolation, private worker and pod subnets, Vault, workload identity, logging, monitoring, and budget controls.',
    },
    {
        label: 'Three-tier app',
        prompt: 'Create a secure three tier OCI web application with public load balancing, private app servers, private database, logging, monitoring, and budget controls.',
    },
]
