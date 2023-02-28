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

export interface OciRemotePeeringConnection extends OciResource {
    drgId: string
    isCrossTenancyPeering?: boolean
    peerId?: string
    peerRegionName?: string
    peerTenancyId?: string
    peeringStatus?: string
}



export namespace OciRemotePeeringConnection {
    export function newResource(): OciRemotePeeringConnection {
        return {
            ...OciResource.newResource('remote_peering_connection'),
            drgId: '',
            isCrossTenancyPeering: false,
            peerId: '',
            peerRegionName: '',
            peerTenancyId: '',
            peeringStatus: ''
        }
    }
    
}

export class OciRemotePeeringConnectionClient {
    static new(): OciRemotePeeringConnection {
        return OciRemotePeeringConnection.newResource()
    }
}

export default OciRemotePeeringConnectionClient
