/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { OcdMarkdownGenerator } from './OcdMarkdownGenerator.js'
import { commonElements, commonIgnoreElements } from './data/AzureCommonResourceProperties.js'

export class AzureMarkdownGenerator extends OcdMarkdownGenerator {
    constructor () {
        super('Azure')
        this.ignoreAttributes = [...commonElements, ...commonIgnoreElements]
    }
}

export default AzureMarkdownGenerator
// module.exports = { AzureMarkdownGenerator }
