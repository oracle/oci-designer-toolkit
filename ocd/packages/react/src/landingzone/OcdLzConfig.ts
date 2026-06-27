/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

/*
** Fuller Landing Zone Wizard config model (Phase 2). Extends the Phase 1
** Foundation (`OcdLzStep1Config`) into a `LandingZoneConfig` that covers:
**
**   - hub.kind (hub_a/hub_b/hub_c/hub_e) + hub.network.vcn
**   - per-environment spoke `shared_project_network.network.vcn`
**   - per-environment named `projects`
**   - per-environment platform `extension`s (oke_simple / exacc / exacs)
**
** Serialization emits a jsonnet config object that the vendored Operating
** Entities `landing_zone_multi.jsonnet` accepts. The schema keys are taken
** verbatim from `oe/gen/config.libsonnet`, `oe/gen/topology.libsonnet` and the
** extension `published_profiles.libsonnet` files (the ground-truth examples):
**
**   {
**     region, region_short_name, realm, security_targets: [...],
**     hub: { kind, network: { vcn } },
**     environments: {
**       <env>: {
**         shared_project_network: { network: { vcn } },   // optional (spoke)
**         projects: { <proj>: {} },                        // optional
**         platforms: {                                     // optional
**           <plat>: {
**             network: { vcn },                            // per extension network_mode
**             extension: { type, params },
**           },
**         },
**       },
**     },
**   }
**
** Backward compatibility: a Phase 1 `Step1State` upgrades cleanly into a
** `LandingZoneConfig` via `fromStep1` / `upgradeConfig`, and the Foundation
** sub-shape (region/realm/environment names + security zones) is preserved.
*/

import { findRegion, getRegionsForRealm, REALM_OPTIONS } from './OcdLzRegions'
import { Environment, Step1State } from './OcdLzStep1Config'

// ---------------------------------------------------------------------------
// Hub kinds (mirrors oe/gen/config.libsonnet `hub_subnet_order`).
// ---------------------------------------------------------------------------
export type HubKind = 'hub_a' | 'hub_b' | 'hub_c' | 'hub_e'

export interface HubKindOption {
    id: HubKind
    label: string
    description: string
    subnets: string[]
}

// Subnet orders + firewall topology one-liners straight from config.libsonnet.
export const HUB_KIND_OPTIONS: HubKindOption[] = [
    {
        id: 'hub_a',
        label: 'Hub A — Dual firewall (DMZ + Internal)',
        description: 'Two OCI Network Firewalls front and back of the LB for north-south and east-west inspection.',
        subnets: ['fw-dmz', 'lb', 'fw-int', 'mgmt', 'mon', 'dns'],
    },
    {
        id: 'hub_b',
        label: 'Hub B — Single firewall',
        description: 'One OCI Network Firewall inline with the load balancer for consolidated inspection.',
        subnets: ['lb', 'fw', 'mgmt', 'mon', 'dns'],
    },
    {
        id: 'hub_c',
        label: 'Hub C — Third-party firewall (NLB-fronted)',
        description: 'Untrust/trust subnets front an NLB-fronted third-party firewall appliance pair.',
        subnets: ['untrust', 'trust', 'lb', 'mgmt', 'mon', 'dns'],
    },
    {
        id: 'hub_e',
        label: 'Hub E — No firewall (DRG routing)',
        description: 'DRG-only routing with no firewall; load balancer plus shared management services.',
        subnets: ['lb', 'mgmt', 'mon', 'dns'],
    },
]

// Spoke subnet names (config.libsonnet `spoke_subnet_names`).
export const SPOKE_SUBNET_NAMES = ['web', 'app', 'db', 'infra'] as const

// ---------------------------------------------------------------------------
// Workload extensions (extension_registry in landing_zone.libsonnet).
// network_mode taken from each extension's metadata / published_profiles.
// ---------------------------------------------------------------------------
export type ExtensionType = 'oke_simple' | 'exacc' | 'exacs'
export type ExtensionNetworkMode = 'required' | 'forbidden' | 'optional'

export interface ExtensionTemplate {
    type: ExtensionType
    label: string
    platformName: string
    networkMode: ExtensionNetworkMode
    defaultVcn: string
    adds: string
}

