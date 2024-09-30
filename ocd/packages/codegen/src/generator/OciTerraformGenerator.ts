/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { terraformMetadataOverrides } from './data/OciMetadataOverrides'
import { commonElements, commonIgnoreElements } from './data/OciCommonResourceProperties'
import { OcdTerraformGenerator } from './OcdTerraformGenerator'

export class OciTerraformGenerator extends OcdTerraformGenerator {
    constructor () {
        super('Oci', commonElements, commonIgnoreElements)
        this.terraformMetadataOverrides = terraformMetadataOverrides
        this.ignoreAttributes = [...commonElements, ...commonIgnoreElements]
    }
}

export default OciTerraformGenerator
module.exports = { OciTerraformGenerator }
