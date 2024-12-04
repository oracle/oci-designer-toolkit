/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import OcdTerraformResource from "../../OcdTerraformResource.js"
import { OcdDesign, AzureResource } from '@ocd/model'

export class AzureTerraformResource extends OcdTerraformResource {
    isHomeRegion: boolean
    simpleCacheAttributes = []
    lookupCacheAttributes = []
    constructor(idTFResourceMap={}, isHomeRegion: boolean = false) {
        super(idTFResourceMap)
        this.isHomeRegion = isHomeRegion
    }

    commonAssignments = (resource: AzureResource) => {
        return ``
    }

    tags = (resource: AzureResource, design: OcdDesign): string => {
        return `# Tags`
    }

    generateAdditionalResourceLocals(resource: AzureResource) {
        return ''
    }
    generateAdditionalResource(resource: AzureResource) {
        return ''
    }
}
