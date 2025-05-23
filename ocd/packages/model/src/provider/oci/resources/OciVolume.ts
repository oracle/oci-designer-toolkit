/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { OcdResources } from "../../../OcdDesign.js"
import * as AutoGenerated from "./generated/OciVolume.js"

export interface OciVolume extends AutoGenerated.OciVolume {}

export namespace OciVolume {
    
    export function newResource(type?: string): OciVolume {
        const resource = {
            ...AutoGenerated.OciVolume.newResource('volume'),
        }
        return resource
    }
    export function cloneResource(resource: OciVolume, type?: string): OciVolume {
        return AutoGenerated.OciVolume.cloneResource(resource, 'volume') as OciVolume
    }
    export function allowedParentTypes(): string[] {
        return []
    }
    export function getParentId(resource: OciVolume): string {
        const parentId = resource.compartmentId
        return parentId
    }
    export function setParentId(resource: OciVolume, parentId: string): OciVolume {
        return resource
    }
    export function getConnectionIds(resource: OciVolume, allResources: OcdResources): string[] {
        // This List of Ids does not include the Parent Id or Compartment Id
        let associationIds: string[] = []
        return associationIds
    }
}

export class OciVolumeClient extends AutoGenerated.OciVolumeClient {
    static new(): OciVolume {
        return OciVolume.newResource()
    }
    static clone(resource: OciVolume): OciVolume {
        return OciVolume.cloneResource(resource)
    }
}

export default OciVolumeClient
