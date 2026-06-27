/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

import { describe, expect, it } from 'vitest'
import { OcdDesign } from '@ocd/model'
import { LandingZoneConfig } from '../OcdLzConfig'
import { buildOcdDesignFromLz } from '../OcdLzToModel'
import {
    applyIamBlueprintOverlay,
    findIamBlueprintResource,
    isIamBlueprintEnabled,
    LZ_IAM_BLUEPRINT_ENABLED_KEY,
} from '../OcdLzIamBlueprint'

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

function makeConfig(): LandingZoneConfig {
    return {
        region: 'eu-frankfurt-1',
        regionShortName: 'fra',
        realm: 'oc1',
        hubKind: 'hub_a',
        hubVcn: '10.100.0.0/21',
        environments: [
            {
                name: 'prod',
                securityZone: true,
                spokeVcn: '10.0.64.0/21',
                projects: ['proj1'],
                platforms: [],
            },
        ],
    }
}

/** LZ-origin design; IAM blueprint toggle off unless `enabled` is set. */
function makeDesign(enabled = false): OcdDesign {
    const design = buildOcdDesignFromLz([], 'Landing Zone', makeConfig()).design
    design.userDefined[LZ_IAM_BLUEPRINT_ENABLED_KEY] = enabled
    return design
}

function ociList(design: OcdDesign, key: string): Record<string, unknown>[] {
    return (design.model.oci.resources?.[key] ?? []) as Record<string, unknown>[]
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('OcdLzIamBlueprint', () => {
    // --- toggle guard ---

    it('is a no-op (same reference) when the toggle is off', () => {
        const design = makeDesign(false)
        expect(isIamBlueprintEnabled(design)).toBe(false)
        expect(applyIamBlueprintOverlay(design)).toBe(design)
    })

    it('is a no-op for a non-LZ design even when the flag is set', () => {
        const design = makeDesign(true)
        design.userDefined.lzOrigin = false
        expect(applyIamBlueprintOverlay(design)).toBe(design)
    })

    // --- resource counts ---

    it('creates all 5 groups when enabled', () => {
        const result = applyIamBlueprintOverlay(makeDesign(true))
        const groups = ociList(result, 'group').filter(
            (r) => typeof (r.userDefined as Record<string, unknown>)?.lzIamBlueprint === 'string',
        )
        expect(groups).toHaveLength(5)
    })

    it('creates all 5 policies when enabled', () => {
        const result = applyIamBlueprintOverlay(makeDesign(true))
        const policies = ociList(result, 'policy').filter(
            (r) => typeof (r.userDefined as Record<string, unknown>)?.lzIamBlueprint === 'string',
        )
        expect(policies).toHaveLength(5)
    })

    it('creates the lz-governance tag namespace when enabled', () => {
        const result = applyIamBlueprintOverlay(makeDesign(true))
        expect(ociList(result, 'tag_namespace')).toHaveLength(1)
    })

    it('creates exactly 3 cost-tracking tags (cost-centre, environment, owner)', () => {
        const result = applyIamBlueprintOverlay(makeDesign(true))
        const tags = ociList(result, 'tag').filter(
            (r) => typeof (r.userDefined as Record<string, unknown>)?.lzIamBlueprint === 'string',
        )
        expect(tags).toHaveLength(3)
        const names = tags.map((t) => t.displayName)
        expect(names).toContain('cost-centre')
        expect(names).toContain('environment')
        expect(names).toContain('owner')
    })

    // --- tag FK wiring ---

    it('wires each tag to the lz-governance namespace via tagNamespaceId', () => {
        const result = applyIamBlueprintOverlay(makeDesign(true))
        const ns = findIamBlueprintResource(result, 'tns_governance')
        expect(ns).toBeDefined()

        for (const tagRole of ['tag_cost_centre', 'tag_environment', 'tag_owner'] as const) {
            const tag = findIamBlueprintResource(result, tagRole)
            expect(tag, `${tagRole} should exist`).toBeDefined()
            expect(tag?.tagNamespaceId, `${tagRole} should link to namespace`).toBe(ns?.id)
            expect(tag?.isCostTracking).toBe(true)
        }
    })

    // --- policy statements use compartment display names ---

    it('policy statements reference compartment display names (not OCIDs)', () => {
        const result = applyIamBlueprintOverlay(makeDesign(true))
        const allPolicies = ['pol_administrators', 'pol_network_admins', 'pol_security_admins', 'pol_developers', 'pol_auditors'] as const
        for (const role of allPolicies) {
            const policy = findIamBlueprintResource(result, role)
            expect(policy, `${role} should exist`).toBeDefined()
            const stmts = policy?.statements as string[]
            expect(stmts.length, `${role} should have at least one statement`).toBeGreaterThan(0)
            // Statements must not contain raw OCID patterns.
            for (const stmt of stmts) {
                expect(stmt).not.toMatch(/ocid1\.[a-z]+\.oc1/)
            }
        }
    })

    it('auditor policy allows read all-resources in tenancy', () => {
        const result = applyIamBlueprintOverlay(makeDesign(true))
        const policy = findIamBlueprintResource(result, 'pol_auditors')
        const stmts = (policy?.statements as string[]) ?? []
        expect(stmts.some((s) => s.includes('read all-resources in tenancy'))).toBe(true)
    })

    it('administrator policy allows manage all-resources in tenancy', () => {
        const result = applyIamBlueprintOverlay(makeDesign(true))
        const policy = findIamBlueprintResource(result, 'pol_administrators')
        const stmts = (policy?.statements as string[]) ?? []
        expect(stmts.some((s) => s.includes('manage all-resources in tenancy'))).toBe(true)
    })

    it('network policy allows manage virtual-network-family', () => {
        const result = applyIamBlueprintOverlay(makeDesign(true))
        const policy = findIamBlueprintResource(result, 'pol_network_admins')
        const stmts = (policy?.statements as string[]) ?? []
        expect(stmts.some((s) => s.includes('manage virtual-network-family'))).toBe(true)
    })

    // --- role markers + compartment ---

    it('tags every emitted group with its role marker and a compartment', () => {
        const result = applyIamBlueprintOverlay(makeDesign(true))
        for (const role of ['grp_administrators', 'grp_network_admins', 'grp_security_admins', 'grp_developers', 'grp_auditors'] as const) {
            const resource = findIamBlueprintResource(result, role)
            expect(resource, `${role} should exist`).toBeDefined()
            expect((resource?.userDefined as Record<string, unknown>).lzIamBlueprint).toBe(role)
            expect(typeof resource?.compartmentId).toBe('string')
        }
    })

    // --- idempotency ---

    it('is idempotent — re-applying does not duplicate resources', () => {
        const once = applyIamBlueprintOverlay(makeDesign(true))
        const twice = applyIamBlueprintOverlay(once)

        // Groups: the LZ-origin design may already have groups from the LZ generator,
        // but our blueprint-marked groups must remain exactly 5.
        const blueprintGroups = (r: Record<string, unknown>) =>
            typeof (r.userDefined as Record<string, unknown>)?.lzIamBlueprint === 'string'

        expect(ociList(twice, 'group').filter(blueprintGroups)).toHaveLength(5)
        expect(ociList(twice, 'policy').filter(blueprintGroups)).toHaveLength(5)
        expect(ociList(twice, 'tag_namespace').filter(blueprintGroups)).toHaveLength(1)
        expect(ociList(twice, 'tag').filter(blueprintGroups)).toHaveLength(3)
        expect(JSON.stringify(twice)).toBe(JSON.stringify(once))
    })

    // --- immutability ---

    it('does not mutate the input design', () => {
        const design = makeDesign(true)
        const before = JSON.stringify(design)
        applyIamBlueprintOverlay(design)
        expect(JSON.stringify(design)).toBe(before)
    })

    // --- safety on partial/empty designs ---

    it('is safe on a design that has no compartments', () => {
        const design = makeDesign(true)
        // Remove all compartments from the model to exercise fallback paths.
        design.model.oci.resources.compartment = []
        expect(() => applyIamBlueprintOverlay(design)).not.toThrow()
        const result = applyIamBlueprintOverlay(design)
        // Should still create all resources; compartmentId will be empty string.
        const ns = findIamBlueprintResource(result, 'tns_governance')
        expect(ns).toBeDefined()
    })

    it('handles null/undefined design gracefully for isIamBlueprintEnabled', () => {
        expect(isIamBlueprintEnabled(null)).toBe(false)
        expect(isIamBlueprintEnabled(undefined)).toBe(false)
        expect(isIamBlueprintEnabled({} as OcdDesign)).toBe(false)
    })
})
