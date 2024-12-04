/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { TerraformSchema } from "../types/TerraformSchema.js";
import { OcdTerraformSchemaImporter } from "./OcdTerraformSchemaImporter.js";
import { resourceMap, dataMap, resourceAttributes } from './data/GoogleResourceMap.js'
import { ignoreElements } from './data/GoogleIgnoreElements.js';
import { elementOverrides } from './data/GoogleElementOverrides.js';
import { conditionalElements } from './data/GoogleConditionalElements.js';

export class GoogleTerraformSchemaImporter extends OcdTerraformSchemaImporter {
    constructor() {
        super(ignoreElements, elementOverrides, conditionalElements, resourceAttributes)
        this.tfProvider = 'registry.terraform.io/hashicorp/google'
        this.provider = 'google'
    }

    convert(source_schema: TerraformSchema) {
        super.convert(source_schema, resourceMap, dataMap)
    }

}

export default GoogleTerraformSchemaImporter
// module.exports = { GoogleTerraformSchemaImporter }
