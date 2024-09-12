/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { OcdTabularGenerator } from './OcdTabularGenerator'
import { commonElements, commonIgnoreElements } from './data/AzureCommonResourceProperties'

export class AzureTabularGenerator extends OcdTabularGenerator {
    constructor () {
        super('Azure')
        this.ignoreAttributes = [...commonElements, ...commonIgnoreElements]
    }
}

export default AzureTabularGenerator
module.exports = { AzureTabularGenerator }
