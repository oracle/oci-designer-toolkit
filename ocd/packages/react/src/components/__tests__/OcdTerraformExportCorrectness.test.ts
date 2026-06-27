/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

/**
 * Regression tests for Terraform-export correctness bugs.
 *
 * These target the per-resource generators via `getResourceTerraformHcl` from
 * @ocd/export (same entry point used by OcdTerraformPreview.test.ts):
 *  1. Reference attributes must never emit `local.undefined_*` when the referenced
 *     resource is absent from the exported set.
 *  2. Data-source `locals` must guard array indexing with `length(...) == 0 ? ""`
 *     so a no-match data source does not crash `terraform plan`.
 */

import { describe, expect, it } from 'vitest'
import { OcdDesign, OciModelResources } from '@ocd/model'
import { getResourceTerraformHcl } from '@ocd/export'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Build a minimal design containing a VCN (plus the default compartment). */
function makeDesignWithVcn(displayName = 'TestVcn', cidrBlocks = ['10.0.0.0/16']) {
    const design = OcdDesign.newDesign()
    const vcn = OciModelResources.OciVcn.newResource()
    vcn.displayName = displayName
    vcn.cidrBlocks = cidrBlocks
    design.model.oci.resources.vcn = [vcn]
    return { design, vcn }
}

// ---------------------------------------------------------------------------
// Bug 1 — undefined reference variables
// ---------------------------------------------------------------------------

describe('Terraform export — missing reference guard (no local.undefined_)', () => {

    it('does not emit local.undefined_ when a subnet references a VCN absent from the export', () => {
        // Subnet present, but its VCN is NOT added to the design → vcnId is unresolved.
        const design = OcdDesign.newDesign()
        const subnet = OciModelResources.OciSubnet.newResource()
        subnet.displayName = 'OrphanSubnet'
        subnet.cidrBlock = '10.0.1.0/24'
        subnet.vcnId = 'okit.vcn.does-not-exist-in-this-export'
        design.model.oci.resources.subnet = [subnet]

        const hcl = getResourceTerraformHcl(design, subnet.id)

        // The core invariant: never produce a broken local.undefined_* reference.
        expect(hcl).not.toContain('local.undefined_')
        // Required attribute should surface as a visible TODO comment instead.
        expect(hcl).toContain('# TODO: vcn_id references a resource not present in this export')
    })

    it('still emits a correct local.<vcn>_id reference when both subnet and VCN are present', () => {
        const { design, vcn } = makeDesignWithVcn('LinkedVcn')
        const subnet = OciModelResources.OciSubnet.newResource()
        subnet.displayName = 'LinkedSubnet'
        subnet.cidrBlock = '10.0.1.0/24'
        subnet.vcnId = vcn.id
        design.model.oci.resources.subnet = [subnet]

        const hcl = getResourceTerraformHcl(design, subnet.id)

        expect(hcl).not.toContain('local.undefined_')
        expect(hcl).toContain(`vcn_id = local.${vcn.terraformResourceName}_id`)
    })

    it('comments out a reference-list attribute whose every id is missing from the export', () => {
        // An instance with create_vnic_details.nsg_ids pointing at absent NSGs.
        const design = OcdDesign.newDesign()
        const instance = OciModelResources.OciInstance.newResource()
        instance.displayName = 'OrphanRefInstance'
        ;(instance as Record<string, any>).nsgIds = ['okit.nsg.missing-a', 'okit.nsg.missing-b']
        design.model.oci.resources.instance = [instance]

        const hcl = getResourceTerraformHcl(design, instance.id)

        expect(hcl).not.toContain('local.undefined_')
    })
})

// ---------------------------------------------------------------------------
// Bug 2 — array index out of bounds in data-source locals
// ---------------------------------------------------------------------------

describe('Terraform export — data-source length() guards', () => {

    it('Compartment data lookup guards compartments[0] with length()', () => {
        const design = OcdDesign.newDesign()
        const compartment = OcdDesign.getOciResources(design).find(
            (r) => r.resourceType === 'Compartment'
        )
        expect(compartment).toBeDefined()
        compartment!.locked = true // force the data-source ("Read Compartment") path

        const hcl = getResourceTerraformHcl(design, compartment!.id)

        expect(hcl).toContain('length(data.oci_identity_compartments.')
        expect(hcl).toContain('.compartments) == 0 ? ""')
    })

    it('Instance image lookup guards images[0] with length()', () => {
        const design = OcdDesign.newDesign()
        const instance = OciModelResources.OciInstance.newResource()
        instance.displayName = 'GuardInstance'
        design.model.oci.resources.instance = [instance]

        const hcl = getResourceTerraformHcl(design, instance.id)

        expect(hcl).toContain('length(data.oci_core_images.')
        expect(hcl).toContain('.images) == 0 ? ""')
    })

    it('Cpe device-shape lookup guards cpe_device_shapes[0] with length()', () => {
        const design = OcdDesign.newDesign()
        const cpe = OciModelResources.OciCpe.newResource()
        cpe.displayName = 'GuardCpe'
        design.model.oci.resources.cpe = [cpe]

        const hcl = getResourceTerraformHcl(design, cpe.id)

        expect(hcl).toContain('length(data.oci_core_cpe_device_shapes.')
        expect(hcl).toContain('.cpe_device_shapes) == 0 ? ""')
    })
})
