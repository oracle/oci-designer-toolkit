/*
** AWS Terraform generator. Generates Terraform for the AWS resources in an
** OcdDesign, following the same OcdTerraformGenerator base as the OCI, Azure,
** and Google providers.
*/

import { OcdTerraformGenerator } from './OcdTerraformGenerator.js'
import { terraformMetadataOverrides } from './data/AwsMetadataOverrides.js'
import { commonElements, commonIgnoreElements } from './data/AwsCommonResourceProperties.js'

export class AwsTerraformGenerator extends OcdTerraformGenerator {
    constructor () {
        super('Aws', commonElements, commonIgnoreElements)
        this.terraformMetadataOverrides = terraformMetadataOverrides
    }

}

export default AwsTerraformGenerator
// module.exports = { AwsTerraformGenerator }
