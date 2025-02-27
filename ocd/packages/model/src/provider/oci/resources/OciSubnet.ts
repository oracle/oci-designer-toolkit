/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { OcdResources } from "../../../OcdDesign.js"
import * as AutoGenerated from "./generated/OciSubnet.js"

export interface OciSubnet extends AutoGenerated.OciSubnet {}

export namespace OciSubnet {
    
    export function newResource(type?: string): OciSubnet {
        const resource = {
            ...AutoGenerated.OciSubnet.newResource('subnet'),
        }
        return resource
    }
    export function cloneResource(resource: OciSubnet, type?: string): OciSubnet {
        return AutoGenerated.OciSubnet.cloneResource(resource, 'subnet') as OciSubnet
    }
    export function allowedParentTypes(): string[] {
        return ['Vcn']
    }
    export function getParentId(resource: OciSubnet): string {
        const parentId = resource.vcnId !== '' ? resource.vcnId : resource.compartmentId
        return parentId
    }
    export function setParentId(resource: OciSubnet, parentId: string): OciSubnet {
        resource.vcnId = parentId
        return resource
    }
    export function getConnectionIds(resource: OciSubnet, allResources: OcdResources): string[] {
        // This List of Ids does not include the Parent Id or Compartment Id
        let associationIds: string[] = []
        if (resource.securityListIds) associationIds = [...associationIds, ...resource.securityListIds]
        if (resource.routeTableId) associationIds = [...associationIds, resource.routeTableId]
        if (resource.dhcpOptionsId) associationIds = [...associationIds, resource.dhcpOptionsId]
        return associationIds
    }
}

export class OciSubnetClient extends AutoGenerated.OciSubnetClient {
    static new(): OciSubnet {
        return OciSubnet.newResource()
    }
    static clone(resource: OciSubnet): OciSubnet {
        return OciSubnet.cloneResource(resource)
    }
}

export default OciSubnetClient
