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

export interface OciDrg extends OciResource {
    redundancyStatus?: string
}



export namespace OciDrg {
    export function newResource(): OciDrg {
        return {
            ...OciResource.newResource('drg'),
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
