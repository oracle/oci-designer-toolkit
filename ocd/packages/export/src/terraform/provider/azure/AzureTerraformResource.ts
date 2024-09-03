/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import OcdTerraformResource from "../../OcdTerraformResource"
import { OcdDesign, AzureResource } from '@ocd/model'

export class OciTerraformResource extends OcdTerraformResource {
    isHomeRegion: boolean
    simpleCacheAttributes = []
    lookupCacheAttributes = []
    constructor(idTFResourceMap={}, isHomeRegion: boolean = false) {
        super(idTFResourceMap)
        this.isHomeRegion = isHomeRegion
    }
}
