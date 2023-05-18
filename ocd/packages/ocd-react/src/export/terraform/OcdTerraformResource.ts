/*
** Copyright (c) 2020, 2022, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

export class OcdTerraformResource {
    isVariable = (data: string | undefined): boolean => data !== undefined && data.startsWith('var.')
    formatVariable = (data: string | undefined): string | undefined => data
    generateTextAttribute = (name: string, value: string | undefined, required: boolean) => {
        if (this.isVariable(value)) return `${name} = ${this.formatVariable(value)}`
        else if (required) return `${name} = "${value}"`
        else if (value && value !== '') return `${name} = "${value}"`
        else return ''
    }
    generateBooleanAttribute = (name: string, value: string | boolean | undefined, required: boolean) => {
        if (typeof value === 'string' && this.isVariable(value)) return `${name} = ${this.formatVariable(value)}`
        else if (required) return `${name} = ${value}`
        else if (value && typeof value === 'boolean') return `${name} = ${value}`
        else return ''
    }
    generateNumberAttribute = (name: string, value: string | number | undefined, required: boolean) => {
        if (typeof value === 'string' && this.isVariable(value)) return `${name} = ${this.formatVariable(value)}`
        else if (required) return `${name} = ${value}`
        else if (value && typeof value === 'number') return `${name} = ${value}`
        else return ''
    }

    // if (attribute.type === 'string')      return `${name} = \\\`\${this.isVariable(resource.${this.toCamelCase(name)}) ? this.formatVariable(resource.${this.toCamelCase(name)}) : "resource.${this.toCamelCase(name)}"}\\\``
    // else if (attribute.type === 'bool')   return `${name} = \${resource.${this.toCamelCase(name)}}`
    // else if (attribute.type === 'number') return `${name} = \${resource.${this.toCamelCase(name)}}`

}

export default OcdTerraformResource
