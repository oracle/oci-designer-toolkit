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

export interface OciNetworkSecurityGroup extends OciResource {
    vcnId: string
}



export namespace OciNetworkSecurityGroup {
    export function newResource(): OciNetworkSecurityGroup {
        return {
            ...OciResource.newResource('network_security_group'),
            vcnId: ''
        }
    }
    
}

export class OciNetworkSecurityGroupClient {
    static new(): OciNetworkSecurityGroup {
        return OciNetworkSecurityGroup.newResource()
    }
}

export default OciNetworkSecurityGroupClient
