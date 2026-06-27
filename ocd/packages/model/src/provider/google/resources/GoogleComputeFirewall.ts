/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

/*
** Self-contained Google Compute Firewall model resource (no codegen layer —
** see GoogleComputeSubnetwork.ts).
*/

import { OcdResources } from "../../../OcdDesign.js"
import { GoogleResource } from "../GoogleResource.js"

export interface GoogleComputeFirewall extends GoogleResource {
    network: string
    direction: string
    description: string
}

export namespace GoogleComputeFirewall {
    export function newResource(type: string = 'compute_firewall'): GoogleComputeFirewall {
        return {
            ...GoogleResource.newResource(type),
            network: '',
            direction: 'INGRESS',
            description: ''
        } as GoogleComputeFirewall
    }
    export function cloneResource(resource: GoogleComputeFirewall, type: string = 'compute_firewall'): GoogleComputeFirewall {
        return GoogleResource.cloneResource(resource, type) as GoogleComputeFirewall
    }
    export function allowedParentTypes(): string[] {
        return ['ComputeNetwork']
    }
    export function getParentId(resource: GoogleComputeFirewall): string {
        return resource.network
    }
    export function setParentId(resource: GoogleComputeFirewall, parentId: string): GoogleComputeFirewall {
        resource.network = parentId
        return resource
    }
    export function getConnectionIds(resource: GoogleComputeFirewall, allResources: OcdResources): string[] {
        const associationIds: string[] = []
        return associationIds
    }
}

export class GoogleComputeFirewallClient {
    static new(): GoogleComputeFirewall {
        return GoogleComputeFirewall.newResource()
    }
    static clone(resource: GoogleComputeFirewall): GoogleComputeFirewall {
        return GoogleComputeFirewall.cloneResource(resource)
    }
}

export default GoogleComputeFirewallClient
