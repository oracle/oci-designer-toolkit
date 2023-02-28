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

export interface OciLocalPeeringGateway extends OciResource {
    isCrossTenancyPeering?: boolean
    peerAdvertisedCidr?: string
    peerAdvertisedCidrDetails?: string[]
    peerId?: string
    peeringStatus?: string
    peeringStatusDetails?: string
    routeTableId?: string
    vcnId: string
}



export namespace OciLocalPeeringGateway {
    export function newResource(): OciLocalPeeringGateway {
        return {
            ...OciResource.newResource('local_peering_gateway'),
            isCrossTenancyPeering: false,
            peerAdvertisedCidr: '',
            peerAdvertisedCidrDetails: [],
            peerId: '',
            peeringStatus: '',
            peeringStatusDetails: '',
            routeTableId: '',
            vcnId: ''
        }
    }
    
}

export class OciLocalPeeringGatewayClient {
    static new(): OciLocalPeeringGateway {
        return OciLocalPeeringGateway.newResource()
    }
}

export default OciLocalPeeringGatewayClient
