/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

/*
** Hand-authored AWS Security Group terraform generator (no codegen for AWS).
*/

import { AwsTerraformResource } from '../AwsTerraformResource.js'
import { AwsModelResources as Model, OcdDesign } from '@ocd/model'

export class AwsSecurityGroup extends AwsTerraformResource {
    resource: Model.AwsSecurityGroup
    constructor(resource: Model.AwsSecurityGroup, idTFResourceMap: Record<string, string> = {}) {
        super(idTFResourceMap)
        this.resource = resource
        this.terraformResourceName = resource.terraformResourceName
    }

    generate(resource: Model.AwsSecurityGroup, design: OcdDesign): string {
        resource = resource ? resource : this.resource
        return `
# ------ Create Security Group
resource "aws_security_group" "${resource.terraformResourceName}" {
    ${this.description(resource)}
    ${this.awsReference('vpc_id', resource.vpcId, 'aws_vpc', true)}
    ${this.tags(resource, design)}
}
`
    }

    description = (resource: Model.AwsSecurityGroup): string => {
        return this.generateTextAttribute('description', resource.description, true)
    }
}

export default AwsSecurityGroup
