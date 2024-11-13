/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { OcdUtils } from "@ocd/core"
import { OcdResource, OcdTag } from "@ocd/model"
import { buildDetails } from '../data/OcdBuildDetails.js'

interface ResourcePropertyCondition extends OcdUtils.ResourcePropertyCondition {}

export class OcdTerraformResource {
    indentation = ['', '    ', '        ', '            ', '                ']
    idTFResourceMap: Record<string, string> = {}
    terraformResourceName: string = ''
    ocdTags: OcdTag[] = [
        {
            id: "",
            key: "ocd_version",
            value: buildDetails.version
        },
        {
            id: "",
            key: "OKIT-Open-Cloud-Designer-Version",
            value: buildDetails.version
        }
    ]
    constructor(idTFResourceMap={}) {
        this.idTFResourceMap = idTFResourceMap
    }
    isVariable = (data: string | undefined): boolean => data !== undefined && data.startsWith('var.')
    formatVariable = (data: string | undefined): string | undefined => data
    isGenerateAttribute = (name: string, value: string | number | boolean | undefined, required: boolean) => {
        if (required) return true
        else if (Array.isArray(value) && value.length > 0) return true
        else if (typeof value === 'string' && this.isVariable(value)) return true
        else if (value !== undefined && typeof value === 'string' && value.trim() !== '') return true
        else if (value !== undefined && typeof value === 'number' && value !== 0) return true
        else if (value !== undefined && typeof value === 'boolean') return true
        else return false
    }
    generateMetadataAttribute = (name: string, value: string | undefined, required: boolean, formatString: string, level=0) => {
        if (this.isVariable(value)) return `${this.indentation[level]}${name} = ${this.formatVariable(value)}`
        else if (required) return `${this.indentation[level]}${name} = ${formatString.replace('$s', value as string)}`
        else if (value && value !== '') return `${this.indentation[level]}${name} = ${formatString.replace('$s', value as string)}`
        else return `${this.indentation[level]}# ${name} = "${value}"`
    }
    generateReferenceAttribute = (name: string, value: string | undefined, required: boolean, level=0, element: string = 'id') => {
        if (this.isVariable(value)) return `${this.indentation[level]}${name} = ${this.formatVariable(value)}`
        else if (required) return `${this.indentation[level]}${name} = local.${this.idTFResourceMap[value as string]}_${element}`
        else if (value && value !== '') return `${this.indentation[level]}${name} = local.${this.idTFResourceMap[value]}_${element}`
        else return `${this.indentation[level]}# ${name} = "${value}"`
    }
    generateTextAttribute = (name: string, value: string | undefined, required: boolean, level=0) => {
        if (this.isVariable(value)) return `${this.indentation[level]}${name} = ${this.formatVariable(value)}`
        else if (required) return `${this.indentation[level]}${name} = "${value}"`
        else if (value && value.trim() !== '') return `${this.indentation[level]}${name} = "${value}"`
        else return `${this.indentation[level]}# ${name} = "${value}"`
    }
    generateBase64EncodedTextAttribute = (name: string, value: string | undefined, required: boolean, level=0) => {
        const data = value ? value.replaceAll('\n', '\\n').replaceAll('"', '\\"') : ''
        if (this.isVariable(value)) return `${this.indentation[level]}${name} = ${this.formatVariable(value)}`
        else if (required) return `${this.indentation[level]}${name} = base64encode("${data}")`
        else if (value && value.trim() !== '') return `${this.indentation[level]}${name} = base64encode("${data}")`
        else return `${this.indentation[level]}# ${name} = base64encode("${data}")`
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
        // else if (value !== undefined && typeof value === 'number') return `${this.indentation[level]}${name} = ${value}`
        else if (value !== undefined && typeof value === 'number' && value !== 0) return `${this.indentation[level]}${name} = ${value}`
        else if (value !== undefined && typeof value === 'string' && value !== '') return `${this.indentation[level]}${name} = ${parseInt(value)}`
        else return `${this.indentation[level]}# ${name} = ${value}`
    }
    generateReferenceListAttribute = (name: string, value: string | string[] | undefined, required: boolean, level=0) => {
        if (!Array.isArray(value) && this.isVariable(value)) return `${this.indentation[level]}${name} = ${this.formatVariable(value as string)}`
        else if (required && Array.isArray(value)) return `${this.indentation[level]}${name} = [${value.map((v: string) => `local.${this.idTFResourceMap[v]}_id`)}]`
        else if (Array.isArray(value) && value.length > 0) return `${this.indentation[level]}${name} = [${value.map((v: string) => `local.${this.idTFResourceMap[v]}_id`)}]`
        else return `${this.indentation[level]}# ${name} = "${value}"`
    }
    generateStringListAttribute = (name: string, value: string | string[] | undefined, required: boolean, level=0) => {
        if (!Array.isArray(value) && this.isVariable(value)) return `${this.indentation[level]}${name} = ${this.formatVariable(value as string)}`
        else if (required && Array.isArray(value)) return `${this.indentation[level]}${name} = [${value.map((v: string) => `"${v}"`)}]`
        else if (Array.isArray(value) && value.length > 0) return `${this.indentation[level]}${name} = [${value.map((v: string) => `"${v}"`)}]`
        else return `${this.indentation[level]}# ${name} = "${value}"`
    }

    isPropertyAssignConditionTrue = (conditional: boolean, condition: ResourcePropertyCondition | ResourcePropertyCondition[], resource: Record<string, any>, rootResource: OcdResource): boolean => {
        return OcdUtils.isPropertyConditionTrue(conditional, condition, resource, rootResource)
    }
}

export default OcdTerraformResource
