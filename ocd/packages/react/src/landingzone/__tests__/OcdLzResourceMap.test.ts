/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

import { describe, expect, it } from 'vitest'
import {
    CROSS_PROJECT_RESOURCES,
    byOcdModelType,
    byTerraformType,
    byOeKind,
} from '../OcdLzResourceMap'

describe('OcdLzResourceMap (B3 cross-project name map)', () => {
    it('maps the OCD model type to the OCI Terraform type for a VCN', () => {
        const vcn = byOcdModelType('vcn')

        expect(vcn).toBeDefined()
        expect(vcn?.ociTerraformType).toBe('oci_core_vcn')
    })

    it('reverse-maps a Terraform type back to its OCD model type', () => {
        const subnet = byTerraformType('oci_core_subnet')

        expect(subnet?.ocdModelType).toBe('subnet')
    })

    it('returns undefined for types that are not in the map', () => {
        expect(byOcdModelType('not_a_real_type')).toBeUndefined()
        expect(byTerraformType('oci_made_up_resource')).toBeUndefined()
        expect(byOeKind('nonexistent.kind.path')).toBeUndefined()
    })

    it('round-trips every entry through all three lookup indexes', () => {
        for (const entry of CROSS_PROJECT_RESOURCES) {
            // OCD model type and Terraform type are unique keys, so each entry
            // must be retrievable as itself.
            expect(byOcdModelType(entry.ocdModelType)).toBe(entry)
            expect(byTerraformType(entry.ociTerraformType)).toBe(entry)
            // Every declared OE kind must resolve back to this entry.
            for (const oeKind of entry.oeKinds) {
                expect(byOeKind(oeKind)).toBe(entry)
            }
        }
    })

    it('keeps OCD model types and Terraform types unique across the map', () => {
        const ocdTypes = CROSS_PROJECT_RESOURCES.map((r) => r.ocdModelType)
        const tfTypes = CROSS_PROJECT_RESOURCES.map((r) => r.ociTerraformType)

        expect(new Set(ocdTypes).size).toBe(ocdTypes.length)
        expect(new Set(tfTypes).size).toBe(tfTypes.length)
    })

    it('uses oci_ prefixed Terraform types throughout', () => {
        for (const entry of CROSS_PROJECT_RESOURCES) {
            expect(entry.ociTerraformType).toMatch(/^oci_/)
        }
    })
})
