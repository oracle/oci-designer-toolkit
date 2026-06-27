/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

/*
** Hand-authored AWS Subnet terraform generator (no codegen for AWS).
*/

import { AwsTerraformResource } from '../AwsTerraformResource.js'
import { AwsModelResources as Model, OcdDesign } from '@ocd/model'

export class AwsSubnet extends AwsTerraformResource {
    resource: Model.AwsSubnet
    constructor(resource: Model.AwsSubnet, idTFResourceMap: Record<string, string> = {}) {
        super(idTFResourceMap)
        this.resource = resource
        this.terraformResourceName = resource.terraformResourceName
    }

    generate(resource: Model.AwsSubnet, design: OcdDesign): string {
        resource = resource ? resource : this.resource
        return `
# ------ Create Subnet
resource "aws_subnet" "${resource.terraformResourceName}" {
    ${this.awsReference('vpc_id', resource.vpcId, 'aws_vpc', true)}
    ${this.cidrBlock(resource)}
    ${this.tags(resource, design)}
}
`
    }

    cidrBlock = (resource: Model.AwsSubnet): string => {
        return this.generateTextAttribute('cidr_block', resource.cidrBlock, true)
    }
}

export default AwsSubnet
