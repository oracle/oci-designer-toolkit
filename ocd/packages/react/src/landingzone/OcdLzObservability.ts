/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

/*
** Database Observability overlay (C1 — grounded in the oci-observability-dbm-opsi
** skill). When enabled on an LZ-origin design, materialises the canonical DBM +
** OPSI topology into the design model so a user can see and edit it:
**
**   Database Management (DBM) private endpoint   -> subnet (+ vcn)
**   Operations Insights (OPSI) private endpoint  -> subnet (+ vcn)
**   OPSI Database Insight                         -> database + OPSI private endpoint
**   Management Agent                              -> (host/db agent)
**
** Domain note from the skill: "DBM enabled" is NOT the same as "OPSI collecting".
** They are independent enablement paths and EACH needs its own private endpoint
** (and Vault-backed credentials). The overlay therefore emits a DBM PE and an
** OPSI PE separately and wires the Database Insight to the OPSI PE.
**
** The overlay is PURE and IDEMPOTENT: each emitted resource carries a
** `userDefined.lzObservability` role marker; re-applying upserts by that marker
** so a second pass yields the same design (no duplicates / drift). It is a no-op
** for non-LZ designs and when the toggle is off. It does NOT call any live OCI
** API — it only edits the design model.
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

/** `design.userDefined` key: the wizard / designer 'Database Observability' tick. */
export const LZ_OBSERVABILITY_ENABLED_KEY = 'lzObservabilityEnabled'

/** `resource.userDefined` key holding the overlay role marker. */
const OBSERVABILITY_ROLE_KEY = 'lzObservability'

/** The roles the overlay emits, in dependency order (PEs before the insight). */
export type ObservabilityRole = 'dbm_pe' | 'opsi_pe' | 'db_insight' | 'mgmt_agent'

type RoleSpec = OverlayRoleSpec<ObservabilityRole>

const ROLE_SPECS: readonly RoleSpec[] = [
    {
        role: 'dbm_pe',
        listKey: 'dbm_private_endpoint',
        displayName: 'DBM Private Endpoint',
        create: () => OciModelResources.OciDbmPrivateEndpoint.newResource('dbm_private_endpoint') as unknown as Record<string, unknown>,
    },
    {
        role: 'opsi_pe',
        listKey: 'opsi_private_endpoint',
        displayName: 'OPSI Private Endpoint',
        create: () => OciModelResources.OciOpsiPrivateEndpoint.newResource('opsi_private_endpoint') as unknown as Record<string, unknown>,
    },
    {
        role: 'db_insight',
        listKey: 'opsi_database_insight',
        displayName: 'Database Insight',
        create: () => OciModelResources.OciOpsiDatabaseInsight.newResource('opsi_database_insight') as unknown as Record<string, unknown>,
    },
    {
        role: 'mgmt_agent',
        listKey: 'management_agent',
        displayName: 'Management Agent',
        create: () => OciModelResources.OciManagementAgent.newResource('management_agent') as unknown as Record<string, unknown>,
    },
]

/** Shared find/upsert machinery bound to this overlay's role key + specs. */
const overlay = createOverlayContext(OBSERVABILITY_ROLE_KEY, ROLE_SPECS, 'whenEmpty')

/** Read the Database Observability tick off a design (defaults to false). */
export function isObservabilityEnabled(design: { userDefined?: Record<string, unknown> } | null | undefined): boolean {
    return isOverlayEnabled(design, LZ_OBSERVABILITY_ENABLED_KEY)
}

/** Find an overlay-emitted resource by its role marker (idempotent key). */
export function findObservabilityResource(design: OcdDesign, role: ObservabilityRole): Record<string, unknown> | undefined {
    return overlay.find(design, role)
}

const upsertRole = (design: OcdDesign, spec: RoleSpec, compartmentId: string): Record<string, unknown> =>
    overlay.upsert(design, spec, compartmentId)

/**
 * Apply the Database Observability overlay to a design. Pure + idempotent.
 *
 * Returns the SAME design reference when not applicable (not LZ-origin, toggle
 * off) so callers can skip a redundant update. Otherwise returns a NEW design
 * (the input is never mutated) with the DBM/OPSI topology upserted and wired.
 */
export function applyObservabilityOverlay(design: OcdDesign): OcdDesign {
    if (!isLzOriginDesign(design) || !isObservabilityEnabled(design)) return design

    const next = cloneDesign(design)
    // Target compartment: the first compartment in the design (root) — the user
    // can re-parent into a workload compartment afterwards.
    const compartmentId = rootCompartmentId(next)

    // FK targets resolved from existing network/db resources (empty string when
    // absent — the user fills them in; the resource still models correctly).
    const subnetId = firstId(next, 'subnet')
    const vcnId = firstId(next, 'vcn')
    const databaseId = firstId(next, 'autonomous_database') || firstId(next, 'db_system')

    const dbmPe = upsertRole(next, ROLE_SPECS[0], compartmentId)
    dbmPe.subnetId = subnetId
    dbmPe.vcnId = vcnId

    const opsiPe = upsertRole(next, ROLE_SPECS[1], compartmentId)
    opsiPe.subnetId = subnetId
    opsiPe.vcnId = vcnId

    const insight = upsertRole(next, ROLE_SPECS[2], compartmentId)
    // Wire the Database Insight to the OPSI private endpoint and a database.
    insight.opsiPrivateEndpointId = opsiPe.id
    insight.databaseId = databaseId

    upsertRole(next, ROLE_SPECS[3], compartmentId)

    return next
}
