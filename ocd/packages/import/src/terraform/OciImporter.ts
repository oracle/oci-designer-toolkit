/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { OcdDesign } from "@ocd/model"
import { TerraformJson } from "@ocd/parser"
import { OcdProviderImporter } from "./OcdProviderImporter.js"
import { OciResourceBuilder } from './provider/oci/OciResourceBuilder.js'

export class OciImporter extends OcdProviderImporter {

    constructor() {
        super('oci', new OciResourceBuilder())
    }

    importOrig = (terraformJsonString: string): OcdDesign => {
        // console.debug('OciTerraformImporter: Importing', terraformJsonString)
        const teraformJson: TerraformJson = JSON.parse(terraformJsonString)
        // const resource = Object.entries(teraformJson.resource).filter(([k, v]) => k.startsWith('oci_')).reduce((a, [k, v]) => {return {...a, [k]: v}}, {})
        const resource = this.providerFilter(teraformJson.resource, 'oci_')
        // console.debug('OciTerraformImporter: Reduced', resource)
        this.parseResources(resource)
        return this.design
    }

}

export default OciImporter
