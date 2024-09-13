/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { OcdTabularGenerator } from './OcdTabularGenerator'
import { commonElements, commonIgnoreElements } from './data/GcpCommonResourceProperties'

export class GcpTabularGenerator extends OcdTabularGenerator {
    constructor () {
        super('Gcp')
        this.ignoreAttributes = [...commonElements, ...commonIgnoreElements]
    }
}

export default GcpTabularGenerator
module.exports = { GcpTabularGenerator }
