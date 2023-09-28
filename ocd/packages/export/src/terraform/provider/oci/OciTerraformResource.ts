/*
** Copyright (c) 2020, 2023, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import OcdTerraformResource from "../../OcdTerraformResource"
import { OciModelResources as Model, OciResource } from '@ocd/model'

export class OciTerraformResource extends OcdTerraformResource {
    typeDisplayNameMap: Record<string, string> = {
        Compartment: 'name'
    }
    commonAssignments = (resource: OciResource) => {
        console.debug('OciTerraformResource:', resource, resource.resourceType, this.typeDisplayNameMap, this.typeDisplayNameMap.hasOwnProperty(resource.resourceType))
        return `
    ${this.generateReferenceAttribute("compartment_id", resource.compartmentId, true)}
    ${this.generateTextAttribute(this.typeDisplayNameMap.hasOwnProperty(resource.resourceType) ? this.typeDisplayNameMap[resource.resourceType] : 'display_name', resource.displayName, true)}
`

    }
}

export default OciTerraformResource
