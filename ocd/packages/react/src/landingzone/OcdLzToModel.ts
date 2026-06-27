/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

/*
** "Open generated LZ in Designer" bridge (roadmap wizard <-> designer link).
**
** Translates the Operating Entities (OE / Landing Zone Next Generation) JSON
** output (iam.json + network.json) into an OcdDesign whose model.oci.resources
** are real OCD model resources, so the generated Landing Zone can be edited on
** the drag-drop canvas with the restored OCI stencils.
**
** Mapping is driven by OcdLzResourceMap (byOeKind / the OE section -> OCD model
** type + palette class single source of truth). Confidently covered today:
**
**   iam.json:
**     compartments_configuration.compartments.*          -> compartment (recursive, parent links)
**     identity_domain_groups_configuration.groups.*      -> group (name + description)
**     identity_domain_groups_configuration.dynamic_groups.* -> dynamic_group (name + description + matching_rule)
**     policies_configuration.supplied_policies.*         -> policy (name + statements[], compartment_id -> resolved compartment)
**   network.json:
**     ...network_configuration_categories.*.vcns.*       -> vcn
**       .subnets.*                                       -> subnet  (vcnId + routeTableId + securityListIds)
**       .route_tables.*                                  -> route_table (vcnId)
**       .security_lists.* / .default_security_list       -> security_list (vcnId)
**       .network_security_groups.*                       -> network_security_group (vcnId)
**       .vcn_specific_gateways.internet_gateways.*       -> internet_gateway (vcnId)
**       .vcn_specific_gateways.nat_gateways.*            -> nat_gateway (vcnId)
**       .vcn_specific_gateways.service_gateways.*        -> service_gateway (vcnId)
**     ...network_configuration_categories.*.non_vcn_specific_gateways.dynamic_routing_gateways.* -> drg
**       .drg_attachments.*                               -> drg_attachment (drgId + vcnId via attached_resource_key)
**       .drg_route_tables.*                              -> drg_route_table (drgId)
**       .drg_route_distributions.*                       -> drg_route_distribution (drgId + distributionType)
**
** Everything is defensive: unknown sections are skipped, missing fields never
** throw, and a structured report records what was mapped vs skipped.
*/

import { OcdDesign, OciModelResources } from '@ocd/model'
import { GeneratedFile } from './OcdLzGenerator'
import { byOeKind } from './OcdLzResourceMap'
import { LandingZoneConfig } from './OcdLzConfig'
import { mapObservabilityJson } from './OcdLzObservabilityBridge'

/**
 * `design.userDefined` key used by the canvas placement resolver (A5).
 * Set to `true` whenever a design is built from LZNG-generated OE files so
 * that dropped stencils are routed into the correct LZ compartment instead of
 * always landing on the currently-selected layer.
 */
export const LZ_ORIGIN_KEY = 'lzOrigin'

/**
 * `design.userDefined` key under which the originating `LandingZoneConfig` is
 * retained, so the wizard config survives a save/reload of the design and the
 * Realm > Region > AD > FD scaffold reconcile (OcdLzScaffold) can rebuild from
 * the same source of truth.
 */
export const LZ_CONFIG_KEY = 'lzConfig'

/**
 * Read the `LandingZoneConfig` previously stamped onto a design by
 * `buildOcdDesignFromLz`. Returns `undefined` when the design did not originate
 * from the LZNG wizard (or pre-dates config persistence).
 */
export function getLzConfig(design: { userDefined?: Record<string, unknown> } | null | undefined): LandingZoneConfig | undefined {
    const config = design?.userDefined?.[LZ_CONFIG_KEY]
    return config ? (config as LandingZoneConfig) : undefined
}

/** Result of translating the OE output into an OcdDesign. */
export interface OcdLzToModelResult {
    /** The assembled OCD design ready to drop into an OcdDocument. */
    design: OcdDesign
    /** Per-OCD-resource-type counts of what was created. */
    counts: Record<string, number>
    /** Top-level compartment ids (suitable for `addLayer`). */
    topCompartmentIds: string[]
    /** Human readable notes about sections that were mapped / skipped. */
    notes: string[]
}

