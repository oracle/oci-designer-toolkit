/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { OcdResources } from "../../../OcdDesign.js"
import * as AutoGenerated from "./generated/OciAnalyticsInstance.js"

export interface OciAnalyticsInstance extends AutoGenerated.OciAnalyticsInstance {}

export namespace OciAnalyticsInstance {
    export namespace Capacity {
        export interface Capacity extends AutoGenerated.OciAnalyticsInstance.Capacity.Capacity {}
        export function newCapacity(): Capacity {return AutoGenerated.OciAnalyticsInstance.Capacity.newCapacity()}
        
    }
    export namespace NetworkEndpointDetails {
        export interface NetworkEndpointDetails extends AutoGenerated.OciAnalyticsInstance.NetworkEndpointDetails.NetworkEndpointDetails {}
        export function newNetworkEndpointDetails(): NetworkEndpointDetails {return AutoGenerated.OciAnalyticsInstance.NetworkEndpointDetails.newNetworkEndpointDetails()}
        export namespace WhitelistedVcns {
            export interface WhitelistedVcns extends AutoGenerated.OciAnalyticsInstance.NetworkEndpointDetails.WhitelistedVcns.WhitelistedVcns {}
            export function newWhitelistedVcns(): WhitelistedVcns {return AutoGenerated.OciAnalyticsInstance.NetworkEndpointDetails.WhitelistedVcns.newWhitelistedVcns()}
            
        }
    }
    export function newResource(type?: string): OciAnalyticsInstance {
        const resource = {
            ...AutoGenerated.OciAnalyticsInstance.newResource('analytics_instance'),
        }
        return resource
    }
    export function cloneResource(resource: OciAnalyticsInstance, type?: string): OciAnalyticsInstance {
        return AutoGenerated.OciAnalyticsInstance.cloneResource(resource, 'analytics_instance') as OciAnalyticsInstance
    }
    export function allowedParentTypes(): string[] {
        return []
    }
    export function getParentId(resource: OciAnalyticsInstance): string {
        const parentId = resource.compartmentId
        return parentId
    }
    export function setParentId(resource: OciAnalyticsInstance, parentId: string): OciAnalyticsInstance {
        return resource
    }
    export function getConnectionIds(resource: OciAnalyticsInstance, allResources: OcdResources): string[] {
        // This List of Ids does not include the Parent Id or Compartment Id
        let associationIds: string[] = []
        return associationIds
    }
}

export class OciAnalyticsInstanceClient extends AutoGenerated.OciAnalyticsInstanceClient {
    static new(): OciAnalyticsInstance {
        return OciAnalyticsInstance.newResource()
    }
    static clone(resource: OciAnalyticsInstance): OciAnalyticsInstance {
        return OciAnalyticsInstance.cloneResource(resource)
    }
}

export default OciAnalyticsInstanceClient
