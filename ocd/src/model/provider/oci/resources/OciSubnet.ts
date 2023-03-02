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

export interface OciSubnet extends OciResource {
    availabilityDomain?: string
    cidrBlock: string
    dhcpOptionsId?: string
    dnsLabel?: string
    ipv6cidrBlock?: string
    ipv6virtualRouterIp?: string
    prohibitInternetIngress?: boolean
    prohibitPublicIpOnVnic?: boolean
    routeTableId?: string
    securityListIds?: string[]
    subnetDomainName?: string
    vcnId: string
    virtualRouterIp?: string
    virtualRouterMac?: string
}



export namespace OciSubnet {
    export function newResource(): OciSubnet {
        return {
            ...OciResource.newResource('subnet'),
            availabilityDomain: '',
            cidrBlock: '',
            dhcpOptionsId: '',
            dnsLabel: '',
            ipv6cidrBlock: '',
            ipv6virtualRouterIp: '',
            prohibitInternetIngress: false,
            prohibitPublicIpOnVnic: false,
            routeTableId: '',
            securityListIds: [],
            subnetDomainName: '',
            vcnId: '',
            virtualRouterIp: '',
            virtualRouterMac: ''
        }
    }
    
}

export class OciSubnetClient {
    static new(): OciSubnet {
        return OciSubnet.newResource()
    }
}

export default OciSubnetClient
