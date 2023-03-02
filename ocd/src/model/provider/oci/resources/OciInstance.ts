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

export interface OciInstance extends OciResource {
    availabilityDomain: string
    bootVolumeId?: string
    capacityReservationId?: string
    dedicatedVmHostId?: string
    extendedMetadata?: {[key: string]: string}
    faultDomain?: string
    hostnameLabel?: string
    image?: string
    ipxeScript?: string
    isPvEncryptionInTransitEnabled?: boolean
    launchMode?: string
    metadata?: {[key: string]: string}
    preserveBootVolume?: boolean
    privateIp?: string
    publicIp?: string
    shape: string
    subnetId?: string
    timeMaintenanceRebootDue?: string
    agentConfig?: OciAgentConfig
    availabilityConfig?: OciAvailabilityConfig
    createVnicDetails?: OciCreateVnicDetails
    instanceOptions?: OciInstanceOptions
    launchOptions?: OciLaunchOptions
    platformConfig?: OciPlatformConfig
    preemptibleInstanceConfig?: OciPreemptibleInstanceConfig
    shapeConfig?: OciShapeConfig
    sourceDetails?: OciSourceDetails
}


export interface OciAgentConfig {
    areAllPluginsDisabled?: boolean
    isManagementDisabled?: boolean
    isMonitoringDisabled?: boolean
    pluginsConfig?: []
}

export interface OciPluginsConfig {
    desiredState: string
}

export interface OciAvailabilityConfig {
    isLiveMigrationPreferred?: boolean
    recoveryAction?: string
}

export interface OciCreateVnicDetails {
    assignPrivateDnsRecord?: boolean
    assignPublicIp?: string
    hostnameLabel?: string
    nsgIds?: string[]
    privateIp?: string
    skipSourceDestCheck?: boolean
    subnetId?: string
    vlanId?: string
}

export interface OciInstanceOptions {
    areLegacyImdsEndpointsDisabled?: boolean
}

export interface OciLaunchOptions {
    bootVolumeType?: string
    firmware?: string
    isConsistentVolumeNamingEnabled?: boolean
    isPvEncryptionInTransitEnabled?: boolean
    networkType?: string
    remoteDataVolumeType?: string
}

export interface OciPlatformConfig {
    numaNodesPerSocket?: string
    type: string
}

export interface OciPreemptibleInstanceConfig {
    preemptionAction?: OciPreemptionAction
}

export interface OciPreemptionAction {
    preserveBootVolume?: boolean
    type: string
}

export interface OciShapeConfig {
    baselineOcpuUtilization?: string
    gpuDescription?: string
    gpus?: number
    localDiskDescription?: string
    localDisks?: number
    localDisksTotalSizeInGbs?: number
    maxVnicAttachments?: number
    memoryInGbs?: number
    networkingBandwidthInGbps?: number
    ocpus?: number
    processorDescription?: string
}

export interface OciSourceDetails {
    bootVolumeSizeInGbs?: string
    kmsKeyId?: string
    sourceId: string
    sourceType: string
}


export namespace OciInstance {
    export function newResource(): OciInstance {
        return {
            ...OciResource.newResource('instance'),
            availabilityDomain: '',
            bootVolumeId: '',
            capacityReservationId: '',
            dedicatedVmHostId: '',
            extendedMetadata: {},
            faultDomain: '',
            hostnameLabel: '',
            image: '',
            ipxeScript: '',
            isPvEncryptionInTransitEnabled: false,
            launchMode: '',
            metadata: {},
            preserveBootVolume: false,
            privateIp: '',
            publicIp: '',
            shape: '',
            subnetId: '',
            timeMaintenanceRebootDue: '',
            agentConfig: OciInstance.newOciAgentConfig(),
            availabilityConfig: OciInstance.newOciAvailabilityConfig(),
            createVnicDetails: OciInstance.newOciCreateVnicDetails(),
            instanceOptions: OciInstance.newOciInstanceOptions(),
            launchOptions: OciInstance.newOciLaunchOptions(),
            platformConfig: OciInstance.newOciPlatformConfig(),
            preemptibleInstanceConfig: OciInstance.newOciPreemptibleInstanceConfig(),
            shapeConfig: OciInstance.newOciShapeConfig(),
            sourceDetails: OciInstance.newOciSourceDetails()
        }
    }
    
    export function newOciAgentConfig(): OciAgentConfig {
        return {
            areAllPluginsDisabled: false,
            isManagementDisabled: false,
            isMonitoringDisabled: false,
            pluginsConfig: []
        }
    }

    export function newOciPluginsConfig(): OciPluginsConfig {
        return {
            desiredState: ''
        }
    }

    export function newOciAvailabilityConfig(): OciAvailabilityConfig {
        return {
            isLiveMigrationPreferred: false,
            recoveryAction: ''
        }
    }

    export function newOciCreateVnicDetails(): OciCreateVnicDetails {
        return {
            assignPrivateDnsRecord: false,
            assignPublicIp: '',
            hostnameLabel: '',
            nsgIds: [],
            privateIp: '',
            skipSourceDestCheck: false,
            subnetId: '',
            vlanId: ''
        }
    }

    export function newOciInstanceOptions(): OciInstanceOptions {
        return {
            areLegacyImdsEndpointsDisabled: false
        }
    }

    export function newOciLaunchOptions(): OciLaunchOptions {
        return {
            bootVolumeType: '',
            firmware: '',
            isConsistentVolumeNamingEnabled: false,
            isPvEncryptionInTransitEnabled: false,
            networkType: '',
            remoteDataVolumeType: ''
        }
    }

    export function newOciPlatformConfig(): OciPlatformConfig {
        return {
            numaNodesPerSocket: '',
            type: ''
        }
    }

    export function newOciPreemptibleInstanceConfig(): OciPreemptibleInstanceConfig {
        return {
            preemptionAction: OciInstance.newOciPreemptionAction()
        }
    }

    export function newOciPreemptionAction(): OciPreemptionAction {
        return {
            preserveBootVolume: false,
            type: ''
        }
    }

    export function newOciShapeConfig(): OciShapeConfig {
        return {
            baselineOcpuUtilization: '',
            gpuDescription: '',
            gpus: 0,
            localDiskDescription: '',
            localDisks: 0,
            localDisksTotalSizeInGbs: 0,
            maxVnicAttachments: 0,
            memoryInGbs: 0,
            networkingBandwidthInGbps: 0,
            ocpus: 0,
            processorDescription: ''
        }
    }

    export function newOciSourceDetails(): OciSourceDetails {
        return {
            bootVolumeSizeInGbs: '',
            kmsKeyId: '',
            sourceId: '',
            sourceType: ''
        }
    }

}

export class OciInstanceClient {
    static new(): OciInstance {
        return OciInstance.newResource()
    }
}

export default OciInstanceClient
