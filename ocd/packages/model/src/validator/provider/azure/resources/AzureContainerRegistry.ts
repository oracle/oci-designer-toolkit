/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import * as AutoGenerated from './generated/AzureContainerRegistry'
import * as Model from '../../../../provider/azure/resources'
import { AzureResources } from '../../../../OcdDesign'
import { OcdResourceValidator, OcdValidationResult, OcdValidatorResource } from '../../../OcdResourceValidator'

export namespace AzureContainerRegistry {
    export function validateResource(resource: Model.AzureContainerRegistry, resources: AzureResources): OcdValidationResult[] {
        return [...AutoGenerated.AzureContainerRegistry.validateResource(resource, resources), ...customValidation(resource, resources)]
    }
    export function isResourceValid(resource: Model.AzureContainerRegistry, resources: AzureResources): boolean {
        return (validateResource(resource, resources).filter((v: OcdValidationResult) => !v.valid).length > 0)
    }
    export function hasErrors(resource: Model.AzureContainerRegistry, resources: AzureResources): boolean {
        return (validateResource(resource, resources).filter((v: OcdValidationResult) => v.type === 'error').length > 0)
    }
    export function hasWarnings(resource: Model.AzureContainerRegistry, resources: AzureResources): boolean {
        return (validateResource(resource, resources).filter((v: OcdValidationResult) => v.type === 'warning').length > 0)
    }
    export function hasInformation(resource: Model.AzureContainerRegistry, resources: AzureResources): boolean {
        return (validateResource(resource, resources).filter((v: OcdValidationResult) => v.type === 'information').length > 0)
    }
    function customValidation(resource: Model.AzureContainerRegistry, resources: AzureResources): OcdValidationResult[] {
        const results: OcdValidationResult[] = []
        return results
    }
}