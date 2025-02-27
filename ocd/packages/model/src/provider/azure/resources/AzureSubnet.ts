/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { OcdResources } from "../../../OcdDesign.js"
import * as AutoGenerated from "./generated/AzureSubnet.js"

export interface AzureSubnet extends AutoGenerated.AzureSubnet {}

export namespace AzureSubnet {
    
    export function newResource(type?: string): AzureSubnet {
        const resource = {
            ...AutoGenerated.AzureSubnet.newResource('subnet'),
        }
        return resource
    }
    export function cloneResource(resource: AzureSubnet, type?: string): AzureSubnet {
        return AutoGenerated.AzureSubnet.cloneResource(resource, 'subnet') as AzureSubnet
    }
    export function allowedParentTypes(): string[] {
        return []
    }
    export function getParentId(resource: AzureSubnet): string {
        const parentId = resource.compartmentId
        return parentId
    }
    export function setParentId(resource: AzureSubnet, parentId: string): AzureSubnet {
        return resource
    }
    export function getConnectionIds(resource: AzureSubnet, allResources: OcdResources): string[] {
        // This List of Ids does not include the Parent Id or Compartment Id
        let associationIds: string[] = []
        return associationIds
    }
}

export class AzureSubnetClient extends AutoGenerated.AzureSubnetClient {
    static new(): AzureSubnet {
        return AzureSubnet.newResource()
    }
    static clone(resource: AzureSubnet): AzureSubnet {
        return AzureSubnet.cloneResource(resource)
    }
}

export default AzureSubnetClient
