/*
** Copyright (c) 2020, 2023, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { OcdSchemaImporter } from './OcdSchemaImporter'
import { ignoreElements } from './data/OciIgnoreElements'
import { resourceMap, dataMap, resourceAttributes } from './data/OciResourceMap'
import { elementOverrides } from './data/OciElementOverrides' 
import { conditionalElements } from './data/OciConditionalElements'
// import { attributeMap } from './data/OcdAttributeMap'
import { TerrafomSchemaEntry, TerraformSchema } from '../types/TerraformSchema'
import{ OcdSchemaEntry } from '../types/OcdSchema'
// import { OcdResourceMap } from '../types/OcdImporterData'
import { OcdUtils } from '@ocd/core'
import { OcdTerraformSchemaImporter } from './OcdTerraformSchemaImporter'

export class OciTerraformSchemaImporter extends OcdTerraformSchemaImporter {
    constructor() {
        super(ignoreElements, elementOverrides, conditionalElements, resourceAttributes)
        this.tfProvider = 'registry.terraform.io/hashicorp/oci'
        this.provider = 'oci'
    }

    convert(source_schema: TerraformSchema) {
        super.convert(source_schema, resourceMap, dataMap)
    }

    convertOrig(source_schema: TerraformSchema) {
        console.debug('OciTerraformSchemaImporter: Resource Map', JSON.stringify(resourceMap, null, 4))
        const resourceKeys = Object.keys(resourceMap)
        const dataKeys = Object.keys(dataMap)
        console.debug('OciTerraformSchemaImporter: Resource Keys', resourceKeys)
        // const self = this
        // console.info('Processing', Object.entries(source_schema.provider_schemas["registry.terraform.io/hashicorp/oci"].resource_schemas).filter(([k, v]) => Object.keys(self.resource_map).indexOf(k) >= 0))
        // Check Resource Schema
        Object.entries(source_schema.provider_schemas["registry.terraform.io/hashicorp/oci"].resource_schemas).filter(([k, v]) => resourceKeys.includes(k)).forEach(([key, value]) => {
            console.debug('OciTerraformSchemaImporter: Processing Resource', key)
            this.ocd_schema[resourceMap[key]] = {
                'tf_resource': key,
                'type': 'object',
                'subtype': '',
                // @ts-ignore
                'attributes': this.getAttributes(key, value.block)
            }
        })
        // Check Data Schema
        Object.entries(source_schema.provider_schemas["registry.terraform.io/hashicorp/oci"].data_source_schemas).filter(([k, v]) => dataKeys.includes(k)).forEach(([key, value]) => {
            console.debug('OciTerraformSchemaImporter: Processing data', key)
            this.ocd_schema[dataMap[key]] = {
                'tf_resource': key.endsWith('s') ? dataMap[key] : key,
                'type': 'object',
                'subtype': '',
                // @ts-ignore
                'attributes': this.getAttributes(key, value.block)
            }
        })
    }

    genId = (k: string, hierarchy: string[]=[]) => [...hierarchy, k].join('.')

    getAttributes(key: string, block: TerrafomSchemaEntry, hierarchy=[]) {
        const ignore_block_types = ['timeouts']
        const ignore_attributes = ignoreElements[key] ? [...ignoreElements.common, ...ignoreElements[key]] : ignoreElements.common
        const type_overrides = elementOverrides.types[key] ? {...elementOverrides.types.common, ...elementOverrides.types[key]} : elementOverrides.types.common
        const maps = {...elementOverrides.maps.common, ...elementOverrides.maps[key] !== undefined ? elementOverrides.maps[key] : {}}
        const defaults = {...elementOverrides.defaults.common, ...elementOverrides.defaults[key] !== undefined ? elementOverrides.defaults[key] : {}}
        const labels = {...elementOverrides.labels.common, ...elementOverrides.labels[key] !== undefined ? elementOverrides.labels[key] : {}}
        const lookupOverrides = {...elementOverrides.lookupOverrides.common, ...elementOverrides.lookupOverrides[key] !== undefined ? elementOverrides.lookupOverrides[key] : {}}
        // console.debug('OcdTerraformSchemaImporter: Resource', key, type_overrides)
        // Simple attributes
        // @ts-ignore
        // let attributes = block.attributes ? Object.entries(block.attributes).filter(([k, v]) => !ignore_attributes.includes(k) && !v.deprecated).reduce((r, [k, v]) => {
        let attributes = block.attributes ? Object.entries(block.attributes).filter(([k, v]) => !ignore_attributes.includes(this.genId(k, hierarchy)) && !v.deprecated).reduce((r, [k, v]) => {
            // const id = [...hierarchy, k].join('.')
            const id = this.genId(k, hierarchy)
            r[k] = {
                provider: 'oci',
                key: this.toCamelCase(k),
                name: k,
                // @ts-ignore
                type: type_overrides[k] ? type_overrides[k][0] : this.isMultiReference(k) ? 'list' : Array.isArray(v.type) ? v.type[0] : v.type,
                // @ts-ignore
                subtype: type_overrides[k] && type_overrides[k].length > 1 ? type_overrides[k][1] : Array.isArray(v.type) ? v.type[1] : '',
                // @ts-ignore
                required: this.isRequired(id, key, v.required ? v.required : false),
                // required: v.required ? v.required : false,
                label: this.toLabel(k, labels, hierarchy),
                // label: this.toLabel(k),
                id: id,
                staticLookup: this.isStaticLookup(id, key),
                cacheLookup: this.isCacheLookup(id, key),
                // staticLookup: this.isStaticLookup(k),
                // lookup: this.isReference(k) || this.isMultiReference(k) || this.isLookupOverride(k),
                lookup: this.isReference(k) || this.isMultiReference(k) || this.isLookupOverride(id, key),
                lookupResource: this.isCacheLookup(id, key) ? this.cacheLookupResource(id, key) : this.isReference(k) || this.isMultiReference(k) || this.isLookupOverride(id, key) ? this.lookupResource(k, lookupOverrides) : '',
                lookupResourceElement: this.isCacheLookup(id, key) ? this.cacheLookupResource(id, key) : this.isReference(k) || this.isMultiReference(k) || this.isLookupOverride(id, key) ? this.lookupResourceElement(k, lookupOverrides) : '',
                // lookupResource: this.isCacheLookup(id, key) ? this.cacheLookupResource(id, key) : this.isReference(k) || this.isMultiReference(k) || this.isLookupOverride(id, key) ? this.lookupResource(k) : '',
                conditional: this.isConditional(key, k),
                condition: this.isConditional(key, k) ? conditionalElements[key][k] : {},
                default: defaults[id] !== undefined ? defaults[id] : undefined
            }
            if (r[k].type === 'map' && Object.hasOwn(maps, k)) {
                // console.debug('OcdTerraformSchemaImporter: Found Map', key, k, JSON.stringify(maps, null, 4))
                r[k].type = 'object'
                r[k].subtype = 'map'
                r[k].attributes = maps[k].attributes
            }
            return r
        }, {} as OcdSchemaEntry) : {}
        // Block / Object Attributes
        if (block.block_types) {
            // attributes = Object.entries(block.block_types).filter(([k, v]) => !ignore_attributes.includes(k)).reduce((r, [k, v]) => {
            attributes = Object.entries(block.block_types).filter(([k, v]) => !ignore_attributes.includes(this.genId(k, hierarchy))).reduce((r, [k, v]) => {
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
                    required: this.isRequired(id, key, v.required ? v.required : false),
                    // required: v.required ? v.required : false,
                    label: this.toLabel(k, labels, hierarchy),
                    // label: this.toLabel(k),
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

    // // titleCase = (str) => str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase())

    // isRequired = (key: string, resource: string, defaultValue: boolean): boolean => (Object.hasOwn(elementOverrides.required, resource) && Object.hasOwn(elementOverrides.required[resource], key)) ? elementOverrides.required[resource][key] : Object.hasOwn(elementOverrides.required.common, key) ? elementOverrides.required.common[key] : defaultValue
    // isReference = (key: string) => key && key.endsWith('_id')
    // isMultiReference = (key: string) => key && key.endsWith('_ids')
    // isLookupOverride = (key: string, resource: string = 'common') => elementOverrides.lookups.common.includes(key) || (Object.hasOwn(elementOverrides.lookups, resource) && elementOverrides.lookups[resource].includes(key)) || this.isStaticLookup(key, resource)
    // isStaticLookup = (key: string, resource: string = 'common') => elementOverrides.staticLookups.common.includes(key) || (Object.hasOwn(elementOverrides.staticLookups, resource) && elementOverrides.staticLookups[resource].includes(key))
    // isCacheLookup = (key: string, resource: string = 'common') => Object.hasOwn(elementOverrides.cacheLookups.common, key) || (Object.hasOwn(elementOverrides.cacheLookups, resource) && Object.hasOwn(elementOverrides.cacheLookups[resource], key))
    // lookupResource = (key: string, overrides: Record<string, any>) => Object.hasOwn(overrides, key) ? overrides[key].list : key.split('_').slice(0, -1).join('_').toLowerCase()
    // lookupResourceElement = (key: string, overrides: Record<string, any>) => Object.hasOwn(overrides, key) ? overrides[key].element : 'id'
    // // lookupResource = (key: string) => Object.hasOwn(elementOverrides.resourceLookupOverrides.common, key) ? elementOverrides.resourceLookupOverrides.common[key] : key.split('_').slice(0, -1).join('_').toLowerCase()
    // cacheLookupResource = (key: string, resource: string = 'common') => (Object.hasOwn(elementOverrides.cacheLookups, resource) && Object.hasOwn(elementOverrides.cacheLookups[resource], key)) ? elementOverrides.cacheLookups[resource][key] : elementOverrides.cacheLookups.common[key]
    // // toLabel = (key: string) => Object.hasOwn(attributeMap, key) ? attributeMap[key].label : key.endsWith('_id') || key.endsWith('_ids') ? OcdUtils.toTitleCase(key.split('_').slice(0, -1).join(' ')) : OcdUtils.toTitleCase(key.split('_').join(' '))
    // toLabel = (key: string, labels: Record<string,any>, hierarchy=[]) => Object.hasOwn(labels, this.genId(key, hierarchy)) ? labels[this.genId(key, hierarchy)] : key.endsWith('_id') || key.endsWith('_ids') ? OcdUtils.toTitleCase(key.split('_').slice(0, -1).join(' ')) : OcdUtils.toTitleCase(key.split('_').join(' '))
    // isConditional = (key: string, element: string) => Object.hasOwn(conditionalElements, key) && Object.hasOwn(conditionalElements[key], element)
}

export default OciTerraformSchemaImporter
module.exports = { OciTerraformSchemaImporter }
