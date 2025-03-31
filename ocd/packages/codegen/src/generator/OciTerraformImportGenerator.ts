/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { terraformMetadataOverrides } from './data/OciMetadataOverrides.js'
import { commonElements, commonIgnoreElements } from './data/OciCommonResourceProperties.js'
import { OcdTerraformImportGenerator } from './OcdTerraformImportGenerator.js'
import { resourceMap } from '../importer/data/OciResourceMap.js'

export class OciTerraformImportGenerator extends OcdTerraformImportGenerator {
    defaultResourceMap = {
        "oci_core_default_dhcp_options": "dhcp_options",
        "oci_core_default_route_table": "route_table",
        "oci_core_default_security_list": "security_list",
    }
    constructor () {
        super('Oci', commonElements, commonIgnoreElements)
        this.terraformMetadataOverrides = terraformMetadataOverrides
        this.ignoreAttributes = [...commonElements, ...commonIgnoreElements]
        this.resourceMap = {...resourceMap, ...this.defaultResourceMap}
    }
}

export default OciTerraformImportGenerator
