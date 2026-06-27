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
        // Log a bounded summary, not the full parsed config — a real .tf project
        // dumps megabytes of JSON to the console and freezes devtools.
        const resourceCount = Array.isArray((parsedTerraform as any)?.resource)
            ? (parsedTerraform as any).resource.length
            : Object.keys((parsedTerraform as any)?.resource ?? {}).length
        console.debug(`OcdTerraformImporter: parsed Terraform (${resourceCount} resource block(s))`)
        const ociImporter = new OciImporter()
        const ociDesign = ociImporter.import(JSON.stringify(parsedTerraform))
        this.design.model.oci = ociDesign.model.oci

        return this.design
    }
}

export default OcdTerraformImporter
