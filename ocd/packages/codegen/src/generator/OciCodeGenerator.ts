/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { OcdCodeGenerator } from "./OcdCodeGenerator";

export class OciCodeGenerator extends OcdCodeGenerator {
    constructor (prefix: string='Oci') {
        super('Oci')
        this.commonElements = [
            'compartment_id', // Common Element
            'defined_tags',   // Common Element
            'display_name',   // Common Element
            'freeform_tags',  // Common Element
            'id',             // Common Element
            'name',           // Common Element
        ]
        this.commonIgnoreElements = [
            'region',
            'inactive_state', 
            'is_accessible',
            'state', 
            'time_created',
            'system_tags'
        ]
        this.ignoreAttributes = [...this.commonElements, ...this.commonIgnoreElements]
    }

}
