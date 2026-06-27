/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

/*
** OKE-native overlay (C2 — grounded in the oke-coordinator-ops skill). When
** enabled on an LZ-origin design, materialises an OCI-native OKE topology that
** encodes the patterns teams most often get wrong:
**
**   - VCN-native CNI: a DEDICATED pod subnet (large CIDR, VNIC-per-pod) that is
**     SEPARATE from the node subnet. Reference layout from the skill:
**       API endpoint subnet  10.0.0.0/29  (private, K8s API)
**       Node subnet          10.0.1.0/24  (private, node VNICs)
**       Pod subnet           10.0.16.0/20 (private, VCN-native only, >=4096 IPs)
**       LB subnet (public)   10.0.2.0/27  (public ingress LBs)
**   - Enhanced cluster (Workload Identity requires it).
**   - Workload Identity: a dynamic group + a policy (preferred over instance
**     principal). The cluster is the workload principal source.
**   - NSG preferred over Security List for OKE (resource-scoped).
**   - Vault + Key for workload secrets (External Secrets Operator source).
**
** Pure and IDEMPOTENT, mirroring OcdLzObservability: each emitted resource
** carries a `userDefined.lzOke` role marker; re-applying upserts by that marker.
** No live OCI calls — it only edits the design model. Decoupled from the OE
** jsonnet generator.
*/

import { OcdDesign, OciModelResources } from '@ocd/model'
import { isLzOriginDesign } from './OcdLzPlacement'
import {
    cloneDesign,
    createOverlayContext,
    firstId,
    isOverlayEnabled,
    OverlayRoleSpec,
    rootCompartmentId,
} from './OcdLzOverlay'

/** `design.userDefined` key: the wizard / designer 'OKE Native' tick. */
export const LZ_OKE_NATIVE_ENABLED_KEY = 'lzOkeNativeEnabled'

/** `resource.userDefined` key holding the overlay role marker. */
const OKE_ROLE_KEY = 'lzOke'

export type OkeRole =
    | 'cluster' | 'node_pool'
    | 'api_subnet' | 'node_subnet' | 'pod_subnet' | 'lb_subnet'
    | 'nsg' | 'dynamic_group' | 'policy' | 'vault' | 'key'

type RoleSpec = OverlayRoleSpec<OkeRole>

const NEW = OciModelResources
const ROLE_SPECS: readonly RoleSpec[] = [
    { role: 'cluster', listKey: 'oke_cluster', displayName: 'OKE Cluster (enhanced)', create: () => NEW.OciOkeCluster.newResource('oke_cluster') as unknown as Record<string, unknown> },
    { role: 'node_pool', listKey: 'oke_node_pool', displayName: 'OKE Node Pool', create: () => NEW.OciOkeNodePool.newResource('oke_node_pool') as unknown as Record<string, unknown> },
    { role: 'api_subnet', listKey: 'subnet', displayName: 'OKE API Endpoint Subnet', create: () => NEW.OciSubnet.newResource('subnet') as unknown as Record<string, unknown> },
    { role: 'node_subnet', listKey: 'subnet', displayName: 'OKE Node Subnet', create: () => NEW.OciSubnet.newResource('subnet') as unknown as Record<string, unknown> },
    { role: 'pod_subnet', listKey: 'subnet', displayName: 'OKE Pod Subnet (VCN-native CNI)', create: () => NEW.OciSubnet.newResource('subnet') as unknown as Record<string, unknown> },
    { role: 'lb_subnet', listKey: 'subnet', displayName: 'OKE LB Subnet (public ingress)', create: () => NEW.OciSubnet.newResource('subnet') as unknown as Record<string, unknown> },
    { role: 'nsg', listKey: 'network_security_group', displayName: 'OKE NSG', create: () => NEW.OciNetworkSecurityGroup.newResource('network_security_group') as unknown as Record<string, unknown> },
    { role: 'dynamic_group', listKey: 'dynamic_group', displayName: 'OKE Workload Identity DG', create: () => NEW.OciDynamicGroup.newResource('dynamic_group') as unknown as Record<string, unknown> },
    { role: 'policy', listKey: 'policy', displayName: 'OKE Workload Identity Policy', create: () => NEW.OciPolicy.newResource('policy') as unknown as Record<string, unknown> },
    { role: 'vault', listKey: 'vault', displayName: 'OKE Vault', create: () => NEW.OciVault.newResource('vault') as unknown as Record<string, unknown> },
    { role: 'key', listKey: 'key', displayName: 'OKE Key', create: () => NEW.OciKey.newResource('key') as unknown as Record<string, unknown> },
]

