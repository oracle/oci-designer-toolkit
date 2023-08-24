/*
** Copyright (c) 2020, 2023, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import * as AutoGenerated from "./generated/OciDhcpOptions"

export interface OciDhcpOptions extends AutoGenerated.OciDhcpOptions {}

export interface OciOptions extends AutoGenerated.OciOptions {}

export namespace OciDhcpOptions {
    export function newResource(type?: string): OciDhcpOptions {
        return {
            ...AutoGenerated.OciDhcpOptions.newResource('dhcp_options'),
        }
    }
    export function cloneResource(resource: OciDhcpOptions, type?: string): OciDhcpOptions {
        return AutoGenerated.OciDhcpOptions.cloneResource(resource, 'dhcp_options') as OciDhcpOptions
    }
    export function allowedParentTypes(): string[] {
        console.debug('OciDhcpOptions: Allowed Parent Types')
        return ['Vcn']
    }
    export function getParentId(resource: OciDhcpOptions): string {
        console.debug('OciDhcpOptions: Getting Parent Id to for', resource.displayName, resource.id)
        return resource.vcnId
    }
    export function setParentId(resource: OciDhcpOptions, parentId: string): OciDhcpOptions {
        console.debug('OciDhcpOptions: Setting Parent Id to', parentId, 'for', resource.displayName, resource.id)
        resource.vcnId = parentId
        return resource
    }
    export function getConnectionIds(resource: OciDhcpOptions): string[] {
        // This List of Ids does not include the Parent Id or Compartment Id
        console.debug('OciDhcpOptions: Getting Connection Ids to for', resource.displayName, resource.id)
        return []
    }
    
    export function newOciOptions(): OciOptions {
        return {
            ...AutoGenerated.OciDhcpOptions.newOciOptions(),
        }
    }

}

export class OciDhcpOptionsClient {
    static new(): OciDhcpOptions {
        return OciDhcpOptions.newResource()
    }
    static clone(resource: OciDhcpOptions): OciDhcpOptions {
        return OciDhcpOptions.cloneResource(resource)
    }
}

export default OciDhcpOptionsClient