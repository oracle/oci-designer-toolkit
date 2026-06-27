/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

/*
** AWS terraform resource base. Hand-authored (no codegen for AWS). Provides a
** reference resolver that turns an OCD-internal id into a direct
** `<aws_type>.<terraformResourceName>.id` HCL reference using the
** id -> terraformResourceName map, mirroring how the OCI/Azure exporters wire
** cross-resource references.
*/

import OcdTerraformResource from "../../OcdTerraformResource.js"
import { OcdDesign, AwsResource } from '@ocd/model'

export class AwsTerraformResource extends OcdTerraformResource {
    constructor(idTFResourceMap = {}) {
        super(idTFResourceMap)
    }

    commonAssignments = (resource: AwsResource): string => {
        return ``
    }

    tags = (resource: AwsResource, design: OcdDesign): string => {
        return `tags = {
        Name      = "${resource.displayName ? resource.displayName : resource.terraformResourceName}"
        ManagedBy = "OCI-Designer-Toolkit"
    }`
    }

    /*
    ** Resolve a reference attribute to a direct aws_<type>.<name>.id reference.
    ** value holds the referenced resource's OCD-internal id; awsType is the
    ** terraform resource type of the target (e.g. 'aws_vpc'). Emits a commented
    ** placeholder when the referenced resource is not part of this export so the
    ** generated HCL stays valid.
    */
    awsReference = (name: string, value: string | undefined, awsType: string, required: boolean, level = 0): string => {
        if (this.isVariable(value)) return `${this.indentation[level]}${name} = ${this.formatVariable(value)}`
        const mapped = value !== undefined && value !== '' ? this.idTFResourceMap[value] : undefined
        if (mapped !== undefined) return `${this.indentation[level]}${name} = ${awsType}.${mapped}.id`
        else if (required) return `${this.indentation[level]}# TODO: ${name} references a resource not present in this export (${value})`
        else return `${this.indentation[level]}# ${name} = "${value}"`
    }
}

export default AwsTerraformResource
