/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

/*
** Enterprise IAM + Policy Blueprint overlay (C3). When enabled on an LZ-origin
** design, materialises a curated set of IAM groups, least-privilege policy
** bundles, and a cost-tracking tag namespace as editable model resources:
**
**   Groups (5)
**     lz-administrators   – broad admin scoped to tenancy
**     lz-network-admins   – VCN/subnet/DRG management in the network compartment
**     lz-security-admins  – security zones, Cloud Guard, Vault, NSGs
**     lz-developers       – compute and object storage in workload compartments
**     lz-auditors         – read-only read over the full tenancy
**
**   Policies (5, one per group) – statements use compartment display names
**   resolved from the design model; fall back to the root compartment name when
**   a specific compartment is not found.
**
**   Tag namespace `lz-governance` + cost-tracking tag keys:
**     cost-centre, environment, owner
**
** Pure and IDEMPOTENT: each emitted resource carries a `userDefined.lzIamBlueprint`
** role marker; re-applying upserts by that marker so a second pass yields the
** same design (no duplicates/drift). No live OCI calls. Compartment display names
** (never OCIDs) are used in policy statements — the user can refine compartment
** references after the overlay is applied.
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

/** `design.userDefined` key: the wizard / designer 'Enterprise IAM Blueprint' tick. */
export const LZ_IAM_BLUEPRINT_ENABLED_KEY = 'lzIamBlueprintEnabled'

/** `resource.userDefined` key holding the overlay role marker. */
const IAM_ROLE_KEY = 'lzIamBlueprint'

// ---------------------------------------------------------------------------
// Role types
// ---------------------------------------------------------------------------

export type IamGroupRole =
    | 'grp_administrators'
    | 'grp_network_admins'
    | 'grp_security_admins'
    | 'grp_developers'
    | 'grp_auditors'

export type IamPolicyRole =
    | 'pol_administrators'
    | 'pol_network_admins'
    | 'pol_security_admins'
    | 'pol_developers'
    | 'pol_auditors'

export type IamTagRole = 'tns_governance' | 'tag_cost_centre' | 'tag_environment' | 'tag_owner'

export type IamRole = IamGroupRole | IamPolicyRole | IamTagRole

// ---------------------------------------------------------------------------
// RoleSpec — unified across groups, policies, and tags
// ---------------------------------------------------------------------------

type RoleSpec = OverlayRoleSpec<IamRole>

const NEW = OciModelResources

const GROUP_SPECS: readonly RoleSpec[] = [
    {
        role: 'grp_administrators',
        listKey: 'group',
        displayName: 'lz-administrators',
        create: () => NEW.OciGroup.newResource('group') as unknown as Record<string, unknown>,
    },
    {
        role: 'grp_network_admins',
        listKey: 'group',
        displayName: 'lz-network-admins',
        create: () => NEW.OciGroup.newResource('group') as unknown as Record<string, unknown>,
    },
    {
        role: 'grp_security_admins',
        listKey: 'group',
        displayName: 'lz-security-admins',
        create: () => NEW.OciGroup.newResource('group') as unknown as Record<string, unknown>,
    },
    {
        role: 'grp_developers',
        listKey: 'group',
        displayName: 'lz-developers',
        create: () => NEW.OciGroup.newResource('group') as unknown as Record<string, unknown>,
    },
    {
        role: 'grp_auditors',
        listKey: 'group',
        displayName: 'lz-auditors',
        create: () => NEW.OciGroup.newResource('group') as unknown as Record<string, unknown>,
    },
]

const POLICY_SPECS: readonly RoleSpec[] = [
    {
        role: 'pol_administrators',
        listKey: 'policy',
        displayName: 'lz-administrators-policy',
        create: () => NEW.OciPolicy.newResource('policy') as unknown as Record<string, unknown>,
    },
    {
        role: 'pol_network_admins',
        listKey: 'policy',
        displayName: 'lz-network-admins-policy',
        create: () => NEW.OciPolicy.newResource('policy') as unknown as Record<string, unknown>,
    },
    {
        role: 'pol_security_admins',
        listKey: 'policy',
        displayName: 'lz-security-admins-policy',
        create: () => NEW.OciPolicy.newResource('policy') as unknown as Record<string, unknown>,
    },
    {
        role: 'pol_developers',
        listKey: 'policy',
        displayName: 'lz-developers-policy',
        create: () => NEW.OciPolicy.newResource('policy') as unknown as Record<string, unknown>,
    },
    {
        role: 'pol_auditors',
        listKey: 'policy',
        displayName: 'lz-auditors-policy',
        create: () => NEW.OciPolicy.newResource('policy') as unknown as Record<string, unknown>,
    },
]

