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

export interface OciSecurityList extends OciResource {
    vcnId: string
    egressSecurityRules?: object[]
    ingressSecurityRules?: object[]
}



export namespace OciSecurityList {
    export function newResource(): OciSecurityList {
        return {
            ...OciResource.newResource('security_list'),
            vcnId: '',
            egressSecurityRules: [],
            ingressSecurityRules: []
        }
    }
    
}

export class OciSecurityListClient {
    static new(): OciSecurityList {
        return OciSecurityList.newResource()
    }
}

export default OciSecurityListClient
