/*
** Copyright (c) 2020, 2023, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { resourceMap, dataMap, resourceAttributes } from './data/AzureResourceMap'
import { TerraformSchema } from "../types/TerraformSchema";
import { OcdTerraformSchemaImporter } from "./OcdTerraformSchemaImporter";
import { ignoreElements } from './data/AzureIgnoreElements';
import { elementOverrides } from './data/AzureElementOverrides';
import { conditionalElements } from './data/AzureConditionalElements';

export class AzureAzTerraformSchemaImporter extends OcdTerraformSchemaImporter {
    constructor() {
        super(ignoreElements, elementOverrides, conditionalElements, resourceAttributes)
        this.tfProvider = 'registry.terraform.io/azure/azapi'
        this.provider = 'azure'
    }

    convert(source_schema: TerraformSchema) {
        super.convert(source_schema, resourceMap, dataMap)
    }

}

export default AzureAzTerraformSchemaImporter
module.exports = { AzureAzTerraformSchemaImporter }
