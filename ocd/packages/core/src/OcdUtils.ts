/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

import { resourceMap } from './OcdResourceMap'

export namespace OcdUtils {
    export interface ResourcePropertyCondition {
        logic_operator?: 'and' | 'or'
        element?: string
        operator?: 'eq' | 'lt' | 'gt' | 'ne' | 'le' | 'ge' | 'in' | 'ew' | 'sw'
        value?: boolean | string | number | Function
    }
    export interface OcdResource extends Record<string, any> {}
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
        // If not conditional then we will always display
        if (!conditional) return true
        // Check condition
        let display = false
        if (!Array.isArray(condition)){
            const element = condition.element ? condition.element.indexOf('_') ? OcdUtils.toCamelCase(condition.element)  : condition.element : ''
            display = OcdUtils.isCondition(resource[element], condition.operator, condition.value)
        } else {
            condition.forEach((c) => {
                const isTrue = isPropertyConditionTrue(conditional, c, resource, rootResource)
                display = !c.logic_operator ? isTrue : c.logic_operator === 'and' ? display && isTrue : display || isTrue
            })
        }
        return display
    }
    }