/*
** Copyright (c) 2020, 2023, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { OcdResources } from "../../../OcdDesign"
import * as AutoGenerated from "./generated/OciBootVolumeAttachment"

export interface OciBootVolumeAttachment extends AutoGenerated.OciBootVolumeAttachment {}

export namespace OciBootVolumeAttachment {
    
    export function newResource(type?: string): OciBootVolumeAttachment {
        return {
            ...AutoGenerated.OciBootVolumeAttachment.newResource('boot_volume_attachment'),
        }
    }
    export function cloneResource(resource: OciBootVolumeAttachment, type?: string): OciBootVolumeAttachment {
        return AutoGenerated.OciBootVolumeAttachment.cloneResource(resource, 'boot_volume_attachment') as OciBootVolumeAttachment
    }
    export function allowedParentTypes(): string[] {
        // console.debug('OciBootVolumeAttachment: Allowed Parent Types')
        return []
    }
    export function getParentId(resource: OciBootVolumeAttachment): string {
        // console.debug('OciBootVolumeAttachment: Getting Parent Id to for', resource.displayName, resource.id)
        return resource.compartmentId
    }
    export function setParentId(resource: OciBootVolumeAttachment, parentId: string): OciBootVolumeAttachment {
        // console.debug('OciBootVolumeAttachment: Setting Parent Id to', parentId, 'for', resource.displayName, resource.id)
        return resource
    }
    export function getConnectionIds(resource: OciBootVolumeAttachment, allResources: OcdResources): string[] {
        // This List of Ids does not include the Parent Id or Compartment Id
        // console.debug('OciBootVolumeAttachment: Getting Connection Ids to for', resource.displayName, resource.id)
        return []
    }
    
}

export class OciBootVolumeAttachmentClient {
    static new(): OciBootVolumeAttachment {
        return OciBootVolumeAttachment.newResource()
    }
    static clone(resource: OciBootVolumeAttachment): OciBootVolumeAttachment {
        return OciBootVolumeAttachment.cloneResource(resource)
    }
}

export default OciBootVolumeAttachmentClient