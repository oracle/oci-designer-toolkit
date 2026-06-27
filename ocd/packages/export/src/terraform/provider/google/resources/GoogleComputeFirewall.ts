/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

/*
** Hand-authored Google Compute Firewall terraform generator (self-contained,
** no codegen — mirrors the AWS provider generators).
*/

import { GoogleTerraformResource } from '../GoogleTerraformResource.js'
import { GoogleModelResources as Model, OcdDesign } from '@ocd/model'

export class GoogleComputeFirewall extends GoogleTerraformResource {
    resource: Model.GoogleComputeFirewall
    constructor(resource: Model.GoogleComputeFirewall, idTFResourceMap: Record<string, string> = {}) {
        super(idTFResourceMap)
        this.resource = resource
        this.terraformResourceName = resource.terraformResourceName
    }

    generate(resource: Model.GoogleComputeFirewall, design: OcdDesign): string {
        resource = resource ? resource : this.resource
        return `
# ------ Create Compute Firewall
resource "google_compute_firewall" "${resource.terraformResourceName}" {
    ${this.generateTextAttribute('name', resource.displayName ? resource.displayName : resource.terraformResourceName, true)}
    ${this.generateTextAttribute('direction', resource.direction, true)}
    ${this.generateTextAttribute('description', resource.description, false)}
    ${this.googleReference('network', resource.network, 'google_compute_network', true)}
}
`
    }
}

export default GoogleComputeFirewall
