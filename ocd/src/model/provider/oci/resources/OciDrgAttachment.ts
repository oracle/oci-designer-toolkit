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

export interface OciDrgAttachment extends OciResource {
    drgId: string
    drgRouteTableId?: string
    exportDrgRouteDistributionId?: string
    isCrossTenancy?: boolean
    routeTableId?: string
    vcnId?: string
    networkDetails?: OciNetworkDetails
}


export interface OciNetworkDetails {
    ipsecConnectionId?: string
    routeTableId?: string
    type: string
}


export namespace OciDrgAttachment {
    export function newResource(): OciDrgAttachment {
        return {
            ...OciResource.newResource('drg_attachment'),
            drgId: '',
            drgRouteTableId: '',
            exportDrgRouteDistributionId: '',
            isCrossTenancy: false,
            routeTableId: '',
            vcnId: '',
            networkDetails: OciDrgAttachment.newOciNetworkDetails()
        }
    }
    
    export function newOciNetworkDetails(): OciNetworkDetails {
        return {
            ipsecConnectionId: '',
            routeTableId: '',
            type: ''
        }
    }

}

export class OciDrgAttachmentClient {
    static new(): OciDrgAttachment {
        return OciDrgAttachment.newResource()
    }
}

export default OciDrgAttachmentClient
