/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

/*
** Region -> Availability Domain / Fault Domain catalogue for the Designer
** Realm > Region > AD > FD scaffold.
**
** AD count is a runtime OCI fact (no public, unauthenticated API), so it is
** curated here. Defaults are deliberately conservative: a region not in the
** multi-AD set is treated as single-AD (1) rather than over-rendering capacity
** that does not exist. Every Availability Domain on OCI always has exactly 3
** Fault Domains. Edit MULTI_AD_REGIONS as OCI regions gain ADs.
**
** Token alignment with the OCD model: resources store availabilityDomain as the
** 1-based index string ('1'|'2'|'3') and faultDomain as 'FAULT-DOMAIN-1..3'
** (see generated/OciInstance.ts). The resolver emits exactly those tokens so the
** scaffold groups resources by the values they actually carry.
*/

/** Fault Domains are always 3 per Availability Domain on OCI. */
export const FAULT_DOMAINS_PER_AD = 3

/** Default AD count for any region not in MULTI_AD_REGIONS. */
export const DEFAULT_AD_COUNT = 1

/**
 * Region ids (matching OcdLzRegions REGIONS_BY_REALM) that expose 3 Availability
 * Domains. The long-established commercial multi-AD regions. All other regions
 * default to a single AD until verified otherwise.
 */
export const MULTI_AD_REGIONS: ReadonlySet<string> = new Set<string>([
    'us-ashburn-1',
    'us-phoenix-1',
    'eu-frankfurt-1',
    'uk-london-1',
])

/** A Fault Domain within an Availability Domain. */
export interface FaultDomainDescriptor {
    /** 1-based fault domain index. */
    index: number
    /** Display label, e.g. 'FD-1'. */
    label: string
    /** Value stored on resource.faultDomain, e.g. 'FAULT-DOMAIN-1'. */
    token: string
}

/** An Availability Domain within a region, with its Fault Domains. */
export interface AvailabilityDomainDescriptor {
    /** 1-based availability domain index. */
    index: number
    /** Display label, e.g. 'AD-1'. */
    label: string
    /** Value stored on resource.availabilityDomain, e.g. '1'. */
    token: string
    faultDomains: FaultDomainDescriptor[]
}

/** Number of Availability Domains for a region id. */
export function getAvailabilityDomainCount(regionId: string): number {
    return MULTI_AD_REGIONS.has(regionId) ? 3 : DEFAULT_AD_COUNT
}

/** The (always 3) Fault Domains, shared across every Availability Domain. */
export function getFaultDomains(): FaultDomainDescriptor[] {
    return Array.from({ length: FAULT_DOMAINS_PER_AD }, (_unused, i) => {
        const index = i + 1
        return { index, label: `FD-${index}`, token: `FAULT-DOMAIN-${index}` }
    })
}

/**
 * The Availability Domains (each with its Fault Domains) for a region id.
 * Unknown / single-AD regions yield a single AD. Pure and deterministic.
 */
export function getAvailabilityDomains(regionId: string): AvailabilityDomainDescriptor[] {
    const count = getAvailabilityDomainCount(regionId)
    return Array.from({ length: count }, (_unused, i) => {
        const index = i + 1
        return {
            index,
            label: `AD-${index}`,
            token: `${index}`,
            faultDomains: getFaultDomains(),
        }
    })
}
