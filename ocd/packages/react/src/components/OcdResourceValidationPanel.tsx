/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

import { AzureResources, AzureResourceValidation, GoogleResources, GoogleResourceValidation, OcdResource, OcdValidationResult, OciResourceValidation, OciResources } from '@ocd/model'
import { DesignerResourceProperties, DesignerResourceValidationResult } from '../types/DesignerResourceProperties'
import { OcdUtils } from '@ocd/core'
import { OcdDocument } from './OcdDocument'

const getResourceValidationResults = (ocdDocument: OcdDocument, selectedModelResource: OcdResource): OcdValidationResult[] => {
    const provider = selectedModelResource ? selectedModelResource.provider : ''
    switch (provider) {
        case 'azure':
            return getAzureResourceValidationResults(ocdDocument, selectedModelResource)
        case 'google':
            return getGoogleResourceValidationResults(ocdDocument, selectedModelResource)
        case 'oci':
            return getOciResourceValidationResults(ocdDocument, selectedModelResource)
        default:
            return []
    }
}

const resourceValidationMethod = (selectedModelResource: OcdResource) => selectedModelResource ? `${OcdUtils.toTitleCase(selectedModelResource.provider)}${selectedModelResource.resourceType}` : ''

const getAzureResourceValidationResults = (ocdDocument: OcdDocument, selectedModelResource: OcdResource): OcdValidationResult[] => {
    const azureResources: AzureResources = ocdDocument.getAzureResourcesObject()
    // @ts-ignore
    const ResourceValidation = AzureResourceValidation[resourceValidationMethod(selectedModelResource)]
    const validationResults = ResourceValidation ? ResourceValidation.validateResource(selectedModelResource, azureResources) : []
    return validationResults
}

const getGoogleResourceValidationResults = (ocdDocument: OcdDocument, selectedModelResource: OcdResource): OcdValidationResult[] => {
    const googleResources: GoogleResources = ocdDocument.getGoogleResourcesObject()
    // @ts-ignore
    const ResourceValidation = GoogleResourceValidation[resourceValidationMethod(selectedModelResource)]
    const validationResults = ResourceValidation ? ResourceValidation.validateResource(selectedModelResource, googleResources) : []
    return validationResults
}

const getOciResourceValidationResults = (ocdDocument: OcdDocument, selectedModelResource: OcdResource): OcdValidationResult[] => {
    const ociResources: OciResources = ocdDocument.getOciResourcesObject()
    // @ts-ignore
    const ResourceValidation = OciResourceValidation[resourceValidationMethod(selectedModelResource)]
    const validationResults = ResourceValidation ? ResourceValidation.validateResource(selectedModelResource, ociResources) : []
    return validationResults
}

export const OcdResourceValidation =  ({ocdDocument, setOcdDocument}: DesignerResourceProperties): JSX.Element => {
    const selectedModelResource: OcdResource = ocdDocument.getSelectedResource()
    const validationResults = getResourceValidationResults(ocdDocument, selectedModelResource)
    const errors = validationResults.filter((v: OcdValidationResult) => v.type === 'error')
    const warnings = validationResults.filter((v: OcdValidationResult) => v.type === 'warning')
    const information = validationResults.filter((v: OcdValidationResult) => v.type === 'information')
    console.debug('OcdProperties: OcdResourceValidation', validationResults)
    return (
        <div className={`ocd-properties-panel ocd-properties-panel-theme ocd-properties-validation-panel ocd-validation-results`}>
            <details className='ocd-details' open={errors.length > 0 ? true : false}>
                <summary className={`summary-background`}><label>{`Errors (${errors.length})`}</label></summary>
                <div className='ocd-details-body'>
                    {errors.map((r: OcdValidationResult) => {
                        return <OcdResourceValidationResult
                                    result={r}
                                    resource={selectedModelResource}
                                    key={`${r.element}-${r.message.toLowerCase().replace(' ', '_')}`}
                        />
                    })}
                </div>
            </details>
            <details className='ocd-details' open={warnings.length > 0 ? true : false}>
                <summary className={`summary-background`}><label>{`Warning (${warnings.length})`}</label></summary>
                <div className='ocd-details-body'>
                    {warnings.map((r: OcdValidationResult) => {
                            return <OcdResourceValidationResult
                                        result={r}
                                        resource={selectedModelResource}
                                        key={`${r.element}-${r.message.toLowerCase().replace(' ', '_')}`}
                            />
                        })}
                </div>
            </details>
            <details className='ocd-details' open={information.length > 0 ? true : false}>
                <summary className={`summary-background`}><label>{`Information (${information.length})`}</label></summary>
                <div className='ocd-details-body'>
                    {information.map((r: OcdValidationResult) => {
                            return <OcdResourceValidationResult
                                        result={r}
                                        resource={selectedModelResource}
                                        key={`${r.element}-${r.message.toLowerCase().replace(' ', '_')}`}
                            />
                        })}
                </div>
            </details>
        </div>
    )
}

const OcdResourceValidationResult = ({result, resource}: DesignerResourceValidationResult): JSX.Element => {
    console.debug('OcdProperties: Validation Error', result, resource)
    let resultClassName = ''
    switch (result.type) {
        case 'error':
            resultClassName = 'ocd-validation-error-result'
            break;
        case 'warning':
            resultClassName = 'ocd-validation-warning-result'
            break;
        case 'information':
            resultClassName = 'ocd-validation-information-result'
            break;
    }
    return (
        <div className='ocd-validation-result'>
            <div className={resultClassName}>
                <div className={`ocd-validation-result-title ${result.class}`}>{result.title}</div>
                <div className='ocd-validation-message'>{result.message}</div>
            </div>
        </div>
    )
}
