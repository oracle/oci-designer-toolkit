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

export interface OciSecurityList extends OciResource {
    vcnId: string
    egressSecurityRules?: OciEgressSecurityRules[]
    ingressSecurityRules?: OciIngressSecurityRules[]
}


export interface OciEgressSecurityRules {
    description?: string
    destination: string
    destinationType?: string
    protocol: string
    stateless?: boolean
    icmpOptions?: OciIcmpOptions
    tcpOptions?: OciTcpOptions
    udpOptions?: OciUdpOptions
}

export interface OciIcmpOptions {
    code?: number
    type: number
}

export interface OciTcpOptions {
    max?: number
    min?: number
    sourcePortRange?: OciSourcePortRange
}

export interface OciSourcePortRange {
    max: number
    min: number
}

export interface OciUdpOptions {
    max?: number
    min?: number
    sourcePortRange?: OciSourcePortRange
}

export interface OciIngressSecurityRules {
    description?: string
    protocol: string
    source: string
    sourceType?: string
    stateless?: boolean
    icmpOptions?: OciIcmpOptions
    tcpOptions?: OciTcpOptions
    udpOptions?: OciUdpOptions
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
    
    export function newOciEgressSecurityRules(): OciEgressSecurityRules {
        return {
            description: '',
            destination: '',
            destinationType: '',
            protocol: '',
            stateless: false,
            icmpOptions: OciSecurityList.newOciIcmpOptions(),
            tcpOptions: OciSecurityList.newOciTcpOptions(),
            udpOptions: OciSecurityList.newOciUdpOptions()
        }
    }

    export function newOciIcmpOptions(): OciIcmpOptions {
        return {
            code: 0,
            type: 0
        }
    }

    export function newOciTcpOptions(): OciTcpOptions {
        return {
            max: 0,
            min: 0,
            sourcePortRange: OciSecurityList.newOciSourcePortRange()
        }
    }

    export function newOciSourcePortRange(): OciSourcePortRange {
        return {
            max: 0,
            min: 0
        }
    }

    export function newOciUdpOptions(): OciUdpOptions {
        return {
            max: 0,
            min: 0,
            sourcePortRange: OciSecurityList.newOciSourcePortRange()
        }
    }

    export function newOciIngressSecurityRules(): OciIngressSecurityRules {
        return {
            description: '',
            protocol: '',
            source: '',
            sourceType: '',
            stateless: false,
            icmpOptions: OciSecurityList.newOciIcmpOptions(),
            tcpOptions: OciSecurityList.newOciTcpOptions(),
            udpOptions: OciSecurityList.newOciUdpOptions()
        }
    }

}

export class OciSecurityListClient {
    static new(): OciSecurityList {
        return OciSecurityList.newResource()
    }
}

export default OciSecurityListClient
