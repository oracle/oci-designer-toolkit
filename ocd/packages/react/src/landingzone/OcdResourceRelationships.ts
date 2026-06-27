/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

/**
 * OcdResourceRelationships — A4 part 2 (resource relationship panel).
 *
 * Given an OCD model resource type (the PascalCase form used inside
 * `OciModelResources`, e.g. 'Vcn', 'Subnet', 'Instance') this module
 * derives the **informational** parent/child/connection relationship metadata
 * by querying the existing `OciModelResources.Xxx.allowedParentTypes()` and
 * `OciModelResources.Xxx.getConnectionIds()` function signatures that are
 * already present on every resource namespace in the model package.
 *
 * Data source priority (as directed by the task spec):
 *   1. OciModelResources.Xxx.allowedParentTypes() — primary; each resource
 *      declares its own parent(s), so child derivation is the inverse:
 *      resources that declare the queried type as a parent.
 *   2. Connection type labels are inferred from the connection field names
 *      on the generated OciXxx interface (field names ending in 'Id' or
 *      'Ids' that are not 'compartmentId' or the parent-id field).
 *
 * This module is intentionally pure (no React, no side effects) so it can be
 * tested with plain Vitest unit tests.
 */

import { OciModelResources } from '@ocd/model'

export interface ResourceRelationships {
    /** PascalCase resource type names that are valid parents of this resource. */
    parents: string[]
    /** PascalCase resource type names that can be children of this resource. */
    children: string[]
    /**
     * Human-readable connection/reference relationship labels, derived from
     * connection-id field names on the resource interface.  These are
     * informational only (not live resource IDs).
     */
    connectionLabels: string[]
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/** Build the OciModelResources namespace key from a PascalCase resource type. */
function namespaceKey(resourceType: string): string {
    return `Oci${resourceType}`
}

/**
 * Retrieve the `allowedParentTypes()` result for a given PascalCase resource
 * type, or `undefined` if the namespace/function does not exist.
 */
function getParentTypes(resourceType: string): string[] | undefined {
    const nsKey = namespaceKey(resourceType)
    // @ts-ignore — dynamic lookup by namespace key
    const ns = OciModelResources[nsKey]
    if (!ns || typeof ns.allowedParentTypes !== 'function') return undefined
    return ns.allowedParentTypes() as string[]
}

/**
 * Derive a human-readable label from a camelCase field name that ends in
 * `Id` or `Ids`, e.g. `routeTableId` → `Route Table`,
 * `securityListIds` → `Security Lists`.
 */
function fieldToLabel(fieldName: string): string {
    const withoutSuffix = fieldName.replace(/Ids$/, 's').replace(/Id$/, '')
    // camelCase → words
    const words = withoutSuffix
        .replace(/([A-Z])/g, ' $1')
        .trim()
    return words.charAt(0).toUpperCase() + words.slice(1)
}

// ---------------------------------------------------------------------------
// Exported API
// ---------------------------------------------------------------------------

/**
 * Collect all OCI resource type names (PascalCase) known to the model.
 * Memoised since the model namespace is static.
 */
let _allOciTypes: string[] | undefined

function allOciResourceTypes(): string[] {
    if (_allOciTypes) return _allOciTypes
    _allOciTypes = Object.keys(OciModelResources)
        .filter((k) => k.startsWith('Oci'))
        .map((k) => k.slice(3)) // strip 'Oci' prefix → PascalCase type
    return _allOciTypes
}

/**
 * Derive the relationships for the given PascalCase OCI resource type.
 *
 * @param resourceType  PascalCase type as stored in `OcdResource.resourceType`,
 *                      e.g. `'Vcn'`, `'Subnet'`, `'Instance'`.
 *
 * @returns `{ parents, children, connectionLabels }` — all arrays may be empty
 *          if the resource type is unknown or has no declared relationships.
 *          Returns `undefined` only if the resource type is entirely unknown to
 *          the model (not an OCI resource at all).
 */
export function getOciResourceRelationships(resourceType: string): ResourceRelationships | undefined {
    const nsKey = namespaceKey(resourceType)
    // @ts-ignore
    const ns = OciModelResources[nsKey]
    if (!ns) return undefined

    // 1. Parents — from the resource's own allowedParentTypes()
    const parents: string[] = typeof ns.allowedParentTypes === 'function'
        ? (ns.allowedParentTypes() as string[])
        : []

    // 2. Children — inverse: all resources whose allowedParentTypes includes this type
    const children: string[] = allOciResourceTypes().filter((candidateType) => {
        if (candidateType === resourceType) return false
        const candidateParents = getParentTypes(candidateType)
        return candidateParents !== undefined && candidateParents.includes(resourceType)
    })

    // 3. Connection labels — inspect field names on the new resource instance
    //    looking for *Id / *Ids fields that are not the parent or compartment id.
    const connectionLabels: string[] = []
    if (typeof ns.newResource === 'function') {
        try {
            const sample = ns.newResource()
            // Fields that are known "structural" ids, not connections
            const parentIdFields = new Set(['compartmentId', 'id'])
            if (typeof ns.getParentId === 'function') {
                // getParentId inspects the resource, so we can't easily derive the
                // field name, but for well-known patterns (vcnId, subnetId) we
                // exclude them via allowedParentTypes below.
                // We'll just skip fields whose value == sample.compartmentId or ''
            }
            // Derive parent-id field names from allowedParentTypes names
            const parentFieldCandidates = new Set(
                parents.map((p) => {
                    // 'Vcn' -> 'vcnId', 'Subnet' -> 'subnetId'
                    const lower = p.charAt(0).toLowerCase() + p.slice(1)
                    return `${lower}Id`
                })
            )
            for (const key of Object.keys(sample)) {
                if (parentIdFields.has(key)) continue
                if (parentFieldCandidates.has(key)) continue
                if (key.endsWith('Id') || key.endsWith('Ids')) {
                    connectionLabels.push(fieldToLabel(key))
                }
            }
        } catch {
            // If newResource throws for any reason, skip connection derivation
        }
    }

    return { parents, children, connectionLabels }
}