const TAG_SPECS: readonly RoleSpec[] = [
    {
        role: 'tns_governance',
        listKey: 'tag_namespace',
        displayName: 'lz-governance',
        create: () => NEW.OciTagNamespace.newResource('tag_namespace') as unknown as Record<string, unknown>,
    },
    {
        role: 'tag_cost_centre',
        listKey: 'tag',
        displayName: 'cost-centre',
        create: () => NEW.OciTag.newResource('tag') as unknown as Record<string, unknown>,
    },
    {
        role: 'tag_environment',
        listKey: 'tag',
        displayName: 'environment',
        create: () => NEW.OciTag.newResource('tag') as unknown as Record<string, unknown>,
    },
    {
        role: 'tag_owner',
        listKey: 'tag',
        displayName: 'owner',
        create: () => NEW.OciTag.newResource('tag') as unknown as Record<string, unknown>,
    },
]

const ALL_SPECS: readonly RoleSpec[] = [...GROUP_SPECS, ...POLICY_SPECS, ...TAG_SPECS]

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** Shared find/upsert machinery bound to this overlay's role key + specs. */
const overlay = createOverlayContext(IAM_ROLE_KEY, ALL_SPECS, 'always')

/** Read the Enterprise IAM Blueprint tick off a design (defaults to false). */
export function isIamBlueprintEnabled(design: { userDefined?: Record<string, unknown> } | null | undefined): boolean {
    return isOverlayEnabled(design, LZ_IAM_BLUEPRINT_ENABLED_KEY)
}

