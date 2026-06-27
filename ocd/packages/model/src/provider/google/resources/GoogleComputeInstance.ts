/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

/*
** Self-contained Google Compute Instance model resource (no codegen layer —
** see GoogleComputeSubnetwork.ts).
*/

import { OcdResources } from "../../../OcdDesign.js"
import { GoogleResource } from "../GoogleResource.js"

export interface GoogleComputeInstance extends GoogleResource {
    subnetwork: string
    machineType: string
    zone: string
    bootImage: string
}

export namespace GoogleComputeInstance {
    export function newResource(type: string = 'compute_instance'): GoogleComputeInstance {
        return {
            ...GoogleResource.newResource(type),
            subnetwork: '',
            machineType: 'e2-medium',
            zone: '',
            bootImage: ''
        } as GoogleComputeInstance
    }
    export function cloneResource(resource: GoogleComputeInstance, type: string = 'compute_instance'): GoogleComputeInstance {
        return GoogleResource.cloneResource(resource, type) as GoogleComputeInstance
    }
    export function allowedParentTypes(): string[] {
        return ['ComputeSubnetwork']
    }
    export function getParentId(resource: GoogleComputeInstance): string {
        return resource.subnetwork
    }
    export function setParentId(resource: GoogleComputeInstance, parentId: string): GoogleComputeInstance {
        resource.subnetwork = parentId
        return resource
    }
    export function getConnectionIds(resource: GoogleComputeInstance, allResources: OcdResources): string[] {
        const associationIds: string[] = []
        return associationIds
    }
}

export class GoogleComputeInstanceClient {
    static new(): GoogleComputeInstance {
        return GoogleComputeInstance.newResource()
    }
    static clone(resource: GoogleComputeInstance): GoogleComputeInstance {
        return GoogleComputeInstance.cloneResource(resource)
    }
}

export default GoogleComputeInstanceClient
