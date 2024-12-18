/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { OcdResources } from "../../../OcdDesign.js"
import * as AutoGenerated from "./generated/OciInternetGateway.js"

export interface OciInternetGateway extends AutoGenerated.OciInternetGateway {}

export namespace OciInternetGateway {
    
    export function newResource(type?: string): OciInternetGateway {
        const resource = {
            ...AutoGenerated.OciInternetGateway.newResource('internet_gateway'),
        }
        return resource
    }
    export function cloneResource(resource: OciInternetGateway, type?: string): OciInternetGateway {
        return AutoGenerated.OciInternetGateway.cloneResource(resource, 'internet_gateway') as OciInternetGateway
    }
    export function allowedParentTypes(): string[] {
        return ['Vcn']
    }
    export function getParentId(resource: OciInternetGateway): string {
        const parentId = resource.vcnId !== '' ? resource.vcnId as string  : resource.compartmentId as string
        return parentId
    }
    export function setParentId(resource: OciInternetGateway, parentId: string): OciInternetGateway {
        resource.vcnId = parentId
        return resource
    }
    export function getConnectionIds(resource: OciInternetGateway, allResources: OcdResources): string[] {
        // This List of Ids does not include the Parent Id or Compartment Id
        let associationIds: string[] = []
        return associationIds
    }
}

export class OciInternetGatewayClient extends AutoGenerated.OciInternetGatewayClient {
    static new(): OciInternetGateway {
        return OciInternetGateway.newResource()
    }
    static clone(resource: OciInternetGateway): OciInternetGateway {
        return OciInternetGateway.cloneResource(resource)
    }
}

export default OciInternetGatewayClient
