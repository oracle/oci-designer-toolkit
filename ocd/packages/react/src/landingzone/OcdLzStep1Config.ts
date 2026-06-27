/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

/*
** TypeScript port of the LZNG `step1Config.js` service. Captures, normalizes,
** validates and serializes the Landing Zone Wizard's Step 1 base config into the
** `config.jsonnet` TLA consumed by the Operating Entities generator.
**
** The jsonnet builder template literals MUST stay byte-identical to LZNG so the
** generated output matches the reference app.
*/

import { findRegion, getRegionsForRealm, REALM_OPTIONS } from './OcdLzRegions'

export interface Environment {
    name: string
    securityZone: boolean
}

export interface Step1State {
    region: string
    regionShortName: string
    realm: string
    environments: Environment[]
}

export interface Step1Validation {
    value: Step1State
    errors: string[]
}

const DEFAULT_ENVIRONMENTS: Environment[] = [
    { name: 'prod', securityZone: true },
    { name: 'preprod', securityZone: false },
    { name: 'dev', securityZone: false },
]

export const DEFAULT_STEP1: Step1State = {
    region: 'eu-frankfurt-1',
    regionShortName: 'fra',
    realm: 'oc1',
    environments: DEFAULT_ENVIRONMENTS,
}

const ENV_NAME_RE = /^[A-Za-z][A-Za-z0-9_-]*$/
const JSONNET_IDENTIFIER_RE = /^[A-Za-z_][A-Za-z0-9_]*$/
const JSONNET_KEYWORDS = new Set<string>([
    'assert',
    'else',
    'error',
    'false',
    'for',
    'function',
    'if',
    'import',
    'importstr',
    'in',
    'local',
    'null',
    'tailstrict',
    'then',
    'self',
    'super',
    'true',
])

// Accepts the loose runtime shapes the original JS tolerated (string list,
// comma/newline separated string, legacy string entries, security-zone objects).
type EnvironmentsInput =
    | Array<string | Partial<Environment>>
    | string
    | null
    | undefined

interface Step1Input {
    region?: string
    regionShortName?: string
    realm?: string
    environments?: EnvironmentsInput
}

export function normalizeEnvironments(value: EnvironmentsInput): Environment[] {
    const raw: Array<string | Partial<Environment>> = Array.isArray(value)
        ? value
        : String(value || '').split(/[,\n]/)
    return raw
        .map((item): Environment => {
            if (item && typeof item === 'object') {
                return {
                    name: String(item.name || '').trim(),
                    securityZone: Boolean(item.securityZone),
                }
            }
            return {
                name: String(item).trim(),
                securityZone: false,
            }
        })
        .filter((item) => item.name)
}

export function normalizeStep1(input: Step1Input = {}): Step1State {
    return {
        region: String(input.region ?? DEFAULT_STEP1.region).trim(),
        regionShortName: String(input.regionShortName ?? DEFAULT_STEP1.regionShortName).trim(),
        realm: String(input.realm ?? DEFAULT_STEP1.realm).trim(),
        environments: normalizeEnvironments(input.environments ?? DEFAULT_STEP1.environments),
    }
}

export function validateStep1(input: Step1Input = {}): Step1Validation {
    const value = normalizeStep1(input)
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
    if (value.environments.length === 0) errors.push('At least one environment is required.')

    const seen = new Set<string>()
    for (const envConfig of value.environments) {
        const env = envConfig.name
        if (seen.has(env)) errors.push('Environment names must be unique.')
        seen.add(env)

        if (!ENV_NAME_RE.test(env)) {
            errors.push(`Environment "${env}" must start with a letter and contain only letters, numbers, underscores, or hyphens.`)
        }
    }

    return { value, errors }
}

function quoteJsonnet(value: string): string {
    return `'${String(value).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`
}

function formatJsonnetKey(value: string): string {
    const key = String(value)
    return JSONNET_IDENTIFIER_RE.test(key) && !JSONNET_KEYWORDS.has(key)
        ? key
        : quoteJsonnet(key)
}

export function serializeStep1Config(input: Step1Input = {}): string {
    const { value, errors } = validateStep1(input)
    if (errors.length > 0) {
        throw new Error(errors.join(' '))
    }

    const envLines = value.environments.map((env) => `    ${formatJsonnetKey(env.name)}: {},`).join('\n')
    const securityTargets = value.environments
        .filter((env) => env.securityZone)
        .map((env) => quoteJsonnet(env.name))
        .join(', ')
    return `{
  region: ${quoteJsonnet(value.region)},
  region_short_name: ${quoteJsonnet(value.regionShortName)},
  realm: ${quoteJsonnet(value.realm)},
  security_targets: [${securityTargets}],

  hub: {
    kind: 'hub_a',
    network: { vcn: '10.100.0.0/21' },
  },

  environments: {
${envLines}
  },
}
`
}