export const EXTENSION_TEMPLATES: ExtensionTemplate[] = [
    {
        type: 'oke_simple',
        label: 'OKE (simple)',
        platformName: 'oke',
        networkMode: 'required',
        defaultVcn: '10.0.80.0/21',
        adds: 'OKE cluster compartment + dedicated VCN (api/workers/services) and IAM/observability.',
    },
    {
        type: 'exacs',
        label: 'ExaDB-D / ExaCS',
        platformName: 'exacs',
        networkMode: 'optional',
        defaultVcn: '10.0.24.0/21',
        adds: 'Exadata Cloud Service platform compartment, optional dedicated VCN, DB project compartments + notifications.',
    },
    {
        type: 'exacc',
        label: 'ExaDB-C@C / ExaCC',
        platformName: 'exacc',
        networkMode: 'forbidden',
        defaultVcn: '',
        adds: 'Exadata Cloud@Customer platform compartment, DB project compartments + notification topics (no VCN).',
    },
]

export function findExtensionTemplate(type: ExtensionType): ExtensionTemplate | undefined {
    return EXTENSION_TEMPLATES.find((tpl) => tpl.type === type)
}

// ---------------------------------------------------------------------------
// Config model
// ---------------------------------------------------------------------------
export interface PlatformExtension {
    /** platform key under environments.<env>.platforms.<name> (e.g. 'oke'). */
    platformName: string
    type: ExtensionType
    /** Dedicated platform VCN CIDR; empty when network_mode is 'forbidden'. */
    vcn: string
    /** Project compartment names attached to the DB extension (exacc/exacs). */
    projects: string[]
}

export interface LzEnvironment {
    name: string
    securityZone: boolean
    /** Spoke shared-project-network VCN CIDR; empty means no spoke (hub-only env). */
    spokeVcn: string
    /** Named workload project compartments under this environment. */
    projects: string[]
    /** Attached platform extensions for this environment. */
    platforms: PlatformExtension[]
}

export interface LandingZoneConfig {
    region: string
    regionShortName: string
    realm: string
    hubKind: HubKind
    hubVcn: string
    environments: LzEnvironment[]
}

export interface LandingZoneValidation {
    value: LandingZoneConfig
    errors: string[]
}

export const DEFAULT_HUB_VCN = '10.100.0.0/21'

// Deterministic default spoke CIDRs so each environment is distinct out of the box.
const DEFAULT_SPOKE_VCNS = ['10.0.64.0/21', '10.0.128.0/21', '10.0.192.0/21', '10.1.0.0/21', '10.1.64.0/21']

export function defaultSpokeVcn(index: number): string {
    return DEFAULT_SPOKE_VCNS[index] || `10.${2 + index}.0.0/21`
}

export const DEFAULT_CONFIG: LandingZoneConfig = {
    region: 'eu-frankfurt-1',
    regionShortName: 'fra',
    realm: 'oc1',
    hubKind: 'hub_a',
    hubVcn: DEFAULT_HUB_VCN,
    environments: [
        { name: 'prod', securityZone: true, spokeVcn: defaultSpokeVcn(0), projects: ['proj1'], platforms: [] },
        { name: 'preprod', securityZone: false, spokeVcn: defaultSpokeVcn(1), projects: ['proj1'], platforms: [] },
        { name: 'dev', securityZone: false, spokeVcn: defaultSpokeVcn(2), projects: ['proj1'], platforms: [] },
    ],
}

// ---------------------------------------------------------------------------
// Validation helpers
// ---------------------------------------------------------------------------
const ENV_NAME_RE = /^[A-Za-z][A-Za-z0-9_-]*$/
const PROJECT_NAME_RE = /^[A-Za-z][A-Za-z0-9_-]*$/
const CIDR_RE = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})\/(\d{1,2})$/

export function isValidCidr(value: string): boolean {
    const match = CIDR_RE.exec(value.trim())
    if (!match) return false
    const octets = [match[1], match[2], match[3], match[4]].map((part) => Number(part))
    if (octets.some((octet) => octet < 0 || octet > 255)) return false
    const prefix = Number(match[5])
    return prefix >= 8 && prefix <= 30
}

// ---------------------------------------------------------------------------
// Backward compatibility: Phase 1 Step1State <-> LandingZoneConfig.
// ---------------------------------------------------------------------------
export function fromStep1(step1: Step1State): LandingZoneConfig {
    return {
        region: step1.region,
        regionShortName: step1.regionShortName,
        realm: step1.realm,
        hubKind: 'hub_a',
        hubVcn: DEFAULT_HUB_VCN,
        environments: step1.environments.map((env: Environment, index): LzEnvironment => ({
            name: env.name,
            securityZone: env.securityZone,
            spokeVcn: defaultSpokeVcn(index),
            projects: ['proj1'],
            platforms: [],
        })),
    }
}

interface LzEnvironmentInput {
    name?: unknown
    securityZone?: unknown
    spokeVcn?: unknown
    projects?: unknown
    platforms?: unknown
}

