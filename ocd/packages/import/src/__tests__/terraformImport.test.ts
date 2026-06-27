/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { describe, it, expect } from 'vitest'
import { OcdDesign } from '@ocd/model'
import { OcdTerraformExporter } from '@ocd/export'
import { OcdTerraformImporter } from '../terraform/OcdTerraformImporter.js'

// Synthetic Terraform fixture: an OCI VCN + Subnet where the subnet references the
// VCN via `oci_core_vcn.vcn1.id`. All values are obviously-synthetic (public fork
// redaction rule): the compartment id is a <PLACEHOLDER> token and CIDRs are RFC1918
// private ranges. No real tenancy/OCID/IP appears here.
const SYNTHETIC_TERRAFORM = `
resource "oci_core_vcn" "vcn1" {
    compartment_id = "<COMPARTMENT_OCID>"
    display_name   = "Test Vcn"
    cidr_blocks    = ["10.0.0.0/16"]
    dns_label      = "testvcn"
}

resource "oci_core_subnet" "subnet1" {
    compartment_id = "<COMPARTMENT_OCID>"
    display_name   = "Test Subnet"
    cidr_block     = "10.0.1.0/24"
    dns_label      = "testsubnet"
    vcn_id         = oci_core_vcn.vcn1.id
}
`

describe('OcdTerraformImporter (HCL -> OcdDesign)', () => {
    it('parses an oci_core_vcn block into the OCI model', () => {
        const design: OcdDesign = new OcdTerraformImporter().import(SYNTHETIC_TERRAFORM)

        const vcns = OcdDesign.getOciResourceList(design, 'vcn')
        expect(vcns).toHaveLength(1)
        expect(vcns[0].cidrBlocks).toEqual(['10.0.0.0/16'])
    })

    it('parses an oci_core_subnet block into the OCI model', () => {
        const design: OcdDesign = new OcdTerraformImporter().import(SYNTHETIC_TERRAFORM)

        const subnets = OcdDesign.getOciResourceList(design, 'subnet')
        expect(subnets).toHaveLength(1)
        expect(subnets[0].cidrBlock).toBe('10.0.1.0/24')
    })

    it('resolves the subnet vcn_id reference to the imported VCN id', () => {
        const design: OcdDesign = new OcdTerraformImporter().import(SYNTHETIC_TERRAFORM)

        const vcn = OcdDesign.getOciResourceList(design, 'vcn')[0]
        const subnet = OcdDesign.getOciResourceList(design, 'subnet')[0]

        // The importer rewrites the Terraform reference (oci_core_vcn.vcn1.id) into
        // the OCD-internal id of the imported VCN, so the subnet's parent resolves.
        expect(subnet.vcnId).toBe(vcn.id)
        expect(subnet.vcnId).not.toBe('')
    })

    it('survives a Terraform round-trip (import -> export -> re-import)', () => {
        // import -> design
        const design = new OcdTerraformImporter().import(SYNTHETIC_TERRAFORM)
        // export -> HCL (joined across all generated .tf files)
        const exporter = new OcdTerraformExporter()
        exporter.export(design)
        // re-import the generated HCL
        const roundTripped = new OcdTerraformImporter().import(exporter.terraform)

        const vcns = OcdDesign.getOciResourceList(roundTripped, 'vcn')
        const subnets = OcdDesign.getOciResourceList(roundTripped, 'subnet')
        expect(vcns).toHaveLength(1)
        expect(subnets).toHaveLength(1)

        // The VCN -> Subnet relationship is preserved end-to-end: on re-import the
        // exported `vcn_id = local.<name>_id` reference resolves back to the VCN id.
        expect(subnets[0].vcnId).toBe(vcns[0].id)
    })
})
