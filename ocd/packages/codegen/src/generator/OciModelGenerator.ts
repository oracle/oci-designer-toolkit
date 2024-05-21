/*
** Copyright (c) 2020, 2023, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { OcdModelGenerator } from './OcdModelGenerator.js'

export class OciModelGenerator extends OcdModelGenerator {
    commonElements = [
        'compartment_id', // Common Element
        'defined_tags',   // Common Element
        'display_name',   // Common Element
        'freeform_tags',  // Common Element
        'id',             // Common Element
        'name',           // Common Element
    ]
    commonIgnoreElements = [
        'region',
        'inactive_state', 
        'is_accessible',
        'state', 
        'time_created',
        'system_tags'
    ]
    constructor () {
        super('Oci')
        this.ignoreAttributes = [...this.commonElements, ...this.commonIgnoreElements]
    }
}

export default OciModelGenerator
module.exports = { OciModelGenerator }
