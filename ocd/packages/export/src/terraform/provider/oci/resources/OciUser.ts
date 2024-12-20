/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import * as AutoGenerated from "./generated/OciUser.js"
import { OciModelResources as Model, OciResource } from '@ocd/model'

export class OciUser extends AutoGenerated.OciUser {
    constructor(resource: Model.OciUser, idTFResourceMap: Record<string, string> = {}, isHomeRegion: boolean = true) {
        super(resource, idTFResourceMap, isHomeRegion)
    }
    compartmentId = (resource: Record<string, any>, level=0): string =>'compartment_id = var.tenancy_ocid'
    generateAdditionalResource(resource: OciResource) {
        return `
# ------- Create Password
resource "oci_identity_ui_password" "${resource.terraformResourceName}Password" {
    provider       = oci.home_region
    #Required
    user_id = oci_identity_user.${resource.terraformResourceName}.id
}
`
    }
}

export default OciUser
