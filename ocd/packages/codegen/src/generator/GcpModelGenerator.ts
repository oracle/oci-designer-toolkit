/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { OcdModelGenerator } from './OcdModelGenerator'
import { commonElements, commonIgnoreElements } from './data/GcpCommonResourceProperties'

export class GcpModelGenerator extends OcdModelGenerator {
    constructor () {
        super('Gcp')
        this.ignoreAttributes = [...commonElements, ...commonIgnoreElements]
    }
}

export default GcpModelGenerator
module.exports = { GcpModelGenerator }