/** Minimal shape of the OE iam.json content we read. */
interface RawCompartment {
    name?: string
    description?: string
    children?: Record<string, RawCompartment>
}
interface RawGroup {
    name?: string
    description?: string
}
interface RawDynamicGroup extends RawGroup {
    matching_rule?: string
}
interface RawPolicy {
    name?: string
    description?: string
    compartment_id?: string
    statements?: string[]
}
interface IamContent {
    compartments_configuration?: {
        compartments?: Record<string, RawCompartment>
    }
    identity_domain_groups_configuration?: {
        groups?: Record<string, RawGroup>
        dynamic_groups?: Record<string, RawDynamicGroup>
    }
    policies_configuration?: {
        supplied_policies?: Record<string, RawPolicy>
    }
}

/** Minimal shape of the OE network.json content we read. */
interface RawNamed {
    display_name?: string
}
interface RawSubnet extends RawNamed {
    cidr_block?: string
    dns_label?: string
    route_table_key?: string
    security_list_keys?: string[]
    prohibit_public_ip_on_vnic?: boolean
}
interface RawVcn extends RawNamed {
    cidr_blocks?: string[]
    dns_label?: string
    subnets?: Record<string, RawSubnet>
    route_tables?: Record<string, RawNamed>
    security_lists?: Record<string, RawNamed>
    default_security_list?: RawNamed
    network_security_groups?: Record<string, RawNamed>
    vcn_specific_gateways?: {
        internet_gateways?: Record<string, RawNamed>
        nat_gateways?: Record<string, RawNamed>
        service_gateways?: Record<string, RawNamed>
    }
}
interface RawDrgAttachmentNetworkDetails {
    type?: string
    attached_resource_key?: string
    route_table_key?: string
}
interface RawDrgAttachment extends RawNamed {
    drg_route_table_key?: string
    network_details?: RawDrgAttachmentNetworkDetails
}
interface RawDrgRouteTable extends RawNamed {
    import_drg_route_distribution_key?: string
    is_ecmp_enabled?: boolean
}
interface RawDrgRouteDistribution extends RawNamed {
    distribution_type?: string
}
interface RawDrg extends RawNamed {
    drg_attachments?: Record<string, RawDrgAttachment>
    drg_route_tables?: Record<string, RawDrgRouteTable>
    drg_route_distributions?: Record<string, RawDrgRouteDistribution>
}
interface RawCategory {
    category_compartment_id?: string
    vcns?: Record<string, RawVcn>
    non_vcn_specific_gateways?: {
        dynamic_routing_gateways?: Record<string, RawDrg>
    }
}
interface NetworkContent {
    network_configuration?: {
        network_configuration_categories?: Record<string, RawCategory>
    }
}

// OE section key paths (kept identical to the OcdLzResourceMap entries so the
// byOeKind lookup resolves the OCD model type + palette class authoritatively).
const NET_VCN = 'network.network_configuration.network_configuration_categories.*.vcns.*'
const KIND_COMPARTMENT = 'iam.compartments_configuration.compartments'
const KIND_GROUP = 'iam.identity_domain_groups_configuration.groups'
const KIND_DYNAMIC_GROUP = 'iam.identity_domain_groups_configuration.dynamic_groups'
const KIND_POLICY = 'iam.policies_configuration.supplied_policies'
const KIND_VCN = 'network.network_configuration.network_configuration_categories.*.vcns'
const KIND_SUBNET = `${NET_VCN}.subnets`
const KIND_ROUTE_TABLE = `${NET_VCN}.route_tables`
const KIND_SECURITY_LIST = `${NET_VCN}.security_lists`
const KIND_DEFAULT_SECURITY_LIST = `${NET_VCN}.default_security_list`
const KIND_NSG = `${NET_VCN}.network_security_groups`
const KIND_IGW = `${NET_VCN}.vcn_specific_gateways.internet_gateways`
const KIND_NGW = `${NET_VCN}.vcn_specific_gateways.nat_gateways`
const KIND_SGW = `${NET_VCN}.vcn_specific_gateways.service_gateways`
const KIND_DRG = `${NET_VCN}.non_vcn_specific_gateways.dynamic_routing_gateways`
const KIND_DRG_ATTACHMENT = `${KIND_DRG}.*.drg_attachments`
const KIND_DRG_ROUTE_TABLE = `${KIND_DRG}.*.drg_route_tables`
const KIND_DRG_ROUTE_DISTRIBUTION = `${KIND_DRG}.*.drg_route_distributions`

