/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { OcdUtils } from "@ocd/core"
import { OcdDesign } from "./OcdDesign.js"
import { OcdValidationResult } from "./validator/OcdResourceValidator.js"
import * as ociResourceValidators from "./validator/provider/oci/resources.js"

export namespace OcdValidator {
    export function validate(design: OcdDesign): OcdValidationResult[] {
        const results: OcdValidationResult[] = [...OcdValidator.vatidateOci(design)]
        return results
    }
    export function vatidateOci(design: OcdDesign): OcdValidationResult[] {
        let results: OcdValidationResult[] = []
        const resources = design.model.oci.resources
        Object.entries(resources).forEach(([k, v]) => {
            const validatorName = OcdUtils.toResourceNamespaceName('Oci', k)
            // console.debug('OcdValidator: Validator Name', validatorName)
            // @ts-ignore
            v.forEach((r) => results = [...results, ...ociResourceValidators[validatorName].validateResource(r, resources)])
        })
        // console.debug('OcdValidator: Results', JSON.stringify(results, null, 4))
        return results
    }
}