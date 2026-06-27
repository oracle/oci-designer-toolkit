/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

/*
** Hand-authored AWS Instance terraform generator (no codegen for AWS).
*/

import { AwsTerraformResource } from '../AwsTerraformResource.js'
import { AwsModelResources as Model, OcdDesign } from '@ocd/model'

export class AwsInstance extends AwsTerraformResource {
    resource: Model.AwsInstance
    constructor(resource: Model.AwsInstance, idTFResourceMap: Record<string, string> = {}) {
        super(idTFResourceMap)
        this.resource = resource
        this.terraformResourceName = resource.terraformResourceName
    }

    generate(resource: Model.AwsInstance, design: OcdDesign): string {
        resource = resource ? resource : this.resource
        return `
# ------ Create Instance
resource "aws_instance" "${resource.terraformResourceName}" {
    ${this.ami(resource)}
    ${this.instanceType(resource)}
    ${this.awsReference('subnet_id', resource.subnetId, 'aws_subnet', true)}
    ${this.tags(resource, design)}
}
`
    }

    ami = (resource: Model.AwsInstance): string => {
        return this.generateTextAttribute('ami', resource.ami, true)
    }
    instanceType = (resource: Model.AwsInstance): string => {
        return this.generateTextAttribute('instance_type', resource.instanceType, true)
    }
}

export default AwsInstance
