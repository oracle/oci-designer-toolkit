/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { OcdResources } from "../../../OcdDesign.js"
import * as AutoGenerated from "./generated/OciRemotePeeringConnection.js"

export interface OciRemotePeeringConnection extends AutoGenerated.OciRemotePeeringConnection {}

export namespace OciRemotePeeringConnection {
    
    export function newResource(type?: string): OciRemotePeeringConnection {
        const resource = {
            ...AutoGenerated.OciRemotePeeringConnection.newResource('remote_peering_connection'),
        }
        return resource
    }
    export function cloneResource(resource: OciRemotePeeringConnection, type?: string): OciRemotePeeringConnection {
        return AutoGenerated.OciRemotePeeringConnection.cloneResource(resource, 'remote_peering_connection') as OciRemotePeeringConnection
    }
    export function allowedParentTypes(): string[] {
        return []
    }
    export function getParentId(resource: OciRemotePeeringConnection): string {
        const parentId = resource.compartmentId
        return parentId
    }
    export function setParentId(resource: OciRemotePeeringConnection, parentId: string): OciRemotePeeringConnection {
        return resource
    }
    export function getConnectionIds(resource: OciRemotePeeringConnection, allResources: OcdResources): string[] {
        // This List of Ids does not include the Parent Id or Compartment Id
        let associationIds: string[] = []
        return associationIds
    }
}

export class OciRemotePeeringConnectionClient extends AutoGenerated.OciRemotePeeringConnectionClient {
    static new(): OciRemotePeeringConnection {
        return OciRemotePeeringConnection.newResource()
    }
    static clone(resource: OciRemotePeeringConnection): OciRemotePeeringConnection {
        return OciRemotePeeringConnection.cloneResource(resource)
    }
}

export default OciRemotePeeringConnectionClient
