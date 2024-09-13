/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { OcdValidatorGenerator } from './OcdValidatorGenerator'
import { commonElements, commonIgnoreElements } from './data/AzureCommonResourceProperties'

export class AzureValidatorGenerator extends OcdValidatorGenerator {
    constructor () {
        super('Azure')
        this.ignoreAttributes = [...commonElements, ...commonIgnoreElements]
    }
}

export default AzureValidatorGenerator
module.exports = { AzureValidatorGenerator }
