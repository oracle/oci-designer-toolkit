/*
** Copyright (c) 2020, 2023, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { OcdUtils } from "@ocd/core";
import { OcdConditionalElements, OcdElementOverrides, OcdIgnoreElements, OcdIncludedElements } from "../types/OcdImporterData";
import { OcdSchemaEntry } from "../types/OcdSchema";
import { TerrafomSchemaEntry, TerraformSchema, TerraformSchemaDataMap, TerraformSchemaResourceMap } from "../types/TerraformSchema";
import { OcdSchemaImporter } from "./OcdSchemaImporter";

export class OcdTerraformSchemaImporter extends OcdSchemaImporter {
    tfProvider: string = ''
    provider: string = ''
    ignoreElements: OcdIgnoreElements
    elementOverrides: OcdElementOverrides
    conditionalElements: OcdConditionalElements
    includedElements: OcdIncludedElements

    constructor(ignoreElements: OcdIgnoreElements, elementOverrides: OcdElementOverrides, conditionalElements: OcdConditionalElements, includedElements: OcdIncludedElements) {
        super()
        this.ignoreElements = ignoreElements
        this.elementOverrides = elementOverrides
        this.conditionalElements = conditionalElements
        this.includedElements = includedElements
    }

    convert(source_schema: TerraformSchema, resourceMap: TerraformSchemaResourceMap = {}, dataMap: TerraformSchemaDataMap = {}) {
        console.debug('OcdTerraformSchemaImporter: Converting Schema for', this.tfProvider)
        // Check Resource Schema
        this.generateResourceEntries(source_schema, resourceMap)
        // Check Data Schema
        this.generateDataEntries(source_schema, dataMap)
    }

    generateResourceEntries = (source_schema: TerraformSchema, resourceMap: TerraformSchemaResourceMap = {}) => {
        const resourceKeys = Object.keys(resourceMap)
        Object.entries(source_schema.provider_schemas[this.tfProvider].resource_schemas).filter(([k, v]) => resourceKeys.includes(k)).forEach(([key, value]) => {
            console.debug('OcdTerraformSchemaImporter: Processing Resource', key)
            this.ocd_schema[resourceMap[key]] = {
                'tf_resource': key,
                'type': 'object',
                'subtype': '',
                // @ts-ignore
                'attributes': this.getAttributes(key, value.block)
            }
        })
    }

    generateDataEntries = (source_schema: TerraformSchema, dataMap: TerraformSchemaDataMap = {}) => {
        const dataKeys = Object.keys(dataMap)
        Object.entries(source_schema.provider_schemas[this.tfProvider].data_source_schemas).filter(([k, v]) => dataKeys.includes(k)).forEach(([key, value]) => {
            console.debug('OcdTerraformSchemaImporter: Processing data', key)
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
        const ignore_attributes = this.ignoreElements[key] ? [...this.ignoreElements.common, ...this.ignoreElements[key]] : this.ignoreElements.common
        const includeAttributes = this.includedElements[key] ? [...this.includedElements.common, ...this.includedElements[key]] : this.includedElements.common
        const type_overrides = this.elementOverrides.types[key] ? {...this.elementOverrides.types.common, ...this.elementOverrides.types[key]} : this.elementOverrides.types.common
        const maps = {...this.elementOverrides.maps.common, ...this.elementOverrides.maps[key] !== undefined ? this.elementOverrides.maps[key] : {}}
        const defaults = {...this.elementOverrides.defaults.common, ...this.elementOverrides.defaults[key] !== undefined ? this.elementOverrides.defaults[key] : {}}
        const labels = {...this.elementOverrides.labels.common, ...this.elementOverrides.labels[key] !== undefined ? this.elementOverrides.labels[key] : {}}
        const lookupOverrides = {...this.elementOverrides.lookupOverrides.common, ...this.elementOverrides.lookupOverrides[key] !== undefined ? this.elementOverrides.lookupOverrides[key] : {}}
        // console.debug('OcdTerraformSchemaImporter: Resource', key, type_overrides)
        // Simple attributes
        // @ts-ignore
        // let attributes = block.attributes ? Object.entries(block.attributes).filter(([k, v]) => !ignore_attributes.includes(this.genId(k, hierarchy)) && !v.deprecated).reduce((r, [k, v]) => {
        let attributes = block.attributes ? Object.entries(block.attributes).filter(([k, v]) => includeAttributes.includes(this.genId(k, hierarchy)) && !v.deprecated).reduce((r, [k, v]) => {
            const id = this.genId(k, hierarchy)
            r[k] = {
                provider: this.provider,
                key: this.toCamelCase(k),
                name: k,
                // @ts-ignore
                type: type_overrides[k] ? type_overrides[k][0] : this.isMultiReference(k) ? 'list' : Array.isArray(v.type) ? v.type[0] : v.type,
                // @ts-ignore
                subtype: type_overrides[k] && type_overrides[k].length > 1 ? type_overrides[k][1] : Array.isArray(v.type) ? v.type[1] : '',
                // @ts-ignore
                required: this.isRequired(id, key, v.required ? v.required : false),
                label: this.toLabel(k, labels, hierarchy),
                id: id,
                staticLookup: this.isStaticLookup(id, key),
                cacheLookup: this.isCacheLookup(id, key),
                lookup: this.isReference(k) || this.isMultiReference(k) || this.isLookupOverride(id, key),
                lookupResource: this.isCacheLookup(id, key) ? this.cacheLookupResource(id, key) : this.isReference(k) || this.isMultiReference(k) || this.isLookupOverride(id, key) ? this.lookupResource(k, lookupOverrides) : '',
                lookupResourceElement: this.isCacheLookup(id, key) ? this.cacheLookupResource(id, key) : this.isReference(k) || this.isMultiReference(k) || this.isLookupOverride(id, key) ? this.lookupResourceElement(k, lookupOverrides) : '',
                conditional: this.isConditional(key, k),
                condition: this.isConditional(key, k) ? this.conditionalElements[key][k] : {},
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
            // attributes = Object.entries(block.block_types).filter(([k, v]) => !ignore_attributes.includes(this.genId(k, hierarchy))).reduce((r, [k, v]) => {
            attributes = Object.entries(block.block_types).filter(([k, v]) => includeAttributes.includes(this.genId(k, hierarchy))).reduce((r, [k, v]) => {
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
                    condition: this.isConditional(key, k) ? this.conditionalElements[key][k] : {},
                    // @ts-ignore
                    attributes: this.getAttributes(key, v.block, [...hierarchy, k])
                }
                return r
            }, attributes)
        }
        return attributes
    }

    isRequired = (key: string, resource: string, defaultValue: boolean): boolean => (Object.hasOwn(this.elementOverrides.required, resource) && Object.hasOwn(this.elementOverrides.required[resource], key)) ? this.elementOverrides.required[resource][key] : Object.hasOwn(this.elementOverrides.required.common, key) ? this.elementOverrides.required.common[key] : defaultValue
    isReference = (key: string) => key && key.endsWith('_id')
    isMultiReference = (key: string) => key && key.endsWith('_ids')
    isLookupOverride = (key: string, resource: string = 'common') => this.elementOverrides.lookups.common.includes(key) || (Object.hasOwn(this.elementOverrides.lookups, resource) && this.elementOverrides.lookups[resource].includes(key)) || this.isStaticLookup(key, resource)
    isStaticLookup = (key: string, resource: string = 'common') => this.elementOverrides.staticLookups.common.includes(key) || (Object.hasOwn(this.elementOverrides.staticLookups, resource) && this.elementOverrides.staticLookups[resource].includes(key))
    isCacheLookup = (key: string, resource: string = 'common') => Object.hasOwn(this.elementOverrides.cacheLookups.common, key) || (Object.hasOwn(this.elementOverrides.cacheLookups, resource) && Object.hasOwn(this.elementOverrides.cacheLookups[resource], key))
    lookupResource = (key: string, overrides: Record<string, any>) => Object.hasOwn(overrides, key) ? overrides[key].list : key.split('_').slice(0, -1).join('_').toLowerCase()
    lookupResourceElement = (key: string, overrides: Record<string, any>) => Object.hasOwn(overrides, key) ? overrides[key].element : 'id'
    cacheLookupResource = (key: string, resource: string = 'common') => (Object.hasOwn(this.elementOverrides.cacheLookups, resource) && Object.hasOwn(this.elementOverrides.cacheLookups[resource], key)) ? this.elementOverrides.cacheLookups[resource][key] : this.elementOverrides.cacheLookups.common[key]
    toLabel = (key: string, labels: Record<string,any>, hierarchy=[]) => Object.hasOwn(labels, this.genId(key, hierarchy)) ? labels[this.genId(key, hierarchy)] : key.endsWith('_id') || key.endsWith('_ids') ? OcdUtils.toTitleCase(key.split('_').slice(0, -1).join(' ')) : OcdUtils.toTitleCase(key.split('_').join(' '))
    isConditional = (key: string, element: string) => Object.hasOwn(this.conditionalElements, key) && Object.hasOwn(this.conditionalElements[key], element)

}
