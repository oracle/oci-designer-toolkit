/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

/*
** Cross-Tenancy Hub-Spoke overlay (C4). When enabled on an LZ-origin design,
** materialises the OCI best-practice topology for connecting TWO tenancies:
** a symmetric DRG + Remote Peering Connection (RPC) pair.
**
**   Hub tenancy (local)                 Peer tenancy (remote)
**     hub DRG  ───────── RPC  <=peer=>  RPC ───────── peer DRG
**       │                                               │
**     hub VCN (10.0.0.0/16)                  peer VCN (10.1.0.0/16)
**       └ transit subnet 10.0.0.0/24          └ transit subnet 10.1.0.0/24
**       (DRG attachment)                      (DRG attachment)
**
** Best-practice notes encoded here:
**   - Each tenancy owns its OWN DRG; the cross-tenancy link is a Remote Peering
**     Connection on each DRG that names the PEER tenancy + region
**     (OciRemotePeeringConnection.peerTenancyId / peerRegionName). The two RPCs
**     reference each other via peerId (the established handshake).
**   - VCN CIDRs MUST NOT overlap across peered tenancies — hub 10.0/16 vs
**     peer 10.1/16.
**   - Each VCN is attached to its DRG via a DRG attachment so transit routing
**     works once the RPC is up.
**
** Pure + IDEMPOTENT, mirroring OcdLzOke / OcdLzObservability: every emitted
** resource carries a `userDefined.lzCrossTenancyHubSpoke` role marker; re-applying
** upserts by that marker so a second pass yields the SAME design. No live OCI
** calls — it only edits the design model.
*/

import { OcdDesign, OciModelResources } from '@ocd/model'
import { isLzOriginDesign } from './OcdLzPlacement'
import {
    cloneDesign,
    createOverlayContext,
    isOverlayEnabled,
    OverlayRoleSpec,
    rootCompartmentId,
} from './OcdLzOverlay'

/** `design.userDefined` key: the wizard / designer 'Cross-Tenancy Hub-Spoke' tick. */
export const LZ_CROSSTENANCY_HUBSPOKE_ENABLED_KEY = 'lzCrossTenancyHubSpokeEnabled'

/** `resource.userDefined` key holding the overlay role marker. */
const CT_ROLE_KEY = 'lzCrossTenancyHubSpoke'

export type CrossTenancyHubSpokeRole =
    | 'hub_drg' | 'hub_vcn' | 'hub_subnet' | 'hub_attachment' | 'hub_rpc'
    | 'peer_drg' | 'peer_vcn' | 'peer_subnet' | 'peer_attachment' | 'peer_rpc'

type RoleSpec = OverlayRoleSpec<CrossTenancyHubSpokeRole>

const NEW = OciModelResources
const ROLE_SPECS: readonly RoleSpec[] = [
    { role: 'hub_drg', listKey: 'drg', displayName: 'Hub DRG (local tenancy)', create: () => NEW.OciDrg.newResource('drg') as unknown as Record<string, unknown> },
    { role: 'hub_vcn', listKey: 'vcn', displayName: 'Hub VCN', create: () => NEW.OciVcn.newResource('vcn') as unknown as Record<string, unknown> },
    { role: 'hub_subnet', listKey: 'subnet', displayName: 'Hub Transit Subnet', create: () => NEW.OciSubnet.newResource('subnet') as unknown as Record<string, unknown> },
    { role: 'hub_attachment', listKey: 'drg_attachment', displayName: 'Hub VCN ⇒ DRG Attachment', create: () => NEW.OciDrgAttachment.newResource('drg_attachment') as unknown as Record<string, unknown> },
    { role: 'hub_rpc', listKey: 'remote_peering_connection', displayName: 'Hub RPC (peers remote tenancy)', create: () => NEW.OciRemotePeeringConnection.newResource('remote_peering_connection') as unknown as Record<string, unknown> },
    { role: 'peer_drg', listKey: 'drg', displayName: 'Peer DRG (remote tenancy)', create: () => NEW.OciDrg.newResource('drg') as unknown as Record<string, unknown> },
    { role: 'peer_vcn', listKey: 'vcn', displayName: 'Peer VCN (remote tenancy)', create: () => NEW.OciVcn.newResource('vcn') as unknown as Record<string, unknown> },
    { role: 'peer_subnet', listKey: 'subnet', displayName: 'Peer Transit Subnet (remote tenancy)', create: () => NEW.OciSubnet.newResource('subnet') as unknown as Record<string, unknown> },
    { role: 'peer_attachment', listKey: 'drg_attachment', displayName: 'Peer VCN ⇒ DRG Attachment', create: () => NEW.OciDrgAttachment.newResource('drg_attachment') as unknown as Record<string, unknown> },
    { role: 'peer_rpc', listKey: 'remote_peering_connection', displayName: 'Peer RPC (peers local tenancy)', create: () => NEW.OciRemotePeeringConnection.newResource('remote_peering_connection') as unknown as Record<string, unknown> },
]

