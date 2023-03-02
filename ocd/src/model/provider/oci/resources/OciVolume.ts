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

export interface OciVolume extends OciResource {
    autoTunedVpusPerGb?: string
    availabilityDomain: string
    backupPolicyId?: string
    blockVolumeReplicasDeletion?: boolean
    isAutoTuneEnabled?: boolean
    isHydrated?: boolean
    kmsKeyId?: string
    sizeInGbs?: string
    sizeInMbs?: string
    volumeBackupId?: string
    volumeGroupId?: string
    vpusPerGb?: string
    blockVolumeReplicas?: []
    sourceDetails?: OciSourceDetails
}


export interface OciBlockVolumeReplicas {
    availabilityDomain: string
    blockVolumeReplicaId?: string
}

export interface OciSourceDetails {
    type: string
}


export namespace OciVolume {
    export function newResource(): OciVolume {
        return {
            ...OciResource.newResource('volume'),
            autoTunedVpusPerGb: '',
            availabilityDomain: '',
            backupPolicyId: '',
            blockVolumeReplicasDeletion: false,
            isAutoTuneEnabled: false,
            isHydrated: false,
            kmsKeyId: '',
            sizeInGbs: '',
            sizeInMbs: '',
            volumeBackupId: '',
            volumeGroupId: '',
            vpusPerGb: '',
            blockVolumeReplicas: [],
            sourceDetails: OciVolume.newOciSourceDetails()
        }
    }
    
    export function newOciBlockVolumeReplicas(): OciBlockVolumeReplicas {
        return {
            availabilityDomain: '',
            blockVolumeReplicaId: ''
        }
    }

    export function newOciSourceDetails(): OciSourceDetails {
        return {
            type: ''
        }
    }

}

export class OciVolumeClient {
    static new(): OciVolume {
        return OciVolume.newResource()
    }
}

export default OciVolumeClient
