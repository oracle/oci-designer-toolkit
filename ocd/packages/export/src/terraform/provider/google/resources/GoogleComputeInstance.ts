/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

/*
** Hand-authored Google Compute Instance terraform generator (self-contained,
** no codegen — mirrors the AWS provider generators).
*/

import { GoogleTerraformResource } from '../GoogleTerraformResource.js'
import { GoogleModelResources as Model, OcdDesign } from '@ocd/model'

export class GoogleComputeInstance extends GoogleTerraformResource {
    resource: Model.GoogleComputeInstance
    constructor(resource: Model.GoogleComputeInstance, idTFResourceMap: Record<string, string> = {}) {
        super(idTFResourceMap)
        this.resource = resource
        this.terraformResourceName = resource.terraformResourceName
    }

    generate(resource: Model.GoogleComputeInstance, design: OcdDesign): string {
        resource = resource ? resource : this.resource
        return `
# ------ Create Compute Instance
resource "google_compute_instance" "${resource.terraformResourceName}" {
    ${this.generateTextAttribute('name', resource.displayName ? resource.displayName : resource.terraformResourceName, true)}
    ${this.generateTextAttribute('machine_type', resource.machineType, true)}
    ${this.generateTextAttribute('zone', resource.zone, true)}
    boot_disk {
        initialize_params {
            ${this.generateTextAttribute('image', resource.bootImage, true)}
        }
    }
    network_interface {
        ${this.googleReference('subnetwork', resource.subnetwork, 'google_compute_subnetwork', true)}
    }
}
`
    }
}

export default GoogleComputeInstance
