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

export interface OciServiceGateway extends OciResource {
    blockTraffic?: boolean
    routeTableId?: string
    vcnId: string
    services?: object[]
}



export namespace OciServiceGateway {
    export function newResource(): OciServiceGateway {
        return {
            ...OciResource.newResource('service_gateway'),
            blockTraffic: false,
            routeTableId: '',
            vcnId: '',
            services: []
        }
    }
    
}

export class OciServiceGatewayClient {
    static new(): OciServiceGateway {
        return OciServiceGateway.newResource()
    }
}

export default OciServiceGatewayClient
