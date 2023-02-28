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

export interface OciDrgRouteTable extends OciResource {
    drgId: string
    importDrgRouteDistributionId?: string
    isEcmpEnabled?: boolean
    removeImportTrigger?: boolean
}



export namespace OciDrgRouteTable {
    export function newResource(): OciDrgRouteTable {
        return {
            ...OciResource.newResource('drg_route_table'),
            drgId: '',
            importDrgRouteDistributionId: '',
            isEcmpEnabled: false,
            removeImportTrigger: false
        }
    }
    
}

export class OciDrgRouteTableClient {
    static new(): OciDrgRouteTable {
        return OciDrgRouteTable.newResource()
    }
}

export default OciDrgRouteTableClient
