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

export interface OciAnalyticsInstance extends OciResource {
    description?: string
    emailNotification?: string
    featureSet: string
    idcsAccessToken: string
    licenseType: string
    privateAccessChannels?: {[key: string]: string}
    serviceUrl?: string
    timeUpdated?: string
    vanityUrlDetails?: {[key: string]: string}
    capacity?: OciCapacity
    networkEndpointDetails?: OciNetworkEndpointDetails
}


export interface OciCapacity {
    capacityType: string
    capacityValue: number
}

export interface OciNetworkEndpointDetails {
    networkEndpointType: string
    subnetId?: string
    vcnId?: string
    whitelistedIps?: string[]
    whitelistedVcns?: []
}

export interface OciWhitelistedVcns {
    whitelistedIps?: string[]
}


export namespace OciAnalyticsInstance {
    export function newResource(): OciAnalyticsInstance {
        return {
            ...OciResource.newResource('analytics_instance'),
            description: '',
            emailNotification: '',
            featureSet: '',
            idcsAccessToken: '',
            licenseType: '',
            privateAccessChannels: {},
            serviceUrl: '',
            timeUpdated: '',
            vanityUrlDetails: {},
            capacity: OciAnalyticsInstance.newOciCapacity(),
            networkEndpointDetails: OciAnalyticsInstance.newOciNetworkEndpointDetails()
        }
    }
    
    export function newOciCapacity(): OciCapacity {
        return {
            capacityType: '',
            capacityValue: 0
        }
    }

    export function newOciNetworkEndpointDetails(): OciNetworkEndpointDetails {
        return {
            networkEndpointType: '',
            subnetId: '',
            vcnId: '',
            whitelistedIps: [],
            whitelistedVcns: []
        }
    }

    export function newOciWhitelistedVcns(): OciWhitelistedVcns {
        return {
            whitelistedIps: []
        }
    }

}

export class OciAnalyticsInstanceClient {
    static new(): OciAnalyticsInstance {
        return OciAnalyticsInstance.newResource()
    }
}

export default OciAnalyticsInstanceClient
