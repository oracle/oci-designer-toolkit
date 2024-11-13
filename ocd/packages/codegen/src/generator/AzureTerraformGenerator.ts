/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { OcdTerraformGenerator } from './OcdTerraformGenerator.js'
import { terraformMetadataOverrides } from './data/AzureMetadataOverrides.js'
import { commonElements, commonIgnoreElements } from './data/AzureCommonResourceProperties.js'

export class AzureTerraformGenerator extends OcdTerraformGenerator {
    constructor () {
        super('Azure', commonElements, commonIgnoreElements)
        this.terraformMetadataOverrides = terraformMetadataOverrides
    }

}

export default AzureTerraformGenerator
// module.exports = { AzureTerraformGenerator }
