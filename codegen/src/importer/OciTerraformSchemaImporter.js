/*
** Copyright (c) 2020, 2022, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { OcdSchemaImporter } from './OcdSchemaImporter.js'
import ignoreElements from './json/oci_ignore_elements.json' assert { type: "json" }
import resourceMap from './json/oci_resource_map.json' assert { type: "json" }

class OciTerraformSchemaImporter extends OcdSchemaImporter {

    convert(source_schema) {
        const self = this
        // console.info('Processing', Object.entries(source_schema.provider_schemas["registry.terraform.io/hashicorp/oci"].resource_schemas).filter(([k, v]) => Object.keys(self.resource_map).indexOf(k) >= 0))
        Object.entries(source_schema.provider_schemas["registry.terraform.io/hashicorp/oci"].resource_schemas).filter(([k, v]) => Object.keys(resourceMap).indexOf(k) >= 0).forEach(([key,value]) => {
            console.info('Processing', key)
            this.ocd_schema[resourceMap[key]] = {
                'tf_resource': key,
                'type': 'object',
                'subtype': '',
                'attributes': this.getAttributes(key, value.block)
            }
        })
    }

    getAttributes(key, block, hierarchy=[]) {
        const ignore_block_types = ['timeouts']
        const ignore_attributes = ignoreElements[key] ? [...ignoreElements.common, ...ignoreElements[key]] : ignoreElements.common
        // Simple attributes
        let attributes = block.attributes ? Object.entries(block.attributes).filter(([k, v]) => !ignore_attributes.includes(k)).reduce((r, [k, v]) => {
            r[k] = {
                provider: 'oci',
                key: this.toCamelCase(k),
                name: k,
                type: Array.isArray(v.type) ? v.type[0] : v.type,
                subtype: Array.isArray(v.type) ? v.type[1] : '',
                required: v.required ? v.required : false,
                label: k.endsWith('_id') || k.endsWith('_ids') ? this.titleCase(k.split('_').slice(0, -1).join(' ')) : this.titleCase(k.split('_').join(' ')),
                id: [...hierarchy, k].join('.'),
                lookup: this.isReference(k) || this.isMultiReference(k),
                lookupResource: this.isReference(k) || this.isMultiReference(k) ? this.lookupResource(k) : ''
            }
            return r
        }, {}) : {}
        // Block / Object Attributes
        if (block.block_types) {
            attributes = Object.entries(block.block_types).filter(([k, v]) => !ignore_attributes.includes(k)).reduce((r, [k, v]) => {
                r[k] = {
                    provider: 'oci',
                    key: this.toCamelCase(k),
                    name: k,
                    type: v.nesting_mode === 'list' && v.max_items === 1 ? 'object' : v.nesting_mode === 'set' ? 'list' : v.nesting_mode,
                    subtype: v.nesting_mode === 'set' ? 'object' : '',
                    required: v.required ? v.required : false,
                    label: this.titleCase(k.split('_').join(' ')),
                    id: [...hierarchy, k].join('.'),
                    attributes: this.getAttributes(key, v.block, [...hierarchy, k])
                }
                return r
            }, attributes)
        }
        return attributes
    }

    titleCase = (str) => str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase())

    isReference = (key) => key && key.endsWith('_id')
    isMultiReference = (key) => key && key.endsWith('_ids')
    lookupResource = (key) => key.split('_').slice(0, -1).join('_').toLowerCase()
}

export default OciTerraformSchemaImporter
export { OciTerraformSchemaImporter }