interface PlatformInput {
    platformName?: unknown
    type?: unknown
    vcn?: unknown
    projects?: unknown
}

export interface LandingZoneConfigInput {
    region?: unknown
    regionShortName?: unknown
    realm?: unknown
    hubKind?: unknown
    hubVcn?: unknown
    environments?: unknown
}

function asString(value: unknown, fallback: string): string {
    return value === undefined || value === null ? fallback : String(value).trim()
}

function asStringList(value: unknown): string[] {
    if (!Array.isArray(value)) return []
    return value.map((item) => String(item).trim()).filter((item) => item.length > 0)
}

function normalizePlatform(input: PlatformInput): PlatformExtension | null {
    const type = String(input.type || '') as ExtensionType
    const template = findExtensionTemplate(type)
    if (!template) return null
    return {
        platformName: asString(input.platformName, template.platformName) || template.platformName,
        type,
        vcn: template.networkMode === 'forbidden' ? '' : asString(input.vcn, template.defaultVcn),
        projects: asStringList(input.projects),
    }
}

export function normalizeConfig(input: LandingZoneConfigInput = {}): LandingZoneConfig {
    const hubKind = (HUB_KIND_OPTIONS.some((opt) => opt.id === input.hubKind) ? input.hubKind : DEFAULT_CONFIG.hubKind) as HubKind
    const rawEnvs = Array.isArray(input.environments) ? (input.environments as LzEnvironmentInput[]) : DEFAULT_CONFIG.environments
    const environments = rawEnvs
        .map((env, index): LzEnvironment => ({
            name: asString(env.name, ''),
            securityZone: Boolean(env.securityZone),
            spokeVcn: asString(env.spokeVcn, defaultSpokeVcn(index)),
            projects: asStringList(env.projects),
            platforms: Array.isArray(env.platforms)
                ? (env.platforms as PlatformInput[]).map(normalizePlatform).filter((plat): plat is PlatformExtension => plat !== null)
                : [],
        }))
        .filter((env) => env.name.length > 0)

    return {
        region: asString(input.region, DEFAULT_CONFIG.region),
        regionShortName: asString(input.regionShortName, DEFAULT_CONFIG.regionShortName),
        realm: asString(input.realm, DEFAULT_CONFIG.realm),
        hubKind,
        hubVcn: asString(input.hubVcn, DEFAULT_CONFIG.hubVcn),
        environments: environments.length > 0 ? environments : DEFAULT_CONFIG.environments,
    }
}

/** Hydrate a persisted draft of unknown vintage (Phase 1 or Phase 2) into the full model. */
export function upgradeConfig(raw: unknown): LandingZoneConfig {
    if (raw && typeof raw === 'object') {
        const candidate = raw as Record<string, unknown>
        // Phase 1 drafts carry `regionShortName` + `environments[].name/securityZone`
        // but no `hubKind`; treat them as Step1 unless hubKind is present.
        if (!('hubKind' in candidate) && Array.isArray(candidate.environments)) {
            const envs = candidate.environments as Array<Record<string, unknown>>
            const looksPhase1 = envs.every((env) => !('spokeVcn' in env) && !('projects' in env))
            if (looksPhase1) {
                return fromStep1({
                    region: asString(candidate.region, DEFAULT_CONFIG.region),
                    regionShortName: asString(candidate.regionShortName, DEFAULT_CONFIG.regionShortName),
                    realm: asString(candidate.realm, DEFAULT_CONFIG.realm),
                    environments: envs.map((env) => ({
                        name: asString(env.name, ''),
                        securityZone: Boolean(env.securityZone),
                    })),
                })
            }
        }
    }
    return normalizeConfig(raw as LandingZoneConfigInput)
}

