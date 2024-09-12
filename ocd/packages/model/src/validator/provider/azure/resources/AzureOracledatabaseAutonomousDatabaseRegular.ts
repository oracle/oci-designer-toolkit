/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import * as AutoGenerated from './generated/AzureOracledatabaseAutonomousDatabaseRegular'
import * as Model from '../../../../provider/azure/resources'
import { AzureResources } from '../../../../OcdDesign'
import { OcdResourceValidator, OcdValidationResult, OcdValidatorResource } from '../../../OcdResourceValidator'

export namespace AzureOracledatabaseAutonomousDatabaseRegular {
    export function validateResource(resource: Model.AzureOracledatabaseAutonomousDatabaseRegular, resources: AzureResources): OcdValidationResult[] {
        return [...AutoGenerated.AzureOracledatabaseAutonomousDatabaseRegular.validateResource(resource, resources), ...customValidation(resource, resources)]
    }
    export function isResourceValid(resource: Model.AzureOracledatabaseAutonomousDatabaseRegular, resources: AzureResources): boolean {
        return (validateResource(resource, resources).filter((v: OcdValidationResult) => !v.valid).length > 0)
    }
    export function hasErrors(resource: Model.AzureOracledatabaseAutonomousDatabaseRegular, resources: AzureResources): boolean {
        return (validateResource(resource, resources).filter((v: OcdValidationResult) => v.type === 'error').length > 0)
    }
    export function hasWarnings(resource: Model.AzureOracledatabaseAutonomousDatabaseRegular, resources: AzureResources): boolean {
        return (validateResource(resource, resources).filter((v: OcdValidationResult) => v.type === 'warning').length > 0)
    }
    export function hasInformation(resource: Model.AzureOracledatabaseAutonomousDatabaseRegular, resources: AzureResources): boolean {
        return (validateResource(resource, resources).filter((v: OcdValidationResult) => v.type === 'information').length > 0)
    }
    function customValidation(resource: Model.AzureOracledatabaseAutonomousDatabaseRegular, resources: AzureResources): OcdValidationResult[] {
        const results: OcdValidationResult[] = []
        return results
    }
}