/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { OcdPropertiesGenerator } from './OcdPropertiesGenerator'
import { commonElements, commonIgnoreElements } from './data/OciCommonResourceProperties'

export class OciPropertiesGenerator extends OcdPropertiesGenerator {
    constructor () {
        super('Oci')
        this.ignoreAttributes = [...commonElements, ...commonIgnoreElements]
    }
}

export default OciPropertiesGenerator
module.exports = { OciPropertiesGenerator }
