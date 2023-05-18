/*
** Copyright (c) 2020, 2022, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { OcdDesign } from "../../model/OcdDesign";
import { OciResource } from "../../model/provider/oci/OciResource";
import { OcdExporter, OutputData } from "../OcdExporter";
import * as Model  from '../../model/provider/oci/resources'
import * as Terraform  from './provider/oci/resources'
import { OcdUtils } from "../../utils/OcdUtils";

interface ResourceMap extends Record<string, string> {}

export class OcdTerraformExporter extends OcdExporter {
    terraform: string = ''
    resourceFileMap: ResourceMap = {
        vcn: "oci_networking.tf",
        subnet: "oci_networking.tf",
        unknown: "oci_unspecified.tf"
    }
    export = (design: OcdDesign): OutputData => {
        this.design = design
        let outputData: OutputData = {
            "oci_provider.tf": [this.ociProvider()],
            "oci_metadata.tf": [this.ociMetadata()]
        }
        // Pre-Create Output file Entries
        Object.entries(this.resourceFileMap).forEach(([k, v]) => outputData[this.resourceFileMap.hasOwnProperty(k) ? this.resourceFileMap[k] : this.resourceFileMap['unknown']] = [])
        // Generate OCI Terraform
        Object.entries(design.model.oci.resources).forEach(([k, v]) => {
            const className = OcdUtils.toClassName('Oci', k)
            const filename = this.resourceFileMap.hasOwnProperty(k) ? this.resourceFileMap[k] : this.resourceFileMap['unknown']
            console.info('Class Name', className)
            console.info('File Name', filename)
            v.forEach((r: OciResource) => {
                // @ts-ignore 
                const tfResource = new Terraform[className](r)
                console.info('Generator Resource', tfResource)
                const output = outputData.hasOwnProperty(filename) ? outputData[filename] : outputData[filename] = []
                output.push(tfResource.generate(r))
                console.info('Output', output)
            })
        })
        console.info('Output Data', outputData)
        const allResources: string[] = Object.values(outputData).reduce((a, c) => [...a, ...c], [])
        console.info('All Resources', allResources)
        this.terraform = allResources.join('\n')
        console.info('Terraform', this.terraform)
        return outputData
    }
    ociProvider = () => {return `
terraform {
    required_version = ">= 0.12.0"
}

# ------ Connect to Provider
provider "oci" {
    tenancy_ocid     = {{ tenancy_ocid }}
    user_ocid        = {{ user_ocid }}
    fingerprint      = {{ fingerprint }}
    private_key_path = {{ private_key_path }}
    region           = {{ region }}
}

# ------ Home Region Provider
data "oci_identity_region_subscriptions" "HomeRegion" {
    tenancy_id = {{ tenancy_ocid }}
    filter {
        name = "is_home_region"
        values = [true]
    }
}
locals {
    home_region = lookup(element(data.oci_identity_region_subscriptions.HomeRegion.region_subscriptions, 0), "region_name")
}

provider "oci" {
    alias            = "home_region"
    tenancy_ocid     = {{ tenancy_ocid }}
    user_ocid        = {{ user_ocid }}
    fingerprint      = {{ fingerprint }}
    private_key_path = {{ private_key_path }}
    region           = local.home_region
}

output "Home_Region_Name" {
    value = local.home_region
}
    `}
    ociMetadata = () => {return ``}
}

export default OcdTerraformExporter
