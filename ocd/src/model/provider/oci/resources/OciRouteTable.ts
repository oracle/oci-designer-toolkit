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

export interface OciRouteTable extends OciResource {
    vcnId: string
    routeRules?: object[]
}



export namespace OciRouteTable {
    export function newResource(): OciRouteTable {
        return {
            ...OciResource.newResource('route_table'),
            vcnId: '',
            routeRules: []
        }
    }
    
}

export class OciRouteTableClient {
    static new(): OciRouteTable {
        return OciRouteTable.newResource()
    }
}

export default OciRouteTableClient