export function validateConfig(input: LandingZoneConfigInput = {}): LandingZoneValidation {
    const value = normalizeConfig(input)
    const errors: string[] = []

    if (!value.region) errors.push('Region is required.')
    if (!value.regionShortName) errors.push('Region short name is required.')
    if (!value.realm) errors.push('Realm is required.')
    if (value.realm && !REALM_OPTIONS.some((realm) => realm.id === value.realm)) {
        errors.push(`Realm must be one of: ${REALM_OPTIONS.map((realm) => realm.id).join(', ')}.`)
    }
    if (value.realm && value.region && getRegionsForRealm(value.realm).length > 0 && !findRegion(value.realm, value.region)) {
        errors.push('Region must belong to the selected realm.')
    }
    if (!HUB_KIND_OPTIONS.some((opt) => opt.id === value.hubKind)) {
        errors.push('Hub kind must be one of: hub_a, hub_b, hub_c, hub_e.')
    }
    if (!isValidCidr(value.hubVcn)) errors.push(`Hub VCN "${value.hubVcn}" is not a valid CIDR.`)

    if (value.environments.length === 0) errors.push('At least one environment is required.')

    const seen = new Set<string>()
    for (const env of value.environments) {
        if (seen.has(env.name)) errors.push('Environment names must be unique.')
        seen.add(env.name)
        if (!ENV_NAME_RE.test(env.name)) {
            errors.push(`Environment "${env.name}" must start with a letter and contain only letters, numbers, underscores, or hyphens.`)
        }
        if (env.spokeVcn && !isValidCidr(env.spokeVcn)) {
            errors.push(`Environment "${env.name}" spoke VCN "${env.spokeVcn}" is not a valid CIDR.`)
        }
        const projSeen = new Set<string>()
        for (const proj of env.projects) {
            if (projSeen.has(proj)) errors.push(`Environment "${env.name}" has duplicate project "${proj}".`)
            projSeen.add(proj)
            if (!PROJECT_NAME_RE.test(proj)) {
                errors.push(`Project "${proj}" in "${env.name}" must start with a letter and contain only letters, numbers, underscores, or hyphens.`)
            }
        }
        const platSeen = new Set<string>()
        for (const plat of env.platforms) {
            if (platSeen.has(plat.platformName)) {
                errors.push(`Environment "${env.name}" has duplicate platform "${plat.platformName}".`)
            }
            platSeen.add(plat.platformName)
            const template = findExtensionTemplate(plat.type)
            if (!template) {
                errors.push(`Unknown platform extension "${plat.type}" in "${env.name}".`)
                continue
            }
            if (template.networkMode === 'required' && !isValidCidr(plat.vcn)) {
                errors.push(`Platform "${plat.platformName}" in "${env.name}" requires a valid VCN CIDR (got "${plat.vcn}").`)
            }
            if (template.networkMode === 'optional' && plat.vcn && !isValidCidr(plat.vcn)) {
                errors.push(`Platform "${plat.platformName}" in "${env.name}" VCN "${plat.vcn}" is not a valid CIDR.`)
            }
            for (const proj of plat.projects) {
                if (!env.projects.includes(proj)) {
                    errors.push(`Platform "${plat.platformName}" in "${env.name}" references unknown project "${proj}".`)
                }
            }
        }
    }

    return { value, errors }
}

// ---------------------------------------------------------------------------
// Per-step validation: returns true when the current step's required fields are
// well-formed enough to advance. Cheap, derived from the full validation pass.
// ---------------------------------------------------------------------------
export function isStepValid(stepIndex: number, input: LandingZoneConfigInput = {}): boolean {
    const value = normalizeConfig(input)
    switch (stepIndex) {
        case 0: {
            // Foundation: region/realm + at least one well-named environment.
            if (!value.region || !value.realm || !value.regionShortName) return false
            if (value.environments.length === 0) return false
            const names = new Set<string>()
            for (const env of value.environments) {
                if (!ENV_NAME_RE.test(env.name) || names.has(env.name)) return false
                names.add(env.name)
            }
            return true
        }
        case 1:
            // Hub Network: valid hub kind + hub VCN.
            return HUB_KIND_OPTIONS.some((opt) => opt.id === value.hubKind) && isValidCidr(value.hubVcn)
        case 2:
            // Projects: any well-formed spoke VCN + valid project names.
            for (const env of value.environments) {
                if (env.spokeVcn && !isValidCidr(env.spokeVcn)) return false
                for (const proj of env.projects) {
                    if (!PROJECT_NAME_RE.test(proj)) return false
                }
            }
            return true
        case 3:
            // Platform Templates: attached platforms must have valid networks.
            for (const env of value.environments) {
                for (const plat of env.platforms) {
                    const template = findExtensionTemplate(plat.type)
                    if (!template) return false
                    if (template.networkMode === 'required' && !isValidCidr(plat.vcn)) return false
                    if (template.networkMode === 'optional' && plat.vcn && !isValidCidr(plat.vcn)) return false
                }
            }
            return true
        default:
            return validateConfig(input).errors.length === 0
    }
}

// ---------------------------------------------------------------------------
// Serialization to jsonnet (config.libsonnet schema).
// ---------------------------------------------------------------------------
const JSONNET_IDENTIFIER_RE = /^[A-Za-z_][A-Za-z0-9_]*$/
const JSONNET_KEYWORDS = new Set<string>([
    'assert', 'else', 'error', 'false', 'for', 'function', 'if', 'import', 'importstr',
    'in', 'local', 'null', 'tailstrict', 'then', 'self', 'super', 'true',
])

