/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

/**
 * Pure, immutable diff engine for OcdDesign pair comparison.
 *
 * Produces a Terraform-plan-style list of PlanEntry objects from two designs:
 *   - target-only resources  → create
 *   - base-only resources    → delete
 *   - matched resources with semantic changes → update (with field-level diff)
 *   - matched resources with no semantic changes → no-op
 *
 * Matching strategy (in order):
 *   1. resourceType + displayName match (ids diverge across import/regeneration)
 *   2. id match (same-session edits where names changed)
 *
 * Only OCI model resources are compared. Azure/Google/General resources are
 * ignored — they are not produced by the LZNG → model bridge today.
 */

import { OcdDesign } from '@ocd/model'

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export type PlanAction = 'create' | 'update' | 'delete' | 'no-op'

export interface PlanFieldChange {
    field: string
    from: unknown
    to: unknown
}

export interface PlanEntry {
    /** create / update / delete / no-op */
    action: PlanAction
    /** The OCI resource collection key (e.g. 'compartment', 'vcn') */
    resourceKey: string
    /** The resource id from whichever design has it (base or target) */
    resourceId: string
    /** Human-readable name */
    displayName: string
    /** e.g. 'Compartment', 'Vcn' */
    resourceType: string
    /** Non-empty only for 'update' entries */
    changes?: PlanFieldChange[]
}

export interface PlanSummary {
    create: number
    update: number
    delete: number
    noop: number
    total: number
}

// ---------------------------------------------------------------------------
// Volatile / non-semantic fields excluded from the diff
//
// These fields either differ by design between two independently-generated
// imports (id, ocid, uuid-bearing cross-reference ids) or are canvas
// view-layer coordinates that carry no business meaning in a plan.
// ---------------------------------------------------------------------------

/**
 * Top-level field names that are always excluded from the field-level diff.
 *
 * Rationale per category:
 *   id / okitReference   — assigned fresh on each import/clone; not stable
 *   ocid                 — OCI-side OCID, not set at design-time
 *   *Id suffix           — uuid cross-reference fields (compartmentId,
 *                          vcnId, routeTableId, …) are internal pointers
 *                          that will differ between two separate imports even
 *                          when the logical topology is identical
 *   region               — populated from wizard config, not from OE JSON;
 *                          may legitimately differ between base and target
 *   documentation        — free-text annotation, not structural
 */
export const VOLATILE_FIELDS: ReadonlySet<string> = new Set([
    'id',
    'ocid',
    'okitReference',
    'region',
    'documentation',
])

/**
 * Returns true if a field name should be excluded from the semantic diff.
 * In addition to the fixed VOLATILE_FIELDS set, any field whose name ends
 * with 'Id' or 'Ids' is treated as a uuid cross-reference pointer.
 */
