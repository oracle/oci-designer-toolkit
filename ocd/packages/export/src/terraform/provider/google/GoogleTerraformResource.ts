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

    /*
    ** Resolve a reference attribute to a direct google_<type>.<name>.<element>
    ** reference. value holds the referenced resource's OCD-internal id; googleType
    ** is the terraform resource type of the target (e.g. 'google_compute_network').
    ** Emits a commented placeholder when the referenced resource is not part of
    ** this export so the generated HCL stays valid. Mirrors AwsTerraformResource.
    */
    googleReference = (name: string, value: string | undefined, googleType: string, required: boolean, level = 0, element = 'id'): string => {
        if (this.isVariable(value)) return `${this.indentation[level]}${name} = ${this.formatVariable(value)}`
        const mapped = value !== undefined && value !== '' ? this.idTFResourceMap[value] : undefined
        if (mapped !== undefined) return `${this.indentation[level]}${name} = ${googleType}.${mapped}.${element}`
        else if (required) return `${this.indentation[level]}# TODO: ${name} references a resource not present in this export (${value})`
        else return `${this.indentation[level]}# ${name} = "${value}"`
    }
}
