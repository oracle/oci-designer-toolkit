/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { OcdMarkdownGenerator } from './OcdMarkdownGenerator'
import { commonElements, commonIgnoreElements } from './data/GcpCommonResourceProperties'

export class GcpMarkdownGenerator extends OcdMarkdownGenerator {
    constructor () {
        super('Gcp')
        this.ignoreAttributes = [...commonElements, ...commonIgnoreElements]
    }
}

export default GcpMarkdownGenerator
module.exports = { GcpMarkdownGenerator }
