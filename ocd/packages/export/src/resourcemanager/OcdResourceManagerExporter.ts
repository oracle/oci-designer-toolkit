/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { OcdDesign } from "@ocd/model"
import { OutputDataStringArray } from "../OcdExporter.js"
import { OcdTerraformExporter } from '../terraform/OcdTerraformExporter.js'
import { OciResourceManagerExporter } from "./OciResourceManagerExporter.js"

interface ResourceMap extends Record<string, Record<string, string>> {}

export class OcdResourceManagerExporter extends OcdTerraformExporter {
    export = (design: OcdDesign): OutputDataStringArray => {
        this.design = design
        const ociExporter = new OciResourceManagerExporter()
        const outputData: OutputDataStringArray = {
            ...ociExporter.export(design)
        }
        const allResources: string[] = Object.values(outputData).reduce((a, c) => [...a, ...c], [])
        this.terraform = allResources.join('\n')
        return outputData
    }
}

export default OcdResourceManagerExporter
