/*
** Copyright (c) 2020, 2023, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
/*
** ======================================================================
** === Auto Generated Code All Edits Will Be Lost During Regeneration ===
** ======================================================================
**
** Generated : 01/03/2023 17:21:08
**
*/

import { OciResource } from "../OciResource"

export interface OciDhcpOptions extends OciResource {
    vcnId: string
    options?: OciOptions[]
}


export interface OciOptions {
    customDnsServers?: string[]
    searchDomainNames?: string[]
    serverType?: string
    type: string
}


export namespace OciDhcpOptions {
    export function newResource(): OciDhcpOptions {
        return {
            ...OciResource.newResource('dhcp_options'),
            vcnId: '',
            options: []
        }
    }
    
    export function newOciOptions(): OciOptions {
        return {
            customDnsServers: [],
            searchDomainNames: [],
            serverType: '',
            type: ''
        }
    }

}

export class OciDhcpOptionsClient {
    static new(): OciDhcpOptions {
        return OciDhcpOptions.newResource()
    }
}

export default OciDhcpOptionsClient
