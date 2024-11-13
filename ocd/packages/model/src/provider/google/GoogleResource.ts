/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/


import { v4 as uuidv4 } from 'uuid'
import { OcdUtils } from '@ocd/core'
import { OcdResource } from "../../OcdResource.js"
import * as Resources from './resources.js'
import { OcdResources } from '../../OcdDesign.js'

export interface GoogleResource extends OcdResource {
    location: string
    parentId: string
    displayName?: string
}


export namespace GoogleResource {
    export function uuid(prefix: string) {return `okit.${prefix}.${uuidv4()}`}
    export function newResource(type: string): GoogleResource {
        const displayName = `${OcdUtils.toTitleCase(type ? type.split('_').join(' ') : 'Unknown')} ${uuidv4().slice(-4)}`
        return {
            ...OcdResource.newResource(type),
            provider: 'google',
            location: '',
            parentId: '',
            id: GoogleResource.uuid(type),
            displayName: `${displayName}`,
            documentation: ''
        }
    }
    export function cloneResource(resource: GoogleResource, type: string): GoogleResource {
        const displayName = `${resource.displayName} Clone`
        const id = GoogleResource.uuid(type)
        let clone = OcdResource.cloneResource(resource, type)
        clone.displayName = displayName
        clone.id = id
        return clone
    }
    export function assignParentId(child: GoogleResource, parent: GoogleResource) {
        const namespace = `Google${child.resourceType}`
        // @ts-ignore 
        const allowedParentTypes = Resources[namespace].allowedParentTypes()
        if (allowedParentTypes.includes(parent.resourceType) && getParentId(child) !== parent.id) {
            // @ts-ignore 
            Resources[namespace].setParentId(child, parent.id)
        }
    }
    export function getParentId(resource: GoogleResource, allResources?: OcdResources): string {
        const namespace = `Google${resource.resourceType}`
        // @ts-ignore 
        const parentId = Resources[namespace].getParentId(resource, allResources)
        return parentId
    }
    export function getAssociationIds(resource: GoogleResource, allResources: OcdResources): string[] {
        const namespace = `Google${resource.resourceType}`
        // @ts-ignore 
        const associationIds = Resources[namespace].getConnectionIds(resource, allResources)
        return associationIds
    }
}