/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

import { describe, expect, it } from 'vitest'
import { OcdDesign } from '@ocd/model'
import { LandingZoneConfig } from '../OcdLzConfig'
import { buildOcdDesignFromLz } from '../OcdLzToModel'
import {
    applyObservabilityOverlay,
    findObservabilityResource,
    isObservabilityEnabled,
    LZ_OBSERVABILITY_ENABLED_KEY,
} from '../OcdLzObservability'

function makeConfig(): LandingZoneConfig {
    return {
        region: 'eu-frankfurt-1',
        regionShortName: 'fra',
        realm: 'oc1',
        hubKind: 'hub_a',
        hubVcn: '10.100.0.0/21',
        environments: [{ name: 'prod', securityZone: true, spokeVcn: '10.0.64.0/21', projects: ['proj1'], platforms: [] }],
    }
}

/** LZ-origin design; observability toggle off unless `enabled` is set. */
function makeDesign(enabled = false): OcdDesign {
    const design = buildOcdDesignFromLz([], 'Landing Zone', makeConfig()).design
    design.userDefined[LZ_OBSERVABILITY_ENABLED_KEY] = enabled
    return design
}

function ociList(design: OcdDesign, key: string): Record<string, unknown>[] {
    return (design.model.oci.resources?.[key] ?? []) as Record<string, unknown>[]
}

describe('OcdLzObservability', () => {
    it('is a no-op (same reference) when the toggle is off', () => {
        const design = makeDesign(false)
        expect(isObservabilityEnabled(design)).toBe(false)
        expect(applyObservabilityOverlay(design)).toBe(design)
    })

    it('is a no-op for a non-LZ design even when the flag is set', () => {
        const design = makeDesign(true)
        design.userDefined.lzOrigin = false
        expect(applyObservabilityOverlay(design)).toBe(design)
    })

    it('materialises the DBM/OPSI topology when enabled', () => {
        const result = applyObservabilityOverlay(makeDesign(true))

        expect(ociList(result, 'dbm_private_endpoint')).toHaveLength(1)
        expect(ociList(result, 'opsi_private_endpoint')).toHaveLength(1)
        expect(ociList(result, 'opsi_database_insight')).toHaveLength(1)
        expect(ociList(result, 'management_agent')).toHaveLength(1)
    })

    it('wires the Database Insight to the OPSI private endpoint', () => {
        const result = applyObservabilityOverlay(makeDesign(true))
        const opsiPe = findObservabilityResource(result, 'opsi_pe')
        const insight = findObservabilityResource(result, 'db_insight')

        expect(opsiPe).toBeDefined()
        expect(insight).toBeDefined()
        expect(insight?.opsiPrivateEndpointId).toBe(opsiPe?.id)
    })

    it('tags every emitted resource with its role marker and a compartment', () => {
        const result = applyObservabilityOverlay(makeDesign(true))
        for (const role of ['dbm_pe', 'opsi_pe', 'db_insight', 'mgmt_agent'] as const) {
            const resource = findObservabilityResource(result, role)
            expect(resource, `role ${role} should exist`).toBeDefined()
            expect((resource?.userDefined as Record<string, unknown>).lzObservability).toBe(role)
            expect(typeof resource?.compartmentId).toBe('string')
        }
    })

    it('is idempotent — re-applying does not duplicate resources', () => {
        const once = applyObservabilityOverlay(makeDesign(true))
        const twice = applyObservabilityOverlay(once)

        for (const key of ['dbm_private_endpoint', 'opsi_private_endpoint', 'opsi_database_insight', 'management_agent']) {
            expect(ociList(twice, key)).toHaveLength(1)
        }
        expect(JSON.stringify(twice)).toBe(JSON.stringify(once))
    })

    it('does not mutate the input design', () => {
        const design = makeDesign(true)
        const before = JSON.stringify(design)
        applyObservabilityOverlay(design)
        expect(JSON.stringify(design)).toBe(before)
    })

    // Reconcile contract (shared OcdLzOverlay upsert): applying the overlay any
    // number of times must converge to the same design as applying it once.
    it('converges on re-apply (apply once == re-apply twice more)', () => {
        const once = applyObservabilityOverlay(makeDesign(true))
        const thrice = applyObservabilityOverlay(applyObservabilityOverlay(once))
        expect(JSON.stringify(thrice)).toBe(JSON.stringify(once))
    })
})
