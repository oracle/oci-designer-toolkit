/*
** Copyright (c) 2020, 2023, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { OcdModelGenerator } from './OcdModelGenerator.js'
import { commonElements, commonIgnoreElements } from './data/OciCommonResourceProperties.js'

export class OciModelGenerator extends OcdModelGenerator {
    constructor () {
        super('Oci')
        this.ignoreAttributes = [...commonElements, ...commonIgnoreElements]
    }
}

export default OciModelGenerator
module.exports = { OciModelGenerator }
