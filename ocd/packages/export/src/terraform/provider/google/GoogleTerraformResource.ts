/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import OcdTerraformResource from "../../OcdTerraformResource.js"
import { OcdDesign, GoogleResource } from '@ocd/model'

export class GoogleTerraformResource extends OcdTerraformResource {
    isHomeRegion: boolean
    simpleCacheAttributes = []
    lookupCacheAttributes = []
    constructor(idTFResourceMap={}, isHomeRegion: boolean = false) {
        super(idTFResourceMap)
        this.isHomeRegion = isHomeRegion
    }

    commonAssignments = (resource: GoogleResource) => {
        return ``
    }

    tags = (resource: GoogleResource, design: OcdDesign): string => {
        return `# Tags`
    }

    generateAdditionalResourceLocals(resource: GoogleResource) {
        return ''
    }
    generateAdditionalResource(resource: GoogleResource) {
        return ''
    }
}
