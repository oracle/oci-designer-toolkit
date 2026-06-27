/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

/*
** Shared mechanics for the role-marked LZ overlays (C1 Observability, C2 OKE,
** C3 IAM Blueprint).
**
** Each overlay materialises a fixed set of OCI model resources onto an LZ-origin
** design. Every emitted resource carries a `userDefined.<roleKey>` role marker;
** re-applying upserts by that marker so a second pass yields the SAME design (no
** duplicates / drift). The overlays differ ONLY in the per-blueprint specs they
** supply (which roles, which list keys, which resource factories) and a small
** display-name policy — the clone / find / upsert / idempotency machinery is
** identical and lives here.
**
** Purity: the input design is never mutated. Callers deep-clone via `cloneDesign`
** (mirroring OcdResource.cloneResource's JSON round-trip) before any change.
**
** Note: OcdLzScaffold is a sibling overlay but operates on view-only
** `general.resources.rectangle` containers + nested view coords (a different
** shape); it reuses `cloneDesign` from here but keeps its own marker/geometry
** mechanics.
*/

import { OcdDesign } from '@ocd/model'

/**
 * A single overlay resource spec — the per-blueprint data that varies across
 * overlays. Generic over the overlay's role union `R`.
 */
export interface OverlayRoleSpec<R extends string> {
    /** Stable role marker stored under `resource.userDefined[roleKey]`. */
    role: R
    /** Schema key = key under `design.model.oci.resources`. */
    listKey: string
    /** Canonical display name for the emitted resource. */
    displayName: string
    /** Factory for a fresh model resource of this type. */
    create: () => Record<string, unknown>
}

/** Controls when `upsert` writes the canonical `displayName`. */
export type DisplayNamePolicy = 'always' | 'whenEmpty'

/** Deep clone a design (mirrors OcdResource.cloneResource's JSON round-trip). */
export function cloneDesign(design: OcdDesign): OcdDesign {
    return JSON.parse(JSON.stringify(design)) as OcdDesign
}

/** First id from a resource list (used to resolve FK targets), or ''. */
export function firstId(design: OcdDesign, listKey: string): string {
    const list = (design.model.oci.resources?.[listKey] ?? []) as Record<string, unknown>[]
    return list.length > 0 ? (list[0].id as string) : ''
}

/** Id of the first (root) compartment in the design, or '' when none exist. */
export function rootCompartmentId(design: OcdDesign): string {
    const compartments = (design.model.oci.resources?.compartment ?? []) as Record<string, unknown>[]
    return compartments.length > 0 ? (compartments[0].id as string) : ''
}

/** Read a boolean overlay toggle off a design's `userDefined` (defaults false). */
export function isOverlayEnabled(
    design: { userDefined?: Record<string, unknown> } | null | undefined,
    enabledKey: string,
): boolean {
    return Boolean(design?.userDefined?.[enabledKey])
}

/**
 * The shared find/upsert machinery for one overlay, bound to its role marker key
 * and resource specs. All three OCI overlays delegate their `readRole`,
 * `find*Resource`, and `upsertRole` helpers to an instance of this.
 */
export interface OverlayContext<R extends string> {
    /** Read the role marker off a resource, or undefined. */
    readRole(resource: Record<string, unknown>): R | undefined
    /** Find an overlay-emitted resource by its role marker (idempotent key). */
    find(design: OcdDesign, role: R): Record<string, unknown> | undefined
    /**
     * Find-or-create the resource for a spec; idempotent by role marker. Sets the
     * role marker + compartment, and the display name per the overlay's policy.
     * The design here is a mutable clone.
     */
    upsert(design: OcdDesign, spec: OverlayRoleSpec<R>, compartmentId: string): Record<string, unknown>
}

/**
 * Build the shared overlay context for a role-marked OCI overlay.
 *
 * @param roleKey         `resource.userDefined` key holding the role marker.
 * @param specs           The overlay's resource specs (drives `find`).
 * @param displayNamePolicy `'always'` overwrites displayName on every upsert;
 *                        `'whenEmpty'` only sets it when currently empty.
 */
export function createOverlayContext<R extends string>(
    roleKey: string,
    specs: readonly OverlayRoleSpec<R>[],
    displayNamePolicy: DisplayNamePolicy = 'always',
): OverlayContext<R> {
    const readRole = (resource: Record<string, unknown>): R | undefined => {
        const role = (resource.userDefined as Record<string, unknown> | undefined)?.[roleKey]
        return typeof role === 'string' ? (role as R) : undefined
    }

    const find = (design: OcdDesign, role: R): Record<string, unknown> | undefined => {
        const spec = specs.find((s) => s.role === role)
        if (!spec) return undefined
        const list = (design.model.oci.resources?.[spec.listKey] ?? []) as Record<string, unknown>[]
        return list.find((r) => readRole(r) === role)
    }

    const upsert = (design: OcdDesign, spec: OverlayRoleSpec<R>, compartmentId: string): Record<string, unknown> => {
        if (!Array.isArray(design.model.oci.resources[spec.listKey])) {
            design.model.oci.resources[spec.listKey] = []
        }
        const list = design.model.oci.resources[spec.listKey] as Record<string, unknown>[]
        let resource = list.find((r) => readRole(r) === spec.role)
        if (!resource) {
            resource = spec.create()
            list.push(resource)
        }
        const userDefined = (resource.userDefined as Record<string, unknown>) ?? {}
        resource.userDefined = { ...userDefined, [roleKey]: spec.role }
        resource.compartmentId = compartmentId
        if (displayNamePolicy === 'always') {
            resource.displayName = spec.displayName
        } else if (!resource.displayName || resource.displayName === '') {
            resource.displayName = spec.displayName
        }
        return resource
    }

    return { readRole, find, upsert }
}
