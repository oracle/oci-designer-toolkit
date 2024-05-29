/*
** Copyright (c) 2020, 2023, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { TerraformSchema } from "../types/TerraformSchema"
import { resourceMap as ociResourceMap, dataMap as ociDataMap } from './data/OciResourceMap'
import { resourceMap as azureAzResourceMap } from './data/AzureResourceMap'

export class OcdTerraformSchemaResourceAttributesGenerator {
    ocd_schema: Record<string, any> = {}
    ignore: string[] = [
        "created_by",
        "id",
        "compartment_id",
        "defined_tags",
        "freeform_tags",
        "inactive_state",
        "is_accessible",
        "lifecycle_details",
        "state",
        "system_tags",
        "time_created",
        "time_updated",
        "timeouts",
    ]
    resourceKeys = [...Object.keys(ociResourceMap), ...Object.keys(ociDataMap), ...Object.keys(azureAzResourceMap)].sort()
    dataKeys = [...Object.keys(ociDataMap)].sort()
    convert(source_schema: TerraformSchema) {return this.generate(source_schema)}
    generate(source_schema: TerraformSchema) {
        console.debug('OCI Resources:', JSON.stringify(ociResourceMap, null, 2))
        Object.entries(source_schema.provider_schemas).forEach(([key, value]) => {
            this.ocd_schema[key] = {...this.getResources(value.resource_schemas), ...this.getData(value.data_source_schemas)}
            // this.ocd_schema[key] = this.getData(value.data_source_schemas)
        })

        return this.ocd_schema
    }

    getResources(resource: Record<string, any>): Record<string, any> {
        let resources: Record<string, any> = {}
        Object.entries(resource).filter(([k, v]) => this.resourceKeys.includes(k)).forEach(([key, value]) => {
            console.debug('Processing Resource:', key)
            resources[key] = this.getAttributes(value.block, [])
        })
        return resources
    }

    getData(resource: Record<string, any>): Record<string, any> {
        let resources: Record<string, any> = {}
        Object.entries(resource).filter(([k, v]) => this.dataKeys.includes(k)).forEach(([key, value]) => {
            console.debug('Processing Data:', key)
            resources[key] = this.getAttributes(value.block, [])
        })
        return resources
    }

    getAttributes(block: Record<string, any>, hierarchy: string[]): string[] {
        let attributes: string[] = []
        if(block.attributes) attributes = [...attributes, ...Object.keys(block.attributes).filter((k) => !this.ignore.includes(k)).map((k) => this.genId(k, hierarchy))]
        if (block.block_types) {
            Object.entries(block.block_types).filter(([k, v]) => !this.ignore.includes(k)).forEach(([key, value]) => {
                // @ts-ignore
                attributes = [...attributes, this.genId(key, hierarchy), ...this.getAttributes(value.block, [...hierarchy, key])]
            })
        }
        return attributes.sort()
    }

    genId = (k: string, hierarchy: string[]=[]) => [...hierarchy, k].join('.')

}
