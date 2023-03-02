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

export interface OciInternetGateway extends OciResource {
    enabled?: boolean
    vcnId: string
}



export namespace OciInternetGateway {
    export function newResource(): OciInternetGateway {
        return {
            ...OciResource.newResource('internet_gateway'),
            enabled: false,
            vcnId: ''
        }
    }
    
}

export class OciInternetGatewayClient {
    static new(): OciInternetGateway {
        return OciInternetGateway.newResource()
    }
}

export default OciInternetGatewayClient
