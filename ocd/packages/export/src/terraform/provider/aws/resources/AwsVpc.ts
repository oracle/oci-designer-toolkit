/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

/*
** Hand-authored AWS VPC terraform generator (no codegen for AWS).
*/

import { AwsTerraformResource } from '../AwsTerraformResource.js'
import { AwsModelResources as Model, OcdDesign } from '@ocd/model'

export class AwsVpc extends AwsTerraformResource {
    resource: Model.AwsVpc
    constructor(resource: Model.AwsVpc, idTFResourceMap: Record<string, string> = {}) {
        super(idTFResourceMap)
        this.resource = resource
        this.terraformResourceName = resource.terraformResourceName
    }

    generate(resource: Model.AwsVpc, design: OcdDesign): string {
        resource = resource ? resource : this.resource
        return `
# ------ Create VPC
resource "aws_vpc" "${resource.terraformResourceName}" {
    ${this.cidrBlock(resource)}
    ${this.tags(resource, design)}
}
`
    }

    cidrBlock = (resource: Model.AwsVpc): string => {
        return this.generateTextAttribute('cidr_block', resource.cidrBlock, true)
    }
}

export default AwsVpc
