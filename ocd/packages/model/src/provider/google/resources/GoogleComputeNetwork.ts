/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { OcdResources } from "../../../OcdDesign.js"
import * as AutoGenerated from "./generated/GoogleComputeNetwork.js"

export interface GoogleComputeNetwork extends AutoGenerated.GoogleComputeNetwork {}

export namespace GoogleComputeNetwork {
    
    export function newResource(type?: string): GoogleComputeNetwork {
        const resource = {
            ...AutoGenerated.GoogleComputeNetwork.newResource('compute_network'),
        }
        return resource
    }
    export function cloneResource(resource: GoogleComputeNetwork, type?: string): GoogleComputeNetwork {
        return AutoGenerated.GoogleComputeNetwork.cloneResource(resource, 'compute_network') as GoogleComputeNetwork
    }
    export function allowedParentTypes(): string[] {
        return []
    }
    export function getParentId(resource: GoogleComputeNetwork): string {
        const parentId = resource.compartmentId
        return parentId
    }
    export function setParentId(resource: GoogleComputeNetwork, parentId: string): GoogleComputeNetwork {
        return resource
    }
    export function getConnectionIds(resource: GoogleComputeNetwork, allResources: OcdResources): string[] {
        // This List of Ids does not include the Parent Id or Compartment Id
        let associationIds: string[] = []
        return associationIds
    }
}

export class GoogleComputeNetworkClient extends AutoGenerated.GoogleComputeNetworkClient {
    static new(): GoogleComputeNetwork {
        return GoogleComputeNetwork.newResource()
    }
    static clone(resource: GoogleComputeNetwork): GoogleComputeNetwork {
        return GoogleComputeNetwork.cloneResource(resource)
    }
}

export default GoogleComputeNetworkClient
