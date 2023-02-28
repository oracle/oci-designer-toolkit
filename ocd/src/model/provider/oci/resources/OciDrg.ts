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

export interface OciDrg extends OciResource {
    defaultExportDrgRouteDistributionId?: string
    redundancyStatus?: string
}



export namespace OciDrg {
    export function newResource(): OciDrg {
        return {
            ...OciResource.newResource('drg'),
            defaultExportDrgRouteDistributionId: '',
            redundancyStatus: ''
        }
    }
    
}

export class OciDrgClient {
    static new(): OciDrg {
        return OciDrg.newResource()
    }
}

export default OciDrgClient
