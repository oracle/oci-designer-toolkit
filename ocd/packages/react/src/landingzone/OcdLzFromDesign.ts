/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

/*
** Brownfield bridge: derive an editable Landing Zone wizard `LandingZoneConfig`
** from an arbitrary imported OcdDesign (e.g. existing Terraform or generated
** LZ JSON that did NOT come from the wizard, so it has no persisted config).
**
** The network topology is the signal: the VCN with gateways/DRG attached (or
** named "hub") becomes the hub; every other VCN becomes a spoke environment.
** Region/realm fall back to defaults when not derivable. Missing/invalid CIDRs
** fall back to the wizard's deterministic defaults so the result is always a
** valid, immediately-editable config.
*/

import {
    DEFAULT_CONFIG,
    DEFAULT_HUB_VCN,
    HubKind,
    LandingZoneConfig,
    LzEnvironment,
    defaultSpokeVcn,
    isValidCidr,
} from './OcdLzConfig'
import { LZ_CONFIG_KEY, LZ_ORIGIN_KEY } from './OcdLzToModel'

type ResourceBag = Record<string, any[]> | undefined

interface DesignLike {
    model?: { oci?: { resources?: ResourceBag } }
}

const list = (resources: ResourceBag, key: string): any[] =>
    Array.isArray(resources?.[key]) ? (resources as Record<string, any[]>)[key] : []

const cidrOf = (resource: any): string | undefined => {
    const single = typeof resource?.cidr_block === 'string' ? resource.cidr_block : undefined
    if (single && isValidCidr(single)) return single
    const first = Array.isArray(resource?.cidr_blocks) ? resource.cidr_blocks.find((c: unknown) => typeof c === 'string' && isValidCidr(c)) : undefined
    return first
}

const ENV_SUFFIXES = /[-_ ]?(vcn|spoke|network|net|landing[-_ ]?zone)$/i

/** Reduce a VCN display name to a wizard-legal environment name. */
export function environmentNameFromVcn(displayName: string, index: number): string {
    const base = String(displayName || '').trim().replace(ENV_SUFFIXES, '')
    const cleaned = base.replace(/[^A-Za-z0-9_-]+/g, '-').replace(/^-+|-+$/g, '')
    if (cleaned && /^[A-Za-z]/.test(cleaned)) return cleaned.toLowerCase()
    return `env${index + 1}`
}

/** Heuristic hub: a VCN with a gateway/DRG attached, else one named "hub", else the first. */
function pickHubVcnId(vcns: any[], resources: ResourceBag): string | undefined {
    if (vcns.length === 0) return undefined
    const gatewayKeys = ['internet_gateway', 'nat_gateway', 'service_gateway', 'drg_attachment', 'local_peering_gateway']
    const vcnIdsWithGateway = new Set<string>()
    for (const key of gatewayKeys) {
        for (const gateway of list(resources, key)) {
            const vcnId = gateway?.vcnId || gateway?.vcn_id
            if (typeof vcnId === 'string') vcnIdsWithGateway.add(vcnId)
        }
    }
    const byGateway = vcns.find((vcn) => typeof vcn?.id === 'string' && vcnIdsWithGateway.has(vcn.id))
    if (byGateway) return byGateway.id
    const byName = vcns.find((vcn) => /hub/i.test(String(vcn?.displayName || '')))
    if (byName) return byName.id ?? byName.displayName
    return vcns[0]?.id ?? vcns[0]?.displayName
}

export function deriveLandingZoneConfig(design: DesignLike): LandingZoneConfig {
    const resources = design?.model?.oci?.resources
    const vcns = list(resources, 'vcn')

    if (vcns.length === 0) {
        // No network to adopt — hand back the wizard default but with no spokes,
        // so the user starts from a clean, valid foundation.
        return { ...DEFAULT_CONFIG, environments: [] }
    }

    const hubId = pickHubVcnId(vcns, resources)
    const hubVcnResource = vcns.find((vcn) => (vcn?.id ?? vcn?.displayName) === hubId) ?? vcns[0]
    const hubVcn = cidrOf(hubVcnResource) ?? DEFAULT_HUB_VCN
    const hubKind: HubKind = (DEFAULT_CONFIG.hubKind)

    const seenNames = new Set<string>()
    const environments: LzEnvironment[] = vcns
        .filter((vcn) => (vcn?.id ?? vcn?.displayName) !== (hubVcnResource?.id ?? hubVcnResource?.displayName))
        .map((vcn, index): LzEnvironment => {
            let name = environmentNameFromVcn(vcn?.displayName, index)
            while (seenNames.has(name)) name = `${name}-${index + 1}`
            seenNames.add(name)
            return {
                name,
                securityZone: false,
                spokeVcn: cidrOf(vcn) ?? defaultSpokeVcn(index),
                projects: [],
                platforms: [],
            }
        })

    return {
        region: DEFAULT_CONFIG.region,
        regionShortName: DEFAULT_CONFIG.regionShortName,
        realm: DEFAULT_CONFIG.realm,
        hubKind,
        hubVcn,
        environments,
    }
}

interface AdoptableDesign {
    userDefined?: Record<string, unknown>
    model?: { oci?: { resources?: ResourceBag } }
    [key: string]: unknown
}

/**
 * Adopt an arbitrary imported design (Terraform / LZ JSON) into the Landing Zone
 * wizard: derive a `LandingZoneConfig` from its topology and stamp it onto the
 * design's `userDefined` under the same keys the wizard itself uses, so the
 * imported design becomes editable in the wizard and eligible for scaffold
 * reconcile — exactly like a wizard-generated design.
 *
 * Returns a NEW design (immutable); the input is never mutated. A design that is
 * already LZ-origin with a persisted config is returned unchanged so re-adopting
 * never clobbers a richer wizard-authored config with a derived approximation.
 */
export function adoptDesignIntoLandingZone<T extends AdoptableDesign>(design: T): T {
    const existing = design?.userDefined?.[LZ_CONFIG_KEY]
    if (existing) return design

    const config = deriveLandingZoneConfig(design)
    // Clone through the prototype: the importer hands back a live OcdDesign class
    // instance, so a plain `{ ...design }` spread would strip its methods. For a
    // plain object the prototype is just Object.prototype, so this stays correct.
    const next: T = Object.assign(Object.create(Object.getPrototypeOf(design) ?? Object.prototype), design)
    next.userDefined = {
        ...(design?.userDefined ?? {}),
        [LZ_ORIGIN_KEY]: true,
        [LZ_CONFIG_KEY]: config,
    }
    return next
}
