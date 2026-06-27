/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

/*
** Self-contained Google Compute Router model resource (no codegen layer —
** see GoogleComputeSubnetwork.ts).
*/

import { OcdResources } from "../../../OcdDesign.js"
import { GoogleResource } from "../GoogleResource.js"

export interface GoogleComputeRouter extends GoogleResource {
    network: string
    region: string
    description: string
}

export namespace GoogleComputeRouter {
    export function newResource(type: string = 'compute_router'): GoogleComputeRouter {
        return {
            ...GoogleResource.newResource(type),
            network: '',
            region: '',
            description: ''
        } as GoogleComputeRouter
    }
    export function cloneResource(resource: GoogleComputeRouter, type: string = 'compute_router'): GoogleComputeRouter {
        return GoogleResource.cloneResource(resource, type) as GoogleComputeRouter
    }
    export function allowedParentTypes(): string[] {
        return ['ComputeNetwork']
    }
    export function getParentId(resource: GoogleComputeRouter): string {
        return resource.network
    }
    export function setParentId(resource: GoogleComputeRouter, parentId: string): GoogleComputeRouter {
        resource.network = parentId
        return resource
    }
    export function getConnectionIds(resource: GoogleComputeRouter, allResources: OcdResources): string[] {
        const associationIds: string[] = []
        return associationIds
    }
}

export class GoogleComputeRouterClient {
    static new(): GoogleComputeRouter {
        return GoogleComputeRouter.newResource()
    }
    static clone(resource: GoogleComputeRouter): GoogleComputeRouter {
        return GoogleComputeRouter.cloneResource(resource)
    }
}

export default GoogleComputeRouterClient