/**
 * Per-OCD-model-type factory. Each entry returns a freshly constructed model
 * resource via its generated `newResource`. Only the types the OE network
 * output emits are listed; unmapped types are skipped by the caller.
 */
type ModelResourceFactory = () => Record<string, unknown>
const MODEL_FACTORIES: Record<string, ModelResourceFactory> = {
    subnet: () => OciModelResources.OciSubnet.newResource('subnet') as unknown as Record<string, unknown>,
    route_table: () => OciModelResources.OciRouteTable.newResource('route_table') as unknown as Record<string, unknown>,
    security_list: () => OciModelResources.OciSecurityList.newResource('security_list') as unknown as Record<string, unknown>,
    network_security_group: () =>
        OciModelResources.OciNetworkSecurityGroup.newResource('network_security_group') as unknown as Record<string, unknown>,
    internet_gateway: () => OciModelResources.OciInternetGateway.newResource('internet_gateway') as unknown as Record<string, unknown>,
    nat_gateway: () => OciModelResources.OciNatGateway.newResource('nat_gateway') as unknown as Record<string, unknown>,
    service_gateway: () => OciModelResources.OciServiceGateway.newResource('service_gateway') as unknown as Record<string, unknown>,
}

function parseJson<T>(content: string | null | undefined): T | null {
    if (!content) return null
    try {
        return JSON.parse(content) as T
    } catch {
        return null
    }
}

function findFile(files: GeneratedFile[], name: string): string | null {
    return files.find((file) => file.name === name)?.content ?? null
}

/** Bump a per-type counter. */
function bump(counts: Record<string, number>, type: string): void {
    counts[type] = (counts[type] ?? 0) + 1
}

/** Resolve the OCD model type for an OE section path, or undefined if unmapped. */
function modelTypeFor(oeKind: string): string | undefined {
    return byOeKind(oeKind)?.ocdModelType
}

/**
 * Build an OcdDesign (with model.oci.resources fully populated) from the OE
 * generated files. Never throws on malformed / missing content.
 */
