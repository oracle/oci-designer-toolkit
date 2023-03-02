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

export interface OciVcn extends OciResource {
    cidrBlock?: string
    cidrBlocks?: string[]
    dnsLabel?: string
    ipv6cidrBlocks?: string[]
    isIpv6enabled?: boolean
}



export namespace OciVcn {
    export function newResource(): OciVcn {
        return {
            ...OciResource.newResource('vcn'),
            cidrBlock: '',
            cidrBlocks: [],
            dnsLabel: '',
            ipv6cidrBlocks: [],
            isIpv6enabled: false
        }
    }
    
}

export class OciVcnClient {
    static new(): OciVcn {
        return OciVcn.newResource()
    }
}

export default OciVcnClient
