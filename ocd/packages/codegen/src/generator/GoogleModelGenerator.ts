/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { OcdModelGenerator } from './OcdModelGenerator'
import { commonElements, commonIgnoreElements } from './data/GoogleCommonResourceProperties'

export class GoogleModelGenerator extends OcdModelGenerator {
    constructor () {
        super('Google')
        this.ignoreAttributes = [...commonElements, ...commonIgnoreElements]
    }
}

export default GoogleModelGenerator
module.exports = { GoogleModelGenerator }
