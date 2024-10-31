/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { OcdTabularGenerator } from './OcdTabularGenerator.js'
import { commonElements, commonIgnoreElements } from './data/OciCommonResourceProperties.js'

export class OciTabularGenerator extends OcdTabularGenerator {
    constructor () {
        super('Oci')
        this.ignoreAttributes = [...commonElements, ...commonIgnoreElements]
    }
}

export default OciTabularGenerator
// module.exports = { OciTabularGenerator }
