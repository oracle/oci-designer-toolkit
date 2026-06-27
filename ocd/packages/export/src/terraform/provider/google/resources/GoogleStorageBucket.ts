/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

/*
** Hand-authored Google Storage Bucket terraform generator (self-contained,
** no codegen — mirrors the AWS provider generators).
*/

import { GoogleTerraformResource } from '../GoogleTerraformResource.js'
import { GoogleModelResources as Model, OcdDesign } from '@ocd/model'

export class GoogleStorageBucket extends GoogleTerraformResource {
    resource: Model.GoogleStorageBucket
    constructor(resource: Model.GoogleStorageBucket, idTFResourceMap: Record<string, string> = {}) {
        super(idTFResourceMap)
        this.resource = resource
        this.terraformResourceName = resource.terraformResourceName
    }

    generate(resource: Model.GoogleStorageBucket, design: OcdDesign): string {
        resource = resource ? resource : this.resource
        return `
# ------ Create Storage Bucket
resource "google_storage_bucket" "${resource.terraformResourceName}" {
    ${this.generateTextAttribute('name', resource.displayName ? resource.displayName : resource.terraformResourceName, true)}
    ${this.generateTextAttribute('location', resource.location, true)}
    ${this.generateTextAttribute('storage_class', resource.storageClass, true)}
}
`
    }
}

export default GoogleStorageBucket
