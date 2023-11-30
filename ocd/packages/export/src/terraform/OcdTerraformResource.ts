/*
** Copyright (c) 2020, 2023, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { OcdUtils } from "@ocd/core"

interface ResourcePropertyCondition {
    element?: string,
    operator?: 'eq' | 'lt' | 'gt' | 'ne' | 'le' | 'ge' | 'in'
    value?: boolean | string | number | Function
}

export class OcdTerraformResource {
    indentation = ['', '    ', '        ', '            ', '                ']
    idTFResourceMap: Record<string, string> = {}
    constructor(idTFResourceMap={}) {
        this.idTFResourceMap = idTFResourceMap
    }
    isVariable = (data: string | undefined): boolean => data !== undefined && data.startsWith('var.')
    formatVariable = (data: string | undefined): string | undefined => data
    generateReferenceAttribute = (name: string, value: string | undefined, required: boolean, level=0) => {
        if (this.isVariable(value)) return `${this.indentation[level]}${name} = ${this.formatVariable(value)}`
        else if (required) return `${this.indentation[level]}${name} = local.${this.idTFResourceMap[value as string]}_id`
        else if (value && value !== '') return `${this.indentation[level]}${name} = local.${this.idTFResourceMap[value]}_id`
        else return `${this.indentation[level]}# ${name} = "${value}"`
    }
    generateTextAttribute = (name: string, value: string | undefined, required: boolean, level=0) => {
        console.debug('OcdTerraformResource: generateTextAttribute:', name, 'Level:', level, `(${this.indentation[level]})`)
        if (this.isVariable(value)) return `${this.indentation[level]}${name} = ${this.formatVariable(value)}`
        else if (required) return `${this.indentation[level]}${name} = "${value}"`
        else if (value && value.trim() !== '') return `${this.indentation[level]}${name} = "${value}"`
        else return `${this.indentation[level]}# ${name} = "${value}"`
    }
    generateBooleanAttribute = (name: string, value: string | boolean | undefined, required: boolean, level=0) => {
        if (typeof value === 'string' && this.isVariable(value)) return `${this.indentation[level]}${name} = ${this.formatVariable(value)}`
        else if (required) return `${this.indentation[level]}${name} = ${value}`
        else if (typeof value === 'boolean') return `${this.indentation[level]}${name} = ${value}`
        else return `${this.indentation[level]}# ${name} = ${value}`
    }
    generateNumberAttribute = (name: string, value: string | number | undefined, required: boolean, level=0) => {
        if (typeof value === 'string' && this.isVariable(value)) return `${this.indentation[level]}${name} = ${this.formatVariable(value)}`
        else if (required) return `${this.indentation[level]}${name} = ${value}`
        else if (value && typeof value === 'number') return `${this.indentation[level]}${name} = ${value}`
        else return `${this.indentation[level]}# ${name} = ${value}`
    }
    generateReferenceListAttribute = (name: string, value: string | string[] | undefined, required: boolean, level=0) => {
        console.debug('OcdTerraformResource: generateReferenceListAttribute:', value, typeof value)
        if (!Array.isArray(value) && this.isVariable(value)) return `${this.indentation[level]}${name} = ${this.formatVariable(value as string)}`
        else if (required && Array.isArray(value)) return `${this.indentation[level]}${name} = [${value.map((v: string) => `local.${this.idTFResourceMap[v]}_id`)}]`
        else if (Array.isArray(value) && value.length > 0) return `${this.indentation[level]}${name} = [${value.map((v: string) => `local.${this.idTFResourceMap[v]}_id`)}]`
        else return `${this.indentation[level]}# ${name} = "${value}"`
    }
    generateStringListAttribute = (name: string, value: string | string[] | undefined, required: boolean, level=0) => {
        console.debug('OcdTerraformResource: generateStringListAttribute:', value, typeof value)
        if (!Array.isArray(value) && this.isVariable(value)) return `${this.indentation[level]}${name} = ${this.formatVariable(value as string)}`
        else if (required && Array.isArray(value)) return `${this.indentation[level]}${name} = [${value.map((v: string) => `"${v}"`)}]`
        else if (Array.isArray(value) && value.length > 0) return `${this.indentation[level]}${name} = [${value.map((v: string) => `"${v}"`)}]`
        else return `${this.indentation[level]}# ${name} = "${value}"`
    }

    isPropertyAssignConditionTrue = (conditional: boolean, condition: ResourcePropertyCondition, resource: Record<string, any>): boolean => {
        // If not conditional then we will always display
        if (!conditional) return true
        // Check condition
        const element = condition.element ? condition.element.indexOf('_') ? OcdUtils.toCamelCase(condition.element)  : condition.element : ''
        const display = OcdUtils.isCondition(resource[element], condition.operator, condition.value)
        // const display = condition.element ? resource[element] === condition.value : false
        // console.debug('OcdPropertyTypes: isPropertyDisplayConditionTrue', element, display, condition, resource)
        return display
    }
    
    // if (attribute.type === 'string')      return `${name} = \\\`\${this.isVariable(resource.${this.toCamelCase(name)}) ? this.formatVariable(resource.${this.toCamelCase(name)}) : "resource.${this.toCamelCase(name)}"}\\\``
    // else if (attribute.type === 'bool')   return `${name} = \${resource.${this.toCamelCase(name)}}`
    // else if (attribute.type === 'number') return `${name} = \${resource.${this.toCamelCase(name)}}`

}

export default OcdTerraformResource