function quoteJsonnet(value: string): string {
    return `'${String(value).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`
}

function formatJsonnetKey(value: string): string {
    return JSONNET_IDENTIFIER_RE.test(value) && !JSONNET_KEYWORDS.has(value) ? value : quoteJsonnet(value)
}

function serializeProjects(projects: string[], indent: string): string {
    if (projects.length === 0) return '{}'
    const lines = projects.map((proj) => `${indent}  ${formatJsonnetKey(proj)}: {},`).join('\n')
    return `{\n${lines}\n${indent}}`
}

function serializeExtensionParams(plat: PlatformExtension, indent: string): string {
    const lines: string[] = []
    const inner = `${indent}    `
    if (plat.type === 'oke_simple') {
        lines.push(`${inner}kubernetes_version: 'v1.35.2',`)
        lines.push(`${inner}services_cidr: '10.96.0.0/16',`)
        lines.push(`${inner}api_endpoint_allowed_cidrs: ['10.0.1.0/24'],`)
    } else if (plat.type === 'exacc') {
        if (plat.projects.length > 0) {
            lines.push(`${inner}project_db_compartments: [${plat.projects.map(quoteJsonnet).join(', ')}],`)
        }
        lines.push(`${inner}notification_emails: {`)
        lines.push(`${inner}  default: ['exacc-platform-team@example.com'],`)
        lines.push(`${inner}  projects: ['exacc-project-team@example.com'],`)
        lines.push(`${inner}},`)
    } else {
        // exacs
        if (plat.projects.length > 0) {
            lines.push(`${inner}project_db_compartments: [${plat.projects.map(quoteJsonnet).join(', ')}],`)
        }
        lines.push(`${inner}notification_emails: {`)
        lines.push(`${inner}  default: ['exacs-platform-team@example.com'],`)
        lines.push(`${inner}  projects: ['exacs-project-team@example.com'],`)
        lines.push(`${inner}},`)
    }
    return lines.join('\n')
}

function serializePlatforms(platforms: PlatformExtension[], indent: string): string | null {
    if (platforms.length === 0) return null
    const lines = platforms.map((plat) => {
        const template = findExtensionTemplate(plat.type)
        const hasNetwork = template ? template.networkMode !== 'forbidden' && Boolean(plat.vcn) : Boolean(plat.vcn)
        const body: string[] = []
        if (hasNetwork) {
            body.push(`${indent}    network: { vcn: ${quoteJsonnet(plat.vcn)} },`)
        }
        body.push(`${indent}    extension: {`)
        body.push(`${indent}      type: ${quoteJsonnet(plat.type)},`)
        body.push(`${indent}      params: {`)
        body.push(serializeExtensionParams(plat, indent))
        body.push(`${indent}      },`)
        body.push(`${indent}    },`)
        return `${indent}  ${formatJsonnetKey(plat.platformName)}: {\n${body.join('\n')}\n${indent}  },`
    })
    return `{\n${lines.join('\n')}\n${indent}}`
}

function serializeEnvironment(env: LzEnvironment): string {
    const indent = '    '
    const lines: string[] = []
    if (env.spokeVcn) {
        lines.push(`${indent}  shared_project_network: { network: { vcn: ${quoteJsonnet(env.spokeVcn)} } },`)
    }
    lines.push(`${indent}  projects: ${serializeProjects(env.projects, `${indent}  `)},`)
    const platforms = serializePlatforms(env.platforms, `${indent}  `)
    if (platforms) {
        lines.push(`${indent}  platforms: ${platforms},`)
    }
    return `${indent}${formatJsonnetKey(env.name)}: {\n${lines.join('\n')}\n${indent}},`
}

export function serializeLandingZoneConfig(input: LandingZoneConfigInput = {}): string {
    const { value, errors } = validateConfig(input)
    if (errors.length > 0) {
        throw new Error(errors.join(' '))
    }

    const securityTargets = value.environments
        .filter((env) => env.securityZone)
        .map((env) => quoteJsonnet(env.name))
        .join(', ')
    const envBlocks = value.environments.map(serializeEnvironment).join('\n')

    return `{
  region: ${quoteJsonnet(value.region)},
  region_short_name: ${quoteJsonnet(value.regionShortName)},
  realm: ${quoteJsonnet(value.realm)},
  security_targets: [${securityTargets}],

  hub: {
    kind: ${quoteJsonnet(value.hubKind)},
    network: { vcn: ${quoteJsonnet(value.hubVcn)} },
  },

  environments: {
${envBlocks}
  },
}
`
}
