/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { resourceMap, dataMap, resourceAttributes } from './data/GcpResourceMap'
import { TerraformSchema } from "../types/TerraformSchema";
import { OcdTerraformSchemaImporter } from "./OcdTerraformSchemaImporter";
import { ignoreElements } from './data/GcpIgnoreElements';
import { elementOverrides } from './data/GcpElementOverrides';
import { conditionalElements } from './data/GcpConditionalElements';

export class GcpTerraformSchemaImporter extends OcdTerraformSchemaImporter {
    constructor() {
        super(ignoreElements, elementOverrides, conditionalElements, resourceAttributes)
        this.tfProvider = 'registry.terraform.io/hashicorp/google'
        this.provider = 'gcp'
    }

    convert(source_schema: TerraformSchema) {
        super.convert(source_schema, resourceMap, dataMap)
    }

}

export default GcpTerraformSchemaImporter
module.exports = { GcpTerraformSchemaImporter }
