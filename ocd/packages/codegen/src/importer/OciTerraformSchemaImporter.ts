/*
** Copyright (c) 2020, 2023, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { OcdSchemaImporter } from './OcdSchemaImporter'
import { ignoreElements } from './data/OciIgnoreElements'
import { resourceMap } from './data/OciResourceMap'
import { elementOverrides } from './data/OciElementOverrides' 
import { TerrafomSchemaEntry, TerraformSchema } from '../types/TerraformSchema'
import{ OcdSchemaEntry } from '../types/OcdSchema'
import { OcdResourceMap } from '../types/OcdImporterData'
import { OcdUtils } from '@ocd/core'

export class OciTerraformSchemaImporter extends OcdSchemaImporter {

    convert(source_schema: TerraformSchema) {
        const self = this
        // console.info('Processing', Object.entries(source_schema.provider_schemas["registry.terraform.io/hashicorp/oci"].resource_schemas).filter(([k, v]) => Object.keys(self.resource_map).indexOf(k) >= 0))
        Object.entries(source_schema.provider_schemas["registry.terraform.io/hashicorp/oci"].resource_schemas).filter(([k, v]) => Object.keys(resourceMap).indexOf(k) >= 0).forEach(([key, value]) => {
            console.info('Processing', key)
            this.ocd_schema[resourceMap[key]] = {
                'tf_resource': key,
                'type': 'object',
                'subtype': '',
                // @ts-ignore
                'attributes': this.getAttributes(key, value.block)
            }
        })
    }

    getAttributes(key: string, block: TerrafomSchemaEntry, hierarchy=[]) {
        const ignore_block_types = ['timeouts']
        const ignore_attributes = ignoreElements[key] ? [...ignoreElements.common, ...ignoreElements[key]] : ignoreElements.common
        const type_overrides = elementOverrides.types[key] ? {...elementOverrides.types.common, ...elementOverrides.types[key]} : elementOverrides.types.common
        // Simple attributes
        // @ts-ignore
        let attributes = block.attributes ? Object.entries(block.attributes).filter(([k, v]) => !ignore_attributes.includes(k) && !v.deprecated).reduce((r, [k, v]) => {
            r[k] = {
                provider: 'oci',
                key: this.toCamelCase(k),
                name: k,
                // @ts-ignore
                type: this.isMultiReference(k) ? 'list' : Array.isArray(v.type) ? v.type[0] : type_overrides[k] ? type_overrides[k] : v.type,
                // @ts-ignore
                subtype: Array.isArray(v.type) ? v.type[1] : '',
                // @ts-ignore
                required: v.required ? v.required : false,
                label: k.endsWith('_id') || k.endsWith('_ids') ? OcdUtils.toTitleCase(k.split('_').slice(0, -1).join(' ')) : OcdUtils.toTitleCase(k.split('_').join(' ')),
                id: [...hierarchy, k].join('.'),
                staticLookup: this.isStaticLookup(k),
                lookup: this.isReference(k) || this.isMultiReference(k) || this.isLookupOverride(k),
                lookupResource: this.isReference(k) || this.isMultiReference(k) ? this.lookupResource(k) : ''
            }
            return r
        }, {} as OcdSchemaEntry) : {}
        // Block / Object Attributes
        if (block.block_types) {
            attributes = Object.entries(block.block_types).filter(([k, v]) => !ignore_attributes.includes(k)).reduce((r, [k, v]) => {
                r[k] = {
                    provider: 'oci',
                    key: this.toCamelCase(k),
                    name: k,
                    // @ts-ignore
                    type: v.nesting_mode === 'list' && v.max_items === 1 ? 'object' : v.nesting_mode === 'set' ? 'list' : v.nesting_mode,
                    // @ts-ignore
                    subtype: v.nesting_mode === 'set' ? 'object' : '',
                    // @ts-ignore
                    required: v.required ? v.required : false,
                    label: OcdUtils.toTitleCase(k.split('_').join(' ')),
                    id: [...hierarchy, k].join('.'),
                    // @ts-ignore
                    attributes: this.getAttributes(key, v.block, [...hierarchy, k])
                }
                return r
            }, attributes)
        }
        return attributes
    }

    // titleCase = (str) => str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase())

    isReference = (key: string) => key && key.endsWith('_id')
    isMultiReference = (key: string) => key && key.endsWith('_ids')
    isLookupOverride = (key: string) => elementOverrides.lookups.includes(key) || elementOverrides.staticLookups.includes(key)
    isStaticLookup = (key: string) => elementOverrides.staticLookups.includes(key)
    lookupResource = (key: string) => key.split('_').slice(0, -1).join('_').toLowerCase()
}

export default OciTerraformSchemaImporter
module.exports = { OciTerraformSchemaImporter }
