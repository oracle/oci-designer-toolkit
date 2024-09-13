/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { OcdTerraformGenerator } from './OcdTerraformGenerator'
import { terraformMetadataOverrides } from './data/GcpMetadataOverrides'
import { commonElements, commonIgnoreElements } from './data/GcpCommonResourceProperties'

export class GcpTerraformGenerator extends OcdTerraformGenerator {
    constructor () {
        super('Gcp', commonElements, commonIgnoreElements)
        this.terraformMetadataOverrides = terraformMetadataOverrides
    }

}

export default GcpTerraformGenerator
module.exports = { GcpTerraformGenerator }
