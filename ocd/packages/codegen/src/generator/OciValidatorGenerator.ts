/*
** Copyright (c) 2020, 2023, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { OcdValidatorGenerator } from './OcdValidatorGenerator.js'
import { commonElements, commonIgnoreElements } from './data/OciCommonResourceProperties.js'

export class OciValidatorGenerator extends OcdValidatorGenerator {
    constructor () {
        super('Oci')
        this.ignoreAttributes = [...commonElements, ...commonIgnoreElements]
    }
}

export default OciValidatorGenerator
module.exports = { OciValidatorGenerator }