/** Reference CIDRs (skill subnet layout). The user can re-CIDR to their VCN. */
const SUBNET_CIDR: Partial<Record<OkeRole, string>> = {
    api_subnet: '10.0.0.0/29',
    node_subnet: '10.0.1.0/24',
    pod_subnet: '10.0.16.0/20', // VCN-native CNI: >=4096 IPs, dedicated pod subnet
    lb_subnet: '10.0.2.0/27',
}

/** Shared find/upsert machinery bound to this overlay's role key + specs. */
const overlay = createOverlayContext(OKE_ROLE_KEY, ROLE_SPECS, 'always')

export function isOkeNativeEnabled(design: { userDefined?: Record<string, unknown> } | null | undefined): boolean {
    return isOverlayEnabled(design, LZ_OKE_NATIVE_ENABLED_KEY)
}

/** Find an overlay-emitted resource by its role marker. */
export function findOkeResource(design: OcdDesign, role: OkeRole): Record<string, unknown> | undefined {
    return overlay.find(design, role)
}

const upsertRole = (design: OcdDesign, spec: RoleSpec, compartmentId: string): Record<string, unknown> =>
    overlay.upsert(design, spec, compartmentId)

/**
 * Apply the OKE-native overlay. Pure + idempotent. Returns the SAME reference
 * when not applicable (not LZ-origin, toggle off); otherwise a NEW design with
 * the VCN-native OKE topology + Workload Identity + Vault upserted and wired.
 */
export function applyOkeNativeOverlay(design: OcdDesign): OcdDesign {
    if (!isLzOriginDesign(design) || !isOkeNativeEnabled(design)) return design

    const next = cloneDesign(design)
    const compartmentId = rootCompartmentId(next)
    const vcnId = firstId(next, 'vcn')

    // Subnets (VCN-native layout) + NSG, all attached to the spoke VCN.
    const subnetRoles: OkeRole[] = ['api_subnet', 'node_subnet', 'pod_subnet', 'lb_subnet']
    const subnetByRole: Partial<Record<OkeRole, Record<string, unknown>>> = {}
    for (const role of subnetRoles) {
        const spec = ROLE_SPECS.find((s) => s.role === role)!
        const subnet = upsertRole(next, spec, compartmentId)
        subnet.vcnId = vcnId
        subnet.cidrBlock = SUBNET_CIDR[role]
        subnet.prohibitPublicIpOnVnic = role !== 'lb_subnet' // LB subnet is public
        subnetByRole[role] = subnet
    }
    const nsg = upsertRole(next, ROLE_SPECS.find((s) => s.role === 'nsg')!, compartmentId)
    nsg.vcnId = vcnId

    // Enhanced cluster on the spoke VCN (enhanced required for Workload Identity).
    const cluster = upsertRole(next, ROLE_SPECS.find((s) => s.role === 'cluster')!, compartmentId)
    cluster.vcnId = vcnId
    cluster.type = 'ENHANCED'

    // Node pool: workers in the node subnet (pod subnet drives VCN-native CNI).
    const nodePool = upsertRole(next, ROLE_SPECS.find((s) => s.role === 'node_pool')!, compartmentId)
    nodePool.clusterId = cluster.id
    nodePool.subnetIds = [subnetByRole.node_subnet?.id ?? '']

    // Workload Identity: dynamic group + policy (illustrative rule/statements the
    // user refines with the real cluster OCID + grants).
    const dynamicGroup = upsertRole(next, ROLE_SPECS.find((s) => s.role === 'dynamic_group')!, compartmentId)
    dynamicGroup.matchingRule = "ALL {resource.type = 'workload', resource.compartment.id = '<compartment_ocid>'}"
    const policy = upsertRole(next, ROLE_SPECS.find((s) => s.role === 'policy')!, compartmentId)
    policy.statements = [
        `Allow dynamic-group ${String(dynamicGroup.displayName)} to manage object-family in compartment id ${compartmentId}`,
        `Allow dynamic-group ${String(dynamicGroup.displayName)} to use secret-family in compartment id ${compartmentId}`,
    ]

    // Vault + Key for workload secrets.
    const vault = upsertRole(next, ROLE_SPECS.find((s) => s.role === 'vault')!, compartmentId)
    const key = upsertRole(next, ROLE_SPECS.find((s) => s.role === 'key')!, compartmentId)
    key.vaultId = vault.id

    return next
}
