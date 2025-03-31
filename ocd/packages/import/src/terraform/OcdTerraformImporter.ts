/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { OcdDesign } from "@ocd/model"
import { OcdImporter } from "../OcdImporter.js"
import { OciImporter } from "./OciImporter.js"
import { TerraformParser } from "@ocd/parser"

export class OcdTerraformImporter extends OcdImporter {
    import = (terraform: string): OcdDesign => {
        const terraformParser: TerraformParser = new TerraformParser(terraform)
        const parsedTerraform = terraformParser.parse()
        console.debug('OcdTerraformImporter: Parsed Terraform', JSON.stringify(parsedTerraform, null, 2))
        const ociImporter = new OciImporter()
        const ociDesign = ociImporter.import(JSON.stringify(parsedTerraform))
        this.design.model.oci = ociDesign.model.oci

        return this.design
    }
}

export default OcdTerraformImporter
