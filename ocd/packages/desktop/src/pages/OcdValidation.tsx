/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

import { useState } from "react"
import { ConsolePageProps } from "../types/Console"
import { OcdValidationResult, OcdValidator } from "@ocd/model"
import { DesignerValidationResult } from "../types/DesignerResourceProperties"

const OcdValidation = ({ ocdConsoleConfig, setOcdConsoleConfig, ocdDocument, setOcdDocument}: ConsolePageProps): JSX.Element => {
    const [selected, setSelected] = useState('oci_provider.tf')
    const validationResults = OcdValidator.validate(ocdDocument.design)
    const errors = validationResults.filter((v: OcdValidationResult) => v.type === 'error')
    const warnings = validationResults.filter((v: OcdValidationResult) => v.type === 'warning')
    const information = validationResults.filter((v: OcdValidationResult) => v.type === 'information')
    console.debug('Errors:', errors)
    console.debug('Warnings:', warnings)
    console.debug('Information:', information)
    return (
        <div className='ocd-validation-view'>
            <details className='ocd-details' open={errors.length > 0 ? true : false}>
                <summary className={`summary-background`}><label>{`Errors (${errors.length})`}</label></summary>
                <div className='ocd-details-body'>
                    {errors.map((r: OcdValidationResult) => {
                        return <OcdValidatorResult
                                    result={r}
                                    key={`${r.displayName.toLowerCase().replace(' ', '_')}-${r.element}-${r.message.toLowerCase().replace(' ', '_')}`}
                        />
                    })}
                </div>
            </details>
            <details className='ocd-details' open={warnings.length > 0 ? true : false}>
                <summary className={`summary-background`}><label>{`Warning (${warnings.length})`}</label></summary>
                <div className='ocd-details-body'>
                    {warnings.map((r: OcdValidationResult) => {
                            return <OcdValidatorResult
                                        result={r}
                                        key={`${r.displayName.toLowerCase().replace(' ', '_')}-${r.element}-${r.message.toLowerCase().replace(' ', '_')}`}
                            />
                        })}
                </div>
            </details>
            <details className='ocd-details' open={information.length > 0 ? true : false}>
                <summary className={`summary-background`}><label>{`Information (${information.length})`}</label></summary>
                <div className='ocd-details-body'>
                    {information.map((r: OcdValidationResult) => {
                            return <OcdValidatorResult
                                        result={r}
                                        key={`${r.displayName.toLowerCase().replace(' ', '_')}-${r.element}-${r.message.toLowerCase().replace(' ', '_')}`}
                            />
                        })}
                </div>
            </details>
        </div>
    )
}
const OcdValidatorResult = ({result}: DesignerValidationResult): JSX.Element => {
    // console.debug('OcdValidation: Validation Error', result, resource)
    const resultClassName = result.type === 'error' ? 'ocd-validation-error-result' :
                                            'warning' ? 'ocd-validation-warning-result' :
                                            'information' ? 'ocd-validation-information-result' :
                                            ''
    return (
        <div className='ocd-validation-result'>
            <div className={resultClassName}>
                <div className={`ocd-validation-result-title ${result.class}`}>{result.displayName} / {result.title}</div>
                <div className='ocd-validation-message'>{result.message}</div>
            </div>
        </div>
    )
}

export default OcdValidation