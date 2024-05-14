/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

import { resourceMap } from './OcdResourceMap'

export namespace OcdUtils {
    export interface ResourcePropertyCondition {
        logic_operator?: 'and' | 'or'
        element?: string
        relativeToRoot?: boolean
        operator?: 'eq' | 'lt' | 'gt' | 'ne' | 'le' | 'ge' | 'in' | 'ew' | 'sw'
        value?: boolean | string | number | Function
    }
    export interface OcdResource extends Record<string, any> {}
    export interface RgbaColour {
        r: number
        g: number
        b: number
        a: number
    }
    export function toTitle(str: string): string {
        let key = str as keyof typeof resourceMap
        return Object.hasOwn(resourceMap, key) ? resourceMap[key].title : OcdUtils.toTitleCase(str.split('_').join(' '))
    }
    export function toTitleCase(str?: string): string {
        return str ? str.replace(/\b\w+/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase();}).replaceAll('-', '_').replace(/\W+/g, ' ') : ''
    }
    export function toCamelCase(str: string): string {
        return `${OcdUtils.toTitleCase(str.split('_').join(' ')).split(' ').map((e, i) => i === 0 ? e.toLowerCase() : e).join('')}`
    }
    export function toUnderscoreCase(str: string): string {
        return str.split(/(?=[A-Z])/).join('_').toLowerCase()
    }
    export function toCssClassName(provider: string, str: string): string {
        return `${provider.toLowerCase()}-${str.toLowerCase().split('_').join('-')}`
    }
    export function toResourceTypeName(type?: string): string {
        return `${OcdUtils.toTitle(type ? type : 'Unknown')}`
    }
    export function toResourceType(type?: string): string {
        return `${OcdUtils.toTitleCase(type ? type.split('_').join(' ') : 'Unknown').replace(/\W+/g, '')}`
    }
    export function toTerraformResourceName(type?: string): string {
        return `Okit${OcdUtils.toResourceType(type)}${Date.now()}`
    }
    export function toClassName(prefix: string = 'Oci', str: string): string {
        return `${prefix}${OcdUtils.toTitleCase(str ? str.split('_').join(' ') : 'Unknown').replace(/\W+/g, '')}`
    }
    export function toResourceNamespaceName(prefix: string, resource: string) {
        return `${prefix}${OcdUtils.toTitleCase(resource.split('_').join(' ')).split(' ').join('')}`
    }
    export function toDnsLabel(name: string): string {
        return name.toLowerCase().replace(/[^a-z]/g, '').slice(0, 15)
    }
    export function isCondition(leftHandSide: string | number | boolean | Array<any> | Function | undefined, operator: string | undefined, rightHandSide: string | number | boolean | Array<any> | Function | undefined): boolean {
        let isTrue = false
        // console.debug('OcdUtils: isConditional', leftHandSide, operator, rightHandSide)
        if (operator === 'eq') isTrue = (leftHandSide === rightHandSide)
        else if (operator === 'ne') isTrue = (leftHandSide !== rightHandSide)
        else if (operator === 'lt') isTrue = (leftHandSide !== undefined && rightHandSide !== undefined && leftHandSide < rightHandSide)
        else if (operator === 'gt') isTrue = (leftHandSide !== undefined && rightHandSide !== undefined && leftHandSide > rightHandSide)
        else if (operator === 'le') isTrue = (leftHandSide !== undefined && rightHandSide !== undefined && leftHandSide <= rightHandSide)
        else if (operator === 'ge') isTrue = (leftHandSide !== undefined && rightHandSide !== undefined && leftHandSide >= rightHandSide)
        else if (operator === 'in') isTrue = (leftHandSide !== undefined && Array.isArray(rightHandSide) && rightHandSide.includes(leftHandSide))
        else if (operator === 'ew') isTrue = (leftHandSide !== undefined && rightHandSide !== undefined && leftHandSide.toLocaleString().endsWith(rightHandSide.toLocaleString()))
        else if (operator === 'sw') isTrue = (leftHandSide !== undefined && rightHandSide !== undefined && leftHandSide.toLocaleString().startsWith(rightHandSide.toLocaleString()))
        else isTrue = false
        return isTrue
    }
    export const isPropertyConditionTrue = (conditional: boolean, condition: ResourcePropertyCondition | ResourcePropertyCondition[], resource: OcdResource, rootResource: OcdResource): boolean => {
        // console.debug('OcdUtils: isPropertyConditionTrue', conditional, condition, resource, rootResource)
        // If not conditional then we will always display
        if (!conditional) return true
        // Check condition
        let display = false
        if (!Array.isArray(condition)){
            const element = condition.element ? condition.element.indexOf('_') ? OcdUtils.toCamelCase(condition.element) : condition.element : ''
            // display = OcdUtils.isCondition(resource[element], condition.operator, condition.value)
            const elementValue = condition.relativeToRoot ? getResourceElementValue(element, rootResource) : getResourceElementValue(element, resource)
            display = OcdUtils.isCondition(elementValue, condition.operator, condition.value)
        } else {
            condition.forEach((c) => {
                const isTrue = isPropertyConditionTrue(conditional, c, resource, rootResource)
                display = !c.logic_operator ? isTrue : c.logic_operator === 'and' ? display && isTrue : display || isTrue
            })
        }
        return display
    }
    export const getResourceElementValue = (element: string, resource: Record<string, any>): string | number | boolean | string[] => {
        const elementParts = element.split('.')
        if (elementParts.length === 1) return resource[elementParts[0]]
        else return getResourceElementValue(elementParts.slice(1).join('.'), resource[elementParts[0]])
    }
    export function capitaliseFirstCharacter(str: string): string {return `${str.charAt(0).toUpperCase()}${str.slice(1)}`}
    export function rgbaToHex(rgba: string, removeAlpha = false): string {
        return "#" + rgba.replace(/^rgba?\(|\s+|\)$/g, '') // Get's rgba / rgb string values
          .split(',') // splits them at ","
          .filter((s: string, index: number) => !removeAlpha || index !== 3)
          .map((s: string) => parseFloat(s)) // Converts them to numbers
          .map((n: number, index: number) => index === 3 ? Math.round(n * 255) : n) // Converts alpha to 255 number
          .map((n: number) => n.toString(16)) // Converts numbers to hex
          .map((s: string) => s.length === 1 ? "0" + s : s) // Adds 0 when length of one number is 1
          .join("") // Puts the array to togehter to a string
    }
    export function rgbaToJson(rgba: string): OcdUtils.RgbaColour {
        const values = rgba.replace(/^rgba?\(|\s+|\)$/g, '').split(',')
        return {
            r: parseInt(values[0]),
            g: parseInt(values[1]),
            b: parseInt(values[2]),
            a: parseFloat(values[3])
        }
    }
    export function svgToDataUri(svg: string): string {return `data:image/svg+xml;base64,${btoa(svg)}`}
}