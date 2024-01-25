/*
** Copyright (c) 2020, 2023, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { OcdUtils } from "@ocd/core"
import { OcdResources } from "../OcdDesign"

export interface OcdValidationResult {
    valid: boolean
    type: 'error' | 'warning' | 'information' | ''
    message: string
    element: string
    title: string
    displayName: string
    class?: string
}

export interface OcdValidatorResource extends Record<string, any> {}

interface ResourcePropertyValidationCondition extends OcdUtils.ResourcePropertyCondition {}
// interface ResourcePropertyValidationCondition {
//     element?: string,
//     operator?: 'eq' | 'lt' | 'gt' | 'ne' | 'le' | 'ge' | 'in'
//     value?: boolean | string | number | Function
// }

export namespace OcdResourceValidator {
    export function isPropertyValidationConditionTrue(conditional: boolean, condition: ResourcePropertyValidationCondition, resource: Record<string, any>): boolean {
        // If not conditional then we will always display
        if (!conditional) return true
        // Check condition
        const element = condition.element ? condition.element.indexOf('_') ? OcdUtils.toCamelCase(condition.element)  : condition.element : ''
        const display = OcdUtils.isCondition(resource[element], condition.operator, condition.value)
        return display
    }
    export function noDefaultValidation(displayName: string, key: string, value: string | boolean | number, title: string, cssClass: string, resources: OcdResources, message: string | undefined = undefined): OcdValidationResult {
        const result: OcdValidationResult = {
                valid: true,
                type: '',
                message: `${title} no default validation.`,
                element: key,
                title: title,
                displayName: displayName,
                class: cssClass
            }
        return result
    }
    // Required
    export function validateRequiredText(displayName: string, key: string, value: string, title: string, cssClass: string, resources: OcdResources, message: string | undefined = undefined): OcdValidationResult {
        const result: OcdValidationResult = (!value || value === '') ? 
            {
                valid: false,
                type: 'error',
                message: message ? message : `${title} must be specified.`,
                element: key,
                title: title,
                displayName: displayName,
                class: cssClass
            } :
            {
                valid: true,
                type: '',
                message: `${title} has value.`,
                element: key,
                title: title,
                displayName: displayName,
                class: cssClass
            }
        return result
    }
    export function validateRequiredStringList(displayName: string, key: string, value: string[], title: string, cssClass: string, resources: OcdResources, message: string | undefined = undefined): OcdValidationResult {
        const result: OcdValidationResult = (!value || value.length === 0) ? 
            {
                valid: false,
                type: 'error',
                message: message ? message : `${title} at least one value must be specified.`,
                element: key,
                title: title,
                displayName: displayName,
                class: cssClass
            } :
            {
                valid: true,
                type: '',
                message: `${title} has value.`,
                element: key,
                title: title,
                displayName: displayName,
                class: cssClass
            }
        return result
    }
    export function validateRequiredList(displayName: string, key: string, value: string[], title: string, cssClass: string, resources: OcdResources, message: string | undefined = undefined): OcdValidationResult {
        const result: OcdValidationResult = (!value || value.length === 0) ? 
            {
                valid: false,
                type: 'error',
                message: message ? message : `${title} at least one value must be specified.`,
                element: key,
                title: title,
                displayName: displayName,
                class: cssClass
            } :
            {
                valid: true,
                type: '',
                message: `${title} has value.`,
                element: key,
                title: title,
                displayName: displayName,
                class: cssClass
            }
        return result
    }
    export function validateRequiredBoolean(displayName: string, key: string, value: boolean, title: string, cssClass: string, resources: OcdResources, message: string | undefined = undefined): OcdValidationResult {
        const result: OcdValidationResult = (!value) ? 
            {
                valid: false,
                type: 'error',
                message: message ? message : `${title} must be specified.`,
                element: key,
                title: title,
                displayName: displayName,
                class: cssClass
            } :
            {
                valid: true,
                type: '',
                message: `${title} has value.`,
                element: key,
                title: title,
                displayName: displayName,
                class: cssClass
            }
        return result
    }
    export function validateRequiredNumber(displayName: string, key: string, value: number, title: string, cssClass: string, resources: OcdResources, message: string | undefined = undefined): OcdValidationResult {
        const result: OcdValidationResult = (!value) ? 
            {
                valid: false,
                type: 'error',
                message: message ? message : `${title} must be specified.`,
                element: key,
                title: title,
                displayName: displayName,
                class: cssClass
            } :
            {
                valid: true,
                type: '',
                message: `${title} has value.`,
                element: key,
                title: title,
                displayName: displayName,
                class: cssClass
            }
        return result
    }
    // Not Required (Info)
}
