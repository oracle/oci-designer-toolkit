/*
** Copyright (c) 2020, 2023, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
/*
** ======================================================================
** === Auto Generated Code All Edits Will Be Lost During Regeneration ===
** ======================================================================
**
** Generated : 28/02/2023 17:29:49
**
*/

import { OciResource } from "../OciResource"

export interface OciNatGateway extends OciResource {
    blockTraffic?: boolean
    natIp?: string
    publicIpId?: string
    vcnId: string
}



export namespace OciNatGateway {
    export function newResource(): OciNatGateway {
        return {
            ...OciResource.newResource('nat_gateway'),
            blockTraffic: false,
            natIp: '',
            publicIpId: '',
            vcnId: ''
        }
    }
    
}

export class OciNatGatewayClient {
    static new(): OciNatGateway {
        return OciNatGateway.newResource()
    }
}

export default OciNatGatewayClient
