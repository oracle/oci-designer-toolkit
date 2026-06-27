/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { describe, it, expect } from 'vitest'
import { OcdDesign, GoogleModelResources } from '@ocd/model'
import { OcdTerraformExporter } from '../terraform/OcdTerraformExporter.js'

// Build a minimal in-memory Google design: VPC (compute_network) -> Subnetwork
// -> Instance. Subnetwork.network and Instance.subnetwork point at the
// OCD-internal ids so the exporter emits direct google_<type>.<name>.id
// references. All values are synthetic (public fork).
const buildGoogleDesign = (): OcdDesign => {
    const design = OcdDesign.newDesign()
    design.metadata.separateIdentity = false

    const network = GoogleModelResources.GoogleComputeNetwork.newResource()
    network.displayName = 'Test Network'

    const subnetwork = GoogleModelResources.GoogleComputeSubnetwork.newResource()
    subnetwork.displayName = 'Test Subnetwork'
    subnetwork.ipCidrRange = '10.0.1.0/24'
    subnetwork.region = 'us-central1'
    subnetwork.network = network.id

    const instance = GoogleModelResources.GoogleComputeInstance.newResource()
    instance.displayName = 'Test Instance'
    instance.machineType = 'e2-medium'
    instance.zone = 'us-central1-a'
    instance.bootImage = '<boot-image>'
    instance.subnetwork = subnetwork.id

    design.model.google = {
        vars: [],
        resources: {
            compute_network: [network],
            compute_subnetwork: [subnetwork],
            compute_instance: [instance]
        }
    }

    return design
}

describe('OcdTerraformExporter (Google OcdDesign -> HCL)', () => {
    it('emits a google_compute_subnetwork resource block', () => {
        const exporter = new OcdTerraformExporter()
        exporter.export(buildGoogleDesign())
        expect(exporter.terraform).toContain('resource "google_compute_subnetwork"')
    })

    it('emits a google_compute_instance resource block', () => {
        const exporter = new OcdTerraformExporter()
        exporter.export(buildGoogleDesign())
        expect(exporter.terraform).toContain('resource "google_compute_instance"')
    })

    it('emits a network reference from the subnetwork to the VPC', () => {
        const design = buildGoogleDesign()
        const network = design.model.google.resources.compute_network[0]
        const exporter = new OcdTerraformExporter()
        exporter.export(design)
        expect(exporter.terraform).toContain(`network = google_compute_network.${network.terraformResourceName}.id`)
    })

    it('emits a subnetwork reference from the instance to the subnetwork', () => {
        const design = buildGoogleDesign()
        const subnetwork = design.model.google.resources.compute_subnetwork[0]
        const exporter = new OcdTerraformExporter()
        exporter.export(design)
        expect(exporter.terraform).toContain(`subnetwork = google_compute_subnetwork.${subnetwork.terraformResourceName}.id`)
    })

    it('returns an OutputDataStringArray keyed by google terraform filename', () => {
        const exporter = new OcdTerraformExporter()
        const outputData = exporter.export(buildGoogleDesign())
        expect(Object.keys(outputData)).toContain('google_networking.tf')
        expect(Object.keys(outputData)).toContain('google_compute.tf')
        const networking = outputData['google_networking.tf'].join('\n')
        expect(networking).toContain('resource "google_compute_subnetwork"')
        const compute = outputData['google_compute.tf'].join('\n')
        expect(compute).toContain('resource "google_compute_instance"')
    })
})