/** Non-overlapping reference CIDRs (peered VCNs may not overlap). */
const HUB_VCN_CIDR = '10.0.0.0/16'
const HUB_SUBNET_CIDR = '10.0.0.0/24'
const PEER_VCN_CIDR = '10.1.0.0/16'
const PEER_SUBNET_CIDR = '10.1.0.0/24'

/**
 * Synthetic placeholders the user replaces with the real peer tenancy OCID /
 * region. Deliberately NOT real OCIDs (public fork) — they read as obvious
 * fill-me-in tokens in the properties panel and exported tfvars.
 */
const PEER_TENANCY_PLACEHOLDER = '<peer-tenancy-ocid>'
const PEER_REGION_PLACEHOLDER = '<peer-region>'
const HUB_TENANCY_PLACEHOLDER = '<hub-tenancy-ocid>'
const HUB_REGION_PLACEHOLDER = '<hub-region>'

/** Shared find/upsert machinery bound to this overlay's role key + specs. */
const overlay = createOverlayContext(CT_ROLE_KEY, ROLE_SPECS, 'always')

export function isCrossTenancyHubSpokeEnabled(design: { userDefined?: Record<string, unknown> } | null | undefined): boolean {
    return isOverlayEnabled(design, LZ_CROSSTENANCY_HUBSPOKE_ENABLED_KEY)
}

/** Find an overlay-emitted resource by its role marker. */
export function findCrossTenancyResource(design: OcdDesign, role: CrossTenancyHubSpokeRole): Record<string, unknown> | undefined {
    return overlay.find(design, role)
}

const spec = (role: CrossTenancyHubSpokeRole): RoleSpec => ROLE_SPECS.find((s) => s.role === role)!
const upsertRole = (design: OcdDesign, role: CrossTenancyHubSpokeRole, compartmentId: string): Record<string, unknown> =>
    overlay.upsert(design, spec(role), compartmentId)

/**
 * Apply the Cross-Tenancy Hub-Spoke overlay. Pure + idempotent. Returns the SAME
 * reference when not applicable (not LZ-origin, toggle off); otherwise a NEW
 * design with the symmetric DRG + RPC two-tenancy peering topology upserted and
 * wired.
 */
export function applyCrossTenancyHubSpokeOverlay(design: OcdDesign): OcdDesign {
    if (!isLzOriginDesign(design) || !isCrossTenancyHubSpokeEnabled(design)) return design

    const next = cloneDesign(design)
    const compartmentId = rootCompartmentId(next)

    // ── Hub side (local tenancy) ──────────────────────────────────────────
    const hubDrg = upsertRole(next, 'hub_drg', compartmentId)
    const hubVcn = upsertRole(next, 'hub_vcn', compartmentId)
    hubVcn.cidrBlocks = [HUB_VCN_CIDR]
    const hubSubnet = upsertRole(next, 'hub_subnet', compartmentId)
    hubSubnet.vcnId = hubVcn.id
    hubSubnet.cidrBlock = HUB_SUBNET_CIDR
    const hubAttachment = upsertRole(next, 'hub_attachment', compartmentId)
    hubAttachment.drgId = hubDrg.id
    hubAttachment.networkDetails = { ids: [hubVcn.id as string] }

    // ── Peer side (remote tenancy) ────────────────────────────────────────
    const peerDrg = upsertRole(next, 'peer_drg', compartmentId)
    const peerVcn = upsertRole(next, 'peer_vcn', compartmentId)
    peerVcn.cidrBlocks = [PEER_VCN_CIDR]
    const peerSubnet = upsertRole(next, 'peer_subnet', compartmentId)
    peerSubnet.vcnId = peerVcn.id
    peerSubnet.cidrBlock = PEER_SUBNET_CIDR
    const peerAttachment = upsertRole(next, 'peer_attachment', compartmentId)
    peerAttachment.drgId = peerDrg.id
    peerAttachment.networkDetails = { ids: [peerVcn.id as string] }

    // ── Cross-tenancy RPC pair (the actual two-tenancy link) ──────────────
    // Each tenancy's DRG hosts an RPC naming the PEER tenancy + region. The two
    // RPCs reference each other via peerId.
    const hubRpc = upsertRole(next, 'hub_rpc', compartmentId)
    hubRpc.drgId = hubDrg.id
    hubRpc.peerTenancyId = PEER_TENANCY_PLACEHOLDER
    hubRpc.peerRegionName = PEER_REGION_PLACEHOLDER

    const peerRpc = upsertRole(next, 'peer_rpc', compartmentId)
    peerRpc.drgId = peerDrg.id
    peerRpc.peerTenancyId = HUB_TENANCY_PLACEHOLDER
    peerRpc.peerRegionName = HUB_REGION_PLACEHOLDER

    hubRpc.peerId = peerRpc.id
    peerRpc.peerId = hubRpc.id

    return next
}