export function isVolatileField(field: string): boolean {
    if (VOLATILE_FIELDS.has(field)) return true
    // uuid cross-reference fields: compartmentId, vcnId, routeTableId, …
    if (field.endsWith('Id') || field.endsWith('Ids')) return true
    return false
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Extract all OCI resources from a design as a flat map keyed by
 * `resourceKey`.  Each value is the array of resources for that key.
 * Returns an empty object when the design has no OCI model.
 */
function getOciResourceMap(design: OcdDesign): Record<string, unknown[]> {
    return (design.model?.oci?.resources ?? {}) as Record<string, unknown[]>
}

/**
 * Extract displayName from a raw resource object.  Falls back to the
 * resource `id` field, then to an empty string, so the caller always
 * gets a string without risk of throwing.
 */
function getDisplayName(resource: Record<string, unknown>): string {
    const dn = resource['displayName']
    if (typeof dn === 'string' && dn.length > 0) return dn
    const id = resource['id']
    if (typeof id === 'string') return id
    return ''
}

function getResourceType(resource: Record<string, unknown>): string {
    const rt = resource['resourceType']
    return typeof rt === 'string' ? rt : ''
}

function getId(resource: Record<string, unknown>): string {
    const id = resource['id']
    return typeof id === 'string' ? id : ''
}

/**
 * Build a stable match key from type + display name for primary matching.
 * Lower-cased and trimmed to be resilient to minor whitespace/case drift.
 */
function matchKey(resourceType: string, displayName: string): string {
    return `${resourceType.toLowerCase().trim()}::${displayName.toLowerCase().trim()}`
}

/**
 * Perform a shallow, field-level diff between two raw resource objects,
 * excluding volatile fields.  Returns an array of PlanFieldChange (empty
 * when the resources are semantically identical).
 */
function diffResourceFields(
    base: Record<string, unknown>,
    target: Record<string, unknown>,
): PlanFieldChange[] {
    const changes: PlanFieldChange[] = []

    // Collect all non-volatile field names from both objects
    const allFields = new Set<string>([
        ...Object.keys(base),
        ...Object.keys(target),
    ])

    for (const field of Array.from(allFields).sort()) {
        if (isVolatileField(field)) continue

        const fromVal = base[field]
        const toVal = target[field]

        // Deep equality via JSON serialisation: handles nested objects and
        // arrays without pulling in a third-party equality library.
        const fromSer = JSON.stringify(fromVal)
        const toSer = JSON.stringify(toVal)

        if (fromSer !== toSer) {
            changes.push({ field, from: fromVal, to: toVal })
        }
    }

    return changes
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Diff two OcdDesigns and produce a deterministic PlanEntry[] sorted by
 * action priority (create → update → delete → no-op) and then by
 * resourceKey + displayName within each group.
 *
 * @param base   The current / already-applied design (e.g. what is open in
 *               the Designer canvas).
 * @param target The incoming / proposed design (e.g. re-generated from the
 *               LZ wizard or a freshly-imported LZNG JSON set).
 */
export function diffDesigns(base: OcdDesign, target: OcdDesign): PlanEntry[] {
    const baseMap = getOciResourceMap(base)
    const targetMap = getOciResourceMap(target)

    // Collect every resource key present in either design
    const allKeys = Array.from(
        new Set([...Object.keys(baseMap), ...Object.keys(targetMap)]),
    ).sort()

    const entries: PlanEntry[] = []

    for (const resourceKey of allKeys) {
        const baseResources = (baseMap[resourceKey] ?? []) as Record<string, unknown>[]
        const targetResources = (targetMap[resourceKey] ?? []) as Record<string, unknown>[]

        // Build a lookup from primary match key → resource for each side
        const baseByMatchKey = new Map<string, Record<string, unknown>>()
        const baseById = new Map<string, Record<string, unknown>>()
        for (const r of baseResources) {
            const key = matchKey(getResourceType(r), getDisplayName(r))
            if (key && !baseByMatchKey.has(key)) baseByMatchKey.set(key, r)
            const id = getId(r)
            if (id) baseById.set(id, r)
        }

        // Track which base resources were matched (to find deletes later)
        const matchedBaseKeys = new Set<string>()
        const matchedBaseIds = new Set<string>()

        // Walk target resources to classify create / update / no-op
        for (const tr of targetResources) {
            const trType = getResourceType(tr)
            const trDisplay = getDisplayName(tr)
            const trId = getId(tr)
            const trMatchKey = matchKey(trType, trDisplay)

            // Try primary match (type + displayName)
            let base = baseByMatchKey.get(trMatchKey)
            let usedId = false

            if (base !== undefined) {
                matchedBaseKeys.add(trMatchKey)
                matchedBaseIds.add(getId(base))
            } else {
                // Fall back to id match
                base = trId ? baseById.get(trId) : undefined
                if (base !== undefined) {
                    usedId = true
                    matchedBaseIds.add(trId)
                    // Also mark by match key so we don't double-delete
                    const bMatchKey = matchKey(getResourceType(base), getDisplayName(base))
                    matchedBaseKeys.add(bMatchKey)
                }
            }

            if (base === undefined) {
                // Not found in base → create
                entries.push({
                    action: 'create',
                    resourceKey,
                    resourceId: trId,
                    displayName: trDisplay,
                    resourceType: trType,
                })
            } else {
                // Found → check for field changes
                const changes = diffResourceFields(base, tr)
                const action: PlanAction = changes.length > 0 ? 'update' : 'no-op'
                const entry: PlanEntry = {
                    action,
                    resourceKey,
                    // Use the base id for context (it's what's "on disk")
                    resourceId: usedId ? trId : getId(base),
                    displayName: trDisplay || getDisplayName(base),
                    resourceType: trType || getResourceType(base),
                }
                if (action === 'update') {
                    entry.changes = changes
                }
                entries.push(entry)
            }
        }

        // Any base resources not matched by the target are deletes
        for (const br of baseResources) {
            const brMatchKey = matchKey(getResourceType(br), getDisplayName(br))
            const brId = getId(br)
            const wasMatched = matchedBaseKeys.has(brMatchKey) || matchedBaseIds.has(brId)
            if (!wasMatched) {
                entries.push({
                    action: 'delete',
                    resourceKey,
                    resourceId: brId,
                    displayName: getDisplayName(br),
                    resourceType: getResourceType(br),
                })
            }
        }
    }

    // Sort: create → update → delete → no-op, then resourceKey, then displayName
    const ACTION_ORDER: Record<PlanAction, number> = {
        create: 0,
        update: 1,
        delete: 2,
        'no-op': 3,
    }
    entries.sort((a, b) => {
        const ao = ACTION_ORDER[a.action]
        const bo = ACTION_ORDER[b.action]
        if (ao !== bo) return ao - bo
        if (a.resourceKey !== b.resourceKey) return a.resourceKey.localeCompare(b.resourceKey)
        return a.displayName.localeCompare(b.displayName)
    })

    return entries
}

/**
 * Summarise a PlanEntry[] into counts per action.
 */
export function summarizePlan(entries: PlanEntry[]): PlanSummary {
    const summary: PlanSummary = { create: 0, update: 0, delete: 0, noop: 0, total: 0 }
    for (const e of entries) {
        summary.total++
        switch (e.action) {
            case 'create': summary.create++; break
            case 'update': summary.update++; break
            case 'delete': summary.delete++; break
            case 'no-op':  summary.noop++;   break
        }
    }
    return summary
}
