/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

import { describe, expect, it } from 'vitest'
import { OcdDesign } from '@ocd/model'
import { findTemplate, ocdArchitectureTemplates } from '../OcdArchitectureTemplates'

function ociList(design: OcdDesign, key: string): Record<string, unknown>[] {
    return (design.model.oci.resources?.[key] ?? []) as Record<string, unknown>[]
}

describe('OcdArchitectureTemplates', () => {
    it('every registered template builds a non-empty design with a title', () => {
        for (const template of ocdArchitectureTemplates) {
            const design = template.build()
            expect(design.metadata.title, `${template.id} title`).toBeTruthy()
            expect(Object.keys(design.model.oci.resources).length, `${template.id} resources`).toBeGreaterThan(0)
        }
    })

    describe('cross-tenancy-hub-spoke template', () => {
        it('is registered and discoverable by id', () => {
            const template = findTemplate('cross-tenancy-hub-spoke')
            expect(template).toBeDefined()
            expect(template?.tags).toContain('cross-tenancy')
        })

        it('builds the symmetric two-tenancy DRG + RPC topology', () => {
            const design = findTemplate('cross-tenancy-hub-spoke')!.build()
            // Two DRGs (hub + peer) and the RPC pair.
            expect(ociList(design, 'drg')).toHaveLength(2)
            expect(ociList(design, 'remote_peering_connection')).toHaveLength(2)
            expect(ociList(design, 'vcn')).toHaveLength(2)
            expect(ociList(design, 'drg_attachment').length).toBeGreaterThanOrEqual(2)
        })

        it('expresses cross-tenancy via peerTenancyId on the RPCs', () => {
            const design = findTemplate('cross-tenancy-hub-spoke')!.build()
            const rpcs = ociList(design, 'remote_peering_connection')
            const peerTenancies = rpcs.map((r) => r.peerTenancyId)
            expect(peerTenancies).toContain('<peer-tenancy-ocid>')
            expect(peerTenancies).toContain('<hub-tenancy-ocid>')
        })
    })
})
