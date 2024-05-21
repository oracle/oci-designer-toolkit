/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

import { v4 as uuidv4 } from 'uuid'
import { OcdUtils } from '@ocd/core'
import { OcdResource } from "../../OcdResource"
import * as Resources from './resources'
import { OcdResources } from '../../OcdDesign'

export interface OciResource extends OcdResource {
    region: string
    compartmentId: string
    displayName?: string
}


export namespace OciResource {
    export function uuid(prefix: string) {return `okit.${prefix}.${uuidv4()}`}
    export function newResource(type: string): OciResource {
        const displayName = `${OcdUtils.toTitleCase(type ? type.split('_').join(' ') : 'Unknown')} ${uuidv4().slice(-4)}`
        return {
            ...OcdResource.newResource(type),
            provider: 'oci',
            region: '',
            compartmentId: '',
            id: OciResource.uuid(type),
            displayName: `${displayName}`,
            documentation: ''
        }
    }
    export function cloneResource(resource: OciResource, type: string): OciResource {
        const displayName = `${resource.displayName} Clone`
        const id = OciResource.uuid(type)
        let clone = OcdResource.cloneResource(resource, type)
        clone.displayName = displayName
        clone.id = id
        return clone
    }
    export function assignParentId(child: OciResource, parent: OciResource) {
        const namespace = `Oci${child.resourceType}`
        // @ts-ignore 
        const allowedParentTypes = Resources[namespace].allowedParentTypes()
        if (allowedParentTypes.includes(parent.resourceType) && getParentId(child) !== parent.id) {
            // @ts-ignore 
            Resources[namespace].setParentId(child, parent.id)
        }
    }
    export function getParentId(resource: OciResource, allResources?: OcdResources): string {
        const namespace = `Oci${resource.resourceType}`
        // @ts-ignore 
        const parentId = Resources[namespace].getParentId(resource, allResources)
        return parentId
    }
    export function getAssociationIds(resource: OciResource, allResources: OcdResources): string[] {
        const namespace = `Oci${resource.resourceType}`
        // @ts-ignore 
        const associationIds = Resources[namespace].getConnectionIds(resource, allResources)
        return associationIds
    }
    // export function assignParentIdOrig(child: OciResource, parent: OciResource) {
    //     const childTypes: Record<string, string[]> = {
    //         Vcn: ['Subnet'],
    //         Subnet: ['Instance']
    //     }
    //     if (Object.hasOwn(childTypes, parent.resourceType) && childTypes[parent.resourceType].includes(child.resourceType)) {
    //         const namespace = `Oci${child.resourceType}`
    //         // @ts-ignore 
    //         Resources[namespace].setParentId(child, parent.id)
    //     }
    // }
}
