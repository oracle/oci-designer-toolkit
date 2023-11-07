/*
** Copyright (c) 2020, 2023, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { OcdResources } from "../OcdDesign"

export interface OcdValidationResult {
    valid: boolean
    type: 'error' | 'warning' | 'information' | ''
    message: string
    element: string
    title: string
    class?: string
}

export interface OcdValidatorResource extends Record<string, any> {}

export namespace OcdResourceValidator {
    export function noDefaultValidation(key: string, value: string | boolean | number, title: string, cssClass: string, resources: OcdResources, message: string | undefined = undefined): OcdValidationResult {
        const result: OcdValidationResult = {
                valid: true,
                type: '',
                message: `${title} no default validation.`,
                element: key,
                title: title,
                class: cssClass
            }
        return result
    }
    // Required
    export function validateRequiredText(key: string, value: string, title: string, cssClass: string, resources: OcdResources, message: string | undefined = undefined): OcdValidationResult {
        const result: OcdValidationResult = (!value || value === '') ? 
            {
                valid: false,
                type: 'error',
                message: message ? message : `${title} must be specified.`,
                element: key,
                title: title,
                class: cssClass
            } :
            {
                valid: true,
                type: '',
                message: `${title} has value.`,
                element: key,
                title: title,
                class: cssClass
            }
        return result
    }
    export function validateRequiredStringList(key: string, value: string[], title: string, cssClass: string, resources: OcdResources, message: string | undefined = undefined): OcdValidationResult {
        const result: OcdValidationResult = (!value || value.length === 0) ? 
            {
                valid: false,
                type: 'error',
                message: message ? message : `${title} at least one value must be specified.`,
                element: key,
                title: title,
                class: cssClass
            } :
            {
                valid: true,
                type: '',
                message: `${title} has value.`,
                element: key,
                title: title,
                class: cssClass
            }
        return result
    }
    export function validateRequiredBoolean(key: string, value: boolean, title: string, cssClass: string, resources: OcdResources, message: string | undefined = undefined): OcdValidationResult {
        const result: OcdValidationResult = (!value) ? 
            {
                valid: false,
                type: 'error',
                message: message ? message : `${title} must be specified.`,
                element: key,
                title: title,
                class: cssClass
            } :
            {
                valid: true,
                type: '',
                message: `${title} has value.`,
                element: key,
                title: title,
                class: cssClass
            }
        return result
    }
    export function validateRequiredNumber(key: string, value: number, title: string, cssClass: string, resources: OcdResources, message: string | undefined = undefined): OcdValidationResult {
        const result: OcdValidationResult = (!value) ? 
            {
                valid: false,
                type: 'error',
                message: message ? message : `${title} must be specified.`,
                element: key,
                title: title
            } :
            {
                valid: true,
                type: '',
                message: `${title} has value.`,
                element: key,
                title: title
            }
        return result
    }
    // Not Required (Info)
}