/** Find an overlay-emitted resource by its role marker (idempotent key). */
export function findIamBlueprintResource(design: OcdDesign, role: IamRole): Record<string, unknown> | undefined {
    return overlay.find(design, role)
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Find-or-create the resource for a role; idempotent by role marker. Always sets
 * the canonical displayName so the overlay controls naming, not the UUID-suffix
 * factory default (e.g. "Tag f560").
 */
const upsertRole = (design: OcdDesign, spec: RoleSpec, compartmentId: string): Record<string, unknown> =>
    overlay.upsert(design, spec, compartmentId)

/**
 * Return the display name of the first compartment whose name includes the hint
 * (case-insensitive). Falls back to `fallback` when none matches.
 */
function compartmentDisplayName(
    compartments: Record<string, unknown>[],
    hint: string,
    fallback: string,
): string {
    const match = compartments.find((c) =>
        typeof c.displayName === 'string' && c.displayName.toLowerCase().includes(hint),
    )
    return typeof match?.displayName === 'string' ? match.displayName : fallback
}

// ---------------------------------------------------------------------------
// Policy statement builders
// ---------------------------------------------------------------------------

function buildAdminStatements(groupName: string): string[] {
    return [
        `Allow group ${groupName} to manage all-resources in tenancy`,
    ]
}

function buildNetworkStatements(groupName: string, networkCmpt: string): string[] {
    return [
        `Allow group ${groupName} to manage virtual-network-family in compartment ${networkCmpt}`,
        `Allow group ${groupName} to manage drg-family in compartment ${networkCmpt}`,
        `Allow group ${groupName} to manage load-balancers in compartment ${networkCmpt}`,
        `Allow group ${groupName} to read compartments in tenancy`,
    ]
}

function buildSecurityStatements(groupName: string, securityCmpt: string, networkCmpt: string): string[] {
    return [
        `Allow group ${groupName} to manage security-zones in compartment ${securityCmpt}`,
        `Allow group ${groupName} to manage cloud-guard-family in tenancy`,
        `Allow group ${groupName} to manage vaults in compartment ${securityCmpt}`,
        `Allow group ${groupName} to manage keys in compartment ${securityCmpt}`,
        `Allow group ${groupName} to manage network-security-groups in compartment ${networkCmpt}`,
        `Allow group ${groupName} to manage bastion-family in compartment ${securityCmpt}`,
        `Allow group ${groupName} to read compartments in tenancy`,
    ]
}

function buildDeveloperStatements(groupName: string, workloadCmpt: string): string[] {
    return [
        `Allow group ${groupName} to use instance-family in compartment ${workloadCmpt}`,
        `Allow group ${groupName} to manage object-family in compartment ${workloadCmpt}`,
        `Allow group ${groupName} to manage functions-family in compartment ${workloadCmpt}`,
        `Allow group ${groupName} to manage api-gateway-family in compartment ${workloadCmpt}`,
        `Allow group ${groupName} to use secret-family in compartment ${workloadCmpt}`,
        `Allow group ${groupName} to read compartments in tenancy`,
    ]
}

function buildAuditorStatements(groupName: string): string[] {
    return [
        `Allow group ${groupName} to read all-resources in tenancy`,
        `Allow group ${groupName} to use cloud-shell in tenancy`,
    ]
}

// ---------------------------------------------------------------------------
// Main overlay entry point
// ---------------------------------------------------------------------------

/**
 * Apply the Enterprise IAM + Policy Blueprint overlay. Pure + idempotent.
 *
 * Returns the SAME design reference when not applicable (not LZ-origin, toggle
 * off). Otherwise returns a NEW design (the input is never mutated) with IAM
 * groups, policies, and the `lz-governance` tag namespace upserted.
 */
export function applyIamBlueprintOverlay(design: OcdDesign): OcdDesign {
    if (!isLzOriginDesign(design) || !isIamBlueprintEnabled(design)) return design

    const next = cloneDesign(design)

    // Root compartment (id) — used as the resource parent.
    const compartments = (next.model.oci.resources?.compartment ?? []) as Record<string, unknown>[]
    const compartmentId = rootCompartmentId(next)

    // Resolve compartment display names for policy statements. Fall back to the
    // root compartment display name when a specific one is not found.
    const rootName = compartments.length > 0
        ? (typeof compartments[0].displayName === 'string' ? compartments[0].displayName : 'lz-root')
        : 'lz-root'
    const networkCmpt = compartmentDisplayName(compartments, 'network', rootName)
    const securityCmpt = compartmentDisplayName(compartments, 'security', rootName)
    const workloadCmpt = compartmentDisplayName(compartments, 'workload', compartmentDisplayName(compartments, 'application', rootName))

    // ----- Groups -----
    const grpAdmin = upsertRole(next, GROUP_SPECS[0], compartmentId)
    grpAdmin.description = 'Landing Zone administrators — full tenancy management.'

    const grpNetwork = upsertRole(next, GROUP_SPECS[1], compartmentId)
    grpNetwork.description = 'Landing Zone network administrators — VCN, subnets, DRG, LBaaS.'

    const grpSecurity = upsertRole(next, GROUP_SPECS[2], compartmentId)
    grpSecurity.description = 'Landing Zone security administrators — Cloud Guard, Vault, Bastion, NSGs.'

    const grpDev = upsertRole(next, GROUP_SPECS[3], compartmentId)
    grpDev.description = 'Landing Zone developers — compute and object storage in workload compartments.'

    const grpAudit = upsertRole(next, GROUP_SPECS[4], compartmentId)
    grpAudit.description = 'Landing Zone auditors — read-only across the full tenancy.'

    // Helper: safe display name string from a resource.
    const dn = (r: Record<string, unknown>) => String(r.displayName ?? '')

    // ----- Policies -----
    const polAdmin = upsertRole(next, POLICY_SPECS[0], compartmentId)
    polAdmin.description = 'Tenancy-wide admin rights for the lz-administrators group.'
    polAdmin.statements = buildAdminStatements(dn(grpAdmin))

    const polNetwork = upsertRole(next, POLICY_SPECS[1], compartmentId)
    polNetwork.description = 'Network management rights for lz-network-admins.'
    polNetwork.statements = buildNetworkStatements(dn(grpNetwork), networkCmpt)

    const polSecurity = upsertRole(next, POLICY_SPECS[2], compartmentId)
    polSecurity.description = 'Security resource rights for lz-security-admins.'
    polSecurity.statements = buildSecurityStatements(dn(grpSecurity), securityCmpt, networkCmpt)

    const polDev = upsertRole(next, POLICY_SPECS[3], compartmentId)
    polDev.description = 'Workload resource rights for lz-developers.'
    polDev.statements = buildDeveloperStatements(dn(grpDev), workloadCmpt)

    const polAudit = upsertRole(next, POLICY_SPECS[4], compartmentId)
    polAudit.description = 'Read-only tenancy access for lz-auditors.'
    polAudit.statements = buildAuditorStatements(dn(grpAudit))

    // ----- Tag namespace + cost-tracking tags -----
    const tagNs = upsertRole(next, TAG_SPECS[0], compartmentId)
    tagNs.description = 'Governance tag namespace for cost tracking and environment classification.'

    const tagCostCentre = upsertRole(next, TAG_SPECS[1], compartmentId)
    tagCostCentre.description = 'Cost centre identifier for chargeback reporting.'
    tagCostCentre.isCostTracking = true
    tagCostCentre.tagNamespaceId = tagNs.id

    const tagEnvironment = upsertRole(next, TAG_SPECS[2], compartmentId)
    tagEnvironment.description = 'Deployment environment (prod, staging, dev, etc.).'
    tagEnvironment.isCostTracking = true
    tagEnvironment.tagNamespaceId = tagNs.id

    const tagOwner = upsertRole(next, TAG_SPECS[3], compartmentId)
    tagOwner.description = 'Resource owner for accountability and cost allocation.'
    tagOwner.isCostTracking = true
    tagOwner.tagNamespaceId = tagNs.id

    return next
}
