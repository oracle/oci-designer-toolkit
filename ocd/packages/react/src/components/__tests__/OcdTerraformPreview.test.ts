/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

/**
 * Unit tests for the A4 per-resource Terraform HCL preview helper.
 *
 * These tests target `getResourceTerraformHcl` from @ocd/export directly —
 * no React components are rendered, making the suite fast and environment-free.
 */

import { describe, expect, it } from 'vitest'
import { OcdDesign, OciModelResources } from '@ocd/model'
import { getResourceTerraformHcl } from '@ocd/export'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Build a minimal design that contains only a compartment (default) + a VCN. */
function makeDesignWithVcn(displayName = 'TestVcn', cidrBlocks = ['10.0.0.0/16']) {
    const design = OcdDesign.newDesign()
    const vcn = OciModelResources.OciVcn.newResource()
    vcn.displayName = displayName
    vcn.cidrBlocks = cidrBlocks
    design.model.oci.resources.vcn = [vcn]
    return { design, vcn }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('getResourceTerraformHcl (A4 per-resource TF preview)', () => {

    // --- happy path ---

    it('returns a non-empty string for a valid VCN resource', () => {
        const { design, vcn } = makeDesignWithVcn()
        const hcl = getResourceTerraformHcl(design, vcn.id)
        expect(typeof hcl).toBe('string')
        expect(hcl.length).toBeGreaterThan(0)
    })

    it('generates a resource block for an unlocked VCN', () => {
        const { design, vcn } = makeDesignWithVcn('MyVCN', ['192.168.0.0/24'])
        const hcl = getResourceTerraformHcl(design, vcn.id)
        expect(hcl).toContain('resource "oci_core_vcn"')
    })

    it('includes the display_name in the generated HCL', () => {
        const { design, vcn } = makeDesignWithVcn('MyNetwork')
        const hcl = getResourceTerraformHcl(design, vcn.id)
        expect(hcl).toContain('"MyNetwork"')
    })

    it('includes the cidr_blocks in the generated HCL', () => {
        const { design, vcn } = makeDesignWithVcn('Net', ['10.1.0.0/16'])
        const hcl = getResourceTerraformHcl(design, vcn.id)
        expect(hcl).toContain('10.1.0.0/16')
    })

    it('generates a locals block with the resource id reference', () => {
        const { design, vcn } = makeDesignWithVcn()
        const hcl = getResourceTerraformHcl(design, vcn.id)
        expect(hcl).toContain('locals {')
        expect(hcl).toContain('_id = oci_core_vcn.')
    })

    it('generates a data block for a locked VCN', () => {
        const { design, vcn } = makeDesignWithVcn()
        vcn.locked = true
        const hcl = getResourceTerraformHcl(design, vcn.id)
        expect(hcl).toContain('data "oci_core_vcns"')
    })

    it('works for a Subnet resource inside a VCN', () => {
        const { design, vcn } = makeDesignWithVcn()
        const subnet = OciModelResources.OciSubnet.newResource()
        subnet.displayName = 'TestSubnet'
        subnet.cidrBlock = '10.0.1.0/24'
        subnet.vcnId = vcn.id
        design.model.oci.resources.subnet = [subnet]

        const hcl = getResourceTerraformHcl(design, subnet.id)
        expect(hcl).toContain('resource "oci_core_subnet"')
        expect(hcl).toContain('"TestSubnet"')
    })

    it('generates the default compartment HCL for the root compartment', () => {
        const design = OcdDesign.newDesign()
        const allResources = OcdDesign.getOciResources(design)
        // The default design always contains exactly one compartment.
        const compartment = allResources.find((r) => r.resourceType === 'Compartment')
        expect(compartment).toBeDefined()
        const hcl = getResourceTerraformHcl(design, compartment!.id)
        expect(hcl.length).toBeGreaterThan(0)
    })

    // --- error handling ---

    it('throws when the resourceId is not found in the design', () => {
        const { design } = makeDesignWithVcn()
        expect(() => getResourceTerraformHcl(design, 'nonexistent.id')).toThrow(
            /not found in design/
        )
    })

    it('produces different HCL for two distinct VCN resources', () => {
        const design = OcdDesign.newDesign()
        const vcn1 = OciModelResources.OciVcn.newResource()
        vcn1.displayName = 'VCN-A'
        vcn1.cidrBlocks = ['10.0.0.0/16']
        const vcn2 = OciModelResources.OciVcn.newResource()
        vcn2.displayName = 'VCN-B'
        vcn2.cidrBlocks = ['172.16.0.0/12']
        design.model.oci.resources.vcn = [vcn1, vcn2]

        const hcl1 = getResourceTerraformHcl(design, vcn1.id)
        const hcl2 = getResourceTerraformHcl(design, vcn2.id)
        expect(hcl1).not.toEqual(hcl2)
        expect(hcl1).toContain('VCN-A')
        expect(hcl2).toContain('VCN-B')
    })
})
