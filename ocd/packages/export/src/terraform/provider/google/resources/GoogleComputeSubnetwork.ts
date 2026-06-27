/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

/*
** Hand-authored Google Compute Subnetwork terraform generator (self-contained,
** no codegen — mirrors the AWS provider generators).
*/

import { GoogleTerraformResource } from '../GoogleTerraformResource.js'
import { GoogleModelResources as Model, OcdDesign } from '@ocd/model'

export class GoogleComputeSubnetwork extends GoogleTerraformResource {
    resource: Model.GoogleComputeSubnetwork
    constructor(resource: Model.GoogleComputeSubnetwork, idTFResourceMap: Record<string, string> = {}) {
        super(idTFResourceMap)
        this.resource = resource
        this.terraformResourceName = resource.terraformResourceName
    }

    generate(resource: Model.GoogleComputeSubnetwork, design: OcdDesign): string {
        resource = resource ? resource : this.resource
        return `
# ------ Create Compute Subnetwork
resource "google_compute_subnetwork" "${resource.terraformResourceName}" {
    ${this.generateTextAttribute('name', resource.displayName ? resource.displayName : resource.terraformResourceName, true)}
    ${this.generateTextAttribute('ip_cidr_range', resource.ipCidrRange, true)}
    ${this.generateTextAttribute('region', resource.region, true)}
    ${this.googleReference('network', resource.network, 'google_compute_network', true)}
}
`
    }
}

export default GoogleComputeSubnetwork
