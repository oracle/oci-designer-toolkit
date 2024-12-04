/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { resourceMap, dataMap, resourceAttributes } from './data/AzureAzResourceMap.js'
import { TerraformSchema } from "../types/TerraformSchema.js";
import { OcdTerraformSchemaImporter } from "./OcdTerraformSchemaImporter.js";
import { ignoreElements } from './data/AzureIgnoreElements.js';
import { elementOverrides } from './data/AzureElementOverrides.js';
import { conditionalElements } from './data/AzureConditionalElements.js';

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
// module.exports = { AzureAzTerraformSchemaImporter }
