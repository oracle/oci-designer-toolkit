/*
** Copyright (c) 2020, 2023, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { OcdSchemaImporter } from './OcdSchemaImporter'
import { ignoreElements } from './data/OciIgnoreElements'
import { resourceMap } from './data/OciResourceMap'
import { elementOverrides } from './data/OciElementOverrides' 
import { conditionalElements } from './data/OciConditionalElements'
import { attributeMap } from './data/OcdAttributeMap'
import { TerrafomSchemaEntry, TerraformSchema } from '../types/TerraformSchema'
import{ OcdSchemaEntry } from '../types/OcdSchema'
import { OcdResourceMap } from '../types/OcdImporterData'
import { OcdUtils } from '@ocd/core'

export class OciTerraformSchemaImporter extends OcdSchemaImporter {

    convert(source_schema: TerraformSchema) {
        console.info('Resource Map', JSON.stringify(resourceMap, null, 4))
        const resourceKeys = Object.keys(resourceMap)
        console.info('Resource Keys', resourceKeys)
        // const self = this
        // console.info('Processing', Object.entries(source_schema.provider_schemas["registry.terraform.io/hashicorp/oci"].resource_schemas).filter(([k, v]) => Object.keys(self.resource_map).indexOf(k) >= 0))
        Object.entries(source_schema.provider_schemas["registry.terraform.io/hashicorp/oci"].resource_schemas).filter(([k, v]) => resourceKeys.includes(k)).forEach(([key, value]) => {
            console.info('OcdTerraformSchemaImporter: Processing Resource', key)
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
        // console.debug('OcdTerraformSchemaImporter: Resource', key)
        const ignore_block_types = ['timeouts']
        const ignore_attributes = ignoreElements[key] ? [...ignoreElements.common, ...ignoreElements[key]] : ignoreElements.common
        const type_overrides = elementOverrides.types[key] ? {...elementOverrides.types.common, ...elementOverrides.types[key]} : elementOverrides.types.common
        // Simple attributes
        // @ts-ignore
        let attributes = block.attributes ? Object.entries(block.attributes).filter(([k, v]) => !ignore_attributes.includes(k) && !v.deprecated).reduce((r, [k, v]) => {
            const id = [...hierarchy, k].join('.')
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
                label: this.toLabel(k),
                id: id,
                staticLookup: this.isStaticLookup(id, key),
                cacheLookup: this.isCacheLookup(id, key),
                // staticLookup: this.isStaticLookup(k),
                // lookup: this.isReference(k) || this.isMultiReference(k) || this.isLookupOverride(k),
                lookup: this.isReference(k) || this.isMultiReference(k) || this.isLookupOverride(id, key),
                lookupResource: this.isReference(k) || this.isMultiReference(k) ? this.lookupResource(k) : this.isCacheLookup(id, key) ? this.cacheLookupResource(id, key) : '',
                conditional: this.isConditional(key, k),
                condition: this.isConditional(key, k) ? conditionalElements[key][k] : {}
            }
            return r
        }, {} as OcdSchemaEntry) : {}
        // Block / Object Attributes
        if (block.block_types) {
            attributes = Object.entries(block.block_types).filter(([k, v]) => !ignore_attributes.includes(k)).reduce((r, [k, v]) => {
                const id = [...hierarchy, k].join('.')
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
                    label: this.toLabel(k),
                    id: id,
                    conditional: this.isConditional(key, k),
                    condition: this.isConditional(key, k) ? conditionalElements[key][k] : {},
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
    isLookupOverride = (key: string, resource: string = 'common') => elementOverrides.lookups.common.includes(key) || (Object.hasOwn(elementOverrides.lookups, resource) && elementOverrides.lookups[resource].includes(key)) || this.isStaticLookup(key, resource)
    isStaticLookup = (key: string, resource: string = 'common') => elementOverrides.staticLookups.common.includes(key) || (Object.hasOwn(elementOverrides.staticLookups, resource) && elementOverrides.staticLookups[resource].includes(key))
    isCacheLookup = (key: string, resource: string = 'common') => Object.hasOwn(elementOverrides.cacheLookups.common, key) || (Object.hasOwn(elementOverrides.cacheLookups, resource) && Object.hasOwn(elementOverrides.cacheLookups[resource], key))
    lookupResource = (key: string) => key.split('_').slice(0, -1).join('_').toLowerCase()
    cacheLookupResource = (key: string, resource: string = 'common') => (Object.hasOwn(elementOverrides.cacheLookups, resource) && Object.hasOwn(elementOverrides.cacheLookups[resource], key)) ? elementOverrides.cacheLookups[resource][key] : elementOverrides.cacheLookups.common[key]
    toLabel = (key: string) => Object.hasOwn(attributeMap, key) ? attributeMap[key].label : key.endsWith('_id') || key.endsWith('_ids') ? OcdUtils.toTitleCase(key.split('_').slice(0, -1).join(' ')) : OcdUtils.toTitleCase(key.split('_').join(' '))
    isConditional = (key: string, element: string) => Object.hasOwn(conditionalElements, key) && Object.hasOwn(conditionalElements[key], element)
}

export default OciTerraformSchemaImporter
module.exports = { OciTerraformSchemaImporter }
