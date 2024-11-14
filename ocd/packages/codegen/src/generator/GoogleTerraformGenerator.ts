/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { OcdTerraformGenerator } from './OcdTerraformGenerator.js'
import { terraformMetadataOverrides } from './data/GoogleMetadataOverrides.js'
import { commonElements, commonIgnoreElements } from './data/GoogleCommonResourceProperties.js'

export class GoogleTerraformGenerator extends OcdTerraformGenerator {
    constructor () {
        super('Google', commonElements, commonIgnoreElements)
        this.terraformMetadataOverrides = terraformMetadataOverrides
    }

}

export default GoogleTerraformGenerator
// module.exports = { GoogleTerraformGenerator }
