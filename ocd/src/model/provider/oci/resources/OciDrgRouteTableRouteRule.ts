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

export interface OciDrgRouteTableRouteRule extends OciResource {
    destination: string
    destinationType: string
    drgRouteTableId: string
    isBlackhole?: boolean
    isConflict?: boolean
    nextHopDrgAttachmentId: string
    routeProvenance?: string
    routeType?: string
}



export namespace OciDrgRouteTableRouteRule {
    export function newResource(): OciDrgRouteTableRouteRule {
        return {
            ...OciResource.newResource('drg_route_table_route_rule'),
            destination: '',
            destinationType: '',
            drgRouteTableId: '',
            isBlackhole: false,
            isConflict: false,
            nextHopDrgAttachmentId: '',
            routeProvenance: '',
            routeType: ''
        }
    }
    
}

export class OciDrgRouteTableRouteRuleClient {
    static new(): OciDrgRouteTableRouteRule {
        return OciDrgRouteTableRouteRule.newResource()
    }
}

export default OciDrgRouteTableRouteRuleClient
