/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

/*
** Self-contained Google Storage Bucket model resource (no codegen layer —
** see GoogleComputeSubnetwork.ts). Top-level resource (no parent).
*/

import { OcdResources } from "../../../OcdDesign.js"
import { GoogleResource } from "../GoogleResource.js"

export interface GoogleStorageBucket extends GoogleResource {
    storageClass: string
}

export namespace GoogleStorageBucket {
    export function newResource(type: string = 'storage_bucket'): GoogleStorageBucket {
        return {
            ...GoogleResource.newResource(type),
            location: 'US',
            storageClass: 'STANDARD'
        } as GoogleStorageBucket
    }
    export function cloneResource(resource: GoogleStorageBucket, type: string = 'storage_bucket'): GoogleStorageBucket {
        return GoogleResource.cloneResource(resource, type) as GoogleStorageBucket
    }
    export function allowedParentTypes(): string[] {
        return []
    }
    export function getParentId(resource: GoogleStorageBucket): string {
        return resource.parentId
    }
    export function setParentId(resource: GoogleStorageBucket, parentId: string): GoogleStorageBucket {
        resource.parentId = parentId
        return resource
    }
    export function getConnectionIds(resource: GoogleStorageBucket, allResources: OcdResources): string[] {
        const associationIds: string[] = []
        return associationIds
    }
}

export class GoogleStorageBucketClient {
    static new(): GoogleStorageBucket {
        return GoogleStorageBucket.newResource()
    }
    static clone(resource: GoogleStorageBucket): GoogleStorageBucket {
        return GoogleStorageBucket.cloneResource(resource)
    }
}

export default GoogleStorageBucketClient
