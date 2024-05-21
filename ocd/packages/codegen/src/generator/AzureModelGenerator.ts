/*
** Copyright (c) 2020, 2023, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { OcdModelGenerator } from './OcdModelGenerator.js'

export class AzureModelGenerator extends OcdModelGenerator {
    commonElements = [
        'parent_id',      // Common Element
        'tags',           // Common Element
        'display_name',   // Common Element
        'id',             // Common Element
        'name',           // Common Element
    ]
    commonIgnoreElements = [
        'location',
        'type'
    ]
    constructor () {
        super('Azure')
        this.ignoreAttributes = [...this.commonElements, ...this.commonIgnoreElements]
    }
}

export default AzureModelGenerator
module.exports = { AzureModelGenerator }
