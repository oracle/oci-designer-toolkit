/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { OcdTerraformResource } from "../../OcdTerraformResource.js"
import { OciResource } from '@ocd/model'

export class OciTerraformResource extends OcdTerraformResource {
    typeDisplayNameMap: Record<string, string> = {
        Compartment: 'name',
        DynamicGroup: 'name',
        Group: 'name',
        LoadBalancerBackendSet: 'name',
        LoadBalancerListener: 'name',
        User: 'name'
    }
    commonAssignments = (tfResource: Record<string, any>, ocdResource: OciResource) => {
        this.compartmentId(tfResource, ocdResource)
        this.displayName(tfResource, ocdResource)
    }
    compartmentId = (tfResource: Record<string, any>, ocdResource: OciResource, level=0) => {ocdResource.compartmentId = tfResource.compartment_id}
    displayName = (tfResource: Record<string, any>, ocdResource: OciResource, level=0) => {
        if (this.typeDisplayNameMap.hasOwnProperty(ocdResource.resourceType)) {
            const displayNameField = this.typeDisplayNameMap[ocdResource.resourceType]
            ocdResource.displayName = tfResource[displayNameField]
        } else {
            ocdResource.displayName = tfResource.display_name
        }
    }

}

