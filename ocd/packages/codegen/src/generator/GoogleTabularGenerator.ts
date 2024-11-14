/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { OcdTabularGenerator } from './OcdTabularGenerator.js'
import { commonElements, commonIgnoreElements } from './data/GoogleCommonResourceProperties.js'

export class GoogleTabularGenerator extends OcdTabularGenerator {
    constructor () {
        super('Google')
        this.ignoreAttributes = [...commonElements, ...commonIgnoreElements]
    }
}

export default GoogleTabularGenerator
// module.exports = { GoogleTabularGenerator }
