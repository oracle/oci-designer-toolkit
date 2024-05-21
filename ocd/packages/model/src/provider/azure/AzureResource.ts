/*
** Copyright (c) 2020, 2023, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/


import { v4 as uuidv4 } from 'uuid'
import { OcdUtils } from '@ocd/core'
import { OcdResource } from "../../OcdResource"
import * as Resources from './resources'
import { OcdResources } from '../../OcdDesign'

export interface AzureResource extends OcdResource {
    location: string
    parentId: string
    displayName?: string
}


export namespace AzureResource {
    export function uuid(prefix: string) {return `okit.${prefix}.${uuidv4()}`}
    export function newResource(type: string): AzureResource {
        const displayName = `${OcdUtils.toTitleCase(type ? type.split('_').join(' ') : 'Unknown')} ${uuidv4().slice(-4)}`
        return {
            ...OcdResource.newResource(type),
            provider: 'azure',
            location: '',
            parentId: '',
            id: AzureResource.uuid(type),
            displayName: `${displayName}`,
            documentation: ''
        }
    }
    export function cloneResource(resource: AzureResource, type: string): AzureResource {
        const displayName = `${resource.displayName} Clone`
        const id = AzureResource.uuid(type)
        let clone = OcdResource.cloneResource(resource, type)
        clone.displayName = displayName
        clone.id = id
        return clone
    }
    export function assignParentId(child: AzureResource, parent: AzureResource) {
        const namespace = `Azure${child.resourceType}`
        // @ts-ignore 
        const allowedParentTypes = Resources[namespace].allowedParentTypes()
        if (allowedParentTypes.includes(parent.resourceType) && getParentId(child) !== parent.id) {
            // @ts-ignore 
            Resources[namespace].setParentId(child, parent.id)
        }
    }
    export function getParentId(resource: AzureResource, allResources?: OcdResources): string {
        const namespace = `Azure${resource.resourceType}`
        // @ts-ignore 
        const parentId = Resources[namespace].getParentId(resource, allResources)
        return parentId
    }
    export function getAssociationIds(resource: AzureResource, allResources: OcdResources): string[] {
        const namespace = `Azure${resource.resourceType}`
        // @ts-ignore 
        const associationIds = Resources[namespace].getConnectionIds(resource, allResources)
        return associationIds
    }
}