export function buildOcdDesignFromLz(files: GeneratedFile[], title = 'Landing Zone', config?: LandingZoneConfig): OcdLzToModelResult {
    const design = OcdDesign.newDesign()
    // Start from an empty resource set; the bridge owns every resource.
    design.model.oci.resources = {}
    design.metadata.title = title
    if (design.view.pages[0]) {
        design.view.pages[0].title = title
        design.view.pages[0].layers = []
        design.view.pages[0].coords = []
        design.view.pages[0].connectors = []
    }

    const counts: Record<string, number> = {}
    const notes: string[] = []
    const topCompartmentIds: string[] = []

    const push = (key: string, resource: object): void => {
        if (!Object.hasOwn(design.model.oci.resources, key)) design.model.oci.resources[key] = []
        design.model.oci.resources[key].push(resource)
    }

    // --- IAM: compartments (recursive) ---
    const iam = parseJson<IamContent>(findFile(files, 'iam.json'))
    const compartments = iam?.compartments_configuration?.compartments ?? {}
    const compartmentModelType = modelTypeFor(KIND_COMPARTMENT)
    let compartmentRootId = ''
    // OE compartment KEY (the map key, e.g. 'CMP-LANDINGZONE-KEY') -> generated id.
    // Policies reference a compartment by this key in `compartment_id`.
    const compartmentKeyToId = new Map<string, string>()

    const walkCompartment = (key: string, raw: RawCompartment, parentId: string, depth: number): void => {
        const resource = OciModelResources.OciCompartment.newResource('compartment')
        resource.displayName = raw.name || key
        resource.description = raw.description || ''
        if (parentId) resource.compartmentId = parentId
        push('compartment', resource)
        bump(counts, 'compartment')
        compartmentKeyToId.set(key, resource.id)
        if (depth === 0) {
            topCompartmentIds.push(resource.id)
            if (!compartmentRootId) compartmentRootId = resource.id
        }
        const children = raw.children ?? {}
        Object.keys(children)
            .sort()
            .forEach((childKey) => walkCompartment(childKey, children[childKey] ?? {}, resource.id, depth + 1))
    }

    if (compartmentModelType) {
        Object.keys(compartments)
            .sort()
            .forEach((key) => walkCompartment(key, compartments[key] ?? {}, '', 0))
        notes.push(`Mapped ${counts.compartment ?? 0} compartment(s) from iam.json.`)
    } else {
        notes.push('Skipped compartments: no OcdLzResourceMap entry for IAM compartments.')
    }

    // Fall back to a single root compartment so network resources always have a
    // parent (the canvas requires at least one compartment layer).
    if (!compartmentRootId) {
        const root = OciModelResources.OciCompartment.newResource('compartment')
        root.displayName = title
        root.description = 'Landing Zone root compartment'
        push('compartment', root)
        bump(counts, 'compartment')
        topCompartmentIds.push(root.id)
        compartmentRootId = root.id
        notes.push('Synthesized a root compartment (none found in iam.json).')
    }

    // Resolve an OE compartment key to a generated compartment id, falling back
    // to the root compartment when the key is missing / unknown.
    const resolveCompartmentId = (key: string | undefined): string => {
        if (key && compartmentKeyToId.has(key)) return compartmentKeyToId.get(key) as string
        return compartmentRootId
    }

    // --- IAM: groups, dynamic groups, policies ---
    const idGroups = iam?.identity_domain_groups_configuration ?? {}

    const groups = idGroups.groups ?? {}
    if (modelTypeFor(KIND_GROUP)) {
        let groupCount = 0
        Object.keys(groups)
            .sort()
            .forEach((key) => {
                const raw = groups[key] ?? {}
                const group = OciModelResources.OciGroup.newResource('group')
                group.displayName = raw.name || key
                group.description = raw.description || ''
                group.compartmentId = compartmentRootId
                push('group', group)
                bump(counts, 'group')
                groupCount += 1
            })
        notes.push(`Mapped ${groupCount} group(s) from iam.json.`)
    } else {
        notes.push(`Skipped ${KIND_GROUP}: not in OcdLzResourceMap.`)
    }

    const dynamicGroups = idGroups.dynamic_groups ?? {}
    if (modelTypeFor(KIND_DYNAMIC_GROUP)) {
        let dynamicGroupCount = 0
        Object.keys(dynamicGroups)
            .sort()
            .forEach((key) => {
                const raw = dynamicGroups[key] ?? {}
                const dynamicGroup = OciModelResources.OciDynamicGroup.newResource('dynamic_group')
                dynamicGroup.displayName = raw.name || key
                dynamicGroup.description = raw.description || ''
                if (typeof raw.matching_rule === 'string') dynamicGroup.matchingRule = raw.matching_rule
                dynamicGroup.compartmentId = compartmentRootId
                push('dynamic_group', dynamicGroup)
                bump(counts, 'dynamic_group')
                dynamicGroupCount += 1
            })
        if (dynamicGroupCount > 0) notes.push(`Mapped ${dynamicGroupCount} dynamic group(s) from iam.json.`)
    } else {
        notes.push(`Skipped ${KIND_DYNAMIC_GROUP}: not in OcdLzResourceMap.`)
    }

    const suppliedPolicies = iam?.policies_configuration?.supplied_policies ?? {}
    if (modelTypeFor(KIND_POLICY)) {
        let policyCount = 0
        Object.keys(suppliedPolicies)
            .sort()
            .forEach((key) => {
                const raw = suppliedPolicies[key] ?? {}
                const policy = OciModelResources.OciPolicy.newResource('policy')
                policy.displayName = raw.name || key
                if (raw.description) policy.description = raw.description
                policy.statements = Array.isArray(raw.statements) ? raw.statements : []
                policy.compartmentId = resolveCompartmentId(raw.compartment_id)
                push('policy', policy)
                bump(counts, 'policy')
                policyCount += 1
            })
        notes.push(`Mapped ${policyCount} policy/policies from iam.json.`)
    } else {
        notes.push(`Skipped ${KIND_POLICY}: not in OcdLzResourceMap.`)
    }

    // --- Network: VCNs and contained resources ---
    const network = parseJson<NetworkContent>(findFile(files, 'network.json'))
    const categories = network?.network_configuration?.network_configuration_categories ?? {}

    // Set a parent compartment + provider/region on any networking resource.
    const setNetworkParent = (resource: { compartmentId: string }): void => {
        resource.compartmentId = compartmentRootId
    }

    // Build a sub-resource map keyed by OE key, recording the generated OCD id,
    // so subnets can resolve route_table_key / security_list_keys to real ids.
    const mapNamedChildren = (
        container: Record<string, RawNamed> | undefined,
        oeKind: string,
        listKey: string,
        vcnId: string,
        keyToId?: Map<string, string>,
        configure?: (resource: Record<string, unknown>, raw: RawNamed) => void,
    ): void => {
        if (!container) return
        const modelType = modelTypeFor(oeKind)
        if (!modelType) {
            notes.push(`Skipped ${oeKind}: not in OcdLzResourceMap.`)
            return
        }
        const factory = MODEL_FACTORIES[modelType]
        if (!factory) {
            notes.push(`Skipped ${oeKind}: no model factory for '${modelType}'.`)
            return
        }
        Object.keys(container)
            .sort()
            .forEach((key) => {
                const raw = container[key] ?? {}
                const resource = factory()
                resource.displayName = raw.display_name || key
                if (Object.hasOwn(resource, 'vcnId')) resource.vcnId = vcnId
                setNetworkParent(resource as { compartmentId: string })
                if (configure) configure(resource, raw)
                push(listKey, resource)
                bump(counts, listKey)
                if (keyToId) keyToId.set(key, resource.id as string)
            })
    }

    const vcnModelType = modelTypeFor(KIND_VCN)
    let categoryCount = 0
    let vcnCount = 0
    // OE VCN KEY (the map key) -> generated VCN id, so DRG attachments can
    // resolve their `network_details.attached_resource_key` to a real vcnId.
    const vcnKeyToId = new Map<string, string>()

    Object.keys(categories)
        .sort()
        .forEach((categoryKey) => {
            const category = categories[categoryKey] ?? {}
            categoryCount += 1
            const vcns = category.vcns ?? {}

            Object.keys(vcns)
                .sort()
                .forEach((vcnKey) => {
                    const rawVcn = vcns[vcnKey] ?? {}
                    let vcnId = ''
                    if (vcnModelType) {
                        const vcn = OciModelResources.OciVcn.newResource('vcn')
                        vcn.displayName = rawVcn.display_name || vcnKey
                        vcn.cidrBlocks = Array.isArray(rawVcn.cidr_blocks) ? rawVcn.cidr_blocks : []
                        if (rawVcn.dns_label) vcn.dnsLabel = rawVcn.dns_label
                        setNetworkParent(vcn)
                        push('vcn', vcn)
                        bump(counts, 'vcn')
                        vcnCount += 1
                        vcnId = vcn.id
                        vcnKeyToId.set(vcnKey, vcnId)
                    } else {
                        notes.push('Skipped VCNs: no OcdLzResourceMap entry for VCN.')
                    }

                    // Route tables + security lists first so subnets can link to them.
                    const routeTableIds = new Map<string, string>()
                    const securityListIds = new Map<string, string>()

                    mapNamedChildren(rawVcn.route_tables, KIND_ROUTE_TABLE, 'route_table', vcnId, routeTableIds)
                    mapNamedChildren(rawVcn.security_lists, KIND_SECURITY_LIST, 'security_list', vcnId, securityListIds)
                    if (rawVcn.default_security_list) {
                        mapNamedChildren(
                            { default_security_list: rawVcn.default_security_list },
                            KIND_DEFAULT_SECURITY_LIST,
                            'security_list',
                            vcnId,
                            securityListIds,
                            (resource) => {
                                resource.displayName = rawVcn.default_security_list?.display_name || `${vcnKey} Default Security List`
                            },
                        )
                    }
                    mapNamedChildren(rawVcn.network_security_groups, KIND_NSG, 'network_security_group', vcnId)

                    // Subnets, resolving route table + security list references.
                    mapNamedChildren(
                        rawVcn.subnets,
                        KIND_SUBNET,
                        'subnet',
                        vcnId,
                        undefined,
                        (resource, raw) => {
                            const subnetRaw = raw as RawSubnet
                            resource.cidrBlock = subnetRaw.cidr_block || ''
                            if (subnetRaw.dns_label) resource.dnsLabel = subnetRaw.dns_label
                            if (typeof subnetRaw.prohibit_public_ip_on_vnic === 'boolean') {
                                resource.prohibitPublicIpOnVnic = subnetRaw.prohibit_public_ip_on_vnic
                            }
                            const rtId = subnetRaw.route_table_key ? routeTableIds.get(subnetRaw.route_table_key) : undefined
                            if (rtId) resource.routeTableId = rtId
                            const slIds = (subnetRaw.security_list_keys ?? [])
                                .map((slKey) => securityListIds.get(slKey))
                                .filter((id): id is string => typeof id === 'string')
                            if (slIds.length > 0) resource.securityListIds = slIds
                        },
                    )

                    // VCN-specific gateways.
                    const gateways = rawVcn.vcn_specific_gateways ?? {}
                    mapNamedChildren(gateways.internet_gateways, KIND_IGW, 'internet_gateway', vcnId)
                    mapNamedChildren(gateways.nat_gateways, KIND_NGW, 'nat_gateway', vcnId)
                    mapNamedChildren(gateways.service_gateways, KIND_SGW, 'service_gateway', vcnId)
                })

            // Non-VCN-specific gateways (DRG) live at the category level.
            const drgs = category.non_vcn_specific_gateways?.dynamic_routing_gateways
            if (drgs) {
                const drgModelType = modelTypeFor(KIND_DRG)
                if (drgModelType) {
                    const drgAttachmentMapped = Boolean(modelTypeFor(KIND_DRG_ATTACHMENT))
                    const drgRouteTableMapped = Boolean(modelTypeFor(KIND_DRG_ROUTE_TABLE))
                    const drgRouteDistributionMapped = Boolean(modelTypeFor(KIND_DRG_ROUTE_DISTRIBUTION))
                    Object.keys(drgs)
                        .sort()
                        .forEach((drgKey) => {
                            const rawDrg = drgs[drgKey] ?? {}
                            const drg = OciModelResources.OciDrg.newResource('drg')
                            drg.displayName = rawDrg.display_name || drgKey
                            setNetworkParent(drg)
                            push('drg', drg)
                            bump(counts, 'drg')
                            const drgId = drg.id

                            // DRG attachments: link to the DRG, and resolve the
                            // attached VCN via network_details.attached_resource_key.
                            const attachments = rawDrg.drg_attachments ?? {}
                            if (drgAttachmentMapped) {
                                Object.keys(attachments)
                                    .sort()
                                    .forEach((attKey) => {
                                        const rawAtt = attachments[attKey] ?? {}
                                        const att = OciModelResources.OciDrgAttachment.newResource('drg_attachment')
                                        att.displayName = rawAtt.display_name || attKey
                                        att.drgId = drgId
                                        att.compartmentId = compartmentRootId
                                        const details = rawAtt.network_details
                                        if (details?.type === 'VCN' && details.attached_resource_key) {
                                            const attachedVcnId = vcnKeyToId.get(details.attached_resource_key)
                                            if (attachedVcnId) att.vcnId = attachedVcnId
                                        }
                                        push('drg_attachment', att)
                                        bump(counts, 'drg_attachment')
                                    })
                            } else if (Object.keys(attachments).length > 0) {
                                notes.push(`Skipped ${KIND_DRG_ATTACHMENT}: not in OcdLzResourceMap.`)
                            }

                            // DRG route tables: link to the DRG.
                            const routeTables = rawDrg.drg_route_tables ?? {}
                            if (drgRouteTableMapped) {
                                Object.keys(routeTables)
                                    .sort()
                                    .forEach((rtKey) => {
                                        const rawRt = routeTables[rtKey] ?? {}
                                        const rt = OciModelResources.OciDrgRouteTable.newResource('drg_route_table')
                                        rt.displayName = rawRt.display_name || rtKey
                                        rt.drgId = drgId
                                        rt.compartmentId = compartmentRootId
                                        if (typeof rawRt.is_ecmp_enabled === 'boolean') rt.isEcmpEnabled = rawRt.is_ecmp_enabled
                                        push('drg_route_table', rt)
                                        bump(counts, 'drg_route_table')
                                    })
                            } else if (Object.keys(routeTables).length > 0) {
                                notes.push(`Skipped ${KIND_DRG_ROUTE_TABLE}: not in OcdLzResourceMap.`)
                            }

                            // DRG route distributions: link to the DRG.
                            const routeDistributions = rawDrg.drg_route_distributions ?? {}
                            if (drgRouteDistributionMapped) {
                                Object.keys(routeDistributions)
                                    .sort()
                                    .forEach((rdKey) => {
                                        const rawRd = routeDistributions[rdKey] ?? {}
                                        const rd = OciModelResources.OciDrgRouteDistribution.newResource('drg_route_distribution')
                                        rd.displayName = rawRd.display_name || rdKey
                                        rd.drgId = drgId
                                        rd.compartmentId = compartmentRootId
                                        if (rawRd.distribution_type) rd.distributionType = rawRd.distribution_type
                                        push('drg_route_distribution', rd)
                                        bump(counts, 'drg_route_distribution')
                                    })
                            } else if (Object.keys(routeDistributions).length > 0) {
                                notes.push(`Skipped ${KIND_DRG_ROUTE_DISTRIBUTION}: not in OcdLzResourceMap.`)
                            }
                        })
                } else {
                    notes.push(`Skipped ${KIND_DRG}: not in OcdLzResourceMap.`)
                }
            }
        })

    if (categoryCount > 0) {
        notes.push(`Mapped ${vcnCount} VCN(s) across ${categoryCount} network categor(ies) from network.json.`)
    } else if (network) {
        notes.push('network.json present but no network categories found.')
    } else {
        notes.push('No network.json found; only IAM compartments were mapped.')
    }

    // --- Observability: events rules, notification topics, service connectors,
    // log groups + logs (observability.json). Parented to the root compartment. ---
    const observability = mapObservabilityJson(findFile(files, 'observability.json'), compartmentRootId)
    for (const [type, list] of Object.entries(observability.resources)) {
        for (const resource of list) push(type, resource)
    }
    for (const [type, count] of Object.entries(observability.counts)) {
        counts[type] = (counts[type] ?? 0) + count
    }
    notes.push(...observability.notes)

    // Mark the design as LZ-origin so the canvas placement resolver (A5) can
    // route dropped stencils into the correct LZ compartment automatically.
    design.userDefined[LZ_ORIGIN_KEY] = true

    // Retain the originating wizard config (when supplied) so it survives saves
    // and drives the Realm > Region > AD > FD scaffold reconcile.
    if (config) design.userDefined[LZ_CONFIG_KEY] = config

    return { design, counts, topCompartmentIds, notes }
}
