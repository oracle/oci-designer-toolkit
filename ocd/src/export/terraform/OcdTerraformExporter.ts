/*
** Copyright (c) 2020, 2022, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { OcdDesign } from "../../model/OcdDesign";
import { OciResource } from "../../model/provider/oci/OciResource";
import OcdExporter from "../OcdExporter";
import * as Model  from '../../model/provider/oci/resources'
import * as Terraform  from './provider/oci/resources'
import { OcdUtils } from "../../utils/OcdUtils";

interface ResourceMap extends Record<string, string> {}
interface OutputData extends Record<string, string[]> {}

export class OcdTerraformExporter extends OcdExporter {
    terraform: string = ''
    resourceFileMap: ResourceMap = {
        vcn: "network",
        subnet: "network",
        unknown: "main"
    }
    export = (design: OcdDesign): string => {
        this.design = design
        let outputData: OutputData = {}
        Object.entries(this.resourceFileMap).forEach(([k, v]) => outputData[k] = [])
        // Generate OCI Terraform
        Object.entries(design.model.oci.resources).forEach(([k, v]) => {
            const className = OcdUtils.toClassName('Oci', k)
            console.info('Class Name', className)
            v.forEach((r: OciResource) => {
                // @ts-ignore 
                const tfResource = new Terraform[className](r)
                console.info('Generator Resource', tfResource)
                const output = outputData.hasOwnProperty(k) ? outputData[k] : outputData.unknown
                output.push(tfResource.generate(r))
                console.info('Output', output)
            })
        })
        console.info('Output Data', outputData)
        const allResources: string[] = Object.values(outputData).reduce((a, c) => [...a, ...c], [])
        console.info('All Resources', allResources)
        this.terraform = allResources.join('\n')
        console.info('Terraform', this.terraform)
        return this.terraform
    }
}

export default OcdTerraformExporter
