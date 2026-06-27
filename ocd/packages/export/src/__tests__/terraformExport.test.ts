/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { describe, it, expect } from 'vitest'
import { OcdDesign, OciModelResources } from '@ocd/model'
import { OcdTerraformExporter } from '../terraform/OcdTerraformExporter.js'

// Build a minimal in-memory design: one VCN + one Subnet, where the subnet's
// vcnId points at the VCN's OCD-internal id so the exporter emits a local.* ref
// between them. All values are synthetic (public fork redaction rule).
const buildVcnSubnetDesign = (): OcdDesign => {
    const design = OcdDesign.newDesign()
    // Single-directory export keeps output filenames flat (oci_networking.tf rather
    // than resources/oci_networking.tf), which keeps the filename assertions simple.
    design.metadata.separateIdentity = false

    const vcn = OciModelResources.OciVcn.newResource()
    vcn.displayName = 'Test Vcn'
    vcn.cidrBlocks = ['10.0.0.0/16']

    const subnet = OciModelResources.OciSubnet.newResource()
    subnet.displayName = 'Test Subnet'
    subnet.cidrBlock = '10.0.1.0/24'
    // Reference the VCN by its OCD-internal id; the exporter resolves this against
    // the id -> terraformResourceName map to emit `vcn_id = local.<name>_id`.
    subnet.vcnId = vcn.id

    design.model.oci.resources.vcn = [vcn]
    design.model.oci.resources.subnet = [subnet]

    return design
}

describe('OcdTerraformExporter (OcdDesign -> HCL)', () => {
    it('emits an oci_core_vcn resource block', () => {
        const design = buildVcnSubnetDesign()
        const exporter = new OcdTerraformExporter()
        exporter.export(design)

        expect(exporter.terraform).toContain('resource "oci_core_vcn"')
    })

    it('emits an oci_core_subnet resource block', () => {
        const design = buildVcnSubnetDesign()
        const exporter = new OcdTerraformExporter()
        exporter.export(design)

        expect(exporter.terraform).toContain('resource "oci_core_subnet"')
    })

    it('emits a local.* reference from the subnet to the VCN', () => {
        const design = buildVcnSubnetDesign()
        const vcn = design.model.oci.resources.vcn[0]
        const exporter = new OcdTerraformExporter()
        exporter.export(design)

        // The subnet's vcn_id is rendered as a reference to the VCN's terraform local.
        expect(exporter.terraform).toContain(`vcn_id = local.${vcn.terraformResourceName}_id`)
    })

    it('returns an OutputDataStringArray keyed by terraform filename', () => {
        const design = buildVcnSubnetDesign()
        const exporter = new OcdTerraformExporter()
        const outputData = exporter.export(design)

        // VCN + Subnet both map to oci_networking.tf in the exporter file map.
        expect(Object.keys(outputData)).toContain('oci_networking.tf')
        const networking = outputData['oci_networking.tf'].join('\n')
        expect(networking).toContain('resource "oci_core_vcn"')
        expect(networking).toContain('resource "oci_core_subnet"')
    })
})

// A DRG + a Remote Peering Connection whose peerTenancyId is set — the canonical
// cross-tenancy two-tenancy link. Asserts the exporter emits both the RPC block
// AND peer_tenancy_id (the hand override fixes a codegen condition that otherwise
// drops peer_tenancy_id from the HCL, which would silently break cross-tenancy).
const buildCrossTenancyRpcDesign = (): OcdDesign => {
    const design = OcdDesign.newDesign()
    design.metadata.separateIdentity = false

    const drg = OciModelResources.OciDrg.newResource()
    drg.displayName = 'Hub DRG'

    const rpc = OciModelResources.OciRemotePeeringConnection.newResource()
    rpc.displayName = 'Hub RPC'
    rpc.drgId = drg.id
    // Synthetic placeholders (public fork) — NOT a real OCID.
    rpc.peerTenancyId = '<peer-tenancy-ocid>'
    rpc.peerRegionName = '<peer-region>'

    design.model.oci.resources.drg = [drg]
    design.model.oci.resources.remote_peering_connection = [rpc]

    return design
}

describe('OcdTerraformExporter — cross-tenancy peering', () => {
    it('emits an oci_core_remote_peering_connection block', () => {
        const exporter = new OcdTerraformExporter()
        exporter.export(buildCrossTenancyRpcDesign())
        expect(exporter.terraform).toContain('resource "oci_core_remote_peering_connection"')
    })

    it('emits peer_tenancy_id so cross-tenancy peering actually exports', () => {
        const exporter = new OcdTerraformExporter()
        exporter.export(buildCrossTenancyRpcDesign())
        expect(exporter.terraform).toContain('peer_tenancy_id')
        expect(exporter.terraform).toContain('<peer-tenancy-ocid>')
    })
})
