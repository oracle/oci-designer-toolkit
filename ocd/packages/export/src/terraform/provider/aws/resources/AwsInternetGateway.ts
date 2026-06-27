/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

/*
** Hand-authored AWS Internet Gateway terraform generator (no codegen for AWS).
*/

import { AwsTerraformResource } from '../AwsTerraformResource.js'
import { AwsModelResources as Model, OcdDesign } from '@ocd/model'

export class AwsInternetGateway extends AwsTerraformResource {
    resource: Model.AwsInternetGateway
    constructor(resource: Model.AwsInternetGateway, idTFResourceMap: Record<string, string> = {}) {
        super(idTFResourceMap)
        this.resource = resource
        this.terraformResourceName = resource.terraformResourceName
    }

    generate(resource: Model.AwsInternetGateway, design: OcdDesign): string {
        resource = resource ? resource : this.resource
        return `
# ------ Create Internet Gateway
resource "aws_internet_gateway" "${resource.terraformResourceName}" {
    ${this.awsReference('vpc_id', resource.vpcId, 'aws_vpc', true)}
    ${this.tags(resource, design)}
}
`
    }
}

export default AwsInternetGateway
